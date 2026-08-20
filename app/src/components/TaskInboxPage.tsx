/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowUpRight, BadgeDollarSign, BellRing, Building2, CalendarDays, Check, CheckCircle2, EyeOff, FilePlus2, FileUp, FileWarning, ListChecks, Pencil, Plus, RotateCcw, Send, Target, Trash2, UserCheck, Users, X, type LucideIcon } from 'lucide-react';
import { ApprovalRequest, BankApplication, CalendarNote, CustomerRawMatch, CustomMission, CustomMissionMetricType, CustomMissionTimeframe, DealFinance, getLoanPendingAction, getLoanPendingWith, LoanApplication, LoanStatus, NotificationItem, PurchaseMethod, QuickStockInput, RawCustomerChannel, RawCustomerLead, RawLeadFollowUpStatus, RejectNextStepType, RoleAccount, RoleNavAccessSetting, VehicleCatalogItem, VehicleCondition, VehicleStockUnit } from '../types';
import { resolveTaskAssignmentRole, type TaskAssignmentKey } from '../data/roleNavAccess';
import { getMissingDocumentLabels, normalizeDocumentChecklist } from '../utils/documentChecklist';
import { getMissingApplicationInformationLabels } from '../utils/applicationCompleteness';
import { getApplicationRejectCodes } from '../utils/rejectCodes';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';
import { parseTikTokLeadCsv } from '../utils/rawLeadEntry';
import { buildMissingCheckoutIncidents, type MissingCheckoutIncident } from '../utils/attendanceSummary';
import { getApplicationIdsRequiringVehicleStock, getVehicleStockReference, normalizeVehicleNumberPlate } from '../utils/vehicleStock';
import type { AttendanceEvent, AttendanceIncidentResolution } from '../services/dashboardRepository';
import { getAppLocale, tr, trBankStatus, trFollowUpStatus, trLoanStatus, trNotificationMessage, trNotificationTitle, trRole } from '../lib/i18n';
import customersIcon from '../assets/icons/nav/customers.png';
import customerRelationshipsIcon from '../assets/icons/nav/customerRelationships.png';
import followUpMessageIcon from '../assets/icons/nav/followUpMessage.png';
import infoIcon from '../assets/icons/nav/info.png';
import missionTargetIcon from '../assets/icons/nav/missionTarget.png';
import claimedLeadsIcon from '../assets/icons/nav/claimedLeads.png';
import publicLeadsIcon from '../assets/icons/nav/publicLeads.png';
import taskInboxIcon from '../assets/icons/nav/taskInbox.png';
import urgentIcon from '../assets/icons/nav/urgent.png';
import whatsappContactIcon from '../assets/icons/nav/whatsappContact.png';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';
import CustomerRelationshipRiskPage from './CustomerRelationshipRiskPage';
import { useBrandedDialog } from './BrandedDialogProvider';

export type TaskInboxMirrorCategory = 'missing' | 'rawLead' | 'cash' | 'bank' | 'reminder' | 'mission';
type TaskCategory = TaskInboxMirrorCategory;
type TaskFilter = 'all' | 'newApplication' | TaskCategory;
export type TaskInboxMirrorSeverity = 'critical' | 'warning' | 'info' | 'success';
type TaskSeverity = TaskInboxMirrorSeverity;

export interface TaskInboxMirrorItem {
  id: string;
  category: TaskInboxMirrorCategory;
  severity: TaskInboxMirrorSeverity;
  title: string;
  context: string;
  meta: string;
  dueLabel: string;
  categoryLabel?: string;
  badgeLabel?: string;
}

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
  canFilterStaffScope?: boolean;
  onStaffScopeChange?: (staffName: string) => void;
  onOpenApplication: (application: LoanApplication, target?: 'documentChecklist' | 'bankApplications' | 'addBank') => void;
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
  onCompleteCashAcceptance: (application: LoanApplication) => Promise<boolean>;
  onAssignApplicationHandler: (applicationId: string, handlerName: string) => void | Promise<void>;
  onAssignApplicationAdmin: (applicationId: string, adminName: string) => void | Promise<void>;
  vehicleCatalog: VehicleCatalogItem[];
  onMarkBikeDelivered: (applicationId: string, stockUnitId: string) => Promise<boolean>;
  onOpenFinanceStock?: (model?: string) => void;
  onQuickAddStock?: (applicationId: string, model: string, input: QuickStockInput) => Promise<boolean>;
  onOpenFinanceDeal?: (applicationId: string) => void;
  onMarkCommissionPaid?: (applicationId: string) => Promise<boolean>;
  onSaveDealFinance?: (applicationId: string, finance: DealFinance) => Promise<boolean>;
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
}

type TaskInboxWorkspace = 'tasks' | 'openLeads' | 'relationships';
type MyLeadFilter = 'all' | 'contacted' | 'due' | 'interested';
type LeadDateFilter = 'all' | 'today' | 'yesterday' | 'earlier';
type LeadSortOrder = 'newest' | 'oldest';

interface InboxTask {
  id: string;
  applicationId?: string;
  sortTime: number;
  category: TaskCategory;
  severity: TaskSeverity;
  title: string;
  context: string;
  meta: string;
  source?: string;
  metaAvatarName?: string;
  dueLabel: string;
  owner: string;
  nextStepLabel?: string;
  nextStepInstruction?: string;
  actionLabel?: string;
  onOpen?: () => void;
  badgeLabel?: string;
  categoryLabel?: string;
  hideOwner?: boolean;
  isNewApplication?: boolean;
  documentChecklist?: ReturnType<typeof normalizeDocumentChecklist>;
  onOpenDocumentChecklist?: () => void;
  canHide?: boolean;
  hideActionLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  quickActionLabel?: string;
  onQuickAction?: () => Promise<boolean>;
  deliveryStockOptions?: Array<{ id: string; label: string }>;
  deliveryNoStockHint?: string;
  onDeliver?: (stockUnitId: string) => Promise<boolean>;
  addBankActionLabel?: string;
  onAddBankAction?: () => void;
  assignmentOptions?: Array<{ value: string; label: string; leading?: React.ReactNode }>;
  assignmentAriaLabel?: string;
  onAssign?: (handlerName: string) => void | Promise<void>;
  missingInfoApplication?: LoanApplication;
  onSaveMissingInfo?: (
    updates: { vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod }
  ) => Promise<boolean>;
  calendarNote?: CalendarNote;
  rawLead?: RawCustomerLead;
  relatedTaskSummaries?: Array<{
    id: string;
    title: string;
    context: string;
    dueLabel: string;
  }>;
  relatedTaskGroupLabel?: string;
}

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

const severityStyleMap: Record<TaskSeverity, {
  border: string;
  iconBg: string;
  iconText: string;
  label: string;
}> = {
  critical: {
    border: 'border-rose-100',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    label: 'Critical' as const
  },
  warning: {
    border: 'border-amber-100',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    label: 'Warning'
  },
  info: {
    border: 'border-slate-100',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    label: 'Info'
  },
  success: {
    border: 'border-red-100',
    iconBg: 'bg-red-50',
    iconText: 'text-red-700',
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
  return tr(zhMap[category] || category, category, msMap[category] || category);
};

const rejectNextStepPresentation = (bankApplication?: BankApplication) => {
  if (!bankApplication?.next_action) {
    return undefined;
  }

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
  const instructions: Record<RejectNextStepType, [string, string, string]> = {
    REQUEST_DOCUMENTS: ['打开申请，向客户索取缺少的文件，补齐后重新提交。', 'Open the application, request the missing documents, then resubmit.', 'Buka permohonan, minta dokumen yang hilang, kemudian hantar semula.'],
    CORRECT_INFORMATION: ['打开申请，更正客户或贷款资料，确认后重新提交。', 'Open the application, correct the customer or loan details, then resubmit.', 'Buka permohonan, betulkan butiran pelanggan atau pinjaman, kemudian hantar semula.'],
    ADJUST_DEAL: ['打开申请，调整贷款方案或金额，确认后重新提交。', 'Open the application, update the deal terms or amount, then resubmit.', 'Buka permohonan, laraskan terma atau amaun urus niaga, kemudian hantar semula.'],
    TRY_ANOTHER_BANK: ['打开申请，新增另一家银行并提交。', 'Open the application, add another bank, then submit.', 'Buka permohonan, tambah bank lain, kemudian hantar.'],
    FOLLOW_UP_LATER: ['打开申请，确认跟进内容并安排下一次跟进。', 'Open the application, confirm the follow-up details, and schedule the next follow-up.', 'Buka permohonan, sahkan butiran susulan dan jadualkan susulan seterusnya.'],
    CONVERT_TO_CASH: ['打开申请，把购买方式改为 Cash 并确认现金流程。', 'Open the application, change the purchase method to Cash, and confirm the cash flow.', 'Buka permohonan, tukar kaedah pembelian kepada Tunai dan sahkan aliran tunai.'],
    CLOSE_REJECTED: ['打开申请，确认拒贷原因后结案。', 'Open the application, confirm the rejection reason, and close the file.', 'Buka permohonan, sahkan sebab penolakan dan tutup fail.'],
    MERGE_DUPLICATE: ['打开申请，核对重复记录并完成合并。', 'Open the application, verify the duplicate record, and complete the merge.', 'Buka permohonan, sahkan rekod pendua dan lengkapkan gabungan.']
  };
  const nextStepType = bankApplication.reject_next_step;

  return {
    label: nextStepType ? tr(...labels[nextStepType]) : bankApplication.next_action,
    instruction: nextStepType
      ? tr(...instructions[nextStepType])
      : tr('打开申请并完成这个下一步。', 'Open the application and complete this next step.', 'Buka permohonan dan lengkapkan langkah seterusnya ini.')
  };
};

const getMetricLabel = (metric: CustomMissionMetricType) => {
  const labels: Record<CustomMissionMetricType, [string, string, string]> = {
    top_sales_approved: ['批核单数', 'Approved sales', 'Jualan diluluskan'],
    fast_response: ['响应速度', 'Fast response', 'Respons pantas'],
    raw_lead_conversion: ['名单转化', 'Lead conversion', 'Penukaran prospek']
  };
  return tr(labels[metric][0], labels[metric][1], labels[metric][2]);
};

const normalizeMatchValue = (value: string) => value.trim().toLowerCase();
const getHiddenTaskStorageKey = (staffName: string) => `dr_racing_hidden_task_inbox_items:${staffName}`;

const readHiddenTaskIds = (staffName: string) => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(getHiddenTaskStorageKey(staffName));
    return saved ? JSON.parse(saved).filter((item: unknown): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Date-only values (from <input type="date">) must be treated as LOCAL
// midnight; new Date('YYYY-MM-DD') parses them as UTC midnight, which can
// shift the calendar day depending on the machine timezone.
function parseDueDate(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDueTime(value?: string) {
  return parseDueDate(value)?.getTime() ?? Number.NaN;
}

function getLatestTaskTime(...values: (string | undefined)[]) {
  const validTimes = values
    .map((value) => getDueTime(value))
    .filter(Number.isFinite);

  return validTimes.length > 0 ? Math.max(...validTimes) : 0;
}

function isToday(value?: string) {
  if (!value) {
    return false;
  }

  const date = parseDueDate(value);

  if (!date) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatShortDate(value?: string) {
  if (!value) {
    return tr('没有截止日期', 'No due date', "Tiada tarikh akhir");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return tr('日期无效', 'Invalid date', "Tarikh tidak sah");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return date.toLocaleDateString(getAppLocale(), {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  return date.toLocaleString(getAppLocale(), {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

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

function formatMalaysiaAttendanceTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return tr('时间无效', 'Invalid time', 'Masa tidak sah');

  return date.toLocaleTimeString(getAppLocale(), {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getMissionRange(mission: CustomMission) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (mission.timeframe === 'this_month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (mission.timeframe === 'last_month') {
    start.setMonth(now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(1);
    end.setHours(0, 0, 0, 0);
    end.setMilliseconds(-1);
    return { start, end };
  }

  if (mission.timeframe === 'last_30_days') {
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const customStart = mission.custom_start_date ? new Date(`${mission.custom_start_date}T00:00:00`) : new Date(0);
  const customEnd = mission.custom_end_date ? new Date(`${mission.custom_end_date}T23:59:59`) : new Date(8640000000000000);
  return { start: customStart, end: customEnd };
}

function isWithinMissionRange(value: string, mission: CustomMission) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const { start, end } = getMissionRange(mission);
  return date >= start && date <= end;
}

function getTimeframeLabel(timeframe: CustomMissionTimeframe) {
  if (timeframe === 'this_month') {
    return tr('本月', 'This month', "bulan ini");
  }

  if (timeframe === 'last_month') {
    return tr('上月', 'Last month', "bulan lepas");
  }

  if (timeframe === 'last_30_days') {
    return tr('近 30 天', 'Last 30 days', "30 hari lepas");
  }

  return tr('自定义', 'Custom', "Adat");
}

function isStaffInMissionScope(mission: CustomMission, staffName: string, staffRole: RoleAccount['role']) {
  if (mission.scope_type === 'staff') {
    return mission.scope_value === staffName;
  }

  if (mission.scope_type === 'role') {
    return mission.scope_value === staffRole;
  }

  return true;
}

function getExpectedMissionProgress(mission: CustomMission, now: Date) {
  if (mission.timeframe === 'last_month' || mission.timeframe === 'last_30_days') {
    return 100;
  }

  if (mission.timeframe === 'this_month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.min((now.getDate() / daysInMonth) * 100, 100);
  }

  const { start, end } = getMissionRange(mission);
  if (now <= start) {
    return 0;
  }
  if (now >= end) {
    return 100;
  }

  return Math.min(((now.getTime() - start.getTime()) / Math.max(end.getTime() - start.getTime(), 1)) * 100, 100);
}

interface ApplicationMatchIndex {
  phones: Set<string>;
  identityNumbers: Set<string>;
  accountNumbers: Set<string>;
  emails: Set<string>;
}

function buildApplicationMatchIndex(applications: LoanApplication[]): ApplicationMatchIndex {
  const index: ApplicationMatchIndex = {
    phones: new Set(),
    identityNumbers: new Set(),
    accountNumbers: new Set(),
    emails: new Set()
  };

  applications.forEach((application) => {
    const phone = normalizePhoneDigits(application.phone_no || '');
    const identityNumber = normalizeMatchValue(application.ic_no || '');
    const accountNumber = normalizeMatchValue(application.personal_info?.account_number || '');
    const email = normalizeMatchValue(application.personal_info?.email || '');

    if (phone) index.phones.add(phone);
    if (identityNumber) index.identityNumbers.add(identityNumber);
    if (accountNumber) index.accountNumbers.add(accountNumber);
    if (email) index.emails.add(email);
  });

  return index;
}

function hasMatchingApplication(lead: RawCustomerLead, applicationMatchIndex: ApplicationMatchIndex) {
  const leadPhone = normalizePhoneDigits(lead.phone_no || '');
  const leadIc = normalizeMatchValue(lead.ic_no || '');
  const leadAccount = normalizeMatchValue(lead.account_number || '');
  const leadEmail = normalizeMatchValue(lead.email || '');

  return (
    Boolean(leadPhone && applicationMatchIndex.phones.has(leadPhone)) ||
    Boolean(leadIc && applicationMatchIndex.identityNumbers.has(leadIc)) ||
    Boolean(leadAccount && applicationMatchIndex.accountNumbers.has(leadAccount)) ||
    Boolean(leadEmail && applicationMatchIndex.emails.has(leadEmail))
  );
}

function calculateMissionProgress(
  mission: CustomMission,
  staffName: string,
  applications: LoanApplication[],
  rawCustomerLeads: RawCustomerLead[],
  applicationMatchIndex: ApplicationMatchIndex
) {
  const target = Math.max(Number(mission.target_value) || 1, 1);

  if (mission.metric_type === 'top_sales_approved') {
    const value = applications.filter((application) => (
      application.handler_name === staffName &&
      application.status === LoanStatus.APPROVE &&
      isWithinMissionRange(application.submitted_at, mission)
    )).length;

    return {
      value,
      displayValue: tr(`${value} 单批核`, `${value} approved`, `${value} diluluskan`),
      progress: Math.min((value / target) * 100, 100),
      meta: tr(`目标 ${target} 单批核`, `Target ${target} approved`, `Sasaran ${target} diluluskan`)
    };
  }

  if (mission.metric_type === 'raw_lead_conversion') {
    const value = rawCustomerLeads.filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && isWithinMissionRange(lead.taken_at, mission)) &&
      hasMatchingApplication(lead, applicationMatchIndex)
    )).length;

    return {
      value,
      displayValue: tr(`${value} 个转化`, `${value} converted`, `${value} ditukar`),
      progress: Math.min((value / target) * 100, 100),
      meta: tr(`目标 ${target} 个转化`, `Target ${target} converted`, `Sasaran ${target} ditukar`)
    };
  }

  const responseMinutes = rawCustomerLeads
    .filter((lead) => (
      lead.taken_by_staff_name === staffName &&
      Boolean(lead.taken_at && lead.last_follow_up_at && isWithinMissionRange(lead.taken_at, mission))
    ))
    .map((lead) => {
      const takenTime = new Date(lead.taken_at || '').getTime();
      const responseTime = new Date(lead.last_follow_up_at || '').getTime();
      return Math.max(Math.round((responseTime - takenTime) / 60000), 0);
    })
    .filter((minutes) => Number.isFinite(minutes));
  const averageMinutes = responseMinutes.length > 0
    ? Math.round(responseMinutes.reduce((sum, minutes) => sum + minutes, 0) / responseMinutes.length)
    : Number.POSITIVE_INFINITY;

  return {
    value: averageMinutes,
    displayValue: Number.isFinite(averageMinutes) ? tr(`平均 ${averageMinutes} 分钟`, `${averageMinutes} min avg`, `${averageMinutes} min purata`) : tr('还没有响应记录', 'No response yet', "Tiada maklum balas lagi"),
    progress: Number.isFinite(averageMinutes) ? Math.min((target / Math.max(averageMinutes, 1)) * 100, 100) : 0,
    meta: tr(`目标 ${target} 分钟 · ${responseMinutes.length} 个名单`, `Target ${target} min · ${responseMinutes.length} leads`, `Sasaran ${target} min · ${responseMinutes.length} prospek`)
  };
}

function IconImage({ src, className = 'h-5 w-5' }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden="true" className={`${className} object-contain`} />;
}

function getTaskIcon(task: Pick<InboxTask, 'category' | 'isNewApplication'>) {
  const cardIconClass = 'h-11 w-11';

  if (task.isNewApplication) {
    return <IconImage src={customersIcon} className={cardIconClass} />;
  }

  if (task.category === 'missing') {
    return <IconImage src={urgentIcon} className={cardIconClass} />;
  }

  if (task.category === 'rawLead') {
    return <IconImage src={followUpMessageIcon} className={cardIconClass} />;
  }

  if (task.category === 'bank') {
    return <IconImage src={infoIcon} className={cardIconClass} />;
  }

  if (task.category === 'cash') {
    return <IconImage src={customersIcon} className={cardIconClass} />;
  }

  if (task.category === 'reminder') {
    return <IconImage src={urgentIcon} className={cardIconClass} />;
  }

  return <IconImage src={missionTargetIcon} className={cardIconClass} />;
}

function getNotificationCategory(notification: NotificationItem): InboxTask['category'] {
  if (notification.type === 'raw_lead_assigned') return 'rawLead';
  if (notification.type === 'mission_due_soon' || notification.type === 'custom_mission_target_reached') return 'mission';
  if (notification.type === 'loan_sales_review_required') return 'bank';
  if (notification.type === 'bank_submission_required' || notification.type === 'bank_need_more_info' || notification.type === 'loan_admin_action_required' || notification.type === 'loan_documents_uploaded') return 'bank';
  if (notification.type === 'rejected_loan_missing_code' || notification.type === 'loan_documents_required' || notification.type === 'loan_rejected_action_required') return 'missing';
  return 'reminder';
}

function getEquivalentGeneratedTaskId(notification: NotificationItem) {
  const dedupeParts = notification.dedupe_key.split(':');

  if (notification.type === 'rejected_loan_missing_code') return `missing-${notification.target_id}`;
  if (notification.type === 'customer_call_back_due') return `customer-call-back-${notification.target_id}`;
  if (notification.type === 'bank_need_more_info') return `missing-${notification.target_id}`;
  if (notification.type === 'bank_submission_required' && dedupeParts[2]) return `bank-submit-${notification.target_id}-${dedupeParts[2]}`;
  if (notification.type === 'bank_follow_up_due' && dedupeParts[2]) return `bank-follow-up-${notification.target_id}-${dedupeParts[2]}`;
  if (notification.type === 'loan_admin_action_required') return `workflow-admin-${notification.target_id}`;
  if (notification.type === 'loan_sales_review_required') return `workflow-handler-${notification.target_id}`;
  if (notification.type === 'loan_documents_required') return `missing-${notification.target_id}`;
  if (notification.type === 'loan_rejected_action_required' || notification.type === 'loan_approved') return `workflow-handler-${notification.target_id}`;
  return '';
}

function getNotificationActionLabel(notification: NotificationItem) {
  const labels: Partial<Record<NotificationItem['type'], [string, string, string]>> = {
    raw_lead_assigned: ['跟进潜在客户', 'Follow up lead', 'Susuli prospek'],
    calendar_task_assigned: ['处理日历任务', 'Complete calendar task', 'Selesaikan tugasan kalendar'],
    calendar_task_comment: ['查看任务回复', 'Review task reply', 'Semak balasan tugasan'],
    mission_due_soon: ['查看任务进度', 'Review mission progress', 'Semak kemajuan misi'],
    bank_submission_required: ['提交银行', 'Submit to bank', 'Hantar ke bank'],
    bank_need_more_info: ['补齐银行资料', 'Provide bank information', 'Sediakan maklumat bank'],
    bank_follow_up_due: ['跟进银行', 'Follow up bank', 'Susuli bank'],
    loan_sales_review_required: ['检查申请', 'Check application', 'Semak permohonan'],
    loan_admin_action_required: ['审核申请', 'Review application', 'Semak permohonan'],
    loan_documents_required: ['补齐文件', 'Provide documents', 'Sediakan dokumen'],
    loan_documents_uploaded: ['审核新文件', 'Review uploaded documents', 'Semak dokumen dimuat naik'],
    loan_rejected_action_required: ['处理拒贷下一步', 'Resolve rejected loan', 'Selesaikan pinjaman ditolak'],
    loan_approved: ['联系客户', 'Contact customer', 'Hubungi pelanggan'],
    customer_call_back_due: ['联系客户', 'Contact customer', 'Hubungi pelanggan'],
    custom_mission_target_reached: ['查看已达成任务', 'Review completed mission', 'Semak misi selesai'],
    rejected_loan_missing_code: ['补上拒贷代码', 'Add rejection CODE', 'Tambah KOD penolakan'],
    internal_comment_tagged: ['查看被标记留言', 'Review tagged comment', 'Semak komen ditanda']
  };
  const label = labels[notification.type];
  if (label) return tr(...label);
  if (notification.target_type === 'calendar_note') return tr('处理日历任务', 'Complete calendar task', "Selesaikan tugasan kalendar");
  return tr('查看任务', 'Review task', "Semak tugasan");
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
    <div className="mt-3 max-w-xl rounded-xl border border-amber-100 bg-amber-50/40 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
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
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:col-span-2 sm:justify-self-start"
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
    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/40 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
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
            className="rounded-lg border border-amber-100 bg-white px-3 py-2 text-[11px] font-bold text-amber-700 transition-colors hover:bg-amber-100"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onUpdate(lead.id, { next_follow_up_at: '' })}
          className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100"
        >
          {tr('不再提醒', 'No reminder', "Tiada peringatan")}
        </button>
        {lead.lead_visibility !== 'Private' && (
          <button
            type="button"
            onClick={() => onRelease(lead)}
            className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100"
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
        className="mt-2 h-9 w-full rounded-lg border border-amber-100 bg-white px-3 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-300 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
      />
    </div>
  );
}

// Total landed cost of one physical stock unit. 0 means Operations has not
// recorded the cost yet, which drives the "record vehicle cost" task.
function getStockUnitLandedCost(unit: VehicleStockUnit): number {
  return (
    (Number(unit.purchase_cost) || 0) +
    (Number(unit.transport_cost) || 0) +
    (Number(unit.registration_cost) || 0) +
    (Number(unit.accessories_cost) || 0) +
    (Number(unit.repair_cost) || 0) +
    (Number(unit.other_direct_cost) || 0)
  );
}

function getDealSalesValue(finance: DealFinance): number {
  return (Number(finance.final_selling_price) || 0)
    + (Number(finance.other_income) || 0)
    - (Number(finance.refund_amount) || 0);
}

function getDealReceipts(finance: DealFinance, purchaseMethod?: PurchaseMethod): number {
  return (Number(finance.customer_deposit_received) || 0)
    + (Number(finance.customer_cash_payment) || 0)
    + (purchaseMethod === 'Cash' ? 0 : (Number(finance.bank_disbursement) || 0));
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
      <span className="inline-flex items-center rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
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
        className="h-9 max-w-[220px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:cursor-wait"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => { if (!running && selectedId) void onDeliver(selectedId); }}
        disabled={running || !selectedId}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300"
      >
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        {running ? tr('更新中...', 'Updating...', "Mengemas kini...") : tr('标记交车', 'Mark Delivered', "Tandakan Dihantar")}
      </button>
    </span>
  );
}

// 成交结算弹窗: do the whole settlement (receipts, finance completion, commission
// payout) from the Task Inbox without opening the Finance Center page.
function DealSettlementModal({
  application,
  onSave,
  onClose
}: {
  application: LoanApplication;
  onSave: (applicationId: string, finance: DealFinance) => Promise<boolean>;
  onClose: () => void;
}) {
  const base = application.deal_finance;
  const isCash = application.purchase_method === 'Cash';
  const [draft, setDraft] = useState<DealFinance | null>(base ? {
    ...base,
    ...(isCash ? { bank_disbursement: 0, bank_disbursed_at: '' } : {})
  } : null);
  const [editingRecordedField, setEditingRecordedField] = useState<'final_selling_price' | 'commission_amount' | null>(null);
  const [saving, setSaving] = useState(false);
  if (!draft) return null;
  const num = (value: unknown) => Number(value) || 0;
  const today = new Date().toISOString().slice(0, 10);
  const salesValue = num(draft.final_selling_price) + num(draft.other_income) - num(draft.refund_amount);
  const receipts = num(draft.customer_deposit_received) + num(draft.customer_cash_payment) + num(draft.bank_disbursement);
  const outstanding = Math.max(salesValue - receipts, 0);
  const financeReady = salesValue > 0 && receipts + 0.01 >= salesValue;
  const setField = (field: keyof DealFinance, value: number) => setDraft((current) => {
    if (!current) return current;
    const next = { ...current, [field]: value };
    if (field === 'final_selling_price' && current.commission_percent !== undefined) {
      next.commission_amount = Math.round(value * current.commission_percent) / 100;
    }
    if (field === 'commission_amount') {
      next.commission_percent = undefined;
    }
    return next;
  });
  const persist = async (extra: Partial<DealFinance>, keepOpen = false) => {
    if (saving) return;
    setSaving(true);
    try {
      const next = {
        ...draft,
        ...extra,
        ...(isCash ? { bank_disbursement: 0, bank_disbursed_at: '' } : {})
      } as DealFinance;
      const ok = await onSave(application.id, next);
      if (ok) {
        if (keepOpen) setDraft(next);
        else onClose();
      }
    } finally {
      setSaving(false);
    }
  };
  const moneyField = (label: string, field: keyof DealFinance) => (
    <label className="block space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
      <span className="block">{label}</span>
      <span className="flex items-stretch overflow-hidden rounded-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="inline-flex items-center bg-slate-50 px-2 font-mono text-xs text-slate-500">RM</span>
        <input
          type="number"
          min="0"
          step="0.01"
          aria-label={label}
          value={Number(draft[field]) || ''}
          onChange={(event) => setField(field, Number(event.target.value) || 0)}
          className="min-w-0 flex-1 px-2 py-2 text-right font-mono text-xs font-bold text-slate-700 outline-none"
        />
      </span>
    </label>
  );
  const moneyDisplay = (label: string, field: 'final_selling_price' | 'commission_amount', testId: string, detail?: string) => (
    <span className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <span className="flex items-center justify-between gap-2">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <button
          type="button"
          data-testid={`${testId}-edit`}
          onClick={() => setEditingRecordedField((current) => current === field ? null : field)}
          className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 hover:text-red-700"
          aria-label={`${editingRecordedField === field ? tr('完成', 'Done', 'Selesai') : tr('编辑', 'Edit', 'Edit')} ${label}`}
        >
          {editingRecordedField === field ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
          {editingRecordedField === field ? tr('完成', 'Done', 'Selesai') : tr('编辑', 'Edit', 'Edit')}
        </button>
      </span>
      {editingRecordedField === field ? (
        <span className="mt-2 flex items-stretch overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-100">
          <span className="inline-flex items-center bg-slate-100 px-2 font-mono text-xs text-slate-500">RM</span>
          <input
            type="number"
            min="0"
            step="0.01"
            autoFocus
            data-testid={`${testId}-input`}
            aria-label={`${tr('编辑', 'Edit', 'Edit')} ${label}`}
            value={Number(draft[field]) || ''}
            onChange={(event) => setField(field, Number(event.target.value) || 0)}
            className="min-w-0 flex-1 px-2 py-2 text-right font-mono text-xs font-bold text-slate-700 outline-none"
          />
        </span>
      ) : (
        <span data-testid={testId} className="mt-1 block font-mono text-sm font-bold text-slate-800">
          RM{num(draft[field]).toLocaleString('en-MY', { maximumFractionDigits: 2 })}
        </span>
      )}
      {detail && <span className="mt-1 block text-[10px] font-semibold text-slate-500">{detail}</span>}
    </span>
  );
  return (
    <div data-testid="deal-settlement-modal" data-purchase-method={application.purchase_method} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('成交结算', 'Deal Settlement', 'Penyelesaian')}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{application.applicant_name} · {application.vehicle_model} · {application.handler_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {moneyDisplay(
            tr('最终售价 · 已记录', 'Final Selling Price · Recorded', 'Harga Jualan Akhir · Direkod'),
            'final_selling_price',
            'settlement-final-selling-price',
            tr('已从成交资料带入', 'Loaded from the deal record', 'Diambil daripada rekod urus niaga')
          )}
          {!isCash && moneyField(tr('银行放款', 'Bank Disbursement', 'Pengeluaran Bank'), 'bank_disbursement')}
          {moneyField(tr('实际到账订金', 'Deposit Actually Received', 'Deposit Sebenar Diterima'), 'customer_deposit_received')}
          {moneyField(tr('客户现金', 'Customer Cash', 'Tunai Pelanggan'), 'customer_cash_payment')}
          {moneyField(tr('银行/成交费用', 'Bank / Deal Charges', 'Caj Bank'), 'direct_bank_charges')}
          {moneyDisplay(
            draft.commission_percent === undefined
              ? tr('佣金金额 · 已记录', 'Commission Amount · Recorded', 'Jumlah Komisen · Direkod')
              : tr(`佣金 · 卖价 ${draft.commission_percent}%`, `Commission · ${draft.commission_percent}% of selling price`, `Komisen · ${draft.commission_percent}% harga jualan`),
            'commission_amount',
            'settlement-commission-amount',
            tr('已从成交资料带入', 'Loaded from the deal record', 'Diambil daripada rekod urus niaga')
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
          <span><span className="block text-[10px] font-bold uppercase text-slate-500">{tr('应收', 'Sales Value', 'Jualan')}</span><span className="mt-1 block font-mono text-xs font-bold text-slate-800">RM{Math.round(salesValue)}</span></span>
          <span><span className="block text-[10px] font-bold uppercase text-slate-500">{tr('已收', 'Received', 'Terima')}</span><span className="mt-1 block font-mono text-xs font-bold text-emerald-600">RM{Math.round(receipts)}</span></span>
          <span><span className="block text-[10px] font-bold uppercase text-slate-500">{tr('未收', 'Outstanding', 'Baki')}</span><span className={`mt-1 block font-mono text-xs font-bold ${outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>RM{Math.round(outstanding)}</span></span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className={`rounded-md px-2 py-1 ${draft.finance_completed_at ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{draft.finance_completed_at ? tr('财务已完成', 'Finance completed', 'Kewangan selesai') : tr('财务未完成', 'Finance pending', 'Kewangan belum')}</span>
          <span className={`rounded-md px-2 py-1 ${draft.commission_paid_at ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{draft.commission_paid_at ? tr('佣金已付', 'Commission paid', 'Komisen dibayar') : tr('佣金未付', 'Commission unpaid', 'Komisen belum')}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100 hover:text-red-700">{tr('关闭', 'Close', 'Tutup')}</button>
          <button type="button" disabled={saving} onClick={() => persist({}, true)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60">{tr('保存', 'Save', 'Simpan')}</button>
          {!draft.finance_completed_at && (
            <button type="button" disabled={saving || !financeReady} title={financeReady ? '' : tr('收齐款才能完成财务', 'Collect full payment first', 'Kutip bayaran penuh dahulu')} onClick={() => persist({ finance_completed_at: today }, true)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300">{tr('标记财务完成', 'Mark Finance Completed', 'Tanda Kewangan Selesai')}</button>
          )}
          {draft.finance_completed_at && !draft.commission_paid_at && (
            <button type="button" disabled={saving} onClick={() => persist({ commission_paid_at: today })} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300">{tr('标记佣金已付', 'Mark Commission Paid', 'Tanda Komisen Dibayar')}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// 快速补库存弹窗: Operations adds one In-Stock unit (with cost) for the deal's
// vehicle model directly from the Task Inbox. Deal amounts belong to this
// application; only the physical unit and its costs are stored with the model.
function QuickAddStockModal({
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
  const [draft, setDraft] = useState(() => ({
    sellingPrice: toMoney(application.deal_finance?.final_selling_price),
    loanAmount: toMoney(application.deal_finance?.loan_amount),
    deposit: toMoney(application.deal_finance?.deposit_amount),
    commissionAmount: toMoney(application.deal_finance?.commission_amount),
    purchaseCost: 0,
    transportCost: 0,
    repairCost: 0,
    freeGiftCost: 0,
    numberPlate: ''
  }));
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (saving || draft.sellingPrice <= 0 || draft.purchaseCost <= 0 || !normalizeVehicleNumberPlate(draft.numberPlate)) return;
    setSaving(true);
    const ok = await onSave(application.id, model, {
      selling_price: draft.sellingPrice,
      loan_amount: draft.loanAmount,
      deposit_amount: draft.deposit,
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
  const moneyField = (label: string, key: 'sellingPrice' | 'loanAmount' | 'deposit' | 'commissionAmount' | 'purchaseCost' | 'transportCost' | 'repairCost' | 'freeGiftCost', highlight = false) => (
    <label className="block space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
      <span className="block">{label}</span>
      <span className={`flex items-stretch overflow-hidden rounded-lg ring-1 ${highlight ? 'ring-red-200 focus-within:ring-2 focus-within:ring-red-200' : 'ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-100'}`}>
        <span className="inline-flex items-center bg-slate-50 px-2 font-mono text-xs text-slate-500">RM</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={draft[key] || ''}
          onChange={(event) => setDraft((current) => ({ ...current, [key]: Math.max(0, Number(event.target.value) || 0) }))}
          className="min-w-0 flex-1 px-2 py-2 text-right font-mono text-xs font-bold text-slate-700 outline-none"
        />
      </span>
    </label>
  );
  const totalCost = draft.purchaseCost + draft.transportCost + draft.repairCost + draft.freeGiftCost;
  const dealSellingPrice = draft.sellingPrice;
  const estimatedNetProfit = dealSellingPrice - totalCost - draft.commissionAmount;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('快速补库存', 'Quick Add Stock', 'Tambah Stok Pantas')}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{model} · {tr('客户', 'Customer', 'Pelanggan')} {application.applicant_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <section className="rounded-xl bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 font-mono text-sm font-bold text-white">+</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{tr('成交价格 / 融资资料', 'Deal Price / Financing Details', 'Harga Urus Niaga / Butiran Pembiayaan')}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {moneyField(tr('+ 卖价 / 现金价（必填）', '+ Selling / Cash Price (required)', '+ Harga Jualan / Tunai (wajib)'), 'sellingPrice')}
              {application.purchase_method !== 'Cash' && moneyField(tr('+ 贷款额', '+ Loan Amount', '+ Jumlah Pinjaman'), 'loanAmount')}
              {application.purchase_method !== 'Cash' && moneyField(tr('+ 约定订金', '+ Agreed Deposit', '+ Deposit Dipersetujui'), 'deposit')}
            </div>
          </section>

          <section className="rounded-xl bg-rose-50/70 p-4 ring-1 ring-rose-100">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-rose-600 font-mono text-sm font-bold text-white">−</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">{tr('车辆成本 / 支出', 'Vehicle Costs / Outgoing Amounts', 'Kos Kenderaan / Jumlah Keluar')}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {moneyField(tr('− 购买成本（必填）', '− Purchase Cost (required)', '− Kos Belian (wajib)'), 'purchaseCost', true)}
              {moneyField(tr('− 运输费', '− Transport Fee', '− Kos Pengangkutan'), 'transportCost')}
              {moneyField(tr('− 维修费', '− Repair Fee', '− Kos Pembaikan'), 'repairCost')}
              {moneyField(tr('− Free Gift 成本', '− Free Gift Cost', '− Kos Hadiah Percuma'), 'freeGiftCost')}
              {moneyField(tr('− 佣金', '− Commission', '− Komisen'), 'commissionAmount')}
            </div>
          </section>
        </div>
        <label className="mt-3 block space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span className="block">{tr('车辆基本资料 · 车牌（必填）', 'Vehicle Details · Number Plate (required)', 'Butiran Kenderaan · Nombor Plat (wajib)')}</span>
          <input
            type="text"
            value={draft.numberPlate}
            onChange={(event) => setDraft((current) => ({ ...current, numberPlate: event.target.value }))}
            placeholder="VEE4989"
            className="w-full rounded-lg px-2 py-2 font-mono text-xs font-bold uppercase text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            [tr('+ 卖价', '+ Selling Price', '+ Harga Jualan'), dealSellingPrice, 'text-emerald-700'],
            [tr('− 总成本', '− Total Landed Cost', '− Jumlah Kos'), totalCost, 'text-rose-700'],
            [tr('− 佣金（手动填写）', '− Commission (manual)', '− Komisen (manual)'), draft.commissionAmount, 'text-rose-700'],
            [tr('= 预计净利润', '= Estimated Net Profit', '= Anggaran Untung Bersih'), estimatedNetProfit, estimatedNetProfit < 0 ? 'text-rose-700' : 'text-slate-900']
          ] as Array<[string, number, string]>).map(([label, amount, tone]) => (
            <span key={label} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
              <span className={`mt-1 block font-mono text-sm font-bold ${tone}`}>RM{amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}</span>
            </span>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-slate-500">
          {tr('卖价、贷款额、订金和手动佣金只保存到这位客户的成交资料；车辆成本保存到这台库存车。Vehicle Info 只用于车型资料，不会读取或改写价格。', 'Selling price, loan amount, deposit, and manual commission are saved only to this customer deal; vehicle costs are saved to the physical stock unit. Vehicle Info is used only for model data and its prices are neither read nor changed.', 'Harga jualan, jumlah pinjaman, deposit dan komisen manual disimpan hanya untuk urus niaga pelanggan ini; kos kenderaan disimpan pada unit stok fizikal. Vehicle Info digunakan untuk data model sahaja dan harganya tidak dibaca atau diubah.')}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100 hover:text-red-700">{tr('关闭', 'Close', 'Tutup')}</button>
          <button
            type="button"
            disabled={saving || draft.sellingPrice <= 0 || draft.purchaseCost <= 0 || !normalizeVehicleNumberPlate(draft.numberPlate)}
            title={draft.sellingPrice > 0 && draft.purchaseCost > 0 && normalizeVehicleNumberPlate(draft.numberPlate) ? '' : tr('请填写卖价、购买成本和 Number Plate', 'Enter the selling price, purchase cost, and Number Plate', 'Isi harga jualan, kos belian dan Nombor Plat')}
            onClick={() => { void save(); }}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
  canFilterStaffScope = false,
  onStaffScopeChange,
  onOpenApplication,
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
  onMarkBikeDelivered,
  onOpenFinanceStock,
  onQuickAddStock,
  onOpenFinanceDeal,
  onMarkCommissionPaid,
  onSaveDealFinance,
  onUpdateMissingInfo,
  onAddCalendarTaskComment,
  onSetCalendarNoteCompleted,
  onResolveMissingCheckout,
  approvalRequests = [],
  onReviewApproval,
  staffLeaveRequests = [],
  onReviewLeaveRequest,
  onVisibleTasksChange
}: TaskInboxPageProps) {
  const { showConfirm } = useBrandedDialog();
  const [activeWorkspace, setActiveWorkspace] = useState<TaskInboxWorkspace>('tasks');
  const [settlementAppId, setSettlementAppId] = useState('');
  const [quickStockAppId, setQuickStockAppId] = useState('');
  const [relationshipIssueCount, setRelationshipIssueCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [showHiddenTasks, setShowHiddenTasks] = useState(false);
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
  // Stable per mount: a fresh Date()/getStartOfToday() on every render used to
  // give these new identities each render, which defeated the `tasks` memo and
  // re-ran the whole O(apps + banks + missions + notifications) derivation on
  // every keystroke / parent re-render.
  const todayStart = useMemo(() => getStartOfToday(), []);
  const inboxReferenceTime = useMemo(() => new Date(), []);
  const todayEndTime = useMemo(() => new Date(todayStart).setHours(23, 59, 59, 999), [todayStart]);
  const missingCheckoutIncidents = useMemo(
    () => buildMissingCheckoutIncidents(attendanceEvents, inboxReferenceTime)
      .filter((incident) => !attendanceIncidentResolutions.some((resolution) => (
        resolution.id === incident.id
        && resolution.last_check_in_at === incident.lastCheckInAt
      ))),
    [attendanceEvents, attendanceIncidentResolutions, inboxReferenceTime]
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
  const canCreateOwnLead = ['Sales', 'Super Admin'].includes(viewerStaffRole) && viewerStaffName === currentStaffName;
  const canImportLeads = ['Sales', 'Admin', 'Super Admin'].includes(viewerStaffRole);
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
    const uniquePart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
      : `${Date.now()}${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
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

  const tasks = useMemo<InboxTask[]>(() => {
    const handlesAssignedTask = (taskKey: TaskAssignmentKey) => {
      const assignedRole = resolveTaskAssignmentRole(taskKey, roleNavAccess);
      const hasActiveAssignedRole = roleAccounts.some((account) => (
        account.status === 'Active' && account.role === assignedRole
      ));

      return currentStaffRole === assignedRole || (
        currentStaffRole === 'Super Admin' && assignedRole !== 'Super Admin' && !hasActiveAssignedRole
      );
    };
    const staffApplications = applications.filter((application) => application.handler_name === currentStaffName);
    const salesTaskApplications = handlesAssignedTask('sales_application_follow_up')
      ? currentStaffRole === 'Super Admin' ? applications : staffApplications
      : [];
    const adminTaskApplications = handlesAssignedTask('admin_application_review')
      ? applications.filter((application) => {
        const pendingWith = getLoanPendingWith(application);
        if (pendingWith !== 'Admin' && pendingWith !== 'Bank') return false;
        if (currentStaffRole === 'Super Admin') return true;
        if (application.admin_owner_name) return application.admin_owner_name === currentStaffName;
        return currentStaffRole === 'Admin';
      })
      : [];
    const salesTaskApplicationIds = new Set(salesTaskApplications.map((application) => application.id));
    const adminTaskApplicationIds = new Set(adminTaskApplications.map((application) => application.id));
    const workflowApplications = applications.filter((application) => {
      const pendingWith = getLoanPendingWith(application);
      if (pendingWith === 'Handler') {
        return salesTaskApplicationIds.has(application.id);
      }
      if (pendingWith === 'Admin' || pendingWith === 'Bank') {
        return adminTaskApplicationIds.has(application.id);
      }
      return false;
    });
    const missingTasks = salesTaskApplications.reduce<InboxTask[]>((items, application) => {
        const missingDocuments = getMissingDocumentLabels(application);
        const pendingAction = getLoanPendingAction(application);
        if (pendingAction === 'Complete Application') return items;
        const isTerminalApplication = application.status === LoanStatus.REJECT || application.status === LoanStatus.CANCELLED;
        const missingRejectCode = application.status === LoanStatus.REJECT && getApplicationRejectCodes(application).length === 0;
        const latestRejectedBank = [...(application.bank_applications || [])].reverse().find((bank) => bank.status === 'Rejected');
        const missingFields = [
          !isTerminalApplication && !application.vehicle_condition ? tr('新车/二手', 'New / Used', "Baharu / Terpakai") : '',
          !isTerminalApplication && !application.purchase_method ? tr('现金/贷款', 'Cash / Loan', "Tunai / Pinjaman") : '',
          missingRejectCode ? tr('拒贷代码', 'Rejected CODE', "KOD ditolak") : '',
          !isTerminalApplication && pendingAction === 'Provide Documents' && missingDocuments.length === 0
            ? latestRejectedBank?.next_action || tr('银行要求补件', 'Bank document request', "Permintaan dokumen bank")
            : '',
          ...(!isTerminalApplication
            ? missingDocuments.map((documentLabel) => tr(`文件：${documentLabel}`, `Document: ${documentLabel}`, `Dokumen: ${documentLabel}`))
            : [])
        ].filter(Boolean);

        if (missingFields.length === 0) {
          return items;
        }

        items.push({
          id: `missing-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(
            application.pending_since,
            ...(application.document_checklist?.map((item) => item.updated_at) || []),
            application.submitted_at
          ),
          category: 'missing',
          severity: missingRejectCode ? 'critical' : 'warning',
          title: application.applicant_name,
          context: tr(`缺少 ${missingFields.join('、')}`, `Missing ${missingFields.join(', ')}`, `Tiada ${missingFields.join(', ')}`),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
          dueLabel: tr('到客户详情补齐', 'Fix in customer detail', "Betulkan dalam butiran pelanggan"),
          owner: application.handler_name,
          actionLabel: tr('补齐缺失资料', 'Complete missing info', "Lengkapkan maklumat tiada"),
          onOpen: () => onOpenApplication(application),
          missingInfoApplication: !application.vehicle_condition || !application.purchase_method
            ? application
            : undefined,
          onSaveMissingInfo: !application.vehicle_condition || !application.purchase_method
            ? (updates) => onUpdateMissingInfo(application, updates)
            : undefined
        });

        return items;
      }, []);

    const activeSalesAssignmentOptions = roleAccounts
      .filter((account) => account.status === 'Active' && account.role === 'Sales')
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((account) => ({
        value: account.name,
        label: account.name,
        leading: (
          <StaffAvatar
            name={account.name}
            avatarDataUrl={account.avatar_data_url}
            className="h-6 w-6"
            textClassName="text-[8px]"
          />
        )
      }));
    const activeAdminAssignmentOptions = roleAccounts
      .filter((account) => account.status === 'Active' && account.role === 'Admin')
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((account) => ({
        value: account.name,
        label: account.name,
        leading: (
          <StaffAvatar
            name={account.name}
            avatarDataUrl={account.avatar_data_url}
            className="h-6 w-6"
            textClassName="text-[8px]"
          />
        )
      }));
    const seoAssignmentTasks: InboxTask[] = handlesAssignedTask('seo_sales_assignment')
      ? applications
        .filter((application) => (
          application.handler_name === 'SEO' &&
          application.customer_intake_tracking?.submitted_from === 'seo_website' &&
          getLoanPendingWith(application) === 'Handler' &&
          getLoanPendingAction(application) === 'Complete Application' &&
          application.status !== LoanStatus.REJECT &&
          application.status !== LoanStatus.CANCELLED
        ))
        .map((application) => ({
          id: `workflow-seo-assignment-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(application.pending_since, application.submitted_at),
          category: application.purchase_method === 'Cash' ? 'cash' as const : 'bank' as const,
          severity: 'warning' as const,
          title: tr(
            `SEO 申请 · ${application.applicant_name}`,
            `SEO application · ${application.applicant_name}`,
            `Permohonan SEO · ${application.applicant_name}`
          ),
          context: tr(
            '官网 SEO 申请还没有 Sales 负责人。',
            'This website SEO application does not have a Sales handler yet.',
            'Permohonan SEO laman web ini belum mempunyai pengendali Jualan.'
          ),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
          dueLabel: tr('等待分配', 'Awaiting assignment', 'Menunggu tugasan'),
          owner: currentStaffName,
          hideOwner: true,
          isNewApplication: true,
          categoryLabel: 'SEO',
          badgeLabel: tr('分配 Sales', 'Assign Sales', 'Tetapkan Jualan'),
          nextStepLabel: tr('分配给 Sales', 'Assign to Sales', 'Tetapkan kepada Jualan'),
          nextStepInstruction: tr(
            '直接在这张任务卡选择负责跟进的 Sales。',
            'Choose the responsible Sales directly on this task card.',
            'Pilih Jualan yang bertanggungjawab terus pada kad tugasan ini.'
          ),
          assignmentOptions: [
            {
              value: '',
              label: tr('选择 Sales', 'Choose Sales', 'Pilih Jualan')
            },
            ...activeSalesAssignmentOptions
          ],
          assignmentAriaLabel: `Assign Sales handler for ${application.id}`,
          onAssign: (handlerName: string) => onAssignApplicationHandler(application.id, handlerName),
          actionLabel: tr('打开申请', 'Open application', 'Buka permohonan'),
          onOpen: () => onOpenApplication(application),
          canHide: false
        }))
      : [];

    const rawLeadTasks: InboxTask[] = rawCustomerLeads
      .filter((lead) => (
        lead.taken_by_staff_name === currentStaffName &&
        !['Submitted Loan', 'Rejected', 'Closed'].includes(lead.follow_up_status || '') &&
        Boolean(lead.next_follow_up_at) &&
        getDueTime(lead.next_follow_up_at) <= todayEndTime
      ))
      .map((lead) => {
        const dueTime = getDueTime(lead.next_follow_up_at);
        const isOverdue = dueTime < todayStart.getTime();

        return {
          id: `raw-lead-${lead.id}`,
          sortTime: getLatestTaskTime(lead.next_follow_up_at, lead.last_follow_up_at, lead.taken_at, lead.received_at),
          category: 'rawLead',
          severity: isOverdue ? 'critical' : 'warning',
          title: lead.name || lead.username || tr('未命名名单', 'Raw lead', "prospek mentah"),
          context: lead.follow_up_note || trFollowUpStatus(lead.follow_up_status || '') || tr('今天要跟进这个名单', 'Follow up this lead today', "susulan prospek ini hari ini"),
          meta: `${lead.channel} · ${lead.phone_no || lead.lead_id || lead.id}`,
          dueLabel: isOverdue ? tr(`已逾期 · ${formatShortDate(lead.next_follow_up_at)}`, `Overdue · ${formatShortDate(lead.next_follow_up_at)}`, `Tertunggak · ${formatShortDate(lead.next_follow_up_at)}`) : tr(`今天 · ${formatShortDate(lead.next_follow_up_at)}`, `Today · ${formatShortDate(lead.next_follow_up_at)}`, `Hari ini · ${formatShortDate(lead.next_follow_up_at)}`),
          owner: lead.taken_by_staff_name || currentStaffName,
          rawLead: lead,
          nextStepLabel: tr('跟进潜在客户', 'Follow up lead', "Susuli prospek"),
          nextStepInstruction: lead.follow_up_note || tr('通过 WhatsApp 联系客户，并在联系后更新跟进状态。', 'Contact the lead on WhatsApp, then update the follow-up status.', "Hubungi prospek melalui WhatsApp, kemudian kemas kini status susulan."),
          secondaryActionLabel: 'WhatsApp',
          onSecondaryAction: () => onOpenWhatsApp(lead, 'web')
        };
      });

    const bankSubmissionTasks: InboxTask[] = workflowApplications
      .filter((application) => getLoanPendingWith(application) === 'Admin')
      .map((application) => {
        const pendingAction = getLoanPendingAction(application);
        const isNewApplication = pendingAction === 'Review Application';
        const isCashPurchase = application.purchase_method === 'Cash';
        const draftBank = [...(application.bank_applications || [])].reverse().find((bank) => bank.status === 'Draft');
        const rejectedBank = [...(application.bank_applications || [])].reverse().find((bank) => bank.status === 'Rejected');
        const rejectedNextStep = rejectNextStepPresentation(rejectedBank);
        const canAddBank = !isCashPurchase && (isNewApplication || pendingAction === 'Submit to Bank');
        return {
          id: `workflow-admin-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(application.pending_since, draftBank?.submitted_at, application.submitted_at),
          category: isCashPurchase ? 'cash' as const : 'bank' as const,
          severity: 'warning' as const,
          title: `${isCashPurchase
            ? tr('现金购买', 'Cash purchase', "Pembelian tunai")
            : draftBank?.bank_name || tr('贷款申请', 'Loan application', "Permohonan pinjaman")} · ${application.applicant_name}`,
          context: pendingAction === 'Review Application'
            ? isCashPurchase
              ? tr('检查 IC 和现金购买资料；缺资料就退回 Handler，完整就批准并交回 Handler 确认客户接受。', 'Review the IC and cash purchase details. Return missing items to the Handler, or approve and hand back for customer acceptance.', "Semak IC dan butiran pembelian tunai. Pulangkan item yang hilang kepada Pengendali, atau luluskan untuk penerimaan pelanggan.")
              : tr('检查文件是否完整；缺资料就退回 Handler，完整就新增银行并提交。', 'Review the documents. Return missing items to the handler or add a bank and submit.', "Semak dokumen. Pulangkan item yang hilang kepada pengendali atau tambah bank dan hantar.")
            : pendingAction === 'Resubmit to Bank'
              ? tr('Sales 已完成补件，请检查后重新提交银行。', 'Sales completed the documents. Review and resubmit to the bank.', "Jualan telah melengkapkan dokumen. Semak dan hantar semula ke bank.")
              : pendingAction === 'Submit to Bank' && rejectedBank?.next_action
                ? tr(
                  `${rejectedBank.bank_name || '银行'} 已拒绝申请。`,
                  `${rejectedBank.bank_name || 'Bank'} rejected the application.`,
                  `${rejectedBank.bank_name || 'Bank'} menolak permohonan.`
                )
              : tr('资料已完成，请提交银行。', 'Documents are ready. Submit to the bank.', "Dokumen sudah siap. Hantar ke bank."),
          meta: `${tr('Handler', 'Handler', "Pengendali")}: ${application.handler_name} · ${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")}`,
          metaAvatarName: application.handler_name,
          dueLabel: tr(`等待 Admin · ${formatShortDate(application.pending_since || application.submitted_at)}`, `Waiting for Admin · ${formatShortDate(application.pending_since || application.submitted_at)}`, `Menunggu Pentadbir · ${formatShortDate(application.pending_since || application.submitted_at)}`),
          owner: application.admin_owner_name || tr('Admin 团队', 'Admin team', "Pasukan pentadbir"),
          nextStepLabel: pendingAction === 'Submit to Bank' ? rejectedNextStep?.label : undefined,
          nextStepInstruction: pendingAction === 'Submit to Bank' ? rejectedNextStep?.instruction : undefined,
          badgeLabel: isCashPurchase
            ? tr('现金审核', 'Cash Review', "Semakan Tunai")
            : isNewApplication ? tr('新申请', 'New Application', "Permohonan Baharu") : undefined,
          categoryLabel: isCashPurchase ? tr('现金', 'Cash', "Tunai") : undefined,
          hideOwner: isNewApplication && viewerStaffRole !== 'Super Admin',
          isNewApplication,
          documentChecklist: isNewApplication ? normalizeDocumentChecklist(application) : undefined,
          onOpenDocumentChecklist: isNewApplication ? () => onOpenApplication(application, 'documentChecklist') : undefined,
          actionLabel: pendingAction === 'Review Application'
            ? isCashPurchase
              ? tr('检查现金申请', 'Review cash purchase', "Semak pembelian tunai")
              : tr('审核申请', 'Review application', "Semak permohonan")
            : pendingAction === 'Resubmit to Bank'
              ? tr('重新提交银行', 'Resubmit to bank', "Hantar semula ke bank")
              : rejectedNextStep?.label || tr('提交银行', 'Submit to bank', "Hantar ke bank"),
          onOpen: () => onOpenApplication(application),
          addBankActionLabel: canAddBank
            ? tr('新增银行', 'Add Bank', "Tambah Bank")
            : undefined,
          onAddBankAction: canAddBank
            ? () => onOpenApplication(application, 'addBank')
            : undefined,
          assignmentOptions: viewerStaffRole === 'Super Admin' && activeAdminAssignmentOptions.length > 0
            ? [
              {
                value: '',
                label: tr('重新指派 Admin', 'Reassign Admin', 'Tetapkan semula Pentadbir')
              },
              ...activeAdminAssignmentOptions
            ]
            : undefined,
          assignmentAriaLabel: viewerStaffRole === 'Super Admin'
            ? `Reassign Admin owner for ${application.id}`
            : undefined,
          onAssign: viewerStaffRole === 'Super Admin'
            ? (adminName: string) => onAssignApplicationAdmin(application.id, adminName)
            : undefined,
          canHide: false
        };
      });

    const handlerWorkflowTasks: InboxTask[] = workflowApplications
      .filter((application) => {
        const action = getLoanPendingAction(application);
        return getLoanPendingWith(application) === 'Handler' && (
          action === 'Complete Application' || action === 'Choose Close or Resubmit' || action === 'Contact Approved Customer'
        );
      })
      .map((application) => {
        const pendingAction = getLoanPendingAction(application);
        const isInitialSalesReview = pendingAction === 'Complete Application';
        const isApproved = pendingAction === 'Contact Approved Customer';
        const isCashPurchase = application.purchase_method === 'Cash';
        const incompleteCount = isInitialSalesReview
          ? getMissingApplicationInformationLabels(application).length + getMissingDocumentLabels(application).length
          : 0;
        const rejectedBank = [...(application.bank_applications || [])].reverse().find((bank) => bank.status === 'Rejected');
        const rejectedNextStep = rejectNextStepPresentation(rejectedBank);
        return {
          id: `workflow-handler-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(application.pending_since, application.submitted_at),
          category: isInitialSalesReview ? (isCashPurchase ? 'cash' as const : 'bank' as const) : isApproved ? 'reminder' as const : 'missing' as const,
          severity: isInitialSalesReview ? 'warning' as const : isApproved ? 'success' as const : 'critical' as const,
          title: application.applicant_name,
          context: isInitialSalesReview
            ? incompleteCount > 0
              ? tr(`客户已提交申请，还有 ${incompleteCount} 项资料或文件需要检查补齐。`, `The customer submitted an application. Check and complete ${incompleteCount} remaining details or documents.`, `Pelanggan telah menghantar permohonan. Semak dan lengkapkan ${incompleteCount} butiran atau dokumen yang masih belum lengkap.`)
              : tr('申请资料已齐全。打开检查后按 Notify Admin。', 'The application is complete. Open it, verify the details, then use Notify Admin.', "Permohonan lengkap. Buka, sahkan butiran, kemudian gunakan Notify Admin.")
            : isApproved
            ? isCashPurchase
              ? tr('现金申请已通过 Admin 审核，请联系客户确认接受。', 'The cash purchase passed Admin review. Contact the customer to confirm acceptance.', "Pembelian tunai lulus semakan Pentadbir. Hubungi pelanggan untuk mengesahkan penerimaan.")
              : tr('银行已批准，请联系客户确认下一步。', 'The bank approved the loan. Contact the customer.', "Bank meluluskan pinjaman. Hubungi pelanggan.")
            : rejectedBank?.next_action
              ? tr(
                `${rejectedBank.bank_name || '银行'} 已拒绝贷款。`,
                `${rejectedBank.bank_name || 'Bank'} rejected the loan.`,
                `${rejectedBank.bank_name || 'Bank'} menolak pinjaman.`
              )
              : tr('银行已拒绝，请选择结案或补资料后重新提交。', 'The bank rejected the loan. Close the file or submit updated documents.', "Bank menolak pinjaman. Tutup fail atau hantar dokumen baharu."),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
          dueLabel: tr('需要处理', 'Action needed', "Tindakan diperlukan"),
          owner: application.handler_name,
          nextStepLabel: isApproved
            ? isCashPurchase
              ? tr('联系客户并确认接受', 'Contact customer and confirm acceptance', 'Hubungi pelanggan dan sahkan penerimaan')
              : tr('联系客户', 'Contact customer', 'Hubungi pelanggan')
            : !isInitialSalesReview
              ? rejectedNextStep?.label
              : undefined,
          nextStepInstruction: !isInitialSalesReview && !isApproved ? rejectedNextStep?.instruction : undefined,
          isNewApplication: isInitialSalesReview,
          actionLabel: isInitialSalesReview
            ? tr('检查申请', 'Check application', "Semak permohonan")
            : !isApproved && rejectedNextStep
              ? rejectedNextStep.label
              : tr('联系客户', 'Contact customer', "Hubungi pelanggan"),
          onOpen: () => onOpenApplication(application),
          quickActionLabel: isCashPurchase && isApproved
            ? tr('客户已接受', 'Customer Accepted', "Pelanggan Menerima")
            : undefined,
          onQuickAction: isCashPurchase && isApproved
            ? () => onCompleteCashAcceptance(application)
            : undefined,
          canHide: false
        };
      });

    const customerReminderTasks: InboxTask[] = salesTaskApplications
      .filter((application) => {
        const dueTime = getDueTime(application.customer_call_back_at);
        return Boolean(application.customer_call_back_at) && Number.isFinite(dueTime) && dueTime <= todayEndTime;
      })
      .map((application) => {
        const dueTime = getDueTime(application.customer_call_back_at);
        const isOverdue = dueTime < todayStart.getTime();

        return {
          id: `customer-call-back-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(application.customer_call_back_at, application.submitted_at),
          category: 'reminder' as const,
          severity: isOverdue ? 'critical' as const : 'warning' as const,
          title: tr(`${application.applicant_name} 回电`, `${application.applicant_name} call-back`, `${application.applicant_name} panggil balik`),
          context: tr('客户回电时间到了。打开详情更新备注、状态或下一次提醒。', 'Customer call-back is due. Open detail to update notes, status, or next reminder.', "Panggilan balik pelanggan perlu dibuat. Buka butiran untuk mengemas kini nota, status atau peringatan seterusnya."),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
          dueLabel: isOverdue ? tr(`已逾期 · ${formatShortDate(application.customer_call_back_at)}`, `Overdue · ${formatShortDate(application.customer_call_back_at)}`, `Tertunggak · ${formatShortDate(application.customer_call_back_at)}`) : tr(`今天 · ${formatShortDate(application.customer_call_back_at)}`, `Today · ${formatShortDate(application.customer_call_back_at)}`, `Hari ini · ${formatShortDate(application.customer_call_back_at)}`),
          owner: application.handler_name,
          actionLabel: tr('联系客户', 'Contact customer', "Hubungi pelanggan"),
          onOpen: () => onOpenApplication(application)
        };
      });

    const bankReminderTasks: InboxTask[] = workflowApplications.flatMap((application) => (
      (application.bank_applications || [])
        .filter((bankApplication) => {
          const dueTime = getDueTime(bankApplication.next_follow_up_at);
          return (
            getLoanPendingWith(application) === 'Bank' &&
            (!application.active_bank_application_id || application.active_bank_application_id === bankApplication.id) &&
            Boolean(bankApplication.next_follow_up_at) &&
            Number.isFinite(dueTime) &&
            dueTime <= todayEndTime &&
            !['Approved', 'Rejected', 'Cancelled'].includes(bankApplication.status)
          );
        })
        .map((bankApplication) => {
          const dueTime = getDueTime(bankApplication.next_follow_up_at);
          const isOverdue = dueTime < todayStart.getTime();

          return {
            id: `bank-follow-up-${application.id}-${bankApplication.id}`,
            applicationId: application.id,
            sortTime: getLatestTaskTime(bankApplication.next_follow_up_at, bankApplication.submitted_at, application.pending_since),
            category: 'reminder' as const,
            severity: isOverdue ? 'critical' as const : 'warning' as const,
            title: tr(
              `${bankApplication.bank_name || '银行'} 跟进 · ${application.applicant_name}`,
              `${bankApplication.bank_name || 'Bank'} follow-up · ${application.applicant_name}`,
              `${bankApplication.bank_name || 'Bank'} susulan · ${application.applicant_name}`
            ),
            context: bankApplication.next_action || bankApplication.status_reason || tr('今天要跟进银行。', 'Bank follow-up is due today.', "Tindakan susulan bank perlu dibuat hari ini."),
            meta: `${application.applicant_name} · ${trBankStatus(bankApplication.status)}`,
            dueLabel: isOverdue ? tr(`已逾期 · ${formatShortDate(bankApplication.next_follow_up_at)}`, `Overdue · ${formatShortDate(bankApplication.next_follow_up_at)}`, `Tertunggak · ${formatShortDate(bankApplication.next_follow_up_at)}`) : tr(`今天 · ${formatShortDate(bankApplication.next_follow_up_at)}`, `Today · ${formatShortDate(bankApplication.next_follow_up_at)}`, `Hari ini · ${formatShortDate(bankApplication.next_follow_up_at)}`),
            owner: application.admin_owner_name || tr('Admin 团队', 'Admin team', "Pasukan pentadbir"),
            actionLabel: tr('跟进银行', 'Follow up bank', "Susuli bank"),
            onOpen: () => onOpenApplication(application, 'bankApplications')
          };
        })
    ));

    const missionStaffAccounts = [{ name: currentStaffName, role: currentStaffRole } as RoleAccount];
    const missionTasks: InboxTask[] = customMissions
      .filter((mission) => mission.status === 'Active')
      .flatMap((mission) => missionStaffAccounts
        .filter((staff) => isStaffInMissionScope(mission, staff.name, staff.role))
        .map((staff) => {
        const progress = calculateMissionProgress(mission, staff.name, applications, rawCustomerLeads, applicationMatchIndex);
        const isDone = progress.progress >= 100;

        return {
          id: `mission-${mission.id}-${staff.name}`,
          sortTime: getLatestTaskTime(mission.created_at),
          category: 'mission',
          severity: isDone ? 'success' : 'info',
          title: mission.title,
          context: `${getMetricLabel(mission.metric_type)} · ${progress.displayValue}`,
          meta: `${progress.meta} · RM${mission.reward_amount}`,
          dueLabel: getTimeframeLabel(mission.timeframe),
          owner: staff.name,
          actionLabel: onOpenMissions ? tr('打开任务', 'Open missions', "Buka misi") : undefined,
          onOpen: onOpenMissions
        };
      }));

    // 交车 (Deliver Bike): approved + customer-contact done, not yet delivered.
    // Marking delivered writes deal_finance + vehicle_stock_reservations, which
    // firestore.rules restricts to the operational lead — so the Operations
    // Manager (or Super Admin fallback when no active manager exists) gets the
    // action. The Sales handler still sees the card as a read-only status so the
    // deal stays visible, but without a button that would always fail.
    const canMarkDelivered = handlesAssignedTask('bike_delivery');
    const deliverySourceApplications = canMarkDelivered ? applications : staffApplications;
    const deliveryTasks: InboxTask[] = deliverySourceApplications
      .filter((application) => (
        application.status === LoanStatus.APPROVE &&
        getLoanPendingWith(application) === 'Closed' &&
        application.deal_finance?.sale_status !== 'Bike Delivered' &&
        application.deal_finance?.sale_status !== 'Cancelled'
      ))
      .flatMap((application) => {
        const modelKey = (application.vehicle_model || '').trim().toLowerCase();
        const catalogItem = vehicleCatalog.find((item) => (item.model || '').trim().toLowerCase() === modelKey);
        const reservedId = application.deal_finance?.stock_unit_id || '';
        const stockOptions = (catalogItem?.stock_units || [])
          .filter((unit) => (
            unit.id === reservedId ||
            (unit.status === 'In Stock' && !unit.sold_application_id && (!unit.reserved_application_id || unit.reserved_application_id === application.id))
          ))
          .map((unit) => ({
            id: unit.id,
            label: `${getVehicleStockReference(unit)}${getStockUnitLandedCost(unit) > 0 ? '' : tr('（未填成本）', ' (no cost)', ' (tiada kos)')}`
          }));
        // Operations already gets the prerequisite "Stock needed" task for
        // this application. Do not render a second "Awaiting delivery" card
        // until at least one deliverable stock unit exists.
        if (canMarkDelivered && stockOptions.length === 0) {
          return [];
        }
        return [{
          id: `delivery-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(application.deal_finance?.updated_at, application.pending_since, application.submitted_at),
          category: 'reminder' as const,
          severity: 'warning' as const,
          title: application.applicant_name,
          context: canMarkDelivered
            ? tr('已批准，等待交车。选择库存车后标记交车，佣金即结算给负责的 Sales。', 'Approved and awaiting delivery. Pick the stock unit, then mark delivered to settle the handler’s commission.', "Diluluskan dan menunggu penghantaran. Pilih unit stok, kemudian tandakan dihantar untuk menyelesaikan komisen pengendali.")
            : tr('已批准，等待交车任务负责人安排交车。交车后佣金自动变成已赚。', 'Approved and awaiting the assigned delivery owner. Your commission becomes Earned once the bike is delivered.', "Diluluskan dan menunggu pemilik tugasan penghantaran. Komisen anda menjadi Diperoleh selepas motosikal dihantar."),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
          dueLabel: tr('待交车', 'Awaiting delivery', "Menunggu penghantaran"),
          owner: application.handler_name,
          nextStepLabel: canMarkDelivered
            ? tr('安排并确认交车', 'Arrange and confirm delivery', "Atur dan sahkan penghantaran")
            : tr('等待安排交车', 'Await delivery arrangement', "Tunggu urusan penghantaran"),
          nextStepInstruction: canMarkDelivered
            ? tr('选择实际库存车并标记已交车。', 'Select the actual stock unit and mark the bike delivered.', "Pilih unit stok sebenar dan tandakan motosikal telah dihantar.")
            : tr('交车任务负责人完成安排后，系统会自动更新成交和佣金状态。', 'The assigned delivery owner will arrange delivery; the deal and commission status update afterward.', "Pemilik tugasan penghantaran akan mengatur penghantaran; status urus niaga dan komisen dikemas kini selepas itu."),
          actionLabel: tr('查看客户', 'View customer', "Lihat pelanggan"),
          onOpen: () => onOpenApplication(application),
          deliveryStockOptions: canMarkDelivered ? stockOptions : undefined,
          deliveryNoStockHint: tr('没有可用库存车，请先在 Finance Center 补库存', 'No stock unit available — add stock in Finance Center first', "Tiada unit stok — tambah stok di Pusat Kewangan dahulu"),
          onDeliver: canMarkDelivered
            ? (stockUnitId: string) => onMarkBikeDelivered(application.id, stockUnitId)
            : undefined,
          canHide: false
        }];
      });

    // 填车成本 (Record vehicle cost): delivered deal whose stock unit has no cost.
    // Operations queue responsibility; keeps monthly profit accurate.
    const costTasks: InboxTask[] = handlesAssignedTask('vehicle_costing')
      ? applications.flatMap((application) => {
        const finance = application.deal_finance;
        if (!finance || finance.sale_status !== 'Bike Delivered' || !finance.stock_unit_id) return [];
        let unit: VehicleStockUnit | undefined;
        for (const catalog of vehicleCatalog) {
          unit = (catalog.stock_units || []).find((candidate) => candidate.id === finance.stock_unit_id);
          if (unit) break;
        }
        const recognizedCost = Number(finance.recognized_stock_cost) || 0;
        if (recognizedCost > 0 || !unit || getStockUnitLandedCost(unit) > 0) return [];
        return [{
          id: `stock-cost-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(finance.delivery_at, finance.updated_at, application.submitted_at),
          category: 'reminder' as const,
          severity: 'warning' as const,
          title: application.applicant_name,
          context: tr('已交车但车成本还没填。请在 Finance Center 的库存页填成本，利润才算得准。', 'Delivered but vehicle cost is missing. Record the cost in Finance Center → Stock so profit is accurate.', "Dihantar tetapi kos kenderaan belum diisi. Rekod kos di Pusat Kewangan → Stok supaya untung tepat."),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${getVehicleStockReference(unit)}`,
          dueLabel: tr('待填成本', 'Cost needed', "Kos diperlukan"),
          owner: application.handler_name,
          hideOwner: true,
          actionLabel: onOpenFinanceStock ? tr('去填成本', 'Record cost', "Rekod kos") : undefined,
          onOpen: onOpenFinanceStock ? () => onOpenFinanceStock(application.vehicle_model) : undefined,
          canHide: false
        }];
      })
      : [];

    // 补库存 (Add stock): start as soon as Sales finishes the application and
    // sends it to Admin. Operations adds stock with costing ahead of time so
    // the deal is never blocked at delivery. The task resolves automatically
    // once a deliverable stock unit exists.
    const applicationIdsRequiringStock = getApplicationIdsRequiringVehicleStock(applications, vehicleCatalog);
    const stockNeededTasks: InboxTask[] = handlesAssignedTask('stock_replenishment')
      ? applications.flatMap((application) => {
        if (!applicationIdsRequiringStock.has(application.id)) return [];
        const finance = application.deal_finance;
        // Inline add: open the Quick Add Stock modal right here. Deal amounts
        // stay on the application while the unit/cost stays with stock. It
        // works even when the model has no Vehicle Info entry yet. Fall back to
        // Finance Center deep-link when the deal has no vehicle model at all.
        const canInlineAdd = Boolean(onQuickAddStock) && Boolean((application.vehicle_model || '').trim());
        return [{
          id: `stock-needed-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(finance?.updated_at, application.pending_since, application.submitted_at),
          category: 'reminder' as const,
          severity: 'warning' as const,
          title: application.applicant_name,
          context: canInlineAdd
            ? tr(`Sales 已完成申请，但「${application.vehicle_model || '未填车型'}」没有可用库存车。点「补库存」，填上成本直接入库，交车时才不会卡。`, `Sales completed the application, but no stock unit is available for "${application.vehicle_model || 'this model'}". Tap "Add stock", record the cost, and add the unit now so delivery is not blocked.`, `Jualan telah melengkapkan permohonan, tetapi tiada unit stok untuk "${application.vehicle_model || 'model ini'}". Tekan "Tambah stok", rekod kos dan tambah unit sekarang supaya penghantaran tidak tersekat.`)
            : tr(`Sales 已完成申请，但「${application.vehicle_model || '未填车型'}」没有可用库存车。请在 Finance Center 补库存并填成本。`, `Sales completed the application, but no stock unit is available for "${application.vehicle_model || 'this model'}". Add stock and record its cost in Finance Center.`, `Jualan telah melengkapkan permohonan, tetapi tiada unit stok untuk "${application.vehicle_model || 'model ini'}". Tambah stok dan rekod kosnya di Pusat Kewangan.`),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
          dueLabel: tr('待补库存', 'Stock needed', "Perlu stok"),
          owner: application.handler_name,
          hideOwner: true,
          actionLabel: canInlineAdd
            ? tr('补库存', 'Add stock', "Tambah stok")
            : (onOpenFinanceStock ? tr('去补库存', 'Add stock', "Tambah stok") : undefined),
          onOpen: canInlineAdd
            ? () => setQuickStockAppId(application.id)
            : (onOpenFinanceStock ? () => onOpenFinanceStock(application.vehicle_model) : undefined),
          canHide: false
        }];
      })
      : [];

    // 成交结算 · 第 1 步 — 财务完成: delivered deal, commission still Earned.
    const settlementFinanceTasks: InboxTask[] = handlesAssignedTask('finance_completion')
      ? applications.flatMap((application) => {
        const finance = application.deal_finance;
        if (!finance || finance.commission_status !== 'Earned') return [];
        const salesValue = getDealSalesValue(finance);
        const outstanding = Math.max(salesValue - getDealReceipts(finance, application.purchase_method), 0);
        return [{
          id: `settle-finance-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(finance.delivery_at, finance.updated_at, application.submitted_at),
          category: 'reminder' as const,
          severity: 'warning' as const,
          title: application.applicant_name,
          context: salesValue <= 0
            ? tr(
              '最终售价尚未填写，不能判断是否已收齐。请先补完成交金额，再核对收款并标记「财务完成」。',
              'Final selling price is missing, so full payment cannot be confirmed. Complete the deal amount, then verify receipts before marking Finance Completed.',
              'Harga jualan akhir belum diisi, jadi bayaran penuh belum dapat disahkan. Lengkapkan jumlah urus niaga, kemudian semak terimaan sebelum menandakan Kewangan Selesai.'
            )
            : outstanding > 0.01
            ? tr(
              `已交车，尚欠 RM${Math.round(outstanding).toLocaleString('en-MY')}。收齐后再标记「财务完成」。`,
              `Delivered with RM${Math.round(outstanding).toLocaleString('en-MY')} outstanding. Collect it before marking Finance Completed.`,
              `Telah dihantar dengan baki RM${Math.round(outstanding).toLocaleString('en-MY')}. Kutip sebelum menandakan Kewangan Selesai.`
            )
            : tr('款项已收齐，等待财务任务负责人核对并标记「财务完成」。', 'Payment is fully collected; the assigned finance owner should verify and mark Finance Completed.', "Bayaran telah penuh; pemilik tugasan kewangan perlu mengesahkan dan menandakan Kewangan Selesai."),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${tr('待财务结算', 'Awaiting settlement', "Menunggu penyelesaian")}`,
          dueLabel: tr('待结算', 'Settle', "Selesaikan"),
          owner: application.handler_name,
          hideOwner: true,
          actionLabel: onSaveDealFinance ? tr('去结算', 'Settle', "Selesaikan") : (onOpenFinanceDeal ? tr('去结算', 'Settle', "Selesaikan") : undefined),
          onOpen: onSaveDealFinance ? () => setSettlementAppId(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
          secondaryActionLabel: onSaveDealFinance && onOpenFinanceDeal ? tr('在财务中心', 'In Finance Center', "Di Pusat Kewangan") : undefined,
          onSecondaryAction: onSaveDealFinance && onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined,
          canHide: false
        }];
      })
      : [];

    // Approved bank offer without actual disbursement for at least 3 days.
    // The synced approval amount is reference-only; bank_disbursement remains
    // the Operations Manager-confirmed actual receipt.
    const bankDisbursementTasks: InboxTask[] = handlesAssignedTask('bank_disbursement')
      ? applications.flatMap((application) => {
        if (application.purchase_method === 'Cash' || application.status !== LoanStatus.APPROVE) return [];
        const finance = application.deal_finance;
        if (!finance || finance.sale_status === 'Cancelled' || (Number(finance.bank_disbursement) || 0) > 0) return [];
        const approvedBank = [...(application.bank_applications || [])].reverse().find((bank) => (
          bank.status === 'Approved' && bank.offer_status === 'Accepted'
        )) || [...(application.bank_applications || [])].reverse().find((bank) => bank.status === 'Approved');
        const approvedAt = approvedBank?.approved_at || approvedBank?.decision_at || finance.approved_bank_offer_at || '';
        const approvedTime = new Date(approvedAt).getTime();
        if (!Number.isFinite(approvedTime) || Date.now() - approvedTime < 3 * 24 * 60 * 60 * 1000) return [];
        const offerAmount = Number(finance.approved_bank_offer_amount || approvedBank?.offer_amount) || 0;
        return [{
          id: `bank-disbursement-${application.id}`,
          applicationId: application.id,
          sortTime: approvedTime,
          category: 'reminder' as const,
          severity: 'critical' as const,
          title: application.applicant_name,
          context: tr(
            `银行已批复超过 3 天，但尚未记录实际放款${offerAmount > 0 ? `（批复 RM${Math.round(offerAmount).toLocaleString('en-MY')}）` : ''}。请跟进银行并在到账后登记。`,
            `The bank approved this over 3 days ago, but no actual disbursement is recorded${offerAmount > 0 ? ` (approved RM${Math.round(offerAmount).toLocaleString('en-MY')})` : ''}. Follow up and record it only after receipt.`,
            `Bank meluluskan lebih 3 hari lalu tetapi tiada pengeluaran sebenar direkodkan${offerAmount > 0 ? ` (diluluskan RM${Math.round(offerAmount).toLocaleString('en-MY')})` : ''}. Susuli dan rekod selepas diterima.`
          ),
          meta: `${approvedBank?.bank_name || finance.approved_bank_name || tr('银行', 'Bank', 'Bank')} · ${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")}`,
          dueLabel: tr('放款逾期', 'Disbursement overdue', "Pengeluaran lewat"),
          owner: application.handler_name,
          hideOwner: true,
          actionLabel: onSaveDealFinance ? tr('登记到账', 'Record receipt', "Rekod terimaan") : (onOpenFinanceDeal ? tr('打开结算', 'Open settlement', "Buka penyelesaian") : undefined),
          onOpen: onSaveDealFinance ? () => setSettlementAppId(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
          canHide: false
        }];
      })
      : [];

    const negativeMarginTasks: InboxTask[] = handlesAssignedTask('negative_margin_review')
      ? applications.flatMap((application) => {
        const finance = application.deal_finance;
        if (!finance || finance.sale_status !== 'Bike Delivered') return [];
        let liveCost = 0;
        for (const catalog of vehicleCatalog) {
          const unit = (catalog.stock_units || []).find((candidate) => candidate.id === finance.stock_unit_id);
          if (unit) {
            liveCost = getStockUnitLandedCost(unit);
            break;
          }
        }
        const recognizedCost = Number(finance.recognized_stock_cost) || liveCost;
        if (recognizedCost <= 0) return [];
        const commission = finance.commission_status === 'Reversed' ? 0 : Number(finance.commission_amount) || 0;
        const netProfit = getDealSalesValue(finance) - recognizedCost - (Number(finance.direct_bank_charges) || 0) - commission;
        if (netProfit >= 0) return [];
        return [{
          id: `negative-margin-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(finance.delivery_at, finance.updated_at, application.submitted_at),
          category: 'reminder' as const,
          severity: 'critical' as const,
          title: application.applicant_name,
          context: tr(
            `成交净利为负 RM${Math.round(Math.abs(netProfit)).toLocaleString('en-MY')}。请核对售价、成本、费用与佣金。`,
            `This sale is losing RM${Math.round(Math.abs(netProfit)).toLocaleString('en-MY')}. Check the sale price, bike cost, fees, and commission.`,
            `Urus niaga ini mempunyai margin bersih negatif RM${Math.round(Math.abs(netProfit)).toLocaleString('en-MY')}. Semak harga, kos, caj dan komisen.`
          ),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${tr('负利润', 'Negative margin', "Margin negatif")}`,
          dueLabel: tr('立即核对', 'Review now', "Semak sekarang"),
          owner: application.handler_name,
          hideOwner: true,
          actionLabel: onSaveDealFinance ? tr('核对结算', 'Review settlement', "Semak penyelesaian") : (onOpenFinanceDeal ? tr('打开结算', 'Open settlement', "Buka penyelesaian") : undefined),
          onOpen: onSaveDealFinance ? () => setSettlementAppId(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
          canHide: false
        }];
      })
      : [];

    // 成交结算 · 第 2 步 — 支付佣金: finance done (commission Payable), not paid.
    const settlementPayTasks: InboxTask[] = handlesAssignedTask('commission_payment')
      ? applications.flatMap((application) => {
        const finance = application.deal_finance;
        if (!finance || finance.commission_status !== 'Payable') return [];
        const amount = Math.round(Number(finance.commission_amount) || 0);
        return [{
          id: `settle-pay-${application.id}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(finance.finance_completed_at, finance.updated_at, application.submitted_at),
          category: 'reminder' as const,
          severity: 'warning' as const,
          title: application.applicant_name,
          context: tr(`财务已完成，佣金 RM${amount} 待支付给 ${application.handler_name}。`, `Finance completed. Commission RM${amount} is payable to ${application.handler_name}.`, `Kewangan selesai. Komisen RM${amount} untuk dibayar kepada ${application.handler_name}.`),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${tr('待支付佣金', 'Commission payable', "Komisen belum dibayar")}`,
          dueLabel: tr('待支付', 'Pay', "Bayar"),
          owner: application.handler_name,
          hideOwner: true,
          quickActionLabel: onMarkCommissionPaid ? tr('标记佣金已付', 'Mark Commission Paid', "Tanda Komisen Dibayar") : undefined,
          onQuickAction: onMarkCommissionPaid ? () => onMarkCommissionPaid(application.id) : undefined,
          actionLabel: onSaveDealFinance ? tr('去结算', 'Settle', "Selesaikan") : (onOpenFinanceDeal ? tr('去结算', 'Settle', "Selesaikan") : undefined),
          onOpen: onSaveDealFinance ? () => setSettlementAppId(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
          secondaryActionLabel: onSaveDealFinance && onOpenFinanceDeal ? tr('在财务中心', 'In Finance Center', "Di Pusat Kewangan") : undefined,
          onSecondaryAction: onSaveDealFinance && onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined,
          canHide: false
        }];
      })
      : [];

    // A single deal can need several finance checks at the same time. Keep one
    // actionable card per deal and show every active condition inside it.
    const financeTaskPriority = (task: InboxTask) => {
      if (task.id.startsWith('negative-margin-')) return 40;
      if (task.id.startsWith('bank-disbursement-')) return 30;
      if (task.id.startsWith('settle-finance-')) return 20;
      return 10;
    };
    const financeTaskGroups = new Map<string, InboxTask[]>();
    [
      ...bankDisbursementTasks,
      ...negativeMarginTasks,
      ...settlementFinanceTasks,
      ...settlementPayTasks
    ].forEach((task) => {
      if (!task.applicationId) return;
      financeTaskGroups.set(
        task.applicationId,
        [...(financeTaskGroups.get(task.applicationId) || []), task]
      );
    });
    const consolidatedFinanceTasks: InboxTask[] = Array.from(financeTaskGroups.entries()).map(([applicationId, group]) => {
      const ordered = [...group].sort((left, right) => (
        financeTaskPriority(right) - financeTaskPriority(left) ||
        right.sortTime - left.sortTime
      ));
      const primary = ordered[0];
      if (ordered.length === 1) return primary;

      return {
        ...primary,
        id: `deal-finance-attention-${applicationId}`,
        sortTime: Math.max(...ordered.map((task) => task.sortTime)),
        severity: ordered.some((task) => task.severity === 'critical') ? 'critical' : 'warning',
        badgeLabel: tr(`${ordered.length} 个财务问题`, `${ordered.length} finance issues`, `${ordered.length} isu kewangan`),
        dueLabel: tr('核对成交', 'Review deal', 'Semak urus niaga'),
        context: tr(
          `这笔成交同时有 ${ordered.length} 个财务事项需要处理，请在同一个结算窗口逐项核对。`,
          `This deal needs ${ordered.length} financial checks. Review them together in the same settlement window.`,
          `Urus niaga ini memerlukan ${ordered.length} semakan kewangan. Semak semuanya dalam tetingkap penyelesaian yang sama.`
        ),
        meta: `${primary.meta.split(' · ')[0]} · ${tr('财务核对', 'Finance review', 'Semakan kewangan')}`,
        actionLabel: tr('核对结算', 'Review settlement', 'Semak penyelesaian'),
        quickActionLabel: undefined,
        onQuickAction: undefined,
        relatedTaskGroupLabel: tr('这笔成交的财务核对项', 'Finance checks for this deal', 'Semakan kewangan untuk urus niaga ini'),
        relatedTaskSummaries: ordered.map((task) => ({
          id: task.id,
          title: task.meta,
          context: task.context,
          dueLabel: task.dueLabel
        }))
      };
    });

    // 审批任务 — Approvals page is hidden in V1, so pending requests surface here
    // for the approver role with one-click 批准 / 拒绝 (extra commission, discounts, ...).
    const approvalTypeLabel = (type: ApprovalRequest['type']) => {
      switch (type) {
        case 'extra_commission': return tr('额外佣金', 'Extra commission', 'Komisen tambahan');
        case 'sales_discount_request': return tr('销售折扣', 'Sales discount', 'Diskaun jualan');
        case 'cash_discount': return tr('现金折扣', 'Cash discount', 'Diskaun tunai');
        case 'special_loan_case': return tr('特殊贷款案件', 'Special loan case', 'Kes pinjaman khas');
        case 'mission_reward': return tr('任务奖励', 'Mission reward', 'Ganjaran misi');
        default: return tr('审批请求', 'Approval request', 'Permintaan kelulusan');
      }
    };
    const approvalTasks: InboxTask[] = approvalRequests
      .filter((request) => {
        if (request.status !== 'Pending' || request.type === 'staff_sick_leave') return false;
        const isManagementApproval = request.approver_roles.some((role) => (
          role === 'Super Admin' || role === 'Operations Manager'
        ));

        return isManagementApproval
          ? handlesAssignedTask('business_approval')
          : request.approver_roles.includes(currentStaffRole);
      })
      .map((request) => {
        const amountLabel = request.amount > 0 ? ` · RM${Math.round(request.amount)}` : '';
        return {
          id: `approval-${request.id}`,
          sortTime: getLatestTaskTime(request.submitted_at),
          category: 'reminder' as const,
          severity: 'warning' as const,
          title: request.target_label || request.requester_name,
          context: tr(
            `${request.requester_name} 提交了${approvalTypeLabel(request.type)}申请${amountLabel}。${request.reason || ''}`,
            `${request.requester_name} submitted a ${approvalTypeLabel(request.type)} request${amountLabel}. ${request.reason || ''}`,
            `${request.requester_name} menghantar permintaan ${approvalTypeLabel(request.type)}${amountLabel}. ${request.reason || ''}`
          ).trim(),
          meta: `${approvalTypeLabel(request.type)} · ${request.requester_name}`,
          dueLabel: tr('待审批', 'Approve', 'Luluskan'),
          owner: request.requester_name,
          hideOwner: true,
          nextStepLabel: tr('审核申请', 'Review request', 'Semak permintaan'),
          nextStepInstruction: tr('核对申请内容与原因，然后选择批准或拒绝。', 'Check the request and reason, then approve or reject it.', 'Semak permintaan dan sebab, kemudian luluskan atau tolak.'),
          quickActionLabel: onReviewApproval ? tr('批准', 'Approve', 'Luluskan') : undefined,
          onQuickAction: onReviewApproval
            ? async () => {
              onReviewApproval(request.id, 'Approved');
              return true;
            }
            : undefined,
          secondaryActionLabel: onReviewApproval ? tr('拒绝', 'Reject', 'Tolak') : undefined,
          onSecondaryAction: onReviewApproval ? () => onReviewApproval(request.id, 'Rejected') : undefined,
          canHide: false
        };
      });

    const leaveApprovalTasks: InboxTask[] = handlesAssignedTask('leave_approval')
      ? staffLeaveRequests
        .filter((request) => request.status === 'Pending' && request.requester_name !== currentStaffName)
        .map((request) => {
          let leaveKind = 'Leave / MC / OT';
          try {
            const meta = JSON.parse(request.notes || '{}') as { kind?: string };
            if (meta.kind === 'Leave' || meta.kind === 'MC' || meta.kind === 'OT') leaveKind = meta.kind;
          } catch {
            // Legacy requests may contain plain-text notes; keep the generic label.
          }

          return {
            id: `staff-leave-approval-${request.id}`,
            sortTime: getLatestTaskTime(request.submitted_at),
            category: 'reminder' as const,
            categoryLabel: tr('考勤', 'Attendance', 'Kehadiran'),
            severity: 'warning' as const,
            title: `${leaveKind} · ${request.requester_name}`,
            context: request.reason || tr('员工提交了考勤申请。', 'A staff attendance request is awaiting review.', 'Permohonan kehadiran kakitangan menunggu semakan.'),
            meta: `${request.requester_name} · ${request.amount}`,
            metaAvatarName: request.requester_name,
            source: tr('Attendance & Leave', 'Attendance & Leave', 'Kehadiran & Cuti'),
            dueLabel: tr('待审批', 'Approve', 'Luluskan'),
            owner: request.requester_name,
            hideOwner: true,
            canHide: false,
            nextStepLabel: tr('审核申请', 'Review request', 'Semak permintaan'),
            nextStepInstruction: tr('核对日期、原因和附件，然后批准或拒绝。', 'Check the dates, reason, and attachment, then approve or reject.', 'Semak tarikh, sebab dan lampiran, kemudian luluskan atau tolak.'),
            quickActionLabel: onReviewLeaveRequest ? tr('批准', 'Approve', 'Luluskan') : undefined,
            onQuickAction: onReviewLeaveRequest
              ? async () => {
                const saved = await onReviewLeaveRequest(request.id, 'Approved');
                return saved !== false;
              }
              : undefined,
            secondaryActionLabel: onReviewLeaveRequest ? tr('拒绝', 'Reject', 'Tolak') : undefined,
            onSecondaryAction: onReviewLeaveRequest
              ? () => onReviewLeaveRequest(request.id, 'Rejected')
              : undefined
          };
        })
      : [];

    const applicationTaskPriority = (task: InboxTask) => {
      if (task.id.startsWith('workflow-')) return 50;
      if (task.id.startsWith('delivery-')) return 45;
      if (task.id.startsWith('missing-')) return 40;
      if (task.id.startsWith('bank-follow-up-')) return 30;
      return 20;
    };
    const applicationTaskGroups = new Map<string, InboxTask[]>();
    [
      ...missingTasks,
      ...seoAssignmentTasks,
      ...bankSubmissionTasks,
      ...handlerWorkflowTasks,
      ...deliveryTasks,
      ...customerReminderTasks,
      ...bankReminderTasks
    ].forEach((task) => {
      if (!task.applicationId) return;
      applicationTaskGroups.set(
        task.applicationId,
        [...(applicationTaskGroups.get(task.applicationId) || []), task]
      );
    });
    const consolidatedApplicationTasks = Array.from(applicationTaskGroups.values()).map((group) => {
      const ordered = [...group].sort((left, right) => (
        applicationTaskPriority(right) - applicationTaskPriority(left) ||
        right.sortTime - left.sortTime
      ));
      const [primary, ...related] = ordered;

      return {
        ...primary,
        sortTime: Math.max(...group.map((task) => task.sortTime)),
        relatedTaskSummaries: related.map((task) => ({
          id: task.id,
          title: task.title,
          context: task.context,
          dueLabel: task.dueLabel
        }))
      };
    });
    const missingCheckoutTasks: InboxTask[] = (
      handlesAssignedTask('missing_checkout_follow_up')
        ? missingCheckoutIncidents
        : []
    ).map((incident) => ({
      id: incident.id,
      sortTime: new Date(incident.lastCheckInAt).getTime(),
      category: 'reminder',
      categoryLabel: tr('考勤', 'Attendance', 'Kehadiran'),
      severity: 'warning',
      badgeLabel: tr('漏打下班卡', 'Missing check-out', 'Tiada daftar keluar'),
      title: tr(
        `漏打下班卡 · ${incident.staffName}`,
        `Missing check-out · ${incident.staffName}`,
        `Tiada daftar keluar · ${incident.staffName}`
      ),
      context: tr(
        `员工在 ${incident.attendanceDate} 最后一笔记录仍是 Check in（${formatMalaysiaAttendanceTime(incident.lastCheckInAt)}）。请向员工确认后关闭此任务。`,
        `The last attendance record on ${incident.attendanceDate} is still Check in (${formatMalaysiaAttendanceTime(incident.lastCheckInAt)}). Check with the staff member, then close this task.`,
        `Rekod kehadiran terakhir pada ${incident.attendanceDate} masih Daftar masuk (${formatMalaysiaAttendanceTime(incident.lastCheckInAt)}). Semak dengan kakitangan, kemudian tutup tugasan ini.`
      ),
      meta: `${incident.staffName} · ${incident.attendanceDate}`,
      metaAvatarName: incident.staffName,
      source: tr('Attendance & Leave', 'Attendance & Leave', 'Kehadiran & Cuti'),
      dueLabel: tr('今天跟进', 'Follow up today', 'Susulan hari ini'),
      owner: managementStaffName || currentScopeLabel,
      hideOwner: true,
      canHide: false,
      quickActionLabel: tr('已与员工确认', 'Checked with staff', 'Sudah semak dengan kakitangan'),
      onQuickAction: () => onResolveMissingCheckout(incident)
    }));
    const generatedTasks = [...missingCheckoutTasks, ...consolidatedApplicationTasks, ...rawLeadTasks, ...missionTasks, ...costTasks, ...stockNeededTasks, ...consolidatedFinanceTasks, ...approvalTasks, ...leaveApprovalTasks];
    const generatedTaskIds = new Set(generatedTasks.map((task) => task.id));
    const generatedApplicationIds = new Set(
      generatedTasks
        .map((task) => task.applicationId)
        .filter((applicationId): applicationId is string => Boolean(applicationId))
    );
    const taskNotifications = notifications
      .filter((notification) => !notification.resolved_at)
      .filter((notification) => (
        notification.type !== 'raw_lead_assigned' ||
        !notification.recipient_staff_names.some((staffName) => notification.read_by.includes(staffName))
      ));
    const latestCalendarNotificationByTask = new Map<string, { id: string; sortTime: number }>();
    const applicationIds = new Set(applications.map((application) => application.id));
    const latestApplicationNotificationByTarget = new Map<string, { id: string; sortTime: number }>();
    taskNotifications.forEach((notification) => {
      const next = {
        id: notification.id,
        sortTime: getLatestTaskTime(notification.created_at)
      };

      if (notification.target_type === 'calendar_note') {
        const current = latestCalendarNotificationByTask.get(notification.target_id);
        if (!current || next.sortTime >= current.sortTime) {
          latestCalendarNotificationByTask.set(notification.target_id, next);
        }
      }

      if (applicationIds.has(notification.target_id)) {
        const current = latestApplicationNotificationByTarget.get(notification.target_id);
        if (!current || next.sortTime >= current.sortTime) {
          latestApplicationNotificationByTarget.set(notification.target_id, next);
        }
      }
    });
    const notificationTasks: InboxTask[] = taskNotifications
      .filter((notification) => (
        notification.target_type !== 'calendar_note' ||
        latestCalendarNotificationByTask.get(notification.target_id)?.id === notification.id
      ))
      .filter((notification) => (
        !applicationIds.has(notification.target_id) ||
        latestApplicationNotificationByTarget.get(notification.target_id)?.id === notification.id
      ))
      .filter((notification) => {
        const equivalentTaskId = getEquivalentGeneratedTaskId(notification);
        return (
          (!equivalentTaskId || !generatedTaskIds.has(equivalentTaskId)) &&
          (!applicationIds.has(notification.target_id) || !generatedApplicationIds.has(notification.target_id))
        );
      })
      .map((notification) => {
        const targetApplication = applications.find((application) => application.id === notification.target_id);
        const targetLead = rawCustomerLeads.find((lead) => lead.id === notification.target_id);
        const targetCalendarNote = calendarNotes.find((note) => note.id === notification.target_id);

        return {
          id: `notification-${notification.id}`,
          applicationId: targetApplication?.id,
          sortTime: getLatestTaskTime(notification.created_at),
          category: targetApplication?.purchase_method === 'Cash'
            ? 'cash'
            : getNotificationCategory(notification),
          severity: notification.severity,
          title: trNotificationTitle(notification.type, notification.title),
          context: trNotificationMessage(notification.type, notification.target_label, notification.message),
          meta: notification.target_label,
          source: tr('通知中心', 'Notification Center', "Pusat Pemberitahuan"),
          isNewApplication: notification.type === 'loan_sales_review_required',
          dueLabel: formatShortDate(targetCalendarNote?.date_at || notification.created_at),
          owner: targetApplication
            ? getLoanPendingWith(targetApplication) === 'Handler'
              ? targetApplication.handler_name
              : targetApplication.admin_owner_name || tr('Admin 团队', 'Admin team', "Pasukan pentadbir")
            : targetLead?.taken_by_staff_name || targetCalendarNote?.assigned_to || currentScopeLabel,
          actionLabel: getNotificationActionLabel(notification),
          onOpen: () => onOpenNotification(notification),
          quickActionLabel: targetCalendarNote && !targetCalendarNote.completed_at
            ? tr('标记完成', 'Mark complete', 'Tandakan selesai')
            : undefined,
          onQuickAction: targetCalendarNote && !targetCalendarNote.completed_at
            ? async () => {
              await onSetCalendarNoteCompleted(targetCalendarNote.id, true);
              return true;
            }
            : undefined,
          calendarNote: targetCalendarNote?.staff_role === 'Super Admin' ? targetCalendarNote : undefined
        };
      });

    return [...generatedTasks, ...notificationTasks].sort((a, b) => (
      b.sortTime - a.sortTime || a.title.localeCompare(b.title)
    ));
    // The onOpen* callbacks are intentionally omitted from the deps: they are
    // recreated on every parent render but always perform the same navigation,
    // so including them would defeat this memo. Only real data drives a rebuild.
  }, [applicationMatchIndex, applications, approvalRequests, calendarNotes, currentScopeLabel, currentStaffName, currentStaffRole, customMissions, managementStaffName, missingCheckoutIncidents, notifications, rawCustomerLeads, roleAccounts, roleNavAccess, staffLeaveRequests, todayEndTime, todayStart, vehicleCatalog, viewerStaffRole]);

  const hiddenTaskIdSet = useMemo(() => new Set(hiddenTaskIds), [hiddenTaskIds]);
  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.canHide === false || !hiddenTaskIdSet.has(task.id)),
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
  // Keep the global bell and sidebar on the exact same visible-task source as
  // the Task Inbox. Hidden and completed tasks are intentionally excluded.
  useEffect(() => {
    onVisibleTasksChange?.(visibleTasks.map((task) => ({
      id: task.id,
      category: task.category,
      severity: task.severity,
      title: task.title,
      context: task.context,
      meta: task.meta,
      dueLabel: task.dueLabel,
      categoryLabel: task.categoryLabel,
      badgeLabel: task.badgeLabel
    })));
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
        viewerStaffRole === 'Super Admin' ||
        viewerStaffRole === 'Admin' ||
        lead.taken_by_staff_name === viewerStaffName
      )
    );
    const isSelected = selectedLeadIds.includes(lead.id);
    const nextFollowUpTime = new Date(lead.next_follow_up_at || '').getTime();
    const isFollowUpDue = Number.isFinite(nextFollowUpTime) && nextFollowUpTime <= todayEndTime;

    return (
    <article key={lead.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
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
                className="h-4 w-4 rounded border-slate-300 text-red-800 accent-red-800"
              />
            )}
            <span className={`rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
              isMine ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isMine ? tr('我的名单', 'My Lead', 'Prospek Saya') : tr('开放名单', 'Open Lead', 'Prospek Terbuka')}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">{lead.channel}</span>
            {isMine && (
              <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${
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
          <h3 className="mt-3 truncate text-sm font-bold text-slate-900" title={lead.name || lead.username}>
            {lead.name || lead.username || tr('未命名名单', 'Unnamed lead', 'Prospek tanpa nama')}
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {lead.phone_no || lead.whatsapp || lead.work_phone || tr('没有电话号码', 'No phone number', 'Tiada nombor telefon')}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{formatShortDate(lead.received_at)}</p>
          {isMine && lead.next_follow_up_at && (
            <p className={`mt-1 text-[11px] font-bold ${isFollowUpDue ? 'text-rose-600' : 'text-slate-500'}`}>
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
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
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
              className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
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
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500"
          >
            <IconImage src={whatsappContactIcon} className="h-5 w-5" />
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
              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
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
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('任务箱', 'Task Inbox', "Peti Masuk Tugasan")}</h2>
          <p className="max-w-3xl text-xs font-light leading-relaxed text-slate-500">
            {tr('当前要处理的事都在这里。', 'Everything currently requiring action.', "Semua perkara yang memerlukan tindakan ada di sini.")}
          </p>
        </div>

        <span className="inline-flex self-start rounded-full bg-red-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
          {currentScopeLabel} · {trRole(staffRoleLabel)}
        </span>
      </section>

      <section className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xs">
        {([
          ['tasks', tr('任务', 'Tasks', "Tugasan"), visibleTasks.length, taskInboxIcon],
          ['openLeads', tr('开放名单', 'Open Leads', "Prospek Terbuka"), openLeads.length + myLeads.length, publicLeadsIcon],
          ...(relationshipIssueCount > 0
            ? [['relationships', tr('关系问题', 'Relationship Issues', "Isu Hubungan"), relationshipIssueCount, customerRelationshipsIcon]]
            : [])
        ] as Array<[TaskInboxWorkspace, string, number, string]>).map(([key, label, count, iconSrc]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveWorkspace(key)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
              activeWorkspace === key
                ? 'bg-red-800 text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <IconImage src={iconSrc} className="h-6 w-6" />
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${activeWorkspace === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
          </button>
        ))}
      </section>

      {activeWorkspace === 'tasks' && <>

      {myCommissionSummary && (
        <section data-testid="my-commission-card" className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-slate-800">{tr('我的佣金', 'My Commission', 'Komisen Saya')}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">{tr('交车后佣金变成已赚；财务完成后待支付。', 'Commission is earned after delivery and payable after finance completes.', 'Komisen diperoleh selepas serahan dan boleh dibayar selepas kewangan selesai.')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                [tr('估计', 'Estimated', 'Anggaran'), myCommissionSummary.estimated, 'bg-slate-50 text-slate-600'],
                [tr('已赚', 'Earned', 'Diperoleh'), myCommissionSummary.earned, 'bg-indigo-50 text-indigo-700'],
                [tr('待支付', 'Payable', 'Belum Dibayar'), myCommissionSummary.payable, 'bg-amber-50 text-amber-700'],
                [tr('本月已收', 'Paid This Month', 'Dibayar Bulan Ini'), myCommissionSummary.paidThisMonth, 'bg-emerald-50 text-emerald-700']
              ] as Array<[string, number, string]>).map(([label, amount, toneClass]) => (
                <div key={label} className={`rounded-lg px-3 py-2 text-center ${toneClass}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums">RM{amount.toLocaleString('en-MY')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {canFilterStaffScope && onStaffScopeChange && (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">{tr('员工筛选', 'Staff Filter', "Penapis Kakitangan")}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">{tr('默认只看你的任务；选择员工后只看该员工。', 'Your tasks show by default; select a staff member to view only theirs.', "Tugasan anda dipaparkan secara lalai; pilih kakitangan untuk melihat tugasan mereka sahaja.")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleOptionGroup
                value={currentStaffName}
                options={activeStaffAccounts.map((account) => ({
                  value: account.name,
                  label: `${account.name} · ${trRole(account.role)}`,
                  leading: <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-7 w-7" textClassName="text-[10px]" />,
                  trailing: (
                    <span
                      data-testid={`task-inbox-staff-action-count-${account.id}`}
                      aria-label={tr(
                        `${staffActionCountByName.get(account.name) || 0} 个待办`,
                        `${staffActionCountByName.get(account.name) || 0} ${(staffActionCountByName.get(account.name) || 0) === 1 ? 'action' : 'actions'}`,
                        `${staffActionCountByName.get(account.name) || 0} tindakan`
                      )}
                      className={`inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-extrabold ${
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
                className="min-w-[250px] rounded-lg bg-slate-50 p-1 ring-1 ring-slate-100"
              />
              <button
                type="button"
                data-testid="show-staff-attention"
                onClick={() => setShowStaffAttention(true)}
                className="rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-red-900"
              >
                {tr('显示员工进度', 'Show Staff Attention', "Tunjukkan Perhatian Kakitangan")}
              </button>
            </div>
          </div>
        </section>
      )}

      {showStaffAttention && canFilterStaffScope && onStaffScopeChange && (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{tr('员工异常与进度', 'Staff Attention & Progress', "Perhatian & Kemajuan Kakitangan")}</h3>
                <span className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600">{tr(`${attentionStaffCount} 人需关注`, `${attentionStaffCount} need attention`, `${attentionStaffCount} perlu perhatian`)}</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-500">{tr('逾期和落后进度排前；点员工直接查看他的任务。', 'Overdue and behind-progress staff rank first; select one to inspect their tasks.', "Kakitangan tertunggak dan ketinggalan disenaraikan dahulu; pilih untuk menyemak tugasan mereka.")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-600">{tr(`逾期 ${staffOverdueCount}`, `${staffOverdueCount} overdue`, `${staffOverdueCount} tertunggak`)}</span>
              <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">{tr(`落后任务 ${behindMissionCount}`, `${behindMissionCount} missions behind`, `${behindMissionCount} misi ketinggalan`)}</span>
              <button type="button" onClick={() => setShowStaffAttention(false)} className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200">
                {tr('隐藏', 'Hide', "Sembunyikan")}
              </button>
              {focusedStaffSummary && managementStaffName && (
                <button type="button" onClick={() => onStaffScopeChange(managementStaffName)} className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200">
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
                    className={`rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected ? 'border-red-200 bg-red-50/40 ring-2 ring-red-100' : 'border-slate-100 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <StaffAvatar name={summary.account.name} avatarDataUrl={summary.account.avatar_data_url} className="h-10 w-10" textClassName="text-[11px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">{summary.account.name}</p>
                        <p className="text-[11px] font-semibold text-slate-500">{trRole(summary.account.role)}</p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${levelStyle.badge}`}>{levelStyle.label}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        ['overdue', tr('逾期', 'Overdue', "Tertunggak"), summary.overdueCount, summary.overdueCount > 0 ? 'text-rose-600' : 'text-slate-700'],
                        ['actions', tr('待办', 'Actions', "Tindakan"), summary.actionCount, 'text-slate-700'],
                        ['follow-up', tr('跟进', 'Follow Up', "Susulan"), summary.followUpCount, summary.followUpCount > 0 ? 'text-blue-700' : 'text-slate-700'],
                        ['workload', tr('工作量', 'Workload', "Beban"), summary.workloadCount, 'text-slate-700'],
                        ['mission', tr('任务', 'Mission', "Misi"), summary.missionCount > 0 ? `${summary.missionProgress}%` : '--', summary.behindMissionCount > 0 ? 'text-amber-700' : 'text-slate-700']
                      ].map(([key, label, value, valueClass]) => (
                        <div key={String(key)} data-testid={`staff-attention-${summary.account.id}-${key}`} className="rounded-lg bg-white px-2 py-2 ring-1 ring-slate-100">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                          <p className={`mt-0.5 text-sm font-bold ${valueClass}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">{summary.behindMissionCount > 0 ? tr(`${summary.behindMissionCount} 个任务落后`, `${summary.behindMissionCount} missions behind`, `${summary.behindMissionCount} misi ketinggalan`) : tr('平均任务进度', 'Average mission progress', "Purata kemajuan misi")}</span>
                        <span className="text-slate-600">{summary.missionCount > 0 ? `${summary.missionProgress}%` : '--'}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${levelStyle.bar}`} style={{ width: `${summary.missionCount > 0 ? summary.missionProgress : 0}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] font-bold text-red-700">
                        {tr('协助处理', 'Assist & action', "Bantu & ambil tindakan")} <ArrowUpRight className="h-3 w-3" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500">{tr('没有 Active staff。', 'No active staff.', "Tiada kakitangan aktif.")}</p>
          )}
        </section>
      )}

      {canFilterStaffScope && focusedStaffSummary && currentStaffName !== managementStaffName && (
        <section
          data-testid="super-admin-assistance-mode"
          className="flex flex-col gap-2 rounded-xl border border-red-100 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-bold text-red-900">
              {tr(`正在协助 ${currentStaffName}`, `Assisting ${currentStaffName}`, `Membantu ${currentStaffName}`)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-red-700">
              {tr('你可以打开下方任务并代为判断、回复或执行；所有操作会记录为 Super Admin。', 'Open any task below to decide, reply, or take action. Every change is audited as Super Admin.', 'Buka tugasan di bawah untuk membuat keputusan, membalas atau mengambil tindakan. Semua perubahan diaudit sebagai Pentadbir Super.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => managementStaffName && onStaffScopeChange?.(managementStaffName)}
            className="self-start rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-red-800 ring-1 ring-red-100 hover:bg-red-50"
          >
            {tr('结束协助', 'End assistance', "Tamatkan bantuan")}
          </button>
        </section>
      )}

      <section ref={actionListRef} id="staff-action-list" data-testid="task-inbox-metric-strip" className="scroll-mt-20 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div title={tr('当前员工范围', 'Current staff scope', "Skop kakitangan semasa")} className="flex min-h-[82px] flex-col rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-slate-600">{tr('全部任务', 'All Tasks', "Semua Tugasan")}</span>
            <ListChecks className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-xl font-bold text-slate-900">{visibleTasks.length}</p>
          <p className="sr-only">{tr('当前员工范围', 'Current staff scope', "Skop kakitangan semasa")}</p>
        </div>
        <div title={tr('需要优先处理', 'Need action first', "Perlu tindakan dahulu")} className="flex min-h-[82px] flex-col rounded-xl border border-rose-100 bg-white p-2.5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-rose-600">{tr('紧急', 'Critical', "kritikal")}</span>
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-xl font-bold text-rose-600">{criticalCount}</p>
          <p className="sr-only">{tr('需要优先处理', 'Need action first', "Perlu tindakan dahulu")}</p>
        </div>
        <div title={tr('等待 Admin 审核', 'Waiting for Admin review', "Menunggu semakan Pentadbir")} className="flex min-h-[82px] flex-col rounded-xl border border-amber-100 bg-white p-2.5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-amber-700">{tr('新申请', 'New Applications', "Permohonan Baharu")}</span>
            <FilePlus2 className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-xl font-bold text-amber-600">{newApplicationCount}</p>
          <p className="sr-only">{tr('等待 Admin 审核', 'Waiting for Admin review', "Menunggu semakan Pentadbir")}</p>
        </div>
        <div title={tr('达成 / 进行中', 'Reached / active', "Mencapai / aktif")} className="flex min-h-[82px] flex-col rounded-xl border border-red-100 bg-white p-2.5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 min-h-6 rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-red-700">{tr('任务进度', 'Mission Progress', "Kemajuan Misi")}</span>
            <Target className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
          </div>
          <p className="mt-auto text-xl font-bold text-red-800">{completedProgressCount}/{progressCount}</p>
          <p className="sr-only">{tr('达成 / 进行中', 'Reached / active', "Mencapai / aktif")}</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          data-testid="toggle-hidden-tasks"
          type="button"
          onClick={() => setShowHiddenTasks((current) => !current)}
          disabled={hiddenTasks.length === 0}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
            showHiddenTasks
              ? 'bg-red-800 text-white'
              : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:text-slate-300'
          }`}
        >
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          <span>{showHiddenTasks ? tr('正在看已隐藏', 'Showing Hidden', "Menunjukkan Tersembunyi") : tr('已隐藏', 'Hidden', "Tersembunyi")}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${
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
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              activeFilter === filter.key
                ? 'bg-red-800 text-white'
                : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <filter.Icon className="h-4 w-4" aria-hidden="true" />
            <span>{tr(filter.zh, filter.en, filter.ms)}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${
              activeFilter === filter.key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
            }`}
            >
              {filterCounts[filter.key]}
            </span>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-3 min-[1800px]:grid-cols-2">
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
            <article key={task.id} className={`rounded-xl border bg-white p-4 shadow-sm ${severity.border}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                  {getTaskIcon(task)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">{task.categoryLabel || trCategoryLabel(task.category)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severity.iconBg} ${severity.iconText}`}>{task.badgeLabel || trSeverityLabel(severity.label)}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{task.dueLabel}</span>
                  </div>
                  <h3 className="mt-2 truncate text-sm font-bold text-slate-900" title={task.title}>{task.title}</h3>
                  {showContextBeforeNextStep && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{task.context}</p>
                  )}
                  {inferredNextStepLabel && (
                    <div
                      data-testid={`task-next-step-${task.applicationId || task.id}`}
                      className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
                            {tr('下一步', 'Next step', 'Langkah seterusnya')}
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-slate-900">{inferredNextStepLabel}</p>
                          {inferredNextStepInstruction && (
                            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">
                              {inferredNextStepInstruction}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {task.relatedTaskSummaries && task.relatedTaskSummaries.length > 0 && (
                    <div
                      data-testid={`related-application-tasks-${task.applicationId}`}
                      className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {task.relatedTaskGroupLabel || tr('同一申请的其他提醒', 'Related reminders for this application', "Peringatan berkaitan untuk permohonan ini")}
                      </p>
                      {task.relatedTaskSummaries.map((relatedTask) => (
                        <div key={relatedTask.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-slate-700">{relatedTask.title}</p>
                            <p className="line-clamp-1 text-[11px] text-slate-500">{relatedTask.context}</p>
                          </div>
                          <span className="shrink-0 text-[10px] font-semibold text-slate-500">{relatedTask.dueLabel}</span>
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
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            {tr('文件 / 资料清单', 'File / Document Checklist', "Senarai Semak Fail / Dokumen")}
                          </p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                                <span className="truncate text-[11px] font-bold text-slate-700">{item.label}</span>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusClass}`}>
                                  {trDocumentStatus(item.status)}
                                </span>
                              </>
                            );

                            return item.status === 'Missing' && task.onOpenDocumentChecklist ? (
                              <button
                                key={item.key}
                                type="button"
                                onClick={task.onOpenDocumentChecklist}
                                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-left transition-colors hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                aria-label={tr(`打开 ${item.label} 文件清单`, `Open ${item.label} in document checklist`, `Buka ${item.label} dalam senarai semak dokumen`)}
                              >
                                {content}
                              </button>
                            ) : (
                              <div key={item.key} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
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
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          {tr('任务回复', 'Task replies', 'Balasan tugasan')}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {(task.calendarNote.comments || []).length}
                        </span>
                      </div>
                      {(task.calendarNote.comments || []).length > 0 && (
                        <div className="mb-2 space-y-1.5">
                          {(task.calendarNote.comments || []).slice(-3).map((comment) => (
                            <div key={comment.id} className="rounded-lg bg-slate-50 px-2.5 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-[11px] font-bold text-slate-700">{comment.staff_name}</span>
                                <span className="shrink-0 text-[10px] font-semibold text-slate-500">{formatTaskCommentTime(comment.created_at)}</span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600">{comment.body}</p>
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
                          className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-300 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                        />
                        <button
                          type="submit"
                          disabled={!calendarReplyDrafts[task.calendarNote.id]?.trim() || Boolean(savingCalendarReplyId)}
                          aria-label={tr('发送任务回复', 'Send task reply', 'Hantar balasan tugasan')}
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-800 px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {savingCalendarReplyId === task.calendarNote.id
                            ? tr('发送中', 'Sending', 'Menghantar')
                            : tr('回复', 'Reply', 'Balas')}
                        </button>
                      </form>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    {!task.hideOwner && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-violet-700 ring-1 ring-violet-100">
                      {ownerAccount
                        ? <StaffAvatar name={ownerAccount.name} avatarDataUrl={ownerAccount.avatar_data_url} className="h-5 w-5" textClassName="text-[7px]" />
                        : <UserCheck className="h-3 w-3" />}
                      {task.owner}
                    </span>}
                    {task.source && (
                      <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700 ring-1 ring-cyan-100">{task.source}</span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-blue-700 ring-1 ring-blue-100">
                      {task.metaAvatarName && (
                        <StaffAvatar
                          name={task.metaAvatarName}
                          avatarDataUrl={metaAvatarAccount?.avatar_data_url}
                          className="h-5 w-5"
                          textClassName="text-[7px]"
                        />
                      )}
                      {task.meta}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.assignmentOptions && task.onAssign && task.assignmentAriaLabel && (
                      <div className="min-w-[220px]">
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
                          className="w-full rounded-lg bg-amber-50 ring-1 ring-amber-200"
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300"
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-900"
                      >
                        {task.actionLabel}
                        <ArrowUpRight className="h-3.5 w-3.5 text-white/85" aria-hidden="true" />
                      </button>
                    )}
                    {task.addBankActionLabel && task.onAddBankAction && (
                      <button
                        type="button"
                        onClick={task.onAddBankAction}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-800 transition-colors hover:bg-red-50"
                      >
                        {task.addBankActionLabel}
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {task.secondaryActionLabel && task.onSecondaryAction && (
                      <button
                        type="button"
                        onClick={task.onSecondaryAction}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        {task.secondaryActionLabel}
                        <IconImage src={whatsappContactIcon} className="h-5 w-5" />
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
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
                </div>
              </div>
            </article>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-800">
              {showHiddenTasks ? tr('这个视图没有隐藏的任务', 'No hidden task in this view', "Tiada tugasan tersembunyi dalam paparan ini") : tr('这个视图没有任务', 'No task in this view', "Tiada tugasan dalam pandangan ini")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {showHiddenTasks ? tr('当前筛选没有隐藏的任务。', 'No hidden tasks in this filter.', "Tiada tugasan tersembunyi dalam penapis ini.") : tr('当前筛选没有需要处理的任务。', 'Nothing to handle in this filter.', "Tiada apa-apa untuk dikendalikan dalam penapis ini.")}
            </p>
          </div>
        )}
      </section>
      </>}

      {activeWorkspace === 'openLeads' && (
        <section className="space-y-4">
          {canImportLeads && (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{tr('上传 TikTok 名单', 'Upload TikTok Leads', 'Muat Naik Prospek TikTok')}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
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
                  className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-900"
                >
                  <FileUp className="h-4 w-4" />
                  {tr('导入 TikTok CSV', 'Import TikTok CSV', 'Import TikTok CSV')}
                </button>
                {canCreateOwnLead && (
                  <button
                    type="button"
                    onClick={() => setLeadPoolChoiceMode('manual')}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                    {tr('手动新增', 'Add Lead', 'Tambah prospek')}
                  </button>
                )}
              </div>
            </div>
          )}

          {leadEntryMessage && (
            <p className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">{leadEntryMessage}</p>
          )}

          <div
            className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xs"
            role="tablist"
            aria-label={tr('名单分类', 'Lead lists', 'Senarai prospek')}
          >
            {([
              ['public', tr('开放名单', 'Open Leads', 'Prospek Terbuka'), openLeads.length, publicLeadsIcon],
              ['private', tr('我的名单', 'My Leads', 'Prospek Saya'), myLeads.length, claimedLeadsIcon]
            ] as Array<['public' | 'private', string, number, string]>).map(([key, label, count, iconSrc]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeLeadTab === key}
                aria-controls={`lead-list-panel-${key}`}
                aria-label={label}
                onClick={() => setActiveLeadTab(key)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  activeLeadTab === key
                    ? 'bg-red-800 text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <IconImage src={iconSrc} className="h-6 w-6" />
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${activeLeadTab === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
                  className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    myLeadFilter === key
                      ? 'bg-red-800 text-white'
                      : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${myLeadFilter === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
                    className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      myLeadDateFilter === key
                        ? 'bg-red-800 text-white'
                        : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${myLeadDateFilter === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
                    className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      openLeadDateFilter === key
                        ? 'bg-red-800 text-white'
                        : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${openLeadDateFilter === key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
            <div className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-700">
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
                  className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
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
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                    {tr(`分配已选 (${selectedPrivateLeads.length})`, `Assign Selected (${selectedPrivateLeads.length})`, `Berikan Dipilih (${selectedPrivateLeads.length})`)}
                  </button>
                )}
                <button
                  type="button"
                  disabled={selectedActiveLeads.length === 0}
                  onClick={() => { void handleDeleteLeads(selectedActiveLeads, 'selected'); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {tr('删除已选', 'Delete Selected', 'Padam Dipilih')}
                </button>
                <button
                  type="button"
                  onClick={() => { void handleDeleteLeads(deletableActiveLeads, 'all'); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-800"
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
                  <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-800">
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
                  <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-800">
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {leadPoolChoiceMode === 'import'
                    ? tr('导入到哪里？', 'Where should these leads go?', 'Ke mana prospek ini harus dimasukkan?')
                    : tr('新增到哪里？', 'Where should this lead go?', 'Ke mana prospek ini harus dimasukkan?')}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {leadPoolChoiceMode === 'import'
                    ? tr('选择后将打开 CSV 文件选择器。', 'Choose a pool to open the CSV file picker.', 'Pilih kumpulan untuk membuka pemilih fail CSV.')
                    : tr('选择 Open Leads 或你的私人 My Leads。', 'Choose Open Leads or your private My Leads.', 'Pilih Prospek Terbuka atau Prospek Saya peribadi anda.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeadPoolChoiceMode(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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
                className="min-h-28 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:border-red-200 hover:bg-red-50"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <IconImage src={publicLeadsIcon} className="h-8 w-8" />
                  {tr('开放名单 · 公共池', 'Open Leads · Public Pool', 'Prospek Terbuka · Kumpulan Awam')}
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-slate-500">
                  {tr('保持未分配，进入 Open Leads。', 'Stay unassigned and appear in Open Leads.', 'Kekal belum ditugaskan dan muncul dalam Prospek Terbuka.')}
                </span>
              </button>
              <button
                type="button"
                aria-label={tr('私人池', 'Private Pool', 'Kumpulan Peribadi')}
                onClick={() => handleLeadPoolSelection('private')}
                className="min-h-28 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:border-red-200 hover:bg-red-50"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <IconImage src={claimedLeadsIcon} className="h-8 w-8" />
                  {tr('我的名单 · 私人池', 'My Leads · Private Pool', 'Prospek Saya · Kumpulan Peribadi')}
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-slate-500">
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{tr('分配私人名单', 'Assign Private Leads', 'Berikan Prospek Peribadi')}</h3>
                <p className="mt-1 text-xs text-slate-500">
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
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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
                  className="rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  {tr('取消', 'Cancel', 'Batal')}
                </button>
                <button
                  type="button"
                  disabled={!leadAssignmentStaffId}
                  onClick={handleAssignSelectedPrivateLeads}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
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
          <form onSubmit={handleManualLeadSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{tr('手动新增潜在客户', 'Add Lead Manually', 'Tambah Prospek Secara Manual')}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {manualLeadTargetPool === 'public'
                    ? tr('新增后会进入 Open Leads，保持未分配。', 'This lead will enter Open Leads and remain unassigned.', 'Prospek ini akan masuk ke Prospek Terbuka dan kekal belum ditugaskan.')
                    : tr('新增后只会出现在你的私人名单。', 'This lead will be added to your private list.', 'Prospek ini akan ditambah ke senarai peribadi anda.')}
                </p>
              </div>
              <button type="button" onClick={() => setShowLeadEntry(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label={tr('关闭', 'Close', 'Tutup')}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {tr('姓名', 'Name', 'Nama')} <span className="text-red-700">*</span>
                <input value={manualLeadDraft.name} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, name: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" autoFocus />
              </label>
              <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {tr('电话号码', 'Phone Number', 'Nombor Telefon')} <span className="text-red-700">*</span>
                <input value={manualLeadDraft.phone_no} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, phone_no: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" inputMode="tel" />
              </label>
              <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {tr('渠道', 'Channel', 'Saluran')}
                <ToggleOptionGroup value={manualLeadDraft.channel} onChange={(value) => setManualLeadDraft((draft) => ({ ...draft, channel: value as RawCustomerChannel }))} ariaLabel={tr('渠道', 'Channel', 'Saluran')} className="mt-1 h-10 w-full rounded-lg bg-slate-50 ring-1 ring-slate-100" options={(['TikTok', 'Facebook', 'Instagram', 'Google', 'Walk-in', 'Other'] as RawCustomerChannel[]).map((channel) => ({ value: channel, label: channel }))} />
              </label>
              <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {tr('用户名', 'Username', 'Nama pengguna')}
                <input value={manualLeadDraft.username} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, username: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" />
              </label>
              <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                IC
                <input value={manualLeadDraft.ic_no} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, ic_no: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" />
              </label>
              <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {tr('银行户口', 'Bank Account', 'Akaun Bank')}
                <input value={manualLeadDraft.account_number} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, account_number: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" />
              </label>
              <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 md:col-span-2">
                {tr('电邮', 'Email', 'E-mel')}
                <input value={manualLeadDraft.email} onChange={(event) => setManualLeadDraft((draft) => ({ ...draft, email: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" inputMode="email" />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowLeadEntry(false)} className="rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200">{tr('取消', 'Cancel', 'Batal')}</button>
              <button type="submit" className="rounded-lg bg-red-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-900">{tr('新增名单', 'Add Lead', 'Tambah prospek')}</button>
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
