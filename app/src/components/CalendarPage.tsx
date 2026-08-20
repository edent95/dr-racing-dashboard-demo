/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Check, ChevronLeft, ChevronRight, FileText, Landmark, MessageCircle, NotebookPen, PhoneCall, Plus, Send, Trash2 } from 'lucide-react';
import { CalendarNote, getLoanPendingWith, LoanApplication, RawCustomerLead, RoleAccount, RoleAccountRole } from '../types';
import StaffNameBadge from './StaffNameBadge';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';
import { getAppLocale, tr, trBankStatus, trFollowUpStatus, trLoanStatus } from '../lib/i18n';

interface CalendarPageProps {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  calendarNotes: CalendarNote[];
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  canViewAllCalendar: boolean;
  onAddCalendarNote: (note: Pick<CalendarNote, 'title' | 'body' | 'date_at' | 'assigned_to' | 'assigned_role'>) => void | Promise<void>;
  onDeleteCalendarNote: (noteId: string) => void | Promise<void>;
  onSetCalendarNoteCompleted: (noteId: string, completed: boolean) => void | Promise<void>;
  onAddCalendarTaskComment: (noteId: string, body: string) => Promise<boolean>;
  onSelectApplication: (application: LoanApplication) => void;
}

type CalendarEventType = 'application' | 'bank_submit' | 'bank_decision' | 'bank_follow_up' | 'customer_call_back' | 'follow_up' | 'note';

interface CalendarEvent {
  id: string;
  date: Date;
  dateKey: string;
  type: CalendarEventType;
  title: string;
  subtitle: string;
  meta: string;
  staffName?: string;
  staffRole?: string;
  status: string;
  application?: LoanApplication;
  note?: CalendarNote;
}

const WEEKDAYS: Array<[string, string, string]> = [['日', 'Sun', 'Ahd'], ['一', 'Mon', 'Isn'], ['二', 'Tue', 'Sel'], ['三', 'Wed', 'Rab'], ['四', 'Thu', 'Kha'], ['五', 'Fri', 'Jum'], ['六', 'Sat', 'Sab']];

const EVENT_STYLES: Record<CalendarEventType, { label: [string, string, string]; chip: string; dot: string; icon: React.ReactNode }> = {
  application: {
    label: ['客户', 'Customer', 'Pelanggan'],
    chip: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    dot: 'bg-indigo-500',
    icon: <FileText className="h-3.5 w-3.5" />
  },
  bank_submit: {
    label: ['银行提交', 'Bank Submit', 'Hantaran Bank'],
    chip: 'bg-blue-50 text-blue-700 ring-blue-100',
    dot: 'bg-blue-500',
    icon: <Landmark className="h-3.5 w-3.5" />
  },
  bank_decision: {
    label: ['银行批复', 'Bank Decision', 'Keputusan Bank'],
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
    icon: <Landmark className="h-3.5 w-3.5" />
  },
  bank_follow_up: {
    label: ['银行跟进', 'Bank Follow Up', 'Susulan Bank'],
    chip: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    dot: 'bg-cyan-500',
    icon: <CalendarClock className="h-3.5 w-3.5" />
  },
  customer_call_back: {
    label: ['回电', 'Call-back', 'Panggilan Balik'],
    chip: 'bg-purple-50 text-purple-700 ring-purple-100',
    dot: 'bg-purple-500',
    icon: <PhoneCall className="h-3.5 w-3.5" />
  },
  follow_up: {
    label: ['名单跟进', 'Follow Up', 'Susulan Prospek'],
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
    icon: <MessageCircle className="h-3.5 w-3.5" />
  },
  note: {
    label: ['笔记', 'Note', 'Nota'],
    chip: 'bg-red-50 text-red-700 ring-red-100',
    dot: 'bg-red-700',
    icon: <NotebookPen className="h-3.5 w-3.5" />
  }
};

const CALENDAR_TYPE_FILTER_STORAGE_KEY = 'calendar_event_type_filters_v3';
const ALL_EVENT_TYPES: CalendarEventType[] = ['application', 'bank_submit', 'bank_decision', 'bank_follow_up', 'customer_call_back', 'follow_up', 'note'];
const DEFAULT_EVENT_TYPES: CalendarEventType[] = ['bank_follow_up', 'customer_call_back', 'follow_up', 'note'];

function readStoredEventTypes(): Set<CalendarEventType> {
  try {
    const saved = window.localStorage.getItem(CALENDAR_TYPE_FILTER_STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as CalendarEventType[];
      const valid = parsed.filter((type) => ALL_EVENT_TYPES.includes(type));

      if (valid.length > 0) {
        return new Set(valid);
      }
    }
  } catch {
    // Fall through to all types.
  }

  return new Set(DEFAULT_EVENT_TYPES);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseEventDate(value?: string) {
  if (!value) {
    return null;
  }

  // Date-only values must be parsed as LOCAL midnight; new Date('YYYY-MM-DD')
  // would parse them as UTC and can place the event on the wrong day.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(getAppLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatEventTime(date: Date) {
  return date.getHours() === 0 && date.getMinutes() === 0 ? '' : formatTime(date);
}

function formatCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString(getAppLocale(), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString(getAppLocale(), {
    month: 'long',
    year: 'numeric'
  });
}

function formatSelectedDate(date: Date) {
  return date.toLocaleDateString(getAppLocale(), {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function buildMonthDays(monthCursor: Date) {
  const monthStart = startOfMonth(monthCursor);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function getEventSortTime(event: CalendarEvent) {
  return event.date.getTime();
}

export default function CalendarPage({
  applications,
  rawCustomerLeads,
  calendarNotes,
  roleAccounts,
  currentStaffName,
  currentStaffRole,
  canViewAllCalendar,
  onAddCalendarNote,
  onDeleteCalendarNote,
  onSetCalendarNoteCompleted,
  onAddCalendarTaskComment,
  onSelectApplication
}: CalendarPageProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(today));
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  // 自定义日历：按事件类型/员工筛选，类型选择会记住。
  const [activeEventTypes, setActiveEventTypes] = useState<Set<CalendarEventType>>(readStoredEventTypes);
  const [staffFilter, setStaffFilter] = useState('all');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteAssignee, setNoteAssignee] = useState(currentStaffName);
  const [isTaskComposerOpen, setIsTaskComposerOpen] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [taskReplyDrafts, setTaskReplyDrafts] = useState<Record<string, string>>({});
  const [savingTaskReplyId, setSavingTaskReplyId] = useState('');
  const canAssignCalendarTasks = currentStaffRole === 'Super Admin';
  const suspendedStaffNames = useMemo(() => (
    new Set(roleAccounts.filter((account) => account.status === 'Suspended').map((account) => account.name))
  ), [roleAccounts]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CALENDAR_TYPE_FILTER_STORAGE_KEY, JSON.stringify(Array.from(activeEventTypes)));
    } catch {
      // Preference only.
    }
  }, [activeEventTypes]);

  const toggleEventType = (type: CalendarEventType) => {
    setActiveEventTypes((current) => {
      const next = new Set(current);

      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }

      // Never allow zero types — that would look like a broken empty calendar.
      return next.size > 0 ? next : new Set(DEFAULT_EVENT_TYPES);
    });
  };

  const events = useMemo(() => {
    const nextEvents: CalendarEvent[] = [];

    applications.forEach((application) => {
      if (suspendedStaffNames.has(application.handler_name)) {
        return;
      }

      const submittedAt = parseEventDate(application.submitted_at);
      if (submittedAt) {
        nextEvents.push({
          id: `application-${application.id}`,
          date: submittedAt,
          dateKey: toDateKey(submittedAt),
          type: 'application',
          title: application.applicant_name,
          subtitle: application.vehicle_model || tr('未填车型', 'No motorcycle model', "Tiada model motosikal"),
          meta: application.handler_name,
          staffName: application.handler_name,
          staffRole: application.handler_role,
          status: application.status,
          application
        });
      }

      const customerCallBackAt = parseEventDate(application.customer_call_back_at);
      if (customerCallBackAt && getLoanPendingWith(application) !== 'Closed') {
        nextEvents.push({
          id: `customer-call-back-${application.id}`,
          date: customerCallBackAt,
          dateKey: toDateKey(customerCallBackAt),
          type: 'customer_call_back',
          title: tr(`${application.applicant_name} 回电`, `${application.applicant_name} call-back`, `${application.applicant_name} panggil balik`),
          subtitle: application.vehicle_model || tr('未填车型', 'No motorcycle model', "Tiada model motosikal"),
          meta: application.handler_name,
          staffName: application.handler_name,
          staffRole: application.handler_role,
          status: application.status,
          application
        });
      }

      application.bank_applications.forEach((bankApplication) => {
        const bankEventStaffName = bankApplication.submitted_by && !suspendedStaffNames.has(bankApplication.submitted_by)
          ? bankApplication.submitted_by
          : application.handler_name;
        const bankSubmittedAt = parseEventDate(bankApplication.submitted_at);
        if (bankSubmittedAt) {
          nextEvents.push({
            id: `bank-submit-${application.id}-${bankApplication.id}`,
            date: bankSubmittedAt,
            dateKey: toDateKey(bankSubmittedAt),
            type: 'bank_submit',
            title: tr(`${bankApplication.bank_name || '银行'} 已提交`, `${bankApplication.bank_name || 'Bank'} submitted`, `${bankApplication.bank_name || 'Bank'} diserahkan`),
            subtitle: application.applicant_name,
            meta: bankEventStaffName,
            staffName: bankEventStaffName,
            staffRole: application.handler_role,
            status: bankApplication.status,
            application
          });
        }

        const bankDecisionAt = parseEventDate(bankApplication.decision_at || bankApplication.approved_at);
        if (bankDecisionAt) {
          nextEvents.push({
            id: `bank-decision-${application.id}-${bankApplication.id}`,
            date: bankDecisionAt,
            dateKey: toDateKey(bankDecisionAt),
            type: 'bank_decision',
            title: `${bankApplication.bank_name || tr('银行', 'Bank', "Bank")} ${trBankStatus(bankApplication.status)}`,
            subtitle: application.applicant_name,
            meta: bankApplication.offer_status,
            staffName: application.handler_name,
            staffRole: application.handler_role,
            status: bankApplication.status,
            application
          });
        }

        const bankFollowUpAt = parseEventDate(bankApplication.next_follow_up_at);
        if (
          bankFollowUpAt &&
          getLoanPendingWith(application) !== 'Closed' &&
          !['Approved', 'Rejected', 'Cancelled'].includes(bankApplication.status)
        ) {
          nextEvents.push({
            id: `bank-follow-up-${application.id}-${bankApplication.id}`,
            date: bankFollowUpAt,
            dateKey: toDateKey(bankFollowUpAt),
            type: 'bank_follow_up',
            title: tr(`${bankApplication.bank_name || '银行'} 跟进`, `${bankApplication.bank_name || 'Bank'} follow-up`, `${bankApplication.bank_name || 'Bank'} susulan`),
            subtitle: application.applicant_name,
            meta: bankApplication.next_action || bankApplication.status_reason || application.handler_name,
            staffName: application.handler_name,
            staffRole: application.handler_role,
            status: bankApplication.status,
            application
          });
        }
      });
    });

    rawCustomerLeads.forEach((lead) => {
      const nextFollowUpAt = parseEventDate(lead.next_follow_up_at);
      if (
        !nextFollowUpAt ||
        suspendedStaffNames.has(lead.taken_by_staff_name || '') ||
        ['Submitted Loan', 'Rejected', 'Closed'].includes(lead.follow_up_status || '')
      ) {
        return;
      }

      nextEvents.push({
        id: `follow-up-${lead.id}`,
        date: nextFollowUpAt,
        dateKey: toDateKey(nextFollowUpAt),
        type: 'follow_up',
        title: lead.name || lead.phone_no || tr('未命名名单', 'Raw customer', "Pelanggan mentah"),
        subtitle: `${trFollowUpStatus(lead.follow_up_status || 'New')} · ${lead.channel}`,
        meta: lead.taken_by_staff_name || tr('未分配', 'Unassigned', "Belum Ditugaskan"),
        staffName: lead.taken_by_staff_name || '',
        staffRole: lead.taken_by_staff_role,
        status: lead.follow_up_status || 'Follow Up'
      });
    });

    calendarNotes
      .filter((note) => (
        !suspendedStaffNames.has(note.assigned_to || note.staff_name) &&
        (canViewAllCalendar || (note.assigned_to || note.staff_name) === currentStaffName)
      ))
      .forEach((note) => {
        const noteDate = parseEventDate(note.date_at);
        if (!noteDate) {
          return;
        }

        nextEvents.push({
          id: `note-${note.id}`,
          date: noteDate,
          dateKey: toDateKey(noteDate),
          type: 'note',
          title: note.title,
          subtitle: note.body || tr('日历笔记', 'Calendar note', "Nota kalendar"),
          meta: note.assigned_to || note.staff_name,
          staffName: note.assigned_to || note.staff_name,
          staffRole: note.assigned_role || note.staff_role,
          status: note.completed_at ? 'Completed' : 'Pending',
          note
        });
      });

    return nextEvents.sort((a, b) => getEventSortTime(a) - getEventSortTime(b));
  }, [applications, calendarNotes, canViewAllCalendar, currentStaffName, rawCustomerLeads, suspendedStaffNames]);

  const staffOptions = useMemo(() => {
    return roleAccounts
      .filter((account) => account.status === 'Active')
      .map((account) => account.name)
      .sort((a, b) => a.localeCompare(b));
  }, [roleAccounts]);

  useEffect(() => {
    if (staffFilter !== 'all' && !staffOptions.includes(staffFilter)) {
      setStaffFilter('all');
    }
  }, [staffFilter, staffOptions]);

  const staffScopedEvents = useMemo(() => (
    events.filter((event) => staffFilter === 'all' || event.staffName === staffFilter)
  ), [events, staffFilter]);

  const filteredEvents = useMemo(() => (
    staffScopedEvents.filter((event) => activeEventTypes.has(event.type))
  ), [activeEventTypes, staffScopedEvents]);

  // Chip counts ignore the type toggles so a switched-off type still shows
  // how many events it would reveal.
  const typeCounts = useMemo(() => (
    staffScopedEvents.reduce<Record<CalendarEventType, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, { application: 0, bank_submit: 0, bank_decision: 0, bank_follow_up: 0, customer_call_back: 0, follow_up: 0, note: 0 })
  ), [staffScopedEvents]);

  const eventsByDate = useMemo(() => (
    filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      acc[event.dateKey] = [...(acc[event.dateKey] || []), event];
      return acc;
    }, {})
  ), [filteredEvents]);

  const monthDays = useMemo(() => buildMonthDays(monthCursor), [monthCursor]);
  const selectedDate = useMemo(() => {
    const date = new Date(`${selectedDateKey}T00:00:00`);
    return Number.isNaN(date.getTime()) ? today : date;
  }, [selectedDateKey, today]);

  const selectedEvents = eventsByDate[selectedDateKey] || [];
  const monthKey = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, '0')}`;
  const monthEvents = filteredEvents.filter((event) => event.dateKey.startsWith(monthKey));
  const followUpEvents = filteredEvents.filter((event) => (
    event.type === 'follow_up' ||
    event.type === 'bank_follow_up' ||
    event.type === 'customer_call_back' ||
    (event.type === 'note' && !event.note?.completed_at)
  ));
  const upcomingFollowUps = followUpEvents.filter((event) => event.dateKey >= todayKey).slice(0, 5);

  const eventCounts = filteredEvents.reduce<Record<CalendarEventType, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {
    application: 0,
    bank_submit: 0,
    bank_decision: 0,
    bank_follow_up: 0,
    customer_call_back: 0,
    follow_up: 0,
    note: 0
  });
  const goToToday = () => {
    setMonthCursor(startOfMonth(today));
    setSelectedDateKey(todayKey);
  };
  const selectCalendarDate = (date: Date) => {
    setSelectedDateKey(toDateKey(date));
    if (
      date.getFullYear() !== monthCursor.getFullYear() ||
      date.getMonth() !== monthCursor.getMonth()
    ) {
      setMonthCursor(startOfMonth(date));
    }
  };

  const handleSubmitNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = noteTitle.trim();

    if (!title) {
      return;
    }

    setIsSavingNote(true);
    try {
      await onAddCalendarNote({
        title,
        body: noteBody.trim(),
        date_at: selectedDateKey,
        assigned_to: noteAssignee,
        assigned_role: roleAccounts.find((account) => account.name === noteAssignee)?.role || currentStaffRole
      });
      setNoteTitle('');
      setNoteBody('');
      setIsTaskComposerOpen(false);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div id="calendar-page" className="space-y-4 lg:space-y-3">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{tr('日历', 'Calendar', "Kalendar")}</h2>
          <p className="max-w-3xl text-[11px] font-light leading-relaxed text-slate-500">
            {tr('查看员工每天要执行的回电、跟进和管理层安排。', 'Review each staff member’s daily call-backs, follow-ups, and management assignments.', "Semak panggilan balik harian, tindakan susulan dan tugasan pengurusan setiap kakitangan.")}
          </p>
        </div>
        <span className="inline-flex self-start rounded-full bg-red-800 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
          {canViewAllCalendar ? tr('全员日历', 'All staff calendar', "Semua kalendar kakitangan") : tr(`${currentStaffName} 的日历`, `${currentStaffName} calendar`, `${currentStaffName} kalendar`)}
        </span>
      </section>

      {/* 自定义视图：点类型开关显示/隐藏，选择会记住 */}
      <section className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs lg:hidden">
        {ALL_EVENT_TYPES.map((type) => {
          const style = EVENT_STYLES[type];
          const isActive = activeEventTypes.has(type);

          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleEventType(type)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                isActive ? 'bg-slate-50 text-slate-700 ring-1 ring-slate-100' : 'text-slate-300 hover:text-slate-500'
              }`}
              title={tr('点击显示/隐藏这类事件', 'Click to show/hide this event type', "Klik untuk menunjukkan/menyembunyikan jenis acara ini")}
            >
              <span className={`h-2 w-2 rounded-full ${isActive ? style.dot : 'bg-slate-200'}`} />
              {tr(style.label[0], style.label[1], style.label[2])}
              <span className={`font-mono text-[10px] ${isActive ? 'text-slate-400' : 'text-slate-300'}`}>{typeCounts[type]}</span>
            </button>
          );
        })}
        {canViewAllCalendar && (
          <div className="ml-auto">
            <ToggleOptionGroup
              value={staffFilter}
              options={[
                { value: 'all', label: tr('全部员工', 'All staff', "Semua kakitangan") },
                ...staffOptions.map((name) => ({
                  value: name,
                  label: name,
                  leading: (
                    <StaffAvatar
                      name={name}
                      avatarDataUrl={roleAccounts.find((account) => account.name === name)?.avatar_data_url}
                      className="h-5 w-5 shrink-0"
                    />
                  )
                }))
              ]}
              onChange={setStaffFilter}
              ariaLabel={tr('按员工筛选日历', 'Filter calendar by staff', "Tapis kalendar mengikut kakitangan")}
            />
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-12rem)] lg:min-h-[600px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col overflow-hidden bg-white lg:order-2">
          <div className="flex shrink-0 flex-col gap-2 border-b border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">{formatMonth(monthCursor)}</h3>
              <p className="text-[10px] font-semibold text-slate-400">{tr(`本月 ${monthEvents.length} 个事件`, `${monthEvents.length} events this month`, `${monthEvents.length} acara bulan ini`)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMonthCursor((current) => addMonths(current, -1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                aria-label={tr('上个月', 'Previous month', "Bulan sebelumnya")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="inline-flex h-7 items-center rounded-full bg-slate-100 px-3 text-[10px] font-bold text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                {tr('今天', 'Today', "Hari Ini")}
              </button>
              <button
                type="button"
                onClick={() => setMonthCursor((current) => addMonths(current, 1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                aria-label={tr('下个月', 'Next month', "Bulan depan")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-7 border-b border-slate-200 bg-white text-right text-[10px] font-semibold text-slate-500">
            {WEEKDAYS.map(([zhDay, enDay, msDay]) => (
              <div key={enDay} className="px-2 py-1.5">{tr(zhDay, enDay, msDay)}</div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 border-l border-slate-200">
            {monthDays.map((date) => {
              const dateKey = toDateKey(date);
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = date.getMonth() === monthCursor.getMonth();
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => selectCalendarDate(date)}
                  aria-label={dateKey}
                  className={`min-h-24 border-b border-r border-slate-200 p-1 text-left transition-colors md:min-h-28 lg:min-h-0 ${
                    isSelected
                      ? 'bg-slate-50'
                      : isCurrentMonth
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/50 text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-end">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isToday ? 'bg-red-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className={`flex min-w-0 items-center gap-1 rounded px-1.5 py-0.5 ring-1 ${EVENT_STYLES[event.type].chip}`}>
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${EVENT_STYLES[event.type].dot}`} />
                        <span className="truncate text-[9px] font-bold md:text-[10px]">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="px-1.5 text-[9px] font-bold text-slate-400">{tr(`还有 ${dayEvents.length - 3} 个`, `+${dayEvents.length - 3} more`, `+${dayEvents.length - 3} lagi`)}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 bg-slate-50/70 lg:order-1 lg:overflow-y-auto lg:border-r lg:border-t-0">
          <section className="order-1 hidden border-b border-slate-200 p-3 lg:block">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-slate-900">{tr('日历分类', 'Calendars', "Kalendar")}</h3>
              <span className="text-[10px] font-semibold text-slate-400">{filteredEvents.length}</span>
            </div>
            <div className="space-y-0.5">
              {ALL_EVENT_TYPES.map((type) => {
                const style = EVENT_STYLES[type];
                const isActive = activeEventTypes.has(type);

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleEventType(type)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-white"
                    title={tr('点击显示/隐藏这类事件', 'Click to show/hide this event type', "Klik untuk menunjukkan/menyembunyikan jenis acara ini")}
                  >
                    <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] ${isActive ? style.dot : 'bg-slate-200'}`}>
                      {isActive && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[11px] font-semibold ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                      {tr(style.label[0], style.label[1], style.label[2])}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-slate-400">{typeCounts[type]}</span>
                  </button>
                );
              })}
            </div>

            {canViewAllCalendar && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">{tr('员工范围', 'Staff scope', "Skop kakitangan")}</p>
                <ToggleOptionGroup
                  value={staffFilter}
                  options={[
                    { value: 'all', label: tr('全部员工', 'All staff', "Semua kakitangan") },
                    ...staffOptions.map((name) => ({
                      value: name,
                      label: name,
                      leading: (
                        <StaffAvatar
                          name={name}
                          avatarDataUrl={roleAccounts.find((account) => account.name === name)?.avatar_data_url}
                          className="h-5 w-5 shrink-0"
                        />
                      )
                    }))
                  ]}
                  onChange={setStaffFilter}
                  ariaLabel={tr('按员工筛选日历', 'Filter calendar by staff', "Tapis kalendar mengikut kakitangan")}
                  className="w-full justify-between bg-white"
                />
              </div>
            )}

            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="mb-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMonthCursor((current) => addMonths(current, -1))}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
                  aria-label={tr('上个月', 'Previous month', "Bulan sebelumnya")}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-bold text-slate-600">{formatMonth(monthCursor)}</span>
                <button
                  type="button"
                  onClick={() => setMonthCursor((current) => addMonths(current, 1))}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
                  aria-label={tr('下个月', 'Next month', "Bulan depan")}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center text-[8px] font-bold text-slate-400">
                {WEEKDAYS.map(([zhDay, enDay, msDay]) => (
                  <span key={enDay} className="py-0.5">{tr(zhDay, enDay.slice(0, 1), msDay.slice(0, 1))}</span>
                ))}
                {monthDays.map((date) => {
                  const dateKey = toDateKey(date);
                  const isCurrentMonth = date.getMonth() === monthCursor.getMonth();
                  const isToday = dateKey === todayKey;
                  const isSelected = dateKey === selectedDateKey;

                  return (
                    <button
                      key={`mini-${dateKey}`}
                      type="button"
                      onClick={() => selectCalendarDate(date)}
                      className={`mx-auto inline-flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold transition-colors ${
                        isToday
                          ? 'bg-red-600 text-white'
                          : isSelected
                            ? 'bg-slate-200 text-slate-900'
                            : isCurrentMonth
                              ? 'text-slate-600 hover:bg-white'
                              : 'text-slate-300'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="order-3 border-t border-slate-200 bg-white p-3 lg:bg-transparent lg:shadow-none">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900">{formatSelectedDate(selectedDate)}</h3>
                <p className="mt-0.5 text-[10px] text-slate-400">{tr(`${selectedEvents.length} 个事项`, `${selectedEvents.length} scheduled items`, `${selectedEvents.length} item berjadual`)}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTaskComposerOpen((isOpen) => !isOpen)}
                aria-expanded={isTaskComposerOpen}
                className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[9px] font-bold transition-colors ${
                  isTaskComposerOpen
                    ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    : 'bg-red-800 text-white hover:bg-red-900'
                }`}
              >
                <Plus className={`h-3.5 w-3.5 transition-transform ${isTaskComposerOpen ? 'rotate-45' : ''}`} />
                {isTaskComposerOpen
                  ? tr('收起', 'Close', "Tutup")
                  : canAssignCalendarTasks
                    ? tr('指派任务', 'Assign task', "Berikan tugasan")
                    : tr('新增笔记', 'New note', "Nota baharu")}
              </button>
            </div>

            {isTaskComposerOpen && (
              <form onSubmit={handleSubmitNote} className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="mb-2 text-[10px] font-semibold text-red-700">
                  {currentStaffName} · {currentStaffRole}
                </p>
                <div className="space-y-2">
                  {canAssignCalendarTasks && (
                    <ToggleOptionGroup
                      value={noteAssignee}
                      options={roleAccounts
                        .filter((account) => account.status === 'Active')
                        .map((account) => ({
                          value: account.name,
                          label: account.name,
                          leading: <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-5 w-5 shrink-0" />
                        }))}
                      onChange={setNoteAssignee}
                      ariaLabel={tr('安排给员工', 'Assign to staff', "Tugaskan kepada kakitangan")}
                      className="w-full justify-between bg-white ring-1 ring-red-100"
                    />
                  )}
                  <input
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder={tr('标题，例如：客户会面', 'Title, e.g. Customer meeting', "Tajuk, mis. Mesyuarat pelanggan")}
                    className="w-full rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                  <textarea
                    value={noteBody}
                    onChange={(event) => setNoteBody(event.target.value)}
                    placeholder={tr('备注内容（可选）', 'Note details (optional)', "Butiran nota (pilihan)")}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold leading-relaxed text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                  <div className="grid grid-cols-1 gap-2">
                    {canAssignCalendarTasks && (
                      <input
                        type="date"
                        value={selectedDateKey}
                        onChange={(event) => {
                          const nextDateKey = event.target.value;
                          if (!nextDateKey) return;
                          setSelectedDateKey(nextDateKey);
                          setMonthCursor(startOfMonth(new Date(`${nextDateKey}T00:00:00`)));
                        }}
                        aria-label={tr('任务日期', 'Task date', "Tarikh tugasan")}
                        className="h-9 w-full rounded-lg border border-red-100 bg-white px-2 text-xs font-bold text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      />
                    )}
                    <button
                      type="submit"
                      disabled={!noteTitle.trim() || isSavingNote}
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-red-800 px-3 text-xs font-bold text-white transition-colors hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isSavingNote ? tr('保存中', 'Saving', "Menyimpan") : canAssignCalendarTasks ? tr('指派任务', 'Assign task', "Berikan tugasan") : tr('加入日历', 'Add to calendar', "Tambahkan pada kalendar")}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {selectedEvents.map((event) => {
                const style = EVENT_STYLES[event.type];
                const canOpenApplication = Boolean(event.application);
                const canDeleteNote = Boolean(event.note && (canViewAllCalendar || event.note.staff_name === currentStaffName));
                const eventTime = formatEventTime(event.date);

                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      if (event.application) {
                        onSelectApplication(event.application);
                      }
                    }}
                    onKeyDown={(keyEvent) => {
                      if ((keyEvent.key === 'Enter' || keyEvent.key === ' ') && event.application) {
                        keyEvent.preventDefault();
                        onSelectApplication(event.application);
                      }
                    }}
                    role={canOpenApplication ? 'button' : undefined}
                    tabIndex={canOpenApplication ? 0 : undefined}
                    className={`block w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left ${
                      canOpenApplication ? 'transition-colors hover:border-indigo-100 hover:bg-indigo-50' : ''
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${style.chip}`}>
                        {style.icon}
                        {tr(style.label[0], style.label[1], style.label[2])}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {eventTime && <span className="font-mono text-[10px] font-bold text-slate-400">{eventTime}</span>}
                        {canDeleteNote && event.note && (
                          <button
                            type="button"
                            onClick={(deleteEvent) => {
                              deleteEvent.stopPropagation();
                              onDeleteCalendarNote(event.note!.id);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                            title={tr('删除笔记', 'Delete note', "Padam nota")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    </div>
                    <p className="truncate text-xs font-bold text-slate-800">{event.title}</p>
                    <p className="mt-1 truncate text-[11px] text-slate-500">{event.subtitle}</p>
                    <div className="mt-2 flex min-w-0 items-center gap-2">
                      {event.type === 'note' ? (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${event.note?.completed_at ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-white text-amber-700 ring-amber-100'}`}>
                          {event.note?.completed_at ? tr('已完成', 'Completed', "Selesai") : tr('待执行', 'Pending', "Menunggu")}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 ring-1 ring-slate-100">
                          {trLoanStatus(trBankStatus(trFollowUpStatus(event.status)))}
                        </span>
                      )}
                      {event.note && (
                        <button
                          type="button"
                          onClick={(completeEvent) => {
                            completeEvent.stopPropagation();
                            onSetCalendarNoteCompleted(event.note!.id, !event.note!.completed_at);
                          }}
                          className={`ml-auto inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition-colors ${event.note.completed_at ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {event.note.completed_at ? tr('重新打开', 'Reopen', "Buka semula") : tr('完成', 'Complete', "lengkap")}
                        </button>
                      )}
                      {event.staffName ? (
                        <StaffNameBadge
                          name={event.staffName}
                          role={event.staffRole}
                          roleAccounts={roleAccounts}
                          avatarClassName="h-6 w-6"
                          nameClassName="text-[10px] font-bold text-slate-500"
                          roleClassName="hidden"
                        />
                      ) : (
                        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {event.meta}
                        </span>
                      )}
                    </div>
                    {event.note?.staff_role === 'Super Admin' && event.note.assigned_to && (
                      <div
                        className="mt-3 border-t border-slate-200 pt-3"
                        onClick={(replyEvent) => replyEvent.stopPropagation()}
                        onKeyDown={(replyEvent) => replyEvent.stopPropagation()}
                      >
                        {(event.note.comments || []).length > 0 && (
                          <div className="mb-2 space-y-1.5">
                            {(event.note.comments || []).slice(-3).map((comment) => (
                              <div key={comment.id} className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-100">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate text-[10px] font-bold text-slate-700">{comment.staff_name}</span>
                                  <span className="shrink-0 text-[9px] font-semibold text-slate-400">{formatCommentTime(comment.created_at)}</span>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-600">{comment.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <form
                          className="flex items-center gap-2"
                          onSubmit={async (submitEvent) => {
                            submitEvent.preventDefault();
                            submitEvent.stopPropagation();
                            const body = taskReplyDrafts[event.note!.id]?.trim() || '';
                            if (!body || savingTaskReplyId) return;
                            setSavingTaskReplyId(event.note!.id);
                            try {
                              const saved = await onAddCalendarTaskComment(event.note!.id, body);
                              if (saved) {
                                setTaskReplyDrafts((current) => ({ ...current, [event.note!.id]: '' }));
                              }
                            } finally {
                              setSavingTaskReplyId('');
                            }
                          }}
                        >
                          <input
                            value={taskReplyDrafts[event.note.id] || ''}
                            onChange={(inputEvent) => setTaskReplyDrafts((current) => ({
                              ...current,
                              [event.note!.id]: inputEvent.target.value
                            }))}
                            maxLength={2000}
                            aria-label={`Reply on calendar task ${event.note.title}`}
                            placeholder={tr(
                              `回复 ${currentStaffName === event.note.staff_name ? event.note.assigned_to : event.note.staff_name}`,
                              `Reply to ${currentStaffName === event.note.staff_name ? event.note.assigned_to : event.note.staff_name}`,
                              `Balas kepada ${currentStaffName === event.note.staff_name ? event.note.assigned_to : event.note.staff_name}`
                            )}
                            className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-800 outline-none placeholder:text-slate-300 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                          />
                          <button
                            type="submit"
                            disabled={!taskReplyDrafts[event.note.id]?.trim() || Boolean(savingTaskReplyId)}
                            aria-label={tr('发送任务回复', 'Send task reply', 'Hantar balasan tugasan')}
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-800 px-2.5 text-[10px] font-bold text-white transition-colors hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {savingTaskReplyId === event.note.id
                              ? tr('发送中', 'Sending', 'Menghantar')
                              : tr('回复', 'Reply', 'Balas')}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}

              {selectedEvents.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-center">
                  <p className="text-xs font-bold text-slate-400">{tr('没有日历事项', 'No calendar item', "Tiada item kalendar")}</p>
                  <p className="mt-1 text-[10px] text-slate-400 lg:hidden">{tr('可选择其他日期，或直接新增笔记。', 'Choose another day or add a note directly.', "Pilih hari lain atau tambahkan nota secara langsung.")}</p>
                </div>
              )}
            </div>
          </section>

          <section className="order-2 border-t border-slate-200 bg-white p-4 lg:bg-transparent">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">{tr('下一批提醒', 'Next Reminders', "Peringatan Seterusnya")}</h3>
              <p className="mt-1 text-xs text-slate-400">{tr('潜在名单跟进、客户回电和银行跟进日期。', 'Raw lead follow-up, customer call-back, and bank follow-up dates.', "susulan prospek mentah, panggilan balik pelanggan dan tarikh susulan bank.")}</p>
            </div>
            <div className="space-y-2">
              {upcomingFollowUps.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    selectCalendarDate(event.date);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl bg-amber-50/70 px-3 py-2 text-left transition-colors hover:bg-amber-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-amber-900">{event.title}</span>
                    <span className="block truncate text-[10px] font-semibold text-amber-700">{event.subtitle}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] font-bold text-amber-700">{event.dateKey}</span>
                </button>
              ))}

              {upcomingFollowUps.length === 0 && (
                <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-[11px] font-semibold text-slate-400">
                  {tr('没有即将到来的提醒日期。', 'No upcoming reminder dates.', "Tiada tarikh peringatan akan datang.")}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
