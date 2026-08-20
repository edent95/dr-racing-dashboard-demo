/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  LogIn,
  LogOut,
  Paperclip,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  TimerReset,
  Trash2,
  UploadCloud,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react';
import { normalizeAttendanceNetworkIp, normalizeAttendancePolicy, type ApprovalRequest, type ApprovalRequestStatus, type AttendancePolicy, type AttendanceWeeklySchedule, type RoleAccount, type RoleAccountRole } from '../types';
import type { AttendanceEvent } from '../services/dashboardRepository';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';
import ToggleSwitch from './ToggleSwitch';
import { getAppLocale, tr, trRole } from '../lib/i18n';
import { buildDailyAttendanceSummary, buildMonthlyAttendanceSummary } from '../utils/attendanceSummary';
import SafeAttachmentLink from './SafeAttachmentLink';
import {
  ATTACHMENT_ACCEPT_ATTRIBUTE,
  isAllowedAttachmentMimeType,
  isSafeAttachmentDataUrl
} from '../utils/attachmentSafety';

const MALAYSIA_TIME_ZONE = 'Asia/Kuala_Lumpur';
const MAX_MC_BYTES = 400 * 1024;

type LeaveKind = 'Leave' | 'MC' | 'OT';

type LeaveMeta = {
  source: 'attendance';
  kind: LeaveKind;
  start_date: string;
  end_date: string;
  overtime_date?: string;
  overtime_end_time?: string;
};

interface AttendancePageProps {
  events: AttendanceEvent[];
  schedules: AttendanceWeeklySchedule[];
  leaveRequests: ApprovalRequest[];
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  canViewAll: boolean;
  canManageSchedules: boolean;
  attendancePolicy: AttendancePolicy;
  currentNetworkIp: string;
  onRecordAttendance: (action: AttendanceEvent['action'], note: string) => Promise<boolean>;
  onSaveWeeklySchedules: (schedules: AttendanceWeeklySchedule[]) => Promise<boolean>;
  onSubmitLeaveRequest: (request: Omit<ApprovalRequest, 'id' | 'status' | 'requester_name' | 'requester_role' | 'submitted_at'>) => Promise<boolean>;
  onReviewLeaveRequest: (requestId: string, status: ApprovalRequestStatus, reviewNote: string) => Promise<boolean>;
  onUpdateAttendancePolicy: (policy: AttendancePolicy) => boolean;
}

type WeeklyScheduleDraft = Record<string, {
  monthly_salary: number;
  days: Record<string, 'Working' | 'Off Day'>;
}>;

function malaysiaDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MALAYSIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function shiftDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  date.setUTCDate(date.getUTCDate() + days);
  return malaysiaDateKey(date);
}

function mondayOfWeek(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  const day = date.getUTCDay();
  return shiftDateKey(dateKey, day === 0 ? -6 : 1 - day);
}

function weekDateKeys(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => shiftDateKey(weekStart, index));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2
  }).format(value || 0);
}

function formatTime(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat(getAppLocale(), {
    timeZone: MALAYSIA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat(getAppLocale(), {
    timeZone: MALAYSIA_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDuration(minutes: number) {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

function parseLeaveMeta(request: ApprovalRequest): LeaveMeta {
  try {
    const parsed = JSON.parse(request.notes) as Partial<LeaveMeta>;
    if (
      parsed.source === 'attendance'
      && (parsed.kind === 'Leave' || parsed.kind === 'MC' || parsed.kind === 'OT')
      && typeof parsed.start_date === 'string'
      && typeof parsed.end_date === 'string'
    ) {
      return parsed as LeaveMeta;
    }
  } catch {
    // Legacy sick-leave requests were plain text. Keep them readable here.
  }

  return {
    source: 'attendance',
    kind: request.mc_attachment ? 'MC' : 'Leave',
    start_date: request.submitted_at.slice(0, 10),
    end_date: request.submitted_at.slice(0, 10)
  };
}

function inclusiveDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00+08:00`);
  const end = new Date(`${endDate}T00:00:00+08:00`);
  const difference = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return Math.max(1, difference + 1);
}

const STATUS_STYLE: Record<ApprovalRequestStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
  Cancelled: 'bg-slate-100 text-slate-500'
};

function statusLabel(status: ApprovalRequestStatus) {
  if (status === 'Pending') return tr('待审批', 'Pending', 'Menunggu');
  if (status === 'Approved') return tr('已批准', 'Approved', 'Diluluskan');
  if (status === 'Rejected') return tr('已拒绝', 'Rejected', 'Ditolak');
  return tr('已取消', 'Cancelled', 'Dibatalkan');
}

export default function AttendancePage({
  events,
  schedules,
  leaveRequests,
  roleAccounts,
  currentStaffName,
  currentStaffRole,
  canViewAll,
  canManageSchedules,
  attendancePolicy,
  currentNetworkIp,
  onRecordAttendance,
  onSaveWeeklySchedules,
  onSubmitLeaveRequest,
  onReviewLeaveRequest,
  onUpdateAttendancePolicy
}: AttendancePageProps) {
  const today = malaysiaDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [attendanceNote, setAttendanceNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [leaveKind, setLeaveKind] = useState<LeaveKind>('Leave');
  const [leaveStartDate, setLeaveStartDate] = useState(today);
  const [leaveEndDate, setLeaveEndDate] = useState(today);
  const [leaveDuration, setLeaveDuration] = useState('1');
  const [overtimeEndTime, setOvertimeEndTime] = useState('23:00');
  const [leaveReason, setLeaveReason] = useState('');
  const [mcAttachment, setMcAttachment] = useState<ApprovalRequest['mc_attachment']>();
  const [leaveError, setLeaveError] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState('');
  const [showStaffDayStatus, setShowStaffDayStatus] = useState(true);
  const [showMonthlyAttendance, setShowMonthlyAttendance] = useState(true);
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);
  const [policyDraft, setPolicyDraft] = useState(() => normalizeAttendancePolicy(attendancePolicy));
  const [officeIpText, setOfficeIpText] = useState(() => attendancePolicy.office_network_ips.join('\n'));
  const [policyError, setPolicyError] = useState('');
  const [policySaved, setPolicySaved] = useState(false);
  const [scheduleWeekStart, setScheduleWeekStart] = useState(() => mondayOfWeek(today));
  const [scheduleDraft, setScheduleDraft] = useState<WeeklyScheduleDraft>({});
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  useEffect(() => {
    setPolicyDraft(normalizeAttendancePolicy(attendancePolicy));
    setOfficeIpText(attendancePolicy.office_network_ips.join('\n'));
  }, [attendancePolicy]);

  const activeAccounts = useMemo(() => roleAccounts
    .filter((account) => account.status === 'Active')
    .sort((left, right) => left.name.localeCompare(right.name)), [roleAccounts]);
  const scheduleWeekDates = useMemo(() => weekDateKeys(scheduleWeekStart), [scheduleWeekStart]);
  useEffect(() => {
    const nextDraft: WeeklyScheduleDraft = {};
    activeAccounts.forEach((account) => {
      const weekSchedule = schedules.find((schedule) => (
        schedule.week_start === scheduleWeekStart
        && schedule.staff_name === account.name
      ));
      const latestSalary = schedules
        .filter((schedule) => schedule.staff_name === account.name)
        .sort((left, right) => right.week_start.localeCompare(left.week_start))[0]?.monthly_salary || 0;
      nextDraft[account.name] = {
        monthly_salary: weekSchedule?.monthly_salary ?? latestSalary,
        days: Object.fromEntries(scheduleWeekDates.map((date) => [
          date,
          weekSchedule?.days.find((day) => day.date === date)?.status || 'Working'
        ]))
      };
    });
    setScheduleDraft(nextDraft);
  }, [activeAccounts, scheduleWeekDates, scheduleWeekStart, schedules]);
  const visibleAccounts = useMemo(() => {
    if (canViewAll) return activeAccounts;
    const self = activeAccounts.find((account) => account.name === currentStaffName);
    return self ? [self] : [{
      id: currentStaffName,
      name: currentStaffName,
      email: '',
      role: currentStaffRole,
      status: 'Active' as const
    }];
  }, [activeAccounts, canViewAll, currentStaffName, currentStaffRole]);
  const summaries = useMemo(() => visibleAccounts.map((account) => buildDailyAttendanceSummary(
    account.name,
    account.role,
    account.avatar_data_url,
    events,
    selectedDate,
    attendancePolicy,
    schedules,
    leaveRequests
  )), [attendancePolicy, events, leaveRequests, schedules, selectedDate, visibleAccounts]);
  const selfSummary = useMemo(() => buildDailyAttendanceSummary(
    currentStaffName,
    currentStaffRole,
    activeAccounts.find((account) => account.name === currentStaffName)?.avatar_data_url,
    events,
    today,
    attendancePolicy,
    schedules,
    leaveRequests
  ), [activeAccounts, attendancePolicy, currentStaffName, currentStaffRole, events, leaveRequests, schedules, today]);
  const monthlySummaries = useMemo(() => visibleAccounts.map((account) => (
    buildMonthlyAttendanceSummary(account, events, selectedMonth, attendancePolicy, schedules, leaveRequests)
  )), [attendancePolicy, events, leaveRequests, schedules, selectedMonth, visibleAccounts]);
  const nextAction: AttendanceEvent['action'] = selfSummary.lastEvent?.action === 'check_in'
    ? 'check_out'
    : 'check_in';
  const normalizedCurrentNetworkIp = normalizeAttendanceNetworkIp(currentNetworkIp);
  const hasDetectedNetworkIp = Boolean(normalizedCurrentNetworkIp)
    && !['unavailable', 'local browser'].includes(normalizedCurrentNetworkIp);
  const officeNetworkMatches = !attendancePolicy.require_office_wifi_for_check_in
    || attendancePolicy.office_network_ips.includes(normalizedCurrentNetworkIp);
  const checkInNetworkBlocked = nextAction === 'check_in'
    && attendancePolicy.require_office_wifi_for_check_in
    && !officeNetworkMatches;
  const checkInOffDayBlocked = nextAction === 'check_in' && selfSummary.isOffDay;
  const attendanceNextStep = checkInNetworkBlocked
    ? {
      label: tr('连接 Office Wi-Fi', 'Connect to office Wi-Fi', 'Sambung ke Wi-Fi pejabat'),
      instruction: tr('连接已登记的 Office Wi-Fi，然后按 Check in。', 'Connect to a registered office network, then use Check in.', 'Sambung ke rangkaian pejabat yang didaftarkan, kemudian gunakan Check in.')
    }
    : nextAction === 'check_in'
      ? {
        label: tr('Check in 上班', 'Check in', 'Daftar masuk'),
        instruction: tr('开始工作前先完成 Check in；有外出安排可在下方填写备注。', 'Record your start before working; add a note below if you are heading out.', 'Rekod masa mula sebelum bekerja; tambah nota di bawah jika anda keluar.')
      }
      : {
        label: tr('Check out 离开', 'Check out', 'Daftar keluar'),
        instruction: tr('离开或结束今天工作时按 Check out；系统会保留完整工时记录。', 'Use Check out when leaving or finishing work so today’s hours are recorded.', 'Gunakan Check out apabila keluar atau tamat kerja supaya waktu hari ini direkodkan.')
      };
  const visibleRequests = useMemo(() => leaveRequests
    .filter((request) => canViewAll || request.requester_name === currentStaffName)
    .sort((left, right) => right.submitted_at.localeCompare(left.submitted_at)), [
    canViewAll,
    currentStaffName,
    leaveRequests
  ]);
  const pendingRequestCount = visibleRequests.filter((request) => request.status === 'Pending').length;
  const presentCount = summaries.filter((summary) => Boolean(summary.firstCheckIn)).length;
  const lateCount = summaries.filter((summary) => summary.isLate).length;
  const selectedEvents = summaries
    .flatMap((summary) => summary.events)
    .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at));

  const handleAddPenaltyRule = () => {
    const highestThreshold = policyDraft.late_penalty_rules.at(-1)?.threshold_minutes || 0;
    setPolicyDraft((current) => ({
      ...current,
      late_penalty_rules: [
        ...current.late_penalty_rules,
        {
          threshold_minutes: Math.min(1440, highestThreshold + 30),
          penalty_type: 'fixed_amount',
          amount: 20,
          deduction_days: 0
        }
      ]
    }));
    setPolicySaved(false);
  };

  const handleSavePolicy = () => {
    setPolicyError('');
    const officeNetworkIps = officeIpText
      .split(/[\s,]+/)
      .map(normalizeAttendanceNetworkIp)
      .filter(Boolean);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(policyDraft.work_start_time)) {
      setPolicyError(tr('请选择正确的上班时间。', 'Choose a valid work start time.', 'Pilih masa mula kerja yang sah.'));
      return;
    }
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(policyDraft.work_end_time)
      || !/^([01]\d|2[0-3]):[0-5]\d$/.test(policyDraft.overtime_next_day_start_time)
    ) {
      setPolicyError(tr('请选择正确的下班与 OT 次日上班时间。', 'Choose valid work-end and post-OT next-day start times.', 'Pilih masa tamat kerja dan mula hari selepas OT yang sah.'));
      return;
    }
    if (
      !Number.isFinite(policyDraft.late_grace_minutes)
      || policyDraft.late_grace_minutes < 0
      || policyDraft.late_grace_minutes > 240
    ) {
      setPolicyError(tr('迟到宽限必须是 0–240 分钟。', 'Late grace must be 0–240 minutes.', 'Tempoh lewat mesti 0–240 minit.'));
      return;
    }
    if (policyDraft.late_penalty_rules.some((rule) => (
      !Number.isFinite(rule.threshold_minutes)
      || rule.threshold_minutes < 0
      || rule.threshold_minutes > 1440
      || !Number.isFinite(rule.amount)
      || rule.amount <= 0
      || (rule.penalty_type === 'salary_days' && rule.amount > 31)
      || (rule.penalty_type === 'fixed_amount' && rule.amount > 100000)
    ))) {
      setPolicyError(tr('请填写正确的迟到门槛和扣款。', 'Enter valid late thresholds and penalties.', 'Masukkan ambang lewat dan potongan yang sah.'));
      return;
    }
    if (policyDraft.require_office_wifi_for_check_in && officeNetworkIps.length === 0) {
      setPolicyError(tr('开启 Office Wi-Fi Check in 前，请至少填写一个办公室 IP。', 'Add at least one office IP before requiring Office Wi-Fi for check-in.', 'Tambah sekurang-kurangnya satu IP pejabat sebelum mewajibkan Wi-Fi pejabat.'));
      return;
    }

    const saved = onUpdateAttendancePolicy(normalizeAttendancePolicy({
      ...policyDraft,
      office_network_ips: officeNetworkIps
    }));
    setPolicySaved(saved);
  };

  const handleAttendance = async () => {
    if (isRecording) return;
    setIsRecording(true);
    const saved = await onRecordAttendance(nextAction, attendanceNote.trim());
    setIsRecording(false);
    if (saved) setAttendanceNote('');
  };

  const handleSaveSchedule = async () => {
    const now = new Date().toISOString();
    const nextSchedules = activeAccounts.map((account) => {
      const draft = scheduleDraft[account.name];
      return {
        id: `ATT-SCHEDULE-${scheduleWeekStart}-${encodeURIComponent(account.name)}`,
        week_start: scheduleWeekStart,
        staff_name: account.name,
        staff_role: account.role,
        monthly_salary: Math.max(0, Math.min(1000000, Number(draft?.monthly_salary) || 0)),
        days: scheduleWeekDates.map((date) => ({
          date,
          status: draft?.days[date] || 'Working'
        })),
        updated_by: currentStaffName,
        updated_role: currentStaffRole,
        updated_at: now
      } satisfies AttendanceWeeklySchedule;
    });

    setIsSavingSchedule(true);
    await onSaveWeeklySchedules(nextSchedules);
    setIsSavingSchedule(false);
  };

  const handleMcFile = (file?: File) => {
    setLeaveError('');
    setMcAttachment(undefined);
    if (!file) return;
    // SECURITY: allow-list non-scriptable types only. `image/*` used to admit
    // image/svg+xml, which is a scriptable document format.
    if (!isAllowedAttachmentMimeType(file.type)) {
      setLeaveError(tr('MC 只接受 PDF 或图片（不支持 SVG）。', 'MC accepts PDF or image files only (SVG is not supported).', 'MC hanya menerima fail PDF atau imej (SVG tidak disokong).'));
      return;
    }
    if (file.size > MAX_MC_BYTES) {
      setLeaveError(tr('MC 文件必须小于 400KB。', 'MC file must be smaller than 400KB.', 'Fail MC mesti lebih kecil daripada 400KB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      if (!isSafeAttachmentDataUrl(reader.result, file.type)) {
        setLeaveError(tr('MC 附件无法验证，请换一个文件。', 'The MC attachment could not be verified. Please choose another file.', 'Lampiran MC tidak dapat disahkan. Sila pilih fail lain.'));
        return;
      }
      setMcAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        uploaded_at: new Date().toISOString(),
        file_data_url: reader.result
      });
    };
    reader.onerror = () => setLeaveError(tr('无法读取 MC 文件。', 'MC file could not be read.', 'Fail MC tidak dapat dibaca.'));
    reader.readAsDataURL(file);
  };

  const handleLeaveSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLeaveError('');
    if (leaveKind !== 'OT' && (!leaveStartDate || !leaveEndDate || leaveEndDate < leaveStartDate)) {
      setLeaveError(tr('请选择正确的开始与结束日期。', 'Choose a valid start and end date.', 'Pilih tarikh mula dan tamat yang sah.'));
      return;
    }
    if (!leaveReason.trim()) {
      setLeaveError(tr('请填写申请原因。', 'Enter a reason for the request.', 'Masukkan sebab permohonan.'));
      return;
    }
    if (leaveKind === 'MC' && !mcAttachment) {
      setLeaveError(tr('MC 申请必须附上证明。', 'An MC request requires an attachment.', 'Permohonan MC memerlukan lampiran.'));
      return;
    }

    if (leaveKind === 'OT' && (!leaveStartDate || !overtimeEndTime)) {
      setLeaveError(tr('请选择 OT 日期和预计结束时间。', 'Choose the OT date and expected end time.', 'Pilih tarikh OT dan masa tamat yang dijangka.'));
      return;
    }

    const workEndMinutes = Number(attendancePolicy.work_end_time.slice(0, 2)) * 60
      + Number(attendancePolicy.work_end_time.slice(3, 5));
    const overtimeEndMinutes = Number(overtimeEndTime.slice(0, 2)) * 60
      + Number(overtimeEndTime.slice(3, 5));
    const overtimeMinutes = overtimeEndMinutes >= workEndMinutes
      ? overtimeEndMinutes - workEndMinutes
      : (24 * 60 - workEndMinutes) + overtimeEndMinutes;
    const amount = leaveKind === 'OT'
      ? Math.max(0.5, Math.min(24, Math.round((overtimeMinutes / 60) * 2) / 2))
      : Math.max(0.5, Math.min(365, Number(leaveDuration) || inclusiveDays(leaveStartDate, leaveEndDate)));
    const meta: LeaveMeta = {
      source: 'attendance',
      kind: leaveKind,
      start_date: leaveStartDate,
      end_date: leaveKind === 'OT' ? leaveStartDate : leaveEndDate,
      overtime_date: leaveKind === 'OT' ? leaveStartDate : undefined,
      overtime_end_time: leaveKind === 'OT' ? overtimeEndTime : undefined
    };
    setIsSubmittingLeave(true);
    const saved = await onSubmitLeaveRequest({
      type: 'staff_sick_leave',
      approver_roles: ['Operations Manager', 'Super Admin'],
      target_type: 'general',
      target_id: currentStaffName,
      target_label: currentStaffName,
      amount,
      reason: leaveReason.trim(),
      notes: JSON.stringify(meta),
      mc_attachment: leaveKind === 'MC' ? mcAttachment : undefined
    });
    setIsSubmittingLeave(false);
    if (saved) {
      setLeaveReason('');
      setMcAttachment(undefined);
      setLeaveDuration('1');
    }
  };

  const reviewRequest = async (requestId: string, status: ApprovalRequestStatus) => {
    setReviewingId(requestId);
    await onReviewLeaveRequest(requestId, status, reviewNotes[requestId]?.trim() || '');
    setReviewingId('');
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-800">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tr('考勤与请假', 'Attendance & Leave', 'Kehadiran & Cuti')}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {tr('每周排班、迟到扣款，以及 Leave / MC / OT 审批。', 'Weekly schedules, late deductions, and Leave / MC / OT approval.', 'Jadual mingguan, potongan lewat serta kelulusan Cuti / MC / OT.')}
              </p>
            </div>
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-100">
          <span>{tr('查看日期', 'View date', 'Lihat tarikh')}</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <StaffAvatar
                name={currentStaffName}
                avatarDataUrl={selfSummary.avatar}
                className="h-12 w-12"
              />
              <div>
                <p className="font-bold text-slate-900">{currentStaffName}</p>
                <p className="text-xs font-semibold text-slate-400">{trRole(currentStaffRole)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selfSummary.lastEvent
                    ? tr(
                      `今天最后记录：${selfSummary.lastEvent.action === 'check_in' ? '上班' : '离开'} ${formatTime(selfSummary.lastEvent.occurred_at)}`,
                      `Last today: ${selfSummary.lastEvent.action === 'check_in' ? 'Checked in' : 'Checked out'} ${formatTime(selfSummary.lastEvent.occurred_at)}`,
                      `Rekod terakhir hari ini: ${selfSummary.lastEvent.action === 'check_in' ? 'Masuk' : 'Keluar'} ${formatTime(selfSummary.lastEvent.occurred_at)}`
                    )
                    : tr('今天还没有打卡。', 'No punch yet today.', 'Belum ada rekod hari ini.')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAttendance}
              disabled={isRecording || checkInOffDayBlocked}
              className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-7 text-sm font-bold text-white shadow-sm transition-colors disabled:cursor-wait disabled:bg-slate-300 ${
                checkInOffDayBlocked
                  ? 'bg-slate-400'
                  : checkInNetworkBlocked
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : nextAction === 'check_in'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-800 hover:bg-red-900'
              }`}
            >
              {checkInOffDayBlocked
                ? <CalendarRange className="h-5 w-5" />
                : checkInNetworkBlocked
                ? <WifiOff className="h-5 w-5" />
                : nextAction === 'check_in'
                  ? <LogIn className="h-5 w-5" />
                  : <LogOut className="h-5 w-5" />}
              {isRecording
                ? tr('记录中...', 'Recording...', 'Merekod...')
                : checkInOffDayBlocked
                  ? tr('今天是 Off Day', 'Today is Off Day', 'Hari ini Hari Cuti')
                : checkInNetworkBlocked
                  ? tr('需要 Office Wi-Fi', 'Office Wi-Fi required', 'Wi-Fi pejabat diperlukan')
                : nextAction === 'check_in'
                  ? tr('Check in 上班', 'Check in', 'Daftar masuk')
                  : tr('Check out 离开', 'Check out', 'Daftar keluar')}
            </button>
          </div>
          {!checkInOffDayBlocked && (
            <div data-testid="attendance-next-step" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">{tr('下一步', 'Next step', 'Langkah seterusnya')}</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">{attendanceNextStep.label}</p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{attendanceNextStep.instruction}</p>
                </div>
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={attendanceNote}
              onChange={(event) => setAttendanceNote(event.target.value.slice(0, 500))}
              placeholder={tr('备注（选填，例如：外出见客户）', 'Note (optional, e.g. customer visit)', 'Nota (pilihan, cth. jumpa pelanggan)')}
              className="min-w-0 flex-1 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-red-100"
            />
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] font-semibold text-slate-500">
              <TimerReset className="h-4 w-4 text-slate-400" />
              {tr('可重复 Check in / Check out', 'Repeat as often as needed', 'Boleh ulang masuk / keluar')}
            </div>
          </div>
          {attendancePolicy.require_office_wifi_for_check_in && nextAction === 'check_in' && (
            <div
              data-testid="office-network-status"
              className={`mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
                officeNetworkMatches
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {officeNetworkMatches ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {officeNetworkMatches
                ? tr('已连接办公室网络，可以 Check in。', 'Office network verified. You can check in.', 'Rangkaian pejabat disahkan. Anda boleh daftar masuk.')
                : tr('请连接办公室 Wi-Fi 后再 Check in。', 'Connect to office Wi-Fi before checking in.', 'Sambung ke Wi-Fi pejabat sebelum daftar masuk.')}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{tr('考勤判断规则', 'Attendance rules', 'Peraturan kehadiran')}</p>
              <p className="mt-2 text-lg font-bold">{tr('自动标记异常', 'Automatic exceptions', 'Pengecualian automatik')}</p>
            </div>
            {canViewAll ? (
              <button
                type="button"
                onClick={() => setShowPolicyEditor((current) => !current)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold text-white transition-colors hover:bg-white/15"
              >
                <Settings2 className="h-3.5 w-3.5" />
                {showPolicyEditor ? tr('关闭设定', 'Close settings', 'Tutup tetapan') : tr('更改规则', 'Edit rules', 'Ubah peraturan')}
              </button>
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="font-bold text-white">{attendancePolicy.work_start_time}–{attendancePolicy.work_end_time}</p>
              <p className="mt-1 text-slate-400">{tr('正常班', 'Normal shift', 'Syif biasa')}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="font-bold text-white">{attendancePolicy.overtime_next_day_start_time}</p>
              <p className="mt-1 text-slate-400">{tr('批准 OT 后次日上班', 'Next start after approved OT', 'Mula selepas OT diluluskan')}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="font-bold text-white">
                {attendancePolicy.require_office_wifi_for_check_in
                  ? tr('必须连接', 'Required', 'Diperlukan')
                  : tr('未启用', 'Not required', 'Tidak diperlukan')}
              </p>
              <p className="mt-1 text-slate-400">Office Wi-Fi Check in</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {attendancePolicy.late_penalty_rules.length > 0 ? attendancePolicy.late_penalty_rules.map((rule) => (
              <span key={rule.threshold_minutes} className="rounded-md bg-rose-400/10 px-2 py-1 text-[10px] font-bold text-rose-200">
                {tr(
                  `迟到 ${rule.threshold_minutes}m → ${rule.penalty_type === 'fixed_amount' ? `扣 ${formatMoney(rule.amount)}` : `扣 ${rule.amount} 天薪水`}`,
                  `${rule.threshold_minutes}m late → ${rule.penalty_type === 'fixed_amount' ? `deduct ${formatMoney(rule.amount)}` : `deduct ${rule.amount} salary day`}`,
                  `Lewat ${rule.threshold_minutes}m → ${rule.penalty_type === 'fixed_amount' ? `potong ${formatMoney(rule.amount)}` : `potong ${rule.amount} hari gaji`}`
                )}
              </span>
            )) : (
              <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400">
                {tr('没有扣除规则', 'No deduction rules', 'Tiada peraturan potongan')}
              </span>
            )}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
            {tr('第一笔 Check in 与当天生效的上班时间比较。批准 OT 后，次日改用 12:00；达到门槛时采用最高一档扣款。', 'The first check-in is compared with that day’s effective start. Approved OT moves the next-day start to 12:00; the highest reached penalty applies.', 'Daftar masuk pertama dibandingkan dengan masa mula berkuat kuasa. OT diluluskan mengubah mula hari berikutnya kepada 12:00; penalti tertinggi digunakan.')}
          </p>
        </div>
      </section>

      {canViewAll && showPolicyEditor && (
        <section data-testid="attendance-policy-editor" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">{tr('上班时间与迟到规则', 'Work time & lateness rules', 'Masa kerja & peraturan lewat')}</h2>
              <p className="mt-1 text-xs text-slate-400">
                {tr('只有 Super Admin 可以修改；扣除采用员工当天达到的最高一档。', 'Only Super Admin can edit these settings; the highest tier reached that day applies.', 'Hanya Super Admin boleh mengubah; tahap tertinggi yang dicapai pada hari itu digunakan.')}
              </p>
            </div>
            <span className="self-start rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-indigo-700">
              {tr('Super Admin 设定', 'Super Admin settings', 'Tetapan Super Admin')}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tr('上班时间', 'Scheduled work start', 'Masa mula kerja')}
              <input
                aria-label="Scheduled work start"
                type="time"
                value={policyDraft.work_start_time}
                onChange={(event) => {
                  setPolicyDraft((current) => ({ ...current, work_start_time: event.target.value }));
                  setPolicySaved(false);
                }}
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tr('迟到宽限（分钟）', 'Late grace (minutes)', 'Tempoh lewat (minit)')}
              <input
                aria-label="Late grace minutes"
                type="number"
                min="0"
                max="240"
                step="1"
                value={policyDraft.late_grace_minutes}
                onChange={(event) => {
                  setPolicyDraft((current) => ({ ...current, late_grace_minutes: Number(event.target.value) }));
                  setPolicySaved(false);
                }}
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tr('下班时间', 'Scheduled work end', 'Masa tamat kerja')}
              <input
                aria-label="Scheduled work end"
                type="time"
                value={policyDraft.work_end_time}
                onChange={(event) => {
                  setPolicyDraft((current) => ({ ...current, work_end_time: event.target.value }));
                  setPolicySaved(false);
                }}
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tr('OT 后次日上班', 'Post-OT next-day start', 'Mula hari selepas OT')}
              <input
                aria-label="Post-OT next-day start"
                type="time"
                value={policyDraft.overtime_next_day_start_time}
                onChange={(event) => {
                  setPolicyDraft((current) => ({ ...current, overtime_next_day_start_time: event.target.value }));
                  setPolicySaved(false);
                }}
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
              />
            </label>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <ToggleSwitch
              checked={policyDraft.require_office_wifi_for_check_in}
              onChange={(checked) => {
                setPolicyDraft((current) => ({
                  ...current,
                  require_office_wifi_for_check_in: checked
                }));
                setPolicySaved(false);
              }}
              label={tr('所有员工 Check in 必须连接 Office Wi-Fi', 'Require Office Wi-Fi for every staff check-in', 'Wajibkan Wi-Fi pejabat untuk daftar masuk semua kakitangan')}
              description={tr('只限制 Check in；Check out 不受影响。', 'Check-in only; checkout remains available.', 'Daftar masuk sahaja; daftar keluar kekal tersedia.')}
              leading={<Wifi className="h-4 w-4 text-slate-500" />}
              className="w-full justify-start"
            />

            {policyDraft.require_office_wifi_for_check_in && (
              <div className="mt-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {tr('办公室公网 IP（每行一个）', 'Office public IPs (one per line)', 'IP awam pejabat (satu setiap baris)')}
                  <textarea
                    aria-label="Office network IPs"
                    rows={3}
                    value={officeIpText}
                    onChange={(event) => {
                      setOfficeIpText(event.target.value);
                      setPolicySaved(false);
                    }}
                    placeholder="203.0.113.10"
                    className="mt-2 w-full resize-y rounded-xl bg-white px-4 py-3 font-mono text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
                  />
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-semibold text-slate-400">
                    {tr(
                      `当前检测：${hasDetectedNetworkIp ? normalizedCurrentNetworkIp : '无法取得'}`,
                      `Currently detected: ${hasDetectedNetworkIp ? normalizedCurrentNetworkIp : 'Unavailable'}`,
                      `Dikesan sekarang: ${hasDetectedNetworkIp ? normalizedCurrentNetworkIp : 'Tidak tersedia'}`
                    )}
                  </p>
                  <button
                    type="button"
                    disabled={!hasDetectedNetworkIp}
                    onClick={() => {
                      const nextIps = [...new Set([
                        ...officeIpText.split(/[\s,]+/).map(normalizeAttendanceNetworkIp).filter(Boolean),
                        normalizedCurrentNetworkIp
                      ])];
                      setOfficeIpText(nextIps.join('\n'));
                      setPolicySaved(false);
                    }}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Wifi className="h-3.5 w-3.5" />
                    {tr('使用当前 IP', 'Use current IP', 'Gunakan IP semasa')}
                  </button>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                  {tr('系统以服务器看到的公网 IP 判断网络。办公室网络 IP 改变后，需要在这里更新。', 'The server-observed public IP is used. Update this list if the office network IP changes.', 'IP awam yang dilihat pelayan digunakan. Kemas kini senarai ini jika IP rangkaian pejabat berubah.')}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">{tr('迟到扣除级别', 'Late deduction tiers', 'Tahap potongan lewat')}</h3>
                <p className="mt-1 text-[10px] text-slate-400">{tr('当前规则：迟到 30 分钟扣 RM20；60 分钟扣半天薪水。', 'Current rule: 30 minutes deducts RM20; 60 minutes deducts half-day salary.', 'Peraturan semasa: 30 minit potong RM20; 60 minit potong separuh hari gaji.')}</p>
              </div>
              <button
                type="button"
                onClick={handleAddPenaltyRule}
                disabled={policyDraft.late_penalty_rules.length >= 10}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                {tr('增加级别', 'Add tier', 'Tambah tahap')}
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {policyDraft.late_penalty_rules.map((rule, index) => (
                <div key={`${index}-${rule.threshold_minutes}`} className="grid grid-cols-1 items-end gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)_auto]">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {tr('迟到分钟', 'Late minutes', 'Minit lewat')}
                    <input
                      aria-label={`Late threshold ${index + 1}`}
                      type="number"
                      min="0"
                      max="1440"
                      step="1"
                      value={rule.threshold_minutes}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setPolicyDraft((current) => ({
                          ...current,
                          late_penalty_rules: current.late_penalty_rules.map((item, ruleIndex) => (
                            ruleIndex === index ? { ...item, threshold_minutes: value } : item
                          ))
                        }));
                        setPolicySaved(false);
                      }}
                      className="mt-2 w-full rounded-lg bg-white px-3 py-2.5 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {tr('扣款类型', 'Penalty type', 'Jenis penalti')}
                    <ToggleOptionGroup
                      value={rule.penalty_type}
                      options={[
                        { value: 'fixed_amount', label: tr('固定 RM', 'Fixed RM', 'RM tetap') },
                        { value: 'salary_days', label: tr('薪水天数', 'Salary days', 'Hari gaji') }
                      ]}
                      onChange={(value) => {
                        setPolicyDraft((current) => ({
                          ...current,
                          late_penalty_rules: current.late_penalty_rules.map((item, ruleIndex) => (
                            ruleIndex === index
                              ? {
                                  ...item,
                                  penalty_type: value as 'fixed_amount' | 'salary_days',
                                  amount: value === 'fixed_amount' ? 20 : 0.5,
                                  deduction_days: value === 'salary_days' ? 0.5 : 0
                                }
                              : item
                          ))
                        }));
                        setPolicySaved(false);
                      }}
                      ariaLabel={`Penalty type ${index + 1}`}
                      className="mt-2 rounded-lg bg-white p-1"
                    />
                  </div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {rule.penalty_type === 'fixed_amount'
                      ? tr('扣款 RM', 'Deduct RM', 'Potong RM')
                      : tr('扣除薪水天数', 'Deduct salary days', 'Potong hari gaji')}
                    <input
                      aria-label={`Penalty amount ${index + 1}`}
                      type="number"
                      min={rule.penalty_type === 'fixed_amount' ? '0.01' : '0.25'}
                      max={rule.penalty_type === 'fixed_amount' ? '100000' : '31'}
                      step={rule.penalty_type === 'fixed_amount' ? '0.01' : '0.25'}
                      value={rule.amount}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setPolicyDraft((current) => ({
                          ...current,
                          late_penalty_rules: current.late_penalty_rules.map((item, ruleIndex) => (
                            ruleIndex === index
                              ? {
                                  ...item,
                                  amount: value,
                                  deduction_days: item.penalty_type === 'salary_days' ? value : 0
                                }
                              : item
                          ))
                        }));
                        setPolicySaved(false);
                      }}
                      className="mt-2 w-full rounded-lg bg-white px-3 py-2.5 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                  <button
                    type="button"
                    aria-label={`Remove late tier ${index + 1}`}
                    onClick={() => {
                      setPolicyDraft((current) => ({
                        ...current,
                        late_penalty_rules: current.late_penalty_rules.filter((_, ruleIndex) => ruleIndex !== index)
                      }));
                      setPolicySaved(false);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {policyDraft.late_penalty_rules.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs font-semibold text-slate-400">
                  {tr('没有迟到扣除级别。', 'No late deduction tiers.', 'Tiada tahap potongan lewat.')}
                </div>
              )}
            </div>
          </div>

          {policyError && <p className="mt-3 text-xs font-semibold text-rose-600">{policyError}</p>}
          <button
            type="button"
            onClick={handleSavePolicy}
            className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
              policySaved ? 'bg-emerald-50 text-emerald-700' : 'bg-red-800 text-white hover:bg-red-900'
            }`}
          >
            <Save className="h-4 w-4" />
            {policySaved ? tr('规则已保存', 'Rules saved', 'Peraturan disimpan') : tr('保存规则', 'Save rules', 'Simpan peraturan')}
          </button>
        </section>
      )}

      {canManageSchedules && (
        <section data-testid="attendance-weekly-schedule" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-red-800" />
                <h2 className="font-bold text-slate-900">{tr('每周员工排班', 'Weekly staff schedule', 'Jadual mingguan kakitangan')}</h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {tr('Admin 每个星期一设定 Working / Off Day；Off Day 不需要打卡。月薪只用于计算迟到半天薪水扣款。', 'Admin sets Working / Off Day every Monday. Off Days need no punch; monthly salary is used only for half-day late deductions.', 'Admin menetapkan Kerja / Hari Cuti setiap Isnin. Hari Cuti tidak perlu rekod; gaji bulanan hanya untuk potongan lewat separuh hari.')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {tr('星期开始', 'Week starting', 'Minggu bermula')}
                <input
                  aria-label="Attendance schedule week"
                  type="date"
                  value={scheduleWeekStart}
                  onChange={(event) => setScheduleWeekStart(mondayOfWeek(event.target.value))}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none"
                />
              </label>
              <button
                type="button"
                disabled={isSavingSchedule}
                onClick={() => void handleSaveSchedule()}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900 disabled:bg-slate-300"
              >
                <Save className="h-4 w-4" />
                {isSavingSchedule ? tr('保存中...', 'Saving...', 'Menyimpan...') : tr('保存本周排班', 'Save week', 'Simpan minggu')}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed text-left">
              <thead>
                <tr className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="w-48 px-2 py-2">{tr('员工', 'Staff', 'Kakitangan')}</th>
                  <th className="w-36 px-2 py-2">{tr('月薪', 'Monthly salary', 'Gaji bulanan')}</th>
                  {scheduleWeekDates.map((date) => (
                    <th key={date} className="px-2 py-2 text-center">
                      {new Intl.DateTimeFormat(getAppLocale(), {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                        timeZone: MALAYSIA_TIME_ZONE
                      }).format(new Date(`${date}T12:00:00+08:00`))}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeAccounts.map((account) => (
                  <tr key={account.id} className="border-t border-slate-100">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-8 w-8" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{account.name}</p>
                          <p className="text-[9px] font-semibold text-slate-400">{trRole(account.role)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <label className="flex items-center rounded-lg bg-slate-50 px-2 ring-1 ring-slate-100">
                        <span className="text-[10px] font-bold text-slate-400">RM</span>
                        <input
                          aria-label={`Monthly salary for ${account.name}`}
                          type="number"
                          min="0"
                          max="1000000"
                          step="0.01"
                          value={scheduleDraft[account.name]?.monthly_salary || ''}
                          onChange={(event) => setScheduleDraft((current) => ({
                            ...current,
                            [account.name]: {
                              ...(current[account.name] || { days: {} }),
                              monthly_salary: Number(event.target.value) || 0
                            }
                          }))}
                          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-right text-xs font-bold text-slate-700 outline-none"
                        />
                      </label>
                    </td>
                    {scheduleWeekDates.map((date) => {
                      const status = scheduleDraft[account.name]?.days[date] || 'Working';
                      return (
                        <td key={date} className="px-2 py-3 text-center">
                          <button
                            type="button"
                            aria-label={`${account.name} ${date} ${status}`}
                            onClick={() => setScheduleDraft((current) => ({
                              ...current,
                              [account.name]: {
                                monthly_salary: current[account.name]?.monthly_salary || 0,
                                days: {
                                  ...(current[account.name]?.days || {}),
                                  [date]: status === 'Working' ? 'Off Day' : 'Working'
                                }
                              }
                            }))}
                            className={`w-full rounded-lg px-2 py-2 text-[10px] font-bold ${
                              status === 'Working'
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                            }`}
                          >
                            {status}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          { label: tr('已到员工', 'Present', 'Hadir'), value: presentCount, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
          { label: tr('迟到', 'Late', 'Lewat'), value: lateCount, icon: Clock3, tone: 'text-rose-700 bg-rose-50' },
          { label: tr('待审批', 'Pending requests', 'Permohonan menunggu'), value: pendingRequestCount, icon: FileText, tone: 'text-indigo-700 bg-indigo-50' }
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${item.tone}`}>
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      {canViewAll && !showStaffDayStatus ? (
        <section
          data-testid="staff-day-status-collapsed"
          className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="font-bold text-slate-900">{tr('员工每日考勤汇总', 'Daily attendance summary', 'Ringkasan kehadiran harian')}</h2>
            <p className="mt-1 text-xs text-slate-400">{selectedDate}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowStaffDayStatus(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
          >
            <Eye className="h-4 w-4" />
            {tr('显示员工当天状态', 'Show Staff day status', 'Tunjukkan status harian kakitangan')}
          </button>
        </section>
      ) : (
        <section data-testid="staff-day-status-section" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">{canViewAll ? tr('员工每日考勤汇总', 'Daily attendance summary', 'Ringkasan kehadiran harian') : tr('我的每日考勤汇总', 'My daily attendance summary', 'Ringkasan kehadiran harian saya')}</h2>
              <p className="mt-1 text-xs text-slate-400">{selectedDate}</p>
            </div>
            {canViewAll && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-indigo-700">
                  {tr('Super Admin 全员视图', 'Super Admin team view', 'Paparan pasukan Super Admin')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowStaffDayStatus(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  {tr('隐藏', 'Hide', 'Sembunyikan')}
                </button>
              </div>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summaries.map((summary) => (
              <article key={summary.name} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <StaffAvatar name={summary.name} avatarDataUrl={summary.avatar} className="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{summary.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{trRole(summary.role)}</p>
                    </div>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                    summary.lastEvent?.action === 'check_in'
                      ? 'bg-emerald-100 text-emerald-700'
                      : summary.events.length
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-white text-slate-400'
                  }`}>
                    {summary.lastEvent?.action === 'check_in'
                      ? tr('在岗', 'In', 'Masuk')
                      : summary.events.length
                        ? tr('已离开', 'Out', 'Keluar')
                        : tr('未打卡', 'No punch', 'Tiada rekod')}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-lg bg-white p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tr('首到', 'First in', 'Masuk pertama')}</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">{formatTime(summary.firstCheckIn?.occurred_at)}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tr('当日总工时', 'Daily total', 'Jumlah harian')}</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">{formatDuration(summary.workedMinutes)}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tr('迟到次数', 'Late count', 'Kiraan lewat')}</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">{summary.isLate ? 1 : 0}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tr('次数', 'Punches', 'Rekod')}</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">{summary.events.length}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.isOffDay && (
                    <span className="rounded-md bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
                      {tr('Off Day · 无需打卡', 'Off Day · no punch required', 'Hari Cuti · tiada rekod diperlukan')}
                    </span>
                  )}
                  {summary.hasApprovedOvertime && !summary.isOffDay && (
                    <span className="rounded-md bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-700">
                      {tr(`OT 已批准 · ${summary.effectiveStartTime} 上班`, `OT approved · ${summary.effectiveStartTime} start`, `OT diluluskan · mula ${summary.effectiveStartTime}`)}
                    </span>
                  )}
                  {summary.isLate && (
                    <span className="rounded-md bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">
                      {tr(`迟到 ${summary.lateMinutes}m`, `Late ${summary.lateMinutes}m`, `Lewat ${summary.lateMinutes}m`)}
                    </span>
                  )}
                  {summary.deductionDays > 0 && (
                    <span className="rounded-md bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
                      {tr(`扣 ${summary.deductionDays} 天`, `Deduct ${summary.deductionDays} day`, `Potong ${summary.deductionDays} hari`)}
                    </span>
                  )}
                  {summary.deductionAmount > 0 && (
                    <span className="rounded-md bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
                      {tr(`扣 ${formatMoney(summary.deductionAmount)}`, `Deduct ${formatMoney(summary.deductionAmount)}`, `Potong ${formatMoney(summary.deductionAmount)}`)}
                    </span>
                  )}
                  {!summary.isLate && summary.firstCheckIn && !summary.isOffDay && (
                    <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      {tr('正常', 'On time', 'Tepat masa')}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {canViewAll && !showMonthlyAttendance ? (
        <section
          data-testid="monthly-attendance-summary-collapsed"
          className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="font-bold text-slate-900">{tr('员工每月上班时间', 'Monthly staff attendance', 'Kehadiran bulanan kakitangan')}</h2>
            <p className="mt-1 text-xs text-slate-400">{selectedMonth}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowMonthlyAttendance(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
          >
            <Eye className="h-4 w-4" />
            {tr('显示每月员工考勤', 'Show Monthly staff attendance', 'Tunjukkan kehadiran bulanan kakitangan')}
          </button>
        </section>
      ) : (
      <section data-testid="monthly-attendance-summary" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">{canViewAll ? tr('员工每月上班时间', 'Monthly staff attendance', 'Kehadiran bulanan kakitangan') : tr('我的每月上班时间', 'My monthly attendance', 'Kehadiran bulanan saya')}</h2>
            <p className="mt-1 text-xs text-slate-400">
              {tr('汇总排班、Off Day、实际工时、30–59 分钟 / 60 分钟以上迟到次数与扣款。', 'Totals schedule, Off Days, actual hours, 30–59 minute / 60+ minute late counts, and deductions.', 'Jumlah jadual, Hari Cuti, jam sebenar, kiraan lewat 30–59 minit / 60+ minit dan potongan.')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
              <span>{tr('月份', 'Month', 'Bulan')}</span>
              <input
                aria-label="Attendance summary month"
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
              />
            </label>
            {canViewAll && (
              <button
                type="button"
                onClick={() => setShowMonthlyAttendance(false)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <EyeOff className="h-4 w-4" />
                {tr('隐藏', 'Hide', 'Sembunyikan')}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-left">
            <thead>
              <tr className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <th className="w-[32%] px-3 py-2">{tr('员工', 'Staff', 'Kakitangan')}</th>
                <th className="px-3 py-2">{tr('排班 / Off', 'Scheduled / Off', 'Jadual / Cuti')}</th>
                <th className="px-3 py-2">{tr('上班天数', 'Worked days', 'Hari bekerja')}</th>
                <th className="px-3 py-2">{tr('每月总工时', 'Monthly hours', 'Jumlah jam bulanan')}</th>
                <th className="px-3 py-2">{tr('迟到次数', 'Late count', 'Kiraan lewat')}</th>
                <th className="px-3 py-2">{tr('迟到 30–59m', 'Late 30–59m', 'Lewat 30–59m')}</th>
                <th className="px-3 py-2">{tr('迟到 60m+', 'Late 60m+', 'Lewat 60m+')}</th>
                <th className="px-3 py-2">{tr('扣款', 'Deduction', 'Potongan')}</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummaries.map((summary) => (
                <tr key={summary.name} data-testid={`monthly-attendance-${summary.name}`} className="border-t border-slate-100 text-xs text-slate-700">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <StaffAvatar name={summary.name} avatarDataUrl={summary.avatar} className="h-8 w-8" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{summary.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{trRole(summary.role)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold">{summary.scheduledWorkingDays} / {summary.offDays}</td>
                  <td className="px-3 py-3 font-bold">{summary.workedDays}</td>
                  <td className="px-3 py-3 font-bold">{formatDuration(summary.workedMinutes)}</td>
                  <td className={`px-3 py-3 font-bold ${summary.lateCount > 0 ? 'text-rose-700' : ''}`}>{summary.lateCount}</td>
                  <td className={`px-3 py-3 font-bold ${summary.late30MinuteCount > 0 ? 'text-amber-700' : ''}`}>{summary.late30MinuteCount}</td>
                  <td className={`px-3 py-3 font-bold ${summary.late60MinuteCount > 0 ? 'text-rose-700' : ''}`}>{summary.late60MinuteCount}</td>
                  <td className={`px-3 py-3 font-bold ${summary.deductionDays > 0 || summary.deductionAmount > 0 ? 'text-red-700' : ''}`}>
                    <p>{formatMoney(summary.deductionAmount)}</p>
                    {summary.deductionDays > 0 && <p className="text-[9px]">+ {summary.deductionDays} {tr('天薪水', 'salary day', 'hari gaji')}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="font-bold text-slate-900">{tr('打卡明细', 'Punch timeline', 'Garis masa rekod')}</h2>
          <p className="mt-1 text-xs text-slate-400">{tr('每一次 Check in / Check out 都保留。', 'Every check-in and checkout is retained.', 'Setiap rekod masuk / keluar disimpan.')}</p>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {selectedEvents.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center text-xs font-semibold text-slate-400">
                {tr('这一天没有打卡记录。', 'No punches on this date.', 'Tiada rekod pada tarikh ini.')}
              </div>
            ) : selectedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  event.action === 'check_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {event.action === 'check_in' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-slate-800">{event.staff_name}</p>
                    <ArrowRight className="h-3 w-3 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">
                      {event.action === 'check_in' ? 'Check in' : 'Check out'}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400">{event.note || tr('无备注', 'No note', 'Tiada nota')}</p>
                </div>
                <time className="shrink-0 text-xs font-bold text-slate-700">{formatTime(event.occurred_at)}</time>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleLeaveSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="font-bold text-slate-900">{tr('申请 Leave / MC / OT', 'Request Leave / MC / OT', 'Mohon Cuti / MC / OT')}</h2>
          <p className="mt-1 text-xs text-slate-400">{tr('OT 必须先由 Super Admin 批准，批准后次日上班时间为 12:00。', 'OT requires Super Admin approval; an approved OT moves the next-day start to 12:00.', 'OT memerlukan kelulusan Super Admin; OT diluluskan mengubah mula hari berikutnya kepada 12:00.')}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-1">
            {(['Leave', 'MC', 'OT'] as LeaveKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setLeaveKind(kind);
                  setLeaveError('');
                  if (kind !== 'MC') setMcAttachment(undefined);
                }}
                className={`rounded-lg px-4 py-2.5 text-xs font-bold transition-colors ${
                  leaveKind === kind ? 'bg-red-800 text-white shadow-sm' : 'text-slate-500 hover:bg-white'
                }`}
              >
                {kind === 'Leave'
                  ? tr('Leave 请假', 'Leave', 'Cuti')
                  : kind === 'MC'
                    ? tr('MC 病假', 'MC / Sick leave', 'MC / Cuti sakit')
                    : tr('OT 加班', 'OT', 'OT')}
              </button>
            ))}
          </div>
          {leaveKind === 'OT' ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {tr('OT 日期', 'OT date', 'Tarikh OT')}
                <input
                  type="date"
                  required
                  value={leaveStartDate}
                  onChange={(event) => setLeaveStartDate(event.target.value)}
                  className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {tr('预计 OT 结束时间', 'Expected OT end', 'Jangkaan tamat OT')}
                <input
                  type="time"
                  required
                  value={overtimeEndTime}
                  onChange={(event) => setOvertimeEndTime(event.target.value)}
                  className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
          ) : (
          <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tr('开始日期', 'Start date', 'Tarikh mula')}
              <input
                type="date"
                required
                value={leaveStartDate}
                onChange={(event) => {
                  setLeaveStartDate(event.target.value);
                  if (leaveEndDate < event.target.value) setLeaveEndDate(event.target.value);
                  setLeaveDuration(String(inclusiveDays(event.target.value, leaveEndDate < event.target.value ? event.target.value : leaveEndDate)));
                }}
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tr('结束日期', 'End date', 'Tarikh tamat')}
              <input
                type="date"
                required
                min={leaveStartDate}
                value={leaveEndDate}
                onChange={(event) => {
                  setLeaveEndDate(event.target.value);
                  setLeaveDuration(String(inclusiveDays(leaveStartDate, event.target.value)));
                }}
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
              />
            </label>
          </div>
          <label className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {tr('天数（可输入 0.5）', 'Days (0.5 allowed)', 'Hari (0.5 dibenarkan)')}
            <input
              type="number"
              min="0.5"
              max="365"
              step="0.5"
              required
              value={leaveDuration}
              onChange={(event) => setLeaveDuration(event.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:ring-2 focus:ring-red-100"
            />
          </label>
          </>
          )}
          <label className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {tr('原因', 'Reason', 'Sebab')}
            <textarea
              required
              value={leaveReason}
              onChange={(event) => setLeaveReason(event.target.value.slice(0, 3000))}
              placeholder={leaveKind === 'OT'
                ? tr('说明加班工作与原因...', 'Explain the overtime work and reason...', 'Terangkan kerja lebih masa dan sebab...')
                : tr('说明请假或病假原因...', 'Explain the leave or MC request...', 'Terangkan sebab cuti atau MC...')}
              className="mt-2 min-h-24 w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-red-100"
            />
          </label>
          {leaveKind === 'MC' && (
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-xs font-bold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40">
              <UploadCloud className="h-5 w-5 text-indigo-600" />
              <span className="min-w-0 flex-1 truncate">
                {mcAttachment?.name || tr('上传 MC（PDF / 图片，小于 400KB）', 'Upload MC (PDF / image, under 400KB)', 'Muat naik MC (PDF / imej, bawah 400KB)')}
              </span>
              <input
                type="file"
                accept={ATTACHMENT_ACCEPT_ATTRIBUTE}
                className="sr-only"
                onChange={(event) => handleMcFile(event.target.files?.[0])}
              />
            </label>
          )}
          {leaveError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{leaveError}</p>}
          <button
            type="submit"
            disabled={isSubmittingLeave}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-800 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-red-900 disabled:cursor-wait disabled:bg-slate-300"
          >
            <CalendarCheck2 className="h-4 w-4" />
            {isSubmittingLeave ? tr('提交中...', 'Submitting...', 'Menghantar...') : tr('提交审批申请', 'Submit for approval', 'Hantar untuk kelulusan')}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">{canViewAll ? tr('Leave / MC / OT 审批', 'Leave / MC / OT approvals', 'Kelulusan Cuti / MC / OT') : tr('我的申请', 'My requests', 'Permohonan saya')}</h2>
            <p className="mt-1 text-xs text-slate-400">{tr('申请记录与审批结果会保留。', 'Requests and decisions are retained.', 'Permohonan dan keputusan disimpan.')}</p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">{visibleRequests.length}</span>
        </div>
        <div className="mt-4 space-y-3">
          {visibleRequests.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-10 text-center text-xs font-semibold text-slate-400">
              {tr('还没有 Leave / MC / OT 申请。', 'No Leave / MC / OT requests yet.', 'Belum ada permohonan Cuti / MC / OT.')}
            </div>
          ) : visibleRequests.map((request) => {
            const meta = parseLeaveMeta(request);
            const canDecide = canViewAll && request.requester_name !== currentStaffName && request.status === 'Pending';
            const canCancel = request.requester_name === currentStaffName && request.status === 'Pending';

            return (
              <article key={request.id} data-testid={`leave-request-${request.id}`} className="rounded-xl bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      meta.kind === 'MC'
                        ? 'bg-rose-100 text-rose-700'
                        : meta.kind === 'OT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {meta.kind === 'MC'
                        ? <Paperclip className="h-4 w-4" />
                        : meta.kind === 'OT'
                          ? <Clock3 className="h-4 w-4" />
                          : <CalendarCheck2 className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{request.requester_name}</p>
                        <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-600">{meta.kind}</span>
                        <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${STATUS_STYLE[request.status]}`}>{statusLabel(request.status)}</span>
                      </div>
                      {meta.kind === 'OT' ? (
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {meta.overtime_date || meta.start_date} · {tr('预计结束', 'Expected end', 'Jangkaan tamat')} {meta.overtime_end_time || '--'} · {request.amount} {tr('小时', 'hour(s)', 'jam')}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {meta.start_date} <ArrowRight className="mx-1 inline h-3 w-3" /> {meta.end_date} · {request.amount} {tr('天', 'day(s)', 'hari')}
                        </p>
                      )}
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">{request.reason}</p>
                      <p className="mt-2 text-[10px] text-slate-400">{tr('提交于', 'Submitted', 'Dihantar')} {formatDateTime(request.submitted_at)}</p>
                      {request.mc_attachment && (
                        <SafeAttachmentLink
                          attachment={request.mc_attachment}
                          className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 hover:text-indigo-900"
                          unsafeClassName="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 line-through"
                        >
                          <Paperclip className="h-3 w-3" />
                          {request.mc_attachment.name}
                        </SafeAttachmentLink>
                      )}
                      {request.reviewed_by && (
                        <p className="mt-2 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-slate-500">
                          {request.reviewed_by}: {request.review_note || statusLabel(request.status)}
                        </p>
                      )}
                    </div>
                  </div>
                  {(canDecide || canCancel) && (
                    <div className="w-full shrink-0 space-y-2 lg:w-72">
                      <div
                        data-testid={`leave-next-step-${request.id}`}
                        className={`rounded-xl border p-3 ${canDecide ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${canDecide ? 'bg-amber-500' : 'bg-slate-400'}`}>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className={`text-[9px] font-bold uppercase tracking-[0.16em] ${canDecide ? 'text-amber-700' : 'text-slate-500'}`}>{tr('下一步', 'Next step', 'Langkah seterusnya')}</p>
                            <p className="mt-0.5 text-xs font-bold text-slate-900">
                              {canDecide
                                ? tr('审核申请', 'Review request', 'Semak permintaan')
                                : tr('等待审批', 'Wait for approval', 'Tunggu kelulusan')}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">
                              {canDecide
                                ? tr('核对日期、时长与原因，然后选择批准或拒绝。', 'Check the dates, duration, and reason, then approve or reject it.', 'Semak tarikh, tempoh dan sebab, kemudian luluskan atau tolak.')
                                : tr('现在无需处理；如果不再需要这份申请，可以取消。', 'No action is needed now; cancel only if this request is no longer needed.', 'Tiada tindakan diperlukan sekarang; batalkan hanya jika permintaan ini tidak lagi diperlukan.')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <input
                        value={reviewNotes[request.id] || ''}
                        onChange={(event) => setReviewNotes((current) => ({ ...current, [request.id]: event.target.value.slice(0, 2000) }))}
                        placeholder={canDecide ? tr('审批备注（选填）', 'Review note (optional)', 'Nota semakan (pilihan)') : tr('取消备注（选填）', 'Cancellation note (optional)', 'Nota pembatalan (pilihan)')}
                        className="w-full rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-red-100"
                      />
                      {canDecide ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={reviewingId === request.id}
                            onClick={() => reviewRequest(request.id, 'Approved')}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {tr('批准', 'Approve', 'Lulus')}
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === request.id}
                            onClick={() => reviewRequest(request.id, 'Rejected')}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:bg-slate-300"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            {tr('拒绝', 'Reject', 'Tolak')}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={reviewingId === request.id}
                          onClick={() => reviewRequest(request.id, 'Cancelled')}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-300 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {tr('取消申请', 'Cancel request', 'Batal permohonan')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
