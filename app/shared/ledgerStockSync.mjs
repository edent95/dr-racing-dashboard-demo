/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Brings every motorcycle the dashboard puts into stock into the ledger's stock, used by server.mjs
// (POST /api/staff/ledger/stock). Server-only: it holds the ledger API key. The dashboard is the master:
// the ledger learns of a bike from here, so the delivery invoice (ledgerDeliverySync, by chassis) finds it.
//
// Per stock unit:
//   1. the model as a chassis-tracked item (PUT items/DR-M-<catalog id>; needs an accountant key),
//   2. the supplier as a contact (DR-SUP-<name>),
//   3. a purchase bill with one vehicle line at the purchase cost, keyed (dr_racing_stock, <unit id>),
//   4. the unit's other landed costs (transport, registration, accessories, repair, other) as cost lines
//      on that chassis, sent as the difference from what was already sent.
// The ledger never changes a posted document, so the state record (`stock_<unit id>`) keeps what the ledger
// CONFIRMED (`sentCostCents`). A lower cost than that is reported for the accountant (a supplier credit
// note), never guessed. Bills and cost lines go through ledgerOutbox.mjs: the body is stored before it is
// sent, and a lost answer replays that same body, so a bill posted at RM6,000 whose answer was lost and
// whose cost then became RM6,100 is confirmed at RM6,000 and the RM100 follows as a cost line.
//
// Units received before the go-live date are left out: the ledger takes them from the opening balances.

import { errorCode, ledgerCall, malaysiaToday } from './ledgerClient.mjs';
import { runLedgerSteps } from './ledgerOutbox.mjs';
import { ringgitToSen } from './ledgerDeliverySync.mjs';

export const STOCK_SOURCE_TYPE = 'dr_racing_stock';
export const STOCK_COST_SOURCE_TYPE = 'dr_racing_stock_cost';

const EXTRA_COST_FIELDS = ['transport_cost', 'registration_cost', 'accessories_cost', 'repair_cost', 'other_direct_cost'];

const codePart = (value, max) => String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max);

/** The ledger item for a dashboard model: one per catalog entry, so renaming the model keeps its stock. */
export function motorcycleItemCode(catalog) {
  const part = codePart(catalog?.id, 40);
  return part ? `DR-M-${part}` : '';
}

export function supplierContactCode(name) {
  const part = codePart(name, 40);
  return part ? `DR-SUP-${part}` : '';
}

/** Ringgit to sen, where zero or blank is 0 rather than "no amount". */
const costSen = (value) => ringgitToSen(value) ?? 0;

/**
 * What the ledger needs for one stock unit, or { skip } with a short reason. `options` carries the go-live
 * date (`since`), the branch the bike is booked into, and the item's accounts and tax code.
 */
export function stockUnitToLedgerPurchase(unit, catalog, options) {
  const chassisNo = String(unit?.chassis_number || '').trim().toUpperCase();
  if (!chassisNo) return { skip: 'no_chassis' };
  const receivedAt = String(unit.received_at || unit.created_at || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(receivedAt)) return { skip: 'no_received_date' };
  if (receivedAt < options.since) return { skip: 'before_go_live' };
  const purchaseCents = ringgitToSen(unit.purchase_cost);
  if (!purchaseCents) return { skip: 'no_purchase_cost' };
  const supplierName = String(unit.supplier || '').replace(/\s+/g, ' ').trim();
  const supplierCode = supplierContactCode(supplierName);
  if (!supplierCode) return { skip: 'no_supplier' };
  const itemCode = motorcycleItemCode(catalog);
  if (!itemCode) return { skip: 'no_model' };
  const model = [catalog.brand, catalog.model].map((part) => String(part || '').trim()).filter(Boolean).join(' ') || 'Motorcycle';
  const vehicle = { chassisNo };
  const engineNo = String(unit.engine_number || '').trim().toUpperCase();
  if (engineNo) vehicle.engineNo = engineNo;
  const plateNo = String(unit.number_plate || '').replace(/\s+/g, '').toUpperCase();
  if (plateNo) vehicle.plateNo = plateNo;
  return {
    chassisNo,
    item: {
      code: itemCode,
      body: {
        name: model,
        kind: 'goods',
        costing: 'serial',
        incomeAccountCode: options.salesAccountCode,
        inventoryAccountCode: options.inventoryAccountCode,
        cogsAccountCode: options.cogsAccountCode,
        defaultTaxCode: options.taxCode,
      },
    },
    supplier: { code: supplierCode, body: { kind: 'supplier', name: supplierName } },
    bill: {
      docType: 'bill',
      docDate: receivedAt,
      branchCode: options.branchCode,
      contactCode: supplierCode,
      sourceType: STOCK_SOURCE_TYPE,
      sourceId: String(unit.id),
      lines: [{ itemCode, description: model, quantity: 1, unitCostCents: purchaseCents, vehicle }],
    },
    purchaseCents,
    extrasCents: EXTRA_COST_FIELDS.reduce((total, field) => total + costSen(unit[field]), 0),
  };
}

export const DEFAULT_STOCK_OPTIONS = {
  branchCode: 'HQ',
  salesAccountCode: '4010',
  inventoryAccountCode: '1200',
  cogsAccountCode: '5010',
  taxCode: 'NT',
};

/**
 * Sends each unit's purchase and later cost changes. `units` is [{ unit, catalog }]; `state` is
 * { get(key), set(key, value) }. Returns counts and one row per unit that needs telling: unit id,
 * outcome and, when posted, the ledger document numbers; never supplier names or amounts.
 */
export async function syncStockUnitsToLedger({ units, config, state, since, options = DEFAULT_STOCK_OPTIONS, today = malaysiaToday(), fetchImpl = fetch }) {
  const result = { posted: 0, unchanged: 0, skipped: 0, failed: 0, items: [] };
  const fail = (id, response, payload, fallback) => {
    result.failed += 1;
    result.items.push({ id, outcome: 'failed', status: response?.status ?? 0, reason: errorCode(payload) || fallback });
  };
  for (const { unit, catalog } of units) {
    const id = String(unit?.id || '');
    if (!id) continue;
    const mapped = stockUnitToLedgerPurchase(unit, catalog, { ...options, since });
    if (mapped.skip) {
      if (mapped.skip === 'before_go_live') continue;
      result.skipped += 1;
      result.items.push({ id, outcome: 'skipped', reason: mapped.skip });
      continue;
    }
    const key = `stock_${id}`;
    try {
      const saved = (await state.get(key)) || {};
      if (saved.external) {
        result.unchanged += 1;
        continue;
      }
      if (!saved.billDocNo && !saved.pending) {
        // The model and the supplier first (upserts, safe to repeat): the bill refers to both by code.
        const item = await ledgerCall(config, fetchImpl, 'PUT', `/items/${encodeURIComponent(mapped.item.code)}`, mapped.item.body);
        if (!item.response.ok) {
          fail(id, item.response, item.payload, 'item_rejected');
          continue;
        }
        const supplier = await ledgerCall(config, fetchImpl, 'PUT', `/contacts/${encodeURIComponent(mapped.supplier.code)}?merge=1`, mapped.supplier.body);
        if (!supplier.response.ok) {
          fail(id, supplier.response, supplier.payload, 'supplier_rejected');
          continue;
        }
      }
      const landedCents = mapped.purchaseCents + mapped.extrasCents;
      const plan = (record, seq) => {
        if (record.external) return null;
        if (!record.billDocNo) {
          return {
            id: `${STOCK_SOURCE_TYPE}|${id}`,
            kind: 'bill',
            method: 'POST',
            path: '/purchase-documents',
            body: mapped.bill,
            // The confirmed cost is the bill's own amount, never a later edit.
            confirm: { chassisNo: mapped.chassisNo, supplierCode: mapped.supplier.code, sentCostCents: mapped.purchaseCents },
            docNoField: 'billDocNo',
          };
        }
        // Everything above the confirmed cost goes on as a cost line on this chassis, as the difference.
        const difference = landedCents - Number(record.sentCostCents || 0);
        if (difference <= 0) return null;
        const sourceId = `${id}:cost:${seq}`;
        return {
          id: `${STOCK_COST_SOURCE_TYPE}|${sourceId}`,
          kind: 'cost',
          method: 'POST',
          path: '/purchase-documents',
          body: {
            docType: 'bill',
            // The cost is booked when the dashboard recorded it, never before the bike came in.
            docDate: today > mapped.bill.docDate ? today : mapped.bill.docDate,
            branchCode: options.branchCode,
            contactCode: record.supplierCode || mapped.supplier.code,
            sourceType: STOCK_COST_SOURCE_TYPE,
            sourceId,
            lines: [{ addToChassisNo: record.chassisNo || mapped.chassisNo, description: 'Landed cost (transport, registration, accessories, repair)', quantity: 1, unitCostCents: difference }],
          },
          confirm: { sentCostCents: landedCents },
        };
      };
      // Already in the ledger's stock (opening balances or entered there): the ledger owns its costs.
      const onRejected = (record, reason, op) => (op.kind === 'bill' && reason === 'duplicate_vehicle' ? { external: true, chassisNo: mapped.chassisNo } : null);
      const steps = await runLedgerSteps({ state, key, plan, config, fetchImpl, onRejected });
      const docNos = steps.filter((step) => step.status === 'confirmed').map((step) => String(step.payload?.docNo || ''));
      const problem = steps.find((step) => step.status !== 'confirmed');
      if (problem?.status === 'rejected' && problem.op.kind === 'bill' && problem.reason === 'duplicate_vehicle') {
        result.unchanged += 1;
        result.items.push({ id, outcome: 'already_in_ledger' });
        continue;
      }
      if (problem) {
        fail(id, { status: problem.httpStatus }, problem.payload, problem.reason);
        continue;
      }
      const settled = (await state.get(key)) || {};
      if (docNos.length > 0) {
        result.posted += 1;
        result.items.push({ id, outcome: 'posted', docNos });
      } else if (landedCents < Number(settled.sentCostCents || 0)) {
        result.items.push({ id, outcome: 'cost_decreased', docNo: settled.billDocNo });
      } else {
        result.unchanged += 1;
      }
    } catch {
      fail(id, null, null, 'unreachable');
    }
  }
  return result;
}

/** Every unit in the catalog with its model, optionally only the given unit ids. */
export function catalogStockUnits(vehicleCatalog, unitIds) {
  const wanted = Array.isArray(unitIds) && unitIds.length > 0 ? new Set(unitIds.map(String)) : null;
  const units = [];
  for (const catalog of Array.isArray(vehicleCatalog) ? vehicleCatalog : []) {
    for (const unit of Array.isArray(catalog?.stock_units) ? catalog.stock_units : []) {
      if (unit?.id && (!wanted || wanted.has(String(unit.id)))) units.push({ unit, catalog });
    }
  }
  return units;
}

