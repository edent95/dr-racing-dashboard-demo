/**
 * Attendance & Leave state: the four attendance collections and their
 * Firestore realtime listeners (team-scoped for Admin). Moved from App.tsx
 * unchanged — the same four useState calls and the same subscription effect
 * with the same dependency list — so App reads them from here and passes them
 * on to useAttendanceActions and the pages. Monthly salary comes from the
 * Super Admin-only attendance_salaries listener and is merged onto the
 * schedules for Super Admin only (see utils/attendanceSalaries.ts).
 */
import { useEffect, useMemo, useState } from 'react';
import { isFirebaseConfigured } from '../lib/firebaseConfig';
import { tr } from '../lib/i18n';
import {
  subscribeToAttendanceEventsFromFirebase,
  subscribeToAttendanceIncidentResolutionsFromFirebase,
  subscribeToAttendanceSalariesFromFirebase,
  subscribeToAttendanceSchedulesFromFirebase,
  subscribeToStaffLeaveRequestsFromFirebase,
  type AttendanceEvent,
  type AttendanceIncidentResolution,
  type AttendanceSalaries
} from '../services/dashboardRepository';
import { ApprovalRequest, AttendancePolicy, AttendanceWeeklySchedule, getAttendanceTeamIdForAccount, RoleAccount } from '../types';
import { mergeScheduleSalaries } from '../utils/attendanceSalaries';
import type { StaffSession } from './useStaffSessionAuth';

export interface AttendanceStateDeps {
  currentStaff: StaffSession;
  attendancePolicy: AttendancePolicy;
  roleAccounts: RoleAccount[];
  isLoggedIn: boolean;
  isPublicRoutePath: boolean;
  syncStatus: string;
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
}

export function useAttendanceState({
  currentStaff,
  attendancePolicy,
  roleAccounts,
  isLoggedIn,
  isPublicRoutePath,
  syncStatus,
  triggerToast
}: AttendanceStateDeps) {
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceEvent[]>([]);
  const [attendanceIncidentResolutions, setAttendanceIncidentResolutions] = useState<AttendanceIncidentResolution[]>([]);
  const [attendanceSchedules, setAttendanceSchedules] = useState<AttendanceWeeklySchedule[]>([]);
  const [staffLeaveRequests, setStaffLeaveRequests] = useState<ApprovalRequest[]>([]);

  // An Admin's attendance listeners are limited to their own team (Firestore
  // Rules enforce the same scope); Super Admin / Operations Manager read all.
  const adminAttendanceTeamId = currentStaff.role === 'Admin'
    ? getAttendanceTeamIdForAccount(
      attendancePolicy,
      roleAccounts.find((account) => account.name === currentStaff.name)?.id
    )
    : undefined;

  useEffect(() => {
    if (
      !isFirebaseConfigured
      || isPublicRoutePath
      || !isLoggedIn
      || syncStatus !== 'firebase'
    ) {
      return;
    }

    let disposed = false;
    const unsubscribes: Array<() => void> = [];
    const handleLiveError = (label: string, error: Error) => {
      if (disposed) return;
      console.warn(`${label} realtime listener stopped.`, error);
      triggerToast(
        tr(
          '考勤实时更新已停止，请刷新页面重新连接。',
          'Attendance live updates stopped. Refresh the page to reconnect.',
          'Kemas kini langsung kehadiran terhenti. Muat semula halaman untuk menyambung semula.'
        ),
        'error'
      );
    };

    void Promise.all([
      subscribeToAttendanceEventsFromFirebase(
        (nextEvents) => {
          if (!disposed) setAttendanceEvents(nextEvents);
        },
        (error) => handleLiveError('Attendance', error),
        adminAttendanceTeamId
      ),
      subscribeToAttendanceIncidentResolutionsFromFirebase(
        (nextResolutions) => {
          if (!disposed) setAttendanceIncidentResolutions(nextResolutions);
        },
        (error) => handleLiveError('Attendance incident resolutions', error),
        adminAttendanceTeamId
      ),
      subscribeToAttendanceSchedulesFromFirebase(
        (nextSchedules) => {
          if (!disposed) setAttendanceSchedules(nextSchedules);
        },
        (error) => handleLiveError('Attendance schedules', error),
        adminAttendanceTeamId
      ),
      subscribeToStaffLeaveRequestsFromFirebase(
        (nextRequests) => {
          if (!disposed) setStaffLeaveRequests(nextRequests);
        },
        (error) => handleLiveError('Staff leave', error),
        adminAttendanceTeamId
      )
    ]).then((stops) => {
      if (disposed) {
        stops.forEach((stop) => stop());
        return;
      }
      unsubscribes.push(...stops);
    }).catch((error) => handleLiveError('Attendance', error as Error));

    return () => {
      disposed = true;
      unsubscribes.forEach((stop) => stop());
    };
  }, [adminAttendanceTeamId, currentStaff.name, currentStaff.role, isLoggedIn, isPublicRoutePath, syncStatus]);

  // Monthly salary is Super Admin only and lives in attendance_salaries; the
  // listener (and the merge below) gives everyone else no salary at all.
  const [attendanceSalaries, setAttendanceSalaries] = useState<AttendanceSalaries>({});
  useEffect(() => {
    if (
      !isFirebaseConfigured
      || isPublicRoutePath
      || !isLoggedIn
      || syncStatus !== 'firebase'
      || currentStaff.role !== 'Super Admin'
    ) {
      setAttendanceSalaries((current) => (Object.keys(current).length > 0 ? {} : current));
      return;
    }

    let disposed = false;
    let stop: () => void = () => undefined;
    void subscribeToAttendanceSalariesFromFirebase(
      (nextSalaries) => {
        if (!disposed) setAttendanceSalaries(nextSalaries);
      },
      (error) => {
        if (disposed) return;
        console.warn('Attendance salaries realtime listener stopped.', error);
        triggerToast(
          tr(
            '考勤实时更新已停止，请刷新页面重新连接。',
            'Attendance live updates stopped. Refresh the page to reconnect.',
            'Kemas kini langsung kehadiran terhenti. Muat semula halaman untuk menyambung semula.'
          ),
          'error'
        );
      }
    ).then((unsubscribe) => {
      if (disposed) unsubscribe();
      else stop = unsubscribe;
    }).catch((error) => console.warn('Attendance salaries realtime listener could not start.', error));

    return () => {
      disposed = true;
      stop();
    };
  }, [currentStaff.role, isLoggedIn, isPublicRoutePath, syncStatus]);

  const attendanceSchedulesWithSalary = useMemo(
    () => mergeScheduleSalaries(attendanceSchedules, attendanceSalaries, currentStaff.role),
    [attendanceSalaries, attendanceSchedules, currentStaff.role]
  );

  return {
    attendanceEvents,
    setAttendanceEvents,
    attendanceIncidentResolutions,
    setAttendanceIncidentResolutions,
    attendanceSchedules: attendanceSchedulesWithSalary,
    setAttendanceSchedules,
    staffLeaveRequests,
    setStaffLeaveRequests
  };
}
