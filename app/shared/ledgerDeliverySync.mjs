/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Raises a ledger invoice for every delivered bike (deal_finance.sale_status 'Bike Delivered'),
// used by server.mjs (POST /api/staff/ledger/delivery-invoices). Server-only: it holds the ledger API key.
//
// One invoice per customer record, keyed in the ledger by (sourceType 'dr_racing_delivery', sourceId =
// customer id), so sending the same delivery again returns the first invoice instead of a second one.
// The invoice names only the chassis: the ledger takes the model (item) and the branch from that bike in its
// own stock, so the dashboard never needs the ledger's item codes or branches. The bike must therefore be in
// the ledger's stock first (bought there, or imported with the opening balances); if not, the delivery is
// reported as failed with the ledger's reason and goes out on the next run once it is.
//
// The amount is deal_finance.final_selling_price. Deposits, bank disbursements and other receipts are not
// sent here; they are recorded against this invoice in the ledger.

import { customerToLedgerContact } from './ledgerCustomerSync.mjs';
import { errorCode, ledgerCall, sen } from './ledgerClient.mjs';
import { syncDealToLedger } from './ledgerDealSync.mjs';

export const DELIVERY_SOURCE_TYPE = 'dr_racing_delivery';
/** Deliveries before the ledger's go-live are already in AutoCount. */
export const DEFAULT_DELIVERY_SINCE = '2026-12-01';


/** Ringgit (number or text like "6,500.00") to sen; null when it is not a positive amount. */
export function ringgitToSen(value) {
  const text = String(value ?? '').replace(/[,\sRM]/gi, '');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const sen = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(sen) && sen > 0 ? sen : null;
}

/** Every stock unit in the catalog by id (units live in dashboard_state.vehicleCatalog[].stock_units[]). */
export function stockUnitsById(vehicleCatalog) {
  const units = new Map();
  for (const catalog of Array.isArray(vehicleCatalog) ? vehicleCatalog : []) {
    for (const unit of Array.isArray(catalog?.stock_units) ? catalog.stock_units : []) {
      if (unit?.id) units.set(String(unit.id), unit);
    }
  }
  return units;
}

/**
 * The ledger invoice for one delivered customer, or { skip } with a short reason when it cannot be raised yet.
 * `since` is the first delivery date the ledger reports (YYYY-MM-DD).
 */
export function deliveryToLedgerInvoice(id, customer, stockUnit, since = DEFAULT_DELIVERY_SINCE) {
  const finance = customer?.deal_finance;
  if (finance?.sale_status !== 'Bike Delivered') return { skip: 'not_delivered' };
  const deliveredAt = String(finance.delivery_at || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveredAt)) return { skip: 'no_delivery_date' };
  if (deliveredAt < since) return { skip: 'before_go_live' };
  const priceCents = ringgitToSen(finance.final_selling_price);
  if (!priceCents) return { skip: 'no_price' };
  const chassisNo = String(stockUnit?.chassis_number || '').trim().toUpperCase();
  if (!chassisNo) return { skip: 'no_chassis' };
  const contact = customerToLedgerContact(id, customer);
  if (!contact) return { skip: 'no_customer_name' };
  const model = [customer.vehicle_brand, customer.vehicle_model].map((part) => String(part || '').trim()).filter(Boolean).join(' ');
  const condition = customer.vehicle_condition === 'Used' ? ' (used)' : '';
  return {
    contact,
    invoice: {
      docType: 'invoice',
      docDate: deliveredAt,
      branchCode: '',
      contactCode: contact.code,
      sourceType: DELIVERY_SOURCE_TYPE,
      sourceId: id,
      lines: [{ description: `${model || 'Motorcycle'}${condition}`, quantity: 1, unitPriceCents: priceCents, chassisNo }],
    },
  };
}

/**
 * Invoices each delivery. `deliveries` is an array of { id, data, stockUnit }.
 * Returns counts and one row per delivery that was not simply already invoiced: customer id, outcome and,
 * when posted, the ledger invoice number; never names, ICs or amounts.
 */
// With a `state` store, each invoiced deal then has its settlement sent too (ledgerDealSync: price
// notes and receipts); without one, a price changed since the invoice is only reported.
export async function syncDeliveriesToLedger({ deliveries, config, since = DEFAULT_DELIVERY_SINCE, state = null, dealOptions = null, today = '', fetchImpl = fetch, concurrency = 2 }) {
  const result = { invoiced: 0, alreadyInvoiced: 0, skipped: 0, failed: 0, items: [] };
  const queue = deliveries.slice();
  async function worker() {
    for (;;) {
      const next = queue.shift();
      if (!next) return;
      const mapped = deliveryToLedgerInvoice(next.id, next.data, next.stockUnit, since);
      if (mapped.skip) {
        if (mapped.skip === 'not_delivered' || mapped.skip === 'before_go_live') continue;
        result.skipped += 1;
        result.items.push({ id: next.id, outcome: 'skipped', reason: mapped.skip });
        continue;
      }
      try {
        // The buyer first: the invoice refers to the contact by code.
        const contact = await ledgerCall(config, fetchImpl, 'PUT', `/contacts/${encodeURIComponent(mapped.contact.code)}?merge=1`, mapped.contact.contact);
        if (!contact.response.ok) {
          result.failed += 1;
          result.items.push({ id: next.id, outcome: 'failed', status: contact.response.status, reason: errorCode(contact.payload) || 'contact_rejected' });
          continue;
        }
        const posted = await ledgerCall(config, fetchImpl, 'POST', '/sales-documents', mapped.invoice);
        if ([200, 201].includes(posted.response.status) && (typeof posted.payload?.docNo !== 'string' || !posted.payload.docNo.trim())) {
          result.failed += 1;
          result.items.push({ id: next.id, outcome: 'failed', status: posted.response.status, reason: 'confirmation_unreadable' });
          continue;
        }
        if (state && (posted.response.status === 201 || posted.response.status === 200)) {
          const docNo = String(posted.payload?.docNo || '');
          if (posted.response.status === 201) {
            result.invoiced += 1;
            result.items.push({ id: next.id, outcome: 'invoiced', docNo });
          } else {
            result.alreadyInvoiced += 1;
          }
          const subtotalCents = sen(posted.payload?.subtotalCents) ?? mapped.invoice.lines[0].unitPriceCents;
          const dealItems = await syncDealToLedger({
            id: next.id,
            customer: next.data,
            contactCode: mapped.contact.code,
            invoice: { docNo, subtotalCents },
            config,
            state,
            since,
            ...(dealOptions ? { options: dealOptions } : {}),
            ...(today ? { today } : {}),
            fetchImpl,
          });
          for (const item of dealItems) {
            if (item.outcome === 'failed') result.failed += 1;
            result.items.push({ id: next.id, ...item });
          }
        } else if (posted.response.status === 201) {
          result.invoiced += 1;
          result.items.push({ id: next.id, outcome: 'invoiced', docNo: String(posted.payload?.docNo || '') });
        } else if (posted.response.status === 200) {
          // Already invoiced earlier. A price changed since then needs a credit or debit note in the ledger.
          // Compared before tax: the ledger adds the item's tax code on top of the price.
          const subtotal = Number(posted.payload?.subtotalCents);
          if (Number.isFinite(subtotal) && subtotal !== mapped.invoice.lines[0].unitPriceCents) {
            result.items.push({ id: next.id, outcome: 'price_changed', docNo: String(posted.payload?.docNo || '') });
          }
          result.alreadyInvoiced += 1;
        } else {
          result.failed += 1;
          result.items.push({ id: next.id, outcome: 'failed', status: posted.response.status, reason: errorCode(posted.payload) });
        }
      } catch {
        result.failed += 1;
        result.items.push({ id: next.id, outcome: 'failed', status: 0, reason: 'unreachable' });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return result;
}
