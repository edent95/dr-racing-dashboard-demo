// Only credential errors should ask staff to check their password.

export type StaffLoginFailureKind = 'credentials' | 'too-many-attempts' | 'disabled' | 'connection' | 'access' | 'service' | 'unknown';

const CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-email'
]);

const CONNECTION_CODES = new Set([
  'auth/network-request-failed',
  'auth/timeout',
  'unavailable',
  'deadline-exceeded'
]);

export const getStaffLoginErrorCode = (error: unknown) => (
  error && typeof error === 'object' && 'code' in error ? String((error as { code?: unknown }).code || '') : ''
);

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error || ''));

export function classifyStaffLoginError(error: unknown): StaffLoginFailureKind {
  const code = getStaffLoginErrorCode(error);
  const message = getErrorMessage(error);

  if (CREDENTIAL_CODES.has(code)) return 'credentials';
  if (code === 'auth/too-many-requests') return 'too-many-attempts';
  if (code === 'auth/user-disabled') return 'disabled';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'access';
  if (code.startsWith('appCheck/') || code === 'auth/internal-error'
    || /app ?check|recaptcha/i.test(message)) return 'service';
  if (
    CONNECTION_CODES.has(code)
    || /timed out|offline|network|failed to fetch/i.test(message)
  ) {
    return 'connection';
  }
  return 'unknown';
}
