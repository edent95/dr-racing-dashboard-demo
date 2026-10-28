/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Links bo deals to the customer deposits that came into the ledger with the opening balances (receipts
// OB-<ref>, taken before the go-live), used by server.mjs (POST /api/admin/ledger/opening-deposits,
// Super Admin). Server-only: it holds the ledger API key.
//
// The link is explicit: a person says which opening receipt belongs to which deal (or that the deal has
// none). It is stored on the deal's sync record (`ledger_sync/deal_<customer id>`):
//   - `openingDeposit: { receiptNo, amountCents }` and the customer baseline `customerCents = amountCents`,
//     so ledgerDealSync applies that receipt to the invoice and only sends customer money above it;
//   - `openingDeposit: { none: true }` for a deal reviewed as having no opening deposit.
// A deal is only linked while none of its customer money has been confirmed in the ledger; afterwards the
// deposit would be counted twice, so the request is refused for a person to sort out.
//
// The ledger only lets a receipt settle a document of the same contact, so the opening receipt must be
// under the deal's contact DR-<customer id>; that is checked here against GET contacts/<code>/open-items.

import { errorCode, ledgerCall, sen } from './ledgerClient.mjs';
import { ringgitToSen } from './ledgerDeliverySync.mjs';

const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const RECEIPT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,63}$/;
export const MAX_OPENING_DEPOSIT_MAPPINGS = 200;

/**
 * Checks the request rows: [{ applicationId, receiptNo, amountCents? }]; an empty receiptNo means "no
 * opening deposit". Returns { mappings, errors } where errors are { index, reason }.
 */
export function normalizeOpeningDepositMappings(rows) {
  const mappings = [];
  const errors = [];
  const seen = new Set();
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_OPENING_DEPOSIT_MAPPINGS) {
    return { mappings, errors: [{ index: -1, reason: 'invalid_mappings' }] };
  }
  rows.forEach((row, index) => {
    const id = typeof row?.applicationId === 'string' ? row.applicationId.trim() : '';
    const receiptNo = typeof row?.receiptNo === 'string' ? row.receiptNo.trim() : '';
    const amount = row?.amountCents;
    if (!ID_PATTERN.test(id)) return errors.push({ index, reason: 'invalid_application_id' });
    if (seen.has(id)) return errors.push({ index, reason: 'duplicate_application_id' });
    if (receiptNo && !RECEIPT_PATTERN.test(receiptNo)) return errors.push({ index, reason: 'invalid_receipt_no' });
    if (amount !== undefined && amount !== null && !(Number.isSafeInteger(amount) && amount > 0)) return errors.push({ index, reason: 'invalid_amount' });
    seen.add(id);
    mappings.push({ id, receiptNo, ...(receiptNo && amount ? { amountCents: amount } : {}) });
  });
  return { mappings, errors };
}

/**
 * Stores each link after checking it against the ledger. `state` is the ledger_sync store
 * ({ get, update }). Returns one row per mapping: { id, outcome, receiptNo?, reason? } with outcome
 * 'linked', 'marked_none', 'unchanged' or 'refused'; never names or amounts.
 */
export async function linkOpeningDeposits({ mappings, state, config, fetchImpl = fetch }) {
  const items = [];
  for (const mapping of mappings) {
    const key = `deal_${mapping.id}`;
    let link = { none: true };
    if (mapping.receiptNo) {
      const contactCode = `DR-${mapping.id}`;
      let open;
      try {
        open = await ledgerCall(config, fetchImpl, 'GET', `/contacts/${encodeURIComponent(contactCode)}/open-items`);
      } catch {
        items.push({ id: mapping.id, outcome: 'refused', reason: 'unreachable' });
        continue;
      }
      if (!open.response.ok) {
        items.push({ id: mapping.id, outcome: 'refused', reason: errorCode(open.payload) || 'open_items_unreadable' });
        continue;
      }
      const deposit = (Array.isArray(open.payload?.deposits) ? open.payload.deposits : []).find((row) => String(row?.receiptNo || '') === mapping.receiptNo);
      const available = sen(deposit?.availableCents) ?? 0;
      if (!deposit || available <= 0) {
        // Not under DR-<id>, already used, or a typo: a person checks the opening balances.
        items.push({ id: mapping.id, outcome: 'refused', receiptNo: mapping.receiptNo, reason: 'deposit_not_found' });
        continue;
      }
      const amountCents = mapping.amountCents ?? available;
      if (amountCents > available) {
        items.push({ id: mapping.id, outcome: 'refused', receiptNo: mapping.receiptNo, reason: 'amount_exceeds_deposit' });
        continue;
      }
      link = { receiptNo: mapping.receiptNo, amountCents };
    }
    const outcome = await state.update(key, (saved) => linkOpeningDepositUpdate(saved, link));
    items.push(outcome === 'already_synced'
      ? { id: mapping.id, outcome: 'refused', ...(link.receiptNo ? { receiptNo: link.receiptNo } : {}), reason: 'already_synced' }
      : { id: mapping.id, outcome, ...(link.receiptNo ? { receiptNo: link.receiptNo } : {}) });
  }
  return items;
}

/**
 * The state change for linking `link` to a deal's sync record (`saved`), as a ledger_sync update:
 * { value?, result } with result 'linked', 'marked_none', 'unchanged' or 'already_synced'. Used by the
 * Super Admin endpoint above and by the automatic link in ledgerDealSync.
 */
export function linkOpeningDepositUpdate(saved, link) {
  const current = saved || {};
  const same = JSON.stringify(current.openingDeposit || null) === JSON.stringify(link);
  if (same) return { result: 'unchanged' };
  // Customer money already confirmed (or on its way): linking now would count the deposit twice.
  if (current.openingDeposit?.receiptNo || Number(current.customerCents || 0) > 0 || Number(current.openingAppliedCents || 0) > 0
    || (current.pending && current.pending.kind !== 'price')) {
    return { result: 'already_synced' };
  }
  const value = { ...current, openingDeposit: link };
  delete value.reconcile;
  if (link.receiptNo) value.customerCents = link.amountCents;
  return { value, result: link.receiptNo ? 'linked' : 'marked_none' };
}

// ---- The opening-deposit list bo hands the accountant (owner 2026-10-19: fill the codes automatically).
// Each deposit taken in bo before the go-live becomes one `customerDeposits` row of the ledger's opening
// import, already under the deal's contact DR-<customer id> and with ref DRD-<customer id>. The ledger
// turns it into receipt OB-DRD-<customer id>, which ledgerDealSync recognises and links by itself.

/** The ref of a deal's opening deposit row; the ledger names the receipt OB-<ref>. */
export const OPENING_DEPOSIT_REF_PREFIX = 'DRD-';
export const openingDepositRef = (id) => `${OPENING_DEPOSIT_REF_PREFIX}${id}`;

const previousDay = (day) => new Date(Date.parse(`${day}T00:00:00Z`) - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/**
 * The opening import rows for the deals whose deposit was taken before `since` (YYYY-MM-DD go-live) and
 * not used up by a delivery before it. `customers` is [{ id, data }]. Pure. Returns
 * { asOf, customerDeposits: [{ contactCode, contactName, ref, date, branchCode, amountCents }], totalCents }.
 * Cancelled or rejected applications are left out: their deposit is a refund for the accountant.
 */
export function buildOpeningDepositExport({ customers, since, branchCode }) {
  const asOf = previousDay(since);
  const customerDeposits = [];
  for (const { id, data } of customers) {
    if (!ID_PATTERN.test(String(id || ''))) continue;
    const finance = data?.deal_finance || {};
    const submitted = String(data?.submitted_at || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(submitted) || submitted >= since) continue;
    if (['CANCELLED', 'REJECT'].includes(String(data?.status || ''))) continue;
    if (finance.sale_status === 'Bike Delivered' && String(finance.delivery_at || '') < since) continue;
    const amount = ringgitToSen(finance.customer_deposit_received);
    if (!amount || amount <= 0) continue;
    const depositDay = String(finance.customer_deposit_date || '');
    customerDeposits.push({
      contactCode: `DR-${id}`,
      contactName: String(data?.applicant_name || '').trim() || `DR-${id}`,
      ref: openingDepositRef(id),
      date: /^\d{4}-\d{2}-\d{2}$/.test(depositDay) && depositDay <= asOf ? depositDay : (submitted <= asOf ? submitted : asOf),
      branchCode,
      amountCents: String(amount),
    });
  }
  customerDeposits.sort((left, right) => left.date.localeCompare(right.date) || left.ref.localeCompare(right.ref));
  const totalCents = customerDeposits.reduce((total, row) => total + Number(row.amountCents), 0);
  return { asOf, customerDeposits, totalCents: String(totalCents) };
}
