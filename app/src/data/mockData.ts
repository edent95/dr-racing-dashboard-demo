/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorCodeDefinition, RejectNextStepType, RejectReasonCategory, RoleAccount, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';

export const INITIAL_WHATSAPP_TRACKING_LINKS: WhatsAppTrackingLink[] = [];

export const INITIAL_WHATSAPP_TRACKING_CLICKS: WhatsAppTrackingClick[] = [];

export const INITIAL_ROLE_ACCOUNTS: RoleAccount[] = [
  {
    id: 'USR-005',
    name: 'Admin Director',
    email: 'admin-director@local.invalid',
    role: 'Super Admin',
    status: 'Active'
  },
  {
    id: 'USR-011',
    name: 'AQISH',
    email: 'aqish@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-012',
    name: 'BATRISYIA',
    email: 'batrisyia@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-013',
    name: 'ALIAS',
    email: 'alias@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-014',
    name: 'DZUL',
    email: 'dzul@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-015',
    name: 'PIJAN',
    email: 'pijan@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-016',
    name: 'EG',
    email: 'eg@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-017',
    name: 'ZARIF',
    email: 'zarif@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-018',
    name: 'NAJWA',
    email: 'najwa@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-019',
    name: 'BOB',
    email: 'bob@local.invalid',
    role: 'Sales',
    status: 'Active'
  },
  {
    id: 'USR-020',
    name: 'ALEEP',
    email: 'aleep@local.invalid',
    role: 'Sales',
    status: 'Active'
  }
];

type ErrorCodeSeedRow = readonly [code: string, issue: string, customerRequest: string];

const INITIAL_ERROR_CODE_ROWS: ErrorCodeSeedRow[] = [
  ["1000000","Inconsistent information on payslip","Payslip info doesn't match. Check with the customer."],
  ["1030000","Below criteria: Income does not qualify","Income is too low."],
  ["1040000","Below criteria: Malaysian residing overseas","Lives overseas."],
  ["1060000","Below criteria: No income proof/supporting documents","Send the income proof again."],
  ["1080000","Below criteria: Not working","Has no job right now."],
  ["14000000","Third-party use","Someone else will use it. No need to resend."],
  ["3010000","Internal examination: Bankruptcy/CTOS","Clear the CTOS debt first."],
  ["3010200","CTOS not settled","Clear the CTOS debt first."],
  ["3020000","Internal examination: Bad Check Bureau","Has a bad cheque record."],
  ["3020100","Internal examination: Payment conduct","Pays bills late (CCRIS)."],
  ["3020200","Internal examination: Legal status","No need to resend."],
  ["3020300","Internal examination: Special attention account","Account is flagged (SAA)."],
  ["3020400","Internal examination: Bad Check Bureau (AKPK)","No need to resend."],
  ["3020500","Internal examination: Rescheduling/Restructuring","Already changed another loan's plan."],
  ["3030000","Internal examination: Bad AEON payment record","Pays AEON late."],
  ["3050000","Internal examination: Overcommitments","Owes too much. Try with other income."],
  ["3040500","Internal examination: Altered bank statement","Fake bank statement."],
  ["3040200","Internal examination: Altered document (payslip)","Fake payslip."],
  ["3050600","DSR limit exceeded","Spends more than they earn. Add other income."],
  ["3070103","Internal examination: Fraud (payslip)","Fake payslip."],
  ["3070106","Internal examination: Fraud (bank statement)","Fake bank statement."],
  ["3080200","Internal examination: Weak business documentation","Business papers are too weak."],
  ["3090000","Score decline","Score is too low."],
  ["4010000","Score decline: Job status (non-target/high risk)","If 23+: usually bad payment/CTOS/CCRIS. If 18-22 or low score: ask for 30%+ down payment."],
  ["4010100","Job status: Non-target (high risk)","Job is contract only."],
  ["4010400","Job status: Non-target (high risk) - Contract-based","Job is on a contract."],
  ["4010600","Job status: Non-target (high risk)","Paid daily / part-time."],
  ["4010902","Job status: Non-target (high risk) - Unstable job (part-time)","Part-time job."],
  ["4020000","Job status: Resigned","Quit the job."],
  ["4050000","Job status: Short years of service","Not enough years at work."],
  ["5000000","Inconsistent information after verification","Story didn't match in the interview."],
  ["5010000","Inconsistent information (employer)","Employer's answers didn't match."],
  ["5010100","Inconsistent information (customer)","Customer's answers didn't match."],
  ["5020100","Inconsistent information: No such person","No such person."],
  ["5040000","Inconsistent information","Employer's answers didn't match."],
  ["5040100","Inconsistent information (applicant)","Ask the applicant for the correct info."],
  ["6000000","Difficult to contact","Can't reach the applicant."],
  ["6020000","Difficult to contact: No contact number","No phone number given."],
  ["6060000","Difficult to contact: Applicant/Office","Can't reach the applicant or employer."],
  ["8010000","Not cooperative: Applicant","Applicant won't cooperate."],
  ["8020000","Not cooperative: Guarantor","Guarantor won't cooperate."],
  ["9010000","Refusal: Referee information","Won't give referee info."],
  ["9020000","Refusal: Joint applicant information","Won't give joint applicant info."],
  ["10000000","Incomplete documentation","Send the missing papers."],
  ["10010000","Incomplete documentation: Payslip","Send the full payslip."],
  ["10020000","Incomplete documentation: Employment letter","Send the job letter."],
  ["10030000","Incomplete documentation: EPF","Send the EPF statement."],
  ["10040000","Incomplete documentation: Borang B/taxation","Send Borang B and the tax receipt."],
  ["10050000","Incomplete documentation: Salary account","Send a bank statement that matches the salary."],
  ["10060000","Incomplete documentation: Business documents","Send the full SSM papers."],
  ["10060100","Incomplete documentation: Business documents (ROB)","Send the full SSM papers."],
  ["10070000","Incomplete documentation: HR confirmation","Send the HR letter."],
  ["10100000","Incomplete documentation: Visa","Send the cancellation form."],
  ["10110000","Incomplete documentation: Work permit","Send the work permit."],
  ["10150000","Incomplete documentation: Business account","Send the latest bank statement."],
  ["10160000","Incomplete documentation: Bank proof","Send the latest bank statement."],
  ["13000000","Disagreement with approved limit","Doesn't like the limit given."],
  ["18000000","Matched UN/AMLA/Negative list","On the blacklist."],
  ["27000000","DSR limit exceeded","Spends more than they earn. Add other income."],
  ["30000000","Change of mind","Changed their mind."],
  ["30010000","Change of mind: Purchase in cash","Wants to pay cash instead."],
  ["30020000","Change of mind: Applied elsewhere","Went to another bank."],
  ["30030000","Change of mind: Applied elsewhere (merchant)","Went to another shop."],
  ["30040000","Change of mind: Applied for other loan","Took a different loan."],
  ["30050000","Change of mind: Not interested","Not interested anymore."],
  ["30060000","Change of mind: Reapply later","Will apply again later."],
  ["34020000","Applied by mistake","Didn't really apply."],
  ["35000000","Financial/Personal problems","Has money or personal problems."],
  ["41000000","Double application","Applied twice."]
];

export const getDefaultRejectCodeClassification = (
  rawCode: string,
  rawIssue = ''
): { category: RejectReasonCategory; default_next_step: RejectNextStepType } => {
  const code = rawCode.padStart(8, '0');
  const issue = rawIssue.toLowerCase();

  if (code === '41000000' || code === '34020000') {
    return { category: 'Duplicate / Invalid', default_next_step: 'MERGE_DUPLICATE' };
  }

  if (code === '30010000') {
    return { category: 'Customer Decision', default_next_step: 'CONVERT_TO_CASH' };
  }

  if (code === '30060000' || issue.includes('difficult to contact')) {
    return {
      category: issue.includes('contact') ? 'Contact / Cooperation' : 'Customer Decision',
      default_next_step: 'FOLLOW_UP_LATER'
    };
  }

  if (
    code.startsWith('10') ||
    code === '01060000' ||
    code === '03080200' ||
    issue.includes('incomplete documentation') ||
    issue.includes('supporting documents')
  ) {
    return { category: 'Documents', default_next_step: 'REQUEST_DOCUMENTS' };
  }

  if (
    code === '01000000' ||
    code.startsWith('05') ||
    issue.includes('inconsistent information')
  ) {
    return { category: 'Information', default_next_step: 'CORRECT_INFORMATION' };
  }

  if (
    code.startsWith('08') ||
    code.startsWith('09') ||
    issue.includes('not cooperative') ||
    issue.includes('refusal')
  ) {
    return { category: 'Contact / Cooperation', default_next_step: 'CORRECT_INFORMATION' };
  }

  if (
    ['14000000', '18000000', '03040500', '03040200', '03070103', '03070106', '05020100'].includes(code) ||
    issue.includes('fraud') ||
    issue.includes('altered') ||
    issue.includes('negative list') ||
    issue.includes('third-party')
  ) {
    return { category: 'Compliance / Fraud', default_next_step: 'CLOSE_REJECTED' };
  }

  if (
    code.startsWith('30') ||
    code === '13000000' ||
    code === '35000000' ||
    issue.includes('change of mind') ||
    issue.includes('approved limit')
  ) {
    return { category: 'Customer Decision', default_next_step: 'CLOSE_REJECTED' };
  }

  if (
    ['03010000', '03010200', '03020000', '03020100', '03020200', '03020300', '03020400', '03020500', '03030000'].includes(code)
  ) {
    return { category: 'Credit', default_next_step: 'FOLLOW_UP_LATER' };
  }

  if (
    code.startsWith('04') ||
    ['01030000', '01080000', '03050000', '03050600', '03090000', '27000000'].includes(code) ||
    issue.includes('dsr') ||
    issue.includes('income') ||
    issue.includes('score decline') ||
    issue.includes('job status')
  ) {
    return { category: 'Affordability', default_next_step: 'ADJUST_DEAL' };
  }

  return { category: 'Credit', default_next_step: 'TRY_ANOTHER_BANK' };
};

export const INITIAL_ERROR_CODE_DEFINITIONS: ErrorCodeDefinition[] = INITIAL_ERROR_CODE_ROWS.map(([
  code,
  issue,
  customerRequest
]) => {
  const normalizedCode = code.padStart(8, '0');
  return {
    code: normalizedCode,
    issue,
    customer_request: customerRequest,
    ...getDefaultRejectCodeClassification(normalizedCode, issue)
  };
});
