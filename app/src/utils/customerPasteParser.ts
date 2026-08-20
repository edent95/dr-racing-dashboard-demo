/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CustomerEmploymentDetails,
  CustomerPersonalInfo,
  CustomerPreferences,
  EmergencyContact,
  PurchaseMethod
} from '../types';

type PasteSection = 'personal' | 'contact_1' | 'contact_2' | 'employment' | 'status';

type ParsedLine = {
  section: PasteSection;
  label: string;
  value: string;
};

export type ParsedCustomerPaste = {
  applicant_name?: string;
  phone_no?: string;
  ic_no?: string;
  vehicle_model?: string;
  purchase_method?: PurchaseMethod;
  personal_info: Partial<CustomerPersonalInfo>;
  emergency_contacts: [Partial<EmergencyContact>, Partial<EmergencyContact>];
  employment_details: Partial<CustomerEmploymentDetails>;
  preferences: Partial<CustomerPreferences>;
  matched_fields: string[];
  skipped_labels: string[];
  warnings: string[];
};

const normalizeLabel = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .replace(/[^A-Z0-9/]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const firstNumber = (value: string) => value.match(/\d+(?:\.\d+)?/)?.[0] || value.trim();

const normalizeMaritalStatus = (value: string) => {
  const normalized = normalizeLabel(value);
  if (normalized.includes('BUJANG') || normalized.includes('SINGLE')) return 'Single';
  if (normalized.includes('BERKAHWIN') || normalized === 'KAHWIN' || normalized.includes('MARRIED')) return 'Married';
  if (normalized.includes('CERAI') || normalized.includes('DIVORCED')) return 'Divorced';
  if (normalized.includes('JANDA') || normalized.includes('DUDA') || normalized.includes('BALU') || normalized.includes('WIDOW')) return 'Widowed';
  return value.trim();
};

const normalizeGender = (value: string) => {
  const normalized = normalizeLabel(value);
  if (normalized.includes('PEREMPUAN') || normalized === 'FEMALE') return 'Female';
  if (normalized.includes('LELAKI') || normalized === 'MALE') return 'Male';
  return value.trim();
};

const normalizeHousingStatus = (value: string) => {
  const normalized = normalizeLabel(value);
  if (normalized.includes('KELUARGA') || normalized.includes('FAMILY')) return 'Family-owned';
  if (normalized.includes('SEWA') || normalized.includes('RENT')) return 'Rented';
  if (normalized.includes('SYARIKAT') || normalized.includes('COMPANY')) return 'Company provided';
  if (normalized.includes('SENDIRI') || normalized.includes('MILIK') || normalized.includes('OWN')) return 'Self-owned';
  return 'Other';
};

const normalizeSalaryMethod = (value: string) => {
  const normalized = normalizeLabel(value);
  if (normalized.includes('BANK')) return 'Bank';
  if (normalized.includes('CASH') || normalized.includes('TUNAI')) return 'Cash';
  return value.trim();
};

const normalizeRace = (value: string) => {
  const normalized = normalizeLabel(value);
  if (normalized.includes('MELAYU') || normalized === 'MALAY') return 'Malay';
  if (normalized.includes('CINA') || normalized === 'CHINESE') return 'Chinese';
  if (normalized.includes('INDIA') || normalized === 'INDIAN') return 'Indian';
  if (normalized.includes('BUMIPUTERA')) return 'Bumiputera';
  return value.trim();
};

const resolveSectionHeader = (line: string): PasteSection | undefined => {
  const normalized = normalizeLabel(line);
  if (/^(EMERGENCY CONTACT|KENALAN KECEMASAN) 1$/.test(normalized)) return 'contact_1';
  if (/^(EMERGENCY CONTACT|KENALAN KECEMASAN) 2$/.test(normalized)) return 'contact_2';
  if (normalized.includes('MAKLUMAT SYARIKAT') || normalized.includes('MAKLUMAT PEKERJAAN')) return 'employment';
  if (normalized === 'STATUS') return 'status';
  if (normalized.includes('ISI DETAIL MAKLUMAT') || normalized.includes('MAKLUMAT PERIBADI')) return 'personal';
  return undefined;
};

const collectParsedLines = (text: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];
  let section: PasteSection = 'personal';
  let lastParsedLine: ParsedLine | undefined;

  text.replace(/\r\n?/g, '\n').split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      lastParsedLine = undefined;
      return;
    }

    const nextSection = resolveSectionHeader(line);
    if (nextSection) {
      section = nextSection;
      lastParsedLine = undefined;
      return;
    }

    const match = line.match(/^([^:]+?)\s*:\s*(.*)$/);
    if (match) {
      const label = normalizeLabel(match[1]);
      const value = match[2].trim();
      if (label && value) {
        lastParsedLine = { section, label, value };
        parsedLines.push(lastParsedLine);
      } else {
        lastParsedLine = undefined;
      }
      return;
    }

    if (lastParsedLine && !/^RESPONSE\s*#/i.test(line) && normalizeLabel(line) !== 'YAMI') {
      lastParsedLine.value = `${lastParsedLine.value} ${line}`.trim();
    }
  });

  return parsedLines;
};

export function parseCustomerPasteText(text: string): ParsedCustomerPaste {
  const result: ParsedCustomerPaste = {
    personal_info: {},
    emergency_contacts: [{}, {}],
    employment_details: {},
    preferences: {},
    matched_fields: [],
    skipped_labels: [],
    warnings: []
  };
  const matchedFields = new Set<string>();
  const skippedLabels = new Set<string>();
  const warnings = new Set<string>();
  const markMatched = (field: string) => matchedFields.add(field);

  collectParsedLines(text).forEach(({ section, label, value }) => {
    if (section === 'contact_1' || section === 'contact_2') {
      const contactIndex = section === 'contact_1' ? 0 : 1;
      const contact = result.emergency_contacts[contactIndex];
      const fieldPrefix = `emergency_contact_${contactIndex + 1}`;

      if (label === 'NAMA PENUH' || label === 'NAMA') {
        contact.full_name = value;
        markMatched(`${fieldPrefix}.full_name`);
      } else if (label === 'HUBUNGAN' || label === 'RELATIONSHIP') {
        contact.relationship = value;
        markMatched(`${fieldPrefix}.relationship`);
      } else if (label.includes('ALAMAT')) {
        contact.full_address = value;
        markMatched(`${fieldPrefix}.full_address`);
      } else if (label.includes('TELEFON') || label.includes('PHONE')) {
        contact.phone_no = digitsOnly(value);
        markMatched(`${fieldPrefix}.phone_no`);
      } else {
        skippedLabels.add(label);
      }
      return;
    }

    if (section === 'employment') {
      if (label === 'NAMA SYARIKAT' || label === 'COMPANY NAME') {
        result.employment_details.company_name = value;
        markMatched('employment_details.company_name');
      } else if (label.includes('JENIS PERNIAGAAN') || label.includes('BUSINESS TYPE')) {
        skippedLabels.add(label);
      } else if (label.includes('JAWATAN') || label === 'POSITION') {
        result.employment_details.position = value;
        markMatched('employment_details.position');
      } else if (label.includes('KERJA BERAPA') || label.includes('TEMPOH BEKERJA') || label.includes('YEARS EMPLOYED')) {
        result.employment_details.years_employed = firstNumber(value);
        markMatched('employment_details.years_employed');
        if (/\b(BULAN|MONTHS?)\b/i.test(value)) {
          warnings.add('Employment duration was supplied in months; verify the Years Employed value.');
        }
      } else if (label.includes('ALAMAT') && label.includes('SYARIKAT')) {
        result.employment_details.company_address = value;
        markMatched('employment_details.company_address');
      } else if (label.includes('TELEFON PEJABAT') || label.includes('OFFICE PHONE')) {
        result.employment_details.office_phone_no = digitsOnly(value);
        markMatched('employment_details.office_phone_no');
      } else if (label.includes('GAJI KASAR') || label.includes('GROSS')) {
        result.employment_details.gross_monthly_salary = firstNumber(value.replace(/,/g, ''));
        markMatched('employment_details.gross_monthly_salary');
      } else if (label.includes('GAJI BERSIH') || label.includes('NET')) {
        result.employment_details.net_monthly_salary = firstNumber(value.replace(/,/g, ''));
        markMatched('employment_details.net_monthly_salary');
      } else {
        skippedLabels.add(label);
      }
      return;
    }

    if (section === 'status') {
      if (label.includes('WAKTU BOLEH JAWAB') || label.includes('AVAILABLE') && label.includes('CALL')) {
        result.preferences.available_to_receive_calls = value;
        markMatched('preferences.available_to_receive_calls');
      } else if (label.includes('GAJI MASUK') || label.includes('GAJI DIBAYAR') || label.includes('SALARY PAID')) {
        result.preferences.salary_payment_method = normalizeSalaryMethod(value);
        markMatched('preferences.salary_payment_method');
      } else if (label.includes('MOTOR PILIHAN') || label.includes('PREFERRED MOTOR')) {
        result.vehicle_model = value;
        result.preferences.preferred_motorcycle = value;
        markMatched('vehicle_model');
      } else if (label.includes('LOAN BERAPA TAHUN') || label.includes('IKAT TAHUN') || label.includes('TEMPOH PINJAMAN') || label.includes('LOAN TENURE')) {
        result.preferences.loan_tenure = firstNumber(value);
        result.purchase_method = 'Loan';
        markMatched('preferences.loan_tenure');
        markMatched('purchase_method');
      } else {
        skippedLabels.add(label);
      }
      return;
    }

    if (label === 'NAMA PENUH' || label === 'NAMA') {
      result.applicant_name = value;
      markMatched('applicant_name');
    } else if (label === 'NOMBOR IC' || label === 'NO IC' || label === 'IC') {
      result.ic_no = digitsOnly(value);
      markMatched('ic_no');
    } else if (label.includes('NOMBOR TELEFON') || label === 'NO TELEFON' || label === 'PHONE NUMBER') {
      result.phone_no = digitsOnly(value);
      markMatched('phone_no');
    } else if (label === 'JANTINA' || label === 'GENDER') {
      result.personal_info.gender = normalizeGender(value);
      markMatched('personal_info.gender');
    } else if (label === 'BANGSA' || label === 'RACE') {
      result.personal_info.race = normalizeRace(value);
      markMatched('personal_info.race');
    } else if (label.includes('STATUS PERKAHWINAN') || label === 'MARITAL STATUS') {
      result.personal_info.marital_status = normalizeMaritalStatus(value);
      markMatched('personal_info.marital_status');
    } else if (label === 'NAMA BANK' || label === 'BANK NAME') {
      result.personal_info.bank_name = value;
      markMatched('personal_info.bank_name');
    } else if (label === 'NOMBOR AKAUN' || label === 'NO AKAUN' || label === 'ACCOUNT NUMBER') {
      result.personal_info.account_number = digitsOnly(value);
      markMatched('personal_info.account_number');
    } else if (label === 'EMAIL' || label === 'E MAIL') {
      result.personal_info.email = value;
      markMatched('personal_info.email');
    } else if (
      label === 'ALAMAT PENUH'
      || label === 'FULL ADDRESS'
      || label === 'ALAMAT TETAP IC'
      || label === 'PERMANENT ADDRESS IC'
    ) {
      result.personal_info.full_address = value;
      markMatched('personal_info.full_address');
    } else if (label === 'ALAMAT KEDIAMAN' || label === 'RESIDENT ADDRESS') {
      result.personal_info.resident_address = value;
      markMatched('personal_info.resident_address');
    } else if (label.includes('MENETAP BERAPA') || label.includes('YEARS AT RESIDENCE')) {
      result.personal_info.years_at_residence = firstNumber(value);
      markMatched('personal_info.years_at_residence');
    } else if (label.includes('STATUS KEDIAMAN') || label === 'HOUSING STATUS') {
      result.personal_info.housing_status = normalizeHousingStatus(value);
      markMatched('personal_info.housing_status');
    } else {
      skippedLabels.add(label);
    }
  });

  if (result.personal_info.bank_name && !result.preferences.salary_payment_method) {
    result.preferences.salary_payment_method = 'Bank';
    markMatched('preferences.salary_payment_method');
  }

  result.matched_fields = Array.from(matchedFields);
  result.skipped_labels = Array.from(skippedLabels);
  result.warnings = Array.from(warnings);
  return result;
}
