/**
 * Derives the likely birth date encoded by a Malaysian IC (YYMMDD-SS-NNNN).
 * The IC does not carry the century, so the current two-digit year is used as
 * the pivot, matching the dashboard's existing NRIC analytics logic.
 */
export function deriveMalaysiaIcBirthDate(icNumber: string, now = new Date()): string {
  const digits = icNumber.replace(/\D/g, '');
  if (digits.length < 6) {
    return '';
  }

  const yearPart = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  let year = yearPart <= now.getFullYear() % 100 ? 2000 + yearPart : 1900 + yearPart;
  let birthDate = new Date(year, month - 1, day);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return '';
  }

  if (birthDate > now) {
    year -= 100;
    birthDate = new Date(year, month - 1, day);
  }

  return [
    String(birthDate.getFullYear()).padStart(4, '0'),
    String(birthDate.getMonth() + 1).padStart(2, '0'),
    String(birthDate.getDate()).padStart(2, '0')
  ].join('-');
}

export function isBasicMalaysiaIcNumber(icNumber: string, now = new Date()): boolean {
  const digits = icNumber.replace(/\D/g, '');
  return digits.length === 12 && deriveMalaysiaIcBirthDate(digits, now) !== '';
}
