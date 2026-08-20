/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function extractPhoneDigits(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

// Clipboard/export representation requested by staff: digits only, using the
// Malaysian local leading zero instead of the 60 country prefix.
export function formatMalaysiaPhoneForCopy(value: string): string {
  const digits = extractPhoneDigits(value);
  return digits.startsWith('60') ? `0${digits.slice(2)}` : digits;
}

// Canonical storage, matching, tel, and WhatsApp key for Malaysian numbers.
// Existing non-Malaysian/partial values remain digits-only instead of being
// guessed into a Malaysian number.
export function normalizeMalaysiaPhoneDigits(value: string): string {
  const digits = extractPhoneDigits(value);

  if (digits.startsWith('60')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `6${digits}`;
  }

  return digits;
}

// Stable national-number identity key used by duplicate/risk/fingerprint
// matching. Keep this representation for compatibility with saved v1 lead
// import exclusion fingerprints.
export function normalizeMalaysiaPhoneNationalDigits(value: string): string {
  const digits = normalizeMalaysiaPhoneDigits(value);
  return digits.startsWith('60') ? digits.slice(2) : digits.replace(/^0/, '');
}

export function formatMalaysiaPhoneNumber(value: string): string {
  const digits = normalizeMalaysiaPhoneDigits(value).slice(0, 12);

  if (!digits) {
    return '';
  }

  if (!digits.startsWith('60')) {
    return digits;
  }

  const local = digits.slice(2);
  const prefix = local.slice(0, 2);
  const middle = local.slice(2, 5);
  const end = local.slice(5, 9);
  const extra = local.slice(9);

  return `+60 ${[
    prefix,
    middle ? `-${middle}` : '',
    end ? ` ${end}` : '',
    extra ? ` ${extra}` : ''
  ].join('')}`.trim();
}

export function isBasicMalaysiaPhoneNumber(value: string): boolean {
  const digits = normalizeMalaysiaPhoneDigits(value);
  return digits.startsWith('60') && digits.length >= 10 && digits.length <= 12;
}
