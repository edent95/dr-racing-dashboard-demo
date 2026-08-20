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

