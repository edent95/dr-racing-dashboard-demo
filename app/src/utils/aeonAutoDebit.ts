import { tr } from '../lib/i18n';
import type { BankDefinition } from '../types';

/**
 * AEON Credit collects instalments by auto-debit, and only from accounts at
 * these banks (owner 2026-10-21, AEON's own bank picker). A loan file whose
 * customer banks elsewhere still goes to AEON; once AEON approves it, the
 * handler asks the customer for an account at one of these (owner
 * 2026-10-24), so the app warns and never blocks.
 *
 * Since 2026-10-25 each lender's list lives in Bank Database
 * (`BankDefinition.auto_debit_banks`); this is only AEON's starting list,
 * used until Super Admin edits it there.
 */
export const AEON_AUTO_DEBIT_BANKS = [
  'ALLIANCE BANK MALAYSIA BERHAD',
  'AMBANK (M) BERHAD',
  'BANK MUAMALAT MALAYSIA BERHAD',
  'BANK SIMPANAN NASIONAL',
  'CIMB BANK BERHAD',
  'MALAYAN BANKING BERHAD',
  'PUBLIC BANK BERHAD',
  'RHB BANK BERHAD',
  'STANDARD CHARTERED BANK BERHAD'
] as const;

/** Short names staff type; AEON's default list in Bank Database. */
export const AEON_AUTO_DEBIT_BANK_SHORT_NAMES = [
  'Alliance', 'AmBank', 'Bank Muamalat', 'BSN', 'CIMB', 'Maybank', 'Public Bank', 'RHB', 'Standard Chartered'
];

const normalizeBankKey = (bankName: string) => bankName.toUpperCase().replace(/[^A-Z0-9]/g, '');

// One bank under the names staff type for it. A long key matches anywhere in
// the typed name ("Maybank2u", "CIMB Bank Bhd"); a short one only as the whole
// name, so "BSN" never matches inside another word.
const BANK_FAMILIES: Array<{ id: string; contains: string[]; exact?: string[] }> = [
  { id: 'MAYBANK', contains: ['MAYBANK', 'MALAYANBANKING'], exact: ['MBB'] },
  { id: 'PUBLICBANK', contains: ['PUBLICBANK'], exact: ['PBB', 'PUBLIC'] },
  { id: 'BSN', contains: ['SIMPANANNASIONAL'], exact: ['BSN'] },
  { id: 'STANDARDCHARTERED', contains: ['STANDARDCHARTERED'], exact: ['SCB'] },
  { id: 'AMBANK', contains: ['AMBANK'] },
  { id: 'ALLIANCE', contains: ['ALLIANCE'] },
  { id: 'MUAMALAT', contains: ['MUAMALAT'] },
  { id: 'CIMB', contains: ['CIMB'] },
  { id: 'RHB', contains: ['RHB'] },
  { id: 'HONGLEONG', contains: ['HONGLEONG'], exact: ['HLB'] },
  { id: 'BANKISLAM', contains: ['BANKISLAM'] },
  { id: 'BANKRAKYAT', contains: ['RAKYAT'] },
  { id: 'AFFIN', contains: ['AFFIN'] },
  { id: 'AGROBANK', contains: ['AGROBANK'] },
  { id: 'HSBC', contains: ['HSBC'] },
  { id: 'UOB', contains: ['UOB', 'UNITEDOVERSEAS'] },
  { id: 'OCBC', contains: ['OCBC'] }
];

const getBankFamily = (key: string) => BANK_FAMILIES.find((family) => (
  family.exact?.includes(key) || family.contains.some((part) => key.includes(part))
))?.id || '';

export const isAeonBankName = (bankName: string | null | undefined) => normalizeBankKey(bankName || '').includes('AEON');

/**
 * True when an account at `bankName` is one of `acceptedBanks`. An "Islamic"
 * subsidiary (Maybank Islamic, CIMB Islamic...) is its own bank: it matches
 * only an entry that names the Islamic one.
 */
export const isAutoDebitBankAccepted = (bankName: string | null | undefined, acceptedBanks: readonly string[]) => {
  const key = normalizeBankKey(bankName || '');
  if (!key) return false;
  const islamic = key.includes('ISLAMIC');
  const bareKey = key.replace('ISLAMIC', '');
  const family = getBankFamily(bareKey);
  return acceptedBanks.some((accepted) => {
    const acceptedKey = normalizeBankKey(accepted);
    if (!acceptedKey || acceptedKey.includes('ISLAMIC') !== islamic) return false;
    const bareAccepted = acceptedKey.replace('ISLAMIC', '');
    const acceptedFamily = getBankFamily(bareAccepted);
    if (family && acceptedFamily) return family === acceptedFamily;
    return bareKey === bareAccepted || (bareAccepted.length >= 4 && bareKey.includes(bareAccepted));
  });
};

/** True when AEON's starting list accepts this bank. */
export const isAeonAutoDebitBank = (bankName: string | null | undefined) => isAutoDebitBankAccepted(bankName, AEON_AUTO_DEBIT_BANK_SHORT_NAMES);

/**
 * The banks a lender can auto-debit from, as set in Bank Database. Empty means
 * any bank. AEON keeps its starting list until someone edits it.
 */
export const getLenderAutoDebitBanks = (lenderName: string, bankDefinitions: readonly BankDefinition[] = []) => {
  const lenderKey = normalizeBankKey(lenderName);
  const definition = bankDefinitions.find((bank) => normalizeBankKey(bank.name) === lenderKey)
    || (isAeonBankName(lenderName) ? bankDefinitions.find((bank) => isAeonBankName(bank.name)) : undefined);
  if (Array.isArray(definition?.auto_debit_banks)) return definition.auto_debit_banks;
  return isAeonBankName(lenderName) ? AEON_AUTO_DEBIT_BANK_SHORT_NAMES : [];
};

export type AeonAutoDebitIssue = { lenderName: string; acceptedBanks: readonly string[] } | null;

/**
 * What to warn about for a loan file: only once a lender with an auto-debit
 * list (AEON by default) is Approved (owner 2026-10-24: Admin submits with the
 * salary bank filled, and the account only matters for the lender that pays
 * out). An empty salary bank is not a case here; loan files cannot be
 * submitted without it.
 */
export const getAeonAutoDebitIssue = (
  salaryBankName: string | null | undefined,
  bankApplications: Array<{ bank_name: string; status?: string }>,
  bankDefinitions: readonly BankDefinition[] = []
): AeonAutoDebitIssue => {
  if (!(salaryBankName || '').trim()) return null;
  for (const bank of bankApplications) {
    if (bank.status !== 'Approved') continue;
    const acceptedBanks = getLenderAutoDebitBanks(bank.bank_name, bankDefinitions);
    if (acceptedBanks.length > 0 && !isAutoDebitBankAccepted(salaryBankName, acceptedBanks)) {
      return { lenderName: bank.bank_name, acceptedBanks };
    }
  }
  return null;
};

/** Shared with the Home card so both say the same thing. */
export const getAutoDebitWarningText = (lenderName: string, salaryBankName: string, acceptedBanks: readonly string[]) => {
  const banks = acceptedBanks.join(', ');
  return tr(
    `${lenderName} 已批，但不能从 ${salaryBankName} 自动扣款。请联系客户，提供以下银行的户口:${banks}。`,
    `${lenderName} approved, but ${lenderName} cannot auto-debit from ${salaryBankName}. Contact the customer for an account at: ${banks}.`,
    `${lenderName} lulus, tetapi ${lenderName} tidak boleh potong auto dari ${salaryBankName}. Hubungi pelanggan untuk akaun di: ${banks}.`
  );
};
