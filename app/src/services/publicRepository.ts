/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, serverTimestamp, setDoc, writeBatch, type Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { AuditLogEntry, BankDefinition, CustomerIntakeShortLink, LoanApplication, RoleAccount, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import { ensureFirebaseAuthUser, rotateFirebaseAnonymousAuthUser } from '../lib/auth';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { getCustomerDocumentUploadLimit } from '../utils/documentChecklist';
import { stripUndefinedFirestoreValues } from '../utils/firestorePayload';

const FIREBASE_TIMEOUT_MS = 5000;
const CUSTOMERS_COLLECTION = 'customers';
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const PUBLIC_CONFIG_COLLECTION = 'public_config';
const LOGIN_DIRECTORY_DOCUMENT = 'login_directory';
const PUBLIC_DASHBOARD_DOCUMENT = 'public_dashboard';
const SHORT_LINKS_COLLECTION = 'short_links';
const WA_CLICKS_COLLECTION = 'wa_clicks';
const PUBLIC_INTAKE_GUARDS_COLLECTION = 'public_intake_guards';

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
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`Firebase ${operation} timed out`));
      }, timeoutMs);
    })
  ]);
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
    return { ...context, alreadySubmitted: true };
  }

  const user = await rotateFirebaseAnonymousAuthUser();
  return { db: context.db, user, alreadySubmitted: false };
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
  const context = await getAuthedDb();
  if (!context || context.user.isAnonymous) {
    return [];
  }

  const snapshot = await withFirebaseTimeout(
    getDoc(doc(context.db, PUBLIC_CONFIG_COLLECTION, LOGIN_DIRECTORY_DOCUMENT)),
    'staff login directory load'
  );
  const data = snapshot.exists() ? snapshot.data() as Partial<PublicDashboardConfig> : undefined;
  return Array.isArray(data?.roleAccounts) ? data.roleAccounts : [];
}

export async function saveShortLinkToFirebase(link: CustomerIntakeShortLink) {
  const context = await getAuthedDb();
  if (!context) {
    return;
  }

  await withFirebaseTimeout(
    setDoc(
      doc(context.db, SHORT_LINKS_COLLECTION, link.code.toLowerCase()),
      stripUndefinedFirestoreValues({
        ...link,
        updatedAt: serverTimestamp()
      }) as Record<string, unknown>,
      { merge: true }
    ),
    'short link save'
  );
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

export async function submitPublicIntakeToFirebase(
  application: LoanApplication,
  auditLog: AuditLogEntry | undefined
) {
  const context = await getAvailablePublicIntakeContext(application.id);
  if (!context) {
    return;
  }
  if (context.alreadySubmitted) {
    return;
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
  const storedDocuments = await Promise.all(documentsWithSlots.map(async ({ document, documentSlot }) => {
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

    const storageModule = await import('./applicationDocumentStorage');
    const storagePath = await storageModule.uploadPublicIntakeDocumentToStorage(
      context.user.uid,
      application.id,
      documentSlot,
      document.file_data_url
    );

    if (!storagePath) {
      throw new Error('Public intake document storage is unavailable');
    }

    return {
      ...document,
      file_data_url: '',
      download_url: '',
      storage_path: storagePath
    };
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

  const batch = writeBatch(context.db);
  batch.set(doc(context.db, PUBLIC_INTAKE_GUARDS_COLLECTION, context.user.uid), {
    uid: context.user.uid,
    customer_id: application.id,
    created_at: serverTimestamp()
  });
  batch.set(
    doc(context.db, CUSTOMERS_COLLECTION, application.id),
    stripUndefinedFirestoreValues(storedApplication) as Record<string, unknown>,
    { merge: false }
  );
  await withFirebaseTimeout(batch.commit(), 'public intake save');

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
