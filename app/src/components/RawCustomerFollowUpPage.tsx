/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Search, Undo2 } from 'lucide-react';
import { RawCustomerLead, RawLeadFollowUpStatus, RoleAccount } from '../types';
import StaffNameBadge from './StaffNameBadge';
import ToggleOptionGroup from './ToggleOptionGroup';
import { useDebouncedValue } from '../utils/tableUx';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';
import { getAppLocale, tr, trFollowUpStatus } from '../lib/i18n';

interface RawCustomerFollowUpPageProps {
  rawCustomers: RawCustomerLead[];
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  canViewAllFollowUps: boolean;
  defaultFollowUpDays: number;
  onOpenWhatsApp: (lead: RawCustomerLead, target: 'api' | 'web') => void;
  onUpdateLead: (leadId: string, updates: Partial<RawCustomerLead>) => void;
  onReleaseLead: (lead: RawCustomerLead) => void;
}

type FollowUpFilter = 'mine' | 'today' | 'overdue' | 'noReply' | 'interested' | 'all';
type FollowUpQuickDate = 'tomorrow' | 'three_days' | 'seven_days';
type FollowUpDateSelection = FollowUpQuickDate | 'custom';

const FOLLOW_UP_ROW_HEIGHT = 150;
const FOLLOW_UP_TABLE_HEIGHT = 680;
const FOLLOW_UP_OVERSCAN_ROWS = 6;
const FOLLOW_UP_GRID_COLUMNS = '230px 170px 150px 170px 150px 300px 260px 130px';

const FOLLOW_UP_STATUSES: RawLeadFollowUpStatus[] = [
  'New',
  'Contacted',
  'No Reply',
  'Interested',
  'Submitted Loan',
  'Rejected',
  'Closed'
];
const FOLLOW_UP_QUICK_DATES: Array<{ value: FollowUpQuickDate; zh: string; en: string; ms: string; days: number }> = [
  { value: 'tomorrow', zh: '明天', en: 'Tomorrow', ms: 'Esok', days: 1 },
  { value: 'three_days', zh: '3 天后', en: '3 days', ms: '3 hari lagi', days: 3 },
  { value: 'seven_days', zh: '7 天后', en: '7 days', ms: '7 hari lagi', days: 7 }
];

// 一点即记的快捷跟进短语：写 note 同时自动盖跟进时间戳。
const QUICK_NOTE_PHRASES: Array<[string, string, string]> = [
  ['没接电话', 'No answer', 'Tidak menjawab'],
  ['约了再谈', 'Meeting arranged', 'Janji temu telah ditetapkan'],
  ['已发资料', 'Info sent', 'Maklumat telah dihantar'],
  ['考虑中', 'Considering', 'Sedang mempertimbangkan'],
  ['过几天再跟', 'Follow up later', 'Susulan kemudian']
];

const formatShortDate = (value?: string) => {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleString(getAppLocale(), {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const isSameDate = (dateValue: string, compareDate: Date) => {
  const date = new Date(dateValue);

  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
};

const getFollowUpIsoInDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
};

const getQuickFollowUpValue = (value?: string): FollowUpDateSelection | '' => {
  if (!value) {
    return '';
  }

  const followUpDate = new Date(value);
  if (Number.isNaN(followUpDate.getTime())) {
    return '';
  }

  const today = new Date();
  const matchedOption = FOLLOW_UP_QUICK_DATES.find((option) => {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + option.days);
    return isSameDate(value, targetDate);
  });

  return matchedOption?.value || 'custom';
};

const formatDateInputValue = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
};

const getFollowUpIsoFromDateInput = (value: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T09:00:00`);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

// Follow-up note field with a local draft. Typing only updates local state and
// commits to global dashboard state on blur — previously every keystroke ran a
// full O(n) lead-pool normalize + localStorage write + remote save, which
// stuttered badly on large lead pools.
function FollowUpNoteField({
  value,
  onCommit,
  placeholder,
  className
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder: string;
  className: string;
}) {
  const [draft, setDraft] = useState(value);
  const lastExternalRef = useRef(value);

  useEffect(() => {
    // Adopt external changes (e.g. a quick-phrase button appended to the note).
    if (value !== lastExternalRef.current) {
      lastExternalRef.current = value;
      setDraft(value);
    }
  }, [value]);

  return (
    <textarea
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        lastExternalRef.current = draft;
        if (draft !== value) {
          onCommit(draft);
        }
      }}
      rows={2}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default function RawCustomerFollowUpPage({
  rawCustomers,
  roleAccounts,
  currentStaffName,
  canViewAllFollowUps,
  defaultFollowUpDays,
  onOpenWhatsApp,
  onUpdateLead,
  onReleaseLead
}: RawCustomerFollowUpPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [filter, setFilter] = useState<FollowUpFilter>(canViewAllFollowUps ? 'all' : 'mine');
  const [customDateLeadId, setCustomDateLeadId] = useState<string | null>(null);
  const today = new Date();

  useEffect(() => {
    setFilter(canViewAllFollowUps ? 'all' : 'mine');
  }, [canViewAllFollowUps, currentStaffName]);

  const takenLeads = useMemo(() => (
    rawCustomers
      .filter((lead) => lead.lead_scope === 'Taken Lead' || Boolean(lead.taken_by_staff_name))
      .filter((lead) => canViewAllFollowUps || lead.taken_by_staff_name === currentStaffName)
      .sort((a, b) => new Date(b.last_follow_up_at || b.taken_at || b.received_at).getTime() - new Date(a.last_follow_up_at || a.taken_at || a.received_at).getTime())
  ), [canViewAllFollowUps, currentStaffName, rawCustomers]);

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const visibleLeads = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();

    return takenLeads.filter((lead) => {
      if (filter === 'mine' && lead.taken_by_staff_name !== currentStaffName) {
        return false;
      }

      if (filter === 'today' && (!lead.next_follow_up_at || !isSameDate(lead.next_follow_up_at, today))) {
        return false;
      }

      if (filter === 'overdue' && (!lead.next_follow_up_at || new Date(lead.next_follow_up_at).getTime() >= today.getTime())) {
        return false;
      }

      if (filter === 'noReply' && lead.follow_up_status !== 'No Reply') {
        return false;
      }

      if (filter === 'interested' && lead.follow_up_status !== 'Interested') {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        lead.name.toLowerCase().includes(query) ||
        lead.phone_no.toLowerCase().includes(query) ||
        lead.lead_id.toLowerCase().includes(query) ||
        lead.channel.toLowerCase().includes(query) ||
        (lead.taken_by_staff_name || '').toLowerCase().includes(query) ||
        (lead.follow_up_note || '').toLowerCase().includes(query)
      );
    });
  }, [currentStaffName, filter, debouncedSearchTerm, takenLeads, today]);

  useEffect(() => {
    setScrollTop(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [debouncedSearchTerm, filter]);

  const virtualWindow = useMemo(() => {
    const viewportRowCount = Math.ceil(FOLLOW_UP_TABLE_HEIGHT / FOLLOW_UP_ROW_HEIGHT);
    const startIndex = Math.max(Math.floor(scrollTop / FOLLOW_UP_ROW_HEIGHT) - FOLLOW_UP_OVERSCAN_ROWS, 0);
    const endIndex = Math.min(startIndex + viewportRowCount + (FOLLOW_UP_OVERSCAN_ROWS * 2), visibleLeads.length);

    return {
      startIndex,
      visibleRows: visibleLeads.slice(startIndex, endIndex),
      totalHeight: visibleLeads.length * FOLLOW_UP_ROW_HEIGHT
    };
  }, [scrollTop, visibleLeads]);

  const dueTodayCount = takenLeads.filter((lead) => lead.next_follow_up_at && isSameDate(lead.next_follow_up_at, today)).length;
  const overdueCount = takenLeads.filter((lead) => lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() < today.getTime()).length;
  const interestedCount = takenLeads.filter((lead) => lead.follow_up_status === 'Interested').length;

  const filterButtons: Array<{ key: FollowUpFilter; label: string; value: number | string }> = [
    { key: 'mine', label: tr('我的', 'Mine', "Milik Saya"), value: takenLeads.filter((lead) => lead.taken_by_staff_name === currentStaffName).length },
    { key: 'today', label: tr('今天', 'Today', "Hari Ini"), value: dueTodayCount },
    { key: 'overdue', label: tr('已逾期', 'Overdue', "Tertunggak"), value: overdueCount },
    { key: 'noReply', label: tr('未回复', 'No Reply', "Tiada Balasan"), value: takenLeads.filter((lead) => lead.follow_up_status === 'No Reply').length },
    { key: 'interested', label: tr('有意向', 'Interested', "Berminat"), value: interestedCount },
    { key: 'all', label: tr('全部员工', 'All Staff', "Semua Kakitangan"), value: takenLeads.length }
  ];

  const renderLeadCells = (lead: RawCustomerLead) => {
    const phoneNumber = normalizePhoneDigits(lead.phone_no || lead.whatsapp || lead.work_phone);
    const resolvedNextFollowUpAt = lead.next_follow_up_at || getFollowUpIsoInDays(defaultFollowUpDays);
    const activeQuickFollowUp = getQuickFollowUpValue(resolvedNextFollowUpAt);
    const isCustomDateOpen = customDateLeadId === lead.id || activeQuickFollowUp === 'custom';

    return (
      <>
        <div className="overflow-hidden px-5 py-2.5 align-top">
          <p className="truncate font-bold text-slate-800" title={lead.name || lead.username}>
            {lead.name || tr('未命名名单', 'Unnamed lead', "Prospek yang tidak dinamakan")}
          </p>
          <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
            {lead.channel} / {lead.lead_id || lead.id}
          </p>
        </div>
        <div className="overflow-hidden px-5 py-2.5 align-top font-mono text-xs text-slate-600">
          {lead.phone_no || '--'}
        </div>
        <div className="overflow-hidden px-5 py-2.5 align-top">
          <StaffNameBadge
            name={lead.taken_by_staff_name}
            role={lead.taken_by_staff_role}
            roleAccounts={roleAccounts}
            avatarClassName="h-8 w-8"
          />
          <p className="mt-2 text-[10px] font-medium text-slate-400">{formatShortDate(lead.taken_at)}</p>
        </div>
        <div className="overflow-visible px-5 py-2.5 align-top">
          <ToggleOptionGroup
            value={lead.follow_up_status || 'New'}
            options={FOLLOW_UP_STATUSES.map((status) => ({ value: status, label: trFollowUpStatus(status) }))}
            onChange={(value) => onUpdateLead(lead.id, {
              follow_up_status: value as RawLeadFollowUpStatus,
              last_follow_up_at: new Date().toISOString()
            })}
            ariaLabel={`Update follow up status for ${lead.name || lead.id}`}
            optionClassName="min-h-7 px-2 py-1"
          />
        </div>
        <div className="overflow-hidden px-5 py-2.5 align-top">
          <span className="font-mono text-[11px] text-slate-400">{formatShortDate(lead.last_follow_up_at)}</span>
        </div>
        <div className="overflow-visible px-5 py-2.5 align-top">
          <div className="space-y-2">
            <ToggleOptionGroup
              value={activeQuickFollowUp}
              options={[
                ...FOLLOW_UP_QUICK_DATES.map((option) => ({ value: option.value, label: tr(option.zh, option.en, option.ms) })),
                { value: 'custom', label: tr('选择日期', 'Choose date', "Pilih tarikh") }
              ]}
              onChange={(value) => {
                if (value === 'custom') {
                  setCustomDateLeadId(lead.id);
                  return;
                }

                const option = FOLLOW_UP_QUICK_DATES.find((item) => item.value === value);
                onUpdateLead(lead.id, {
                  next_follow_up_at: option ? getFollowUpIsoInDays(option.days) : ''
                });
                setCustomDateLeadId(null);
              }}
              ariaLabel={`Set next follow up for ${lead.name || lead.id}`}
              optionClassName="min-h-7 px-2 py-1"
            />
            {isCustomDateOpen ? (
              <input
                type="date"
                autoFocus={customDateLeadId === lead.id}
                value={formatDateInputValue(resolvedNextFollowUpAt)}
                onChange={(event) => {
                  const nextFollowUpAt = getFollowUpIsoFromDateInput(event.target.value);
                  if (nextFollowUpAt) {
                    onUpdateLead(lead.id, { next_follow_up_at: nextFollowUpAt });
                    setCustomDateLeadId(null);
                  }
                }}
                className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 font-mono text-[10px] font-semibold text-slate-600 outline-none focus:ring-1 focus:ring-indigo-100"
                aria-label={`Choose next follow up date for ${lead.name || lead.id}`}
              />
            ) : (
              <p className="font-mono text-[10px] font-semibold text-slate-400">
                {formatShortDate(resolvedNextFollowUpAt)}
              </p>
            )}
          </div>
        </div>
        <div className="overflow-hidden px-5 py-2.5 align-top">
          <div className="mb-1.5 flex max-h-6 flex-wrap gap-1 overflow-hidden">
            {QUICK_NOTE_PHRASES.map(([zhPhrase, enPhrase, msPhrase]) => {
              const phrase = tr(zhPhrase, enPhrase, msPhrase);

              return (
                <button
                  key={zhPhrase}
                  type="button"
                  onClick={() => onUpdateLead(lead.id, {
                    follow_up_note: lead.follow_up_note ? `${lead.follow_up_note} / ${phrase}` : phrase,
                    last_follow_up_at: new Date().toISOString()
                  })}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                  title={tr('点一下写入备注并记录跟进时间', 'One tap writes the note and stamps the follow-up time', "Satu ketikan menulis nota dan mengecap masa susulan")}
                >
                  {phrase}
                </button>
              );
            })}
          </div>
          <FollowUpNoteField
            value={lead.follow_up_note || ''}
            onCommit={(next) => onUpdateLead(lead.id, { follow_up_note: next })}
            placeholder={tr('跟进备注', 'Follow up note', "nota susulan")}
            className="w-full resize-none rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:ring-1 focus:ring-indigo-100"
          />
        </div>
        <div className="overflow-hidden px-5 py-2.5 align-top">
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onOpenWhatsApp(lead, 'web')}
              disabled={!phoneNumber}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <MessageCircle className="h-4 w-4" />
              Web
            </button>
            {(canViewAllFollowUps || lead.taken_by_staff_name === currentStaffName) && (
              <button
                type="button"
                onClick={() => onReleaseLead(lead)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title={tr('放回未分配，让其他同事可以跟进', 'Return to unassigned so others can follow up', "Kembalikan ke senarai belum ditugaskan supaya orang lain boleh membuat susulan")}
              >
                <Undo2 className="h-4 w-4" />
                {tr('放回去', 'Return', "Kembali")}
              </button>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div id="raw-customer-follow-up-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('跟进', 'Follow Up', "Susulan")}</h2>
          <p className="max-w-3xl text-xs font-light leading-relaxed text-slate-500">
            {tr('你负责跟进的客户会在这里。', 'Follow up your assigned leads here.', "Buat susulan bagi prospek yang ditugaskan kepada anda di sini.")}
          </p>
        </div>

        <div className="relative self-start md:self-auto">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={tr('搜索跟进名单...', 'Search follow up...', "Carian susulan...")}
            className="w-80 rounded-lg border border-slate-100 bg-white py-2 pl-9 pr-4 text-xs outline-none transition-all focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100"
          />
        </div>
      </section>

      {/* Stat cards removed: the filter chips below carry the same counts. */}
      <section className="flex flex-wrap gap-2">
        {filterButtons
          .filter((item) => item.key !== 'all' || canViewAllFollowUps)
          .map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                filter === item.key
                  ? 'bg-red-800 text-white'
                  : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                filter === item.key
                  ? 'bg-white/15 text-white'
                  : item.key === 'overdue' && Number(item.value) > 0
                    ? 'bg-rose-50 font-bold text-rose-600'
                    : item.key === 'interested' && Number(item.value) > 0
                      ? 'bg-emerald-50 font-bold text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
              }`}
              >
                {item.value}
              </span>
            </button>
          ))}
      </section>

      <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1560px] text-left">
            <div
              className="grid border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700"
              style={{ gridTemplateColumns: FOLLOW_UP_GRID_COLUMNS }}
            >
              <div className="px-5 py-3.5">{tr('名单', 'Lead', "Prospek")}</div>
              <div className="px-5 py-3.5">{tr('电话', 'Phone', "Telefon")}</div>
              <div className="px-5 py-3.5">{tr('负责人', 'Owner', "Pemilik")}</div>
              <div className="px-5 py-3.5">{tr('跟进状态', 'Status', "Status")}</div>
              <div className="px-5 py-3.5">{tr('上次跟进', 'Last Follow Up', "Susulan terakhir")}</div>
              <div className="px-5 py-3.5">{tr('下次跟进', 'Next Follow Up', "Susulan seterusnya")}</div>
              <div className="px-5 py-3.5">{tr('备注', 'Note', "Nota")}</div>
              <div className="px-5 py-3.5">WhatsApp</div>
            </div>

            {visibleLeads.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">
                {takenLeads.length === 0
                  ? tr('还没有要跟进的客户。去「潜在客户名单」双击电话后，客户就会出现在这里。', 'No assigned leads yet. Double-click a phone number in Lead Pool and it will show up here.', "Belum ada prospek yang ditugaskan. Klik dua kali nombor telefon dalam Kumpulan Prospek dan nombor itu akan dipaparkan di sini.")
                  : tr('当前筛选没有要跟进的名单。Admin 可切 All Staff，Sales 默认只看 Mine。', 'No leads in this filter. Admins can switch to All Staff; Sales defaults to Mine.', "Tiada prospek dalam penapis ini. Pentadbir boleh bertukar kepada Semua Kakitangan; Jualan lalai kepada Milik.")}
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="relative overflow-y-auto"
                style={{ height: Math.min(FOLLOW_UP_TABLE_HEIGHT, virtualWindow.totalHeight) }}
                onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
              >
                <div className="relative" style={{ height: virtualWindow.totalHeight }}>
                  {virtualWindow.visibleRows.map((lead, index) => (
                    <div
                      key={lead.id}
                      className="absolute left-0 right-0 grid border-b border-slate-50 text-sm transition-colors hover:bg-indigo-50/30"
                      style={{
                        gridTemplateColumns: FOLLOW_UP_GRID_COLUMNS,
                        height: FOLLOW_UP_ROW_HEIGHT,
                        transform: `translateY(${(virtualWindow.startIndex + index) * FOLLOW_UP_ROW_HEIGHT}px)`
                      }}
                    >
                      {renderLeadCells(lead)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
