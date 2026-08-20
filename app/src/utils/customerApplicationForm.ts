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
  company_name: '',
  position: '',
  years_employed: '',
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
