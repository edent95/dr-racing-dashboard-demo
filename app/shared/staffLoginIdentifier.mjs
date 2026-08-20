const STAFF_USERNAME_EMAIL_DOMAIN = 'staff.dr-racing.invalid';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{0,38}[a-z0-9])?$/;

export function normalizeStaffLoginIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

export function isStaffUsernameIdentifier(value) {
  const normalized = normalizeStaffLoginIdentifier(value);
  return Boolean(normalized && !normalized.includes('@') && USERNAME_PATTERN.test(normalized));
}

export function resolveStaffAuthEmail(value) {
  const normalized = normalizeStaffLoginIdentifier(value);

  if (!normalized) return '';
  if (normalized.includes('@')) return EMAIL_PATTERN.test(normalized) ? normalized : '';
  return isStaffUsernameIdentifier(normalized)
    ? `${normalized}@${STAFF_USERNAME_EMAIL_DOMAIN}`
    : '';
}

export function isUsernameBackedStaffEmail(value) {
  const normalized = normalizeStaffLoginIdentifier(value);
  return normalized.endsWith(`@${STAFF_USERNAME_EMAIL_DOMAIN}`);
}

export function formatStaffLoginIdentifier(value) {
  const normalized = normalizeStaffLoginIdentifier(value);
  return isUsernameBackedStaffEmail(normalized)
    ? normalized.slice(0, -(`@${STAFF_USERNAME_EMAIL_DOMAIN}`.length))
    : normalized;
}
