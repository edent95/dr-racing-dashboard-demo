/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Who owns the dashboard data cached in this browser's localStorage.
 *
 * The cache is only wiped by an explicit Logout. A session that ends any other
 * way (browser closed without "remember me", token revoked after a suspension,
 * expiry) used to leave staff A's customers in localStorage, and hydration
 * applied them for whoever signed in next until the remote load finished. The
 * owner key records whose session wrote the cache, so a different staff member
 * signing in on the same browser gets the cache cleared first.
 *
 * Pure and storage-agnostic so it can be unit tested without a browser.
 */

export const DASHBOARD_CACHE_OWNER_STORAGE_KEY = 'dr_racing_cache_owner';

// Keys that hold rows scoped to the signed-in staff member (customers, leads,
// tasks, audit history, WhatsApp clicks). Presence of any non-empty value here
// means "someone's data is cached". Config-only keys (public config, catalog)
// are rewritten on every load even on the login screen and do not count.
export const STAFF_SCOPED_CACHE_KEYS = [
  'loan_applications_dashboard',
  'raw_customer_leads',
  'dashboard_audit_logs',
  'dashboard_notifications',
  'approval_requests',
  'calendar_notes',
  'custom_missions',
  'whatsapp_tracking_clicks',
  'customer_intake_short_links',
  'channel_marketing_spend',
  'raw_lead_import_exclusions'
] as const;

export type CacheOwnerStaff = {
  name: string;
  role: string;
};

export type CacheOwnerDecision = 'keep' | 'adopt' | 'clear';

type ReadableStorage = Pick<Storage, 'getItem'>;

export const toCacheOwnerKey = (staff: CacheOwnerStaff | null | undefined) => {
  const name = String(staff?.name || '').trim();
  const role = String(staff?.role || '').trim();
  return name && role ? JSON.stringify({ name, role }) : null;
};

const isNonEmptyCachedValue = (raw: string | null) => {
  if (raw === null) return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'null' || trimmed === '[]' || trimmed === '{}' || trimmed === '""') {
    return false;
  }
  return true;
};

export const hasStaffScopedCachedData = (storage: ReadableStorage) => (
  STAFF_SCOPED_CACHE_KEYS.some((key) => isNonEmptyCachedValue(storage.getItem(key)))
);

export const readCacheOwnerKey = (storage: ReadableStorage) => {
  const raw = storage.getItem(DASHBOARD_CACHE_OWNER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CacheOwnerStaff>;
    return toCacheOwnerKey({ name: String(parsed?.name || ''), role: String(parsed?.role || '') });
  } catch {
    // An unreadable owner is treated as "someone else": never trust the data.
    return 'unreadable';
  }
};

/**
 * Decide what to do with the cached dashboard data before `staff` sees it.
 *
 * - `owner`: the recorded cache owner key (`readCacheOwnerKey`), or null.
 * - `fallbackOwner`: who the cache most likely belongs to when no owner was
 *   recorded — the staff session stored in `dr_racing_current_staff` BEFORE
 *   this sign-in overwrote it, and only when that session was not logged out.
 *   This keeps caches written before the owner key existed, and local-mode
 *   sessions seeded straight into localStorage, working for the same person.
 * - `staff`: who is about to see the dashboard (null = nobody identified).
 *
 * Returns `keep` (owner matches), `adopt` (safe; record `staff` as owner) or
 * `clear` (wipe the sensitive cache before anything is applied).
 */
export function decideCacheOwnerAction({
  owner,
  hasCachedData,
  fallbackOwner,
  staff
}: {
  owner: string | null;
  hasCachedData: boolean;
  fallbackOwner: CacheOwnerStaff | null;
  staff: CacheOwnerStaff | null;
}): CacheOwnerDecision {
  const staffKey = toCacheOwnerKey(staff);

  if (!hasCachedData) {
    return staffKey && owner !== staffKey ? 'adopt' : 'keep';
  }

  if (!staffKey) {
    return 'clear';
  }

  if (owner) {
    return owner === staffKey ? 'keep' : 'clear';
  }

  return toCacheOwnerKey(fallbackOwner) === staffKey ? 'adopt' : 'clear';
}
