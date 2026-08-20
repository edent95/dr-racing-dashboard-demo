/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { ensureFirebaseAuthUser } from '../lib/auth';
import type { RawLeadImportExclusion } from '../utils/rawLeadImportExclusions';

// Comments + per-row hide flags for the Potential Customer Relationships page.
// Stored in a SEPARATE Firestore doc (not the main dashboard_state doc) so this
// growing text data never counts against that document's 1MB size limit.
export interface RelationshipComment {
  id: string;
  text: string;
  staff_name: string;
  created_at: string;
}

export interface RelationshipClosedFile {
  staff_name: string;
  closed_at: string;
}

export type RelationshipCaseStatus = 'new' | 'investigating' | 'closed' | 'hidden';
export type RelationshipResolution =
  | 'confirmed_duplicate'
  | 'same_customer_multiple_applications'
  | 'family_or_shared_contact'
  | 'data_entry_error'
  | 'legitimate_no_risk';

export interface RelationshipCaseState {
  status: RelationshipCaseStatus;
  assigned_to: string;
  updated_at: string;
  resolution?: RelationshipResolution;
  closed_by?: string;
  closed_at?: string;
}

export interface RelationshipMeta {
  comments: Record<string, RelationshipComment[]>;
  hidden: string[];
  closed: Record<string, RelationshipClosedFile>;
  case_states: Record<string, RelationshipCaseState>;
  raw_lead_import_exclusions: RawLeadImportExclusion[];
}

export interface RelationshipMetaLoadResult {
  meta: RelationshipMeta;
  status: 'remote' | 'missing' | 'local' | 'error';
}

const COLLECTION = 'dashboard_state';
const DOCUMENT = 'dr_racing_relationship_meta';
const LOCAL_EXCLUSIONS_KEY = 'raw_lead_import_exclusions';

export function createEmptyRelationshipMeta(): RelationshipMeta {
  return { comments: {}, hidden: [], closed: {}, case_states: {}, raw_lead_import_exclusions: [] };
}

const normalizeExclusions = (value: unknown): RawLeadImportExclusion[] => {
  if (!Array.isArray(value)) return [];
  const byFingerprint = new Map<string, RawLeadImportExclusion>();
  value.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const item = entry as Record<string, unknown>;
    const fingerprint = String(item.fingerprint || '').trim();
    if (!fingerprint) return;
    byFingerprint.set(fingerprint, {
      fingerprint,
      excluded_at: String(item.excluded_at || ''),
      excluded_by: String(item.excluded_by || '')
    });
  });
  return Array.from(byFingerprint.values());
};

const loadLocalExclusions = () => {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeExclusions(JSON.parse(window.localStorage.getItem(LOCAL_EXCLUSIONS_KEY) || '[]'));
  } catch {
    return [];
  }
};

const saveLocalExclusions = (exclusions: RawLeadImportExclusion[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_EXCLUSIONS_KEY, JSON.stringify(exclusions));
  } catch {
    // Firebase remains the source of truth when browser storage is unavailable.
  }
};

async function getAuthedDb() {
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

function normalizeMeta(data: unknown): RelationshipMeta {
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const rawComments = record.comments && typeof record.comments === 'object'
    ? (record.comments as Record<string, unknown>)
    : {};

  const comments: Record<string, RelationshipComment[]> = {};
  for (const [key, value] of Object.entries(rawComments)) {
    if (!Array.isArray(value)) {
      continue;
    }
    const list = value
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((item) => ({
        id: String(item.id || ''),
        text: String(item.text || ''),
        staff_name: String(item.staff_name || ''),
        created_at: String(item.created_at || '')
      }))
      .filter((item) => item.text.trim().length > 0);
    if (list.length > 0) {
      comments[key] = list;
    }
  }

  const hidden = Array.isArray(record.hidden)
    ? Array.from(new Set(record.hidden.map((value) => String(value)).filter(Boolean)))
    : [];

  const rawClosed = record.closed && typeof record.closed === 'object'
    ? record.closed as Record<string, unknown>
    : {};
  const closed: Record<string, RelationshipClosedFile> = {};
  for (const [key, value] of Object.entries(rawClosed)) {
    if (!value || typeof value !== 'object') continue;
    const item = value as Record<string, unknown>;
    const closedAt = String(item.closed_at || '');
    if (!closedAt) continue;
    closed[key] = {
      staff_name: String(item.staff_name || ''),
      closed_at: closedAt
    };
  }

  const rawCaseStates = record.case_states && typeof record.case_states === 'object'
    ? record.case_states as Record<string, unknown>
    : {};
  const caseStates: Record<string, RelationshipCaseState> = {};
  const validStatuses: RelationshipCaseStatus[] = ['new', 'investigating', 'closed', 'hidden'];
  const validResolutions: RelationshipResolution[] = [
    'confirmed_duplicate',
    'same_customer_multiple_applications',
    'family_or_shared_contact',
    'data_entry_error',
    'legitimate_no_risk'
  ];
  for (const [key, value] of Object.entries(rawCaseStates)) {
    if (!value || typeof value !== 'object') continue;
    const item = value as Record<string, unknown>;
    const status = String(item.status || 'new') as RelationshipCaseStatus;
    if (!validStatuses.includes(status)) continue;
    const resolution = String(item.resolution || '') as RelationshipResolution;
    caseStates[key] = {
      status,
      assigned_to: String(item.assigned_to || ''),
      updated_at: String(item.updated_at || ''),
      ...(validResolutions.includes(resolution) ? { resolution } : {}),
      ...(item.closed_by ? { closed_by: String(item.closed_by) } : {}),
      ...(item.closed_at ? { closed_at: String(item.closed_at) } : {})
    };
  }

  const exclusions = normalizeExclusions(record.raw_lead_import_exclusions);

  return { comments, hidden, closed, case_states: caseStates, raw_lead_import_exclusions: exclusions };
}

export async function loadRelationshipMetaResult(): Promise<RelationshipMetaLoadResult> {
  const localExclusions = loadLocalExclusions();
  const db = await getAuthedDb();
  if (!db) {
    return {
      meta: { ...createEmptyRelationshipMeta(), raw_lead_import_exclusions: localExclusions },
      status: 'local'
    };
  }
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, DOCUMENT));
    if (!snapshot.exists()) {
      return {
        meta: { ...createEmptyRelationshipMeta(), raw_lead_import_exclusions: localExclusions },
        status: 'missing'
      };
    }
    const remoteMeta = normalizeMeta(snapshot.data());
    const exclusions = normalizeExclusions([...remoteMeta.raw_lead_import_exclusions, ...localExclusions]);
    saveLocalExclusions(exclusions);
    return {
      meta: { ...remoteMeta, raw_lead_import_exclusions: exclusions },
      status: 'remote'
    };
  } catch (error) {
    console.warn('Failed to load relationship meta.', error);
    return {
      meta: { ...createEmptyRelationshipMeta(), raw_lead_import_exclusions: localExclusions },
      status: 'error'
    };
  }
}

export async function loadRelationshipMeta(): Promise<RelationshipMeta> {
  return (await loadRelationshipMetaResult()).meta;
}

export async function loadRawLeadImportExclusions(): Promise<RawLeadImportExclusion[]> {
  return (await loadRelationshipMetaResult()).meta.raw_lead_import_exclusions;
}

// Returns true on success. Admin/Super Admin may initialize this document;
// later claimed-staff updates continue to follow the dashboard-state rules.
export async function saveRelationshipMeta(meta: RelationshipMeta): Promise<boolean> {
  const exclusions = normalizeExclusions(meta.raw_lead_import_exclusions);
  saveLocalExclusions(exclusions);
  const db = await getAuthedDb();
  if (!db) {
    return false;
  }
  try {
    await setDoc(
      doc(db, COLLECTION, DOCUMENT),
      { comments: meta.comments, hidden: meta.hidden, closed: meta.closed, case_states: meta.case_states, raw_lead_import_exclusions: exclusions, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Failed to save relationship meta.', error);
    return false;
  }
}
