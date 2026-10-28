/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RESERVED_HANDLER_NAMES } from '../../shared/staffLinkQueue.mjs';
import { ATTENDANCE_MAIN_TEAM_ID, getAttendanceTeamIdForAccount, type AttendancePolicy, type RoleAccount } from '../types';

// Unclaimed loan applications waiting for Admin review form a pool. By default
// an Admin sees only the pool rows whose handler works in the Admin's own shop
// (attendance team). Super Admin can allow Admins to opt in to every shop's
// pool (Role Access → Loan Applications → customers.crossShopUnclaimedPool);
// each Admin then chooses with ADMIN_CROSS_SHOP_POOL_PREFERENCE_KEY.
// Firestore Rules resolve a handler's shop from the same published
// `staffShopsByName` map, so the client query and the Rules agree.

export const ADMIN_CROSS_SHOP_POOL_NAV_KEY = 'customers.crossShopUnclaimedPool';
export const ADMIN_CROSS_SHOP_POOL_PREFERENCE_KEY = 'dr_racing_admin_cross_shop_pool';
// An Admin also reads and works on every application whose handler is in the
// Admin's own shop (Rules: isAdminSameShopCustomerData), once Super Admin has
// published staffShopsByName.
//
// A Firestore query allows 30 disjunctions; the Admin query spends two on the
// handler / owner clauses, one on the cross-shop pool when it is on, and one per
// same-shop handler name.
export const MAX_SAME_SHOP_POOL_HANDLERS = 27;

export function buildStaffShopsByName(roleAccounts: RoleAccount[], policy: AttendancePolicy): Record<string, string> {
  const shops: Record<string, string> = {};
  roleAccounts.forEach((account) => {
    const name = String(account?.name || '').trim();
    if (name) shops[name] = getAttendanceTeamIdForAccount(policy, account.id);
  });
  return shops;
}

// Extra shops an Admin also works in (RoleAccount.extra_shop_ids, set by Super
// Admin on the User page), published as adminExtraShopsByName beside
// staffShopsByName. Only Admins, only shops that still exist, never the own shop.
export function buildAdminExtraShopsByName(roleAccounts: RoleAccount[], policy: AttendancePolicy): Record<string, string[]> {
  const shopIds = new Set([ATTENDANCE_MAIN_TEAM_ID, ...(policy.teams || []).map((team) => team.id)]);
  const extra: Record<string, string[]> = {};
  roleAccounts.forEach((account) => {
    const name = String(account?.name || '').trim();
    if (!name || account.role !== 'Admin') return;
    const ownShop = getAttendanceTeamIdForAccount(policy, account.id);
    const ids = Array.from(new Set(account.extra_shop_ids || []))
      .filter((id) => shopIds.has(id) && id !== ownShop)
      .sort();
    if (ids.length > 0) extra[name] = ids;
  });
  return extra;
}

export function getStaffShop(shopsByName: Record<string, string> | undefined, staffName: string): string {
  return shopsByName?.[staffName] || 'main';
}

// Every shop this Admin works in: their own plus any extra shops.
export function getAdminShops(
  shopsByName: Record<string, string> | undefined,
  staffName: string,
  extraShopsByName?: Record<string, string[]>
): string[] {
  return [getStaffShop(shopsByName, staffName), ...(extraShopsByName?.[staffName] || [])];
}

// The other staff names in this Admin's shops; the Admin query reads their rows.
export function getSameShopPoolHandlerNames(
  shopsByName: Record<string, string> | undefined,
  staffName: string,
  extraShopsByName?: Record<string, string[]>
): string[] {
  const shops = getAdminShops(shopsByName, staffName, extraShopsByName);
  const names = Object.keys(shopsByName || {})
    .filter((name) => name !== staffName && shops.includes(getStaffShop(shopsByName, name)))
    .sort();
  if (names.length > MAX_SAME_SHOP_POOL_HANDLERS) {
    console.warn(`Same-shop applications: only the first ${MAX_SAME_SHOP_POOL_HANDLERS} of ${names.length} same-shop handlers are queried.`);
  }
  return names.slice(0, MAX_SAME_SHOP_POOL_HANDLERS);
}

// Same rule as isAdminSameShopCustomerData: a handler in one of the Admin's shops, never
// the queue / SEO handlers. False until a shop map exists.
export function isSameShopHandler(
  shopsByName: Record<string, string> | undefined,
  staffName: string,
  handlerName: string,
  extraShopsByName?: Record<string, string[]>
): boolean {
  if (!shopsByName || !handlerName || !staffName || RESERVED_HANDLER_NAMES.includes(handlerName)) return false;
  return getAdminShops(shopsByName, staffName, extraShopsByName).includes(getStaffShop(shopsByName, handlerName));
}

export function readAdminCrossShopPoolPreference(): boolean {
  try {
    return window.localStorage.getItem(ADMIN_CROSS_SHOP_POOL_PREFERENCE_KEY) === 'all';
  } catch {
    return false;
  }
}

export function writeAdminCrossShopPoolPreference(showAllShops: boolean) {
  try {
    window.localStorage.setItem(ADMIN_CROSS_SHOP_POOL_PREFERENCE_KEY, showAllShops ? 'all' : 'own');
  } catch {
    // A preference that cannot be stored falls back to the own-shop pool.
  }
}
