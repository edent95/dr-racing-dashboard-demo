/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Banknote, Car, Check, ChevronDown, ClipboardPaste, Database, Eye, EyeOff, Landmark, Link2, Plus, Trash2, Upload, X } from 'lucide-react';
import { BankApplication, BankApplicationStatus, BankDefinition, CustomerDocumentKey, CustomerEmploymentDetails, CustomerPersonalInfo, CustomerPreferences, CustomerRawMatch, CustomerRiskFlag, EmergencyContact, ErrorCodeDefinition, getLoanPendingAction, getLoanPendingWith, inferVehicleBrandFromModel, inferVehicleTagFromModel, LoanApplication, LoanPendingAction, LoanStatus, PayslipDocument, PurchaseMethod, RoleAccount, VehicleCatalogItem, VehicleCondition } from '../types';
import BankIcon from './BankIcon';
import DoubleClickEditField from './DoubleClickEditField';
import MetricCards from './MetricCards';
import { LoanApplicationCard } from './MobileAppShell';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import StaffNameBadge from './StaffNameBadge';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';
import ToggleSwitch from './ToggleSwitch';
import { useDebouncedValue } from '../utils/tableUx';
import { formatMalaysiaPhoneForCopy, formatMalaysiaPhoneNumber as formatPhoneNumber, isBasicMalaysiaPhoneNumber as isBasicPhoneNumber } from '../utils/malaysiaPhone';
import { getCustomerDocumentUploadLimit, getMissingDocumentLabels } from '../utils/documentChecklist';
import { getApplicationRejectCodes } from '../utils/rejectCodes';
import { deriveMalaysiaIcBirthDate } from '../utils/malaysiaIc';
import { parseCustomerPasteText } from '../utils/customerPasteParser';
import { matchesLoanApplicationFilter } from '../utils/loanFollowUpFilters';
import {
  createEmptyCustomerEmploymentDetails as createEmptyEmploymentDetails,
  createEmptyCustomerPersonalInfo as createEmptyPersonalInfo,
  createEmptyCustomerPreferences as createEmptyPreferences,
  createEmptyEmergencyContact,
  GENDER_OPTIONS,
  getSalaryBankOptions,
  HOUSING_STATUS_OPTIONS,
  LOAN_TENURE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PURCHASE_METHOD_OPTIONS,
  RACE_OPTIONS,
  VEHICLE_CONDITION_OPTIONS
} from '../utils/customerApplicationForm';
import { AppLanguage, getAppLocale, tr, trLoanStatus } from '../lib/i18n';
import { buildPublicSiteUrl } from '../lib/publicUrls';
import calendarIcon from '../assets/icons/content/calendar-transparent.png';
import searchIcon from '../assets/icons/nav/search.png';
import userIcon from '../assets/icons/nav/user.png';
import allChannelsIcon from '../assets/icons/nav/allChannels.png';

function InlineAssetIcon({ src, className = 'h-5 w-5' }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden="true" className={`${className} object-contain`} />;
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
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ring-2 ${nodeClass}`}>
                  {isComplete ? '✓' : index + 1}
                </span>
                <span
                  className={`w-full truncate text-center text-[8px] font-bold ${isCurrent ? 'text-slate-700' : 'text-slate-400'}`}
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
      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[9px] font-semibold">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isJourneyClosed ? 'bg-slate-400' : 'bg-amber-500'}`} />
        <span className="truncate text-slate-600">{pendingOwner}</span>
        <span className="shrink-0 text-slate-300">·</span>
        <span className="truncate text-slate-400">{journeyAction}</span>
        {!isCash && latestBank && <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 font-mono text-[8px] text-slate-500">R{latestBank.round_no}</span>}
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
  onCreateCustomerIntakeShortLink: (fullUrl: string, source: string, medium: string) => string;
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
const CUSTOMER_ROW_ESTIMATED_HEIGHT = 64;
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
    pageDescriptionAdmin: '打开申请卡进入详情；申请详情单击复制、双击编辑。',
    pageDescriptionReadonly: '当前负责人可编辑自己负责的资料；打开申请卡后，在详情单击复制、双击编辑。',
    shareLink: '分享链接',
    addCustomer: '新增客户',
    allStaffData: '全部员工资料',
    staffData: (name: string) => `${name} 的资料`,
    showAllEnabled: '已开启显示全部',
    assignedCustomers: (count: number) => `${count} 个负责客户`,
    showAll: '显示全部',
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
    addNewCustomer: '新增客户',
    addNewCustomerHelp: '标 * 为必填。',
    missingRequired: (fields: string) => `还差必填项：${fields}`,
    personalInformation: '个人资料',
    customerName: '客户姓名',
    phoneNumber: '联系电话',
    icNumber: '身份证号',
    email: '电邮',
    gender: '性别',
    maritalStatus: '婚姻状况',
    race: '种族',
    bankName: '薪资银行',
    accountNumber: '银行户口号码',
    yearsAtResidence: '居住年数',
    housingStatus: '住房状况',
    fullAddress: '完整地址',
    vehiclePurchase: '车辆与购买',
    vehiclePlate: '车牌号',
    vehicleModel: '申请车型',
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
    loanTenure: '贷款年期',
    notSet: '未设置',
    cancel: '取消',
    createCustomer: '创建客户',
    searchPlaceholder: '搜索客户、电话、身份证、车牌...',
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
    pageDescriptionAdmin: 'Open an application card for details; in Application Detail, click to copy and double-click to edit.',
    pageDescriptionReadonly: 'Assigned handlers can edit their own records from Application Detail: click to copy and double-click to edit.',
    shareLink: 'Share Link',
    addCustomer: 'Add Customer',
    allStaffData: 'All Staff Data',
    staffData: (name: string) => `${name}'s Data`,
    showAllEnabled: 'Show all enabled',
    assignedCustomers: (count: number) => `${count} assigned customers`,
    showAll: 'Show All',
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
    addNewCustomer: 'Add New Customer',
    addNewCustomerHelp: 'Fields marked * are required.',
    missingRequired: (fields: string) => `Missing required: ${fields}`,
    personalInformation: 'Personal Information',
    customerName: 'Customer Name',
    phoneNumber: 'Phone Number',
    icNumber: 'IC Number',
    email: 'Email',
    gender: 'Gender',
    maritalStatus: 'Marital Status',
    race: 'Race',
    bankName: 'Salary Bank',
    accountNumber: 'Account Number',
    yearsAtResidence: 'Years at Residence',
    housingStatus: 'Housing Status',
    fullAddress: 'Full Address',
    vehiclePurchase: 'Vehicle & Purchase',
    vehiclePlate: 'Vehicle Plate',
    vehicleModel: 'Vehicle Model',
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
    loanTenure: 'Loan Tenure',
    notSet: 'Not set',
    cancel: 'Cancel',
    createCustomer: 'Create Customer',
    searchPlaceholder: 'Search customer, phone, IC, plate...',
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
    pageDescriptionAdmin: 'Buka kad permohonan untuk butiran; dalam Butiran Permohonan, klik untuk menyalin dan klik dua kali untuk mengedit.',
    pageDescriptionReadonly: 'Pengendali yang ditugaskan boleh mengedit rekod sendiri dari Butiran Permohonan: klik untuk menyalin dan klik dua kali untuk mengedit.',
    shareLink: 'Kongsi Pautan',
    addCustomer: 'Tambah Pelanggan',
    allStaffData: 'Data Semua Kakitangan',
    staffData: (name: string) => `Data ${name}`,
    showAllEnabled: 'Paparan semua diaktifkan',
    assignedCustomers: (count: number) => `${count} pelanggan ditugaskan`,
    showAll: 'Tunjukkan Semua',
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
    addNewCustomer: 'Tambah Pelanggan Baharu',
    addNewCustomerHelp: 'Medan bertanda * wajib diisi.',
    missingRequired: (fields: string) => `Maklumat wajib belum diisi: ${fields}`,
    personalInformation: 'Maklumat Peribadi',
    customerName: 'Nama Pelanggan',
    phoneNumber: 'Nombor Telefon',
    icNumber: 'Nombor IC',
    email: 'E-mel',
    gender: 'Jantina',
    maritalStatus: 'Status Perkahwinan',
    race: 'Bangsa',
    bankName: 'Bank Gaji',
    accountNumber: 'Nombor Akaun',
    yearsAtResidence: 'Tempoh Menetap',
    housingStatus: 'Status Kediaman',
    fullAddress: 'Alamat Penuh',
    vehiclePurchase: 'Kenderaan & Pembelian',
    vehiclePlate: 'Nombor Plat',
    vehicleModel: 'Model Kenderaan',
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
    loanTenure: 'Tempoh Pinjaman',
    notSet: 'Belum ditetapkan',
    cancel: 'Batal',
    createCustomer: 'Cipta Pelanggan',
    searchPlaceholder: 'Cari pelanggan, telefon, IC, nombor plat...',
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
          className="pointer-events-none fixed z-[100] rounded-lg border border-slate-200 bg-white p-3 text-left text-[11px] font-semibold text-slate-600 shadow-xl shadow-slate-200/70"
          style={tooltipPosition}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {bankApplication.bank_name} {tr('已拒绝', 'rejected', 'ditolak')}
          </span>
          <span className="mt-1 block leading-relaxed">{rejectedReason}</span>
          {bankApplication.reject_code && (
            <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500">
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
  payslip_documents: []
});

function CustomerList({
  language = 'en',
  applications,
  canEditCustomers,
  canAddCustomer,
  canShareCustomerLinks,
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
  onCreateCustomerIntakeShortLink
}: CustomerListProps) {
  const copy = CUSTOMER_LIST_COPY[language];
  const defaultHandlerRoleLabel = getRoleDisplayLabel(defaultHandlerRole, language);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<CustomerTimeFilter>('last_30_days');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');
  const [showCompletedJourneys, setShowCompletedJourneys] = useState(false);
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
      className={`inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
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
      leading: <InlineAssetIcon src={userIcon} className="h-5 w-5" />,
      trailing: renderStaffActionCount(staffLoanActionCounts.all, 'loan-staff-action-count-all')
    },
    ...(applications.some((application) => application.handler_name === 'SEO')
      ? [{
          value: 'SEO',
          label: tr('SEO · 待分配', 'SEO · Pending assignment', 'SEO · Menunggu penugasan'),
          leading: <InlineAssetIcon src={searchIcon} className="h-5 w-5" />,
          trailing: renderStaffActionCount(
            staffLoanActionCounts.byStaff.get('SEO') || 0,
            'loan-staff-action-count-seo'
          )
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

  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const completedJourneyCount = useMemo(() => (
    timeFilteredApplications.filter((application) => (
      matchesLoanApplicationFilter(application, selectedStatusTab)
      && isApplicationJourneyComplete(application)
    )).length
  ), [selectedStatusTab, timeFilteredApplications]);

  const customers = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();

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

    return timeFilteredApplications
      .filter((application) => {
        if (!showCompletedJourneys && isApplicationJourneyComplete(application)) {
          return false;
        }

        const matchesStatus = matchesLoanApplicationFilter(application, selectedStatusTab);

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
  }, [errorCodeIssueMap, debouncedSearchTerm, selectedStatusTab, showCompletedJourneys, sortState, timeFilteredApplications]);

  useEffect(() => {
    setTableScrollTop(0);
    setLoadedCustomerCount(CUSTOMER_INITIAL_LOAD_COUNT);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [debouncedSearchTerm, selectedStaffFilter, selectedStatusTab, showCompletedJourneys, sortState.key, sortState.direction, timeFilteredApplications.length]);

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
      `NAMA BANK : ${personalInfo.bank_name}`,
      `NOMBOR AKAUN : ${cleanSubmissionDigits(personalInfo.account_number)}`,
      `EMAIL : ${personalInfo.email}`,
      `ALAMAT TETAP (IC) : ${personalInfo.full_address}`,
      `ALAMAT KEDIAMAN : ${personalInfo.resident_address || ''}`,
      `MENETAP BERAPA TAHUN : ${formatSubmissionYears(personalInfo.years_at_residence)}`,
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
      `KERJA BERAPA TAHUN : ${formatSubmissionYears(employmentDetails.years_employed)}`,
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
    setNewCustomerDraft((current) => ({
      ...current,
      personal_info: {
        ...current.personal_info,
        [field]: value
      }
    }));
  };

  const updateNewCustomerEmploymentDetails = <K extends keyof CustomerEmploymentDetails>(field: K, value: CustomerEmploymentDetails[K]) => {
    setNewCustomerDraft((current) => ({
      ...current,
      employment_details: {
        ...current.employment_details,
        [field]: value
      }
    }));
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
        id: `DOC-DRAFT-${documentKey}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
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
    const isSalaryPaidByBank = !isCashPurchase && newCustomerDraft.preferences.salary_payment_method === 'Bank';
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
        bank_name: isSalaryPaidByBank ? newCustomerDraft.personal_info.bank_name.trim() : '',
        account_number: isSalaryPaidByBank ? newCustomerDraft.personal_info.account_number.trim() : '',
        full_address: newCustomerDraft.personal_info.full_address.trim(),
        resident_address: newCustomerDraft.personal_info.resident_address?.trim() || '',
        years_at_residence: isCashPurchase ? '' : newCustomerDraft.personal_info.years_at_residence.trim(),
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
      ))
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
    const medium = getCustomerIntakeMedium(shareUtmDraft.source);
    const shortLink = onCreateCustomerIntakeShortLink(customerIntakeLink, sanitizeTrackingValue(shareUtmDraft.source), medium);

    setLastShortCustomerIntakeLink(shortLink);
    try {
      await copyTextToClipboard(shortLink, copy.shortLink, anchorElement, copy.shortLinkCopied);
      setShareCopyMessage(copy.shortLinkCopied);
    } catch {
      setShareCopyMessage(copy.copyFailed);
    }
  };

  const editInputClass = 'w-full select-text rounded-lg border border-slate-100 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-100';
  const newCustomerLabelClass = 'text-[9px] font-bold uppercase tracking-wider text-slate-400';
  const addSectionSummaryClass = 'flex cursor-pointer select-none list-none items-center justify-between border-b border-slate-100 pb-2 text-sm font-bold text-slate-900 [&::-webkit-details-marker]:hidden';

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
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xl shadow-slate-200/70"
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
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{copy.pageTitle}</h2>
          <p className="max-w-2xl text-xs font-light leading-relaxed text-slate-500">
            {copy.pageDescription} {canEditCustomers ? copy.pageDescriptionAdmin : copy.pageDescriptionReadonly}
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {canShareCustomerLinks && (
            <button
              type="button"
              onClick={(event) => void copyShortCustomerIntakeLink(event.currentTarget)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-100 transition-colors hover:bg-slate-50"
            >
              <InlineAssetIcon src={allChannelsIcon} />
              {copy.shareLink}
            </button>
          )}
          {canAddCustomer && (
            <button
              type="button"
              onClick={() => setIsAddingCustomer((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-900"
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
          {currentStaffRole === 'Super Admin' && <div className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm lg:w-[330px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <InlineAssetIcon src={userIcon} className="h-10 w-10 shrink-0" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {showAllApplications ? copy.allStaffData : copy.staffData(defaultHandlerName)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
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
        </div>
      </section>

      {canShareCustomerLinks && isSharingCustomerLink && (
        <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{copy.shareCustomerIntakeLink}</h3>
              <p className="mt-1 text-xs text-slate-400">
                {copy.shareCustomerHelp}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSharingCustomerLink(false)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              aria-label="Close share link form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
            <label className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{copy.customerCameFrom}</span>
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
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{copy.autoTracking}</p>
              <p className="mt-1 text-xs font-bold text-slate-700">{getCustomerIntakeMedium(shareUtmDraft.source)}</p>
              <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400" title={defaultHandlerName}>
                {copy.staff}: {defaultHandlerName}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">{copy.customerIntakeUrl}</p>
            <p className="break-all font-mono text-[11px] text-slate-600">{customerIntakeLink}</p>
            {lastShortCustomerIntakeLink && (
              <>
                <p className="mb-1 mt-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">{copy.shortLink}</p>
                <p className="break-all font-mono text-[11px] font-bold text-blue-600">{lastShortCustomerIntakeLink}</p>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-[11px] font-semibold text-slate-400">
              {shareCopyMessage || `${copy.handler}: ${defaultHandlerName} / ${defaultHandlerRoleLabel}`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveShareUtmDefault}
                disabled={!canShareCustomerIntakeLink}
                className="rounded-lg bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-300"
              >
                {copy.saveDefaultSource}
              </button>
              <button
                type="button"
                onClick={(event) => void copyShortCustomerIntakeLink(event.currentTarget)}
                disabled={!canShareCustomerIntakeLink}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Link2 className="h-4 w-4" />
                {copy.copyShortLink}
              </button>
            </div>
          </div>
        </section>
      )}

      {canAddCustomer && isAddingCustomer && (
        <section className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{copy.addNewCustomer}</h3>
              <p className="mt-1 text-xs text-slate-400">{copy.addNewCustomerHelp}</p>
            </div>
            <button
              type="button"
              onClick={resetNewCustomerDraft}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              aria-label="Close add customer form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <section className="mb-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                <ClipboardPaste className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {tr('粘贴客户资料自动填表', 'Paste Customer Details to Auto-fill', 'Tampal Butiran Pelanggan untuk Isi Automatik')}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
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
                  className="mt-3 min-h-32 w-full resize-y rounded-lg border border-blue-100 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPastedCustomerDetails(customerPasteText)}
                    disabled={!customerPasteText.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
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
                      className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                    >
                      {tr('清除粘贴内容', 'Clear pasted text', 'Kosongkan teks')}
                    </button>
                  )}
                </div>
                {customerPasteFeedback && (
                  <p
                    role={customerPasteFeedback.tone === 'error' ? 'alert' : 'status'}
                    className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold leading-relaxed ${
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
            <h4 className="text-sm font-bold text-slate-900">
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
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? 'border-red-200 bg-red-50 text-red-900 ring-1 ring-red-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-red-700' : 'text-slate-400'}`} />
                    <span>
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="mt-1 block text-xs font-medium leading-relaxed text-slate-500">{helper}</span>
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
                    <span className="text-[10px] font-semibold text-rose-500">
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
                    <span className="text-[10px] font-semibold text-rose-500">
                      {tr('IC 的出生日期或格式不正确', 'Invalid IC birth date or format', 'Tarikh lahir atau format IC tidak sah')}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{tr('出生日期（IC 自动识别）', 'Date of Birth (auto-detected from IC)', 'Tarikh Lahir (dikesan daripada IC)')}</span>
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
                            className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
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
                            className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
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
                        className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={newCustomerLabelClass}>{copy.yearsAtResidence}</span>
                      <input
                        value={newCustomerDraft.personal_info.years_at_residence}
                        onChange={(event) => updateNewCustomerPersonalInfo('years_at_residence', event.target.value.replace(/\D/g, ''))}
                        placeholder="Years"
                        className={editInputClass}
                        inputMode="numeric"
                      />
                    </label>
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
                            className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
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
                          className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
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
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      {inferVehicleBrandFromModel(newCustomerDraft.vehicle_model, vehicleCatalog)}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
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
                    className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
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
                    <div key={documentKey} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{label}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{copy.documentUploadHelp} · {documents.length}/{uploadLimit}</p>
                        </div>
                        <label className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-bold ring-1 ring-indigo-100 transition-colors ${limitReached || isPreparingCustomerDocument ? 'cursor-not-allowed text-slate-400 opacity-50' : 'cursor-pointer text-indigo-600 hover:bg-indigo-50'}`}>
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
                          <p className="rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-slate-400">
                            {tr('尚未上传', 'No file uploaded', 'Tiada fail dimuat naik')}
                          </p>
                        ) : documents.map((document) => (
                          <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-bold text-slate-700" title={document.file_name}>{document.file_name}</p>
                              <p className="mt-0.5 text-[9px] text-slate-400">{formatDocumentFileSize(document.file_size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewCustomerDocument(document.id)}
                              className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Remove ${document.file_name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  })}
              </div>
              {customerDocumentError && (
                <p className="text-[10px] font-semibold text-rose-500">{customerDocumentError}</p>
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
                  { label: copy.yearsEmployed, field: 'years_employed' as const, value: newCustomerDraft.employment_details.years_employed, numeric: true },
                  { label: copy.officePhone, field: 'office_phone_no' as const, value: newCustomerDraft.employment_details.office_phone_no }
                ].map((item) => (
                  <label key={item.field} className="flex flex-col gap-1.5">
                    <span className={newCustomerLabelClass}>{item.label}</span>
                    <input
                      value={item.value}
                      onChange={(event) => updateNewCustomerEmploymentDetails(
                        item.field,
                        item.decimal ? normalizeDecimalInput(event.target.value) : item.numeric ? event.target.value.replace(/\D/g, '') : event.target.value
                      )}
                      placeholder={item.label}
                      className={editInputClass}
                      inputMode={item.decimal ? 'decimal' : item.numeric ? 'numeric' : undefined}
                    />
                  </label>
                ))}
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
                  <div key={`new-emergency-contact-${index}`} className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{copy.emergencyContact(index + 1)}</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <label className="flex flex-col gap-1.5">
                        <span className={newCustomerLabelClass}>{copy.customerName}</span>
                        <input value={contact.full_name} onChange={(event) => updateNewCustomerEmergencyContact(index, 'full_name', event.target.value)} placeholder={copy.customerName} className={editInputClass} />
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
                      personal_info: value === 'Bank'
                        ? current.personal_info
                        : { ...current.personal_info, bank_name: '', account_number: '' },
                      preferences: { ...current.preferences, salary_payment_method: value }
                    }))}
                    ariaLabel="New customer salary paid by"
                    className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
                  />
                </div>
                {newCustomerDraft.preferences.salary_payment_method === 'Bank' && (
                  <>
                    <label className="flex flex-col gap-1.5">
                      <span className={newCustomerLabelClass}>{copy.bankName}</span>
                      <input
                        value={newCustomerDraft.personal_info.bank_name}
                        list={payslipBankListId}
                        autoComplete="off"
                        onChange={(event) => updateNewCustomerPersonalInfo('bank_name', event.target.value)}
                        placeholder={tr('选择或输入薪资银行', 'Select or type the salary bank', 'Pilih atau taip bank gaji')}
                        className={editInputClass}
                      />
                      <span className="text-[10px] font-medium text-slate-400">
                        {tr(
                          '下拉选项包括之前输入的薪资银行。',
                          'Suggestions include salary banks entered for previous customers.',
                          'Cadangan termasuk bank gaji yang dimasukkan untuk pelanggan terdahulu.'
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
                )}
                <label className="flex flex-col gap-1.5">
                  <span className={newCustomerLabelClass}>{copy.loanTenure}</span>
                  <ToggleOptionGroup
                    value={newCustomerDraft.preferences.loan_tenure}
                    options={[
                      { value: '', label: copy.notSet },
                      ...LOAN_TENURE_OPTIONS.map((year) => ({ value: year, label: `${year} years` }))
                    ]}
                    onChange={(value) => updateNewCustomerPreferences('loan_tenure', value)}
                    ariaLabel="New customer loan tenure"
                    className="rounded-lg bg-white p-1 ring-1 ring-slate-100"
                  />
                </label>
              </div>
            </details>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            {newCustomerMissingItems.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-1.5 text-[10px] font-semibold text-rose-500">
                <span>{tr('缺少必填项：', 'Missing required:', 'Maklumat wajib belum diisi:')}</span>
                {newCustomerMissingItems.map((item) => (
                  <button
                    key={item.targetId}
                    type="button"
                    onClick={() => navigateToMissingCustomerField(item)}
                    aria-label={`Go to missing field ${item.label}`}
                    className="rounded-md bg-rose-50 px-2 py-1 font-bold text-rose-600 ring-1 ring-rose-100 transition-colors hover:bg-rose-100 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={resetNewCustomerDraft}
              className="rounded-lg bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={handleAddCustomer}
              disabled={isPreparingCustomerDocument || newCustomerMissingFields.length > 0}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
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
        onSelectStatus={setSelectedStatusTab}
      />

      <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative self-start md:self-auto">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <InlineAssetIcon src={searchIcon} className="h-5 w-5" />
              </span>
              <input
                id="customer-search-input"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-80 rounded-lg border border-slate-100 bg-white py-2 pl-9 pr-4 text-xs outline-none transition-all focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2 self-start md:self-auto">
              <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/70 p-1 scrollbar-none">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-slate-400 ring-1 ring-slate-100">
                  <InlineAssetIcon src={calendarIcon} className="h-4 w-4" />
                </span>
                {customerTimeFilterOptions.map((option) => {
                  const isActive = selectedTimeFilter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedTimeFilter(option.value)}
                      className={`h-7 shrink-0 rounded-md px-2.5 text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-red-800 text-white shadow-sm'
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
                  <label className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{copy.startDate}</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(event) => {
                        setCustomStartDate(event.target.value);
                        setSelectedTimeFilter('custom');
                      }}
                      className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{copy.endDate}</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(event) => {
                        setCustomEndDate(event.target.value);
                        setSelectedTimeFilter('custom');
                      }}
                      className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(completedJourneyCount > 0 || showCompletedJourneys) && (
              <button
                type="button"
                onClick={() => setShowCompletedJourneys((current) => !current)}
                aria-pressed={showCompletedJourneys}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold transition-colors ${
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
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] text-slate-500 ring-1 ring-slate-100">
                  {completedJourneyCount}
                </span>
              </button>
            )}
            <div className="text-[11px] font-medium text-slate-400">
              {tableCopyMessage || tableResultText}
            </div>
          </div>
        </div>

      </section>

      <section
        className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3"
        data-testid="loan-application-card-grid"
      >
        {loadedCustomers.map((customer) => (
          <div
            key={customer.id}
            id={`customer-row-${customer.id}`}
            data-testid={`loan-application-card-${customer.id}`}
          >
            <LoanApplicationCard
              application={customer}
              bankDefinitions={bankDefinitions}
              roleAccounts={roleAccounts}
              onOpen={() => onSelectCustomer(customer)}
            />
          </div>
        ))}

        {customers.length === 0 && (
          <div className="col-span-full rounded-xl border border-slate-100 bg-white py-14 text-center text-sm text-slate-400 shadow-sm">
            {copy.noCustomers}
          </div>
        )}
      </section>

      {hasMoreCustomersToLoad && (
        <button
          type="button"
          onClick={() => setLoadedCustomerCount((current) => Math.min(current + CUSTOMER_LOAD_MORE_COUNT, customers.length))}
          className="mx-auto flex min-h-10 items-center justify-center rounded-lg border border-slate-100 bg-white px-5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          {tr(`加载更多 · ${loadedCustomers.length}/${customers.length}`, `Load more · ${loadedCustomers.length}/${customers.length}`, `Muatkan lagi · ${loadedCustomers.length}/${customers.length}`)}
        </button>
      )}

      {false && <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <p className="border-b border-slate-200 bg-slate-200/80 px-4 py-1.5 text-[10px] font-bold text-slate-700">
          {copy.gestureHint}
        </p>

        <div>
          <div
            ref={tableScrollRef}
            data-testid="loan-applications-table-viewport"
            className="overflow-x-hidden overflow-y-auto"
            style={{ maxHeight: CUSTOMER_TABLE_HEIGHT }}
            onScroll={handleTableScroll}
          >
          <table
            data-dce-copy-on-double-click=""
            data-testid="loan-applications-table"
            className="w-full table-fixed select-none text-left"
          >
            <colgroup>
              <col className="w-[7.5%]" />
              <col className="w-[8.5%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[9%]" />
              <col className="w-[14%]" />
              <col className="w-[20%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700 backdrop-blur">
              <tr>
                <th data-testid="loan-applications-submitted-header" className="px-1.5 py-2.5 whitespace-nowrap">
                  <SortableHeader
                    sortKey="submitted_at"
                    label={copy.table.submitted}
                    sortState={sortState}
                    onSort={handleSort}
                    defaultDirection="desc"
                    className="text-[9px] [column-gap:2px]"
                  />
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap">
                  <SortableHeader sortKey="applicant_name" label={copy.table.customer} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap">
                  <SortableHeader sortKey="phone_no" label={copy.table.contact} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap">
                  <SortableHeader sortKey="ic_no" label={copy.table.icPlate} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap">
                  <SortableHeader sortKey="vehicle_model" label={copy.table.vehicle} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-1.5 py-2.5 text-center whitespace-nowrap">
                  <SortableHeader
                    sortKey="bank_count"
                    label={<Landmark className="h-4 w-4" />}
                    sortState={sortState}
                    onSort={handleSort}
                    defaultDirection="desc"
                    align="center"
                  />
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap">
                  <SortableHeader sortKey="handler_name" label={copy.table.staff} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-2.5 py-2.5 text-center whitespace-nowrap">
                  <SortableHeader sortKey="status" label={copy.table.approval} sortState={sortState} onSort={handleSort} align="center" />
                </th>
                <th className="px-2.5 py-2.5 whitespace-nowrap">
                  {copy.table.remarks}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {virtualWindow.topSpacerHeight > 0 && (
                <tr aria-hidden="true">
                  <td colSpan={9} className="p-0" style={{ height: virtualWindow.topSpacerHeight }} />
                </tr>
              )}

              {visibleCustomers.map((customer) => {
                const approvedNotAcceptedCount = (customer.bank_applications || []).filter((bankApplication) => (
                  bankApplication.status === 'Approved' && bankApplication.offer_status === 'Not Accepted'
                )).length;
                const latestBankApplication = [...(customer.bank_applications || [])]
                  .sort((a, b) => {
                    const aTime = new Date(a.submitted_at || a.decision_at || a.approved_at || 0).getTime();
                    const bTime = new Date(b.submitted_at || b.decision_at || b.approved_at || 0).getTime();
                    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0) || (b.round_no || 0) - (a.round_no || 0);
                  })[0];
                const isEditing = editingCustomerId === customer.id;
                const canEditCustomerRow = canEditCustomers || customer.handler_name === currentStaffName;
                const seoApplication = isSeoApplication(customer);
                const seoAwaitingAssignment = seoApplication && customer.handler_name === 'SEO';
                const riskFlags = riskFlagsByApplicationId[customer.id] || [];
                const rawMatches = rawMatchesByApplicationId[customer.id] || [];
                const pendingWith = getLoanPendingWith(customer);
                const isHandlerPending = pendingWith === 'Handler';
                const isAdminPending = pendingWith === 'Admin' || pendingWith === 'Bank';
                const adminOwnerName = customer.admin_owner_name || tr('未分配', 'Unassigned', 'Belum ditetapkan');
                const pendingGlowClass = 'border-amber-300 bg-amber-50/90 ring-2 ring-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.38)]';
                const idleAssignmentClass = 'border-slate-100 bg-slate-50/70';
                return (
                  <tr
                    key={customer.id}
                    id={`customer-row-${customer.id}`}
                    onClick={(event) => handleCustomerRowClick(event, customer, isEditing)}
                    className={`${isEditing ? 'bg-indigo-50/30' : 'cursor-pointer hover:bg-indigo-50/30'} transition-colors`}
                  >
                    <td className="px-1.5 py-2 align-top font-mono text-[10px] text-slate-400">
                      <span className="block whitespace-nowrap" title={customer.submitted_at}>
                        {formatSubmittedDate(customer.submitted_at)}
                      </span>
                    </td>
                    <td
                      className="px-2.5 py-2 align-top"
                      title={[customer.personal_info?.email, customer.id].filter(Boolean).join('\n')}
                      onClick={(event) => {
                        if (editingCell?.customerId !== customer.id || editingCell.field !== 'customer') {
                          handleCustomerCellClick(event, customer, {
                            copyValue: customer.applicant_name,
                            copyLabel: 'Customer',
                            editField: 'customer'
                          });
                        }
                      }}
                    >
                      {isEditing || (editingCell?.customerId === customer.id && editingCell.field === 'customer') ? (
                        <input
                          autoFocus
                          value={editDraft.applicant_name}
                          onClick={(event) => handleActiveEditableCellClick(event, customer)}
                          onChange={(event) => updateDraft('applicant_name', event.target.value)}
                          onBlur={() => saveEditingCustomer(customer.id)}
                          onKeyDown={(event) => handleEditableCellKeyDown(event, customer.id)}
                          className={editInputClass}
                          aria-label={`Edit customer name for ${customer.id}`}
                        />
                      ) : (
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate font-bold text-slate-800" title={customer.applicant_name}>
                            {customer.applicant_name}
                          </p>
                          {seoApplication && (
                            <span
                              className="inline-flex shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-100"
                              title={tr('官网 SEO 申请', 'Website SEO application', 'Permohonan SEO laman web')}
                            >
                              SEO
                            </span>
                          )}
                          {riskFlags.length > 0 && (
                            <span
                              className="group relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                              title={riskFlags.map((flag) => flag.message).join('\n')}
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="pointer-events-none absolute left-0 top-7 z-30 hidden w-72 rounded-lg border border-amber-100 bg-white p-3 text-left text-[11px] font-semibold text-slate-600 shadow-xl shadow-slate-200/70 group-hover:block">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-amber-600">{tr('风险提醒', 'Risk Warning', "Amaran Risiko")}</span>
                                {riskFlags.map((flag) => (
                                  <span key={`${flag.field}-${flag.value}`} className="mt-1 block leading-relaxed">
                                    {tr(`${flag.label}：与 ${flag.matching_applicant_names.join(', ')} 重复`, `${flag.label}: duplicated with ${flag.matching_applicant_names.join(', ')}`, `${flag.label}: pendua dengan ${flag.matching_applicant_names.join(', ')}`)}
                                  </span>
                                ))}
                              </span>
                            </span>
                          )}
                          {rawMatches.length > 0 && (
                            <span
                              className="group relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                              title={rawMatches.map((match) => `${match.raw_customer_name} (${match.raw_customer_channel})`).join('\n')}
                            >
                              <Database className="h-3.5 w-3.5" />
                              <span className="pointer-events-none absolute left-0 top-7 z-30 hidden w-72 rounded-lg border border-blue-100 bg-white p-3 text-left text-[11px] font-semibold text-slate-600 shadow-xl shadow-slate-200/70 group-hover:block">
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-blue-600">{copy.rawCustomerMatch}</span>
                                {rawMatches.slice(0, 4).map((match) => (
                                  <span key={`${match.raw_customer_id}-${match.customer_id}`} className="mt-1 block leading-relaxed">
                                    {tr(`${match.raw_customer_name} 来自 ${match.raw_customer_channel}：${match.matched_fields.join(', ')}`, `${match.raw_customer_name} from ${match.raw_customer_channel}: ${match.matched_fields.join(', ')}`, `${match.raw_customer_name} daripada ${match.raw_customer_channel}: ${match.matched_fields.join(', ')}`)}
                                  </span>
                                ))}
                                {rawMatches.length > 4 && (
                                  <span className="mt-1 block text-[10px] text-slate-400">{tr(`还有 ${rawMatches.length - 4} 个潜在客户`, `+${rawMatches.length - 4} more leads`, `+${rawMatches.length - 4} lagi prospek`)}</span>
                                )}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                      {!isEditing && !(editingCell?.customerId === customer.id && editingCell.field === 'customer') && (
                        <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">{customer.id}</p>
                      )}
                    </td>
                    <td
                      className="px-2.5 py-2 align-top font-mono text-xs text-slate-600"
                      onClick={(event) => {
                        if (editingCell?.customerId !== customer.id || editingCell.field !== 'contact') {
                          handleCustomerCellClick(event, customer, {
                            copyValue: formatMalaysiaPhoneForCopy(customer.phone_no),
                            copyLabel: 'Contact',
                            editField: 'contact'
                          });
                        }
                      }}
                    >
                      {isEditing || (editingCell?.customerId === customer.id && editingCell.field === 'contact') ? (
                        <input
                          autoFocus
                          value={editDraft.phone_no}
                          onClick={(event) => handleActiveEditableCellClick(event, customer)}
                          onChange={(event) => updateDraft('phone_no', formatPhoneNumber(event.target.value))}
                          onBlur={() => saveEditingCustomer(customer.id)}
                          onKeyDown={(event) => handleEditableCellKeyDown(event, customer.id)}
                          className={editInputClass}
                          aria-label={`Edit phone for ${customer.id}`}
                        />
                      ) : (
                        <span className="block truncate whitespace-nowrap" title={customer.phone_no}>
                          {customer.phone_no}
                        </span>
                      )}
                    </td>
                    <td
                      className="px-2.5 py-2 align-top"
                      onClick={(event) => {
                        if (editingCell?.customerId !== customer.id || editingCell.field !== 'identity') {
                          handleCustomerCellClick(event, customer, {
                            copyValue: [customer.ic_no, customer.vehicle_plate].filter(Boolean).join('\n'),
                            copyLabel: 'IC / Plate',
                            editField: 'identity'
                          });
                        }
                      }}
                    >
                      {isEditing || (editingCell?.customerId === customer.id && editingCell.field === 'identity') ? (
                        <div
                          className="space-y-2"
                          onBlur={(event) => handleEditableCellBlur(event, customer.id)}
                          onKeyDown={(event) => handleEditableCellKeyDown(event, customer.id)}
                        >
                          <input
                            autoFocus
                            value={editDraft.ic_no}
                            onClick={(event) => handleActiveEditableCellClick(event, customer)}
                            onChange={(event) => updateDraft('ic_no', formatIcNumber(event.target.value))}
                            className={editInputClass}
                            aria-label={`Edit IC for ${customer.id}`}
                          />
                          <input
                            value={editDraft.vehicle_plate}
                            onClick={(event) => handleActiveEditableCellClick(event, customer)}
                            onChange={(event) => updateDraft('vehicle_plate', event.target.value.toUpperCase())}
                            className={editInputClass}
                            aria-label={`Edit vehicle plate for ${customer.id}`}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="truncate whitespace-nowrap font-mono text-xs text-slate-600" title={customer.ic_no}>
                            {customer.ic_no}
                          </p>
                          <p className="mt-0.5 truncate whitespace-nowrap font-mono text-[10px] font-semibold text-slate-800" title={customer.vehicle_plate}>
                            {customer.vehicle_plate}
                          </p>
                        </>
                      )}
                    </td>
                    <td
                      className="px-2.5 py-2 align-top"
                      onClick={(event) => {
                        if (editingCell?.customerId !== customer.id || editingCell.field !== 'vehicle') {
                          handleCustomerCellClick(event, customer, {
                            copyValue: customer.vehicle_model,
                            copyLabel: 'Vehicle',
                            editField: 'vehicle'
                          });
                        }
                      }}
                    >
                      {isEditing || (editingCell?.customerId === customer.id && editingCell.field === 'vehicle') ? (
                        <div
                          className="space-y-2"
                          onBlur={(event) => handleEditableCellBlur(event, customer.id)}
                          onKeyDown={(event) => handleEditableCellKeyDown(event, customer.id)}
                        >
                          <input
                            autoFocus
                            value={editDraft.vehicle_model}
                            list={vehicleModelListId}
                            autoComplete="off"
                            onClick={(event) => handleActiveEditableCellClick(event, customer)}
                            onChange={(event) => updateDraft('vehicle_model', event.target.value)}
                            className={editInputClass}
                            aria-label={`Edit vehicle model for ${customer.id}`}
                          />
                          <div className="flex min-w-0 flex-wrap gap-1">
                            <span className="inline-flex max-w-[120px] truncate rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                              {inferVehicleBrandFromModel(editDraft.vehicle_model, vehicleCatalog)}
                            </span>
                            <span className="inline-flex max-w-[120px] truncate rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                              {inferVehicleTagFromModel(editDraft.vehicle_model, vehicleCatalog)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <ToggleOptionGroup
                              value={editDraft.vehicle_condition}
                              options={[
                                { value: '', label: 'New / Used' },
                                ...VEHICLE_CONDITION_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                              ]}
                              onChange={(value) => updateDraft('vehicle_condition', value as VehicleCondition)}
                              onOptionClick={(event) => handleActiveEditableCellClick(event, customer)}
                              className="w-full rounded-md bg-white ring-1 ring-slate-100"
                              optionClassName="!min-h-6 !rounded-md !px-1.5 !py-0.5 !text-[9px] !font-semibold !leading-none"
                              ariaLabel={`Edit vehicle condition for ${customer.id}`}
                            />
                            <ToggleOptionGroup
                              value={editDraft.purchase_method}
                              options={[
                                { value: '', label: 'Cash / Loan' },
                                ...PURCHASE_METHOD_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                              ]}
                              onChange={(value) => updateDraft('purchase_method', value as PurchaseMethod)}
                              onOptionClick={(event) => handleActiveEditableCellClick(event, customer)}
                              className="w-full rounded-md bg-white ring-1 ring-slate-100"
                              optionClassName="!min-h-6 !rounded-md !px-1.5 !py-0.5 !text-[9px] !font-semibold !leading-none"
                              ariaLabel={`Edit purchase method for ${customer.id}`}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-1 pt-0.5">
                            <button
                              type="button"
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                cancelEditingCustomer();
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (event.detail === 0) {
                                  cancelEditingCustomer();
                                }
                              }}
                              className="inline-flex min-h-6 items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                              aria-label={`Cancel vehicle changes for ${customer.id}`}
                            >
                              <X className="h-3 w-3" aria-hidden="true" />
                              {tr('取消', 'Cancel', 'Batal')}
                            </button>
                            <button
                              type="button"
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                saveEditingCustomer(customer.id);
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (event.detail === 0) {
                                  saveEditingCustomer(customer.id);
                                }
                              }}
                              className="inline-flex min-h-6 items-center gap-1 rounded-md bg-red-800 px-2 py-1 text-[9px] font-bold text-white transition-colors hover:bg-red-900"
                              aria-label={`Save vehicle changes for ${customer.id}`}
                            >
                              <Check className="h-3 w-3" aria-hidden="true" />
                              {tr('保存', 'Save', 'Simpan')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-w-0 items-center gap-2" title={[customer.vehicle_model, customer.vehicle_brand, customer.vehicle_tag].filter(Boolean).join(' · ')}>
                          <Car className="h-4 w-4 shrink-0 text-slate-300" />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-slate-700" title={customer.vehicle_model}>
                              {customer.vehicle_model}
                            </span>
                            <div className="mt-0.5 flex min-w-0 gap-1 overflow-hidden">
                              {customer.vehicle_condition && (
                                <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                                  {customer.vehicle_condition}
                                </span>
                              )}
                              {customer.purchase_method && (
                                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                  customer.purchase_method === 'Cash'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-indigo-50 text-indigo-600'
                                }`} title={customer.purchase_method}>
                                  {customer.purchase_method === 'Cash'
                                    ? <Banknote className="h-3 w-3" aria-hidden="true" />
                                    : <Landmark className="h-3 w-3" aria-hidden="true" />}
                                  {customer.purchase_method === 'Cash' ? tr('现金', 'Cash', 'Tunai') : tr('贷款', 'Loan', 'Pinjaman')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-1.5 py-2 align-top" title={approvedNotAcceptedCount > 0 ? `${approvedNotAcceptedCount} approved not accepted` : undefined}>
                      <div
                        data-testid={`loan-applications-bank-summary-${customer.id}`}
                        className="grid grid-cols-[40px_28px] items-center justify-center gap-1 overflow-visible"
                      >
                        <p className="truncate whitespace-nowrap text-[10px] font-bold text-slate-700">
                          {copy.banks((customer.bank_applications || []).length)}
                        </p>
                        {latestBankApplication && (
                          <div className="flex w-7 justify-center overflow-visible">
                            <BankApplicationIndicator
                              key={latestBankApplication.id}
                              applicationId={customer.id}
                              bankApplication={latestBankApplication}
                              bankDefinitions={bankDefinitions}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <div data-testid={`loan-staff-assignments-${customer.id}`} className="grid grid-cols-2 gap-1.5">
                        <div
                          data-testid={`loan-staff-handler-${customer.id}`}
                          data-pending={isHandlerPending ? 'true' : 'false'}
                          title={`${tr('经手人', 'Handler', 'Pengendali')}: ${customer.handler_name}${isHandlerPending ? ` · ${tr('待处理', 'Pending', 'Menunggu')}` : ''}`}
                          className={`relative rounded-lg border px-1.5 py-1 transition-shadow ${isHandlerPending ? pendingGlowClass : idleAssignmentClass}`}
                        >
                          <div className="mb-0.5 flex items-center justify-between gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{tr('经手人', 'Handler', 'Pengendali')}</span>
                            {isHandlerPending && (
                              <span title={tr('待处理', 'Pending', 'Menunggu')} aria-label={tr('待处理', 'Pending', 'Menunggu')} className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[8px] font-extrabold uppercase text-white">
                                P
                              </span>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                value={editDraft.handler_name}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event) => updateDraft('handler_name', event.target.value)}
                                className={editInputClass}
                                aria-label={`Edit handling staff for ${customer.id}`}
                              />
                              <input
                                value={editDraft.handler_role}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event) => updateDraft('handler_role', event.target.value)}
                                className={editInputClass}
                                aria-label={`Edit handling role for ${customer.id}`}
                              />
                            </div>
                          ) : canEditCustomers ? (
                            <div onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
                              <ToggleOptionGroup
                                value={customer.handler_name}
                                onChange={(handlerName) => {
                                  const selectedAccount = roleAccounts.find((account) => account.status === 'Active' && account.name === handlerName);
                                  onUpdateLoanApplication(customer.id, {
                                    handler_name: handlerName,
                                    handler_role: selectedAccount?.role || customer.handler_role
                                  });
                                }}
                                options={[
                                  ...(seoAwaitingAssignment ? activeSalesHandlerOptions : activeHandlerOptions),
                                  ...(!(seoAwaitingAssignment ? activeSalesHandlerOptions : activeHandlerOptions).some((option) => option.value === customer.handler_name) && customer.handler_name
                                    ? [{
                                        value: customer.handler_name,
                                        label: seoAwaitingAssignment
                                          ? tr('SEO · 选择 Sales', 'SEO · Assign Sales', 'SEO · Tetapkan Jualan')
                                          : customer.handler_name
                                      }]
                                    : [])
                                ]}
                                className={`w-full min-w-0 ${seoAwaitingAssignment ? 'rounded-lg bg-amber-50 ring-1 ring-amber-100' : ''}`}
                                optionClassName={`min-h-8 px-2 py-1 ${seoAwaitingAssignment ? 'text-amber-700' : ''}`}
                                activationClicks={seoAwaitingAssignment ? 1 : 3}
                                plainWhenCollapsed={!seoAwaitingAssignment}
                                ariaLabel={`${copy.handler}: ${customer.applicant_name}`}
                              />
                            </div>
                          ) : (
                            <StaffNameBadge
                              name={customer.handler_name}
                              role={getRoleDisplayLabel(customer.handler_role, language)}
                              roleAccounts={roleAccounts}
                              avatarClassName="h-5 w-5"
                              nameClassName="truncate text-[9px] font-bold text-slate-700"
                              roleClassName="hidden"
                            />
                          )}
                        </div>

                        <div
                          data-testid={`loan-staff-admin-${customer.id}`}
                          data-pending={isAdminPending ? 'true' : 'false'}
                          title={`${tr('Admin 负责人', 'Admin Owner', 'Pemilik Admin')}: ${adminOwnerName}${isAdminPending ? ` · ${tr('待处理', 'Pending', 'Menunggu')}` : ''}`}
                          className={`relative rounded-lg border px-1.5 py-1 transition-shadow ${isAdminPending ? pendingGlowClass : idleAssignmentClass}`}
                        >
                          <div className="mb-0.5 flex items-center justify-between gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{tr('Admin 负责人', 'Admin Owner', 'Pemilik Admin')}</span>
                            {isAdminPending && (
                              <span title={tr('待处理', 'Pending', 'Menunggu')} aria-label={tr('待处理', 'Pending', 'Menunggu')} className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[8px] font-extrabold uppercase text-white">
                                P
                              </span>
                            )}
                          </div>
                          <StaffNameBadge
                            name={adminOwnerName}
                            role={getRoleDisplayLabel('Admin', language)}
                            roleAccounts={roleAccounts}
                            avatarClassName="h-5 w-5"
                            nameClassName={`truncate text-[9px] font-bold ${customer.admin_owner_name ? 'text-slate-700' : 'text-slate-400'}`}
                            roleClassName="hidden"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-2.5 py-2 align-top">
                      <CustomerJourneyRail application={customer} />
                    </td>
                    <td className="px-2.5 py-2 align-top">
                      <DoubleClickEditField
                        type="text"
                        value={customer.remarks}
                        onCommit={(value) => onUpdateLoanApplication(customer.id, { remarks: value })}
                        copyOnly={!canEditCustomerRow}
                        placeholder={copy.remarksPlaceholder}
                        emptyText={copy.remarksEmpty}
                        displayClassName="block min-h-6 w-full truncate rounded-lg bg-slate-50 px-2 py-1 text-left text-[10px] text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        inputClassName="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-xs text-slate-600 outline-none ring-2 ring-indigo-50"
                        ariaLabel={`${canEditCustomerRow ? 'Update' : 'Copy'} remarks for ${customer.id}`}
                      />
                    </td>
                  </tr>
                );
              })}

              {virtualWindow.bottomSpacerHeight > 0 && (
                <tr aria-hidden="true">
                  <td colSpan={9} className="p-0" style={{ height: virtualWindow.bottomSpacerHeight }} />
                </tr>
              )}

              {hasMoreCustomersToLoad && (
                <tr aria-hidden="true">
                  <td colSpan={9} className="bg-white px-6 py-4 text-center text-[11px] font-bold text-slate-400">
                    {tr(`继续往下滚动加载更多 · ${loadedCustomers.length}/${customers.length}`, `Scroll down to load more · ${loadedCustomers.length}/${customers.length}`, `Tatal ke bawah untuk memuatkan lagi · ${loadedCustomers.length}/${customers.length}`)}
                  </td>
                </tr>
              )}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-slate-400">
                    {copy.noCustomers}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>}
    </div>
  );
}

export default React.memo(CustomerList);
