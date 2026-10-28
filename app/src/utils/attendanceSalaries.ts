import type { AttendanceWeeklySchedule, RoleAccountRole } from '../types';

/**
 * Monthly salary is Super Admin only (owner decision 2026-10-06). It lives in
 * attendance_salaries, not on the roster row, and this puts it back on the
 * in-memory schedules for Super Admin so the schedule editor and the late
 * penalty maths keep working unchanged.
 *
 * - Super Admin: the attendance_salaries value when there is one, otherwise
 *   the row's own value (local mode, or a row not yet migrated).
 * - Everyone else: always 0, even if an unmigrated row still carries a salary,
 *   so it never reaches the UI or a salary-based deduction they could reverse.
 */
export function mergeScheduleSalaries(
  schedules: AttendanceWeeklySchedule[],
  salaries: Record<string, number>,
  role: RoleAccountRole | string
): AttendanceWeeklySchedule[] {
  if (role !== 'Super Admin') {
    return schedules.map((schedule) => (
      schedule.monthly_salary === 0 ? schedule : { ...schedule, monthly_salary: 0 }
    ));
  }
  return schedules.map((schedule) => {
    const salary = Object.prototype.hasOwnProperty.call(salaries, schedule.id)
      ? salaries[schedule.id]
      : schedule.monthly_salary || 0;
    return salary === schedule.monthly_salary ? schedule : { ...schedule, monthly_salary: salary };
  });
}
