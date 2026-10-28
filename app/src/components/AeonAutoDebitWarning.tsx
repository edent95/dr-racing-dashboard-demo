import { AlertTriangle } from 'lucide-react';
import { getAutoDebitWarningText, type AeonAutoDebitIssue } from '../utils/aeonAutoDebit';

/**
 * AEON auto-debits only from some banks (owner 2026-10-21); the list is the
 * lender's "Auto-debit banks" in Bank Database. A warning, never a block:
 * once the lender approves, the handler asks the customer for an account at
 * one of them (owner 2026-10-24).
 */
export default function AeonAutoDebitWarning({
  issue,
  salaryBankName,
  compact = false
}: {
  issue: AeonAutoDebitIssue;
  salaryBankName: string;
  compact?: boolean;
}) {
  if (!issue) return null;
  const message = getAutoDebitWarningText(issue.lenderName, salaryBankName, issue.acceptedBanks);

  return (
    <div
      role="alert"
      data-testid="aeon-auto-debit-warning"
      className={`flex items-start gap-2 rounded-control border border-amber-200 bg-amber-50 text-amber-900 ${compact ? 'mt-1.5 px-2.5 py-1.5 text-caption' : 'px-3 py-2.5 text-footnote'}`}
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
