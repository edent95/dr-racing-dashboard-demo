// Mark Bike Delivered, as plain data (owner decision 2026-10-16: Admin may
// deliver; server.mjs POST /api/staff/deliveries writes it with the Admin SDK).
// This mirrors what the client's handleMarkBikeDeliveredFromTaskInbox +
// saveDealFinanceInternal compute for a delivery; tests/unit/deal-delivery.test.ts
// runs both on the same input and fails if they drift apart.

import { malaysiaDate } from './malaysiaDate.mjs';

export function normalizeMoneyAmount(value) {
  const numericValue = typeof value === 'number'
    ? value
    : Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
}

export function normalizeVehicleNumberPlate(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function getStockUnitLandedCost(unit) {
  return normalizeMoneyAmount(unit?.purchase_cost)
    + normalizeMoneyAmount(unit?.transport_cost)
    + normalizeMoneyAmount(unit?.registration_cost)
    + normalizeMoneyAmount(unit?.accessories_cost)
    + normalizeMoneyAmount(unit?.repair_cost)
    + normalizeMoneyAmount(unit?.other_direct_cost);
}

/**
 * Whether the stock unit can go to this application: not reserved or sold to
 * another one, in the catalog and, when a reservation row exists, not held by
 * another application either.
 */
export function isStockUnitDeliverable(unit, applicationId, reservation) {
  if (!unit) return false;
  if (unit.reserved_application_id && unit.reserved_application_id !== applicationId) return false;
  if (unit.sold_application_id && unit.sold_application_id !== applicationId) return false;
  if (reservation && reservation.status !== 'Available' && reservation.application_id && reservation.application_id !== applicationId) return false;
  return true;
}

/**
 * The price, loan and deposit confirmed on the delivery checklist (step 1, Check
 * full loan). Owner 2026-10-18: Admin / Sales fill these once; the Operations
 * Manager no longer retypes them, so delivery copies them into deal_finance.
 * `confirmed` is false until step 1 is done.
 */
export function getChecklistDealFigures(application) {
  const step = application?.delivery_checklist?.steps?.full_loan_check;
  const data = (step && step.data) || {};
  return {
    confirmed: Boolean(step && step.done_at),
    sellingPrice: normalizeMoneyAmount(data.selling_price),
    loanAmount: application?.purchase_method === 'Cash' ? 0 : normalizeMoneyAmount(data.approved_loan),
    deposit: normalizeMoneyAmount(data.deposit),
    // Already off sellingPrice (owner meeting 2026-10-13); the listed price is price + discount.
    discount: normalizeMoneyAmount(data.discount)
  };
}

/**
 * The deal_finance and vehicle plate a delivery writes.
 * @param {{ application: object, stockUnit: object, actorName: string, nowIso: string }} input
 */
export function buildDeliveredDealFinance({ application, stockUnit, actorName, nowIso }) {
  const previous = application.deal_finance || null;
  // The delivery day in Malaysia, not UTC (owner review 2026-10-19).
  const today = malaysiaDate(nowIso);
  const figures = getChecklistDealFigures(application);
  const useChecklistPrice = figures.confirmed && figures.sellingPrice > 0;
  const listedPrice = useChecklistPrice
    ? figures.sellingPrice + figures.discount
    : previous
      ? normalizeMoneyAmount(previous.listed_selling_price)
      : normalizeMoneyAmount(application.vehicle_options?.[0]?.motor_selling_price);
  const finalSellingPrice = useChecklistPrice ? figures.sellingPrice : previous ? normalizeMoneyAmount(previous.final_selling_price) : listedPrice;
  const bankDisbursement = application.purchase_method === 'Cash' ? 0 : normalizeMoneyAmount(previous?.bank_disbursement);
  const financeCompletedAt = previous?.finance_completed_at || '';
  const commissionPaidAt = previous?.commission_paid_at || '';
  const previousRecognizedCost = previous?.stock_unit_id === stockUnit.id ? normalizeMoneyAmount(previous?.recognized_stock_cost) : 0;
  const commissionPercent = typeof previous?.commission_percent === 'number' && Number.isFinite(previous.commission_percent)
    ? Math.min(Math.max(previous.commission_percent, 0), 100)
    : undefined;
  const commissionAmount = commissionPercent === undefined
    ? normalizeMoneyAmount(previous?.commission_amount)
    : Math.round(finalSellingPrice * commissionPercent) / 100;

  const dealFinance = {
    stock_unit_id: stockUnit.id,
    sale_status: 'Bike Delivered',
    approved_bank_name: previous?.approved_bank_name || '',
    approved_bank_offer_amount: normalizeMoneyAmount(previous?.approved_bank_offer_amount),
    approved_bank_offer_at: previous?.approved_bank_offer_at || '',
    listed_selling_price: listedPrice,
    loan_amount: figures.confirmed ? figures.loanAmount : normalizeMoneyAmount(previous?.loan_amount),
    deposit_amount: figures.confirmed ? figures.deposit : normalizeMoneyAmount(previous?.deposit_amount),
    approved_discount: useChecklistPrice ? figures.discount : normalizeMoneyAmount(previous?.approved_discount),
    final_selling_price: finalSellingPrice,
    customer_deposit_received: normalizeMoneyAmount(previous?.customer_deposit_received),
    ...(previous?.customer_deposit_date ? { customer_deposit_date: previous.customer_deposit_date } : {}),
    customer_cash_payment: normalizeMoneyAmount(previous?.customer_cash_payment),
    bank_disbursement: bankDisbursement,
    other_income: normalizeMoneyAmount(previous?.other_income),
    refund_amount: normalizeMoneyAmount(previous?.refund_amount),
    direct_bank_charges: normalizeMoneyAmount(previous?.direct_bank_charges),
    recognized_stock_cost: previousRecognizedCost > 0 ? previousRecognizedCost : getStockUnitLandedCost(stockUnit),
    delivery_at: previous?.delivery_at || today,
    bank_disbursed_at: bankDisbursement > 0 ? previous?.bank_disbursed_at || today : '',
    finance_completed_at: financeCompletedAt,
    account_verified_at: financeCompletedAt ? nowIso : '',
    account_verified_by: financeCompletedAt ? actorName : '',
    commission_status: commissionPaidAt ? 'Paid' : financeCompletedAt ? 'Payable' : 'Earned',
    commission_amount: normalizeMoneyAmount(commissionAmount),
    commission_paid_at: commissionPaidAt,
    updated_at: nowIso,
    updated_by: actorName
  };
  if (commissionPercent !== undefined) {
    dealFinance.commission_percent = commissionPercent;
  }
  // Tier or manual commission (owner 2026-10-21) survives the delivery; the
  // tier amount itself is filled in by the Operations Manager's next save.
  if (previous?.commission_source === 'tier' || previous?.commission_source === 'manual') {
    dealFinance.commission_source = previous.commission_source;
  }

  return {
    dealFinance,
    vehiclePlate: normalizeVehicleNumberPlate(stockUnit.number_plate) || application.vehicle_plate || ''
  };
}
