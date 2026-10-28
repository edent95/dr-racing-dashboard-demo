/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Office Wi-Fi check for attendance, shared by server.mjs and the client.
// The office IP lists stay in dashboard_state (Super Admin only); staff learn
// only whether their own team's network matches the IP the server sees.

export const ATTENDANCE_MAIN_TEAM_ID = 'main';

export function normalizeAttendanceNetworkIp(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized === '::1') return '127.0.0.1';
  return normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
}

export function checkAttendanceNetwork(policy, dashboardAccountId, ipAddress) {
  const source = policy && typeof policy === 'object' ? policy : {};
  const assignments = source.staff_team_assignments && typeof source.staff_team_assignments === 'object'
    ? source.staff_team_assignments
    : {};
  const assignedTeamId = dashboardAccountId ? String(assignments[dashboardAccountId] || '') : '';
  const team = assignedTeamId && Array.isArray(source.teams)
    ? source.teams.find((item) => item && item.id === assignedTeamId)
    : undefined;
  const rules = team || source;
  const ip = normalizeAttendanceNetworkIp(ipAddress);
  const required = Boolean(rules.require_office_wifi_for_check_in);
  const allowedIps = Array.isArray(rules.office_network_ips)
    ? rules.office_network_ips.map(normalizeAttendanceNetworkIp).filter(Boolean)
    : [];

  return {
    team_id: team ? assignedTeamId : ATTENDANCE_MAIN_TEAM_ID,
    required,
    allowed: !required || (Boolean(ip) && allowedIps.includes(ip)),
    ip_address: ip
  };
}
