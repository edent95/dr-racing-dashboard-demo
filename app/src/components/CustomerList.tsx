/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowUpRight, Banknote, CalendarDays, Car, Check, ChevronDown, ClipboardPaste, Database, Eye, EyeOff, Landmark, Link2, MousePointerClick, Plus, Search, Share2, SlidersHorizontal, Trash2, Upload, UserRound, X, type LucideIcon } from 'lucide-react';
import { BankApplication, BankApplicationStatus, BankDefinition, CustomerDocumentKey, CustomerEmploymentDetails, CustomerPersonalInfo, CustomerPreferences, CustomerRawMatch, CustomerRiskFlag, EmergencyContact, ErrorCodeDefinition, getLoanPendingAction, getLoanPendingWith, inferVehicleBrandFromModel, inferVehicleTagFromModel, LoanApplication, LoanPendingAction, LoanStatus, PayslipDocument, PurchaseMethod, RoleAccount, VehicleCatalogItem, VehicleCondition } from '../types';
import BankIcon from './BankIcon';
import DoubleClickEditField from './DoubleClickEditField';
import FileDropZone from './FileDropZone';
import MetricCards, { TOTAL_SALE_FILTER, TOTAL_SUBMITTED_FILTER } from './MetricCards';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import StaffNameBadge from './StaffNameBadge';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';
import ToggleSwitch from './ToggleSwitch';
import StartYearMonthInput, { YearsMonthsDurationInput } from './StartYearMonthInput';
import { formatMalaysiaPhoneForCopy, formatMalaysiaPhoneNumber as formatPhoneNumber, isBasicMalaysiaPhoneNumber as isBasicPhoneNumber } from '../utils/malaysiaPhone';
import { getCustomerDocumentUploadLimit, getMissingDocumentLabels } from '../utils/documentChecklist';
import { getApplicationRejectCodes } from '../utils/rejectCodes';
import { deriveMalaysiaIcBirthDate } from '../utils/malaysiaIc';
import { parseCustomerPasteText } from '../utils/customerPasteParser';
import { matchesLoanApplicationFilter } from '../utils/loanFollowUpFilters';
import { STAFF_LINK_QUEUE, isStaffLinkQueueHandler } from '../../shared/staffLinkQueue.mjs';
import { getApplicationJourneyPosition } from '../utils/applicationJourneyStage';
import { getRejectCodePlainTexts } from '../data/rejectCodePlainText';
import { bankMatchesColumn, canSubmitToBankFromTable, getLoanTableBankColumns, type BankPageRequest, type LoanTableBankColumn } from '../utils/loanTableBankColumns';
import { BANK_QUICK_ACTION_BUTTONS, BANK_QUICK_ACTION_STATUSES } from './bankQuickActions';
import { useBrandedDialog } from './BrandedDialogProvider';
import {
  createEmptyCustomerEmploymentDetails as createEmptyEmploymentDetails,
  createEmptyCustomerPersonalInfo as createEmptyPersonalInfo,
  createEmptyCustomerPreferences as createEmptyPreferences,
  createEmptyEmergencyContact,
  formatYearsMonthsForBank,
  GENDER_OPTIONS,
  getEffectiveNumberOfChildren,
  getEmploymentDuration,
  getSalaryBankOptions,
  hasChildrenQuestion,
  HOUSING_STATUS_OPTIONS,
  LOAN_TENURE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PURCHASE_METHOD_OPTIONS,
  RACE_OPTIONS,
  VEHICLE_CONDITION_OPTIONS
} from '../utils/customerApplicationForm';
import { AppLanguage, getAppLocale, tr, trLoanStatus } from '../lib/i18n';
import { buildPublicSiteUrl } from '../lib/publicUrls';
import { newId } from '../utils/id';
import { hasAdminWorkAccess } from '../utils/staffRoles';
import { fieldLabel, fieldLabelWith, FROM_IC } from '../data/fieldLabels';
function InlineAssetIcon({ icon: Icon, className = 'h-5 w-5' }: { icon: LucideIcon; className?: string }) {
  return <Icon aria-hidden="true" className={className} strokeWidth={1.75} />;
}

const getPendingActionLabel = (action: LoanPendingAction) => {
  const labels: Record<LoanPendingAction, [string, string, string]> = {
    'Complete Application': ['检查并补齐申请', 'Check and complete application', 'Semak dan lengkapkan permohonan'],
    'Review Application': ['检查申请', 'Review application', 'Semak permohonan'],
    'Provide Documents': ['补资料', 'Provide documents', 'Sediakan dokumen'],
    'Submit to Bank': ['提交银行', 'Submit to bank', 'Hantar ke bank'],
    'Follow Up Bank': ['跟进银行', 'Follow up bank', 'Susulan bank'],
    'Choose Close or Resubmit': ['选择结案或重提', 'Close or resubmit', 'Tutup atau hantar semula'],
    'Resubmit to Bank': ['重新提交银行', 'Resubmit to bank', 'Hantar semula ke bank'],
    'Contact Approved Customer': ['联系已批准客户', 'Contact approved customer', 'Hubungi pelanggan diluluskan'],
    None: ['无待办', 'No action', 'Tiada tindakan']
  };
  return tr(...labels[action]);
};

function isApplicationJourneyComplete(application: LoanApplication) {
  if (application.purchase_method === 'Cash') {
    return Boolean(application.deal_finance?.finance_completed_at)
      || application.deal_finance?.sale_status === 'Cancelled'
      || [LoanStatus.REJECT, LoanStatus.CANCELLED].includes(application.status);
  }

  return getLoanPendingWith(application) === 'Closed';
}

const isSeoApplication = (application: LoanApplication) => (
  application.customer_intake_tracking?.submitted_from === 'seo_website' ||
  (application.customer_intake_tracking?.utm_campaign || '').startsWith('seo_')
);

function getCustomerActionDueTime(value?: string) {
  if (!value) {
    return Number.NaN;
  }

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const dueTime = new Date(normalized).getTime();
  return Number.isNaN(dueTime) ? Number.NaN : dueTime;
}

function CustomerJourneyRail({ application }: { application: LoanApplication }) {
  const pendingWith = getLoanPendingWith(application);
  const pendingAction = getLoanPendingAction(application);
  const isCash = application.purchase_method === 'Cash';
  const dealFinance = application.deal_finance;
  const latestBank = [...(application.bank_applications || [])].sort((a, b) => (
    new Date(b.submitted_at || b.decision_at || 0).getTime() - new Date(a.submitted_at || a.decision_at || 0).getTime()
    || (b.round_no || 0) - (a.round_no || 0)
  ))[0];
  const loanCurrentIndex = pendingWith === 'Closed'
    || pendingAction === 'Choose Close or Resubmit'
    || pendingAction === 'Contact Approved Customer'
    ? 4
    : pendingWith === 'Bank' || application.status === LoanStatus.IN_PROCESS
      ? 3
      : pendingWith === 'Admin' && (pendingAction === 'Submit to Bank' || pendingAction === 'Resubmit to Bank')
        ? 2
        : 1;
  const cashCancelled = dealFinance?.sale_status === 'Cancelled' || [LoanStatus.REJECT, LoanStatus.CANCELLED].includes(application.status);
  const cashCompleted = Boolean(dealFinance?.finance_completed_at);
  const cashCustomerAccepted = dealFinance?.sale_status === 'Customer Accepted'
    || (pendingWith === 'Closed' && application.status === LoanStatus.APPROVE);
  const cashCurrentIndex = cashCancelled || cashCompleted || dealFinance?.sale_status === 'Bike Delivered'
    ? 4
    : cashCustomerAccepted
      ? 3
      : application.status === LoanStatus.APPROVE || dealFinance?.sale_status === 'Pending Acceptance'
        ? 2
        : 1;
  const currentIndex = isCash ? cashCurrentIndex : loanCurrentIndex;
  const steps = isCash
    ? [
        tr('提交', 'Submitted', 'Dihantar'),
        tr('检查', 'Review', 'Semak'),
        tr('接受', 'Accepted', 'Diterima'),
        tr('交车', 'Delivery', 'Serahan'),
        tr('完成', 'Complete', 'Selesai')
      ]
    : [
        tr('Sales 提交', 'Sales Submit', 'Jualan Hantar'),
        tr('缺件检查', 'Docs Check', 'Semak Dokumen'),
        tr('Admin 提交', 'Admin Submit', 'Admin Hantar'),
        tr('银行决定', 'Bank Decision', 'Keputusan Bank'),
        tr('结果', 'Result', 'Keputusan')
      ];
  const loanPendingOwner = pendingWith === 'Admin'
    ? application.admin_owner_name || tr('Admin 团队', 'Admin team', 'Pasukan pentadbir')
    : pendingWith === 'Handler'
      ? application.handler_name
      : pendingWith === 'Bank'
        ? latestBank?.bank_name || tr('银行', 'Bank', 'Bank')
        : tr('已结束', 'Closed', 'Ditutup');
  const cashPendingOwner = cashCancelled || cashCompleted
    ? tr('已结束', 'Closed', 'Ditutup')
    : dealFinance?.sale_status === 'Bike Delivered' || cashCustomerAccepted
      ? tr('Admin 团队', 'Admin team', 'Pasukan pentadbir')
      : application.status === LoanStatus.NEW
        ? application.admin_owner_name || tr('Admin 团队', 'Admin team', 'Pasukan pentadbir')
        : application.handler_name;
  const cashAction = cashCancelled
    ? tr('现金成交已取消', 'Cash sale cancelled', 'Jualan tunai dibatalkan')
    : cashCompleted
      ? tr('现金成交已完成', 'Cash sale completed', 'Jualan tunai selesai')
      : dealFinance?.sale_status === 'Bike Delivered'
        ? tr('完成收款与账目', 'Complete payment and account', 'Lengkapkan bayaran dan akaun')
        : cashCustomerAccepted
          ? tr('安排交车', 'Arrange delivery', 'Aturkan serahan')
          : application.status === LoanStatus.APPROVE || dealFinance?.sale_status === 'Pending Acceptance'
            ? tr('确认客户接受', 'Confirm customer acceptance', 'Sahkan penerimaan pelanggan')
            : tr('检查现金申请', 'Review cash application', 'Semak permohonan tunai');
  const pendingOwner = isCash ? cashPendingOwner : loanPendingOwner;
  const journeyAction = isCash ? cashAction : getPendingActionLabel(pendingAction);
  const isRejectedResult = isCash
    ? cashCancelled
    : application.status === LoanStatus.REJECT
      || application.status === LoanStatus.CANCELLED
      || (pendingAction === 'Choose Close or Resubmit' && latestBank?.status === 'Rejected');
  const isFinalComplete = isCash ? cashCompleted : pendingWith === 'Closed';
  const isJourneyClosed = isApplicationJourneyComplete(application);
  const journeyStage = isCash
    ? ['cash-submit', 'cash-review', 'cash-accepted', 'cash-delivery', 'cash-complete'][currentIndex]
    : ['sales-submit', 'missing-doc-check', 'admin-loan-submit', 'bank-decision', 'result'][currentIndex];

  return (
    <div
      className="min-w-0"
      data-testid="customer-journey"
      data-current-stage={journeyStage}
      data-complete={isJourneyClosed ? 'true' : 'false'}
      title={`${isCash ? tr('现金', 'Cash', 'Tunai') : trLoanStatus(application.status)} · ${pendingOwner} · ${journeyAction}${!isCash && latestBank ? ` · ${latestBank.bank_name} R${latestBank.round_no}` : ''}`}
    >
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex || (index === currentIndex && isFinalComplete);
          const isCurrent = index === currentIndex;
          const nodeClass = isCurrent && isRejectedResult
            ? 'bg-rose-600 text-white ring-rose-100'
            : isComplete
              ? 'bg-emerald-500 text-white ring-emerald-100'
              : isCurrent
                ? 'bg-amber-500 text-white ring-amber-100'
                : 'bg-white text-slate-300 ring-slate-200';

          return (
            <React.Fragment key={step}>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-micro tracking-normal ring-2 ${nodeClass}`}>
                  {isComplete ? '✓' : index + 1}
                </span>
                <span
                  className={`w-full truncate text-center text-micro tracking-normal ${isCurrent ? 'text-slate-700' : 'text-slate-400'}`}
                  title={step}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span className={`mt-[7px] h-0.5 w-2 shrink-0 ${index < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-caption">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isJourneyClosed ? 'bg-slate-400' : 'bg-amber-500'}`} />
        <span className="truncate text-slate-600">{pendingOwner}</span>
        <span className="shrink-0 text-slate-300">·</span>
        <span className="truncate text-slate-400">{journeyAction}</span>
        {!isCash && latestBank && <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 font-mono text-micro tracking-normal text-slate-500">R{latestBank.round_no}</span>}
      </div>
    </div>
  );
}

interface CustomerListProps {
  language?: AppLanguage;
  applications: LoanApplication[];
  canEditCustomers: boolean;
  canAddCustomer: boolean;
  canShareCustomerLinks: boolean;
  // Admin's own choice to include other shops' unclaimed pool, shown only when
  // Super Admin allows it (customers.crossShopUnclaimedPool).
  crossShopPool?: { showAllShops: boolean; onChange: (showAllShops: boolean) => void };
  currentStaffName: string;
  currentStaffRole: RoleAccount['role'];
  defaultHandlerName: string;
  defaultHandlerRole: string;
  showAllApplications: boolean;
  vehicleCatalog: VehicleCatalogItem[];
  bankDefinitions: BankDefinition[];
  roleAccounts: RoleAccount[];
  errorCodeIssueMap: Record<string, ErrorCodeDefinition>;
  riskFlagsByApplicationId: Record<string, CustomerRiskFlag[]>;
  rawMatchesByApplicationId: Record<string, CustomerRawMatch[]>;
  onToggleShowAllApplications: () => void;
  onSelectCustomer: (application: LoanApplication) => void;
  onUpdateCustomer: (
    id: string,
    updates: CustomerEditDraft
  ) => void;
  onUpdateLoanApplication: (
    id: string,
    updates: {
      status?: LoanStatus;
      remarks?: string;
      error_code?: string;
      error_codes?: string[];
      handler_name?: string;
      handler_role?: string;
    }
  ) => void;
  onAddCustomer: (customer: CustomerAddDraft) => void;
  onCreateCustomerIntakeShortLink: (fullUrl: string, source: string, medium: string) => Promise<string>;
  /** Present when this role may open Bank Database. */
  onOpenBankDatabase?: () => void;
  /** Submit a file to one bank from that bank's empty cell (Admin / Super Admin). */
  onSubmitToBank?: (id: string, bankName: string) => Promise<boolean>;
  /** A bank cell opens that application's bank page instead of Application Detail; a decision opens its form. */
  onOpenBankPage?: (application: LoanApplication, target: Omit<BankPageRequest, 'id'>) => void;
}

type CustomerEditDraft = Pick<LoanApplication, 'applicant_name' | 'phone_no' | 'ic_no' | 'vehicle_plate' | 'vehicle_model' | 'handler_name' | 'handler_role'> & {
  vehicle_condition: VehicleCondition;
  purchase_method: PurchaseMethod;
};

type CustomerAddDraft = CustomerEditDraft & {
  total_cash_price: string;
  motor_mileage: string;
  personal_info: CustomerPersonalInfo;
  emergency_contacts: EmergencyContact[];
  employment_details: CustomerEmploymentDetails;
  preferences: CustomerPreferences;
  payslip_documents: PayslipDocument[];
  /** Saved as the application remark, e.g. the payslip PDF password (owner 2026-10-20). */
  remarks: string;
};

type EditableCustomerCell = 'customer' | 'contact' | 'identity' | 'vehicle';
type CustomerTimeFilter = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'custom';

const getNewCustomerDocumentKeys = (
  purchaseMethod: PurchaseMethod,
  vehicleCondition: VehicleCondition
): CustomerDocumentKey[] => [
  'ic',
  ...(purchaseMethod === 'Loan' ? ['payslip' as const, 'bank_statement' as const] : []),
  ...(vehicleCondition === 'Used' ? ['vehicle_geran' as const] : [])
];
const CUSTOMER_DOCUMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const CUSTOMER_DOCUMENT_ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const CUSTOMER_DOCUMENT_COMPRESS_MAX_SIDE = 1600;
const CUSTOMER_DOCUMENT_COMPRESS_MIN_BYTES = 400 * 1024;
const CUSTOMER_INTAKE_UTM_STORAGE_PREFIX = 'customer_intake_utm_defaults';

const formatDocumentFileSize = (size: number) => (
  size < 1024 * 1024 ? `${Math.max(size / 1024, 0.1).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`
);

const readCustomerDocumentAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error || new Error('Document could not be read.'));
  reader.readAsDataURL(file);
});

const prepareCustomerDocumentDataUrl = async (file: File) => {
  const dataUrl = await readCustomerDocumentAsDataUrl(file);

  if (!file.type.startsWith('image/') || file.size < CUSTOMER_DOCUMENT_COMPRESS_MIN_BYTES) {
    return dataUrl;
  }

  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, CUSTOMER_DOCUMENT_COMPRESS_MAX_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(Math.round(image.width * scale), 1);
      canvas.height = Math.max(Math.round(image.height * scale), 1);
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
};

type CustomerIntakeUtmDraft = {
  source: string;
};

const CUSTOMER_DRAWER_OPEN_DELAY_MS = 420;
const CUSTOMER_COPY_DELAY_MS = 180;
const CUSTOMER_CLICK_BURST_RESET_MS = 620;
// IMPORTANT: the estimated row height must stay at or BELOW the shortest real
// row (~70px). Spacer offsets are computed from this estimate; if it is larger
// than real rows (it was 172 before), the rendered slice stops covering the
// viewport once the user scrolls, leaving a large blank area in the table.
const CUSTOMER_ROW_ESTIMATED_HEIGHT = 56;
const CUSTOMER_TABLE_HEIGHT = 648;
const CUSTOMER_OVERSCAN_ROWS = 8;
const CUSTOMER_INITIAL_LOAD_COUNT = 80;
const CUSTOMER_LOAD_MORE_COUNT = 80;
const CUSTOMER_LOAD_MORE_THRESHOLD_PX = CUSTOMER_ROW_ESTIMATED_HEIGHT * 10;
const CUSTOMER_TIME_FILTER_OPTIONS: { value: CustomerTimeFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'custom', label: 'Custom' }
];

type AddCustomerSectionKey = 'personal' | 'vehicle' | 'documents' | 'employment' | 'contacts' | 'preferences';
type AddCustomerMissingItem = {
  label: string;
  section: AddCustomerSectionKey | 'purchase';
  targetId: string;
};

// Keep every customer-application section open by default so staff can see
// the complete Loan form immediately. Each section remains user-collapsible.
const DEFAULT_ADD_SECTION_STATE: Record<AddCustomerSectionKey, boolean> = {
  personal: true,
  vehicle: true,
  documents: true,
  employment: true,
  contacts: true,
  preferences: true
};

const CUSTOMER_LIST_COPY = {
  zh: {
    pageTitle: '贷款申请',
    pageDescription: '客户资料和贷款状态。',
    pageDescriptionAdmin: '申请详情里单击复制、双击编辑。',
    pageDescriptionReadonly: '当前负责人可编辑自己负责的资料；点击任意一行打开详情，单击复制、双击编辑。',
    shareLink: '分享链接',
    addCustomer: '新增客户',
    allStaffData: '全部员工资料',
    staffData: (name: string) => `${name} 的资料`,
    showAllEnabled: '已开启显示全部',
    assignedCustomers: (count: number) => `${count} 个负责客户`,
    showAll: '显示全部',
    otherShopsPool: '其他店未认领',
    otherShopsPoolOn: '包括其他店还没被认领的新申请',
    otherShopsPoolOff: '只看本店未认领的新申请',
    allStaff: '全部员工',
    filterByStaff: '按员工筛选',
    staffActions: (count: number) => `${count} 个待办`,
    mineOnly: '只看自己',
    shareCustomerIntakeLink: '分享客户申请链接',
    shareCustomerHelp: '选客户来源即可，追踪自动带上。',
    customerCameFrom: '客户来源',
    autoTracking: '自动追踪',
    staff: '员工',
    customerIntakeUrl: '客户申请链接',
    shortLink: '短链接',
    handler: '负责人',
    saveDefaultSource: '保存默认来源',
    copyShortLink: '复制短链接',
    shortLinkCopied: '短链接已复制',
    copyFailed: '复制失败',
    shortLinkSaveFailed: '短链接保存失败，请检查网络后再试',
    shortLinkPlaceholder: '按「复制短链接」后，链接会显示在这里',
    addNewCustomer: '新增客户',
    addNewCustomerHelp: '标 * 为必填。',
    missingRequired: (fields: string) => `还差必填项：${fields}`,
    personalInformation: '个人资料',
    customerName: '客户姓名',
    phoneNumber: '电话号码',
    icNumber: '身份证号码',
    email: '电邮',
    gender: '性别',
    maritalStatus: '婚姻状况',
    race: '种族',
    bankName: '薪水银行',
    accountNumber: '银行户口号码',
    yearsAtResidence: '居住年数',
    residenceStart: '在现址住了多久（年 / 月）',
    numberOfChildren: '孩子数量',
    housingStatus: '住房状况',
    fullAddress: '完整地址',
    vehiclePurchase: '车辆与购买',
    vehiclePlate: '车牌',
    vehicleModel: '车型',
    vehicleCondition: '新车 / 二手',
    purchaseMethod: '现金 / 贷款',
    documents: '客户文件',
    icDocument: 'IC 文件',
    payslipDocument: '工资单',
    uploadDocument: '上传文件',
    documentUploadHelp: 'PDF、JPG、PNG 或 WebP，每个文件最多 10 MB。',
    staffMissionRequired: '需要员工补资料',
    staffMissionNote: '新车/二手 与 现金/贷款创建后由负责员工补。',
    handlingStaff: '负责员工',
    role: '角色',
    employmentDetails: '工作资料',
    companyName: '公司名称',
    position: '职位',
    yearsEmployed: '工作年数',
    employmentStart: '开始上班（年 / 月）',
    officePhone: '公司电话',
    workHours: '工作时间',
    grossMonthlySalary: '每月总薪资',
    netMonthlySalary: '每月净薪资',
    companyAddress: '公司地址',
    emergencyContacts: '紧急联系人',
    emergencyContact: (index: number) => `紧急联系人 ${index}`,
    relationship: '关系',
    statusPreferences: '状态与偏好',
    availableCalls: '方便接电话',
    salaryMethod: '薪资收取方式',
    loanTenure: '贷款年期(年)',
    notSet: '未设置',
    cancel: '取消',
    createCustomer: '创建客户',
    searchPlaceholder: '搜索姓名、身份证、电话、车牌、银行...',
    gestureHint: '单击详情 · 双击复制 · 三击编辑 · 四击复制模板',
    totalItems: (count: number) => `共 ${count} 项`,
    allTime: '全部时间',
    start: '开始',
    end: '结束',
    startDate: '开始日期',
    endDate: '结束日期',
    apply: '应用',
    tabs: {
      all: '全部申请',
      new: '新申请',
      pending: '待审核',
      inProcess: '进行中',
      approve: '已通过',
      reject: '已拒绝',
      followUp: '需跟进',
      cancelled: '已取消'
    },
    table: {
      customer: '客户',
      contact: '联系',
      icPlate: '身份证 / 车牌',
      vehicle: '车辆',
      staff: '员工',
      approval: '流程',
      remarks: '备注',
      submitted: '提交时间'
    },
    banks: (count: number) => `${count} 间银行`,
    noCustomers: '没有找到客户',
    codeEmpty: '双击填写失败代码',
    remarksPlaceholder: '填写备注说明...',
    remarksEmpty: '三击填写备注说明...',
    rawCustomerMatch: '潜在客户匹配'
  },
  en: {
    pageTitle: 'Loan Applications',
    pageDescription: 'Customer details and loan status.',
    pageDescriptionAdmin: 'In Application Detail, click to copy and double-click to edit.',
    pageDescriptionReadonly: 'Assigned handlers can edit their own records: click any row to open Application Detail, then click to copy and double-click to edit.',
    shareLink: 'Share Link',
    addCustomer: 'Add Customer',
    allStaffData: 'All Staff Data',
    staffData: (name: string) => `${name}'s Data`,
    showAllEnabled: 'Show all enabled',
    assignedCustomers: (count: number) => `${count} assigned customers`,
    showAll: 'Show All',
    otherShopsPool: "Other shops' unclaimed",
    otherShopsPoolOn: "Including other shops' unclaimed new applications",
    otherShopsPoolOff: 'Only your shop\'s unclaimed new applications',
    allStaff: 'All staff',
    filterByStaff: 'Filter by staff',
    staffActions: (count: number) => `${count} ${count === 1 ? 'action' : 'actions'}`,
    mineOnly: 'Mine only',
    shareCustomerIntakeLink: 'Share Customer Intake Link',
    shareCustomerHelp: 'Pick the source — tracking is automatic.',
    customerCameFrom: 'Customer came from',
    autoTracking: 'Auto tracking',
    staff: 'Staff',
    customerIntakeUrl: 'Customer Intake URL',
    shortLink: 'Short Link',
    handler: 'Handler',
    saveDefaultSource: 'Save Default Source',
    copyShortLink: 'Copy Short Link',
    shortLinkCopied: 'Short link copied',
    copyFailed: 'Copy failed',
    shortLinkSaveFailed: 'The short link could not be saved. Check your connection and try again',
    shortLinkPlaceholder: 'Press Copy Short Link and the link appears here',
    addNewCustomer: 'Add New Customer',
    addNewCustomerHelp: 'Fields marked * are required.',
    missingRequired: (fields: string) => `Missing required: ${fields}`,
    personalInformation: 'Personal Information',
    customerName: 'Customer name',
    phoneNumber: 'Phone number',
    icNumber: 'IC number',
    email: 'Email',
    gender: 'Gender',
    maritalStatus: 'Marital Status',
    race: 'Race',
    bankName: 'Salary bank',
    accountNumber: 'Bank account number',
    yearsAtResidence: 'Years at Residence',
    residenceStart: 'Lived Here (Years / Months)',
    numberOfChildren: 'Number of Children',
    housingStatus: 'Housing Status',
    fullAddress: 'Full Address',
    vehiclePurchase: 'Vehicle & Purchase',
    vehiclePlate: 'Plate number',
    vehicleModel: 'Vehicle model',
    vehicleCondition: 'New / Used',
    purchaseMethod: 'Cash / Loan',
    documents: 'Customer Documents',
    icDocument: 'IC Document',
    payslipDocument: 'Payslip',
    uploadDocument: 'Upload file',
    documentUploadHelp: 'PDF, JPG, PNG or WebP, up to 10 MB each.',
    staffMissionRequired: 'Staff mission required',
    staffMissionNote: 'New/Used and Cash/Loan will be completed later by the handling staff.',
    handlingStaff: 'Handling Staff',
    role: 'Role',
    employmentDetails: 'Employment Details',
    companyName: 'Company Name',
    position: 'Position',
    yearsEmployed: 'Years Employed',
    employmentStart: 'Started Working (Year / Month)',
    officePhone: 'Office Phone',
    workHours: 'Work Hours',
    grossMonthlySalary: 'Gross Monthly Salary',
    netMonthlySalary: 'Net Monthly Salary',
    companyAddress: 'Company Address',
    emergencyContacts: 'Emergency Contacts',
    emergencyContact: (index: number) => `Emergency Contact ${index}`,
    relationship: 'Relationship',
    statusPreferences: 'Status & Preferences',
    availableCalls: 'Available Calls',
    salaryMethod: 'Salary Paid By',
    loanTenure: 'Loan tenure (years)',
    notSet: 'Not set',
    cancel: 'Cancel',
    createCustomer: 'Create Customer',
    searchPlaceholder: 'Search name, IC, phone, plate, bank...',
    gestureHint: 'Click: detail · double: copy · triple: edit · 4x: template',
    totalItems: (count: number) => `${count} items`,
    allTime: 'All time',
    start: 'Start',
    end: 'End',
    startDate: 'Start date',
    endDate: 'End date',
    apply: 'Apply',
    tabs: {
      all: 'All Applications',
      new: 'New',
      pending: 'Pending',
      inProcess: 'In Process',
      approve: 'Approved',
      reject: 'Rejected',
      followUp: 'Follow Up',
      cancelled: 'Cancelled'
    },
    table: {
      customer: 'Customer',
      contact: 'Contact',
      icPlate: 'IC / Plate',
      vehicle: 'Vehicle',
      staff: 'Staff',
      approval: 'Journey',
      remarks: 'Remarks',
      submitted: 'Submitted'
    },
    banks: (count: number) => `${count} ${count === 1 ? 'bank' : 'banks'}`,
    noCustomers: 'No customers found',
    codeEmpty: 'Double-click to enter CODE',
    remarksPlaceholder: 'Enter remarks...',
    remarksEmpty: 'Triple-click to enter remarks...',
    rawCustomerMatch: 'Lead Match'
  },
  ms: {
    pageTitle: 'Permohonan Pinjaman',
    pageDescription: 'Butiran pelanggan dan status pinjaman.',
    pageDescriptionAdmin: 'Dalam Butiran Permohonan, klik untuk menyalin dan klik dua kali untuk mengedit.',
    pageDescriptionReadonly: 'Pengendali yang ditugaskan boleh mengedit rekod sendiri: klik mana-mana baris untuk membuka Butiran Permohonan, kemudian klik untuk menyalin dan klik dua kali untuk mengedit.',
    shareLink: 'Kongsi Pautan',
    addCustomer: 'Tambah Pelanggan',
    allStaffData: 'Data Semua Kakitangan',
    staffData: (name: string) => `Data ${name}`,
    showAllEnabled: 'Paparan semua diaktifkan',
    assignedCustomers: (count: number) => `${count} pelanggan ditugaskan`,
    showAll: 'Tunjukkan Semua',
    otherShopsPool: 'Belum dituntut kedai lain',
    otherShopsPoolOn: 'Termasuk permohonan baharu belum dituntut kedai lain',
    otherShopsPoolOff: 'Hanya permohonan baharu belum dituntut kedai anda',
    allStaff: 'Semua Kakitangan',
    filterByStaff: 'Tapis mengikut kakitangan',
    staffActions: (count: number) => `${count} tindakan`,
    mineOnly: 'Milik saya sahaja',
    shareCustomerIntakeLink: 'Kongsi Pautan Borang Pelanggan',
    shareCustomerHelp: 'Pilih sumber — penjejakan dibuat secara automatik.',
    customerCameFrom: 'Sumber pelanggan',
    autoTracking: 'Penjejakan automatik',
    staff: 'Kakitangan',
    customerIntakeUrl: 'URL Borang Pelanggan',
    shortLink: 'Pautan Pendek',
    handler: 'Pegawai Bertanggungjawab',
    saveDefaultSource: 'Simpan Sumber Lalai',
    copyShortLink: 'Salin Pautan Pendek',
    shortLinkCopied: 'Pautan pendek disalin',
    copyFailed: 'Gagal menyalin',
    shortLinkSaveFailed: 'Pautan pendek tidak dapat disimpan. Semak sambungan anda dan cuba lagi',
    shortLinkPlaceholder: 'Tekan Salin Pautan Pendek dan pautan akan dipaparkan di sini',
    addNewCustomer: 'Tambah Pelanggan Baharu',
    addNewCustomerHelp: 'Medan bertanda * wajib diisi.',
    missingRequired: (fields: string) => `Maklumat wajib belum diisi: ${fields}`,
    personalInformation: 'Maklumat Peribadi',
    customerName: 'Nama pelanggan',
    phoneNumber: 'Nombor telefon',
    icNumber: 'Nombor IC',
    email: 'E-mel',
    gender: 'Jantina',
    maritalStatus: 'Status Perkahwinan',
    race: 'Bangsa',
    bankName: 'Bank gaji',
    accountNumber: 'Nombor akaun bank',
    yearsAtResidence: 'Tempoh Menetap',
    residenceStart: 'Tempoh Menetap (Tahun / Bulan)',
    numberOfChildren: 'Bilangan Anak',
    housingStatus: 'Status Kediaman',
    fullAddress: 'Alamat Penuh',
    vehiclePurchase: 'Kenderaan & Pembelian',
    vehiclePlate: 'No. plat',
    vehicleModel: 'Model kenderaan',
    vehicleCondition: 'Baharu / Terpakai',
    purchaseMethod: 'Tunai / Pinjaman',
    documents: 'Dokumen Pelanggan',
    icDocument: 'Dokumen IC',
    payslipDocument: 'Slip Gaji',
    uploadDocument: 'Muat naik fail',
    documentUploadHelp: 'PDF, JPG, PNG atau WebP, maksimum 10 MB setiap fail.',
    staffMissionRequired: 'Maklumat perlu dilengkapkan oleh kakitangan',
    staffMissionNote: 'Baharu/Terpakai dan Tunai/Pinjaman akan dilengkapkan kemudian oleh pegawai bertanggungjawab.',
    handlingStaff: 'Pegawai Bertanggungjawab',
    role: 'Peranan',
    employmentDetails: 'Butiran Pekerjaan',
    companyName: 'Nama Syarikat',
    position: 'Jawatan',
    yearsEmployed: 'Tempoh Bekerja',
    employmentStart: 'Mula Bekerja (Tahun / Bulan)',
    officePhone: 'Telefon Pejabat',
    workHours: 'Waktu Kerja',
    grossMonthlySalary: 'Gaji Bulanan Kasar',
    netMonthlySalary: 'Gaji Bulanan Bersih',
    companyAddress: 'Alamat Syarikat',
    emergencyContacts: 'Kenalan Kecemasan',
    emergencyContact: (index: number) => `Kenalan Kecemasan ${index}`,
    relationship: 'Hubungan',
    statusPreferences: 'Status & Keutamaan',
    availableCalls: 'Masa Sesuai Dihubungi',
    salaryMethod: 'Kaedah Pembayaran Gaji',
    loanTenure: 'Tempoh pinjaman (tahun)',
    notSet: 'Belum ditetapkan',
    cancel: 'Batal',
    createCustomer: 'Cipta Pelanggan',
    searchPlaceholder: 'Cari nama, IC, telefon, nombor plat, bank...',
    gestureHint: 'Klik: butiran · dua kali: salin · tiga kali: edit · 4 kali: templat',
    totalItems: (count: number) => `${count} item`,
    allTime: 'Sepanjang Masa',
    start: 'Mula',
    end: 'Akhir',
    startDate: 'Tarikh mula',
    endDate: 'Tarikh akhir',
    apply: 'Gunakan',
    tabs: {
      all: 'Semua Permohonan',
      new: 'Baharu',
      pending: 'Menunggu',
      inProcess: 'Sedang Diproses',
      approve: 'Diluluskan',
      reject: 'Ditolak',
      followUp: 'Susulan',
      cancelled: 'Dibatalkan'
    },
    table: {
      customer: 'Pelanggan',
      contact: 'Hubungan',
      icPlate: 'IC / Plat',
      vehicle: 'Kenderaan',
      staff: 'Kakitangan',
      approval: 'Perjalanan',
      remarks: 'Catatan',
      submitted: 'Dihantar'
    },
    banks: (count: number) => `${count} bank`,
    noCustomers: 'Tiada pelanggan ditemui',
    codeEmpty: 'Klik dua kali untuk memasukkan KOD',
    remarksPlaceholder: 'Masukkan catatan...',
    remarksEmpty: 'Klik tiga kali untuk memasukkan catatan...',
    rawCustomerMatch: 'Padanan Prospek'
  }
} satisfies Record<AppLanguage, Record<string, unknown>>;

const ROLE_LABEL_COPY: Record<AppLanguage, Record<string, string>> = {
  zh: {
    'Super Admin': '超级管理员',
    'Operations Manager': '运营经理',
    Admin: '管理员',
    'Loan Officer': '贷款专员',
    'Sales Advisor': '销售顾问',
    Sales: '销售',
    Staff: '员工'
  },
  en: {},
  ms: {
    'Super Admin': 'Super Admin',
    'Operations Manager': 'Pengurus Operasi',
    Admin: 'Pentadbir',
    'Loan Officer': 'Pegawai Pinjaman',
    'Sales Advisor': 'Penasihat Jualan',
    Sales: 'Jualan',
    Staff: 'Kakitangan'
  }
};

const getRoleDisplayLabel = (role: string, language: AppLanguage) => ROLE_LABEL_COPY[language][role] || role;

const createDefaultCustomerIntakeUtm = (): CustomerIntakeUtmDraft => ({
  source: 'Facebook'
});

const sanitizeTrackingValue = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

const getCustomerIntakeMedium = (source: string) => {
  const normalized = source.trim().toLowerCase().replace(/[\s_-]+/g, '');

  if (['facebook', 'fb', 'tiktok', 'instagram', 'insta', 'ig'].includes(normalized)) {
    return 'social';
  }

  if (['google', 'googleads', 'search'].includes(normalized)) {
    return 'search';
  }

  if (['walkin', 'showroom', 'shop'].includes(normalized)) {
    return 'offline';
  }

  if (['referral', 'recommendation', 'friend'].includes(normalized)) {
    return 'referral';
  }

  return 'other';
};

const readCustomerIntakeUtmDefaults = (staffName: string): CustomerIntakeUtmDraft => {
  const defaults = createDefaultCustomerIntakeUtm();

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const saved = window.localStorage.getItem(`${CUSTOMER_INTAKE_UTM_STORAGE_PREFIX}:${staffName}`);
    return {
      ...defaults,
      ...(saved ? JSON.parse(saved) : {})
    };
  } catch {
    return defaults;
  }
};

const getDateInputRange = (startDate: string, endDate: string) => {
  const start = startDate ? new Date(`${startDate}T00:00:00`) : undefined;
  const end = endDate ? new Date(`${endDate}T00:00:00`) : undefined;

  if (end) {
    end.setDate(end.getDate() + 1);
  }

  return {
    start: start && !Number.isNaN(start.getTime()) ? start : undefined,
    end: end && !Number.isNaN(end.getTime()) ? end : undefined
  };
};

const formatSubmittedDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString(getAppLocale(), { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
};

// Desktop Loan Applications follows the operations workbook: one column per
// finance company (chosen in Bank Database), showing that company's latest round
// in the workbook's words.
const getBankTimestamp = (value?: string) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getLatestBankApplicationForColumn = (application: LoanApplication, column: LoanTableBankColumn) => (
  (application.bank_applications || [])
    .filter((bankApplication) => bankMatchesColumn(bankApplication.bank_name, column.key))
    .sort((left, right) => (
      (right.round_no || 0) - (left.round_no || 0) ||
      getBankTimestamp(right.decision_at || right.approved_at || right.submitted_at) -
        getBankTimestamp(left.decision_at || left.approved_at || left.submitted_at)
    ))[0]
);

const getFirstBankSubmissionAt = (application: LoanApplication) => (
  (application.bank_applications || [])
    .filter((bankApplication) => bankApplication.status !== 'Draft' && getBankTimestamp(bankApplication.submitted_at) > 0)
    .map((bankApplication) => bankApplication.submitted_at)
    .sort((left, right) => getBankTimestamp(left) - getBankTimestamp(right))[0] || ''
);

const formatTableDate = (value: string) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';

  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getFullYear()).slice(-2)
  ].join('/');
};

// Same words as BANK_STATUS_LABELS in utils/originalLoanExport.ts (not imported
// so the list does not pull the workbook zip library into the main bundle).
const LOAN_TABLE_BANK_STATUS_LABEL: Record<BankApplicationStatus, string> = {
  Draft: 'DRAFT',
  Submitted: 'IN PROCESS',
  'Pending Review': 'IN PROCESS',
  'Need More Info': 'PENDING DOC',
  Rejected: 'REJECT',
  Approved: 'APPROVE',
  Cancelled: 'CANCELLED'
};

const LOAN_TABLE_BANK_STATUS_CLASS: Record<BankApplicationStatus, string> = {
  Draft: 'bg-slate-50 text-slate-400',
  Submitted: 'bg-amber-50 text-amber-700',
  'Pending Review': 'bg-indigo-50 text-indigo-700',
  'Need More Info': 'bg-purple-50 text-purple-700',
  Rejected: 'bg-rose-50 text-rose-600',
  Approved: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-slate-100 text-slate-500'
};


/** IC numbers are compared without dashes or spaces, so 900101-07-0001 matches 900101070001. */
const normalizeIcQuery = (value: string) => value.replace(/[\s-]/g, '').toLowerCase();

const isWithinCustomerTimeFilter = (
  submittedAt: string,
  filter: CustomerTimeFilter,
  customStartDate = '',
  customEndDate = ''
) => {
  if (filter === 'all') {
    return true;
  }

  const submittedDate = new Date(submittedAt);
  if (Number.isNaN(submittedDate.getTime())) {
    return false;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  if (filter === 'custom') {
    const { start, end } = getDateInputRange(customStartDate, customEndDate);
    return (!start || submittedDate >= start) && (!end || submittedDate < end);
  }

  if (filter === 'today') {
    return submittedDate >= startOfToday && submittedDate < startOfTomorrow;
  }

  if (filter === 'last_7_days') {
    const startOfLast7Days = new Date(now);
    startOfLast7Days.setDate(now.getDate() - 7);
    return submittedDate >= startOfLast7Days && submittedDate <= now;
  }

  if (filter === 'last_30_days') {
    const startOfLast30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    return submittedDate >= startOfLast30Days && submittedDate < startOfTomorrow;
  }

  if (filter === 'this_month') {
    return submittedDate >= startOfThisMonth && submittedDate < startOfNextMonth;
  }

  return submittedDate >= startOfLastMonth && submittedDate < startOfThisMonth;
};

/**
 * The selected period for the cards: a heading ("Oct 2026", or "09 Sep - 08 Oct 2026")
 * and a short range on each card ("01 Oct - 08 Oct"). All time has no range.
 */
const getCustomerTimeFilterPeriod = (
  filter: CustomerTimeFilter,
  customStartDate: string,
  customEndDate: string,
  allTimeLabel: string,
  now = new Date()
) => {
  const locale = getAppLocale();
  const dayMonth = (date: Date) => `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString(locale, { month: 'short' })}`;
  const monthYear = (date: Date) => `${date.toLocaleString(locale, { month: 'short' })} ${date.getFullYear()}`;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = (days: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  const span = (from: Date, to: Date) => ({
    label: `${dayMonth(from)}${from.getTime() === to.getTime() ? '' : ` - ${dayMonth(to)}`} ${to.getFullYear()}`,
    range: from.getTime() === to.getTime() ? dayMonth(from) : `${dayMonth(from)} - ${dayMonth(to)}`
  });

  if (filter === 'all') return { label: allTimeLabel, range: '' };
  if (filter === 'today') return span(today, today);
  if (filter === 'last_7_days') return span(daysAgo(7), today);
  if (filter === 'last_30_days') return span(daysAgo(29), today);
  if (filter === 'this_month') {
    return { label: monthYear(today), range: span(new Date(today.getFullYear(), today.getMonth(), 1), today).range };
  }
  if (filter === 'last_month') {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return { label: monthYear(first), range: span(first, new Date(today.getFullYear(), today.getMonth(), 0)).range };
  }

  const { start, end } = getDateInputRange(customStartDate, customEndDate);
  const lastDay = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1) : undefined;
  if (start && lastDay) return span(start, lastDay);
  if (start) return { label: `${dayMonth(start)} ${start.getFullYear()} -`, range: `${dayMonth(start)} -` };
  if (lastDay) return { label: `- ${dayMonth(lastDay)} ${lastDay.getFullYear()}`, range: `- ${dayMonth(lastDay)}` };
  return { label: allTimeLabel, range: '' };
};

type CustomerSortKey =
  | 'applicant_name'
  | 'phone_no'
  | 'ic_no'
  | 'vehicle_model'
  | 'bank_count'
  | 'handler_name'
  | 'status'
  | 'submitted_at';

const BANK_STATUS_BADGE: Record<BankApplicationStatus, string> = {
  Draft: 'bg-slate-50 text-slate-500 border-slate-200',
  Submitted: 'bg-blue-50 text-blue-600 border-blue-100',
  'Pending Review': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Need More Info': 'bg-amber-50 text-amber-700 border-amber-100',
  Rejected: 'bg-slate-100 text-slate-500 border-slate-200',
  Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Cancelled: 'bg-slate-100 text-slate-500 border-slate-200'
};

const getBankTagDetail = (bankApplication: BankApplication) => {
  if (bankApplication.status === 'Need More Info') {
    return bankApplication.reason_category || bankApplication.status_reason || bankApplication.next_action || 'Need info';
  }

  if (bankApplication.status === 'Rejected') {
    return bankApplication.reject_code || bankApplication.reason_category || bankApplication.reject_reason || 'Rejected';
  }

  if (bankApplication.status === 'Approved' && bankApplication.offer_status === 'Not Accepted') {
    return 'Offer not accepted';
  }

  if (bankApplication.status === 'Approved') {
    return bankApplication.offer_status !== 'No Offer' ? bankApplication.offer_status : 'Approved';
  }

  return bankApplication.next_action || bankApplication.reason_category || bankApplication.offer_status;
};

const getBankRejectedReason = (bankApplication: BankApplication) => (
  bankApplication.reject_reason ||
  bankApplication.status_reason ||
  bankApplication.reason_category ||
  bankApplication.reject_code ||
  'Rejected reason not recorded'
);

function BankApplicationIndicator({
  applicationId,
  bankApplication,
  bankDefinitions
}: {
  applicationId: string;
  bankApplication: BankApplication;
  bankDefinitions: BankDefinition[];
}) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();
  const [tooltipPosition, setTooltipPosition] = useState<React.CSSProperties | null>(null);
  const tagDetail = getBankTagDetail(bankApplication);
  const rejectedReason = getBankRejectedReason(bankApplication);
  const isRejected = bankApplication.status === 'Rejected';
  const accessibleSummary = `${bankApplication.bank_name}: ${bankApplication.status}${tagDetail ? ` / ${tagDetail}` : ''}`;

  const updateTooltipPosition = () => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === 'undefined') {
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const viewportMargin = 8;
    const tooltipGap = 8;
    const tooltipWidth = Math.min(256, window.innerWidth - viewportMargin * 2);
    const estimatedTooltipHeight = 112;
    const left = Math.min(
      Math.max(anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2, viewportMargin),
      window.innerWidth - tooltipWidth - viewportMargin
    );
    const hasRoomBelow = anchorRect.bottom + tooltipGap + estimatedTooltipHeight <= window.innerHeight - viewportMargin;

    setTooltipPosition(hasRoomBelow
      ? { left, top: anchorRect.bottom + tooltipGap, width: tooltipWidth }
      : { left, bottom: window.innerHeight - anchorRect.top + tooltipGap, width: tooltipWidth });
  };

  const showTooltip = () => {
    if (isRejected) {
      updateTooltipPosition();
    }
  };

  useEffect(() => {
    if (!tooltipPosition) {
      return;
    }

    const handleReposition = () => updateTooltipPosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [tooltipPosition]);

  return (
    <>
      <span
        ref={anchorRef}
        data-testid={`loan-applications-bank-icon-${applicationId}`}
        className="inline-flex rounded-full"
        tabIndex={isRejected ? 0 : undefined}
        aria-label={accessibleSummary}
        aria-describedby={tooltipPosition ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltipPosition(null)}
        onFocus={showTooltip}
        onBlur={() => setTooltipPosition(null)}
      >
        <BankIcon
          bankName={bankApplication.bank_name}
          bankDefinitions={bankDefinitions}
          status={bankApplication.status}
          size="sm"
        />
      </span>

      {isRejected && tooltipPosition && typeof document !== 'undefined' && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          data-testid={`loan-applications-bank-tooltip-${applicationId}`}
          className="pointer-events-none fixed z-[100] rounded-control border border-slate-200 bg-white p-3 text-left text-caption text-slate-600 shadow-e3 shadow-slate-200/70"
          style={tooltipPosition}
        >
          <span className="block text-micro uppercase text-slate-400">
            {bankApplication.bank_name} {tr('已拒绝', 'rejected', 'ditolak')}
          </span>
          <span className="mt-1 block leading-relaxed">{rejectedReason}</span>
          {bankApplication.reject_code && (
            <span className="mt-2 inline-flex rounded-chip bg-slate-100 px-2 py-0.5 font-mono text-micro tracking-normal text-slate-500">
              {bankApplication.reject_code}
            </span>
          )}
        </span>,
        document.body
      )}
    </>
  );
}

const formatIcNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const birth = digits.slice(0, 6);
  const place = digits.slice(6, 8);
  const serial = digits.slice(8, 12);

  return [
    birth,
    place ? `-${place}` : '',
    serial ? `-${serial}` : ''
  ].join('');
};

const isBasicIcNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 12 && deriveMalaysiaIcBirthDate(digits) !== '';
};

const cleanSubmissionDigits = (value?: string) => (value || '').replace(/\D/g, '');

// A start year/month (staff forms since 2026-10-13) gives "2 TAHUN 3 BULAN"; older files keep the stored years.
const formatSubmissionDuration = (value?: string, startYear?: string, startMonth?: string) => {
  const duration = getEmploymentDuration(startYear, startMonth);
  return duration ? formatYearsMonthsForBank(duration) : formatSubmissionYears(value);
};

const formatSubmissionYears = (value?: string) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return '';
  }

  const yearMatch = trimmed.match(/\d+/);
  if (yearMatch) {
    return `${yearMatch[0]} TAHUN`;
  }

  return trimmed.toUpperCase();
};

const translateGender = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'male' || normalized === 'lelaki') return 'Lelaki';
  if (normalized === 'female' || normalized === 'perempuan') return 'Perempuan';
  return value || '';
};

const translateMaritalStatus = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized === 'married' || normalized === 'berkahwin') {
    return 'Berkahwin';
  }

  if (normalized === 'single' || normalized === 'bujang') {
    return 'Bujang';
  }

  if (normalized === 'divorced' || normalized === 'bercerai') {
    return 'Bercerai';
  }

  if (normalized === 'widowed' || normalized === 'balu' || normalized === 'duda') {
    return 'Balu / Duda';
  }

  return value || '';
};

const translateHousingStatus = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized === 'self-owned' || normalized === 'milik sendiri') {
    return 'Milik sendiri';
  }

  if (normalized === 'family-owned' || normalized === 'milik keluarga') {
    return 'Milik keluarga';
  }

  if (normalized === 'rented' || normalized === 'sewa') {
    return 'Sewa';
  }

  if (normalized === 'company provided' || normalized === 'rumah syarikat') {
    return 'Rumah syarikat';
  }

  if (normalized === 'other' || normalized === 'lain-lain') {
    return 'Lain-lain';
  }

  return value || '';
};

const translateSalaryPaymentMethod = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized.includes('bank')) {
    return 'Bank';
  }

  if (normalized.includes('cash')) {
    return 'Cash';
  }

  return value || '';
};

const translateRelationship = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  const relationshipMap: Record<string, string> = {
    child: 'Anak',
    anak: 'Anak',
    cousin: 'Sepupu',
    sepupu: 'Sepupu',
    sibling: 'Adik-beradik',
    brother: 'Abang / Adik lelaki',
    sister: 'Kakak / Adik perempuan',
    parent: 'Ibu / Bapa',
    father: 'Bapa',
    mother: 'Ibu',
    spouse: 'Pasangan',
    husband: 'Suami',
    wife: 'Isteri',
    friend: 'Kawan'
  };

  return relationshipMap[normalized] || value || '';
};

const translateCallAvailability = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized === 'anytime' || normalized === 'bila bila' || normalized === 'bila-bila') {
    return 'Bila bila';
  }

  return value || '';
};

const formatSubmissionWorkHours = (value?: string) => {
  const trimmed = (value || '').trim();
  const match = trimmed.match(/^(\d{1,2})(?::00)?\s*(am|pm)$/i);

  if (match) {
    return `${match[1]}${match[2].toLowerCase()}`;
  }

  return trimmed;
};

const normalizeDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = cleaned.split('.');
  return decimalParts.length > 0 ? `${whole}.${decimalParts.join('').slice(0, 2)}` : whole;
};

const createEmptyCustomerAddDraft = (handlerName: string, handlerRole: string): CustomerAddDraft => ({
  applicant_name: '',
  phone_no: '',
  ic_no: '',
  vehicle_plate: '',
  vehicle_model: '',
  vehicle_condition: '',
  purchase_method: '',
  total_cash_price: '',
  motor_mileage: '',
  handler_name: handlerName,
  handler_role: handlerRole,
  personal_info: createEmptyPersonalInfo(),
  emergency_contacts: [createEmptyEmergencyContact(), createEmptyEmergencyContact()],
  employment_details: createEmptyEmploymentDetails(),
  preferences: createEmptyPreferences(),
  payslip_documents: [],
  remarks: ''
});

function CustomerList({
  language = 'en',
  applications,
  canEditCustomers,
  canAddCustomer,
  canShareCustomerLinks,
  crossShopPool,
  currentStaffName,
  currentStaffRole,
  defaultHandlerName,
  defaultHandlerRole,
  showAllApplications,
  vehicleCatalog,
  bankDefinitions,
  roleAccounts,
  errorCodeIssueMap,
  riskFlagsByApplicationId,
  rawMatchesByApplicationId,
  onToggleShowAllApplications,
  onSelectCustomer,
  onUpdateCustomer,
  onUpdateLoanApplication,
  onAddCustomer,
  onCreateCustomerIntakeShortLink,
  onOpenBankDatabase,
  onSubmitToBank,
  onOpenBankPage
}: CustomerListProps) {
  const copy = CUSTOMER_LIST_COPY[language];
  const defaultHandlerRoleLabel = getRoleDisplayLabel(defaultHandlerRole, language);
  // One search box over every field, applied on Search / Enter; Advanced search holds the time range.
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const updateSearchDraft = (value: string) => {
    setSearchDraft(value);
    // Emptying the box shows every row again without another click on Search.
    if (!value.trim()) setAppliedSearch('');
  };
  const clearSearch = () => {
    setSearchDraft('');
    setAppliedSearch('');
  };
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<CustomerTimeFilter>('this_month');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');
  // Completed files stay in the table by default (meeting 2026-10-13); "Hide completed" is opt-in.
  const [showCompletedJourneys, setShowCompletedJourneys] = useState(true);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [openAddSections, setOpenAddSections] = useState<Record<AddCustomerSectionKey, boolean>>(DEFAULT_ADD_SECTION_STATE);
  const [isPreparingCustomerDocument, setIsPreparingCustomerDocument] = useState(false);
  const [customerDocumentError, setCustomerDocumentError] = useState('');
  const [isSharingCustomerLink, setIsSharingCustomerLink] = useState(false);
  const [shareUtmDraft, setShareUtmDraft] = useState<CustomerIntakeUtmDraft>(() => readCustomerIntakeUtmDefaults(defaultHandlerName));
  const [shareCopyMessage, setShareCopyMessage] = useState('');
  const [lastShortCustomerIntakeLink, setLastShortCustomerIntakeLink] = useState('');
  const [isCreatingShortCustomerIntakeLink, setIsCreatingShortCustomerIntakeLink] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ customerId: string; field: EditableCustomerCell } | null>(null);
  const [tableCopyMessage, setTableCopyMessage] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<{ message: string; left: number; top: number; placement: 'top' | 'bottom' } | null>(null);
  const clickTimerRef = useRef<number | null>(null);
  const clickBurstRef = useRef<{ customerId: string; count: number; resetTimer: number | null } | null>(null);
  const copyMessageTimerRef = useRef<number | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const [tableScrollTop, setTableScrollTop] = useState(0);
  const [loadedCustomerCount, setLoadedCustomerCount] = useState(CUSTOMER_INITIAL_LOAD_COUNT);
  const [sortState, setSortState] = useState<SortState<CustomerSortKey>>({
    key: 'submitted_at',
    direction: 'desc'
  });
  const [editDraft, setEditDraft] = useState<CustomerEditDraft>({
    applicant_name: '',
    phone_no: '',
    ic_no: '',
    vehicle_plate: '',
    vehicle_model: '',
    vehicle_condition: '',
    purchase_method: '',
    handler_name: defaultHandlerName,
    handler_role: defaultHandlerRole
  });
  const [newCustomerDraft, setNewCustomerDraft] = useState<CustomerAddDraft>(() => createEmptyCustomerAddDraft(defaultHandlerName, defaultHandlerRole));
  const [customerPasteText, setCustomerPasteText] = useState('');
  const [customerPasteFeedback, setCustomerPasteFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const vehicleModelListId = useId();
  const payslipBankListId = useId();
  const vehicleModelSuggestions = useMemo(() => Array.from(
    vehicleCatalog.reduce<Map<string, VehicleCatalogItem>>((items, item) => {
      const model = item.model.trim();
      const key = model.toLowerCase();

      if (model && !items.has(key)) {
        items.set(key, { ...item, model });
      }

      return items;
    }, new Map()).values()
  ).sort((a, b) => a.model.localeCompare(b.model)), [vehicleCatalog]);
  const activeBankOptions = useMemo(
    () => bankDefinitions.filter((bank) => bank.active).map((bank) => bank.name),
    [bankDefinitions]
  );
  const salaryBankInputHistory = useMemo(() => applications.map((application) => (
    application.personal_info?.bank_name || ''
  )), [applications]);
  const payslipBankOptions = useMemo(
    () => getSalaryBankOptions(activeBankOptions, salaryBankInputHistory),
    [activeBankOptions, salaryBankInputHistory]
  );
  const customerTimeFilterOptions = useMemo(() => ([
    { value: 'all' as CustomerTimeFilter, label: copy.allTime },
    { value: 'today' as CustomerTimeFilter, label: tr('今天', 'Today', 'Hari Ini') },
    { value: 'last_7_days' as CustomerTimeFilter, label: tr('最近 7 天', 'Last 7 days', '7 Hari Terakhir') },
    { value: 'last_30_days' as CustomerTimeFilter, label: tr('最近 30 天', 'Last 30 days', '30 Hari Terakhir') },
    { value: 'this_month' as CustomerTimeFilter, label: tr('本月', 'This month', 'Bulan Ini') },
    { value: 'last_month' as CustomerTimeFilter, label: tr('上个月', 'Last month', 'Bulan Lepas') },
    { value: 'custom' as CustomerTimeFilter, label: tr('自定义', 'Custom', 'Tersuai') }
  ]), [copy.allTime, language]);
  const selectedPeriod = useMemo(
    () => getCustomerTimeFilterPeriod(selectedTimeFilter, customStartDate, customEndDate, copy.allTime),
    // language: month names follow the UI language.
    [copy.allTime, customEndDate, customStartDate, language, selectedTimeFilter]
  );
  const selectedTimeFilterLabel = customerTimeFilterOptions.find((option) => option.value === selectedTimeFilter)?.label ?? copy.allTime;
  const staffLoanActionCounts = useMemo(() => {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndTime = todayEnd.getTime();
    const activeAccounts = roleAccounts.filter((account) => account.status === 'Active');
    const hasActiveAdmin = activeAccounts.some((account) => account.role === 'Admin');
    const actionIdsByStaff = new Map<string, Set<string>>();
    const allActionIds = new Set<string>();

    activeAccounts.forEach((account) => {
      const actionIds = new Set<string>();

      applications.forEach((application) => {
        if (isApplicationJourneyComplete(application)) {
          return;
        }

        const pendingWith = getLoanPendingWith(application);
        const pendingAction = getLoanPendingAction(application);

        if (application.handler_name === account.name) {
          const missingDocuments = getMissingDocumentLabels(application);
          const hasMissingInfo = (
            !application.vehicle_condition ||
            !application.purchase_method ||
            (application.status === LoanStatus.REJECT && getApplicationRejectCodes(application).length === 0) ||
            (pendingAction === 'Provide Documents' && missingDocuments.length === 0) ||
            missingDocuments.length > 0
          );

          if (hasMissingInfo || (pendingWith === 'Handler' && pendingAction !== 'None')) {
            actionIds.add(`application-action-${application.id}`);
          }

          const callbackDueTime = getCustomerActionDueTime(application.customer_call_back_at);
          if (Number.isFinite(callbackDueTime) && callbackDueTime <= todayEndTime) {
            actionIds.add(`customer-call-back-${application.id}`);
          }
        }

        const ownsAdminWorkflow = (
          application.admin_owner_name === account.name ||
          (
            !application.admin_owner_name &&
            (account.role === 'Admin' || (account.role === 'Super Admin' && !hasActiveAdmin))
          )
        );

        if (!ownsAdminWorkflow) {
          return;
        }

        if (pendingWith === 'Admin') {
          actionIds.add(`workflow-admin-${application.id}`);
        }

        if (pendingWith === 'Bank') {
          (application.bank_applications || []).forEach((bankApplication) => {
            const followUpDueTime = getCustomerActionDueTime(bankApplication.next_follow_up_at);
            const isActiveBankApplication = (
              !application.active_bank_application_id ||
              application.active_bank_application_id === bankApplication.id
            );
            const isOpenBankApplication = !['Approved', 'Rejected', 'Cancelled'].includes(bankApplication.status);

            if (
              isActiveBankApplication &&
              isOpenBankApplication &&
              Number.isFinite(followUpDueTime) &&
              followUpDueTime <= todayEndTime
            ) {
              actionIds.add(`bank-follow-up-${application.id}-${bankApplication.id}`);
            }
          });
        }
      });

      actionIdsByStaff.set(account.name, actionIds);
      actionIds.forEach((actionId) => allActionIds.add(actionId));
    });

    return {
      all: allActionIds.size,
      byStaff: new Map(Array.from(actionIdsByStaff, ([staffName, actionIds]) => [staffName, actionIds.size]))
    };
  }, [applications, roleAccounts]);
  const renderStaffActionCount = (count: number, testId: string) => (
    <span
      data-testid={testId}
      aria-label={copy.staffActions(count)}
      title={copy.staffActions(count)}
      className={`inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-micro tracking-normal ${
        count > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {count}
    </span>
  );
  const staffFilterOptions = useMemo(() => ([
    {
      value: 'all',
      label: copy.allStaff,
      leading: <InlineAssetIcon icon={UserRound} className="h-5 w-5" />,
      trailing: renderStaffActionCount(staffLoanActionCounts.all, 'loan-staff-action-count-all')
    },
    ...(applications.some((application) => application.handler_name === 'SEO')
      ? [{
          value: 'SEO',
          label: tr('SEO · 待分配', 'SEO · Pending assignment', 'SEO · Menunggu penugasan'),
          leading: <InlineAssetIcon icon={Search} className="h-5 w-5" />,
          trailing: renderStaffActionCount(
            staffLoanActionCounts.byStaff.get('SEO') || 0,
            'loan-staff-action-count-seo'
          )
        }]
      : []),
    ...(applications.some((application) => isStaffLinkQueueHandler(application.handler_name))
      ? [{
          value: STAFF_LINK_QUEUE,
          label: tr('待分配（原员工链接）', 'Unassigned (former staff link)', 'Belum ditugaskan (pautan kakitangan lama)'),
          leading: <InlineAssetIcon icon={Link2} className="h-5 w-5" />,
          trailing: renderStaffActionCount(0, 'loan-staff-action-count-staff-link-queue')
        }]
      : []),
    ...roleAccounts
      .filter((account) => account.status === 'Active')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((account) => ({
        value: account.name,
        label: account.name,
        leading: <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-5 w-5" textClassName="text-[8px]" />,
        trailing: renderStaffActionCount(
          staffLoanActionCounts.byStaff.get(account.name) || 0,
          `loan-staff-action-count-${account.id}`
        )
      }))
  ]), [applications, copy.allStaff, copy.staffActions, roleAccounts, staffLoanActionCounts]);
  const activeHandlerOptions = useMemo(() => roleAccounts
    .filter((account) => account.status === 'Active')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((account) => ({
      value: account.name,
      label: account.name,
      leading: <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-5 w-5" textClassName="text-[8px]" />
    })), [roleAccounts]);
  const activeSalesHandlerOptions = useMemo(() => activeHandlerOptions.filter((option) => (
    roleAccounts.some((account) => account.status === 'Active' && account.role === 'Sales' && account.name === option.value)
  )), [activeHandlerOptions, roleAccounts]);

  const staffFilteredApplications = useMemo(() => (
    selectedStaffFilter === 'all'
      ? applications
      : applications.filter((application) => (
        application.handler_name === selectedStaffFilter ||
        application.admin_owner_name === selectedStaffFilter
      ))
  ), [applications, selectedStaffFilter]);

  const timeFilteredApplications = useMemo(() => (
    staffFilteredApplications.filter((application) => isWithinCustomerTimeFilter(
      application.submitted_at,
      selectedTimeFilter,
      customStartDate,
      customEndDate
    ))
  ), [customEndDate, customStartDate, selectedTimeFilter, staffFilteredApplications]);

  // Total Submit / Total Sale count by when the event happened (first bank
  // submission / delivery) inside the period, not by application date.
  const periodSubmittedApplications = useMemo(() => staffFilteredApplications.filter((application) => {
    const submittedAt = getFirstBankSubmissionAt(application);
    return Boolean(submittedAt) && isWithinCustomerTimeFilter(submittedAt, selectedTimeFilter, customStartDate, customEndDate);
  }), [customEndDate, customStartDate, selectedTimeFilter, staffFilteredApplications]);
  const periodSoldApplications = useMemo(() => staffFilteredApplications.filter((application) => {
    const deliveredAt = application.deal_finance?.delivery_at || '';
    return Boolean(deliveredAt) && isWithinCustomerTimeFilter(deliveredAt, selectedTimeFilter, customStartDate, customEndDate);
  }), [customEndDate, customStartDate, selectedTimeFilter, staffFilteredApplications]);
  const isPeriodStatusFilter = selectedStatusTab === TOTAL_SUBMITTED_FILTER || selectedStatusTab === TOTAL_SALE_FILTER;
  const statusBaseApplications = selectedStatusTab === TOTAL_SUBMITTED_FILTER
    ? periodSubmittedApplications
    : selectedStatusTab === TOTAL_SALE_FILTER
      ? periodSoldApplications
      : timeFilteredApplications;

  useEffect(() => {
    if (!showAllApplications) {
      setSelectedStaffFilter('all');
    }
  }, [showAllApplications]);

  useEffect(() => {
    setNewCustomerDraft((current) => ({
      ...current,
      handler_name: defaultHandlerName,
      handler_role: defaultHandlerRole
    }));
    setShareUtmDraft(readCustomerIntakeUtmDefaults(defaultHandlerName));
  }, [defaultHandlerName, defaultHandlerRole]);

  useEffect(() => () => {
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    if (clickBurstRef.current?.resetTimer) {
      window.clearTimeout(clickBurstRef.current.resetTimer);
    }

    if (copyMessageTimerRef.current) {
      window.clearTimeout(copyMessageTimerRef.current);
    }
  }, []);

  const completedJourneyCount = useMemo(() => (
    statusBaseApplications.filter((application) => (
      (isPeriodStatusFilter || matchesLoanApplicationFilter(application, selectedStatusTab))
      && isApplicationJourneyComplete(application)
    )).length
  ), [isPeriodStatusFilter, selectedStatusTab, statusBaseApplications]);

  const customers = useMemo(() => {
    const query = appliedSearch.trim().toLowerCase();
    const icQuery = normalizeIcQuery(query);

    const getSortValue = (application: LoanApplication) => {
      if (sortState.key === 'submitted_at') {
        return new Date(application.submitted_at).getTime();
      }

      if (sortState.key === 'bank_count') {
        return (application.bank_applications || []).length;
      }

      if (sortState.key === 'vehicle_model') {
        return `${application.vehicle_model} ${application.vehicle_brand} ${application.vehicle_tag}`.toLowerCase();
      }

      return String(application[sortState.key] || '').toLowerCase();
    };

    return statusBaseApplications
      .filter((application) => {
        // A sale is a completed journey, so the period cards always list completed rows.
        if (!isPeriodStatusFilter && !showCompletedJourneys && isApplicationJourneyComplete(application)) {
          return false;
        }

        const matchesStatus = isPeriodStatusFilter || matchesLoanApplicationFilter(application, selectedStatusTab);

        if (!matchesStatus) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          application.applicant_name.toLowerCase().includes(query) ||
          application.phone_no.toLowerCase().includes(query) ||
          (application.personal_info?.email || '').toLowerCase().includes(query) ||
          (application.personal_info?.full_address || '').toLowerCase().includes(query) ||
          (application.personal_info?.resident_address || '').toLowerCase().includes(query) ||
          application.ic_no.toLowerCase().includes(query) ||
          (icQuery.length > 0 && normalizeIcQuery(application.ic_no).includes(icQuery)) ||
          application.vehicle_plate.toLowerCase().includes(query) ||
          application.vehicle_model.toLowerCase().includes(query) ||
          (application.vehicle_condition || '').toLowerCase().includes(query) ||
          (application.purchase_method || '').toLowerCase().includes(query) ||
          application.vehicle_tag.toLowerCase().includes(query) ||
          application.vehicle_brand.toLowerCase().includes(query) ||
          application.handler_name.toLowerCase().includes(query) ||
          (application.admin_owner_name || '').toLowerCase().includes(query) ||
          application.status.toLowerCase().includes(query) ||
          getApplicationRejectCodes(application).some((code) => code.toLowerCase().includes(query)) ||
          application.remarks.toLowerCase().includes(query) ||
          getApplicationRejectCodes(application).some((code) => Boolean(errorCodeIssueMap[code]?.issue.toLowerCase().includes(query))) ||
          getApplicationRejectCodes(application).some((code) => Boolean(errorCodeIssueMap[code]?.customer_request.toLowerCase().includes(query))) ||
          (application.bank_applications || []).some((bankApplication) => (
            bankApplication.bank_name.toLowerCase().includes(query) ||
            bankApplication.status.toLowerCase().includes(query) ||
            bankApplication.offer_status.toLowerCase().includes(query) ||
            bankApplication.reject_code.toLowerCase().includes(query) ||
            bankApplication.reason_category.toLowerCase().includes(query) ||
            bankApplication.status_reason.toLowerCase().includes(query) ||
            bankApplication.next_action.toLowerCase().includes(query)
          )) ||
          application.id.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), sortState.direction));
  }, [errorCodeIssueMap, appliedSearch, isPeriodStatusFilter, selectedStatusTab, showCompletedJourneys, sortState, statusBaseApplications]);

  useEffect(() => {
    setTableScrollTop(0);
    setLoadedCustomerCount(CUSTOMER_INITIAL_LOAD_COUNT);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [appliedSearch, selectedStaffFilter, selectedStatusTab, showCompletedJourneys, sortState.key, sortState.direction, timeFilteredApplications.length]);

  useEffect(() => {
    setLoadedCustomerCount((current) => Math.min(current, Math.max(customers.length, CUSTOMER_INITIAL_LOAD_COUNT)));
  }, [customers.length]);

  const loadedCustomers = useMemo(() => (
    customers.slice(0, Math.min(loadedCustomerCount, customers.length))
  ), [customers, loadedCustomerCount]);

  const virtualWindow = useMemo(() => {
    const viewportRowCount = Math.ceil(CUSTOMER_TABLE_HEIGHT / CUSTOMER_ROW_ESTIMATED_HEIGHT);
    // Never let the window start so late that fewer than a viewport's worth of
    // rows remain — otherwise the tail of the list renders as a blank area.
    const maxStartIndex = Math.max(loadedCustomers.length - viewportRowCount - CUSTOMER_OVERSCAN_ROWS, 0);
    const startIndex = Math.min(
      Math.max(Math.floor(tableScrollTop / CUSTOMER_ROW_ESTIMATED_HEIGHT) - CUSTOMER_OVERSCAN_ROWS, 0),
      maxStartIndex
    );
    const endIndex = Math.min(startIndex + viewportRowCount + (CUSTOMER_OVERSCAN_ROWS * 2), loadedCustomers.length);

    return {
      startIndex,
      endIndex,
      visibleCustomers: loadedCustomers.slice(startIndex, endIndex),
      topSpacerHeight: startIndex * CUSTOMER_ROW_ESTIMATED_HEIGHT,
      bottomSpacerHeight: Math.max((loadedCustomers.length - endIndex) * CUSTOMER_ROW_ESTIMATED_HEIGHT, 0)
    };
  }, [loadedCustomers, tableScrollTop]);
  const visibleCustomers = virtualWindow.visibleCustomers;
  const loanTableBankColumns = useMemo(
    () => getLoanTableBankColumns(bankDefinitions, customers),
    [bankDefinitions, customers]
  );
  const loanTableColumnCount = 5 + loanTableBankColumns.length;
  const banksMissingFromDatabase = loanTableBankColumns.filter((column) => !column.inBankDatabase).map((column) => column.label);
  const { showConfirm } = useBrandedDialog();
  const [submittingBankCell, setSubmittingBankCell] = useState('');
  // Double-clicking a bank waiting on the bank's reply opens the five decisions next to the cell.
  const [bankDecisionMenu, setBankDecisionMenu] = useState<{
    application: LoanApplication;
    bankApplicationId: string;
    bankLabel: string;
    top: number;
    left: number;
  } | null>(null);
  const bankCellClickTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(bankCellClickTimerRef.current), []);
  useEffect(() => {
    if (!bankDecisionMenu) return undefined;
    const close = () => setBankDecisionMenu(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', close);
    };
  }, [bankDecisionMenu]);
  const handleSubmitToBankCell = async (customer: LoanApplication, column: LoanTableBankColumn) => {
    if (!onSubmitToBank || submittingBankCell) return;
    const missingDocuments = getMissingDocumentLabels(customer);
    if (missingDocuments.length > 0) {
      const openApplication = await showConfirm({
        eyebrow: tr('银行申请', 'Bank Application', 'Permohonan Bank'),
        title: tr('还不能提交银行', 'Not ready for the bank', 'Belum boleh dihantar ke bank'),
        message: tr(
          `${customer.applicant_name} 还缺文件：${missingDocuments.join('、')}。先在申请详情里上传，再提交到 ${column.label}。`,
          `${customer.applicant_name} is still missing: ${missingDocuments.join(', ')}. Upload them in the application first, then submit to ${column.label}.`,
          `${customer.applicant_name} masih kurang: ${missingDocuments.join(', ')}. Muat naik dalam permohonan dahulu, kemudian hantar ke ${column.label}.`
        ),
        tone: 'warning',
        confirmLabel: tr('打开申请', 'Open application', 'Buka permohonan')
      });
      if (openApplication) onSelectCustomer(customer);
      return;
    }
    const confirmed = await showConfirm({
      eyebrow: tr('银行申请', 'Bank Application', 'Permohonan Bank'),
      title: tr('提交银行', 'Submit to Bank', 'Hantar ke Bank'),
      message: tr(
        `确认把 ${customer.applicant_name} 的申请提交到 ${column.label}？`,
        `Submit ${customer.applicant_name}'s application to ${column.label}?`,
        `Hantar permohonan ${customer.applicant_name} kepada ${column.label}?`
      ),
      tone: 'warning',
      confirmLabel: tr('提交银行', 'Submit to Bank', 'Hantar ke Bank')
    });
    if (!confirmed) return;
    setSubmittingBankCell(`${customer.id}:${column.key}`);
    try {
      await onSubmitToBank(customer.id, column.label);
    } finally {
      setSubmittingBankCell('');
    }
  };
  const loanTableHeaderCellClass = 'whitespace-nowrap border-b border-r border-slate-200 px-2.5 font-bold last:border-r-0';
  const loanTableBodyCellClass = 'whitespace-nowrap border-b border-r border-slate-200 px-2.5 py-2 align-middle last:border-r-0';
  const hasMoreCustomersToLoad = loadedCustomers.length < customers.length;
  const tableResultText = hasMoreCustomersToLoad
    ? tr(`已显示 ${loadedCustomers.length} / ${customers.length} 项`, `Showing ${loadedCustomers.length} / ${customers.length} items`, `Menunjukkan ${loadedCustomers.length} / ${customers.length} item`)
    : copy.totalItems(customers.length);

  const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setTableScrollTop(target.scrollTop);

    if (target.scrollHeight - target.scrollTop - target.clientHeight <= CUSTOMER_LOAD_MORE_THRESHOLD_PX) {
      setLoadedCustomerCount((current) => Math.min(current + CUSTOMER_LOAD_MORE_COUNT, customers.length));
    }
  };

  const handleSort = (key: CustomerSortKey, defaultDirection: SortDirection = key === 'submitted_at' || key === 'bank_count' ? 'desc' : 'asc') => {
    setSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const startEditingCustomer = (customer: LoanApplication) => {
    setEditingCustomerId(customer.id);
    setEditingCell(null);
    setEditDraft({
      applicant_name: customer.applicant_name,
      phone_no: customer.phone_no,
      ic_no: customer.ic_no,
      vehicle_plate: customer.vehicle_plate,
      vehicle_model: customer.vehicle_model,
      vehicle_condition: customer.vehicle_condition || '',
      purchase_method: customer.purchase_method || '',
      handler_name: customer.handler_name,
      handler_role: customer.handler_role
    });
  };

  const startEditingCustomerCell = (customer: LoanApplication, field: EditableCustomerCell) => {
    if (!canEditCustomers && customer.handler_name !== currentStaffName) {
      return;
    }

    setEditingCustomerId(null);
    setEditingCell({ customerId: customer.id, field });
    setEditDraft({
      applicant_name: customer.applicant_name,
      phone_no: customer.phone_no,
      ic_no: customer.ic_no,
      vehicle_plate: customer.vehicle_plate,
      vehicle_model: customer.vehicle_model,
      vehicle_condition: customer.vehicle_condition || '',
      purchase_method: customer.purchase_method || '',
      handler_name: customer.handler_name,
      handler_role: customer.handler_role
    });
  };

  const cancelEditingCustomer = () => {
    setEditingCustomerId(null);
    setEditingCell(null);
  };

  const saveEditingCustomer = (id: string) => {
    const customer = applications.find((application) => application.id === id);
    const activeField = editingCell?.customerId === id ? editingCell.field : null;
    const isWholeRowEdit = editingCustomerId === id;

    if (!customer || (!activeField && !isWholeRowEdit)) {
      return false;
    }

    const applicantName = isWholeRowEdit || activeField === 'customer'
      ? editDraft.applicant_name.trim()
      : customer.applicant_name;
    const phoneNo = isWholeRowEdit || activeField === 'contact'
      ? formatPhoneNumber(editDraft.phone_no)
      : customer.phone_no;
    const icNo = isWholeRowEdit || activeField === 'identity'
      ? formatIcNumber(editDraft.ic_no)
      : customer.ic_no;
    const vehiclePlate = isWholeRowEdit || activeField === 'identity'
      ? editDraft.vehicle_plate.trim()
      : customer.vehicle_plate;
    const vehicleModel = isWholeRowEdit || activeField === 'vehicle'
      ? editDraft.vehicle_model.trim()
      : customer.vehicle_model;
    const vehicleCondition = isWholeRowEdit || activeField === 'vehicle'
      ? editDraft.vehicle_condition
      : customer.vehicle_condition || '';
    const purchaseMethod = isWholeRowEdit || activeField === 'vehicle'
      ? editDraft.purchase_method
      : customer.purchase_method || '';

    if (
      ((isWholeRowEdit || activeField === 'customer') && !applicantName) ||
      ((isWholeRowEdit || activeField === 'contact') && !isBasicPhoneNumber(phoneNo)) ||
      ((isWholeRowEdit || activeField === 'identity') && !isBasicIcNumber(icNo)) ||
      ((isWholeRowEdit || activeField === 'vehicle') && !vehicleModel)
    ) {
      return false;
    }

    onUpdateCustomer(id, {
      applicant_name: applicantName,
      phone_no: phoneNo,
      ic_no: icNo,
      vehicle_plate: vehiclePlate,
      vehicle_model: vehicleModel,
      vehicle_condition: vehicleCondition,
      purchase_method: purchaseMethod,
      handler_name: isWholeRowEdit ? editDraft.handler_name.trim() : customer.handler_name,
      handler_role: isWholeRowEdit ? editDraft.handler_role.trim() : customer.handler_role
    });
    setEditingCustomerId(null);
    setEditingCell(null);
    return true;
  };

  const handleEditableCellBlur = (event: React.FocusEvent<HTMLDivElement>, customerId: string) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    saveEditingCustomer(customerId);
  };

  const handleEditableCellKeyDown = (event: React.KeyboardEvent, customerId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEditingCustomer(customerId);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditingCustomer();
    }
  };

  const getCopyFeedbackPosition = (anchorElement?: HTMLElement | null) => {
    if (!anchorElement) {
      return {
        left: Math.max(16, window.innerWidth - 164),
        top: Math.max(16, window.innerHeight - 96),
        placement: 'bottom' as const
      };
    }

    const rect = anchorElement.getBoundingClientRect();
    const estimatedWidth = 220;
    const minLeft = 16 + estimatedWidth / 2;
    const maxLeft = window.innerWidth - 16 - estimatedWidth / 2;
    const placement: 'top' | 'bottom' = rect.top > 76 ? 'top' : 'bottom';

    return {
      left: Math.min(maxLeft, Math.max(minLeft, rect.left + rect.width / 2)),
      top: placement === 'top' ? Math.max(12, rect.top - 8) : Math.min(window.innerHeight - 12, rect.bottom + 8),
      placement
    };
  };

  const copyTextToClipboard = async (
    value: string,
    label: string,
    anchorElement?: HTMLElement | null,
    successMessage = `${label} copied`
  ) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    if (copyMessageTimerRef.current) {
      window.clearTimeout(copyMessageTimerRef.current);
    }

    const message = successMessage;
    setTableCopyMessage(message);
    setCopyFeedback({ message, ...getCopyFeedbackPosition(anchorElement) });
    copyMessageTimerRef.current = window.setTimeout(() => {
      setTableCopyMessage('');
      setCopyFeedback(null);
    }, 1600);
  };

  const buildCustomerCopyText = (customer: LoanApplication) => {
    const personalInfo = customer.personal_info || createEmptyPersonalInfo();
    const employmentDetails = customer.employment_details || createEmptyEmploymentDetails();
    const preferences = customer.preferences || createEmptyPreferences();
    const emergencyContacts = customer.emergency_contacts || [];
    const rawLeadId = rawMatchesByApplicationId[customer.id]?.[0]?.raw_customer_lead_id;
    const responseId = rawLeadId || customer.id;
    const contactOne = emergencyContacts[0] || createEmptyEmergencyContact();
    const contactTwo = emergencyContacts[1] || createEmptyEmergencyContact();
    const selectedMotorcycle = preferences.preferred_motorcycle || customer.vehicle_model;

    return [
      `Response #${responseId}`,
      '',
      'ISI DETAIL MAKLUMAT',
      '',
      `NAMA PENUH : ${customer.applicant_name}`,
      `NO IC : ${cleanSubmissionDigits(customer.ic_no)}`,
      `NOMBOR TELEFON : ${formatMalaysiaPhoneForCopy(customer.phone_no)}`,
      `JANTINA : ${translateGender(personalInfo.gender)}`,
      `BANGSA : ${personalInfo.race || ''}`,
      `STATUS PERKAHWINAN : ${translateMaritalStatus(personalInfo.marital_status)}`,
      ...(hasChildrenQuestion(personalInfo.marital_status) ? [`BILANGAN ANAK : ${getEffectiveNumberOfChildren(personalInfo)}`] : []),
      `NAMA BANK : ${personalInfo.bank_name}`,
      `NOMBOR AKAUN : ${cleanSubmissionDigits(personalInfo.account_number)}`,
      `EMAIL : ${personalInfo.email}`,
      `ALAMAT TETAP (IC) : ${personalInfo.full_address}`,
      `ALAMAT KEDIAMAN : ${personalInfo.resident_address || ''}`,
      `MENETAP BERAPA TAHUN : ${formatSubmissionDuration(personalInfo.years_at_residence, personalInfo.residence_start_year, personalInfo.residence_start_month)}`,
      `STATUS KEDIAMAN : ${translateHousingStatus(personalInfo.housing_status)}`,
      '',
      'EMERGENCY CONTACT 1',
      '',
      `NAMA PENUH : ${contactOne.full_name}`,
      `HUBUNGAN : ${translateRelationship(contactOne.relationship)}`,
      `ALAMAT PENUH : ${contactOne.full_address}`,
      `NOMBOR TELEFON : ${formatMalaysiaPhoneForCopy(contactOne.phone_no)}`,
      '',
      'EMERGENCY CONTACT 2',
      '',
      `NAMA PENUH : ${contactTwo.full_name}`,
      `HUBUNGAN : ${translateRelationship(contactTwo.relationship)}`,
      `ALAMAT PENUH : ${contactTwo.full_address}`,
      `NOMBOR TELEFON : ${formatMalaysiaPhoneForCopy(contactTwo.phone_no)}`,
      '',
      'MAKLUMAT SYARIKAT KERJA',
      '',
      `NAMA SYARIKAT : ${employmentDetails.company_name}`,
      `JAWATAN ANDA : ${employmentDetails.position}`,
      `GAJI KASAR BULANAN : ${employmentDetails.gross_monthly_salary || ''}`,
      `GAJI BERSIH BULANAN : ${employmentDetails.net_monthly_salary || ''}`,
      `KERJA BERAPA TAHUN : ${formatSubmissionDuration(employmentDetails.years_employed, employmentDetails.employment_start_year, employmentDetails.employment_start_month)}`,
      `ALAMAT PENUH SYARIKAT : ${employmentDetails.company_address}`,
      `NOMBOR TELEFON PEJABAT : ${formatMalaysiaPhoneForCopy(employmentDetails.office_phone_no)}`,
      `JAM  : ${formatSubmissionWorkHours(employmentDetails.work_hours)}`,
      '',
      'STATUS',
      '',
      `WAKTU BOLEH JAWAB CALL : ${translateCallAvailability(preferences.available_to_receive_calls)}`,
      `GAJI MASUK BANK / CASH : ${translateSalaryPaymentMethod(preferences.salary_payment_method)}`,
      `MOTOR PILIHAN : ${selectedMotorcycle}`,
      `IKAT TAHUN : ${formatSubmissionYears(preferences.loan_tenure)}`
    ].join('\n');
  };

  const resetCustomerClickBurst = () => {
    if (clickBurstRef.current?.resetTimer) {
      window.clearTimeout(clickBurstRef.current.resetTimer);
    }

    clickBurstRef.current = null;
  };

  const registerCustomerClick = (customerId: string) => {
    const currentBurst = clickBurstRef.current;
    const nextCount = currentBurst?.customerId === customerId ? currentBurst.count + 1 : 1;

    if (currentBurst?.resetTimer) {
      window.clearTimeout(currentBurst.resetTimer);
    }

    clickBurstRef.current = {
      customerId,
      count: nextCount,
      resetTimer: window.setTimeout(() => {
        if (clickBurstRef.current?.customerId === customerId) {
          clickBurstRef.current = null;
        }
      }, CUSTOMER_CLICK_BURST_RESET_MS)
    };

    return nextCount;
  };

  const copyLoanSubmissionTemplate = (customer: LoanApplication, anchorElement?: HTMLElement | null) => {
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    resetCustomerClickBurst();
    copyTextToClipboard(buildCustomerCopyText(customer), 'Loan submission template', anchorElement);
  };

  const handleActiveEditableCellClick = (event: React.MouseEvent, customer: LoanApplication) => {
    event.stopPropagation();

    if (registerCustomerClick(customer.id) >= 4) {
      copyLoanSubmissionTemplate(customer, event.currentTarget as HTMLElement);
    }
  };

  const handleCustomerCellClick = (
    event: React.MouseEvent,
    customer: LoanApplication,
    options: {
      copyValue?: string;
      copyLabel?: string;
      editField?: EditableCustomerCell;
      doubleClickCopy?: boolean;
    }
  ) => {
    event.stopPropagation();
    const anchorElement = event.currentTarget as HTMLElement;
    const clickCount = registerCustomerClick(customer.id);

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    if (clickCount >= 4) {
      copyLoanSubmissionTemplate(customer, anchorElement);
      return;
    }

    if (clickCount === 3 && options.editField) {
      startEditingCustomerCell(customer, options.editField);
      return;
    }

    if (clickCount === 2 && options.doubleClickCopy !== false && options.copyValue) {
      clickTimerRef.current = window.setTimeout(() => {
        copyTextToClipboard(options.copyValue, options.copyLabel || 'Content', anchorElement);
        clickTimerRef.current = null;
      }, CUSTOMER_COPY_DELAY_MS);
      return;
    }

    if (clickCount === 1) {
      clickTimerRef.current = window.setTimeout(() => {
        onSelectCustomer(customer);
        clickTimerRef.current = null;
      }, CUSTOMER_DRAWER_OPEN_DELAY_MS);
    }
  };

  const handleCustomerRowClick = (event: React.MouseEvent<HTMLElement>, customer: LoanApplication, isEditing: boolean) => {
    if (isEditing) {
      return;
    }

    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button, input, select, textarea, a, [role="button"]')) {
      return;
    }

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    if (event.detail > 1) {
      return;
    }

    clickTimerRef.current = window.setTimeout(() => {
      onSelectCustomer(customer);
      clickTimerRef.current = null;
    }, CUSTOMER_DRAWER_OPEN_DELAY_MS);
  };

  const updateDraft = <K extends keyof CustomerEditDraft>(field: K, value: CustomerEditDraft[K]) => {
    setEditDraft((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateNewCustomerDraft = <K extends keyof CustomerEditDraft>(field: K, value: CustomerEditDraft[K]) => {
    setNewCustomerDraft((current) => ({
      ...current,
      [field]: value,
      preferences: field === 'purchase_method' && value !== 'Loan'
        ? { ...current.preferences, loan_tenure: '' }
        : current.preferences
    }));
  };

  const updateNewCustomerPersonalInfo = <K extends keyof CustomerPersonalInfo>(field: K, value: CustomerPersonalInfo[K]) => {
    setNewCustomerDraft((current) => {
      const personalInfo = { ...current.personal_info, [field]: value };
      const residenceDuration = field === 'residence_start_year' || field === 'residence_start_month'
        ? getEmploymentDuration(personalInfo.residence_start_year, personalInfo.residence_start_month)
        : null;
      return {
        ...current,
        personal_info: {
          ...personalInfo,
          ...(residenceDuration ? { years_at_residence: String(residenceDuration.years) } : {}),
          ...((field === 'residence_start_year' || field === 'residence_start_month') && !personalInfo.residence_start_year && !personalInfo.residence_start_month ? { years_at_residence: '' } : {}),
          ...(field === 'marital_status' && !hasChildrenQuestion(String(value)) ? { number_of_children: '' } : {})
        }
      };
    });
  };

  const updateNewCustomerEmploymentDetails = <K extends keyof CustomerEmploymentDetails>(field: K, value: CustomerEmploymentDetails[K]) => {
    setNewCustomerDraft((current) => {
      const employmentDetails = { ...current.employment_details, [field]: value };
      const employmentDuration = field === 'employment_start_year' || field === 'employment_start_month'
        ? getEmploymentDuration(employmentDetails.employment_start_year, employmentDetails.employment_start_month)
        : null;
      return {
        ...current,
        employment_details: {
          ...employmentDetails,
          ...(employmentDuration ? { years_employed: String(employmentDuration.years) } : {})
        }
      };
    });
  };

  const updateNewCustomerEmergencyContact = <K extends keyof EmergencyContact>(index: number, field: K, value: EmergencyContact[K]) => {
    setNewCustomerDraft((current) => {
      const contacts = current.emergency_contacts.length >= 2
        ? [...current.emergency_contacts]
        : [createEmptyEmergencyContact(), createEmptyEmergencyContact()];

      contacts[index] = {
        ...contacts[index],
        [field]: value
      };

      return {
        ...current,
        emergency_contacts: contacts
      };
    });
  };

  const updateNewCustomerPreferences = <K extends keyof CustomerPreferences>(field: K, value: CustomerPreferences[K]) => {
    setNewCustomerDraft((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [field]: value
      }
    }));
  };

  const applyPastedCustomerDetails = (text: string) => {
    const parsed = parseCustomerPasteText(text);
    if (parsed.matched_fields.length === 0) {
      setCustomerPasteFeedback({
        tone: 'error',
        message: tr(
          '无法识别资料。请确认内容包含「NAMA PENUH :」等标签。',
          'No customer fields were detected. Check that the text contains labels such as "NAMA PENUH :".',
          'Tiada medan pelanggan dikesan. Pastikan teks mengandungi label seperti "NAMA PENUH :".'
        )
      });
      return;
    }

    setNewCustomerDraft((current) => {
      const contacts = current.emergency_contacts.length >= 2
        ? current.emergency_contacts
        : [createEmptyEmergencyContact(), createEmptyEmergencyContact()];

      return {
        ...current,
        applicant_name: parsed.applicant_name ?? current.applicant_name,
        phone_no: parsed.phone_no ? formatPhoneNumber(parsed.phone_no) : current.phone_no,
        ic_no: parsed.ic_no ? formatIcNumber(parsed.ic_no) : current.ic_no,
        vehicle_model: parsed.vehicle_model ?? current.vehicle_model,
        purchase_method: parsed.purchase_method ?? current.purchase_method,
        personal_info: {
          ...current.personal_info,
          ...parsed.personal_info
        },
        emergency_contacts: [
          { ...contacts[0], ...parsed.emergency_contacts[0] },
          { ...contacts[1], ...parsed.emergency_contacts[1] }
        ],
        employment_details: {
          ...current.employment_details,
          ...parsed.employment_details
        },
        preferences: {
          ...current.preferences,
          ...parsed.preferences
        }
      };
    });

    setOpenAddSections((current) => ({
      ...current,
      personal: true,
      vehicle: true,
      employment: Object.keys(parsed.employment_details).length > 0 || current.employment,
      contacts: parsed.emergency_contacts.some((contact) => Object.keys(contact).length > 0) || current.contacts,
      preferences: Object.keys(parsed.preferences).length > 0 || current.preferences
    }));

    const skippedMessage = parsed.skipped_labels.length > 0
      ? tr(
          `未对应的标签：${parsed.skipped_labels.join('、')}。`,
          `Skipped labels without a matching form field: ${parsed.skipped_labels.join(', ')}.`,
          `Label tanpa medan borang yang sepadan telah dilangkau: ${parsed.skipped_labels.join(', ')}.`
        )
      : '';
    // Lines the parser could not place (an unknown heading, a note) are named, not
    // glued onto a field, so staff can copy them in by hand.
    const unknownLines = parsed.unknown_lines.map((line) => `「${line.slice(0, 60)}」`).join(' ');
    const unknownMessage = parsed.unknown_lines.length > 0
      ? tr(
          `没认出、没填的行：${unknownLines},请手动检查。`,
          `Lines not recognised and not filled: ${unknownLines}. Check them by hand.`,
          `Baris tidak dikenali dan tidak diisi: ${unknownLines}. Sila semak secara manual.`
        )
      : '';
    const warningMessage = parsed.warnings.length > 0
      ? tr(
          '工作时长使用月份单位，已取数字填入 Years Employed，请员工确认。',
          parsed.warnings.join(' '),
          'Tempoh kerja menggunakan unit bulan; nombor telah diisi dalam Years Employed. Sila semak.'
        )
      : '';
    setCustomerPasteFeedback({
      tone: 'success',
      message: [
        tr(
          `已自动填入 ${parsed.matched_fields.length} 个栏位。请员工检查后再建立客户。`,
          `Auto-filled ${parsed.matched_fields.length} fields. Review them before creating the customer.`,
          `${parsed.matched_fields.length} medan diisi secara automatik. Semak sebelum mencipta pelanggan.`
        ),
        skippedMessage,
        unknownMessage,
        warningMessage
      ].filter(Boolean).join(' ')
    });
  };

  const handleNewCustomerDocumentUpload = async (
    documentKey: CustomerDocumentKey,
    files: File[]
  ) => {
    if (files.length === 0) return;

    const uploadLimit = getCustomerDocumentUploadLimit(documentKey);
    const existingCount = newCustomerDraft.payslip_documents.filter((document) => (
      (document.document_key || 'payslip') === documentKey
    )).length;
    if (existingCount + files.length > uploadLimit) {
      setCustomerDocumentError(tr(
        `${documentKey === 'ic' ? '身份证文件' : documentKey === 'payslip' ? '工资单' : documentKey === 'bank_statement' ? '补充文件' : '车辆 Geran'}最多只能上传 ${uploadLimit} 个`,
        `${documentKey === 'ic' ? 'IC Document' : documentKey === 'payslip' ? 'Payslip' : documentKey === 'bank_statement' ? 'Supporting Doc' : 'Vehicle Geran'} accepts up to ${uploadLimit} files`,
        `${documentKey === 'ic' ? 'Dokumen IC' : documentKey === 'payslip' ? 'Slip Gaji' : documentKey === 'bank_statement' ? 'Dokumen Sokongan' : 'Geran Kenderaan'} menerima sehingga ${uploadLimit} fail`
      ));
      return;
    }

    const invalidFile = files.find((file) => (
      !CUSTOMER_DOCUMENT_ACCEPTED_TYPES.has(file.type) ||
      file.size <= 0 ||
      file.size > CUSTOMER_DOCUMENT_MAX_FILE_SIZE_BYTES
    ));
    if (invalidFile) {
      setCustomerDocumentError(tr(
        `${invalidFile.name} 格式不支持或超过 10 MB`,
        `${invalidFile.name} is unsupported or larger than 10 MB`,
        `${invalidFile.name} tidak disokong atau melebihi 10 MB`
      ));
      return;
    }

    setCustomerDocumentError('');
    setIsPreparingCustomerDocument(true);

    try {
      const uploadedAt = new Date().toISOString();
      const prepared = await Promise.all(files.map(async (file, index): Promise<PayslipDocument> => ({
        id: newId(`DOC-DRAFT-${documentKey}`),
        document_key: documentKey,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: defaultHandlerName,
        uploaded_at: uploadedAt,
        file_data_url: await prepareCustomerDocumentDataUrl(file)
      })));

      setNewCustomerDraft((current) => ({
        ...current,
        payslip_documents: [...current.payslip_documents, ...prepared]
      }));
    } catch {
      setCustomerDocumentError(tr(
        '文件读取失败，请重试',
        'Document could not be read. Please try again.',
        'Dokumen tidak dapat dibaca. Sila cuba lagi.'
      ));
    } finally {
      setIsPreparingCustomerDocument(false);
    }
  };

  const removeNewCustomerDocument = (documentId: string) => {
    setNewCustomerDraft((current) => ({
      ...current,
      payslip_documents: current.payslip_documents.filter((document) => document.id !== documentId)
    }));
  };

  const resetNewCustomerDraft = () => {
    setNewCustomerDraft(createEmptyCustomerAddDraft(defaultHandlerName, defaultHandlerRole));
    setOpenAddSections(DEFAULT_ADD_SECTION_STATE);
    setCustomerPasteText('');
    setCustomerPasteFeedback(null);
    setCustomerDocumentError('');
    setIsPreparingCustomerDocument(false);
    setIsAddingCustomer(false);
  };

  const handleAddCustomer = () => {
    const isCashPurchase = newCustomerDraft.purchase_method === 'Cash';
    // Every loan keeps a bank account, cash salary too (owner 2026-10-20).
    const keepsBankAccount = !isCashPurchase;
    const allowedDocumentKeys = new Set<CustomerDocumentKey>(getNewCustomerDocumentKeys(
      newCustomerDraft.purchase_method,
      newCustomerDraft.vehicle_condition
    ));
    const customer = {
      applicant_name: newCustomerDraft.applicant_name.trim(),
      phone_no: formatPhoneNumber(newCustomerDraft.phone_no),
      ic_no: formatIcNumber(newCustomerDraft.ic_no),
      vehicle_plate: newCustomerDraft.vehicle_plate.trim().toUpperCase(),
      vehicle_model: newCustomerDraft.vehicle_model.trim(),
      vehicle_condition: newCustomerDraft.vehicle_condition,
      purchase_method: newCustomerDraft.purchase_method,
      total_cash_price: isCashPurchase ? newCustomerDraft.total_cash_price.trim() : '',
      motor_mileage: newCustomerDraft.vehicle_condition === 'Used'
        ? newCustomerDraft.motor_mileage.trim()
        : '',
      handler_name: defaultHandlerName,
      handler_role: defaultHandlerRole,
      personal_info: {
        ...createEmptyPersonalInfo(),
        email: newCustomerDraft.personal_info.email.trim(),
        gender: isCashPurchase ? '' : newCustomerDraft.personal_info.gender?.trim() || '',
        race: isCashPurchase ? '' : newCustomerDraft.personal_info.race?.trim() || '',
        marital_status: isCashPurchase ? '' : newCustomerDraft.personal_info.marital_status.trim(),
        number_of_children: isCashPurchase ? '' : getEffectiveNumberOfChildren(newCustomerDraft.personal_info),
        bank_name: keepsBankAccount ? newCustomerDraft.personal_info.bank_name.trim() : '',
        account_number: keepsBankAccount ? newCustomerDraft.personal_info.account_number.trim() : '',
        full_address: newCustomerDraft.personal_info.full_address.trim(),
        resident_address: newCustomerDraft.personal_info.resident_address?.trim() || '',
        years_at_residence: isCashPurchase ? '' : newCustomerDraft.personal_info.years_at_residence.trim(),
        residence_start_year: isCashPurchase ? '' : newCustomerDraft.personal_info.residence_start_year || '',
        residence_start_month: isCashPurchase ? '' : newCustomerDraft.personal_info.residence_start_month || '',
        housing_status: isCashPurchase ? '' : newCustomerDraft.personal_info.housing_status.trim()
      },
      emergency_contacts: (isCashPurchase ? [] : newCustomerDraft.emergency_contacts).map((contact) => ({
        full_name: contact.full_name.trim(),
        relationship: contact.relationship.trim(),
        full_address: contact.full_address.trim(),
        phone_no: contact.phone_no.trim()
      })),
      employment_details: isCashPurchase ? createEmptyEmploymentDetails() : {
        ...createEmptyEmploymentDetails(),
        company_name: newCustomerDraft.employment_details.company_name.trim(),
        position: newCustomerDraft.employment_details.position.trim(),
        years_employed: newCustomerDraft.employment_details.years_employed.trim(),
        employment_start_year: newCustomerDraft.employment_details.employment_start_year || '',
        employment_start_month: newCustomerDraft.employment_details.employment_start_month || '',
        company_address: newCustomerDraft.employment_details.company_address.trim(),
        office_phone_no: newCustomerDraft.employment_details.office_phone_no.trim(),
        gross_monthly_salary: newCustomerDraft.employment_details.gross_monthly_salary?.trim() || '',
        net_monthly_salary: newCustomerDraft.employment_details.net_monthly_salary?.trim() || ''
      },
      preferences: {
        ...createEmptyPreferences(),
        available_to_receive_calls: isCashPurchase ? '' : newCustomerDraft.preferences.available_to_receive_calls.trim(),
        salary_payment_method: isCashPurchase ? '' : newCustomerDraft.preferences.salary_payment_method.trim(),
        preferred_motorcycle: newCustomerDraft.vehicle_model.trim(),
        loan_tenure: isCashPurchase ? '' : newCustomerDraft.preferences.loan_tenure.trim()
      },
      payslip_documents: newCustomerDraft.payslip_documents.filter((document) => (
        allowedDocumentKeys.has(document.document_key || 'payslip')
      )),
      remarks: newCustomerDraft.remarks.trim()
    };

    if (!customer.applicant_name || !isBasicPhoneNumber(customer.phone_no) || !isBasicIcNumber(customer.ic_no) || !customer.vehicle_model || !customer.purchase_method) {
      return;
    }

    onAddCustomer(customer);
    resetNewCustomerDraft();
  };

  const buildCustomerIntakeLink = () => {
    const params = new URLSearchParams({
      sales: defaultHandlerName,
      role: defaultHandlerRole,
      ci_utm_source: sanitizeTrackingValue(shareUtmDraft.source),
      ci_utm_medium: getCustomerIntakeMedium(shareUtmDraft.source),
      ci_utm_staff: sanitizeTrackingValue(defaultHandlerName),
      shared_at: new Date().toISOString()
    });

    return buildPublicSiteUrl(`/customer-intake?${params.toString()}`);
  };

  const customerIntakeLink = buildCustomerIntakeLink();

  const updateShareUtmDraft = (field: keyof CustomerIntakeUtmDraft, value: string) => {
    setShareUtmDraft((current) => ({
      ...current,
      [field]: value
    }));
    setShareCopyMessage('');
    setLastShortCustomerIntakeLink('');
  };

  const saveShareUtmDefault = () => {
    window.localStorage.setItem(`${CUSTOMER_INTAKE_UTM_STORAGE_PREFIX}:${defaultHandlerName}`, JSON.stringify(shareUtmDraft));
    setShareCopyMessage('Default source saved');
  };

  const copyShortCustomerIntakeLink = async (anchorElement?: HTMLElement | null) => {
    if (isCreatingShortCustomerIntakeLink) return;
    const medium = getCustomerIntakeMedium(shareUtmDraft.source);
    let shortLink = '';
    setIsCreatingShortCustomerIntakeLink(true);
    try {
      shortLink = await onCreateCustomerIntakeShortLink(customerIntakeLink, sanitizeTrackingValue(shareUtmDraft.source), medium);
    } catch (error) {
      console.warn('Customer intake short link save failed.', error);
      setShareCopyMessage(copy.shortLinkSaveFailed);
      return;
    } finally {
      setIsCreatingShortCustomerIntakeLink(false);
    }

    setLastShortCustomerIntakeLink(shortLink);
    try {
      await copyTextToClipboard(shortLink, copy.shortLink, anchorElement, copy.shortLinkCopied);
      setShareCopyMessage(copy.shortLinkCopied);
    } catch {
      setShareCopyMessage(copy.copyFailed);
    }
  };

  const editInputClass = 'w-full select-text rounded-control border border-slate-100 bg-white px-2.5 py-2 text-footnote text-slate-700 outline-none focus:ring-1 focus:ring-indigo-100';
  const newCustomerLabelClass = 'text-micro uppercase text-slate-400';
  const addSectionSummaryClass = 'flex cursor-pointer select-none list-none items-center justify-between border-b border-slate-100 pb-2 text-headline text-slate-900 [&::-webkit-details-marker]:hidden';

  const handleAddSectionToggle = (key: AddCustomerSectionKey) => (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const isOpen = event.currentTarget.open;
    setOpenAddSections((current) => (current[key] === isOpen ? current : { ...current, [key]: isOpen }));
  };

  const navigateToMissingCustomerField = (item: AddCustomerMissingItem) => {
    if (item.section !== 'purchase') {
      setOpenAddSections((current) => ({ ...current, [item.section]: true }));
    }

    window.setTimeout(() => {
      const target = document.getElementById(item.targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusTarget = target.matches('input, textarea, select, button')
        ? target
        : target.querySelector<HTMLElement>('input, textarea, select, button');
      focusTarget?.focus({ preventScroll: true });
    }, 0);
  };

  const requiredMark = <span className="text-rose-500"> *</span>;
  const isNewCustomerCashPurchase = newCustomerDraft.purchase_method === 'Cash';
  const isNewCustomerLoanPurchase = newCustomerDraft.purchase_method === 'Loan';
  const isNewCustomerUsedVehicle = newCustomerDraft.vehicle_condition === 'Used';
  const newCustomerDocumentKeys = getNewCustomerDocumentKeys(
    newCustomerDraft.purchase_method,
    newCustomerDraft.vehicle_condition
  );

  const newCustomerMissingItems = ([
    !newCustomerDraft.applicant_name.trim() ? { label: copy.customerName, section: 'personal', targetId: 'new-customer-name-field' } : null,
    !isBasicPhoneNumber(newCustomerDraft.phone_no) ? { label: copy.phoneNumber, section: 'personal', targetId: 'new-customer-phone-field' } : null,
    !isBasicIcNumber(newCustomerDraft.ic_no) ? { label: copy.icNumber, section: 'personal', targetId: 'new-customer-ic-field' } : null,
    !newCustomerDraft.vehicle_model.trim() ? { label: copy.vehicleModel, section: 'vehicle', targetId: 'new-customer-vehicle-model-field' } : null,
    !newCustomerDraft.vehicle_condition ? { label: copy.vehicleCondition, section: 'vehicle', targetId: 'new-customer-vehicle-condition-field' } : null,
    // Cash/Loan must be chosen before create so the application and document
    // completeness checks use the correct branch. Sales keeps either branch
    // until Notify Admin; Admin/Super Admin creations start in Admin review.
    !newCustomerDraft.purchase_method ? { label: copy.purchaseMethod, section: 'purchase', targetId: 'new-customer-purchase-method-field' } : null,
    isNewCustomerCashPurchase && !newCustomerDraft.personal_info.full_address.trim() ? { label: tr('永久地址（IC）', 'Permanent Address (IC)', 'Alamat Tetap (IC)'), section: 'personal', targetId: 'new-customer-address-field' } : null,
    isNewCustomerCashPurchase && !newCustomerDraft.personal_info.resident_address?.trim() ? { label: tr('居住地址', 'Resident Address', 'Alamat Kediaman'), section: 'personal', targetId: 'new-customer-resident-address-field' } : null,
    isNewCustomerCashPurchase && !newCustomerDraft.total_cash_price.trim() ? { label: tr('现金总价', 'Total Cash Price', 'Jumlah Harga Tunai'), section: 'vehicle', targetId: 'new-customer-total-cash-price-field' } : null,
  ] as Array<AddCustomerMissingItem | null>).filter((item): item is AddCustomerMissingItem => Boolean(item));
  const newCustomerMissingFields = newCustomerMissingItems.map((item) => item.label);
  const newCustomerPhoneValid = isBasicPhoneNumber(newCustomerDraft.phone_no);
  const newCustomerIcValid = isBasicIcNumber(newCustomerDraft.ic_no);
  const canShareCustomerIntakeLink = Boolean(
    shareUtmDraft.source.trim()
  );

  return (
    <div id="customers-page" className="space-y-6">
      <datalist id={vehicleModelListId}>
        {vehicleModelSuggestions.map((item) => (
          <option key={`${item.brand}-${item.model}`} value={item.model}>
            {item.brand} · {item.model}
          </option>
        ))}
      </datalist>
      <datalist id={payslipBankListId}>
        {payslipBankOptions.map((bankName) => <option key={bankName} value={bankName} />)}
      </datalist>
      {copyFeedback && (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-control border border-emerald-100 bg-white px-3 py-2 text-footnote font-bold text-slate-800 shadow-e3 shadow-slate-200/70"
          style={{
            left: copyFeedback.left,
            top: copyFeedback.top,
            transform: copyFeedback.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
          }}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-4 w-4" />
          </span>
          <span>{copyFeedback.message}</span>
        </div>
      )}

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-title-2 text-slate-900">{copy.pageTitle}</h2>
          <p className="max-w-2xl text-footnote font-normal leading-relaxed text-slate-500">
            {copy.pageDescription} {canEditCustomers ? copy.pageDescriptionAdmin : copy.pageDescriptionReadonly}
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {canShareCustomerLinks && (
            <button
              type="button"
              onClick={(event) => void copyShortCustomerIntakeLink(event.currentTarget)}
              className="inline-flex items-center justify-center gap-2 rounded-control bg-white px-4 py-2 text-footnote font-bold text-slate-700 ring-1 ring-slate-100 transition-colors hover:bg-slate-50"
            >
              <InlineAssetIcon icon={Share2} />
              {copy.shareLink}
            </button>
          )}
          {canAddCustomer && (
            <button
              type="button"
              onClick={() => setIsAddingCustomer((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep"
            >
              <Plus className="h-4 w-4 text-white/90" aria-hidden="true" />
              {copy.addCustomer}
            </button>
          )}
          {currentStaffRole === 'Super Admin' && showAllApplications && (
            <div className="w-full lg:w-56">
              <ToggleOptionGroup
                value={selectedStaffFilter}
                options={staffFilterOptions}
                onChange={setSelectedStaffFilter}
                ariaLabel={copy.filterByStaff}
                className="w-full"
                optionClassName="min-h-10"
              />
            </div>
          )}
          {currentStaffRole === 'Super Admin' && <div className="w-full rounded-card border border-slate-100 bg-white px-3 py-2 shadow-e1 lg:w-[330px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <InlineAssetIcon icon={UserRound} className="h-7 w-7 shrink-0" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-footnote font-bold text-slate-900">
                    {showAllApplications ? copy.allStaffData : copy.staffData(defaultHandlerName)}
                  </p>
                  <p className="mt-0.5 text-caption text-slate-400">
                    {showAllApplications ? copy.showAllEnabled : copy.assignedCustomers(applications.length)}
                  </p>
                </div>
              </div>

              <ToggleSwitch
                id="customer-show-all-toggle"
                checked={showAllApplications}
                onChange={() => onToggleShowAllApplications()}
                label={copy.showAll}
                description={showAllApplications ? copy.allStaff : copy.mineOnly}
                className="shrink-0 bg-slate-50 ring-1 ring-slate-100"
              />
            </div>
          </div>}
          {crossShopPool && (
            <div className="w-full rounded-card border border-slate-100 bg-white px-3 py-2 shadow-e1 lg:w-[330px]">
              <ToggleSwitch
                id="customer-cross-shop-pool-toggle"
                checked={crossShopPool.showAllShops}
                onChange={(checked) => crossShopPool.onChange(checked)}
                label={copy.otherShopsPool}
                description={crossShopPool.showAllShops ? copy.otherShopsPoolOn : copy.otherShopsPoolOff}
                className="w-full bg-slate-50 ring-1 ring-slate-100"
              />
            </div>
          )}
        </div>
      </section>

      {canShareCustomerLinks && isSharingCustomerLink && (
        <section className="rounded-card border border-blue-100 bg-white p-5 shadow-e1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-headline text-slate-900">{copy.shareCustomerIntakeLink}</h3>
              <p className="mt-1 text-footnote text-slate-400">
                {copy.shareCustomerHelp}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSharingCustomerLink(false)}
              className="rounded-control p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              aria-label="Close share link form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
            <label className="flex flex-col gap-1.5">
              <span className="text-micro uppercase text-slate-400">{copy.customerCameFrom}</span>
              <input
                list="customer-source-options"
                value={shareUtmDraft.source}
                onChange={(event) => updateShareUtmDraft('source', event.target.value)}
                placeholder="Facebook / TikTok / Instagram"
                className={editInputClass}
              />
              <datalist id="customer-source-options">
                <option value="Facebook" />
                <option value="TikTok" />
                <option value="Instagram" />
                <option value="Insta" />
                <option value="IG" />
                <option value="Google" />
                <option value="Walk-in" />
                <option value="Referral" />
              </datalist>
            </label>
            <div className="rounded-control border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-micro uppercase text-slate-400">{copy.autoTracking}</p>
              <p className="mt-1 text-footnote font-bold text-slate-700">{getCustomerIntakeMedium(shareUtmDraft.source)}</p>
              <p className="mt-0.5 truncate text-caption text-slate-400" title={defaultHandlerName}>
                {copy.staff}: {defaultHandlerName}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-control border border-slate-100 bg-slate-50 px-3 py-2">
            {/* Only the saved short link is shown: the raw form URL carries no
                link code, so a submission from it could not be traced. */}
            <p className="mb-1 text-micro uppercase text-slate-400">{copy.shortLink}</p>
            {lastShortCustomerIntakeLink ? (
              <p className="break-all font-mono text-caption font-semibold text-blue-600">{lastShortCustomerIntakeLink}</p>
            ) : (
              <p className="text-caption text-slate-400">{copy.shortLinkPlaceholder}</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-caption text-slate-400">
              {shareCopyMessage || `${copy.handler}: ${defaultHandlerName} / ${defaultHandlerRoleLabel}`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveShareUtmDefault}
                disabled={!canShareCustomerIntakeLink}
                className="rounded-control bg-slate-50 px-4 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-300"
              >
                {copy.saveDefaultSource}
              </button>
              <button
                type="button"
                onClick={(event) => void copyShortCustomerIntakeLink(event.currentTarget)}
                disabled={!canShareCustomerIntakeLink || isCreatingShortCustomerIntakeLink}
                className="inline-flex items-center gap-2 rounded-control bg-blue-600 px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Link2 className="h-4 w-4" />
                {copy.copyShortLink}
              </button>
            </div>
          </div>
        </section>
      )}

      {canAddCustomer && isAddingCustomer && (
        <section className="rounded-card border border-indigo-100 bg-white p-5 shadow-e1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-headline text-slate-900">{copy.addNewCustomer}</h3>
              <p className="mt-1 text-footnote text-slate-400">{copy.addNewCustomerHelp}</p>
            </div>
            <button
              type="button"
              onClick={resetNewCustomerDraft}
              className="rounded-control p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              aria-label="Close add customer form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <section className="mb-5 rounded-card border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-white text-blue-600 ring-1 ring-blue-100">
                <ClipboardPaste className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-headline text-slate-900">
                  {tr('粘贴客户资料自动填表', 'Paste Customer Details to Auto-fill', 'Tampal Butiran Pelanggan untuk Isi Automatik')}
                </h4>
                <p className="mt-1 text-footnote leading-relaxed text-slate-500">
                  {tr(
                    '粘贴 YAMI / WhatsApp 的完整资料，系统会依马来文标签和区段填入下方表单。',
                    'Paste the full YAMI or WhatsApp details. Malay labels and sections will be mapped into the form below.',
                    'Tampal butiran penuh YAMI atau WhatsApp. Label dan bahagian Bahasa Melayu akan dipadankan ke borang di bawah.'
                  )}
                </p>
                <textarea
                  value={customerPasteText}
                  onChange={(event) => {
                    setCustomerPasteText(event.target.value);
                    setCustomerPasteFeedback(null);
                  }}
                  onPaste={(event) => {
                    const pastedText = event.clipboardData.getData('text');
                    if (!pastedText.trim()) return;
                    event.preventDefault();
                    setCustomerPasteText(pastedText);
                    applyPastedCustomerDetails(pastedText);
                  }}
                  placeholder={tr(
                    '在这里粘贴从 NAMA PENUH 到 LOAN BERAPA TAHUN 的完整内容…',
                    'Paste the full details from NAMA PENUH through LOAN BERAPA TAHUN here…',
                    'Tampal butiran penuh daripada NAMA PENUH hingga LOAN BERAPA TAHUN di sini…'
                  )}
                  aria-label="Paste customer details for auto-fill"
                  className="mt-3 min-h-32 w-full resize-y rounded-control border border-blue-100 bg-white px-3 py-2.5 font-mono text-footnote leading-relaxed text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPastedCustomerDetails(customerPasteText)}
                    disabled={!customerPasteText.trim()}
                    className="inline-flex items-center gap-2 rounded-control bg-blue-600 px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    {tr('检测并填入表单', 'Detect & Fill Form', 'Kesan & Isi Borang')}
                  </button>
                  {customerPasteText && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerPasteText('');
                        setCustomerPasteFeedback(null);
                      }}
                      className="rounded-control px-3 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                    >
                      {tr('清除粘贴内容', 'Clear pasted text', 'Kosongkan teks')}
                    </button>
                  )}
                </div>
                {customerPasteFeedback && (
                  <p
                    role={customerPasteFeedback.tone === 'error' ? 'alert' : 'status'}
                    className={`mt-3 rounded-control px-3 py-2 text-footnote leading-relaxed ${
                      customerPasteFeedback.tone === 'error'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {customerPasteFeedback.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section id="new-customer-purchase-method-field" className="space-y-3">
            <h4 className="text-headline text-slate-900">
              {tr('购买方式', 'Purchase Method', 'Kaedah Pembelian')}{requiredMark}
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([
                {
                  value: 'Cash' as PurchaseMethod,
                  label: tr('现金购买', 'Cash Purchase', 'Pembelian Tunai'),
                  helper: tr(
                    '填写身份、地址、车辆与现金价格。',
                    'Enter identity, address, vehicle, and cash price details.',
                    'Masukkan identiti, alamat, kenderaan dan harga tunai.'
                  ),
                  Icon: Banknote
                },
                {
                  value: 'Loan' as PurchaseMethod,
                  label: tr('申请贷款', 'Apply for Loan', 'Mohon Pinjaman'),
                  helper: tr(
                    '填写完整的个人、工作、收入与联系人资料。',
                    'Enter the full personal, employment, income, and contact details.',
                    'Masukkan butiran peribadi, pekerjaan, pendapatan dan kenalan penuh.'
                  ),
                  Icon: Landmark
                }
              ]).map(({ value, label, helper, Icon }) => {
                const selected = newCustomerDraft.purchase_method === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={label}
                    aria-pressed={selected}
                    onClick={() => setNewCustomerDraft((current) => ({
                      ...current,
                      purchase_method: value
                    }))}
                    className={`flex items-start gap-3 rounded-card border p-4 text-left transition-colors ${
                      selected
                        ? 'border-brand-100 bg-brand-50 text-brand-ink ring-1 ring-brand-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-brand-ink' : 'text-slate-400'}`} />
                    <span>
                      <span className="block text-headline">{label}</span>
                      <span className="mt-1 block text-footnote font-medium leading-relaxed text-slate-500">{helper}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {newCustomerDraft.purchase_method && (
            <div className="mt-5">
          <div className="space-y-5">
            <details className="group space-y-3" open={openAddSections.personal} onToggle={handleAddSectionToggle('personal')}>
              <summary className={addSectionSummaryClass}>
                <span>{copy.personalInformation}{requiredMark}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.customerName}{requiredMark}</span>
                  <input
                    id="new-customer-name-field"
                    value={newCustomerDraft.applicant_name}
                    onChange={(event) => updateNewCustomerDraft('applicant_name', event.target.value)}
                    placeholder={copy.customerName}
                    className={editInputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.phoneNumber}{requiredMark}</span>
                  <input
                    id="new-customer-phone-field"
                    value={newCustomerDraft.phone_no}
                    onChange={(event) => updateNewCustomerDraft('phone_no', formatPhoneNumber(event.target.value))}
                    placeholder="+60 12-345 6789"
                    className={`${editInputClass} ${newCustomerDraft.phone_no && !newCustomerPhoneValid ? 'border-rose-200 bg-rose-50/40' : ''}`}
                    inputMode="tel"
                  />
                  {newCustomerDraft.phone_no && !newCustomerPhoneValid && (
                    <span className="text-caption text-rose-500">
                      {tr('电话号码格式不正确', 'Invalid phone number', 'Format nombor telefon tidak sah')}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.icNumber}{requiredMark}</span>
                  <input
                    id="new-customer-ic-field"
                    value={newCustomerDraft.ic_no}
                    onChange={(event) => updateNewCustomerDraft('ic_no', formatIcNumber(event.target.value))}
                    placeholder="950812-14-5311"
                    className={`${editInputClass} ${newCustomerDraft.ic_no && !newCustomerIcValid ? 'border-rose-200 bg-rose-50/40' : ''}`}
                    inputMode="numeric"
                  />
                  {newCustomerDraft.ic_no && !newCustomerIcValid && (
                    <span className="text-caption text-rose-500">
                      {tr('IC 的出生日期或格式不正确', 'Invalid IC birth date or format', 'Tarikh lahir atau format IC tidak sah')}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{fieldLabelWith('dateOfBirth', FROM_IC)}</span>
                  <input
                    value={deriveMalaysiaIcBirthDate(newCustomerDraft.ic_no)}
                    readOnly
                    placeholder={tr('输入完整 IC 后自动显示', 'Detected after a complete IC is entered', 'Dikesan selepas IC lengkap dimasukkan')}
                    className={`${editInputClass} bg-slate-50 text-slate-500`}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.email}</span>
                  <input
                    value={newCustomerDraft.personal_info.email}
                    onChange={(event) => updateNewCustomerPersonalInfo('email', event.target.value)}
                    placeholder="customer@email.com"
                    className={editInputClass}
                    type="email"
                  />
                </label>
                    {isNewCustomerLoanPurchase && (
                      <>
                        <label className="flex flex-col gap-1.5">
                          <span className={newCustomerLabelClass}>{copy.gender}</span>
                          <ToggleOptionGroup
                            value={newCustomerDraft.personal_info.gender || ''}
                            options={[
                              { value: '', label: copy.notSet },
                              ...GENDER_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                            ]}
                            onChange={(value) => updateNewCustomerPersonalInfo('gender', value)}
                            ariaLabel="New customer gender"
                            className="w-full"
                            optionClassName="!px-2.5 !py-2 !font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={newCustomerLabelClass}>{copy.race}</span>
                          <ToggleOptionGroup
                            value={newCustomerDraft.personal_info.race || ''}
                            options={[
                              { value: '', label: copy.notSet },
                              ...RACE_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                            ]}
                            onChange={(value) => updateNewCustomerPersonalInfo('race', value)}
                            ariaLabel="New customer race"
                            className="w-full"
                            optionClassName="!px-2.5 !py-2 !font-normal"
                          />
                        </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={newCustomerLabelClass}>{copy.maritalStatus}</span>
                      <ToggleOptionGroup
                        value={newCustomerDraft.personal_info.marital_status}
                        options={[
                          { value: '', label: copy.notSet },
                          ...MARITAL_STATUS_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                        ]}
                        onChange={(value) => updateNewCustomerPersonalInfo('marital_status', value)}
                        ariaLabel="New customer marital status"
                        className="w-full"
                        optionClassName="!px-2.5 !py-2 !font-normal"
                      />
                    </label>
                    {hasChildrenQuestion(newCustomerDraft.personal_info.marital_status) && (
                      <label className="flex flex-col gap-1.5">
                        <span className={newCustomerLabelClass}>{copy.numberOfChildren}</span>
                        <input
                          value={newCustomerDraft.personal_info.number_of_children || ''}
                          onChange={(event) => updateNewCustomerPersonalInfo('number_of_children', event.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder="0"
                          aria-label="New customer number of children"
                          className={editInputClass}
                          inputMode="numeric"
                        />
                      </label>
                    )}
                    <YearsMonthsDurationInput
                      label={copy.residenceStart}
                      year={newCustomerDraft.personal_info.residence_start_year || ''}
                      month={newCustomerDraft.personal_info.residence_start_month || ''}
                      fallbackYears={newCustomerDraft.personal_info.years_at_residence}
                      onChange={(field, value) => updateNewCustomerPersonalInfo(field === 'year' ? 'residence_start_year' : 'residence_start_month', value)}
                      labelClassName={newCustomerLabelClass}
                      ariaPrefix="New customer residence"
                    />
                        <label className="flex flex-col gap-1.5">
                          <span className={newCustomerLabelClass}>{copy.housingStatus}</span>
                          <ToggleOptionGroup
                            value={newCustomerDraft.personal_info.housing_status}
                            options={[
                              { value: '', label: copy.notSet },
                              ...HOUSING_STATUS_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                            ]}
                            onChange={(value) => updateNewCustomerPersonalInfo('housing_status', value)}
                            ariaLabel="New customer housing status"
                            className="w-full"
                            optionClassName="!px-2.5 !py-2 !font-normal"
                          />
                        </label>
                      </>
                    )}
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className={newCustomerLabelClass}>{tr('永久地址（IC）', 'Permanent Address (IC)', 'Alamat Tetap (IC)')}{isNewCustomerCashPurchase && requiredMark}</span>
                      <textarea
                        id="new-customer-address-field"
                        value={newCustomerDraft.personal_info.full_address}
                        onChange={(event) => updateNewCustomerPersonalInfo('full_address', event.target.value)}
                        placeholder={tr('填写 IC 上的地址', 'Enter the address shown on the IC', 'Masukkan alamat pada IC')}
                        className={`${editInputClass} min-h-20`}
                      />
                    </label>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="new-customer-resident-address-field" className={newCustomerLabelClass}>{tr('居住地址', 'Resident Address', 'Alamat Kediaman')}{isNewCustomerCashPurchase && requiredMark}</label>
                        <button
                          type="button"
                          onClick={() => updateNewCustomerPersonalInfo('resident_address', newCustomerDraft.personal_info.full_address)}
                          className="rounded-chip bg-slate-100 px-2 py-1 text-micro tracking-normal text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                        >
                          {tr('与永久地址（IC）相同', 'Same as Permanent Address (IC)', 'Sama seperti Alamat Tetap (IC)')}
                        </button>
                      </div>
                      <textarea
                        id="new-customer-resident-address-field"
                        value={newCustomerDraft.personal_info.resident_address || ''}
                        onChange={(event) => updateNewCustomerPersonalInfo('resident_address', event.target.value)}
                        placeholder={tr('填写现在居住的地址', 'Enter the current resident address', 'Masukkan alamat kediaman semasa')}
                        className={`${editInputClass} min-h-20`}
                      />
                    </div>
              </div>
            </details>

            <details className="group space-y-3" open={openAddSections.vehicle} onToggle={handleAddSectionToggle('vehicle')}>
              <summary className={addSectionSummaryClass}>
                <span>{copy.vehiclePurchase}{requiredMark}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="flex flex-col gap-1.5">
                    <span className={newCustomerLabelClass}>{copy.vehicleModel}{requiredMark}</span>
                    <input
                      id="new-customer-vehicle-model-field"
                      value={newCustomerDraft.vehicle_model}
                      list={vehicleModelListId}
                      autoComplete="off"
                      onChange={(event) => updateNewCustomerDraft('vehicle_model', event.target.value)}
                      placeholder={copy.vehicleModel}
                      className={editInputClass}
                    />
                  </label>
                  <div className="flex gap-1">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-micro uppercase text-slate-500">
                      {inferVehicleBrandFromModel(newCustomerDraft.vehicle_model, vehicleCatalog)}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-micro uppercase text-slate-500">
                      {inferVehicleTagFromModel(newCustomerDraft.vehicle_model, vehicleCatalog)}
                    </span>
                  </div>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.vehiclePlate}</span>
                  <input
                    value={newCustomerDraft.vehicle_plate}
                    onChange={(event) => updateNewCustomerDraft('vehicle_plate', event.target.value.toUpperCase())}
                    placeholder={copy.vehiclePlate}
                    className={editInputClass}
                  />
                </label>
                <label id="new-customer-vehicle-condition-field" className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.vehicleCondition}{requiredMark}</span>
                  <ToggleOptionGroup
                    value={newCustomerDraft.vehicle_condition}
                    options={VEHICLE_CONDITION_OPTIONS.map((value) => ({
                      value,
                      label: value || copy.notSet
                    }))}
                    onChange={(value) => updateNewCustomerDraft('vehicle_condition', value as VehicleCondition)}
                    ariaLabel="New customer vehicle condition"
                    className="w-full"
                    optionClassName="!px-2.5 !py-2 !font-normal"
                  />
                </label>
                {isNewCustomerCashPurchase && (
                  <label className="flex flex-col gap-1.5">
                    <span className={newCustomerLabelClass}>{tr('现金总价', 'Total Cash Price', 'Jumlah Harga Tunai')}{requiredMark}</span>
                    <input
                      id="new-customer-total-cash-price-field"
                      value={newCustomerDraft.total_cash_price}
                      onChange={(event) => setNewCustomerDraft((current) => ({
                        ...current,
                        total_cash_price: normalizeDecimalInput(event.target.value)
                      }))}
                      placeholder="RM 0.00"
                      className={editInputClass}
                      inputMode="decimal"
                      aria-label="New customer total cash price"
                    />
                  </label>
                )}
                {/* Loan Tenure sits with the vehicle (meeting 2026-10-13), like Application Detail. */}
                {isNewCustomerLoanPurchase && (
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span className={newCustomerLabelClass}>{copy.loanTenure}</span>
                    <ToggleOptionGroup
                      value={newCustomerDraft.preferences.loan_tenure}
                      options={[
                        { value: '', label: copy.notSet },
                        ...LOAN_TENURE_OPTIONS.map((year) => ({ value: year, label: `${year} years` }))
                      ]}
                      onChange={(value) => updateNewCustomerPreferences('loan_tenure', value)}
                      ariaLabel="New customer loan tenure"
                      className="w-full"
                      optionClassName="!px-2.5 !py-2 !font-normal"
                    />
                  </label>
                )}
                {isNewCustomerUsedVehicle && (
                  <label className="flex flex-col gap-1.5">
                    <span className={newCustomerLabelClass}>
                      {tr('摩托里程', 'Motor Mileage', 'Perbatuan Motosikal')}
                      <span className="ml-1 normal-case tracking-normal text-slate-300">
                        {tr('选填', 'Optional', 'Pilihan')}
                      </span>
                    </span>
                    <input
                      value={newCustomerDraft.motor_mileage}
                      onChange={(event) => setNewCustomerDraft((current) => ({
                        ...current,
                        motor_mileage: event.target.value.replace(/\D/g, '').slice(0, 9)
                      }))}
                      placeholder="0"
                      className={editInputClass}
                      inputMode="numeric"
                      aria-label="New customer motor mileage"
                    />
                  </label>
                )}
              </div>
            </details>

            <details className="group space-y-3" open={openAddSections.documents} onToggle={handleAddSectionToggle('documents')}>
              <summary className={addSectionSummaryClass}>
                <span>{copy.documents}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {newCustomerDocumentKeys.map((documentKey) => {
                  const label = documentKey === 'ic'
                    ? copy.icDocument
                    : documentKey === 'payslip'
                      ? copy.payslipDocument
                      : documentKey === 'vehicle_geran'
                        ? tr('车辆 Geran', 'Vehicle Geran', 'Geran Kenderaan')
                        : tr('补充文件', 'Supporting Doc', 'Dokumen Sokongan');
                  const documents = newCustomerDraft.payslip_documents.filter((document) => document.document_key === documentKey);
                  const uploadLimit = getCustomerDocumentUploadLimit(documentKey);
                  const limitReached = documents.length >= uploadLimit;

                  return (
                    <FileDropZone
                      key={documentKey}
                      testId={`new-customer-document-drop-${documentKey}`}
                      className="rounded-card border border-slate-100 bg-slate-50/60 p-4"
                      disabled={limitReached || isPreparingCustomerDocument}
                      onFiles={(files) => { void handleNewCustomerDocumentUpload(documentKey, files); }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-footnote font-bold text-slate-800">{label}</p>
                          <p className="mt-1 text-micro tracking-normal text-slate-400">{copy.documentUploadHelp} · {documents.length}/{uploadLimit}</p>
                        </div>
                        <label className={`inline-flex shrink-0 items-center gap-1.5 rounded-control bg-white px-3 py-2 text-micro tracking-normal ring-1 ring-indigo-100 transition-colors ${limitReached || isPreparingCustomerDocument ? 'cursor-not-allowed text-slate-400 opacity-50' : 'cursor-pointer text-indigo-600 hover:bg-indigo-50'}`}>
                          <Upload className="h-3.5 w-3.5" />
                          {limitReached ? tr('已达上限', 'Limit reached', 'Had dicapai') : copy.uploadDocument}
                          <input
                            type="file"
                            multiple
                            accept=".pdf,image/png,image/jpeg,image/webp"
                            aria-label={documentKey === 'ic'
                              ? 'Upload IC'
                              : documentKey === 'payslip'
                                ? 'Upload Payslip'
                                : documentKey === 'vehicle_geran'
                                  ? 'Upload Vehicle Geran'
                                  : 'Upload Supporting Doc'}
                            disabled={limitReached || isPreparingCustomerDocument}
                            onChange={(event) => {
                              void handleNewCustomerDocumentUpload(documentKey, Array.from(event.currentTarget.files || []));
                              event.currentTarget.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="mt-3 space-y-2">
                        {documents.length === 0 ? (
                          <p className="rounded-control bg-white px-3 py-2 text-caption text-slate-400">
                            {tr('尚未上传', 'No file uploaded', 'Tiada fail dimuat naik')}
                          </p>
                        ) : documents.map((document) => (
                          <div key={document.id} className="flex items-center justify-between gap-3 rounded-control bg-white px-3 py-2 ring-1 ring-slate-100">
                            <div className="min-w-0">
                              <p className="truncate text-caption font-semibold text-slate-700" title={document.file_name}>{document.file_name}</p>
                              <p className="mt-0.5 text-micro tracking-normal text-slate-400">{formatDocumentFileSize(document.file_size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewCustomerDocument(document.id)}
                              className="shrink-0 rounded-chip p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Remove ${document.file_name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </FileDropZone>
                  );
                  })}
              </div>
              {customerDocumentError && (
                <p className="text-caption text-rose-500">{customerDocumentError}</p>
              )}
            </details>

            {isNewCustomerLoanPurchase && (
              <>
            <details className="group space-y-3" open={openAddSections.employment} onToggle={handleAddSectionToggle('employment')}>
              <summary className={addSectionSummaryClass}>
                <span>{copy.employmentDetails}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {[
                  { label: copy.companyName, field: 'company_name' as const, value: newCustomerDraft.employment_details.company_name },
                  { label: copy.position, field: 'position' as const, value: newCustomerDraft.employment_details.position },
                  { label: copy.grossMonthlySalary, field: 'gross_monthly_salary' as const, value: newCustomerDraft.employment_details.gross_monthly_salary || '', decimal: true },
                  { label: copy.netMonthlySalary, field: 'net_monthly_salary' as const, value: newCustomerDraft.employment_details.net_monthly_salary || '', decimal: true },
                  { label: copy.officePhone, field: 'office_phone_no' as const, value: newCustomerDraft.employment_details.office_phone_no }
                ].map((item) => (
                  <label key={item.field} className="flex flex-col gap-1.5">
                    <span className={newCustomerLabelClass}>{item.label}</span>
                    <input
                      value={item.value}
                      onChange={(event) => updateNewCustomerEmploymentDetails(
                        item.field,
                        item.decimal ? normalizeDecimalInput(event.target.value) : event.target.value
                      )}
                      placeholder={item.label}
                      className={editInputClass}
                      inputMode={item.decimal ? 'decimal' : undefined}
                    />
                  </label>
                ))}
                <StartYearMonthInput
                  label={copy.employmentStart}
                  year={newCustomerDraft.employment_details.employment_start_year || ''}
                  month={newCustomerDraft.employment_details.employment_start_month || ''}
                  fallbackYears={newCustomerDraft.employment_details.years_employed}
                  onChange={(field, value) => updateNewCustomerEmploymentDetails(field === 'year' ? 'employment_start_year' : 'employment_start_month', value)}
                  labelClassName={newCustomerLabelClass}
                  ariaPrefix="New customer employment start"
                />
                <label className="flex flex-col gap-1.5 md:col-span-3">
                  <span className={newCustomerLabelClass}>{copy.companyAddress}</span>
                  <textarea
                    value={newCustomerDraft.employment_details.company_address}
                    onChange={(event) => updateNewCustomerEmploymentDetails('company_address', event.target.value)}
                    placeholder={copy.companyAddress}
                    className={`${editInputClass} min-h-20`}
                  />
                </label>
              </div>
            </details>

            <details className="group space-y-3" open={openAddSections.contacts} onToggle={handleAddSectionToggle('contacts')}>
              <summary className={addSectionSummaryClass}>
                <span>{copy.emergencyContacts}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {newCustomerDraft.emergency_contacts.map((contact, index) => (
                  <div key={`new-emergency-contact-${index}`} className="space-y-3 rounded-control border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-micro uppercase text-slate-400">{copy.emergencyContact(index + 1)}</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <label className="flex flex-col gap-1.5">
                        <span className={newCustomerLabelClass}>{tr('姓名', 'Full name', 'Nama penuh')}</span>
                        <input value={contact.full_name} onChange={(event) => updateNewCustomerEmergencyContact(index, 'full_name', event.target.value)} placeholder={tr('姓名', 'Full name', 'Nama penuh')} className={editInputClass} />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={newCustomerLabelClass}>{copy.relationship}</span>
                        <input value={contact.relationship} onChange={(event) => updateNewCustomerEmergencyContact(index, 'relationship', event.target.value)} placeholder={copy.relationship} className={editInputClass} />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={newCustomerLabelClass}>{copy.phoneNumber}</span>
                        <input value={contact.phone_no} onChange={(event) => updateNewCustomerEmergencyContact(index, 'phone_no', event.target.value)} placeholder={copy.phoneNumber} className={editInputClass} />
                      </label>
                    </div>
                    <label className="flex flex-col gap-1.5">
                      <span className={newCustomerLabelClass}>{copy.fullAddress}</span>
                      <textarea value={contact.full_address} onChange={(event) => updateNewCustomerEmergencyContact(index, 'full_address', event.target.value)} placeholder={copy.fullAddress} className={`${editInputClass} min-h-16`} />
                    </label>
                  </div>
                ))}
              </div>
            </details>

            <details className="group space-y-3" open={openAddSections.preferences} onToggle={handleAddSectionToggle('preferences')}>
              <summary className={addSectionSummaryClass}>
                <span>{copy.statusPreferences}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.availableCalls}</span>
                  <input value={newCustomerDraft.preferences.available_to_receive_calls} onChange={(event) => updateNewCustomerPreferences('available_to_receive_calls', event.target.value)} placeholder="Anytime / office hour" className={editInputClass} />
                </label>
                <div className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.salaryMethod}</span>
                  <ToggleOptionGroup
                    value={newCustomerDraft.preferences.salary_payment_method}
                    options={[
                      { value: '', label: copy.notSet },
                      { value: 'Bank', label: tr('银行', 'Bank', 'Bank') },
                      { value: 'Cash', label: tr('现金', 'Cash', 'Tunai') }
                    ]}
                    onChange={(value) => setNewCustomerDraft((current) => ({
                      ...current,
                      preferences: { ...current.preferences, salary_payment_method: value }
                    }))}
                    ariaLabel="New customer salary paid by"
                    className="w-full"
                    optionClassName="!px-2.5 !py-2 !font-normal"
                  />
                </div>
                {/* Every loan needs a bank account, cash salary too (owner 2026-10-20). */}
                  <>
                    <label className="flex flex-col gap-1.5">
                      <span className={newCustomerLabelClass}>{copy.bankName}</span>
                      <input
                        value={newCustomerDraft.personal_info.bank_name}
                        list={payslipBankListId}
                        autoComplete="off"
                        onChange={(event) => updateNewCustomerPersonalInfo('bank_name', event.target.value)}
                        placeholder={tr('选择或输入银行', 'Select or type the bank', 'Pilih atau taip bank')}
                        className={editInputClass}
                      />
                      <span className="text-micro tracking-normal font-medium text-slate-400">
                        {tr(
                          '工资收现金也要填。下拉选项包括之前输入的银行。',
                          'Needed even for cash salary. Suggestions include banks entered for previous customers.',
                          'Wajib walaupun gaji tunai. Cadangan termasuk bank yang dimasukkan untuk pelanggan terdahulu.'
                        )}
                      </span>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={newCustomerLabelClass}>{copy.accountNumber}</span>
                      <input
                        value={newCustomerDraft.personal_info.account_number}
                        onChange={(event) => updateNewCustomerPersonalInfo('account_number', event.target.value.replace(/\D/g, ''))}
                        placeholder={copy.accountNumber}
                        className={editInputClass}
                        inputMode="numeric"
                      />
                    </label>
                  </>
              </div>
            </details>
              </>
            )}
          </div>

          {newCustomerDraft.purchase_method && (
            <label className="mt-4 flex flex-col gap-1.5">
              <span className={newCustomerLabelClass}>{tr('备注', 'Remark', 'Catatan')}</span>
              <textarea
                value={newCustomerDraft.remarks}
                onChange={(event) => setNewCustomerDraft((current) => ({ ...current, remarks: event.target.value.slice(0, 1000) }))}
                maxLength={1000}
                placeholder={tr('例如:工资单 PDF 密码 123456', 'For example: payslip PDF password 123456', 'Contoh: kata laluan PDF slip gaji 123456')}
                aria-label="New customer remark"
                className={`${editInputClass} min-h-20`}
              />
            </label>
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            {newCustomerMissingItems.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-1.5 text-caption text-rose-500">
                <span>{tr('缺少必填项：', 'Missing required:', 'Maklumat wajib belum diisi:')}</span>
                {newCustomerMissingItems.map((item) => (
                  <button
                    key={item.targetId}
                    type="button"
                    onClick={() => navigateToMissingCustomerField(item)}
                    aria-label={`Go to missing field ${item.label}`}
                    className="rounded-chip bg-rose-50 px-2 py-1 font-bold text-rose-600 ring-1 ring-rose-100 transition-colors hover:bg-rose-100 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={resetNewCustomerDraft}
              className="rounded-control bg-slate-50 px-4 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-100"
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={handleAddCustomer}
              disabled={isPreparingCustomerDocument || newCustomerMissingFields.length > 0}
              className="rounded-control bg-indigo-600 px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {copy.createCustomer}
            </button>
          </div>
            </div>
          )}
        </section>
      )}

      <MetricCards
        applications={timeFilteredApplications}
        language={language}
        selectedStatus={selectedStatusTab}
        periodTotals={{ submitted: periodSubmittedApplications.length, sold: periodSoldApplications.length }}
        periodLabel={selectedPeriod.label}
        periodRange={selectedPeriod.range}
        onSelectStatus={setSelectedStatusTab}
      />

      <section className="rounded-card border border-slate-100 bg-white shadow-e1">
        <div className="flex flex-col gap-4 border-b border-slate-100/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            role="search"
            aria-label={tr('搜索贷款申请', 'Search loan applications', 'Cari permohonan pinjaman')}
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSearch(searchDraft);
            }}
          >
            <label className="relative">
              <span className="sr-only">{copy.searchPlaceholder}</span>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <InlineAssetIcon icon={Search} className="h-5 w-5" />
              </span>
              <input
                id="customer-search-input"
                type="search"
                value={searchDraft}
                onChange={(event) => updateSearchDraft(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-80 rounded-control border border-slate-100 bg-white py-2 pl-9 pr-4 text-footnote outline-none transition-all focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-control bg-brand px-4 text-footnote font-bold text-white transition-colors hover:bg-brand-deep"
            >
              <Search className="h-4 w-4 text-white/90" aria-hidden="true" />
              {tr('搜索', 'Search', 'Cari')}
            </button>
            {appliedSearch.trim() && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex h-9 items-center gap-1 rounded-control px-2.5 text-caption font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {tr('清除', 'Clear', 'Kosongkan')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdvancedSearchOpen((current) => !current)}
              aria-expanded={isAdvancedSearchOpen}
              aria-controls="customer-advanced-search"
              className={`inline-flex h-9 items-center gap-1.5 rounded-control border px-3 text-footnote font-bold transition-colors ${
                isAdvancedSearchOpen
                  ? 'border-slate-200 bg-slate-100 text-slate-800'
                  : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {tr('高级搜索', 'Advanced search', 'Carian lanjutan')}
              <span className="rounded-full bg-white px-1.5 py-0.5 text-micro font-semibold text-slate-500 ring-1 ring-slate-100">
                {selectedTimeFilterLabel}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isAdvancedSearchOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </form>

          <div className="flex items-center gap-3">
            {(completedJourneyCount > 0 || showCompletedJourneys) && (
              <button
                type="button"
                onClick={() => setShowCompletedJourneys((current) => !current)}
                aria-pressed={showCompletedJourneys}
                className={`inline-flex h-8 items-center gap-1.5 rounded-control border px-3 text-caption font-semibold transition-colors ${
                  showCompletedJourneys
                    ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {showCompletedJourneys
                  ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                {showCompletedJourneys
                  ? tr('隐藏已完成', 'Hide completed', 'Sembunyikan selesai')
                  : tr('显示已完成', 'Show completed', 'Tunjukkan selesai')}
                <span className="rounded-full bg-white px-1.5 py-0.5 text-micro tracking-normal text-slate-500 ring-1 ring-slate-100">
                  {completedJourneyCount}
                </span>
              </button>
            )}
            <div className="text-caption font-medium text-slate-400">
              {tableCopyMessage || tableResultText}
            </div>
          </div>
        </div>

        {isAdvancedSearchOpen && (
          <div id="customer-advanced-search" className="flex flex-col gap-3 border-b border-slate-100/60 bg-slate-50/40 px-5 py-4 md:flex-row md:items-start">
                <div className="flex min-w-0 flex-col gap-2 self-start md:self-auto">
                  <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-control border border-slate-100 bg-slate-50/70 p-1 scrollbar-none">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip bg-white text-slate-400 ring-1 ring-slate-100">
                      <InlineAssetIcon icon={CalendarDays} className="h-4 w-4" />
                    </span>
                    {customerTimeFilterOptions.map((option) => {
                      const isActive = selectedTimeFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedTimeFilter(option.value)}
                          className={`h-7 shrink-0 rounded-chip px-2.5 text-footnote font-bold transition-colors ${
                            isActive
                              ? 'bg-brand text-white shadow-e1'
                              : 'text-slate-500 hover:bg-white hover:text-slate-800'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTimeFilter === 'custom' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 rounded-control border border-slate-100 bg-white px-2.5 py-1.5">
                        <span className="text-micro uppercase text-slate-400">{copy.startDate}</span>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(event) => {
                            setCustomStartDate(event.target.value);
                            setSelectedTimeFilter('custom');
                          }}
                          className="bg-transparent text-footnote text-slate-700 outline-none"
                        />
                      </label>
                      <label className="flex items-center gap-2 rounded-control border border-slate-100 bg-white px-2.5 py-1.5">
                        <span className="text-micro uppercase text-slate-400">{copy.endDate}</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(event) => {
                            setCustomEndDate(event.target.value);
                            setSelectedTimeFilter('custom');
                          }}
                          className="bg-transparent text-footnote text-slate-700 outline-none"
                        />
                      </label>
                    </div>
                  )}
                </div>
          </div>
        )}

      </section>

      {bankDecisionMenu && createPortal(
        <>
          <div className="fixed inset-0 z-[70]" aria-hidden="true" onClick={() => setBankDecisionMenu(null)} />
          <div
            role="menu"
            aria-label={`Bank decision for ${bankDecisionMenu.application.applicant_name} at ${bankDecisionMenu.bankLabel}`}
            data-testid={`loan-applications-bank-decisions-${bankDecisionMenu.application.id}`}
            className="fixed z-[71] flex w-60 flex-col gap-1.5 rounded-card bg-white p-2 shadow-e3 ring-1 ring-slate-200"
            style={{ top: bankDecisionMenu.top, left: bankDecisionMenu.left }}
          >
            <p className="px-1 text-micro font-bold uppercase tracking-wide text-slate-500">
              {bankDecisionMenu.bankLabel} · {bankDecisionMenu.application.applicant_name}
            </p>
            {BANK_QUICK_ACTION_BUTTONS.map((button) => (
              <button
                key={button.action}
                type="button"
                role="menuitem"
                onClick={() => {
                  const menu = bankDecisionMenu;
                  setBankDecisionMenu(null);
                  onOpenBankPage?.(menu.application, { bankApplicationId: menu.bankApplicationId, action: button.action });
                }}
                className={`inline-flex h-8 items-center gap-1.5 rounded-control px-2.5 text-caption font-semibold text-white transition-colors ${button.className}`}
              >
                <button.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tr(...button.label)}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}

      {banksMissingFromDatabase.length > 0 && (
        <div
          data-testid="loan-applications-missing-banks"
          role="note"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-amber-200 bg-amber-50 px-4 py-2.5 text-footnote text-amber-800"
        >
          <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1">
            {tr(
              `${banksMissingFromDatabase.join('、')} 还不在银行数据库里。请加进银行数据库，才能设置图标、选择是否在表格显示。`,
              `${banksMissingFromDatabase.join(', ')} ${banksMissingFromDatabase.length === 1 ? 'is' : 'are'} not in Bank Database yet. Add ${banksMissingFromDatabase.length === 1 ? 'it' : 'them'} there to set the icon and choose whether the column shows.`,
              `${banksMissingFromDatabase.join(', ')} belum ada dalam Pangkalan Data Bank. Tambahkan di sana untuk menetapkan ikon dan memilih sama ada lajur ditunjukkan.`
            )}
          </span>
          {onOpenBankDatabase && (
            <button
              type="button"
              onClick={onOpenBankDatabase}
              className="shrink-0 rounded-control bg-white px-3 py-1.5 text-footnote font-semibold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
            >
              {tr('打开银行数据库', 'Open Bank Database', 'Buka Pangkalan Data Bank')}
            </button>
          )}
        </div>
      )}

      <div
        data-testid="loan-applications-click-guide"
        className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-caption text-slate-500"
      >
        <MousePointerClick aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
        <span>
          <strong className="font-semibold text-slate-700">{tr('单击客户资料', 'Click customer details', 'Klik butiran pelanggan')}</strong>
          {tr('（日期到车型）→ 申请详情', ' (date to model) → Application Detail', ' (tarikh hingga model) → Butiran Permohonan')}
        </span>
        {loanTableBankColumns.length > 0 && onOpenBankPage && (
          <span>
            <strong className="font-semibold text-slate-700">{tr('单击银行格', 'Click a bank cell', 'Klik sel bank')}</strong>
            {tr(' → 银行页面', ' → bank page', ' → halaman bank')}
          </span>
        )}
        {loanTableBankColumns.length > 0 && onOpenBankPage && hasAdminWorkAccess(currentStaffRole) && (
          <>
            <span>
              <strong className="font-semibold text-slate-700">{tr('双击 IN PROCESS 银行格', 'Double-click an IN PROCESS bank cell', 'Klik dua kali sel bank IN PROCESS')}</strong>
              {tr(' → 更新银行结果', ' → record the bank decision', ' → rekod keputusan bank')}
            </span>
            {onSubmitToBank && (
              <span>
                <strong className="font-semibold text-slate-700">{tr('鼠标移到空白银行格', 'Point at an empty bank cell', 'Tuding sel bank kosong')}</strong>
                {tr(' → 提交银行', ' → SUBMIT to that bank', ' → HANTAR ke bank itu')}
              </span>
            )}
          </>
        )}
      </div>

      <section className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-e1">
        <div
          ref={tableScrollRef}
          data-testid="loan-applications-table-viewport"
          className="overflow-auto"
          style={{ maxHeight: CUSTOMER_TABLE_HEIGHT }}
          onScroll={handleTableScroll}
        >
          <table
            data-testid="loan-applications-table"
            className="workbook-grid w-full min-w-max border-separate border-spacing-0 text-left text-footnote"
          >
            <thead className="sticky top-0 z-10 bg-slate-50 text-micro text-slate-500">
              <tr className="h-11">
                <th data-testid="loan-applications-submitted-header" className={`${loanTableHeaderCellClass} w-[92px] !whitespace-normal leading-tight`}>
                  <SortableHeader
                    sortKey="submitted_at"
                    label={tr('申请日期', 'Application Date', 'Tarikh Permohonan')}
                    sortState={sortState}
                    onSort={handleSort}
                    defaultDirection="desc"
                  />
                </th>
                <th className={`${loanTableHeaderCellClass} w-[92px] !whitespace-normal leading-tight`}>
                  {tr('提交日期', 'Submission Date', 'Tarikh Hantar')}
                </th>
                <th className={loanTableHeaderCellClass}>
                  <SortableHeader
                    sortKey="applicant_name"
                    label={fieldLabel('customerName')}
                    sortState={sortState}
                    onSort={handleSort}
                  />
                </th>
                <th className={loanTableHeaderCellClass}>
                  <SortableHeader
                    sortKey="ic_no"
                    label={fieldLabel('icNumber')}
                    sortState={sortState}
                    onSort={handleSort}
                  />
                </th>
                <th className={loanTableHeaderCellClass}>
                  <SortableHeader
                    sortKey="vehicle_model"
                    label={fieldLabel('vehicleModel')}
                    sortState={sortState}
                    onSort={handleSort}
                  />
                </th>
                {loanTableBankColumns.map((column) => (
                  <th
                    key={column.key}
                    data-in-bank-database={column.inBankDatabase ? 'true' : 'false'}
                    title={column.inBankDatabase ? undefined : tr('不在银行数据库里', 'Not in Bank Database', 'Tiada dalam Pangkalan Data Bank')}
                    className={`${loanTableHeaderCellClass} min-w-[116px]`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <BankIcon
                        bankName={column.label}
                        bankDefinitions={bankDefinitions}
                        size="xs"
                        className="!h-5 !w-5"
                      />
                      {column.label}
                      {!column.inBankDatabase && (
                        <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {virtualWindow.topSpacerHeight > 0 && (
                <tr aria-hidden="true">
                  <td colSpan={loanTableColumnCount} className="p-0" style={{ height: virtualWindow.topSpacerHeight }} />
                </tr>
              )}

              {visibleCustomers.map((customer) => {
                const journey = getApplicationJourneyPosition(customer);
                const submissionAt = getFirstBankSubmissionAt(customer);

                return (
                  <tr
                    key={customer.id}
                    id={`customer-row-${customer.id}`}
                    data-testid={`loan-applications-row-${customer.id}`}
                    data-journey-stage={journey.stage}
                    data-journey-complete={journey.closed ? 'true' : 'false'}
                    data-pending-with={getLoanPendingWith(customer)}
                    tabIndex={0}
                    aria-label={tr(`查看 ${customer.applicant_name} 的申请`, `Open application for ${customer.applicant_name}`, `Buka permohonan ${customer.applicant_name}`)}
                    onClick={() => onSelectCustomer(customer)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectCustomer(customer);
                      }
                    }}
                    className="h-14 cursor-pointer focus-visible:outline-none"
                  >
                    <td className={`${loanTableBodyCellClass} font-mono tabular-nums text-slate-700`} title={customer.submitted_at}>
                      {formatTableDate(customer.submitted_at) || '—'}
                    </td>
                    <td className={`${loanTableBodyCellClass} font-mono tabular-nums text-slate-500`} title={submissionAt || undefined}>
                      {formatTableDate(submissionAt) || <span className="text-slate-300">—</span>}
                    </td>
                    <td className={loanTableBodyCellClass}>
                      <div className="min-w-0">
                        <p className="flex min-w-0 items-center gap-1.5">
                          <span className="max-w-[250px] truncate font-semibold text-slate-800" title={customer.applicant_name}>
                            {customer.applicant_name}
                          </span>
                          {isSeoApplication(customer) && (
                            <span className="shrink-0 rounded-chip bg-amber-50 px-1 py-0.5 text-micro uppercase text-amber-700">
                              SEO
                            </span>
                          )}
                        </p>
                        {customer.vehicle_plate && (
                          <p className="mt-0.5 font-mono text-micro tracking-normal text-slate-400">{customer.vehicle_plate}</p>
                        )}
                      </div>
                    </td>
                    <td className={`${loanTableBodyCellClass} font-mono tabular-nums text-slate-600`}>
                      {customer.ic_no}
                    </td>
                    <td className={loanTableBodyCellClass}>
                      <span className="flex items-center gap-1.5">
                        <span className="max-w-[140px] truncate font-medium text-slate-700" title={customer.vehicle_model}>
                          {customer.vehicle_model}
                        </span>
                        {customer.purchase_method === 'Cash' && (
                          <span className="shrink-0 rounded-chip bg-amber-50 px-1.5 py-0.5 text-micro uppercase text-amber-700">
                            {tr('现金', 'Cash', 'Tunai')}
                          </span>
                        )}
                      </span>
                    </td>
                    {loanTableBankColumns.map((column) => {
                      const bankApplication = getLatestBankApplicationForColumn(customer, column);
                      const reasons = bankApplication?.status === 'Rejected'
                        ? getRejectCodePlainTexts(bankApplication.reject_code, errorCodeIssueMap, language)
                        : [];
                      const reasonText = bankApplication?.status === 'Rejected'
                        ? reasons.map((reason) => reason.text || reason.code).join(' · ') || bankApplication.reject_reason
                        : bankApplication?.status === 'Need More Info'
                          ? bankApplication.status_reason || bankApplication.reason_category
                          : '';
                      const tooltip = bankApplication
                        ? [
                            `${bankApplication.bank_name} · ${LOAN_TABLE_BANK_STATUS_LABEL[bankApplication.status]}`,
                            ...reasons.map((reason) => `${reason.code}${reason.text ? ` — ${reason.text}` : ''}`),
                            reasons.length === 0 ? reasonText : ''
                          ].filter(Boolean).join('\n')
                        : undefined;

                      const opensBankPage = Boolean(onOpenBankPage)
                        && customer.purchase_method === 'Loan'
                        && getLoanPendingAction(customer) !== 'Complete Application';
                      const takesBankDecision = opensBankPage
                        && hasAdminWorkAccess(currentStaffRole)
                        && Boolean(bankApplication && BANK_QUICK_ACTION_STATUSES.includes(bankApplication.status));

                      return (
                        <td
                          key={column.key}
                          data-testid={`loan-applications-bank-${customer.id}-${column.key}`}
                          data-opens-bank-page={opensBankPage || undefined}
                          className={`group/cell ${loanTableBodyCellClass} ${opensBankPage ? 'cursor-pointer hover:bg-indigo-50/60' : ''}`}
                          title={tooltip}
                          onClick={opensBankPage ? (event) => {
                            event.stopPropagation();
                            window.clearTimeout(bankCellClickTimerRef.current);
                            const target = { bankName: column.label, bankApplicationId: bankApplication?.id };
                            if (!takesBankDecision) {
                              onOpenBankPage?.(customer, target);
                              return;
                            }
                            // Wait for a possible second click: a double-click opens the decisions instead.
                            bankCellClickTimerRef.current = window.setTimeout(() => onOpenBankPage?.(customer, target), 250);
                          } : undefined}
                          onMouseDown={takesBankDecision ? (event) => {
                            // A double-click opens the decisions; it should not select the status text.
                            if (event.detail > 1) event.preventDefault();
                          } : undefined}
                          onDoubleClick={takesBankDecision && bankApplication ? (event) => {
                            event.stopPropagation();
                            window.clearTimeout(bankCellClickTimerRef.current);
                            const rect = event.currentTarget.getBoundingClientRect();
                            // Open upwards when the cell is too close to the bottom of the window.
                            const menuHeight = 236;
                            setBankDecisionMenu({
                              application: customer,
                              bankApplicationId: bankApplication.id,
                              bankLabel: column.label,
                              top: rect.bottom + 4 + menuHeight > window.innerHeight
                                ? Math.max(8, rect.top - menuHeight - 4)
                                : rect.bottom + 4,
                              left: Math.max(8, Math.min(rect.left, window.innerWidth - 248))
                            });
                          } : undefined}
                        >
                          {bankApplication ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-micro font-bold tracking-wide ${LOAN_TABLE_BANK_STATUS_CLASS[bankApplication.status]}`}>
                                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                                {LOAN_TABLE_BANK_STATUS_LABEL[bankApplication.status]}
                              </span>
                              {reasonText && (
                                <span
                                  data-testid={`loan-applications-bank-reason-${customer.id}-${column.key}`}
                                  className="max-w-[140px] truncate text-micro tracking-normal text-slate-500"
                                >
                                  {reasonText}
                                </span>
                              )}
                            </div>
                          ) : column.inBankDatabase && onSubmitToBank && canSubmitToBankFromTable(customer, currentStaffRole) ? (() => {
                            const missingDocuments = getMissingDocumentLabels(customer);
                            const isSubmittingCell = submittingBankCell === `${customer.id}:${column.key}`;
                            return (
                              <button
                                type="button"
                                data-testid={`loan-applications-submit-bank-${customer.id}-${column.key}`}
                                disabled={Boolean(submittingBankCell)}
                                title={missingDocuments.length > 0
                                  ? tr(`还缺文件：${missingDocuments.join('、')}`, `Documents still missing: ${missingDocuments.join(', ')}`, `Dokumen masih kurang: ${missingDocuments.join(', ')}`)
                                  : tr(`提交到 ${column.label}`, `Submit to ${column.label}`, `Hantar ke ${column.label}`)}
                                aria-label={`Submit ${customer.applicant_name} to ${column.label}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleSubmitToBankCell(customer, column);
                                }}
                                onKeyDown={(event) => event.stopPropagation()}
                                className={`mx-auto inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-micro font-bold tracking-wide ring-1 transition-opacity ${
                                  isSubmittingCell ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover/cell:opacity-100'
                                } ${
                                  missingDocuments.length > 0
                                    ? 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100'
                                    : 'bg-white text-indigo-700 ring-indigo-200 hover:bg-indigo-50'
                                }`}
                              >
                                {missingDocuments.length > 0
                                  ? <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
                                  : <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />}
                                {isSubmittingCell
                                  ? tr('提交中…', 'Submitting…', 'Menghantar…')
                                  : missingDocuments.length > 0
                                    ? tr('缺文件', 'DOCS MISSING', 'DOKUMEN KURANG')
                                    : tr('提交', 'SUBMIT', 'HANTAR')}
                              </button>
                            );
                          })() : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {virtualWindow.bottomSpacerHeight > 0 && (
                <tr aria-hidden="true">
                  <td colSpan={loanTableColumnCount} className="p-0" style={{ height: virtualWindow.bottomSpacerHeight }} />
                </tr>
              )}

              {hasMoreCustomersToLoad && (
                <tr aria-hidden="true">
                  <td colSpan={loanTableColumnCount} className="bg-white px-6 py-3 text-center text-caption font-semibold text-slate-400">
                    {tr(`继续往下滚动加载更多 · ${loadedCustomers.length}/${customers.length}`, `Scroll down to load more · ${loadedCustomers.length}/${customers.length}`, `Tatal ke bawah untuk memuatkan lagi · ${loadedCustomers.length}/${customers.length}`)}
                  </td>
                </tr>
              )}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={loanTableColumnCount} className="py-14 text-center text-body text-slate-400">
                    {copy.noCustomers}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default React.memo(CustomerList);
