/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, getDocFromServer, serverTimestamp, setDoc, writeBatch, type Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { AuditLogEntry, BankDefinition, CustomerIntakeShortLink, LoanApplication, RoleAccount, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import { ensureFirebaseAuthUser, rotateFirebaseAnonymousAuthUser } from '../lib/auth';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { getCustomerDocumentUploadLimit } from '../utils/documentChecklist';
import { stripUndefinedFirestoreValues } from '../utils/firestorePayload';

const FIREBASE_TIMEOUT_MS = 5000;
const STAFF_LOGIN_DIRECTORY_TIMEOUT_MS = 10000;
const CUSTOMERS_COLLECTION = 'customers';
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const PUBLIC_CONFIG_COLLECTION = 'public_config';
const LOGIN_DIRECTORY_DOCUMENT = 'login_directory';
const PUBLIC_DASHBOARD_DOCUMENT = 'public_dashboard';
const SHORT_LINKS_COLLECTION = 'short_links';
const WA_CLICKS_COLLECTION = 'wa_clicks';
const PUBLIC_TRACKING_LINKS_COLLECTION = 'public_tracking_links';
const PUBLIC_INTAKE_GUARDS_COLLECTION = 'public_intake_guards';
// The customer record is saved but some files did not upload; a retry re-sends only the files.
export const PUBLIC_INTAKE_DOCUMENTS_INCOMPLETE_CODE = 'public-intake/documents-incomplete';
// The server refused a permit: this network or this link sent too many applications.
export const PUBLIC_INTAKE_RATE_LIMITED_CODE = 'public-intake/rate-limited';
export const PUBLIC_INTAKE_LINK_INACTIVE_CODE = 'public-intake/link-inactive';
const uploadedPublicIntakeStoragePaths = new Set<string>();

export interface PublicDashboardConfig {
  roleAccounts: RoleAccount[];
  bankDefinitions: BankDefinition[];
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
  whatsAppDefaultMessage?: string;
}

type AuthedFirestore = { db: Firestore; user: User };
type PublicIntakeContext = AuthedFirestore & { alreadySubmitted: boolean };

async function getAuthedDb(): Promise<AuthedFirestore | null> {
  if (!isFirebaseConfigured) {
    return null;
  }

  const db = getFirebaseDb();

  if (!db) {
    return null;
  }

  const user = await ensureFirebaseAuthUser();
  return user ? { db, user } : null;
}

function withFirebaseTimeout<T>(promise: Promise<T>, operation: string, timeoutMs = FIREBASE_TIMEOUT_MS): Promise<T> {
  let timer: number | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = window.setTimeout(() => {
        reject(new Error(`Firebase ${operation} timed out`));
      }, timeoutMs);
    })
  ]).finally(() => window.clearTimeout(timer));
}

async function getAvailablePublicIntakeContext(applicationId: string): Promise<PublicIntakeContext | null> {
  const context = await getAuthedDb();
  if (!context) {
    return null;
  }

  const guardSnapshot = await withFirebaseTimeout(
    getDoc(doc(context.db, PUBLIC_INTAKE_GUARDS_COLLECTION, context.user.uid)),
    'public intake guard load'
  );

  if (!guardSnapshot.exists()) {
    return { ...context, alreadySubmitted: false };
  }

  if (guardSnapshot.data().customer_id === applicationId) {
    if (guardSnapshot.metadata.hasPendingWrites) {
      // An earlier attempt of this same application is still queued locally;
      // report it as unconfirmed rather than as success.
      throw new Error('Firebase public intake save timed out');
    }
    return { ...context, alreadySubmitted: true };
  }

  const user = await rotateFirebaseAnonymousAuthUser();
  return { db: context.db, user, alreadySubmitted: false };
}

async function isPublicIntakeConfirmedByServer(context: AuthedFirestore, applicationId: string) {
  try {
    const snapshot = await withFirebaseTimeout(
      getDocFromServer(doc(context.db, PUBLIC_INTAKE_GUARDS_COLLECTION, context.user.uid)),
      'public intake guard confirm'
    );
    return snapshot.exists()
      && !snapshot.metadata.hasPendingWrites
      && snapshot.data().customer_id === applicationId;
  } catch {
    return false;
  }
}

function normalizePublicDashboardConfig(
  publicData: Partial<PublicDashboardConfig> | undefined
): PublicDashboardConfig {
  return {
    roleAccounts: [],
    bankDefinitions: Array.isArray(publicData?.bankDefinitions) ? publicData.bankDefinitions : [],
    whatsAppTrackingLinks: Array.isArray(publicData?.whatsAppTrackingLinks) ? publicData.whatsAppTrackingLinks : [],
    whatsAppDefaultMessage: typeof publicData?.whatsAppDefaultMessage === 'string' ? publicData.whatsAppDefaultMessage : undefined
  };
}

export async function loadPublicDashboardConfigFromFirebase(): Promise<PublicDashboardConfig | null> {
  const context = await getAuthedDb();
  if (!context) {
    return null;
  }

  const publicSnapshot = await withFirebaseTimeout(
    getDoc(doc(context.db, PUBLIC_CONFIG_COLLECTION, PUBLIC_DASHBOARD_DOCUMENT)),
    'public dashboard config load'
  );

  if (!publicSnapshot.exists()) {
    return null;
  }

  return normalizePublicDashboardConfig(publicSnapshot.data() as Partial<PublicDashboardConfig>);
}

export async function loadStaffLoginDirectoryFromFirebase(): Promise<RoleAccount[]> {
  // Include App Check/session readiness in the budget; a cached Active entry
  // must not stand in for the server's current staff access check.
  return withFirebaseTimeout((async () => {
    const context = await getAuthedDb();
    if (!context || context.user.isAnonymous) return [];
    const snapshot = await getDocFromServer(doc(context.db, PUBLIC_CONFIG_COLLECTION, LOGIN_DIRECTORY_DOCUMENT));
    const data = snapshot.exists() ? snapshot.data() as Partial<PublicDashboardConfig> : undefined;
    return Array.isArray(data?.roleAccounts) ? data.roleAccounts : [];
  })(),
    'staff login directory load',
    STAFF_LOGIN_DIRECTORY_TIMEOUT_MS
  );
}

// Returns the link as stored. A staff session stamps its own Auth uid as
// owner_uid so public intake can tell when the owner is no longer Active.
export async function saveShortLinkToFirebase(link: CustomerIntakeShortLink): Promise<CustomerIntakeShortLink> {
  const context = await getAuthedDb();
  if (!context) {
    if (isFirebaseConfigured) {
      // Customers resolve /s/ codes only from Firestore, so an unsaved link
      // would be dead for them; the caller must not hand it out.
      throw new Error('Short link could not be saved: no Firebase session');
    }
    return link;
  }

  const storedLink: CustomerIntakeShortLink = !link.owner_uid && !context.user.isAnonymous
    ? { ...link, owner_uid: context.user.uid }
    : link;

  await withFirebaseTimeout(
    setDoc(
      doc(context.db, SHORT_LINKS_COLLECTION, storedLink.code.toLowerCase()),
      stripUndefinedFirestoreValues({
        ...storedLink,
        updatedAt: serverTimestamp()
      }) as Record<string, unknown>,
      { merge: true }
    ),
    'short link save'
  );
  return storedLink;
}

// The live short link record behind a /customer-intake?ci_link_code= URL.
// undefined = Firebase is not in use (local mode); null = missing link.
export async function loadShortLinkForPublicIntake(code: string): Promise<CustomerIntakeShortLink | null | undefined> {
  const context = await getAuthedDb();
  if (!context) {
    if (isFirebaseConfigured) {
      throw Object.assign(new Error('Public intake could not get an anonymous Firebase user'), {
        code: 'auth/anonymous-sign-in-failed'
      });
    }
    return undefined;
  }

  const snapshot = await withFirebaseTimeout(
    getDoc(doc(context.db, SHORT_LINKS_COLLECTION, code.toLowerCase())),
    'short link load'
  );
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data() as Partial<CustomerIntakeShortLink> & { updatedAt?: unknown };
  if (typeof data.staff_name !== 'string') {
    return null;
  }
  const { updatedAt: _updatedAt, ...link } = data;
  return link as CustomerIntakeShortLink;
}

export async function resolveShortLinkFromFirebase(code: string): Promise<CustomerIntakeShortLink | null> {
  const context = await getAuthedDb();
  if (!context) {
    return null;
  }

  const snapshot = await withFirebaseTimeout(
    getDoc(doc(context.db, SHORT_LINKS_COLLECTION, code.toLowerCase())),
    'short link load'
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<CustomerIntakeShortLink>;

  if (typeof data.code !== 'string' || typeof data.full_url !== 'string') {
    return null;
  }

  return data as CustomerIntakeShortLink;
}

export type PublicIntakeHandlerAssignment = Pick<LoanApplication, 'handler_name' | 'handler_role' | 'admin_owner_name'>;

function isPermissionDeniedError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error
    && String((error as { code?: unknown }).code).toLowerCase().includes('permission-denied'));
}

// Firestore Rules refuse an anonymous customer create without a permit that
// only server.mjs issues, rate-limited per IP and per short link, so a reset
// anonymous uid does not reset the budget.
async function requestPublicIntakePermit(user: User, shortLinkCode: string) {
  const idToken = await user.getIdToken();
  let response: Response;
  try {
    response = await withFirebaseTimeout(fetch('/api/public-intake/permit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ short_link_code: shortLinkCode })
    }), 'public intake permit');
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      throw error;
    }
    throw Object.assign(new Error('Public intake permit request failed'), { code: 'public-intake/network-request-failed' });
  }
  if (response.ok) {
    return;
  }
  throw Object.assign(new Error(`Public intake permit refused (${response.status})`), {
    code: response.status === 429
      ? PUBLIC_INTAKE_RATE_LIMITED_CODE
      : response.status === 404
        ? PUBLIC_INTAKE_LINK_INACTIVE_CODE
        : response.status === 401 || response.status === 403
          ? 'auth/public-intake-permit-refused'
          : 'public-intake/permit-unavailable'
  });
}

// Saves the application, then uploads its files, and returns it as stored.
// `fallbackAssignment` is the staff-link-queue assignment: when the Rules
// refuse the owner assignment (the link owner is no longer Active), the batch
// wrote nothing, so the same application id is retried once with the fallback
// handler.
export async function submitPublicIntakeToFirebase(
  application: LoanApplication,
  auditLog: AuditLogEntry | undefined,
  fallbackAssignment?: PublicIntakeHandlerAssignment | null
): Promise<LoanApplication> {
  const context = await getAvailablePublicIntakeContext(application.id);
  if (!context) {
    if (isFirebaseConfigured) {
      // Anonymous sign-in failed (provider off, App Check, network). Nothing was
      // saved, so the customer must not see the success screen.
      throw Object.assign(new Error('Public intake could not get an anonymous Firebase user'), {
        code: 'auth/anonymous-sign-in-failed'
      });
    }
    return application;
  }
  const publicDocuments = application.payslip_documents || [];
  if (publicDocuments.length > 8) {
    throw new Error('Public intake document limit exceeded');
  }
  const documentCounts = new Map<string, number>();
  publicDocuments.forEach((document) => {
    const key = document.document_key || '';
    documentCounts.set(key, (documentCounts.get(key) || 0) + 1);
  });
  documentCounts.forEach((count, key) => {
    if (
      !['ic', 'payslip', 'bank_statement', 'vehicle_geran'].includes(key)
      || count > getCustomerDocumentUploadLimit(key as 'ic' | 'payslip' | 'bank_statement' | 'vehicle_geran')
    ) {
      throw new Error('Public intake document limit exceeded');
    }
  });

  const documentOrdinals = new Map<string, number>();
  const documentsWithSlots = publicDocuments.map((document) => {
    const documentKey = document.document_key || '';
    const ordinal = (documentOrdinals.get(documentKey) || 0) + 1;
    documentOrdinals.set(documentKey, ordinal);
    return {
      document,
      documentSlot: ordinal === 1 ? documentKey : `${documentKey}-${ordinal}`
    };
  });
  documentsWithSlots.forEach(({ document }) => {
    if (
      (
        document.document_key !== 'ic'
        && document.document_key !== 'payslip'
        && document.document_key !== 'bank_statement'
        && document.document_key !== 'vehicle_geran'
      )
      || !document.file_data_url
    ) {
      throw new Error('Invalid public intake document');
    }
  });

  // 先把客户资料存进系统，再逐个补传文件：手机网络慢时文件可能传不完，
  // 但客户的基本资料不能因此丢掉。文件路径按 匿名uid + 槽位 预先确定，
  // 客户资料里先写好这些路径，文件传完就对上了。
  const storageModule = documentsWithSlots.length > 0 ? await import('./applicationDocumentStorage') : null;
  const plannedUploads = documentsWithSlots.map(({ document, documentSlot }) => ({
    document,
    documentSlot,
    storagePath: storageModule!.getPublicIntakeDocumentStoragePath(context.user.uid, documentSlot)
  }));
  const storedDocuments = plannedUploads.map(({ document, storagePath }) => ({
    ...document,
    file_data_url: '',
    download_url: '',
    storage_path: storagePath
  }));

  const storedApplication = {
    ...application,
    payslip_documents: storedDocuments,
    document_checklist: (application.document_checklist || []).map((item) => ({
      ...item,
      status: item.key === 'ic'
        ? 'Missing'
        : item.key === 'payslip' && application.purchase_method !== 'Cash'
          ? 'Missing'
          : item.key === 'vehicle_geran' && application.vehicle_condition === 'Used'
            ? 'Missing'
          : 'Not Required'
    })),
    customer_intake_tracking: {
      ...application.customer_intake_tracking,
      submitted_by_uid: context.user.uid
    },
    _sync_version: 1,
    updatedAt: serverTimestamp()
  };

  const commitIntake = (assignment: PublicIntakeHandlerAssignment | null) => {
    const batch = writeBatch(context.db);
    batch.set(doc(context.db, PUBLIC_INTAKE_GUARDS_COLLECTION, context.user.uid), {
      uid: context.user.uid,
      customer_id: application.id,
      created_at: serverTimestamp()
    });
    batch.set(
      doc(context.db, CUSTOMERS_COLLECTION, application.id),
      stripUndefinedFirestoreValues(assignment ? { ...storedApplication, ...assignment } : storedApplication) as Record<string, unknown>,
      { merge: false }
    );
    return withFirebaseTimeout(batch.commit(), 'public intake save');
  };

  const saveCustomerRecord = async (): Promise<LoanApplication> => {
    let savedApplication = application;
    await requestPublicIntakePermit(context.user, application.customer_intake_tracking?.short_link_code || '');
    try {
      await commitIntake(null);
    } catch (error) {
      // A retry can race an earlier attempt that timed out on the client but
      // still reached the server; the guard then already names this id and the
      // create is refused. Only a server-confirmed guard counts as success.
      if (await isPublicIntakeConfirmedByServer(context, application.id)) {
        return application;
      }
      if (!fallbackAssignment || !isPermissionDeniedError(error)) {
        throw error;
      }
      try {
        await commitIntake(fallbackAssignment);
      } catch (fallbackError) {
        if (!(await isPublicIntakeConfirmedByServer(context, application.id))) {
          throw fallbackError;
        }
      }
      savedApplication = { ...application, ...fallbackAssignment };
    }

    if (auditLog?.id) {
      try {
        await withFirebaseTimeout(
          setDoc(
            doc(context.db, AUDIT_LOGS_COLLECTION, auditLog.id),
            stripUndefinedFirestoreValues({
              ...auditLog,
              staff_name: 'Public Intake',
              staff_role: 'Public',
              changes: [],
              updatedAt: serverTimestamp()
            }) as Record<string, unknown>,
            { merge: false }
          ),
          'public intake audit save'
        );
      } catch (error) {
        console.warn('Public intake audit log save failed; customer application was saved.', error);
      }
    }
    return savedApplication;
  };

  // A retry whose guard already names this id skips the save and only sends
  // the files that did not land yet.
  const savedApplication = context.alreadySubmitted ? application : await saveCustomerRecord();

  // Sequential, so on a slow phone connection each file gets the whole uplink.
  // Slots that already landed in this page session are not sent again.
  let failedUploads = 0;
  for (const { document, documentSlot, storagePath } of plannedUploads) {
    if (uploadedPublicIntakeStoragePaths.has(storagePath)) {
      continue;
    }
    try {
      const uploadedPath = await storageModule!.uploadPublicIntakeDocumentToStorage(
        context.user.uid,
        application.id,
        documentSlot,
        document.file_data_url
      );
      if (uploadedPath !== storagePath) {
        throw new Error('Public intake document storage is unavailable');
      }
      uploadedPublicIntakeStoragePaths.add(storagePath);
    } catch (error) {
      console.warn('Public intake document upload failed; the application itself is saved.', error);
      failedUploads += 1;
    }
  }

  if (failedUploads > 0) {
    throw Object.assign(
      new Error(`Public intake saved, but ${failedUploads} document upload(s) did not finish`),
      { code: PUBLIC_INTAKE_DOCUMENTS_INCOMPLETE_CODE, failedUploads }
    );
  }
  return savedApplication;
}

// The authoritative /wa record (public_tracking_links/{id}); null when the link
// was deleted. Returns undefined when Firebase is not in use (local mode).
export async function loadPublicTrackingLinkFromFirebase(linkId: string): Promise<WhatsAppTrackingLink | null | undefined> {
  const context = await getAuthedDb();
  if (!context) {
    if (isFirebaseConfigured) {
      throw new Error('WhatsApp link could not be loaded: no Firebase session');
    }
    return undefined;
  }

  const snapshot = await withFirebaseTimeout(
    getDoc(doc(context.db, PUBLIC_TRACKING_LINKS_COLLECTION, linkId)),
    'WhatsApp tracking link load'
  );
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<WhatsAppTrackingLink>;
  return typeof data.phone_number === 'string'
    ? { ...(data as WhatsAppTrackingLink), id: linkId }
    : null;
}

export async function savePublicWhatsAppClickToFirebase(click: WhatsAppTrackingClick) {
  const context = await getAuthedDb();
  if (!context) {
    return;
  }

  const clickId = `${context.user.uid}-${click.link_id}`;

  await withFirebaseTimeout(
    setDoc(
      doc(context.db, WA_CLICKS_COLLECTION, clickId),
      stripUndefinedFirestoreValues({ ...click, id: clickId, updatedAt: serverTimestamp() }) as Record<string, unknown>,
      { merge: false }
    ),
    'wa click save'
  );
}
