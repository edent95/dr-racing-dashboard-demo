import type { LoanApplication } from '../types';

export type LeadSourceKind = 'website' | 'link' | 'none';

export interface LeadSource {
  kind: LeadSourceKind;
  /** Display name of the channel, e.g. "Facebook"; empty when unknown. */
  channel: string;
}

// Share-link sources are typed freely by staff (see the customer intake link
// form), so common spellings are folded into one display name.
const CHANNEL_NAMES: Record<string, string> = {
  facebook: 'Facebook',
  fb: 'Facebook',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  insta: 'Instagram',
  ig: 'Instagram',
  google: 'Google',
  googleads: 'Google',
  search: 'Google',
  whatsapp: 'WhatsApp',
  wa: 'WhatsApp',
  walkin: 'Walk-in',
  showroom: 'Walk-in',
  shop: 'Walk-in',
  referral: 'Referral',
  recommendation: 'Referral',
  friend: 'Referral',
  mudah: 'Mudah'
};

const formatChannel = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const known = CHANNEL_NAMES[trimmed.toLowerCase().replace(/[\s_-]+/g, '')];
  if (known) return known;
  return trimmed
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Where the customer came from. Only applications submitted through the public
// form carry customer_intake_tracking; rows typed in by staff have none.
export const getApplicationLeadSource = (application: Pick<LoanApplication, 'customer_intake_tracking'>): LeadSource => {
  const tracking = application.customer_intake_tracking;
  if (!tracking) return { kind: 'none', channel: '' };
  if (tracking.submitted_from === 'seo_website' || (tracking.utm_campaign || '').startsWith('seo_')) {
    return { kind: 'website', channel: formatChannel(tracking.utm_source || '') };
  }
  return { kind: 'link', channel: formatChannel(tracking.utm_source || '') };
};
