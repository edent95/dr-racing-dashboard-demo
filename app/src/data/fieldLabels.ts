import { tr } from '../lib/i18n';

type Label = readonly [zh: string, en: string, ms: string];

/**
 * One visible name per piece of data (owner 2026-10-21: "全部一样的 input 要一样的名字").
 * Every form that edits or shows the same field uses these words; docs/field-names.md
 * lists where each one appears. Stored field names are not affected.
 */
export const FIELD_LABELS = {
  customerName: ['客户姓名', 'Customer name', 'Nama pelanggan'],
  phoneNumber: ['电话号码', 'Phone number', 'Nombor telefon'],
  icNumber: ['身份证号码', 'IC number', 'Nombor IC'],
  dateOfBirth: ['出生日期', 'Date of birth', 'Tarikh lahir'],
  email: ['电邮', 'Email', 'E-mel'],
  /** The customer's own bank, where the salary is paid (not the lender on a bank application). */
  salaryBank: ['薪水银行', 'Salary bank', 'Bank gaji'],
  bankAccountNumber: ['银行户口号码', 'Bank account number', 'Nombor akaun bank'],
  vehicleModel: ['车型', 'Vehicle model', 'Model kenderaan'],
  plateNumber: ['车牌', 'Plate number', 'No. plat'],
  engineNumber: ['引擎号', 'Engine number', 'Nombor enjin'],
  chassisNumber: ['底盘号', 'Chassis number', 'Nombor casis'],
  colour: ['颜色', 'Colour', 'Warna'],
  sellingPrice: ['售价', 'Selling price', 'Harga jualan'],
  approvedLoan: ['批核贷款', 'Approved loan', 'Pinjaman diluluskan'],
  deposit: ['订金', 'Deposit', 'Deposit'],
  monthlyInstalment: ['月供', 'Monthly instalment', 'Ansuran bulanan'],
  /** A bank row's tenure, in months (TENURE 48). */
  tenureMonths: ['期数(月)', 'Tenure (months)', 'Tempoh (bulan)'],
  /** The customer's wished loan tenure and a unit change's tenure, in years. */
  loanTenureYears: ['贷款年期(年)', 'Loan tenure (years)', 'Tempoh pinjaman (tahun)'],
  insuranceAmount: ['保险金额', 'Insurance amount', 'Amaun insurans'],
  jpjFee: ['JPJ 费', 'JPJ fee', 'Yuran JPJ'],
  purchaseCost: ['采购成本', 'Purchase cost', 'Kos belian'],
  transportCost: ['运输成本', 'Transport cost', 'Kos pengangkutan'],
  repairCost: ['维修成本', 'Repair cost', 'Kos pembaikan'],
  accessoriesCost: ['配件成本', 'Accessories cost', 'Kos aksesori'],
  remark: ['备注', 'Remark', 'Catatan']
} as const satisfies Record<string, Label>;

const NO_SUFFIX: Label = ['', '', ''];

export type FieldLabelKey = keyof typeof FIELD_LABELS;

/** The field's name in the current UI language. */
export const fieldLabel = (key: FieldLabelKey) => {
  const [zh, en, ms] = FIELD_LABELS[key];
  return tr(zh, en, ms);
};

/** The name as a [zh, en, ms] triple, e.g. for DELIVERY_STEP_FIELDS. */
export const fieldLabelTriple = (key: FieldLabelKey, suffix: Label = NO_SUFFIX): [string, string, string] => {
  const [zh, en, ms] = FIELD_LABELS[key];
  return [`${zh}${suffix[0]}`, `${en}${suffix[1]}`, `${ms}${suffix[2]}`];
};

/** The same name with a unit or note after it, e.g. "(RM)" or "(optional)", in the current UI language. */
export const fieldLabelWith = (key: FieldLabelKey, suffix: Label) => {
  const [zh, en, ms] = fieldLabelTriple(key, suffix);
  return tr(zh, en, ms);
};

export const RM: Label = [' (RM)', ' (RM)', ' (RM)'];
export const OPTIONAL: Label = ['(选填)', ' (optional)', ' (pilihan)'];
export const REQUIRED: Label = ['(必填)', ' (required)', ' (wajib)'];
export const FROM_IC: Label = ['(IC 自动识别)', ' (auto-detected from IC)', ' (dikesan daripada IC)'];
