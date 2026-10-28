import { LoanStatus, type BankApplication, type BankApplicationStatus, type LoanApplication, type RoleAccountRole } from '../types';
import { isSettledDealFinance } from './dealFinance';

// Kept at this path (it started as the cash-only helper); it now covers Cash
// and Loan withdrawals alike.

const CANCELLABLE_APPLICATION_STATUSES = new Set<LoanStatus>([
  LoanStatus.NEW,
  LoanStatus.PENDING,
  LoanStatus.IN_PROCESS,
  LoanStatus.FOLLOW_UP,
  LoanStatus.APPROVE
]);

// Bank applications that are still waiting on the bank. Approved, Rejected and
// Cancelled are final bank decisions.
const OPEN_BANK_APPLICATION_STATUSES = new Set<BankApplicationStatus>([
  'Draft',
  'Submitted',
  'Pending Review',
  'Need More Info'
]);

export const CUSTOMER_WITHDREW_NEXT_ACTION = 'Customer withdrew; inform the bank';

// A customer may withdraw a Cash or Loan application at any stage before the
// bike is delivered and before the bank has disbursed; a settled deal belongs
// to Finance Center. Mirrors isApplicationCancelTransition in firestore.rules.
export const canCancelApplication = (
  application: Pick<LoanApplication, 'purchase_method' | 'status' | 'deal_finance'>
) => (
  (application.purchase_method === 'Cash' || application.purchase_method === 'Loan')
  && CANCELLABLE_APPLICATION_STATUSES.has(application.status)
  && application.deal_finance?.sale_status !== 'Bike Delivered'
  && !application.deal_finance?.bank_disbursed_at
  && !isSettledDealFinance(application.deal_finance)
);

// firestore.rules checks bank rows by position and stops at six; beyond that
// only Super Admin (unrestricted Rules) can record the withdrawal.
export const MAX_WITHDRAWAL_BANK_ROWS = 6;

// Who may record the withdrawal: Super Admin, Operations Manager, the assigned
// Sales handler, and an Admin whose scope covers the file (handler or Admin
// owner). Mirrors the role wrappers around isApplicationCancelTransition.
export const canStaffCancelApplication = (
  application: Pick<LoanApplication, 'handler_name' | 'admin_owner_name'> & { bank_applications?: BankApplication[] },
  staff: { role: RoleAccountRole; name: string }
) => {
  if (staff.role === 'Super Admin') return true;
  if ((application.bank_applications || []).length > MAX_WITHDRAWAL_BANK_ROWS) return false;
  if (staff.role === 'Operations Manager') return true;
  if (!staff.name) return false;
  if (application.handler_name === staff.name) return staff.role === 'Sales' || staff.role === 'Admin';
  return staff.role === 'Admin' && (application.admin_owner_name || '') === staff.name;
};

// Every bank application still waiting on the bank is closed as Cancelled; an
// Approved offer keeps its bank decision (status and decision date, so approval
// analytics stay true) but the offer is marked Withdrawn.
// Rejected / Cancelled rows are left untouched.
export const withdrawBankApplications = (
  bankApplications: BankApplication[],
  reason: string,
  now: string
): BankApplication[] => bankApplications.map((bank) => {
  const withdrawal = {
    status_reason: reason,
    reason_category: 'Customer Decision',
    next_action: CUSTOMER_WITHDREW_NEXT_ACTION
  };
  if (OPEN_BANK_APPLICATION_STATUSES.has(bank.status)) {
    return { ...bank, ...withdrawal, status: 'Cancelled', decision_at: now };
  }
  if (bank.status === 'Approved' && bank.offer_status !== 'Withdrawn') {
    return { ...bank, ...withdrawal, offer_status: 'Withdrawn' };
  }
  return bank;
});
