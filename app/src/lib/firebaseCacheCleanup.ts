/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const FIRESTORE_CACHE_CLEAR_REQUEST_KEY = 'dr_racing_clear_firestore_cache_on_start';
const OPERATIONAL_DATA_RESET_ACK_KEY = 'dr_racing_acknowledged_operational_data_reset_at';
const OPERATIONAL_DATA_LOCAL_STORAGE_KEYS = [
  'loan_applications_dashboard',
  'raw_customer_leads',
  'dashboard_audit_logs',
  'whatsapp_tracking_clicks',
  'customer_intake_short_links',
  'custom_missions',
  'reward_teams',
  'approval_requests',
  'calendar_notes',
  'dashboard_notifications',
  'channel_marketing_spend',
  'raw_lead_import_exclusions'
];

function deleteIndexedDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase(name);
    const timeoutId = window.setTimeout(() => reject(new Error(`IndexedDB deletion timed out: ${name}`)), 5000);
    request.onsuccess = () => {
      window.clearTimeout(timeoutId);
      resolve();
    };
    request.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(request.error || new Error(`IndexedDB deletion failed: ${name}`));
    };
  });
}

export function requestFirestoreCacheClearOnReload() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(FIRESTORE_CACHE_CLEAR_REQUEST_KEY, String(Date.now()));
  }
}

export function invalidateOperationalDataCacheForResetEpoch(resetEpoch?: string) {
  if (typeof window === 'undefined' || !resetEpoch) {
    return false;
  }

  if (window.localStorage.getItem(OPERATIONAL_DATA_RESET_ACK_KEY) === resetEpoch) {
    return false;
  }

  OPERATIONAL_DATA_LOCAL_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
  window.localStorage.setItem(OPERATIONAL_DATA_RESET_ACK_KEY, resetEpoch);
  requestFirestoreCacheClearOnReload();
  return true;
}

export async function clearRequestedFirestoreCacheBeforeStartup() {
  if (
    typeof window === 'undefined' ||
    !window.indexedDB ||
    !window.localStorage.getItem(FIRESTORE_CACHE_CLEAR_REQUEST_KEY)
  ) {
    return;
  }

  const projectId = String(import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();
  const appName = String(import.meta.env.VITE_FIREBASE_PROJECT_DISPLAY_NAME || 'Dr Racing Dashboard').trim();
  const exactName = projectId ? `firestore/${appName}/${projectId}/main` : '';
  const listedDatabases = typeof window.indexedDB.databases === 'function'
    ? await window.indexedDB.databases()
    : [];
  const candidates = new Set(
    listedDatabases
      .map((database) => database.name || '')
      .filter((name) => name.startsWith('firestore/') && (!projectId || name.includes(`/${projectId}/`)))
  );

  if (exactName) {
    candidates.add(exactName);
  }

  await Promise.all(Array.from(candidates).map(deleteIndexedDatabase));
  window.localStorage.removeItem(FIRESTORE_CACHE_CLEAR_REQUEST_KEY);
}
