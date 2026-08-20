/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Bell, CalendarClock, ChevronRight, ClipboardList, FileWarning, UserPlus, X } from 'lucide-react';
import { tr } from '../lib/i18n';
import type {
  TaskInboxMirrorCategory,
  TaskInboxMirrorItem,
  TaskInboxMirrorSeverity
} from './TaskInboxPage';

type NotificationFilter = 'all' | TaskInboxMirrorCategory;

interface NotificationCenterProps {
  tasks: TaskInboxMirrorItem[];
  onClose: () => void;
  onOpenTaskInbox: (taskId: string) => void;
}

const FILTERS: Array<{ key: NotificationFilter; zh: string; en: string; ms: string }> = [
  { key: 'all', zh: '全部', en: 'All', ms: 'Semua' },
  { key: 'missing', zh: '缺资料', en: 'Missing Info', ms: 'Maklumat Hilang' },
  { key: 'rawLead', zh: '名单', en: 'Lead', ms: 'Prospek' },
  { key: 'cash', zh: '现金', en: 'Cash', ms: 'Tunai' },
  { key: 'bank', zh: '贷款', en: 'Loan', ms: 'Pinjaman' },
  { key: 'reminder', zh: '提醒', en: 'Reminder', ms: 'Peringatan' },
  { key: 'mission', zh: '任务', en: 'Mission', ms: 'Misi' }
];

const severityClassMap: Record<TaskInboxMirrorSeverity, {
  border: string;
  iconBg: string;
  iconText: string;
  zh: string;
  en: string;
  ms: string;
}> = {
  info: {
    border: 'border-blue-100',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    zh: '信息',
    en: 'Info',
    ms: 'Maklumat'
  },
  warning: {
    border: 'border-amber-100',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    zh: '警告',
    en: 'Warning',
    ms: 'Amaran'
  },
  success: {
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    zh: '成功',
    en: 'Success',
    ms: 'Berjaya'
  },
  critical: {
    border: 'border-rose-100',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    zh: '紧急',
    en: 'Critical',
    ms: 'Kritikal'
  }
};

function getTaskIcon(task: TaskInboxMirrorItem) {
  if (task.category === 'rawLead') {
    return <UserPlus className="h-4 w-4" />;
  }

  if (task.category === 'mission') {
    return <ClipboardList className="h-4 w-4" />;
  }

  if (task.category === 'missing') {
    return <FileWarning className="h-4 w-4" />;
  }

  if (task.category === 'reminder') {
    return <CalendarClock className="h-4 w-4" />;
  }

  return <AlertTriangle className="h-4 w-4" />;
}

function getCategoryLabel(category: TaskInboxMirrorCategory) {
  const labels: Record<TaskInboxMirrorCategory, [string, string, string]> = {
    missing: ['缺资料', 'Missing Info', 'Maklumat Hilang'],
    rawLead: ['名单', 'Lead', 'Prospek'],
    cash: ['现金', 'Cash', 'Tunai'],
    bank: ['贷款', 'Loan', 'Pinjaman'],
    reminder: ['提醒', 'Reminder', 'Peringatan'],
    mission: ['任务', 'Mission', 'Misi']
  };
  return tr(...labels[category]);
}

export default function NotificationCenter({
  tasks,
  onClose,
  onOpenTaskInbox
}: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const filteredTasks = useMemo(
    () => activeFilter === 'all'
      ? tasks
      : tasks.filter((task) => task.category === activeFilter),
    [activeFilter, tasks]
  );

  return (
    <section data-testid="notification-center" className="fixed right-6 top-20 z-50 flex h-[620px] w-[430px] max-h-[calc(100vh-6rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/70">
      <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-slate-900">{tr('通知中心', 'Notification Center', 'Pusat Pemberitahuan')}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {tr(
              `${tasks.length} 个任务 · ${tasks.length} 条处理中`,
              `${tasks.length} tasks · ${tasks.length} active`,
              `${tasks.length} tugasan · ${tasks.length} aktif`
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-800"
          title={tr('关闭通知', 'Close notifications', 'Tutup pemberitahuan')}
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="border-b border-slate-100 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                activeFilter === filter.key
                  ? 'bg-red-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tr(filter.zh, filter.en, filter.ms)}
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-100">
          {tr(
            '这里只显示当前 Task Inbox 内可见的待办；已隐藏或已完成的项目不会出现。',
            'This mirrors the visible tasks in Task Inbox. Hidden and completed items are excluded.',
            'Paparan ini sama seperti tugasan yang kelihatan dalam Task Inbox. Item tersembunyi dan selesai tidak dipaparkan.'
          )}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredTasks.length === 0 ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
            <Bell className="h-7 w-7 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-700">{tr('没有待办', 'No tasks', 'Tiada tugasan')}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {tr('当前筛选没有 Task Inbox 待办。', 'This filter has no Task Inbox item.', 'Penapis ini tiada item Task Inbox.')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const severity = severityClassMap[task.severity];

              return (
                <article key={task.id} className={`rounded-xl border bg-white p-3 shadow-sm ${severity.border}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${severity.iconBg} ${severity.iconText}`}>
                      {getTaskIcon(task)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <span>{task.categoryLabel || getCategoryLabel(task.category)}</span>
                        <span>·</span>
                        <span>{task.badgeLabel || tr(severity.zh, severity.en, severity.ms)}</span>
                        {task.dueLabel && (
                          <>
                            <span>·</span>
                            <span>{task.dueLabel}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-2 truncate text-xs font-bold text-slate-900" title={task.title}>{task.title}</p>
                      <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-slate-500">{task.context}</p>
                      {task.meta && <p className="mt-2 text-[10px] font-bold text-slate-400">{task.meta}</p>}
                      <button
                        type="button"
                        onClick={() => onOpenTaskInbox(task.id)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-red-900"
                      >
                        {tr('打开 Task Inbox', 'Open Task Inbox', 'Buka Task Inbox')}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
