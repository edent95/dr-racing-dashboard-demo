/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PurchaseMethod, VehicleCondition } from '../types';
import { isBasicMalaysiaIcNumber } from './malaysiaIc';
import { isBasicMalaysiaPhoneNumber } from './malaysiaPhone';

export type CustomerIntakeValidationDraft = {
  applicant_name: string;
  phone_no: string;
  ic_no: string;
  vehicle_model: string;
  vehicle_condition: VehicleCondition;
  purchase_method: PurchaseMethod;
  total_cash_price: string;
  motor_mileage: string;
  email: string;
  full_address: string;
  resident_address: string;
  bank_name: string;
  account_number: string;
  gender: string;
  race: string;
  marital_status: string;
  housing_status: string;
  years_at_residence: string;
  emergency_contact_1_full_name: string;
  emergency_contact_1_relationship: string;
  emergency_contact_1_full_address: string;
  emergency_contact_1_phone_no: string;
  emergency_contact_2_full_name: string;
  emergency_contact_2_relationship: string;
  emergency_contact_2_full_address: string;
  emergency_contact_2_phone_no: string;
  company_name: string;
  position: string;
  years_employed: string;
  company_address: string;
  office_phone_no: string;
  gross_monthly_salary: string;
  net_monthly_salary: string;
  available_to_receive_calls: string;
  salary_payment_method: string;
  loan_tenure: string;
};

export type CustomerIntakeValidationIssue =
  | 'purchase_method'
  | 'vehicle_model'
  | 'vehicle_condition'
  | 'total_cash_price'
  | 'applicant_name'
  | 'phone_no_required'
  | 'phone_no_invalid'
  | 'ic_no_required'
  | 'ic_no_invalid'
  | 'email_required'
  | 'email_invalid'
  | 'gender'
  | 'race'
  | 'marital_status'
  | 'years_at_residence'
  | 'housing_status'
  | 'full_address'
  | 'resident_address'
  | 'emergency_contact_1_full_name'
  | 'emergency_contact_1_relationship'
  | 'emergency_contact_1_phone_no_required'
  | 'emergency_contact_1_phone_no_invalid'
  | 'emergency_contact_1_full_address'
  | 'emergency_contact_2_full_name'
  | 'emergency_contact_2_relationship'
  | 'emergency_contact_2_phone_no_required'
  | 'emergency_contact_2_phone_no_invalid'
  | 'emergency_contact_2_full_address'
  | 'gross_monthly_salary'
  | 'net_monthly_salary'
  | 'company_name'
  | 'position'
  | 'years_employed'
  | 'office_phone_no_required'
  | 'office_phone_no_invalid'
  | 'company_address'
  | 'available_to_receive_calls'
  | 'salary_payment_method'
  | 'bank_name'
  | 'account_number'
  | 'loan_tenure';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function getCustomerIntakeValidationIssues(
  draft: CustomerIntakeValidationDraft
): CustomerIntakeValidationIssue[] {
  const issues: CustomerIntakeValidationIssue[] = [];
  const requireValue = (
    issue: CustomerIntakeValidationIssue,
    value: string | PurchaseMethod | VehicleCondition
  ) => {
    if (!String(value).trim()) issues.push(issue);
  };

  requireValue('purchase_method', draft.purchase_method);
  requireValue('vehicle_model', draft.vehicle_model);
  requireValue('vehicle_condition', draft.vehicle_condition);

  if (draft.purchase_method === 'Cash') {
    requireValue('total_cash_price', draft.total_cash_price);
  }

  requireValue('applicant_name', draft.applicant_name);
  if (!draft.phone_no.trim()) {
    issues.push('phone_no_required');
  } else if (!isBasicMalaysiaPhoneNumber(draft.phone_no)) {
    issues.push('phone_no_invalid');
  }
  if (!draft.ic_no.trim()) {
    issues.push('ic_no_required');
  } else if (!isBasicMalaysiaIcNumber(draft.ic_no)) {
    issues.push('ic_no_invalid');
  }
  if (!draft.email.trim()) {
    issues.push('email_required');
  } else if (!isValidEmail(draft.email)) {
    issues.push('email_invalid');
  }
  requireValue('full_address', draft.full_address);
  requireValue('resident_address', draft.resident_address);

  if (draft.purchase_method !== 'Loan') {
    return issues;
  }

  requireValue('gender', draft.gender);
  requireValue('race', draft.race);
  requireValue('marital_status', draft.marital_status);
  requireValue('years_at_residence', draft.years_at_residence);
  requireValue('housing_status', draft.housing_status);

  requireValue('emergency_contact_1_full_name', draft.emergency_contact_1_full_name);
  requireValue('emergency_contact_1_relationship', draft.emergency_contact_1_relationship);
  requireValue('emergency_contact_1_full_address', draft.emergency_contact_1_full_address);
  if (!draft.emergency_contact_1_phone_no.trim()) {
    issues.push('emergency_contact_1_phone_no_required');
  } else if (!isBasicMalaysiaPhoneNumber(draft.emergency_contact_1_phone_no)) {
    issues.push('emergency_contact_1_phone_no_invalid');
  }

  requireValue('emergency_contact_2_full_name', draft.emergency_contact_2_full_name);
  requireValue('emergency_contact_2_relationship', draft.emergency_contact_2_relationship);
  requireValue('emergency_contact_2_full_address', draft.emergency_contact_2_full_address);
  if (!draft.emergency_contact_2_phone_no.trim()) {
    issues.push('emergency_contact_2_phone_no_required');
  } else if (!isBasicMalaysiaPhoneNumber(draft.emergency_contact_2_phone_no)) {
    issues.push('emergency_contact_2_phone_no_invalid');
  }

  requireValue('gross_monthly_salary', draft.gross_monthly_salary);
  requireValue('net_monthly_salary', draft.net_monthly_salary);
  requireValue('company_name', draft.company_name);
  requireValue('position', draft.position);
  requireValue('years_employed', draft.years_employed);
  if (!draft.office_phone_no.trim()) {
    issues.push('office_phone_no_required');
  } else if (!isBasicMalaysiaPhoneNumber(draft.office_phone_no)) {
    issues.push('office_phone_no_invalid');
  }
  requireValue('company_address', draft.company_address);
  requireValue('available_to_receive_calls', draft.available_to_receive_calls);
  requireValue('salary_payment_method', draft.salary_payment_method);
  if (draft.salary_payment_method === 'Bank') {
    requireValue('bank_name', draft.bank_name);
    requireValue('account_number', draft.account_number);
  }
  requireValue('loan_tenure', draft.loan_tenure);

  return issues;
}
