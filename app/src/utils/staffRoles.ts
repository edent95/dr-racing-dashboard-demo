import type { RoleAccountRole } from '../types';

export const OPERATIONS_MANAGER_ROLE: RoleAccountRole = 'Operations Manager';

export function isOperationsManager(role: RoleAccountRole | string | null | undefined): boolean {
  return role === OPERATIONS_MANAGER_ROLE;
}

export function isOperationsLead(role: RoleAccountRole | string | null | undefined): boolean {
  return role === 'Super Admin' || isOperationsManager(role);
}

export function isSystemOwner(role: RoleAccountRole | string | null | undefined): boolean {
  return role === 'Super Admin';
}


/**
 * Owner 2026-10-20: Operations Manager does every Admin and Sales job, on every
 * file (Rules: isOperationsCustomerUpdateAllowed). Use it where an Admin action
 * (bank rows, submit to bank, bank decisions, documents) is unlocked.
 */
export function hasAdminWorkAccess(role: RoleAccountRole | string | null | undefined): boolean {
  return role === 'Admin' || isOperationsLead(role);
}
