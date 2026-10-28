/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Pushes dashboard customers (Firestore `customers`, one LoanApplication each) to the
// ledger (accounting + e-Invoice) as contacts, used by server.mjs
// (POST /api/admin/ledger/sync-customers). Server-only: it holds the ledger API key.
//
// The ledger upserts by contact code (`DR-<customer id>`) in merge mode, so re-running
// is safe and never wipes details an accountant completed in the ledger (a full address
// with a state code for e-Invoice, an email, a TIN).
//
// Configuration (all three or nothing; without them the sync is switched off):
//   LEDGER_API_URL    e.g. https://ledger.example.com
//   LEDGER_TENANT_ID  the ledger company id for Dr Racing
//   LEDGER_API_KEY    a ledger service key (lk_...), role staff; a secret

/** LHDN e-Invoice state codes (https://sdk.myinvois.hasil.gov.my/codes/state-codes/). */
const STATE_CODES = [
  ['01', ['johor', 'johore']],
  ['02', ['kedah']],
  ['03', ['kelantan']],
  ['04', ['melaka', 'malacca']],
  ['05', ['negeri sembilan', 'n. sembilan', 'n sembilan']],
  ['06', ['pahang']],
  ['07', ['pulau pinang', 'p. pinang', 'p pinang', 'penang', 'pinang']],
  ['08', ['perak']],
  ['09', ['perlis']],
  ['10', ['selangor']],
  ['11', ['terengganu', 'trengganu']],
  ['12', ['sabah']],
  ['13', ['sarawak']],
  ['14', ['wilayah persekutuan kuala lumpur', 'w.p. kuala lumpur', 'kuala lumpur', 'k. lumpur']],
  ['15', ['labuan']],
  ['16', ['putrajaya']],
];

/**
 * State by postcode prefix when the address names no state (Pos Malaysia ranges, first two digits).
 * Approximate at a few borders, so a state written in the address always wins.
 */
function stateFromPostcode(postcode) {
  const prefix = Number(postcode.slice(0, 2));
  if (prefix >= 1 && prefix <= 2) return '09';
  if (prefix >= 5 && prefix <= 9) return '02';
  if (prefix >= 10 && prefix <= 14) return '07';
  if (prefix >= 15 && prefix <= 18) return '03';
  if (prefix >= 20 && prefix <= 24) return '11';
  if ((prefix >= 25 && prefix <= 28) || prefix === 39 || prefix === 49 || prefix === 69) return '06';
  if (prefix >= 30 && prefix <= 36) return '08';
  if ((prefix >= 40 && prefix <= 48) || prefix === 63 || prefix === 64 || prefix === 68) return '10';
  if (prefix >= 50 && prefix <= 60) return '14';
  if (prefix === 62) return '16';
  if (prefix >= 70 && prefix <= 73) return '05';
  if (prefix >= 75 && prefix <= 78) return '04';
  if (prefix >= 79 && prefix <= 86) return '01';
  if (prefix === 87) return '15';
  if (prefix >= 88 && prefix <= 91) return '12';
  if (prefix >= 93 && prefix <= 98) return '13';
  return undefined;
}

/**
 * Splits a one-line Malaysian address ("12, Jalan Besar, 14100 Simpang Ampat, Pulau Pinang")
 * into the ledger's { line1, line2, line3, postcode, city, stateCode, countryCode }.
 * Anything it cannot find is left out; the ledger then shows the contact as missing that part.
 */
export function parseMalaysianAddress(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return {};
  let rest = raw.replace(/[,\s]*(malaysia)\.?$/i, '').trim();

  // A state counts only as its own comma-separated part ("..., Pulau Pinang"), so a street
  // such as "Jalan Perak" or "Taman Johor" is never read as the state.
  let stateCode;
  let stateName;
  const lastComma = rest.lastIndexOf(',');
  const lastPart = rest.slice(lastComma + 1).trim().replace(/\.$/, '').toLowerCase();
  if (lastComma >= 0) {
    for (const [code, names] of STATE_CODES) {
      if (names.includes(lastPart)) {
        stateCode = code;
        stateName = rest.slice(lastComma + 1).trim().replace(/\.$/, '');
        rest = rest.slice(0, lastComma).replace(/[\s,]+$/, '');
        break;
      }
    }
  }

  let postcode;
  let city;
  // The postcode is a five-digit number in one of the last two parts ("..., 14000 Bukit Mertajam,
  // Pulau Pinang"); a lot or house number earlier in the address is not one.
  const pieces = rest.split(',');
  const tailStart = pieces.length > 2 ? rest.length - pieces.slice(-2).join(',').length : 0;
  const tailMatch = /(^|[\s,])(\d{5})(?=[\s,]|$)(?!.*(^|[\s,])\d{5}([\s,]|$))/.exec(rest.slice(tailStart));
  const postcodeMatch = tailMatch ? { 0: tailMatch[0], 2: tailMatch[2], index: tailMatch.index + tailStart } : null;
  let street = rest;
  if (postcodeMatch) {
    postcode = postcodeMatch[2];
    const after = rest.slice(postcodeMatch.index + postcodeMatch[0].length).replace(/^[\s,]+/, '');
    const cityText = after.split(',')[0]?.trim();
    if (cityText) city = cityText;
    street = rest.slice(0, postcodeMatch.index).replace(/[\s,]+$/, '');
    // Text after the city (before the state) would otherwise be lost: keep it with the street.
    const afterCity = after.split(',').slice(1).join(',').trim();
    if (afterCity) street = `${street}, ${afterCity}`;
    if (!stateCode) stateCode = stateFromPostcode(postcode);
  }
  // In the federal territories the territory is also the city ("50450, Kuala Lumpur").
  if (!city && stateName && ['14', '15', '16'].includes(stateCode)) city = stateName;

  const parts = street.split(',').map((part) => part.trim()).filter(Boolean);
  const lines = parts.length <= 3 ? parts : [parts[0], parts[1], parts.slice(2).join(', ')];
  const address = { countryCode: 'MYS' };
  if (lines[0]) address.line1 = lines[0].slice(0, 150);
  if (lines[1]) address.line2 = lines[1].slice(0, 150);
  if (lines[2]) address.line3 = lines[2].slice(0, 150);
  if (city) address.city = city.slice(0, 50);
  if (postcode) address.postcode = postcode;
  if (stateCode) address.stateCode = stateCode;
  return address;
}

/** Canonical Malaysian phone digits (60...), the same rule as src/utils/malaysiaPhone.ts. */
function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('60')) return digits;
  if (digits.startsWith('0')) return `6${digits}`;
  return digits;
}

/** The ledger contact for one dashboard customer, or null when there is nothing to send. */
export function customerToLedgerContact(id, customer) {
  const name = String(customer?.applicant_name || '').replace(/\s+/g, ' ').trim();
  if (!id || !name) return null;
  const contact = { kind: 'customer', name };
  // Only a Malaysian IC is certain. Anything else (passport, foreign ID) is left for the accountant
  // to enter with the right type, rather than guessed.
  const identity = String(customer.ic_no || '').replace(/[\s-]/g, '');
  if (/^\d{12}$/.test(identity)) {
    contact.idType = 'NRIC';
    contact.idNumber = identity;
  }
  const phone = normalizePhone(customer.phone_no);
  if (phone) contact.phone = phone;
  const email = String(customer.personal_info?.email || '').trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) contact.email = email;
  // e-Invoice wants where the buyer lives: the residential address when given, else the IC address.
  const address = parseMalaysianAddress(customer.personal_info?.resident_address || customer.personal_info?.full_address);
  if (address.line1) contact.address = address;
  return { code: `DR-${id}`, contact };
}

export function readLedgerConfig(env = process.env) {
  const rawUrl = String(env.LEDGER_API_URL || '').trim();
  const tenantId = String(env.LEDGER_TENANT_ID || '').trim();
  const apiKey = String(env.LEDGER_API_KEY || '').trim();
  if (!rawUrl || !/^[0-9a-f-]{36}$/i.test(tenantId) || !apiKey) return null;
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  // https only (plain http just for a ledger on this machine), no credentials, query or fragment.
  const local = url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  if ((url.protocol !== 'https:' && !local) || url.username || url.password || url.search || url.hash) return null;
  return { baseUrl: `${url.origin}${url.pathname.replace(/\/+$/, '')}`, tenantId, apiKey };
}

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Upserts every customer into the ledger. `customers` is an array of { id, data }.
 * Returns counts and, for failures, only the customer id and HTTP status (never personal data).
 */
export async function syncCustomersToLedger({ customers, config, fetchImpl = fetch, concurrency = 4 }) {
  const result = { synced: 0, skipped: 0, failed: 0, failures: [] };
  const queue = customers.slice();
  async function worker() {
    for (;;) {
      const next = queue.shift();
      if (!next) return;
      const mapped = customerToLedgerContact(next.id, next.data);
      if (!mapped) {
        result.skipped += 1;
        continue;
      }
      try {
        const response = await fetchImpl(
          `${config.baseUrl}/api/tenants/${encodeURIComponent(config.tenantId)}/contacts/${encodeURIComponent(mapped.code)}?merge=1`,
          {
            method: 'PUT',
            headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json' },
            body: JSON.stringify(mapped.contact),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          },
        );
        if (response.ok) {
          result.synced += 1;
        } else {
          result.failed += 1;
          // Only a short error code is kept: a message could echo personal data or headers.
          let code = '';
          try {
            const error = String((await response.json())?.error || '');
            if (/^[a-z_]{1,40}$/.test(error)) code = error;
          } catch {
            // body was not JSON
          }
          result.failures.push({ id: next.id, status: response.status, error: code });
        }
      } catch {
        result.failed += 1;
        result.failures.push({ id: next.id, status: 0, error: 'unreachable' });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return result;
}
