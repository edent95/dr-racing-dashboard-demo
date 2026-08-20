import type { RawCustomerLead } from '../types';
import { normalizeMalaysiaPhoneNationalDigits as normalizeLeadPhone } from './malaysiaPhone';

export interface RawLeadImportExclusion {
  fingerprint: string;
  excluded_at: string;
  excluded_by: string;
}

const normalizeLeadIdentityPart = (value: string) => value.trim().toLowerCase();

const hashIdentity = (value: string, seed: number) => {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(36).padStart(7, '0');
};

export function createRawLeadImportFingerprint(lead: RawCustomerLead): string {
  const channel = normalizeLeadIdentityPart(lead.channel || '');
  const leadId = normalizeLeadIdentityPart(lead.lead_id || '');
  const identity = leadId
    ? `channel:${channel}|lead:${leadId}`
    : `channel:${channel}|phone:${normalizeLeadPhone(lead.phone_no || lead.whatsapp || '')}|email:${normalizeLeadIdentityPart(lead.email || '')}`;

  return `v1-${hashIdentity(identity, 2166136261)}-${hashIdentity(identity, 2246822507)}`;
}

export function isRawLeadImportExcluded(lead: RawCustomerLead, exclusions: RawLeadImportExclusion[]): boolean {
  const fingerprint = createRawLeadImportFingerprint(lead);
  return exclusions.some((entry) => entry.fingerprint === fingerprint);
}
