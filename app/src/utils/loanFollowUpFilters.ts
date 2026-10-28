import { getLoanPendingAction, LoanApplication, LoanStatus } from '../types';

export const FOLLOW_UP_REJECT_BANK_FILTER = 'FOLLOW_UP_REJECT_BANK';
export const FOLLOW_UP_DOCUMENT_FILTER = 'FOLLOW_UP_DOCUMENT';
/** The Loan Applications cards: In Process & Pending in one card, every follow-up kind in another. */
export const IN_PROCESS_PENDING_FILTER = 'IN_PROCESS_PENDING';
export const FOLLOW_UP_ANY_FILTER = 'FOLLOW_UP_ANY';

const isOpenApplication = (application: LoanApplication) => (
  ![LoanStatus.APPROVE, LoanStatus.REJECT, LoanStatus.CANCELLED].includes(application.status)
);

export const isRejectBankFollowUp = (application: LoanApplication) => {
  if (!isOpenApplication(application) || getLoanPendingAction(application) !== 'Submit to Bank') {
    return false;
  }

  const latestRejectedBank = [...(application.bank_applications || [])]
    .reverse()
    .find((bank) => bank.status === 'Rejected');

  return Boolean(
    latestRejectedBank && (
      !latestRejectedBank.reject_next_step ||
      latestRejectedBank.reject_next_step === 'TRY_ANOTHER_BANK'
    )
  );
};

export const isDocumentFollowUp = (application: LoanApplication) => {
  if (!isOpenApplication(application)) {
    return false;
  }

  const pendingAction = getLoanPendingAction(application);
  const bankApplications = application.bank_applications || [];
  if (pendingAction === 'Resubmit to Bank') {
    return bankApplications.some((bank) => (
      bank.status === 'Rejected' ||
      bank.status === 'Need More Info' ||
      (bank.status === 'Cancelled' && bank.status_reason === 'Superseded after requested documents were provided.')
    ));
  }

  if (pendingAction !== 'Provide Documents') {
    return false;
  }

  const latestBankRequest = [...bankApplications]
    .reverse()
    .find((bank) => bank.status === 'Need More Info' || bank.status === 'Rejected');

  return Boolean(
    latestBankRequest && (
      latestBankRequest.status === 'Need More Info' ||
      !latestBankRequest.reject_next_step ||
      latestBankRequest.reject_next_step === 'REQUEST_DOCUMENTS' ||
      latestBankRequest.reject_next_step === 'CORRECT_INFORMATION'
    )
  );
};

export const isInProcessOrPending = (application: LoanApplication) => (
  application.status === LoanStatus.IN_PROCESS || application.status === LoanStatus.PENDING
);

export const isAnyFollowUp = (application: LoanApplication) => (
  application.status === LoanStatus.FOLLOW_UP || isRejectBankFollowUp(application) || isDocumentFollowUp(application)
);

export const matchesLoanApplicationFilter = (application: LoanApplication, filter: string) => {
  if (filter === 'ALL') return true;
  if (filter === FOLLOW_UP_REJECT_BANK_FILTER) return isRejectBankFollowUp(application);
  if (filter === FOLLOW_UP_DOCUMENT_FILTER) return isDocumentFollowUp(application);
  if (filter === IN_PROCESS_PENDING_FILTER) return isInProcessOrPending(application);
  if (filter === FOLLOW_UP_ANY_FILTER) return isAnyFollowUp(application);
  return application.status === filter;
};
