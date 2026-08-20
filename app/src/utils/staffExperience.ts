import type { RoleAccount, RoleAccountRole } from '../types';
import type { CompletedTaskEvent } from './taskCompletionAnalytics';

export const STAFF_EXP_RULE_VERSION = 'pilot-v2-2026-07';
export const EXP_PER_LEVEL = 100;
export const STAFF_EXPERIENCE_RULES_FIELD = 'staff_experience_points';

// Only Sales and Admin earn EXP / appear on the ranking. Super Admin (owner /
// system operator) is intentionally excluded from the leaderboard.
export const EXP_ELIGIBLE_ROLES: RoleAccountRole[] = ['Sales', 'Admin'];

export function isExperienceEligibleRole(role: string | undefined): boolean {
  return EXP_ELIGIBLE_ROLES.includes(role as RoleAccountRole);
}

// Simplified pilot economy: EXP is awarded for exactly one event — vehicle
// delivery (交车). When a bike is delivered, the Sales handler and the Admin
// owner each earn this amount. It is one tunable number in the EXP rules editor.
export const TASK_EXP_BY_TYPE: Record<string, number> = {
  'Bike Delivered': 50
};

export type StaffExperienceRuleMap = Record<string, number>;

export function isExperienceEligibleEvent(
  event: Pick<CompletedTaskEvent, 'task_type'>
): boolean {
  return Object.prototype.hasOwnProperty.call(TASK_EXP_BY_TYPE, event.task_type);
}

export function normalizeStaffExperienceRules(value: unknown): StaffExperienceRuleMap {
  const source = value && typeof value === 'object'
    ? value as Record<string, unknown>
    : {};

  return Object.fromEntries(
    Object.entries(TASK_EXP_BY_TYPE).map(([taskType, fallback]) => {
      const numeric = Number(source[taskType]);
      const points = Number.isFinite(numeric)
        ? Math.min(Math.max(Math.round(numeric), 0), 999)
        : fallback;
      return [taskType, points];
    })
  );
}

export function getStaffExperienceRulesFromConfig(value: unknown): StaffExperienceRuleMap {
  const source = value && typeof value === 'object'
    ? value as Record<string, unknown>
    : {};
  return normalizeStaffExperienceRules(source[STAFF_EXPERIENCE_RULES_FIELD]);
}

export interface StaffExperienceProgress {
  staffName: string;
  staffRole: string;
  seasonId: string;
  seasonExp: number;
  trackedExp: number;
  level: number;
  levelProgressExp: number;
  expToNextLevel: number;
  seasonCompletedTasks: number;
  trackedCompletedTasks: number;
}

export function getExperienceSeasonId(value: string | Date = new Date()) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value || '';
  const month = parts.find((part) => part.type === 'month')?.value || '';
  return year && month ? `${year}-${month}` : '';
}

export function getTaskExperiencePoints(
  event: Pick<CompletedTaskEvent, 'task_type'>,
  rules: StaffExperienceRuleMap = TASK_EXP_BY_TYPE
) {
  // Only listed loan / cash task types earn EXP. Any other completion is 0.
  return rules[event.task_type] ?? TASK_EXP_BY_TYPE[event.task_type] ?? 0;
}

function deduplicateEvents(events: CompletedTaskEvent[]) {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (!event.id || seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

export function calculateStaffExperience(
  events: CompletedTaskEvent[],
  staffName: string,
  staffRole = '',
  seasonId = getExperienceSeasonId(),
  rules: StaffExperienceRuleMap = TASK_EXP_BY_TYPE
): StaffExperienceProgress {
  const staffEvents = deduplicateEvents(events)
    .filter((event) => event.staff_name === staffName)
    .filter(isExperienceEligibleEvent);
  const seasonEvents = staffEvents.filter((event) => getExperienceSeasonId(event.completed_at) === seasonId);
  const seasonExp = seasonEvents.reduce((sum, event) => sum + getTaskExperiencePoints(event, rules), 0);
  const trackedExp = staffEvents.reduce((sum, event) => sum + getTaskExperiencePoints(event, rules), 0);
  const level = Math.floor(seasonExp / EXP_PER_LEVEL) + 1;

  return {
    staffName,
    staffRole: staffRole || staffEvents[0]?.staff_role || '',
    seasonId,
    seasonExp,
    trackedExp,
    level,
    levelProgressExp: seasonExp % EXP_PER_LEVEL,
    expToNextLevel: EXP_PER_LEVEL - (seasonExp % EXP_PER_LEVEL),
    seasonCompletedTasks: seasonEvents.length,
    trackedCompletedTasks: staffEvents.length
  };
}

export function buildStaffExperienceProgress(
  events: CompletedTaskEvent[],
  roleAccounts: RoleAccount[],
  seasonId = getExperienceSeasonId(),
  rules: StaffExperienceRuleMap = TASK_EXP_BY_TYPE
) {
  return roleAccounts
    .filter((account) => account.status === 'Active')
    .filter((account) => isExperienceEligibleRole(account.role))
    .map((account) => calculateStaffExperience(events, account.name, account.role, seasonId, rules))
    .sort((left, right) => (
      right.seasonExp - left.seasonExp ||
      right.seasonCompletedTasks - left.seasonCompletedTasks ||
      left.staffName.localeCompare(right.staffName)
    ));
}
