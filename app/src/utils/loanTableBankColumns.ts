/**
 * Which finance companies get a column in the desktop Loan Applications table.
 * Bank Database decides: each bank has a "Show in table" switch
 * (`show_in_loan_table`); a bank that was never switched follows its Active
 * flag. A bank that appears in applications but is not in Bank Database yet
 * still gets a column, so no result disappears before someone adds it.
 */
import { getLoanPendingAction, LoanStatus, type BankDefinition, type LoanApplication, type RoleAccountRole } from '../types';
import { hasAdminWorkAccess } from './staffRoles';

export interface LoanTableBankColumn {
  /** Normalized name, used for test ids and matching. */
  key: string;
  label: string;
  /** False for a bank seen on applications that Bank Database does not have yet. */
  inBankDatabase: boolean;
}

export const normalizeBankColumnKey = (bankName: string) => bankName.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** "AEON" on an application belongs to the "AEON Credit" column and the reverse. */
export const bankMatchesColumn = (bankName: string, columnKey: string) => {
  const bankKey = normalizeBankColumnKey(bankName);
  return Boolean(bankKey && columnKey) && (bankKey.includes(columnKey) || columnKey.includes(bankKey));
};

export const isBankShownInLoanTable = (bank: BankDefinition) => bank.show_in_loan_table ?? bank.active;

export const getLoanTableBankColumns = (
  bankDefinitions: BankDefinition[],
  applications: LoanApplication[]
): LoanTableBankColumn[] => {
  const knownKeys = bankDefinitions.map((bank) => normalizeBankColumnKey(bank.name)).filter(Boolean);
  const columns: LoanTableBankColumn[] = bankDefinitions
    .filter(isBankShownInLoanTable)
    .map((bank) => ({ key: normalizeBankColumnKey(bank.name), label: bank.name, inBankDatabase: true }))
    .filter((column) => column.key);

  applications.forEach((application) => {
    (application.bank_applications || []).forEach((bankApplication) => {
      const bankName = bankApplication.bank_name.trim();
      const key = normalizeBankColumnKey(bankName);
      if (!key) return;
      if (knownKeys.some((knownKey) => bankMatchesColumn(bankName, knownKey))) return;
      if (columns.some((column) => bankMatchesColumn(bankName, column.key))) return;
      columns.push({ key, label: bankName, inBankDatabase: false });
    });
  });

  return columns;
};

/**
 * Admin / Operations Manager / Super Admin may submit a loan file to a bank
 * straight from the table, under the same conditions as the bank page's Submit to Bank.
 */
export const canSubmitToBankFromTable = (application: LoanApplication, role: RoleAccountRole) => (
  hasAdminWorkAccess(role)
  && application.purchase_method === 'Loan'
  && isApplicationOpenForNewBank(application)
  && getLoanPendingAction(application) !== 'Complete Application'
);

/**
 * Whether Admin may still submit the file to another bank. An approved file stays open
 * (meeting 2026-10-13: some customers do not like the approving bank) until the bike is
 * delivered, the bank has paid out, or finance is complete.
 */
export const isApplicationOpenForNewBank = (application: Pick<LoanApplication, 'status' | 'deal_finance'>) => {
  if (application.status === LoanStatus.REJECT || application.status === LoanStatus.CANCELLED) {
    return false;
  }
  if (application.status !== LoanStatus.APPROVE) {
    return true;
  }

  const finance = application.deal_finance;
  return !finance || (
    finance.sale_status !== 'Bike Delivered'
    && finance.sale_status !== 'Cancelled'
    && !(Number(finance.bank_disbursement) > 0)
    && !finance.bank_disbursed_at
    && !finance.finance_completed_at
  );
};

/** The five quick decisions on a Submitted / Pending Review bank (bank page and Home bank follow-up). */
export type BankQuickAction = 'approve' | 'follow-up-reject' | 'follow-up-document' | 'reject' | 'cancel';

/** Opens the bank page of an application, optionally on one bank and one quick decision. */
export interface BankPageRequest {
  id: number;
  bankName?: string;
  bankApplicationId?: string;
  action?: BankQuickAction;
}
