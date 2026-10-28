// One password rule for every place a staff password is set: self-service
// change, Super Admin reset, and account creation, on both the browser and
// server.mjs. Login does not apply it, so older passwords still sign in.
export const STAFF_PASSWORD_MIN_LENGTH = 8;

// \s also covers the full-width space (U+3000) a Chinese IME can insert.
const WHITESPACE_PATTERN = /\s/;

export function getStaffPasswordProblem(value) {
  const password = String(value || '');

  if (WHITESPACE_PATTERN.test(password)) return 'whitespace';
  if (password.length < STAFF_PASSWORD_MIN_LENGTH) return 'too_short';
  return '';
}
