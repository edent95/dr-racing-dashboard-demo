/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Keeps a delivered deal's money in the ledger in step with the dashboard's settlement, after the
// delivery invoice exists (ledgerDeliverySync). Server-only: it holds the ledger API key. The dashboard
// is the master, and a posted ledger document never changes, so every change goes in as a difference
// against what this sync already sent (state record `deal_<customer id>`):
//
//   - final selling price changed → a debit note (higher) or a credit note (lower) on the invoice;
//   - deposit + customer cash went up → cash receipts for the differences; dated deposits keep their own day;
//     a deposit that arrives after delivery (deal_finance.customer_deposit_date later than today) is left
//     out until that Malaysia day, so its receipt is dated the day the money came;
//   - bank disbursement went up → a finance-company receipt under the customer (the ledger only lets a
//     receipt reach the customer's invoice when it is in the customer's name).
// A receipt settles the invoice and then the debit notes this sync raised on it, each by what the ledger
// says is still owed on it (GET contacts/<code>/open-items), so after a price increase a full payment
// leaves neither a receivable nor unallocated money.
//
// A deposit taken before the go-live came into the ledger with the opening balances as receipt OB-<ref>.
// It is linked to its deal explicitly (ledgerOpeningDeposits.mjs: record field `openingDeposit`), which
// makes that amount the starting customer baseline, and the sync applies the existing receipt to the
// invoice (POST receipts/<no>/applications) instead of recording the money again as cash. A deal whose
// customer has an unlinked opening receipt, or whose application predates the go-live with a deposit,
// gets no receipts until a person links it (or marks it as having none): outcome `needs_reconciliation`.
//
// Whatever cannot be sent without a person's judgement is reported, not guessed: money that went down
// (a refund) and a credit note larger than what is still owed (a refund note).
//
// Every document goes through ledgerOutbox.mjs: its source key and body are stored in the record before it
// is sent, a lost answer or a restart replays that same document, and the baseline (priceCents,
// customerCents, depositCents, cashCents, bankCents) moves only once the ledger confirmed it. Two syncs of one deal at the same time
// therefore never both send a difference: the second replays the first one's pending document.

import { errorCode, ledgerCall, malaysiaToday, sen } from './ledgerClient.mjs';
import { runLedgerSteps } from './ledgerOutbox.mjs';
import { linkOpeningDepositUpdate, openingDepositRef } from './ledgerOpeningDeposits.mjs';
import { ringgitToSen } from './ledgerDeliverySync.mjs';

export const PRICE_DEBIT_SOURCE_TYPE = 'dr_racing_price_debit';
export const PRICE_CREDIT_SOURCE_TYPE = 'dr_racing_price_credit';
export const RECEIPT_SOURCE_TYPE = 'dr_racing_receipt';
/** Request ids of opening-deposit applications (the ledger keys those by requestId). */
export const OPENING_APPLICATION_PREFIX = 'dr_racing_opening';
/** Receipt numbers the ledger gives deposits imported with the opening balances. */
export const OPENING_RECEIPT_PREFIX = 'OB-';

export const DEFAULT_DEAL_OPTIONS = {
  salesAccountCode: '4010',
  taxCode: 'NT',
  cashAccountCode: '1010',
  bankAccountCode: '1020',
};

const amountSen = (value) => ringgitToSen(value) ?? 0;

/**
 * The day a deposit that arrives after delivery counts from (deal_finance.customer_deposit_date, Malaysia
 * YYYY-MM-DD), or '' when it was already received. Until that day the deposit is not sent.
 */
export function depositWaitsUntil(finance, today) {
  const date = String(finance?.customer_deposit_date || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date > today ? date : '';
}

/**
 * What the settlement says now, in sen. Cash deals never count bank money, as on the Settlement page. A
 * deposit dated after `today` is left out of customerCents (it goes in on its day); fullCustomerCents
 * keeps it, so a deposit already sent is never read as a refund.
 */
export function dealAmounts(customer, today = malaysiaToday()) {
  const finance = customer?.deal_finance || {};
  const deposit = amountSen(finance.customer_deposit_received);
  const cash = amountSen(finance.customer_cash_payment);
  const depositWaits = depositWaitsUntil(finance, today);
  return {
    priceCents: ringgitToSen(finance.final_selling_price),
    depositCents: deposit,
    cashCents: cash,
    depositDate: /^\d{4}-\d{2}-\d{2}$/.test(String(finance.customer_deposit_date || '')) ? finance.customer_deposit_date : '',
    invoiceDate: String(finance.delivery_at || '').slice(0, 10),
    customerCents: (depositWaits ? 0 : deposit) + cash,
    fullCustomerCents: deposit + cash,
    depositWaitsUntil: depositWaits,
    bankCents: customer?.purchase_method === 'Cash' ? 0 : amountSen(finance.bank_disbursement),
    bankName: String(finance.approved_bank_name || '').trim(),
  };
}

// Old aggregate-only records cannot tell us which part of a later increase is a dated deposit.
function customerReceiptBaseline(record) {
  if (Number.isSafeInteger(record.depositCents) && Number.isSafeInteger(record.cashCents)
    && record.depositCents + record.cashCents === Number(record.customerCents || 0)) {
    return { depositCents: record.depositCents, cashCents: record.cashCents };
  }
  const total = Number(record.customerCents || 0);
  if (!total) return { depositCents: 0, cashCents: 0 };
  if (record.openingDeposit?.receiptNo && total === record.openingDeposit.amountCents) return { depositCents: total, cashCents: 0 };
  return null;
}

function customerHistoryProblem(record, now) {
  if (!now.depositDate) return '';
  const baseline = customerReceiptBaseline(record);
  if (!baseline) return now.customerCents > Number(record.customerCents || 0) ? 'customer_receipt_history_unknown' : '';
  if (now.depositCents < baseline.depositCents || now.cashCents < baseline.cashCents) return 'customer_receipt_history_unknown';
  return '';
}

/** Rows for the operator from the settled steps of one deal. */
function stepItems(steps, invoiceDocNo) {
  const items = [];
  for (const step of steps) {
    if (step.status === 'context_failed') {
      items.push({ outcome: 'failed', status: step.httpStatus, reason: step.reason });
    } else if (step.status === 'confirmed') {
      items.push({ outcome: step.op.outcome, docNo: String(step.payload?.[step.op.docNoFrom || 'docNo'] || '') });
    } else if (step.status === 'rejected' && step.op.kind === 'price' && ['exceeds_outstanding', 'exceeds_original'].includes(step.reason)) {
      // More credit than is still owed means money goes back to the customer: a refund note, by a person.
      items.push({ outcome: 'refund_needed', docNo: invoiceDocNo });
    } else {
      // 'unknown' stays pending and is replayed by the next sync with the same key and payload.
      items.push({ outcome: 'failed', status: step.httpStatus, reason: step.reason || 'refused', ...(step.status === 'unknown' ? { pending: true } : {}) });
    }
  }
  return items;
}

/** The deal's documents that take payments, in the order money settles them: the invoice, then its debit notes. */
export function dealDocuments(record, outstanding = {}) {
  const own = [record.invoiceDocNo, ...(Array.isArray(record.debitNoteDocNos) ? record.debitNoteDocNos : [])].filter(Boolean);
  // Owner 2026-10-19: a debit note typed in the ledger for this customer is settled too. The contact
  // DR-<customer id> belongs to this one deal, so its other open documents are this deal's; opening
  // balances (OB-…) from the old system are left for the accountant.
  const others = Object.keys(outstanding)
    .filter((docNo) => !own.includes(docNo) && !docNo.startsWith(OPENING_RECEIPT_PREFIX) && Number(outstanding[docNo]) > 0)
    .sort();
  return [...own, ...others];
}

/** Splits `amount` over the deal's documents by what is still owed on each; what is left stays unallocated. */
export function allocateAcross(amount, documents, outstandingOf) {
  const allocations = [];
  let left = amount;
  for (const docNo of documents) {
    if (left <= 0) break;
    const take = Math.min(left, Math.max(0, outstandingOf(docNo)));
    if (take > 0) {
      allocations.push({ docNo, amountCents: take });
      left -= take;
    }
  }
  return allocations;
}

/**
 * Why a deal's receipts wait for a person, or ''. Only before any customer money was confirmed: once
 * receipts went out, linking an opening deposit could no longer be applied without double counting.
 */
export function openingDepositProblem({ record, customer, ledger, since }) {
  if (record.openingDeposit) return '';
  if (Number(record.customerCents || 0) > 0) return '';
  if (Object.keys(ledger.deposits || {}).some((receiptNo) => receiptNo.startsWith(OPENING_RECEIPT_PREFIX))) return 'opening_deposit_unmapped';
  const submitted = String(customer?.submitted_at || '').slice(0, 10);
  const deposit = ringgitToSen(customer?.deal_finance?.customer_deposit_received);
  if (since && deposit && /^\d{4}-\d{2}-\d{2}$/.test(submitted) && submitted < since) return 'opening_deposit_unmapped';
  return '';
}

/**
 * The next document for one deal from its confirmed record, or null. Pure: ledgerOutbox may call it more
 * than once. `ledger` is { branchCode, outstanding: { docNo: sen }, deposits: { receiptNo: sen } } read
 * just before; `hold` is true while the deal waits for an opening-deposit decision.
 */
export function planDealOperation({ id, now, contactCode, options, today, hold = false }) {
  return (record, seq, refused, ledger) => {
    const invoiceDocNo = record.invoiceDocNo;
    const documents = dealDocuments(record, ledger.outstanding);
    const outstandingOf = (docNo) => Number(ledger.outstanding?.[docNo] || 0);
    // 1. Price: a note for the difference from the last confirmed price.
    if (!refused.has('price') && now.priceCents && Number.isSafeInteger(record.priceCents) && now.priceCents !== record.priceCents) {
      const difference = now.priceCents - record.priceCents;
      const credit = difference < 0;
      const sourceType = credit ? PRICE_CREDIT_SOURCE_TYPE : PRICE_DEBIT_SOURCE_TYPE;
      const sourceId = `${id}:price:${seq}`;
      return {
        id: `${sourceType}|${sourceId}`,
        kind: 'price',
        outcome: credit ? 'credit_note' : 'debit_note',
        method: 'POST',
        path: '/sales-documents',
        body: {
          docType: credit ? 'credit_note' : 'debit_note',
          docDate: today,
          branchCode: ledger.branchCode,
          contactCode,
          originalDocNo: invoiceDocNo,
          notes: 'Selling price changed in the Dr Racing dashboard',
          sourceType,
          sourceId,
          lines: [{ description: 'Selling price adjustment', quantity: 1, unitPriceCents: Math.abs(difference), accountCode: options.salesAccountCode, taxCode: options.taxCode }],
        },
        confirm: { priceCents: now.priceCents },
        ...(credit ? {} : { docNoList: 'debitNoteDocNos' }),
      };
    }
    if (hold || customerHistoryProblem(record, now)) return null;

    // 2. An opening deposit linked to this deal: the existing receipt is applied, one document at a time.
    const opening = record.openingDeposit;
    if (opening?.receiptNo && !refused.has('opening')) {
      const applied = Number(record.openingAppliedCents || 0);
      const left = Math.min(Number(opening.amountCents || 0) - applied, Number(ledger.deposits?.[opening.receiptNo] || 0));
      const docNo = documents.find((candidate) => outstandingOf(candidate) > 0);
      if (left > 0 && docNo) {
        const amountCents = Math.min(left, outstandingOf(docNo));
        const requestId = `${OPENING_APPLICATION_PREFIX}:${id}:${seq}`;
        return {
          id: `deposit_application|${requestId}`,
          kind: 'opening',
          outcome: 'deposit_applied',
          method: 'POST',
          path: `/receipts/${encodeURIComponent(opening.receiptNo)}/applications`,
          body: { docNo, amountCents, date: today, requestId },
          confirm: { openingAppliedCents: applied + amountCents },
          docNoFrom: 'journalEntryNo',
        };
      }
    }

    // A receipt before an invoice/debit note stays a deposit, then settles it on a legal later day.
    for (const receiptNo of record.datedDepositReceiptNos || []) {
      const available = Number(ledger.deposits?.[receiptNo] || 0);
      const docNo = documents.find((no) => outstandingOf(no) > 0 && (ledger.documentDates?.[no] || now.invoiceDate) <= today);
      if (refused.has('dated_deposit') || available <= 0 || !docNo || (ledger.receiptDates?.[receiptNo] || '') > today) continue;
      const requestId = `${id}:dated:${seq}`;
      return {
        id: `deposit_application|${requestId}`, kind: 'dated_deposit', outcome: 'deposit_applied', method: 'POST',
        path: `/receipts/${encodeURIComponent(receiptNo)}/applications`,
        body: { docNo, amountCents: Math.min(available, outstandingOf(docNo)), date: today, requestId },
        docNoFrom: 'journalEntryNo',
      };
    }

    const baseline = customerReceiptBaseline(record);
    const dueDeposit = now.depositWaitsUntil ? 0 : now.depositCents;
    const customerTotal = Number(record.customerCents || 0);
    const customerReceipts = now.depositDate && baseline
      ? [
          { difference: dueDeposit - baseline.depositCents, date: now.depositDate, confirm: { depositCents: dueDeposit, cashCents: baseline.cashCents }, dated: true },
          { difference: now.cashCents - baseline.cashCents, date: today, confirm: { depositCents: baseline.depositCents, cashCents: now.cashCents } },
        ]
      : [{ difference: now.customerCents - customerTotal, date: today, confirm: baseline ? { depositCents: dueDeposit, cashCents: now.cashCents } : {} }];
    const receipts = [
      ...customerReceipts.map((receipt) => ({ ...receipt, kind: 'customer', method: 'cash', account: options.cashAccountCode, reference: 'Customer payment (deposit and cash)', confirm: { ...receipt.confirm, customerCents: customerTotal + receipt.difference } })),
      { kind: 'bank', difference: now.bankCents - Number(record.bankCents || 0), date: today, confirm: { bankCents: now.bankCents }, method: 'finance_company', account: options.bankAccountCode, reference: `${now.bankName || 'Bank'} loan disbursement` },
    ];
    for (const receipt of receipts) {
      if (refused.has(receipt.kind)) continue;
      const difference = receipt.difference;
      if (difference <= 0) continue;
      const eligible = documents.filter((no) => (ledger.documentDates?.[no] || now.invoiceDate) <= receipt.date);
      const allocations = allocateAcross(difference, eligible, outstandingOf);
      const sourceId = `${id}:${receipt.kind}:${seq}`;
      return {
        id: `${RECEIPT_SOURCE_TYPE}|${sourceId}`,
        kind: receipt.kind,
        outcome: 'receipt',
        method: 'POST',
        path: '/receipts',
        body: {
          receiptDate: receipt.date,
          branchCode: ledger.branchCode,
          contactCode,
          method: receipt.method,
          depositAccountCode: receipt.account,
          amountCents: difference,
          reference: receipt.reference,
          ...(allocations.length > 0 ? { allocations } : {}),
          sourceType: RECEIPT_SOURCE_TYPE,
          sourceId,
        },
        confirm: receipt.confirm,
        ...(receipt.dated ? { docNoList: 'datedDepositReceiptNos' } : {}),
        docNoFrom: 'receiptNo',
      };
    }
    return null;
  };
}

/** What the ledger says is owed on each of the contact's documents and left on each of its receipts. */
async function readOpenItems(config, fetchImpl, contactCode) {
  const open = await ledgerCall(config, fetchImpl, 'GET', `/contacts/${encodeURIComponent(contactCode)}/open-items`);
  if (!open.response.ok) return { failed: true, httpStatus: open.response.status, reason: errorCode(open.payload) || 'open_items_unreadable' };
  const outstanding = {};
  const documentDates = {};
  const receiptDates = {};
  for (const row of Array.isArray(open.payload?.documents) ? open.payload.documents : []) {
    if (row?.docNo) {
      outstanding[String(row.docNo)] = sen(row.outstandingCents) ?? 0;
      if (row.docDate) documentDates[String(row.docNo)] = String(row.docDate);
    }
  }
  const deposits = {};
  for (const row of Array.isArray(open.payload?.deposits) ? open.payload.deposits : []) {
    if (row?.receiptNo) {
      deposits[String(row.receiptNo)] = sen(row.availableCents) ?? 0;
      if (row.receiptDate) receiptDates[String(row.receiptNo)] = String(row.receiptDate);
    }
  }
  return { outstanding, deposits, documentDates, receiptDates };
}

/**
 * Sends the differences for one invoiced deal. `invoice` is { docNo, subtotalCents } from the delivery
 * invoice post; `since` is the go-live date (YYYY-MM-DD). Returns rows { outcome, docNo?, reason? } for
 * the operator; never names or amounts.
 */
export async function syncDealToLedger({ id, customer, contactCode, invoice, config, state, since = '', options = DEFAULT_DEAL_OPTIONS, today = malaysiaToday(), fetchImpl = fetch }) {
  const key = `deal_${id}`;
  // The baseline starts at the invoice as the ledger confirmed it.
  const record = await state.update(key, (saved) => {
    if (saved?.invoiceDocNo) return { result: saved };
    const value = {
      ...(saved || {}),
      invoiceDocNo: invoice.docNo,
      priceCents: Number.isSafeInteger(saved?.priceCents) ? saved.priceCents : invoice.subtotalCents,
    };
    return { value, result: value };
  });
  const now = dealAmounts(customer, today);

  // The invoice's branch decides where receipts are booked.
  const document = await ledgerCall(config, fetchImpl, 'GET', `/sales-documents/${encodeURIComponent(record.invoiceDocNo)}`);
  if (!document.response.ok) {
    return [{ outcome: 'failed', status: document.response.status, reason: errorCode(document.payload) || 'invoice_unreadable' }];
  }
  const branchCode = String(document.payload?.branchCode || '');
  const context = async () => {
    const open = await readOpenItems(config, fetchImpl, contactCode);
    return open.failed ? open : { branchCode, ...open };
  };

  // An opening deposit nobody linked yet: no receipts until a person decides.
  const first = await context();
  if (first.failed) return [{ outcome: 'failed', status: first.httpStatus, reason: first.reason }];
  // The opening deposit bo listed for this deal (receipt OB-DRD-<id>) links itself.
  const ownReceipt = `${OPENING_RECEIPT_PREFIX}${openingDepositRef(id)}`;
  const ownAvailable = Number(first.deposits?.[ownReceipt] || 0);
  let linked = record;
  if (!record.openingDeposit && ownAvailable > 0) {
    linked = await state.update(key, (saved) => {
      const update = linkOpeningDepositUpdate(saved, { receiptNo: ownReceipt, amountCents: ownAvailable });
      return update.value ? { value: update.value, result: update.value } : { result: saved || record };
    });
  }
  const problem = linked.pending ? '' : (openingDepositProblem({ record: linked, customer, ledger: first, since }) || customerHistoryProblem(linked, now));
  await state.update(key, (saved) => {
    const current = saved || {};
    if ((current.reconcile || '') === problem) return { result: null };
    const value = { ...current };
    if (problem) value.reconcile = problem;
    else delete value.reconcile;
    return { value, result: null };
  });

  let primed = first;
  const steps = await runLedgerSteps({
    state,
    key,
    plan: planDealOperation({ id, now, contactCode, options, today, hold: Boolean(problem) }),
    context: async () => {
      if (primed) {
        const ready = primed;
        primed = null;
        return ready;
      }
      return context();
    },
    config,
    fetchImpl,
  });
  const items = stepItems(steps, record.invoiceDocNo);
  if (problem && problem !== 'customer_receipt_history_unknown') items.push({ outcome: 'needs_reconciliation', docNo: record.invoiceDocNo, reason: problem });

  // Money that went down against what the ledger confirmed is a refund, for a person.
  const settled = (await state.get(key)) || {};
  if (!settled.pending && customerHistoryProblem(settled, now)) {
    items.push({ outcome: 'failed', reason: 'customer_receipt_history_unknown' });
  }
  // A deposit that comes after delivery and is not in yet waits for its day; the daily run (server.mjs) sends it then.
  if (now.depositWaitsUntil && Number(settled.customerCents || 0) < now.fullCustomerCents) {
    items.push({ outcome: 'deposit_scheduled', docNo: record.invoiceDocNo, reason: now.depositWaitsUntil });
  }
  if (!settled.pending && !problem) {
    for (const kind of ['customer', 'bank']) {
      const total = kind === 'customer' ? now.fullCustomerCents : now.bankCents;
      if (total < Number(settled[`${kind}Cents`] || 0)) items.push({ outcome: 'refund_needed', docNo: record.invoiceDocNo, reason: `${kind}_decreased` });
    }
  }
  return items;
}
