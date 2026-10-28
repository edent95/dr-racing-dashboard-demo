/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowUpRight, BadgeDollarSign, BellRing, Building2, CalendarDays, CheckCircle2, EyeOff, FilePlus2, FileUp, FileWarning, ListChecks, MessageCircle, Plus, RotateCcw, Send, Target, Trash2, UserCheck, Users, X, type LucideIcon } from 'lucide-react';
import { ApprovalRequest, BankApplication, BankDefinition, CalendarNote, CustomerRawMatch, CustomMission, CustomMissionMetricType, CustomMissionTimeframe, DealFinance, DeliveryPayment, getLoanPendingAction, getLoanPendingWith, LoanApplication, LoanStatus, NotificationItem, PurchaseMethod, QuickStockInput, RawCustomerChannel, RawCustomerLead, RawLeadFollowUpStatus, RejectNextStepType, RoleAccount, RoleNavAccessSetting, VehicleCatalogItem, VehicleCondition, VehicleStockUnit } from '../types';
import { getMissingDocumentLabels, normalizeDocumentChecklist } from '../utils/documentChecklist';
import { getMissingApplicationInformationLabels } from '../utils/applicationCompleteness';
import { getApplicationRejectCodes } from '../utils/rejectCodes';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';
import { parseTikTokLeadCsv } from '../utils/rawLeadEntry';
import type { MissingCheckoutIncident } from '../utils/attendanceSummary';
import { getApplicationIdsRequiringVehicleStock, getVehicleStockReference } from '../utils/vehicleStock';
import type { AttendanceEvent, AttendanceIncidentResolution } from '../services/dashboardRepository';
import { getAppLocale, tr, trBankStatus, trFollowUpStatus, trLoanStatus, trNotificationMessage, trNotificationTitle, trRole } from '../lib/i18n';
import MoneyInput from './MoneyInput';
import { fieldLabel, fieldLabelWith, REQUIRED } from '../data/fieldLabels';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';
import CustomerRelationshipRiskPage from './CustomerRelationshipRiskPage';
import { useBrandedDialog } from './BrandedDialogProvider';
import type { BankQuickAction } from '../utils/loanTableBankColumns';
import { BANK_QUICK_ACTION_BUTTONS } from './bankQuickActions';
import { DealSettlementModal } from './DealSettlementModal';
import { useTaskClock, getStartOfDay } from '../hooks/useTaskClock';
import {
  buildApplicationMatchIndex,
  buildOpenMissingCheckoutIncidents,
  buildTaskInboxTasks,
  calculateMissionProgress,
  filterVisibleTaskInboxTasks,
  formatShortDate,
  getDueTime,
  getExpectedMissionProgress,
  getHiddenTaskStorageKey,
  getMissionRange,
  isStaffInMissionScope,
  readHiddenTaskIds,
  toTaskInboxMirrorItem,
  type InboxTask,
  type TaskInboxMirrorCategory,
  type TaskInboxMirrorItem,
  type TaskInboxMirrorSeverity
} from './taskInbox/buildTaskInboxTasks';
import { hasAdminWorkAccess } from '../utils/staffRoles';
import { isTierCommission } from '../utils/commissionTiers';

export type { TaskInboxMirrorCategory, TaskInboxMirrorItem, TaskInboxMirrorSeverity } from './taskInbox/buildTaskInboxTasks';
type TaskCategory = TaskInboxMirrorCategory;
type TaskFilter = 'all' | 'newApplication' | TaskCategory;
type TaskSeverity = TaskInboxMirrorSeverity;

interface TaskInboxPageProps {
  applications: LoanApplication[];
  calendarNotes: CalendarNote[];
  rawCustomerLeads: RawCustomerLead[];
  rawCustomerMatches: CustomerRawMatch[];
  roleAccounts: RoleAccount[];
  roleNavAccess: RoleNavAccessSetting[];
  customMissions: CustomMission[];
  notifications: NotificationItem[];
  attendanceEvents: AttendanceEvent[];
  attendanceIncidentResolutions: AttendanceIncidentResolution[];
  currentStaffName: string;
  currentStaffRole: RoleAccount['role'];
  managementStaffName?: string;
  viewerStaffName: string;
  viewerStaffRole: RoleAccount['role'];
  // Role Access → Lead Pool page details (they also apply here on Home).
  allowLeadImport?: boolean;
  allowLeadAdd?: boolean;
  canFilterStaffScope?: boolean;
  onStaffScopeChange?: (staffName: string) => void;
  onOpenApplication: (application: LoanApplication, target?: 'documentChecklist' | 'bankApplications' | 'addBank') => void;
  /** Bank follow-up quick decisions open the bank page on that form. */
  onBankQuickAction?: (application: LoanApplication, bankApplicationId: string, action: BankQuickAction) => void;
  onOpenMissions?: () => void;
  onOpenNotification: (notification: NotificationItem) => void;
  onOpenWhatsApp: (lead: RawCustomerLead, target: 'api' | 'web') => void;
  onUpdateLead: (leadId: string, updates: Partial<RawCustomerLead>) => void;
  onReleaseLead: (lead: RawCustomerLead) => void;
  onImportLeads: (leads: RawCustomerLead[], targetPool: 'public' | 'private') => void | Promise<void>;
  onAddLead: (lead: RawCustomerLead, targetPool: 'public' | 'private') => void | Promise<void>;
  onAssignPrivateLeads: (leads: RawCustomerLead[], assignedStaffId: string) => number;
  onDeleteLead: (lead: RawCustomerLead) => boolean;
  onDeleteLeads: (leads: RawCustomerLead[]) => number;
  onCompleteCashAcceptance: (application: LoanApplication, workflowAction?: 'COMPLETE_APPROVED_CONTACT' | 'NOTIFY_ADMIN' | 'APPROVE_CASH_PURCHASE') => Promise<boolean>;
  onAssignApplicationHandler: (applicationId: string, handlerName: string) => void | Promise<void>;
  onAssignApplicationAdmin: (applicationId: string, adminName: string) => void | Promise<void>;
  vehicleCatalog: VehicleCatalogItem[];
  /** Bank Database: each lender's auto-debit banks (the AEON card). */
  bankDefinitions?: BankDefinition[];
  onMarkBikeDelivered: (applicationId: string, stockUnitId: string) => Promise<boolean>;
  onOpenFinanceStock?: (model?: string) => void;
  onQuickAddStock?: (applicationId: string, model: string, input: QuickStockInput) => Promise<boolean>;
  onOpenFinanceDeal?: (applicationId: string) => void;
  onOpenDelivery?: (applicationId: string) => void;
  onMarkCommissionPaid?: (applicationId: string) => Promise<boolean>;
  onSaveDealFinance?: (applicationId: string, finance: DealFinance) => Promise<boolean>;
  loadDeliveryPayments?: (applicationId: string) => Promise<DeliveryPayment[] | null>;
  onUpdateMissingInfo: (
    application: LoanApplication,
    updates: { vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod }
  ) => Promise<boolean>;
  onAddCalendarTaskComment: (noteId: string, body: string) => Promise<boolean>;
  onSetCalendarNoteCompleted: (noteId: string, completed: boolean) => void | Promise<void>;
  onResolveMissingCheckout: (incident: MissingCheckoutIncident) => Promise<boolean>;
  approvalRequests?: ApprovalRequest[];
  onReviewApproval?: (id: string, decision: 'Approved' | 'Rejected') => void;
  staffLeaveRequests?: ApprovalRequest[];
  onReviewLeaveRequest?: (id: string, decision: 'Approved' | 'Rejected') => void | Promise<boolean>;
  onVisibleTasksChange?: (tasks: TaskInboxMirrorItem[]) => void;
  /** Shared task clock from App; the page runs its own clock when omitted. */
  now?: number;
  /** A task picked in the Notification Center; the page reveals and scrolls to it. */
  focusTaskRequest?: { taskId: string; key: number } | null;
  onFocusTaskHandled?: () => void;
}

type TaskInboxWorkspace = 'tasks' | 'openLeads' | 'relationships';
type MyLeadFilter = 'all' | 'contacted' | 'due' | 'interested';
type LeadDateFilter = 'all' | 'today' | 'yesterday' | 'earlier';
type LeadSortOrder = 'newest' | 'oldest';

interface StaffAttentionSummary {
  account: RoleAccount;
  actionCount: number;
  overdueCount: number;
  followUpCount: number;
  workloadCount: number;
  missionCount: number;
  missionProgress: number;
  behindMissionCount: number;
  level: 'critical' | 'warning' | 'healthy';
}

const FILTERS: { key: TaskFilter; zh: string; en: string; ms: string; Icon: LucideIcon }[] = [
  { key: 'all', zh: '全部任务', en: 'All Tasks', ms: 'Semua Tugasan', Icon: CalendarDays },
  { key: 'newApplication', zh: '新申请', en: 'New Applications', ms: 'Permohonan Baharu', Icon: FilePlus2 },
  { key: 'missing', zh: '缺失资料', en: 'Missing Info', ms: 'Maklumat Tiada', Icon: FileWarning },
  { key: 'rawLead', zh: '潜在客户', en: 'Lead', ms: 'Prospek', Icon: Users },
  { key: 'cash', zh: '现金', en: 'Cash', ms: 'Tunai', Icon: BadgeDollarSign },
  { key: 'bank', zh: '银行', en: 'Bank', ms: 'Bank', Icon: Building2 },
  { key: 'reminder', zh: '提醒', en: 'Reminder', ms: 'Peringatan', Icon: BellRing },
  { key: 'mission', zh: '任务', en: 'Mission', ms: 'Misi', Icon: Target }
];

const taskTableHeaderCellClass = 'whitespace-nowrap border-b border-r border-slate-200 px-3 font-bold last:border-r-0';
const taskTableBodyCellClass = 'border-b border-r border-slate-200 px-3 py-3 align-top last:border-r-0';

const severityStyleMap: Record<TaskSeverity, {
  rowBar: string;
  iconBg: string;
  iconText: string;
  label: string;
}> = {
  critical: {
    rowBar: 'shadow-[inset_3px_0_0_#f43f5e]',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    label: 'Critical' as const
  },
  warning: {
    rowBar: 'shadow-[inset_3px_0_0_#f59e0b]',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    label: 'Warning'
  },
  info: {
    rowBar: '',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    label: 'Info'
  },
  success: {
    rowBar: 'shadow-[inset_3px_0_0_var(--color-brand)]',
    iconBg: 'bg-brand-50',
    iconText: 'text-brand-ink',
    label: 'Progress'
  }
};

const trSeverityLabel = (label: string) => {
  const zhMap: Record<string, string> = { Critical: '紧急', Warning: '待办', Info: '信息', Progress: '进度' };
  const msMap: Record<string, string> = { Critical: 'Kritikal', Warning: 'Amaran', Info: 'Maklumat', Progress: 'Kemajuan' };
  return tr(zhMap[label] || label, label, msMap[label] || label);
};

const trDocumentStatus = (status: ReturnType<typeof normalizeDocumentChecklist>[number]['status']) => {
  if (status === 'Received') return tr('已收到', 'Received', "Diterima");
  if (status === 'Not Required') return tr('不需要', 'Not Required', "Tidak Diperlukan");
  return tr('缺失', 'Missing', "Tiada");
};

const trCategoryLabel = (category: string) => {
  const zhMap: Record<string, string> = { missing: '缺失资料', rawLead: '名单', cash: '现金', bank: '银行', reminder: '提醒', mission: '任务' };
  const msMap: Record<string, string> = { missing: 'Maklumat Tiada', rawLead: 'Prospek', cash: 'Tunai', bank: 'Bank', reminder: 'Peringatan', mission: 'Misi' };
  const enMap: Record<string, string> = { missing: 'Missing Info', rawLead: 'Lead', cash: 'Cash', bank: 'Bank', reminder: 'Reminder', mission: 'Mission' };
  return tr(zhMap[category] || category, enMap[category] || category, msMap[category] || category);
};

function getLeadCalendarDateKey(value?: string) {
  const date = new Date(value || '');

  if (Number.isNaN(date.getTime())) {
    return 'unknown';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function formatLeadDateDivider(value: string | undefined, today: Date) {
  const date = new Date(value || '');

  if (Number.isNaN(date.getTime())) {
    return tr('未知日期', 'Unknown Date', 'Tarikh Tidak Diketahui');
  }

  const todayKey = getLeadCalendarDateKey(today.toISOString());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateKey = getLeadCalendarDateKey(value);

  if (dateKey === todayKey) {
    return tr('今天', 'Today', 'Hari Ini');
  }
  if (dateKey === getLeadCalendarDateKey(yesterday.toISOString())) {
    return tr('昨天', 'Yesterday', 'Semalam');
  }

  return date.toLocaleDateString(getAppLocale(), {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}

function formatTaskCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString(getAppLocale(), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function SystemIcon({ icon: Icon, className = 'h-5 w-5' }: { icon: LucideIcon; className?: string }) {
  return <Icon aria-hidden="true" className={`${className} shrink-0`} strokeWidth={1.75} />;
}

function getTaskIcon(task: Pick<InboxTask, 'category' | 'isNewApplication'>, cardIconClass = 'h-8 w-8') {

  if (task.isNewApplication) {
    return <SystemIcon icon={FilePlus2} className={cardIconClass} />;
  }

  if (task.category === 'missing') {
    return <SystemIcon icon={AlertTriangle} className={cardIconClass} />;
  }

  if (task.category === 'rawLead') {
    return <SystemIcon icon={MessageCircle} className={cardIconClass} />;
  }

  if (task.category === 'bank') {
    return <SystemIcon icon={Building2} className={cardIconClass} />;
  }

  if (task.category === 'cash') {
    return <SystemIcon icon={Users} className={cardIconClass} />;
  }

  if (task.category === 'reminder') {
    return <SystemIcon icon={BellRing} className={cardIconClass} />;
  }

  return <SystemIcon icon={Target} className={cardIconClass} />;
}

function MissingInfoQuickEditor({
  application,
  onSave
}: {
  application: LoanApplication;
  onSave: (updates: { vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod }) => Promise<boolean>;
}) {
  const [vehicleCondition, setVehicleCondition] = useState<VehicleCondition>(application.vehicle_condition || '');
  const [purchaseMethod, setPurchaseMethod] = useState<PurchaseMethod>(application.purchase_method || '');
  const [isSaving, setIsSaving] = useState(false);
  const isComplete = Boolean(vehicleCondition && purchaseMethod);
  const hasChanges = vehicleCondition !== (application.vehicle_condition || '')
    || purchaseMethod !== (application.purchase_method || '');

  useEffect(() => {
    setVehicleCondition(application.vehicle_condition || '');
    setPurchaseMethod(application.purchase_method || '');
  }, [application.id, application.purchase_method, application.vehicle_condition]);

  return (
    <div className="mt-3 max-w-xl rounded-card border border-amber-100 bg-amber-50/40 p-3">
      <p className="text-micro uppercase text-amber-700">
        {tr('直接补齐资料', 'Complete missing info here', "Lengkapkan maklumat di sini")}
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {!application.vehicle_condition ? (
          <ToggleOptionGroup
            value={vehicleCondition}
            onChange={(value) => setVehicleCondition(value as VehicleCondition)}
            options={[
              { value: '', label: tr('选择新车 / 二手', 'Select New / Used', "Pilih Baharu / Terpakai") },
              { value: 'New', label: tr('新车', 'New', "Baharu") },
              { value: 'Used', label: tr('二手', 'Used', "Terpakai") }
            ]}
            ariaLabel={`Missing info vehicle condition ${application.id}`}
            className="w-full"
          />
        ) : null}
        {!application.purchase_method ? (
          <ToggleOptionGroup
            value={purchaseMethod}
            onChange={(value) => setPurchaseMethod(value as PurchaseMethod)}
            options={[
              { value: '', label: tr('选择现金 / 贷款', 'Select Cash / Loan', "Pilih Tunai / Pinjaman") },
              { value: 'Cash', label: tr('现金', 'Cash', "Tunai") },
              { value: 'Loan', label: tr('贷款', 'Loan', "Pinjaman") }
            ]}
            ariaLabel={`Missing info purchase method ${application.id}`}
            className="w-full"
          />
        ) : null}
        <button
          type="button"
          disabled={!isComplete || !hasChanges || isSaving}
          onClick={async () => {
            setIsSaving(true);
            try {
              await onSave({ vehicle_condition: vehicleCondition, purchase_method: purchaseMethod });
            } finally {
              setIsSaving(false);
            }
          }}
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-control bg-emerald-700 px-3 py-1.5 text-footnote font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:col-span-2 sm:justify-self-start"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {isSaving
            ? tr('保存中...', 'Saving...', "Menyimpan...")
            : tr('保存资料', 'Save info', "Simpan maklumat")}
        </button>
      </div>
    </div>
  );
}

const FOLLOW_UP_TASK_STATUSES: RawLeadFollowUpStatus[] = [
  'New',
  'Contacted',
  'No Reply',
  'Interested',
  'Submitted Loan',
  'Rejected',
  'Closed'
];

function RawLeadFollowUpQuickEditor({
  lead,
  onUpdate,
  onRelease
}: {
  lead: RawCustomerLead;
  onUpdate: (leadId: string, updates: Partial<RawCustomerLead>) => void;
  onRelease: (lead: RawCustomerLead) => void;
}) {
  const [noteDraft, setNoteDraft] = useState(lead.follow_up_note || '');

  useEffect(() => {
    setNoteDraft(lead.follow_up_note || '');
  }, [lead.follow_up_note]);

  const scheduleAfterDays = (days: number) => {
    const followUpAt = new Date();
    followUpAt.setDate(followUpAt.getDate() + days);
    followUpAt.setHours(9, 0, 0, 0);
    onUpdate(lead.id, { next_follow_up_at: followUpAt.toISOString() });
  };

  return (
    <div className="mt-3 rounded-card border border-amber-100 bg-amber-50/40 p-3">
      <p className="text-micro uppercase text-amber-700">
        {tr('直接处理跟进', 'Handle follow up here', "Urus susulan di sini")}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ToggleOptionGroup
          value={lead.follow_up_status || 'New'}
          options={FOLLOW_UP_TASK_STATUSES.map((status) => ({
            value: status,
            label: trFollowUpStatus(status)
          }))}
          onChange={(value) => onUpdate(lead.id, {
            follow_up_status: value as RawLeadFollowUpStatus,
            last_follow_up_at: new Date().toISOString()
          })}
          ariaLabel={`Update follow up status for ${lead.name || lead.id}`}
          className="min-w-[150px]"
          optionClassName="min-h-8 px-2.5 py-1.5"
        />
        {[
          [1, tr('明天', 'Tomorrow', "Esok")],
          [3, tr('3 天后', '3 days', "3 hari lagi")],
          [7, tr('7 天后', '7 days', "7 hari lagi")]
        ].map(([days, label]) => (
          <button
            key={String(days)}
            type="button"
            onClick={() => scheduleAfterDays(Number(days))}
            className="rounded-control border border-amber-100 bg-white px-3 py-2 text-caption font-semibold text-amber-700 transition-colors hover:bg-amber-100"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onUpdate(lead.id, { next_follow_up_at: '' })}
          className="rounded-control border border-slate-100 bg-white px-3 py-2 text-caption font-semibold text-slate-500 transition-colors hover:bg-slate-100"
        >
          {tr('不再提醒', 'No reminder', "Tiada peringatan")}
        </button>
        {lead.lead_visibility !== 'Private' && (
          <button
            type="button"
            onClick={() => onRelease(lead)}
            className="rounded-control border border-slate-100 bg-white px-3 py-2 text-caption font-semibold text-slate-500 transition-colors hover:bg-slate-100"
          >
            {tr('放回未分配', 'Return to unassigned', "Kembali ke belum ditugaskan")}
          </button>
        )}
      </div>
      <input
        type="text"
        value={noteDraft}
        onChange={(event) => setNoteDraft(event.target.value)}
        onBlur={() => {
          if (noteDraft !== (lead.follow_up_note || '')) {
            onUpdate(lead.id, {
              follow_up_note: noteDraft,
              last_follow_up_at: new Date().toISOString()
            });
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
        aria-label={`Follow up note for ${lead.name || lead.id}`}
        placeholder={tr('跟进备注', 'Follow up note', "Nota susulan")}
        className="mt-2 h-9 w-full rounded-control border border-amber-100 bg-white px-3 text-footnote text-slate-700 outline-none placeholder:text-slate-300 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
      />
    </div>
  );
}

// Inline "交车 / Deliver Bike" control: pick a stock unit, then confirm delivery.
function DeliveryQuickAction({
  options,
  noStockHint,
  running,
  onDeliver
}: {
  options: Array<{ id: string; label: string }>;
  noStockHint?: string;
  running: boolean;
  onDeliver: (stockUnitId: string) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState(options[0]?.id || '');
  useEffect(() => {
    if (!options.some((option) => option.id === selectedId)) {
      setSelectedId(options[0]?.id || '');
    }
  }, [options, selectedId]);

  if (options.length === 0) {
    return (
      <span className="inline-flex items-center rounded-control border border-amber-100 bg-amber-50 px-3 py-2 text-footnote font-bold text-amber-700">
        {noStockHint || tr('没有可用库存车，请库存任务负责人先补库存', 'No stock unit available — ask the assigned stock owner to add stock', "Tiada unit stok — minta pemilik tugasan stok menambah stok")}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <select
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
        disabled={running}
        aria-label={tr('选择交车的库存车', 'Select stock unit to deliver', "Pilih unit stok untuk dihantar")}
        className="h-9 max-w-[220px] rounded-control border border-slate-200 bg-white px-2 text-footnote text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:cursor-wait"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => { if (!running && selectedId) void onDeliver(selectedId); }}
        disabled={running || !selectedId}
        className="inline-flex items-center gap-1.5 rounded-control bg-emerald-700 px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300"
      >
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        {running ? tr('更新中...', 'Updating...', "Mengemas kini...") : tr('标记交车', 'Mark Delivered', "Tandakan Dihantar")}
      </button>
    </span>
  );
}

// 快速补库存弹窗: Operations adds one In-Stock unit (with cost) for the deal's
// vehicle model directly from the Task Inbox. Deal amounts belong to this
// application; only the physical unit and its costs are stored with the model.
export function QuickAddStockModal({
  application,
  model,
  onSave,
  onClose
}: {
  application: LoanApplication;
  model: string;
  onSave: (applicationId: string, model: string, input: QuickStockInput) => Promise<boolean>;
  onClose: () => void;
}) {
  const toMoney = (value: unknown) => Math.max(0, Number(value) || 0);
  // Owner 2026-10-18: only the cost side is entered here; the price, loan and
  // deposit are confirmed on the delivery checklist. The price below is a reference.
  const referencePrice = toMoney(application.deal_finance?.final_selling_price) || toMoney(application.vehicle_options?.[0]?.motor_selling_price);
  const [draft, setDraft] = useState(() => ({
    // Empty = the monthly commission tiers fill it in at delivery (owner 2026-10-21).
    commissionAmount: isTierCommission(application.deal_finance) ? 0 : toMoney(application.deal_finance?.commission_amount),
    purchaseCost: 0,
    transportCost: 0,
    repairCost: 0,
    freeGiftCost: 0,
    numberPlate: ''
  }));
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (saving || draft.purchaseCost <= 0) return;
    setSaving(true);
    const ok = await onSave(application.id, model, {
      selling_price: 0,
      loan_amount: toMoney(application.deal_finance?.loan_amount),
      deposit_amount: toMoney(application.deal_finance?.deposit_amount),
      commission_amount: draft.commissionAmount,
      purchase_cost: draft.purchaseCost,
      transport_cost: draft.transportCost,
      repair_cost: draft.repairCost,
      free_gift_cost: draft.freeGiftCost,
      number_plate: draft.numberPlate
    });
    if (ok) {
      onClose();
      return;
    }
    setSaving(false);
  };
  const moneyField = (label: string, key: 'commissionAmount' | 'purchaseCost' | 'transportCost' | 'repairCost' | 'freeGiftCost') => (
    <MoneyInput label={label} value={draft[key]} onChange={(value) => setDraft((current) => ({ ...current, [key]: value }))} />
  );
  const totalCost = draft.purchaseCost + draft.transportCost + draft.repairCost + draft.freeGiftCost;
  const dealSellingPrice = referencePrice;
  const estimatedNetProfit = dealSellingPrice - totalCost - draft.commissionAmount;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-panel bg-white p-5 shadow-e3" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-headline text-slate-900">{tr('快速补库存', 'Quick Add Stock', 'Tambah Stok Pantas')}</h3>
            <p className="mt-0.5 text-footnote text-slate-500">{model} · {tr('客户', 'Customer', 'Pelanggan')} {application.applicant_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-control p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <section className="rounded-card bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-chip bg-emerald-600 font-mono text-headline text-white">+</span>
              <span className="text-micro uppercase text-emerald-700">{tr('成交价格 / 融资资料', 'Deal Price / Financing Details', 'Harga Urus Niaga / Butiran Pembiayaan')}</span>
            </div>
            <p data-testid="quick-stock-price-note" className="text-footnote text-emerald-900">
              {tr(
                '售价、批核贷款和订金由 Admin 在交车清单第 1 步核对，交车时自动带入。这里不用填。',
                'The selling price, approved loan and deposit are confirmed by Admin in delivery checklist step 1 and copied in at delivery. Nothing to fill in here.',
                'Harga jualan, pinjaman diluluskan dan deposit disahkan oleh Admin dalam langkah 1 senarai penghantaran dan disalin semasa penghantaran. Tiada apa perlu diisi di sini.'
              )}
            </p>
            {referencePrice > 0 && (
              <p className="mt-2 text-caption text-emerald-800">{tr('参考售价', 'Reference price', 'Harga rujukan')}: RM{referencePrice.toLocaleString('en-MY', { maximumFractionDigits: 2 })}</p>
            )}
          </section>

          <section className="rounded-card bg-rose-50/70 p-4 ring-1 ring-rose-100">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-chip bg-rose-600 font-mono text-headline text-white">−</span>
              <span className="text-micro uppercase text-rose-700">{tr('车辆成本 / 支出', 'Vehicle Costs / Outgoing Amounts', 'Kos Kenderaan / Jumlah Keluar')}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {moneyField(`− ${fieldLabelWith('purchaseCost', REQUIRED)}`, 'purchaseCost')}
              {moneyField(`− ${fieldLabel('transportCost')}`, 'transportCost')}
              {moneyField(`− ${fieldLabel('repairCost')}`, 'repairCost')}
              {moneyField(`− ${fieldLabel('accessoriesCost')}`, 'freeGiftCost')}
              {moneyField(tr('− 佣金(空白 = 按月度分级自动算)', '− Commission (blank = monthly tier, auto)', '− Komisen (kosong = tahap bulanan, auto)'), 'commissionAmount')}
            </div>
          </section>
        </div>
        <label className="mt-3 block space-y-1 text-micro uppercase text-slate-500">
          <span className="block">{tr('车辆基本资料', 'Vehicle details', 'Butiran kenderaan') + ' · ' + fieldLabel('plateNumber') + tr('(有就填，新车在 JPJ 那步补)', ' (if known; a new bike gets it at JPJ)', ' (jika ada; motor baharu dapat di JPJ)')}</span>
          <input
            type="text"
            value={draft.numberPlate}
            onChange={(event) => setDraft((current) => ({ ...current, numberPlate: event.target.value }))}
            placeholder="VEE4989"
            className="min-h-10 w-full rounded-control border border-slate-200 bg-white px-3 py-2 font-mono text-footnote font-bold uppercase text-slate-700 shadow-e1 outline-none"
          />
        </label>
        <div className="mt-3 grid gap-2 rounded-card bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            [tr('+ 参考售价', '+ Reference Price', '+ Harga Rujukan'), dealSellingPrice, 'text-emerald-700'],
            [tr('− 总成本', '− Total Landed Cost', '− Jumlah Kos'), totalCost, 'text-rose-700'],
            [draft.commissionAmount > 0 ? tr('− 佣金（手动填写）', '− Commission (manual)', '− Komisen (manual)') : tr('− 佣金（交车后按分级）', '− Commission (by tier after delivery)', '− Komisen (ikut tahap selepas penghantaran)'), draft.commissionAmount, 'text-rose-700'],
            [tr('= 预计净利润', '= Estimated Net Profit', '= Anggaran Untung Bersih'), estimatedNetProfit, estimatedNetProfit < 0 ? 'text-rose-700' : 'text-slate-900']
          ] as Array<[string, number, string]>).map(([label, amount, tone]) => (
            <span key={label} className="rounded-control bg-white px-3 py-2 ring-1 ring-slate-100">
              <span className="block text-micro uppercase text-slate-500">{label}</span>
              <span className={`mt-1 block font-mono text-headline ${tone}`}>RM{amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}</span>
            </span>
          ))}
        </div>
        <p className="mt-3 rounded-control bg-slate-50 px-3 py-2 text-caption leading-relaxed text-slate-500">
          {tr('卖价、贷款额、订金和手动佣金只保存到这位客户的成交资料；车辆成本保存到这台库存车。Vehicle Info 只用于车型资料，不会读取或改写价格。', 'Selling price, loan amount, deposit, and manual commission are saved only to this customer deal; vehicle costs are saved to the physical stock unit. Vehicle Info is used only for model data and its prices are neither read nor changed.', 'Harga jualan, jumlah pinjaman, deposit dan komisen manual disimpan hanya untuk urus niaga pelanggan ini; kos kenderaan disimpan pada unit stok fizikal. Vehicle Info digunakan untuk data model sahaja dan harganya tidak dibaca atau diubah.')}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-500 ring-1 ring-slate-100 hover:text-brand-ink">{tr('关闭', 'Close', 'Tutup')}</button>
          <button
            type="button"
            disabled={saving || draft.purchaseCost <= 0}
            title={draft.purchaseCost > 0 ? '' : tr('请填写购买成本', 'Enter the purchase cost', 'Isi kos belian')}
            onClick={() => { void save(); }}
            className="rounded-control bg-emerald-700 px-3 py-2 text-footnote font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? tr('保存中...', 'Saving...', 'Menyimpan...') : tr('保存并入库', 'Save & Add Stock', 'Simpan & Tambah Stok')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaskInboxPage({
  applications,
  calendarNotes,
  rawCustomerLeads,
  rawCustomerMatches,
  roleAccounts,
  roleNavAccess,
  customMissions,
  notifications,
  attendanceEvents,
  attendanceIncidentResolutions,
  currentStaffName,
  currentStaffRole,
  managementStaffName = '',
  viewerStaffName,
  viewerStaffRole,
  allowLeadImport = true,
  allowLeadAdd = true,
  canFilterStaffScope = false,
  onStaffScopeChange,
  onOpenApplication,
  onBankQuickAction,
  onOpenMissions,
  onOpenNotification,
  onOpenWhatsApp,
  onUpdateLead,
  onReleaseLead,
  onImportLeads,
  onAddLead,
  onAssignPrivateLeads,
  onDeleteLead,
  onDeleteLeads,
  onCompleteCashAcceptance,
  onAssignApplicationHandler,
  onAssignApplicationAdmin,
  vehicleCatalog,
  bankDefinitions,
  onMarkBikeDelivered,
  onOpenFinanceStock,
  onQuickAddStock,
  onOpenFinanceDeal,
  onOpenDelivery,
  onMarkCommissionPaid,
  onSaveDealFinance,
  loadDeliveryPayments,
  onUpdateMissingInfo,
  onAddCalendarTaskComment,
  onSetCalendarNoteCompleted,
  onResolveMissingCheckout,
  approvalRequests = [],
  onReviewApproval,
  staffLeaveRequests = [],
  onReviewLeaveRequest,
  onVisibleTasksChange,
  now: nowProp,
  focusTaskRequest = null,
  onFocusTaskHandled
}: TaskInboxPageProps) {
  const { showConfirm } = useBrandedDialog();
  const [activeWorkspace, setActiveWorkspace] = useState<TaskInboxWorkspace>('tasks');
  const [settlementAppId, setSettlementAppId] = useState('');
  const [quickStockAppId, setQuickStockAppId] = useState('');
  const [relationshipIssueCount, setRelationshipIssueCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [showHiddenTasks, setShowHiddenTasks] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState('');
  const [focusTaskMissing, setFocusTaskMissing] = useState(false);
  const [showStaffAttention, setShowStaffAttention] = useState(false);
  const [runningQuickActionId, setRunningQuickActionId] = useState('');
  const [calendarReplyDrafts, setCalendarReplyDrafts] = useState<Record<string, string>>({});
  const [savingCalendarReplyId, setSavingCalendarReplyId] = useState('');
  const [showLeadEntry, setShowLeadEntry] = useState(false);
  const [leadPoolChoiceMode, setLeadPoolChoiceMode] = useState<'import' | 'manual' | null>(null);
  const [showLeadAssignment, setShowLeadAssignment] = useState(false);
  const [leadEntryMessage, setLeadEntryMessage] = useState('');
  const [activeLeadTab, setActiveLeadTab] = useState<'public' | 'private'>('public');
  const [myLeadFilter, setMyLeadFilter] = useState<MyLeadFilter>('all');
  const [myLeadDateFilter, setMyLeadDateFilter] = useState<LeadDateFilter>('all');
  const [myLeadSortOrder, setMyLeadSortOrder] = useState<LeadSortOrder>('newest');
  const [openLeadDateFilter, setOpenLeadDateFilter] = useState<LeadDateFilter>('all');
  const [openLeadSortOrder, setOpenLeadSortOrder] = useState<LeadSortOrder>('newest');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadImportPool, setLeadImportPool] = useState<'public' | 'private'>('public');
  const [manualLeadTargetPool, setManualLeadTargetPool] = useState<'public' | 'private'>('public');
  const [leadAssignmentStaffId, setLeadAssignmentStaffId] = useState('');
  const [manualLeadDraft, setManualLeadDraft] = useState({
    name: '',
    phone_no: '',
    email: '',
    ic_no: '',
    account_number: '',
    username: '',
    channel: 'TikTok' as RawCustomerChannel
  });
  const leadFileInputRef = useRef<HTMLInputElement | null>(null);
  const actionListRef = useRef<HTMLElement | null>(null);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>(() => readHiddenTaskIds(currentStaffName));
  // `now` comes from App's shared task clock (or this page's own clock when
  // rendered standalone). todayStart keeps a stable identity within a day so
  // the lead memos below only rebuild when the calendar day changes.
  const ownClockNow = useTaskClock(nowProp === undefined);
  const now = nowProp ?? ownClockNow;
  const todayStartTime = getStartOfDay(now).getTime();
  const todayStart = useMemo(() => new Date(todayStartTime), [todayStartTime]);
  const todayEndTime = useMemo(() => new Date(todayStart).setHours(23, 59, 59, 999), [todayStart]);
  const missingCheckoutIncidents = useMemo(
    () => buildOpenMissingCheckoutIncidents(attendanceEvents, attendanceIncidentResolutions, new Date(now)),
    [attendanceEvents, attendanceIncidentResolutions, now]
  );
  const applicationMatchIndex = useMemo(() => buildApplicationMatchIndex(applications), [applications]);
  const openLeads = useMemo(() => rawCustomerLeads
    .filter((lead) => (
      lead.lead_visibility !== 'Private' &&
      lead.lead_scope !== 'Taken Lead' &&
      !lead.taken_by_staff_name &&
      !['Submitted Loan', 'Rejected', 'Closed'].includes(lead.follow_up_status || '')
    ))
    .sort((left, right) => new Date(right.received_at).getTime() - new Date(left.received_at).getTime()), [rawCustomerLeads]);
  const getLeadDateBucket = (lead: RawCustomerLead): Exclude<LeadDateFilter, 'all'> => {
    const receivedTime = new Date(lead.received_at).getTime();
    const todayTime = todayStart.getTime();
    const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

    if (Number.isFinite(receivedTime) && receivedTime >= todayTime) return 'today';
    if (Number.isFinite(receivedTime) && receivedTime >= yesterdayTime) return 'yesterday';
    return 'earlier';
  };
  const openLeadDateFilterCounts = useMemo(() => ({
    all: openLeads.length,
    today: openLeads.filter((lead) => getLeadDateBucket(lead) === 'today').length,
    yesterday: openLeads.filter((lead) => getLeadDateBucket(lead) === 'yesterday').length,
    earlier: openLeads.filter((lead) => getLeadDateBucket(lead) === 'earlier').length
  }), [openLeads, todayStart]);
  const visibleOpenLeads = useMemo(() => {
    const filtered = openLeadDateFilter === 'all'
      ? [...openLeads]
      : openLeads.filter((lead) => getLeadDateBucket(lead) === openLeadDateFilter);

    return filtered.sort((left, right) => {
      const leftTime = new Date(left.received_at).getTime();
      const rightTime = new Date(right.received_at).getTime();
      const safeLeftTime = Number.isFinite(leftTime) ? leftTime : 0;
      const safeRightTime = Number.isFinite(rightTime) ? rightTime : 0;
      return openLeadSortOrder === 'newest' ? safeRightTime - safeLeftTime : safeLeftTime - safeRightTime;
    });
  }, [openLeadDateFilter, openLeadSortOrder, openLeads, todayStart]);
  const myLeads = useMemo(() => rawCustomerLeads
    .filter((lead) => (
      (
        lead.taken_by_staff_name === currentStaffName ||
        (lead.lead_visibility === 'Private' && !lead.taken_by_staff_name && lead.created_by_staff_name === currentStaffName)
      ) &&
      !['Submitted Loan', 'Rejected', 'Closed'].includes(lead.follow_up_status || '')
    ))
    .sort((left, right) => new Date(right.received_at).getTime() - new Date(left.received_at).getTime()), [currentStaffName, rawCustomerLeads]);
  const myLeadFilterCounts = useMemo(() => ({
    all: myLeads.length,
    contacted: myLeads.filter((lead) => lead.follow_up_status === 'Contacted').length,
    due: myLeads.filter((lead) => {
      const dueTime = new Date(lead.next_follow_up_at || '').getTime();
      return Number.isFinite(dueTime) && dueTime <= todayEndTime;
    }).length,
    interested: myLeads.filter((lead) => lead.follow_up_status === 'Interested').length
  }), [myLeads, todayEndTime]);
  const statusFilteredMyLeads = useMemo(() => myLeads.filter((lead) => {
    if (myLeadFilter === 'contacted') return lead.follow_up_status === 'Contacted';
    if (myLeadFilter === 'interested') return lead.follow_up_status === 'Interested';
    if (myLeadFilter === 'due') {
      const dueTime = new Date(lead.next_follow_up_at || '').getTime();
      return Number.isFinite(dueTime) && dueTime <= todayEndTime;
    }
    return true;
  }), [myLeadFilter, myLeads, todayEndTime]);
  const myLeadDateFilterCounts = useMemo(() => ({
    all: statusFilteredMyLeads.length,
    today: statusFilteredMyLeads.filter((lead) => getLeadDateBucket(lead) === 'today').length,
    yesterday: statusFilteredMyLeads.filter((lead) => getLeadDateBucket(lead) === 'yesterday').length,
    earlier: statusFilteredMyLeads.filter((lead) => getLeadDateBucket(lead) === 'earlier').length
  }), [statusFilteredMyLeads, todayStart]);
  const visibleMyLeads = useMemo(() => {
    const filtered = myLeadDateFilter === 'all'
      ? [...statusFilteredMyLeads]
      : statusFilteredMyLeads.filter((lead) => getLeadDateBucket(lead) === myLeadDateFilter);

    return filtered.sort((left, right) => {
      const leftTime = new Date(left.received_at).getTime();
      const rightTime = new Date(right.received_at).getTime();
      const safeLeftTime = Number.isFinite(leftTime) ? leftTime : 0;
      const safeRightTime = Number.isFinite(rightTime) ? rightTime : 0;
      return myLeadSortOrder === 'newest' ? safeRightTime - safeLeftTime : safeLeftTime - safeRightTime;
    });
  }, [myLeadDateFilter, myLeadSortOrder, statusFilteredMyLeads, todayStart]);
  const canCreateOwnLead = allowLeadAdd && ['Sales', 'Super Admin'].includes(viewerStaffRole) && viewerStaffName === currentStaffName;
  const canImportLeads = allowLeadImport && ['Sales', 'Admin', 'Super Admin'].includes(viewerStaffRole);
  const leadAssignmentOptions = useMemo(() => roleAccounts
    .filter((account) => account.status === 'Active' && account.role !== 'Super Admin')
    .sort((left, right) => (
      (left.role === 'Sales' ? 0 : 1) - (right.role === 'Sales' ? 0 : 1) ||
      left.name.localeCompare(right.name)
    )), [roleAccounts]);
  const availableLeadAssignmentOptions = leadAssignmentOptions.filter((account) => account.name !== currentStaffName);
  const canDeleteLeadForViewer = (lead: RawCustomerLead) => (
    viewerStaffRole === 'Super Admin'
    || lead.created_by_staff_name === viewerStaffName
    || lead.taken_by_staff_name === viewerStaffName
  );
  const isFilteredActiveLeadView = activeLeadTab === 'public'
    ? openLeadDateFilter !== 'all'
    : myLeadFilter !== 'all' || myLeadDateFilter !== 'all';
  const activeLeadList = activeLeadTab === 'public' ? visibleOpenLeads : visibleMyLeads;
  const deletableActiveLeads = activeLeadList.filter(canDeleteLeadForViewer);
  const selectedActiveLeads = deletableActiveLeads.filter((lead) => selectedLeadIds.includes(lead.id));
  const selectedPrivateLeads = selectedActiveLeads.filter((lead) => lead.lead_visibility === 'Private');

  const staffRoleLabel = roleAccounts.find((account) => account.name === currentStaffName)?.role || currentStaffRole;
  const currentScopeLabel = currentStaffName;

  useEffect(() => {
    setHiddenTaskIds(readHiddenTaskIds(currentStaffName));
    setShowHiddenTasks(false);
  }, [currentStaffName]);

  useEffect(() => {
    setSelectedLeadIds([]);
  }, [activeLeadTab, currentStaffName, myLeadDateFilter, myLeadFilter, openLeadDateFilter]);

  useEffect(() => {
    setShowStaffAttention(false);
  }, []);

  useEffect(() => {
    if (activeWorkspace === 'relationships' && relationshipIssueCount === 0) {
      setActiveWorkspace('tasks');
    }
  }, [activeWorkspace, relationshipIssueCount]);

  const handleAssistStaff = (staffName: string) => {
    onStaffScopeChange?.(staffName);
    setActiveFilter('all');
    setShowHiddenTasks(false);
    window.setTimeout(() => {
      actionListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleLeadCsvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file || !canImportLeads) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const leads = parseTikTokLeadCsv(String(reader.result || ''));
        await onImportLeads(leads, leadImportPool);
        setActiveLeadTab(leadImportPool);
        if (leadImportPool === 'private') setMyLeadFilter('all');
        setLeadEntryMessage(leadImportPool === 'private'
          ? tr(
            `${file.name}：已加入 ${leads.length} 个私人名单`,
            `${file.name}: ${leads.length} private leads added`,
            `${file.name}: ${leads.length} prospek peribadi ditambah`
          )
          : tr(
            `${file.name}：已加入 ${leads.length} 个公共名单`,
            `${file.name}: ${leads.length} public leads added`,
            `${file.name}: ${leads.length} prospek awam ditambah`
          ));
      } catch (error) {
        setLeadEntryMessage(error instanceof Error ? error.message : tr('CSV 导入失败', 'CSV import failed', 'Import CSV gagal'));
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleLeadPoolSelection = (targetPool: 'public' | 'private') => {
    const choiceMode = leadPoolChoiceMode;
    setLeadPoolChoiceMode(null);

    if (choiceMode === 'import') {
      setLeadImportPool(targetPool);
      leadFileInputRef.current?.click();
      return;
    }

    if (choiceMode === 'manual') {
      setManualLeadTargetPool(targetPool);
      setShowLeadEntry(true);
    }
  };

  const handleManualLeadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = manualLeadDraft.name.trim();
    const phoneNo = manualLeadDraft.phone_no.trim();

    if (!name || !phoneNo || !canCreateOwnLead) {
      setLeadEntryMessage(tr('姓名和电话号码不能为空', 'Name and phone number are required', 'Nama dan nombor telefon diperlukan'));
      return;
    }

    const now = new Date().toISOString();
    const uniquePart = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
    const lead: RawCustomerLead = {
      id: `RAW-MANUAL-${uniquePart}`,
      channel: manualLeadDraft.channel,
      lead_id: `MANUAL-${uniquePart}`,
      username: manualLeadDraft.username.trim(),
      received_at: now,
      raw_status: 'Raw',
      source_traffic: 'Manual',
      source_action: 'Staff Entry',
      source_scenario: '',
      name,
      ic_no: manualLeadDraft.ic_no.trim(),
      phone_no: phoneNo,
      account_number: manualLeadDraft.account_number.trim(),
      email: manualLeadDraft.email.trim(),
      work_phone: '',
      work_email: '',
      whatsapp: phoneNo,
      messenger: '',
      instagram: '',
      facebook: '',
      tiktok: manualLeadDraft.channel === 'TikTok' ? manualLeadDraft.username.trim() : '',
      city: '',
      state: '',
      country: 'Malaysia',
      company_name: '',
      job_title: '',
      imported_at: now,
      entry_method: 'Manual Entry'
    };

    await onAddLead(lead, manualLeadTargetPool);
    setActiveLeadTab(manualLeadTargetPool);
    if (manualLeadTargetPool === 'private') setMyLeadFilter('all');
    setManualLeadDraft({ name: '', phone_no: '', email: '', ic_no: '', account_number: '', username: '', channel: 'TikTok' });
    setShowLeadEntry(false);
    setLeadEntryMessage(manualLeadTargetPool === 'public'
      ? tr(
        `${name} 已加入开放名单`,
        `${name} was added to Open Leads`,
        `${name} ditambah ke Prospek Terbuka`
      )
      : tr(
        `${name} 已加入你的私人名单`,
        `${name} was added to your private leads`,
        `${name} ditambah ke prospek peribadi anda`
      ));
  };

  const handleDeleteLeads = async (leads: RawCustomerLead[], mode: 'selected' | 'all' = 'selected') => {
    if (leads.length === 0) return;

    const isSingleLead = leads.length === 1;
    const leadLabel = leads[0]?.name || leads[0]?.phone_no || leads[0]?.id;
    const confirmed = await showConfirm({
      eyebrow: tr('名单管理', 'Lead Management', 'Pengurusan Prospek'),
      title: isSingleLead
        ? tr('删除这个名单？', 'Delete this lead?', 'Padam prospek ini?')
        : mode === 'all'
          ? isFilteredActiveLeadView
            ? tr('删除当前筛选显示的所有名单？', 'Delete all leads shown by this filter?', 'Padam semua prospek yang ditunjukkan oleh penapis ini?')
            : tr('删除当前 tab 的所有名单？', 'Delete all leads in this tab?', 'Padam semua prospek dalam tab ini?')
          : tr(`删除选中的 ${leads.length} 个名单？`, `Delete ${leads.length} selected leads?`, `Padam ${leads.length} prospek yang dipilih?`),
      message: isSingleLead
        ? tr(
          `「${leadLabel}」将从名单中删除。此操作不能自动还原。`,
          `"${leadLabel}" will be removed from the lead list. This cannot be undone automatically.`,
          `"${leadLabel}" akan dipadam daripada senarai prospek. Tindakan ini tidak boleh dibuat asal secara automatik.`
        )
        : tr(
          `将删除当前账号有权限处理的 ${leads.length} 个名单。此操作不能自动还原。`,
          `${leads.length} leads that this account may manage will be deleted. This cannot be undone automatically.`,
          `${leads.length} prospek yang boleh diurus oleh akaun ini akan dipadam. Tindakan ini tidak boleh dibuat asal secara automatik.`
        ),
      tone: 'danger',
      confirmLabel: isSingleLead
        ? tr('确认删除', 'Delete Lead', 'Padam Prospek')
        : mode === 'all'
          ? isFilteredActiveLeadView
            ? tr('删除当前显示', 'Delete Shown', 'Padam Yang Ditunjukkan')
            : tr('全部删除', 'Delete All', 'Padam Semua')
          : tr('删除已选', 'Delete Selected', 'Padam Dipilih')
    });

    if (confirmed) {
      const deletedCount = onDeleteLeads(leads);
      if (deletedCount > 0) {
        const deletedIds = new Set(leads.map((lead) => lead.id));
        setSelectedLeadIds((current) => current.filter((id) => !deletedIds.has(id)));
      }
    }
  };

  const handleDeleteLead = (lead: RawCustomerLead) => handleDeleteLeads([lead]);

  const handleReturnLeadToPublicPool = async (lead: RawCustomerLead) => {
    const leadLabel = lead.name || lead.phone_no || lead.id;
    const confirmed = await showConfirm({
      eyebrow: tr('名单管理', 'Lead Management', 'Pengurusan Prospek'),
      title: tr('放回公共名单？', 'Return to Public Pool?', 'Kembalikan ke Kumpulan Awam?'),
      message: tr(
        `「${leadLabel}」会清除当前负责人、跟进状态和下次提醒，并重新开放给其他员工领取。`,
        `"${leadLabel}" will have its current owner, follow-up status, and next reminder cleared so other staff can claim it.`,
        `"${leadLabel}" akan mengosongkan pemilik, status susulan dan peringatan seterusnya supaya kakitangan lain boleh mengambilnya.`
      ),
      tone: 'warning',
      confirmLabel: tr('放回公共名单', 'Return to Public Pool', 'Kembalikan ke Kumpulan Awam')
    });

    if (!confirmed) return;

    onReleaseLead(lead);
    setSelectedLeadIds((current) => current.filter((id) => id !== lead.id));
    setMyLeadFilter('all');
    setActiveLeadTab('public');
  };

  const handleAssignSelectedPrivateLeads = () => {
    if (!leadAssignmentStaffId || selectedPrivateLeads.length === 0) return;
    const assignedAccount = availableLeadAssignmentOptions.find((account) => account.id === leadAssignmentStaffId);
    if (!assignedAccount) return;

    const assignedCount = onAssignPrivateLeads(selectedPrivateLeads, assignedAccount.id);
    if (assignedCount <= 0) return;

    setSelectedLeadIds([]);
    setShowLeadAssignment(false);
    setLeadAssignmentStaffId('');
    setMyLeadFilter('all');
    setActiveLeadTab('private');
    onStaffScopeChange?.(assignedAccount.name);
  };

  const saveHiddenTaskIds = (nextIds: string[]) => {
    const uniqueIds = Array.from(new Set(nextIds));
    setHiddenTaskIds(uniqueIds);
    window.localStorage.setItem(getHiddenTaskStorageKey(currentStaffName), JSON.stringify(uniqueIds));
  };

  const handleHideTask = (taskId: string) => {
    saveHiddenTaskIds([...hiddenTaskIds, taskId]);
  };

  const handleRestoreTask = (taskId: string) => {
    saveHiddenTaskIds(hiddenTaskIds.filter((id) => id !== taskId));
  };

  const tasks = useMemo<InboxTask[]>(() => buildTaskInboxTasks({
    applications,
    calendarNotes,
    rawCustomerLeads,
    roleAccounts,
    roleNavAccess,
    customMissions,
    notifications,
    approvalRequests,
    staffLeaveRequests,
    vehicleCatalog,
    bankDefinitions,
    missingCheckoutIncidents,
    currentStaffName,
    currentStaffRole,
    viewerStaffRole,
    managementStaffName,
    now,
    applicationMatchIndex
  }, {
    onOpenApplication,
    onOpenNotification,
    onOpenWhatsApp,
    onUpdateMissingInfo,
    onAssignApplicationHandler,
    onAssignApplicationAdmin,
    onCompleteCashAcceptance,
    onMarkBikeDelivered,
    onSetCalendarNoteCompleted,
    onResolveMissingCheckout,
    onOpenQuickAddStock: setQuickStockAppId,
    onOpenDealSettlement: setSettlementAppId,
    onBankQuickAction,
    onOpenMissions,
    onOpenFinanceStock,
    onQuickAddStock,
    onOpenFinanceDeal,
    onOpenDelivery,
    onMarkCommissionPaid,
    onSaveDealFinance,
    onReviewApproval,
    onReviewLeaveRequest,
    renderAssignmentAvatar: (account) => (
      <StaffAvatar
        name={account.name}
        avatarDataUrl={account.avatar_data_url}
        className="h-6 w-6"
        textClassName="text-[8px]"
      />
    )
  // The onOpen* callbacks are intentionally omitted from the deps: they are
  // recreated on every parent render but always perform the same navigation,
  // so including them would defeat this memo. Only real data drives a rebuild.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [applicationMatchIndex, applications, approvalRequests, calendarNotes, currentScopeLabel, currentStaffName, currentStaffRole, customMissions, managementStaffName, missingCheckoutIncidents, notifications, now, rawCustomerLeads, roleAccounts, roleNavAccess, staffLeaveRequests, vehicleCatalog, bankDefinitions, viewerStaffRole]);

  const hiddenTaskIdSet = useMemo(() => new Set(hiddenTaskIds), [hiddenTaskIds]);
  const visibleTasks = useMemo(
    () => filterVisibleTaskInboxTasks(tasks, hiddenTaskIdSet),
    [hiddenTaskIdSet, tasks]
  );
  const hiddenTasks = useMemo(
    () => tasks.filter((task) => hiddenTaskIdSet.has(task.id)),
    [hiddenTaskIdSet, tasks]
  );
  useEffect(() => {
    if (showHiddenTasks && hiddenTasks.length === 0) {
      setShowHiddenTasks(false);
    }
  }, [hiddenTasks.length, showHiddenTasks]);
  // Reveal a task picked in the Notification Center: clear filters that hide
  // it, scroll its card into view, or explain why it is no longer listed.
  useEffect(() => {
    if (!focusTaskRequest?.taskId) return;
    const { taskId } = focusTaskRequest;
    const isVisible = visibleTasks.some((task) => task.id === taskId);
    const isHidden = !isVisible && hiddenTasks.some((task) => task.id === taskId);
    setActiveWorkspace('tasks');
    if (isVisible || isHidden) {
      setFocusTaskMissing(false);
      setActiveFilter('all');
      setShowHiddenTasks(isHidden);
      setFocusedTaskId(taskId);
      window.requestAnimationFrame(() => {
        document.getElementById(`task-card-${taskId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    } else {
      setFocusedTaskId('');
      setFocusTaskMissing(true);
    }
    onFocusTaskHandled?.();
    // Runs once per request; the task lists are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTaskRequest?.key]);
  // Keep the global bell and sidebar on the exact same visible-task source as
  // the Task Inbox. Hidden and completed tasks are intentionally excluded.
  useEffect(() => {
    onVisibleTasksChange?.(visibleTasks.map(toTaskInboxMirrorItem));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTasks]);
  // 我的佣金 — the Sales-facing replacement for the retired 佣金与奖励 page.
  // Reads the same Finance Deal commission fields; no month filter on the
  // outstanding buckets, paid is scoped to the current month.
  const myCommissionSummary = useMemo(() => {
    if (viewerStaffRole !== 'Sales') return null;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const summary = { estimated: 0, earned: 0, payable: 0, paidThisMonth: 0 };
    applications.forEach((application) => {
      if (application.handler_name !== viewerStaffName) return;
      const finance = application.deal_finance;
      if (!finance) return;
      const amount = Math.round(Number(finance.commission_amount) || 0);
      if (amount <= 0) return;
      if (finance.commission_status === 'Estimated') summary.estimated += amount;
      else if (finance.commission_status === 'Earned') summary.earned += amount;
      else if (finance.commission_status === 'Payable') summary.payable += amount;
      else if (finance.commission_status === 'Paid' && (finance.commission_paid_at || '').startsWith(monthKey)) summary.paidThisMonth += amount;
    });
    return summary;
  }, [applications, viewerStaffName, viewerStaffRole]);
  const displayTasks = showHiddenTasks ? hiddenTasks : visibleTasks;
  const filteredTasks = activeFilter === 'all'
    ? displayTasks
    : activeFilter === 'newApplication'
      ? displayTasks.filter((task) => task.isNewApplication)
      : displayTasks.filter((task) => task.category === activeFilter);
  const criticalCount = visibleTasks.filter((task) => task.severity === 'critical').length;
  const newApplicationCount = visibleTasks.filter((task) => task.isNewApplication).length;
  const progressCount = visibleTasks.filter((task) => task.category === 'mission').length;
  const completedProgressCount = visibleTasks.filter((task) => task.category === 'mission' && task.severity === 'success').length;

  const filterCounts: Record<TaskFilter, number> = {
    all: visibleTasks.length,
    newApplication: newApplicationCount,
    missing: visibleTasks.filter((task) => task.category === 'missing').length,
    rawLead: visibleTasks.filter((task) => task.category === 'rawLead').length,
    cash: visibleTasks.filter((task) => task.category === 'cash').length,
    bank: visibleTasks.filter((task) => task.category === 'bank').length,
    reminder: visibleTasks.filter((task) => task.category === 'reminder').length,
    mission: progressCount
  };
  const activeStaffAccounts = useMemo(
    () => roleAccounts
      .filter((account) => account.status === 'Active')
      .sort((left, right) => left.name.localeCompare(right.name)),
    [roleAccounts]
  );
  const staffAttentionSummaries = useMemo<StaffAttentionSummary[]>(() => (
    activeStaffAccounts
      .map((account) => {
        const actionIds = new Set<string>();
        const overdueIds = new Set<string>();
        const upcomingFollowUpIds = new Set<string>();
        const staffApplications = applications.filter((application) => application.handler_name === account.name);
        const staffRawLeads = rawCustomerLeads.filter((lead) => lead.taken_by_staff_name === account.name);

        if (account.role === 'Admin' || account.role === 'Super Admin') {
          missingCheckoutIncidents.forEach((incident) => actionIds.add(incident.id));
        }

        staffApplications.forEach((application) => {
          const pendingWith = getLoanPendingWith(application);
          const pendingAction = getLoanPendingAction(application);
          const missingDocuments = getMissingDocumentLabels(application);
          const isTerminalApplication = application.status === LoanStatus.REJECT || application.status === LoanStatus.CANCELLED;
          const missingRejectCode = application.status === LoanStatus.REJECT && getApplicationRejectCodes(application).length === 0;
          const hasMissingInfo = (
            missingRejectCode ||
            (!isTerminalApplication && (
              !application.vehicle_condition ||
              !application.purchase_method ||
              (pendingAction === 'Provide Documents' && missingDocuments.length === 0) ||
              missingDocuments.length > 0
            ))
          );

          if (hasMissingInfo) {
            actionIds.add(`application-action-${application.id}`);
          }

          if (pendingWith === 'Handler' && pendingAction !== 'None') {
            actionIds.add(`application-action-${application.id}`);
          }

          const callbackDueTime = getDueTime(application.customer_call_back_at);
          if (pendingWith !== 'Closed' && Number.isFinite(callbackDueTime) && callbackDueTime <= todayEndTime) {
            const taskId = `customer-call-back-${application.id}`;
            actionIds.add(taskId);
            if (callbackDueTime < todayStart.getTime()) {
              overdueIds.add(taskId);
            }
          } else if (pendingWith !== 'Closed' && Number.isFinite(callbackDueTime) && callbackDueTime > todayEndTime) {
            upcomingFollowUpIds.add(`customer-call-back-${application.id}`);
          }
        });

        applications
          .filter((application) => (
            application.admin_owner_name === account.name ||
            (!application.admin_owner_name && (
              account.role === 'Admin' ||
              (account.role === 'Super Admin' && !activeStaffAccounts.some((activeAccount) => activeAccount.role === 'Admin'))
            ))
          ))
          .forEach((application) => {
            const pendingWith = getLoanPendingWith(application);
            if (pendingWith === 'Admin') {
              actionIds.add(`workflow-admin-${application.id}`);
            }

            (application.bank_applications || []).forEach((bankApplication) => {
              const followUpDueTime = getDueTime(bankApplication.next_follow_up_at);
              if (
                pendingWith === 'Bank' &&
                (!application.active_bank_application_id || application.active_bank_application_id === bankApplication.id) &&
                Number.isFinite(followUpDueTime) &&
                followUpDueTime <= todayEndTime &&
                !['Approved', 'Rejected', 'Cancelled'].includes(bankApplication.status)
              ) {
                const taskId = `bank-follow-up-${application.id}-${bankApplication.id}`;
                actionIds.add(taskId);
                if (followUpDueTime < todayStart.getTime()) {
                  overdueIds.add(taskId);
                }
              } else if (
                pendingWith === 'Bank' &&
                (!application.active_bank_application_id || application.active_bank_application_id === bankApplication.id) &&
                Number.isFinite(followUpDueTime) &&
                followUpDueTime > todayEndTime &&
                !['Approved', 'Rejected', 'Cancelled'].includes(bankApplication.status)
              ) {
                upcomingFollowUpIds.add(`bank-follow-up-${application.id}-${bankApplication.id}`);
              }
            });
          });

        staffRawLeads.forEach((lead) => {
          if (['Submitted Loan', 'Rejected', 'Closed'].includes(lead.follow_up_status || '')) return;
          const followUpDueTime = getDueTime(lead.next_follow_up_at);
          if (Number.isFinite(followUpDueTime) && followUpDueTime <= todayEndTime) {
            const taskId = `raw-lead-${lead.id}`;
            actionIds.add(taskId);
            if (followUpDueTime < todayStart.getTime()) {
              overdueIds.add(taskId);
            }
          } else if (Number.isFinite(followUpDueTime) && followUpDueTime > todayEndTime) {
            upcomingFollowUpIds.add(`raw-lead-${lead.id}`);
          }
        });

        calendarNotes
          .filter((note) => note.assigned_to === account.name && !note.completed_at)
          .forEach((note) => {
            const noteDueTime = getDueTime(note.date_at);
            if (Number.isFinite(noteDueTime) && noteDueTime <= todayEndTime) {
              const taskId = `calendar-${note.id}`;
              actionIds.add(taskId);
              if (noteDueTime < todayStart.getTime()) {
                overdueIds.add(taskId);
              }
            }
          });

        const missionProgress = customMissions
          .filter((mission) => mission.status === 'Active' && isStaffInMissionScope(mission, account.name, account.role))
          .map((mission) => {
            const progress = calculateMissionProgress(mission, account.name, applications, rawCustomerLeads, applicationMatchIndex).progress;
            return {
              progress,
              isBehind: getMissionRange(mission).end >= todayStart && progress + 10 < getExpectedMissionProgress(mission, todayStart)
            };
          });
        const averageMissionProgress = missionProgress.length > 0
          ? Math.round(missionProgress.reduce((sum, mission) => sum + mission.progress, 0) / missionProgress.length)
          : 0;
        const behindMissionCount = missionProgress.filter((mission) => mission.isBehind).length;
        const handlerWorkloadCount = staffApplications.filter((application) => (
          getLoanPendingWith(application) === 'Handler' && getLoanPendingAction(application) !== 'None'
        )).length;
        const adminWorkloadCount = applications.filter((application) => (
          (application.admin_owner_name === account.name || (!application.admin_owner_name && account.role === 'Admin')) &&
          (getLoanPendingWith(application) === 'Admin' || getLoanPendingWith(application) === 'Bank')
        )).length;
        const activeLeadCount = staffRawLeads.filter((lead) => !['Submitted Loan', 'Rejected', 'Closed'].includes(lead.follow_up_status || '')).length;
        const workloadCount = handlerWorkloadCount + adminWorkloadCount + activeLeadCount;
        const level: StaffAttentionSummary['level'] = overdueIds.size > 0
          ? 'critical'
          : actionIds.size > 0 || behindMissionCount > 0
            ? 'warning'
            : 'healthy';

        return {
          account,
          actionCount: actionIds.size,
          overdueCount: overdueIds.size,
          followUpCount: upcomingFollowUpIds.size,
          workloadCount,
          missionCount: missionProgress.length,
          missionProgress: averageMissionProgress,
          behindMissionCount,
          level
        };
      })
      .sort((a, b) => (
        b.overdueCount - a.overdueCount ||
        b.behindMissionCount - a.behindMissionCount ||
        b.actionCount - a.actionCount ||
        a.missionProgress - b.missionProgress ||
        a.account.name.localeCompare(b.account.name)
      ))
  ), [activeStaffAccounts, applicationMatchIndex, applications, calendarNotes, customMissions, missingCheckoutIncidents, rawCustomerLeads, todayEndTime, todayStart]);
  const staffActionCountByName = useMemo(
    () => new Map(staffAttentionSummaries.map((summary) => [summary.account.name, summary.actionCount])),
    [staffAttentionSummaries]
  );
  const attentionEligibleStaffSummaries = staffAttentionSummaries.filter((summary) => summary.account.role !== 'Super Admin');
  const focusedStaffSummary = attentionEligibleStaffSummaries.find((summary) => summary.account.name === currentStaffName);
  const visibleStaffAttentionSummaries = focusedStaffSummary ? [focusedStaffSummary] : attentionEligibleStaffSummaries;
  const attentionStaffCount = visibleStaffAttentionSummaries.filter((summary) => summary.level !== 'healthy').length;
  const staffOverdueCount = visibleStaffAttentionSummaries.reduce((sum, summary) => sum + summary.overdueCount, 0);
  const behindMissionCount = visibleStaffAttentionSummaries.reduce((sum, summary) => sum + summary.behindMissionCount, 0);
  const roleAccountByName = useMemo(
    () => new Map(roleAccounts.map((account) => [account.name, account])),
    [roleAccounts]
  );

  const renderLeadCard = (lead: RawCustomerLead, isMine: boolean) => {
    const canDeleteLead = canDeleteLeadForViewer(lead);
    const canReturnToPublicPool = (
      isMine &&
      lead.lead_visibility !== 'Private' &&
      Boolean(lead.taken_by_staff_name) &&
      (
        hasAdminWorkAccess(viewerStaffRole) ||
        lead.taken_by_staff_name === viewerStaffName
      )
    );
    const isSelected = selectedLeadIds.includes(lead.id);
    const nextFollowUpTime = new Date(lead.next_follow_up_at || '').getTime();
    const isFollowUpDue = Number.isFinite(nextFollowUpTime) && nextFollowUpTime <= todayEndTime;

    return (
    <article key={lead.id} className="rounded-card border border-slate-100 bg-white p-4 shadow-e1">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {canDeleteLead && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(event) => setSelectedLeadIds((current) => (
                  event.target.checked
                    ? Array.from(new Set([...current, lead.id]))
                    : current.filter((id) => id !== lead.id)
                ))}
                aria-label={tr(`选择名单 ${lead.name || lead.id}`, `Select lead ${lead.name || lead.id}`, `Pilih prospek ${lead.name || lead.id}`)}
                className="h-4 w-4 rounded border-slate-300 text-brand-ink accent-red-800"
              />
            )}
            <span className={`rounded-chip px-2 py-1 text-micro uppercase ${
              isMine ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isMine ? tr('我的名单', 'My Lead', 'Prospek Saya') : tr('开放名单', 'Open Lead', 'Prospek Terbuka')}
            </span>
            <span className="rounded-chip bg-slate-100 px-2 py-1 text-caption font-semibold text-slate-500">{lead.channel}</span>
            {isMine && (
              <span className={`rounded-chip px-2 py-1 text-caption font-semibold ${
                lead.follow_up_status === 'Interested'
                  ? 'bg-emerald-50 text-emerald-700'
                  : isFollowUpDue
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
              }`}>
                {trFollowUpStatus(lead.follow_up_status || 'New')}
              </span>
            )}
          </div>
          <h3 className="mt-3 truncate text-headline text-slate-900" title={lead.name || lead.username}>
            {lead.name || lead.username || tr('未命名名单', 'Unnamed lead', 'Prospek tanpa nama')}
          </h3>
          <p className="mt-1 font-mono text-footnote text-slate-500">
            {lead.phone_no || lead.whatsapp || lead.work_phone || tr('没有电话号码', 'No phone number', 'Tiada nombor telefon')}
          </p>
          <p className="mt-1 text-caption text-slate-500">{formatShortDate(lead.received_at)}</p>
          {isMine && lead.next_follow_up_at && (
            <p className={`mt-1 text-caption font-semibold ${isFollowUpDue ? 'text-rose-600' : 'text-slate-500'}`}>
              {isFollowUpDue
                ? tr(`跟进已到期 · ${formatShortDate(lead.next_follow_up_at)}`, `Follow up due · ${formatShortDate(lead.next_follow_up_at)}`, `Susulan perlu dibuat · ${formatShortDate(lead.next_follow_up_at)}`)
                : tr(`下次跟进 · ${formatShortDate(lead.next_follow_up_at)}`, `Next follow up · ${formatShortDate(lead.next_follow_up_at)}`, `Susulan seterusnya · ${formatShortDate(lead.next_follow_up_at)}`)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {canReturnToPublicPool && (
            <button
              type="button"
              onClick={() => { void handleReturnLeadToPublicPool(lead); }}
              aria-label={tr(`放回公共名单 ${lead.name || lead.id}`, `Return ${lead.name || lead.id} to Public Pool`, `Kembalikan ${lead.name || lead.id} ke Kumpulan Awam`)}
              className="inline-flex items-center gap-2 rounded-control bg-slate-100 px-3 py-2 text-footnote font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {tr('放回公共名单', 'Return to Public Pool', 'Kembali ke Kumpulan Awam')}
            </button>
          )}
          {canDeleteLead && (
            <button
              type="button"
              onClick={() => { void handleDeleteLead(lead); }}
              aria-label={tr(`删除名单 ${lead.name || lead.id}`, `Delete lead ${lead.name || lead.id}`, `Padam prospek ${lead.name || lead.id}`)}
              className="inline-flex items-center gap-2 rounded-control bg-rose-50 px-3 py-2 text-footnote font-bold text-rose-700 transition-colors hover:bg-rose-100"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {tr('删除', 'Delete', 'Padam')}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onOpenWhatsApp(lead, 'web');
              if (!isMine) {
                setMyLeadFilter('contacted');
                setActiveLeadTab('private');
              }
            }}
            disabled={!normalizePhoneDigits(lead.phone_no || lead.whatsapp || lead.work_phone || '')}
            className="inline-flex items-center gap-2 rounded-control bg-emerald-600 px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500"
          >
            <SystemIcon icon={MessageCircle} className="h-5 w-5" />
            WhatsApp
          </button>
        </div>
      </div>
    </article>
    );
  };

  const renderLeadCardsGroupedByDate = (leads: RawCustomerLead[], isMine: boolean) => {
    let previousDateKey = '';

    return leads.map((lead) => {
      const dateKey = getLeadCalendarDateKey(lead.received_at);
      const startsNewDateGroup = dateKey !== previousDateKey;
      const dateLabel = formatLeadDateDivider(lead.received_at, todayStart);
      previousDateKey = dateKey;

      return (
        <React.Fragment key={lead.id}>
          {startsNewDateGroup && (
            <div
              className="col-span-full flex items-center gap-3 py-1"
              role="separator"
              aria-label={tr(
                `名单日期 ${dateLabel}`,
                `Lead date ${dateLabel}`,
                `Tarikh prospek ${dateLabel}`
              )}
            >
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-micro uppercase text-slate-500 shadow-e1">
                {dateLabel}
              </span>
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            </div>
          )}
          {renderLeadCard(lead, isMine)}
        </React.Fragment>
      );
    });
  };

  const settlementApp = settlementAppId ? applications.find((item) => item.id === settlementAppId) || null : null;
  const quickStockApp = quickStockAppId ? applications.find((item) => item.id === quickStockAppId) || null : null;
  const quickStockModel = (quickStockApp?.vehicle_model || '').trim();
  return (
    <div id="task-inbox-page" className="space-y-6">
      {settlementApp && onSaveDealFinance && (
        <DealSettlementModal
          application={settlementApp}
          onSave={onSaveDealFinance}
          onClose={() => setSettlementAppId('')}
          loadPayments={loadDeliveryPayments}
        />
      )}
      {quickStockApp && quickStockModel && onQuickAddStock && (
        <QuickAddStockModal
          application={quickStockApp}
          model={quickStockModel}
          onSave={onQuickAddStock}
          onClose={() => setQuickStockAppId('')}
        />
      )}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-title-2 text-slate-900">{tr('首页', 'Home', "Laman Utama")}</h2>
          <p className="max-w-3xl text-footnote font-normal leading-relaxed text-slate-500">
            {tr('当前要处理的事都在这里。', 'Everything currently requiring action.', "Semua perkara yang memerlukan tindakan ada di sini.")}
          </p>
        </div>

        <span className="inline-flex self-start rounded-full bg-brand px-3 py-1.5 text-micro uppercase text-white">
          {currentScopeLabel} · {trRole(staffRoleLabel)}
        </span>
      </section>

      <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-card border border-slate-100 bg-white p-1 shadow-e1">
        {([
          ['tasks', tr('任务', 'Tasks', "Tugasan"), visibleTasks.length, ListChecks],
          ['openLeads', tr('开放名单', 'Open Leads', "Prospek Terbuka"), openLeads.length + myLeads.length, Users],
          ...(relationshipIssueCount > 0
            ? [['relationships', tr('关系问题', 'Relationship Issues', "Isu Hubungan"), relationshipIssueCount, AlertTriangle]]
            : [])
        ] as Array<[TaskInboxWorkspace, string, number, LucideIcon]>).map(([key, label, count, icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveWorkspace(key)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-control px-4 py-2 text-footnote font-bold transition-colors ${
              activeWorkspace === key
                ? 'bg-brand text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <SystemIcon icon={icon} className="h-5 w-5" />
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-caption ${activeWorkspace === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
          </button>
        ))}
      </section>

      {activeWorkspace === 'tasks' && <>

      {focusTaskMissing && (
        <div role="status" data-testid="task-focus-missing" className="flex items-start justify-between gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-footnote text-amber-800">
          <p>{tr(
            '这条任务已经处理完，或你已没有权限查看，所以不在列表里了。',
            'This task has already been handled, or you no longer have access to it, so it is not in the list.',
            'Tugasan ini sudah diselesaikan atau anda tiada akses lagi, jadi ia tiada dalam senarai.'
          )}</p>
          <button type="button" onClick={() => setFocusTaskMissing(false)} className="shrink-0 font-bold" aria-label={tr('关闭', 'Dismiss', 'Tutup')}>×</button>
        </div>
      )}

      {myCommissionSummary && (
        <section data-testid="my-commission-card" className="rounded-card border border-slate-100 bg-white p-4 shadow-e1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-footnote font-bold text-slate-800">{tr('我的佣金', 'My Commission', 'Komisen Saya')}</p>
              <p className="mt-1 text-caption font-medium text-slate-500">{tr('交车后佣金变成已赚；财务完成后待支付。', 'Commission is earned after delivery and payable after finance completes.', 'Komisen diperoleh selepas serahan dan boleh dibayar selepas kewangan selesai.')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                [tr('估计', 'Estimated', 'Anggaran'), myCommissionSummary.estimated, 'bg-slate-50 text-slate-600'],
                [tr('已赚', 'Earned', 'Diperoleh'), myCommissionSummary.earned, 'bg-indigo-50 text-indigo-700'],
                [tr('待支付', 'Payable', 'Belum Dibayar'), myCommissionSummary.payable, 'bg-amber-50 text-amber-700'],
                [tr('本月已收', 'Paid This Month', 'Dibayar Bulan Ini'), myCommissionSummary.paidThisMonth, 'bg-emerald-50 text-emerald-700']
              ] as Array<[string, number, string]>).map(([label, amount, toneClass]) => (
                <div key={label} className={`rounded-control px-3 py-2 text-center ${toneClass}`}>
                  <p className="text-micro uppercase opacity-70">{label}</p>
                  <p className="mt-0.5 text-headline tabular-nums">RM{amount.toLocaleString('en-MY')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {canFilterStaffScope && onStaffScopeChange && (
        <section className="rounded-card border border-slate-100 bg-white p-4 shadow-e1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-footnote font-bold text-slate-800">{tr('员工筛选', 'Staff Filter', "Penapis Kakitangan")}</p>
              <p className="mt-1 text-caption font-medium text-slate-500">{tr('默认只看你的任务；选择员工后只看该员工。', 'Your tasks show by default; select a staff member to view only theirs.', "Tugasan anda dipaparkan secara lalai; pilih kakitangan untuk melihat tugasan mereka sahaja.")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleOptionGroup
                value={currentStaffName}
                options={activeStaffAccounts.map((account) => ({
                  value: account.name,
                  label: `${account.name} · ${trRole(account.role)}`,
                  leading: <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-7 w-7" textClassName="text-micro tracking-normal" />,
                  trailing: (
                    <span
                      data-testid={`task-inbox-staff-action-count-${account.id}`}
                      aria-label={tr(
                        `${staffActionCountByName.get(account.name) || 0} 个待办`,
                        `${staffActionCountByName.get(account.name) || 0} ${(staffActionCountByName.get(account.name) || 0) === 1 ? 'action' : 'actions'}`,
                        `${staffActionCountByName.get(account.name) || 0} tindakan`
                      )}
                      className={`inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-caption font-semibold ${
                        (staffActionCountByName.get(account.name) || 0) > 0
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {staffActionCountByName.get(account.name) || 0}
                    </span>
                  )
                }))}
                onChange={handleAssistStaff}
                ariaLabel={tr('筛选员工任务', 'Filter tasks by staff', "Tapis tugasan mengikut kakitangan")}
                className="min-w-[250px] rounded-control bg-slate-50 p-1 ring-1 ring-slate-100"
              />
              <button
                type="button"
                data-testid="show-staff-attention"
                onClick={() => setShowStaffAttention(true)}
                className="rounded-control bg-brand px-3 py-2 text-caption font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                {tr('显示员工进度', 'Show Staff Attention', "Tunjukkan Perhatian Kakitangan")}
              </button>
            </div>
          </div>
        </section>
      )}

      {showStaffAttention && canFilterStaffScope && onStaffScopeChange && (
        <section className="rounded-card border border-slate-100 bg-white p-4 shadow-e1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-headline text-slate-900">{tr('员工异常与进度', 'Staff Attention & Progress', "Perhatian & Kemajuan Kakitangan")}</h3>
                <span className="rounded-chip bg-rose-50 px-2 py-1 text-caption font-semibold text-rose-600">{tr(`${attentionStaffCount} 人需关注`, `${attentionStaffCount} need attention`, `${attentionStaffCount} perlu perhatian`)}</span>
              </div>
              <p className="mt-1 text-caption font-medium text-slate-500">{tr('逾期和落后进度排前；点员工直接查看他的任务。', 'Overdue and behind-progress staff rank first; select one to inspect their tasks.', "Kakitangan tertunggak dan ketinggalan disenaraikan dahulu; pilih untuk menyemak tugasan mereka.")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-caption font-semibold">
              <span className="rounded-chip bg-rose-50 px-2 py-1 text-rose-600">{tr(`逾期 ${staffOverdueCount}`, `${staffOverdueCount} overdue`, `${staffOverdueCount} tertunggak`)}</span>
              <span className="rounded-chip bg-amber-50 px-2 py-1 text-amber-700">{tr(`落后任务 ${behindMissionCount}`, `${behindMissionCount} missions behind`, `${behindMissionCount} misi ketinggalan`)}</span>
              <button type="button" onClick={() => setShowStaffAttention(false)} className="rounded-chip bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200">
                {tr('隐藏', 'Hide', "Sembunyikan")}
              </button>
              {focusedStaffSummary && managementStaffName && (
                <button type="button" onClick={() => onStaffScopeChange(managementStaffName)} className="rounded-chip bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200">
                  {tr('显示全部员工', 'Show all staff', "Tunjukkan semua kakitangan")}
                </button>
              )}
            </div>
          </div>

          {visibleStaffAttentionSummaries.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleStaffAttentionSummaries.map((summary) => {
                const isSelected = summary.account.name === currentStaffName;
                const levelStyle = summary.level === 'critical'
                  ? { badge: 'bg-rose-50 text-rose-600', label: tr('异常', 'Critical', "Kritikal"), bar: 'bg-rose-500' }
                  : summary.level === 'warning'
                    ? { badge: 'bg-amber-50 text-amber-700', label: tr('需关注', 'Attention', "Perhatian"), bar: 'bg-amber-500' }
                    : { badge: 'bg-emerald-50 text-emerald-700', label: tr('正常', 'On track', "Mengikut sasaran"), bar: 'bg-emerald-500' };

                return (
                  <button
                    key={summary.account.id}
                    type="button"
                    data-testid={`staff-attention-card-${summary.account.id}`}
                    onClick={() => handleAssistStaff(summary.account.name)}
                    className={`rounded-card border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-e2 ${
                      isSelected ? 'border-brand-100 bg-brand-50/40 ring-2 ring-brand-100' : 'border-slate-100 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <StaffAvatar name={summary.account.name} avatarDataUrl={summary.account.avatar_data_url} className="h-10 w-10" textClassName="text-caption" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-footnote font-bold text-slate-900">{summary.account.name}</p>
                        <p className="text-caption text-slate-500">{trRole(summary.account.role)}</p>
                      </div>
                      <span className={`rounded-chip px-2 py-1 text-micro tracking-normal ${levelStyle.badge}`}>{levelStyle.label}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        ['overdue', tr('逾期', 'Overdue', "Tertunggak"), summary.overdueCount, summary.overdueCount > 0 ? 'text-rose-600' : 'text-slate-700'],
                        ['actions', tr('待办', 'Actions', "Tindakan"), summary.actionCount, 'text-slate-700'],
                        ['follow-up', tr('跟进', 'Follow Up', "Susulan"), summary.followUpCount, summary.followUpCount > 0 ? 'text-blue-700' : 'text-slate-700'],
                        ['workload', tr('工作量', 'Workload', "Beban"), summary.workloadCount, 'text-slate-700'],
                        ['mission', tr('任务', 'Mission', "Misi"), summary.missionCount > 0 ? `${summary.missionProgress}%` : '--', summary.behindMissionCount > 0 ? 'text-amber-700' : 'text-slate-700']
                      ].map(([key, label, value, valueClass]) => (
                        <div key={String(key)} data-testid={`staff-attention-${summary.account.id}-${key}`} className="rounded-control bg-white px-2 py-2 ring-1 ring-slate-100">
                          <p className="text-micro uppercase text-slate-500">{label}</p>
                          <p className={`mt-0.5 text-headline ${valueClass}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-micro tracking-normal">
                        <span className="text-slate-500">{summary.behindMissionCount > 0 ? tr(`${summary.behindMissionCount} 个任务落后`, `${summary.behindMissionCount} missions behind`, `${summary.behindMissionCount} misi ketinggalan`) : tr('平均任务进度', 'Average mission progress', "Purata kemajuan misi")}</span>
                        <span className="text-slate-600">{summary.missionCount > 0 ? `${summary.missionProgress}%` : '--'}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${levelStyle.bar}`} style={{ width: `${summary.missionCount > 0 ? summary.missionProgress : 0}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-1 text-micro tracking-normal text-brand-ink">
                        {tr('协助处理', 'Assist & action', "Bantu & ambil tindakan")} <ArrowUpRight className="h-3 w-3" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-control bg-slate-50 p-4 text-center text-footnote text-slate-500">{tr('没有 Active staff。', 'No active staff.', "Tiada kakitangan aktif.")}</p>
          )}
        </section>
      )}

      {canFilterStaffScope && focusedStaffSummary && currentStaffName !== managementStaffName && (
        <section
          data-testid="super-admin-assistance-mode"
          className="flex flex-col gap-2 rounded-card border border-brand-100 bg-brand-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-footnote font-bold text-brand-ink">
              {tr(`正在协助 ${currentStaffName}`, `Assisting ${currentStaffName}`, `Membantu ${currentStaffName}`)}
            </p>
            <p className="mt-1 text-caption font-medium text-brand-ink">
              {tr('你可以打开下方任务并代为判断、回复或执行；所有操作会记录为 Super Admin。', 'Open any task below to decide, reply, or take action. Every change is audited as Super Admin.', 'Buka tugasan di bawah untuk membuat keputusan, membalas atau mengambil tindakan. Semua perubahan diaudit sebagai Pentadbir Super.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => managementStaffName && onStaffScopeChange?.(managementStaffName)}
            className="self-start rounded-control bg-white px-3 py-2 text-caption font-semibold text-brand-ink ring-1 ring-brand-100 hover:bg-brand-50"
          >
            {tr('结束协助', 'End assistance', "Tamatkan bantuan")}
          </button>
        </section>
      )}

      <section ref={actionListRef} id="staff-action-list" data-testid="task-inbox-metric-strip" className="scroll-mt-20 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div title={tr('当前员工范围', 'Current staff scope', "Skop kakitangan semasa")} className="flex min-h-[82px] flex-col rounded-card border border-slate-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-chip bg-slate-100 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-slate-600">{tr('全部任务', 'All Tasks', "Semua Tugasan")}</span>
            <ListChecks className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-slate-900">{visibleTasks.length}</p>
          <p className="sr-only">{tr('当前员工范围', 'Current staff scope', "Skop kakitangan semasa")}</p>
        </div>
        <div title={tr('需要优先处理', 'Need action first', "Perlu tindakan dahulu")} className="flex min-h-[82px] flex-col rounded-card border border-rose-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-chip bg-rose-50 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-rose-600">{tr('紧急', 'Critical', "kritikal")}</span>
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-rose-600">{criticalCount}</p>
          <p className="sr-only">{tr('需要优先处理', 'Need action first', "Perlu tindakan dahulu")}</p>
        </div>
        <div title={tr('等待 Admin 审核', 'Waiting for Admin review', "Menunggu semakan Pentadbir")} className="flex min-h-[82px] flex-col rounded-card border border-amber-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-chip bg-amber-50 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-amber-700">{tr('新申请', 'New Applications', "Permohonan Baharu")}</span>
            <FilePlus2 className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-amber-600">{newApplicationCount}</p>
          <p className="sr-only">{tr('等待 Admin 审核', 'Waiting for Admin review', "Menunggu semakan Pentadbir")}</p>
        </div>
        <div title={tr('达成 / 进行中', 'Reached / active', "Mencapai / aktif")} className="flex min-h-[82px] flex-col rounded-card border border-brand-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-chip bg-brand-50 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-brand-ink">{tr('任务进度', 'Mission Progress', "Kemajuan Misi")}</span>
            <Target className="h-4 w-4 shrink-0 text-brand-ink" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-brand-ink">{completedProgressCount}/{progressCount}</p>
          <p className="sr-only">{tr('达成 / 进行中', 'Reached / active', "Mencapai / aktif")}</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          data-testid="toggle-hidden-tasks"
          type="button"
          onClick={() => setShowHiddenTasks((current) => !current)}
          disabled={hiddenTasks.length === 0}
          className={`inline-flex items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
            showHiddenTasks
              ? 'bg-brand text-white'
              : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:text-slate-300'
          }`}
        >
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          <span>{showHiddenTasks ? tr('正在看已隐藏', 'Showing Hidden', "Menunjukkan Tersembunyi") : tr('已隐藏', 'Hidden', "Tersembunyi")}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-caption ${
            showHiddenTasks ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
          }`}
          >
            {hiddenTasks.length}
          </span>
        </button>
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`inline-flex items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
              activeFilter === filter.key
                ? 'bg-brand text-white'
                : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <filter.Icon className="h-4 w-4" aria-hidden="true" />
            <span>{tr(filter.zh, filter.en, filter.ms)}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-caption ${
              activeFilter === filter.key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
            }`}
            >
              {filterCounts[filter.key]}
            </span>
          </button>
        ))}
      </section>

      <section data-testid="task-inbox-table-section" className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-e1">
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table
              data-testid="task-inbox-table"
              className="workbook-grid w-full min-w-[1080px] border-separate border-spacing-0 text-left text-footnote"
            >
              <thead className="bg-slate-50 text-micro text-slate-500">
                <tr className="h-11">
                  <th className={`${taskTableHeaderCellClass} w-[136px]`}>{tr('优先级 / 期限', 'Priority / Due', 'Keutamaan / Tempoh')}</th>
                  <th className={taskTableHeaderCellClass}>{tr('任务', 'Task', 'Tugasan')}</th>
                  <th className={`${taskTableHeaderCellClass} w-[240px]`}>{tr('下一步', 'Next step', 'Langkah seterusnya')}</th>
                  <th className={`${taskTableHeaderCellClass} w-[200px]`}>{tr('负责人 / 信息', 'Owner / Details', 'Pemilik / Butiran')}</th>
                  <th className={`${taskTableHeaderCellClass} w-[220px]`}>{tr('操作', 'Actions', 'Tindakan')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const severity = severityStyleMap[task.severity];
                  const ownerAccount = roleAccountByName.get(task.owner);
                  const metaAvatarAccount = task.metaAvatarName ? roleAccountByName.get(task.metaAvatarName) : undefined;
                  const inferredNextStepLabel = task.nextStepLabel
                    || task.quickActionLabel
                    || task.actionLabel
                    || task.addBankActionLabel
                    || task.secondaryActionLabel
                    || task.hideActionLabel;
                  const inferredNextStepInstruction = task.nextStepInstruction
                    || (inferredNextStepLabel ? task.context : undefined);
                  const showContextBeforeNextStep = !inferredNextStepLabel || (
                    Boolean(task.nextStepLabel)
                    && task.context.trim() !== (inferredNextStepInstruction || '').trim()
                  );

                  return (
                    <tr
                      key={task.id}
                      id={`task-card-${task.id}`}
                      data-task-row=""
                      data-task-id={task.id}
                      data-severity={task.severity}
                      data-focused={focusedTaskId === task.id ? 'true' : undefined}
                      className={focusedTaskId === task.id ? '!bg-brand-50 outline outline-2 -outline-offset-2 outline-brand' : undefined}
                    >
                      <td className={`${taskTableBodyCellClass} ${severity.rowBar}`}>
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-micro uppercase ${severity.iconBg} ${severity.iconText}`}>{task.badgeLabel || trSeverityLabel(severity.label)}</span>
                          <span className="inline-flex items-center gap-1 text-caption font-semibold text-slate-500">
                            {getTaskIcon(task, 'h-3.5 w-3.5')}
                            {task.categoryLabel || trCategoryLabel(task.category)}
                          </span>
                          <span className="text-caption text-slate-500">{task.dueLabel}</span>
                        </div>
                      </td>
                      <td className={taskTableBodyCellClass}>
                        <h3 className="line-clamp-2 text-headline text-slate-900" title={task.title}>{task.title}</h3>
                        {showContextBeforeNextStep && (
                          <p className="mt-1 line-clamp-2 text-caption leading-relaxed text-slate-500">{task.context}</p>
                        )}
                    {task.relatedTaskSummaries && task.relatedTaskSummaries.length > 0 && (
                      <div
                        data-testid={`related-application-tasks-${task.applicationId}`}
                        className="mt-3 space-y-2 rounded-control border border-slate-100 bg-slate-50/70 p-3"
                      >
                        <p className="text-micro uppercase text-slate-500">
                          {task.relatedTaskGroupLabel || tr('同一申请的其他提醒', 'Related reminders for this application', "Peringatan berkaitan untuk permohonan ini")}
                        </p>
                        {task.relatedTaskSummaries.map((relatedTask) => (
                          <div key={relatedTask.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-caption font-semibold text-slate-700">{relatedTask.title}</p>
                              <p className="line-clamp-1 text-caption text-slate-500">{relatedTask.context}</p>
                            </div>
                            <span className="shrink-0 text-caption text-slate-500">{relatedTask.dueLabel}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {task.missingInfoApplication && task.onSaveMissingInfo && (
                      <MissingInfoQuickEditor
                        application={task.missingInfoApplication}
                        onSave={task.onSaveMissingInfo}
                      />
                    )}
                    {task.rawLead && (
                      <RawLeadFollowUpQuickEditor
                        lead={task.rawLead}
                        onUpdate={onUpdateLead}
                        onRelease={onReleaseLead}
                      />
                    )}
                    {task.documentChecklist && (() => {
                      const missingCount = task.documentChecklist.filter((item) => item.status === 'Missing').length;

                      return (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-micro uppercase text-slate-500">
                              {tr('文件 / 资料清单', 'File / Document Checklist', "Senarai Semak Fail / Dokumen")}
                            </p>
                            <span className={`rounded-full px-2 py-0.5 text-micro tracking-normal ${
                              missingCount > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {missingCount > 0
                                ? tr(`${missingCount} 个缺失`, `${missingCount} missing`, `${missingCount} tiada`)
                                : tr('资料完整', 'Documents complete', "Dokumen lengkap")}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {task.documentChecklist.map((item) => {
                              const statusClass = item.status === 'Received'
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                : item.status === 'Not Required'
                                  ? 'bg-slate-100 text-slate-500 ring-slate-200'
                                  : 'bg-amber-50 text-amber-700 ring-amber-100';

                              const content = (
                                <>
                                  <span className="truncate text-caption font-semibold text-slate-700">{item.label}</span>
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-micro tracking-normal ring-1 ${statusClass}`}>
                                    {trDocumentStatus(item.status)}
                                  </span>
                                </>
                              );

                              return item.status === 'Missing' && task.onOpenDocumentChecklist ? (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={task.onOpenDocumentChecklist}
                                  className="flex items-center justify-between gap-2 rounded-control bg-slate-50 px-2.5 py-2 text-left transition-colors hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                  aria-label={tr(`打开 ${item.label} 文件清单`, `Open ${item.label} in document checklist`, `Buka ${item.label} dalam senarai semak dokumen`)}
                                >
                                  {content}
                                </button>
                              ) : (
                                <div key={item.key} className="flex items-center justify-between gap-2 rounded-control bg-slate-50 px-2.5 py-2">
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                    {task.calendarNote && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-micro uppercase text-slate-500">
                            {tr('任务回复', 'Task replies', 'Balasan tugasan')}
                          </p>
                          <span className="text-caption text-slate-500">
                            {(task.calendarNote.comments || []).length}
                          </span>
                        </div>
                        {(task.calendarNote.comments || []).length > 0 && (
                          <div className="mb-2 space-y-1.5">
                            {(task.calendarNote.comments || []).slice(-3).map((comment) => (
                              <div key={comment.id} className="rounded-control bg-slate-50 px-2.5 py-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate text-caption font-semibold text-slate-700">{comment.staff_name}</span>
                                  <span className="shrink-0 text-caption text-slate-500">{formatTaskCommentTime(comment.created_at)}</span>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap break-words text-footnote leading-relaxed text-slate-600">{comment.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <form
                          className="flex items-center gap-2"
                          onSubmit={async (submitEvent) => {
                            submitEvent.preventDefault();
                            const body = calendarReplyDrafts[task.calendarNote!.id]?.trim() || '';
                            if (!body || savingCalendarReplyId) return;
                            setSavingCalendarReplyId(task.calendarNote!.id);
                            try {
                              const saved = await onAddCalendarTaskComment(task.calendarNote!.id, body);
                              if (saved) {
                                setCalendarReplyDrafts((current) => ({ ...current, [task.calendarNote!.id]: '' }));
                              }
                            } finally {
                              setSavingCalendarReplyId('');
                            }
                          }}
                        >
                          <input
                            value={calendarReplyDrafts[task.calendarNote.id] || ''}
                            onChange={(inputEvent) => setCalendarReplyDrafts((current) => ({
                              ...current,
                              [task.calendarNote!.id]: inputEvent.target.value
                            }))}
                            maxLength={2000}
                            aria-label={`Reply on inbox task ${task.calendarNote.title}`}
                            placeholder={tr(
                              `回复 ${viewerStaffName === task.calendarNote.staff_name ? task.calendarNote.assigned_to : task.calendarNote.staff_name}`,
                              `Reply to ${viewerStaffName === task.calendarNote.staff_name ? task.calendarNote.assigned_to : task.calendarNote.staff_name}`,
                              `Balas kepada ${viewerStaffName === task.calendarNote.staff_name ? task.calendarNote.assigned_to : task.calendarNote.staff_name}`
                            )}
                            className="h-8 min-w-0 flex-1 rounded-control border border-slate-200 bg-white px-2.5 text-footnote text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-100 focus:ring-2 focus:ring-brand-100"
                          />
                          <button
                            type="submit"
                            disabled={!calendarReplyDrafts[task.calendarNote.id]?.trim() || Boolean(savingCalendarReplyId)}
                            aria-label={tr('发送任务回复', 'Send task reply', 'Hantar balasan tugasan')}
                            className="inline-flex h-8 items-center gap-1 rounded-control bg-brand px-2.5 text-caption font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {savingCalendarReplyId === task.calendarNote.id
                              ? tr('发送中', 'Sending', 'Menghantar')
                              : tr('回复', 'Reply', 'Balas')}
                          </button>
                        </form>
                      </div>
                    )}
                      </td>
                      <td className={taskTableBodyCellClass}>
                        {inferredNextStepLabel ? (
                          <div
                            data-testid={`task-next-step-${task.applicationId || task.id}`}
                            className="pl-2.5 shadow-[inset_2px_0_0_#f59e0b]"
                          >
                            <span className="sr-only">{tr('下一步', 'Next step', 'Langkah seterusnya')}</span>
                            <p className="text-footnote font-bold text-slate-900">{inferredNextStepLabel}</p>
                            {inferredNextStepInstruction && (
                              <p className="mt-0.5 text-caption leading-relaxed text-slate-600">
                                {inferredNextStepInstruction}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-caption text-slate-300">—</span>
                        )}
                      </td>
                      <td className={taskTableBodyCellClass}>
                        <div className="flex flex-col items-start gap-1.5 text-caption font-semibold">
                          {!task.hideOwner && <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-violet-700 ring-1 ring-violet-100">
                            {ownerAccount
                              ? <StaffAvatar name={ownerAccount.name} avatarDataUrl={ownerAccount.avatar_data_url} className="h-5 w-5" textClassName="text-[7px]" />
                              : <UserCheck className="h-3 w-3" />}
                            <span className="truncate">{task.owner}</span>
                          </span>}
                          {task.source && (
                            <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700 ring-1 ring-cyan-100">{task.source}</span>
                          )}
                          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-blue-700 ring-1 ring-blue-100">
                            {task.metaAvatarName && (
                              <StaffAvatar
                                name={task.metaAvatarName}
                                avatarDataUrl={metaAvatarAccount?.avatar_data_url}
                                className="h-5 w-5"
                                textClassName="text-[7px]"
                              />
                            )}
                            <span className="min-w-0 break-words">{task.meta}</span>
                          </span>
                        </div>
                      </td>
                      <td className={taskTableBodyCellClass}>
                        <div className="flex flex-col items-stretch gap-2 [&>button]:justify-center">
                      {task.assignmentOptions && task.onAssign && task.assignmentAriaLabel && (
                        <div className="w-full">
                          <ToggleOptionGroup
                            value=""
                            options={task.assignmentOptions}
                            onChange={async (handlerName) => {
                              if (!handlerName || runningQuickActionId) return;
                              setRunningQuickActionId(task.id);
                              try {
                                await task.onAssign?.(handlerName);
                              } finally {
                                setRunningQuickActionId('');
                              }
                            }}
                            disabled={Boolean(runningQuickActionId)}
                            ariaLabel={task.assignmentAriaLabel}
                            className="w-full rounded-control bg-amber-50 ring-1 ring-amber-200"
                            optionClassName="min-h-9 px-3 py-2 text-amber-800"
                          />
                        </div>
                      )}
                      {task.deliveryStockOptions && task.onDeliver && (
                        <DeliveryQuickAction
                          options={task.deliveryStockOptions}
                          noStockHint={task.deliveryNoStockHint}
                          running={runningQuickActionId === task.id}
                          onDeliver={async (stockUnitId) => {
                            if (runningQuickActionId) return;
                            setRunningQuickActionId(task.id);
                            try {
                              await task.onDeliver?.(stockUnitId);
                            } finally {
                              setRunningQuickActionId('');
                            }
                          }}
                        />
                      )}
                      {task.quickActionLabel && task.onQuickAction && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (runningQuickActionId) return;
                            setRunningQuickActionId(task.id);
                            try {
                              await task.onQuickAction();
                            } finally {
                              setRunningQuickActionId('');
                            }
                          }}
                          disabled={Boolean(runningQuickActionId)}
                          className="inline-flex items-center gap-1.5 rounded-control bg-emerald-700 px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {runningQuickActionId === task.id
                            ? tr('更新中...', 'Updating...', "Mengemas kini...")
                            : task.quickActionLabel}
                        </button>
                      )}
                      {task.actionLabel && task.onOpen && (
                        <button
                          type="button"
                          onClick={task.onOpen}
                          className="inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep"
                        >
                          {task.actionLabel}
                          <ArrowUpRight className="h-3.5 w-3.5 text-white/85" aria-hidden="true" />
                        </button>
                      )}
                      {task.onBankQuickAction && (
                        <div className="flex w-full flex-wrap gap-1.5" data-testid={`task-bank-quick-actions-${task.id}`}>
                          {BANK_QUICK_ACTION_BUTTONS.map((button) => (
                            <button
                              key={button.action}
                              type="button"
                              onClick={() => task.onBankQuickAction?.(button.action)}
                              className={`inline-flex h-7 items-center gap-1 rounded-control px-2 text-micro font-bold text-white transition-colors ${button.className}`}
                            >
                              <button.icon className="h-3 w-3" aria-hidden="true" />
                              {tr(...button.label)}
                            </button>
                          ))}
                        </div>
                      )}
                      {task.addBankActionLabel && task.onAddBankAction && (
                        <button
                          type="button"
                          onClick={task.onAddBankAction}
                          className="inline-flex items-center gap-1.5 rounded-control border border-brand-100 bg-white px-3 py-2 text-footnote font-bold text-brand-ink transition-colors hover:bg-brand-50"
                        >
                          {task.addBankActionLabel}
                          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                      {task.secondaryActionLabel && task.onSecondaryAction && (
                        <button
                          type="button"
                          onClick={task.onSecondaryAction}
                          className="inline-flex items-center gap-1.5 rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          {task.secondaryActionLabel}
                          <SystemIcon icon={MessageCircle} className="h-5 w-5" />
                        </button>
                      )}
                      {task.canHide !== false && <button
                        type="button"
                        onClick={() => {
                          if (showHiddenTasks) {
                            handleRestoreTask(task.id);
                          } else {
                            handleHideTask(task.id);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        {showHiddenTasks
                          ? <RotateCcw className="h-3.5 w-3.5" />
                          : task.hideActionLabel
                            ? <CheckCircle2 className="h-3.5 w-3.5" />
                            : <EyeOff className="h-3.5 w-3.5" />}
                        {showHiddenTasks
                          ? tr('恢复', 'Restore', "Pulihkan")
                          : task.hideActionLabel || tr('隐藏', 'Hide', "Sembunyi")}
                      </button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-headline text-slate-800">
              {showHiddenTasks ? tr('这个视图没有隐藏的任务', 'No hidden task in this view', "Tiada tugasan tersembunyi dalam paparan ini") : tr('这个视图没有任务', 'No task in this view', "Tiada tugasan dalam pandangan ini")}
            </p>
            <p className="mt-1 text-footnote text-slate-500">
              {showHiddenTasks ? tr('当前筛选没有隐藏的任务。', 'No hidden tasks in this filter.', "Tiada tugasan tersembunyi dalam penapis ini.") : tr('当前筛选没有需要处理的任务。', 'Nothing to handle in this filter.', "Tiada apa-apa untuk dikendalikan dalam penapis ini.")}
            </p>
          </div>
        )}
      </section>
      </>}

      {activeWorkspace === 'openLeads' && (
        <section className="space-y-4">
          {canImportLeads && (
            <div className="flex flex-col gap-3 rounded-card border border-slate-100 bg-white p-4 shadow-e1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-footnote font-bold text-slate-900">{tr('上传 TikTok 名单', 'Upload TikTok Leads', 'Muat Naik Prospek TikTok')}</p>
                <p className="mt-1 text-caption font-medium text-slate-500">
                  {tr('点击导入后选择公共池或私人池。', 'Choose Public Pool or Private Pool after clicking import.', 'Pilih Kumpulan Awam atau Kumpulan Peribadi selepas mengklik import.')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={leadFileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  aria-label="TikTok lead CSV file"
                  onChange={handleLeadCsvChange}
                />
                <button
                  type="button"
                  onClick={() => setLeadPoolChoiceMode('import')}
                  className="inline-flex items-center gap-2 rounded-control bg-brand px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep"
                >
                  <FileUp className="h-4 w-4" />
                  {tr('导入 TikTok CSV', 'Import TikTok CSV', 'Import TikTok CSV')}
                </button>
                {canCreateOwnLead && (
                  <button
                    type="button"
                    onClick={() => setLeadPoolChoiceMode('manual')}
                    className="inline-flex items-center gap-2 rounded-control bg-slate-900 px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                    {tr('手动新增', 'Add Lead', 'Tambah prospek')}
                  </button>
                )}
              </div>
            </div>
          )}

          {leadEntryMessage && (
            <p className="rounded-control bg-emerald-50 px-4 py-2 text-footnote text-emerald-700">{leadEntryMessage}</p>
          )}

          <div
            className="flex max-w-full items-center gap-1 overflow-x-auto rounded-card border border-slate-100 bg-white p-1 shadow-e1"
            role="tablist"
            aria-label={tr('名单分类', 'Lead lists', 'Senarai prospek')}
          >
            {([
              ['public', tr('开放名单', 'Open Leads', 'Prospek Terbuka'), openLeads.length, Users],
              ['private', tr('我的名单', 'My Leads', 'Prospek Saya'), myLeads.length, UserCheck]
            ] as Array<['public' | 'private', string, number, LucideIcon]>).map(([key, label, count, icon]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeLeadTab === key}
                aria-controls={`lead-list-panel-${key}`}
                aria-label={label}
                onClick={() => setActiveLeadTab(key)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-control px-4 py-2 text-footnote font-bold transition-colors ${
                  activeLeadTab === key
                    ? 'bg-brand text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <SystemIcon icon={icon} className="h-5 w-5" />
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-caption ${activeLeadTab === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {activeLeadTab === 'private' && myLeads.length > 0 && (
            <div
              className="flex max-w-full flex-wrap items-center gap-2"
              role="group"
              aria-label={tr('我的名单筛选', 'My Leads filters', 'Penapis Prospek Saya')}
            >
              {([
                ['all', tr('全部', 'All', 'Semua'), myLeadFilterCounts.all],
                ['contacted', tr('已联系', 'Contacted', 'Dihubungi'), myLeadFilterCounts.contacted],
                ['due', tr('跟进到期', 'Follow Up Due', 'Susulan Perlu Dibuat'), myLeadFilterCounts.due],
                ['interested', tr('有意向', 'Interested', 'Berminat'), myLeadFilterCounts.interested]
              ] as Array<[MyLeadFilter, string, number]>).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  aria-pressed={myLeadFilter === key}
                  onClick={() => setMyLeadFilter(key)}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
                    myLeadFilter === key
                      ? 'bg-brand text-white'
                      : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-micro tracking-normal ${myLeadFilter === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeLeadTab === 'private' && myLeads.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="flex max-w-full flex-wrap items-center gap-2"
                role="group"
                aria-label={tr('我的名单日期筛选', 'My Leads date filters', 'Penapis tarikh Prospek Saya')}
              >
                {([
                  ['all', tr('全部日期', 'All Dates', 'Semua Tarikh'), myLeadDateFilterCounts.all],
                  ['today', tr('今天', 'Today', 'Hari Ini'), myLeadDateFilterCounts.today],
                  ['yesterday', tr('昨天', 'Yesterday', 'Semalam'), myLeadDateFilterCounts.yesterday],
                  ['earlier', tr('更早', 'Earlier', 'Lebih Awal'), myLeadDateFilterCounts.earlier]
                ] as Array<[LeadDateFilter, string, number]>).map(([key, label, count]) => (
                  <button
                    key={key}
                    type="button"
                    aria-label={label}
                    aria-pressed={myLeadDateFilter === key}
                    onClick={() => setMyLeadDateFilter(key)}
                    className={`inline-flex min-h-9 items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
                      myLeadDateFilter === key
                        ? 'bg-brand text-white'
                        : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-micro tracking-normal ${myLeadDateFilter === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
              <ToggleOptionGroup
                value={myLeadSortOrder}
                onChange={(value) => setMyLeadSortOrder(value as LeadSortOrder)}
                ariaLabel={tr('我的名单排序', 'My Leads sort order', 'Susunan Prospek Saya')}
                className="w-full sm:w-44"
                options={[
                  { value: 'newest', label: tr('最新优先', 'Newest First', 'Terbaharu Dahulu') },
                  { value: 'oldest', label: tr('最早优先', 'Oldest First', 'Terlama Dahulu') }
                ]}
              />
            </div>
          )}

          {activeLeadTab === 'public' && openLeads.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="flex max-w-full flex-wrap items-center gap-2"
                role="group"
                aria-label={tr('开放名单日期筛选', 'Open Leads date filters', 'Penapis tarikh Prospek Terbuka')}
              >
                {([
                  ['all', tr('全部日期', 'All Dates', 'Semua Tarikh'), openLeadDateFilterCounts.all],
                  ['today', tr('今天', 'Today', 'Hari Ini'), openLeadDateFilterCounts.today],
                  ['yesterday', tr('昨天', 'Yesterday', 'Semalam'), openLeadDateFilterCounts.yesterday],
                  ['earlier', tr('更早', 'Earlier', 'Lebih Awal'), openLeadDateFilterCounts.earlier]
                ] as Array<[LeadDateFilter, string, number]>).map(([key, label, count]) => (
                  <button
                    key={key}
                    type="button"
                    aria-label={label}
                    aria-pressed={openLeadDateFilter === key}
                    onClick={() => setOpenLeadDateFilter(key)}
                    className={`inline-flex min-h-9 items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
                      openLeadDateFilter === key
                        ? 'bg-brand text-white'
                        : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-micro tracking-normal ${openLeadDateFilter === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
              <ToggleOptionGroup
                value={openLeadSortOrder}
                onChange={(value) => setOpenLeadSortOrder(value as LeadSortOrder)}
                ariaLabel={tr('开放名单排序', 'Open Leads sort order', 'Susunan Prospek Terbuka')}
                className="w-full sm:w-44"
                options={[
                  { value: 'newest', label: tr('最新优先', 'Newest First', 'Terbaharu Dahulu') },
                  { value: 'oldest', label: tr('最早优先', 'Oldest First', 'Terlama Dahulu') }
                ]}
              />
            </div>
          )}

          {deletableActiveLeads.length > 0 && (
            <div className="flex flex-col gap-3 rounded-card bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-footnote font-bold text-slate-700">
                  {tr(
                    `已选择 ${selectedActiveLeads.length} / ${deletableActiveLeads.length}`,
                    `${selectedActiveLeads.length} / ${deletableActiveLeads.length} selected`,
                    `${selectedActiveLeads.length} / ${deletableActiveLeads.length} dipilih`
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLeadIds(
                    selectedActiveLeads.length === deletableActiveLeads.length
                      ? []
                      : deletableActiveLeads.map((lead) => lead.id)
                  )}
                  className="rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
                >
                  {selectedActiveLeads.length === deletableActiveLeads.length
                    ? tr('清除选择', 'Clear Selection', 'Kosongkan Pilihan')
                    : tr('全选', 'Select All', 'Pilih Semua')}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {viewerStaffRole === 'Super Admin' && activeLeadTab === 'private' && (
                  <button
                    type="button"
                    disabled={selectedPrivateLeads.length === 0 || availableLeadAssignmentOptions.length === 0}
                    onClick={() => {
                      setLeadAssignmentStaffId(availableLeadAssignmentOptions[0]?.id || '');
                      setShowLeadAssignment(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-control bg-indigo-50 px-3 py-2 text-footnote font-bold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                    {tr(`分配已选 (${selectedPrivateLeads.length})`, `Assign Selected (${selectedPrivateLeads.length})`, `Berikan Dipilih (${selectedPrivateLeads.length})`)}
                  </button>
                )}
                <button
                  type="button"
                  disabled={selectedActiveLeads.length === 0}
                  onClick={() => { void handleDeleteLeads(selectedActiveLeads, 'selected'); }}
                  className="inline-flex items-center gap-2 rounded-control bg-rose-50 px-3 py-2 text-footnote font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {tr('删除已选', 'Delete Selected', 'Padam Dipilih')}
                </button>
                <button
                  type="button"
                  onClick={() => { void handleDeleteLeads(deletableActiveLeads, 'all'); }}
                  className="inline-flex items-center gap-2 rounded-control bg-rose-700 px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-rose-800"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {isFilteredActiveLeadView
                    ? tr(`删除当前显示 (${deletableActiveLeads.length})`, `Delete Shown (${deletableActiveLeads.length})`, `Padam Yang Ditunjukkan (${deletableActiveLeads.length})`)
                    : tr(`全部删除 (${deletableActiveLeads.length})`, `Delete All (${deletableActiveLeads.length})`, `Padam Semua (${deletableActiveLeads.length})`)}
                </button>
              </div>
            </div>
          )}

          {activeLeadTab === 'public' && (
            <div id="lead-list-panel-public" role="tabpanel" aria-label={tr('开放名单', 'Open Leads', 'Prospek Terbuka')}>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {renderLeadCardsGroupedByDate(visibleOpenLeads, false)}
                {visibleOpenLeads.length === 0 && (
                  <div className="col-span-full rounded-card border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-headline text-slate-800">
                      {openLeads.length === 0
                        ? tr('目前没有开放名单', 'No open leads', 'Tiada prospek terbuka')
                        : tr('这个日期筛选没有开放名单', 'No open leads in this date filter', 'Tiada prospek terbuka dalam penapis tarikh ini')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeLeadTab === 'private' && (
            <div id="lead-list-panel-private" role="tabpanel" aria-label={tr('我的名单', 'My Leads', 'Prospek Saya')}>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {renderLeadCardsGroupedByDate(visibleMyLeads, true)}
                {visibleMyLeads.length === 0 && (
                  <div className="col-span-full rounded-card border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-headline text-slate-800">
                      {myLeads.length === 0
                        ? tr('目前没有我的名单', 'No leads assigned to you', 'Tiada prospek ditugaskan kepada anda')
                        : tr('当前筛选没有名单', 'No leads in this filter', 'Tiada prospek dalam penapis ini')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {leadPoolChoiceMode && (leadPoolChoiceMode === 'import' ? canImportLeads : canCreateOwnLead) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={leadPoolChoiceMode === 'import'
            ? tr('选择导入池', 'Choose import pool', 'Pilih kumpulan import')
            : tr('选择新增名单位置', 'Choose where to add the lead', 'Pilih lokasi untuk menambah prospek')}
        >
          <div className="w-full max-w-lg rounded-panel bg-white p-5 shadow-e3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-headline text-slate-900">
                  {leadPoolChoiceMode === 'import'
                    ? tr('导入到哪里？', 'Where should these leads go?', 'Ke mana prospek ini harus dimasukkan?')
                    : tr('新增到哪里？', 'Where should this lead go?', 'Ke mana prospek ini harus dimasukkan?')}
                </h3>
                <p className="mt-1 text-footnote text-slate-500">
                  {leadPoolChoiceMode === 'import'
                    ? tr('选择后将打开 CSV 文件选择器。', 'Choose a pool to open the CSV file picker.', 'Pilih kumpulan untuk membuka pemilih fail CSV.')
                    : tr('选择 Open Leads 或你的私人 My Leads。', 'Choose Open Leads or your private My Leads.', 'Pilih Prospek Terbuka atau Prospek Saya peribadi anda.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeadPoolChoiceMode(null)}
                className="rounded-control p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={tr('关闭', 'Close', 'Tutup')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-label={tr('公共池', 'Public Pool', 'Kumpulan Awam')}
                onClick={() => handleLeadPoolSelection('public')}
                className="min-h-28 rounded-card border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:border-brand-100 hover:bg-brand-50"
              >
                <span className="flex items-center gap-2 text-headline text-slate-900">
                  <SystemIcon icon={Users} className="h-7 w-7" />
                  {tr('开放名单 · 公共池', 'Open Leads · Public Pool', 'Prospek Terbuka · Kumpulan Awam')}
                </span>
                <span className="mt-2 block text-footnote leading-relaxed text-slate-500">
                  {tr('保持未分配，进入 Open Leads。', 'Stay unassigned and appear in Open Leads.', 'Kekal belum ditugaskan dan muncul dalam Prospek Terbuka.')}
                </span>
              </button>
              <button
                type="button"
                aria-label={tr('私人池', 'Private Pool', 'Kumpulan Peribadi')}
                onClick={() => handleLeadPoolSelection('private')}
                className="min-h-28 rounded-card border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:border-brand-100 hover:bg-brand-50"
              >
                <span className="flex items-center gap-2 text-headline text-slate-900">
                  <SystemIcon icon={UserCheck} className="h-7 w-7" />
                  {tr('我的名单 · 私人池', 'My Leads · Private Pool', 'Prospek Saya · Kumpulan Peribadi')}
                </span>
                <span className="mt-2 block text-footnote leading-relaxed text-slate-500">
                  {tr('自动分配给你，进入 My Leads；之后可由 Super Admin 勾选并重新分配。', 'Assigned to you in My Leads; Super Admin can select and reassign them afterward.', 'Ditugaskan kepada anda dalam Prospek Saya; Super Admin boleh memilih dan memberikannya semula selepas itu.')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeadAssignment && viewerStaffRole === 'Super Admin' && selectedPrivateLeads.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={tr('分配已选私人名单', 'Assign selected private leads', 'Berikan prospek peribadi yang dipilih')}
        >
          <div className="w-full max-w-lg rounded-panel bg-white p-5 shadow-e3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-headline text-slate-900">{tr('分配私人名单', 'Assign Private Leads', 'Berikan Prospek Peribadi')}</h3>
                <p className="mt-1 text-footnote text-slate-500">
                  {tr(
                    `把已选择的 ${selectedPrivateLeads.length} 个私人名单交给其他员工。`,
                    `Assign ${selectedPrivateLeads.length} selected private leads to another staff member.`,
                    `Berikan ${selectedPrivateLeads.length} prospek peribadi yang dipilih kepada kakitangan lain.`
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadAssignment(false)}
                className="rounded-control p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={tr('关闭', 'Close', 'Tutup')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <ToggleOptionGroup
                value={leadAssignmentStaffId}
                onChange={setLeadAssignmentStaffId}
                ariaLabel={tr('分配私人名单给', 'Assign private leads to', 'Berikan prospek peribadi kepada')}
                className="w-full"
                options={availableLeadAssignmentOptions.map((account) => ({
                  value: account.id,
                  label: `${account.name} · ${trRole(account.role)}`
                }))}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeadAssignment(false)}
                  className="rounded-control bg-slate-100 px-4 py-2.5 text-footnote font-bold text-slate-600 hover:bg-slate-200"
                >
                  {tr('取消', 'Cancel', 'Batal')}
                </button>
                <button
                  type="button"
                  disabled={!leadAssignmentStaffId}
                  onClick={handleAssignSelectedPrivateLeads}
                  className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-footnote font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <UserCheck className="h-4 w-4" />
                  {tr('确认分配', 'Assign Leads', 'Berikan Prospek')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeadEntry && canCreateOwnLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-label={tr('手动新增潜在客户', 'Add lead manually', 'Tambah prospek secara manual')}>
          <form onSubmit={handleManualLeadSubmit} className="w-full max-w-2xl rounded-panel bg-white p-5 shadow-e3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-headline text-slate-900">{tr('手动新增潜在客户', 'Add Lead Manually', 'Tambah Prospek Secara Manual')}</h3>
                <p className="mt-1 text-footnote text-slate-500">
                  {manualLeadTargetPool === 'public'
                    ? tr('新增后会进入 Open Leads，保持未分配。', 'This lead will enter Open Leads and remain unassigned.', 'Prospek ini akan masuk ke Prospek Terbuka dan kekal belum ditugaskan.')
                    : tr('新增后只会出现在你的私人名单。', 'This lead will be added to your private list.', 'Prospek ini akan ditambah ke senarai peribadi anda.')}
                </p>
              </div>
              <button type="button" onClick={() => setShowLeadEntry(false)} className="rounded-control p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label={tr('关闭', 'Close', 'Tutup')}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-micro uppercase text-slate-500">
                {fieldLabel('customerName')} <span className="text-brand-ink">*</span>
                <input value={manualLeadDraft.name} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, name: event.target.value }))} className="mt-1 h-10 w-full rounded-control bg-slate-50 px-3 text-footnote font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-brand-100" autoFocus />
              </label>
              <label className="space-y-1 text-micro uppercase text-slate-500">
                {fieldLabel('phoneNumber')} <span className="text-brand-ink">*</span>
                <input value={manualLeadDraft.phone_no} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, phone_no: event.target.value }))} className="mt-1 h-10 w-full rounded-control bg-slate-50 px-3 text-footnote font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-brand-100" inputMode="tel" />
              </label>
              <label className="space-y-1 text-micro uppercase text-slate-500">
                {tr('渠道', 'Channel', 'Saluran')}
                <ToggleOptionGroup value={manualLeadDraft.channel} onChange={(value) => setManualLeadDraft((draft) => ({ ...draft, channel: value as RawCustomerChannel }))} ariaLabel={tr('渠道', 'Channel', 'Saluran')} className="mt-1 h-10 w-full rounded-control bg-slate-50 ring-1 ring-slate-100" options={(['TikTok', 'Facebook', 'Instagram', 'Google', 'Walk-in', 'Other'] as RawCustomerChannel[]).map((channel) => ({ value: channel, label: channel }))} />
              </label>
              <label className="space-y-1 text-micro uppercase text-slate-500">
                {tr('用户名', 'Username', 'Nama pengguna')}
                <input value={manualLeadDraft.username} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, username: event.target.value }))} className="mt-1 h-10 w-full rounded-control bg-slate-50 px-3 text-footnote font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-brand-100" />
              </label>
              <label className="space-y-1 text-micro uppercase text-slate-500">
                {fieldLabel('icNumber')}
                <input value={manualLeadDraft.ic_no} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, ic_no: event.target.value }))} className="mt-1 h-10 w-full rounded-control bg-slate-50 px-3 text-footnote font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-brand-100" />
              </label>
              <label className="space-y-1 text-micro uppercase text-slate-500">
                {fieldLabel('bankAccountNumber')}
                <input value={manualLeadDraft.account_number} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, account_number: event.target.value }))} className="mt-1 h-10 w-full rounded-control bg-slate-50 px-3 text-footnote font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-brand-100" />
              </label>
              <label className="space-y-1 text-micro uppercase text-slate-500 md:col-span-2">
                {tr('电邮', 'Email', 'E-mel')}
                <input value={manualLeadDraft.email} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, email: event.target.value }))} className="mt-1 h-10 w-full rounded-control bg-slate-50 px-3 text-footnote font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-brand-100" inputMode="email" />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowLeadEntry(false)} className="rounded-control bg-slate-100 px-4 py-2.5 text-footnote font-bold text-slate-600 hover:bg-slate-200">{tr('取消', 'Cancel', 'Batal')}</button>
              <button type="submit" className="rounded-control bg-brand px-4 py-2.5 text-footnote font-bold text-white hover:bg-brand-deep">{tr('新增名单', 'Add Lead', 'Tambah prospek')}</button>
            </div>
          </form>
        </div>
      )}

      <div className={activeWorkspace === 'relationships' ? 'block' : 'hidden'}>
        <CustomerRelationshipRiskPage
          applications={applications}
          rawCustomerLeads={rawCustomerLeads}
          rawCustomerMatches={rawCustomerMatches}
          roleAccounts={roleAccounts}
          currentStaffName={viewerStaffName}
          currentStaffRole={viewerStaffRole}
          onOpenApplication={(application) => onOpenApplication(application)}
          onOpenLeadPool={() => setActiveWorkspace('openLeads')}
          onDeleteLead={onDeleteLead}
          onActiveIssueCountChange={setRelationshipIssueCount}
        />
      </div>
    </div>
  );
}
