import type {
  CustomerEmploymentDetails,
  CustomerPersonalInfo,
  CustomerPreferences,
  EmergencyContact,
  PurchaseMethod,
  VehicleCondition
} from '../types';

export const VEHICLE_CONDITION_OPTIONS: VehicleCondition[] = ['', 'New', 'Used'];
export const PURCHASE_METHOD_OPTIONS: PurchaseMethod[] = ['', 'Cash', 'Loan'];
export const MARITAL_STATUS_OPTIONS = ['', 'Single', 'Married', 'Divorced', 'Widowed'] as const;
export const OCCUPATION_TYPE_OPTIONS = ['', 'Employee', 'Self-employed'] as const;
export const GENDER_OPTIONS = ['', 'Male', 'Female'] as const;
export const RACE_OPTIONS = ['', 'Malay', 'Chinese', 'Indian', 'Bumiputera', 'Other'] as const;
export const HOUSING_STATUS_OPTIONS = ['', 'Self-owned', 'Family-owned', 'Rented', 'Company provided', 'Other'] as const;
export const SALARY_PAYMENT_METHOD_OPTIONS = ['', 'Bank', 'Cash'] as const;
export const LOAN_TENURE_OPTIONS = ['2', '3', '4', '5', '6', '7'] as const;

const SALARY_BANK_EXCLUDED_KEYWORDS = ['aeon', 'berjaya', 'chailease', 'jcl', 'osk', 'parkson'];

export const getSalaryBankOptions = (bankNames: string[], inputHistory: string[] = []) => {
  const configuredSalaryBanks = bankNames.filter((bankName) => {
    const normalized = bankName.trim().toLowerCase();
    return !SALARY_BANK_EXCLUDED_KEYWORDS.some((keyword) => normalized.includes(keyword));
  });
  const uniqueBankNames = new Map<string, string>();

  [...configuredSalaryBanks, ...inputHistory].forEach((bankName) => {
    const trimmed = bankName.trim();
    const normalized = trimmed.toLowerCase();
    if (normalized && !uniqueBankNames.has(normalized)) {
      uniqueBankNames.set(normalized, trimmed);
    }
  });

  return Array.from(uniqueBankNames.values());
};

export const createEmptyCustomerPersonalInfo = (): CustomerPersonalInfo => ({
  gender: '',
  race: '',
  marital_status: '',
  number_of_children: '',
  bank_name: '',
  account_number: '',
  email: '',
  full_address: '',
  resident_address: '',
  years_at_residence: '',
  housing_status: ''
});

export const createEmptyEmergencyContact = (): EmergencyContact => ({
  full_name: '',
  relationship: '',
  full_address: '',
  phone_no: ''
});

export const createEmptyCustomerEmploymentDetails = (): CustomerEmploymentDetails => ({
  occupation_type: '',
  company_name: '',
  position: '',
  years_employed: '',
  employment_start_year: '',
  employment_start_month: '',
  company_address: '',
  office_phone_no: '',
  work_hours: '',
  gross_monthly_salary: '',
  net_monthly_salary: ''
});

export const createEmptyCustomerPreferences = (): CustomerPreferences => ({
  available_to_receive_calls: '',
  salary_payment_method: '',
  preferred_motorcycle: '',
  loan_tenure: ''
});

export const normalizeCustomerPersonalInfo = (
  value?: Partial<CustomerPersonalInfo>
): CustomerPersonalInfo => ({
  ...createEmptyCustomerPersonalInfo(),
  ...(value || {})
});

export const normalizeEmergencyContacts = (value?: EmergencyContact[]): EmergencyContact[] => {
  const contacts = Array.isArray(value) ? value : [];
  return [0, 1].map((index) => ({
    ...createEmptyEmergencyContact(),
    ...(contacts[index] || {})
  }));
};

export const normalizeCustomerEmploymentDetails = (
  value?: Partial<CustomerEmploymentDetails>
): CustomerEmploymentDetails => ({
  ...createEmptyCustomerEmploymentDetails(),
  ...(value || {})
});

export const normalizeCustomerPreferences = (
  value?: Partial<CustomerPreferences>
): CustomerPreferences => ({
  ...createEmptyCustomerPreferences(),
  ...(value || {})
});

/**
 * Whole years and remaining months worked since the given start year/month.
 * Returns null when the start is incomplete, invalid, or in the future.
 */
export const getEmploymentDuration = (
  startYear?: string,
  startMonth?: string,
  now: Date = new Date()
): { years: number; months: number } | null => {
  const year = Number(startYear);
  const month = Number(startMonth);
  if (!Number.isInteger(year) || !Number.isInteger(month) || year < 1900 || month < 1 || month > 12) return null;
  const totalMonths = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  if (totalMonths < 0) return null;
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
};

/** The start year/month that is `years` and `months` before now; the inverse of getEmploymentDuration. */
export const getStartFromDuration = (
  years: number,
  months: number,
  now: Date = new Date()
): { year: string; month: string } => {
  const totalMonths = now.getFullYear() * 12 + now.getMonth() - (Math.max(0, years) * 12 + Math.max(0, months));
  return { year: String(Math.floor(totalMonths / 12)), month: String((totalMonths % 12) + 1) };
};

/**
 * Reads a spoken duration such as "2", "2 tahun", "2 years 3 months", "1 thn 6 bln" or "3 bulan".
 * Returns null when the text holds no number.
 */
export const parseYearsMonthsText = (value?: string): { years: number; months: number } | null => {
  const text = (value || '').trim().toUpperCase();
  if (!/\d/.test(text)) return null;
  const monthMatch = text.match(/(\d+)\s*(BULAN|BLN|MONTHS?|MTHS?|BULN)\b/);
  const yearMatch = text.match(/(\d+)\s*(TAHUN|THN|YEARS?|YRS?)\b/);
  if (!monthMatch && !yearMatch) {
    const firstNumber = text.match(/\d+/);
    return { years: Number(firstNumber?.[0] || 0), months: 0 };
  }
  const months = Number(monthMatch?.[1] || 0);
  return { years: Number(yearMatch?.[1] || 0) + Math.floor(months / 12), months: months % 12 };
};

/** Bank-form wording: "2 TAHUN 3 BULAN", "2 TAHUN", "3 BULAN". */
export const formatYearsMonthsForBank = (duration: { years: number; months: number }) => (
  [
    duration.years > 0 || duration.months === 0 ? `${duration.years} TAHUN` : '',
    duration.months > 0 ? `${duration.months} BULAN` : ''
  ].filter(Boolean).join(' ')
);

export const CHILDREN_MARITAL_STATUSES = ['Married', 'Divorced', 'Widowed'];

/** Meeting 2026-10-13: every customer who has been married is asked how many children. */
export const hasChildrenQuestion = (maritalStatus?: string) => CHILDREN_MARITAL_STATUSES.includes(maritalStatus || '');

// Owner decision 2026-09-30: number of children is required for Married loan
// files and defaults to 0, so a blank value on a Married file reads as "0"
// (display, bank copy and completeness) instead of showing as missing.
// Since 2026-10-13 the same holds for Divorced and Widowed.
export const getEffectiveNumberOfChildren = (
  personalInfo?: { marital_status?: string; number_of_children?: string } | null
) => (
  hasChildrenQuestion(personalInfo?.marital_status)
    ? String(personalInfo?.number_of_children ?? '').trim() || '0'
    : ''
);

export const getEmploymentStartYearOptions = (now: Date = new Date(), span = 50) => {
  const currentYear = now.getFullYear();
  return Array.from({ length: span + 1 }, (_, index) => String(currentYear - index));
};
