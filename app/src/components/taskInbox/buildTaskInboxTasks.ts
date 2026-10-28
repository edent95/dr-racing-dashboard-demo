/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Pure Task Inbox task derivation. Shared by TaskInboxPage (which renders the
// cards) and App (which needs the same visible-task list for the bell, sidebar
// badge and mobile shell even when the Task Inbox page is not mounted).
// Keep this module free of React components: UI-only pieces (avatars, modal
// openers) are injected through `TaskInboxTaskActions`.

import type { ReactNode } from 'react';
import { ApprovalRequest, BankApplication, BankDefinition, CalendarNote, CustomMission, CustomMissionMetricType, CustomMissionTimeframe, DealFinance, getLoanPendingAction, getLoanPendingWith, LoanApplication, LoanStatus, NotificationItem, PurchaseMethod, QuickStockInput, RawCustomerLead, RejectNextStepType, RoleAccount, RoleNavAccessSetting, VehicleCatalogItem, VehicleCondition, VehicleStockUnit } from '../../types';
import { canRoleWorkTask, resolveEffectiveTaskAssignmentRole, resolveTaskAssignmentRole, type TaskAssignmentKey } from '../../data/roleNavAccess';
import { getMissingDocumentLabels, normalizeDocumentChecklist } from '../../utils/documentChecklist';
import { getMissingApplicationInformationLabels } from '../../utils/applicationCompleteness';
import { getApplicationRejectCodes } from '../../utils/rejectCodes';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../../utils/malaysiaPhone';
import { buildMissingCheckoutIncidents, type MissingCheckoutIncident } from '../../utils/attendanceSummary';
import { getApplicationIdsRequiringVehicleStock, getVehicleStockReference } from '../../utils/vehicleStock';
import type { AttendanceEvent, AttendanceIncidentResolution } from '../../services/dashboardRepository';
import { getAppLocale, tr, trBankStatus, trFollowUpStatus, trLoanStatus, trNotificationMessage, trNotificationTitle } from '../../lib/i18n';
import { getStartOfDay } from '../../hooks/useTaskClock';
import { isAwaitingHandlerAssignment, isStaffLinkQueueHandler } from '../../../shared/staffLinkQueue.mjs';
import type { BankQuickAction } from '../../utils/loanTableBankColumns';
import { canRecordDeliveryStep, getDeliveryProgress, getNextDeliveryStep } from '../../utils/deliveryChecklist';
import { getOpenDeliveryStepsBeforeDelivery } from '../../../shared/deliveryChecklistSteps.mjs';
import { hasAdminWorkAccess } from '../../utils/staffRoles';
import { getAeonAutoDebitIssue, getAutoDebitWarningText, type AeonAutoDebitIssue } from '../../utils/aeonAutoDebit';

export type TaskInboxMirrorCategory = 'missing' | 'rawLead' | 'cash' | 'bank' | 'reminder' | 'mission';
export type TaskInboxMirrorSeverity = 'critical' | 'warning' | 'info' | 'success';
type TaskCategory = TaskInboxMirrorCategory;
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

export interface InboxTask {
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
  /** Bank follow-up: the five decisions, each opening the bank page on that form. */
  onBankQuickAction?: (action: BankQuickAction) => void;
  assignmentOptions?: Array<{ value: string; label: string; leading?: ReactNode }>;
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

export const rejectNextStepPresentation = (bankApplication?: BankApplication) => {
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

export const getMetricLabel = (metric: CustomMissionMetricType) => {
  const labels: Record<CustomMissionMetricType, [string, string, string]> = {
    top_sales_approved: ['批核单数', 'Approved sales', 'Jualan diluluskan'],
    fast_response: ['响应速度', 'Fast response', 'Respons pantas'],
    raw_lead_conversion: ['名单转化', 'Lead conversion', 'Penukaran prospek']
  };
  return tr(labels[metric][0], labels[metric][1], labels[metric][2]);
};

export const normalizeMatchValue = (value: string) => value.trim().toLowerCase();
export const getHiddenTaskStorageKey = (staffName: string) => `dr_racing_hidden_task_inbox_items:${staffName}`;

export const readHiddenTaskIds = (staffName: string): string[] => {
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

// Date-only values (from <input type="date">) must be treated as LOCAL
// midnight; new Date('YYYY-MM-DD') parses them as UTC midnight, which can
// shift the calendar day depending on the machine timezone.
export function parseDueDate(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDueTime(value?: string) {
  return parseDueDate(value)?.getTime() ?? Number.NaN;
}

export function getLatestTaskTime(...values: (string | undefined)[]) {
  const validTimes = values
    .map((value) => getDueTime(value))
    .filter(Number.isFinite);

  return validTimes.length > 0 ? Math.max(...validTimes) : 0;
}

export function isToday(value?: string) {
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

export function formatShortDate(value?: string) {
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

export function formatMalaysiaAttendanceTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return tr('时间无效', 'Invalid time', 'Masa tidak sah');

  return date.toLocaleTimeString(getAppLocale(), {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getMissionRange(mission: CustomMission) {
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

export function isWithinMissionRange(value: string, mission: CustomMission) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const { start, end } = getMissionRange(mission);
  return date >= start && date <= end;
}

export function getTimeframeLabel(timeframe: CustomMissionTimeframe) {
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

export function isStaffInMissionScope(mission: CustomMission, staffName: string, staffRole: RoleAccount['role']) {
  if (mission.scope_type === 'staff') {
    return mission.scope_value === staffName;
  }

  if (mission.scope_type === 'role') {
    return mission.scope_value === staffRole;
  }

  return true;
}

export function getExpectedMissionProgress(mission: CustomMission, now: Date) {
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

export interface ApplicationMatchIndex {
  phones: Set<string>;
  identityNumbers: Set<string>;
  accountNumbers: Set<string>;
  emails: Set<string>;
}

export function buildApplicationMatchIndex(applications: LoanApplication[]): ApplicationMatchIndex {
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

export function hasMatchingApplication(lead: RawCustomerLead, applicationMatchIndex: ApplicationMatchIndex) {
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

export function calculateMissionProgress(
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

export function getNotificationCategory(notification: NotificationItem): InboxTask['category'] {
  if (notification.type === 'raw_lead_assigned') return 'rawLead';
  if (notification.type === 'mission_due_soon' || notification.type === 'custom_mission_target_reached') return 'mission';
  if (notification.type === 'loan_sales_review_required') return 'bank';
  if (notification.type === 'bank_submission_required' || notification.type === 'bank_need_more_info' || notification.type === 'loan_admin_action_required' || notification.type === 'loan_documents_uploaded') return 'bank';
  if (notification.type === 'rejected_loan_missing_code' || notification.type === 'loan_documents_required' || notification.type === 'loan_rejected_action_required') return 'missing';
  return 'reminder';
}

export function getEquivalentGeneratedTaskId(notification: NotificationItem) {
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

export function getNotificationActionLabel(notification: NotificationItem) {
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

// Total landed cost of one physical stock unit. 0 means Operations has not
// recorded the cost yet, which drives the "record vehicle cost" task.
export function getStockUnitLandedCost(unit: VehicleStockUnit): number {
  return (
    (Number(unit.purchase_cost) || 0) +
    (Number(unit.transport_cost) || 0) +
    (Number(unit.registration_cost) || 0) +
    (Number(unit.accessories_cost) || 0) +
    (Number(unit.repair_cost) || 0) +
    (Number(unit.other_direct_cost) || 0)
  );
}

export function getDealSalesValue(finance: DealFinance): number {
  return (Number(finance.final_selling_price) || 0)
    + (Number(finance.other_income) || 0)
    - (Number(finance.refund_amount) || 0);
}

export function getDealReceipts(finance: DealFinance, purchaseMethod?: PurchaseMethod): number {
  return (Number(finance.customer_deposit_received) || 0)
    + (Number(finance.customer_cash_payment) || 0)
    + (purchaseMethod === 'Cash' ? 0 : (Number(finance.bank_disbursement) || 0));
}

// Mirrors the page's visible-task filter: tasks with `canHide === false` are
// never hidden, everything else is dropped when its id is in the hidden set.
export function filterVisibleTaskInboxTasks(tasks: InboxTask[], hiddenTaskIds: ReadonlySet<string>) {
  return tasks.filter((task) => task.canHide === false || !hiddenTaskIds.has(task.id));
}

export function toTaskInboxMirrorItem(task: InboxTask): TaskInboxMirrorItem {
  return {
    id: task.id,
    category: task.category,
    severity: task.severity,
    title: task.title,
    context: task.context,
    meta: task.meta,
    dueLabel: task.dueLabel,
    categoryLabel: task.categoryLabel,
    badgeLabel: task.badgeLabel
  };
}

// Missing check-out incidents that have not been resolved for the same
// check-in yet (the resolution is keyed by incident id + last check-in time).
export function buildOpenMissingCheckoutIncidents(
  attendanceEvents: AttendanceEvent[],
  attendanceIncidentResolutions: AttendanceIncidentResolution[],
  referenceTime: Date
) {
  return buildMissingCheckoutIncidents(attendanceEvents, referenceTime)
    .filter((incident) => !attendanceIncidentResolutions.some((resolution) => (
      resolution.id === incident.id
      && resolution.last_check_in_at === incident.lastCheckInAt
    )));
}

export interface TaskInboxTaskInput {
  applications: LoanApplication[];
  calendarNotes: CalendarNote[];
  rawCustomerLeads: RawCustomerLead[];
  roleAccounts: RoleAccount[];
  roleNavAccess: RoleNavAccessSetting[];
  customMissions: CustomMission[];
  notifications: NotificationItem[];
  approvalRequests: ApprovalRequest[];
  staffLeaveRequests: ApprovalRequest[];
  vehicleCatalog: VehicleCatalogItem[];
  /** Bank Database: each lender's auto-debit banks. */
  bankDefinitions?: BankDefinition[];
  /** Already filtered to open (unresolved) incidents; see buildOpenMissingCheckoutIncidents. */
  missingCheckoutIncidents: MissingCheckoutIncident[];
  /** The staff whose tasks are built (Task Inbox scope). */
  currentStaffName: string;
  currentStaffRole: RoleAccount['role'];
  /** The signed-in viewer's role (controls Super Admin-only controls). */
  viewerStaffRole: RoleAccount['role'];
  managementStaffName?: string;
  /** Reference clock (ms). "Today" and the 3-day disbursement check derive from it. */
  now: number;
  /** Optional precomputed index; built from `applications` when omitted. */
  applicationMatchIndex?: ApplicationMatchIndex;
}

export interface TaskInboxTaskActions {
  onOpenApplication: (application: LoanApplication, target?: 'documentChecklist' | 'bankApplications' | 'addBank') => void;
  onOpenNotification: (notification: NotificationItem) => void;
  onOpenWhatsApp: (lead: RawCustomerLead, target: 'api' | 'web') => void;
  onUpdateMissingInfo: (
    application: LoanApplication,
    updates: { vehicle_condition: VehicleCondition; purchase_method: PurchaseMethod }
  ) => Promise<boolean>;
  onAssignApplicationHandler: (applicationId: string, handlerName: string) => void | Promise<void>;
  onAssignApplicationAdmin: (applicationId: string, adminName: string) => void | Promise<void>;
  onCompleteCashAcceptance: (application: LoanApplication, workflowAction?: 'COMPLETE_APPROVED_CONTACT' | 'NOTIFY_ADMIN' | 'APPROVE_CASH_PURCHASE') => Promise<boolean>;
  onMarkBikeDelivered: (applicationId: string, stockUnitId: string) => Promise<boolean>;
  onSetCalendarNoteCompleted: (noteId: string, completed: boolean) => void | Promise<void>;
  onResolveMissingCheckout: (incident: MissingCheckoutIncident) => Promise<boolean>;
  /** Page-local: open the inline Quick Add Stock modal for an application. */
  onOpenQuickAddStock: (applicationId: string) => void;
  /** Page-local: open the deal settlement modal for an application. */
  onOpenDealSettlement: (applicationId: string) => void;
  /** Opens the bank page on one bank with one quick decision (Admin / Super Admin). */
  onBankQuickAction?: (application: LoanApplication, bankApplicationId: string, action: BankQuickAction) => void;
  // Optional actions: their presence changes labels/copy on some tasks, so
  // callers that mirror the page must pass the same set the page receives.
  onOpenMissions?: () => void;
  onOpenFinanceStock?: (model?: string) => void;
  onQuickAddStock?: (applicationId: string, model: string, input: QuickStockInput) => Promise<boolean>;
  onOpenFinanceDeal?: (applicationId: string) => void;
  /** Opens the Delivery page on one deal's checklist. */
  onOpenDelivery?: (applicationId: string) => void;
  onMarkCommissionPaid?: (applicationId: string) => Promise<boolean>;
  onSaveDealFinance?: (applicationId: string, finance: DealFinance) => Promise<boolean>;
  onReviewApproval?: (id: string, decision: 'Approved' | 'Rejected') => void;
  onReviewLeaveRequest?: (id: string, decision: 'Approved' | 'Rejected') => void | Promise<boolean>;
  /** Leading avatar for assignment dropdown options; omit for non-UI callers. */
  renderAssignmentAvatar?: (account: RoleAccount) => ReactNode;
}

export function buildTaskInboxTasks(input: TaskInboxTaskInput, actions: TaskInboxTaskActions): InboxTask[] {
  const {
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
    bankDefinitions = [],
    missingCheckoutIncidents,
    currentStaffName,
    currentStaffRole,
    viewerStaffRole,
    managementStaffName = '',
    now
  } = input;
  const {
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
    onOpenQuickAddStock,
    onOpenDealSettlement,
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
    renderAssignmentAvatar
  } = actions;
  const applicationMatchIndex = input.applicationMatchIndex ?? buildApplicationMatchIndex(applications);
  const todayStart = getStartOfDay(now);
  const todayEndTime = new Date(todayStart).setHours(23, 59, 59, 999);
  const currentScopeLabel = currentStaffName;

  const handlesAssignedTask = (taskKey: TaskAssignmentKey) => {
    const assignedRole = resolveTaskAssignmentRole(taskKey, roleNavAccess);
    const effectiveRole = resolveEffectiveTaskAssignmentRole(taskKey, roleNavAccess, roleAccounts);

    // The owner role keeps its task while it can work it (Home on, and Finance
    // Center on for finance tasks); otherwise Super Admin takes over.
    return currentStaffRole === assignedRole
      ? assignedRole === 'Super Admin' || canRoleWorkTask(assignedRole, taskKey, roleNavAccess)
      : currentStaffRole === 'Super Admin' && effectiveRole === 'Super Admin';
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
      leading: renderAssignmentAvatar?.(account)
    }));
  const activeAdminAssignmentOptions = roleAccounts
    .filter((account) => account.status === 'Active' && account.role === 'Admin')
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((account) => ({
      value: account.name,
      label: account.name,
      leading: renderAssignmentAvatar?.(account)
    }));
  const seoAssignmentTasks: InboxTask[] = handlesAssignedTask('seo_sales_assignment')
    ? applications
      .filter((application) => (
        // Website SEO intake, or staff-link intake parked in the queue
        // because the link owner is no longer an Active staff member.
        isAwaitingHandlerAssignment(application) &&
        getLoanPendingWith(application) === 'Handler' &&
        getLoanPendingAction(application) === 'Complete Application' &&
        application.status !== LoanStatus.REJECT &&
        application.status !== LoanStatus.CANCELLED
      ))
      .map((application) => {
        const staffLinkQueued = isStaffLinkQueueHandler(application.handler_name);
        const originalLinkStaff = application.customer_intake_tracking?.sales_name || '';
        return {
        id: `workflow-seo-assignment-${application.id}`,
        applicationId: application.id,
        sortTime: getLatestTaskTime(application.pending_since, application.submitted_at),
        category: application.purchase_method === 'Cash' ? 'cash' as const : 'bank' as const,
        severity: 'warning' as const,
        title: staffLinkQueued
          ? tr(
            `待分配（原员工链接）· ${application.applicant_name}`,
            `Unassigned (former staff link) · ${application.applicant_name}`,
            `Belum ditugaskan (pautan kakitangan lama) · ${application.applicant_name}`
          )
          : tr(
            `SEO 申请 · ${application.applicant_name}`,
            `SEO application · ${application.applicant_name}`,
            `Permohonan SEO · ${application.applicant_name}`
          ),
        context: staffLinkQueued
          ? tr(
            `客户通过 ${originalLinkStaff || '员工'} 的旧链接申请，但该员工已不在职，需要重新分配 Sales。`,
            `Submitted through ${originalLinkStaff || 'a staff member'}'s link, but that staff member is no longer active. Assign a Sales.`,
            `Dihantar melalui pautan ${originalLinkStaff || 'kakitangan'}, tetapi kakitangan itu tidak lagi aktif. Tetapkan Jualan.`
          )
          : tr(
            '官网 SEO 申请还没有 Sales 负责人。',
            'This website SEO application does not have a Sales handler yet.',
            'Permohonan SEO laman web ini belum mempunyai pengendali Jualan.'
          ),
        meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
        dueLabel: tr('等待分配', 'Awaiting assignment', 'Menunggu tugasan'),
        owner: currentStaffName,
        hideOwner: true,
        isNewApplication: true,
        categoryLabel: staffLinkQueued ? tr('员工链接', 'Staff link', 'Pautan kakitangan') : 'SEO',
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
        };
      })
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
      // A complete cash purchase is approved from the card; missing items still open the drawer.
      const canQuickApproveCash = isCashPurchase && isNewApplication
        && getMissingApplicationInformationLabels(application).length + getMissingDocumentLabels(application).length === 0;
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
        quickActionLabel: canQuickApproveCash ? tr('批准现金购买', 'Approve Cash Purchase', 'Luluskan Pembelian Tunai') : undefined,
        onQuickAction: canQuickApproveCash ? () => onCompleteCashAcceptance(application, 'APPROVE_CASH_PURCHASE') : undefined,
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
        // One click on Home (owner 2026-10-18: as few steps as possible): the same
        // COMPLETE_APPROVED_CONTACT the drawer runs, for cash and loan alike.
        quickActionLabel: isApproved
          ? isCashPurchase
            ? tr('客户已接受', 'Customer Accepted', "Pelanggan Menerima")
            : tr('客户已联系', 'Customer Contacted', 'Pelanggan Dihubungi')
          : isInitialSalesReview && incompleteCount === 0
            ? tr('通知 Admin', 'Notify Admin', 'Maklumkan Pentadbir')
            : undefined,
        onQuickAction: isApproved
          ? () => onCompleteCashAcceptance(application)
          : isInitialSalesReview && incompleteCount === 0
            ? () => onCompleteCashAcceptance(application, 'NOTIFY_ADMIN')
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
          onOpen: () => onOpenApplication(application, 'bankApplications'),
          onBankQuickAction: onBankQuickAction
            && hasAdminWorkAccess(viewerStaffRole)
            && ['Submitted', 'Pending Review'].includes(bankApplication.status)
            ? (action: BankQuickAction) => onBankQuickAction(application, bankApplication.id, action)
            : undefined
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
      // Delivery checklist gate: Operations Manager waits for steps 1-10;
      // Super Admin may still deliver (the save audits the open steps).
      const openChecklistSteps = getOpenDeliveryStepsBeforeDelivery(application.delivery_checklist);
      const isBlockedByChecklist = canMarkDelivered && openChecklistSteps.length > 0 && currentStaffRole !== 'Super Admin';
      return [{
        id: `delivery-${application.id}`,
        applicationId: application.id,
        sortTime: getLatestTaskTime(application.deal_finance?.updated_at, application.pending_since, application.submitted_at),
        category: 'reminder' as const,
        severity: 'warning' as const,
        title: application.applicant_name,
        context: isBlockedByChecklist
          ? tr(
            `已批准,交车清单还有 ${openChecklistSteps.length} 步没完成。全部完成后才能交车。`,
            `Approved; ${openChecklistSteps.length} delivery checklist steps are still open. The bike can be delivered once they are done.`,
            `Diluluskan; ${openChecklistSteps.length} langkah senarai penghantaran belum selesai. Motor boleh dihantar selepas semuanya selesai.`
          )
          : canMarkDelivered
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
        deliveryStockOptions: canMarkDelivered && !isBlockedByChecklist ? stockOptions : undefined,
        deliveryNoStockHint: tr('没有可用库存车，请先在 Finance Center 补库存', 'No stock unit available — add stock in Finance Center first', "Tiada unit stok — tambah stok di Pusat Kewangan dahulu"),
        onDeliver: canMarkDelivered && !isBlockedByChecklist
          ? (stockUnitId: string) => onMarkBikeDelivered(application.id, stockUnitId)
          : undefined,
        canHide: false
      }];
    });

  // 交车清单 (Delivery checklist, owner meeting 2026-10-13): whoever the next
  // step belongs to gets the card; the WhatsApp group message it replaces.
  // Sales see their own files, Admin the files they own or handle. Operations
  // Manager and Super Admin may record any step but follow the Delivery page
  // instead of getting a card for every deal.
  // Operations Manager's own steps (the Operations check, owner 2026-10-18,
  // and ordering the motor, owner 2026-10-21) come to its Home for every deal.
  const deliveryStepTasks: InboxTask[] = (currentStaffRole === 'Sales' || currentStaffRole === 'Admin' || currentStaffRole === 'Operations Manager')
    ? applications
      .filter((application) => (
        application.status === LoanStatus.APPROVE
        && application.deal_finance?.sale_status !== 'Cancelled'
        && (
          currentStaffRole === 'Operations Manager'
            ? Boolean(getNextDeliveryStep(application.delivery_checklist)?.owners.includes('Operations Manager'))
            : application.handler_name === currentStaffName || (currentStaffRole === 'Admin' && application.admin_owner_name === currentStaffName)
        )
      ))
      .flatMap((application) => {
        const nextStep = getNextDeliveryStep(application.delivery_checklist);
        if (!nextStep || !canRecordDeliveryStep(nextStep.key, { role: currentStaffRole, name: currentStaffName }, application)) {
          return [];
        }
        const progress = getDeliveryProgress(application.delivery_checklist);
        const stepLabel = tr(...nextStep.label);
        return [{
          id: `deliverystep-${application.id}-${nextStep.key}`,
          applicationId: application.id,
          sortTime: getLatestTaskTime(application.delivery_checklist?.updated_at, application.deal_finance?.updated_at, application.pending_since),
          category: 'reminder' as const,
          severity: 'warning' as const,
          title: application.applicant_name,
          context: tr(
            `交车清单轮到你:${stepLabel}(已完成 ${progress.done} / ${progress.total} 步)。`,
            `Your step on the delivery checklist: ${stepLabel} (${progress.done} of ${progress.total} done).`,
            `Langkah anda dalam senarai penghantaran: ${stepLabel} (${progress.done} daripada ${progress.total} selesai).`
          ),
          meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', 'Tiada kenderaan')} · ${application.handler_name}`,
          dueLabel: tr('交车清单', 'Delivery checklist', 'Senarai penghantaran'),
          owner: application.handler_name,
          nextStepLabel: stepLabel,
          nextStepInstruction: tr('打开交车清单,填好资料后标记完成。', 'Open the delivery checklist, fill in the details and mark it done.', 'Buka senarai penghantaran, isi butiran dan tandakan selesai.'),
          actionLabel: tr('打开交车清单', 'Open checklist', 'Buka senarai'),
          onOpen: () => (onOpenDelivery ? onOpenDelivery(application.id) : onOpenApplication(application)),
          canHide: false
        }];
      })
    : [];

  // AEON auto-debit (owner 2026-10-24): once AEON (or any lender with an
  // auto-debit list in Bank Database) approves, the handler asks the customer
  // for an account at a bank it can debit. The card clears when the salary
  // bank is changed to one of them.
  const aeonAutoDebitTasks: InboxTask[] = staffApplications
    .flatMap((application) => {
      if (
        application.purchase_method === 'Cash'
        || application.deal_finance?.sale_status === 'Bike Delivered'
        || application.deal_finance?.sale_status === 'Cancelled'
      ) return [];
      const issue = getAeonAutoDebitIssue(application.personal_info?.bank_name, application.bank_applications || [], bankDefinitions);
      return issue ? [{ application, issue }] : [];
    })
    .map(({ application, issue }: { application: LoanApplication; issue: NonNullable<AeonAutoDebitIssue> }) => {
      const salaryBank = application.personal_info?.bank_name || '';
      const lenderRow = (application.bank_applications || []).find((bank) => bank.status === 'Approved' && bank.bank_name === issue.lenderName);
      return {
        id: `aeon-auto-debit-${application.id}`,
        applicationId: application.id,
        sortTime: getLatestTaskTime(lenderRow?.approved_at, lenderRow?.decision_at, application.pending_since),
        category: 'reminder' as const,
        severity: 'warning' as const,
        title: application.applicant_name,
        context: getAutoDebitWarningText(issue.lenderName, salaryBank, issue.acceptedBanks),
        meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', 'Tiada kenderaan')} · ${issue.lenderName}`,
        dueLabel: tr('换扣款户口', 'Change debit account', 'Tukar akaun debit'),
        owner: application.handler_name,
        hideOwner: true,
        nextStepLabel: tr('联系客户换户口', 'Ask the customer for another account', 'Minta akaun lain daripada pelanggan'),
        nextStepInstruction: tr('拿到新户口后，在客户资料里改工资银行和户口号，这张卡就会消失。', 'Once you have it, change the salary bank and account number on the customer; this card then clears.', 'Selepas dapat, tukar bank gaji dan nombor akaun pelanggan; kad ini akan hilang.'),
        actionLabel: tr('查看客户', 'View customer', 'Lihat pelanggan'),
        onOpen: () => onOpenApplication(application),
        canHide: false
      };
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
          ? tr(`这单已批准，但「${application.vehicle_model || '未填车型'}」没有可用库存车。店里没有就向外面下单(Pending Stock 页);到货后点「补库存」填成本入库。`, `This deal is approved, but no stock unit is available for "${application.vehicle_model || 'this model'}". Order it outside if the shop has none (Pending Stock page); when it arrives, tap "Add stock" and record the cost.`, `Urus niaga ini diluluskan, tetapi tiada unit stok untuk "${application.vehicle_model || 'model ini'}". Tempah dari luar jika kedai tiada (halaman Pending Stock); apabila tiba, tekan "Tambah stok" dan rekod kos.`)
          : tr(`这单已批准，但「${application.vehicle_model || '未填车型'}」没有可用库存车。请找车，到货后在 Finance Center 补库存并填成本。`, `This deal is approved, but no stock unit is available for "${application.vehicle_model || 'this model'}". Find the bike, then add it to stock with its cost in Finance Center.`, `Urus niaga ini diluluskan, tetapi tiada unit stok untuk "${application.vehicle_model || 'model ini'}". Cari motor, kemudian tambah ke stok dengan kosnya di Pusat Kewangan.`),
        meta: `${application.vehicle_model || tr('未填车型', 'No vehicle', "Tiada kenderaan")} · ${trLoanStatus(application.status)}`,
        dueLabel: tr('待补库存', 'Stock needed', "Perlu stok"),
        owner: application.handler_name,
        hideOwner: true,
        actionLabel: canInlineAdd
          ? tr('补库存', 'Add stock', "Tambah stok")
          : (onOpenFinanceStock ? tr('去补库存', 'Add stock', "Tambah stok") : undefined),
        onOpen: canInlineAdd
          ? () => onOpenQuickAddStock(application.id)
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
        onOpen: onSaveDealFinance ? () => onOpenDealSettlement(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
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
      if (!Number.isFinite(approvedTime) || now - approvedTime < 3 * 24 * 60 * 60 * 1000) return [];
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
        onOpen: onSaveDealFinance ? () => onOpenDealSettlement(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
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
        onOpen: onSaveDealFinance ? () => onOpenDealSettlement(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
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
        onOpen: onSaveDealFinance ? () => onOpenDealSettlement(application.id) : (onOpenFinanceDeal ? () => onOpenFinanceDeal(application.id) : undefined),
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
      // Keep a one-click action (Mark Commission Paid) that one of the merged tasks had.
      quickActionLabel: ordered.find((task) => task.onQuickAction)?.quickActionLabel,
      onQuickAction: ordered.find((task) => task.onQuickAction)?.onQuickAction,
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
    if (task.id.startsWith('aeon-auto-debit-')) return 48;
    if (task.id.startsWith('deliverystep-')) return 46;
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
    ...deliveryStepTasks,
    ...aeonAutoDebitTasks,
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
}
