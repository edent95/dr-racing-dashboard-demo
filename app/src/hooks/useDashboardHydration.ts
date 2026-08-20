/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import {
  INITIAL_ERROR_CODE_DEFINITIONS,
  INITIAL_ROLE_ACCOUNTS,
  INITIAL_WHATSAPP_TRACKING_CLICKS,
  INITIAL_WHATSAPP_TRACKING_LINKS
} from '../data/mockData';
import { buildDefaultRolePermissionSettings, normalizeRolePermissionSettings } from '../data/rolePermissions';
import { buildDefaultRoleNavAccessSettings, normalizeRoleNavAccessSettings } from '../data/roleNavAccess';
import { buildDefaultVehicleCategories, normalizeVehicleCategories } from '../data/vehicleCategories';
import { normalizeVehicleBrandLogos } from '../data/vehicleBrandLogos';
import { isOperationsLead } from '../utils/staffRoles';
import {
  DEFAULT_BANK_DEFINITIONS,
  DEFAULT_ATTENDANCE_POLICY,
  DEFAULT_COMMISSION_RULES,
  DEFAULT_MARKETING_TAG_RELATIONSHIPS,
  DEFAULT_TAG_NORMALIZATION_RULES,
  DEFAULT_VEHICLE_BRAND_TAGS,
  DEFAULT_VEHICLE_TAGS,
  FINANCE_PROFILES,
  normalizeAttendancePolicy,
  type ApprovalRequest,
  type AttendancePolicy,
  type AuditLogEntry,
  type BankDefinition,
  type CalendarNote,
  type ChannelMarketingSpend,
  type CommissionRules,
  type CustomMission,
  type CustomerIntakeShortLink,
  type ErrorCodeDefinition,
  type FinanceProfile,
  type LoanApplication,
  type MarketingTagRelationship,
  type NotificationItem,
  type RawCustomerLead,
  type RewardTeam,
  type RoleAccount,
  type RolePermissionSetting,
  type RoleNavAccessSetting,
  type StaffDefaultAvatar,
  type TagNormalizationRule,
  type VehicleCatalogItem,
  type VehicleCategory,
  type WhatsAppTrackingClick,
  type WhatsAppTrackingLink
} from '../types';
import type { DashboardState } from '../services/dashboardRepository';
import { invalidateOperationalDataCacheForResetEpoch } from '../lib/firebaseCacheCleanup';

type SyncStatus = 'loading' | 'cached' | 'firebase' | 'local' | 'error';

const LEGACY_DEMO_APPLICATION_IDS = new Set(Array.from({ length: 11 }, (_, index) => `APP-2026-${String(index + 1).padStart(3, '0')}`));
const LEGACY_DEMO_ACCOUNT_EMAILS = new Set([
  'alicia.tan@drracing.local',
  'daniel.lim@drracing.local',
  'mei.wong@drracing.local',
  'chloe.ng@drracing.local'
]);
const LEGACY_DEMO_WHATSAPP_LINK_IDS = new Set(['WA-001', 'WA-002']);

const removeLegacyDemoApplications = (applications: LoanApplication[]) => applications.filter((application) => !LEGACY_DEMO_APPLICATION_IDS.has(application.id));
const removeLegacyDemoAccounts = (accounts: RoleAccount[]) => accounts.filter((account) => !LEGACY_DEMO_ACCOUNT_EMAILS.has(String(account.email || '').trim().toLowerCase()));
const removeLegacyDemoWhatsAppLinks = (links: WhatsAppTrackingLink[]) => links.filter((link) => !LEGACY_DEMO_WHATSAPP_LINK_IDS.has(link.id));

type SeedMergeResult = {
  applications: LoanApplication[];
  added: boolean;
};

type ErrorCodeHydrationResult = {
  definitions: ErrorCodeDefinition[];
  changed: boolean;
};

export type DashboardHydrationState = {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  errorCodeDefinitions: ErrorCodeDefinition[];
  roleAccounts: RoleAccount[];
  rolePermissions: RolePermissionSetting[];
  roleNavAccess: RoleNavAccessSetting[];
  defaultAvatarLibrary: StaffDefaultAvatar[];
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
  whatsAppTrackingClicks: WhatsAppTrackingClick[];
  whatsAppDefaultMessage: string;
  customerIntakeShortLinks: CustomerIntakeShortLink[];
  customMissions: CustomMission[];
  rewardTeams: RewardTeam[];
  approvalRequests: ApprovalRequest[];
  calendarNotes: CalendarNote[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  vehicleTags: string[];
  vehicleBrandTags: string[];
  vehicleCatalog: VehicleCatalogItem[];
  vehicleCategories: VehicleCategory[];
  vehicleBrandLogos: Record<string, string>;
  financeProfiles: FinanceProfile[];
  commissionRules: CommissionRules;
  attendancePolicy: AttendancePolicy;
  channelMarketingSpend: ChannelMarketingSpend[];
  bankDefinitions: BankDefinition[];
  marketingTagRelationships: MarketingTagRelationship[];
  tagNormalizationRules: TagNormalizationRule[];
};

type LocalDashboardHydrationResult = {
  state: DashboardHydrationState;
  hasRawCustomerLeadCache: boolean;
};

type DashboardHydrationKey = keyof DashboardHydrationState;

type DashboardHydrationSetters = {
  [Key in DashboardHydrationKey as `set${Capitalize<Key>}`]: (value: DashboardHydrationState[Key]) => void;
};

type DashboardHydrationNormalizers = {
  normalizeCommissionRules: (value: unknown) => CommissionRules;
  normalizeFinanceProfiles: (list: FinanceProfile[]) => FinanceProfile[];
  mergeVehicleCatalogWithInitial: (list: VehicleCatalogItem[], profiles?: FinanceProfile[]) => VehicleCatalogItem[];
  normalizeBankDefinitions: (list: BankDefinition[]) => BankDefinition[];
  normalizeMarketingTagRelationships: (list: MarketingTagRelationship[]) => MarketingTagRelationship[];
  normalizeTagNormalizationRules: (list: TagNormalizationRule[]) => TagNormalizationRule[];
  hydrateApplications: (
    list: LoanApplication[],
    vehicleCatalog: VehicleCatalogItem[],
    tagNormalizationRules: TagNormalizationRule[],
    initialApplications: LoanApplication[]
  ) => LoanApplication[];
  mergeMissingSeedCustomers: (list: LoanApplication[], initialApplications: LoanApplication[]) => SeedMergeResult;
  normalizeRawCustomerLeads: (list: RawCustomerLead[]) => RawCustomerLead[];
  mergeLocalTakenRawCustomerLeads: (baseLeads: RawCustomerLead[], localLeads: RawCustomerLead[]) => RawCustomerLead[];
  hydrateErrorCodeDefinitions: (list: ErrorCodeDefinition[]) => ErrorCodeHydrationResult;
  hydrateRoleAccounts: (list: RoleAccount[]) => RoleAccount[];
  normalizeNotificationList: (list: NotificationItem[]) => NotificationItem[];
  normalizeMotorPriceBrandTags: (list: string[]) => string[];
  areJsonLikeValuesEqual: (left: unknown, right: unknown) => boolean;
  warnLocalCacheReadFailed: (storageKey: string, error: unknown) => void;
};

export interface UseDashboardHydrationOptions {
  reloadToken: number;
  firebaseConfigured: boolean;
  publicRoute: boolean;
  defaultWhatsAppDefaultMessage: string;
  initialVehicleCatalog: VehicleCatalogItem[];
  setters: DashboardHydrationSetters;
  normalizers: DashboardHydrationNormalizers;
  setSyncStatus: (status: SyncStatus) => void;
  writeLocalDashboardState: (state: Partial<DashboardHydrationState>) => void;
  writeLocalDashboardValue: <Key extends DashboardHydrationKey>(
    key: Key,
    value: DashboardHydrationState[Key]
  ) => void;
}

const loadInitialRawCustomerLeads = async () => {
  const module = await import('../data/rawCustomerLeads');
  return module.INITIAL_RAW_CUSTOMER_LEADS;
};

const loadInitialLoanApplications = async () => {
  return [] as LoanApplication[];
};

const ensureFirebaseAuthUser = async () => {
  const module = await import('../lib/auth');
  return module.ensureFirebaseAuthUser();
};

const loadDashboardStateFromRemote = async () => {
  const module = await import('../services/dashboardRepository');
  return module.loadDashboardStateFromFirebase();
};

const resetDashboardSyncBookkeeping = async () => {
  const module = await import('../services/dashboardRepository');
  module.resetSyncBookkeeping();
};

const loadPublicDashboardConfigFromRemote = async () => {
  const module = await import('../services/publicRepository');
  return module.loadPublicDashboardConfigFromFirebase();
};

const saveDashboardStateToRemote = async (state: DashboardState) => {
  const module = await import('../services/dashboardRepository');
  return module.saveDashboardStateToFirebase(state);
};

const restoreApplicationDocumentData = (
  remoteApplications: LoanApplication[]
): LoanApplication[] => (
  remoteApplications.map((application) => ({
    ...application,
    payslip_documents: (application.payslip_documents || []).map((document) => ({
      ...document,
      // Authenticated Firebase hydration treats the cloud customer row as the
      // source of truth. Never promote a stale local data URL into a pending
      // upload: metadata can outlive its Storage object and that old browser
      // cache must not silently recreate or repeatedly retry the missing file.
      // Application Detail loads verified bytes lazily and provides an
      // explicit in-place Re-upload action for genuinely missing objects.
      file_data_url: document.file_data_url || ''
    }))
  }))
);

function readJsonCache<T>(
  storageKey: string,
  fallback: T,
  normalize: (value: unknown) => T,
  warnLocalCacheReadFailed: DashboardHydrationNormalizers['warnLocalCacheReadFailed']
) {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return fallback;
  }

  try {
    return normalize(JSON.parse(saved));
  } catch (error) {
    warnLocalCacheReadFailed(storageKey, error);
    return fallback;
  }
}

function applyDashboardState(state: DashboardHydrationState, setters: DashboardHydrationSetters) {
  setters.setApplications(state.applications);
  setters.setRawCustomerLeads(state.rawCustomerLeads);
  setters.setErrorCodeDefinitions(state.errorCodeDefinitions);
  setters.setRoleAccounts(state.roleAccounts);
  setters.setRolePermissions(state.rolePermissions);
  setters.setRoleNavAccess(state.roleNavAccess);
  setters.setDefaultAvatarLibrary(state.defaultAvatarLibrary);
  setters.setWhatsAppTrackingLinks(state.whatsAppTrackingLinks);
  setters.setWhatsAppTrackingClicks(state.whatsAppTrackingClicks);
  setters.setWhatsAppDefaultMessage(state.whatsAppDefaultMessage);
  setters.setCustomerIntakeShortLinks(state.customerIntakeShortLinks);
  setters.setCustomMissions(state.customMissions);
  setters.setRewardTeams(state.rewardTeams);
  setters.setApprovalRequests(state.approvalRequests);
  setters.setCalendarNotes(state.calendarNotes);
  setters.setNotifications(state.notifications);
  setters.setAuditLogs(state.auditLogs);
  setters.setVehicleTags(state.vehicleTags);
  setters.setVehicleBrandTags(state.vehicleBrandTags);
  setters.setFinanceProfiles(state.financeProfiles);
  setters.setCommissionRules(state.commissionRules);
  setters.setAttendancePolicy(state.attendancePolicy);
  setters.setChannelMarketingSpend(state.channelMarketingSpend);
  setters.setVehicleCatalog(state.vehicleCatalog);
  setters.setVehicleCategories(state.vehicleCategories);
  setters.setVehicleBrandLogos(state.vehicleBrandLogos);
  setters.setBankDefinitions(state.bankDefinitions);
  setters.setMarketingTagRelationships(state.marketingTagRelationships);
  setters.setTagNormalizationRules(state.tagNormalizationRules);
}

async function loadLocalDashboardState(
  options: UseDashboardHydrationOptions
): Promise<LocalDashboardHydrationResult> {
  const { defaultWhatsAppDefaultMessage, initialVehicleCatalog, normalizers, publicRoute } = options;
  const {
    normalizeCommissionRules,
    normalizeFinanceProfiles,
    mergeVehicleCatalogWithInitial,
    normalizeBankDefinitions,
    normalizeMarketingTagRelationships,
    normalizeTagNormalizationRules,
    hydrateApplications,
    mergeMissingSeedCustomers,
    normalizeRawCustomerLeads,
    hydrateErrorCodeDefinitions,
    hydrateRoleAccounts,
    normalizeNotificationList,
    normalizeMotorPriceBrandTags,
    warnLocalCacheReadFailed
  } = normalizers;
  const initialLoanApplications = publicRoute ? [] : await loadInitialLoanApplications();

  const nextCommissionRules = readJsonCache(
    'commission_rules',
    DEFAULT_COMMISSION_RULES,
    normalizeCommissionRules,
    warnLocalCacheReadFailed
  );
  const nextAttendancePolicy = readJsonCache(
    'attendance_policy',
    DEFAULT_ATTENDANCE_POLICY,
    normalizeAttendancePolicy,
    warnLocalCacheReadFailed
  );
  const nextChannelMarketingSpend = readJsonCache(
    'channel_marketing_spend',
    [] as ChannelMarketingSpend[],
    (value) => Array.isArray(value) ? value as ChannelMarketingSpend[] : [],
    warnLocalCacheReadFailed
  );
  const nextFinanceProfiles = readJsonCache(
    'finance_profiles',
    FINANCE_PROFILES,
    (value) => normalizeFinanceProfiles(value as FinanceProfile[]),
    warnLocalCacheReadFailed
  );
  const nextVehicleCatalog = readJsonCache(
    'vehicle_catalog',
    mergeVehicleCatalogWithInitial(initialVehicleCatalog, nextFinanceProfiles),
    (value) => mergeVehicleCatalogWithInitial(value as VehicleCatalogItem[], nextFinanceProfiles),
    warnLocalCacheReadFailed
  );
  const nextBankDefinitions = readJsonCache(
    'bank_definitions',
    DEFAULT_BANK_DEFINITIONS,
    (value) => normalizeBankDefinitions(value as BankDefinition[]),
    warnLocalCacheReadFailed
  );
  const nextMarketingTagRelationships = readJsonCache(
    'marketing_tag_relationships',
    DEFAULT_MARKETING_TAG_RELATIONSHIPS,
    (value) => normalizeMarketingTagRelationships(value as MarketingTagRelationship[]),
    warnLocalCacheReadFailed
  );
  const nextTagNormalizationRules = readJsonCache(
    'tag_normalization_rules',
    DEFAULT_TAG_NORMALIZATION_RULES,
    (value) => normalizeTagNormalizationRules(value as TagNormalizationRule[]),
    warnLocalCacheReadFailed
  );
  const cachedApplications = readJsonCache(
    'loan_applications_dashboard',
    hydrateApplications(initialLoanApplications, nextVehicleCatalog, nextTagNormalizationRules, initialLoanApplications),
    (value) => hydrateApplications(value as LoanApplication[], nextVehicleCatalog, nextTagNormalizationRules, initialLoanApplications),
    warnLocalCacheReadFailed
  );
  const nextApplications = removeLegacyDemoApplications(mergeMissingSeedCustomers(cachedApplications, initialLoanApplications).applications);
  const savedRawCustomerLeads = localStorage.getItem('raw_customer_leads');
  const hasRawCustomerLeadCache = savedRawCustomerLeads !== null;
  const nextRawCustomerLeads = savedRawCustomerLeads
    ? readJsonCache(
      'raw_customer_leads',
      [] as RawCustomerLead[],
      (value) => normalizeRawCustomerLeads(value as RawCustomerLead[]),
      warnLocalCacheReadFailed
    )
    : [];
  const nextErrorCodeDefinitions = readJsonCache(
    'loan_error_code_definitions',
    INITIAL_ERROR_CODE_DEFINITIONS,
    (value) => hydrateErrorCodeDefinitions(value as ErrorCodeDefinition[]).definitions,
    warnLocalCacheReadFailed
  );
  const nextRoleAccounts = removeLegacyDemoAccounts(readJsonCache(
    'loan_role_accounts',
    INITIAL_ROLE_ACCOUNTS,
    (value) => hydrateRoleAccounts(value as RoleAccount[]),
    warnLocalCacheReadFailed
  ));
  const nextRolePermissions = readJsonCache(
    'role_permissions',
    buildDefaultRolePermissionSettings(),
    (value) => normalizeRolePermissionSettings(value as RolePermissionSetting[]),
    warnLocalCacheReadFailed
  );
  const nextVehicleCategories = readJsonCache(
    'vehicle_categories',
    buildDefaultVehicleCategories(),
    (value) => normalizeVehicleCategories(value as VehicleCategory[]),
    warnLocalCacheReadFailed
  );
  const nextVehicleBrandLogos = readJsonCache(
    'vehicle_brand_logos',
    {},
    (value) => normalizeVehicleBrandLogos(value),
    warnLocalCacheReadFailed
  );
  const nextRoleNavAccess = readJsonCache(
    'role_nav_access',
    buildDefaultRoleNavAccessSettings(),
    (value) => normalizeRoleNavAccessSettings(value as RoleNavAccessSetting[]),
    warnLocalCacheReadFailed
  );
  const nextDefaultAvatarLibrary = readJsonCache(
    'staff_default_avatars',
    [] as StaffDefaultAvatar[],
    (value) => value as StaffDefaultAvatar[],
    warnLocalCacheReadFailed
  );
  const nextWhatsAppTrackingLinks = removeLegacyDemoWhatsAppLinks(readJsonCache(
    'whatsapp_tracking_links',
    INITIAL_WHATSAPP_TRACKING_LINKS,
    (value) => value as WhatsAppTrackingLink[],
    warnLocalCacheReadFailed
  ));
  const nextWhatsAppTrackingClicks = readJsonCache(
    'whatsapp_tracking_clicks',
    INITIAL_WHATSAPP_TRACKING_CLICKS,
    (value) => value as WhatsAppTrackingClick[],
    warnLocalCacheReadFailed
  );
  const savedWhatsAppDefaultMessage = localStorage.getItem('whatsapp_default_message');
  const nextWhatsAppDefaultMessage = savedWhatsAppDefaultMessage !== null && savedWhatsAppDefaultMessage.trim()
    ? savedWhatsAppDefaultMessage
    : defaultWhatsAppDefaultMessage;
  const nextCustomerIntakeShortLinks = readJsonCache(
    'customer_intake_short_links',
    [] as CustomerIntakeShortLink[],
    (value) => value as CustomerIntakeShortLink[],
    warnLocalCacheReadFailed
  );
  const nextCustomMissions = readJsonCache(
    'custom_missions',
    [] as CustomMission[],
    (value) => value as CustomMission[],
    warnLocalCacheReadFailed
  );
  const nextRewardTeams = readJsonCache(
    'reward_teams',
    [] as RewardTeam[],
    (value) => value as RewardTeam[],
    warnLocalCacheReadFailed
  );
  const nextApprovalRequests = readJsonCache(
    'approval_requests',
    [] as ApprovalRequest[],
    (value) => value as ApprovalRequest[],
    warnLocalCacheReadFailed
  );
  const nextCalendarNotes = readJsonCache(
    'calendar_notes',
    [] as CalendarNote[],
    (value) => value as CalendarNote[],
    warnLocalCacheReadFailed
  );
  const nextNotifications = readJsonCache(
    'dashboard_notifications',
    [] as NotificationItem[],
    (value) => normalizeNotificationList(value as NotificationItem[]),
    warnLocalCacheReadFailed
  );
  const nextAuditLogs = readJsonCache(
    'dashboard_audit_logs',
    [] as AuditLogEntry[],
    (value) => value as AuditLogEntry[],
    warnLocalCacheReadFailed
  );
  const nextVehicleTags = readJsonCache(
    'vehicle_tags',
    DEFAULT_VEHICLE_TAGS,
    (value) => value as string[],
    warnLocalCacheReadFailed
  );
  const nextVehicleBrandTags = readJsonCache(
    'vehicle_brand_tags',
    DEFAULT_VEHICLE_BRAND_TAGS,
    (value) => normalizeMotorPriceBrandTags([...(value as string[]), ...DEFAULT_VEHICLE_BRAND_TAGS]),
    warnLocalCacheReadFailed
  );

  return {
    hasRawCustomerLeadCache,
    state: {
      applications: nextApplications,
      rawCustomerLeads: nextRawCustomerLeads,
      errorCodeDefinitions: nextErrorCodeDefinitions,
      roleAccounts: nextRoleAccounts,
      rolePermissions: nextRolePermissions,
      roleNavAccess: nextRoleNavAccess,
      vehicleCategories: nextVehicleCategories,
      vehicleBrandLogos: nextVehicleBrandLogos,
      defaultAvatarLibrary: nextDefaultAvatarLibrary,
      whatsAppTrackingLinks: nextWhatsAppTrackingLinks,
      whatsAppTrackingClicks: nextWhatsAppTrackingClicks,
      whatsAppDefaultMessage: nextWhatsAppDefaultMessage,
      customerIntakeShortLinks: nextCustomerIntakeShortLinks,
      customMissions: nextCustomMissions,
      rewardTeams: nextRewardTeams,
      approvalRequests: nextApprovalRequests,
      calendarNotes: nextCalendarNotes,
      notifications: nextNotifications,
      auditLogs: nextAuditLogs,
      vehicleTags: nextVehicleTags,
      vehicleBrandTags: nextVehicleBrandTags,
      financeProfiles: nextFinanceProfiles,
      commissionRules: nextCommissionRules,
      attendancePolicy: nextAttendancePolicy,
      channelMarketingSpend: nextChannelMarketingSpend,
      vehicleCatalog: nextVehicleCatalog,
      bankDefinitions: nextBankDefinitions,
      marketingTagRelationships: nextMarketingTagRelationships,
      tagNormalizationRules: nextTagNormalizationRules
    }
  };
}

async function applyPublicDashboardConfig(
  options: UseDashboardHydrationOptions,
  { persistLocal = true }: { persistLocal?: boolean } = {}
) {
  const {
    normalizers,
    setters,
    writeLocalDashboardValue
  } = options;

  try {
    const publicConfig = await loadPublicDashboardConfigFromRemote();

    if (!publicConfig) {
      return;
    }

    if (publicConfig.roleAccounts.length > 0) {
      const loadedRoles = normalizers.hydrateRoleAccounts(publicConfig.roleAccounts);
      setters.setRoleAccounts(loadedRoles);
      if (persistLocal) {
        writeLocalDashboardValue('roleAccounts', loadedRoles);
      }
    }

    if (publicConfig.bankDefinitions.length > 0) {
      const loadedBanks = normalizers.normalizeBankDefinitions(publicConfig.bankDefinitions);
      setters.setBankDefinitions(loadedBanks);
      if (persistLocal) {
        writeLocalDashboardValue('bankDefinitions', loadedBanks);
      }
    }

    if (publicConfig.whatsAppTrackingLinks.length > 0) {
      setters.setWhatsAppTrackingLinks(publicConfig.whatsAppTrackingLinks);
      if (persistLocal) {
        writeLocalDashboardValue('whatsAppTrackingLinks', publicConfig.whatsAppTrackingLinks);
      }
    }

    if (publicConfig.whatsAppDefaultMessage?.trim()) {
      setters.setWhatsAppDefaultMessage(publicConfig.whatsAppDefaultMessage);
      if (persistLocal) {
        writeLocalDashboardValue('whatsAppDefaultMessage', publicConfig.whatsAppDefaultMessage);
      }
    }
  } catch (error) {
    console.warn('Public dashboard config load failed, using local cache.', error);
  }
}

function applyPublicRouteLocalCache(options: UseDashboardHydrationOptions) {
  const {
    defaultWhatsAppDefaultMessage,
    normalizers,
    setters
  } = options;
  const {
    normalizeBankDefinitions,
    warnLocalCacheReadFailed
  } = normalizers;
  const loadedBanks = readJsonCache(
    'bank_definitions',
    DEFAULT_BANK_DEFINITIONS,
    (value) => normalizeBankDefinitions(value as BankDefinition[]),
    warnLocalCacheReadFailed
  );
  const loadedWhatsAppLinks = readJsonCache(
    'whatsapp_tracking_links',
    [] as WhatsAppTrackingLink[],
    (value) => value as WhatsAppTrackingLink[],
    warnLocalCacheReadFailed
  );
  const loadedShortLinks = readJsonCache(
    'customer_intake_short_links',
    [] as CustomerIntakeShortLink[],
    (value) => value as CustomerIntakeShortLink[],
    warnLocalCacheReadFailed
  );
  const savedWhatsAppDefaultMessage = localStorage.getItem('whatsapp_default_message');

  setters.setBankDefinitions(loadedBanks);

  if (loadedWhatsAppLinks.length > 0) {
    setters.setWhatsAppTrackingLinks(loadedWhatsAppLinks);
  }

  if (loadedShortLinks.length > 0) {
    setters.setCustomerIntakeShortLinks(loadedShortLinks);
  }

  setters.setWhatsAppDefaultMessage(
    savedWhatsAppDefaultMessage !== null && savedWhatsAppDefaultMessage.trim()
      ? savedWhatsAppDefaultMessage
      : defaultWhatsAppDefaultMessage
  );
}

function buildRemoteDashboardState(
  firebaseState: DashboardState,
  localState: DashboardHydrationState,
  rawCustomerSeedLeads: RawCustomerLead[],
  options: UseDashboardHydrationOptions
) {
  const { defaultWhatsAppDefaultMessage, initialVehicleCatalog, normalizers } = options;
  const loadedFinanceProfiles = normalizers.normalizeFinanceProfiles(
    (firebaseState.financeProfiles || []).length > 0 ? firebaseState.financeProfiles || [] : FINANCE_PROFILES
  );
  const loadedCommissionRules = normalizers.normalizeCommissionRules(firebaseState.commissionRules || localState.commissionRules || DEFAULT_COMMISSION_RULES);
  const loadedAttendancePolicy = normalizeAttendancePolicy(firebaseState.attendancePolicy || localState.attendancePolicy);
  const loadedVehicleCatalog = normalizers.mergeVehicleCatalogWithInitial(
    firebaseState.vehicleCatalog.length > 0 ? firebaseState.vehicleCatalog : initialVehicleCatalog,
    loadedFinanceProfiles
  );
  const loadedMarketingTagRelationships = normalizers.normalizeMarketingTagRelationships(
    firebaseState.marketingTagRelationships.length > 0 ? firebaseState.marketingTagRelationships : DEFAULT_MARKETING_TAG_RELATIONSHIPS
  );
  const loadedTagNormalizationRules = normalizers.normalizeTagNormalizationRules(
    (firebaseState.tagNormalizationRules || []).length > 0 ? firebaseState.tagNormalizationRules || [] : DEFAULT_TAG_NORMALIZATION_RULES
  );

  return {
    loadedFinanceProfiles,
    loadedCommissionRules,
    loadedAttendancePolicy,
    loadedVehicleCatalog,
    loadedMarketingTagRelationships,
    loadedTagNormalizationRules,
    loadedWhatsAppDefaultMessage: firebaseState.whatsAppDefaultMessage?.trim()
      ? firebaseState.whatsAppDefaultMessage
      : defaultWhatsAppDefaultMessage,
    firebaseRawCustomerLeads: normalizers.normalizeRawCustomerLeads([
      ...(firebaseState.rawCustomerLeads || []),
      ...rawCustomerSeedLeads
    ])
  };
}

async function loadNormalizedRawCustomerSeedLeads(normalizers: DashboardHydrationNormalizers) {
  return normalizers.normalizeRawCustomerLeads(await loadInitialRawCustomerLeads());
}

export function useDashboardHydration(options: UseDashboardHydrationOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      const currentOptions = optionsRef.current;
      const {
        firebaseConfigured,
        publicRoute,
        setters,
        normalizers,
        setSyncStatus,
        writeLocalDashboardState
      } = currentOptions;

      if (publicRoute) {
        applyPublicRouteLocalCache(currentOptions);

        if (!firebaseConfigured) {
          setSyncStatus('local');
          return;
        }

        await ensureFirebaseAuthUser().catch((error) => {
          console.warn('Firebase auth warm-up failed.', error);
          return null;
        });

        if (!isMounted) {
          return;
        }

        await applyPublicDashboardConfig(currentOptions, { persistLocal: false });

        if (!isMounted) {
          return;
        }

        setSyncStatus('local');
        return;
      }

      // Clear module-level collection/version state before cached data is
      // applied. A logout/login cycle must never let a cached empty snapshot
      // inherit deletion bookkeeping from the previous staff session.
      await resetDashboardSyncBookkeeping();

      if (!isMounted) {
        return;
      }

      const localLoadResult = await loadLocalDashboardState(currentOptions);
      let localState = localLoadResult.state;

      if (!isMounted) {
        return;
      }

      applyDashboardState(localState, setters);
      if (localLoadResult.hasRawCustomerLeadCache || localState.rawCustomerLeads.length > 0) {
        writeLocalDashboardState(localState);
      } else {
        const { rawCustomerLeads: _rawCustomerLeads, ...localStateWithoutRawLeads } = localState;
        writeLocalDashboardState(localStateWithoutRawLeads);
      }

      if (!firebaseConfigured) {
        if (!localLoadResult.hasRawCustomerLeadCache && localState.rawCustomerLeads.length === 0) {
          const seedRawCustomerLeads = await loadNormalizedRawCustomerSeedLeads(normalizers);

          if (!isMounted) {
            return;
          }

          localState = {
            ...localState,
            rawCustomerLeads: seedRawCustomerLeads
          };
          applyDashboardState(localState, setters);
          writeLocalDashboardState(localState);
        }

        setSyncStatus('local');
        return;
      }

      const firebaseUser = await ensureFirebaseAuthUser().catch((error) => {
        console.warn('Firebase auth warm-up failed.', error);
        return null;
      });

      if (!firebaseUser || firebaseUser.isAnonymous) {
        await applyPublicDashboardConfig(currentOptions);
        setSyncStatus('cached');
        return;
      }

      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const canRunRemoteMigrations = tokenResult.claims.role === 'Super Admin';
      const canViewAllStaff = isOperationsLead(
        typeof tokenResult.claims.role === 'string' ? tokenResult.claims.role : ''
      );

      setSyncStatus('cached');

      try {
        const firebaseState = await loadDashboardStateFromRemote();

        if (!isMounted) {
          return;
        }

        if (firebaseState) {
          const operationalResetApplied = invalidateOperationalDataCacheForResetEpoch(
            firebaseState.operationalDataResetAt
          );
          if (operationalResetApplied) {
            localState = {
              ...localState,
              applications: [],
              rawCustomerLeads: [],
              whatsAppTrackingClicks: [],
              customerIntakeShortLinks: [],
              customMissions: [],
              rewardTeams: [],
              approvalRequests: [],
              calendarNotes: [],
              notifications: [],
              auditLogs: [],
              channelMarketingSpend: []
            };
          }

          const remoteRawCustomerLeads = firebaseState.rawCustomerLeads || [];
          const shouldLoadRawCustomerSeeds = (
            !firebaseState.operationalDataResetAt &&
            remoteRawCustomerLeads.length === 0 &&
            localState.rawCustomerLeads.length === 0 &&
            !localLoadResult.hasRawCustomerLeadCache
          );
          const rawCustomerSeedLeads = shouldLoadRawCustomerSeeds
            ? await loadNormalizedRawCustomerSeedLeads(normalizers)
            : [];

          if (!isMounted) {
            return;
          }

          const {
            loadedFinanceProfiles,
            loadedCommissionRules,
            loadedAttendancePolicy,
            loadedVehicleCatalog,
            loadedMarketingTagRelationships,
            loadedTagNormalizationRules,
            loadedWhatsAppDefaultMessage,
            firebaseRawCustomerLeads
          } = buildRemoteDashboardState(firebaseState, localState, rawCustomerSeedLeads, currentOptions);
          const restoredApplications = restoreApplicationDocumentData(firebaseState.applications);
          const cleanedRestoredApplications = removeLegacyDemoApplications(restoredApplications);
          const cleanedRoleAccounts = removeLegacyDemoAccounts(firebaseState.roleAccounts || []);
          const cleanedWhatsAppTrackingLinks = removeLegacyDemoWhatsAppLinks(firebaseState.whatsAppTrackingLinks || []);
          const legacyDemoDataRemoved = (
            cleanedRestoredApplications.length !== restoredApplications.length ||
            cleanedRoleAccounts.length !== (firebaseState.roleAccounts || []).length ||
            cleanedWhatsAppTrackingLinks.length !== (firebaseState.whatsAppTrackingLinks || []).length
          );

          if (!isMounted) {
            return;
          }

          const initialLoanApplications = await loadInitialLoanApplications();

          if (!isMounted) {
            return;
          }

          const seedResult = normalizers.mergeMissingSeedCustomers(
            normalizers.hydrateApplications(
              cleanedRestoredApplications,
              loadedVehicleCatalog,
              loadedTagNormalizationRules,
              initialLoanApplications
            ),
            initialLoanApplications
          );
          const loadedRawCustomerLeads = !canViewAllStaff
            ? firebaseRawCustomerLeads
            : firebaseState.operationalDataResetAt
            ? firebaseRawCustomerLeads
            : remoteRawCustomerLeads.length > 0 || rawCustomerSeedLeads.length > 0
            ? normalizers.mergeLocalTakenRawCustomerLeads(firebaseRawCustomerLeads, localState.rawCustomerLeads || [])
            : localState.rawCustomerLeads;
          const rawCustomerLeadsChanged = (
            loadedRawCustomerLeads.length !== remoteRawCustomerLeads.length ||
            !normalizers.areJsonLikeValuesEqual(loadedRawCustomerLeads, firebaseRawCustomerLeads)
          );
          const firebaseCodes = firebaseState.errorCodeDefinitions.length > 0
            ? firebaseState.errorCodeDefinitions
            : INITIAL_ERROR_CODE_DEFINITIONS;
          const hydratedCodes = normalizers.hydrateErrorCodeDefinitions(firebaseCodes);
          const loadedBankDefinitions = normalizers.normalizeBankDefinitions(
            (firebaseState.bankDefinitions || []).length > 0 ? firebaseState.bankDefinitions || [] : DEFAULT_BANK_DEFINITIONS
          );
          const remoteState: DashboardHydrationState = {
            applications: seedResult.applications,
            rawCustomerLeads: loadedRawCustomerLeads,
            errorCodeDefinitions: hydratedCodes.definitions,
            roleAccounts: cleanedRoleAccounts.length > 0
              ? normalizers.hydrateRoleAccounts(cleanedRoleAccounts)
              : removeLegacyDemoAccounts(INITIAL_ROLE_ACCOUNTS),
            rolePermissions: normalizeRolePermissionSettings(firebaseState.rolePermissions || localState.rolePermissions || []),
            roleNavAccess: normalizeRoleNavAccessSettings(
              (firebaseState.roleNavAccess && firebaseState.roleNavAccess.length > 0)
                ? firebaseState.roleNavAccess
                : localState.roleNavAccess || []
            ),
            vehicleCategories: normalizeVehicleCategories(
              (firebaseState.vehicleCategories && firebaseState.vehicleCategories.length > 0)
                ? firebaseState.vehicleCategories
                : localState.vehicleCategories || []
            ),
            vehicleBrandLogos: normalizeVehicleBrandLogos(
              (firebaseState.vehicleBrandLogos && Object.keys(firebaseState.vehicleBrandLogos).length > 0)
                ? firebaseState.vehicleBrandLogos
                : localState.vehicleBrandLogos || {}
            ),
            defaultAvatarLibrary: firebaseState.defaultAvatarLibrary || [],
            whatsAppTrackingLinks: cleanedWhatsAppTrackingLinks,
            whatsAppTrackingClicks: firebaseState.whatsAppTrackingClicks || INITIAL_WHATSAPP_TRACKING_CLICKS,
            whatsAppDefaultMessage: loadedWhatsAppDefaultMessage,
            customerIntakeShortLinks: firebaseState.customerIntakeShortLinks || [],
            customMissions: firebaseState.customMissions || [],
            rewardTeams: firebaseState.rewardTeams || [],
            approvalRequests: firebaseState.approvalRequests || [],
            calendarNotes: firebaseState.calendarNotes || [],
            notifications: normalizers.normalizeNotificationList(firebaseState.notifications || []),
            auditLogs: firebaseState.auditLogs || [],
            vehicleTags: firebaseState.vehicleTags.length > 0 ? firebaseState.vehicleTags : DEFAULT_VEHICLE_TAGS,
            vehicleBrandTags: firebaseState.vehicleBrandTags.length > 0
              ? normalizers.normalizeMotorPriceBrandTags([...firebaseState.vehicleBrandTags, ...DEFAULT_VEHICLE_BRAND_TAGS])
              : DEFAULT_VEHICLE_BRAND_TAGS,
            financeProfiles: loadedFinanceProfiles,
            commissionRules: loadedCommissionRules,
            attendancePolicy: loadedAttendancePolicy,
            channelMarketingSpend: !canViewAllStaff
              ? []
              : firebaseState.channelMarketingSpend !== undefined
              ? firebaseState.channelMarketingSpend
              : localState.channelMarketingSpend,
            vehicleCatalog: loadedVehicleCatalog,
            bankDefinitions: loadedBankDefinitions,
            marketingTagRelationships: loadedMarketingTagRelationships,
            tagNormalizationRules: loadedTagNormalizationRules
          };

          applyDashboardState(remoteState, setters);
          writeLocalDashboardState(remoteState);

          if (canRunRemoteMigrations && (legacyDemoDataRemoved || seedResult.added || hydratedCodes.changed || rawCustomerLeadsChanged || loadedBankDefinitions.length !== (firebaseState.bankDefinitions || []).length)) {
            await saveDashboardStateToRemote(remoteState);
          }

          setSyncStatus('firebase');
          return;
        }

        if (!localLoadResult.hasRawCustomerLeadCache && localState.rawCustomerLeads.length === 0) {
          const seedRawCustomerLeads = await loadNormalizedRawCustomerSeedLeads(normalizers);

          if (!isMounted) {
            return;
          }

          localState = {
            ...localState,
            rawCustomerLeads: seedRawCustomerLeads
          };
          applyDashboardState(localState, setters);
          writeLocalDashboardState(localState);
        }

        if (canRunRemoteMigrations) {
          await saveDashboardStateToRemote(localState);
        }
        setSyncStatus('firebase');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.warn('Dashboard Firebase initialization failed.', error);
        setSyncStatus('error');
      }
    };

    void initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [options.firebaseConfigured, options.publicRoute, options.reloadToken]);
}
