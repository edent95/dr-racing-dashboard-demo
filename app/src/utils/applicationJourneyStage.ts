/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Five-stage application Journey position, shared by the responsive Journey
 * rail and the desktop Loan Applications table (which exposes it as row data).
 */

import { getLoanPendingAction, getLoanPendingWith, LoanApplication, LoanStatus } from '../types';

const LOAN_JOURNEY_STAGES = ['sales-submit', 'missing-doc-check', 'admin-loan-submit', 'bank-decision', 'result'] as const;
const CASH_JOURNEY_STAGES = ['cash-submit', 'cash-review', 'cash-accepted', 'cash-delivery', 'cash-complete'] as const;

export interface ApplicationJourneyPosition {
  isCash: boolean;
  currentIndex: number;
  stage: string;
  closed: boolean;
}

export const getApplicationJourneyPosition = (application: LoanApplication): ApplicationJourneyPosition => {
  const pendingWith = getLoanPendingWith(application);
  const pendingAction = getLoanPendingAction(application);
  const isCash = application.purchase_method === 'Cash';
  const dealFinance = application.deal_finance;

  const loanCurrentIndex = pendingWith === 'Closed'
    || pendingAction === 'Choose Close or Resubmit'
    || pendingAction === 'Contact Approved Customer'
    ? 4
    : pendingWith === 'Bank' || application.status === LoanStatus.IN_PROCESS
      ? 3
      : pendingWith === 'Admin' && (pendingAction === 'Submit to Bank' || pendingAction === 'Resubmit to Bank')
        ? 2
        : 1;

  const cashCancelled = dealFinance?.sale_status === 'Cancelled'
    || [LoanStatus.REJECT, LoanStatus.CANCELLED].includes(application.status);
  const cashCompleted = Boolean(dealFinance?.finance_completed_at);
  const cashCustomerAccepted = dealFinance?.sale_status === 'Customer Accepted'
    || (pendingWith === 'Closed' && application.status === LoanStatus.APPROVE);
  const cashCurrentIndex = cashCancelled || cashCompleted || dealFinance?.sale_status === 'Bike Delivered'
    ? 4
    : cashCustomerAccepted
      ? 3
      : application.status === LoanStatus.APPROVE || dealFinance?.sale_status === 'Pending Acceptance'
        ? 2
        : 1;

  const currentIndex = isCash ? cashCurrentIndex : loanCurrentIndex;

  return {
    isCash,
    currentIndex,
    stage: (isCash ? CASH_JOURNEY_STAGES : LOAN_JOURNEY_STAGES)[currentIndex],
    closed: isCash ? cashCompleted || cashCancelled : pendingWith === 'Closed'
  };
};
