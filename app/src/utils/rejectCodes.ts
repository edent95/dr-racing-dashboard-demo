/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AuditLogEntry, LoanApplication } from '../types';

const REJECT_CODE_PATTERN = /(?<!\d)\d{7,8}(?!\d)/g;
export const REJECTED_MISSING_CODE_TRACKING_STARTED_AT = '2026-07-12T04:25:20.000Z';

export function normalizeRejectCode(value: unknown): string {
  const raw = String(value ?? '').trim();
  const match = raw.match(REJECT_CODE_PATTERN)?.[0] || '';

  return match.length === 7 ? match.padStart(8, '0') : match;
}

export function normalizeRejectCodes(value: unknown): string[] {
  const rawValues = Array.isArray(value) ? value : [value];

  return Array.from(new Set(
    rawValues
      .flatMap((item) => String(item ?? '').match(REJECT_CODE_PATTERN) || [])
      .map((code) => normalizeRejectCode(code))
      .filter(Boolean)
  ));
}

export function getApplicationRejectCodes(application: Pick<LoanApplication, 'error_code' | 'error_codes'>): string[] {
  return normalizeRejectCodes([
    ...(application.error_codes || []),
    application.error_code
  ]);
}

export function getPrimaryRejectCode(application: Pick<LoanApplication, 'error_code' | 'error_codes'>): string {
  return getApplicationRejectCodes(application)[0] || '';
}

const isAtOrAfterMissingCodeTrackingStart = (value?: string) => {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp >= new Date(REJECTED_MISSING_CODE_TRACKING_STARTED_AT).getTime();
};

export function shouldTrackRejectedLoanMissingCode(
  application: LoanApplication,
  auditLogs: AuditLogEntry[] = []
) {
  if (String(application.status) !== 'REJECT' || getApplicationRejectCodes(application).length > 0) {
    return false;
  }

  const rejectedAfterBaseline = (application.activity_thread || []).some((entry) => (
    entry.type === 'status_change' &&
    String(entry.to_status) === 'REJECT' &&
    isAtOrAfterMissingCodeTrackingStart(entry.created_at)
  ));
  const relevantEditAfterBaseline = auditLogs.some((log) => (
    log.target_id === application.id &&
    isAtOrAfterMissingCodeTrackingStart(log.created_at) &&
    log.changes.some((change) => ['status', 'error_code', 'error_codes'].includes(change.field))
  ));

  return isAtOrAfterMissingCodeTrackingStart(application.submitted_at) || rejectedAfterBaseline || relevantEditAfterBaseline;
}
