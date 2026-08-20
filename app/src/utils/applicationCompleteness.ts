/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LoanApplication } from '../types';

const hasValue = (value: unknown) => String(value ?? '').trim().length > 0;

export function getMissingApplicationInformationLabels(
  application: Pick<
    LoanApplication,
    | 'applicant_name'
    | 'phone_no'
    | 'ic_no'
    | 'vehicle_model'
    | 'vehicle_condition'
    | 'purchase_method'
    | 'vehicle_options'
    | 'personal_info'
    | 'emergency_contacts'
    | 'employment_details'
    | 'preferences'
  >
) {
  const missing: string[] = [];
  const requireValue = (value: unknown, label: string) => {
    if (!hasValue(value)) missing.push(label);
  };

  requireValue(application.applicant_name, 'Customer Name');
  requireValue(application.phone_no, 'Phone Number');
  requireValue(application.ic_no, 'IC Number');
  requireValue(application.vehicle_model, 'Vehicle Model');
  requireValue(application.vehicle_condition, 'New / Used');
  requireValue(application.purchase_method, 'Cash / Loan');

  if (application.purchase_method === 'Cash') {
    requireValue(application.personal_info?.full_address, 'Permanent Address (IC)');
    requireValue(application.personal_info?.resident_address, 'Resident Address');
    requireValue(application.vehicle_options?.[0]?.total_cash_price, 'Total Cash Price');
    return missing;
  }

  if (application.purchase_method !== 'Loan') return missing;

  const personalInfo = application.personal_info;
  requireValue(personalInfo?.gender, 'Gender');
  requireValue(personalInfo?.race, 'Race');
  requireValue(personalInfo?.marital_status, 'Marital Status');
  requireValue(personalInfo?.full_address, 'Permanent Address (IC)');
  requireValue(personalInfo?.resident_address, 'Resident Address');
  requireValue(personalInfo?.years_at_residence, 'Years at Residence');
  requireValue(personalInfo?.housing_status, 'Housing Status');

  const emergencyContacts = application.emergency_contacts || [];
  [0, 1].forEach((index) => {
    const contact = emergencyContacts[index];
    const prefix = `Emergency Contact ${index + 1}`;
    requireValue(contact?.full_name, `${prefix} Name`);
    requireValue(contact?.relationship, `${prefix} Relationship`);
    requireValue(contact?.phone_no, `${prefix} Phone`);
    requireValue(contact?.full_address, `${prefix} Address`);
  });

  const employment = application.employment_details;
  requireValue(employment?.company_name, 'Company Name');
  requireValue(employment?.position, 'Position');
  requireValue(employment?.years_employed, 'Years Employed');
  requireValue(employment?.company_address, 'Company Address');
  requireValue(employment?.office_phone_no, 'Office Phone');
  requireValue(employment?.gross_monthly_salary, 'Gross Monthly Salary');
  requireValue(employment?.net_monthly_salary, 'Net Monthly Salary');

  const preferences = application.preferences;
  requireValue(preferences?.available_to_receive_calls, 'Available Call Time');
  requireValue(preferences?.salary_payment_method, 'Salary Paid By');
  if (preferences?.salary_payment_method === 'Bank') {
    requireValue(personalInfo?.bank_name, 'Salary Bank');
    requireValue(personalInfo?.account_number, 'Bank Account Number');
  }
  requireValue(preferences?.preferred_motorcycle || application.vehicle_model, 'Preferred Motorcycle');
  requireValue(preferences?.loan_tenure, 'Loan Tenure');

  return missing;
}
