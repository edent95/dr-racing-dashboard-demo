import type { AttendanceEvent } from '../services/dashboardRepository';
import {
  normalizeAttendancePolicy,
  type ApprovalRequest,
  type AttendancePolicy,
  type AttendanceWeeklySchedule,
  type RoleAccount,
  type RoleAccountRole
} from '../types';

const MALAYSIA_TIME_ZONE = 'Asia/Kuala_Lumpur';

export type DailyAttendanceSummary = {
  name: string;
  role: RoleAccountRole;
  avatar?: string;
  events: AttendanceEvent[];
  firstCheckIn?: AttendanceEvent;
  lastEvent?: AttendanceEvent;
  isLate: boolean;
  lateMinutes: number;
  effectiveStartTime: string;
  isOffDay: boolean;
  hasApprovedOvertime: boolean;
  workedMinutes: number;
  deductionDays: number;
  deductionAmount: number;
};

export type MonthlyAttendanceSummary = {
  name: string;
  role: RoleAccountRole;
  avatar?: string;
  workedDays: number;
  workedMinutes: number;
  lateCount: number;
  late30MinuteCount: number;
  late60MinuteCount: number;
  deductionDays: number;
  deductionAmount: number;
  scheduledWorkingDays: number;
  offDays: number;
};

export type MonthlyAttendanceExportRow = {
  month: string;
  staff_name: string;
  staff_role: RoleAccountRole;
  worked_days: number;
  worked_minutes: number;
  worked_time: string;
  late_count: number;
  late_30_minute_count: number;
  late_60_minute_count: number;
  deduction_days: number;
  deduction_amount: number;
  scheduled_working_days: number;
  off_days: number;
};

export type MissingCheckoutIncident = {
  id: string;
  staffName: string;
  staffRole: string;
  attendanceDate: string;
  lastCheckInAt: string;
};

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

function shiftMalaysiaDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + days);
  return malaysiaDateKey(date);
}

function getScheduleForDate(
  schedules: AttendanceWeeklySchedule[],
  staffName: string,
  dateKey: string
) {
  const schedule = schedules.find((item) => (
    item.staff_name === staffName
    && item.days.some((day) => day.date === dateKey)
  ));
  const day = schedule?.days.find((item) => item.date === dateKey);
  return { schedule, day };
}

function hasApprovedOvertimeForDate(
  requests: ApprovalRequest[],
  staffName: string,
  dateKey: string
) {
  return requests.some((request) => {
    if (
      request.requester_name !== staffName
      || request.status !== 'Approved'
      || request.type !== 'staff_sick_leave'
    ) {
      return false;
    }

    try {
      const meta = JSON.parse(request.notes) as {
        source?: string;
        kind?: string;
        overtime_date?: string;
      };
      return meta.source === 'attendance'
        && meta.kind === 'OT'
        && meta.overtime_date === dateKey;
    } catch {
      return false;
    }
  });
}

export function buildMissingCheckoutIncidents(
  events: AttendanceEvent[],
  currentDate: Date = new Date()
): MissingCheckoutIncident[] {
  const currentDateKey = malaysiaDateKey(currentDate);
  const eventsByStaffAndDate = new Map<string, AttendanceEvent[]>();

  events.forEach((event) => {
    const attendanceDate = malaysiaDateKey(event.occurred_at);
    if (!attendanceDate || attendanceDate >= currentDateKey) return;

    const key = `${event.staff_name}\u0000${attendanceDate}`;
    eventsByStaffAndDate.set(key, [...(eventsByStaffAndDate.get(key) || []), event]);
  });

  const incidents = [...eventsByStaffAndDate.entries()]
    .flatMap(([key, dayEvents]) => {
      const lastEvent = [...dayEvents]
        .sort((left, right) => left.occurred_at.localeCompare(right.occurred_at))
        .at(-1);
      if (!lastEvent || lastEvent.action !== 'check_in') return [];

      const [staffName, attendanceDate] = key.split('\u0000');
      return [{
        id: `attendance-missing-checkout-${encodeURIComponent(staffName)}-${attendanceDate}`,
        staffName,
        staffRole: lastEvent.staff_role,
        attendanceDate,
        lastCheckInAt: lastEvent.occurred_at
      }];
    });
  const latestIncidentByStaff = new Map<string, MissingCheckoutIncident>();
  incidents.forEach((incident) => {
    const current = latestIncidentByStaff.get(incident.staffName);
    if (
      !current ||
      incident.attendanceDate > current.attendanceDate ||
      (
        incident.attendanceDate === current.attendanceDate &&
        incident.lastCheckInAt > current.lastCheckInAt
      )
    ) {
      latestIncidentByStaff.set(incident.staffName, incident);
    }
  });

  return [...latestIncidentByStaff.values()]
    .sort((left, right) => (
      right.attendanceDate.localeCompare(left.attendanceDate) ||
      left.staffName.localeCompare(right.staffName)
    ));
}

function malaysiaMinutes(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: MALAYSIA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  return hour * 60 + minute;
}

function clockTimeToMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return (Number.isFinite(hour) ? hour : 0) * 60 + (Number.isFinite(minute) ? minute : 0);
}

export function formatAttendanceDuration(minutes: number) {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

export function buildDailyAttendanceSummary(
  name: string,
  role: RoleAccountRole,
  avatar: string | undefined,
  events: AttendanceEvent[],
  selectedDate: string,
  attendancePolicy: AttendancePolicy,
  schedules: AttendanceWeeklySchedule[] = [],
  requests: ApprovalRequest[] = []
): DailyAttendanceSummary {
  const normalizedPolicy = normalizeAttendancePolicy(attendancePolicy);
  const { schedule, day } = getScheduleForDate(schedules, name, selectedDate);
  const isOffDay = day?.status === 'Off Day';
  const hasApprovedOvertime = hasApprovedOvertimeForDate(
    requests,
    name,
    shiftMalaysiaDateKey(selectedDate, -1)
  );
  const effectiveStartTime = hasApprovedOvertime
    ? normalizedPolicy.overtime_next_day_start_time
    : normalizedPolicy.work_start_time;
  const dayEvents = events
    .filter((event) => event.staff_name === name && malaysiaDateKey(event.occurred_at) === selectedDate)
    .sort((left, right) => left.occurred_at.localeCompare(right.occurred_at));
  const firstCheckIn = dayEvents.find((event) => event.action === 'check_in');
  const lateMinutes = firstCheckIn
    ? Math.max(0, malaysiaMinutes(firstCheckIn.occurred_at) - clockTimeToMinutes(effectiveStartTime))
    : 0;
  const isLate = !isOffDay
    && lateMinutes > 0
    && lateMinutes >= normalizedPolicy.late_grace_minutes;
  const appliedPenalty = isLate
    ? normalizedPolicy.late_penalty_rules
      .filter((rule) => lateMinutes >= rule.threshold_minutes)
      .at(-1)
    : undefined;
  const deductionDays = appliedPenalty?.penalty_type === 'salary_days'
    ? appliedPenalty.amount
    : 0;
  const deductionAmount = appliedPenalty?.penalty_type === 'fixed_amount'
    ? appliedPenalty.amount
    : appliedPenalty
      ? Math.round(((schedule?.monthly_salary || 0) / 26) * appliedPenalty.amount * 100) / 100
      : 0;
  let workedMinutes = 0;
  let openCheckIn: AttendanceEvent | undefined;

  dayEvents.forEach((event) => {
    if (event.action === 'check_in') {
      openCheckIn = event;
      return;
    }

    if (openCheckIn) {
      workedMinutes += Math.max(0, Math.round(
        (new Date(event.occurred_at).getTime() - new Date(openCheckIn.occurred_at).getTime()) / 60000
      ));
      openCheckIn = undefined;
    }
  });

  if (openCheckIn && selectedDate === malaysiaDateKey(new Date())) {
    workedMinutes += Math.max(0, Math.round(
      (Date.now() - new Date(openCheckIn.occurred_at).getTime()) / 60000
    ));
  }

  return {
    name,
    role,
    avatar,
    events: dayEvents,
    firstCheckIn,
    lastEvent: dayEvents.at(-1),
    isLate,
    lateMinutes,
    effectiveStartTime,
    isOffDay,
    hasApprovedOvertime,
    workedMinutes,
    deductionDays,
    deductionAmount
  };
}

export function buildMonthlyAttendanceSummary(
  account: Pick<RoleAccount, 'name' | 'role' | 'avatar_data_url'>,
  events: AttendanceEvent[],
  selectedMonth: string,
  attendancePolicy: AttendancePolicy,
  schedules: AttendanceWeeklySchedule[] = [],
  requests: ApprovalRequest[] = []
): MonthlyAttendanceSummary {
  const dateKeys = [...new Set([
    ...events
      .filter((event) => event.staff_name === account.name)
      .map((event) => malaysiaDateKey(event.occurred_at)),
    ...schedules
      .filter((schedule) => schedule.staff_name === account.name)
      .flatMap((schedule) => schedule.days.map((day) => day.date))
  ].filter((dateKey) => dateKey.startsWith(`${selectedMonth}-`)))]
    .sort();
  const dailySummaries = dateKeys.map((dateKey) => buildDailyAttendanceSummary(
    account.name,
    account.role,
    account.avatar_data_url,
    events,
    dateKey,
    attendancePolicy,
    schedules,
    requests
  ));

  return {
    name: account.name,
    role: account.role,
    avatar: account.avatar_data_url,
    workedDays: dailySummaries.filter((summary) => Boolean(summary.firstCheckIn)).length,
    workedMinutes: dailySummaries.reduce((total, summary) => total + summary.workedMinutes, 0),
    lateCount: dailySummaries.filter((summary) => summary.isLate).length,
    late30MinuteCount: dailySummaries.filter((summary) => (
      summary.isLate && summary.lateMinutes >= 30 && summary.lateMinutes < 60
    )).length,
    late60MinuteCount: dailySummaries.filter((summary) => (
      summary.isLate && summary.lateMinutes >= 60
    )).length,
    deductionDays: dailySummaries.reduce((total, summary) => total + summary.deductionDays, 0),
    deductionAmount: Math.round(dailySummaries.reduce((total, summary) => total + summary.deductionAmount, 0) * 100) / 100,
    scheduledWorkingDays: dailySummaries.filter((summary) => !summary.isOffDay).length,
    offDays: dailySummaries.filter((summary) => summary.isOffDay).length
  };
}

export function buildMonthlyAttendanceExportRows(
  accounts: RoleAccount[],
  events: AttendanceEvent[],
  attendancePolicy: AttendancePolicy,
  schedules: AttendanceWeeklySchedule[] = [],
  requests: ApprovalRequest[] = [],
  currentDate: Date = new Date()
): MonthlyAttendanceExportRow[] {
  const months = [...new Set([
    malaysiaDateKey(currentDate).slice(0, 7),
    ...events.map((event) => malaysiaDateKey(event.occurred_at).slice(0, 7))
  ].filter((month) => /^\d{4}-\d{2}$/.test(month)))].sort();
  const exportAccounts = new Map(
    accounts
      .filter((account) => account.status === 'Active')
      .map((account) => [account.name, account])
  );
  events.forEach((event) => {
    if (exportAccounts.has(event.staff_name)) return;
    exportAccounts.set(event.staff_name, {
      id: `ATTENDANCE-STAFF-${event.staff_name}`,
      name: event.staff_name,
      email: '',
      role: event.staff_role === 'Super Admin' || event.staff_role === 'Operations Manager' || event.staff_role === 'Admin'
        ? event.staff_role
        : 'Sales',
      status: 'Active'
    });
  });
  const activeAccounts = [...exportAccounts.values()]
    .sort((left, right) => left.name.localeCompare(right.name));

  return months.flatMap((month) => activeAccounts.map((account) => {
    const summary = buildMonthlyAttendanceSummary(account, events, month, attendancePolicy, schedules, requests);
    return {
      month,
      staff_name: summary.name,
      staff_role: summary.role,
      worked_days: summary.workedDays,
      worked_minutes: summary.workedMinutes,
      worked_time: formatAttendanceDuration(summary.workedMinutes),
      late_count: summary.lateCount,
      late_30_minute_count: summary.late30MinuteCount,
      late_60_minute_count: summary.late60MinuteCount,
      deduction_days: summary.deductionDays,
      deduction_amount: summary.deductionAmount,
      scheduled_working_days: summary.scheduledWorkingDays,
      off_days: summary.offDays
    };
  }));
}
