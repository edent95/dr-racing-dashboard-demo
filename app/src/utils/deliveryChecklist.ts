/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The post-approval delivery checklist (owner meeting 2026-10-13). It replaces
 * the WhatsApp groups the shop passes information through today: each step is
 * recorded once, on the Delivery page, and the next owner is notified.
 *
 * firestore.rules mirrors DELIVERY_STEPS: Sales may record only the Sales
 * steps of their own files, Admin only the Admin steps, and Operations Manager
 * / Super Admin every step. Keep the two lists in step.
 */

import type {
  DeliveryChecklist,
  DeliveryPayment,
  DeliveryStepKey,
  DeliveryStepRecord,
  LoanApplication,
  RoleAccountRole
} from '../types';
import { isOperationsLead } from './staffRoles';
import { fieldLabelTriple, RM } from '../data/fieldLabels';

export type DeliveryStepOwner = 'Sales' | 'Admin' | 'Operations Manager';
export type DeliveryPhase = 'before_delivery' | 'after_delivery';

export interface DeliveryStepDefinition {
  key: DeliveryStepKey;
  /** Who records it in the shop's flow. Operations Manager and Super Admin may record every step. */
  owners: DeliveryStepOwner[];
  /** Steps before delivery must all be done before Mark Bike Delivered. */
  phase: DeliveryPhase;
  label: [string, string, string];
}

export const DELIVERY_STEPS: DeliveryStepDefinition[] = [
  // Owner 2026-10-20: Admin fills the full loan check; Sales only reads it.
  { key: 'full_loan_check', owners: ['Admin'], phase: 'before_delivery', label: ['核对 full loan', 'Check full loan', 'Semak pinjaman penuh'] },
  { key: 'collect_payment', owners: ['Sales'], phase: 'before_delivery', label: ['向客户收款', 'Collect payment', 'Kutip bayaran'] },
  // Owner 2026-10-21: Operations orders the bike (Sales recorded it before).
  { key: 'motor_order', owners: ['Operations Manager'], phase: 'before_delivery', label: ['新车下单', 'Order the motor', 'Tempah motor'] },
  { key: 'arrival_check', owners: ['Admin'], phase: 'before_delivery', label: ['到车核对引擎号 / 底盘号', 'Check engine and chassis on arrival', 'Semak enjin dan casis semasa tiba'] },
  { key: 'k1', owners: ['Admin'], phase: 'before_delivery', label: ['打 K1', 'Key in K1', 'Isi K1'] },
  { key: 'insurance', owners: ['Admin'], phase: 'before_delivery', label: ['买保险', 'Buy insurance', 'Beli insurans'] },
  { key: 'jpj_registration', owners: ['Admin'], phase: 'before_delivery', label: ['JPJ 注册', 'Register with JPJ', 'Daftar JPJ'] },
  { key: 'print_agreement', owners: ['Admin'], phase: 'before_delivery', label: ['打印合约', 'Print agreement', 'Cetak perjanjian'] },
  { key: 'customer_contact', owners: ['Sales'], phase: 'before_delivery', label: ['通知客户取车 / 送车', 'Arrange pick-up or delivery', 'Atur ambil atau hantar'] },
  { key: 'customer_sign', owners: ['Sales'], phase: 'before_delivery', label: ['客户签合约', 'Customer signs agreement', 'Pelanggan tandatangan perjanjian'] },
  // Owner 2026-10-18: Operations no longer retypes the figures; it double-checks
  // them (price, loan, deposit, payments, stock unit) before the bike leaves.
  { key: 'ops_check', owners: ['Operations Manager'], phase: 'before_delivery', label: ['Operations 核对', 'Operations check', 'Semakan Operasi'] },
  { key: 'sales_claim', owners: ['Admin'], phase: 'after_delivery', label: ['销售申报', 'Sales claim', 'Tuntutan jualan'] },
  { key: 'documentation', owners: ['Admin'], phase: 'after_delivery', label: ['文件清单', 'Documentation checklist', 'Senarai semak dokumen'] },
  { key: 'invoice', owners: ['Admin'], phase: 'after_delivery', label: ['开发票', 'Issue invoice', 'Keluarkan invois'] }
];

export const DELIVERY_STEP_KEYS = DELIVERY_STEPS.map((step) => step.key);

export const getDeliveryStep = (key: DeliveryStepKey) => DELIVERY_STEPS.find((step) => step.key === key);

export const createEmptyDeliveryStepRecord = (): DeliveryStepRecord => ({
  done_at: '',
  done_by: '',
  done_by_role: '',
  note: '',
  document_ids: [],
  data: {}
});

export const createEmptyDeliveryChecklist = (): DeliveryChecklist => ({
  steps: {},
  updated_at: '',
  updated_by: ''
});

export const isDeliveryStepDone = (checklist: DeliveryChecklist | undefined, key: DeliveryStepKey) => (
  Boolean(checklist?.steps?.[key]?.done_at)
);

/**
 * Whether this staff member may record or reopen the step. An Admin who is the
 * file's handler also does the Sales steps, as elsewhere in the app.
 */
export const canRecordDeliveryStep = (
  key: DeliveryStepKey,
  staff: { role: RoleAccountRole; name: string },
  application: { handler_name: string }
) => {
  const step = getDeliveryStep(key);
  if (!step) return false;
  if (staff.role === 'Super Admin' || staff.role === 'Operations Manager') return true;
  if (staff.role === 'Admin') {
    return step.owners.includes('Admin')
      || (step.owners.includes('Sales') && application.handler_name === staff.name);
  }
  return staff.role === 'Sales' && step.owners.includes('Sales') && application.handler_name === staff.name;
};

/** Steps 1-11 (through the Operations check) that still block Mark Bike Delivered. */
export const getOpenStepsBeforeDelivery = (checklist: DeliveryChecklist | undefined) => (
  DELIVERY_STEPS
    .filter((step) => step.phase === 'before_delivery' && !isDeliveryStepDone(checklist, step.key))
    .map((step) => step.key)
);

export const isReadyForDelivery = (checklist: DeliveryChecklist | undefined) => (
  getOpenStepsBeforeDelivery(checklist).length === 0
);

/** The first open step, i.e. whose turn it is; undefined when every step is done. */
export const getNextDeliveryStep = (checklist: DeliveryChecklist | undefined) => (
  DELIVERY_STEPS.find((step) => !isDeliveryStepDone(checklist, step.key))
);

export const getDeliveryProgress = (checklist: DeliveryChecklist | undefined) => {
  const done = DELIVERY_STEPS.filter((step) => isDeliveryStepDone(checklist, step.key)).length;
  return { done, total: DELIVERY_STEPS.length };
};

/**
 * Full loan check: does the approved loan plus the agreed deposit cover the
 * selling price? A positive shortfall is what Sales still has to collect. The
 * AGM and roadtax & insurance fees are inside the price (owner 2026-10-21), so
 * they never add to it.
 */
export const getFullLoanCheck = (input: { sellingPrice: number; approvedLoan: number; deposit: number }) => {
  const sellingPrice = Math.max(0, Number(input.sellingPrice) || 0);
  const approvedLoan = Math.max(0, Number(input.approvedLoan) || 0);
  const deposit = Math.max(0, Number(input.deposit) || 0);
  const shortfall = Math.round((sellingPrice - approvedLoan - deposit) * 100) / 100;
  return {
    sellingPrice,
    approvedLoan,
    deposit,
    shortfall: Math.max(0, shortfall),
    isFullLoan: shortfall <= 0
  };
};

/** Money actually received: every payment that has not been voided. */
export const getCollectedPaymentTotal = (payments: DeliveryPayment[]) => (
  Math.round(payments
    .filter((payment) => !payment.voided_at)
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) * 100) / 100
);

/**
 * Settlement against the payments Sales recorded (meeting 2026-10-13: the money
 * collected must match what finance books). `entered` is the deposit plus the
 * customer cash typed in the settlement; `difference` > 0 means more was recorded
 * than entered. Only a deal with no payment rows at all skips the check (older deals);
 * once a payment was recorded, voiding every row reconciles against RM0 (audit 2026-10-21).
 */
export const reconcileSettlementReceipts = (
  payments: DeliveryPayment[],
  input: { deposit: unknown; cash: unknown }
) => {
  const live = payments.filter((payment) => !payment.voided_at);
  const collected = getCollectedPaymentTotal(payments);
  const deposit = Math.max(0, Number(input.deposit) || 0);
  const cash = Math.max(0, Number(input.cash) || 0);
  const entered = Math.round((deposit + cash) * 100) / 100;
  const difference = Math.round((collected - entered) * 100) / 100;
  return {
    count: live.length,
    collected,
    entered,
    difference,
    hasPayments: live.length > 0,
    hasRecords: payments.length > 0,
    matches: payments.length === 0 || Math.abs(difference) < 0.01,
    // Keep the deposit as typed when it fits; the rest of the collected money is cash.
    fill: deposit <= collected
      ? { customer_deposit_received: deposit, customer_cash_payment: Math.round((collected - deposit) * 100) / 100 }
      : { customer_deposit_received: collected, customer_cash_payment: 0 }
  };
};

export type DeliveryFieldType = 'text' | 'money' | 'date' | 'datetime' | 'select';

export interface DeliveryStepField {
  key: string;
  label: [string, string, string];
  type: DeliveryFieldType;
  /** Must be filled before the step can be marked done. */
  required?: boolean;
  uppercase?: boolean;
  options?: Array<{ value: string; label: [string, string, string] }>;
  /** Only asked on Loan files (a Cash sale has no hire purchase agreement). */
  loanOnly?: boolean;
  /** Shown behind an info icon next to the label, so the label itself stays short. */
  hint?: [string, string, string];
}

export const MALAYSIA_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang',
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
];

const stateOptions = MALAYSIA_STATES.map((state) => ({ value: state, label: [state, state, state] as [string, string, string] }));

/**
 * What each step records (owner meeting 2026-10-13). Payments and the files
 * (HP PDF, photos, K1, policy, signed agreement) are recorded separately.
 */
export const HP_SIGNED_VALUE = 'Signed';

export const DELIVERY_STEP_FIELDS: Partial<Record<DeliveryStepKey, DeliveryStepField[]>> = {
  // Owner meeting: when Sales collect the payment the customer signs the hire
  // purchase agreement; only then is Operations asked to add stock.
  collect_payment: [
    {
      key: 'hp_signed',
      label: ['客户已签 Hire Purchase 合约', 'Customer signed the hire purchase agreement', 'Pelanggan menandatangani perjanjian sewa beli'],
      type: 'select',
      required: true,
      loanOnly: true,
      options: [{ value: HP_SIGNED_VALUE, label: ['已签,确认', 'Signed, confirmed', 'Sudah ditandatangani, disahkan'] }]
    }
  ],
  full_loan_check: [
    { key: 'selling_price', label: fieldLabelTriple('sellingPrice', RM), type: 'money', required: true },
    { key: 'approved_loan', label: fieldLabelTriple('approvedLoan', RM), type: 'money', required: true },
    { key: 'deposit', label: fieldLabelTriple('deposit', RM), type: 'money', required: true },
    // Owner meeting 2026-10-13: the deal's extra amounts, all optional. The two
    // fees are part of the selling price above (owner 2026-10-21), recorded as
    // its breakdown; the free gift is the shop's cost; the discount is already
    // off the selling price above.
    { key: 'agm_fee', label: ['AGM 费 (RM)', 'AGM fee (RM)', 'Yuran AGM (RM)'], hint: ['已含在售价内。', 'Already included in the selling price.', 'Sudah termasuk dalam harga jualan.'], type: 'money' },
    { key: 'roadtax_insurance_fee', label: ['路税 + 保险费 (RM)', 'Roadtax & insurance (RM)', 'Cukai jalan & insurans (RM)'], hint: ['已含在售价内。', 'Already included in the selling price.', 'Sudah termasuk dalam harga jualan.'], type: 'money' },
    { key: 'free_gift', label: ['赠品成本 (RM)', 'Free gift cost (RM)', 'Kos hadiah percuma (RM)'], hint: ['店里付的成本,不向客户收。', 'The shop\'s cost; not charged to the customer.', 'Kos kedai; tidak dicaj kepada pelanggan.'], type: 'money' },
    { key: 'discount', label: ['折扣 (RM)', 'Discount (RM)', 'Diskaun (RM)'], hint: ['已从售价扣掉。', 'Already taken off the selling price.', 'Sudah ditolak daripada harga jualan.'], type: 'money' }
  ],
  motor_order: [
    { key: 'color', label: fieldLabelTriple('colour'), type: 'text', required: true },
    { key: 'plate_number', label: fieldLabelTriple('plateNumber'), type: 'text', uppercase: true },
    { key: 'negeri', label: ['Negeri(注册州属)', 'Negeri (registration state)', 'Negeri'], type: 'select', options: stateOptions }
  ],
  arrival_check: [
    { key: 'engine_number', label: fieldLabelTriple('engineNumber'), type: 'text', required: true, uppercase: true },
    { key: 'chassis_number', label: fieldLabelTriple('chassisNumber'), type: 'text', required: true, uppercase: true }
  ],
  k1: [
    { key: 'k1_reference', label: ['K1 参考号', 'K1 reference', 'Rujukan K1'], type: 'text', uppercase: true }
  ],
  insurance: [
    { key: 'insurer', label: ['保险公司', 'Insurer', 'Syarikat insurans'], type: 'text', required: true },
    { key: 'policy_number', label: ['保单号', 'Policy number', 'Nombor polisi'], type: 'text', required: true, uppercase: true },
    // The amount paid to the insurer; the deal P&L counts it as a cost.
    { key: 'premium', label: fieldLabelTriple('insuranceAmount', RM), type: 'money' }
  ],
  jpj_registration: [
    { key: 'registration_date', label: ['注册日期', 'Registration date', 'Tarikh pendaftaran'], type: 'date', required: true },
    { key: 'number_plate', label: fieldLabelTriple('plateNumber'), type: 'text', uppercase: true },
    { key: 'fee', label: fieldLabelTriple('jpjFee', RM), type: 'money' }
  ],
  customer_contact: [
    {
      key: 'method',
      label: ['取车 / 送车', 'Pick-up or delivery', 'Ambil atau hantar'],
      type: 'select',
      required: true,
      options: [
        { value: 'Pick-up', label: ['客户来取车', 'Customer picks up', 'Pelanggan ambil'] },
        { value: 'Delivery', label: ['送车给客户', 'Deliver to customer', 'Hantar kepada pelanggan'] }
      ]
    },
    { key: 'appointment_at', label: ['约好的时间', 'Appointment', 'Temujanji'], type: 'datetime', required: true },
    { key: 'address', label: ['送车地址', 'Delivery address', 'Alamat penghantaran'], type: 'text' }
  ],
  customer_sign: [
    { key: 'signed_at', label: ['签约日期', 'Signed on', 'Tarikh ditandatangani'], type: 'date', required: true }
  ],
  // Operations' own costs for the deal P&L (owner meeting 2026-10-13). Repair
  // stays on the stock unit (repair_cost), so it is not asked again here. The
  // AGM payout is what the shop actually paid for the AGM (owner 2026-10-21).
  ops_check: [
    { key: 'delivery_fee', label: ['运车费 (RM)', 'Delivery fee (RM)', 'Yuran penghantaran (RM)'], type: 'money' },
    { key: 'agm_payout', label: ['AGM 实际支出 (RM)', 'AGM actually paid (RM)', 'AGM sebenar dibayar (RM)'], type: 'money' }
  ],
  sales_claim: [
    { key: 'claim_reference', label: ['申报编号', 'Claim reference', 'Rujukan tuntutan'], type: 'text', uppercase: true },
    { key: 'claim_amount', label: ['申报金额 (RM)', 'Claim amount (RM)', 'Amaun tuntutan (RM)'], type: 'money' }
  ],
  invoice: [
    { key: 'invoice_number', label: ['发票号码', 'Invoice number', 'Nombor invois'], type: 'text', required: true, uppercase: true },
    { key: 'invoice_date', label: ['发票日期', 'Invoice date', 'Tarikh invois'], type: 'date' }
  ]
};

export const getDeliveryStepFields = (key: DeliveryStepKey, purchaseMethod?: string) => (
  (DELIVERY_STEP_FIELDS[key] || []).filter((field) => !field.loanOnly || purchaseMethod !== 'Cash')
);

export const getMissingRequiredDeliveryFields = (key: DeliveryStepKey, data: Record<string, string>, purchaseMethod?: string) => (
  getDeliveryStepFields(key, purchaseMethod).filter((field) => field.required && !String(data[field.key] || '').trim())
);

/**
 * Operations is asked to source the bike only once Sales closed Collect
 * payment; on a Loan file that close also confirms the signed hire purchase
 * agreement (owner meeting). A Cash sale has no agreement, so its close is enough.
 */
export const isReadyForStock = (application: Pick<LoanApplication, 'purchase_method' | 'delivery_checklist'>) => {
  const step = application.delivery_checklist?.steps?.collect_payment;
  if (!step?.done_at) return false;
  return application.purchase_method === 'Cash' || step.data?.hp_signed === HP_SIGNED_VALUE;
};

const firstText = (...values: unknown[]) => {
  const found = values.find((value) => String(value ?? '').trim() !== '' && String(value) !== '0');
  return found === undefined ? '' : String(found).trim();
};

/**
 * Values a step starts with when it has none yet, taken from what the app
 * already knows, so staff confirm instead of retyping.
 */
export const getDeliveryStepDefaults = (application: LoanApplication, key: DeliveryStepKey): Record<string, string> => {
  const approvedBank = [...(application.bank_applications || [])].reverse().find((bank) => bank.status === 'Approved');
  const primaryOption = application.vehicle_options?.[0];
  const latestExchange = application.unit_exchanges?.at(-1);
  const steps = application.delivery_checklist?.steps || {};
  switch (key) {
    case 'full_loan_check':
      return {
        selling_price: firstText(application.deal_finance?.final_selling_price, approvedBank?.selling_price, primaryOption?.motor_selling_price),
        approved_loan: firstText(latestExchange?.loan_amount, approvedBank?.offer_amount),
        deposit: firstText(approvedBank?.deposit_amount, primaryOption?.deposit) || '0'
      };
    case 'motor_order':
      return { plate_number: firstText(latestExchange?.number_plate, application.vehicle_plate) };
    case 'arrival_check':
      return { engine_number: firstText(approvedBank?.engine_number), chassis_number: firstText(approvedBank?.chassis_number) };
    case 'jpj_registration':
      return { number_plate: firstText(steps.motor_order?.data?.plate_number, application.vehicle_plate) };
    case 'customer_contact':
      return { address: firstText(application.personal_info?.resident_address, application.personal_info?.full_address) };
    default:
      return {};
  }
};

/** What to attach on each step; every attachment is optional. */
export const DELIVERY_STEP_ATTACHMENT_HINTS: Partial<Record<DeliveryStepKey, [string, string, string]>> = {
  collect_payment: ['签好的 Hire Purchase 合约 (照片或 PDF)', 'Signed hire purchase agreement (photo or PDF)', 'Perjanjian sewa beli yang ditandatangani (foto atau PDF)'],
  motor_order: ['车颜色的照片、下单表格 (图片或 PDF)', 'photo of the motor colour, order form (image or PDF)', 'foto warna motor, borang tempahan (imej atau PDF)'],
  arrival_check: ['引擎号 / 底盘号照片', 'Photo of the engine and chassis numbers', 'Foto nombor enjin dan casis'],
  k1: ['K1 文件', 'K1 form', 'Borang K1'],
  insurance: ['保单', 'Insurance policy', 'Polisi insurans'],
  jpj_registration: ['JPJ 注册文件 / Geran', 'JPJ registration / geran', 'Pendaftaran JPJ / geran'],
  print_agreement: ['合约 PDF', 'Agreement PDF', 'PDF perjanjian'],
  customer_sign: ['签好的合约照片', 'Photo of the signed agreement', 'Foto perjanjian ditandatangani'],
  sales_claim: ['申报表', 'Claim form', 'Borang tuntutan'],
  documentation: ['其他文件', 'Other documents', 'Dokumen lain'],
  invoice: ['发票', 'Invoice', 'Invois']
};

/**
 * Who may attach files: Storage Rules let the file's owners (its Sales
 * handler, its Admin), Operations Manager and Super Admin write
 * customer_documents (Operations since 2026-10-20).
 */
export const canAttachDeliveryFiles = (
  staff: { role: RoleAccountRole; name: string },
  application: { handler_name: string; admin_owner_name?: string }
) => (
  isOperationsLead(staff.role)
  || application.handler_name === staff.name
  || (staff.role === 'Admin' && application.admin_owner_name === staff.name)
);
