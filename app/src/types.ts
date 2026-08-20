/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LoanStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  IN_PROCESS = 'IN PROCESS',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  FOLLOW_UP = 'FOLLOW UP',
  CANCELLED = 'CANCELLED'
}

export type LoanPendingWith = 'Admin' | 'Handler' | 'Bank' | 'Closed';

export type LoanPendingAction =
  | 'Complete Application'
  | 'Review Application'
  | 'Provide Documents'
  | 'Submit to Bank'
  | 'Follow Up Bank'
  | 'Choose Close or Resubmit'
  | 'Resubmit to Bank'
  | 'Contact Approved Customer'
  | 'None';

export type LoanWorkflowAction =
  | 'NOTIFY_ADMIN'
  | 'REQUEST_MISSING_DOCUMENTS'
  | 'APPROVE_CASH_PURCHASE'
  | 'SUBMIT_TO_BANK'
  | 'DOCUMENTS_READY'
  | 'CLOSE_REJECTED'
  | 'COMPLETE_APPROVED_CONTACT'
  | 'UNDO_LAST_ACTION';

export const DEFAULT_VEHICLE_TAGS = ['Motorcycle'];

export const DEFAULT_VEHICLE_BRAND_TAGS = ['Yamaha', 'Honda', 'Modenas', 'Aveta', 'QJ Motor', 'CFMoto', 'Voge', 'Benda', 'SYM', 'Benelli', 'Moda', 'SM Sport', 'WMoto'];

export type VehicleTag = string;

export type VehicleBrandTag = string;

export type VehicleCondition = '' | 'New' | 'Used';

export type PurchaseMethod = '' | 'Cash' | 'Loan';

export type FinanceProfileId =
  | 'standard_loan'
  | 'net_loan'
  | 'voge_sr3_6_7y'
  | 'manual_special';

export type FinanceFormulaBase = 'loan' | 'net_loan';

export interface FinanceProfileTerm {
  years: 2 | 3 | 4 | 5 | 6 | 7;
  base: FinanceFormulaBase;
  multiplier: number;
}

export interface FinanceProfile {
  id: FinanceProfileId;
  label: string;
  description: string;
  terms: FinanceProfileTerm[];
}

export interface CommissionRules {
  deal_commission_percent?: number;
  per_approved_loan: number;
  leaderboard_first: number;
  leaderboard_second: number;
  leaderboard_third: number;
}

export const DEFAULT_COMMISSION_RULES: CommissionRules = {
  per_approved_loan: 100,
  leaderboard_first: 500,
  leaderboard_second: 300,
  leaderboard_third: 150
};

export const getDealCommissionQuote = (
  sellingPrice: number,
  rules: CommissionRules
): { percent?: number; amount: number } => {
  const rawPercent = rules.deal_commission_percent;
  const percent = typeof rawPercent === 'number' && Number.isFinite(rawPercent) && rawPercent >= 0
    ? Math.min(rawPercent, 100)
    : undefined;
  const normalizedPrice = Math.max(Number(sellingPrice) || 0, 0);

  return percent === undefined
    ? { amount: Math.max(Number(rules.per_approved_loan) || 0, 0) }
    : {
        percent,
        amount: Math.round(normalizedPrice * percent) / 100
      };
};

export interface AttendanceLatePenaltyRule {
  threshold_minutes: number;
  penalty_type: 'fixed_amount' | 'salary_days';
  amount: number;
  deduction_days: number;
}

export interface AttendancePolicy {
  work_start_time: string;
  work_end_time: string;
  overtime_next_day_start_time: string;
  late_grace_minutes: number;
  late_penalty_rules: AttendanceLatePenaltyRule[];
  require_office_wifi_for_check_in: boolean;
  office_network_ips: string[];
}

export const DEFAULT_ATTENDANCE_POLICY: AttendancePolicy = {
  work_start_time: '10:00',
  work_end_time: '19:00',
  overtime_next_day_start_time: '12:00',
  late_grace_minutes: 30,
  late_penalty_rules: [
    { threshold_minutes: 30, penalty_type: 'fixed_amount', amount: 20, deduction_days: 0 },
    { threshold_minutes: 60, penalty_type: 'salary_days', amount: 0.5, deduction_days: 0.5 }
  ],
  require_office_wifi_for_check_in: false,
  office_network_ips: []
};

export type AttendanceScheduleStatus = 'Working' | 'Off Day';

export interface AttendanceScheduleDay {
  date: string;
  status: AttendanceScheduleStatus;
}

export interface AttendanceWeeklySchedule {
  id: string;
  week_start: string;
  staff_name: string;
  staff_role: RoleAccountRole;
  monthly_salary: number;
  days: AttendanceScheduleDay[];
  updated_by: string;
  updated_role: RoleAccountRole;
  updated_at: string;
}

export const normalizeAttendanceNetworkIp = (value: unknown) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized === '::1') return '127.0.0.1';
  return normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
};

export const normalizeAttendancePolicy = (value: unknown): AttendancePolicy => {
  const source = value && typeof value === 'object'
    ? value as Partial<AttendancePolicy>
    : {};
  const workStartTime = typeof source.work_start_time === 'string'
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(source.work_start_time)
    ? source.work_start_time
    : DEFAULT_ATTENDANCE_POLICY.work_start_time;
  const workEndTime = typeof source.work_end_time === 'string'
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(source.work_end_time)
    ? source.work_end_time
    : DEFAULT_ATTENDANCE_POLICY.work_end_time;
  const overtimeNextDayStartTime = typeof source.overtime_next_day_start_time === 'string'
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(source.overtime_next_day_start_time)
    ? source.overtime_next_day_start_time
    : DEFAULT_ATTENDANCE_POLICY.overtime_next_day_start_time;
  const grace = Number(source.late_grace_minutes);
  const lateGraceMinutes = Number.isFinite(grace)
    ? Math.max(0, Math.min(240, Math.round(grace)))
    : DEFAULT_ATTENDANCE_POLICY.late_grace_minutes;
  const rawRules = Array.isArray(source.late_penalty_rules)
    ? source.late_penalty_rules
    : DEFAULT_ATTENDANCE_POLICY.late_penalty_rules;
  const officeNetworkIps = Array.isArray(source.office_network_ips)
    ? [...new Set(source.office_network_ips
      .slice(0, 20)
      .map(normalizeAttendanceNetworkIp)
      .filter((ip) => ip && ip.length <= 64))]
    : DEFAULT_ATTENDANCE_POLICY.office_network_ips;
  const uniqueRules = new Map<number, AttendanceLatePenaltyRule>();

  rawRules.slice(0, 10).forEach((rule) => {
    const threshold = Number(rule?.threshold_minutes);
    const penaltyType = rule?.penalty_type === 'fixed_amount' ? 'fixed_amount' : 'salary_days';
    const rawAmount = Number(rule?.amount ?? rule?.deduction_days);
    if (!Number.isFinite(threshold) || !Number.isFinite(rawAmount) || rawAmount <= 0) {
      return;
    }
    const thresholdMinutes = Math.max(0, Math.min(1440, Math.round(threshold)));
    const amount = penaltyType === 'fixed_amount'
      ? Math.max(0.01, Math.min(100000, Math.round(rawAmount * 100) / 100))
      : Math.max(0.25, Math.min(31, Math.round(rawAmount * 4) / 4));
    uniqueRules.set(thresholdMinutes, {
      threshold_minutes: thresholdMinutes,
      penalty_type: penaltyType,
      amount,
      deduction_days: penaltyType === 'salary_days' ? amount : 0
    });
  });

  return {
    work_start_time: workStartTime,
    work_end_time: workEndTime,
    overtime_next_day_start_time: overtimeNextDayStartTime,
    late_grace_minutes: lateGraceMinutes,
    late_penalty_rules: [...uniqueRules.values()]
      .sort((left, right) => left.threshold_minutes - right.threshold_minutes),
    require_office_wifi_for_check_in: Boolean(source.require_office_wifi_for_check_in),
    office_network_ips: officeNetworkIps
  };
};

export interface MonthlySettlementSnapshot {
  id: string;
  month: string;
  generated_at: string;
  generated_by: string;
  staff: Array<{
    staff_name: string;
    estimate: number;
    pending: number;
    approved: number;
    total: number;
    count: number;
    estimated?: number;
    earned?: number;
    payable?: number;
    paid?: number;
    reversed?: number;
  }>;
  team_battle: {
    teams: Array<{ name: string; approved_count: number }>;
    winner_name: string;
    is_tie: boolean;
  };
  commission_rules: CommissionRules;
}

const STANDARD_FINANCE_TERMS: FinanceProfileTerm[] = [
  { years: 2, base: 'loan', multiplier: 1.1992 },
  { years: 3, base: 'loan', multiplier: 1.2988 },
  { years: 4, base: 'loan', multiplier: 1.3984 },
  { years: 5, base: 'loan', multiplier: 1.498 }
];

const NET_LOAN_FINANCE_TERMS: FinanceProfileTerm[] = STANDARD_FINANCE_TERMS.map((term) => ({
  ...term,
  base: 'net_loan'
}));

export const FINANCE_PROFILES: FinanceProfile[] = [
  {
    id: 'standard_loan',
    label: 'Standard Loan',
    description: 'Base = Loan amount, standard 2Y-5Y multipliers.',
    terms: STANDARD_FINANCE_TERMS
  },
  {
    id: 'net_loan',
    label: 'Net Loan',
    description: 'Base = Loan amount - Deposit, standard 2Y-5Y multipliers.',
    terms: NET_LOAN_FINANCE_TERMS
  },
  {
    id: 'voge_sr3_6_7y',
    label: 'Voge SR3 6/7Y',
    description: 'Base = Loan amount - Deposit, supports 2Y-7Y special multipliers.',
    terms: [
      { years: 2, base: 'net_loan', multiplier: 1.1 },
      { years: 3, base: 'net_loan', multiplier: 1.15 },
      { years: 4, base: 'net_loan', multiplier: 1.2 },
      { years: 5, base: 'net_loan', multiplier: 1.25 },
      { years: 6, base: 'net_loan', multiplier: 1.3 },
      { years: 7, base: 'net_loan', multiplier: 1.35 }
    ]
  },
  {
    id: 'manual_special',
    label: 'Manual / Special Promo',
    description: 'No automatic formula. Use for special cases that should not use standard profiles.',
    terms: []
  }
];

export function findFinanceProfile(profileId: string | undefined, profiles: FinanceProfile[] = FINANCE_PROFILES) {
  return profiles.find((profile) => profile.id === profileId);
}

export function normalizeFinanceProfileId(profileId: string | undefined, profiles: FinanceProfile[] = FINANCE_PROFILES): FinanceProfileId | undefined {
  return findFinanceProfile(profileId, profiles)?.id;
}

export type CustomerRiskField =
  | 'ic_no'
  | 'phone_no'
  | 'account_number'
  | 'email';

export type CustomerRiskSeverity = 'warning' | 'high';

export interface CustomerRiskFlag {
  field: CustomerRiskField;
  label: string;
  value: string;
  severity: CustomerRiskSeverity;
  matching_application_ids: string[];
  matching_applicant_names: string[];
  message: string;
}

export interface VehiclePurchaseOption {
  id: string;
  vehicle_model: string;
  vehicle_brand: VehicleBrandTag;
  vehicle_tag: VehicleTag;
  vehicle_condition: VehicleCondition;
  purchase_method: PurchaseMethod;
  motor_selling_price?: string;
  deposit?: string;
  total_cash_price?: string;
  motor_mileage?: string;
  priority: number;
}

// Vehicle finance categories (Phase 1). Flat annual interest rate per category,
// with effective-date history so past prices/rates can be looked up. See
// src/data/vehicleCategories.ts for defaults + the monthly-installment compute.
export interface VehicleRateVersion {
  rate: number;            // flat annual interest, percent (10 = 10%/yr)
  effective_from: string;  // YYYY-MM-DD
  updated_at: string;
  updated_by: string;
}

export interface VehiclePriceVersion {
  loan_amount: number;     // financed principal
  deposit: number;         // optional down payment (net = loan_amount - deposit)
  effective_from: string;  // YYYY-MM-DD
  updated_at: string;
  updated_by: string;
}

export type VehicleStockStatus = 'In Stock' | 'Reserved' | 'Sold';

export interface VehicleStockUnit {
  id: string;
  number_plate: string;
  chassis_number: string;
  engine_number: string;
  supplier: string;
  purchase_cost: number;
  transport_cost: number;
  registration_cost: number;
  accessories_cost: number;
  repair_cost: number;
  other_direct_cost: number;
  received_at: string;
  status: VehicleStockStatus;
  reserved_application_id: string;
  sold_application_id: string;
  delivered_at: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface QuickStockInput {
  selling_price: number;
  loan_amount: number;
  deposit_amount: number;
  commission_amount?: number;
  purchase_cost: number;
  transport_cost: number;
  repair_cost: number;
  free_gift_cost: number;
  number_plate: string;
}

export interface VehicleCategory {
  id: string;
  name: string;
  cc_label: string;            // engine-size hint only (categories overlap on cc)
  default_max_tenure: number;  // years; per-model max_tenure can override
  active: boolean;
  rate_history: VehicleRateVersion[];
}

export interface VehicleCatalogItem {
  id: string;
  model: string;
  brand: VehicleBrandTag;
  body_type: VehicleTag;
  finance_profile?: FinanceProfileId;
  category_id?: string;              // vehicle finance category
  max_tenure?: number;               // per-model max loan years (overrides category)
  interest_rate_override?: number;   // per-model flat rate % (overrides category)
  price_history?: VehiclePriceVersion[]; // dated loan_amount/deposit versions
  stock_units?: VehicleStockUnit[];       // physical units and their actual landed costs
  series?: string;                   // model series/family override for grouping
  selling_price?: number;
  loan_amount?: number;
  deposit_amount?: number;
  installment_2y?: number;
  installment_3y?: number;
  installment_4y?: number;
  installment_5y?: number;
  installment_6y?: number;
  installment_7y?: number;
  installment_formula_base_2y?: 'loan' | 'net_loan';
  installment_formula_base_3y?: 'loan' | 'net_loan';
  installment_formula_base_4y?: 'loan' | 'net_loan';
  installment_formula_base_5y?: 'loan' | 'net_loan';
  installment_formula_base_6y?: 'loan' | 'net_loan';
  installment_formula_base_7y?: 'loan' | 'net_loan';
  installment_multiplier_2y?: number;
  installment_multiplier_3y?: number;
  installment_multiplier_4y?: number;
  installment_multiplier_5y?: number;
  installment_multiplier_6y?: number;
  installment_multiplier_7y?: number;
  cost_price?: number;
  profit_amount?: number;
  profit_review_month?: string;
  profit_reviewed_at?: string;
  profit_reviewed_by?: string;
  price_source?: string;
  created_at: string;
}

export interface MarketingTagRelationship {
  id: string;
  source: string;
  medium: string;
  category: string;
  created_at: string;
}

export type TagNormalizationDomain =
  | 'vehicle'
  | 'marketing'
  | 'bank_reject'
  | 'application_status_reason';

export interface TagNormalizationRule {
  id: string;
  domain: TagNormalizationDomain;
  raw_value: string;
  normalized_tag: string;
  parent_tag: string;
  category: string;
  active: boolean;
  created_at: string;
}

export interface BankDefinition {
  id: string;
  name: string;
  icon_data_url: string;
  active: boolean;
  created_at: string;
}

export const DEFAULT_BANK_DEFINITIONS: BankDefinition[] = [
  { id: 'BANK-MAYBANK', name: 'Maybank', icon_data_url: '', active: true, created_at: '2026-07-02T00:00:00.000Z' },
  { id: 'BANK-PUBLIC-BANK', name: 'Public Bank', icon_data_url: '', active: true, created_at: '2026-07-02T00:00:00.000Z' },
  { id: 'BANK-CIMB', name: 'CIMB', icon_data_url: '', active: true, created_at: '2026-07-02T00:00:00.000Z' },
  { id: 'BANK-HONG-LEONG-BANK', name: 'Hong Leong Bank', icon_data_url: '', active: true, created_at: '2026-07-02T00:00:00.000Z' },
  { id: 'BANK-RHB-BANK', name: 'RHB Bank', icon_data_url: '', active: true, created_at: '2026-07-02T00:00:00.000Z' }
];

export const DEFAULT_VEHICLE_CATALOG: VehicleCatalogItem[] = [];

export const DEFAULT_MARKETING_TAG_RELATIONSHIPS: MarketingTagRelationship[] = [
  { id: 'MKT-FACEBOOK', source: 'Facebook', medium: 'Social media', category: 'Lead source', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'MKT-TIKTOK', source: 'TikTok', medium: 'Social media', category: 'Lead source', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'MKT-INSTAGRAM', source: 'Instagram', medium: 'Social media', category: 'Lead source', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'MKT-GOOGLE', source: 'Google', medium: 'Search', category: 'Lead source', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'MKT-WALK-IN', source: 'Walk-in', medium: 'Offline', category: 'Lead source', created_at: '2026-06-30T00:00:00.000Z' }
];

export const DEFAULT_TAG_NORMALIZATION_RULES: TagNormalizationRule[] = [
  { id: 'NORM-VEH-Y15', domain: 'vehicle', raw_value: 'Y15', normalized_tag: 'Yamaha Y15ZR', parent_tag: 'Yamaha', category: 'Motorcycle', active: true, created_at: '2026-07-01T00:00:00.000Z' },
  { id: 'NORM-MKT-FB', domain: 'marketing', raw_value: 'fb', normalized_tag: 'Facebook', parent_tag: 'Social Media', category: 'Lead Source', active: true, created_at: '2026-07-01T00:00:00.000Z' },
  { id: 'NORM-MKT-FACEBOOK-ADS', domain: 'marketing', raw_value: 'facebook ads', normalized_tag: 'Facebook', parent_tag: 'Social Media', category: 'Lead Source', active: true, created_at: '2026-07-01T00:00:00.000Z' },
  { id: 'NORM-MKT-IG', domain: 'marketing', raw_value: 'ig', normalized_tag: 'Instagram', parent_tag: 'Social Media', category: 'Lead Source', active: true, created_at: '2026-07-01T00:00:00.000Z' },
  { id: 'NORM-BANK-LOW-INCOME', domain: 'bank_reject', raw_value: 'LOW_INCOME', normalized_tag: 'Income Not Enough', parent_tag: 'Financial Issue', category: 'Rejection Reason', active: true, created_at: '2026-07-01T00:00:00.000Z' },
  { id: 'NORM-STATUS-MISSING-DOC', domain: 'application_status_reason', raw_value: 'missing document', normalized_tag: 'Missing Document', parent_tag: 'Need More Info', category: 'Application Status Reason', active: true, created_at: '2026-07-01T00:00:00.000Z' }
];

export function normalizeVehicleModel(model: string) {
  return model.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function findVehicleCatalogItem(model: string, catalog: VehicleCatalogItem[] = DEFAULT_VEHICLE_CATALOG) {
  const normalizedModel = normalizeVehicleModel(model);
  if (!normalizedModel) {
    return undefined;
  }

  return catalog.find((item) => normalizeVehicleModel(item.model) === normalizedModel);
}

export function inferVehicleTagFromModel(_model: string, _catalog: VehicleCatalogItem[] = DEFAULT_VEHICLE_CATALOG): VehicleTag {
  return 'Motorcycle';
}

export function inferVehicleBrandFromModel(model: string, catalog: VehicleCatalogItem[] = DEFAULT_VEHICLE_CATALOG): VehicleBrandTag {
  const catalogItem = findVehicleCatalogItem(model, catalog);
  if (catalogItem) {
    return catalogItem.brand;
  }

  const normalizedModel = model.toLowerCase();

  if (normalizedModel.includes('yamaha') || normalizedModel.includes('y15') || normalizedModel.includes('y16') || normalizedModel.includes('lc 135') || normalizedModel.includes('lc135') || normalizedModel.includes('nvx') || normalizedModel.includes('ego') || normalizedModel.includes('r15') || normalizedModel.includes('mt-15') || normalizedModel.includes('n-max') || normalizedModel.includes('nmax') || normalizedModel.includes('pg-one')) {
    return 'Yamaha';
  }

  if (normalizedModel.includes('honda') || normalizedModel.includes('rs150') || normalizedModel.includes('rs-x') || normalizedModel.includes('rsx') || normalizedModel.includes('beat') || normalizedModel.includes('vario') || normalizedModel.includes('cbr') || normalizedModel.includes('adv') || normalizedModel.includes('dash') || normalizedModel.includes('alpha') || normalizedModel.includes('wave')) {
    return 'Honda';
  }

  if (normalizedModel.includes('modenas')) return 'Modenas';
  if (normalizedModel.includes('aveta') || normalizedModel.includes('ranger')) return 'Aveta';
  if (normalizedModel.includes('qj motor') || normalizedModel.includes('qjmotor')) return 'QJ Motor';
  if (normalizedModel.includes('cfmoto')) return 'CFMoto';
  if (normalizedModel.includes('voge')) return 'Voge';
  if (normalizedModel.includes('benda')) return 'Benda';
  if (normalizedModel.includes('sym')) return 'SYM';
  if (normalizedModel.includes('benelli')) return 'Benelli';
  if (normalizedModel.includes('moda')) return 'Moda';
  if (normalizedModel.includes('sm sport')) return 'SM Sport';
  if (normalizedModel.includes('wmoto')) return 'WMoto';

  return 'Other';
}

export function inferFinanceProfileFromVehicle(model: string, brand: VehicleBrandTag): FinanceProfileId {
  const normalizedModel = normalizeVehicleModel(model);

  if (normalizedModel.includes('voge sr3')) {
    return 'voge_sr3_6_7y';
  }

  if (normalizedModel.includes('promo')) {
    return 'manual_special';
  }

  if (brand === 'Honda') {
    return 'net_loan';
  }

  return 'standard_loan';
}

export interface LoanApplication {
  id: string;
  applicant_name: string;
  phone_no: string;
  ic_no: string;
  vehicle_plate: string;
  vehicle_model: string;
  vehicle_tag: VehicleTag;
  vehicle_brand: VehicleBrandTag;
  vehicle_condition?: VehicleCondition;
  purchase_method?: PurchaseMethod;
  vehicle_options?: VehiclePurchaseOption[];
  handler_name: string;
  handler_role: string;
  admin_owner_name?: string;
  pending_with?: LoanPendingWith;
  pending_action?: LoanPendingAction;
  pending_since?: string;
  action_due_at?: string;
  active_bank_application_id?: string;
  status: LoanStatus;
  error_code: string;
  error_codes?: string[];
  remarks: string;
  submitted_at: string; // ISO string format
  customer_call_back_at?: string;
  payslip_documents: PayslipDocument[];
  document_checklist?: CustomerDocumentChecklistItem[];
  bank_applications: BankApplication[];
  personal_info?: CustomerPersonalInfo;
  emergency_contacts?: EmergencyContact[];
  employment_details?: CustomerEmploymentDetails;
  preferences?: CustomerPreferences;
  deal_finance?: DealFinance;
  workflow_undo?: LoanWorkflowUndoCheckpoint;
  customer_intake_tracking?: CustomerIntakeTracking;
  activity_thread?: CustomerActivityEntry[];
}

export type ReversibleLoanWorkflowAction = Exclude<
  LoanWorkflowAction,
  'SUBMIT_TO_BANK' | 'UNDO_LAST_ACTION'
>;

export interface LoanWorkflowSnapshot {
  status: LoanStatus;
  admin_owner_name: string;
  pending_with: LoanPendingWith;
  pending_action: LoanPendingAction;
  pending_since: string;
  action_due_at: string;
  active_bank_application_id: string;
  error_code: string;
  error_codes: string[];
  bank_applications: BankApplication[];
  deal_finance?: DealFinance;
}

export interface LoanWorkflowUndoCheckpoint {
  action: ReversibleLoanWorkflowAction;
  actor_name: string;
  actor_role: RoleAccountRole;
  performed_at: string;
  snapshot: LoanWorkflowSnapshot;
}

export const getLoanPendingWith = (application: Pick<LoanApplication, 'status' | 'pending_with'>): LoanPendingWith => {
  if (application.pending_with) {
    return application.pending_with;
  }

  if ([LoanStatus.REJECT, LoanStatus.CANCELLED].includes(application.status)) return 'Closed';
  if (application.status === LoanStatus.NEW) return 'Admin';
  if (application.status === LoanStatus.PENDING || application.status === LoanStatus.FOLLOW_UP || application.status === LoanStatus.APPROVE) return 'Handler';
  return 'Bank';
};

export const getLoanPendingAction = (application: Pick<LoanApplication, 'status' | 'pending_action'>): LoanPendingAction => {
  if (application.pending_action) {
    return application.pending_action;
  }

  if (application.status === LoanStatus.NEW) return 'Review Application';
  if (application.status === LoanStatus.PENDING) return 'Provide Documents';
  if (application.status === LoanStatus.IN_PROCESS) return 'Follow Up Bank';
  if (application.status === LoanStatus.FOLLOW_UP) return 'Choose Close or Resubmit';
  if (application.status === LoanStatus.APPROVE) return 'Contact Approved Customer';
  return 'None';
};

export interface CustomerIntakeTracking {
  sales_name: string;
  sales_role: string;
  staff_utm?: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  shared_at: string;
  submitted_from: string;
  submitted_by_uid?: string;
  short_link_code?: string;
}

export interface CustomerIntakeShortLink {
  id: string;
  code: string;
  full_url: string;
  source: string;
  medium: string;
  staff_name: string;
  staff_role?: RoleAccountRole;
  admin_owner_name?: string;
  staff_utm: string;
  active: boolean;
  created_at: string;
}

export type RawCustomerChannel =
  | 'TikTok'
  | 'Facebook'
  | 'Instagram'
  | 'Google'
  | 'Walk-in'
  | 'Other';

export type RawLeadScope = 'Public Lead' | 'Taken Lead';

export type RawLeadVisibility = 'Public' | 'Private';

export type RawLeadEntryMethod = 'CSV Import' | 'Manual Entry' | 'System';

export type RawLeadFollowUpStatus =
  | 'New'
  | 'Contacted'
  | 'No Reply'
  | 'Interested'
  | 'Submitted Loan'
  | 'Rejected'
  | 'Closed';

export interface RawCustomerLead {
  id: string;
  channel: RawCustomerChannel;
  lead_id: string;
  username: string;
  received_at: string;
  raw_status: string;
  source_traffic: string;
  source_action: string;
  source_scenario: string;
  name: string;
  ic_no?: string;
  phone_no: string;
  account_number?: string;
  email: string;
  work_phone: string;
  work_email: string;
  whatsapp: string;
  messenger: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  city: string;
  state: string;
  country: string;
  company_name: string;
  job_title: string;
  imported_at: string;
  lead_visibility?: RawLeadVisibility;
  entry_method?: RawLeadEntryMethod;
  created_by_staff_id?: string;
  created_by_staff_name?: string;
  created_by_staff_role?: string;
  lead_scope?: RawLeadScope;
  taken_by_staff_id?: string;
  taken_by_staff_name?: string;
  taken_by_staff_role?: string;
  taken_at?: string;
  follow_up_status?: RawLeadFollowUpStatus;
  last_follow_up_at?: string;
  next_follow_up_at?: string;
  follow_up_note?: string;
  released_at?: string;
}

export interface CustomerRawMatch {
  raw_customer_id: string;
  raw_customer_name: string;
  raw_customer_phone: string;
  raw_customer_channel: RawCustomerChannel;
  raw_customer_lead_id: string;
  matched_fields: CustomerRiskField[];
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_status: LoanStatus;
  handler_name: string;
  submitted_at: string;
}

export interface CustomerPersonalInfo {
  /** Loan-specific demographic field used by customer intake and bank submission forms. */
  gender?: string;
  race?: string;
  marital_status: string;
  bank_name: string;
  account_number: string;
  email: string;
  /** Permanent address printed on the customer's IC. */
  full_address: string;
  resident_address?: string;
  years_at_residence: string;
  housing_status: string;
}

export interface EmergencyContact {
  full_name: string;
  relationship: string;
  full_address: string;
  phone_no: string;
}

export interface CustomerEmploymentDetails {
  company_name: string;
  position: string;
  years_employed: string;
  company_address: string;
  office_phone_no: string;
  /** @deprecated Legacy stored field. Current customer application forms do not collect it. */
  work_hours?: string;
  gross_monthly_salary?: string;
  net_monthly_salary?: string;
}

export interface CustomerPreferences {
  available_to_receive_calls: string;
  salary_payment_method: string;
  preferred_motorcycle: string;
  loan_tenure: string;
}

export type DealSaleStatus = 'Pending Acceptance' | 'Customer Accepted' | 'Bike Delivered' | 'Cancelled';
export type DealCommissionStatus = 'Estimated' | 'Earned' | 'Payable' | 'Paid' | 'Reversed';

export interface DealFinance {
  stock_unit_id: string;
  sale_status: DealSaleStatus;
  automation_source?: 'Application Workflow';
  approved_bank_name?: string;
  approved_bank_offer_amount?: number;
  approved_bank_offer_at?: string;
  listed_selling_price: number;
  /** Deal-specific financing amount entered by Super Admin in Quick Add Stock. */
  loan_amount?: number;
  /** Deal-specific agreed deposit; separate from money actually received. */
  deposit_amount?: number;
  approved_discount: number;
  final_selling_price: number;
  customer_deposit_received: number;
  customer_cash_payment: number;
  bank_disbursement: number;
  other_income: number;
  refund_amount: number;
  direct_bank_charges: number;
  recognized_stock_cost?: number;
  delivery_at: string;
  bank_disbursed_at: string;
  finance_completed_at: string;
  account_verified_at: string;
  account_verified_by: string;
  commission_status: DealCommissionStatus;
  commission_percent?: number;
  commission_amount: number;
  commission_paid_at: string;
  updated_at: string;
  updated_by: string;
}

export interface ChannelMarketingSpend {
  id: string;
  month: string; // YYYY-MM
  channel: string;
  amount: number;
  notes: string;
  updated_at: string;
  updated_by: string;
}

export interface PayslipDocument {
  id: string;
  document_key?: CustomerDocumentKey;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  file_data_url: string;
  download_url?: string;
  storage_path?: string;
}

export type CustomerDocumentKey =
  | 'ic'
  | 'payslip'
  | 'bank_statement'
  | 'vehicle_geran'
  | 'guarantor_doc';

export type CustomerDocumentStatus = 'Missing' | 'Received' | 'Not Required';

export interface CustomerDocumentChecklistItem {
  key: CustomerDocumentKey;
  label: string;
  status: CustomerDocumentStatus;
  note?: string;
  updated_at?: string;
  updated_by?: string;
}

export type BankApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending Review'
  | 'Need More Info'
  | 'Rejected'
  | 'Approved'
  | 'Cancelled';

export type BankOfferStatus =
  | 'No Offer'
  | 'Pending Decision'
  | 'Accepted'
  | 'Not Accepted'
  | 'Expired'
  | 'Withdrawn';

export const REJECT_REASON_CATEGORIES = [
  'Documents',
  'Information',
  'Affordability',
  'Credit',
  'Contact / Cooperation',
  'Customer Decision',
  'Compliance / Fraud',
  'Duplicate / Invalid'
] as const;

export type RejectReasonCategory = typeof REJECT_REASON_CATEGORIES[number];

export const REJECT_NEXT_STEPS = [
  'REQUEST_DOCUMENTS',
  'CORRECT_INFORMATION',
  'ADJUST_DEAL',
  'TRY_ANOTHER_BANK',
  'FOLLOW_UP_LATER',
  'CONVERT_TO_CASH',
  'CLOSE_REJECTED',
  'MERGE_DUPLICATE'
] as const;

export type RejectNextStepType = typeof REJECT_NEXT_STEPS[number];

export interface BankApplication {
  id: string;
  bank_name: string;
  round_no: number;
  submitted_by: string;
  submitted_at: string;
  status: BankApplicationStatus;
  reject_code: string;
  reject_reason: string;
  offer_amount: string;
  interest_rate: string;
  tenure: string;
  monthly_installment: string;
  approved_at: string;
  decision_at?: string;
  offer_status: BankOfferStatus;
  reason_category: string;
  status_reason: string;
  next_action: string;
  reject_next_step?: RejectNextStepType;
  next_follow_up_at?: string;
  notes: string;
}

export interface ErrorCodeDefinition {
  code: string;
  issue: string;
  customer_request: string;
  category?: RejectReasonCategory;
  default_next_step?: RejectNextStepType;
}

export type RoleAccountRole =
  | 'Super Admin'
  | 'Operations Manager'
  | 'Admin'
  | 'Sales';

export type RoleAccountStatus = 'Active' | 'Suspended';

// In-progress work owned by a staff name (for the Workload Transfer tool).
// `inSystem` is false when the owner no longer has a role account (orphaned attribution).
export interface StaffWorkloadSummary {
  name: string;
  customers: number;
  leads: number;
  inSystem: boolean;
  active: boolean;
}

export interface StaffWorkloadCase {
  id: string;
  owner_name: string;
  type: 'customer' | 'lead';
  label: string;
  meta: string;
}

export interface RoleAccount {
  id: string;
  name: string;
  email: string;
  firebase_auth_email?: string;
  firebase_uid?: string;
  role: RoleAccountRole;
  status: RoleAccountStatus;
  avatar_data_url?: string;
  default_avatar_id?: string;
  password_hash?: string;
}

export interface RolePermissionSetting {
  role: RoleAccountRole;
  page_id: string;
  section_id: string;
  enabled: boolean;
  updated_at?: string;
  updated_by?: string;
}

// Super-Admin-configurable page and inside-page detail access for Admin / Sales.
// Super Admin is never stored here (it always has full access). Detail keys stay
// flat (for example dataExport.customers) to preserve the persisted data shape.
export interface RoleNavAccessSetting {
  role: RoleAccountRole;
  nav_key: string;
  enabled: boolean;
  updated_at?: string;
  updated_by?: string;
}

export interface StaffDefaultAvatar {
  id: string;
  label: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  avatar_data_url: string;
}

export type CustomMissionMetricType =
  | 'top_sales_approved'
  | 'fast_response'
  | 'raw_lead_conversion';

export type CustomMissionTimeframe =
  | 'this_month'
  | 'last_month'
  | 'last_30_days'
  | 'custom';

export type CustomMissionScopeType =
  | 'all_staff'
  | 'role'
  | 'staff';

export type CustomMissionStatus = 'Active' | 'Archived';

export interface CustomMission {
  id: string;
  title: string;
  metric_type: CustomMissionMetricType;
  target_value: number;
  reward_amount: number;
  timeframe: CustomMissionTimeframe;
  custom_start_date?: string;
  custom_end_date?: string;
  scope_type: CustomMissionScopeType;
  scope_value: string;
  status: CustomMissionStatus;
  created_at: string;
  created_by: string;
}

export type RewardTeamStatus = 'Active' | 'Archived';

export interface RewardTeam {
  id: string;
  name: string;
  member_names: string[];
  bonus_amount: number;
  status: RewardTeamStatus;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export type ApprovalRequestType =
  | 'sales_discount_request'
  | 'special_loan_case'
  | 'cash_discount'
  | 'extra_commission'
  | 'mission_reward'
  | 'staff_sick_leave';

export type ApprovalRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface ApprovalRequest {
  id: string;
  type: ApprovalRequestType;
  status: ApprovalRequestStatus;
  requester_name: string;
  requester_role: RoleAccountRole;
  approver_roles: RoleAccountRole[];
  target_type: 'customer' | 'mission' | 'general';
  target_id: string;
  target_label: string;
  amount: number;
  reason: string;
  notes: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_role?: RoleAccountRole;
  reviewed_at?: string;
  review_note?: string;
  mc_attachment?: {
    name: string;
    type: string;
    size: number;
    uploaded_at: string;
    file_data_url: string;
  };
}

export interface CalendarTaskComment {
  id: string;
  body: string;
  staff_name: string;
  staff_role: RoleAccountRole;
  created_at: string;
}

export interface CalendarNote {
  id: string;
  title: string;
  body: string;
  date_at: string;
  staff_name: string;
  staff_role: RoleAccountRole;
  assigned_to?: string;
  assigned_role?: RoleAccountRole;
  comments?: CalendarTaskComment[];
  completed_at?: string;
  completed_by?: string;
  created_at: string;
}

export interface WhatsAppTrackingLink {
  id: string;
  label: string;
  sales_name: string;
  phone_number: string;
  channel: string;
  medium: string;
  campaign: string;
  message: string;
  active: boolean;
  created_at: string;
}

export interface WhatsAppTrackingClick {
  id: string;
  link_id: string;
  label: string;
  sales_name: string;
  phone_number: string;
  channel: string;
  medium: string;
  campaign: string;
  clicked_at: string;
  referrer: string;
  user_agent: string;
}

export interface AuditLogEntry {
  id: string;
  staff_name: string;
  staff_role: string;
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: {
    field: string;
    old_value: string;
    new_value: string;
  }[];
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export type CustomerActivityType = 'comment' | 'status_change' | 'system';

export interface CustomerActivityEntry {
  id: string;
  type: CustomerActivityType;
  body: string;
  staff_name: string;
  staff_role: RoleAccountRole;
  created_at: string;
  tagged_staff_names: string[];
  tagged_roles: RoleAccountRole[];
  from_status?: LoanStatus;
  to_status?: LoanStatus;
}

export type NotificationType =
  | 'raw_lead_assigned'
  | 'calendar_task_assigned'
  | 'calendar_task_comment'
  | 'mission_due_soon'
  | 'bank_submission_required'
  | 'bank_need_more_info'
  | 'bank_follow_up_due'
  | 'loan_sales_review_required'
  | 'loan_admin_action_required'
  | 'loan_documents_required'
  | 'loan_documents_uploaded'
  | 'loan_rejected_action_required'
  | 'loan_approved'
  | 'vehicle_stock_required'
  | 'customer_call_back_due'
  | 'custom_mission_target_reached'
  | 'rejected_loan_missing_code'
  | 'internal_comment_tagged';

export type NotificationSeverity = 'info' | 'warning' | 'success' | 'critical';

export type NotificationTargetType = 'raw_lead' | 'customer' | 'mission' | 'loan' | 'calendar_note';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  recipient_staff_names: string[];
  recipient_roles: RoleAccountRole[];
  target_type: NotificationTargetType;
  target_id: string;
  target_label: string;
  dedupe_key: string;
  created_at: string;
  read_by: string[];
  resolved_at?: string;
}

export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const STATUS_CONFIG: Record<LoanStatus, StatusStyle> = {
  [LoanStatus.NEW]: {
    label: '新申请 (NEW)',
    bg: 'bg-blue-50/70',
    text: 'text-blue-600',
    border: 'border-blue-100',
    dot: 'bg-blue-500'
  },
  [LoanStatus.PENDING]: {
    label: '待处理 (PENDING)',
    bg: 'bg-amber-50/70',
    text: 'text-amber-600',
    border: 'border-amber-100',
    dot: 'bg-amber-500'
  },
  [LoanStatus.IN_PROCESS]: {
    label: '审批中 (IN PROCESS)',
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
    dot: 'bg-indigo-500'
  },
  [LoanStatus.APPROVE]: {
    label: '已通过 (APPROVE)',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    dot: 'bg-emerald-500'
  },
  [LoanStatus.REJECT]: {
    label: '已拒绝 (REJECT)',
    bg: 'bg-rose-50/70',
    text: 'text-rose-600',
    border: 'border-rose-100',
    dot: 'bg-rose-500'
  },
  [LoanStatus.FOLLOW_UP]: {
    label: '需跟进 (FOLLOW UP)',
    bg: 'bg-purple-50/70',
    text: 'text-purple-600',
    border: 'border-purple-100',
    dot: 'bg-purple-500'
  },
  [LoanStatus.CANCELLED]: {
    label: '已取消 (CANCELLED)',
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dot: 'bg-slate-400'
  }
};
