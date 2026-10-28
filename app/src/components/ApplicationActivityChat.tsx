/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Floating, live-chat style view of one application's Internal Comment /
 * Activity Thread, plus its action log for roles that may read the Audit Log.
 * The launcher sits bottom-right over the Application Detail drawer. It replaced
 * the drawer's Activity tab, and its composer carries the Request Documents
 * switch, so the Admin asks for documents and says what is missing in one send.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, AtSign, ChevronDown, Info, MessageSquareText, Minus, ScrollText } from 'lucide-react';
import { STATUS_CONFIG, type AuditLogEntry, type CustomerActivityEntry, type LoanStatus } from '../types';
import { tr, trLoanStatus } from '../lib/i18n';

interface ApplicationActivityChatProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entries: CustomerActivityEntry[];
  /** Undefined hides the Action Log tab (role cannot read the Audit Log). */
  auditLogs?: AuditLogEntry[];
  currentStaffName: string;
  composer: React.ReactNode;
  formatTime: (value: string) => string;
}

type ChatTab = 'comments' | 'log';

// One colour per role, reused for the avatar, the name chip and @mentions, so
// staff can tell Sales from Admin at a glance without reading the role text.
const ROLE_TONE: Record<string, { avatar: string; chip: string; mention: string }> = {
  Sales: { avatar: 'bg-emerald-100 text-emerald-700 ring-emerald-200', chip: 'bg-emerald-50 text-emerald-700', mention: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Admin: { avatar: 'bg-indigo-100 text-indigo-700 ring-indigo-200', chip: 'bg-indigo-50 text-indigo-700', mention: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  'Operations Manager': { avatar: 'bg-amber-100 text-amber-800 ring-amber-200', chip: 'bg-amber-50 text-amber-800', mention: 'bg-amber-50 text-amber-800 ring-amber-200' },
  'Super Admin': { avatar: 'bg-brand-100 text-brand-ink ring-brand-100', chip: 'bg-brand-50 text-brand-ink', mention: 'bg-brand-50 text-brand-ink ring-brand-100' }
};
const DEFAULT_TONE = { avatar: 'bg-slate-100 text-slate-600 ring-slate-200', chip: 'bg-slate-100 text-slate-600', mention: 'bg-slate-100 text-slate-600 ring-slate-200' };
const roleTone = (role?: string) => ROLE_TONE[role || ''] || DEFAULT_TONE;

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length === 0 ? '?' : parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
};

const dayKey = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const formatDayLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (dayKey(value) === dayKey(today.toISOString())) return tr('今天', 'Today', 'Hari ini');
  if (dayKey(value) === dayKey(yesterday.toISOString())) return tr('昨天', 'Yesterday', 'Semalam');
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
};

// Messages from the same person within 5 minutes share one header.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

const humanizeAction = (action: string) => {
  const words = action.toLowerCase().split('_').filter(Boolean);
  return words.length > 0 ? words.join(' ').replace(/^./, (letter) => letter.toUpperCase()) : action;
};

// The action log dot: green for approvals, red for rejections and deletes,
// amber for documents and follow-ups, indigo for bank work, grey otherwise.
const actionTone = (action: string) => {
  const normalized = action.toUpperCase();
  if (/APPROV|ACCEPT|COMPLETE|DELIVER/.test(normalized)) return 'bg-emerald-500';
  if (/REJECT|CANCEL|DELETE|WITHDRAW|UNDO/.test(normalized)) return 'bg-rose-500';
  if (/DOCUMENT|FOLLOW|MISSING|REQUEST/.test(normalized)) return 'bg-amber-500';
  if (/BANK|SUBMIT/.test(normalized)) return 'bg-indigo-500';
  if (/COMMENT/.test(normalized)) return 'bg-brand';
  return 'bg-slate-400';
};

// Internal bookkeeping (task completion JSON and the like) is noise for staff.
const isReadableChange = (change: AuditLogEntry['changes'][number]) => (
  !change.field.startsWith('task_completion') &&
  ![change.old_value, change.new_value].some((value) => /^\s*[[{]/.test(String(value ?? '')))
);

const shortValue = (value: unknown) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return text.length > 60 ? `${text.slice(0, 57)}…` : text || '—';
};

const humanizeField = (field: string) => field.replace(/[._]+/g, ' ');

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** The whole value for the expanded view; ISO timestamps read as local time. */
const fullValue = (value: unknown, formatTime: (value: string) => string) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  if (!text) return '—';
  return ISO_DATE_PATTERN.test(text) ? formatTime(text) : text;
};

function StatusPill({ status }: { status: LoanStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-micro font-semibold tracking-normal ${config ? `${config.bg} ${config.text} ${config.border}` : 'border-slate-200 bg-white text-slate-600'}`}>
      {config && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />}
      {trLoanStatus(status)}
    </span>
  );
}

export default function ApplicationActivityChat({
  isOpen,
  onOpenChange,
  entries,
  auditLogs,
  currentStaffName,
  composer,
  formatTime
}: ApplicationActivityChatProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>('comments');
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(() => new Set());
  const toggleLog = (id: string) => setExpandedLogIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chronologicalEntries = useMemo(() => (
    [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  ), [entries]);
  const sortedAuditLogs = useMemo(() => (
    [...(auditLogs || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  ), [auditLogs]);
  const commentCount = entries.filter((entry) => entry.type === 'comment').length;
  const mentionCount = entries.filter((entry) => (
    entry.type === 'comment' && entry.staff_name !== currentStaffName && entry.tagged_staff_names.includes(currentStaffName)
  )).length;

  useEffect(() => {
    if (!auditLogs && activeTab === 'log') {
      setActiveTab('comments');
    }
  }, [activeTab, auditLogs]);

  useEffect(() => {
    if (isOpen && activeTab === 'comments') {
      messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [isOpen, activeTab, chronologicalEntries.length]);

  const tabClass = (tab: ChatTab) => `inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-control text-caption font-semibold transition-colors ${
    activeTab === tab ? 'bg-white text-slate-900 shadow-e1' : 'text-slate-500 hover:text-slate-800'
  }`;

  const countBadgeClass = (tab: ChatTab) => `rounded-full px-1.5 text-micro tabular-nums tracking-normal ${
    activeTab === tab ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500'
  }`;

  return createPortal(
    <>
      {!isOpen && (
        <button
          type="button"
          data-testid="activity-chat-launcher"
          onClick={() => onOpenChange(true)}
          aria-label={tr('打开内部对话', 'Open internal chat', 'Buka sembang dalaman')}
          className="fixed bottom-28 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-e3 transition-transform hover:scale-105 hover:bg-brand-deep"
        >
          <MessageSquareText className="h-6 w-6" />
          {commentCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-micro font-bold tabular-nums text-brand shadow-e1">
              {commentCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <section
          role="dialog"
          aria-label="Internal Comment / Activity Thread"
          data-testid="activity-chat-panel"
          className="fixed bottom-28 right-6 z-[60] flex h-[min(560px,calc(100vh-9rem))] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-panel bg-white shadow-e3"
        >
          <header className="flex items-center justify-between gap-3 bg-brand px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-callout font-bold">
                <MessageSquareText className="h-4 w-4" />
                {tr('内部对话', 'Internal Chat', 'Sembang Dalaman')}
              </p>
              <p className="mt-0.5 truncate text-micro tracking-normal text-white/80">
                {tr(`${commentCount} 条留言`, `${commentCount} messages`, `${commentCount} mesej`)}
                {mentionCount > 0 && (
                  <span className="ml-2 rounded-full bg-amber-300 px-1.5 py-px font-semibold text-amber-950">
                    {tr(`@你 ${mentionCount}`, `@you ${mentionCount}`, `@anda ${mentionCount}`)}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={tr('收起内部对话', 'Minimize internal chat', 'Kecilkan sembang dalaman')}
              className="flex h-8 w-8 items-center justify-center rounded-control text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Minus className="h-4 w-4" />
            </button>
          </header>

          <div className="flex gap-1 bg-slate-100 p-1">
            <button type="button" onClick={() => setActiveTab('comments')} aria-pressed={activeTab === 'comments'} className={tabClass('comments')}>
              <MessageSquareText className="h-3.5 w-3.5" />
              {tr('对话', 'Comments', 'Ulasan')}
              <span className={countBadgeClass('comments')}>{entries.length}</span>
            </button>
            {auditLogs && (
              <button type="button" onClick={() => setActiveTab('log')} aria-pressed={activeTab === 'log'} className={tabClass('log')}>
                <ScrollText className="h-3.5 w-3.5" />
                {tr('操作记录', 'Action Log', 'Log Tindakan')}
                <span className={countBadgeClass('log')}>{auditLogs.length}</span>
              </button>
            )}
          </div>

          {activeTab === 'comments' ? (
            <>
              <div data-testid="activity-chat-messages" className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3">
                {chronologicalEntries.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand">
                      <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="text-footnote text-slate-500">
                      {tr('还没有内部动态，第一句由你开始。', 'No internal activity yet. Start the conversation.', 'Tiada aktiviti dalaman lagi. Mulakan perbualan.')}
                    </p>
                  </div>
                )}
                {chronologicalEntries.map((entry, index) => {
                  const previous = chronologicalEntries[index - 1];
                  const startsDay = !previous || dayKey(previous.created_at) !== dayKey(entry.created_at);
                  const daySeparator = startsDay && (
                    <div className="my-3 flex items-center gap-2" data-testid="activity-chat-day">
                      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                      <span className="text-micro font-semibold uppercase text-slate-400">
                        {formatDayLabel(entry.created_at)}
                      </span>
                      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                    </div>
                  );

                  if (entry.type !== 'comment') {
                    const isStatusChange = entry.type === 'status_change' && entry.from_status && entry.to_status;
                    const isDocumentRequest = /document/i.test(entry.body);
                    return (
                      <React.Fragment key={entry.id}>
                        {daySeparator}
                        <div className="my-2 flex justify-center">
                          <div className={`flex max-w-[92%] flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-card px-3 py-1.5 text-center text-micro tracking-normal ring-1 ${
                            isDocumentRequest && !isStatusChange
                              ? 'bg-amber-50 text-amber-800 ring-amber-100'
                              : 'bg-white text-slate-600 ring-slate-100'
                          }`}>
                            {isStatusChange ? (
                              <>
                                <StatusPill status={entry.from_status as LoanStatus} />
                                <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                                <StatusPill status={entry.to_status as LoanStatus} />
                              </>
                            ) : (
                              <>
                                <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span className="font-semibold">{entry.body}</span>
                              </>
                            )}
                            <span className="text-slate-400">· {entry.staff_name} · {formatTime(entry.created_at)}</span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  }

                  const isMine = entry.staff_name === currentStaffName;
                  const continuesGroup = !startsDay
                    && previous?.type === 'comment'
                    && previous.staff_name === entry.staff_name
                    && new Date(entry.created_at).getTime() - new Date(previous.created_at).getTime() < GROUP_WINDOW_MS;
                  const mentions = [...entry.tagged_roles, ...entry.tagged_staff_names];
                  const mentionsMe = !isMine && entry.tagged_staff_names.includes(currentStaffName);
                  const tone = roleTone(entry.staff_role);
                  return (
                    <React.Fragment key={entry.id}>
                      {daySeparator}
                      <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''} ${continuesGroup ? 'mt-1' : 'mt-3'}`}>
                        {!isMine && (
                          <span
                            aria-hidden="true"
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-micro font-bold tracking-normal ring-1 ${continuesGroup ? 'invisible' : tone.avatar}`}
                          >
                            {getInitials(entry.staff_name)}
                          </span>
                        )}
                        <div className={`flex min-w-0 max-w-[82%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          {!continuesGroup && (
                            <p className={`mb-1 flex flex-wrap items-center gap-1.5 px-0.5 text-micro tracking-normal ${isMine ? 'justify-end' : ''}`}>
                              {isMine ? (
                                <span className="font-semibold text-slate-600">{tr('你', 'You', 'Anda')}</span>
                              ) : (
                                <>
                                  <span className="font-bold text-slate-800">{entry.staff_name}</span>
                                  <span className={`rounded-full px-1.5 py-px font-semibold ${tone.chip}`}>{entry.staff_role}</span>
                                </>
                              )}
                              <span className="text-slate-400">{formatTime(entry.created_at)}</span>
                            </p>
                          )}
                          <div className={`whitespace-pre-wrap break-words rounded-card px-3 py-2 text-footnote leading-relaxed shadow-e1 ${
                            isMine
                              ? 'rounded-tr-sm bg-brand text-white'
                              : mentionsMe
                                ? 'rounded-tl-sm bg-amber-50 text-slate-800 ring-1 ring-amber-200'
                                : 'rounded-tl-sm bg-white text-slate-700'
                          }`}>
                            {entry.body}
                          </div>
                          {mentions.length > 0 && (
                            <div className={`mt-1 flex flex-wrap gap-1 ${isMine ? 'justify-end' : ''}`}>
                              {entry.tagged_roles.map((role) => (
                                <span key={`role-${role}`} className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-micro font-semibold tracking-normal ring-1 ${roleTone(role).mention}`}>
                                  <AtSign className="h-2.5 w-2.5" aria-hidden="true" />{role}
                                </span>
                              ))}
                              {entry.tagged_staff_names.map((name) => (
                                <span
                                  key={`staff-${name}`}
                                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-micro font-semibold tracking-normal ring-1 ${
                                    name === currentStaffName ? 'bg-amber-100 text-amber-800 ring-amber-300' : 'bg-white text-slate-600 ring-slate-200'
                                  }`}
                                >
                                  <AtSign className="h-2.5 w-2.5" aria-hidden="true" />{name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-slate-100 bg-white p-3">{composer}</div>
            </>
          ) : (
            <div data-testid="activity-chat-action-log" className="flex-1 overflow-y-auto bg-slate-50 px-3 py-4">
              {sortedAuditLogs.length === 0 && (
                <p className="py-10 text-center text-footnote text-slate-400">
                  {tr('这份申请还没有操作记录。', 'No actions recorded for this application yet.', 'Belum ada tindakan direkodkan untuk permohonan ini.')}
                </p>
              )}
              <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200">
                {sortedAuditLogs.map((log) => {
                  const changes = log.changes.filter(isReadableChange);
                  const internalChanges = log.changes.filter((change) => !isReadableChange(change));
                  const isExpanded = expandedLogIds.has(log.id);
                  return (
                    <li key={log.id} className="relative pl-6">
                      <span className={`absolute left-0.5 top-3 h-3 w-3 rounded-full ring-2 ring-slate-50 ${actionTone(log.action)}`} aria-hidden="true" />
                      <article className={`rounded-card bg-white shadow-e1 transition-shadow ${isExpanded ? 'ring-1 ring-slate-200' : 'hover:shadow-e2'}`}>
                        <button
                          type="button"
                          onClick={() => toggleLog(log.id)}
                          aria-expanded={isExpanded}
                          data-testid={`activity-log-toggle-${log.id}`}
                          className="block w-full rounded-card px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
                        >
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-footnote font-bold text-slate-800">{humanizeAction(log.action)}</span>
                            <span className="flex shrink-0 items-center gap-1 text-micro tracking-normal text-slate-400">
                              {formatTime(log.created_at)}
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                            </span>
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-micro tracking-normal text-slate-500">
                            <span className="font-semibold text-slate-700">{log.staff_name}</span>
                            <span className={`rounded-full px-1.5 py-px font-semibold ${roleTone(log.staff_role).chip}`}>{log.staff_role}</span>
                            {!isExpanded && log.changes.length > 0 && (
                              <span className="ml-auto text-slate-400">
                                {tr(`${log.changes.length} 项改动 · 点开看详情`, `${log.changes.length} changes · tap for details`, `${log.changes.length} perubahan · ketik untuk butiran`)}
                              </span>
                            )}
                          </span>
                          {!isExpanded && changes.length > 0 && (
                            <span className="mt-2 block space-y-1 border-t border-slate-100 pt-2">
                              {changes.slice(0, 3).map((change, index) => (
                                <span key={`${change.field}-${index}`} className="flex min-w-0 items-center gap-x-1.5 text-micro tracking-normal">
                                  <span className="shrink-0 font-semibold capitalize text-slate-600">{humanizeField(change.field)}</span>
                                  <span className="min-w-0 truncate rounded bg-rose-50 px-1 text-rose-700 line-through decoration-rose-300">{shortValue(fullValue(change.old_value, formatTime))}</span>
                                  <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                                  <span className="min-w-0 truncate rounded bg-emerald-50 px-1 font-semibold text-emerald-700">{shortValue(fullValue(change.new_value, formatTime))}</span>
                                </span>
                              ))}
                              {changes.length > 3 && (
                                <span className="block text-micro tracking-normal text-slate-400">+{changes.length - 3}</span>
                              )}
                            </span>
                          )}
                        </button>
                        {isExpanded && (
                          <div data-testid={`activity-log-detail-${log.id}`} className="space-y-2 border-t border-slate-100 px-3 pb-3 pt-2">
                            {log.target_label && (
                              <p className="text-micro tracking-normal text-slate-500">
                                {tr('对象', 'Target', 'Sasaran')}: <span className="font-semibold text-slate-700">{log.target_label}</span>
                              </p>
                            )}
                            {changes.length === 0 && internalChanges.length === 0 && (
                              <p className="text-micro tracking-normal text-slate-400">{tr('没有记录字段改动。', 'No field changes recorded.', 'Tiada perubahan medan direkodkan.')}</p>
                            )}
                            {changes.map((change, index) => (
                              <div key={`${change.field}-${index}`} className="rounded-control bg-slate-50 p-2">
                                <p className="mb-1.5 text-micro font-bold capitalize tracking-normal text-slate-700">{humanizeField(change.field)}</p>
                                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                  <div className="min-w-0 rounded bg-rose-50 px-2 py-1.5">
                                    <p className="text-micro font-semibold uppercase text-rose-500">{tr('之前', 'Before', 'Sebelum')}</p>
                                    <p className="whitespace-pre-wrap break-words text-caption text-rose-800">{fullValue(change.old_value, formatTime)}</p>
                                  </div>
                                  <div className="min-w-0 rounded bg-emerald-50 px-2 py-1.5">
                                    <p className="text-micro font-semibold uppercase text-emerald-600">{tr('之后', 'After', 'Selepas')}</p>
                                    <p className="whitespace-pre-wrap break-words text-caption font-semibold text-emerald-800">{fullValue(change.new_value, formatTime)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {internalChanges.length > 0 && (
                              <details className="rounded-control bg-slate-50 p-2 text-micro tracking-normal text-slate-500">
                                <summary className="cursor-pointer font-semibold">
                                  {tr(`系统内部字段 ${internalChanges.length} 项`, `${internalChanges.length} internal fields`, `${internalChanges.length} medan dalaman`)}
                                </summary>
                                <ul className="mt-1.5 space-y-1.5">
                                  {internalChanges.map((change, index) => (
                                    <li key={`${change.field}-${index}`} className="min-w-0">
                                      <p className="font-semibold text-slate-600">{change.field}</p>
                                      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-white p-1.5 font-mono text-micro text-slate-600">{String(change.new_value ?? '').slice(0, 4000)}</pre>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </div>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </section>
      )}
    </>,
    document.body
  );
}
