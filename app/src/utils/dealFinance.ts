import type { DealFinance } from '../types';

export const getRecognizedDealStockCost = (
  finance: Pick<DealFinance, 'recognized_stock_cost'>,
  liveStockCost: number,
  catalogCost: number
) => {
  const snapshot = Number(finance.recognized_stock_cost);
  if (Number.isFinite(snapshot) && snapshot > 0) {
    return Math.round(snapshot * 100) / 100;
  }

  const fallback = Number(liveStockCost) || Number(catalogCost) || 0;
  return Math.round(fallback * 100) / 100;
};

// Paid commission or a completed finance record. Cancelling such a deal from
// the loan workflow would blank those fields (and drop it from monthly P&L),
// so only Finance Center may reverse it.
export const isSettledDealFinance = (finance?: Pick<DealFinance, 'commission_status' | 'commission_paid_at' | 'finance_completed_at'> | null) => Boolean(
  finance && (
    finance.commission_status === 'Paid'
    || finance.commission_paid_at
    || finance.finance_completed_at
  )
);

export type DealSettlementStage = 'awaiting-delivery' | 'collecting' | 'ready-to-complete' | 'commission' | 'settled';

export interface DealSettlementSummary {
  stage: DealSettlementStage;
  salesValue: number;
  received: number;
  outstanding: number;
}

// Where a deal stands on the Settlement page: delivery first, then receipts,
// then finance completion, then the Sales commission. Cash deals never count
// bank money, the same as the settlement modal.
export const getDealSettlementSummary = (
  finance: DealFinance,
  purchaseMethod?: string
): DealSettlementSummary => {
  const num = (value: unknown) => Number(value) || 0;
  const salesValue = num(finance.final_selling_price) + num(finance.other_income) - num(finance.refund_amount);
  const bankMoney = purchaseMethod === 'Cash' ? 0 : num(finance.bank_disbursement);
  const received = num(finance.customer_deposit_received) + num(finance.customer_cash_payment) + bankMoney;
  const outstanding = Math.max(Math.round((salesValue - received) * 100) / 100, 0);
  const commissionOpen = !finance.commission_paid_at
    && finance.commission_status !== 'Paid'
    && finance.commission_status !== 'Reversed'
    && num(finance.commission_amount) > 0;

  const stage: DealSettlementStage = finance.sale_status !== 'Bike Delivered'
    ? 'awaiting-delivery'
    : !finance.finance_completed_at
      ? salesValue > 0 && outstanding <= 0 ? 'ready-to-complete' : 'collecting'
      : commissionOpen ? 'commission' : 'settled';

  return { stage, salesValue, received, outstanding };
};
