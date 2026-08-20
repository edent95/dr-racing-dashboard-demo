/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Fixed anonymized demo dataset for the public GitHub Pages demo build.
 * Every record here is fictional. The generator is deterministic (fixed seed)
 * so the demo always shows the same story; only dates are anchored to "today"
 * so the dashboards stay alive.
 */

import { LoanStatus } from '../types';
import type {
  ApprovalRequest,
  AuditLogEntry,
  BankApplication,
  CalendarNote,
  ChannelMarketingSpend,
  CustomerIntakeShortLink,
  LoanApplication,
  NotificationItem,
  RawCustomerChannel,
  RawCustomerLead,
  RoleAccount,
  WhatsAppTrackingClick,
  WhatsAppTrackingLink
} from '../types';
import { INITIAL_ROLE_ACCOUNTS } from '../data/mockData';

// Deterministic PRNG so the demo data is fixed across visitors.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260820);
const pick = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)];
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days: number, hourJitter = true) => {
  const jitter = hourJitter ? randInt(9 * 60, 21 * 60) * 60 * 1000 : 0;
  const date = new Date(now - days * DAY);
  date.setHours(0, 0, 0, 0);
  return new Date(date.getTime() + jitter).toISOString();
};
const daysAhead = (days: number) => new Date(now + days * DAY).toISOString();
const monthKey = (offset: number) => {
  const d = new Date(now);
  d.setDate(1);
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const SALES_NAMES = [
  'DEMO SALES 01', 'DEMO SALES 02', 'DEMO SALES 03', 'DEMO SALES 04', 'DEMO SALES 05',
  'DEMO SALES 06', 'DEMO SALES 07', 'DEMO SALES 08', 'DEMO SALES 09', 'DEMO SALES 10'
] as const;
export const DEMO_SUPER_ADMIN_NAME = 'DEMO SUPER ADMIN';
const ADMIN_NAME = 'DEMO ADMIN';
const OPS_NAME = 'DEMO OPERATIONS';

const CUSTOMER_NAMES = [
  'Ahmad Danish Bin Roslan', 'Nur Aisyah Binti Kamal', 'Muhammad Haziq Bin Azlan', 'Siti Balqis Binti Omar',
  'Lim Jia Hao', 'Tan Wei Ling', 'Wong Kai Xuan', 'Lee Zhi Hong', 'Chong Mei Yee', 'Ng Jun Kit',
  'Arvind Raj A/L Suresh', 'Priya A/P Manoharan', 'Kumaresan A/L Bala', 'Dinesh A/L Ravi',
  'Mohd Firdaus Bin Ismail', 'Nurul Izzah Binti Hashim', 'Amirul Hakim Bin Yusof', 'Farah Nabila Binti Zulkifli',
  'Goh Chee Keong', 'Yap Sook Mun', 'Cheah Boon Leong', 'Koh Li Ting',
  'Syed Iqbal Bin Syed Omar', 'Wan Nor Asyikin Binti Wan Daud', 'Hafiz Bin Sulaiman', 'Intan Suraya Binti Bakri',
  'Vikram A/L Chandran', 'Kavitha A/P Ramesh', 'Ooi Kean Seng', 'Teoh Hui Min',
  'Zulhilmi Bin Mat Nor', 'Aina Mardhiah Binti Rahim', 'Faiz Akmal Bin Jamil', 'Nadia Husna Binti Saad',
  'Chin Wei Jie', 'Low Yee Teng', 'Sanjay A/L Kumar', 'Melur Qistina Binti Azman',
  'Harith Iskandar Bin Nazri', 'Puteri Alia Binti Megat', 'Beh Kok Wai', 'Sim Pei Shan',
  'Rafiq Danial Bin Osman', 'Thivya A/P Segaran', 'Khoo Ming Zhe', 'Aliff Haikal Bin Ramlan',
  'Cheryl Loh Xin Yi', 'Iskandar Zulkarnain Bin Halim', 'Ravin A/L Muthu', 'Emylia Sofea Binti Kasim'
] as const;

const VEHICLES: ReadonlyArray<readonly [model: string, brand: string, loan: number]> = [
  ['Y15 ZR', 'Yamaha', 11800],
  ['Y16 ZR', 'Yamaha', 13600],
  ['LC 135 FI', 'Yamaha', 11340],
  ['NVX ( ABS ) V3', 'Yamaha', 17000],
  ['N-MAX', 'Yamaha', 15000],
  ['EGO GEAR', 'Yamaha', 7900],
  ['PG-ONE', 'Yamaha', 9300],
  ['MT-15', 'Yamaha', 14800],
  ['RS 150 (RS150R)', 'Honda', 9800],
  ['RS-X WINNER', 'Honda', 11500],
  ['EZ 115', 'Yamaha', 7600],
  ['R15 M', 'Yamaha', 17300]
] as const;

const BANKS = ['Maybank', 'Public Bank', 'CIMB', 'Hong Leong Bank', 'RHB Bank'] as const;
const REJECT_CODES = ['3050600', '3090000', '1060000', '3010200', '3020100', '1030000', '3050000'] as const;
const CHANNELS: readonly RawCustomerChannel[] = ['TikTok', 'Facebook', 'Instagram', 'Google', 'Walk-in'] as const;
const CITIES: ReadonlyArray<readonly [city: string, state: string]> = [
  ['Shah Alam', 'Selangor'], ['Klang', 'Selangor'], ['Puchong', 'Selangor'], ['Kajang', 'Selangor'],
  ['Kuala Lumpur', 'Kuala Lumpur'], ['Seremban', 'Negeri Sembilan'], ['Johor Bahru', 'Johor'],
  ['Ipoh', 'Perak'], ['Melaka', 'Melaka'], ['Kuantan', 'Pahang']
] as const;

const PLATE_PREFIXES = ['VJT', 'WXD', 'BQS', 'JVN', 'VLR', 'BNT', 'WUM', 'VHK', 'BRJ', 'NDQ'] as const;

const fakePhone = () => `01${pick(['1', '2', '3', '6', '7', '9'] as const)}${String(randInt(2000000, 9899999))}`;
const fakeIc = () => {
  const year = randInt(85, 104) % 100; // spread 1985 - 2004
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  return `${String(year).padStart(2, '0')}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}-${pick(['10', '14', '01', '05', '08'] as const)}-${randInt(1000, 9999)}`;
};
const fakePlate = () => `${pick(PLATE_PREFIXES)} ${randInt(1000, 9999)}`;

type StatusPlan = { status: LoanStatus; count: number; ageMin: number; ageMax: number };

const STATUS_PLAN: StatusPlan[] = [
  { status: LoanStatus.NEW, count: 5, ageMin: 0, ageMax: 4 },
  { status: LoanStatus.PENDING, count: 7, ageMin: 1, ageMax: 10 },
  { status: LoanStatus.IN_PROCESS, count: 9, ageMin: 2, ageMax: 21 },
  { status: LoanStatus.APPROVE, count: 12, ageMin: 3, ageMax: 75 },
  { status: LoanStatus.REJECT, count: 8, ageMin: 6, ageMax: 80 },
  { status: LoanStatus.FOLLOW_UP, count: 4, ageMin: 4, ageMax: 30 },
  { status: LoanStatus.CANCELLED, count: 3, ageMin: 10, ageMax: 85 }
];

function buildBankApplications(
  appIndex: number,
  status: LoanStatus,
  handler: string,
  submittedAt: string,
  loanAmount: number
): BankApplication[] {
  if ([LoanStatus.NEW, LoanStatus.PENDING].includes(status)) {
    return [];
  }

  const base = {
    submitted_by: handler,
    reject_code: '',
    reject_reason: '',
    offer_amount: '',
    interest_rate: '',
    tenure: '',
    monthly_installment: '',
    approved_at: '',
    reason_category: '',
    status_reason: '',
    next_action: '',
    notes: ''
  };

  const submittedTime = new Date(submittedAt).getTime();
  const firstBank = pick(BANKS);
  const bankSubmittedAt = new Date(submittedTime + DAY * randInt(1, 2)).toISOString();

  if (status === LoanStatus.IN_PROCESS) {
    return [{
      ...base,
      id: `DEMO-BA-${appIndex}-1`,
      bank_name: firstBank,
      round_no: 1,
      submitted_at: bankSubmittedAt,
      status: rand() > 0.4 ? 'Pending Review' : 'Submitted',
      offer_status: 'No Offer',
      next_action: 'Follow up bank officer',
      next_follow_up_at: daysAhead(randInt(1, 4))
    }];
  }

  if (status === LoanStatus.APPROVE) {
    const offer = Math.round(loanAmount * (0.9 + rand() * 0.1));
    const tenureYears = pick([4, 5, 5, 5, 7] as const);
    return [{
      ...base,
      id: `DEMO-BA-${appIndex}-1`,
      bank_name: firstBank,
      round_no: 1,
      submitted_at: bankSubmittedAt,
      status: 'Approved',
      offer_amount: String(offer),
      interest_rate: pick(['3.1', '3.3', '3.5', '3.8'] as const),
      tenure: String(tenureYears),
      monthly_installment: String(Math.round((offer * 1.35) / (tenureYears * 12))),
      approved_at: new Date(submittedTime + DAY * randInt(3, 6)).toISOString(),
      decision_at: new Date(submittedTime + DAY * randInt(3, 6)).toISOString(),
      offer_status: pick(['Accepted', 'Accepted', 'Pending Decision'] as const),
      next_action: 'Contact approved customer'
    }];
  }

  if (status === LoanStatus.REJECT || status === LoanStatus.FOLLOW_UP) {
    const rejectCode = pick(REJECT_CODES);
    const rounds: BankApplication[] = [{
      ...base,
      id: `DEMO-BA-${appIndex}-1`,
      bank_name: firstBank,
      round_no: 1,
      submitted_at: bankSubmittedAt,
      status: 'Rejected',
      reject_code: rejectCode,
      reject_reason: 'Bank internal scoring',
      decision_at: new Date(submittedTime + DAY * randInt(3, 7)).toISOString(),
      offer_status: 'No Offer',
      reason_category: 'Credit',
      reject_next_step: status === LoanStatus.FOLLOW_UP ? 'TRY_ANOTHER_BANK' : 'CLOSE_REJECTED',
      next_action: status === LoanStatus.FOLLOW_UP ? 'Resubmit to another bank' : ''
    }];

    if (status === LoanStatus.FOLLOW_UP && rand() > 0.5) {
      const secondBank = pick(BANKS.filter((bank) => bank !== firstBank));
      rounds.push({
        ...base,
        id: `DEMO-BA-${appIndex}-2`,
        bank_name: secondBank,
        round_no: 2,
        submitted_at: new Date(submittedTime + DAY * randInt(8, 12)).toISOString(),
        status: 'Need More Info',
        offer_status: 'No Offer',
        status_reason: 'Latest 3 months payslip requested',
        next_action: 'Collect updated payslip',
        next_follow_up_at: daysAhead(randInt(1, 3))
      });
    }

    return rounds;
  }

  return [];
}

function buildApplications(): LoanApplication[] {
  const applications: LoanApplication[] = [];
  let nameIndex = 0;
  let appIndex = 0;

  STATUS_PLAN.forEach((plan) => {
    for (let i = 0; i < plan.count; i += 1) {
      appIndex += 1;
      const [model, brand, loanAmount] = pick(VEHICLES);
      const handler = SALES_NAMES[nameIndex % SALES_NAMES.length];
      const submittedAt = daysAgo(randInt(plan.ageMin, plan.ageMax));
      const applicantName = CUSTOMER_NAMES[nameIndex % CUSTOMER_NAMES.length];
      nameIndex += 1;

      const bankApplications = buildBankApplications(appIndex, plan.status, handler, submittedAt, loanAmount);
      const [city, state] = pick(CITIES);
      const errorCode = plan.status === LoanStatus.REJECT ? (bankApplications[0]?.reject_code || '') : '';

      const application: LoanApplication = {
        id: `DEMO-APP-${String(appIndex).padStart(3, '0')}`,
        applicant_name: applicantName,
        phone_no: fakePhone(),
        ic_no: fakeIc(),
        vehicle_plate: plan.status === LoanStatus.APPROVE ? fakePlate() : '',
        vehicle_model: model,
        vehicle_tag: 'Motorcycle',
        vehicle_brand: brand,
        vehicle_condition: 'New',
        purchase_method: 'Loan',
        handler_name: handler,
        handler_role: 'Sales',
        admin_owner_name: rand() > 0.5 ? ADMIN_NAME : DEMO_SUPER_ADMIN_NAME,
        status: plan.status,
        error_code: errorCode,
        error_codes: errorCode ? [errorCode] : [],
        remarks: pick([
          'Customer prefers WhatsApp follow up after 6pm.',
          'Wants delivery before month end.',
          'Asked about deposit options.',
          'Referred by an existing customer.',
          'Comparing with another shop, price sensitive.',
          ''
        ] as const),
        submitted_at: submittedAt,
        payslip_documents: [],
        bank_applications: bankApplications,
        personal_info: {
          marital_status: pick(['Single', 'Married'] as const),
          bank_name: pick(BANKS),
          account_number: String(randInt(100000000, 999999999)),
          email: `demo.customer${appIndex}@example.com`,
          full_address: `No ${randInt(2, 88)}, Jalan ${pick(['Melur', 'Kenanga', 'Semarak', 'Impian', 'Bakti'] as const)} ${randInt(1, 12)}, ${city}, ${state}`,
          years_at_residence: String(randInt(1, 9)),
          housing_status: pick(['Renting', 'Family Owned', 'Own House'] as const)
        },
        employment_details: {
          company_name: pick(['Sri Maju Trading', 'TechNova Sdn Bhd', 'Restoran Selera Kita', 'Mega Logistics', 'Kilang Elektronik MZ', 'GrabFood Rider'] as const),
          position: pick(['Technician', 'Operator', 'Supervisor', 'Rider', 'Clerk', 'Chef'] as const),
          years_employed: String(randInt(1, 8)),
          company_address: `${city}, ${state}`,
          office_phone_no: '',
          net_monthly_salary: String(randInt(1800, 4200))
        }
      };

      if (plan.status === LoanStatus.PENDING) {
        application.pending_with = 'Handler';
        application.pending_action = 'Provide Documents';
        application.pending_since = submittedAt;
        application.action_due_at = daysAhead(randInt(1, 3));
      }

      if (plan.status === LoanStatus.APPROVE && bankApplications[0]) {
        const offerAmount = Number(bankApplications[0].offer_amount) || loanAmount;
        const delivered = rand() > 0.4;
        application.deal_finance = {
          stock_unit_id: '',
          sale_status: delivered ? 'Bike Delivered' : 'Customer Accepted',
          automation_source: 'Application Workflow',
          approved_bank_name: bankApplications[0].bank_name,
          approved_bank_offer_amount: offerAmount,
          approved_bank_offer_at: bankApplications[0].approved_at,
          listed_selling_price: loanAmount,
          loan_amount: offerAmount,
          deposit_amount: 0,
          approved_discount: 0,
          final_selling_price: loanAmount,
          customer_deposit_received: delivered ? randInt(300, 800) : 0,
          customer_cash_payment: 0,
          bank_disbursement: delivered ? offerAmount : 0,
          other_income: 0,
          refund_amount: 0,
          direct_bank_charges: delivered ? randInt(80, 160) : 0,
          delivery_at: delivered ? daysAgo(randInt(0, 10)) : '',
          bank_disbursed_at: delivered ? daysAgo(randInt(0, 8)) : '',
          finance_completed_at: '',
          account_verified_at: '',
          account_verified_by: '',
          commission_status: delivered ? 'Earned' : 'Estimated',
          commission_amount: randInt(150, 420),
          commission_paid_at: '',
          updated_at: daysAgo(randInt(0, 5)),
          updated_by: DEMO_SUPER_ADMIN_NAME
        };
      }

      applications.push(application);
    }
  });

  return applications;
}

function buildRawLeads(): RawCustomerLead[] {
  const leads: RawCustomerLead[] = [];
  const followUps = ['New', 'Contacted', 'No Reply', 'Interested', 'Submitted Loan', 'Closed'] as const;

  for (let i = 0; i < 36; i += 1) {
    const channel = pick(CHANNELS);
    const [city, state] = pick(CITIES);
    const receivedDays = randInt(0, 45);
    const name = CUSTOMER_NAMES[(i * 7 + 11) % CUSTOMER_NAMES.length].split(' Bin ')[0].split(' Binti ')[0];
    const taken = rand() > 0.45;
    const takenBy = taken ? pick(SALES_NAMES) : undefined;
    const followUpStatus = taken ? pick(followUps) : 'New';

    leads.push({
      id: `DEMO-LEAD-${String(i + 1).padStart(3, '0')}`,
      channel,
      lead_id: `L${randInt(100000, 999999)}`,
      username: `${name.split(' ')[0].toLowerCase()}${randInt(10, 99)}`,
      received_at: daysAgo(receivedDays),
      raw_status: 'Complete',
      source_traffic: channel === 'Walk-in' ? 'Offline' : 'Paid Ads',
      source_action: channel === 'Walk-in' ? 'Walk-in visit' : 'Lead form',
      source_scenario: channel === 'Walk-in' ? '' : `${channel} lead campaign`,
      name,
      phone_no: fakePhone(),
      email: `demo.lead${i + 1}@example.com`,
      work_phone: '',
      work_email: '',
      whatsapp: '',
      messenger: '',
      instagram: channel === 'Instagram' ? `@${name.split(' ')[0].toLowerCase()}_${randInt(10, 99)}` : '',
      facebook: '',
      tiktok: channel === 'TikTok' ? `@${name.split(' ')[0].toLowerCase()}${randInt(100, 999)}` : '',
      city,
      state,
      country: 'Malaysia',
      company_name: '',
      job_title: '',
      imported_at: daysAgo(receivedDays),
      lead_visibility: 'Public',
      entry_method: channel === 'Walk-in' ? 'Manual Entry' : 'CSV Import',
      lead_scope: taken ? 'Taken Lead' : 'Public Lead',
      taken_by_staff_name: takenBy,
      taken_by_staff_role: taken ? 'Sales' : undefined,
      taken_at: taken ? daysAgo(Math.max(0, receivedDays - randInt(0, 2))) : undefined,
      follow_up_status: followUpStatus,
      last_follow_up_at: taken && followUpStatus !== 'New' ? daysAgo(randInt(0, 5)) : undefined,
      next_follow_up_at: taken && ['Contacted', 'No Reply', 'Interested'].includes(followUpStatus) ? daysAhead(randInt(1, 5)) : undefined,
      follow_up_note: taken && followUpStatus === 'Interested' ? 'Interested in Y15 ZR, waiting for payslip.' : ''
    });
  }

  return leads;
}

function buildRoleAccounts(): RoleAccount[] {
  return [
    ...INITIAL_ROLE_ACCOUNTS,
    { id: 'USR-030', name: ADMIN_NAME, email: 'demo.admin@example.invalid', role: 'Admin', status: 'Active' },
    { id: 'USR-031', name: OPS_NAME, email: 'demo.operations@example.invalid', role: 'Operations Manager', status: 'Active' }
  ];
}

function buildCalendarNotes(): CalendarNote[] {
  const notes: ReadonlyArray<readonly [title: string, body: string, inDays: number, staff: string]> = [
    ['Follow up Maybank officer', 'Check status for 3 pending submissions.', 1, ADMIN_NAME],
    ['Stock delivery - 4x Y15 ZR', 'Confirm chassis numbers on arrival.', 2, OPS_NAME],
    ['Call back approved customers', 'Two customers have accepted offers, arrange delivery slots.', 0, SALES_NAMES[0]],
    ['Monthly marketing review', 'Compare TikTok vs Facebook cost per lead.', 5, DEMO_SUPER_ADMIN_NAME],
    ['Renew road tax - shop van', 'Expires next week.', 6, OPS_NAME],
    ['Team briefing', 'New reject-code SOP walkthrough.', 3, DEMO_SUPER_ADMIN_NAME]
  ];

  return notes.map(([title, body, inDays, staff], index) => ({
    id: `DEMO-CAL-${index + 1}`,
    title,
    body,
    date_at: daysAhead(inDays),
    staff_name: staff,
    staff_role: staff === DEMO_SUPER_ADMIN_NAME ? 'Super Admin' : staff === ADMIN_NAME ? 'Admin' : staff === OPS_NAME ? 'Operations Manager' : 'Sales',
    created_at: daysAgo(randInt(1, 6))
  }));
}

function buildNotifications(applications: LoanApplication[]): NotificationItem[] {
  const items: NotificationItem[] = [];
  const approved = applications.filter((app) => app.status === LoanStatus.APPROVE).slice(0, 2);
  const pendingDocs = applications.filter((app) => app.status === LoanStatus.PENDING).slice(0, 2);
  const rejected = applications.filter((app) => app.status === LoanStatus.FOLLOW_UP).slice(0, 2);

  approved.forEach((app, index) => items.push({
    id: `DEMO-NOTIF-A${index}`,
    type: 'loan_approved',
    severity: 'success',
    title: 'Loan approved',
    message: `${app.applicant_name} · ${app.vehicle_model} approved by ${app.bank_applications[0]?.bank_name || 'bank'}.`,
    recipient_staff_names: [app.handler_name],
    recipient_roles: ['Super Admin'],
    target_type: 'loan',
    target_id: app.id,
    target_label: app.applicant_name,
    dedupe_key: `demo-approved-${app.id}`,
    created_at: daysAgo(randInt(0, 2)),
    read_by: []
  }));

  pendingDocs.forEach((app, index) => items.push({
    id: `DEMO-NOTIF-P${index}`,
    type: 'loan_documents_required',
    severity: 'warning',
    title: 'Documents required',
    message: `${app.applicant_name} still needs payslip and IC copy.`,
    recipient_staff_names: [app.handler_name],
    recipient_roles: ['Super Admin', 'Admin'],
    target_type: 'loan',
    target_id: app.id,
    target_label: app.applicant_name,
    dedupe_key: `demo-docs-${app.id}`,
    created_at: daysAgo(randInt(0, 3)),
    read_by: []
  }));

  rejected.forEach((app, index) => items.push({
    id: `DEMO-NOTIF-R${index}`,
    type: 'loan_rejected_action_required',
    severity: 'critical',
    title: 'Rejected - choose next step',
    message: `${app.applicant_name} was rejected. Decide resubmit or close.`,
    recipient_staff_names: [app.handler_name],
    recipient_roles: ['Super Admin', 'Admin'],
    target_type: 'loan',
    target_id: app.id,
    target_label: app.applicant_name,
    dedupe_key: `demo-reject-${app.id}`,
    created_at: daysAgo(randInt(0, 2)),
    read_by: []
  }));

  return items;
}

function buildApprovalRequests(): ApprovalRequest[] {
  return [
    {
      id: 'DEMO-APPR-1',
      type: 'sales_discount_request',
      status: 'Pending',
      requester_name: SALES_NAMES[0],
      requester_role: 'Sales',
      approver_roles: ['Super Admin', 'Operations Manager'],
      target_type: 'customer',
      target_id: 'DEMO-APP-004',
      target_label: 'RM200 discount - repeat customer',
      amount: 200,
      reason: 'Second purchase from the same family.',
      notes: '',
      submitted_at: daysAgo(1)
    },
    {
      id: 'DEMO-APPR-2',
      type: 'staff_sick_leave',
      status: 'Approved',
      requester_name: SALES_NAMES[4],
      requester_role: 'Sales',
      approver_roles: ['Super Admin', 'Operations Manager'],
      target_type: 'general',
      target_id: '',
      target_label: '1 day MC',
      amount: 0,
      reason: 'Fever, clinic MC attached.',
      notes: '',
      submitted_at: daysAgo(4),
      reviewed_by: DEMO_SUPER_ADMIN_NAME,
      reviewed_role: 'Super Admin',
      reviewed_at: daysAgo(3),
      review_note: 'Get well soon.'
    }
  ];
}

function buildMarketingSpend(): ChannelMarketingSpend[] {
  const rows: ChannelMarketingSpend[] = [];
  const spendByChannel: Record<string, number> = { TikTok: 1800, Facebook: 1500, Instagram: 700, Google: 400 };

  for (let offset = 0; offset < 3; offset += 1) {
    Object.entries(spendByChannel).forEach(([channel, base]) => {
      rows.push({
        id: `DEMO-SPEND-${channel}-${offset}`,
        month: monthKey(offset),
        channel,
        amount: Math.round(base * (0.85 + rand() * 0.3)),
        notes: '',
        updated_at: daysAgo(offset * 30 + 1),
        updated_by: DEMO_SUPER_ADMIN_NAME
      });
    });
  }

  return rows;
}

function buildWhatsAppTracking(): { links: WhatsAppTrackingLink[]; clicks: WhatsAppTrackingClick[] } {
  const links: WhatsAppTrackingLink[] = [
    { id: 'DEMO-WA-1', label: 'TikTok bio link', sales_name: SALES_NAMES[0], phone_number: '60112345678', channel: 'TikTok', medium: 'Social media', campaign: 'tiktok-bio', message: 'Hi, saya berminat dengan motor Y15.', active: true, created_at: daysAgo(40) },
    { id: 'DEMO-WA-2', label: 'Facebook ads CTA', sales_name: SALES_NAMES[1], phone_number: '60123456789', channel: 'Facebook', medium: 'Paid ads', campaign: 'fb-august', message: 'Hi, nak tanya pasal loan motor.', active: true, created_at: daysAgo(35) },
    { id: 'DEMO-WA-3', label: 'Google site button', sales_name: SALES_NAMES[6], phone_number: '60134567890', channel: 'Google', medium: 'Website', campaign: 'site-cta', message: 'Hi, saya dari website.', active: true, created_at: daysAgo(28) }
  ];

  const clicks: WhatsAppTrackingClick[] = [];
  for (let i = 0; i < 30; i += 1) {
    const link = pick(links);
    clicks.push({
      id: `DEMO-WA-CLICK-${i + 1}`,
      link_id: link.id,
      label: link.label,
      sales_name: link.sales_name,
      phone_number: link.phone_number,
      channel: link.channel,
      medium: link.medium,
      campaign: link.campaign,
      clicked_at: daysAgo(randInt(0, 27)),
      referrer: link.channel === 'TikTok' ? 'https://www.tiktok.com/' : link.channel === 'Facebook' ? 'https://m.facebook.com/' : 'https://www.google.com/',
      user_agent: 'Demo Browser'
    });
  }

  return { links, clicks };
}

function buildShortLinks(): CustomerIntakeShortLink[] {
  return [
    { id: 'DEMO-SL-1', code: 'demo-sales01-tt', full_url: 'https://dr-racing.example/customer-intake?utm_source=tiktok', source: 'TikTok', medium: 'Social media', staff_name: SALES_NAMES[0], staff_role: 'Sales', staff_utm: 'demo-sales01', active: true, created_at: daysAgo(30) },
    { id: 'DEMO-SL-2', code: 'demo-sales02-fb', full_url: 'https://dr-racing.example/customer-intake?utm_source=facebook', source: 'Facebook', medium: 'Paid ads', staff_name: SALES_NAMES[1], staff_role: 'Sales', staff_utm: 'demo-sales02', active: true, created_at: daysAgo(25) }
  ];
}

function buildAuditLogs(applications: LoanApplication[]): AuditLogEntry[] {
  const logs: AuditLogEntry[] = [];
  const recent = applications.slice(0, 10);

  recent.forEach((app, index) => {
    logs.push({
      id: `DEMO-AUDIT-${index + 1}`,
      staff_name: index % 3 === 0 ? DEMO_SUPER_ADMIN_NAME : index % 3 === 1 ? ADMIN_NAME : app.handler_name,
      staff_role: index % 3 === 0 ? 'Super Admin' : index % 3 === 1 ? 'Admin' : 'Sales',
      action: index % 2 === 0 ? 'UPDATE_STATUS' : 'CREATE_CUSTOMER',
      target_type: 'customer',
      target_id: app.id,
      target_label: app.applicant_name,
      changes: index % 2 === 0
        ? [{ field: 'status', old_value: 'NEW', new_value: app.status }]
        : [],
      ip_address: 'Unavailable',
      user_agent: 'Demo Browser',
      created_at: daysAgo(randInt(0, 6))
    });
  });

  return logs;
}

export function buildDemoDashboardSeed() {
  const applications = buildApplications();
  const whatsApp = buildWhatsAppTracking();

  return {
    applications,
    rawCustomerLeads: buildRawLeads(),
    roleAccounts: buildRoleAccounts(),
    calendarNotes: buildCalendarNotes(),
    notifications: buildNotifications(applications),
    approvalRequests: buildApprovalRequests(),
    channelMarketingSpend: buildMarketingSpend(),
    whatsAppTrackingLinks: whatsApp.links,
    whatsAppTrackingClicks: whatsApp.clicks,
    customerIntakeShortLinks: buildShortLinks(),
    auditLogs: buildAuditLogs(applications)
  };
}
