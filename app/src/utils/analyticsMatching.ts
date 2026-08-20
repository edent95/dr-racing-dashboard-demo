/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LoanApplication, RawCustomerLead } from '../types';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from './malaysiaPhone';

export interface ApplicationMatchIndex {
  phones: Set<string>;
  identityNumbers: Set<string>;
  accountNumbers: Set<string>;
  emails: Set<string>;
}

const normalizeMatchValue = (value: string) => value.trim().toLowerCase();

const addIfPresent = (set: Set<string>, value: string) => {
  if (value) set.add(value);
};

export function buildApplicationMatchIndex(applications: LoanApplication[]): ApplicationMatchIndex {
  const index: ApplicationMatchIndex = {
    phones: new Set<string>(),
    identityNumbers: new Set<string>(),
    accountNumbers: new Set<string>(),
    emails: new Set<string>()
  };

  applications.forEach((application) => {
    addIfPresent(index.phones, normalizePhoneDigits(application.phone_no || ''));
    addIfPresent(index.identityNumbers, normalizeMatchValue(application.ic_no || ''));
    addIfPresent(index.accountNumbers, normalizeMatchValue(application.personal_info?.account_number || ''));
    addIfPresent(index.emails, normalizeMatchValue(application.personal_info?.email || ''));
  });

  return index;
}

export function hasMatchingApplication(lead: RawCustomerLead, index: ApplicationMatchIndex) {
  const phone = normalizePhoneDigits(lead.phone_no || '');
  const identityNumber = normalizeMatchValue(lead.ic_no || '');
  const accountNumber = normalizeMatchValue(lead.account_number || '');
  const email = normalizeMatchValue(lead.email || '');

  return Boolean(
    (phone && index.phones.has(phone)) ||
    (identityNumber && index.identityNumbers.has(identityNumber)) ||
    (accountNumber && index.accountNumbers.has(accountNumber)) ||
    (email && index.emails.has(email))
  );
}
