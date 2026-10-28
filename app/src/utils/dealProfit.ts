import type { DealFinance, LoanApplication } from '../types';

const money = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The deal amounts recorded on the delivery checklist (owner meeting
 * 2026-10-13). One source each:
 * - AGM fee, roadtax & insurance fee, free gift, discount: Check full loan (Admin)
 * - insurance amount: Buy insurance (Admin)
 * - JPJ fee: Register with JPJ (Admin)
 * - delivery fee, AGM actually paid: Operations check (Operations Manager)
 * Repair cost is not here: it is the stock unit's repair_cost, inside the stock cost.
 */
export const getDealChecklistAmounts = (application: Pick<LoanApplication, 'delivery_checklist'>) => {
  const steps = application.delivery_checklist?.steps || {};
  const loanCheck = steps.full_loan_check?.data || {};
  return {
    agmFee: money(loanCheck.agm_fee),
    roadtaxInsuranceFee: money(loanCheck.roadtax_insurance_fee),
    freeGift: money(loanCheck.free_gift),
    discount: money(loanCheck.discount),
    insuranceAmount: money(steps.insurance?.data?.premium),
    jpjFee: money(steps.jpj_registration?.data?.fee),
    deliveryFee: money(steps.ops_check?.data?.delivery_fee),
    agmPayout: money(steps.ops_check?.data?.agm_payout)
  };
};

/**
 * The JPJ registration cost of a deal. The stock unit's registration_cost and
 * the JPJ step's fee are the same expense: when the stock unit already carries
 * a registration cost it is inside the stock cost (and the ledger's inventory
 * value), so the JPJ fee is not counted again; otherwise the JPJ fee is the cost.
 */
export const getDealJpjCost = (jpjFee: number, stockRegistrationCost: number) => (
  money(stockRegistrationCost) > 0 ? 0 : money(jpjFee)
);

/**
 * Deal P&L (owner 2026-10-21). The AGM and roadtax & insurance fees are inside
 * the selling price, so they add no revenue; the discount is already off
 * final_selling_price. Costs next to the stock cost and bank charges: the
 * insurance amount, the free gift, the delivery fee, the AGM actually paid and
 * the JPJ fee (see getDealJpjCost).
 */
export const getDealProfit = (
  application: Pick<LoanApplication, 'delivery_checklist'>,
  finance: Pick<DealFinance, 'final_selling_price' | 'other_income' | 'refund_amount' | 'direct_bank_charges' | 'commission_status' | 'commission_amount'>,
  stockCost: number,
  stockRegistrationCost = 0
) => {
  const amounts = getDealChecklistAmounts(application);
  const salesValue = money(finance.final_selling_price) + money(finance.other_income) - money(finance.refund_amount);
  const jpjCost = getDealJpjCost(amounts.jpjFee, stockRegistrationCost);
  const extraCosts = amounts.insuranceAmount + amounts.freeGift + amounts.deliveryFee + amounts.agmPayout + jpjCost;
  const cost = money(stockCost) + extraCosts;
  const grossProfit = salesValue - cost - money(finance.direct_bank_charges);
  const commission = finance.commission_status === 'Reversed' ? 0 : money(finance.commission_amount);
  return {
    ...amounts,
    feesInPrice: round(amounts.agmFee + amounts.roadtaxInsuranceFee),
    jpjCost: round(jpjCost),
    salesValue: round(salesValue),
    extraCosts: round(extraCosts),
    cost: round(cost),
    grossProfit: round(grossProfit),
    commission: round(commission),
    netProfit: round(grossProfit - commission)
  };
};
