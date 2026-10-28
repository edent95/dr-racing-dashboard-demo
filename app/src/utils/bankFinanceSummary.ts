import type { BankApplication, LoanApplication } from '../types';

const toAmount = (value?: string | number | null) => {
  const amount = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(amount) && String(value ?? '').trim() !== '' ? amount : null;
};

const formatRm = (amount: number | null) => (
  amount === null ? '-' : `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`
);

/** The selling price an approved bank works from: its own figure, else the deal's, else the vehicle option's. */
export const getBankSellingPrice = (application: LoanApplication, bank: BankApplication) => (
  [bank.selling_price, application.deal_finance?.final_selling_price, application.vehicle_options?.[0]?.motor_selling_price]
    .map((value) => String(value ?? '').trim())
    .find((value) => value !== '' && value !== '0') || ''
);

/**
 * The finance block Admin fills after a bank approves (owner meeting 2026-10-20), as text to paste:
 *
 *   PLATE NUMBER : PKN 1234
 *   FINANCE : RM 11,340 (FULL LOAN)
 *   INSTALMENT : RM 331
 *   TENURE : 48
 *   SELLING PRICE : RM 11,340
 *   APPROVED LOAN : RM 11,340
 *   DEPOSIT : RM 0
 *
 * FULL LOAN means the approved loan plus deposit covers the selling price, the
 * same test as the delivery checklist's "Check full loan"; otherwise it shows the shortfall.
 */
export const buildBankFinanceSummary = (application: LoanApplication, bank: BankApplication) => {
  const sellingPrice = toAmount(getBankSellingPrice(application, bank));
  const approvedLoan = toAmount(bank.offer_amount);
  const deposit = toAmount(bank.deposit_amount) ?? 0;
  const shortfall = sellingPrice !== null && approvedLoan !== null ? sellingPrice - approvedLoan - deposit : null;
  const loanTag = shortfall === null ? '' : shortfall <= 0 ? ' (FULL LOAN)' : ` (SHORT ${formatRm(shortfall)})`;
  const plate = (bank.number_plate || application.vehicle_plate || '').trim();
  return [
    `PLATE NUMBER : ${plate || '-'}`,
    `FINANCE : ${formatRm(approvedLoan)}${loanTag}`,
    `INSTALMENT : ${formatRm(toAmount(bank.monthly_installment))}`,
    `TENURE : ${bank.tenure?.trim() || '-'}`,
    `SELLING PRICE : ${formatRm(sellingPrice)}`,
    `APPROVED LOAN : ${formatRm(approvedLoan)}`,
    `DEPOSIT : ${formatRm(deposit)}`
  ].join('\n');
};

/** Instalment and tenure are required once a bank approves; the rest may follow. */
export const getMissingApprovedBankFields = (bank: BankApplication) => [
  ...(bank.monthly_installment?.trim() ? [] : ['monthly_installment' as const]),
  ...(bank.tenure?.trim() ? [] : ['tenure' as const])
];
