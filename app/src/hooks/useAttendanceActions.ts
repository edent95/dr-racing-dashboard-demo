/**
 * Attendance & Leave actions: check in / out, missing check-out resolution,
 * weekly schedules, and Leave / MC / OT submit and review. Moved verbatim
 * from App.tsx; every value the handlers used from App's closure, including
 * the Firestore save functions, is now an explicit dependency under its
 * original name. The attendance state and its Firestore subscriptions stay
 * in App for now.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type { Dispatch, SetStateAction } from 'react';
import { tr } from '../lib/i18n';
import type {
  AttendanceEvent,
  AttendanceIncidentResolution,
  AttendanceNetworkCheck,
  DashboardState
} from '../services/dashboardRepository';
import {
  ApprovalRequest,
  ApprovalRequestStatus,
  AttendancePolicy,
  AttendanceWeeklySchedule,
  AuditLogEntry,
  getAttendanceTeamIdForAccount,
  normalizeAttendanceNetworkIp,
  resolveAttendancePolicyForAccount,
  RoleAccount
} from '../types';
import type { MissingCheckoutIncident } from '../utils/attendanceSummary';
import { newId } from '../utils/id';
import { isOperationsLead } from '../utils/staffRoles';
import type { StaffSession } from './useStaffSessionAuth';

export interface AttendanceAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface AttendanceActionsDeps {
  currentStaff: StaffSession;
  roleAccounts: RoleAccount[];
  attendancePolicy: AttendancePolicy;
  attendanceEvents: AttendanceEvent[];
  attendanceSchedules: AttendanceWeeklySchedule[];
  staffLeaveRequests: ApprovalRequest[];
  isFirebaseConfigured: boolean;
  setAttendanceEvents: Dispatch<SetStateAction<AttendanceEvent[]>>;
  setAttendanceIncidentResolutions: Dispatch<SetStateAction<AttendanceIncidentResolution[]>>;
  setAttendanceSchedules: Dispatch<SetStateAction<AttendanceWeeklySchedule[]>>;
  setStaffLeaveRequests: Dispatch<SetStateAction<ApprovalRequest[]>>;
  setAttendanceNetworkCheck: (check: AttendanceNetworkCheck | null) => void;
  setClientContext: (context: { ip_address: string; user_agent: string }) => void;
  fetchAttendanceNetworkCheck: () => Promise<AttendanceNetworkCheck | null>;
  saveAttendanceEventToFirebase: (event: AttendanceEvent) => Promise<unknown>;
  saveAttendanceIncidentResolutionToFirebase: (resolution: AttendanceIncidentResolution) => Promise<unknown>;
  saveAttendanceWeeklyScheduleToFirebase: (schedule: AttendanceWeeklySchedule) => Promise<unknown>;
  saveStaffLeaveRequestToFirebase: (request: ApprovalRequest) => Promise<unknown>;
  appendAuditLog: (input: AttendanceAuditInput) => void;
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
}

export function useAttendanceActions({
  currentStaff,
  roleAccounts,
  attendancePolicy,
  attendanceEvents,
  attendanceSchedules,
  staffLeaveRequests,
  isFirebaseConfigured,
  setAttendanceEvents,
  setAttendanceIncidentResolutions,
  setAttendanceSchedules,
  setStaffLeaveRequests,
  setAttendanceNetworkCheck,
  setClientContext,
  fetchAttendanceNetworkCheck,
  saveAttendanceEventToFirebase,
  saveAttendanceIncidentResolutionToFirebase,
  saveAttendanceWeeklyScheduleToFirebase,
  saveStaffLeaveRequestToFirebase,
  appendAuditLog,
  triggerToast
}: AttendanceActionsDeps) {
  const attendanceTeamIdForStaffName = (staffName: string) => getAttendanceTeamIdForAccount(
    attendancePolicy,
    roleAccounts.find((account) => account.name === staffName)?.id
  );

  const handleRecordAttendance = async (action: AttendanceEvent['action'], note: string) => {
    const todayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    const latestTodayEvent = attendanceEvents
      .filter((event) => event.staff_name === currentStaff.name && (
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kuala_Lumpur',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(event.occurred_at)) === todayKey
      ))
      .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))[0];
    const expectedAction: AttendanceEvent['action'] = latestTodayEvent?.action === 'check_in'
      ? 'check_out'
      : 'check_in';
    const scheduledDay = attendanceSchedules
      .find((schedule) => (
        schedule.staff_name === currentStaff.name
        && schedule.days.some((day) => day.date === todayKey)
      ))
      ?.days.find((day) => day.date === todayKey);

    if (action !== expectedAction) {
      triggerToast(
        tr(
          '打卡状态已经改变，请重新操作。',
          'Punch status changed. Try again.',
          'Status rekod telah berubah. Cuba lagi.'
        ),
        'error'
      );
      return false;
    }

    if (action === 'check_in' && scheduledDay?.status === 'Off Day') {
      triggerToast(
        tr(
          '今天排班是 Off Day，不需要 Check in。',
          'Today is an Off Day. No check-in is required.',
          'Hari ini ialah Hari Cuti. Daftar masuk tidak diperlukan.'
        ),
        'error'
      );
      return false;
    }

    const staffAttendancePolicy = resolveAttendancePolicyForAccount(
      attendancePolicy,
      roleAccounts.find((account) => account.name === currentStaff.name)?.id
    );

    let officeNetworkAllowed = true;
    if (action === 'check_in' && isFirebaseConfigured) {
      const networkCheck = await fetchAttendanceNetworkCheck();
      setAttendanceNetworkCheck(networkCheck);
      // Rules accept a check-in only after the server's network check left a
      // permit, so without a server answer the punch cannot be saved.
      if (!networkCheck) {
        triggerToast(
          tr(
            '暂时无法核对打卡网络，请稍后再 Check in。',
            'The check-in network could not be verified. Try again shortly.',
            'Rangkaian daftar masuk tidak dapat disahkan. Cuba lagi sebentar.'
          ),
          'error'
        );
        return false;
      }
      officeNetworkAllowed = networkCheck.allowed;
    } else if (action === 'check_in' && staffAttendancePolicy.require_office_wifi_for_check_in) {
      let currentNetworkIp = '';
      try {
        const response = await fetch('/api/client-context', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Client context unavailable');
        }
        const context = await response.json() as { ip_address?: string; user_agent?: string };
        currentNetworkIp = normalizeAttendanceNetworkIp(context.ip_address);
        setClientContext({
          ip_address: context.ip_address || 'Unavailable',
          user_agent: context.user_agent || navigator.userAgent || ''
        });
      } catch {
        currentNetworkIp = '';
      }
      officeNetworkAllowed = Boolean(currentNetworkIp)
        && staffAttendancePolicy.office_network_ips.includes(currentNetworkIp);
    }

    if (!officeNetworkAllowed) {
      triggerToast(
        tr(
          '请连接办公室 Wi-Fi 后再 Check in。',
          'Connect to office Wi-Fi before checking in.',
          'Sambung ke Wi-Fi pejabat sebelum daftar masuk.'
        ),
        'error'
      );
      return false;
    }

    const now = new Date().toISOString();
    const event: AttendanceEvent = {
      id: newId('ATTENDANCE'),
      staff_name: currentStaff.name,
      staff_role: currentStaff.role,
      action,
      occurred_at: now,
      note: note.slice(0, 500),
      created_at: now,
      team_id: attendanceTeamIdForStaffName(currentStaff.name)
    };

    try {
      await saveAttendanceEventToFirebase(event);
      setAttendanceEvents((current) => [event, ...current]);
      appendAuditLog({
        action: action === 'check_in' ? 'ATTENDANCE_CHECK_IN' : 'ATTENDANCE_CHECK_OUT',
        target_type: 'Attendance',
        target_id: event.id,
        target_label: currentStaff.name,
        changes: [
          { field: 'action', old_value: '', new_value: action },
          { field: 'occurred_at', old_value: '', new_value: now },
          { field: 'note', old_value: '', new_value: event.note }
        ]
      });
      triggerToast(
        action === 'check_in'
          ? tr('Check in 已记录。', 'Check-in recorded.', 'Daftar masuk direkodkan.')
          : tr('Check out 已记录。', 'Checkout recorded.', 'Daftar keluar direkodkan.')
      );
      return true;
    } catch (error) {
      console.error('Attendance event save failed.', error);
      triggerToast(
        tr(
          '打卡无法保存，请检查网络后再试。',
          'Punch could not be saved. Check the connection and try again.',
          'Rekod tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleResolveMissingCheckout = async (incident: MissingCheckoutIncident) => {
    if (!['Super Admin', 'Admin'].includes(currentStaff.role)) {
      return false;
    }

    const now = new Date().toISOString();
    const resolution: AttendanceIncidentResolution = {
      id: incident.id,
      staff_name: incident.staffName,
      attendance_date: incident.attendanceDate,
      last_check_in_at: incident.lastCheckInAt,
      resolved_by: currentStaff.name,
      resolved_role: currentStaff.role,
      resolved_at: now,
      team_id: attendanceTeamIdForStaffName(incident.staffName)
    };

    try {
      await saveAttendanceIncidentResolutionToFirebase(resolution);
      setAttendanceIncidentResolutions((current) => [
        resolution,
        ...current.filter((item) => item.id !== resolution.id)
      ]);
      appendAuditLog({
        action: 'ATTENDANCE_MISSING_CHECKOUT_RESOLVED',
        target_type: 'Attendance',
        target_id: incident.id,
        target_label: incident.staffName,
        changes: [
          { field: 'resolution', old_value: 'Open', new_value: 'Checked with staff' },
          { field: 'attendance_date', old_value: '', new_value: incident.attendanceDate },
          { field: 'last_check_in_at', old_value: '', new_value: incident.lastCheckInAt },
          { field: 'resolved_by', old_value: '', new_value: currentStaff.name }
        ]
      });
      triggerToast(tr(
        '漏打下班卡提醒已为所有管理员关闭。',
        'Missing check-out reminder closed for all managers.',
        'Peringatan tiada daftar keluar ditutup untuk semua pengurus.'
      ));
      return true;
    } catch (error) {
      console.error('Missing check-out resolution save failed.', error);
      triggerToast(tr(
        '无法关闭漏打下班卡提醒，请检查网络后再试。',
        'Missing check-out reminder could not be closed. Check the connection and try again.',
        'Peringatan tiada daftar keluar tidak dapat ditutup. Semak sambungan dan cuba lagi.'
      ), 'error');
      return false;
    }
  };

  const handleSaveAttendanceSchedules = async (draftSchedules: AttendanceWeeklySchedule[]) => {
    const schedules = draftSchedules.map((schedule) => ({
      ...schedule,
      team_id: attendanceTeamIdForStaffName(schedule.staff_name)
    }));
    if (!['Super Admin', 'Admin'].includes(currentStaff.role) || schedules.length === 0) {
      triggerToast(tr('你没有权限保存员工排班。', 'You cannot save staff schedules.', 'Anda tidak boleh menyimpan jadual kakitangan.'), 'error');
      return false;
    }

    try {
      await Promise.all(schedules.map(saveAttendanceWeeklyScheduleToFirebase));
      const savedIds = new Set(schedules.map((schedule) => schedule.id));
      setAttendanceSchedules((current) => [
        ...schedules,
        ...current.filter((schedule) => !savedIds.has(schedule.id))
      ].sort((left, right) => (
        right.week_start.localeCompare(left.week_start)
        || left.staff_name.localeCompare(right.staff_name)
      )));
      appendAuditLog({
        action: 'UPDATE_ATTENDANCE_SCHEDULE',
        target_type: 'Attendance Schedule',
        target_id: schedules[0].week_start,
        target_label: `${schedules[0].week_start} · ${schedules.length} staff`,
        changes: [{
          field: 'weekly_schedule',
          old_value: '',
          new_value: schedules.map((schedule) => (
            `${schedule.staff_name}:${schedule.days.map((day) => day.status === 'Working' ? 'W' : 'O').join('')}`
          )).join('|')
        }]
      });
      triggerToast(tr('每周员工排班已保存。', 'Weekly staff schedule saved.', 'Jadual mingguan kakitangan disimpan.'));
      return true;
    } catch (error) {
      console.error('Attendance schedule save failed.', error);
      triggerToast(
        tr(
          '排班无法保存，请检查网络后再试。',
          'Schedule could not be saved. Check the connection and try again.',
          'Jadual tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleSubmitStaffLeaveRequest = async (
    draft: Omit<ApprovalRequest, 'id' | 'status' | 'requester_name' | 'requester_role' | 'submitted_at'>
  ) => {
    const request: ApprovalRequest = {
      ...draft,
      id: newId('STAFF-LEAVE'),
      status: 'Pending',
      requester_name: currentStaff.name,
      requester_role: currentStaff.role,
      submitted_at: new Date().toISOString(),
      team_id: attendanceTeamIdForStaffName(currentStaff.name)
    };

    try {
      await saveStaffLeaveRequestToFirebase(request);
      setStaffLeaveRequests((current) => [request, ...current]);
      appendAuditLog({
        action: 'SUBMIT_STAFF_LEAVE_REQUEST',
        target_type: 'Staff Leave',
        target_id: request.id,
        target_label: request.requester_name,
        changes: [
          { field: 'status', old_value: '', new_value: 'Pending' },
          { field: 'amount', old_value: '', new_value: String(request.amount) },
          { field: 'reason', old_value: '', new_value: request.reason }
        ]
      });
      triggerToast(tr('Leave / MC / OT 申请已提交。', 'Leave / MC / OT request submitted.', 'Permohonan Cuti / MC / OT dihantar.'));
      return true;
    } catch (error) {
      console.error('Staff leave request save failed.', error);
      triggerToast(
        tr(
          '申请无法保存，请检查网络后再试。',
          'Request could not be saved. Check the connection and try again.',
          'Permohonan tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  const handleReviewStaffLeaveRequest = async (
    requestId: string,
    status: ApprovalRequestStatus,
    reviewNote: string
  ) => {
    const request = staffLeaveRequests.find((item) => item.id === requestId);
    if (!request || request.status !== 'Pending') {
      triggerToast(tr('这份申请已经处理。', 'This request has already been processed.', 'Permohonan ini telah diproses.'), 'error');
      return false;
    }

    const isOwnCancellation = request.requester_name === currentStaff.name && status === 'Cancelled';
    const isManagerDecision = (
      isOperationsLead(currentStaff.role)
      && request.requester_name !== currentStaff.name
      && (status === 'Approved' || status === 'Rejected')
    );
    if (!isOwnCancellation && !isManagerDecision) {
      triggerToast(tr('你没有权限处理这份申请。', 'You cannot process this request.', 'Anda tidak boleh memproses permohonan ini.'), 'error');
      return false;
    }

    const updatedRequest: ApprovalRequest = {
      ...request,
      status,
      reviewed_by: currentStaff.name,
      reviewed_role: currentStaff.role,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote.slice(0, 2000)
    };

    try {
      await saveStaffLeaveRequestToFirebase(updatedRequest);
      setStaffLeaveRequests((current) => current.map((item) => item.id === requestId ? updatedRequest : item));
      appendAuditLog({
        action: status === 'Cancelled' ? 'CANCEL_STAFF_LEAVE_REQUEST' : 'REVIEW_STAFF_LEAVE_REQUEST',
        target_type: 'Staff Leave',
        target_id: request.id,
        target_label: request.requester_name,
        changes: [
          { field: 'status', old_value: request.status, new_value: status },
          { field: 'review_note', old_value: '', new_value: updatedRequest.review_note || '' }
        ]
      });
      triggerToast(tr('申请状态已更新。', 'Request status updated.', 'Status permohonan dikemas kini.'));
      return true;
    } catch (error) {
      console.error('Staff leave review save failed.', error);
      triggerToast(
        tr(
          '审批无法保存，请检查网络后再试。',
          'Decision could not be saved. Check the connection and try again.',
          'Keputusan tidak dapat disimpan. Semak sambungan dan cuba lagi.'
        ),
        'error'
      );
      return false;
    }
  };

  return {
    handleRecordAttendance,
    handleResolveMissingCheckout,
    handleSaveAttendanceSchedules,
    handleSubmitStaffLeaveRequest,
    handleReviewStaffLeaveRequest
  };
}
