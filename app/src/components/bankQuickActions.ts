import { ArrowRight, CalendarClock, CheckCircle2, MinusCircle, X, type LucideIcon } from 'lucide-react';
import type { BankQuickAction } from '../utils/loanTableBankColumns';

// Same five decisions, colours and order as the bank cards on the bank page;
// the Home bank follow-up and the Loan Applications bank cell menu reuse them.
export const BANK_QUICK_ACTION_BUTTONS: Array<{ action: BankQuickAction; label: [string, string, string]; icon: LucideIcon; className: string }> = [
  { action: 'approve', label: ['已批准', 'Approved', 'Diluluskan'], icon: CheckCircle2, className: 'bg-emerald-700 hover:bg-emerald-800' },
  { action: 'follow-up-reject', label: ['跟进拒绝银行', 'Follow Up Reject Bank', 'Susulan Bank Ditolak'], icon: ArrowRight, className: 'bg-purple-700 hover:bg-purple-800' },
  { action: 'follow-up-document', label: ['待补文件', 'Pending Document', 'Dokumen Tertunda'], icon: CalendarClock, className: 'bg-amber-600 hover:bg-amber-700' },
  { action: 'reject', label: ['已拒绝', 'Rejected', 'Ditolak'], icon: X, className: 'bg-rose-700 hover:bg-rose-800' },
  { action: 'cancel', label: ['取消申请', 'Cancel', 'Batal'], icon: MinusCircle, className: 'bg-slate-700 hover:bg-slate-800' }
];

/** Banks still waiting on the bank's reply take one of the five decisions. */
export const BANK_QUICK_ACTION_STATUSES = ['Submitted', 'Pending Review'];
