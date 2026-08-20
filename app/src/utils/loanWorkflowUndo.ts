import {
  getLoanPendingAction,
  getLoanPendingWith,
  LoanStatus,
  type DealFinance,
  type LoanApplication,
  type ReversibleLoanWorkflowAction,
  type RoleAccountRole
} from '../types';

export type LoanWorkflowUndoBlockReason =
  | 'not_last_action'
  | 'not_authorized'
  | 'financial_activity';

export interface LoanWorkflowUndoAvailability {
  checkpoint: LoanApplication['workflow_undo'];
  allowed: boolean;
  blockedReason?: LoanWorkflowUndoBlockReason;
}

const SELF_SERVICE_ACTIONS = new Set<ReversibleLoanWorkflowAction>([
  'NOTIFY_ADMIN',
  'REQUEST_MISSING_DOCUMENTS',
  'DOCUMENTS_READY'
]);

const TERMINAL_ACTIONS = new Set<ReversibleLoanWorkflowAction>([
  'APPROVE_CASH_PURCHASE',
  'CLOSE_REJECTED',
  'COMPLETE_APPROVED_CONTACT'
]);

const moneyFields: Array<keyof DealFinance> = [
  'customer_deposit_received',
  'customer_cash_payment',
  'bank_disbursement',
  'other_income',
  'refund_amount',
  'direct_bank_charges',
  'recognized_stock_cost'
];

const hasDownstreamFinanceActivity = (finance?: DealFinance) => {
  if (!finance) {
    return false;
  }

  return Boolean(
    finance.stock_unit_id ||
    finance.sale_status === 'Bike Delivered' ||
    finance.sale_status === 'Cancelled' ||
    finance.delivery_at ||
    finance.bank_disbursed_at ||
    finance.finance_completed_at ||
    finance.account_verified_at ||
    finance.account_verified_by ||
    finance.commission_paid_at ||
    !['Estimated', 'Reversed'].includes(finance.commission_status) ||
    moneyFields.some((field) => Number(finance[field] || 0) !== 0)
  );
};

const isCheckpointStillCurrent = (application: LoanApplication) => {
  const checkpoint = application.workflow_undo;
  if (!checkpoint || application.pending_since !== checkpoint.performed_at) {
    return false;
  }

  const pendingWith = getLoanPendingWith(application);
  const pendingAction = getLoanPendingAction(application);

  if (checkpoint.action === 'NOTIFY_ADMIN') {
    return application.status === LoanStatus.NEW && pendingWith === 'Admin' && pendingAction === 'Review Application';
  }

  if (checkpoint.action === 'REQUEST_MISSING_DOCUMENTS') {
    return application.status === LoanStatus.PENDING && pendingWith === 'Handler' && pendingAction === 'Provide Documents';
  }

  if (checkpoint.action === 'DOCUMENTS_READY') {
    return pendingWith === 'Admin' && (
      (application.status === LoanStatus.NEW && pendingAction === 'Review Application') ||
      (application.status === LoanStatus.FOLLOW_UP && ['Submit to Bank', 'Resubmit to Bank'].includes(pendingAction))
    );
  }

  if (checkpoint.action === 'APPROVE_CASH_PURCHASE') {
    return application.status === LoanStatus.APPROVE && pendingWith === 'Handler' && pendingAction === 'Contact Approved Customer';
  }

  if (checkpoint.action === 'CLOSE_REJECTED') {
    return application.status === LoanStatus.REJECT && pendingWith === 'Closed' && pendingAction === 'None';
  }

  return application.status === LoanStatus.APPROVE && pendingWith === 'Closed' && pendingAction === 'None';
};

export const getLoanWorkflowUndoAvailability = (
  application: LoanApplication,
  staffName: string,
  staffRole: RoleAccountRole
): LoanWorkflowUndoAvailability => {
  const checkpoint = application.workflow_undo;
  if (!checkpoint) {
    return { checkpoint, allowed: false };
  }

  if (!isCheckpointStillCurrent(application)) {
    return { checkpoint, allowed: false, blockedReason: 'not_last_action' };
  }

  const isSuperAdmin = staffRole === 'Super Admin';
  const isOriginalActor = checkpoint.actor_name === staffName && checkpoint.actor_role === staffRole;
  if (!isSuperAdmin && !(isOriginalActor && SELF_SERVICE_ACTIONS.has(checkpoint.action))) {
    return { checkpoint, allowed: false, blockedReason: 'not_authorized' };
  }

  if (TERMINAL_ACTIONS.has(checkpoint.action) && hasDownstreamFinanceActivity(application.deal_finance)) {
    return { checkpoint, allowed: false, blockedReason: 'financial_activity' };
  }

  return { checkpoint, allowed: true };
};

export const getLoanWorkflowActionLabel = (action: ReversibleLoanWorkflowAction) => {
  const labels: Record<ReversibleLoanWorkflowAction, string> = {
    NOTIFY_ADMIN: 'Notify Admin',
    REQUEST_MISSING_DOCUMENTS: 'Request Documents',
    APPROVE_CASH_PURCHASE: 'Approve Cash Purchase',
    DOCUMENTS_READY: 'Documents Ready',
    CLOSE_REJECTED: 'Close Rejected File',
    COMPLETE_APPROVED_CONTACT: 'Customer Contacted / Accepted'
  };

  return labels[action];
};
