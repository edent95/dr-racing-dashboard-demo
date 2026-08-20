import type { DealCommissionStatus, LoanApplication } from '../types';

export interface DealCommissionSettlement {
  id: string;
  application: LoanApplication;
  staffName: string;
  amount: number;
  status: DealCommissionStatus;
  periodDate: string;
}

const normalizeCommissionAmount = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
};

const normalizeCommissionStatus = (application: LoanApplication): DealCommissionStatus => {
  const finance = application.deal_finance!;
  const savedStatus = finance.commission_status;

  if (['Estimated', 'Earned', 'Payable', 'Paid', 'Reversed'].includes(savedStatus)) {
    return savedStatus;
  }

  if (finance.sale_status === 'Cancelled') return 'Reversed';
  if (finance.commission_paid_at) return 'Paid';
  if (finance.finance_completed_at) return 'Payable';
  if (finance.sale_status === 'Bike Delivered') return 'Earned';
  return 'Estimated';
};

export const getDealCommissionPeriodDate = (application: LoanApplication) => {
  const finance = application.deal_finance;

  if (!finance) {
    return '';
  }

  // Delivery is the stable earning period. Before delivery (or when a deal is
  // reversed before delivery), use the deal update/submission date so the
  // estimate remains reviewable without treating loan approval as commission.
  return finance.delivery_at || finance.updated_at || application.submitted_at;
};

export const buildDealCommissionSettlements = (
  applications: LoanApplication[],
  staffScope: string[],
  start: Date,
  end: Date
): DealCommissionSettlement[] => applications
  .filter((application) => Boolean(application.deal_finance))
  .filter((application) => staffScope.includes(application.handler_name))
  .map((application) => ({
    id: `deal-commission-${application.id}`,
    application,
    staffName: application.handler_name,
    amount: normalizeCommissionAmount(application.deal_finance?.commission_amount),
    status: normalizeCommissionStatus(application),
    periodDate: getDealCommissionPeriodDate(application)
  }))
  .filter((settlement) => {
    const date = new Date(settlement.periodDate);
    return !Number.isNaN(date.getTime()) && date >= start && date <= end;
  });
