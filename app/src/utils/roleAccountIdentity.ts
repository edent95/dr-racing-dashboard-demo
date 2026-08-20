import type { RoleAccount } from '../types';

const normalizeRoleAccountEmail = (value?: string) => String(value || '').trim().toLowerCase();

export function resolveRoleAccountProvisioningId(
  accounts: RoleAccount[],
  email: string,
  fallbackId: string
): string {
  const normalizedEmail = normalizeRoleAccountEmail(email);
  const existingAccount = accounts.find((account) => (
    normalizeRoleAccountEmail(account.firebase_auth_email || account.email) === normalizedEmail
    || normalizeRoleAccountEmail(account.email) === normalizedEmail
  ));

  return existingAccount?.id || fallbackId;
}
