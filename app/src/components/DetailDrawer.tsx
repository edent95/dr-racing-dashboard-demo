/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, ArrowUpRight, CalendarClock, CheckCircle2, ChevronDown, Database, Filter, Landmark, MinusCircle, MoreHorizontal, Pencil, Plus, Send, RotateCcw, Square, Trash2, Upload, UserRound, X } from 'lucide-react';
import { AuditLogEntry, type UnitExchange, BankApplication, BankApplicationStatus, BankDefinition, BankOfferStatus, CustomerDocumentChecklistItem, CustomerDocumentStatus, CustomerEmploymentDetails, CustomerPersonalInfo, CustomerPreferences, CustomerRawMatch, CustomerRiskField, CustomerRiskFlag, EmergencyContact, ErrorCodeDefinition, findVehicleCatalogItem, getLoanPendingAction, getLoanPendingWith, inferVehicleBrandFromModel, inferVehicleTagFromModel, LoanApplication, LoanPendingAction, LoanStatus, LoanWorkflowAction, PayslipDocument, PurchaseMethod, REJECT_NEXT_STEPS, RejectNextStepType, RoleAccount, STATUS_CONFIG, VehicleCatalogItem, VehicleCondition, VehiclePurchaseOption } from '../types';
import {
  CUSTOMER_DOCUMENT_REQUIREMENTS,
  getCustomerDocumentUploadLimit,
  getBankRequestedDocumentKey,
  matchBankRequestedDocumentKey,
  getMissingDocumentLabels,
  getUploadedDocumentChecklistKey,
  normalizeDocumentChecklist
} from '../utils/documentChecklist';
import { bankMatchesColumn, isApplicationOpenForNewBank, normalizeBankColumnKey, type BankPageRequest, type BankQuickAction } from '../utils/loanTableBankColumns';
import { getMissingApplicationInformationLabels } from '../utils/applicationCompleteness';
import { getLoanWorkflowActionLabel, getLoanWorkflowUndoAvailability } from '../utils/loanWorkflowUndo';
import { canCancelApplication, canStaffCancelApplication } from '../utils/cashApplicationCancel';
import { getApplicationRejectCodes, normalizeRejectCodes } from '../utils/rejectCodes';
import { getAdminBankFollowUpDueIso } from '../utils/bankFollowUp';
import BankIcon from './BankIcon';
import DoubleClickEditField from './DoubleClickEditField';
import FileDropZone from './FileDropZone';
import UnitExchangeCard from './UnitExchangeCard';
import AeonAutoDebitWarning from './AeonAutoDebitWarning';
import { getAeonAutoDebitIssue } from '../utils/aeonAutoDebit';
import { buildBankFinanceSummary, getBankSellingPrice, getMissingApprovedBankFields } from '../utils/bankFinanceSummary';
import ToggleOptionGroup from './ToggleOptionGroup';
import { getAppLocale, tr, trBankStatus, trLoanStatus } from '../lib/i18n';
import { deriveMalaysiaIcBirthDate } from '../utils/malaysiaIc';
import { formatMalaysiaPhoneForCopy } from '../utils/malaysiaPhone';
import { isFirebaseConfigured } from '../lib/firebaseConfig';
import {
  createEmptyCustomerEmploymentDetails as createEmptyEmploymentDetails,
  createEmptyCustomerPersonalInfo as createEmptyPersonalInfo,
  createEmptyCustomerPreferences as createEmptyPreferences,
  GENDER_OPTIONS,
  getEmploymentDuration,
  getEmploymentStartYearOptions,
  getStartFromDuration,
  hasChildrenQuestion,
  getSalaryBankOptions,
  HOUSING_STATUS_OPTIONS,
  LOAN_TENURE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  OCCUPATION_TYPE_OPTIONS,
  PURCHASE_METHOD_OPTIONS,
  RACE_OPTIONS,
  SALARY_PAYMENT_METHOD_OPTIONS,
  VEHICLE_CONDITION_OPTIONS,
  normalizeCustomerEmploymentDetails as normalizeEmploymentDetails,
  normalizeCustomerPersonalInfo as normalizePersonalInfo,
  normalizeCustomerPreferences as normalizePreferences,
  normalizeEmergencyContacts,
  getEffectiveNumberOfChildren
} from '../utils/customerApplicationForm';
import { useBrandedDialog } from './BrandedDialogProvider';
import DocumentImageViewer from './DocumentImageViewer';
import ApplicationActivityChat from './ApplicationActivityChat';
import { newId } from '../utils/id';
import { hasAdminWorkAccess, isOperationsLead } from '../utils/staffRoles';
import { fieldLabel, fieldLabelWith, OPTIONAL, FROM_IC } from '../data/fieldLabels';
import { isSafeAttachmentDataUrl } from '../utils/attachmentSafety';

interface DetailDrawerProps {
  isOpen: boolean;
  application: LoanApplication | null;
  canEditAllInformation: boolean;
  vehicleTags: string[];
  vehicleBrandTags: string[];
  vehicleCatalog: VehicleCatalogItem[];
  bankDefinitions: BankDefinition[];
  /** Bank names already typed on other files; suggested beside the Bank Database list. */
  salaryBankInputHistory?: string[];
  errorCodeDefinitions: ErrorCodeDefinition[];
  roleAccounts: RoleAccount[];
  riskFlags: CustomerRiskFlag[];
  rawMatches: CustomerRawMatch[];
  currentStaffName: string;
  currentStaffRole: RoleAccount['role'];
  scrollToActivityThreadRequest: number;
  scrollToDocumentChecklistRequest: number;
  /** This application's audit entries; undefined when the role cannot read the Audit Log. */
  auditLogs?: AuditLogEntry[];
  openBankApplicationsRequest: number;
  addBankRequest: number;
  /** Opens the bank page (from a Loan Applications bank cell or a Home bank task), optionally on one bank and decision. */
  bankPageRequest?: BankPageRequest | null;
  onClose: () => void;
  onAddVehicleCatalogItem: (item: Pick<VehicleCatalogItem, 'model' | 'brand' | 'body_type'>) => void;
  onAddActivityComment: (id: string, body: string, taggedRoles: RoleAccount['role'][], taggedStaffNames?: string[]) => void;
  /** Sales record a change of unit on an approved bank (meeting 2026-10-13, "add exchange"). */
  onRecordUnitExchange?: (id: string, input: Omit<UnitExchange, 'id' | 'recorded_by' | 'recorded_by_role' | 'recorded_at' | 'from_model'>) => Promise<boolean>;
  onSave: (
    id: string,
    updatedStatus: LoanStatus,
    updatedRemarks: string,
    updatedErrorCode: string,
    updatedErrorCodes: string[],
    updatedPayslipDocuments: PayslipDocument[],
    updatedBankApplications: BankApplication[],
    updatedApplicationInfo: DetailApplicationInfo,
    workflowAction?: LoanWorkflowAction,
    workflowUndoReason?: string
  ) => Promise<boolean>;
}

type DetailApplicationInfo = Pick<
  LoanApplication,
  'applicant_name' | 'phone_no' | 'ic_no' | 'vehicle_plate' | 'vehicle_model' | 'vehicle_tag' | 'vehicle_brand' | 'vehicle_condition' | 'purchase_method' | 'vehicle_options' | 'handler_name' | 'handler_role' | 'submitted_at' | 'customer_call_back_at' | 'document_checklist' | 'personal_info' | 'emergency_contacts' | 'employment_details' | 'preferences'
>;

type DetailDrawerTab = 'basic' | 'bank';

const MAX_PAYSLIP_FILE_SIZE_BYTES = 700 * 1024;
const DOCUMENT_STATUS_STYLES: Record<CustomerDocumentStatus, {
  chip: string;
  icon: React.ReactNode;
  shape: string;
}> = {
  Missing: {
    chip: 'bg-rose-50 text-rose-700 ring-rose-100',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    shape: 'border-x-[5px] border-b-[8px] border-x-transparent border-b-current'
  },
  Received: {
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    shape: 'h-2.5 w-2.5 rounded-[3px] bg-current'
  },
  'Not Required': {
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    icon: <MinusCircle className="h-3.5 w-3.5" />,
    shape: 'h-2.5 w-2.5 rounded-full bg-current'
  }
};
const RAW_MATCH_FIELD_LABELS: Record<CustomerRiskField, string> = {
  ic_no: 'IC',
  phone_no: 'Phone',
  account_number: 'Account',
  email: 'Email'
};
const EMPLOYMENT_MISSING_ITEM_LABELS = new Set([
  'Company Name',
  'Position',
  'Years Employed',
  'Company Address',
  'Office Phone',
  'Gross Monthly Salary',
  'Net Monthly Salary'
]);
const PREFERENCE_MISSING_ITEM_LABELS = new Set([
  'Available Call Time',
  'Salary Paid By',
  'Bank',
  'Bank Account Number',
  'Loan Tenure'
]);

const normalizeDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = cleaned.split('.');
  return decimalParts.length > 0 ? `${whole}.${decimalParts.join('').slice(0, 2)}` : whole;
};

const normalizeVehicleCondition = (value?: string): VehicleCondition => (
  value === 'New' || value === 'Used' ? value : ''
);

const normalizePurchaseMethod = (value?: string): PurchaseMethod => (
  value === 'Cash' || value === 'Loan' ? value : ''
);

const BANK_APPLICATION_STATUSES: BankApplicationStatus[] = [
  'Draft',
  'Submitted',
  'Need More Info',
  'Rejected',
  'Approved',
  'Cancelled'
];

const DEFAULT_BANK_NEXT_ACTION_OPTIONS = [
  'Follow up bank decision',
  'Request latest payslip',
  'Request latest bank statement',
  'Request IC copy',
  'Contact customer for documents',
  'Wait for customer decision',
  'Resubmit updated documents'
];

const ADD_NEW_BANK_NEXT_ACTION = '__add_new_bank_next_action__';

function BankNextActionSelect({
  value,
  options,
  onChange,
  required = false,
  autoFocus = false,
  tone = 'default',
  ariaLabel
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
  autoFocus?: boolean;
  tone?: 'default' | 'amber';
  ariaLabel: string;
}) {
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [customAnswer, setCustomAnswer] = useState('');
  const optionValues = Array.from(new Set([
    ...options,
    ...(!isAddingAnswer && value && !options.includes(value) ? [value] : [])
  ]));
  const controlClassName = tone === 'amber'
    ? 'border-amber-100 focus:border-amber-300 focus:ring-amber-100'
    : 'border-slate-100 focus:border-indigo-200 focus:ring-indigo-100';

  return (
    <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
      <select
        value={isAddingAnswer ? ADD_NEW_BANK_NEXT_ACTION : value}
        onChange={(event) => {
          if (event.target.value === ADD_NEW_BANK_NEXT_ACTION) {
            setIsAddingAnswer(true);
            setCustomAnswer('');
            onChange('');
            return;
          }

          setIsAddingAnswer(false);
          setCustomAnswer('');
          onChange(event.target.value);
        }}
        required={required}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        className={`h-10 w-full rounded-control border bg-white px-3 text-footnote text-slate-700 outline-none focus:ring-2 ${controlClassName}`}
      >
        <option value="">{tr('选择下一步', 'Select next action', "Pilih tindakan seterusnya")}</option>
        {optionValues.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value={ADD_NEW_BANK_NEXT_ACTION}>
          {tr('＋ 新增答案...', '+ Add new answer...', "+ Tambah jawapan baharu...")}
        </option>
      </select>

      {isAddingAnswer && (
        <input
          type="text"
          value={customAnswer}
          onChange={(event) => {
            setCustomAnswer(event.target.value);
            onChange(event.target.value);
          }}
          placeholder={tr('输入新的下一步答案', 'Enter a new next-action answer', "Masukkan jawapan tindakan seterusnya baharu")}
          aria-label={`${ariaLabel} custom answer`}
          className={`h-10 w-full rounded-control border bg-white px-3 text-footnote text-slate-700 outline-none focus:ring-2 ${controlClassName}`}
          autoFocus
        />
      )}

      <p className={`text-caption ${tone === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>
        {tr('选择现有答案，或用 Add new answer 新增。', 'Choose an existing answer, or use Add new answer to create one.', "Pilih jawapan sedia ada, atau gunakan Tambah jawapan baharu.")}
      </p>
    </div>
  );
}

/** Adds a staff-typed reason for a bank decision to the bank's notes, newest last. */
const appendBankDecisionRemark = (notes: string | undefined, remark: string) => {
  const normalizedRemark = remark.trim();
  if (!normalizedRemark) {
    return notes || '';
  }

  return [notes?.trim(), normalizedRemark].filter(Boolean).join('\n');
};

function BankDecisionRemarkInput({
  value,
  onChange,
  ariaLabel,
  tone
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  tone: 'amber' | 'rose';
}) {
  const toneClassName = tone === 'amber'
    ? 'border-amber-100 focus:border-amber-300 focus:ring-amber-100'
    : 'border-rose-100 focus:border-rose-300 focus:ring-rose-100';

  return (
    <label className="flex min-w-0 flex-col gap-1.5" onClick={(event) => event.stopPropagation()}>
      <span className={`text-micro uppercase ${tone === 'amber' ? 'text-amber-700' : 'text-rose-700'}`}>
        {tr('自定义原因（选填）', 'Custom reason (optional)', 'Sebab tersuai (pilihan)')}
      </span>
      <textarea
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={tr('写下这一步的原因，会存进 Bank Notes', 'Why this step; saved to Bank Notes', 'Sebab langkah ini; disimpan dalam Nota Bank')}
        aria-label={ariaLabel}
        className={`min-h-16 resize-none rounded-control border bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:ring-2 ${toneClassName}`}
      />
    </label>
  );
}

const getRejectDefinitions = (
  value: string,
  definitions: ErrorCodeDefinition[]
) => normalizeRejectCodes(value)
  .map((code) => definitions.find((definition) => definition.code === code))
  .filter((definition): definition is ErrorCodeDefinition => Boolean(definition));

const getLinkedRejectReason = (
  value: string,
  definitions: ErrorCodeDefinition[]
) => Array.from(new Set(
  getRejectDefinitions(value, definitions)
    .map((definition) => definition.issue.trim())
    .filter(Boolean)
)).join(' · ');

function BankRejectCodesInput({
  value,
  definitions,
  onChange,
  ariaLabel,
  autoFocus = false
}: {
  value: string;
  definitions: ErrorCodeDefinition[];
  onChange: (value: string) => void;
  ariaLabel: string;
  autoFocus?: boolean;
}) {
  const [draftCode, setDraftCode] = useState('');
  const selectedCodes = normalizeRejectCodes(value);
  const normalizedDraftCode = normalizeRejectCodes(draftCode)[0] || '';
  const draftDefinition = definitions.find((definition) => definition.code === normalizedDraftCode);
  const canAdd = Boolean(
    draftCode.length === 8 &&
    normalizedDraftCode &&
    draftDefinition &&
    !selectedCodes.includes(normalizedDraftCode)
  );
  const showUnknownCode = draftCode.length === 8 && !draftDefinition;

  const commitCode = () => {
    if (!canAdd) {
      return;
    }

    onChange([...selectedCodes, normalizedDraftCode].join(', '));
    setDraftCode('');
  };

  return (
    <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
      {selectedCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCodes.map((code) => {
            const definition = definitions.find((item) => item.code === code);

            return (
              <span
                key={code}
                className="inline-flex max-w-full items-center gap-1.5 rounded-control border border-rose-100 bg-rose-50 px-2 py-1 text-caption font-semibold text-rose-700"
                title={definition?.issue || tr('此 CODE 尚未在 Error Code Database 设置', 'This CODE is not configured in Error Code Database', 'KOD ini belum dikonfigurasi dalam Pangkalan Data Kod Ralat')}
              >
                <span className="font-mono">{code}</span>
                {definition?.issue && <span className="max-w-52 truncate font-semibold text-rose-500">· {definition.issue}</span>}
                <button
                  type="button"
                  onClick={() => onChange(selectedCodes.filter((item) => item !== code).join(', '))}
                  className="rounded p-0.5 text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-700"
                  aria-label={`${tr('移除 CODE', 'Remove CODE', 'Buang KOD')} ${code}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={draftCode}
          onChange={(event) => setDraftCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitCode();
            }
          }}
          placeholder="03010000"
          aria-label={ariaLabel}
          className="h-10 min-w-0 flex-1 rounded-control border border-slate-100 bg-white px-3 font-mono text-footnote font-semibold text-slate-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          autoFocus={autoFocus}
        />
        <button
          type="button"
          disabled={!canAdd}
          onClick={commitCode}
          className="h-10 rounded-control bg-rose-700 px-3 text-caption font-semibold text-white transition-colors hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {tr('新增 CODE', 'Add CODE', 'Tambah KOD')}
        </button>
      </div>

      {showUnknownCode && (
        <p className="text-caption text-rose-600">
          {tr(
            '找不到此 CODE，请先在 Error Code Database 新增。',
            'CODE not found. Add it to Error Code Database first.',
            'KOD tidak ditemui. Tambahkannya ke Pangkalan Data Kod Ralat dahulu.'
          )}
        </p>
      )}
    </div>
  );
}

const buildStatusReasonUi = (): Record<BankApplicationStatus, {
  label: string;
  placeholder: string;
  showReason: boolean;
  showBankNotes: boolean;
}> => ({
  Draft: {
    label: 'Preparation Notes',
    placeholder: tr('还缺什么资料、准备怎样 submit...', 'What is still missing and how will you submit...', "Apa yang masih kurang dan bagaimana anda akan menyerahkan..."),
    showReason: true,
    showBankNotes: true
  },
  Submitted: {
    label: 'Submission Notes',
    placeholder: tr('记录 submit reference、submit 后等待什么...', 'Record the submission reference and what you are waiting for...', "Catat rujukan penyerahan dan apa yang anda tunggu..."),
    showReason: true,
    showBankNotes: true
  },
  'Pending Review': {
    label: 'Follow Up Notes',
    placeholder: tr('记录 follow up bank officer、预计回复时间...', 'Record the bank officer follow-up and expected reply time...', "Catatkan tindakan susulan pegawai bank dan jangkaan masa menjawab..."),
    showReason: true,
    showBankNotes: true
  },
  'Need More Info': {
    label: 'Reason',
    placeholder: tr('银行需要什么资料，例如 latest payslip、bank statement、guarantor...', 'What the bank needs, e.g. latest payslip, bank statement, guarantor...', "Perkara yang diperlukan oleh bank, cth. slip gaji terkini, penyata bank, penjamin..."),
    showReason: true,
    showBankNotes: false
  },
  Rejected: {
    label: 'Reject Reason',
    placeholder: tr('为什么这间 bank 不批...', 'Why did this bank reject...', "Kenapa bank ini menolak..."),
    showReason: true,
    showBankNotes: true
  },
  Approved: {
    label: 'Offer Decision Notes',
    placeholder: tr('记录 customer 是否 accept、为什么没有 accept、选择了哪一间 bank...', 'Record whether the customer accepted, why not, and which bank they chose...', "Catatkan sama ada pelanggan menerima, mengapa tidak, dan bank mana yang mereka pilih..."),
    showReason: true,
    showBankNotes: true
  },
  Cancelled: {
    label: 'Cancellation Reason',
    placeholder: tr('为什么取消这间 bank application...', 'Why was this bank application cancelled...', "Mengapa permohonan bank ini dibatalkan..."),
    showReason: true,
    showBankNotes: true
  }
});

const formatDateTimeLocal = (value: string) => {
  if (!value) {
    return '';
  }

  return value.slice(0, 16);
};

const toIsoDateTime = (value: string) => {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString();
};

const formatDateInput = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toIsoDate = (value: string) => value ? new Date(`${value}T09:00:00`).toISOString() : '';

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

// 手机拍的文件照片自动压缩（最长边 1600px、JPEG 80%），上传快、省流量，
// 也避免超出存储限制。非图片文件原样保留。
const COMPRESS_MAX_SIDE = 1600;
const COMPRESS_SKIP_BELOW_BYTES = 400 * 1024;

const prepareUploadDataUrl = async (file: File) => {
  const dataUrl = await readFileAsDataUrl(file);

  if (!file.type.startsWith('image/') || file.size < COMPRESS_SKIP_BELOW_BYTES) {
    return dataUrl;
  }

  return new Promise<string>((resolve) => {
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, COMPRESS_MAX_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(Math.round(image.width * scale), 1);
      canvas.height = Math.max(Math.round(image.height * scale), 1);

      const context = canvas.getContext('2d');

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      try {
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
};

const getBankStatusBadgeClass = (status: BankApplicationStatus) => {
  const badgeClasses: Record<BankApplicationStatus, string> = {
    Draft: 'bg-slate-50 text-slate-500 border-slate-200',
    Submitted: 'bg-blue-50 text-blue-600 border-blue-100',
    'Pending Review': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Need More Info': 'bg-amber-50 text-amber-700 border-amber-100',
    Rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Cancelled: 'bg-slate-100 text-slate-500 border-slate-200'
  };

  return badgeClasses[status];
};

const openDocumentPreview = (document: PayslipDocument, onBlocked: () => void) => {
  // SECURITY: file_data_url can come from a public intake row. Only an
  // allow-listed base64 data URL may reach the same-origin preview window; a
  // javascript: or data:text/html value would run on the staff origin.
  if (!isSafeAttachmentDataUrl(document.file_data_url)) {
    return;
  }

  const previewWindow = window.open('', '_blank');

  if (!previewWindow) {
    onBlocked();
    return;
  }

  previewWindow.opener = null;
  previewWindow.document.title = document.file_name;
  previewWindow.document.body.style.margin = '0';
  previewWindow.document.body.style.background = '#0f172a';

  if (document.file_type.startsWith('image/')) {
    const image = previewWindow.document.createElement('img');
    image.src = document.file_data_url;
    image.alt = document.file_name;
    image.style.maxWidth = '100%';
    image.style.maxHeight = '100vh';
    image.style.display = 'block';
    image.style.margin = '0 auto';
    previewWindow.document.body.appendChild(image);
    return;
  }

  const frame = previewWindow.document.createElement('iframe');
  frame.src = document.file_data_url;
  frame.title = document.file_name;
  frame.style.width = '100vw';
  frame.style.height = '100vh';
  frame.style.border = '0';
  previewWindow.document.body.appendChild(frame);
};

const getBankSummaryText = (bankApplication: BankApplication) => (
  bankApplication.next_action ||
  bankApplication.status_reason ||
  bankApplication.reject_reason ||
  bankApplication.notes ||
  'No action recorded'
);

const formatActivityTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(getAppLocale(), {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const TERMINAL_BANK_STATUSES: BankApplicationStatus[] = ['Approved', 'Rejected', 'Cancelled'];

const isTerminalBankStatus = (status: BankApplicationStatus) => TERMINAL_BANK_STATUSES.includes(status);

const getBankDecisionAt = (bankApplication: BankApplication) => (
  bankApplication.decision_at || bankApplication.approved_at || ''
);

const formatTimelineDate = (value: string) => {
  if (!value) {
    return 'Not recorded';
  }

  return new Date(value).toLocaleDateString(getAppLocale(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const translatePendingAction = (action: LoanPendingAction) => {
  const labels: Record<LoanPendingAction, [string, string, string]> = {
    'Complete Application': ['检查并补齐申请', 'Check and complete application', 'Semak dan lengkapkan permohonan'],
    'Review Application': ['检查申请', 'Review application', 'Semak permohonan'],
    'Provide Documents': ['补齐资料', 'Provide documents', 'Sediakan dokumen'],
    'Submit to Bank': ['提交银行', 'Submit to bank', 'Hantar ke bank'],
    'Follow Up Bank': ['跟进银行', 'Follow up bank', 'Susulan bank'],
    'Choose Close or Resubmit': ['选择结案或重新提交', 'Close or resubmit', 'Tutup atau hantar semula'],
    'Resubmit to Bank': ['重新提交银行', 'Resubmit to bank', 'Hantar semula ke bank'],
    'Contact Approved Customer': ['联系已批准客户', 'Contact approved customer', 'Hubungi pelanggan diluluskan'],
    None: ['无需处理', 'No action required', 'Tiada tindakan diperlukan']
  };
  const [zh, en, ms] = labels[action];

  return tr(zh, en, ms);
};

// A confirmed rejection ends that bank; resubmitting the same bank after new documents is Follow Up Reject Bank.
const FINAL_REJECT_NEXT_STEPS: RejectNextStepType[] = ['TRY_ANOTHER_BANK', 'CONVERT_TO_CASH', 'CLOSE_REJECTED'];

const rejectNextStepLabel = (value: RejectNextStepType) => {
  const labels: Record<RejectNextStepType, [string, string, string]> = {
    REQUEST_DOCUMENTS: ['要求补文件', 'Request documents', 'Minta dokumen'],
    CORRECT_INFORMATION: ['更正资料', 'Correct information', 'Betulkan maklumat'],
    ADJUST_DEAL: ['调整贷款方案', 'Adjust deal', 'Laraskan urus niaga'],
    TRY_ANOTHER_BANK: ['尝试其他银行', 'Try another bank', 'Cuba bank lain'],
    FOLLOW_UP_LATER: ['稍后跟进', 'Follow up later', 'Susulan kemudian'],
    CONVERT_TO_CASH: ['转现金购买', 'Convert to cash', 'Tukar kepada tunai'],
    CLOSE_REJECTED: ['拒贷结案', 'Close rejected file', 'Tutup fail ditolak'],
    MERGE_DUPLICATE: ['合并重复申请', 'Merge duplicate', 'Gabung pendua']
  };
  return tr(...labels[value]);
};

const rejectNextStepInstruction = (value: RejectNextStepType) => {
  const instructions: Record<RejectNextStepType, [string, string, string]> = {
    REQUEST_DOCUMENTS: ['向客户索取缺少的文件，补齐后按 Documents Ready 交回 Admin。', 'Request the missing documents from the customer, then use Documents Ready to return it to Admin.', 'Minta dokumen yang hilang daripada pelanggan, kemudian gunakan Documents Ready untuk mengembalikannya kepada Pentadbir.'],
    CORRECT_INFORMATION: ['更正客户或贷款资料，确认后按 Documents Ready 交回 Admin。', 'Correct the customer or loan details, then use Documents Ready to return it to Admin.', 'Betulkan butiran pelanggan atau pinjaman, kemudian gunakan Documents Ready untuk mengembalikannya kepada Pentadbir.'],
    ADJUST_DEAL: ['调整贷款方案或金额，确认后按 Documents Ready 重新提交。', 'Update the deal terms or amount, then use Documents Ready to resubmit.', 'Laraskan terma atau amaun urus niaga, kemudian gunakan Documents Ready untuk menghantar semula.'],
    TRY_ANOTHER_BANK: ['Admin 加另一家银行并提交，不用等 Sales 补件。', 'Admin adds another bank and submits it; Sales does not need to send documents first.', 'Pentadbir menambah bank lain dan menghantarnya; Jualan tidak perlu menghantar dokumen dahulu.'],
    FOLLOW_UP_LATER: ['确认跟进内容并安排下一次跟进；准备继续时按 Documents Ready。', 'Confirm the follow-up details and schedule the next follow-up; use Documents Ready when it is ready to continue.', 'Sahkan butiran susulan dan jadualkan susulan seterusnya; gunakan Documents Ready apabila sedia untuk diteruskan.'],
    CONVERT_TO_CASH: ['把购买方式改为 Cash，确认现金资料后按 Documents Ready。', 'Change the purchase method to Cash, confirm the cash details, then use Documents Ready.', 'Tukar kaedah pembelian kepada Tunai, sahkan butiran tunai, kemudian gunakan Documents Ready.'],
    CLOSE_REJECTED: ['确认拒贷原因无误，然后按 Close Rejected File 结案。', 'Confirm the rejection reason, then use Close Rejected File to close it.', 'Sahkan sebab penolakan, kemudian gunakan Close Rejected File untuk menutupnya.'],
    MERGE_DUPLICATE: ['核对重复记录并完成合并；确认后再处理这份申请。', 'Verify the duplicate record and complete the merge before continuing with this application.', 'Sahkan rekod pendua dan lengkapkan gabungan sebelum meneruskan permohonan ini.']
  };

  return tr(...instructions[value]);
};

const rejectNextStepStoredLabel = (value: RejectNextStepType) => {
  const labels: Record<RejectNextStepType, string> = {
    REQUEST_DOCUMENTS: 'Request documents',
    CORRECT_INFORMATION: 'Correct information',
    ADJUST_DEAL: 'Adjust deal',
    TRY_ANOTHER_BANK: 'Try another bank',
    FOLLOW_UP_LATER: 'Follow up later',
    CONVERT_TO_CASH: 'Convert to cash',
    CLOSE_REJECTED: 'Close rejected file',
    MERGE_DUPLICATE: 'Merge duplicate'
  };
  return labels[value];
};

function DetailDrawer({
  isOpen,
  application,
  canEditAllInformation,
  vehicleTags,
  vehicleBrandTags,
  vehicleCatalog,
  bankDefinitions,
  salaryBankInputHistory = [],
  errorCodeDefinitions,
  roleAccounts,
  riskFlags,
  rawMatches,
  currentStaffName,
  currentStaffRole,
  scrollToActivityThreadRequest,
  auditLogs,
  scrollToDocumentChecklistRequest,
  openBankApplicationsRequest,
  addBankRequest,
  bankPageRequest,
  onClose,
  onAddVehicleCatalogItem,
  onAddActivityComment,
  onRecordUnitExchange,
  onSave
}: DetailDrawerProps) {
  const { showAlert, showConfirm } = useBrandedDialog();
  const [editedApplicationInfo, setEditedApplicationInfo] = useState<DetailApplicationInfo>({
    applicant_name: '',
    phone_no: '',
    ic_no: '',
    vehicle_plate: '',
    vehicle_model: '',
    vehicle_tag: 'Motorcycle',
    vehicle_brand: 'Yamaha',
    vehicle_condition: '',
    purchase_method: '',
    vehicle_options: [],
    handler_name: '',
    handler_role: '',
    submitted_at: '',
    customer_call_back_at: '',
    document_checklist: normalizeDocumentChecklist({ document_checklist: [], payslip_documents: [] }),
    personal_info: createEmptyPersonalInfo(),
    emergency_contacts: normalizeEmergencyContacts(),
    employment_details: createEmptyEmploymentDetails(),
    preferences: createEmptyPreferences()
  });
  const [editedStatus, setEditedStatus] = useState<LoanStatus>(LoanStatus.NEW);
  const [editedRemarks, setEditedRemarks] = useState('');
  // Remark edits through an Edit button too (owner 2026-10-20), not only by double click.
  const [remarkDraft, setRemarkDraft] = useState<string | null>(null);
  const [copiedFinanceBankId, setCopiedFinanceBankId] = useState('');
  const [editedErrorCode, setEditedErrorCode] = useState('');
  const [editedErrorCodes, setEditedErrorCodes] = useState<string[]>([]);
  const [editedPayslipDocuments, setEditedPayslipDocuments] = useState<PayslipDocument[]>([]);
  const [documentLoadStates, setDocumentLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  const [editedBankApplications, setEditedBankApplications] = useState<BankApplication[]>([]);
  const [expandedBankApplicationIds, setExpandedBankApplicationIds] = useState<Record<string, boolean>>({});
  const [quickRejectBankId, setQuickRejectBankId] = useState('');
  const [quickRejectCode, setQuickRejectCode] = useState('');
  const [quickRejectReason, setQuickRejectReason] = useState('');
  const [quickRejectNextStep, setQuickRejectNextStep] = useState<RejectNextStepType | ''>('');
  const [quickRejectMode, setQuickRejectMode] = useState<'follow-up' | 'final'>('final');
  const [quickRejectDocument, setQuickRejectDocument] = useState('');
  const [quickFollowUpBankId, setQuickFollowUpBankId] = useState('');
  const [quickFollowUpNextAction, setQuickFollowUpNextAction] = useState('');
  const [quickCancelBankId, setQuickCancelBankId] = useState('');
  const [quickCancelReason, setQuickCancelReason] = useState('');
  const [quickDecisionRemark, setQuickDecisionRemark] = useState('');
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicleBrand, setNewVehicleBrand] = useState(vehicleBrandTags[0] || 'Yamaha');
  const [isUploadingPayslip, setIsUploadingPayslip] = useState(false);
  const vehicleModelSuggestions = useMemo(() => Array.from(
    vehicleCatalog.reduce<Map<string, VehicleCatalogItem>>((items, item) => {
      const model = item.model.trim();
      const key = model.toLowerCase();

      if (model && !items.has(key)) {
        items.set(key, { ...item, model });
      }

      return items;
    }, new Map()).values()
  )
    .sort((a, b) => a.model.localeCompare(b.model))
    .map((item) => ({
      value: item.model,
      label: `${item.brand} · ${item.model}`
    })), [vehicleCatalog]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailDrawerTab>('basic');
  const [adminSubmissionView, setAdminSubmissionView] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const handledActivityScrollRequestRef = useRef(0);
  const handledDocumentScrollRequestRef = useRef(0);
  const handledOpenBankApplicationsRequestRef = useRef(0);
  const handledBankPageRequestRef = useRef(0);
  const handledAddBankRequestRef = useRef(0);
  const attemptedDocumentLoadsRef = useRef(new Set<string>());
  const documentLoadApplicationIdRef = useRef('');
  const [activityDraft, setActivityDraft] = useState('');
  const [isActivityChatOpen, setIsActivityChatOpen] = useState(false);
  const keepHandlerTagRef = useRef(false);
  // Request Documents lives in the Internal Chat composer: the switch turns the
  // next send into the workflow action, and the typed note follows it.
  const [requestDocumentsInChat, setRequestDocumentsInChat] = useState(false);
  const [pendingDocumentRequestNote, setPendingDocumentRequestNote] = useState<{ body: string; taggedRoles: RoleAccount['role'][] } | null>(null);
  const [imageViewerDocument, setImageViewerDocument] = useState<PayslipDocument | null>(null);
  const [tagHandler, setTagHandler] = useState(false);
  const [tagAdmin, setTagAdmin] = useState(false);
  const [tagSuperAdmin, setTagSuperAdmin] = useState(false);
  const [showUndoPanel, setShowUndoPanel] = useState(false);
  const [undoReason, setUndoReason] = useState('');
  const [showCancelApplicationPanel, setShowCancelApplicationPanel] = useState(false);
  const [cancelApplicationReason, setCancelApplicationReason] = useState('');
  const documentChecklistRef = useRef<HTMLDivElement | null>(null);
  const detailContentRef = useRef<HTMLDivElement | null>(null);

  const activeRoleAccounts = roleAccounts.filter((account) => account.status === 'Active');
  const assignedHandlerAccount = activeRoleAccounts.find((account) => account.name === application?.handler_name);
  const canTagAssignedHandler = Boolean(
    assignedHandlerAccount &&
    assignedHandlerAccount.name !== currentStaffName &&
    hasAdminWorkAccess(currentStaffRole)
  );
  const activeBankOptions = bankDefinitions.filter((bank) => bank.active).map((bank) => bank.name);
  const salaryBankOptions = getSalaryBankOptions(activeBankOptions, salaryBankInputHistory);
  const salaryBankName = editedApplicationInfo.personal_info?.bank_name || '';
  const aeonAutoDebitIssue = getAeonAutoDebitIssue(salaryBankName, editedBankApplications, bankDefinitions);
  const canManageDocuments = Boolean(application) && (
    hasAdminWorkAccess(currentStaffRole) ||
    application?.handler_name === currentStaffName
  );
  const canManageBankApplications = hasAdminWorkAccess(currentStaffRole);

  const getRiskFlag = (field: CustomerRiskField) => riskFlags.find((flag) => flag.field === field);

  const renderRiskIcon = (field: CustomerRiskField) => {
    const flag = getRiskFlag(field);
    if (!flag) {
      return null;
    }

    return (
      <span
        className="group relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100"
        title={flag.message}
      >
        <AlertTriangle className="h-3 w-3" />
        <span className="pointer-events-none absolute left-0 top-6 z-30 hidden w-72 rounded-control border border-amber-100 bg-white p-3 text-left text-footnote text-slate-600 shadow-e3 shadow-slate-200/70 group-hover:block">
          <span className="mb-1 block text-micro uppercase text-amber-600">{tr('风险提醒', 'Risk Warning', "Amaran Risiko")}</span>
          {flag.message}
        </span>
      </span>
    );
  };

  const normalizeVehicleOptions = (source: Pick<LoanApplication, 'id' | 'vehicle_model' | 'vehicle_brand' | 'vehicle_tag' | 'vehicle_condition' | 'purchase_method' | 'vehicle_options'>): VehiclePurchaseOption[] => {
    const rawOptions = Array.isArray(source.vehicle_options) && source.vehicle_options.length > 0
      ? source.vehicle_options
      : [
        {
          id: `VEH-OPTION-${source.id || 'DRAFT'}-01`,
          vehicle_model: source.vehicle_model || '',
          vehicle_brand: source.vehicle_brand || inferVehicleBrandFromModel(source.vehicle_model || '', vehicleCatalog),
          vehicle_tag: source.vehicle_tag || 'Motorcycle',
          vehicle_condition: source.vehicle_condition || '',
          purchase_method: source.purchase_method || '',
          priority: 1
        }
      ];

    return rawOptions
      .map((option, index) => {
        const vehicleModel = option.vehicle_model.trim();
        const catalogItem = findVehicleCatalogItem(vehicleModel, vehicleCatalog);

        return {
          id: option.id || `VEH-OPTION-${source.id || 'DRAFT'}-${String(index + 1).padStart(2, '0')}`,
          vehicle_model: vehicleModel,
          vehicle_brand: catalogItem?.brand || inferVehicleBrandFromModel(vehicleModel, vehicleCatalog),
          vehicle_tag: 'Motorcycle',
          vehicle_condition: normalizeVehicleCondition(option.vehicle_condition),
          purchase_method: normalizePurchaseMethod(option.purchase_method),
          motor_selling_price: String(option.motor_selling_price ?? '').trim(),
          deposit: String(option.deposit ?? '').trim(),
          total_cash_price: String(option.total_cash_price ?? '').trim(),
          motor_mileage: String(option.motor_mileage ?? '').trim(),
          priority: index + 1
        };
      })
      .filter((option, index) => option.vehicle_model || index === 0);
  };

  const updateHandlerName = (handlerName: string) => {
    const selectedRoleAccount = activeRoleAccounts.find((account) => account.name === handlerName);
    setEditedApplicationInfo((current) => ({
      ...current,
      handler_name: handlerName,
      handler_role: selectedRoleAccount?.role || current.handler_role
    }));
  };

  const updateVehicleOption = <K extends keyof VehiclePurchaseOption>(index: number, field: K, value: VehiclePurchaseOption[K]) => {
    setEditedApplicationInfo((current) => {
      const options = normalizeVehicleOptions(current as LoanApplication);
      const nextOption = {
        ...options[index],
        [field]: value
      };

      if (field === 'vehicle_model') {
        const model = String(value);
        const catalogItem = findVehicleCatalogItem(model, vehicleCatalog);
        nextOption.vehicle_model = model;
        nextOption.vehicle_brand = catalogItem?.brand || inferVehicleBrandFromModel(model, vehicleCatalog);
        nextOption.vehicle_tag = 'Motorcycle';
      }
      if (field === 'vehicle_condition' && value !== 'Used') {
        nextOption.motor_mileage = '';
      }

      options[index] = nextOption;
      const primaryOption = options[0];

      return {
        ...current,
        vehicle_options: options,
        vehicle_model: primaryOption?.vehicle_model || '',
        vehicle_brand: primaryOption?.vehicle_brand || 'Yamaha',
        vehicle_tag: 'Motorcycle',
        vehicle_condition: primaryOption?.vehicle_condition || '',
        purchase_method: primaryOption?.purchase_method || ''
      };
    });
  };

  const addVehicleOption = () => {
    setEditedApplicationInfo((current) => {
      const options = normalizeVehicleOptions(current as LoanApplication);
      const nextIndex = options.length + 1;
      return {
        ...current,
        vehicle_options: [
          ...options,
          {
            id: `VEH-OPTION-${application?.id || 'DRAFT'}-${Date.now()}`,
            vehicle_model: '',
            vehicle_brand: 'Yamaha',
            vehicle_tag: 'Motorcycle',
            vehicle_condition: normalizeVehicleCondition(''),
            purchase_method: normalizePurchaseMethod(''),
            priority: nextIndex
          }
        ]
      };
    });
  };

  const deleteVehicleOption = (index: number) => {
    setEditedApplicationInfo((current) => {
      const options = normalizeVehicleOptions(current as LoanApplication)
        .filter((_, optionIndex) => optionIndex !== index)
        .map((option, optionIndex) => ({
          ...option,
          priority: optionIndex + 1
        }));
      const safeOptions = options.length > 0 ? options : normalizeVehicleOptions(current as LoanApplication).slice(0, 1);
      const primaryOption = safeOptions[0];

      return {
        ...current,
        vehicle_options: safeOptions,
        vehicle_model: primaryOption?.vehicle_model || '',
        vehicle_brand: primaryOption?.vehicle_brand || 'Yamaha',
        vehicle_tag: 'Motorcycle',
        vehicle_condition: primaryOption?.vehicle_condition || '',
        purchase_method: primaryOption?.purchase_method || ''
      };
    });
  };

  // Sync state with selected application
  useEffect(() => {
    if (application) {
      const isNewDocumentApplication = documentLoadApplicationIdRef.current !== application.id;
      if (isNewDocumentApplication) {
        attemptedDocumentLoadsRef.current.clear();
        documentLoadApplicationIdRef.current = application.id;
      }

      setEditedApplicationInfo({
        vehicle_options: normalizeVehicleOptions(application),
        applicant_name: application.applicant_name,
        phone_no: application.phone_no,
        ic_no: application.ic_no,
        vehicle_plate: application.vehicle_plate,
        vehicle_model: application.vehicle_model,
        vehicle_tag: application.vehicle_tag,
        vehicle_brand: application.vehicle_brand,
        vehicle_condition: application.vehicle_condition || '',
        purchase_method: application.purchase_method || '',
        handler_name: application.handler_name,
        handler_role: application.handler_role,
        submitted_at: application.submitted_at,
        customer_call_back_at: application.customer_call_back_at || '',
        document_checklist: normalizeDocumentChecklist(application),
        personal_info: normalizePersonalInfo(application.personal_info),
        emergency_contacts: normalizeEmergencyContacts(application.emergency_contacts),
        employment_details: normalizeEmploymentDetails(application.employment_details),
        preferences: normalizePreferences(application.preferences)
      });
      setEditedStatus(application.status);
      setEditedRemarks(application.remarks);
      setRemarkDraft(null);
      const nextErrorCodes = getApplicationRejectCodes(application);
      setEditedErrorCode(nextErrorCodes[0] || '');
      setEditedErrorCodes(nextErrorCodes);
      setEditedPayslipDocuments((current) => {
        const loadedSourceById = isNewDocumentApplication
          ? new Map<string, string>()
          : new Map(current
              .filter((document) => Boolean(document.file_data_url))
              .map((document) => [document.id, document.file_data_url]));

        return (application.payslip_documents || []).map((document) => ({
          ...document,
          file_data_url: document.file_data_url || loadedSourceById.get(document.id) || ''
        }));
      });
      setDocumentLoadStates((current) => Object.fromEntries(
        (application.payslip_documents || []).map((document) => [
          document.id,
          document.file_data_url || (!isNewDocumentApplication && current[document.id] === 'loaded')
            ? 'loaded'
            : attemptedDocumentLoadsRef.current.has(`${application.id}:${document.id}`)
              ? 'error'
              : 'loading'
        ])
      ));
      setEditedBankApplications(application.bank_applications || []);
      setExpandedBankApplicationIds({});
      setQuickRejectBankId('');
      setQuickRejectCode('');
      setQuickRejectReason('');
      setQuickRejectNextStep('');
      setQuickFollowUpBankId('');
      setQuickFollowUpNextAction('');
      setQuickCancelBankId('');
      setQuickCancelReason('');
      setIsAddingVehicle(false);
      // A Request Documents save keeps the handler tag for the follow-up note.
      setTagHandler(keepHandlerTagRef.current);
      setShowUndoPanel(false);
      setUndoReason('');
      setShowCancelApplicationPanel(false);
      setCancelApplicationReason('');
      setShowMoreActions(false);
    }
  }, [application]);

  useEffect(() => {
    if (isOpen && application?.id) {
      setActiveDetailTab('basic');
      setAdminSubmissionView(false);
    }
    setIsActivityChatOpen(false);
    setImageViewerDocument(null);
  }, [application?.id, isOpen]);

  useEffect(() => {
    detailContentRef.current?.scrollTo({ top: 0 });
    setShowMoreActions(false);
  }, [activeDetailTab]);

  useEffect(() => {
    if (activeDetailTab === 'bank' && editedApplicationInfo.purchase_method !== 'Loan') {
      setActiveDetailTab('basic');
    }
  }, [activeDetailTab, editedApplicationInfo.purchase_method]);

  useEffect(() => {
    if (!hasAdminWorkAccess(currentStaffRole) || editedApplicationInfo.purchase_method !== 'Loan') {
      setAdminSubmissionView(false);
    }
  }, [currentStaffRole, editedApplicationInfo.purchase_method]);

  // Bug fix: the realtime customer listener never downloads file bytes, so a
  // document uploaded (e.g. by Sales) while this drawer/session is already open
  // arrives with an empty file_data_url and shows a blank preview until a full
  // page reload. When the drawer opens, lazily fetch the bytes for any document
  // that is missing them, using the stored storage_path or the deterministic
  // customer_documents/{applicationId}/{documentId} path. Storage Rules still
  // enforce access, so this only succeeds for owners, the unassigned-pool Admin,
  // or Super Admin.
  const activeApplicationIdRef = useRef(application?.id || '');
  activeApplicationIdRef.current = application?.id || '';

  const loadDocumentSource = async (documentItem: PayslipDocument, forceRetry = false) => {
    if (documentItem.file_data_url && isSafeAttachmentDataUrl(documentItem.file_data_url)) {
      return documentItem.file_data_url;
    }

    if (!application) {
      return '';
    }

    const applicationId = application.id;
    const loadKey = `${applicationId}:${documentItem.id}`;
    if (!forceRetry && attemptedDocumentLoadsRef.current.has(loadKey)) {
      return '';
    }
    attemptedDocumentLoadsRef.current.add(loadKey);

    const deterministicStoragePath = `customer_documents/${encodeURIComponent(applicationId.trim())}/${encodeURIComponent(documentItem.id.trim())}`;
    const storagePaths = Array.from(new Set([
      documentItem.storage_path && documentItem.storage_path.startsWith('customer_documents/')
        ? documentItem.storage_path
        : '',
      deterministicStoragePath
    ].filter(Boolean)));

    setDocumentLoadStates((current) => ({ ...current, [documentItem.id]: 'loading' }));

    try {
      const storageModule = await import('../services/applicationDocumentStorage');
      let source = '';
      let loadedStoragePath = '';

      for (const storagePath of storagePaths) {
        try {
          source = await storageModule.loadApplicationDocumentFromStorage(storagePath);
          if (source) {
            loadedStoragePath = storagePath;
            break;
          }
        } catch {
          // Try the deterministic owner-scoped path when legacy metadata points
          // at an inaccessible flat object.
        }
      }

      if (!source || activeApplicationIdRef.current !== applicationId) {
        setDocumentLoadStates((current) => ({ ...current, [documentItem.id]: 'error' }));
        return '';
      }

      setEditedPayslipDocuments((current) => current.map((document) => (
        document.id === documentItem.id
          ? { ...document, file_data_url: source, storage_path: loadedStoragePath || deterministicStoragePath }
          : document
      )));
      setDocumentLoadStates((current) => ({ ...current, [documentItem.id]: 'loaded' }));
      return source;
    } catch {
      if (activeApplicationIdRef.current === applicationId) {
        setDocumentLoadStates((current) => ({ ...current, [documentItem.id]: 'error' }));
      }
      return '';
    }
  };

  useEffect(() => {
    if (!application) {
      return;
    }

    const pendingDocuments = (application.payslip_documents || []).filter((document) => !document.file_data_url);
    pendingDocuments.forEach((documentItem) => {
      void loadDocumentSource(documentItem);
    });
  }, [application]);

  const submitApplicationSave = async (
    workflowAction?: LoanWorkflowAction,
    bankApplications = editedBankApplications,
    workflowUndoReason = ''
  ) => {
    if (!application) {
      return false;
    }

    const normalizedErrorCodes = editedStatus === LoanStatus.REJECT
      ? normalizeRejectCodes([editedErrorCode, ...editedErrorCodes])
      : [];
    const normalizedPersonalInfo = normalizePersonalInfo(editedApplicationInfo.personal_info);
    const normalizedPreferences = normalizePreferences(editedApplicationInfo.preferences);
    return onSave(application.id, editedStatus, editedRemarks, normalizedErrorCodes[0] || '', normalizedErrorCodes, editedPayslipDocuments, bankApplications, {
        vehicle_options: normalizeVehicleOptions({ ...editedApplicationInfo, id: application.id } as LoanApplication),
        applicant_name: editedApplicationInfo.applicant_name.trim(),
        phone_no: editedApplicationInfo.phone_no.trim(),
        ic_no: editedApplicationInfo.ic_no.trim(),
        vehicle_plate: editedApplicationInfo.vehicle_plate.trim().toUpperCase(),
        vehicle_model: editedApplicationInfo.vehicle_model.trim(),
        vehicle_tag: editedApplicationInfo.vehicle_tag,
        vehicle_brand: editedApplicationInfo.vehicle_brand,
        vehicle_condition: editedApplicationInfo.vehicle_condition || '',
        purchase_method: editedApplicationInfo.purchase_method || '',
        handler_name: editedApplicationInfo.handler_name.trim(),
        handler_role: editedApplicationInfo.handler_role.trim(),
        submitted_at: editedApplicationInfo.submitted_at || application.submitted_at,
        customer_call_back_at: editedApplicationInfo.customer_call_back_at || '',
        document_checklist: normalizeDocumentChecklist({
          document_checklist: editedApplicationInfo.document_checklist,
          payslip_documents: editedPayslipDocuments,
          purchase_method: editedApplicationInfo.purchase_method,
          vehicle_condition: editedApplicationInfo.vehicle_condition
        }),
        // Bank and account number stay for cash salary too (owner 2026-10-20).
        personal_info: normalizedPersonalInfo,
        emergency_contacts: normalizeEmergencyContacts(editedApplicationInfo.emergency_contacts),
        employment_details: normalizeEmploymentDetails(editedApplicationInfo.employment_details),
        preferences: {
          ...normalizedPreferences,
          preferred_motorcycle: editedApplicationInfo.vehicle_model.trim()
          },
      }, workflowAction, workflowUndoReason);
  };

  const completeApplicationSave = async (
    workflowAction?: LoanWorkflowAction,
    bankApplications = editedBankApplications,
    workflowUndoReason = ''
  ) => {
    const isDocumentRequest = workflowAction === 'REQUEST_MISSING_DOCUMENTS';
    keepHandlerTagRef.current = isDocumentRequest && canTagAssignedHandler;
    const didSave = await submitApplicationSave(workflowAction, bankApplications, workflowUndoReason);
    setIsSubmitting(false);
    if (didSave && isDocumentRequest) {
      // Stay on the file and open the chat so the Admin can tell the handler
      // what is missing; the handler is pre-tagged so the note notifies them.
      setTagHandler(keepHandlerTagRef.current);
      setIsActivityChatOpen(true);
    }
    keepHandlerTagRef.current = false;
    if (didSave && !isDocumentRequest) {
      onClose();
    }
    return didSave;
  };

  // Handle saving updates
  const handleSave = (workflowAction?: LoanWorkflowAction, workflowUndoReason = '') => {
    if (!application || isSubmitting) return;
    setIsSubmitting(true);
    // Simulate slight network delay for premium feel & micro-interactions
    setTimeout(async () => {
      await completeApplicationSave(workflowAction, editedBankApplications, workflowUndoReason);
    }, 450);
  };

  const requestWorkflowAction = async (workflowAction: LoanWorkflowAction) => {
    const confirmationMessages: Partial<Record<LoanWorkflowAction, string>> = {
      APPROVE_CASH_PURCHASE: tr('确认批准这份现金购买申请？', 'Approve this cash purchase application?', "Luluskan permohonan pembelian tunai ini?"),
      SUBMIT_TO_BANK: tr('确认把这份申请提交到所选银行？', 'Submit this application to the selected bank?', "Hantar permohonan ini kepada bank yang dipilih?"),
      CLOSE_REJECTED: tr('确认把这份拒贷申请结案？', 'Close this rejected application?', "Tutup permohonan yang ditolak ini?"),
      COMPLETE_APPROVED_CONTACT: tr('确认客户联系／接受已经完成？', 'Confirm that customer contact / acceptance is complete?', "Sahkan hubungan / penerimaan pelanggan telah selesai?")
    };
    const confirmationTitles: Partial<Record<LoanWorkflowAction, string>> = {
      APPROVE_CASH_PURCHASE: tr('批准现金购买', 'Approve Cash Purchase', 'Luluskan Pembelian Tunai'),
      SUBMIT_TO_BANK: tr('提交银行', 'Submit to Bank', 'Hantar ke Bank'),
      CLOSE_REJECTED: tr('拒贷结案', 'Close Rejected File', 'Tutup Fail Ditolak'),
      COMPLETE_APPROVED_CONTACT: tr('客户已联系', 'Customer Contacted', 'Pelanggan Dihubungi')
    };
    const confirmation = confirmationMessages[workflowAction];
    const confirmationTitle = confirmationTitles[workflowAction] || tr('确认操作', 'Confirm Action', 'Sahkan Tindakan');
    if (confirmation && !await showConfirm({
      eyebrow: workflowAction === 'SUBMIT_TO_BANK'
        ? tr('银行申请', 'Bank Application', 'Permohonan Bank')
        : tr('客户流程', 'Customer Workflow', 'Aliran Pelanggan'),
      title: confirmationTitle,
      message: confirmation,
      tone: workflowAction === 'CLOSE_REJECTED'
        ? 'danger'
        : workflowAction === 'SUBMIT_TO_BANK'
          ? 'warning'
          : 'success',
      confirmLabel: confirmationTitle
    })) {
      return;
    }
    handleSave(workflowAction);
  };

  const handleSubmitActivityComment = async () => {
    if (!application) {
      return;
    }

    const taggedRoles: RoleAccount['role'][] = [
      ...(tagAdmin ? ['Admin' as const] : []),
      ...(tagSuperAdmin ? ['Super Admin' as const] : [])
    ];

    if (requestDocumentsInChat && canRequestDocuments) {
      if (isSubmitting) return;
      const body = activityDraft.trim();
      setIsSubmitting(true);
      const didSave = await completeApplicationSave('REQUEST_MISSING_DOCUMENTS');
      if (!didSave) return;
      setRequestDocumentsInChat(false);
      setActivityDraft('');
      setTagAdmin(false);
      setTagSuperAdmin(false);
      if (body) setPendingDocumentRequestNote({ body, taggedRoles });
      return;
    }

    if (!activityDraft.trim()) {
      return;
    }
    const taggedStaffNames = tagHandler && canTagAssignedHandler && application.handler_name
      ? [application.handler_name]
      : [];

    onAddActivityComment(application.id, activityDraft, taggedRoles, taggedStaffNames);
    setActivityDraft('');
    setTagHandler(false);
    setTagAdmin(false);
    setTagSuperAdmin(false);
  };

  const handleActivityDraftKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    handleSubmitActivityComment();
  };

  const updateApplicationInfo = <K extends keyof DetailApplicationInfo>(field: K, value: DetailApplicationInfo[K]) => {
    setEditedApplicationInfo((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateDocumentChecklistStatus = (key: CustomerDocumentChecklistItem['key'], status: CustomerDocumentStatus) => {
    if (!canManageDocuments) {
      return;
    }

    setEditedApplicationInfo((current) => {
      const checklist = normalizeDocumentChecklist({
        document_checklist: current.document_checklist,
        payslip_documents: editedPayslipDocuments,
        purchase_method: current.purchase_method,
        vehicle_condition: current.vehicle_condition
      }).map((item) => (
        item.key === key
          ? {
            ...item,
            status,
            updated_at: new Date().toISOString(),
            updated_by: currentStaffName
          }
          : item
      ));

      return {
        ...current,
        document_checklist: checklist
      };
    });
  };

  const updatePersonalInfo = <K extends keyof CustomerPersonalInfo>(field: K, value: CustomerPersonalInfo[K]) => {
    setEditedApplicationInfo((current) => ({
      ...current,
      personal_info: {
        ...normalizePersonalInfo(current.personal_info),
        [field]: value,
        ...(field === 'marital_status'
          ? hasChildrenQuestion(String(value))
            ? { number_of_children: String(current.personal_info?.number_of_children || '').trim() || '0' }
            : { number_of_children: '' }
          : {}),
        // Blank on a Married / Divorced / Widowed file means 0 (owner default), never "missing".
        ...(field === 'number_of_children' && !String(value || '').trim() ? { number_of_children: '0' } : {})
      }
    }));
  };

  const updateEmergencyContact = <K extends keyof EmergencyContact>(index: number, field: K, value: EmergencyContact[K]) => {
    setEditedApplicationInfo((current) => {
      const contacts = normalizeEmergencyContacts(current.emergency_contacts);
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

  const updateEmploymentDetails = <K extends keyof CustomerEmploymentDetails>(field: K, value: CustomerEmploymentDetails[K]) => {
    setEditedApplicationInfo((current) => ({
      ...current,
      employment_details: {
        ...normalizeEmploymentDetails(current.employment_details),
        [field]: value
      }
    }));
  };

  const updateEmploymentStart = (field: 'employment_start_year' | 'employment_start_month', value: string) => {
    setEditedApplicationInfo((current) => {
      const employment = {
        ...normalizeEmploymentDetails(current.employment_details),
        [field]: value
      };
      const duration = getEmploymentDuration(employment.employment_start_year, employment.employment_start_month);
      return {
        ...current,
        employment_details: {
          ...employment,
          // years_employed stays the stored field that bank submissions and the
          // completeness check read; it is derived once both parts are chosen.
          ...(duration ? { years_employed: String(duration.years) } : {})
        }
      };
    });
  };

  // Staff type years + months lived here (owner 2026-10-20); the move-in year/month is worked back from today.
  const updateResidenceDuration = (part: 'years' | 'months', value: string) => {
    setEditedApplicationInfo((current) => {
      const personalInfo = normalizePersonalInfo(current.personal_info);
      const duration = getEmploymentDuration(personalInfo.residence_start_year, personalInfo.residence_start_month);
      const next = {
        years: part === 'years' ? value : duration ? String(duration.years) : '',
        months: part === 'months' ? value : duration ? String(duration.months) : ''
      };
      const start = next.years || next.months
        ? getStartFromDuration(Number(next.years || 0), Number(next.months || 0))
        : { year: '', month: '' };
      return {
        ...current,
        personal_info: {
          ...personalInfo,
          residence_start_year: start.year,
          residence_start_month: start.month,
          // Like years_employed: the whole years stay in years_at_residence for completeness and old readers.
          years_at_residence: start.year ? String(Number(next.years || 0)) : ''
        }
      };
    });
  };

  const updatePreferences = <K extends keyof CustomerPreferences>(field: K, value: CustomerPreferences[K]) => {
    setEditedApplicationInfo((current) => ({
      ...current,
      preferences: {
        ...normalizePreferences(current.preferences),
        [field]: value
      }
    }));
  };

  const vehicleCatalogMatch = findVehicleCatalogItem(editedApplicationInfo.vehicle_model, vehicleCatalog);
  // The application references a vehicle model that is not in the Vehicle Info
  // catalog. Surface it to every viewer; only Super Admin can persist a new
  // catalog entry (the catalog lives in the Super-only dashboard_state), so the
  // add action is Super-only while other roles see a "please ask Super Admin"
  // hint.
  const isPrimaryModelMissingFromCatalog = Boolean(editedApplicationInfo.vehicle_model.trim()) && !vehicleCatalogMatch;
  const canAddVehicleCatalogItem = currentStaffRole === 'Super Admin';

  const handleAddVehicleCatalog = () => {
    const model = editedApplicationInfo.vehicle_model.trim().replace(/\s+/g, ' ');
    if (!model) {
      return;
    }

    onAddVehicleCatalogItem({
      model,
      brand: newVehicleBrand || vehicleBrandTags[0] || 'Yamaha',
      body_type: 'Motorcycle'
    });
    setEditedApplicationInfo((current) => ({
      ...current,
      vehicle_model: model,
      vehicle_brand: newVehicleBrand || vehicleBrandTags[0] || 'Yamaha',
      vehicle_tag: 'Motorcycle'
    }));
    setIsAddingVehicle(false);
  };

  const handleDocumentUpload = async (documentKey: CustomerDocumentChecklistItem['key'], files: File[]) => {
    if (!canManageDocuments || !application || files.length === 0) {
      return;
    }

    const uploadLimit = getCustomerDocumentUploadLimit(documentKey);
    const existingCount = editedPayslipDocuments.filter((document) => (
      getUploadedDocumentChecklistKey({
        document_checklist: editedApplicationInfo.document_checklist,
        payslip_documents: editedPayslipDocuments,
        purchase_method: editedApplicationInfo.purchase_method,
        vehicle_condition: editedApplicationInfo.vehicle_condition
      }, document) === documentKey
    )).length;
    if (existingCount + files.length > uploadLimit) {
      await showAlert({
        eyebrow: tr('文件上传', 'Document Upload', 'Muat Naik Dokumen'),
        title: tr('超过文件上限', 'File limit exceeded', 'Had fail dilebihi'),
        message: tr(
          `${documentKey === 'ic' ? '身份证文件' : documentKey === 'payslip' ? '工资单' : documentKey === 'bank_statement' ? '补充文件' : '车辆 Geran'}最多只能上传 ${uploadLimit} 个。`,
          `${documentKey === 'ic' ? 'IC Document' : documentKey === 'payslip' ? 'Payslip' : documentKey === 'bank_statement' ? 'Supporting Doc' : 'Vehicle Geran'} accepts up to ${uploadLimit} files.`,
          `${documentKey === 'ic' ? 'Dokumen IC' : documentKey === 'payslip' ? 'Slip Gaji' : documentKey === 'bank_statement' ? 'Dokumen Sokongan' : 'Geran Kenderaan'} menerima sehingga ${uploadLimit} fail.`
        ),
        tone: 'warning'
      });
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > MAX_PAYSLIP_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      await showAlert({
        eyebrow: tr('文件上传', 'Document Upload', 'Muat Naik Dokumen'),
        title: tr('文件太大', 'File is too large', 'Fail terlalu besar'),
        message: tr(
          `文件必须小于或等于 ${formatFileSize(MAX_PAYSLIP_FILE_SIZE_BYTES)}：${oversizedFiles.map((file) => file.name).join(', ')}`,
          `Document files must be ${formatFileSize(MAX_PAYSLIP_FILE_SIZE_BYTES)} or smaller: ${oversizedFiles.map((file) => file.name).join(', ')}`,
          `Fail dokumen mestilah ${formatFileSize(MAX_PAYSLIP_FILE_SIZE_BYTES)} atau lebih kecil: ${oversizedFiles.map((file) => file.name).join(', ')}`
        ),
        tone: 'warning'
      });
      return;
    }

    setIsUploadingPayslip(true);

    try {
      const uploadedDocuments = await Promise.all(files.map(async (file) => {
        const documentId = newId(`DOC-${application.id}-${documentKey}`);
        const fileDataUrl = await prepareUploadDataUrl(file);
        const storagePath = isFirebaseConfigured
          ? await import('../services/applicationDocumentStorage').then((module) => (
              module.uploadApplicationDocumentToStorage(application.id, documentId, fileDataUrl)
            ))
          : '';

        if (isFirebaseConfigured && !storagePath) {
          throw new Error('Document did not reach Firebase Storage.');
        }

        return {
          id: documentId,
          document_key: documentKey,
          file_name: file.name,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
          uploaded_by: currentStaffName,
          uploaded_at: new Date().toISOString(),
          file_data_url: fileDataUrl,
          storage_path: storagePath
        };
      }));

      setEditedPayslipDocuments((current) => [...uploadedDocuments, ...current]);
      setDocumentLoadStates((current) => ({
        ...current,
        ...Object.fromEntries(uploadedDocuments.map((document) => [document.id, 'loaded' as const]))
      }));
      updateDocumentChecklistStatus(documentKey, 'Received');
    } catch {
      await showAlert({
        eyebrow: tr('上传失败', 'Upload Failed', 'Muat Naik Gagal'),
        title: tr('文件没有上传成功', 'Document upload failed', 'Muat naik dokumen gagal'),
        message: tr(
          '文件没有上传到云端。请确认 App Check / 网络后重试。',
          'The file did not reach cloud storage. Check App Check / network and try again.',
          'Fail tidak sampai ke storan awan. Semak App Check / rangkaian dan cuba lagi.'
        ),
        tone: 'danger'
      });
    } finally {
      setIsUploadingPayslip(false);
    }
  };

  const handleDocumentReplacement = async (documentItem: PayslipDocument, file: File) => {
    if (!canManageDocuments || !application) {
      return;
    }

    if (file.size <= 0 || file.size > MAX_PAYSLIP_FILE_SIZE_BYTES) {
      await showAlert({
        eyebrow: tr('文件补传', 'Document Re-upload', 'Muat Naik Semula Dokumen'),
        title: tr('文件太大', 'File is too large', 'Fail terlalu besar'),
        message: tr(
          `文件必须小于或等于 ${formatFileSize(MAX_PAYSLIP_FILE_SIZE_BYTES)}：${file.name}`,
          `Document file must be ${formatFileSize(MAX_PAYSLIP_FILE_SIZE_BYTES)} or smaller: ${file.name}`,
          `Fail dokumen mestilah ${formatFileSize(MAX_PAYSLIP_FILE_SIZE_BYTES)} atau lebih kecil: ${file.name}`
        ),
        tone: 'warning'
      });
      return;
    }

    setIsUploadingPayslip(true);

    try {
      const fileDataUrl = await prepareUploadDataUrl(file);
      const storagePath = isFirebaseConfigured
        ? await import('../services/applicationDocumentStorage').then((module) => (
            module.uploadApplicationDocumentToStorage(application.id, documentItem.id, fileDataUrl)
          ))
        : documentItem.storage_path || '';

      if (isFirebaseConfigured && !storagePath) {
        throw new Error('Replacement document did not reach Firebase Storage.');
      }

      setEditedPayslipDocuments((current) => current.map((document) => (
        document.id === documentItem.id
          ? {
              ...document,
              file_name: file.name,
              file_type: file.type || 'application/octet-stream',
              file_size: file.size,
              uploaded_by: currentStaffName,
              uploaded_at: new Date().toISOString(),
              file_data_url: fileDataUrl,
              storage_path: storagePath
            }
          : document
      )));
      setDocumentLoadStates((current) => ({ ...current, [documentItem.id]: 'loaded' }));
      updateDocumentChecklistStatus(documentItem.document_key || 'payslip', 'Received');
    } catch {
      setDocumentLoadStates((current) => ({ ...current, [documentItem.id]: 'error' }));
      await showAlert({
        eyebrow: tr('补传失败', 'Re-upload Failed', 'Muat Naik Semula Gagal'),
        title: tr('文件仍未上传', 'Document is still missing', 'Dokumen masih tiada'),
        message: tr(
          '补传失败，云端仍然没有这个文件。请确认 App Check / 网络后重试。',
          'Re-upload failed and the file is still missing from cloud storage. Check App Check / network and try again.',
          'Muat naik semula gagal dan fail masih tiada dalam storan awan. Semak App Check / rangkaian dan cuba lagi.'
        ),
        tone: 'danger'
      });
    } finally {
      setIsUploadingPayslip(false);
    }
  };

  const handleOpenDocumentPreview = (documentItem: PayslipDocument) => {
    if (documentItem.file_type.startsWith('image/') && documentItem.file_data_url) {
      setImageViewerDocument(documentItem);
      return;
    }

    openDocumentPreview(documentItem, () => {
      void showAlert({
        eyebrow: tr('文件预览', 'Document Preview', 'Pratonton Dokumen'),
        title: tr('浏览器阻止了预览窗口', 'Preview window was blocked', 'Tetingkap pratonton telah disekat'),
        message: tr(
          '请允许浏览器弹出窗口，或改用下载按钮。',
          'Allow pop-up windows in the browser, or use Download instead.',
          'Benarkan tetingkap timbul dalam pelayar, atau gunakan Muat Turun.'
        ),
        tone: 'warning'
      });
    });
  };

  const deleteDocument = (id: string) => {
    if (!canManageDocuments) {
      return;
    }

    setEditedPayslipDocuments((current) => current.filter((document) => document.id !== id));
    setDocumentLoadStates((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const downloadDocument = async (documentItem: PayslipDocument) => {
    const source = await loadDocumentSource(documentItem, true);
    if (!source || !isSafeAttachmentDataUrl(source)) {
      return;
    }

    const anchor = window.document.createElement('a');
    anchor.href = source;
    anchor.download = documentItem.file_name;
    anchor.rel = 'noopener';
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleAddBankApplication = () => {
    if (!canManageBankApplications) {
      return;
    }

    const nextRoundNo = Math.max(0, ...editedBankApplications.map((bank) => Number(bank.round_no) || 0)) + 1;
    const newBankApplication: BankApplication = {
      id: `BANK-${application?.id || 'APP'}-${Date.now()}`,
      bank_name: activeBankOptions[0] || '',
      round_no: nextRoundNo,
      submitted_by: '',
      submitted_at: '',
      status: 'Draft',
      reject_code: '',
      reject_reason: '',
      offer_amount: '',
      interest_rate: '',
      tenure: '',
      monthly_installment: '',
      approved_at: '',
      decision_at: '',
      offer_status: 'No Offer',
      reason_category: '',
      status_reason: '',
      next_action: '',
      next_follow_up_at: getAdminBankFollowUpDueIso(),
      notes: ''
    };

    setEditedBankApplications((current) => [...current, newBankApplication]);
    setExpandedBankApplicationIds((current) => ({
      ...current,
      [newBankApplication.id]: true
    }));
  };

  const updateBankApplication = (id: string, updates: Partial<BankApplication>) => {
    if (!canManageBankApplications) {
      return;
    }

    setEditedBankApplications((current) => current.map((bankApplication) => (
      bankApplication.id === id
        ? mergeBankApplicationUpdates(bankApplication, updates)
        : bankApplication
    )));
  };

  const mergeBankApplicationUpdates = (
    bankApplication: BankApplication,
    updates: Partial<BankApplication>
  ): BankApplication => ({
    ...bankApplication,
    ...updates,
    decision_at: updates.status && isTerminalBankStatus(updates.status) && !bankApplication.decision_at
      ? new Date().toISOString()
      : updates.decision_at ?? bankApplication.decision_at,
    approved_at: updates.status === 'Approved' && !bankApplication.approved_at
      ? new Date().toISOString()
      : updates.approved_at ?? bankApplication.approved_at
  });

  const getBankApplicationStatusUpdates = (
    bankApplication: BankApplication,
    nextStatus: BankApplicationStatus,
    rejectCode = bankApplication.reject_code,
    rejectNextStep: RejectNextStepType | undefined = bankApplication.reject_next_step,
    rejectReason = bankApplication.reject_reason
  ): Partial<BankApplication> => {
    const keepsOfferFields = nextStatus === 'Approved';
    const normalizedRejectCodes = normalizeRejectCodes(rejectCode);
    const normalizedRejectCode = normalizedRejectCodes.join(', ');
    const rejectDefinitions = getRejectDefinitions(normalizedRejectCode, errorCodeDefinitions);
    const rejectDefinition = rejectDefinitions[0];
    const linkedRejectReason = getLinkedRejectReason(normalizedRejectCode, errorCodeDefinitions);
    const resolvedRejectReason = normalizedRejectCodes.length > 0
      ? linkedRejectReason
      : rejectReason.trim();
    const resolvedRejectNextStep = nextStatus === 'Rejected'
      ? rejectNextStep || rejectDefinition?.default_next_step
      : undefined;

    return {
      status: nextStatus,
      reason_category: nextStatus === 'Rejected' ? rejectDefinition?.category || '' : '',
      status_reason: nextStatus === 'Rejected' || nextStatus === 'Cancelled' ? rejectReason.trim() || resolvedRejectReason : '',
      next_action: nextStatus === 'Rejected' && resolvedRejectNextStep ? rejectNextStepStoredLabel(resolvedRejectNextStep) : '',
      reject_next_step: resolvedRejectNextStep,
      reject_code: nextStatus === 'Rejected' ? normalizedRejectCode : '',
      reject_reason: nextStatus === 'Rejected' ? resolvedRejectReason : '',
      ...(keepsOfferFields ? {} : {
        offer_status: 'No Offer' as BankOfferStatus,
        offer_amount: '',
        interest_rate: '',
        tenure: '',
        monthly_installment: '',
        approved_at: ''
      }),
      ...(isTerminalBankStatus(nextStatus) ? {} : { decision_at: '' })
    };
  };

  const updateBankApplicationStatus = (
    bankApplication: BankApplication,
    nextStatus: BankApplicationStatus,
    rejectCode = bankApplication.reject_code,
    rejectNextStep: RejectNextStepType | undefined = bankApplication.reject_next_step
  ) => {
    updateBankApplication(
      bankApplication.id,
      getBankApplicationStatusUpdates(bankApplication, nextStatus, rejectCode, rejectNextStep)
    );
  };

  const saveQuickBankApplicationStatus = async (
    bankApplication: BankApplication,
    nextStatus: Extract<BankApplicationStatus, 'Approved' | 'Rejected' | 'Cancelled'>,
    rejectCode = bankApplication.reject_code,
    rejectNextStep: RejectNextStepType | undefined = bankApplication.reject_next_step,
    rejectReason = bankApplication.reject_reason,
    nextAction?: string,
    remark = ''
  ) => {
    if (isSubmitting) {
      return;
    }

    const nextBankApplications = editedBankApplications.map((currentBankApplication) => (
      currentBankApplication.id === bankApplication.id
        ? mergeBankApplicationUpdates(
          currentBankApplication,
          {
            ...getBankApplicationStatusUpdates(currentBankApplication, nextStatus, rejectCode, rejectNextStep, rejectReason),
            ...(nextAction ? { next_action: nextAction } : {}),
            ...(remark.trim() ? { notes: appendBankDecisionRemark(currentBankApplication.notes, remark) } : {})
          }
        )
        : currentBankApplication
    ));

    setIsSubmitting(true);
    await completeApplicationSave(undefined, nextBankApplications);
  };

  const confirmQuickBankApproval = async (bankApplication: BankApplication) => {
    const confirmed = await showConfirm({
      testId: 'bank-approval-confirmation',
      eyebrow: tr('银行决定', 'Bank Decision', 'Keputusan Bank'),
      title: tr('确认银行批准', 'Confirm Bank Approval', 'Sahkan Kelulusan Bank'),
      message: tr(
        `确认记录 ${bankApplication.bank_name || '银行'} 已批准这份申请？`,
        `Record ${bankApplication.bank_name || 'this bank'} as approving this application?`,
        `Rekodkan ${bankApplication.bank_name || 'bank'} sebagai meluluskan permohonan ini?`
      ),
      tone: 'success',
      confirmLabel: tr('确认已批准', 'Confirm Approved', 'Sahkan Diluluskan'),
      detail: (
        <div className="flex items-center gap-3">
          <BankIcon
            bankName={bankApplication.bank_name}
            bankDefinitions={bankDefinitions}
            status="Approved"
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-headline text-slate-800">
              {bankApplication.bank_name || tr('银行申请', 'Bank Application', 'Permohonan Bank')}
            </p>
            <p className="mt-0.5 text-caption text-slate-500">
              {tr('轮次', 'Round', 'Bulat')} {bankApplication.round_no}
            </p>
          </div>
        </div>
      )
    });

    if (confirmed) {
      await saveQuickBankApplicationStatus(bankApplication, 'Approved');
    }
  };

  const saveQuickBankFollowUp = async (
    bankApplication: BankApplication,
    nextAction: string,
    remark = ''
  ) => {
    const normalizedNextAction = nextAction.trim();
    if (isSubmitting || !normalizedNextAction) {
      return;
    }

    const nextBankApplications = editedBankApplications.map((currentBankApplication) => (
      currentBankApplication.id === bankApplication.id
        ? mergeBankApplicationUpdates(
          currentBankApplication,
          {
            ...getBankApplicationStatusUpdates(currentBankApplication, 'Need More Info'),
            next_action: normalizedNextAction,
            ...(remark.trim() ? { notes: appendBankDecisionRemark(currentBankApplication.notes, remark) } : {})
          }
        )
        : currentBankApplication
    ));

    setIsSubmitting(true);
    await completeApplicationSave(undefined, nextBankApplications);
  };

  // One entry for the five quick decisions, shared by the bank cards and the Home bank follow-up task.
  const closeQuickBankForms = () => {
    setQuickRejectBankId('');
    setQuickRejectCode('');
    setQuickRejectReason('');
    setQuickRejectNextStep('');
    setQuickRejectDocument('');
    setQuickFollowUpBankId('');
    setQuickFollowUpNextAction('');
    setQuickCancelBankId('');
    setQuickCancelReason('');
    setQuickDecisionRemark('');
  };

  const openQuickBankAction = (bankApplication: BankApplication, action: BankQuickAction) => {
    closeQuickBankForms();
    if (action === 'approve') {
      void confirmQuickBankApproval(bankApplication);
      return;
    }
    if (action === 'cancel') {
      setQuickCancelBankId(bankApplication.id);
      setQuickCancelReason(bankApplication.status_reason || '');
      return;
    }
    const requestedDocument = bankApplication.status === 'Need More Info' || matchBankRequestedDocumentKey(bankApplication.next_action)
      ? bankApplication.next_action
      : '';
    if (action === 'follow-up-document') {
      setQuickFollowUpBankId(bankApplication.id);
      setQuickFollowUpNextAction(requestedDocument);
      return;
    }
    const rejectCodes = normalizeRejectCodes(bankApplication.reject_code);
    const rejectCode = rejectCodes.join(', ');
    setQuickRejectBankId(bankApplication.id);
    setQuickRejectCode(rejectCode);
    setQuickRejectReason(
      rejectCodes.length > 0
        ? getLinkedRejectReason(rejectCode, errorCodeDefinitions)
        : bankApplication.reject_reason || bankApplication.status_reason || ''
    );
    if (action === 'follow-up-reject') {
      setQuickRejectNextStep('REQUEST_DOCUMENTS');
      setQuickRejectMode('follow-up');
      setQuickRejectDocument(requestedDocument);
      return;
    }
    const definition = getRejectDefinitions(rejectCode, errorCodeDefinitions)[0];
    const suggestedNextStep = bankApplication.reject_next_step || definition?.default_next_step;
    setQuickRejectNextStep(suggestedNextStep && FINAL_REJECT_NEXT_STEPS.includes(suggestedNextStep) ? suggestedNextStep : '');
    setQuickRejectMode('final');
  };

  const saveQuickBankCancellation = async (
    bankApplication: BankApplication,
    cancellationReason: string
  ) => {
    const normalizedReason = cancellationReason.trim();
    if (isSubmitting || !normalizedReason) {
      return;
    }

    await saveQuickBankApplicationStatus(
      bankApplication,
      'Cancelled',
      '',
      undefined,
      normalizedReason
    );
  };

  const deleteBankApplication = (id: string) => {
    if (!canManageBankApplications) {
      return;
    }

    setEditedBankApplications((current) => current.filter((bankApplication) => bankApplication.id !== id));
    setExpandedBankApplicationIds((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const toggleBankApplicationEditor = (id: string) => {
    setExpandedBankApplicationIds((current) => ({
      ...current,
      [id]: !current[id]
    }));
  };

  useEffect(() => {
    if (
      !isOpen ||
      !application ||
      editedApplicationInfo.purchase_method !== 'Loan' ||
      openBankApplicationsRequest === 0 ||
      handledOpenBankApplicationsRequestRef.current === openBankApplicationsRequest
    ) {
      return;
    }

    handledOpenBankApplicationsRequestRef.current = openBankApplicationsRequest;
    setActiveDetailTab('bank');
  }, [application, editedApplicationInfo.purchase_method, isOpen, openBankApplicationsRequest]);

  useEffect(() => {
    if (
      !isOpen ||
      !application ||
      !bankPageRequest ||
      application.purchase_method !== 'Loan' ||
      handledBankPageRequestRef.current === bankPageRequest.id ||
      // Wait until this application's banks (not the previous application's) are loaded into the editor.
      editedBankApplications.length !== (application.bank_applications || []).length ||
      (application.bank_applications || []).some((bank) => !editedBankApplications.some((edited) => edited.id === bank.id))
    ) {
      return;
    }

    handledBankPageRequestRef.current = bankPageRequest.id;
    setAdminSubmissionView(false);
    setActiveDetailTab('bank');
    closeQuickBankForms();
    const columnKey = bankPageRequest.bankName ? normalizeBankColumnKey(bankPageRequest.bankName) : '';
    const target = bankPageRequest.bankApplicationId
      ? editedBankApplications.find((bank) => bank.id === bankPageRequest.bankApplicationId)
      : columnKey
        ? [...editedBankApplications].reverse().find((bank) => bankMatchesColumn(bank.bank_name, columnKey))
        : undefined;
    if (!target) {
      return;
    }
    if (bankPageRequest.action && canManageBankApplications && ['Submitted', 'Pending Review'].includes(target.status)) {
      openQuickBankAction(target, bankPageRequest.action);
    }
    window.setTimeout(() => {
      window.document.querySelector(`[data-testid="bank-application-${target.id}"]`)?.scrollIntoView({ block: 'center' });
    }, 120);
  }, [application, bankPageRequest, canManageBankApplications, editedBankApplications, isOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      !application ||
      !canManageBankApplications ||
      editedApplicationInfo.purchase_method !== 'Loan' ||
      addBankRequest === 0 ||
      handledAddBankRequestRef.current === addBankRequest
    ) {
      return;
    }

    handledAddBankRequestRef.current = addBankRequest;
    setActiveDetailTab('bank');
    handleAddBankApplication();
  }, [addBankRequest, application, canManageBankApplications, editedApplicationInfo.purchase_method, isOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      !application ||
      scrollToActivityThreadRequest === 0 ||
      handledActivityScrollRequestRef.current === scrollToActivityThreadRequest
    ) {
      return;
    }

    handledActivityScrollRequestRef.current = scrollToActivityThreadRequest;
    // The thread lives in the Internal Chat (the Activity tab is gone).
    setIsActivityChatOpen(true);
  }, [application, isOpen, scrollToActivityThreadRequest]);

  useEffect(() => {
    if (!pendingDocumentRequestNote || !application || getLoanPendingAction(application) !== 'Provide Documents') {
      return;
    }

    // Post the note only once the saved request is back, and one tick later:
    // App refreshes onAddActivityComment's closure in its own effect, which runs
    // after this one, and the stale closure would write back the old file.
    const timer = window.setTimeout(() => {
      onAddActivityComment(
        application.id,
        pendingDocumentRequestNote.body,
        pendingDocumentRequestNote.taggedRoles,
        canTagAssignedHandler && application.handler_name ? [application.handler_name] : []
      );
      setPendingDocumentRequestNote(null);
      setTagHandler(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [application, canTagAssignedHandler, onAddActivityComment, pendingDocumentRequestNote]);

  useEffect(() => {
    if (
      !isOpen ||
      !application ||
      scrollToDocumentChecklistRequest === 0 ||
      handledDocumentScrollRequestRef.current === scrollToDocumentChecklistRequest
    ) {
      return;
    }

    handledDocumentScrollRequestRef.current = scrollToDocumentChecklistRequest;
    setActiveDetailTab('basic');
    const scrollToChecklist = () => {
      documentChecklistRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    };
    const firstScrollTimer = window.setTimeout(scrollToChecklist, 320);
    const secondScrollTimer = window.setTimeout(scrollToChecklist, 700);

    return () => {
      window.clearTimeout(firstScrollTimer);
      window.clearTimeout(secondScrollTimer);
    };
  }, [application, isOpen, scrollToDocumentChecklistRequest]);

  if (!application) return null;

  const editedStatusConfig = STATUS_CONFIG[editedStatus];
  const normalizedVehicleOptions = normalizeVehicleOptions({ ...editedApplicationInfo, id: application.id } as LoanApplication);
  const primaryVehicleOption = normalizedVehicleOptions[0];
  const detectedBirthDate = deriveMalaysiaIcBirthDate(editedApplicationInfo.ic_no);
  const detailInputClass = 'rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:ring-1 focus:ring-indigo-100';
  const detailDisplayClass = 'rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600';

  const latestBankApplication = [...editedBankApplications].sort((a, b) => (
    new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime()
  ))[0];
  const latestRejectedBankApplication = [...editedBankApplications]
    .filter((bankApplication) => bankApplication.status === 'Rejected')
    .sort((a, b) => (
      new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime()
    ))[0];
  const bankNextActionOptions = Array.from(new Set([
    ...DEFAULT_BANK_NEXT_ACTION_OPTIONS,
    ...editedBankApplications
      .map((bankApplication) => bankApplication.next_action.trim())
      .filter(Boolean)
  ]));
  const bankDocumentRequestOptions = bankNextActionOptions.filter((nextAction) => (
    Boolean(matchBankRequestedDocumentKey(nextAction))
  ));
  const needMoreInfoBank = editedBankApplications.find((bankApplication) => bankApplication.status === 'Need More Info');
  const approvedNotAcceptedBank = editedBankApplications.find((bankApplication) => (
    bankApplication.status === 'Approved' && bankApplication.offer_status === 'Not Accepted'
  ));
  const isLoanPurchase = editedApplicationInfo.purchase_method === 'Loan';
  const isCashPurchase = editedApplicationInfo.purchase_method === 'Cash';
  const loanNextActionSummary = needMoreInfoBank?.next_action ||
    approvedNotAcceptedBank?.notes ||
    latestBankApplication?.next_action ||
    editedRemarks ||
    'No next action';
  const documentChecklist = normalizeDocumentChecklist({
    document_checklist: editedApplicationInfo.document_checklist,
    payslip_documents: editedPayslipDocuments,
    purchase_method: editedApplicationInfo.purchase_method,
    vehicle_condition: editedApplicationInfo.vehicle_condition
  }).filter((document) => (
    document.key === 'ic'
    || (isLoanPurchase && (document.key === 'payslip' || document.key === 'bank_statement'))
    || (editedApplicationInfo.vehicle_condition === 'Used' && document.key === 'vehicle_geran')
  ));
  const missingDocumentLabels = getMissingDocumentLabels({
    document_checklist: documentChecklist,
    payslip_documents: editedPayslipDocuments,
    purchase_method: editedApplicationInfo.purchase_method,
    vehicle_condition: editedApplicationInfo.vehicle_condition
  });
  const requestedBankDocumentKey = getBankRequestedDocumentKey(needMoreInfoBank?.next_action);
  const requestedBankDocument = requestedBankDocumentKey
    ? documentChecklist.find((document) => document.key === requestedBankDocumentKey)
    : undefined;
  const bankDocumentRequestStartedAt = new Date(application.pending_since || 0).getTime();
  const hasDocumentUploadedSinceBankRequest = Number.isFinite(bankDocumentRequestStartedAt)
    && editedPayslipDocuments.some((document) => (
      new Date(document.uploaded_at || 0).getTime() >= bankDocumentRequestStartedAt
    ));
  const isBankRequestedDocumentReceived = !needMoreInfoBank || (
    Boolean(requestedBankDocument)
    && requestedBankDocument?.status === 'Received'
    && hasDocumentUploadedSinceBankRequest
  );
  const missingApplicationInformationLabels = getMissingApplicationInformationLabels({
    ...application,
    ...editedApplicationInfo
  });
  const missingInitialReviewLabels = [
    ...missingApplicationInformationLabels,
    ...missingDocumentLabels.map((label) => `Document: ${label}`)
  ];
  const pendingWith = getLoanPendingWith(application);
  const pendingAction = getLoanPendingAction(application);
  // A cash file goes straight to Admin's Approve Cash Purchase, which needs the
  // addresses and cash price too, so they count as missing from the start.
  const currentMissingItemLabels = pendingAction === 'Complete Application' || isCashPurchase
    ? missingInitialReviewLabels
    : missingDocumentLabels;
  const navigateToMissingItem = (label: string) => {
    setActiveDetailTab('basic');

    window.setTimeout(() => {
      const documentLabel = label.startsWith('Document: ')
        ? label.slice('Document: '.length)
        : label;
      const documentItem = documentChecklist.find((item) => item.label === documentLabel);
      const targetId = documentItem
        ? `detail-missing-document-${documentItem.key}`
        : label.startsWith('Document: ')
          ? 'detail-basic-document-checklist'
          : label.startsWith('Emergency Contact ')
            ? 'detail-section-emergency'
            : EMPLOYMENT_MISSING_ITEM_LABELS.has(label)
              ? 'detail-section-employment'
              : PREFERENCE_MISSING_ITEM_LABELS.has(label)
                ? 'detail-section-preferences'
                : 'detail-basic-customer-info';
      const target = detailContentRef.current?.querySelector<HTMLElement>(`#${targetId}`);

      if (!target) return;

      const expandableSection = target instanceof HTMLDetailsElement
        ? target
        : target.closest('details');
      if (expandableSection instanceof HTMLDetailsElement) {
        expandableSection.open = true;
      }

      window.requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        if (target instanceof HTMLDetailsElement) {
          target.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
        }
      });
    }, activeDetailTab === 'basic' ? 0 : 80);
  };
  const nextActionSummary = isCashPurchase
    ? pendingWith === 'Handler' && pendingAction === 'Complete Application'
      ? tr('检查并补齐客户资料和文件。全部完整后，按 Notify Admin 交给 Admin 审核。', 'Check and complete the customer details and documents. When everything is complete, use Notify Admin for Admin review.', "Semak dan lengkapkan butiran serta dokumen pelanggan. Apabila semuanya lengkap, gunakan Notify Admin untuk semakan Pentadbir.")
      : pendingWith === 'Admin' && pendingAction === 'Review Application'
      ? tr('检查 IC 和现金购买资料。资料完整就批准现金申请；不需要新增或提交银行。', 'Review the IC and cash purchase details. Approve the cash purchase when complete; no bank submission is required.', "Semak IC dan butiran pembelian tunai. Luluskan apabila lengkap; penghantaran bank tidak diperlukan.")
      : pendingWith === 'Handler' && pendingAction === 'Contact Approved Customer'
        ? tr('Admin 已通过现金审核。Handler 现在需要确认客户接受。', 'Admin approved the cash review. The Handler now confirms customer acceptance.', "Pentadbir meluluskan semakan tunai. Pengendali kini mengesahkan penerimaan pelanggan.")
        : pendingWith === 'Closed' && application.status === LoanStatus.APPROVE
          ? tr('客户已接受现金购买。下一步由 Admin 安排交车。', 'The customer accepted the cash purchase. Admin should arrange delivery next.', "Pelanggan menerima pembelian tunai. Pentadbir perlu mengatur serahan seterusnya.")
        : tr('现金购买不走银行申请流程。', 'Cash purchases do not use the bank application workflow.', "Pembelian tunai tidak menggunakan aliran permohonan bank.")
    : pendingWith === 'Handler' && pendingAction === 'Complete Application'
      ? tr('检查并补齐客户资料和文件。全部完整后，按 Notify Admin 交给 Admin 审核。', 'Check and complete the customer details and documents. When everything is complete, use Notify Admin for Admin review.', "Semak dan lengkapkan butiran serta dokumen pelanggan. Apabila semuanya lengkap, gunakan Notify Admin untuk semakan Pentadbir.")
      : loanNextActionSummary;
  const activeBankApplication = editedBankApplications.find((bankApplication) => bankApplication.id === application.active_bank_application_id) || latestBankApplication;
  const pendingOwner = pendingWith === 'Admin'
    ? application.admin_owner_name || tr('Admin 团队', 'Admin team', "Pasukan pentadbir")
    : pendingWith === 'Handler'
      ? application.handler_name
      : pendingWith === 'Bank'
        ? latestBankApplication?.bank_name || tr('银行', 'Bank', "Bank")
        : tr('已结束', 'Closed', "Ditutup");
  const currentActionDueAt = application.action_due_at || (
    pendingWith === 'Bank' ? activeBankApplication?.next_follow_up_at || '' : ''
  );
  const currentActionDueTime = currentActionDueAt ? new Date(currentActionDueAt).getTime() : Number.NaN;
  const isCurrentActionOverdue = pendingWith !== 'Closed' && Number.isFinite(currentActionDueTime) && currentActionDueTime < Date.now();
  const currentActionTone = pendingWith === 'Closed'
    ? 'border-emerald-100 bg-emerald-50/40'
    : isCurrentActionOverdue
      ? 'border-rose-100 bg-rose-50/40'
      : 'border-amber-100 bg-amber-50/40';
  const isAssignedHandler = currentStaffRole === 'Super Admin' || application.handler_name === currentStaffName;
  const hasDraftBank = editedBankApplications.some((bank) => bank.status === 'Draft');
  const hasRejectedBank = editedBankApplications.some((bank) => bank.status === 'Rejected');
  const hasOpenOrApprovedBank = editedBankApplications.some((bank) => !['Rejected', 'Cancelled'].includes(bank.status));
  const canRequestDocuments = (isLoanPurchase || isCashPurchase) && canManageBankApplications && pendingAction !== 'Complete Application' && ![LoanStatus.APPROVE, LoanStatus.REJECT, LoanStatus.CANCELLED].includes(application.status);
  const canNotifyAdmin = isAssignedHandler && pendingWith === 'Handler' && pendingAction === 'Complete Application' && application.status === LoanStatus.NEW;
  const canApproveCashPurchase = isCashPurchase && canManageBankApplications && pendingWith === 'Admin' && pendingAction === 'Review Application' && application.status === LoanStatus.NEW && missingInitialReviewLabels.length === 0;
  const canSubmitBank = isLoanPurchase && canManageBankApplications && hasDraftBank && isApplicationOpenForNewBank(application);
  const canSubmitDocuments = isAssignedHandler && pendingWith === 'Handler' && (application.status === LoanStatus.PENDING || application.status === LoanStatus.FOLLOW_UP);
  const canCloseRejected = isLoanPurchase &&
    application.status === LoanStatus.FOLLOW_UP &&
    hasRejectedBank &&
    !hasOpenOrApprovedBank &&
    (
      canManageBankApplications ||
      (isAssignedHandler && pendingWith === 'Handler')
    );
  const canCompleteApprovedContact = isAssignedHandler && pendingWith === 'Handler' && pendingAction === 'Contact Approved Customer' && application.status === LoanStatus.APPROVE;
  // Judged on the saved application, not the unsaved Cash/Loan edit.
  const canShowCancelApplication = canStaffCancelApplication(application, { role: currentStaffRole, name: currentStaffName })
    && canCancelApplication(application);
  const cancelBankApplicationsToWithdraw = (application.bank_applications || [])
    .filter((bank) => !['Rejected', 'Cancelled'].includes(bank.status) && bank.offer_status !== 'Withdrawn');
  const persistedApplicationInfo: DetailApplicationInfo = {
    vehicle_options: normalizeVehicleOptions(application),
    applicant_name: application.applicant_name,
    phone_no: application.phone_no,
    ic_no: application.ic_no,
    vehicle_plate: application.vehicle_plate,
    vehicle_model: application.vehicle_model,
    vehicle_tag: application.vehicle_tag,
    vehicle_brand: application.vehicle_brand,
    vehicle_condition: application.vehicle_condition || '',
    purchase_method: application.purchase_method || '',
    handler_name: application.handler_name,
    handler_role: application.handler_role,
    submitted_at: application.submitted_at,
    customer_call_back_at: application.customer_call_back_at || '',
    document_checklist: normalizeDocumentChecklist(application),
    personal_info: normalizePersonalInfo(application.personal_info),
    emergency_contacts: normalizeEmergencyContacts(application.emergency_contacts),
    employment_details: normalizeEmploymentDetails(application.employment_details),
    preferences: normalizePreferences(application.preferences)
  };
  const hasUnsavedChanges = editedStatus !== application.status ||
    editedRemarks !== application.remarks ||
    JSON.stringify(editedErrorCodes) !== JSON.stringify(getApplicationRejectCodes(application)) ||
    JSON.stringify(editedPayslipDocuments) !== JSON.stringify(application.payslip_documents || []) ||
    JSON.stringify(editedBankApplications) !== JSON.stringify(application.bank_applications || []) ||
    JSON.stringify(editedApplicationInfo) !== JSON.stringify(persistedApplicationInfo);

  type DrawerWorkflowAction = {
    key: string;
    label: React.ReactNode;
    accessibleName: string;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
  };
  const workflowActions: DrawerWorkflowAction[] = [];

  if (canApproveCashPurchase) {
    workflowActions.push({
      key: 'approve-cash',
      label: tr('批准现金申请', 'Approve Cash Purchase', "Luluskan Pembelian Tunai"),
      accessibleName: 'Approve Cash Purchase',
      onClick: () => requestWorkflowAction('APPROVE_CASH_PURCHASE')
    });
  }
  if (canSubmitBank) {
    const isResubmission = pendingAction === 'Resubmit to Bank';
    workflowActions.push({
      key: 'submit-bank',
      label: isResubmission
        ? tr('重新提交银行', 'Resubmit to Bank', "Hantar Semula ke Bank")
        : tr('提交银行', 'Submit to Bank', "Hantar ke Bank"),
      accessibleName: isResubmission ? 'Resubmit to Bank' : 'Submit to Bank',
      onClick: () => requestWorkflowAction('SUBMIT_TO_BANK')
    });
  }
  if (canSubmitDocuments) {
    workflowActions.push({
      key: 'documents-ready',
      label: tr('补件已完成', 'Documents Ready', "Dokumen Sedia"),
      accessibleName: 'Documents Ready',
      onClick: () => handleSave('DOCUMENTS_READY'),
      disabled: currentMissingItemLabels.length > 0 || !isBankRequestedDocumentReceived,
      title: !isBankRequestedDocumentReceived
        ? tr(
            `请先上传银行要求的 ${requestedBankDocument?.label || '文件'}`,
            `Upload the bank-requested ${requestedBankDocument?.label || 'document'} first`,
            `Muat naik ${requestedBankDocument?.label || 'dokumen'} yang diminta oleh bank dahulu`
          )
        : currentMissingItemLabels.length > 0
          ? tr(
              `请先补齐：${currentMissingItemLabels.join('、')}`,
              `Complete first: ${currentMissingItemLabels.join(', ')}`,
              `Lengkapkan dahulu: ${currentMissingItemLabels.join(', ')}`
            )
          : undefined
    });
  }
  if (canNotifyAdmin) {
    workflowActions.push({
      key: 'notify-admin',
      label: tr('通知 Admin', 'Notify Admin', "Maklumkan Pentadbir"),
      accessibleName: 'Notify Admin',
      onClick: () => handleSave('NOTIFY_ADMIN'),
      disabled: missingInitialReviewLabels.length > 0,
      title: missingInitialReviewLabels.length > 0
        ? tr(`请先补齐：${missingInitialReviewLabels.join('、')}`, `Complete first: ${missingInitialReviewLabels.join(', ')}`, `Lengkapkan dahulu: ${missingInitialReviewLabels.join(', ')}`)
        : undefined
    });
  }
  if (canCloseRejected) {
    workflowActions.push({
      key: 'close-rejected',
      label: tr('拒贷结案', 'Close Rejected File', "Tutup Fail Ditolak"),
      accessibleName: 'Close Rejected File',
      onClick: () => requestWorkflowAction('CLOSE_REJECTED')
    });
  }
  if (canCompleteApprovedContact) {
    workflowActions.push({
      key: 'complete-contact',
      label: isCashPurchase
        ? tr('客户已接受', 'Customer Accepted', "Pelanggan Menerima")
        : tr('客户已联系', 'Customer Contacted', "Pelanggan Dihubungi"),
      accessibleName: isCashPurchase ? 'Customer Accepted' : 'Customer Contacted',
      onClick: () => requestWorkflowAction('COMPLETE_APPROVED_CONTACT')
    });
  }

  const preferredWorkflowActionKey = canNotifyAdmin
    ? 'notify-admin'
    : canApproveCashPurchase
      ? 'approve-cash'
      : pendingAction === 'Resubmit to Bank' && canSubmitBank
        ? 'submit-bank'
        : pendingAction === 'Provide Documents' && canSubmitDocuments
          ? 'documents-ready'
          : pendingAction === 'Contact Approved Customer' && canCompleteApprovedContact
            ? 'complete-contact'
            : pendingAction === 'Choose Close or Resubmit' && canCloseRejected
              ? 'close-rejected'
              : canSubmitBank
                ? 'submit-bank'
                : canSubmitDocuments
                  ? 'documents-ready'
                  : canCloseRejected
                    ? 'close-rejected'
                    // Cancelling is destructive; it never becomes the primary button.
                    : workflowActions.find((action) => action.key !== 'cancel-application')?.key;
  const primaryWorkflowAction = workflowActions.find((action) => action.key === preferredWorkflowActionKey);
  const secondaryWorkflowActions = workflowActions.filter((action) => action.key !== primaryWorkflowAction?.key);
  const applicationNextStep = (() => {
    if (pendingWith === 'Closed' && application.status === LoanStatus.APPROVE) {
      return {
        label: tr('安排交车', 'Arrange delivery', "Atur serahan"),
        instruction: tr('客户已接受。Admin 下一步需要安排交车。', 'The customer accepted. Admin should arrange delivery next.', "Pelanggan telah menerima. Pentadbir perlu mengatur serahan seterusnya.")
      };
    }

    if (pendingAction === 'Choose Close or Resubmit' && latestRejectedBankApplication) {
      const rejectNextStep = latestRejectedBankApplication.reject_next_step;
      return {
        label: rejectNextStep
          ? rejectNextStepLabel(rejectNextStep)
          : latestRejectedBankApplication.next_action || translatePendingAction(pendingAction),
        instruction: rejectNextStep
          ? rejectNextStepInstruction(rejectNextStep)
          : tr('完成银行注明的下一步；准备好后按 Documents Ready 交回 Admin。', 'Complete the bank’s stated next step, then use Documents Ready when it is ready for Admin.', "Lengkapkan langkah seterusnya yang dinyatakan oleh bank, kemudian gunakan Documents Ready apabila sedia untuk Pentadbir.")
      };
    }

    switch (pendingAction) {
      case 'Complete Application':
        return {
          label: translatePendingAction(pendingAction),
          instruction: tr('检查并补齐客户资料和文件。全部完整后，按 Notify Admin 交给 Admin 审核。', 'Check and complete the customer details and documents. When everything is complete, use Notify Admin for Admin review.', "Semak dan lengkapkan butiran serta dokumen pelanggan. Apabila semuanya lengkap, gunakan Notify Admin untuk semakan Pentadbir.")
        };
      case 'Review Application':
        return {
          label: translatePendingAction(pendingAction),
          instruction: isCashPurchase
            ? tr('检查 IC 和现金购买资料。资料完整就按 Approve Cash Purchase；不需要提交银行。', 'Review the IC and cash purchase details. When complete, use Approve Cash Purchase; no bank submission is required.', "Semak IC dan butiran pembelian tunai. Apabila lengkap, gunakan Approve Cash Purchase; penghantaran bank tidak diperlukan.")
            : tr('检查客户资料与文件。有缺件就在内部对话打开「要求补资料」再发送；完整后新增银行并提交。', 'Review the customer details and documents. For missing items, turn on Request Documents in Internal Chat and send; when complete, add a bank and submit.', "Semak butiran dan dokumen pelanggan. Jika ada kekurangan, hidupkan Minta Dokumen dalam Sembang Dalaman dan hantar; apabila lengkap, tambah bank dan hantar.")
        };
      case 'Provide Documents':
        return {
          label: translatePendingAction(pendingAction),
          instruction: needMoreInfoBank?.next_action
            ? tr(`按银行要求补齐：${needMoreInfoBank.next_action}。完成后按 Documents Ready。`, `Complete the bank request: ${needMoreInfoBank.next_action}. Then use Documents Ready.`, `Lengkapkan permintaan bank: ${needMoreInfoBank.next_action}. Kemudian gunakan Documents Ready.`)
            : tr('补齐银行要求的文件或资料，完成后按 Documents Ready。', 'Complete the documents or details requested by the bank, then use Documents Ready.', "Lengkapkan dokumen atau butiran yang diminta oleh bank, kemudian gunakan Documents Ready.")
        };
      case 'Submit to Bank':
        return {
          label: translatePendingAction(pendingAction),
          instruction: tr('确认银行与申请资料无误，然后按 Submit to Bank。', 'Confirm the bank and application details, then use Submit to Bank.', "Sahkan bank dan butiran permohonan, kemudian gunakan Submit to Bank.")
        };
      case 'Follow Up Bank':
        return {
          label: translatePendingAction(pendingAction),
          instruction: tr(`跟进 ${activeBankApplication?.bank_name || tr('银行', 'the bank', "bank")} 的决定，并在收到结果后更新银行状态。`, `Follow up ${activeBankApplication?.bank_name || 'the bank'} for a decision, then update the bank status when received.`, `Susuli keputusan daripada ${activeBankApplication?.bank_name || 'bank'}, kemudian kemas kini status bank apabila diterima.`)
        };
      case 'Resubmit to Bank':
        return {
          label: translatePendingAction(pendingAction),
          instruction: tr('检查新的银行轮次与资料，然后按 Resubmit to Bank。', 'Review the new bank round and details, then use Resubmit to Bank.', "Semak pusingan bank baharu dan butiran, kemudian gunakan Resubmit to Bank.")
        };
      case 'Contact Approved Customer':
        return {
          label: translatePendingAction(pendingAction),
          instruction: isCashPurchase
            ? tr('联系客户确认接受现金购买，然后按 Customer Accepted。', 'Contact the customer to confirm the cash purchase, then use Customer Accepted.', "Hubungi pelanggan untuk mengesahkan pembelian tunai, kemudian gunakan Customer Accepted.")
            : tr('联系客户确认接受银行方案，然后按 Customer Contacted。', 'Contact the customer to confirm the bank offer, then use Customer Contacted.', "Hubungi pelanggan untuk mengesahkan tawaran bank, kemudian gunakan Customer Contacted.")
        };
      default:
        return {
          label: translatePendingAction(pendingAction),
          instruction: nextActionSummary
        };
    }
  })();
  const showApplicationNextStep = pendingWith !== 'Closed' || application.status === LoanStatus.APPROVE;
  const undoAvailability = getLoanWorkflowUndoAvailability(application, currentStaffName, currentStaffRole);
  const undoCheckpoint = undoAvailability.checkpoint;
  const undoIsTerminal = Boolean(undoCheckpoint && [
    'APPROVE_CASH_PURCHASE',
    'CLOSE_REJECTED',
    'COMPLETE_APPROVED_CONTACT'
  ].includes(undoCheckpoint.action));
  const showUndoControl = Boolean(
    undoCheckpoint &&
    (currentStaffRole === 'Super Admin' || (
      !undoIsTerminal &&
      undoCheckpoint.actor_name === currentStaffName &&
      undoCheckpoint.actor_role === currentStaffRole
    ))
  );
  const undoBlockedMessage = undoAvailability.blockedReason === 'financial_activity'
    ? tr('已产生财务、库存或佣金影响，请先在 Finance Center 冲销。', 'Finance, stock, or commission activity exists. Reverse it in Finance Center first.', "Aktiviti kewangan, stok atau komisen sudah wujud. Balikkan di Pusat Kewangan dahulu.")
    : tr('已有后续流程动作，不能再撤回这一步。', 'A later workflow action exists, so this step can no longer be undone.', "Tindakan aliran kerja seterusnya sudah wujud, jadi langkah ini tidak boleh dibatalkan.");

  const composerChipClass = (active: boolean, tone: 'emerald' | 'indigo' | 'slate' | 'amber') => {
    const activeTone = {
      emerald: 'bg-emerald-600 text-white ring-emerald-600',
      indigo: 'bg-indigo-600 text-white ring-indigo-600',
      slate: 'bg-brand text-white ring-brand',
      amber: 'bg-amber-500 text-white ring-amber-500'
    }[tone];
    return `inline-flex h-6 max-w-[140px] items-center truncate rounded-full px-2 text-micro font-semibold tracking-normal ring-1 transition-colors ${
      active ? activeTone : 'bg-white text-slate-500 ring-slate-200 hover:text-slate-800'
    }`;
  };
  // Compact composer: the note first, then one row of @mention chips, the
  // Request Documents switch and Send. The writer is already shown on each message.
  const activityComposer = (
    <div className="rounded-card border border-slate-200 bg-white p-2.5 focus-within:border-brand-100 focus-within:ring-2 focus-within:ring-brand-50">
      {requestDocumentsInChat && canRequestDocuments && (
        <p data-testid="activity-request-documents-hint" className="mb-2 rounded-control bg-amber-50 px-3 py-2 text-caption text-amber-800">
          {missingDocumentLabels.length > 0
            ? tr(
              `发送后这一单交回 ${application?.handler_name || 'Sales'} 补资料（Pending · Provide Documents）。缺：${missingDocumentLabels.join('、')}`,
              `Sending hands the file back to ${application?.handler_name || 'Sales'} for documents (Pending · Provide Documents). Missing: ${missingDocumentLabels.join(', ')}`,
              `Menghantar akan memulangkan fail kepada ${application?.handler_name || 'Sales'} untuk dokumen (Pending · Provide Documents). Kurang: ${missingDocumentLabels.join(', ')}`
            )
            : tr('先在申请资料把缺少的文件标成 Missing。', 'Mark the missing documents as Missing in Application first.', 'Tandakan dokumen yang kurang sebagai Hilang dalam Permohonan dahulu.')}
        </p>
      )}
      <textarea
        value={activityDraft}
        onChange={(event) => setActivityDraft(event.target.value)}
        onKeyDown={handleActivityDraftKeyDown}
        rows={2}
        placeholder="Write internal note, customer decision, missing info, or tag admin for help..."
        className="w-full resize-none rounded-control bg-transparent px-1.5 py-1 text-footnote text-slate-700 outline-none placeholder:text-slate-400"
      />
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-micro font-semibold uppercase text-slate-400">{tr('通知', 'Notify', 'Maklum')}</span>
        {canTagAssignedHandler && (
          <button
            type="button"
            onClick={() => setTagHandler((current) => !current)}
            aria-pressed={tagHandler}
            aria-label={`Tag assigned handler ${assignedHandlerAccount?.name || application?.handler_name || ''}`}
            title={`@Handler · ${assignedHandlerAccount?.name || application?.handler_name || ''}`}
            className={composerChipClass(tagHandler, 'emerald')}
          >
            @{assignedHandlerAccount?.name || application?.handler_name || 'Handler'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setTagAdmin((current) => !current)}
          aria-pressed={tagAdmin}
          className={composerChipClass(tagAdmin, 'indigo')}
        >
          @Admin
        </button>
        <button
          type="button"
          onClick={() => setTagSuperAdmin((current) => !current)}
          aria-pressed={tagSuperAdmin}
          className={composerChipClass(tagSuperAdmin, 'slate')}
        >
          @Super Admin
        </button>
        {canRequestDocuments && (
          <button
            type="button"
            data-testid="activity-request-documents-toggle"
            onClick={() => setRequestDocumentsInChat((current) => !current)}
            aria-pressed={requestDocumentsInChat}
            className={composerChipClass(requestDocumentsInChat, 'amber')}
          >
            {tr('要求补资料', 'Request Documents', 'Minta Dokumen')}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmitActivityComment}
          disabled={requestDocumentsInChat && canRequestDocuments
            ? isSubmitting || missingDocumentLabels.length === 0
            : !activityDraft.trim()}
          aria-label={requestDocumentsInChat && canRequestDocuments ? 'Request Documents & send' : 'Add comment'}
          className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control bg-brand px-3 text-callout text-white transition-colors hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-500"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          {requestDocumentsInChat && canRequestDocuments
            ? tr('补资料并发送', 'Request & send', 'Minta & hantar')
            : tr('发送', 'Send', 'Hantar')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            id="drawer-backdrop"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-pointer bg-slate-950 opacity-35 transition-opacity duration-300"
          />

          {/* Sliding Side Panel Drawer */}
          <div
            id="detail-drawer"
            data-dce-scope=""
            data-dce-copy-on-single-click=""
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-5xl flex-col border-l border-slate-100 bg-white shadow-e3 transition-transform duration-300 ease-out"
          >
            {/* Header section with status banner */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-micro uppercase text-slate-500">
                  {tr('申请详情', 'Application Detail', "Butiran Permohonan")}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {/* The applicant is the subject of this whole workspace, so it takes
                      the drawer title style rather than the section-heading one. */}
                  <h2 className="truncate text-title-2 text-slate-900">{application.applicant_name}</h2>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-caption font-semibold ${editedStatusConfig.bg} ${editedStatusConfig.text} ${editedStatusConfig.border}`}>
                    {trLoanStatus(editedStatus)}
                  </span>
                </div>
                <p className="mt-1 truncate text-footnote text-slate-500">
                  <span className="font-mono">{application.id}</span>
                  <span aria-hidden="true"> · </span>
                  {editedApplicationInfo.vehicle_model || tr('未选择车辆', 'No vehicle selected', "Tiada kenderaan dipilih")}
                </p>
                <p className="mt-2 hidden text-caption text-slate-500 sm:block">
                  {canEditAllInformation
                    ? tr('单击复制 · 双击编辑字段', 'Click to copy · double-click to edit fields', "Klik untuk menyalin · klik dua kali untuk mengedit medan")
                    : tr('单击字段即可复制', 'Click a field to copy', "Klik medan untuk menyalin")}
                </p>
              </div>
              <button
                id="close-drawer-btn"
                onClick={onClose}
                aria-label={tr('关闭申请详情', 'Close application detail', "Tutup butiran permohonan")}
                className="mt-1 rounded-control p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
              <div className="flex min-w-max items-center justify-between gap-3">
              {activeDetailTab === 'bank' ? (
                <div className="flex items-center gap-3" data-testid="bank-page-header">
                  <button
                    type="button"
                    data-testid="bank-page-back"
                    onClick={() => setActiveDetailTab('basic')}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-control bg-slate-50 px-3 py-2 text-callout text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    {tr('申请详情', 'Application Detail', 'Butiran Permohonan')}
                  </button>
                  <span className="inline-flex items-center gap-2 text-headline text-slate-800">
                    <Landmark aria-hidden="true" className="h-5 w-5 text-brand" strokeWidth={1.75} />
                    {tr('银行', 'Banks', 'Bank')}
                  </span>
                </div>
              ) : (
              <div className="flex items-center gap-2" role="tablist" aria-label="Application detail sections">
                <button
                  id="detail-tab-basic"
                  type="button"
                  role="tab"
                  aria-selected={activeDetailTab === 'basic'}
                  aria-controls="detail-panel-basic"
                  data-testid="detail-tab-basic"
                  onClick={() => {
                    setAdminSubmissionView(false);
                    setActiveDetailTab('basic');
                  }}
                  aria-label={tr('申请与文件', 'Application and documents', "Permohonan dan dokumen")}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-control px-3 py-2 text-callout transition-colors ${
                    activeDetailTab === 'basic'
                      ? 'bg-brand text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <UserRound aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                  {tr('申请资料', 'Application', "Permohonan")}
                </button>
              </div>
              )}
              {activeDetailTab !== 'bank' && hasAdminWorkAccess(currentStaffRole) && isLoanPurchase && (
                <button
                  type="button"
                  data-testid="admin-submission-filter"
                  aria-pressed={adminSubmissionView}
                  onClick={() => {
                    setActiveDetailTab('basic');
                    setAdminSubmissionView((current) => !current);
                    detailContentRef.current?.scrollTo({ top: 0 });
                  }}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-control px-3 py-2 text-callout transition-colors ${
                    adminSubmissionView
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  {adminSubmissionView
                    ? tr('显示完整资料', 'Show Full Details', "Tunjukkan Butiran Penuh")
                    : tr('银行表格筛选', 'Bank Form Filter', "Penapis Borang Bank")}
                </button>
              )}
              </div>
            </div>

            {/* Scrollable details form */}
            <div ref={detailContentRef} data-testid="detail-scroll-container" className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-none sm:p-6">
              {riskFlags.length > 0 && (
                <div className={`${adminSubmissionView ? 'hidden' : ''} rounded-card border border-amber-100 bg-amber-50/70 p-4`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-white text-amber-600 ring-1 ring-amber-100">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-headline text-amber-800">{tr('风控提醒', 'Risk Control Warning', "Amaran Kawalan Risiko")}</p>
                      <div className="mt-2 space-y-1">
                        {riskFlags.map((flag) => (
                          <p key={`${flag.field}-${flag.value}`} className="text-footnote leading-relaxed text-amber-800">
                            {tr(`${flag.label} 与 ${flag.matching_applicant_names.map((name, index) => `${name} (${flag.matching_application_ids[index]})`).join(', ')} 重复`, `${flag.label} duplicated with ${flag.matching_applicant_names.map((name, index) => `${name} (${flag.matching_application_ids[index]})`).join(', ')}`, `${flag.label} diduakan dengan ${flag.matching_applicant_names.map((name, index) => `${name} (${flag.matching_application_ids[index]})`).join(', ')}`)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {rawMatches.length > 0 && (
                <div className={`${adminSubmissionView ? 'hidden' : ''} rounded-card border border-blue-100 bg-blue-50/70 p-4`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-white text-blue-600 ring-1 ring-blue-100">
                      <Database className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-headline text-blue-900">{tr('潜在客户关系', 'Lead Relationship', "Perhubungan prospek")}</p>
                      <div className="mt-2 space-y-2">
                        {rawMatches.slice(0, 5).map((match) => (
                          <div key={`${match.raw_customer_id}-${match.customer_id}`} className="rounded-control bg-white/80 px-3 py-2">
                            <p className="truncate text-footnote font-semibold text-slate-800" title={match.raw_customer_name}>
                              {tr(`${match.raw_customer_name} 来自 ${match.raw_customer_channel}`, `${match.raw_customer_name} from ${match.raw_customer_channel}`, `${match.raw_customer_name} daripada ${match.raw_customer_channel}`)}
                            </p>
                            <p className="mt-1 truncate font-mono text-caption text-slate-500">
                              {match.raw_customer_lead_id || match.raw_customer_id} / {match.raw_customer_phone || '--'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {match.matched_fields.map((field) => (
                                <span key={field} className="rounded-full bg-blue-100 px-2 py-0.5 text-micro uppercase text-blue-700">
                                  {RAW_MATCH_FIELD_LABELS[field]}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {rawMatches.length > 5 && (
                          <p className="text-caption text-blue-700">{tr(`还有 ${rawMatches.length - 5} 个潜在名单匹配`, `+${rawMatches.length - 5} more raw customer matches`, `+${rawMatches.length - 5} lagi padanan pelanggan mentah`)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <section data-testid="current-action-panel" className={`${adminSubmissionView ? 'hidden' : ''} overflow-hidden rounded-card border ${currentActionTone}`}>
                <div className="flex items-center justify-between gap-3 border-b border-white/80 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white shadow-e1 ${isCurrentActionOverdue ? 'text-rose-600' : pendingWith === 'Closed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <CalendarClock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-micro uppercase text-slate-500">{tr('当前行动', 'Current Action', "Tindakan Semasa")}</p>
                      <div className="mt-0.5 flex min-w-0 items-center gap-2">
                        <p className="truncate text-headline text-slate-900">{translatePendingAction(pendingAction)}</p>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <p className="truncate text-footnote text-slate-600">{pendingOwner}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isCurrentActionOverdue && (
                      <span className="rounded-chip bg-rose-100 px-2 py-1 text-micro uppercase text-rose-700">{tr('已逾期', 'Overdue', "Tertunggak")}</span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-chip bg-white px-2 py-1 text-caption font-semibold text-slate-700 ring-1 ring-slate-100">
                      <span className={`h-2 w-2 rounded-full ${editedStatusConfig.dot}`} />
                      {trLoanStatus(editedStatus)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 bg-white/60 xl:grid-cols-4">
                  <div className="border-b border-r border-white px-4 py-3 xl:border-b-0">
                    <p className="text-micro uppercase text-slate-500">{tr('当前负责人', 'Pending With', "Menunggu Dengan")}</p>
                    <p className="mt-1 truncate text-headline text-slate-800">{pendingOwner}</p>
                    <p className="mt-0.5 text-caption text-slate-500">{pendingWith}</p>
                  </div>
                  <div className="border-b border-white px-4 py-3 xl:border-b-0 xl:border-r">
                    <p className="text-micro uppercase text-slate-500">Handler</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-headline text-slate-800"><UserRound className="h-3.5 w-3.5 shrink-0 text-slate-500" />{application.handler_name}</p>
                    <p className="mt-0.5 text-caption text-slate-500">{application.handler_role}</p>
                  </div>
                  <div className="border-r border-white px-4 py-3">
                    <p className="text-micro uppercase text-slate-500">
                      {isCashPurchase ? tr('购买方式', 'Purchase Method', "Kaedah Pembelian") : tr('当前银行', 'Current Bank', "Bank Semasa")}
                    </p>
                    {isCashPurchase ? (
                      <div className="mt-1">
                        <p className="text-headline text-slate-800">{tr('现金', 'Cash', "Tunai")}</p>
                        <p className="text-caption text-emerald-600">{tr('无需银行', 'No bank required', "Bank tidak diperlukan")}</p>
                      </div>
                    ) : activeBankApplication ? (
                      <div className="mt-1 flex min-w-0 items-center gap-2">
                        <BankIcon bankName={activeBankApplication.bank_name} bankDefinitions={bankDefinitions} status={activeBankApplication.status} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-headline text-slate-800">{activeBankApplication.bank_name}</p>
                          <p className="text-caption text-slate-500">{trBankStatus(activeBankApplication.status)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-callout text-slate-500">{tr('尚未选择', 'Not selected', "Belum dipilih")}</p>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-micro uppercase text-slate-500">{tr('截止时间', 'Due Date', "Tarikh Akhir")}</p>
                    <p className={`mt-1 font-mono text-headline ${isCurrentActionOverdue ? 'text-rose-700' : 'text-slate-800'}`}>
                      {currentActionDueAt ? formatTimelineDate(currentActionDueAt) : tr('未安排', 'Not scheduled', "Belum dijadualkan")}
                    </p>
                    <p className="mt-0.5 text-caption text-slate-500">{application.pending_since ? `${tr('开始', 'Since', "Sejak")} ${formatTimelineDate(application.pending_since)}` : '--'}</p>
                  </div>
                </div>

                <div className="border-t border-white bg-white/80 px-4 py-4">
                  {showApplicationNextStep ? (
                    <div data-testid="application-next-step" className="rounded-card border border-amber-200 bg-amber-50 p-3.5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-amber-500 text-white shadow-e1">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-micro uppercase tracking-[0.16em] text-amber-700">{tr('下一步', 'Next step', "Langkah seterusnya")}</p>
                          <p className="mt-0.5 text-headline text-slate-900">{applicationNextStep.label}</p>
                          <p className="mt-1 text-footnote leading-relaxed text-slate-700">{applicationNextStep.instruction}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-card border border-slate-100 bg-slate-50 px-3.5 py-3">
                      <p className="text-micro uppercase text-slate-500">{tr('下一步说明', 'Next Action Detail', "Butiran Tindakan Seterusnya")}</p>
                      <p className="mt-1 text-footnote leading-relaxed text-slate-700">{applicationNextStep.instruction}</p>
                    </div>
                  )}

                  {currentMissingItemLabels.length > 0 ? (
                    <div data-testid="application-missing-checklist" className="mt-3 rounded-card border border-rose-100 bg-rose-50/40 px-3.5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-headline text-rose-800">
                            {tr('缺失项目', 'Missing items', "Item yang hilang")}
                          </h3>
                          <p className="mt-0.5 text-caption text-rose-600">
                            {tr('点击项目可前往对应资料区', 'Select an item to open its section.', "Pilih item untuk membuka bahagiannya.")}
                          </p>
                        </div>
                        <span className="inline-flex min-w-6 items-center justify-center rounded-chip bg-rose-100 px-1.5 py-0.5 text-micro tracking-normal text-rose-700">
                          {currentMissingItemLabels.length}
                        </span>
                      </div>
                      <ul data-testid="application-missing-items-grid" className="mt-2 grid grid-cols-1 gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
                        {currentMissingItemLabels.map((label) => (
                          <li key={label} className="min-w-0 border-b border-rose-100/80">
                            <button
                              type="button"
                              onClick={() => navigateToMissingItem(label)}
                              aria-label={tr(`前往缺失项目：${label}`, `Go to missing item: ${label}`, `Pergi ke item hilang: ${label}`)}
                              className="group flex w-full min-w-0 items-start gap-2 rounded-chip px-1 py-2 text-left text-caption font-semibold leading-snug text-rose-700 transition-colors hover:bg-rose-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                            >
                              <Square className="mt-px h-3.5 w-3.5 shrink-0 text-rose-400" aria-hidden="true" />
                              <span className="min-w-0 flex-1 break-words">
                                {tr('缺少', 'Missing', "Hilang")} · {label}
                              </span>
                              <ArrowRight className="mt-px h-3.5 w-3.5 shrink-0 text-rose-300 transition-transform group-hover:translate-x-0.5 group-hover:text-rose-500" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <span className="rounded-chip bg-emerald-50 px-2 py-1 text-caption font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        {pendingAction === 'Complete Application'
                          ? tr('申请资料齐全', 'Application complete', "Permohonan lengkap")
                          : tr('资料齐全', 'Documents complete', "Dokumen lengkap")}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {activeDetailTab === 'basic' && (
              <div id="detail-panel-basic" role="tabpanel" aria-labelledby="detail-tab-basic" data-testid="detail-panel-basic" className="flex flex-col gap-6">
              {adminSubmissionView && (
                <div data-testid="admin-submission-view" className="order-2 scroll-mt-6 space-y-5">
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-headline text-slate-900">{tr('银行提交资料', 'Bank Submission Information', "Maklumat Penghantaran Bank")}</h3>
                      <p className="mt-0.5 text-caption text-slate-500">
                        {tr('仅显示填写银行表格所需的资料。', 'Only the fields needed to prepare the bank form are shown.', "Hanya medan untuk menyediakan borang bank ditunjukkan.")}
                      </p>
                    </div>
                    <span className="text-caption text-indigo-600">
                      {tr('单击复制 · 双击编辑', 'Click to copy · double-click to edit', "Klik untuk salin · klik dua kali untuk edit")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col">
                      <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('customerName')}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.applicant_name} onCommit={(value) => updateApplicationInfo('applicant_name', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} ariaLabel={canEditAllInformation ? 'Update bank form customer name' : 'Copy bank form customer name'} />
                    </div>

                    <div className="flex flex-col">
                      <span className="mb-1 inline-flex items-center gap-1 text-micro uppercase text-slate-500">{fieldLabel('icNumber')}{renderRiskIcon('ic_no')}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.ic_no} onCommit={(value) => updateApplicationInfo('ic_no', value)} displayClassName={`${detailDisplayClass} font-mono`} inputClassName={`${detailInputClass} font-mono`} ariaLabel={canEditAllInformation ? 'Update bank form IC number' : 'Copy bank form IC number'} />
                    </div>

                    <div className="flex flex-col">
                      <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('dateOfBirth')}</span>
                      <DoubleClickEditField copyOnly value={detectedBirthDate} onCommit={() => undefined} displayClassName={`${detailDisplayClass} font-mono`} inputClassName={detailInputClass} emptyText={tr('无法从 IC 识别', 'Not detected from IC', "Tidak dikesan daripada IC")} ariaLabel="Copy bank form date of birth" />
                    </div>

                    <div className="flex flex-col">
                      <span className="mb-1 inline-flex items-center gap-1 text-micro uppercase text-slate-500">{fieldLabel('email')}{renderRiskIcon('email')}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} type="email" value={editedApplicationInfo.personal_info?.email || ''} onCommit={(value) => updatePersonalInfo('email', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update bank form email' : 'Copy bank form email'} />
                    </div>

                    <div className="flex flex-col">
                      <span className="mb-1 inline-flex items-center gap-1 text-micro uppercase text-slate-500">{fieldLabel('phoneNumber')}{renderRiskIcon('phone_no')}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} copyValue={formatMalaysiaPhoneForCopy(editedApplicationInfo.phone_no)} type="tel" value={editedApplicationInfo.phone_no} onCommit={(value) => updateApplicationInfo('phone_no', value)} displayClassName={`${detailDisplayClass} font-mono`} inputClassName={`${detailInputClass} font-mono`} ariaLabel={canEditAllInformation ? 'Update bank form phone number' : 'Copy bank form phone number'} />
                    </div>

                    {[
                      { label: tr('每月总薪资', 'Gross Monthly Salary', "Gaji Bulanan Kasar"), field: 'gross_monthly_salary' as const, value: editedApplicationInfo.employment_details?.gross_monthly_salary || '' },
                      { label: tr('每月净薪资', 'Net Monthly Salary', "Gaji Bulanan Bersih"), field: 'net_monthly_salary' as const, value: editedApplicationInfo.employment_details?.net_monthly_salary || '' }
                    ].map((item) => (
                      <div key={item.field} className="flex flex-col">
                        <span className="mb-1 text-micro uppercase text-slate-500">{item.label}</span>
                        <DoubleClickEditField copyOnly={!canEditAllInformation} value={item.value} onCommit={(value) => updateEmploymentDetails(item.field, value)} normalizeValue={normalizeDecimalInput} placeholder="RM 0.00" displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} formatDisplay={(value) => value ? `RM ${value}` : tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} bank form ${item.label}`} />
                      </div>
                    ))}

                    <div className="flex flex-col md:col-span-2">
                      <span className="mb-1 text-micro uppercase text-slate-500">{tr('主要车辆选择', 'Primary Vehicle Choice', "Pilihan Kenderaan Utama")}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} value={primaryVehicleOption?.vehicle_model || ''} onCommit={(value) => updateVehicleOption(0, 'vehicle_model', value)} suggestions={vehicleModelSuggestions} commitOnSuggestionMatch displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update bank form primary vehicle choice' : 'Copy bank form primary vehicle choice'} />
                    </div>
                  </div>

                  <div className="rounded-card border border-indigo-100 bg-indigo-50/40 p-4">
                    <p className="mb-3 text-micro uppercase text-indigo-600">{tr('贷款单位资料', 'Loan Unit Details', "Butiran Unit Pinjaman")}</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {[
                        { label: fieldLabel('sellingPrice'), field: 'motor_selling_price' as const, value: primaryVehicleOption?.motor_selling_price || '' },
                        { label: fieldLabel('deposit'), field: 'deposit' as const, value: primaryVehicleOption?.deposit || '' },
                        { label: tr('现金总价', 'Total Cash Price', "Jumlah Harga Tunai"), field: 'total_cash_price' as const, value: primaryVehicleOption?.total_cash_price || '' }
                      ].map((item) => (
                        <div key={item.field} className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{item.label}</span>
                          <DoubleClickEditField copyOnly={!canEditAllInformation} value={item.value} onCommit={(value) => updateVehicleOption(0, item.field, value)} normalizeValue={normalizeDecimalInput} placeholder="RM 0.00" displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} formatDisplay={(value) => value ? `RM ${value}` : tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} bank form ${item.label}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col">
                      <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('loanTenureYears')}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} mode="select" value={editedApplicationInfo.preferences?.loan_tenure || ''} options={[{ value: '', label: tr('未设置', 'Not set', "Belum ditetapkan") }, ...LOAN_TENURE_OPTIONS.map((year) => ({ value: year, label: `${year} years` }))]} onCommit={(value) => updatePreferences('loan_tenure', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update bank form tenure' : 'Copy bank form tenure'} />
                    </div>

                    {[
                      { label: tr('性别', 'Gender', "Jantina"), field: 'gender' as const, value: editedApplicationInfo.personal_info?.gender || '', options: GENDER_OPTIONS },
                      { label: tr('种族', 'Race', "Bangsa"), field: 'race' as const, value: editedApplicationInfo.personal_info?.race || '', options: RACE_OPTIONS },
                      { label: tr('居住身份', 'Residency Status', "Status Kediaman"), field: 'housing_status' as const, value: editedApplicationInfo.personal_info?.housing_status || '', options: HOUSING_STATUS_OPTIONS },
                      { label: tr('婚姻状况', 'Marital Status', "Status Perkahwinan"), field: 'marital_status' as const, value: editedApplicationInfo.personal_info?.marital_status || '', options: MARITAL_STATUS_OPTIONS }
                    ].map((item) => (
                      <div key={item.field} className="flex flex-col">
                        <span className="mb-1 text-micro uppercase text-slate-500">{item.label}</span>
                        <DoubleClickEditField copyOnly={!canEditAllInformation} mode="select" value={item.value} options={item.options.map((option) => ({ value: option, label: option || tr('未设置', 'Not set', "Belum ditetapkan") }))} onCommit={(value) => updatePersonalInfo(item.field, value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} bank form ${item.label}`} />
                      </div>
                    ))}
                    {hasChildrenQuestion(editedApplicationInfo.personal_info?.marital_status) && (
                      <div className="flex flex-col" data-testid="application-number-of-children">
                        <span className="mb-1 text-micro uppercase text-slate-500">{tr('孩子数量', 'Number of Children', "Bilangan Anak")}</span>
                        <DoubleClickEditField copyOnly={!canEditAllInformation} value={getEffectiveNumberOfChildren(editedApplicationInfo.personal_info)} onCommit={(value) => updatePersonalInfo('number_of_children', value)} normalizeValue={(value) => value.replace(/\D/g, '').slice(0, 2)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update bank form number of children' : 'Copy bank form number of children'} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Customer Profile Segment */}
              <div id="detail-basic-customer-info" data-testid="detail-basic-customer-info" className={`${adminSubmissionView ? 'hidden' : ''} ${isLoanPurchase ? 'order-3' : 'order-2'} scroll-mt-6 space-y-4`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-headline text-slate-900">{tr('客户基本与个人资料', 'Basic Customer & Personal Information', "Maklumat Asas Pelanggan & Peribadi")}</h3>
                  <span className="text-caption text-slate-500">{tr('与客户申请表使用相同资料', 'Aligned with the customer application form', 'Diselaraskan dengan borang permohonan pelanggan')}</span>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col">
                    <span className="text-micro uppercase text-slate-500st mb-1">{tr('ID 标识', 'ID', "ID")}</span>
                    <DoubleClickEditField
                      copyOnly
                      value={application.id}
                      onCommit={() => undefined}
                      displayClassName="text-left text-body font-mono font-semibold text-slate-800"
                      inputClassName={`${detailInputClass} font-mono`}
                      ariaLabel="Copy application ID"
                    />
                  </div>
                  {canEditAllInformation && (
                    <span className="inline-flex self-start rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-micro uppercase text-indigo-600">
                      {currentStaffRole === 'Super Admin'
                        ? tr('Super Admin 可编辑', 'Super Admin editable', "Super Admin boleh mengedit")
                        : tr('Handler 可编辑', 'Handler editable', "Pengendali boleh mengedit")}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                  <div className="flex flex-col">
                    <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('customerName')}</span>
                    <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.applicant_name} onCommit={(value) => updateApplicationInfo('applicant_name', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} ariaLabel={canEditAllInformation ? 'Update customer name' : 'Copy customer name'} />
                  </div>

                  <div className="flex flex-col">
                    <span className="mb-1 inline-flex items-center gap-1 text-micro uppercase text-slate-500">{fieldLabel('icNumber')}{renderRiskIcon('ic_no')}</span>
                    <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.ic_no} onCommit={(value) => updateApplicationInfo('ic_no', value)} displayClassName={`${detailDisplayClass} font-mono`} inputClassName={`${detailInputClass} font-mono`} ariaLabel={canEditAllInformation ? 'Update IC number' : 'Copy IC number'} />
                  </div>

                  <div className="flex flex-col">
                    <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabelWith('dateOfBirth', FROM_IC)}</span>
                    <DoubleClickEditField copyOnly value={detectedBirthDate} onCommit={() => undefined} displayClassName={`${detailDisplayClass} font-mono`} inputClassName={detailInputClass} emptyText={tr('无法从 IC 识别', 'Not detected from IC', "Tidak dikesan daripada IC")} ariaLabel="Date of birth" />
                  </div>

                  <div className="flex flex-col">
                    <span className="mb-1 inline-flex items-center gap-1 text-micro uppercase text-slate-500">{fieldLabel('email')}{renderRiskIcon('email')}</span>
                    <DoubleClickEditField copyOnly={!canEditAllInformation} type="email" value={editedApplicationInfo.personal_info?.email || ''} onCommit={(value) => updatePersonalInfo('email', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update email' : 'Copy email'} />
                  </div>

                  <div className="flex flex-col md:col-span-2" data-testid="application-phone-row">
                    <span className="mb-1 inline-flex items-center gap-1 text-micro uppercase text-slate-500">{fieldLabel('phoneNumber')}{renderRiskIcon('phone_no')}</span>
                    <DoubleClickEditField copyOnly={!canEditAllInformation} copyValue={formatMalaysiaPhoneForCopy(editedApplicationInfo.phone_no)} type="tel" value={editedApplicationInfo.phone_no} onCommit={(value) => updateApplicationInfo('phone_no', value)} displayClassName={`${detailDisplayClass} font-mono`} inputClassName={`${detailInputClass} font-mono`} ariaLabel={canEditAllInformation ? 'Update phone number' : 'Copy phone number'} />
                  </div>

                  <div className="flex flex-col">
                    <span className="mb-1 text-micro uppercase text-slate-500">{tr('主要车辆选择', 'Primary Vehicle Choice', "Pilihan Kenderaan Utama")}</span>
                    <DoubleClickEditField copyOnly={!canEditAllInformation} value={primaryVehicleOption?.vehicle_model || ''} onCommit={(value) => updateVehicleOption(0, 'vehicle_model', value)} suggestions={vehicleModelSuggestions} commitOnSuggestionMatch displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update primary vehicle choice' : 'Copy primary vehicle choice'} />
                  </div>

                  <div className="flex flex-col">
                    <span className="mb-1 text-micro uppercase text-slate-500">{tr('购买方式', 'Purchase Method', "Kaedah Pembelian")}</span>
                    <DoubleClickEditField copyOnly={!canEditAllInformation} mode="select" value={primaryVehicleOption?.purchase_method || ''} options={[{ value: '', label: 'Not set' }, ...PURCHASE_METHOD_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))]} onCommit={(value) => updateVehicleOption(0, 'purchase_method', value as PurchaseMethod)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update primary vehicle purchase method' : 'Copy primary vehicle purchase method'} />
                  </div>
                </div>

                {primaryVehicleOption?.purchase_method === 'Cash' && (
                  <div className="rounded-card border border-emerald-100 bg-emerald-50/40 p-4">
                    <p className="mb-3 text-micro uppercase text-emerald-700">
                      {tr('现金购买资料', 'Cash Purchase Details', "Butiran Pembelian Tunai")}
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                      {[
                        { label: tr('现金总价', 'Total Cash Price', "Jumlah Harga Tunai"), field: 'total_cash_price' as const, value: primaryVehicleOption.total_cash_price || '', prefix: 'RM' }
                      ].map((item) => (
                        <div key={item.field} className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{item.label}</span>
                          <DoubleClickEditField copyOnly={!canEditAllInformation} value={item.value} onCommit={(value) => updateVehicleOption(0, item.field, value)} normalizeValue={normalizeDecimalInput} placeholder={item.prefix === 'RM' ? 'RM 0.00' : '0.00%'} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} formatDisplay={(value) => value ? `${item.prefix} ${value}` : tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} ${item.label}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {isLoanPurchase && (
                    <>
                    {[
                      { label: tr('性别', 'Gender', "Jantina"), field: 'gender' as const, value: editedApplicationInfo.personal_info?.gender || '', options: GENDER_OPTIONS },
                      { label: tr('种族', 'Race', "Bangsa"), field: 'race' as const, value: editedApplicationInfo.personal_info?.race || '', options: RACE_OPTIONS },
                      { label: tr('住房状况', 'Housing Status', "Status Kediaman"), field: 'housing_status' as const, value: editedApplicationInfo.personal_info?.housing_status || '', options: HOUSING_STATUS_OPTIONS },
                      { label: tr('婚姻状况', 'Marital Status', "Status Perkahwinan"), field: 'marital_status' as const, value: editedApplicationInfo.personal_info?.marital_status || '', options: MARITAL_STATUS_OPTIONS }
                    ].map((item) => (
                      <div key={item.field} className="flex flex-col">
                        <span className="mb-1 text-micro uppercase text-slate-500">{item.label}</span>
                        <DoubleClickEditField copyOnly={!canEditAllInformation} mode="select" value={item.value} options={item.options.map((option) => ({ value: option, label: option || 'Not set' }))} onCommit={(value) => updatePersonalInfo(item.field, value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} ${item.label}`} />
                      </div>
                    ))}
                    {hasChildrenQuestion(editedApplicationInfo.personal_info?.marital_status) && (
                      <div className="flex flex-col" data-testid="application-number-of-children">
                        <span className="mb-1 text-micro uppercase text-slate-500">{tr('孩子数量', 'Number of Children', "Bilangan Anak")}</span>
                        <DoubleClickEditField copyOnly={!canEditAllInformation} value={getEffectiveNumberOfChildren(editedApplicationInfo.personal_info)} onCommit={(value) => updatePersonalInfo('number_of_children', value)} normalizeValue={(value) => value.replace(/\D/g, '').slice(0, 2)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update number of children' : 'Copy number of children'} />
                      </div>
                    )}
                    {(() => {
                      const residenceStartYear = editedApplicationInfo.personal_info?.residence_start_year || '';
                      const residenceStartMonth = editedApplicationInfo.personal_info?.residence_start_month || '';
                      const residenceDuration = getEmploymentDuration(residenceStartYear, residenceStartMonth);
                      const yearsAtResidence = editedApplicationInfo.personal_info?.years_at_residence || '';
                      return (
                        <div className="flex flex-col" data-testid="residence-start">
                          <span className="mb-1 text-micro uppercase text-slate-500">{tr('在现址住了多久（年 / 月）', 'Lived Here (Years / Months)', "Tempoh Menetap (Tahun / Bulan)")}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <DoubleClickEditField
                              copyOnly={!canEditAllInformation}
                              value={residenceDuration ? String(residenceDuration.years) : ''}
                              onCommit={(value) => updateResidenceDuration('years', value)}
                              normalizeValue={(value) => value.replace(/\D/g, '').slice(0, 2)}
                              displayClassName={detailDisplayClass}
                              inputClassName={detailInputClass}
                              emptyText={tr('年数', 'Years', "Tahun")}
                              formatDisplay={(value) => value ? tr(`${value} 年`, `${value} yrs`, `${value} thn`) : tr('年数', 'Years', "Tahun")}
                              ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} Years at Residence`}
                            />
                            <DoubleClickEditField
                              copyOnly={!canEditAllInformation}
                              value={residenceDuration ? String(residenceDuration.months) : ''}
                              onCommit={(value) => updateResidenceDuration('months', value)}
                              normalizeValue={(value) => {
                                const digits = value.replace(/\D/g, '').slice(0, 2);
                                return digits === '' ? '' : String(Math.min(Number(digits), 11));
                              }}
                              displayClassName={detailDisplayClass}
                              inputClassName={detailInputClass}
                              emptyText={tr('月数', 'Months', "Bulan")}
                              formatDisplay={(value) => value ? tr(`${value} 个月`, `${value} mths`, `${value} bln`) : tr('月数', 'Months', "Bulan")}
                              ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} Months at Residence`}
                            />
                          </div>
                          <span className="mt-1 text-caption text-slate-500" data-testid="residence-duration">
                            {residenceDuration
                              ? tr(
                                `约 ${residenceStartYear} 年 ${residenceStartMonth} 月搬入`,
                                `Moved in around ${residenceStartMonth}/${residenceStartYear}`,
                                `Mula menetap sekitar ${residenceStartMonth}/${residenceStartYear}`
                              )
                              : yearsAtResidence
                                ? tr(`居住年数：${yearsAtResidence} 年`, `Years at Residence: ${yearsAtResidence}`, `Tempoh Menetap: ${yearsAtResidence} tahun`)
                                : tr('填住了几年几个月', 'Enter years and months lived here', "Isi berapa tahun dan bulan menetap")}
                          </span>
                        </div>
                      );
                    })()}
                    </>
                  )}
                    <div className="flex flex-col md:col-span-2" data-testid="application-permanent-address">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-micro uppercase text-slate-500">{tr('永久地址（IC）', 'Permanent Address (IC)', "Alamat Tetap (IC)")}</span>
                        {editedApplicationInfo.personal_info?.full_address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(editedApplicationInfo.personal_info.full_address)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-caption font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            Search Google Maps
                          </a>
                        )}
                      </div>
                      <DoubleClickEditField
                        copyOnly={!canEditAllInformation}
                        mode="textarea"
                        rows={2}
                        value={editedApplicationInfo.personal_info?.full_address || ''}
                        onCommit={(value) => updatePersonalInfo('full_address', value)}
                        displayClassName={`${detailDisplayClass} text-left whitespace-pre-wrap`}
                        inputClassName={detailInputClass}
                        emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                        ariaLabel={canEditAllInformation ? 'Update permanent address (IC)' : 'Copy permanent address (IC)'}
                      />
                    </div>
                    <div className="flex flex-col md:col-span-2" data-testid="application-resident-address">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-micro uppercase text-slate-500">{tr('居住地址', 'Resident Address', "Alamat Kediaman")}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {canEditAllInformation && (
                            <button
                              type="button"
                              onClick={() => updatePersonalInfo('resident_address', editedApplicationInfo.personal_info?.full_address || '')}
                              className="rounded-chip bg-slate-100 px-2 py-1 text-micro tracking-normal text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                            >
                              {tr('与永久地址（IC）相同', 'Same as Permanent Address (IC)', 'Sama seperti Alamat Tetap (IC)')}
                            </button>
                          )}
                          {editedApplicationInfo.personal_info?.resident_address && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(editedApplicationInfo.personal_info.resident_address)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-caption font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              Search Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                      <DoubleClickEditField
                        copyOnly={!canEditAllInformation}
                        mode="textarea"
                        rows={2}
                        value={editedApplicationInfo.personal_info?.resident_address || ''}
                        onCommit={(value) => updatePersonalInfo('resident_address', value)}
                        displayClassName={`${detailDisplayClass} text-left whitespace-pre-wrap`}
                        inputClassName={detailInputClass}
                        emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                        ariaLabel={canEditAllInformation ? 'Update resident address' : 'Copy resident address'}
                      />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                  {currentStaffRole === 'Super Admin' && (
                    <>
                      <div className="flex flex-col" data-testid="application-handling-staff">
                        <span className="mb-1 text-micro uppercase text-slate-500">{tr('处理 Staff', 'Handling Staff', "Kakitangan Pengendalian")}</span>
                        <DoubleClickEditField mode="select" value={editedApplicationInfo.handler_name} onCommit={updateHandlerName} options={[...activeRoleAccounts.map((account) => ({ value: account.name, label: account.name })), ...(!activeRoleAccounts.some((account) => account.name === editedApplicationInfo.handler_name) && editedApplicationInfo.handler_name ? [{ value: editedApplicationInfo.handler_name, label: editedApplicationInfo.handler_name }] : [])]} displayClassName={detailDisplayClass} inputClassName={detailInputClass} ariaLabel="Update handling staff" />
                      </div>
                      <div className="flex flex-col" data-testid="application-handling-role">
                        <span className="mb-1 text-micro uppercase text-slate-500">Role</span>
                        <DoubleClickEditField copyOnly value={editedApplicationInfo.handler_role || ''} onCommit={() => undefined} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText="Role follows staff" ariaLabel="Copy handler role" />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col">
                    <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('plateNumber')}</span>
                    <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.vehicle_plate} onCommit={(value) => updateApplicationInfo('vehicle_plate', value.toUpperCase())} normalizeValue={(value) => value.trim().toUpperCase()} displayClassName={`${detailDisplayClass} font-mono`} inputClassName={`${detailInputClass} font-mono`} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update vehicle plate' : 'Copy vehicle plate'} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2 pt-2">
                  <h3 className="text-headline text-slate-900">{tr('车辆与购买方式', 'Vehicle & Purchase', "Kenderaan & Belian")}</h3>
                  {canEditAllInformation && (
                    <button
                      type="button"
                      onClick={addVehicleOption}
                      className="inline-flex items-center gap-1.5 rounded-control border border-indigo-100 bg-indigo-50 px-3 py-2 text-caption font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {tr('新增车辆选择', 'Add Vehicle Choice', "Tambah Pilihan Kenderaan")}
                    </button>
                  )}
                </div>

                {isPrimaryModelMissingFromCatalog && (
                  <div className="rounded-control border border-amber-100 bg-amber-50/70 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-footnote font-semibold text-amber-800">
                          {tr('此车型不在 Vehicle Info 里', 'This model is not in Vehicle Info', "Model ini tiada dalam Vehicle Info")}
                        </p>
                        <p className="mt-0.5 text-caption text-amber-700/80">
                          「{editedApplicationInfo.vehicle_model.trim()}」
                          {tr('尚未加入车型库,加入后才能套用价格与月供方案。', ' is not in the catalog yet — add it to enable pricing and installment plans.', " belum ada dalam katalog — tambah untuk membolehkan harga dan pelan ansuran.")}
                        </p>
                        {canAddVehicleCatalogItem ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-micro uppercase text-amber-700">{tr('品牌', 'Brand', "Jenama")}</span>
                            <div className="min-w-[140px]">
                              <ToggleOptionGroup
                                value={newVehicleBrand}
                                options={(vehicleBrandTags.length > 0 ? vehicleBrandTags : ['Yamaha']).map((brand) => ({ value: brand, label: brand }))}
                                onChange={(value) => setNewVehicleBrand(value)}
                                ariaLabel="New vehicle catalog brand"
                                className="rounded-control bg-white p-1 ring-1 ring-amber-100"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddVehicleCatalog}
                              className="inline-flex items-center gap-1.5 rounded-control bg-slate-900 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-slate-700"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {tr('加入 Vehicle Info', 'Add to Vehicle Info', "Tambah ke Vehicle Info")}
                            </button>
                          </div>
                        ) : (
                          <p className="mt-1 text-caption text-amber-700/70">
                            {tr('请让 Super Admin 在 Vehicle Info 里加入此车型。', 'Ask a Super Admin to add this model in Vehicle Info.', "Minta Super Admin menambah model ini dalam Vehicle Info.")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {normalizedVehicleOptions.map((vehicleOption, index) => (
                    <div key={vehicleOption.id} className="rounded-control border border-slate-100 bg-slate-50/50 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-footnote font-semibold text-slate-800">
                            {index === 0 ? tr('主要车辆选择', 'Primary Vehicle Choice', "Pilihan Kenderaan Utama") : tr(`车辆选择 ${index + 1}`, `Vehicle Choice ${index + 1}`, `Pilihan Kenderaan ${index + 1}`)}
                          </p>
                          <p className="mt-0.5 text-caption text-slate-500">
                            {index === 0 ? tr('作为系统里的主要车型', 'Used as main model in dashboard', "Digunakan sebagai model utama dalam papan pemuka") : tr('客户无法继续时的备用选择', 'Backup choice if customer cannot proceed', "Pilihan sandaran jika pelanggan tidak dapat meneruskan")}
                          </p>
                        </div>
                        {canEditAllInformation && index > 0 && (
                          <button
                            type="button"
                            onClick={() => deleteVehicleOption(index)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-control bg-white text-slate-500 ring-1 ring-slate-100 transition-colors hover:text-rose-600"
                            aria-label={`Delete vehicle choice ${index + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_150px_150px_150px]">
                        <div className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('vehicleModel')}</span>
                          <DoubleClickEditField
                            copyOnly={!canEditAllInformation}
                            type="text"
                            value={vehicleOption.vehicle_model}
                            onCommit={(value) => updateVehicleOption(index, 'vehicle_model', value)}
                            suggestions={vehicleModelSuggestions}
                            commitOnSuggestionMatch
                            displayClassName={detailDisplayClass}
                            inputClassName={detailInputClass}
                            emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                            ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} vehicle choice ${index + 1} model`}
                          />
                        </div>

                        <div className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{tr('品牌', 'Brand', "Jenama")}</span>
                          <DoubleClickEditField copyOnly value={vehicleOption.vehicle_brand || 'Yamaha'} onCommit={() => undefined} displayClassName="inline-flex self-start rounded-full bg-slate-100 px-2 py-0.5 text-micro uppercase text-slate-500" inputClassName={detailInputClass} ariaLabel={`Copy vehicle choice ${index + 1} brand`} />
                        </div>

                        <div className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{tr('新车 / 二手', 'New / Used', "Baharu / Terpakai")}</span>
                          <DoubleClickEditField copyOnly={!canEditAllInformation} mode="select" value={vehicleOption.vehicle_condition || ''} options={[{ value: '', label: 'Not set' }, ...VEHICLE_CONDITION_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))]} onCommit={(value) => updateVehicleOption(index, 'vehicle_condition', value as VehicleCondition)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} vehicle choice ${index + 1} condition`} />
                        </div>

                        <div className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{tr('现金 / 贷款', 'Cash / Loan', "Tunai / Pinjaman")}</span>
                          <DoubleClickEditField copyOnly={!canEditAllInformation} mode="select" value={vehicleOption.purchase_method || ''} options={[{ value: '', label: 'Not set' }, ...PURCHASE_METHOD_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))]} onCommit={(value) => updateVehicleOption(index, 'purchase_method', value as PurchaseMethod)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} vehicle choice ${index + 1} purchase method`} />
                        </div>
                        {vehicleOption.vehicle_condition === 'Used' && (
                          <div className="flex flex-col">
                            <span className="mb-1 text-micro uppercase text-slate-500">{tr('摩托里程', 'Motor Mileage', "Perbatuan Motosikal")}</span>
                            <DoubleClickEditField
                              copyOnly={!canEditAllInformation}
                              type="text"
                              value={vehicleOption.motor_mileage || ''}
                              onCommit={(value) => updateVehicleOption(index, 'motor_mileage', value.replace(/\D/g, '').slice(0, 9))}
                              displayClassName={detailDisplayClass}
                              inputClassName={detailInputClass}
                              emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                              ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} vehicle choice ${index + 1} motor mileage`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loan preferences sit inside Vehicle & Purchase, always expanded
                    (owner request 2026-09-30); the id keeps missing-field jumps working. */}
                {isLoanPurchase && (
                  <div id="detail-section-preferences" data-testid="detail-section-preferences" className="scroll-mt-6 rounded-control border border-slate-100 bg-slate-50/40 p-3">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col">
                      <span className="mb-1 text-micro uppercase text-slate-500">{tr('方便接电话', 'Available to Receive Calls', "Masa Sesuai Dihubungi")}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.preferences?.available_to_receive_calls || ''} onCommit={(value) => updatePreferences('available_to_receive_calls', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update available call time' : 'Copy available call time'} />
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-1 text-micro uppercase text-slate-500">{tr('薪资收取方式', 'Salary Paid By', "Gaji Dibayar Melalui")}</span>
                      <DoubleClickEditField
                        copyOnly={!canEditAllInformation}
                        mode="select"
                        value={editedApplicationInfo.preferences?.salary_payment_method || ''}
                        options={SALARY_PAYMENT_METHOD_OPTIONS.map((option) => ({
                          value: option,
                          label: option || tr('未设置', 'Not set', "Belum ditetapkan")
                        }))}
                        onCommit={(value) => updatePreferences('salary_payment_method', value)}
                        displayClassName={detailDisplayClass}
                        inputClassName={detailInputClass}
                        emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                        ariaLabel={canEditAllInformation ? 'Update salary paid by' : 'Copy salary paid by'}
                      />
                    </div>
                        <div className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('salaryBank')}</span>
                          <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.personal_info?.bank_name || ''} suggestions={salaryBankOptions.map((option) => ({ value: option, label: option }))} placeholder={tr('选择或输入银行', 'Select or type the bank', "Pilih atau taip bank")} normalizeValue={(value) => value.trim()} onCommit={(value) => updatePersonalInfo('bank_name', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update salary bank' : 'Copy salary bank'} />
                          <AeonAutoDebitWarning issue={aeonAutoDebitIssue} salaryBankName={salaryBankName} compact />
                        </div>
                        <div className="flex flex-col">
                          <span className="mb-1 inline-flex items-center gap-1 text-micro uppercase text-slate-500">{fieldLabel('bankAccountNumber')}{renderRiskIcon('account_number')}</span>
                          <DoubleClickEditField copyOnly={!canEditAllInformation} value={editedApplicationInfo.personal_info?.account_number || ''} onCommit={(value) => updatePersonalInfo('account_number', value.replace(/\D/g, ''))} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update bank account number' : 'Copy bank account number'} />
                        </div>
                    <div className="flex flex-col">
                      <span className="mb-1 text-micro uppercase text-slate-500">{fieldLabel('loanTenureYears')}</span>
                      <DoubleClickEditField copyOnly={!canEditAllInformation} mode="select" value={editedApplicationInfo.preferences?.loan_tenure || ''} options={[{ value: '', label: tr('未设置', 'Not set', "Belum ditetapkan") }, ...LOAN_TENURE_OPTIONS.map((year) => ({ value: year, label: `${year} years` }))]} onCommit={(value) => updatePreferences('loan_tenure', value)} displayClassName={detailDisplayClass} inputClassName={detailInputClass} emptyText={tr('未填写', 'Not filled', "Tidak diisi")} ariaLabel={canEditAllInformation ? 'Update loan tenure' : 'Copy loan tenure'} />
                    </div>
                    </div>
                  </div>
                )}

                {/* Submitted At sits below the preferences card (owner request 2026-09-30). */}
                <div className="flex flex-col">
                  <span className="text-micro uppercase text-slate-500st mb-1">{tr('提交时间', 'Submitted At', "Diserahkan Pada")}</span>
                  <DoubleClickEditField
                    copyOnly={!canEditAllInformation}
                    type="datetime-local"
                    value={formatDateTimeLocal(editedApplicationInfo.submitted_at)}
                    onCommit={(value) => updateApplicationInfo('submitted_at', toIsoDateTime(value))}
                    displayClassName={`${detailDisplayClass} font-mono`}
                    inputClassName={detailInputClass}
                    formatDisplay={() => new Date(editedApplicationInfo.submitted_at).toLocaleString(getAppLocale(), {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                    ariaLabel={canEditAllInformation ? 'Update submitted time' : 'Copy submitted time'}
                  />
                </div>

                {isLoanPurchase && (
                  <>
                <details id="detail-section-employment" data-testid="detail-section-employment" className="group scroll-mt-6 rounded-card border border-slate-200 bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 py-3 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="block text-headline text-slate-900">{tr('就业资料', 'Employment Details', "Butiran Pekerjaan")}</span>
                      <span className="mt-0.5 block text-caption text-slate-500">{tr('职业类型、公司、职位、年资', 'Occupation type, company, position, tenure', "Jenis pekerjaan, syarikat, jawatan, tempoh")}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-4 pb-4 pt-4 md:grid-cols-2">
                    <div className="flex flex-col" data-testid="employment-occupation-type">
                      <span className="mb-1 text-micro uppercase text-slate-500">{tr('职业类型', 'Occupation Type', "Jenis Pekerjaan")}</span>
                      <DoubleClickEditField
                        copyOnly={!canEditAllInformation}
                        mode="select"
                        value={editedApplicationInfo.employment_details?.occupation_type || ''}
                        options={OCCUPATION_TYPE_OPTIONS.map((option) => ({
                          value: option,
                          label: option === 'Employee'
                            ? tr('受雇', 'Employee', "Pekerja")
                            : option === 'Self-employed'
                              ? tr('自雇', 'Self-employed', "Bekerja Sendiri")
                              : tr('未设置', 'Not set', "Belum ditetapkan")
                        }))}
                        onCommit={(value) => updateEmploymentDetails('occupation_type', value)}
                        displayClassName={detailDisplayClass}
                        inputClassName={detailInputClass}
                        emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                        ariaLabel={canEditAllInformation ? 'Update Occupation Type' : 'Copy Occupation Type'}
                      />
                    </div>
                    {[
                      { label: 'Company Name', value: editedApplicationInfo.employment_details?.company_name || '', field: 'company_name' as const },
                      { label: 'Position', value: editedApplicationInfo.employment_details?.position || '', field: 'position' as const },
                      { label: tr('每月总薪资', 'Gross Monthly Salary', "Gaji Bulanan Kasar"), value: editedApplicationInfo.employment_details?.gross_monthly_salary || '', field: 'gross_monthly_salary' as const, normalizeValue: normalizeDecimalInput },
                      { label: tr('每月净薪资', 'Net Monthly Salary', "Gaji Bulanan Bersih"), value: editedApplicationInfo.employment_details?.net_monthly_salary || '', field: 'net_monthly_salary' as const, normalizeValue: normalizeDecimalInput },
                      { label: 'Years Employed', value: editedApplicationInfo.employment_details?.years_employed || '', field: 'years_employed' as const, type: 'number' as const, normalizeValue: (value: string) => value.replace(/\D/g, '') },
                      { label: 'Office Phone', value: editedApplicationInfo.employment_details?.office_phone_no || '', field: 'office_phone_no' as const }
                    ].map((item) => item.field === 'years_employed' ? (() => {
                      const employmentStartYear = editedApplicationInfo.employment_details?.employment_start_year || '';
                      const employmentStartMonth = editedApplicationInfo.employment_details?.employment_start_month || '';
                      const employmentDuration = getEmploymentDuration(employmentStartYear, employmentStartMonth);
                      return (
                        <div key={item.field} className="flex flex-col" data-testid="employment-start">
                          <span className="mb-1 text-micro uppercase text-slate-500">{tr('开始上班（年 / 月）', 'Started Working (Year / Month)', "Mula Bekerja (Tahun / Bulan)")}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <DoubleClickEditField
                              copyOnly={!canEditAllInformation}
                              mode="select"
                              value={employmentStartYear}
                              options={[
                                { value: '', label: tr('年份', 'Year', "Tahun") },
                                ...getEmploymentStartYearOptions().map((year) => ({ value: year, label: year }))
                              ]}
                              onCommit={(value) => updateEmploymentStart('employment_start_year', value)}
                              displayClassName={detailDisplayClass}
                              inputClassName={detailInputClass}
                              emptyText={tr('年份', 'Year', "Tahun")}
                              ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} Employment Start Year`}
                            />
                            <DoubleClickEditField
                              copyOnly={!canEditAllInformation}
                              mode="select"
                              value={employmentStartMonth}
                              options={[
                                { value: '', label: tr('月份', 'Month', "Bulan") },
                                ...Array.from({ length: 12 }, (_, index) => {
                                  const month = String(index + 1);
                                  return { value: month, label: tr(`${month} 月`, `Month ${month}`, `Bulan ${month}`) };
                                })
                              ]}
                              onCommit={(value) => updateEmploymentStart('employment_start_month', value)}
                              displayClassName={detailDisplayClass}
                              inputClassName={detailInputClass}
                              emptyText={tr('月份', 'Month', "Bulan")}
                              formatDisplay={(value) => value ? tr(`${value} 月`, `Month ${value}`, `Bulan ${value}`) : tr('月份', 'Month', "Bulan")}
                              ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} Employment Start Month`}
                            />
                          </div>
                          <span className="mt-1 text-caption text-slate-500" data-testid="employment-duration">
                            {employmentDuration
                              ? tr(
                                `已工作 ${employmentDuration.years} 年 ${employmentDuration.months} 个月`,
                                `Worked ${employmentDuration.years} yrs ${employmentDuration.months} mths`,
                                `Bekerja ${employmentDuration.years} thn ${employmentDuration.months} bln`
                              )
                              : item.value
                                ? tr(`工作年数：${item.value} 年`, `Years Employed: ${item.value}`, `Tahun Bekerja: ${item.value}`)
                                : tr('选择年份和月份后自动计算年资', 'Pick year and month to calculate tenure', "Pilih tahun dan bulan untuk kira tempoh")}
                          </span>
                        </div>
                      );
                    })() : (
                      <div key={item.field} className="flex flex-col">
                        <span className="mb-1 text-micro uppercase text-slate-500">{item.label}</span>
                        <DoubleClickEditField
                          copyOnly={!canEditAllInformation}
                          type={item.type || 'text'}
                          value={item.value}
                          copyValue={item.field === 'office_phone_no' ? formatMalaysiaPhoneForCopy(item.value) : undefined}
                          onCommit={(value) => updateEmploymentDetails(item.field, value)}
                          normalizeValue={item.normalizeValue}
                          displayClassName={detailDisplayClass}
                          inputClassName={detailInputClass}
                          emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                          ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} ${item.label}`}
                        />
                      </div>
                    ))}
                    <div className="flex flex-col md:col-span-2">
                      <span className="mb-1 text-micro uppercase text-slate-500">{tr('公司地址', 'Company Address', "Alamat Syarikat")}</span>
                      <DoubleClickEditField
                        copyOnly={!canEditAllInformation}
                        mode="textarea"
                        rows={2}
                        value={editedApplicationInfo.employment_details?.company_address || ''}
                        onCommit={(value) => updateEmploymentDetails('company_address', value)}
                        displayClassName={`${detailDisplayClass} text-left whitespace-pre-wrap`}
                        inputClassName={detailInputClass}
                        emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                        ariaLabel={canEditAllInformation ? 'Update company address' : 'Copy company address'}
                      />
                    </div>
                  </div>
                </details>

                  </>
                )}

                <details id="detail-section-emergency" data-testid="detail-section-emergency" className="group scroll-mt-6 rounded-card border border-slate-200 bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 py-3 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="block text-headline text-slate-900">{tr('紧急联系人', 'Emergency Contacts', "Kenalan Kecemasan")}</span>
                      <span className="mt-0.5 block text-caption text-slate-500">{tr('联系人 1 / 联系人 2', 'Contact 1 / Contact 2', "Kenalan 1 / Kenalan 2")}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-4 pb-4 pt-4 md:grid-cols-2">
                    {normalizeEmergencyContacts(editedApplicationInfo.emergency_contacts).map((contact, index) => (
                      <div key={`emergency-contact-${index}`} className="space-y-3 rounded-control border border-slate-100 bg-slate-50/50 p-3">
                        <p className="text-micro uppercase text-slate-500">{tr(`紧急联系人 ${index + 1}`, `Emergency Contact ${index + 1}`, `Hubungan Kecemasan ${index + 1}`)}</p>
                        {[
                          { label: 'Full Name', value: contact.full_name, field: 'full_name' as const },
                          { label: 'Relationship', value: contact.relationship, field: 'relationship' as const },
                          { label: 'Phone Number', value: contact.phone_no, field: 'phone_no' as const }
                        ].map((item) => (
                          <div key={item.field} className="flex flex-col">
                            <span className="mb-1 text-micro uppercase text-slate-500">{item.label}</span>
                            <DoubleClickEditField
                              copyOnly={!canEditAllInformation}
                              value={item.value}
                              copyValue={item.field === 'phone_no' ? formatMalaysiaPhoneForCopy(item.value) : undefined}
                              onCommit={(value) => updateEmergencyContact(index, item.field, value)}
                              displayClassName={detailDisplayClass}
                              inputClassName={detailInputClass}
                              emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                              ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} emergency contact ${index + 1} ${item.label}`}
                            />
                          </div>
                        ))}
                        <div className="flex flex-col">
                          <span className="mb-1 text-micro uppercase text-slate-500">{tr('详细地址', 'Full Address', "Alamat Penuh")}</span>
                          <DoubleClickEditField
                            copyOnly={!canEditAllInformation}
                            mode="textarea"
                            rows={2}
                            value={contact.full_address}
                            onCommit={(value) => updateEmergencyContact(index, 'full_address', value)}
                            displayClassName={`${detailDisplayClass} text-left whitespace-pre-wrap`}
                            inputClassName={detailInputClass}
                            emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                            ariaLabel={`${canEditAllInformation ? 'Update' : 'Copy'} emergency contact ${index + 1} address`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <details id="detail-section-remark" data-testid="detail-section-remark" className="group scroll-mt-6 rounded-card border border-slate-200 bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 py-3 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="block text-headline text-slate-900">{tr('备注', 'Remark', "Catatan")}</span>
                      <span className="mt-0.5 block truncate text-caption text-slate-500">{editedRemarks.trim() || tr('这位客户的内部备注', 'Internal notes for this customer', "Catatan dalaman untuk pelanggan ini")}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-slate-100 px-4 pb-4 pt-4">
                    {remarkDraft !== null ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          rows={4}
                          value={remarkDraft}
                          autoFocus
                          onChange={(event) => setRemarkDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') setRemarkDraft(null);
                            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                              setEditedRemarks(remarkDraft);
                              setRemarkDraft(null);
                            }
                          }}
                          className={`${detailInputClass} w-full`}
                          aria-label="Remark text"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRemarkDraft(null)}
                            className="min-h-9 rounded-control px-3 text-footnote text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                          >
                            {tr('取消', 'Cancel', "Batal")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditedRemarks(remarkDraft);
                              setRemarkDraft(null);
                            }}
                            className="min-h-9 rounded-control bg-brand px-3 text-footnote text-white hover:opacity-90"
                          >
                            {tr('完成', 'Done', "Selesai")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <DoubleClickEditField
                            copyOnly={!canEditAllInformation}
                            mode="textarea"
                            rows={4}
                            value={editedRemarks}
                            onCommit={(value) => setEditedRemarks(value)}
                            displayClassName={`${detailDisplayClass} w-full text-left whitespace-pre-wrap`}
                            inputClassName={`${detailInputClass} w-full`}
                            emptyText={tr('未填写', 'Not filled', "Tidak diisi")}
                            ariaLabel={canEditAllInformation ? 'Update remark' : 'Copy remark'}
                          />
                        </div>
                        {canEditAllInformation && (
                          <button
                            type="button"
                            onClick={() => setRemarkDraft(editedRemarks)}
                            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-control px-3 text-footnote text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            {tr('编辑', 'Edit', "Edit")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </details>
              </div>

              <div
                ref={documentChecklistRef}
                id="detail-basic-document-checklist"
                data-testid="detail-basic-document-checklist"
                className="order-1 scroll-mt-6 space-y-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-headline text-slate-900">{tr('文件 / 资料清单', 'File / Document Checklist', "Senarai Semak Fail / Dokumen")}</h3>
                    <p className="mt-0.5 text-caption text-slate-500">
                      {tr('缺失项会进首页提醒。', 'Missing items show on Home.', "Item yang hilang ditunjukkan di Laman Utama.")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold ring-1 ${
                    missingDocumentLabels.length > 0
                      ? 'bg-amber-50 text-amber-700 ring-amber-100'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                  }`}>
                    {missingDocumentLabels.length > 0 ? tr(`${missingDocumentLabels.length} 个缺失`, `${missingDocumentLabels.length} missing`, `${missingDocumentLabels.length} tiada`) : tr('资料完整', 'Documents complete', "Dokumen lengkap")}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {documentChecklist.map((documentItem) => {
                    const requirement = CUSTOMER_DOCUMENT_REQUIREMENTS.find((item) => item.key === documentItem.key);
                    const documentHelper = requirement?.helper || 'Document status';
                    const style = DOCUMENT_STATUS_STYLES[documentItem.status];
                    const isReceivedDocument = documentItem.status === 'Received';
                    const isNotRequiredDocument = documentItem.status === 'Not Required';
                    const isOutstandingBankRequestedDocument = requestedBankDocumentKey === documentItem.key
                      && !isBankRequestedDocumentReceived;
                    const isDocumentSwitchOn = isReceivedDocument || isNotRequiredDocument;
                    const documentSwitchLabel = isReceivedDocument
                      ? 'Received'
                      : isNotRequiredDocument
                        ? 'Not Required'
                        : 'Missing';
                    const uploadedDocuments = editedPayslipDocuments.filter((document) => (
                      getUploadedDocumentChecklistKey({
                        document_checklist: editedApplicationInfo.document_checklist,
                        payslip_documents: editedPayslipDocuments,
                        purchase_method: editedApplicationInfo.purchase_method,
                        vehicle_condition: editedApplicationInfo.vehicle_condition
                      }, document) === documentItem.key
                    ));
                    const uploadLimit = getCustomerDocumentUploadLimit(documentItem.key);
                    const uploadLimitReached = uploadedDocuments.length >= uploadLimit;

                    return (
                      <FileDropZone
                        key={documentItem.key}
                        id={`detail-missing-document-${documentItem.key}`}
                        testId={`document-checklist-${documentItem.key}`}
                        className="scroll-mt-6 rounded-card border border-slate-100 bg-slate-50/60 p-4"
                        disabled={!canManageDocuments || isUploadingPayslip || uploadLimitReached}
                        onFiles={(files) => handleDocumentUpload(documentItem.key, files)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control ring-1 ${style.chip}`}>
                                <span className={style.shape} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-headline text-slate-900">{documentItem.label}</p>
                                <p className="mt-0.5 text-caption text-slate-500">
                                  {documentHelper} · {uploadedDocuments.length}/{uploadLimit}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold ring-1 ${style.chip}`}>
                            {style.icon}
                            {documentItem.status}
                          </span>
                        </div>

                        {canManageDocuments && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <label className={`inline-flex items-center justify-center gap-1.5 rounded-control border px-2.5 py-1.5 text-caption font-semibold transition-colors ${
                              isUploadingPayslip || uploadLimitReached
                                ? 'border-slate-100 bg-slate-100 text-slate-500'
                                : 'cursor-pointer border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50'
                            }`}>
                              <Upload className="h-3.5 w-3.5" />
                              {uploadLimitReached ? tr('已达上限', 'Limit reached', 'Had dicapai') : 'Upload'}
                              <input
                                type="file"
                                multiple
                                accept=".pdf,image/png,image/jpeg,image/webp"
                                disabled={isUploadingPayslip || uploadLimitReached}
                                onChange={(event) => {
                                  const files = Array.from(event.currentTarget.files || []) as File[];
                                  handleDocumentUpload(documentItem.key, files);
                                  event.currentTarget.value = '';
                                }}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              role="switch"
                              aria-checked={isDocumentSwitchOn}
                              disabled={isReceivedDocument || isOutstandingBankRequestedDocument}
                              title={isOutstandingBankRequestedDocument
                                ? 'The bank requested this document. Upload a new file to mark it Received.'
                                : isReceivedDocument
                                ? 'Uploaded file marks this item as Received. Delete file to change it.'
                                : `Toggle ${documentItem.label} document status`}
                              onClick={() => updateDocumentChecklistStatus(
                                documentItem.key,
                                isNotRequiredDocument ? 'Missing' : 'Not Required'
                              )}
                              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-2 py-1 text-caption font-semibold ring-1 transition-colors ${
                                isDocumentSwitchOn
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                  : 'bg-rose-50 text-rose-700 ring-rose-100'
                              } ${isReceivedDocument || isOutstandingBankRequestedDocument ? 'cursor-not-allowed opacity-90' : 'hover:bg-white'}`}
                            >
                              <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                                isDocumentSwitchOn ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                  isDocumentSwitchOn ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                              </span>
                              <span className="shrink-0">{documentSwitchLabel}</span>
                            </button>
                          </div>
                        )}

                        <div className="mt-3 space-y-2">
                          {uploadedDocuments.map((document) => {
                            const isImageDocument = document.file_type.startsWith('image/');
                            const documentLoadState = document.file_data_url
                              ? 'loaded'
                              : documentLoadStates[document.id] || 'loading';
                            const isDocumentReady = documentLoadState === 'loaded' && Boolean(document.file_data_url);

                            return (
                              <div key={document.id} className="flex flex-col gap-2 rounded-control bg-white px-3 py-2 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                  {isImageDocument && isDocumentReady ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDocumentPreview(document)}
                                      className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-control bg-slate-100 ring-1 ring-slate-100 transition-transform hover:scale-[1.02]"
                                      aria-label={`Preview ${document.file_name}`}
                                    >
                                      <img
                                        src={document.file_data_url}
                                        alt={document.file_name}
                                        className="h-full w-full object-cover"
                                      />
                                      <span className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/10" />
                                    </button>
                                  ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-slate-50 text-micro uppercase text-slate-500 ring-1 ring-slate-100">
                                      {documentLoadState === 'loading' ? 'Loading' : 'File'}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-footnote font-semibold text-slate-700" title={document.file_name}>{document.file_name}</p>
                                    <p className="mt-0.5 text-caption text-slate-500">
                                      {formatFileSize(document.file_size)} · {document.uploaded_by}
                                    </p>
                                    {documentLoadState === 'error' && (
                                      <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => void loadDocumentSource(document, true)}
                                          className="text-caption font-semibold text-rose-600 hover:text-rose-700"
                                        >
                                          {tr('文件载入失败 · 重试', 'File unavailable · Retry', "Fail tidak tersedia · Cuba lagi")}
                                        </button>
                                        {canManageDocuments && (
                                          <label className={`cursor-pointer text-caption font-semibold text-indigo-600 hover:text-indigo-700 ${
                                            isUploadingPayslip ? 'pointer-events-none opacity-50' : ''
                                          }`}>
                                            {tr('补传原文件', 'Re-upload file', "Muat naik semula fail")}
                                            <input
                                              type="file"
                                              accept=".pdf,image/png,image/jpeg,image/webp"
                                              disabled={isUploadingPayslip}
                                              aria-label={`Re-upload ${document.file_name}`}
                                              onChange={(event) => {
                                                const file = event.currentTarget.files?.[0];
                                                if (file) {
                                                  void handleDocumentReplacement(document, file);
                                                }
                                                event.currentTarget.value = '';
                                              }}
                                              className="hidden"
                                            />
                                          </label>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocumentPreview(document)}
                                    disabled={!isDocumentReady}
                                    className="rounded-chip px-2 py-1 text-caption font-semibold text-indigo-600 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-50 disabled:cursor-wait disabled:text-slate-300 disabled:ring-slate-100"
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void downloadDocument(document)}
                                    disabled={documentLoadState === 'loading'}
                                    className="rounded-chip px-2 py-1 text-caption font-semibold text-slate-500 ring-1 ring-slate-100 transition-colors hover:text-indigo-600 disabled:cursor-wait disabled:text-slate-300"
                                  >
                                    Download
                                  </button>
                                  {canManageDocuments && (
                                    <button
                                      type="button"
                                      onClick={() => deleteDocument(document.id)}
                                      className="rounded-chip p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                      aria-label={`Delete ${document.file_name}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {uploadedDocuments.length === 0 && (
                            <p className="rounded-control bg-white px-3 py-2 text-caption text-slate-500 ring-1 ring-slate-100">
                              No file uploaded.
                            </p>
                          )}
                        </div>
                      </FileDropZone>
                    );
                  })}
                </div>
              </div>
              </div>
              )}

              {/* Bank application records stored under this customer ID */}
              {activeDetailTab === 'bank' && isLoanPurchase && pendingAction !== 'Complete Application' && (
              <div id="detail-panel-bank" aria-label="Banks" data-testid="detail-panel-bank" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-headline text-slate-900">{tr('银行申请', 'Bank Applications', "Permohonan Bank")}</h3>
                    <p className="mt-0.5 text-caption text-slate-500">
                      {tr('可记录多间银行申请。', 'Multiple bank applications supported.', "Berbilang permohonan bank disokong.")}
                    </p>
                  </div>
                  {canManageBankApplications && (
                    <button
                      type="button"
                      onClick={handleAddBankApplication}
                      className="inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-2 text-callout text-white transition-colors hover:bg-brand-deep"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {tr('新增银行', 'Add Bank', "Tambah Bank")}
                    </button>
                  )}
                </div>

                <AeonAutoDebitWarning issue={aeonAutoDebitIssue} salaryBankName={salaryBankName} />

                <div className="space-y-3">
                  {editedBankApplications.map((bankApplication, index) => {
                    const reasonUi = buildStatusReasonUi()[bankApplication.status];
                    const isExpanded = Boolean(expandedBankApplicationIds[bankApplication.id]);
                    const showOfferFields = bankApplication.status === 'Approved';
                    const summaryText = getBankSummaryText(bankApplication);
                    const decisionAt = getBankDecisionAt(bankApplication);

                    return (
                    <div
                      key={bankApplication.id}
                      data-testid={`bank-application-${bankApplication.id}`}
                      className={`rounded-card border bg-white p-4 shadow-e1 transition-colors ${
                        isExpanded ? 'border-indigo-100 ring-1 ring-indigo-50' : 'border-slate-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div
                          role={canManageBankApplications ? 'button' : undefined}
                          tabIndex={canManageBankApplications ? 0 : undefined}
                          aria-expanded={canManageBankApplications ? isExpanded : undefined}
                          onClick={() => canManageBankApplications && toggleBankApplicationEditor(bankApplication.id)}
                          onKeyDown={(event) => {
                            if (
                              canManageBankApplications &&
                              (event.key === 'Enter' || event.key === ' ')
                            ) {
                              event.preventDefault();
                              toggleBankApplicationEditor(bankApplication.id);
                            }
                          }}
                          className={`min-w-0 rounded-control outline-none ${
                            canManageBankApplications
                              ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-100'
                              : ''
                          }`}
                          title={canManageBankApplications
                            ? tr('点击编辑银行资料', 'Click to edit bank details', "Klik untuk mengedit butiran bank")
                            : undefined}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <BankIcon
                              bankName={bankApplication.bank_name}
                              bankDefinitions={bankDefinitions}
                              status={bankApplication.status}
                              size="md"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-headline text-slate-800">
                                #{index + 1} {bankApplication.bank_name || tr('银行申请', 'Bank Application', "Permohonan Bank")}
                              </p>
                            </div>
                            <span className={`rounded-full border px-2 py-0.5 text-caption font-semibold ${getBankStatusBadgeClass(bankApplication.status)}`}>
                              {trBankStatus(bankApplication.status)}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-caption text-slate-500">{bankApplication.id}</p>
                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="rounded-control bg-slate-50 px-3 py-2">
                              <p className="text-micro uppercase text-slate-500">{tr('轮次', 'Round', "Bulat")}</p>
                              <p className="mt-0.5 text-footnote font-semibold text-slate-700">{bankApplication.round_no}</p>
                            </div>
                            <div className="rounded-control bg-slate-50 px-3 py-2">
                              <p className="text-micro uppercase text-slate-500">{tr('原因', 'Reason', "Sebab")}</p>
                              <p className="mt-0.5 line-clamp-1 text-footnote text-slate-700">
                                {bankApplication.reject_reason || bankApplication.status_reason || bankApplication.reject_code || '-'}
                              </p>
                            </div>
                            <div className="rounded-control bg-slate-50 px-3 py-2">
                              <p className="text-micro uppercase text-slate-500">{tr('下一步', 'Next', "Seterusnya")}</p>
                              <p className="mt-0.5 line-clamp-1 text-footnote text-slate-700">{summaryText}</p>
                            </div>
                          </div>
                          {showOfferFields && (
                            <p className="mt-2 text-caption text-emerald-600">
                              {[
                                `Offer ${bankApplication.offer_amount ? `RM ${bankApplication.offer_amount}` : 'recorded'}`,
                                getBankSellingPrice(application, bankApplication) ? `${fieldLabel('sellingPrice')} RM ${getBankSellingPrice(application, bankApplication)}` : '',
                                bankApplication.deposit_amount ? `${fieldLabel('deposit')} RM ${bankApplication.deposit_amount}` : '',
                                bankApplication.tenure ? `${bankApplication.tenure} ${tr('个月', 'months', 'bulan')}` : '',
                                bankApplication.monthly_installment ? `${fieldLabel('monthlyInstalment')} RM ${bankApplication.monthly_installment}` : '',
                                bankApplication.number_plate || '',
                                bankApplication.engine_number ? `${fieldLabel('engineNumber')} ${bankApplication.engine_number}` : '',
                                bankApplication.chassis_number ? `${fieldLabel('chassisNumber')} ${bankApplication.chassis_number}` : ''
                              ].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {showOfferFields && (
                            <div className="mt-2 flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  void navigator.clipboard?.writeText(buildBankFinanceSummary(application, bankApplication)).then(
                                    () => setCopiedFinanceBankId(bankApplication.id),
                                    () => setCopiedFinanceBankId('')
                                  );
                                }}
                                className="min-h-8 rounded-control px-3 text-caption font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                aria-label={`Copy finance summary for ${bankApplication.id}`}
                              >
                                {copiedFinanceBankId === bankApplication.id
                                  ? tr('已复制', 'Copied', 'Disalin')
                                  : tr('复制贷款资料', 'Copy finance summary', 'Salin ringkasan pembiayaan')}
                              </button>
                              {getMissingApprovedBankFields(bankApplication).length > 0 && (
                                <span className="text-caption text-amber-700" data-testid={`approved-bank-missing-${bankApplication.id}`}>
                                  {tr('批准后要填月供和年期', 'Fill in the instalment and tenure', 'Isi ansuran dan tempoh')}
                                </span>
                              )}
                            </div>
                          )}
                          {showOfferFields && onRecordUnitExchange && (
                            <UnitExchangeCard
                              bankApplicationId={bankApplication.id}
                              exchanges={(application.unit_exchanges || []).filter((exchange) => exchange.bank_application_id === bankApplication.id)}
                              canRecord={isOperationsLead(currentStaffRole) || application.handler_name === currentStaffName || (currentStaffRole === 'Admin' && application.admin_owner_name === currentStaffName)}
                              vehicleModelSuggestions={vehicleModelSuggestions.map((suggestion) => suggestion.value)}
                              onRecord={(input) => onRecordUnitExchange(application.id, input)}
                            />
                          )}
                        </div>
                        <div className="flex max-w-2xl shrink-0 flex-wrap items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                          {canManageBankApplications && ['Submitted', 'Pending Review'].includes(bankApplication.status) && (
                            <>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => openQuickBankAction(bankApplication, 'approve')}
                                className="inline-flex items-center gap-1.5 rounded-control bg-emerald-700 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                {tr('已批准', 'Approved', "Diluluskan")}
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => openQuickBankAction(bankApplication, 'follow-up-reject')}
                                className="inline-flex items-center gap-1.5 rounded-control bg-purple-700 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-wait disabled:bg-slate-300"
                              >
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                {tr('跟进拒绝银行', 'Follow Up Reject Bank', "Susulan Bank Ditolak")}
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => openQuickBankAction(bankApplication, 'follow-up-document')}
                                className="inline-flex items-center gap-1.5 rounded-control bg-amber-600 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-wait disabled:bg-slate-300"
                              >
                                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                                {tr('待补文件', 'Pending Document', "Dokumen Tertunda")}
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => openQuickBankAction(bankApplication, 'reject')}
                                className="inline-flex items-center gap-1.5 rounded-control bg-rose-700 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-rose-800 disabled:cursor-wait disabled:bg-slate-300"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                {tr('已拒绝', 'Rejected', "Ditolak")}
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => openQuickBankAction(bankApplication, 'cancel')}
                                className="inline-flex items-center gap-1.5 rounded-control bg-slate-700 px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-300"
                              >
                                <MinusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                {tr('取消申请', 'Cancel', "Batal")}
                              </button>
                            </>
                          )}
                          {canManageBankApplications && (
                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              onClick={() => toggleBankApplicationEditor(bankApplication.id)}
                              className="hidden rounded-control bg-slate-50 px-3 py-2 text-caption font-semibold text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 md:inline-flex"
                            >
                              {isExpanded
                                ? tr('收起编辑', 'Close edit', "Tutup suntingan")
                                : tr('点击编辑', 'Click to edit', "Klik untuk mengedit")}
                            </button>
                          )}
                          {canManageBankApplications && (
                            <button
                              type="button"
                              onClick={() => deleteBankApplication(bankApplication.id)}
                              className="rounded-control p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Delete ${bankApplication.bank_name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {quickFollowUpBankId === bankApplication.id && ['Submitted', 'Pending Review'].includes(bankApplication.status) && (
                        <div
                          className="mt-4 flex flex-col gap-2 rounded-card border border-amber-100 bg-amber-50 p-3 sm:flex-row sm:items-end"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <span className="text-micro uppercase text-amber-700">
                              {tr('下一步（必填）', 'Next Action (required)', "Tindakan Seterusnya (wajib)")}
                            </span>
                            <BankNextActionSelect
                              value={quickFollowUpNextAction}
                              options={bankDocumentRequestOptions}
                              onChange={setQuickFollowUpNextAction}
                              required
                              autoFocus
                              tone="amber"
                              ariaLabel={`Follow up next action for ${bankApplication.id}`}
                            />
                          </label>
                          <div className="min-w-0 flex-1">
                            <BankDecisionRemarkInput
                              value={quickDecisionRemark}
                              onChange={setQuickDecisionRemark}
                              tone="amber"
                              ariaLabel={`Pending document custom reason for ${bankApplication.id}`}
                            />
                          </div>
                          <button
                            type="button"
                            disabled={isSubmitting || !getBankRequestedDocumentKey(quickFollowUpNextAction)}
                            onClick={() => {
                              void saveQuickBankFollowUp(bankApplication, quickFollowUpNextAction, quickDecisionRemark);
                            }}
                            className="h-9 rounded-control bg-amber-600 px-3 text-caption font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-wait disabled:bg-slate-300"
                          >
                            {tr('确认待补文件', 'Confirm Pending Document', "Sahkan Dokumen Tertunda")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickFollowUpBankId('');
                              setQuickFollowUpNextAction('');
                              setQuickDecisionRemark('');
                            }}
                            className="h-9 rounded-control border border-amber-100 bg-white px-3 text-caption font-semibold text-slate-500 transition-colors hover:bg-amber-100 hover:text-amber-700"
                          >
                            {tr('取消', 'Cancel', "Batal")}
                          </button>
                        </div>
                      )}

                      {quickRejectBankId === bankApplication.id && ['Submitted', 'Pending Review'].includes(bankApplication.status) && (
                        <div
                          className="mt-4 grid grid-cols-1 gap-3 rounded-card border border-rose-100 bg-rose-50 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.45fr)_auto_auto] lg:items-end"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex min-w-0 flex-col gap-1.5">
                            <span className="text-micro uppercase text-rose-700">
                              {tr('拒贷代码（可多个，选填）', 'Reject CODEs (multiple, optional)', "KOD Tolak (berbilang, pilihan)")}
                            </span>
                            <BankRejectCodesInput
                              value={quickRejectCode}
                              definitions={errorCodeDefinitions}
                              onChange={(value) => {
                                const definitions = getRejectDefinitions(value, errorCodeDefinitions);
                                setQuickRejectCode(value);
                                setQuickRejectReason(
                                  normalizeRejectCodes(value).length > 0
                                    ? getLinkedRejectReason(value, errorCodeDefinitions)
                                    : ''
                                );
                                const defaultNextStep = definitions[0]?.default_next_step;
                                if (quickRejectMode === 'final' && !quickRejectNextStep && defaultNextStep && FINAL_REJECT_NEXT_STEPS.includes(defaultNextStep)) {
                                  setQuickRejectNextStep(defaultNextStep);
                                }
                              }}
                              ariaLabel={`Reject CODE for ${bankApplication.id}`}
                              autoFocus
                            />
                            <p className="text-caption text-rose-500">
                              {tr(
                                '每个 CODE 会自动关联 Reject Reason；没有 CODE 时请手动填写。',
                                'Each CODE links its Reject Reason automatically; enter a reason manually when there is no CODE.',
                                'Setiap KOD memautkan Sebab Tolak secara automatik; masukkan sebab secara manual jika tiada KOD.'
                              )}
                            </p>
                            {normalizeRejectCodes(quickRejectCode).length > 0 ? (
                              <div className="min-h-10 rounded-control border border-rose-100 bg-white px-3 py-2 text-footnote text-slate-700">
                                {quickRejectReason}
                              </div>
                            ) : (
                              <textarea
                                rows={2}
                                value={quickRejectReason}
                                onChange={(event) => setQuickRejectReason(event.target.value)}
                                placeholder={tr('输入拒绝原因', 'Enter reject reason', 'Masukkan sebab penolakan')}
                                aria-label={`Reject reason for ${bankApplication.id}`}
                                className="min-h-16 resize-none rounded-control border border-rose-100 bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                              />
                            )}
                          </div>
                          {quickRejectMode === 'follow-up' ? (
                            <label className="flex min-w-52 flex-col gap-1.5">
                              <span className="text-micro uppercase text-rose-700">
                                {tr('要补的文件（必选）', 'Document to provide (required)', "Dokumen diperlukan (wajib)")}
                              </span>
                              <BankNextActionSelect
                                value={quickRejectDocument}
                                options={bankDocumentRequestOptions}
                                onChange={setQuickRejectDocument}
                                required
                                ariaLabel={`Reject document request for ${bankApplication.id}`}
                              />
                              <p className="text-caption text-rose-500">
                                {tr(
                                  'Sales 补齐后按 Documents Ready，Admin 再送同一家银行（新一轮）。',
                                  'After Sales uses Documents Ready, Admin resubmits to the same bank as a new round.',
                                  'Selepas Jualan menggunakan Documents Ready, Pentadbir menghantar semula ke bank yang sama sebagai pusingan baharu.'
                                )}
                              </p>
                            </label>
                          ) : (
                            <label className="flex min-w-52 flex-col gap-1.5">
                              <span className="text-micro uppercase text-rose-700">
                                {tr('下一步（必选）', 'Next Step (required)', "Langkah Seterusnya (wajib)")}
                              </span>
                              <select
                                value={quickRejectNextStep}
                                onChange={(event) => setQuickRejectNextStep(event.target.value as RejectNextStepType)}
                                aria-label={`Reject next step for ${bankApplication.id}`}
                                className="h-9 rounded-control border border-rose-100 bg-white px-3 text-callout text-slate-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                              >
                                <option value="">{tr('选择下一步', 'Select next step', "Pilih langkah")}</option>
                                {FINAL_REJECT_NEXT_STEPS.map((nextStep) => (
                                  <option key={nextStep} value={nextStep}>{rejectNextStepLabel(nextStep)}</option>
                                ))}
                              </select>
                            </label>
                          )}
                          <div className="lg:col-span-4">
                            <BankDecisionRemarkInput
                              value={quickDecisionRemark}
                              onChange={setQuickDecisionRemark}
                              tone="rose"
                              ariaLabel={`Reject custom reason for ${bankApplication.id}`}
                            />
                          </div>
                          <button
                            type="button"
                            disabled={
                              isSubmitting ||
                              !quickRejectNextStep ||
                              !quickRejectReason.trim() ||
                              (quickRejectMode === 'follow-up' && !getBankRequestedDocumentKey(quickRejectDocument))
                            }
                            onClick={() => {
                              void saveQuickBankApplicationStatus(
                                bankApplication,
                                'Rejected',
                                quickRejectCode,
                                quickRejectNextStep || undefined,
                                quickRejectReason,
                                quickRejectMode === 'follow-up' ? quickRejectDocument : undefined,
                                quickDecisionRemark
                              );
                            }}
                            className="h-9 rounded-control bg-rose-700 px-3 text-caption font-semibold text-white lg:col-start-3 transition-colors hover:bg-rose-800 disabled:cursor-wait disabled:bg-slate-300"
                          >
                            {quickRejectMode === 'follow-up'
                              ? tr('确认补文件再送', 'Confirm Follow Up Reject', "Sahkan Susulan Ditolak")
                              : tr('确认拒绝', 'Confirm Rejected', "Sahkan Ditolak")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickRejectBankId('');
                              setQuickRejectCode('');
                              setQuickRejectReason('');
                              setQuickRejectNextStep('');
                              setQuickDecisionRemark('');
                            }}
                            className="h-9 rounded-control border border-rose-100 bg-white px-3 text-caption font-semibold text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-700"
                          >
                            {tr('取消', 'Cancel', "Batal")}
                          </button>
                        </div>
                      )}

                      {quickCancelBankId === bankApplication.id && ['Submitted', 'Pending Review'].includes(bankApplication.status) && (
                        <div
                          className="mt-4 flex flex-col gap-2 rounded-card border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-end"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <span className="text-micro uppercase text-slate-600">
                              {tr('取消原因（必填）', 'Cancellation Reason (required)', "Sebab Pembatalan (wajib)")}
                            </span>
                            <textarea
                              rows={2}
                              value={quickCancelReason}
                              onChange={(event) => setQuickCancelReason(event.target.value)}
                              placeholder={tr('输入取消这间银行申请的原因', 'Enter why this bank application is being cancelled', 'Masukkan sebab permohonan bank ini dibatalkan')}
                              aria-label={`Cancellation reason for ${bankApplication.id}`}
                              autoFocus
                              className="min-h-16 resize-none rounded-control border border-slate-200 bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            />
                          </label>
                          <button
                            type="button"
                            disabled={isSubmitting || !quickCancelReason.trim()}
                            onClick={() => {
                              void saveQuickBankCancellation(bankApplication, quickCancelReason);
                            }}
                            className="h-9 rounded-control bg-slate-700 px-3 text-caption font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-300"
                          >
                            {tr('确认取消申请', 'Confirm Cancel', "Sahkan Batal")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickCancelBankId('');
                              setQuickCancelReason('');
                            }}
                            className="h-9 rounded-control border border-slate-200 bg-white px-3 text-caption font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          >
                            {tr('返回', 'Back', "Kembali")}
                          </button>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {[
                          {
                            title: 'Customer Applied',
                            value: formatTimelineDate(application.submitted_at),
                            done: Boolean(application.submitted_at)
                          },
                          {
                            title: 'Submitted To Bank',
                            value: formatTimelineDate(bankApplication.submitted_at),
                            done: Boolean(bankApplication.submitted_at)
                          },
                          {
                            title: isTerminalBankStatus(bankApplication.status) ? bankApplication.status : 'Bank Decision',
                            value: isTerminalBankStatus(bankApplication.status) ? formatTimelineDate(decisionAt) : 'Waiting bank result',
                            done: isTerminalBankStatus(bankApplication.status) && Boolean(decisionAt)
                          }
                        ].map((step, stepIndex) => (
                          <div key={step.title} className="relative rounded-control border border-slate-100 bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption font-semibold ${
                                step.done ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'
                              }`}>
                                {stepIndex + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-micro uppercase text-slate-500">{step.title}</p>
                                <p className="mt-0.5 truncate font-mono text-footnote text-slate-700">{step.value}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {isExpanded && canManageBankApplications && (
                      <div className="mt-4 border-t border-slate-100 pt-4" data-dce-single-click-edit="">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('银行', 'Bank', "Bank")}</span>
                          <DoubleClickEditField
                            mode="select"
                            value={bankApplication.bank_name}
                            options={activeBankOptions.map((bankName) => ({ value: bankName, label: bankName }))}
                            onCommit={(value) => updateBankApplication(bankApplication.id, { bank_name: value })}
                            displayClassName={detailDisplayClass}
                            inputClassName={detailInputClass}
                            ariaLabel={`Update bank for ${bankApplication.id}`}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('轮次', 'Round', "Bulat")}</span>
                          <DoubleClickEditField
                            type="number"
                            value={bankApplication.round_no}
                            onCommit={(value) => updateBankApplication(bankApplication.id, { round_no: Number(value) || 1 })}
                            normalizeValue={(value) => String(Number(value) || 1)}
                            displayClassName={detailDisplayClass}
                            inputClassName={detailInputClass}
                            ariaLabel={`Update round for ${bankApplication.id}`}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('申请状态', 'Application Status', "Status Permohonan")}</span>
                          <DoubleClickEditField
                            mode="select"
                            value={bankApplication.status}
                            options={BANK_APPLICATION_STATUSES.map((status) => ({ value: status, label: trBankStatus(status) }))}
                            onCommit={(value) => {
                              const nextStatus = value as BankApplicationStatus;
                              // Clear fields that no longer apply so stale
                              // reject/offer data cannot leak into reporting.
                              updateBankApplicationStatus(bankApplication, nextStatus);
                            }}
                            displayClassName={`${detailDisplayClass} ${getBankStatusBadgeClass(bankApplication.status)}`}
                            inputClassName={detailInputClass}
                            formatDisplay={() => trBankStatus(bankApplication.status)}
                            ariaLabel={`Update application status for ${bankApplication.id}`}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('客户申请日期', 'Customer Applied Date', "Tarikh Permohonan Pelanggan")}</span>
                          <DoubleClickEditField
                            // submitted_at is application information: Rules
                            // refuse it without the Edit Loan Application switch.
                            copyOnly={!canEditAllInformation}
                            type="date"
                            value={formatDateInput(editedApplicationInfo.submitted_at)}
                            onCommit={(value) => updateApplicationInfo('submitted_at', toIsoDate(value))}
                            displayClassName={`${detailDisplayClass} font-mono`}
                            inputClassName={detailInputClass}
                            formatDisplay={() => formatTimelineDate(editedApplicationInfo.submitted_at)}
                            ariaLabel={`Update customer applied date for ${bankApplication.id}`}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('提交人', 'Submitted By', "Dihantar Oleh")}</span>
                          <DoubleClickEditField
                            type="text"
                            value={bankApplication.submitted_by}
                            onCommit={(value) => updateBankApplication(bankApplication.id, { submitted_by: value })}
                            displayClassName={detailDisplayClass}
                            inputClassName={detailInputClass}
                            ariaLabel={`Update submitted by for ${bankApplication.id}`}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('提交银行日期', 'Submitted To Bank Date', "Tarikh Dihantar ke Bank")}</span>
                          <DoubleClickEditField
                            type="date"
                            value={formatDateInput(bankApplication.submitted_at)}
                            onCommit={(value) => updateBankApplication(bankApplication.id, { submitted_at: toIsoDate(value) })}
                            displayClassName={`${detailDisplayClass} font-mono`}
                            inputClassName={detailInputClass}
                            formatDisplay={() => bankApplication.submitted_at
                              ? new Date(bankApplication.submitted_at).toLocaleDateString(getAppLocale(), {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })
                              : tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                            ariaLabel={`Update submitted at for ${bankApplication.id}`}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('银行跟进日期', 'Bank Follow Up Date', "Tarikh susulan bank")}</span>
                          <DoubleClickEditField
                            type="date"
                            value={formatDateInput(bankApplication.next_follow_up_at || '')}
                            onCommit={(value) => updateBankApplication(bankApplication.id, { next_follow_up_at: toIsoDate(value) })}
                            emptyText={tr('点击安排', 'Click to schedule', "Klik untuk menjadualkan")}
                            displayClassName={`${detailDisplayClass} font-mono`}
                            inputClassName={detailInputClass}
                            formatDisplay={() => bankApplication.next_follow_up_at
                              ? new Date(bankApplication.next_follow_up_at).toLocaleDateString(getAppLocale(), {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })
                              : tr('点击安排', 'Click to schedule', "Klik untuk menjadualkan")}
                            ariaLabel={`Update bank follow up date for ${bankApplication.id}`}
                          />
                        </label>

                        {bankApplication.status === 'Rejected' && (
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <span className="text-micro uppercase text-slate-500">
                              {tr('拒贷代码（可多个）', 'Reject CODEs (multiple)', "KOD Tolak (berbilang)")}
                            </span>
                            <BankRejectCodesInput
                              value={bankApplication.reject_code}
                              definitions={errorCodeDefinitions}
                              onChange={(value) => {
                                const rejectDefinitions = getRejectDefinitions(value, errorCodeDefinitions);
                                const linkedRejectReason = getLinkedRejectReason(value, errorCodeDefinitions);
                                const hasRejectCodes = normalizeRejectCodes(value).length > 0;
                                updateBankApplication(bankApplication.id, {
                                  reject_code: value,
                                  reject_reason: hasRejectCodes ? linkedRejectReason : '',
                                  status_reason: hasRejectCodes ? linkedRejectReason : '',
                                  reason_category: hasRejectCodes ? rejectDefinitions[0]?.category || '' : '',
                                  reject_next_step: bankApplication.reject_next_step || rejectDefinitions[0]?.default_next_step,
                                  next_action: bankApplication.next_action || (
                                    rejectDefinitions[0]?.default_next_step
                                      ? rejectNextStepStoredLabel(rejectDefinitions[0].default_next_step)
                                      : ''
                                  )
                                });
                              }}
                              ariaLabel={`Update reject code for ${bankApplication.id}`}
                            />
                            <p className="text-caption text-slate-500">
                              {tr(
                                'CODE 必须先存在 Error Code Database；每个 CODE 会自动关联 Reject Reason。',
                                'CODEs must exist in Error Code Database; each CODE links its Reject Reason automatically.',
                                'KOD mesti wujud dalam Pangkalan Data Kod Ralat; setiap KOD memautkan Sebab Tolak secara automatik.'
                              )}
                            </p>
                          </div>
                        )}

                        {showOfferFields && (
                          <>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabel('approvedLoan')}</span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.offer_amount}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { offer_amount: value })}
                                placeholder="85000"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update offer amount for ${bankApplication.id}`}
                              />
                            </label>

                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabel('sellingPrice')}</span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.selling_price || ''}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { selling_price: value })}
                                normalizeValue={(value) => value.replace(/[^\d.]/g, '')}
                                placeholder={getBankSellingPrice(application, { ...bankApplication, selling_price: '' }) || '11340'}
                                emptyText={getBankSellingPrice(application, bankApplication)
                                  ? tr(`用车价 RM ${getBankSellingPrice(application, bankApplication)}`, `From the deal: RM ${getBankSellingPrice(application, bankApplication)}`, `Dari urusan: RM ${getBankSellingPrice(application, bankApplication)}`)
                                  : tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update selling price for ${bankApplication.id}`}
                              />
                            </label>

                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">Interest %</span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.interest_rate}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { interest_rate: value })}
                                placeholder="3.20"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update interest rate for ${bankApplication.id}`}
                              />
                            </label>

                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabel('tenureMonths')}<span className="text-rose-500"> *</span></span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.tenure}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { tenure: value })}
                                placeholder="84"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update tenure for ${bankApplication.id}`}
                              />
                              {Number(bankApplication.tenure) > 0 && (
                                <span className="text-caption text-slate-500">
                                  {tr(`= ${Math.round(Number(bankApplication.tenure) / 12 * 10) / 10} 年`, `= ${Math.round(Number(bankApplication.tenure) / 12 * 10) / 10} years`, `= ${Math.round(Number(bankApplication.tenure) / 12 * 10) / 10} tahun`)}
                                </span>
                              )}
                            </label>

                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabel('monthlyInstalment')}<span className="text-rose-500"> *</span></span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.monthly_installment}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { monthly_installment: value })}
                                placeholder="1135"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update monthly installment for ${bankApplication.id}`}
                              />
                            </label>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabelWith('deposit', OPTIONAL)}</span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.deposit_amount || ''}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { deposit_amount: value })}
                                normalizeValue={(value) => value.replace(/[^\d.]/g, '')}
                                placeholder="500"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update deposit for ${bankApplication.id}`}
                              />
                            </label>

                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabelWith('plateNumber', OPTIONAL)}</span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.number_plate || ''}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { number_plate: value })}
                                normalizeValue={(value) => value.toUpperCase()}
                                placeholder="PKN 1234"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update number plate for ${bankApplication.id}`}
                              />
                            </label>

                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabel('engineNumber')}</span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.engine_number || ''}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { engine_number: value })}
                                normalizeValue={(value) => value.toUpperCase()}
                                placeholder="E3X9E-123456"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update engine number for ${bankApplication.id}`}
                              />
                            </label>

                            <label className="flex flex-col gap-1.5">
                              <span className="text-micro uppercase text-slate-500">{fieldLabel('chassisNumber')}</span>
                              <DoubleClickEditField
                                type="text"
                                value={bankApplication.chassis_number || ''}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { chassis_number: value })}
                                normalizeValue={(value) => value.toUpperCase()}
                                placeholder="PMKSG1234X0123456"
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName={detailDisplayClass}
                                inputClassName={detailInputClass}
                                ariaLabel={`Update chassis number for ${bankApplication.id}`}
                              />
                            </label>
                          </>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {reasonUi.showReason && (
                          <label className="flex flex-col gap-1.5">
                            <span className="text-micro uppercase text-slate-500">{reasonUi.label}</span>
                            {bankApplication.status === 'Rejected' && normalizeRejectCodes(bankApplication.reject_code).length > 0 ? (
                              <div className="min-h-16 rounded-control border border-slate-100 bg-slate-50 px-3 py-2 text-footnote text-slate-700">
                                {getLinkedRejectReason(bankApplication.reject_code, errorCodeDefinitions)}
                              </div>
                            ) : bankApplication.status === 'Rejected' ? (
                              <textarea
                                rows={2}
                                value={bankApplication.reject_reason}
                                onChange={(event) => updateBankApplication(bankApplication.id, {
                                  reject_reason: event.target.value,
                                  status_reason: event.target.value
                                })}
                                placeholder={reasonUi.placeholder}
                                className="min-h-16 resize-none rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:ring-1 focus:ring-indigo-100"
                                aria-label={`Update reason for ${bankApplication.id}`}
                              />
                            ) : (
                              <DoubleClickEditField
                                mode="textarea"
                                rows={2}
                                value={bankApplication.status_reason}
                                onCommit={(value) => updateBankApplication(bankApplication.id, { status_reason: value })}
                                placeholder={reasonUi.placeholder}
                                emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                                displayClassName="block min-h-16 rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                inputClassName="rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote text-slate-700 outline-none resize-none focus:ring-1 focus:ring-indigo-100"
                                ariaLabel={`Update reason for ${bankApplication.id}`}
                              />
                            )}
                          </label>
                        )}

                        <label className="flex flex-col gap-1.5">
                          <span className="text-micro uppercase text-slate-500">{tr('下一步动作', 'Next Action', "Tindakan Seterusnya")}</span>
                          {bankApplication.status === 'Rejected' ? (
                            <select
                              value={bankApplication.reject_next_step || ''}
                              onChange={(event) => {
                                const nextStep = event.target.value as RejectNextStepType;
                                updateBankApplication(bankApplication.id, {
                                  reject_next_step: nextStep,
                                  next_action: rejectNextStepStoredLabel(nextStep)
                                });
                              }}
                              className="min-h-16 rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:ring-1 focus:ring-indigo-100"
                              aria-label={`Update reject next step for ${bankApplication.id}`}
                              required
                            >
                              <option value="">{tr('选择拒绝后的下一步', 'Select the next step after rejection', 'Pilih langkah seterusnya selepas ditolak')}</option>
                              {REJECT_NEXT_STEPS.map((nextStep) => (
                                <option key={nextStep} value={nextStep}>
                                  {rejectNextStepLabel(nextStep)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <BankNextActionSelect
                              value={bankApplication.next_action}
                              options={bankNextActionOptions}
                              onChange={(value) => updateBankApplication(bankApplication.id, { next_action: value })}
                              ariaLabel={`Update next action for ${bankApplication.id}`}
                            />
                          )}
                        </label>

                        {reasonUi.showBankNotes && (
                        <label className="flex flex-col gap-1.5 md:col-span-2">
                          <span className="text-micro uppercase text-slate-500">Bank Notes</span>
                          <DoubleClickEditField
                            mode="textarea"
                            rows={2}
                            value={bankApplication.notes}
                            onCommit={(value) => updateBankApplication(bankApplication.id, { notes: value })}
                            placeholder={tr('调整资料、客户决定、没有 accept offer 的原因...', 'Adjustments, customer decision, reason the offer was not accepted...', "Pelarasan, keputusan pelanggan, sebab tawaran tidak diterima...")}
                            emptyText={tr('点击填写', 'Click to fill', "Klik untuk mengisi")}
                            displayClassName="block min-h-16 rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                            inputClassName="rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote text-slate-700 outline-none resize-none focus:ring-1 focus:ring-indigo-100"
                            ariaLabel={`Update bank notes for ${bankApplication.id}`}
                          />
                        </label>
                        )}
                      </div>
                      </div>
                      )}
                    </div>
                    );
                  })}

                  {editedBankApplications.length === 0 && (
                    <div className="rounded-card border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-footnote text-slate-500">
                      {tr('还没有 bank application record。点击 Add Bank 开始记录。', 'No bank application records yet. Click Add Bank to start.', "Tiada rekod permohonan bank lagi. Klik Tambah Bank untuk bermula.")}
                    </div>
                  )}
                </div>
              </div>
              )}



            </div>

            {/* Bottom Sticky Action buttons */}
            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100/60 bg-slate-50 p-4 sm:grid-cols-4 sm:p-6">
              {showUndoControl && (
                <div className="col-span-2 w-full sm:col-span-4">
                  {showUndoPanel && undoAvailability.allowed ? (
                    <div className="mb-3 rounded-card border border-amber-200 bg-amber-50 p-3">
                      <p className="text-footnote font-semibold text-amber-900">
                        {tr(
                          `撤回 ${getLoanWorkflowActionLabel(undoCheckpoint!.action)}`,
                          `Undo ${getLoanWorkflowActionLabel(undoCheckpoint!.action)}`,
                          `Batalkan ${getLoanWorkflowActionLabel(undoCheckpoint!.action)}`
                        )}
                      </p>
                      <p className="mt-1 text-footnote text-amber-700">
                        {tr('系统会恢复上一步负责人和任务，通知会自动同步。', 'The previous owner and task will be restored, and notifications will reconcile automatically.', "Pemilik dan tugas sebelumnya akan dipulihkan, dan notifikasi akan diselaraskan secara automatik.")}
                      </p>
                      <textarea
                        autoFocus
                        value={undoReason}
                        onChange={(event) => setUndoReason(event.target.value)}
                        maxLength={500}
                        rows={2}
                        placeholder={tr('填写撤回原因（必填）', 'Undo reason (required)', "Sebab pembatalan (wajib)")}
                        className="mt-3 w-full resize-none rounded-control border border-amber-200 bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:ring-2 focus:ring-amber-100"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUndoPanel(false);
                            setUndoReason('');
                          }}
                          className="rounded-control px-3 py-2 text-callout text-slate-500 hover:bg-white"
                        >
                          {tr('取消', 'Cancel', "Batal")}
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting || undoReason.trim().length < 3}
                          onClick={() => handleSave('UNDO_LAST_ACTION', undoReason)}
                          className="rounded-control bg-amber-700 px-3 py-2 text-callout text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {tr('确认撤回', 'Confirm Undo', "Sahkan Pembatalan")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!undoAvailability.allowed || isSubmitting}
                      title={undoAvailability.allowed ? '' : undoBlockedMessage}
                      onClick={() => setShowUndoPanel(true)}
                      className="mb-2 inline-flex items-center gap-2 rounded-control border border-amber-200 bg-white px-3 py-2 text-callout text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-500"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {tr('撤回上一步', 'Undo Last Action', "Batalkan Tindakan Terakhir")}
                    </button>
                  )}
                </div>
              )}

              {canShowCancelApplication && showCancelApplicationPanel && (
                <div data-testid="cancel-application-panel" className="col-span-2 w-full rounded-card border border-rose-200 bg-rose-50 p-3 sm:col-span-4">
                  <p className="text-footnote font-semibold text-rose-900">
                    {application.purchase_method === 'Loan'
                      ? tr('客户撤回这份贷款申请', 'Customer withdraws this loan application', "Pelanggan menarik balik permohonan pinjaman ini")
                      : tr('取消这份现金申请', 'Cancel this cash application', "Batalkan permohonan tunai ini")}
                  </p>
                  {cancelBankApplicationsToWithdraw.length > 0 && (
                    <p data-testid="cancel-application-bank-notice" className="mt-1 text-footnote text-rose-700">
                      {tr(
                        `${cancelBankApplicationsToWithdraw.length} 个银行申请会标记为客户撤回，请通知银行。`,
                        `${cancelBankApplicationsToWithdraw.length} bank application(s) will be marked as withdrawn by the customer. Inform the bank.`,
                        `${cancelBankApplicationsToWithdraw.length} permohonan bank akan ditanda sebagai ditarik balik oleh pelanggan. Maklumkan kepada bank.`
                      )}
                    </p>
                  )}
                  <p className="mt-1 text-footnote text-rose-700">
                    {application.deal_finance
                      ? tr('申请会结案为 CANCELLED。这单已有财务记录，佣金与库存要 Super Admin 在 Finance Center 冲销。', 'The application closes as CANCELLED. It already has a finance record, so Super Admin must reverse the commission and release the stock unit in Finance Center.', "Permohonan akan ditutup sebagai CANCELLED. Ia sudah mempunyai rekod kewangan, jadi Pentadbir Super perlu membalikkan komisen dan melepaskan unit stok di Pusat Kewangan.")
                      : tr('申请会结案为 CANCELLED，之后不能再推进，也不能撤回。', 'The application closes as CANCELLED and cannot be moved forward or undone afterwards.', "Permohonan akan ditutup sebagai CANCELLED dan tidak boleh diteruskan atau dibatalkan selepas itu.")}
                  </p>
                  <textarea
                    autoFocus
                    value={cancelApplicationReason}
                    onChange={(event) => setCancelApplicationReason(event.target.value)}
                    maxLength={500}
                    rows={2}
                    aria-label="Cancellation reason"
                    placeholder={tr('填写取消原因（必填）', 'Cancellation reason (required)', "Sebab pembatalan (wajib)")}
                    className="mt-3 w-full resize-none rounded-control border border-rose-200 bg-white px-3 py-2 text-footnote text-slate-700 outline-none focus:ring-2 focus:ring-rose-100"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCancelApplicationPanel(false);
                        setCancelApplicationReason('');
                      }}
                      className="rounded-control px-3 py-2 text-callout text-slate-500 hover:bg-white"
                    >
                      {tr('返回', 'Back', "Kembali")}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || cancelApplicationReason.trim().length < 3}
                      onClick={() => handleSave('CANCEL_APPLICATION', cancelApplicationReason)}
                      className="rounded-control bg-rose-700 px-3 py-2 text-callout text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {tr('确认取消申请', 'Confirm Cancel Application', "Sahkan Pembatalan Permohonan")}
                    </button>
                  </div>
                </div>
              )}

              {/* Withdrawal is its own visible button, not a More-menu item:
                  staff could not find it, and "Cancel" next to it closed the drawer. */}
              {canShowCancelApplication && !showCancelApplicationPanel && (
                <button
                  type="button"
                  aria-label="Cancel Application"
                  data-testid="drawer-withdraw-application"
                  onClick={() => setShowCancelApplicationPanel(true)}
                  className="min-h-12 rounded-card border border-rose-200 bg-white px-4 py-3 text-center text-callout font-semibold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50"
                >
                  {isCashPurchase
                    ? tr('取消申请', 'Cancel application', 'Batalkan permohonan')
                    : tr('客户撤回申请', 'Customer withdraws', 'Pelanggan tarik balik')}
                </button>
              )}

              <button
                id="drawer-cancel-btn"
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-card border border-slate-200 bg-white px-4 py-3 text-center text-callout text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                {tr('关闭', 'Close', "Tutup")}
              </button>

              {secondaryWorkflowActions.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    aria-label={tr('更多操作', 'More actions', "Tindakan lain")}
                    aria-expanded={showMoreActions}
                    onClick={() => setShowMoreActions((current) => !current)}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-card border border-slate-200 bg-white px-4 py-3 text-callout text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span>{tr('更多', 'More', "Lagi")}</span>
                  </button>
                  {showMoreActions && (
                    <div className="absolute bottom-full left-0 z-30 mb-2 min-w-full overflow-hidden rounded-card border border-slate-200 bg-white p-1.5 shadow-e3 shadow-slate-900/10 sm:w-56">
                      {secondaryWorkflowActions.map((action) => (
                        <button
                          key={action.key}
                          type="button"
                          aria-label={action.accessibleName}
                          title={action.title}
                          disabled={isSubmitting || action.disabled}
                          onClick={() => {
                            setShowMoreActions(false);
                            action.onClick();
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-control px-3 py-2.5 text-left text-callout text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(canEditAllInformation || canManageBankApplications || canManageDocuments) && (
                <button
                  id="drawer-save-btn"
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSubmitting}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-card border px-4 py-3 text-callout transition-colors ${
                    isSubmitting
                      ? 'cursor-wait border-slate-300 bg-slate-300 text-white'
                      : hasUnsavedChanges
                        ? 'border-brand bg-brand text-white hover:bg-brand-deep'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{tr('保存中...', 'Saving...', "Menyimpan...")}</span>
                    </>
                  ) : (
                    <span>{tr('保存修改', 'Save Changes', "Simpan Perubahan")}</span>
                  )}
                </button>
              )}

              {primaryWorkflowAction && (
                <button
                  type="button"
                  aria-label={primaryWorkflowAction.accessibleName}
                  title={primaryWorkflowAction.title}
                  onClick={primaryWorkflowAction.onClick}
                  disabled={isSubmitting || primaryWorkflowAction.disabled}
                  className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-card bg-brand px-4 py-3 text-callout text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-300 sm:col-span-1"
                >
                  <span>{primaryWorkflowAction.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {application && (
            <ApplicationActivityChat
              isOpen={isActivityChatOpen}
              onOpenChange={setIsActivityChatOpen}
              entries={application.activity_thread || []}
              auditLogs={auditLogs}
              currentStaffName={currentStaffName}
              composer={activityComposer}
              formatTime={formatActivityTime}
            />
          )}

          {imageViewerDocument && (
            <DocumentImageViewer
              src={imageViewerDocument.file_data_url}
              fileName={imageViewerDocument.file_name}
              onClose={() => setImageViewerDocument(null)}
            />
          )}
        </>
      )}
    </>
  );
}

export default React.memo(DetailDrawer);
