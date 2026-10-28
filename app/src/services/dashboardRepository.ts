/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { and, collection, deleteDoc, deleteField, doc, getDoc, getDocFromServer, getDocs, getDocsFromServer, limit, onSnapshot, or, orderBy, query, runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch, type Firestore, type QuerySnapshot } from 'firebase/firestore';
import { ApprovalRequest, AuditLogEntry, type DeliveryPayment, type StockOrder, BankDefinition, CalendarNote, CalendarTaskComment, ChannelMarketingSpend, CommissionRules, CustomMission, CustomerIntakeShortLink, ErrorCodeDefinition, FinanceProfile, LoanApplication, MarketingTagRelationship, MonthlySettlementSnapshot, NotificationItem, PayslipDocument, RawCustomerLead, RoleAccount, RoleNavAccessSetting, StaffDefaultAvatar, TagNormalizationRule, VehicleCategory, VehicleCatalogItem, WhatsAppTrackingClick, WhatsAppTrackingLink, type AttendancePolicy, type AttendanceWeeklySchedule, normalizeAttendancePolicy, withoutAttendanceNetworkIps } from '../types';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { ensureFirebaseAuthUser, getFirebaseUserRoleClaim, getFirebaseUserStaffIdentityClaims } from '../lib/auth';
import { normalizeDocumentChecklist } from '../utils/documentChecklist';
import { stripUndefinedFirestoreValues } from '../utils/firestorePayload';
import { withoutSyncMetadata } from '../utils/latestListPatch';
import { newId } from '../utils/id';
import { appendCommentOnce } from '../utils/calendarTaskComments';
import { isOperationsLead, isOperationsManager } from '../utils/staffRoles';
import { buildRoleAccessCapabilities, resolveNavAccess, type RoleAccessCapabilities } from '../data/roleNavAccess';
import { buildAdminExtraShopsByName, buildStaffShopsByName, getSameShopPoolHandlerNames, readAdminCrossShopPoolPreference } from '../utils/adminUnclaimedPool';

export interface DashboardState {
  version?: number;
  operationalDataResetAt?: string;
  applications: LoanApplication[];
  rawCustomerLeads?: RawCustomerLead[];
  errorCodeDefinitions: ErrorCodeDefinition[];
  roleAccounts: RoleAccount[];
  roleNavAccess?: RoleNavAccessSetting[];
  defaultAvatarLibrary?: StaffDefaultAvatar[];
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
  whatsAppTrackingClicks: WhatsAppTrackingClick[];
  whatsAppDefaultMessage?: string;
  customerIntakeShortLinks?: CustomerIntakeShortLink[];
  customMissions?: CustomMission[];
  approvalRequests?: ApprovalRequest[];
  calendarNotes?: CalendarNote[];
  notifications?: NotificationItem[];
  auditLogs: AuditLogEntry[];
  vehicleTags: string[];
  vehicleBrandTags: string[];
  vehicleCatalog: VehicleCatalogItem[];
  vehicleCategories?: VehicleCategory[];
  vehicleBrandLogos?: Record<string, string>;
  financeProfiles?: FinanceProfile[];
  commissionRules?: CommissionRules;
  attendancePolicy?: AttendancePolicy;
  channelMarketingSpend?: ChannelMarketingSpend[];
  bankDefinitions?: BankDefinition[];
  marketingTagRelationships: MarketingTagRelationship[];
  tagNormalizationRules?: TagNormalizationRule[];
}

const DASHBOARD_STATE_COLLECTION = 'dashboard_state';
const DASHBOARD_STATE_DOCUMENT = 'dr_racing_dashboard';
const PUBLIC_CONFIG_COLLECTION = 'public_config';
const LOGIN_DIRECTORY_DOCUMENT = 'login_directory';
const PUBLIC_DASHBOARD_DOCUMENT = 'public_dashboard';
const STAFF_DASHBOARD_DOCUMENT = 'staff_dashboard';
const PUBLIC_TRACKING_LINKS_COLLECTION = 'public_tracking_links';
const SHORT_LINKS_COLLECTION = 'short_links';
const FIREBASE_TIMEOUT_MS = 15000;
const FIREBASE_COLLECTION_SYNC_CONCURRENCY = 12;

let lastKnownDashboardStateVersion: number | null = null;
// Legacy dashboard_state.calendarNotes that could not be copied into
// calendar_tasks yet. Kept in the shared document until the copy succeeds.
// null = this browser has not loaded the shared document yet, so the field is
// left untouched (merge) instead of being cleared.
let legacyCalendarNotesPendingMigration: CalendarNote[] | null = null;

export class DashboardStateVersionConflictError extends Error {
  currentVersion: number;
  expectedVersion: number | null;

  constructor(currentVersion: number, expectedVersion: number | null) {
    super('Dashboard state changed remotely before this save completed.');
    this.name = 'DashboardStateVersionConflictError';
    this.currentVersion = currentVersion;
    this.expectedVersion = expectedVersion;
  }
}

export class CollectionItemVersionConflictError extends Error {
  collectionName: string;
  itemId: string;
  currentVersion: number;
  expectedVersion: number;

  constructor(collectionName: string, itemId: string, currentVersion: number, expectedVersion: number) {
    super(`${collectionName}/${itemId} changed remotely before this save completed.`);
    this.name = 'CollectionItemVersionConflictError';
    this.collectionName = collectionName;
    this.itemId = itemId;
    this.currentVersion = currentVersion;
    this.expectedVersion = expectedVersion;
  }
}

// Firestore Rules refused one split-collection write. Retrying cannot help, so
// the save must fail loudly instead of reporting success while the edit lives
// only in this browser (the callers' rollback paths depend on a false result).
export class CollectionItemPermissionDeniedError extends Error {
  collectionName: string;
  itemId: string;

  constructor(collectionName: string, itemId: string, cause?: unknown) {
    super(`${collectionName}/${itemId} was rejected by Firestore Rules.`);
    this.name = 'CollectionItemPermissionDeniedError';
    this.collectionName = collectionName;
    this.itemId = itemId;
    this.cause = cause;
  }
}

function isFirestorePermissionDenied(error: unknown) {
  return Boolean(
    error
    && typeof error === 'object'
    && (error as { code?: unknown }).code === 'permission-denied'
  );
}

// Firestore refuses documents over 1 MiB. dashboard_state grows with the
// settings lists, avatars and the bounded click copy; past the limit every
// Super Admin save and every server transaction on it would fail at once.
// Refuse early with a clear error, leaving headroom for fields this save
// does not send (merge keeps them).
const DASHBOARD_STATE_SAFE_BYTES = 900 * 1024;

export class DashboardStateTooLargeError extends Error {
  estimatedBytes: number;

  constructor(estimatedBytes: number) {
    super(`dashboard_state would be about ${Math.round(estimatedBytes / 1024)} KiB, over the safe limit of ${DASHBOARD_STATE_SAFE_BYTES / 1024} KiB.`);
    this.name = 'DashboardStateTooLargeError';
    this.estimatedBytes = estimatedBytes;
  }
}

function assertDashboardStateFitsDocumentLimit(payload: Record<string, unknown>) {
  let json = '';
  try {
    json = JSON.stringify(payload, (_key, value) => (
      value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype
        ? null
        : value
    ));
  } catch {
    return;
  }
  const estimatedBytes = new TextEncoder().encode(json).length;
  if (estimatedBytes > DASHBOARD_STATE_SAFE_BYTES) {
    throw new DashboardStateTooLargeError(estimatedBytes);
  }
}

export class StockReservationConflictError extends Error {
  stockUnitId: string;
  reservedApplicationId: string;

  constructor(stockUnitId: string, reservedApplicationId: string) {
    super(`${stockUnitId} is already reserved by ${reservedApplicationId}.`);
    this.name = 'StockReservationConflictError';
    this.stockUnitId = stockUnitId;
    this.reservedApplicationId = reservedApplicationId;
  }
}

export class AdminApplicationClaimConflictError extends Error {
  constructor(applicationId: string) {
    super(`${applicationId} was already claimed by another Admin.`);
    this.name = 'AdminApplicationClaimConflictError';
  }
}

// Firestore 规则要求所有请求先有 Auth 身份;取 db 前确保已登录
// (员工 = Email/Password,公开页面 = 匿名),否则读写会被规则拒绝。
async function getAuthedDb(): Promise<Firestore | null> {
  if (!isFirebaseConfigured) {
    return null;
  }

  const db = getFirebaseDb();

  if (!db) {
    return null;
  }

  await ensureFirebaseAuthUser();
  return db;
}

function withFirebaseTimeout<T>(promise: Promise<T>, operation: string, timeoutMs = FIREBASE_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`Firebase ${operation} timed out`));
      }, timeoutMs);
    })
  ]);
}

function stripUndefinedValues(value: unknown): unknown {
  return stripUndefinedFirestoreValues(value);
}

function normalizeDashboardStateVersion(data: Partial<DashboardState> | undefined): number {
  const version = Number(data?.version);
  return Number.isFinite(version) && version >= 0 ? Math.floor(version) : 0;
}

function normalizeCollectionItemVersion(data: Record<string, unknown> | undefined): number {
  const version = Number(data?._sync_version);
  return Number.isFinite(version) && version >= 0 ? Math.floor(version) : 0;
}

// A server endpoint (e.g. /api/staff/avatar) bumped dashboard_state by exactly
// one version for this browser's own change. Advance the local expectation only
// when nothing else was written in between; otherwise keep the stale version
// so the next save surfaces a real conflict and reloads.
export function acknowledgeServerDashboardStateVersion(version: number) {
  if (
    Number.isFinite(version)
    && lastKnownDashboardStateVersion !== null
    && lastKnownDashboardStateVersion === Math.floor(version) - 1
  ) {
    lastKnownDashboardStateVersion = Math.floor(version);
  }
}

// The dashboard_state version this browser last read or wrote; sent to server
// endpoints that write dashboard_state so a stale tab is refused.
export function getKnownDashboardStateVersion(): number | null {
  return lastKnownDashboardStateVersion;
}

function getExpectedDashboardStateVersion(state: DashboardState): number | null {
  return typeof state.version === 'number' && Number.isFinite(state.version)
    ? Math.floor(state.version)
    : lastKnownDashboardStateVersion;
}

function sanitizeRoleAccountsForPublicDirectory(accounts: RoleAccount[]): RoleAccount[] {
  return (accounts || [])
    .filter((account) => account.status === 'Active')
    .map((account) => ({
      id: account.id,
      name: account.name,
      email: '',
      role: account.role,
      status: account.status,
      avatar_data_url: account.avatar_data_url || '',
      default_avatar_id: account.default_avatar_id || ''
    }));
}

function sanitizeRoleAccountsForStaffProjection(accounts: RoleAccount[]): RoleAccount[] {
  return (accounts || [])
    .filter((account) => account.status === 'Active')
    .map((account) => ({
      id: account.id,
      name: account.name,
      email: '',
      role: account.role,
      status: account.status,
      avatar_data_url: account.avatar_data_url || '',
      default_avatar_id: account.default_avatar_id || '',
      // Admin browsers rebuild their shop scope (own + extra shops) from this list.
      ...(account.extra_shop_ids?.length ? { extra_shop_ids: account.extra_shop_ids } : {})
    }));
}

// Sales / Admin read this projection; dealer cost and margin are for Super
// Admin and Operations Manager only (they read dashboard_state). Zero rather
// than delete: a missing profit_amount is re-derived as selling - cost.
function sanitizeVehicleCatalogForStaffProjection(catalog: VehicleCatalogItem[]): VehicleCatalogItem[] {
  return (catalog || []).map((item) => ({
    ...item,
    cost_price: 0,
    profit_amount: 0,
    stock_units: (item.stock_units || []).map((unit) => ({
      ...unit,
      chassis_number: '',
      engine_number: '',
      supplier: '',
      purchase_cost: 0,
      transport_cost: 0,
      registration_cost: 0,
      accessories_cost: 0,
      repair_cost: 0,
      other_direct_cost: 0
    }))
  }));
}

async function syncPublicTrackingLinksToFirebase(db: Firestore, links: WhatsAppTrackingLink[]) {
  const existing = await withFirebaseTimeout(
    getDocs(collection(db, PUBLIC_TRACKING_LINKS_COLLECTION)),
    'public tracking links load'
  );
  const nextIds = new Set((links || []).map((link) => link.id));
  const writes = (links || []).map((link) => withFirebaseTimeout(
    setDoc(doc(db, PUBLIC_TRACKING_LINKS_COLLECTION, link.id), {
      ...link,
      updatedAt: serverTimestamp()
    }, { merge: false }),
    'public tracking link save'
  ));
  const deletes = existing.docs
    .filter((snapshot) => !nextIds.has(snapshot.id))
    .map((snapshot) => withFirebaseTimeout(deleteDoc(snapshot.ref), 'public tracking link delete'));

  await Promise.all([...writes, ...deletes]);
}

async function syncPublicReadableConfigToFirebase(db: Firestore, state: DashboardState, version: number) {
  const updatedAt = serverTimestamp();

  // Server endpoints (/api/staff/avatar, /api/staff/whatsapp-links, account
  // edits) write roleAccounts and WhatsApp links into these projections from
  // the latest dashboard_state. If one already committed a newer version after
  // this save, its projections are newer than this state: leave those fields
  // (and /wa routing docs) alone instead of overwriting them with this copy.
  const latestSnapshot = await withFirebaseTimeout(
    getDoc(doc(db, DASHBOARD_STATE_COLLECTION, DASHBOARD_STATE_DOCUMENT)),
    'dashboard version check'
  );
  const superseded = normalizeDashboardStateVersion(latestSnapshot.data() as Partial<DashboardState>) > version;
  const serverOwnedFields = superseded
    ? {}
    : {
        roleAccounts: sanitizeRoleAccountsForStaffProjection(state.roleAccounts || []),
        whatsAppTrackingLinks: state.whatsAppTrackingLinks || [],
        version
      };

  await Promise.all([
    superseded ? Promise.resolve() : withFirebaseTimeout(
      setDoc(
        doc(db, PUBLIC_CONFIG_COLLECTION, LOGIN_DIRECTORY_DOCUMENT),
        stripUndefinedValues({
          roleAccounts: sanitizeRoleAccountsForPublicDirectory(state.roleAccounts || []),
          version,
          updatedAt
        }) as Record<string, unknown>,
        { merge: true }
      ),
      'login directory save'
    ),
    withFirebaseTimeout(
      setDoc(
        doc(db, PUBLIC_CONFIG_COLLECTION, PUBLIC_DASHBOARD_DOCUMENT),
        stripUndefinedValues({
          bankDefinitions: state.bankDefinitions || [],
          // Any signed-in visitor (anonymous included) can read this
          // document, so it no longer carries the WhatsApp link list (Sales
          // names and phones). /wa reads one public_tracking_links/{id}.
          whatsAppTrackingLinks: [],
          ...(superseded ? {} : { version }),
          whatsAppDefaultMessage: state.whatsAppDefaultMessage,
          updatedAt
        }) as Record<string, unknown>,
        { merge: true }
      ),
      'public dashboard config save'
    ),
    withFirebaseTimeout(
      setDoc(
        doc(db, PUBLIC_CONFIG_COLLECTION, STAFF_DASHBOARD_DOCUMENT),
        stripUndefinedValues({
          errorCodeDefinitions: state.errorCodeDefinitions || [],
          ...serverOwnedFields,
          roleNavAccess: state.roleNavAccess || [],
          roleAccessCapabilities: buildRoleAccessCapabilities(state.roleNavAccess),
          // Sales / Admin read only this projection; without it their User page
          // offers just the built-in avatars, not the Super Admin library.
          defaultAvatarLibrary: state.defaultAvatarLibrary || [],
          whatsAppDefaultMessage: state.whatsAppDefaultMessage,
          vehicleTags: state.vehicleTags || [],
          vehicleBrandTags: state.vehicleBrandTags || [],
          vehicleCatalog: sanitizeVehicleCatalogForStaffProjection(state.vehicleCatalog || []),
          vehicleCategories: state.vehicleCategories || [],
          bankDefinitions: state.bankDefinitions || [],
          marketingTagRelationships: state.marketingTagRelationships || [],
          tagNormalizationRules: state.tagNormalizationRules || [],
          commissionRules: state.commissionRules && typeof state.commissionRules === 'object'
            ? {
                staff_experience_points: (
                  state.commissionRules as CommissionRules & { staff_experience_points?: Record<string, number> }
                ).staff_experience_points || {},
                // Sales see the commission structures on the Commission Ledger (owner 2026-10-24); rates only, no names or amounts.
                ...(state.commissionRules.commission_tier_plans ? { commission_tier_plans: state.commissionRules.commission_tier_plans } : {}),
                ...(state.commissionRules.commission_tiers ? { commission_tiers: state.commissionRules.commission_tiers } : {})
              }
            : undefined,
          attendancePolicy: withoutAttendanceNetworkIps(normalizeAttendancePolicy(state.attendancePolicy)),
          staffShopsByName: buildStaffShopsByName(state.roleAccounts || [], normalizeAttendancePolicy(state.attendancePolicy)),
          adminExtraShopsByName: buildAdminExtraShopsByName(state.roleAccounts || [], normalizeAttendancePolicy(state.attendancePolicy)),
          updatedAt
        }) as Record<string, unknown>,
        // A superseded save merges so it keeps the newer server-owned fields.
        { merge: superseded }
      ),
      'staff dashboard projection save'
    ),
    superseded ? Promise.resolve() : syncPublicTrackingLinksToFirebase(db, state.whatsAppTrackingLinks || [])
  ]);
}

async function isSignedInSuperAdmin() {
  const user = await ensureFirebaseAuthUser();
  if (!user || user.isAnonymous) return false;
  try {
    return await getFirebaseUserRoleClaim(user) === 'Super Admin';
  } catch {
    return false;
  }
}

async function canSyncPublicReadableConfig() {
  const user = await ensureFirebaseAuthUser();

  if (!user || user.isAnonymous) {
    return false;
  }

  try {
    return await getFirebaseUserRoleClaim(user) === 'Super Admin';
  } catch {
    return false;
  }
}

async function assertDashboardStateVersionCurrent(db: Firestore, expectedVersion: number | null) {
  const snapshot = await withFirebaseTimeout(
    getDoc(doc(db, DASHBOARD_STATE_COLLECTION, DASHBOARD_STATE_DOCUMENT)),
    'version check'
  );
  const currentVersion = snapshot.exists()
    ? normalizeDashboardStateVersion(snapshot.data() as Partial<DashboardState>)
    : 0;

  if (expectedVersion === null) {
    if (snapshot.exists()) {
      throw new DashboardStateVersionConflictError(currentVersion, expectedVersion);
    }

    return;
  }

  if (currentVersion !== expectedVersion) {
    throw new DashboardStateVersionConflictError(currentVersion, expectedVersion);
  }
}

const CUSTOMERS_COLLECTION = 'customers';
const RAW_LEADS_COLLECTION = 'raw_leads';
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const AUDIT_LOGS_LOAD_LIMIT = 2000;
const CALENDAR_TASKS_COLLECTION = 'calendar_tasks';
const ATTENDANCE_EVENTS_COLLECTION = 'attendance_events';
const ATTENDANCE_INCIDENT_RESOLUTIONS_COLLECTION = 'attendance_incident_resolutions';
const ATTENDANCE_SCHEDULES_COLLECTION = 'attendance_schedules';
// Monthly salary, split out of attendance_schedules: Super Admin only (owner
// decision 2026-10-06). One document per schedule row, keyed by the row id.
const ATTENDANCE_SALARIES_COLLECTION = 'attendance_salaries';
const STAFF_LEAVE_REQUESTS_COLLECTION = 'staff_leave_requests';
// 匿名客户设备(/wa)只能 create 到这个独立集合;员工端 load 时合并
// 进 whatsAppTrackingClicks,不再让公开页面整份写 dashboard_state。
const WA_CLICKS_COLLECTION = 'wa_clicks';
const DASHBOARD_STATE_CLICKS_LIMIT = 500;
const STOCK_RESERVATIONS_COLLECTION = 'vehicle_stock_reservations';

export interface AttendanceEvent {
  id: string;
  staff_name: string;
  staff_role: string;
  action: 'check_in' | 'check_out';
  occurred_at: string;
  note: string;
  created_at: string;
  team_id?: string;
}

export interface AttendanceIncidentResolution {
  id: string;
  staff_name: string;
  attendance_date: string;
  last_check_in_at: string;
  resolved_by: string;
  resolved_role: string;
  resolved_at: string;
  team_id?: string;
}

type VehicleStockReservation = {
  stock_unit_id: string;
  application_id: string;
  status: 'Available' | 'Reserved' | 'Sold';
  updated_at: string;
  updated_by: string;
};

// Per-session sync bookkeeping: only documents that actually changed get
// written, and audit logs are append-only.
const lastSyncedCustomerJson = new Map<string, string>();
const lastSyncedRawLeadJson = new Map<string, string>();
const lastSyncedCustomerVersion = new Map<string, number>();
const lastSyncedRawLeadVersion = new Map<string, number>();
const lastCheckedCustomerReferences = new Map<string, object>();
const lastCheckedRawLeadReferences = new Map<string, object>();
const syncedAuditLogIds = new Set<string>();
const pendingCustomerDeletionIds = new Set<string>();
const pendingRawLeadDeletionIds = new Set<string>();

export function resetSyncBookkeeping() {
  lastSyncedCustomerJson.clear();
  lastSyncedRawLeadJson.clear();
  lastSyncedCustomerVersion.clear();
  lastSyncedRawLeadVersion.clear();
  lastCheckedCustomerReferences.clear();
  lastCheckedRawLeadReferences.clear();
  pendingCustomerDeletionIds.clear();
  pendingRawLeadDeletionIds.clear();
  syncedAuditLogIds.clear();
  lastKnownDashboardStateVersion = null;
}

export function markCustomersDeletedForSync(ids: string[]) {
  ids.filter(Boolean).forEach((id) => pendingCustomerDeletionIds.add(id));
}

export function markRawLeadsDeletedForSync(ids: string[]) {
  ids.filter(Boolean).forEach((id) => pendingRawLeadDeletionIds.add(id));
}

export type CustomerRealtimeChange = {
  type: 'added' | 'modified' | 'removed';
  id: string;
  application?: LoanApplication;
  previousApplication?: LoanApplication;
};

// Key-order-insensitive stringify so Firestore's alphabetical field order and
// the app's literal object order compare as equal.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value) ?? 'null';
}

async function runWithConcurrency<T>(
  items: T[],
  limitCount: number,
  worker: (item: T) => Promise<void>
) {
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(limitCount, 1), items.length);

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      await worker(item);
    }
  }));
}

// Diff-write a list into its own collection. Returns true only if every
// pending write/delete succeeded, so callers can keep a fallback copy in
// dashboard_state when something failed.
async function syncCollectionDiff<T extends { id: string }>(
  db: Firestore,
  collectionName: string,
  items: T[],
  lastSyncedJson: Map<string, string>,
  lastSyncedVersion: Map<string, number>,
  pendingDeletionIds: Set<string>,
  lastCheckedReferences: Map<string, object>
): Promise<boolean> {
  const nextIds = new Set(items.map((item) => item.id));
  nextIds.forEach((id) => pendingDeletionIds.delete(id));
  let allSucceeded = true;
  let firstConflict: CollectionItemVersionConflictError | null = null;
  let firstPermissionDenied: CollectionItemPermissionDeniedError | null = null;

  const writes = items
    .filter((item) => item.id)
    .filter((item) => lastCheckedReferences.get(item.id) !== item)
    .map((item) => ({ item, json: stableStringify(item) }))
    .filter(({ item, json }) => {
      if (lastSyncedJson.get(item.id) === json) {
        lastCheckedReferences.set(item.id, item);
        return false;
      }
      return true;
    });

  await runWithConcurrency(writes, FIREBASE_COLLECTION_SYNC_CONCURRENCY, async ({ item, json }) => {

    try {
      await withFirebaseTimeout(
        runTransaction(db, async (transaction) => {
          const itemRef = doc(db, collectionName, item.id);
          const snapshot = await transaction.get(itemRef);
          const hasSyncedBefore = lastSyncedJson.has(item.id);
          const expectedVersion = lastSyncedVersion.get(item.id) || 0;
          const currentVersion = snapshot.exists()
            ? normalizeCollectionItemVersion(snapshot.data())
            : 0;

          if (hasSyncedBefore ? currentVersion !== expectedVersion : snapshot.exists()) {
            throw new CollectionItemVersionConflictError(collectionName, item.id, currentVersion, expectedVersion);
          }

          const nextVersion = currentVersion + 1;

          transaction.set(
            itemRef,
            stripUndefinedValues({
              ...item,
              _sync_version: nextVersion,
              updatedAt: serverTimestamp()
            }) as Record<string, unknown>,
            { merge: false }
          );

          return nextVersion;
        }),
        `${collectionName} save`
      ).then((nextVersion) => {
        lastSyncedVersion.set(item.id, nextVersion);
      });
      lastSyncedJson.set(item.id, json);
      lastCheckedReferences.set(item.id, item);
    } catch (error) {
      console.warn(`${collectionName} save failed; will retry on next sync.`, error);
      if (error instanceof CollectionItemVersionConflictError && !firstConflict) {
        firstConflict = error;
      }
      if (isFirestorePermissionDenied(error) && !firstPermissionDenied) {
        firstPermissionDenied = new CollectionItemPermissionDeniedError(collectionName, item.id, error);
      }
      allSucceeded = false;
    }
  });

  // Missing from a full-state snapshot is not a deletion signal. Realtime
  // additions and cached/login snapshots can legitimately be absent from a
  // queued save, so only explicit user actions may create delete intents.
  const deletions = Array.from(pendingDeletionIds)
    .filter((id) => lastSyncedJson.has(id) && !nextIds.has(id));

  await runWithConcurrency(deletions, FIREBASE_COLLECTION_SYNC_CONCURRENCY, async (id) => {
    try {
      await withFirebaseTimeout(
        runTransaction(db, async (transaction) => {
          const itemRef = doc(db, collectionName, id);
          const snapshot = await transaction.get(itemRef);

          if (!snapshot.exists()) {
            return;
          }

          const expectedVersion = lastSyncedVersion.get(id) || 0;
          const currentVersion = normalizeCollectionItemVersion(snapshot.data());

          if (currentVersion !== expectedVersion) {
            throw new CollectionItemVersionConflictError(collectionName, id, currentVersion, expectedVersion);
          }

          transaction.delete(itemRef);
        }),
        `${collectionName} delete`
      );
      lastSyncedJson.delete(id);
      lastSyncedVersion.delete(id);
      lastCheckedReferences.delete(id);
      pendingDeletionIds.delete(id);
    } catch (error) {
      console.warn(`${collectionName} delete failed; will retry on next sync.`, error);
      if (error instanceof CollectionItemVersionConflictError && !firstConflict) {
        firstConflict = error;
      }
      if (isFirestorePermissionDenied(error) && !firstPermissionDenied) {
        firstPermissionDenied = new CollectionItemPermissionDeniedError(collectionName, id, error);
      }
      allSucceeded = false;
    }
  });

  if (firstPermissionDenied) {
    throw firstPermissionDenied;
  }

  if (firstConflict) {
    throw firstConflict;
  }

  return allSucceeded;
}

// Claim-on-open must be a single-document transaction. A normal queued
// dashboard save is deliberately optimistic and can let two Admin browsers
// both believe they won before Firestore rejects the later write. This helper
// commits only the ownership field allowed by isAdminCustomerClaimAllowed.
//
// The claimed application it returns is built from the SERVER snapshot read
// inside the transaction, not from the caller's local copy: that copy can be
// older than the server (another staff member edited the row after this
// browser last synced it). The split-collection sync cache is aligned with that
// exact server-based object and version, and App must place it in state, so a
// later save starts from the server's data instead of writing the stale local
// object over the other edit with a matching version.
export async function claimUnassignedAdminApplicationFromFirebase(
  application: LoanApplication,
  adminName: string
): Promise<LoanApplication> {
  if (!isFirebaseConfigured) {
    return {
      ...application,
      admin_owner_name: adminName
    };
  }

  const db = await getAuthedDb();
  const firebaseUser = await ensureFirebaseAuthUser();
  if (!db || !firebaseUser || firebaseUser.isAnonymous) {
    throw new Error('Missing Firebase Admin session.');
  }

  const identity = await getFirebaseUserStaffIdentityClaims(firebaseUser, true);
  if (identity.role !== 'Admin' || identity.staffName !== adminName) {
    throw new Error('Firebase staff identity does not match the Admin claim.');
  }

  const customerRef = doc(db, CUSTOMERS_COLLECTION, application.id);
  const { claimedApplication, nextVersion } = await withFirebaseTimeout(
    runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(customerRef);
      if (!snapshot.exists()) {
        throw new Error(`Application ${application.id} no longer exists.`);
      }

      const data = snapshot.data() as LoanApplication & { updatedAt?: unknown; _sync_version?: unknown };
      const serverApplication = withoutSyncMetadata<LoanApplication>(data as unknown as Record<string, unknown>, application.id);
      const currentVersion = normalizeCollectionItemVersion(data as unknown as Record<string, unknown>);
      const currentOwner = String(data.admin_owner_name || '');
      if (currentOwner) {
        if (currentOwner === adminName) {
          return { claimedApplication: serverApplication, nextVersion: currentVersion };
        }
        throw new AdminApplicationClaimConflictError(application.id);
      }
      if (data.pending_with !== 'Admin') {
        throw new AdminApplicationClaimConflictError(application.id);
      }

      const version = currentVersion + 1;
      transaction.update(customerRef, {
        admin_owner_name: adminName,
        _sync_version: version,
        updatedAt: serverTimestamp()
      });
      return {
        claimedApplication: { ...serverApplication, admin_owner_name: adminName },
        nextVersion: version
      };
    }),
    'Admin application claim'
  );

  lastSyncedCustomerVersion.set(application.id, nextVersion);
  lastSyncedCustomerJson.set(application.id, stableStringify(claimedApplication));
  lastCheckedCustomerReferences.set(application.id, claimedApplication);
  return claimedApplication;
}

export class CustomerAssignmentError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'CustomerAssignmentError';
    this.status = status;
  }
}

// SEO / staff-link-queue applications are assigned to a Sales through
// POST /api/staff/customer-assignments (Super Admin and Operations Manager);
// Rules refuse the direct client write. The server bumps _sync_version by one,
// so the sync cache is aligned with the returned object exactly like the
// Admin claim above, and the following dashboard save does not rewrite it.
export async function assignCustomerHandlerThroughServer(
  application: LoanApplication,
  target: { id: string; name: string }
): Promise<LoanApplication> {
  const assignedApplication: LoanApplication = {
    ...application,
    handler_name: target.name,
    handler_role: 'Sales'
  };

  if (!isFirebaseConfigured) {
    return assignedApplication;
  }

  const firebaseUser = await ensureFirebaseAuthUser();
  if (!firebaseUser || firebaseUser.isAnonymous) {
    throw new CustomerAssignmentError(401, 'Missing Firebase staff session.');
  }
  const expectedVersion = lastSyncedCustomerVersion.get(application.id);
  if (expectedVersion === undefined) {
    throw new CollectionItemVersionConflictError(CUSTOMERS_COLLECTION, application.id, -1, -1);
  }

  const token = await firebaseUser.getIdToken();
  const response = await withFirebaseTimeout(
    fetch('/api/staff/customer-assignments', {
      method: 'POST',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: application.id, targetAccountId: target.id, expectedVersion })
    }),
    'customer assignment'
  );
  const payload = await response.json().catch(() => ({})) as { error?: string; handlerName?: string; version?: number };
  if (!response.ok) {
    if (response.status === 409 && /changed on another device/i.test(String(payload.error || ''))) {
      throw new CollectionItemVersionConflictError(CUSTOMERS_COLLECTION, application.id, -1, expectedVersion);
    }
    throw new CustomerAssignmentError(response.status, String(payload.error || `Assignment failed (${response.status}).`));
  }

  const version = Number(payload.version);
  const confirmedApplication: LoanApplication = payload.handlerName && payload.handlerName !== target.name
    ? { ...assignedApplication, handler_name: payload.handlerName }
    : assignedApplication;
  if (Number.isFinite(version)) {
    lastSyncedCustomerVersion.set(application.id, Math.floor(version));
  }
  lastSyncedCustomerJson.set(application.id, stableStringify(confirmedApplication));
  lastCheckedCustomerReferences.set(application.id, confirmedApplication);
  return confirmedApplication;
}

// isValidStaffAuditCreate caps these strings. A long calendar title or user
// agent used to make the row fail on every save forever; trim instead.
function fitAuditLogToRules(log: AuditLogEntry): AuditLogEntry {
  const cap = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : value);
  return {
    ...log,
    action: cap(log.action, 160),
    target_type: cap(log.target_type, 160),
    target_id: cap(log.target_id, 160),
    target_label: cap(log.target_label, 300),
    ip_address: cap(log.ip_address, 80),
    user_agent: cap(log.user_agent, 500),
    changes: Array.isArray(log.changes) ? log.changes.slice(0, 100) : log.changes
  } as AuditLogEntry;
}

async function appendAuditLogsToFirebase(
  db: Firestore,
  logs: AuditLogEntry[],
  currentStaffName: string,
  currentStaffRole: string
): Promise<boolean> {
  let allSucceeded = true;
  const pending = logs.filter((log) => log.id && !syncedAuditLogIds.has(log.id));

  await Promise.all(pending.map(async (log) => {
    // Audit Rules intentionally prevent one employee (including Super Admin)
    // from creating a log that claims another employee's identity. Loaded
    // cross-staff history is display data, not a write queue.
    if (
      !currentStaffName ||
      !currentStaffRole ||
      log.staff_name !== currentStaffName ||
      log.staff_role !== currentStaffRole
    ) {
      syncedAuditLogIds.add(log.id);
      return;
    }

    const auditRef = doc(db, AUDIT_LOGS_COLLECTION, log.id);

    try {
      // Super Admin can preflight every immutable row. Scoped staff cannot
      // read a nonexistent audit path under Rules, so their normal path is a
      // create; their complete owner-filtered load already marks existing IDs.
      if (currentStaffRole === 'Super Admin') {
        const snapshot = await withFirebaseTimeout(
          getDoc(auditRef),
          'audit log existence lookup'
        );

        if (snapshot.exists()) {
          syncedAuditLogIds.add(log.id);
          return;
        }
      }

      await withFirebaseTimeout(
        setDoc(
          auditRef,
          stripUndefinedValues({ ...fitAuditLogToRules(log), updatedAt: serverTimestamp() }) as Record<string, unknown>
        ),
        'audit log save'
      );
      syncedAuditLogIds.add(log.id);
    } catch (error) {
      // If another tab created the same immutable entry after our lookup,
      // accept that result instead of surfacing a false permission warning.
      try {
        const retrySnapshot = await withFirebaseTimeout(
          getDoc(auditRef),
          'audit log retry lookup'
        );
        if (retrySnapshot.exists()) {
          syncedAuditLogIds.add(log.id);
          return;
        }
      } catch {
        // Preserve the original write error below.
      }

      console.warn('Audit log save failed; will retry on next sync.', error);
      allSucceeded = false;
    }
  }));

  return allSucceeded;
}

async function loadCollectionItems<T extends { id: string }>(
  db: Firestore,
  collectionName: string,
  lastSyncedJson?: Map<string, string>,
  lastSyncedVersion?: Map<string, number>,
  lastCheckedReferences?: Map<string, object>
): Promise<T[]> {
  // Start each load from a clean slate so a stale set of ids from a previous
  // session can never survive into a later save and be diffed as deletions.
  lastSyncedJson?.clear();
  lastSyncedVersion?.clear();
  lastCheckedReferences?.clear();

  try {
    const snapshot = await withFirebaseTimeout(getDocs(collection(db, collectionName)), `${collectionName} load`);
    const items: T[] = [];

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as T & { updatedAt?: unknown; _sync_version?: unknown };
      const { updatedAt, _sync_version, ...rest } = data;
      const item = { ...rest, id: (rest as { id?: string }).id || docSnapshot.id } as unknown as T;

      items.push(item);
      lastSyncedJson?.set(item.id, stableStringify(item));
      lastSyncedVersion?.set(item.id, normalizeCollectionItemVersion(data as unknown as Record<string, unknown>));
      lastCheckedReferences?.set(item.id, item);
    });

    return items;
  } catch (error) {
    // A failed load must NOT be treated as an empty collection: returning []
    // here previously let hydration overwrite state/cache with nothing and a
    // later save then delete every cloud doc as "removed locally". Rethrow so
    // the whole hydration lands in its catch and keeps the cached data instead.
    console.warn(`${collectionName} load failed.`, error);
    throw error;
  }
}

// Admin reads own rows, every row whose handler is in one of the Admin's shops
// (handler names from the published staffShopsByName map, extra shops from
// adminExtraShopsByName), and the unclaimed
// Admin-review pool: the own shop's is already covered by the same-shop clause,
// every shop's when Super Admin allows it and this Admin opted in. Before Super
// Admin first publishes staffShopsByName there is no same-shop access and the
// pool stays shared, so it is queried unfiltered as before. Must mirror
// isAdminSameShopCustomerData / isUnownedAdminPendingReview in firestore.rules.
async function buildAdminCustomersQuery(db: Firestore, staffName: string) {
  const projection = await withFirebaseTimeout(
    getDoc(doc(db, PUBLIC_CONFIG_COLLECTION, STAFF_DASHBOARD_DOCUMENT)),
    'admin pool scope load'
  ).then((snapshot) => snapshot.data() || {}).catch(() => ({} as Record<string, unknown>));
  const hasShopMap = Boolean(projection.staffShopsByName && typeof projection.staffShopsByName === 'object');
  const shopsByName = (hasShopMap ? projection.staffShopsByName : {}) as Record<string, string>;
  const capabilities = (projection.roleAccessCapabilities || {}) as Partial<RoleAccessCapabilities>;
  const showAllShopsPool = !hasShopMap
    || (capabilities.admin_cross_shop_unclaimed_pool === true && readAdminCrossShopPoolPreference());
  const extraShopsByName = (projection.adminExtraShopsByName && typeof projection.adminExtraShopsByName === 'object'
    ? projection.adminExtraShopsByName
    : {}) as Record<string, string[]>;
  const sameShopHandlers = hasShopMap ? getSameShopPoolHandlerNames(shopsByName, staffName, extraShopsByName) : [];

  return query(
    collection(db, CUSTOMERS_COLLECTION),
    or(
      where('handler_name', '==', staffName),
      where('admin_owner_name', '==', staffName),
      ...(sameShopHandlers.length > 0 ? [where('handler_name', 'in', sameShopHandlers)] : []),
      ...(showAllShopsPool ? [and(where('admin_owner_name', '==', ''), where('pending_with', '==', 'Admin'))] : [])
    )
  );
}

async function loadStaffOwnedCustomers(
  db: Firestore,
  staffName: string,
  staffRole: 'Admin' | 'Sales'
): Promise<LoanApplication[]> {
  lastSyncedCustomerJson.clear();
  lastSyncedCustomerVersion.clear();
  lastCheckedCustomerReferences.clear();

  const ownedCustomersQuery = staffRole === 'Admin'
    ? await buildAdminCustomersQuery(db, staffName)
    : query(collection(db, CUSTOMERS_COLLECTION), where('handler_name', '==', staffName));
  const snapshot = await withFirebaseTimeout(
    getDocs(ownedCustomersQuery),
    'staff-owned customers load'
  );
  const applications: LoanApplication[] = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data() as LoanApplication & { updatedAt?: unknown; _sync_version?: unknown };
    const { updatedAt, _sync_version, ...rest } = data;
    const application = { ...rest, id: rest.id || docSnapshot.id } as LoanApplication;

    applications.push(application);
    lastSyncedCustomerJson.set(application.id, stableStringify(application));
    lastSyncedCustomerVersion.set(application.id, normalizeCollectionItemVersion(data as unknown as Record<string, unknown>));
    lastCheckedCustomerReferences.set(application.id, application);
  });

  return applications;
}

function addRawLeadSnapshotItems(
  snapshot: QuerySnapshot,
  itemsById: Map<string, RawCustomerLead>,
  lastSyncedJson: Map<string, string>,
  lastSyncedVersion: Map<string, number>,
  lastCheckedReferences: Map<string, object>
) {
  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data() as RawCustomerLead & { updatedAt?: unknown; _sync_version?: unknown };
    const { updatedAt, _sync_version, ...rest } = data;
    const item = { ...rest, id: rest.id || docSnapshot.id } as RawCustomerLead;

    itemsById.set(item.id, item);
    lastSyncedJson.set(item.id, stableStringify(item));
    lastSyncedVersion.set(item.id, normalizeCollectionItemVersion(data as unknown as Record<string, unknown>));
    lastCheckedReferences.set(item.id, item);
  });
}

async function loadStaffOwnedRawLeads(
  db: Firestore,
  staffName: string
): Promise<RawCustomerLead[]> {
  lastSyncedRawLeadJson.clear();
  lastSyncedRawLeadVersion.clear();
  lastCheckedRawLeadReferences.clear();

  try {
    const rawLeads = collection(db, RAW_LEADS_COLLECTION);
    const snapshots = await withFirebaseTimeout(Promise.all([
      getDocs(query(rawLeads, where('created_by_staff_name', '==', staffName))),
      getDocs(query(rawLeads, where('taken_by_staff_name', '==', staffName)))
    ]), 'staff-owned raw_leads load');
    const itemsById = new Map<string, RawCustomerLead>();

    snapshots.forEach((snapshot) => addRawLeadSnapshotItems(
      snapshot,
      itemsById,
      lastSyncedRawLeadJson,
      lastSyncedRawLeadVersion,
      lastCheckedRawLeadReferences
    ));

    return Array.from(itemsById.values());
  } catch (error) {
    console.warn('Staff-owned raw_leads load failed.', error);
    throw error;
  }
}

async function loadCalendarTasks(
  db: Firestore,
  staffName: string,
  canViewAllStaff: boolean
): Promise<CalendarNote[]> {
  const calendarTasksSource = canViewAllStaff
    ? collection(db, CALENDAR_TASKS_COLLECTION)
    : query(collection(db, CALENDAR_TASKS_COLLECTION), where('assigned_to', '==', staffName));
  const snapshot = await withFirebaseTimeout(
    getDocs(calendarTasksSource),
    'calendar tasks load'
  );
  const notes: CalendarNote[] = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data() as CalendarNote & { updatedAt?: unknown };
    const { updatedAt, ...rest } = data;
    notes.push({ ...rest, id: rest.id || docSnapshot.id });
  });

  return notes.sort((left, right) => left.date_at.localeCompare(right.date_at));
}

export async function subscribeToCalendarTasksFromFirebase(
  onTasks: (notes: CalendarNote[]) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  const db = await getAuthedDb();
  if (!db) {
    return () => undefined;
  }

  const firebaseUser = await ensureFirebaseAuthUser();
  const tokenResult = firebaseUser && !firebaseUser.isAnonymous
    ? await firebaseUser.getIdTokenResult()
    : null;
  const staffRole = tokenResult?.claims.role;
  const staffName = typeof tokenResult?.claims.staffName === 'string'
    ? tokenResult.claims.staffName
    : '';
  // Same scope as loadCalendarTasks and firestore.rules: only Super Admin
  // reads every calendar task; everyone else (Operations Manager included)
  // listens to the tasks assigned to them. A whole-collection listener for
  // Operations Manager is refused by Rules and stops with a toast.
  const calendarTasksSource = staffRole === 'Super Admin'
    ? collection(db, CALENDAR_TASKS_COLLECTION)
    : staffName
      ? query(collection(db, CALENDAR_TASKS_COLLECTION), where('assigned_to', '==', staffName))
      : null;

  if (!calendarTasksSource) {
    return () => undefined;
  }

  return onSnapshot(
    calendarTasksSource,
    (snapshot) => {
      const notes: CalendarNote[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as CalendarNote & { updatedAt?: unknown };
        const { updatedAt, ...rest } = data;
        notes.push({ ...rest, id: rest.id || docSnapshot.id });
      });
      onTasks(notes.sort((left, right) => left.date_at.localeCompare(right.date_at)));
    },
    (error) => onError?.(error)
  );
}

async function writeCalendarTask(db: Firestore, note: CalendarNote) {
  await withFirebaseTimeout(
    setDoc(
      doc(db, CALENDAR_TASKS_COLLECTION, note.id),
      stripUndefinedValues({
        ...note,
        updatedAt: serverTimestamp()
      }) as Record<string, unknown>,
      { merge: false }
    ),
    'calendar task save'
  );
}

export async function saveCalendarNoteToFirebase(note: CalendarNote) {
  if (!isFirebaseConfigured) return;

  const db = await getAuthedDb();
  if (!db) return;

  await writeCalendarTask(db, note);
}

// Completing / reopening a task writes ONLY the completion fields. The old
// whole-note setDoc(merge:false) replaced `comments` with the local copy, so a
// Super Admin completing a task dropped any reply that arrived after the last
// snapshot. It is also the only shape Rules accept from the assignee
// (affectedKeys hasOnly completed_at / completed_by / updatedAt).
export async function setCalendarTaskCompletionInFirebase(
  noteId: string,
  completion: { completed_at?: string; completed_by?: string }
) {
  if (!isFirebaseConfigured) return;

  const db = await getAuthedDb();
  if (!db) return;

  await withFirebaseTimeout(
    updateDoc(doc(db, CALENDAR_TASKS_COLLECTION, noteId), {
      completed_at: completion.completed_at ? completion.completed_at : deleteField(),
      completed_by: completion.completed_by ? completion.completed_by : deleteField(),
      updatedAt: serverTimestamp()
    }),
    'calendar task completion save'
  );
}

export async function appendCalendarTaskCommentToFirebase(
  noteId: string,
  comment: CalendarTaskComment
): Promise<CalendarTaskComment[] | null> {
  if (!isFirebaseConfigured) return null;

  const db = await getAuthedDb();
  if (!db) return null;

  return withFirebaseTimeout(
    runTransaction(db, async (transaction) => {
      const taskRef = doc(db, CALENDAR_TASKS_COLLECTION, noteId);
      const snapshot = await transaction.get(taskRef);
      if (!snapshot.exists()) {
        throw new Error(`Calendar task ${noteId} no longer exists.`);
      }

      const currentComments = (snapshot.data().comments || []) as CalendarTaskComment[];
      // The caller reuses one id per reply, so a retry after a timeout whose
      // transaction did commit finds the comment already there: no duplicate.
      const { comments: nextComments, appended } = appendCommentOnce(currentComments, comment);
      if (appended) {
        transaction.update(taskRef, {
          comments: nextComments,
          updatedAt: serverTimestamp()
        });
      }
      return nextComments;
    }),
    'calendar task comment append'
  );
}

export async function deleteCalendarNoteFromFirebase(noteId: string) {
  if (!isFirebaseConfigured) return;

  const db = await getAuthedDb();
  if (!db) return;

  await withFirebaseTimeout(
    deleteDoc(doc(db, CALENDAR_TASKS_COLLECTION, noteId)),
    'calendar task delete'
  );
}

export async function subscribeToAttendanceEventsFromFirebase(
  onEvents: (events: AttendanceEvent[]) => void,
  onError?: (error: Error) => void,
  adminTeamId?: string
): Promise<() => void> {
  const db = await getAuthedDb();
  if (!db) return () => undefined;

  const firebaseUser = await ensureFirebaseAuthUser();
  const tokenResult = firebaseUser && !firebaseUser.isAnonymous
    ? await firebaseUser.getIdTokenResult()
    : null;
  const role = tokenResult?.claims.role;
  const staffName = typeof tokenResult?.claims.staffName === 'string'
    ? tokenResult.claims.staffName
    : '';
  const source = isOperationsLead(typeof role === 'string' ? role : '')
    ? collection(db, ATTENDANCE_EVENTS_COLLECTION)
    : role === 'Admin' && adminTeamId
      ? query(collection(db, ATTENDANCE_EVENTS_COLLECTION), where('team_id', '==', adminTeamId))
      : staffName
      ? query(collection(db, ATTENDANCE_EVENTS_COLLECTION), where('staff_name', '==', staffName))
      : null;

  if (!source) return () => undefined;

  return onSnapshot(
    source,
    (snapshot) => {
      const events: AttendanceEvent[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as AttendanceEvent & { updatedAt?: unknown };
        const { updatedAt, ...rest } = data;
        const serverTime = updatedAt && typeof updatedAt === 'object' && 'toDate' in updatedAt
          && typeof (updatedAt as { toDate?: unknown }).toDate === 'function'
          ? (updatedAt as { toDate: () => Date }).toDate().toISOString()
          : rest.occurred_at;
        // The append-only row's server timestamp is authoritative. The client
        // ISO value keeps local-mode UX responsive but cannot forge the time
        // shown to managers after the Firestore snapshot arrives.
        events.push({
          ...rest,
          id: rest.id || docSnapshot.id,
          occurred_at: serverTime
        });
      });
      onEvents(events.sort((left, right) => right.occurred_at.localeCompare(left.occurred_at)));
    },
    (error) => onError?.(error)
  );
}

export interface AttendanceNetworkCheck {
  team_id: string;
  required: boolean;
  allowed: boolean;
  ip_address: string;
}

// Office IP lists stay server-side; the server compares the caller's team
// network with the IP it sees. Returns null when the check cannot be reached.
export async function fetchAttendanceNetworkCheck(): Promise<AttendanceNetworkCheck | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const firebaseUser = await ensureFirebaseAuthUser();
    if (!firebaseUser || firebaseUser.isAnonymous) return null;
    const token = await firebaseUser.getIdToken();
    const response = await fetch('/api/attendance/network-check', {
      method: 'POST',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const data = await response.json() as Partial<AttendanceNetworkCheck>;
    return {
      team_id: String(data.team_id || 'main'),
      required: Boolean(data.required),
      allowed: Boolean(data.allowed),
      ip_address: String(data.ip_address || '')
    };
  } catch {
    return null;
  }
}

export async function saveAttendanceEventToFirebase(event: AttendanceEvent) {
  if (!isFirebaseConfigured) return;
  const db = await getAuthedDb();
  if (!db) return;

  await withFirebaseTimeout(
    setDoc(
      doc(db, ATTENDANCE_EVENTS_COLLECTION, event.id),
      stripUndefinedValues({ ...event, updatedAt: serverTimestamp() }) as Record<string, unknown>,
      { merge: false }
    ),
    'attendance event save'
  );
}

export async function subscribeToAttendanceIncidentResolutionsFromFirebase(
  onResolutions: (resolutions: AttendanceIncidentResolution[]) => void,
  onError?: (error: Error) => void,
  adminTeamId?: string
): Promise<() => void> {
  const db = await getAuthedDb();
  if (!db) return () => undefined;

  const firebaseUser = await ensureFirebaseAuthUser();
  if (!firebaseUser) return () => undefined;
  const identity = await getFirebaseUserStaffIdentityClaims(firebaseUser, true);
  if (identity.role !== 'Super Admin' && (identity.role !== 'Admin' || !adminTeamId)) {
    return () => undefined;
  }

  return onSnapshot(
    identity.role === 'Admin'
      ? query(collection(db, ATTENDANCE_INCIDENT_RESOLUTIONS_COLLECTION), where('team_id', '==', adminTeamId))
      : collection(db, ATTENDANCE_INCIDENT_RESOLUTIONS_COLLECTION),
    (snapshot) => {
      const resolutions: AttendanceIncidentResolution[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as AttendanceIncidentResolution & { updatedAt?: unknown };
        const { updatedAt, ...rest } = data;
        const resolvedAt = updatedAt && typeof updatedAt === 'object' && 'toDate' in updatedAt
          && typeof (updatedAt as { toDate?: unknown }).toDate === 'function'
          ? (updatedAt as { toDate: () => Date }).toDate().toISOString()
          : rest.resolved_at;
        resolutions.push({
          ...rest,
          id: rest.id || docSnapshot.id,
          resolved_at: resolvedAt
        });
      });
      onResolutions(resolutions.sort((left, right) => right.resolved_at.localeCompare(left.resolved_at)));
    },
    (error) => onError?.(error)
  );
}

export async function saveAttendanceIncidentResolutionToFirebase(
  resolution: AttendanceIncidentResolution
) {
  if (!isFirebaseConfigured) return;
  const db = await getAuthedDb();
  if (!db) return;
  const firebaseUser = await ensureFirebaseAuthUser();
  if (!firebaseUser) {
    throw new Error('Missing Firebase staff session.');
  }
  const identity = await getFirebaseUserStaffIdentityClaims(firebaseUser, true);
  if (
    !['Super Admin', 'Admin'].includes(identity.role)
    || identity.staffName !== resolution.resolved_by
    || identity.role !== resolution.resolved_role
  ) {
    throw new Error('Firebase staff identity does not match the attendance resolution.');
  }

  await withFirebaseTimeout(
    runTransaction(db, async (transaction) => {
      const resolutionRef = doc(db, ATTENDANCE_INCIDENT_RESOLUTIONS_COLLECTION, resolution.id);
      const snapshot = await transaction.get(resolutionRef);
      if (snapshot.exists()) return;

      transaction.set(
        resolutionRef,
        stripUndefinedValues({ ...resolution, updatedAt: serverTimestamp() }) as Record<string, unknown>
      );
    }),
    'attendance incident resolution save'
  );
}

export async function subscribeToAttendanceSchedulesFromFirebase(
  onSchedules: (schedules: AttendanceWeeklySchedule[]) => void,
  onError?: (error: Error) => void,
  adminTeamId?: string
): Promise<() => void> {
  const db = await getAuthedDb();
  if (!db) return () => undefined;

  const firebaseUser = await ensureFirebaseAuthUser();
  const tokenResult = firebaseUser && !firebaseUser.isAnonymous
    ? await firebaseUser.getIdTokenResult()
    : null;
  const role = tokenResult?.claims.role;
  const staffName = typeof tokenResult?.claims.staffName === 'string'
    ? tokenResult.claims.staffName
    : '';
  // Schedule rows carry monthly_salary, and firestore.rules lets only Super
  // Admin read every row (owner decision 2026-10-06: salary is Super Admin
  // only). The same-team Admin reads their team; everyone else, Operations
  // Manager included, listens to their own row. A whole-collection listener
  // for Operations Manager is refused by Rules and stops with a toast.
  const source = role === 'Super Admin'
    ? collection(db, ATTENDANCE_SCHEDULES_COLLECTION)
    : role === 'Admin' && adminTeamId
      ? query(collection(db, ATTENDANCE_SCHEDULES_COLLECTION), where('team_id', '==', adminTeamId))
      : staffName
      ? query(collection(db, ATTENDANCE_SCHEDULES_COLLECTION), where('staff_name', '==', staffName))
      : null;

  if (!source) return () => undefined;

  return onSnapshot(
    source,
    (snapshot) => {
      const schedules: AttendanceWeeklySchedule[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as AttendanceWeeklySchedule & { updatedAt?: unknown };
        const { updatedAt, ...rest } = data;
        schedules.push({ ...rest, id: rest.id || docSnapshot.id });
      });
      onSchedules(schedules.sort((left, right) => (
        right.week_start.localeCompare(left.week_start)
        || left.staff_name.localeCompare(right.staff_name)
      )));
    },
    (error) => onError?.(error)
  );
}

// The roster row never carries the salary: Rules refuse `monthly_salary` on
// attendance_schedules. Super Admin's save writes the salary to its own
// Super Admin-only document in the same batch; anyone else's save leaves
// salaries alone.
export async function saveAttendanceWeeklyScheduleToFirebase(schedule: AttendanceWeeklySchedule) {
  if (!isFirebaseConfigured) return;
  const db = await getAuthedDb();
  if (!db) return;

  const { monthly_salary: monthlySalary, ...roster } = schedule;
  const batch = writeBatch(db);
  batch.set(
    doc(db, ATTENDANCE_SCHEDULES_COLLECTION, schedule.id),
    stripUndefinedValues({ ...roster, updatedAt: serverTimestamp() }) as Record<string, unknown>
  );
  if (await isSignedInSuperAdmin()) {
    batch.set(
      doc(db, ATTENDANCE_SALARIES_COLLECTION, schedule.id),
      stripUndefinedValues({
        id: schedule.id,
        week_start: schedule.week_start,
        staff_name: schedule.staff_name,
        monthly_salary: Math.max(0, Math.min(1000000, Number(monthlySalary) || 0)),
        updated_by: schedule.updated_by,
        updated_role: schedule.updated_role,
        updated_at: schedule.updated_at,
        updatedAt: serverTimestamp()
      }) as Record<string, unknown>
    );
  }
  await withFirebaseTimeout(batch.commit(), 'attendance schedule save');
}

export type AttendanceSalaries = Record<string, number>;

// Super Admin only; resolves to a no-op listener for everyone else, whom
// Rules would refuse anyway.
export async function subscribeToAttendanceSalariesFromFirebase(
  onSalaries: (salaries: AttendanceSalaries) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  const db = await getAuthedDb();
  if (!db || !(await isSignedInSuperAdmin())) return () => undefined;

  return onSnapshot(
    collection(db, ATTENDANCE_SALARIES_COLLECTION),
    (snapshot) => {
      const salaries: AttendanceSalaries = {};
      snapshot.forEach((docSnapshot) => {
        const salary = Number(docSnapshot.data().monthly_salary);
        salaries[docSnapshot.id] = Number.isFinite(salary) ? salary : 0;
      });
      onSalaries(salaries);
    },
    (error) => onError?.(error)
  );
}

export async function subscribeToStaffLeaveRequestsFromFirebase(
  onRequests: (requests: ApprovalRequest[]) => void,
  onError?: (error: Error) => void,
  adminTeamId?: string
): Promise<() => void> {
  const db = await getAuthedDb();
  if (!db) return () => undefined;

  const firebaseUser = await ensureFirebaseAuthUser();
  const tokenResult = firebaseUser && !firebaseUser.isAnonymous
    ? await firebaseUser.getIdTokenResult()
    : null;
  const role = tokenResult?.claims.role;
  const staffName = typeof tokenResult?.claims.staffName === 'string'
    ? tokenResult.claims.staffName
    : '';
  const source = isOperationsLead(typeof role === 'string' ? role : '')
    ? collection(db, STAFF_LEAVE_REQUESTS_COLLECTION)
    : role === 'Admin' && adminTeamId
      ? query(collection(db, STAFF_LEAVE_REQUESTS_COLLECTION), where('team_id', '==', adminTeamId))
      : staffName
      ? query(collection(db, STAFF_LEAVE_REQUESTS_COLLECTION), where('requester_name', '==', staffName))
      : null;

  if (!source) return () => undefined;

  return onSnapshot(
    source,
    (snapshot) => {
      const requests: ApprovalRequest[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as ApprovalRequest & { updatedAt?: unknown };
        const { updatedAt, ...rest } = data;
        requests.push({ ...rest, id: rest.id || docSnapshot.id });
      });
      onRequests(requests.sort((left, right) => right.submitted_at.localeCompare(left.submitted_at)));
    },
    (error) => onError?.(error)
  );
}

export async function saveStaffLeaveRequestToFirebase(request: ApprovalRequest) {
  if (!isFirebaseConfigured) return;
  const db = await getAuthedDb();
  if (!db) return;

  await withFirebaseTimeout(
    setDoc(
      doc(db, STAFF_LEAVE_REQUESTS_COLLECTION, request.id),
      stripUndefinedValues({ ...request, updatedAt: serverTimestamp() }) as Record<string, unknown>,
      { merge: false }
    ),
    'staff leave request save'
  );
}

// Staff dashboards keep their initial getDocs hydration for a deterministic
// startup, then use this listener for incremental customer changes only. The
// callback decides whether a remote change is safe to merge. When it rejects a
// change because a local save is still pending, App waits for that save and
// performs one authoritative document reload before updating this bookkeeping.
export async function subscribeToCustomerChangesFromFirebase(
  onChange: (change: CustomerRealtimeChange) => boolean,
  onError?: (error: Error) => void
): Promise<() => void> {
  const db = await getAuthedDb();

  if (!db) {
    return () => undefined;
  }

  const firebaseUser = await ensureFirebaseAuthUser();
  const tokenResult = firebaseUser && !firebaseUser.isAnonymous
    ? await firebaseUser.getIdTokenResult()
    : null;
  const staffRole = tokenResult?.claims.role;
  const staffName = typeof tokenResult?.claims.staffName === 'string'
    ? tokenResult.claims.staffName
    : '';
  const customersSource = isOperationsLead(typeof staffRole === 'string' ? staffRole : '')
    ? collection(db, CUSTOMERS_COLLECTION)
    : staffName && staffRole === 'Admin'
    ? await buildAdminCustomersQuery(db, staffName)
    : staffName && staffRole === 'Sales'
      ? query(collection(db, CUSTOMERS_COLLECTION), where('handler_name', '==', staffName))
      : null;

  if (!customersSource) {
    return () => undefined;
  }

  return onSnapshot(
    customersSource,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const previousJson = lastSyncedCustomerJson.get(id);
        const previousVersion = lastSyncedCustomerVersion.get(id) || 0;
        const previousApplication = previousJson
          ? JSON.parse(previousJson) as LoanApplication
          : undefined;

        if (change.type === 'removed') {
          const accepted = onChange({
            type: 'removed',
            id,
            previousApplication
          });

          if (accepted) {
            lastSyncedCustomerJson.delete(id);
            lastSyncedCustomerVersion.delete(id);
            lastCheckedCustomerReferences.delete(id);
          }

          return;
        }

        const data = change.doc.data() as LoanApplication & { updatedAt?: unknown; _sync_version?: unknown };
        const { updatedAt, _sync_version, ...rest } = data;
        const application = {
          ...rest,
          id: rest.id || id
        } as LoanApplication;
        const nextJson = stableStringify(application);
        const nextVersion = normalizeCollectionItemVersion(data as unknown as Record<string, unknown>);

        // The listener's first snapshot normally repeats the getDocs hydration.
        // Skip identical documents so startup does not re-render the full list.
        if (previousJson === nextJson && previousVersion === nextVersion) {
          return;
        }

        const accepted = onChange({
          type: change.type,
          id,
          application,
          previousApplication
        });

        if (accepted) {
          lastSyncedCustomerJson.set(id, nextJson);
          lastSyncedCustomerVersion.set(id, nextVersion);
          lastCheckedCustomerReferences.set(id, application);
        }
      });
    },
    (error) => {
      console.warn('Customer realtime listener stopped.', error);
      onError?.(error);
    }
  );
}

export async function reloadCustomerFromFirebase(
  applicationId: string,
  options: { knownRemoved?: boolean } = {}
): Promise<LoanApplication | null> {
  const normalizedApplicationId = applicationId.trim();
  if (!normalizedApplicationId) return null;

  if (options.knownRemoved) {
    lastSyncedCustomerJson.delete(normalizedApplicationId);
    lastSyncedCustomerVersion.delete(normalizedApplicationId);
    lastCheckedCustomerReferences.delete(normalizedApplicationId);
    return null;
  }

  const db = await getAuthedDb();
  if (!db) return null;

  const snapshot = await withFirebaseTimeout(
    getDoc(doc(db, CUSTOMERS_COLLECTION, normalizedApplicationId)),
    'customer realtime recovery load'
  );

  if (!snapshot.exists()) {
    lastSyncedCustomerJson.delete(normalizedApplicationId);
    lastSyncedCustomerVersion.delete(normalizedApplicationId);
    lastCheckedCustomerReferences.delete(normalizedApplicationId);
    return null;
  }

  const data = snapshot.data() as LoanApplication & { updatedAt?: unknown; _sync_version?: unknown };
  const { updatedAt, _sync_version, ...rest } = data;
  const application = {
    ...rest,
    id: rest.id || snapshot.id
  } as LoanApplication;

  lastSyncedCustomerJson.set(application.id, stableStringify(application));
  lastSyncedCustomerVersion.set(
    application.id,
    normalizeCollectionItemVersion(data as unknown as Record<string, unknown>)
  );
  lastCheckedCustomerReferences.set(application.id, application);

  return application;
}

async function loadAuditLogsFromFirebase(
  db: Firestore,
  staffName: string,
  canViewAllStaff: boolean
): Promise<AuditLogEntry[]> {
  try {
    const snapshot = await withFirebaseTimeout(
      canViewAllStaff
        ? getDocs(query(collection(db, AUDIT_LOGS_COLLECTION), orderBy('created_at', 'desc'), limit(AUDIT_LOGS_LOAD_LIMIT)))
        : getDocs(query(collection(db, AUDIT_LOGS_COLLECTION), where('staff_name', '==', staffName))),
      'audit logs load'
    );
    const logs: AuditLogEntry[] = [];

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as AuditLogEntry & { updatedAt?: unknown };
      const { updatedAt, ...rest } = data;
      const log = { ...rest, id: rest.id || docSnapshot.id } as AuditLogEntry;

      logs.push(log);
      syncedAuditLogIds.add(log.id);
    });

    return logs
      .sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))
      .slice(0, AUDIT_LOGS_LOAD_LIMIT);
  } catch (error) {
    console.warn('Audit logs load failed; using dashboard_state fallback.', error);
    return [];
  }
}

async function loadStaffOwnedWhatsAppClicks(
  db: Firestore,
  staffName: string
): Promise<WhatsAppTrackingClick[]> {
  const snapshot = await withFirebaseTimeout(
    getDocs(query(collection(db, WA_CLICKS_COLLECTION), where('sales_name', '==', staffName))),
    'staff-owned wa_clicks load'
  );

  return snapshot.docs.map((document) => {
    const data = document.data() as WhatsAppTrackingClick & { updatedAt?: unknown };
    const { updatedAt, ...rest } = data;
    return { ...rest, id: rest.id || document.id } as WhatsAppTrackingClick;
  });
}

async function loadStaffOwnedShortLinks(
  db: Firestore,
  staffName: string
): Promise<CustomerIntakeShortLink[]> {
  const snapshot = await withFirebaseTimeout(
    getDocs(query(collection(db, SHORT_LINKS_COLLECTION), where('staff_name', '==', staffName))),
    'staff-owned short_links load'
  );

  return snapshot.docs.map((document) => {
    const data = document.data() as CustomerIntakeShortLink & { updatedAt?: unknown };
    const { updatedAt, ...rest } = data;
    return { ...rest, id: rest.id || document.id } as CustomerIntakeShortLink;
  });
}

// dashboard_state 里的点击记录(员工端保存)与 wa_clicks 集合
// (匿名客户设备 create-only 写入)按 id 去重合并,新点击在前。
function mergeWhatsAppClicks(
  stateClicks: WhatsAppTrackingClick[],
  collectionClicks: WhatsAppTrackingClick[]
): WhatsAppTrackingClick[] {
  const byId = new Map<string, WhatsAppTrackingClick>();

  [...stateClicks, ...collectionClicks].forEach((click) => {
    if (click && click.id && !byId.has(click.id)) {
      byId.set(click.id, click);
    }
  });

  // No cap here: analytics totals and period comparisons need every visitor
  // record. Only the browser cache is trimmed (useDashboardPersistence).
  return Array.from(byId.values())
    .sort((a, b) => String(b.clicked_at || '').localeCompare(String(a.clicked_at || '')));
}

async function loadVehicleStockReservations(db: Firestore): Promise<VehicleStockReservation[]> {
  const snapshot = await withFirebaseTimeout(
    getDocs(collection(db, STOCK_RESERVATIONS_COLLECTION)),
    'vehicle stock reservations load'
  );
  return snapshot.docs.map((document) => {
    const data = document.data() as Partial<VehicleStockReservation>;
    return {
      stock_unit_id: data.stock_unit_id || document.id,
      application_id: data.application_id || '',
      status: data.status === 'Reserved' || data.status === 'Sold' ? data.status : 'Available',
      updated_at: data.updated_at || '',
      updated_by: data.updated_by || ''
    };
  });
}

function applyVehicleStockReservations(
  catalog: VehicleCatalogItem[],
  reservations: VehicleStockReservation[]
): VehicleCatalogItem[] {
  if (reservations.length === 0) return catalog;
  const reservationByStockId = new Map(reservations.map((reservation) => [reservation.stock_unit_id, reservation]));
  return catalog.map((item) => ({
    ...item,
    stock_units: (item.stock_units || []).map((unit) => {
      const reservation = reservationByStockId.get(unit.id);
      if (!reservation) return unit;
      if (reservation.status === 'Available') {
        return { ...unit, status: 'In Stock', reserved_application_id: '', sold_application_id: '', delivered_at: '' };
      }
      if (reservation.status === 'Sold') {
        return { ...unit, status: 'Sold', reserved_application_id: '', sold_application_id: reservation.application_id };
      }
      return { ...unit, status: 'Reserved', reserved_application_id: reservation.application_id, sold_application_id: '', delivered_at: '' };
    })
  }));
}

function canOperationsManagerReadAuditLogs(data: Record<string, unknown> | undefined) {
  return resolveNavAccess(
    'Operations Manager',
    'audit',
    Array.isArray(data?.roleNavAccess) ? data.roleNavAccess as RoleNavAccessSetting[] : []
  );
}

export async function loadDashboardStateFromFirebase(): Promise<DashboardState | null> {
  if (!isFirebaseConfigured) {
    return null;
  }

  const db = await getAuthedDb();
  if (!db) {
    return null;
  }

  const firebaseUser = await ensureFirebaseAuthUser();
  const tokenResult = firebaseUser && !firebaseUser.isAnonymous
    ? await firebaseUser.getIdTokenResult()
    : null;
  const staffRole = tokenResult?.claims.role;
  const staffName = typeof tokenResult?.claims.staffName === 'string'
    ? tokenResult.claims.staffName
    : '';
  const canViewOperationsData = isOperationsLead(typeof staffRole === 'string' ? staffRole : '');
  const canViewAllStaff = staffRole === 'Super Admin';
  const scopedStaffRole = staffRole === 'Admin' || staffRole === 'Sales'
    ? staffRole
    : null;
  // Operations Manager works every lead like Admin / Sales work their own (owner 2026-10-20).
  const collectionRawLeadsPromise = canViewOperationsData
    ? loadCollectionItems<RawCustomerLead>(db, RAW_LEADS_COLLECTION, lastSyncedRawLeadJson, lastSyncedRawLeadVersion, lastCheckedRawLeadReferences)
    : scopedStaffRole && staffName
      ? loadStaffOwnedRawLeads(db, staffName)
      : Promise.resolve([] as RawCustomerLead[]);
  const stockReservationsPromise = canViewOperationsData
    ? loadVehicleStockReservations(db)
    : Promise.resolve([] as VehicleStockReservation[]);
  const calendarTasksPromise = staffName
    ? loadCalendarTasks(db, staffName, canViewAllStaff)
    : Promise.resolve([] as CalendarNote[]);

  const dashboardDocument = canViewOperationsData
    ? DASHBOARD_STATE_DOCUMENT
    : STAFF_DASHBOARD_DOCUMENT;
  const dashboardCollection = canViewOperationsData
    ? DASHBOARD_STATE_COLLECTION
    : PUBLIC_CONFIG_COLLECTION;
  const customersPromise = canViewOperationsData
    ? loadCollectionItems<LoanApplication>(db, CUSTOMERS_COLLECTION, lastSyncedCustomerJson, lastSyncedCustomerVersion, lastCheckedCustomerReferences)
    : scopedStaffRole && staffName
      ? loadStaffOwnedCustomers(db, staffName, scopedStaffRole)
      : Promise.resolve([] as LoanApplication[]);
  const dashboardSnapshotPromise = withFirebaseTimeout(getDoc(doc(db, dashboardCollection, dashboardDocument)), 'load');
  // Operations Manager's Audit Log switch is enforced by Rules; check it on the
  // loaded settings first instead of running a query the Rules would refuse.
  const auditLogsPromise = staffRole === 'Operations Manager'
    ? dashboardSnapshotPromise.then((dashboardSnapshot) => (
      canOperationsManagerReadAuditLogs(dashboardSnapshot.data())
        ? loadAuditLogsFromFirebase(db, staffName, true)
        : [] as AuditLogEntry[]
    ))
    : canViewOperationsData || (scopedStaffRole && staffName)
      ? loadAuditLogsFromFirebase(db, staffName, canViewOperationsData)
      : Promise.resolve([] as AuditLogEntry[]);
  const waClicksPromise = canViewAllStaff
    ? loadCollectionItems<WhatsAppTrackingClick>(db, WA_CLICKS_COLLECTION).catch(() => [] as WhatsAppTrackingClick[])
    : (scopedStaffRole || canViewOperationsData) && staffName
      ? loadStaffOwnedWhatsAppClicks(db, staffName).catch(() => [] as WhatsAppTrackingClick[])
      : Promise.resolve([] as WhatsAppTrackingClick[]);
  const shortLinksPromise = canViewAllStaff
    ? Promise.resolve(null)
    : (scopedStaffRole || canViewOperationsData) && staffName
      ? loadStaffOwnedShortLinks(db, staffName)
      : Promise.resolve([] as CustomerIntakeShortLink[]);

  const [snapshot, collectionCustomers, collectionRawLeads, collectionAuditLogs, collectionWaClicks, stockReservations, staffShortLinks, collectionCalendarTasks] = await Promise.all([
    dashboardSnapshotPromise,
    customersPromise,
    collectionRawLeadsPromise,
    auditLogsPromise,
    // wa_clicks are non-critical (merged, capped, never diff-deleted), so a
    // failure here must not abort the whole load like customers/raw_leads do.
    waClicksPromise,
    stockReservationsPromise,
    shortLinksPromise,
    calendarTasksPromise
  ]);

  if (!snapshot.exists() && collectionCustomers.length === 0 && collectionRawLeads.length === 0) {
    lastKnownDashboardStateVersion = 0;
    return null;
  }

  const data = (snapshot.exists() ? snapshot.data() : {}) as Partial<DashboardState> & {
    operational_data_reset_at?: unknown;
    data_reset_epoch?: unknown;
  };
  const version = normalizeDashboardStateVersion(data);
  const legacyCalendarNotes = Array.isArray(data.calendarNotes) ? data.calendarNotes : [];
  const collectionCalendarTaskIds = new Set(collectionCalendarTasks.map((note) => note.id));
  const resolvedCalendarNotes = canViewAllStaff
    ? [
        ...collectionCalendarTasks,
        ...legacyCalendarNotes.filter((note) => !collectionCalendarTaskIds.has(note.id))
      ].sort((left, right) => left.date_at.localeCompare(right.date_at))
    : collectionCalendarTasks;

  if (canViewAllStaff && legacyCalendarNotes.some((note) => !collectionCalendarTaskIds.has(note.id))) {
    try {
      await runWithConcurrency(
        legacyCalendarNotes.filter((note) => !collectionCalendarTaskIds.has(note.id)),
        FIREBASE_COLLECTION_SYNC_CONCURRENCY,
        (note) => writeCalendarTask(db, note)
      );
      legacyCalendarNotesPendingMigration = [];
    } catch (error) {
      legacyCalendarNotesPendingMigration = legacyCalendarNotes.filter((note) => !collectionCalendarTaskIds.has(note.id));
      console.warn('Legacy calendar task migration will retry on the next Super Admin load.', error);
    }
  } else if (canViewAllStaff) {
    legacyCalendarNotesPendingMigration = [];
  }

  lastKnownDashboardStateVersion = version;

  return {
    version,
    operationalDataResetAt: typeof data.operational_data_reset_at === 'string'
      ? data.operational_data_reset_at
      : typeof data.data_reset_epoch === 'string' ? data.data_reset_epoch : undefined,
    // Split collections win; the dashboard_state arrays remain as a one-time
    // migration source for data saved by older builds.
    applications: !canViewOperationsData || collectionCustomers.length > 0
      ? collectionCustomers
      : Array.isArray(data.applications) ? data.applications : [],
    rawCustomerLeads: !canViewAllStaff || collectionRawLeads.length > 0
      ? collectionRawLeads
      : Array.isArray(data.rawCustomerLeads) ? data.rawCustomerLeads : [],
    errorCodeDefinitions: Array.isArray(data.errorCodeDefinitions) ? data.errorCodeDefinitions : [],
    roleAccounts: Array.isArray(data.roleAccounts) ? data.roleAccounts : [],
    roleNavAccess: Array.isArray(data.roleNavAccess) ? data.roleNavAccess : [],
    defaultAvatarLibrary: Array.isArray(data.defaultAvatarLibrary) ? data.defaultAvatarLibrary : [],
    whatsAppTrackingLinks: Array.isArray(data.whatsAppTrackingLinks) ? data.whatsAppTrackingLinks : [],
    whatsAppTrackingClicks: canViewAllStaff
      ? mergeWhatsAppClicks(
        Array.isArray(data.whatsAppTrackingClicks) ? data.whatsAppTrackingClicks : [],
        collectionWaClicks
      )
      : collectionWaClicks,
    whatsAppDefaultMessage: typeof data.whatsAppDefaultMessage === 'string' ? data.whatsAppDefaultMessage : undefined,
    customerIntakeShortLinks: canViewAllStaff
      ? Array.isArray(data.customerIntakeShortLinks) ? data.customerIntakeShortLinks : []
      : staffShortLinks || [],
    customMissions: Array.isArray(data.customMissions) ? data.customMissions : [],
    approvalRequests: Array.isArray(data.approvalRequests) ? data.approvalRequests : [],
    calendarNotes: resolvedCalendarNotes,
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    auditLogs: staffRole === 'Operations Manager' && !canOperationsManagerReadAuditLogs(data)
      ? []
      : !canViewOperationsData || collectionAuditLogs.length > 0
      ? collectionAuditLogs
      : Array.isArray(data.auditLogs) ? data.auditLogs : [],
    vehicleTags: Array.isArray(data.vehicleTags) ? data.vehicleTags : [],
    vehicleBrandTags: Array.isArray(data.vehicleBrandTags) ? data.vehicleBrandTags : [],
    vehicleCatalog: applyVehicleStockReservations(
      Array.isArray(data.vehicleCatalog) ? data.vehicleCatalog : [],
      stockReservations
    ),
    vehicleCategories: Array.isArray(data.vehicleCategories) ? data.vehicleCategories : [],
    vehicleBrandLogos: data.vehicleBrandLogos && typeof data.vehicleBrandLogos === 'object' ? data.vehicleBrandLogos as Record<string, string> : {},
    financeProfiles: Array.isArray(data.financeProfiles) ? data.financeProfiles : [],
    commissionRules: data.commissionRules && typeof data.commissionRules === 'object' ? data.commissionRules as CommissionRules : undefined,
    attendancePolicy: normalizeAttendancePolicy(data.attendancePolicy),
    channelMarketingSpend: Array.isArray(data.channelMarketingSpend) ? data.channelMarketingSpend as ChannelMarketingSpend[] : undefined,
    bankDefinitions: Array.isArray(data.bankDefinitions) ? data.bankDefinitions : [],
    marketingTagRelationships: Array.isArray(data.marketingTagRelationships) ? data.marketingTagRelationships : [],
    tagNormalizationRules: Array.isArray(data.tagNormalizationRules) ? data.tagNormalizationRules : []
  };
}

const APPLICATION_DOCUMENTS_COLLECTION = 'application_documents';

// Document data URLs already written to the application_documents collection in
// this session; avoids re-uploading every file on every full-state save.
const syncedApplicationDocumentIds = new Set<string>();

function getApplicationDocumentStoragePath(applicationId: string, documentId: string) {
  return `customer_documents/${encodeURIComponent(applicationId.trim())}/${encodeURIComponent(documentId.trim())}`;
}

function isPendingNewCustomerDocumentUpload(document: PayslipDocument) {
  return document.id.startsWith('DOC-DRAFT-')
    && Boolean(document.file_data_url)
    && !syncedApplicationDocumentIds.has(document.id);
}

function stripPendingNewCustomerDocumentUploads(applications: LoanApplication[]): LoanApplication[] {
  return applications.map((application) => {
    const documents = application.payslip_documents || [];
    const publishedDocuments = documents.filter((document) => !isPendingNewCustomerDocumentUpload(document));

    if (publishedDocuments.length === documents.length) {
      return application;
    }

    return {
      ...application,
      payslip_documents: publishedDocuments,
      document_checklist: normalizeDocumentChecklist({
        ...application,
        payslip_documents: publishedDocuments
      })
    };
  });
}

async function syncApplicationDocumentsToFirebase(db: Firestore, applications: LoanApplication[]) {
  const pendingDocuments: Array<{ application: LoanApplication; document: PayslipDocument }> = [];

  applications.forEach((application) => {
    (application.payslip_documents || []).forEach((document) => {
      if (!syncedApplicationDocumentIds.has(document.id)) {
        pendingDocuments.push({ application, document });
      }
    });
  });

  await Promise.all(pendingDocuments.map(async ({ application, document }) => {
    const isNewCustomerDraftUpload = isPendingNewCustomerDocumentUpload(document);

    try {
      const metadataRef = doc(db, APPLICATION_DOCUMENTS_COLLECTION, document.id);
      const metadataSnapshot = await withFirebaseTimeout(
        getDoc(metadataRef),
        'application document metadata lookup'
      );

      if (metadataSnapshot.exists() && !isNewCustomerDraftUpload) {
        syncedApplicationDocumentIds.add(document.id);
        return;
      }

      // Upload and Re-upload actions write Storage before accepting a document
      // into application state. Full-state persistence must never reinterpret
      // a cached data URL as a new upload. The sole exception is an unsynced
      // Add Customer DOC-DRAFT created before the final application id exists.
      let storagePath = document.storage_path?.startsWith('customer_documents/')
        ? document.storage_path
        : getApplicationDocumentStoragePath(application.id, document.id);

      // Metadata-only cloud hydration is not a repair queue. Application
      // Detail will lazily verify the file when a user opens it and will offer
      // Re-upload if the object is gone. This avoids a 404 probe for every old
      // document during each dashboard startup.
      if (!document.file_data_url) {
        return;
      }

      const storageModule = await import('./applicationDocumentStorage');
      if (isNewCustomerDraftUpload) {
        storagePath = await storageModule.uploadApplicationDocumentToStorage(
          application.id,
          document.id,
          document.file_data_url
        );

        if (!storagePath) {
          throw new Error(`New customer document ${document.id} did not reach Firebase Storage.`);
        }
      }

      const storageExists = await storageModule.applicationDocumentExistsInStorage(storagePath);
      if (!storageExists) {
        if (isNewCustomerDraftUpload) {
          throw new Error(`New customer document ${document.id} is missing after Firebase Storage upload.`);
        }
        return;
      }

      await withFirebaseTimeout(
        setDoc(
          metadataRef,
          stripUndefinedValues({
            ...document,
            application_id: application.id,
            handler_name: application.handler_name,
            file_data_url: '',
            download_url: '',
            storage_path: storagePath,
            updatedAt: serverTimestamp()
          }) as Record<string, unknown>,
          { merge: true }
        ),
        'application document save'
      );
      syncedApplicationDocumentIds.add(document.id);
    } catch (error) {
      if (isNewCustomerDraftUpload) {
        throw error;
      }

      console.warn('Application document save failed; will retry on next sync.', error);
      // Keep the id out of the synced set. A later verified lazy load or
      // explicit Re-upload supplies the data URL and makes metadata repair
      // eligible again without turning ordinary hydration into an upload.
    }
  }));
}

function stripApplicationDocumentData(applications: LoanApplication[]): LoanApplication[] {
  return applications.map((application) => {
    const payslipDocuments = application.payslip_documents || [];
    if (!payslipDocuments.some((document) => Boolean(document.file_data_url))) {
      return application;
    }

    return {
      ...application,
      payslip_documents: payslipDocuments.map((document) => (
        document.file_data_url ? { ...document, file_data_url: '' } : document
      ))
    };
  });
}

export async function saveDealFinanceWithStockReservationToFirebase(
  application: LoanApplication,
  previousStockUnitId: string,
  updatedBy: string,
  options: {
    /** Written in the same transaction (a bike ordered outside that arrived, owner review 2026-10-19). */
    stockOrder?: StockOrder;
    /** Finance actions must not rewrite normalised application-information defaults. */
    financeOnly?: boolean;
    expectedFinanceUpdatedAt?: string;
  } = {}
): Promise<LoanApplication> {
  if (!isFirebaseConfigured) return application;
  const db = await getAuthedDb();
  const firebaseUser = await ensureFirebaseAuthUser();
  if (!db || !firebaseUser || firebaseUser.isAnonymous) throw new Error('Sign in before updating deal finance.');

  // Must match firestore.rules: vehicle_stock_reservations and settlement
  // writes belong to the operational lead roles only. Failing fast here gives
  // a readable error instead of an opaque permission-denied transaction.
  const role = await getFirebaseUserRoleClaim(firebaseUser);
  if (!isOperationsLead(role)) {
    throw new Error('Only Super Admin or Operations Manager can update finance stock reservations.');
  }

  const finance = application.deal_finance;
  const desiredStockUnitId = finance && finance.sale_status !== 'Cancelled'
    ? finance.stock_unit_id || ''
    : '';
  const affectedStockUnitIds = Array.from(new Set([
    previousStockUnitId,
    finance?.stock_unit_id || ''
  ].filter(Boolean)));
  const sanitizedApplication = stripApplicationDocumentData([application])[0];
  const customerWrite = stripUndefinedValues(options.financeOnly
    ? { deal_finance: sanitizedApplication.deal_finance, vehicle_plate: sanitizedApplication.vehicle_plate }
    : sanitizedApplication) as Record<string, unknown>;
  const expectedVersion = lastSyncedCustomerVersion.get(application.id) || 0;
  const customerRef = doc(db, CUSTOMERS_COLLECTION, application.id);
  const reservationRefs = affectedStockUnitIds.map((stockUnitId) => (
    doc(db, STOCK_RESERVATIONS_COLLECTION, stockUnitId)
  ));
  const now = new Date().toISOString();

  const confirmed = await withFirebaseTimeout(
    runTransaction(db, async (transaction) => {
      const customerSnapshot = await transaction.get(customerRef);
      const reservationSnapshots = await Promise.all(reservationRefs.map((reference) => transaction.get(reference)));
      const currentVersion = customerSnapshot.exists()
        ? normalizeCollectionItemVersion(customerSnapshot.data())
        : 0;

      if (!customerSnapshot.exists() || currentVersion !== expectedVersion) {
        throw new CollectionItemVersionConflictError(CUSTOMERS_COLLECTION, application.id, currentVersion, expectedVersion);
      }

      if (options.expectedFinanceUpdatedAt !== undefined
        && (customerSnapshot.data().deal_finance?.updated_at || '') !== options.expectedFinanceUpdatedAt) {
        throw new CollectionItemVersionConflictError(CUSTOMERS_COLLECTION, application.id, currentVersion, expectedVersion);
      }

      reservationSnapshots.forEach((snapshot, index) => {
        if (!snapshot.exists()) return;
        const reservation = snapshot.data() as Partial<VehicleStockReservation>;
        const stockUnitId = affectedStockUnitIds[index];
        if (
          reservation.status !== 'Available' &&
          reservation.application_id &&
          reservation.application_id !== application.id
        ) {
          throw new StockReservationConflictError(stockUnitId, reservation.application_id);
        }
      });

      affectedStockUnitIds.forEach((stockUnitId, index) => {
        const reference = reservationRefs[index];
        if (stockUnitId === desiredStockUnitId) {
          transaction.set(reference, {
            stock_unit_id: stockUnitId,
            application_id: application.id,
            status: finance?.sale_status === 'Bike Delivered' ? 'Sold' : 'Reserved',
            updated_at: now,
            updated_by: updatedBy,
            updatedAt: serverTimestamp()
          }, { merge: false });
          return;
        }

        transaction.set(reference, {
          stock_unit_id: stockUnitId,
          application_id: '',
          status: 'Available',
          updated_at: now,
          updated_by: updatedBy,
          updatedAt: serverTimestamp()
        }, { merge: false });
      });

      const version = currentVersion + 1;
      const payload = { ...customerWrite, _sync_version: version, updatedAt: serverTimestamp() };
      if (options.financeOnly) transaction.update(customerRef, payload);
      else transaction.set(customerRef, payload, { merge: false });
      if (options.stockOrder) {
        transaction.set(
          doc(db, STOCK_ORDERS_COLLECTION, options.stockOrder.application_id),
          { ...toStockOrder(options.stockOrder as unknown as Record<string, unknown>), updatedAt: serverTimestamp() }
        );
      }
      return { version, application: withoutSyncMetadata<LoanApplication>(options.financeOnly ? { ...customerSnapshot.data(), ...customerWrite } : customerWrite, application.id) };
    }),
    'deal finance stock reservation'
  ).catch(async (error) => {
    if (error instanceof StockReservationConflictError || error instanceof CollectionItemVersionConflictError) throw error;
    try {
      const snapshot = await withFirebaseTimeout(getDocFromServer(customerRef), 'finance save confirmation');
      const data = snapshot.exists() ? snapshot.data() : undefined;
      // Confirm the fields this transaction wrote, never an unacknowledged local view.
      if (data && !snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache
        && normalizeCollectionItemVersion(data) === expectedVersion + 1
        && stableStringify(withoutSyncMetadata(options.financeOnly ? { deal_finance: data.deal_finance, vehicle_plate: data.vehicle_plate } : data, application.id)) === stableStringify(withoutSyncMetadata(customerWrite, application.id))) {
        return { version: expectedVersion + 1, application: withoutSyncMetadata<LoanApplication>(data, application.id) };
      }
    } catch {
      // Keep the original failure when the server cannot confirm the write.
    }
    throw error;
  });

  lastSyncedCustomerVersion.set(application.id, confirmed.version);
  lastSyncedCustomerJson.set(application.id, stableStringify(confirmed.application));
  lastCheckedCustomerReferences.delete(application.id);
  return confirmed.application;
}

export async function loadApplicationDocumentsFromFirebase(documentIds: string[]): Promise<Map<string, string>> {
  const dataUrlByDocumentId = new Map<string, string>();

  if (!isFirebaseConfigured || documentIds.length === 0) {
    return dataUrlByDocumentId;
  }

  const db = await getAuthedDb();
  if (!db) {
    return dataUrlByDocumentId;
  }

  await Promise.all(documentIds.map(async (documentId) => {
    try {
      const snapshot = await withFirebaseTimeout(
        getDoc(doc(db, APPLICATION_DOCUMENTS_COLLECTION, documentId)),
        'application document load'
      );

      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data() as Partial<PayslipDocument>;
      let source = typeof data.file_data_url === 'string' ? data.file_data_url : '';

      if (!source && typeof data.storage_path === 'string' && data.storage_path) {
        const module = await import('./applicationDocumentStorage');
        source = await module.loadApplicationDocumentFromStorage(data.storage_path);
      }

      // Legacy Admin-only records can still use their old download URL during
      // migration. New writes never mint or persist bearer download URLs.
      if (!source && typeof data.download_url === 'string') {
        source = data.download_url;
      }

      if (source) {
        dataUrlByDocumentId.set(documentId, source);
        syncedApplicationDocumentIds.add(documentId);
      }
    } catch (error) {
      console.warn('Application document load failed; keeping metadata-only document.', error);
      // Missing document data stays empty; caller keeps metadata only.
    }
  }));

  return dataUrlByDocumentId;
}

const MONTHLY_SNAPSHOTS_COLLECTION = 'monthly_snapshots';
const DAILY_STATS_COLLECTION = 'daily_stats';

let lastDailyStatsJson = '';

// 每次保存顺手把"今天的经营数字"写进 daily_stats/{YYYY-MM-DD}。
// 历史统计从此有固定留痕，之后删改数据也不影响过去某天的记录。
async function saveDailyStatsToFirebase(db: Firestore, state: DashboardState) {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = (value?: string) => {
    if (!value) {
      return false;
    }

    const date = new Date(value);
    return !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
  };

  const applications = state.applications || [];
  const rawLeads = state.rawCustomerLeads || [];
  const clicks = state.whatsAppTrackingClicks || [];

  const stats = {
    id: dateKey,
    date: dateKey,
    applications_total: applications.length,
    applications_today: applications.filter((app) => isToday(app.submitted_at)).length,
    approved_total: applications.filter((app) => String(app.status).toUpperCase().includes('APPROVE')).length,
    leads_total: rawLeads.length,
    leads_today: rawLeads.filter((lead) => isToday(lead.received_at)).length,
    taken_leads_total: rawLeads.filter((lead) => lead.lead_scope === 'Taken Lead' || Boolean(lead.taken_by_staff_name)).length,
    clicks_today: clicks.filter((click) => isToday(click.clicked_at)).length,
    updated_at: now.toISOString()
  };

  const comparable = stableStringify({ ...stats, updated_at: '' });

  if (comparable === lastDailyStatsJson) {
    return;
  }

  try {
    await withFirebaseTimeout(
      setDoc(doc(db, DAILY_STATS_COLLECTION, dateKey), stats, { merge: true }),
      'daily stats save'
    );
    lastDailyStatsJson = comparable;
  } catch (error) {
    console.warn('Daily stats save failed; will retry on the next save.', error);
    // Best-effort; retried on the next save.
  }
}

export async function saveMonthlySnapshotToFirebase(snapshot: MonthlySettlementSnapshot) {
  if (!isFirebaseConfigured) {
    return;
  }

  const db = await getAuthedDb();
  if (!db) {
    return;
  }

  await withFirebaseTimeout(
    setDoc(
      doc(db, MONTHLY_SNAPSHOTS_COLLECTION, snapshot.month),
      stripUndefinedValues({ ...snapshot, updatedAt: serverTimestamp() }) as Record<string, unknown>,
      { merge: false }
    ),
    'monthly snapshot save'
  );
}

export async function loadMonthlySnapshotFromFirebase(month: string): Promise<MonthlySettlementSnapshot | null> {
  if (!isFirebaseConfigured) {
    return null;
  }

  const db = await getAuthedDb();
  if (!db) {
    return null;
  }

  try {
    const snapshot = await withFirebaseTimeout(
      getDoc(doc(db, MONTHLY_SNAPSHOTS_COLLECTION, month)),
      'monthly snapshot load'
    );

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as MonthlySettlementSnapshot;
  } catch (error) {
    console.warn('Monthly snapshot load failed.', error);
    return null;
  }
}

export async function saveDashboardStateToFirebase(state: DashboardState) {
  if (!isFirebaseConfigured) {
    return;
  }

  const db = await getAuthedDb();
  if (!db) {
    return;
  }

  const firebaseUser = await ensureFirebaseAuthUser();
  const staffIdentity = firebaseUser && !firebaseUser.isAnonymous
    ? await getFirebaseUserStaffIdentityClaims(firebaseUser)
    : { role: '' as const, staffName: '', dashboardAccountId: '' };
  const staffRole = staffIdentity.role;

  const applications = Array.isArray(state.applications) ? state.applications : [];
  const rawLeads = Array.isArray(state.rawCustomerLeads) ? state.rawCustomerLeads : [];
  const auditLogs = Array.isArray(state.auditLogs) ? state.auditLogs : [];
  const strippedApplications = stripApplicationDocumentData(applications);
  const hasPendingNewCustomerDocumentUploads = applications.some((application) => (
    (application.payslip_documents || []).some(isPendingNewCustomerDocumentUpload)
  ));
  const initiallyPublishedApplications = hasPendingNewCustomerDocumentUploads
    ? stripApplicationDocumentData(stripPendingNewCustomerDocumentUploads(applications))
    : strippedApplications;
  const expectedVersion = getExpectedDashboardStateVersion(state);
  const stateRef = doc(db, DASHBOARD_STATE_COLLECTION, DASHBOARD_STATE_DOCUMENT);

  // Super Admin owns the complete shared document. Operations Manager receives
  // it read-only for the global operational queue and may later update only the
  // explicitly selected operational fields below.
  if (staffRole === 'Super Admin') {
    await assertDashboardStateVersionCurrent(db, expectedVersion);
  }

  // Split collections: only changed docs are written; audit logs are
  // append-only. If any write failed, the corresponding array is kept inside
  // dashboard_state for that save so no data can be lost mid-migration.
  let collectionConflict: CollectionItemVersionConflictError | null = null;
  const isolateCollectionConflict = async (operation: Promise<boolean>) => {
    try {
      return await operation;
    } catch (error) {
      if (error instanceof CollectionItemVersionConflictError) {
        collectionConflict ||= error;
        // Do not embed a 6,000+ row fallback array into dashboard_state. The
        // conflicted document remains local/quarantined while unrelated split
        // writes and shared configuration continue saving.
        return true;
      }
      throw error;
    }
  };
  const [initialCustomersSynced, rawLeadsSynced, auditLogsSynced] = await Promise.all([
    isolateCollectionConflict(syncCollectionDiff(db, CUSTOMERS_COLLECTION, initiallyPublishedApplications, lastSyncedCustomerJson, lastSyncedCustomerVersion, pendingCustomerDeletionIds, lastCheckedCustomerReferences)),
    isolateCollectionConflict(syncCollectionDiff(db, RAW_LEADS_COLLECTION, rawLeads, lastSyncedRawLeadJson, lastSyncedRawLeadVersion, pendingRawLeadDeletionIds, lastCheckedRawLeadReferences)),
    appendAuditLogsToFirebase(db, auditLogs, staffIdentity.staffName, staffIdentity.role),
    // Calendar tasks are NOT re-written here. Every task action (create,
    // complete, reply, delete) writes its own calendar_tasks document, so a
    // whole-list setDoc on every Super Admin save only replaced replies and
    // completions that had not reached this browser yet, and brought deleted
    // tasks back.
    staffRole === 'Super Admin' ? saveDailyStatsToFirebase(db, state) : Promise.resolve()
  ]);

  // Create/update the owner-scoped customer before uploading its files because
  // Storage and application-document Rules resolve ownership through that row.
  // File data URLs never enter the customer document itself.
  await syncApplicationDocumentsToFirebase(db, applications);

  // Add Customer starts with local DOC-DRAFT files before the final APP id
  // exists. Publish those document rows only after their deterministic Storage
  // objects have uploaded and passed a metadata lookup, so another browser can
  // never observe a Received document whose View action immediately returns
  // 404. A failed upload leaves the owner row in a retryable Missing state.
  const customersSynced = hasPendingNewCustomerDocumentUploads
    ? await isolateCollectionConflict(syncCollectionDiff(db, CUSTOMERS_COLLECTION, strippedApplications, lastSyncedCustomerJson, lastSyncedCustomerVersion, pendingCustomerDeletionIds, lastCheckedCustomerReferences))
    : initialCustomersSynced;

  if (isOperationsManager(staffRole)) {
    const nextVersion = await withFirebaseTimeout(
      runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(stateRef);
        const currentVersion = snapshot.exists()
          ? normalizeDashboardStateVersion(snapshot.data() as Partial<DashboardState>)
          : 0;

        if (!snapshot.exists() || (expectedVersion !== null && currentVersion !== expectedVersion)) {
          throw new DashboardStateVersionConflictError(currentVersion, expectedVersion);
        }

        const version = currentVersion + 1;
        transaction.set(
          stateRef,
          stripUndefinedValues({
            vehicleCatalog: state.vehicleCatalog || [],
            approvalRequests: state.approvalRequests || [],
            notifications: state.notifications || [],
            version,
            updatedAt: serverTimestamp()
          }) as Record<string, unknown>,
          { merge: true }
        );
        return version;
      }),
      'operations dashboard save'
    );

    lastKnownDashboardStateVersion = nextVersion;
    await withFirebaseTimeout(
      setDoc(
        doc(db, PUBLIC_CONFIG_COLLECTION, STAFF_DASHBOARD_DOCUMENT),
        stripUndefinedValues({
          vehicleCatalog: sanitizeVehicleCatalogForStaffProjection(state.vehicleCatalog || []),
          version: nextVersion,
          updatedAt: serverTimestamp()
        }) as Record<string, unknown>,
        { merge: true }
      ),
      'operations staff projection save'
    );

    if (collectionConflict) throw collectionConflict;
    return;
  }

  if (staffRole !== 'Super Admin') {
    if (collectionConflict) throw collectionConflict;
    return;
  }

  const nextVersion = await withFirebaseTimeout(
    runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(stateRef);
      const currentVersion = snapshot.exists()
        ? normalizeDashboardStateVersion(snapshot.data() as Partial<DashboardState>)
        : 0;

      if (expectedVersion === null ? snapshot.exists() : currentVersion !== expectedVersion) {
        throw new DashboardStateVersionConflictError(currentVersion, expectedVersion);
      }

      const version = currentVersion + 1;
      const splitCollectionFallback = {
        applications: customersSynced ? [] : strippedApplications,
        rawCustomerLeads: rawLeadsSynced ? [] : rawLeads,
        auditLogs: auditLogsSynced ? [] : auditLogs.slice(0, 200)
      };
      const dashboardPayload = {
        ...state,
        version,
        ...splitCollectionFallback,
        // Firebase mode authenticates through Firebase Auth. Never mirror
        // local fallback password hashes into the shared state document.
        roleAccounts: (state.roleAccounts || []).map((account) => ({ ...account, password_hash: '' })),
        // The full visitor list lives in wa_clicks and in memory for analytics;
        // the shared document keeps only a bounded recent copy (1 MB limit).
        whatsAppTrackingClicks: (state.whatsAppTrackingClicks || []).slice(0, DASHBOARD_STATE_CLICKS_LIMIT),
        // calendar_tasks is the only copy of calendar tasks. The shared
        // document keeps only legacy notes whose migration has not succeeded,
        // so a deleted task can no longer come back from a stale copy here.
        calendarNotes: legacyCalendarNotesPendingMigration ?? undefined,
        projectName: 'Dr Racing Dashboard',
        updatedAt: serverTimestamp()
      };

      const cleanedPayload = stripUndefinedValues(dashboardPayload) as Record<string, unknown>;
      assertDashboardStateFitsDocumentLimit(cleanedPayload);
      transaction.set(
        stateRef,
        cleanedPayload,
        { merge: true }
      );

      return version;
    }),
    'save'
  );

  lastKnownDashboardStateVersion = nextVersion;
  if (await canSyncPublicReadableConfig()) {
    await syncPublicReadableConfigToFirebase(db, state, nextVersion);
  }
  if (collectionConflict) throw collectionConflict;
}

// Delivery payments (owner meeting 2026-10-13): one row per payment Sales
// collect, in delivery_payments. Rules: read like application_documents (so
// the query filters application_id), created by the file's handler or an
// Operations lead, voided once with a reason, never deleted. Without
// Firebase (local mode, e2e) the rows live in localStorage.
const DELIVERY_PAYMENTS_COLLECTION = 'delivery_payments';
const LOCAL_DELIVERY_PAYMENTS_KEY = 'dr_racing_delivery_payments';

type LocalDeliveryPayment = DeliveryPayment & { receipt_data_url?: string };

const readLocalDeliveryPayments = (): LocalDeliveryPayment[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_DELIVERY_PAYMENTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalDeliveryPayments = (payments: LocalDeliveryPayment[]) => {
  localStorage.setItem(LOCAL_DELIVERY_PAYMENTS_KEY, JSON.stringify(payments));
};

const toDeliveryPayment = (data: Record<string, unknown>): DeliveryPayment => ({
  id: String(data.id || ''),
  application_id: String(data.application_id || ''),
  amount: Number(data.amount) || 0,
  method: (String(data.method || 'Other') as DeliveryPayment['method']),
  received_at: String(data.received_at || ''),
  recorded_by: String(data.recorded_by || ''),
  recorded_by_role: data.recorded_by_role as DeliveryPayment['recorded_by_role'],
  recorded_at: String(data.recorded_at || ''),
  note: String(data.note || ''),
  receipt_document_id: String(data.receipt_document_id || ''),
  voided_at: String(data.voided_at || ''),
  voided_by: String(data.voided_by || ''),
  void_reason: String(data.void_reason || '')
});

export async function listDeliveryPayments(applicationId: string): Promise<DeliveryPayment[]> {
  const db = await getAuthedDb();
  const sortByReceived = (payments: DeliveryPayment[]) => [...payments].sort((left, right) => left.recorded_at.localeCompare(right.recorded_at));
  if (!db) {
    return sortByReceived(readLocalDeliveryPayments().filter((payment) => payment.application_id === applicationId));
  }
  const snapshot = await withFirebaseTimeout(
    getDocsFromServer(query(collection(db, DELIVERY_PAYMENTS_COLLECTION), where('application_id', '==', applicationId))),
    'delivery payments read'
  );
  // Server reads can still include local writes whose acknowledgement is pending.
  if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) {
    throw new Error('Delivery payments are still waiting for server confirmation');
  }
  return sortByReceived(snapshot.docs.map((item) => toDeliveryPayment(item.data())));
}

/** The receipt goes to customer_documents/{application}/{receipt id}, the file's own Storage folder. */
export async function createDeliveryPayment(payment: DeliveryPayment, receiptDataUrl = ''): Promise<DeliveryPayment> {
  const db = await getAuthedDb();
  // Separate upload attempts cannot overwrite the receipt of an in-flight payment.
  const receiptDocumentId = receiptDataUrl ? newId('RECEIPT') : '';
  const saved = { ...payment, receipt_document_id: receiptDocumentId };
  // Existing rows are immutable apart from voiding: a retry confirms the original.
  const existing = (await listDeliveryPayments(payment.application_id)).find((row) => row.id === payment.id);
  if (existing) return existing;
  if (!db) {
    const rows = readLocalDeliveryPayments();
    const confirmed = rows.find((row) => row.id === payment.id);
    if (confirmed) return confirmed;
    writeLocalDeliveryPayments([...rows, { ...saved, receipt_data_url: receiptDataUrl || undefined }]);
    return saved;
  }
  if (receiptDataUrl) {
    const { uploadApplicationDocumentToStorage } = await import('./applicationDocumentStorage');
    await uploadApplicationDocumentToStorage(payment.application_id, receiptDocumentId, receiptDataUrl);
  }
  try {
    await withFirebaseTimeout(
      setDoc(doc(db, DELIVERY_PAYMENTS_COLLECTION, payment.id), { ...saved, updatedAt: serverTimestamp() }),
      'delivery payment write'
    );
    return saved;
  } catch (error) {
    try {
      const confirmed = (await listDeliveryPayments(payment.application_id)).find((row) => row.id === payment.id);
      if (confirmed) return confirmed;
    } catch {
      // Preserve the write failure when a server read cannot resolve it.
    }
    throw error;
  }
}

/**
 * Whether a payment id is on the server, for a write whose acknowledgement
 * timed out. Reads the server, not the cache: the persistent cache already
 * shows a write that is still queued. Uses the application_id query because
 * Rules can only read an existing row (a get of a missing id is denied).
 */
export async function findDeliveryPaymentOnServer(applicationId: string, paymentId: string): Promise<DeliveryPayment | null> {
  return (await listDeliveryPayments(applicationId)).find((row) => row.id === paymentId) || null;
}

const STOCK_ORDERS_COLLECTION = 'stock_orders';
const LOCAL_STOCK_ORDERS_KEY = 'dr_racing_stock_orders';

const readLocalStockOrders = (): StockOrder[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_STOCK_ORDERS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toStockOrder = (data: Record<string, unknown>): StockOrder => ({
  application_id: String(data.application_id || ''),
  vehicle_model: String(data.vehicle_model || ''),
  colour: String(data.colour || ''),
  condition: String(data.condition || ''),
  supplier: String(data.supplier || ''),
  eta: String(data.eta || ''),
  note: String(data.note || ''),
  status: (['Ordered', 'Arrived', 'Cancelled'].includes(String(data.status)) ? data.status : 'Ordered') as StockOrder['status'],
  ordered_at: String(data.ordered_at || ''),
  ordered_by: String(data.ordered_by || ''),
  updated_at: String(data.updated_at || ''),
  updated_by: String(data.updated_by || '')
});

/** Bikes being sourced for approved deals (Operations leads only; Firestore Rules refuse everyone else). */
export async function listStockOrders(): Promise<StockOrder[]> {
  const db = await getAuthedDb();
  if (!db) return readLocalStockOrders();
  const snapshot = await withFirebaseTimeout(getDocs(collection(db, STOCK_ORDERS_COLLECTION)), 'stock orders read');
  return snapshot.docs.map((item) => toStockOrder(item.data()));
}

/** Creates or replaces the stock order of one application. */
export async function saveStockOrder(order: StockOrder): Promise<StockOrder> {
  const db = await getAuthedDb();
  const saved = toStockOrder(order as unknown as Record<string, unknown>);
  if (!db) {
    localStorage.setItem(LOCAL_STOCK_ORDERS_KEY, JSON.stringify([
      ...readLocalStockOrders().filter((item) => item.application_id !== saved.application_id),
      saved
    ]));
    return saved;
  }
  await withFirebaseTimeout(
    setDoc(doc(db, STOCK_ORDERS_COLLECTION, saved.application_id), { ...saved, updatedAt: serverTimestamp() }),
    'stock order write'
  );
  return saved;
}

export async function voidDeliveryPayment(payment: DeliveryPayment, voidedBy: string, reason: string): Promise<DeliveryPayment> {
  const db = await getAuthedDb();
  const current = (await listDeliveryPayments(payment.application_id)).find((row) => row.id === payment.id);
  if (!current) throw new Error('Payment no longer exists');
  if (current.voided_at) return current;
  const voided = { ...current, voided_at: new Date().toISOString(), voided_by: voidedBy, void_reason: reason.trim() };
  if (!db) {
    writeLocalDeliveryPayments(readLocalDeliveryPayments().map((item) => (item.id === payment.id ? { ...item, ...voided } : item)));
    return voided;
  }
  try {
    await withFirebaseTimeout(
      updateDoc(doc(db, DELIVERY_PAYMENTS_COLLECTION, payment.id), {
        voided_at: voided.voided_at,
        voided_by: voided.voided_by,
        void_reason: voided.void_reason,
        updatedAt: serverTimestamp()
      }),
      'delivery payment void'
    );
    return voided;
  } catch (error) {
    try {
      const confirmed = (await listDeliveryPayments(payment.application_id)).find((row) => row.id === payment.id);
      if (confirmed?.voided_at) return confirmed;
    } catch {
      // Keep an unresolved void retryable until the server confirms it.
    }
    throw error;
  }
}

/** A data URL (or '') for showing the receipt photo. */
export async function loadDeliveryReceipt(payment: DeliveryPayment): Promise<string> {
  if (!payment.receipt_document_id) return '';
  const db = await getAuthedDb();
  if (!db) {
    return readLocalDeliveryPayments().find((item) => item.id === payment.id)?.receipt_data_url || '';
  }
  const { loadApplicationDocumentFromStorage } = await import('./applicationDocumentStorage');
  return loadApplicationDocumentFromStorage(`customer_documents/${encodeURIComponent(payment.application_id)}/${encodeURIComponent(payment.receipt_document_id)}`);
}

// Delivery checklist attachments (HP PDF, motor photo, K1, policy, signed
// agreement...): the file goes to customer_documents/{application}/{id} and an
// application_documents row holds its metadata, exactly like an application
// document; the step keeps the ids. They stay out of payslip_documents, so the
// application's document checklist never counts them.
export interface DeliveryAttachment {
  id: string;
  application_id: string;
  document_key: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  storage_path: string;
}

const LOCAL_DELIVERY_ATTACHMENTS_KEY = 'dr_racing_delivery_attachments';
type LocalDeliveryAttachment = DeliveryAttachment & { file_data_url: string };

const readLocalDeliveryAttachments = (): LocalDeliveryAttachment[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_DELIVERY_ATTACHMENTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export async function createDeliveryAttachment(
  application: Pick<LoanApplication, 'id' | 'handler_name'>,
  documentKey: string,
  file: { name: string; type: string; size: number; dataUrl: string },
  uploadedBy: string
): Promise<DeliveryAttachment> {
  const id = `DELIVERY-DOC-${application.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const attachment: DeliveryAttachment = {
    id,
    application_id: application.id,
    document_key: documentKey,
    file_name: file.name.slice(0, 255),
    file_type: file.type,
    file_size: Math.max(1, Math.round(file.size)),
    uploaded_by: uploadedBy,
    uploaded_at: new Date().toISOString(),
    storage_path: ''
  };
  const db = await getAuthedDb();
  if (!db) {
    localStorage.setItem(LOCAL_DELIVERY_ATTACHMENTS_KEY, JSON.stringify([...readLocalDeliveryAttachments(), { ...attachment, file_data_url: file.dataUrl }]));
    return attachment;
  }
  const { uploadApplicationDocumentToStorage } = await import('./applicationDocumentStorage');
  const storagePath = await uploadApplicationDocumentToStorage(application.id, id, file.dataUrl);
  const saved = { ...attachment, storage_path: storagePath };
  await withFirebaseTimeout(
    setDoc(doc(db, APPLICATION_DOCUMENTS_COLLECTION, id), {
      ...saved,
      handler_name: application.handler_name,
      file_data_url: '',
      download_url: '',
      updatedAt: serverTimestamp()
    }),
    'delivery attachment save'
  );
  return saved;
}

export async function listDeliveryAttachments(applicationId: string, ids: string[]): Promise<DeliveryAttachment[]> {
  const wanted = Array.from(new Set(ids.filter(Boolean)));
  if (wanted.length === 0) return [];
  const db = await getAuthedDb();
  if (!db) {
    return readLocalDeliveryAttachments()
      .filter((item) => item.application_id === applicationId && wanted.includes(item.id))
      .map(({ file_data_url: _data, ...item }) => item);
  }
  const snapshots = await Promise.all(wanted.map((id) => withFirebaseTimeout(getDoc(doc(db, APPLICATION_DOCUMENTS_COLLECTION, id)), 'delivery attachment read')));
  return snapshots
    .filter((snapshot) => snapshot.exists())
    .map((snapshot) => {
      const data = snapshot.data() as Record<string, unknown>;
      return {
        id: String(data.id || snapshot.id),
        application_id: String(data.application_id || ''),
        document_key: String(data.document_key || ''),
        file_name: String(data.file_name || ''),
        file_type: String(data.file_type || ''),
        file_size: Number(data.file_size) || 0,
        uploaded_by: String(data.uploaded_by || ''),
        uploaded_at: String(data.uploaded_at || ''),
        storage_path: String(data.storage_path || '')
      };
    });
}

export async function loadDeliveryAttachment(attachment: DeliveryAttachment): Promise<string> {
  const db = await getAuthedDb();
  if (!db) {
    return readLocalDeliveryAttachments().find((item) => item.id === attachment.id)?.file_data_url || '';
  }
  if (!attachment.storage_path) return '';
  const { loadApplicationDocumentFromStorage } = await import('./applicationDocumentStorage');
  return loadApplicationDocumentFromStorage(attachment.storage_path);
}

export class AdminDeliveryError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AdminDeliveryError';
  }
}

/**
 * An Admin's Mark Bike Delivered goes through server.mjs POST /api/staff/deliveries
 * (Firestore Rules keep deal_finance and stock locks for the Operations leads).
 * The server checks ownership, approval, the delivery checklist and the stock
 * unit, writes the deal, the stock lock and an audit row with IP and page.
 * Returns the delivered application as the server saved it.
 */
export async function markBikeDeliveredThroughServer(
  application: LoanApplication,
  stockUnitId: string,
  sourcePage: string
): Promise<LoanApplication> {
  const firebaseUser = await ensureFirebaseAuthUser();
  if (!firebaseUser || firebaseUser.isAnonymous) {
    throw new AdminDeliveryError(401, 'Missing Firebase staff session.');
  }
  const expectedVersion = lastSyncedCustomerVersion.get(application.id);
  if (expectedVersion === undefined) {
    throw new CollectionItemVersionConflictError(CUSTOMERS_COLLECTION, application.id, -1, -1);
  }
  const token = await firebaseUser.getIdToken();
  const response = await withFirebaseTimeout(
    fetch('/api/staff/deliveries', {
      method: 'POST',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: application.id, stockUnitId, expectedVersion, sourcePage })
    }),
    'admin delivery'
  );
  const payload = await response.json().catch(() => ({})) as {
    error?: string;
    version?: number;
    dealFinance?: LoanApplication['deal_finance'];
    vehiclePlate?: string;
  };
  if (!response.ok) {
    if (response.status === 409 && /changed on another device/i.test(String(payload.error || ''))) {
      throw new CollectionItemVersionConflictError(CUSTOMERS_COLLECTION, application.id, -1, expectedVersion);
    }
    throw new AdminDeliveryError(response.status, String(payload.error || `Delivery failed (${response.status}).`));
  }
  const delivered: LoanApplication = {
    ...application,
    deal_finance: payload.dealFinance,
    vehicle_plate: payload.vehiclePlate ?? application.vehicle_plate
  };
  const version = Number(payload.version);
  if (Number.isFinite(version)) {
    lastSyncedCustomerVersion.set(application.id, Math.floor(version));
  }
  const sanitized = stripApplicationDocumentData([delivered])[0];
  lastSyncedCustomerJson.set(application.id, stableStringify(sanitized));
  lastCheckedCustomerReferences.set(application.id, delivered);
  return delivered;
}
