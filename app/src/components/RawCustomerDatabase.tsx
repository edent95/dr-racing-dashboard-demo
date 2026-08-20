/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileUp, LockKeyhole, MessageCircle, Plus, UserCheck, X } from 'lucide-react';
import { CustomerRawMatch, CustomerRiskField, RawCustomerChannel, RawCustomerLead, RoleAccount, STATUS_CONFIG } from '../types';
import StaffNameBadge from './StaffNameBadge';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import ToggleSwitch from './ToggleSwitch';
import ToggleOptionGroup from './ToggleOptionGroup';
import { useDebouncedValue } from '../utils/tableUx';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';
import { parseTikTokLeadCsv } from '../utils/rawLeadEntry';
import { tr, trFollowUpStatus } from '../lib/i18n';
import claimedLeadsIcon from '../assets/icons/nav/claimedLeads.png';
import duplicatePhonesIcon from '../assets/icons/nav/duplicatePhones.png';
import inCustomersIcon from '../assets/icons/nav/inCustomers.png';
import publicLeadsIcon from '../assets/icons/nav/publicLeads.png';
import searchIcon from '../assets/icons/nav/search.png';
import totalLeadsIcon from '../assets/icons/nav/totalLeads.png';
import uniquePhonesIcon from '../assets/icons/nav/uniquePhones.png';

interface RawCustomerDatabaseProps {
  rawCustomers: RawCustomerLead[];
  rawMatchesByLeadId: Record<string, CustomerRawMatch[]>;
  roleAccounts: RoleAccount[];
  currentStaffName: string;
  currentStaffRole: RoleAccount['role'];
  canImportLeads: boolean;
  onImportLeads: (leads: RawCustomerLead[]) => void;
  onAddLead: (lead: RawCustomerLead) => void;
  onOpenWhatsApp: (lead: RawCustomerLead, target: 'api' | 'web') => void;
}

type MatchFilter = 'all' | 'applied' | 'potential' | 'duplicated';
type ScopeFilter = 'all' | 'public' | 'taken' | 'private' | 'mine';
type RawFilterGroup = 'channel' | 'status' | 'match' | 'scope';
type RawCustomerSortKey =
  | 'name'
  | 'phone_no'
  | 'channel'
  | 'raw_status'
  | 'match'
  | 'received_at';

const RAW_LEAD_ROW_HEIGHT = 72;
const RAW_LEAD_TABLE_HEIGHT = 648;
const RAW_LEAD_OVERSCAN_ROWS = 6;
const RAW_LEAD_GRID_COLUMNS = '220px 190px 220px 260px 360px 150px';

const MATCH_FIELD_LABELS: Record<CustomerRiskField, string> = {
  ic_no: 'IC',
  phone_no: 'Phone',
  account_number: 'Account',
  email: 'Email'
};

const formatCompactReceivedAt = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '--';

  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date);
  const year = new Intl.DateTimeFormat('en-GB', { year: '2-digit' }).format(date);
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

  return `${day} / ${month} / ${year} · ${time}`;
};

function StatIcon({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" className="h-12 w-12 shrink-0 object-contain" />;
}

export default function RawCustomerDatabase({
  rawCustomers,
  rawMatchesByLeadId,
  roleAccounts,
  currentStaffName,
  currentStaffRole,
  canImportLeads,
  onImportLeads,
  onAddLead,
  onOpenWhatsApp
}: RawCustomerDatabaseProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hideContactedStatus, setHideContactedStatus] = useState(true);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [expandedFilterGroups, setExpandedFilterGroups] = useState<Record<RawFilterGroup, boolean>>({
    channel: false,
    status: false,
    match: false,
    scope: false
  });
  const [importMessage, setImportMessage] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualDraft, setManualDraft] = useState({
    name: '',
    phone_no: '',
    email: '',
    ic_no: '',
    account_number: '',
    username: '',
    channel: 'TikTok' as RawCustomerChannel
  });

  const visibleRawCustomers = useMemo(() => rawCustomers.filter((lead) => {
    if (currentStaffRole === 'Super Admin' || lead.lead_visibility !== 'Private') {
      return true;
    }

    return (lead.created_by_staff_name || lead.taken_by_staff_name) === currentStaffName;
  }), [currentStaffName, currentStaffRole, rawCustomers]);

  const collapseAllFilterGroups = () => {
    setExpandedFilterGroups({ channel: false, status: false, match: false, scope: false });
  };

  // Close expanded filter menus on outside click or Escape.
  useEffect(() => {
    if (!Object.values(expandedFilterGroups).some(Boolean)) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target?.closest('[data-filter-switch-group]')) {
        collapseAllFilterGroups();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        collapseAllFilterGroups();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedFilterGroups]);
  const [sortState, setSortState] = useState<SortState<RawCustomerSortKey>>({
    key: 'received_at',
    direction: 'desc'
  });

  const channels = useMemo(() => Array.from(new Set(visibleRawCustomers.map((lead) => lead.channel))).sort(), [visibleRawCustomers]);
  const rawStatuses = useMemo(() => Array.from(new Set(visibleRawCustomers.map((lead) => lead.raw_status).filter(Boolean))).sort(), [visibleRawCustomers]);
  const phoneLeadCounts = useMemo<Map<string, number>>(() => {
    const counts = new Map<string, number>();

    visibleRawCustomers.forEach((lead) => {
      const phoneKey = normalizePhoneDigits(lead.phone_no);

      if (!phoneKey) {
        return;
      }

      counts.set(phoneKey, (counts.get(phoneKey) || 0) + 1);
    });

    return counts;
  }, [visibleRawCustomers]);

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const enrichedCustomers = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();

    const getSortValue = (lead: RawCustomerLead, leadMatches: CustomerRawMatch[]) => {
      if (sortState.key === 'received_at') {
        return new Date(lead.received_at).getTime();
      }

      if (sortState.key === 'match') {
        return leadMatches.length;
      }

      return String(lead[sortState.key] || '').toLowerCase();
    };

    return visibleRawCustomers
      .map((lead) => ({
        lead,
        phoneKey: normalizePhoneDigits(lead.phone_no),
        leadMatches: rawMatchesByLeadId[lead.id] || []
      }))
      .filter(({ lead, phoneKey, leadMatches }) => {
        if (channelFilter !== 'all' && lead.channel !== channelFilter) {
          return false;
        }

        if (statusFilter !== 'all' && lead.raw_status !== statusFilter) {
          return false;
        }

        if (statusFilter === 'all' && hideContactedStatus && lead.raw_status.trim().toLowerCase() === 'contacted') {
          return false;
        }

        if (matchFilter === 'applied' && leadMatches.length === 0) {
          return false;
        }

        if (matchFilter === 'potential' && leadMatches.length > 0) {
          return false;
        }

        if (matchFilter === 'duplicated' && (phoneLeadCounts.get(phoneKey) || 0) <= 1) {
          return false;
        }

        const isTaken = lead.lead_scope === 'Taken Lead' || Boolean(lead.taken_by_staff_name);

        if (scopeFilter === 'public' && (isTaken || lead.lead_visibility === 'Private')) {
          return false;
        }

        if (scopeFilter === 'taken' && !isTaken) {
          return false;
        }

        if (scopeFilter === 'private' && lead.lead_visibility !== 'Private') {
          return false;
        }

        if (scopeFilter === 'mine' && lead.taken_by_staff_name !== currentStaffName) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          lead.name.toLowerCase().includes(query) ||
          lead.phone_no.toLowerCase().includes(query) ||
          lead.username.toLowerCase().includes(query) ||
          lead.lead_id.toLowerCase().includes(query) ||
          lead.raw_status.toLowerCase().includes(query) ||
          lead.source_traffic.toLowerCase().includes(query) ||
          (lead.taken_by_staff_name || '').toLowerCase().includes(query) ||
          (lead.follow_up_status || '').toLowerCase().includes(query) ||
          (lead.ic_no || '').toLowerCase().includes(query) ||
          (lead.account_number || '').toLowerCase().includes(query) ||
          leadMatches.some((match) => (
            match.customer_name.toLowerCase().includes(query) ||
            match.customer_id.toLowerCase().includes(query) ||
            match.handler_name.toLowerCase().includes(query)
          ))
        );
      })
      .sort((a, b) => {
        const aTakenPriority = a.lead.lead_scope === 'Taken Lead' || a.lead.taken_by_staff_name ? 1 : 0;
        const bTakenPriority = b.lead.lead_scope === 'Taken Lead' || b.lead.taken_by_staff_name ? 1 : 0;

        if (aTakenPriority !== bTakenPriority) {
          return aTakenPriority - bTakenPriority;
        }

        return compareSortValues(
          getSortValue(a.lead, a.leadMatches),
          getSortValue(b.lead, b.leadMatches),
          sortState.direction
        );
      });
  }, [channelFilter, currentStaffName, hideContactedStatus, matchFilter, phoneLeadCounts, visibleRawCustomers, rawMatchesByLeadId, scopeFilter, debouncedSearchTerm, sortState, statusFilter]);

  useEffect(() => {
    setScrollTop(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [debouncedSearchTerm, channelFilter, statusFilter, scopeFilter, matchFilter, hideContactedStatus, sortState.key, sortState.direction]);

  const virtualWindow = useMemo(() => {
    const viewportRowCount = Math.ceil(RAW_LEAD_TABLE_HEIGHT / RAW_LEAD_ROW_HEIGHT);
    const startIndex = Math.max(Math.floor(scrollTop / RAW_LEAD_ROW_HEIGHT) - RAW_LEAD_OVERSCAN_ROWS, 0);
    const endIndex = Math.min(startIndex + viewportRowCount + (RAW_LEAD_OVERSCAN_ROWS * 2), enrichedCustomers.length);

    return {
      startIndex,
      visibleRows: enrichedCustomers.slice(startIndex, endIndex),
      totalHeight: enrichedCustomers.length * RAW_LEAD_ROW_HEIGHT
    };
  }, [enrichedCustomers, scrollTop]);

  const matchedCount = useMemo(() => {
    return visibleRawCustomers.filter((lead) => (rawMatchesByLeadId[lead.id] || []).length > 0).length;
  }, [visibleRawCustomers, rawMatchesByLeadId]);

  const uniquePhoneCount = useMemo(() => {
    return new Set(visibleRawCustomers.map((lead) => normalizePhoneDigits(lead.phone_no)).filter(Boolean)).size;
  }, [visibleRawCustomers]);

  const duplicatedPhoneCount = useMemo(() => {
    return Array.from(phoneLeadCounts.values() as Iterable<number>).filter((count) => count > 1).length;
  }, [phoneLeadCounts]);

  const takenCount = useMemo(() => visibleRawCustomers.filter((lead) => lead.lead_scope === 'Taken Lead' || Boolean(lead.taken_by_staff_name)).length, [visibleRawCustomers]);
  const publicCount = useMemo(() => visibleRawCustomers.filter((lead) => (
    lead.lead_visibility !== 'Private' && lead.lead_scope !== 'Taken Lead' && !lead.taken_by_staff_name
  )).length, [visibleRawCustomers]);
  const privateCount = useMemo(() => visibleRawCustomers.filter((lead) => lead.lead_visibility === 'Private').length, [visibleRawCustomers]);
  const contactedRawStatusCount = useMemo(() => visibleRawCustomers.filter((lead) => lead.raw_status.trim().toLowerCase() === 'contacted').length, [visibleRawCustomers]);
  const channelFilterOptions = [
    { value: 'all', label: tr('全部渠道', 'All channels', "Semua saluran") },
    ...channels.map((channel) => ({ value: channel, label: channel }))
  ];
  const statusFilterOptions = [
    { value: 'all', label: tr('全部原始状态', 'All raw status', "Semua status mentah") },
    ...rawStatuses.map((status) => ({ value: status, label: status }))
  ];
  const matchFilterOptions: Array<{ value: MatchFilter; label: string }> = [
    { value: 'all', label: tr('全部匹配状态', 'All match status', "Semua status perlawanan") },
    { value: 'applied', label: tr('有申请关系', 'Has application link', "Mempunyai pautan permohonan") },
    { value: 'potential', label: tr('无关系（纯线索）', 'Lead only (no link)', "prospek sahaja (tiada pautan)") },
    { value: 'duplicated', label: tr('重复号码', 'Duplicated numbers', "Nombor pendua") }
  ];
  const scopeFilterOptions: Array<{ value: ScopeFilter; label: string }> = [
    { value: 'all', label: tr('全部名单', 'All leads', "Semua prospek") },
    { value: 'public', label: tr('未分配', 'Unassigned', "Belum Ditugaskan") },
    { value: 'taken', label: tr('已有人跟', 'Assigned', "Ditugaskan") },
    { value: 'private', label: tr('私人名单', 'Private', "Persendirian") },
    { value: 'mine', label: tr('我跟的', 'Mine', "Milik Saya") }
  ];

  const renderFilterSwitches = (
    group: RawFilterGroup,
    selectedValue: string,
    options: Array<{ value: string; label: string }>,
    onSelect: (value: string) => void
  ) => {
    const selectedOption = options.find((option) => option.value === selectedValue) || options[0];
    const isExpanded = Boolean(expandedFilterGroups[group]);

    // Collapsed switch stays put as the anchor; the full option list opens as
    // an animated popover below it, so the filter bar never reflows.
    return (
      <div data-filter-switch-group className="relative flex flex-wrap gap-2">
        <ToggleSwitch
          checked
          onChange={() => {
            setExpandedFilterGroups((current) => ({
              ...current,
              [group]: !current[group]
            }));
          }}
          label={selectedOption.label}
          className="bg-slate-50 ring-1 ring-slate-100"
        />

        {isExpanded && (
          <div className="toggle-pop absolute left-0 top-full z-30 mt-1 inline-flex w-max min-w-44 flex-col items-stretch gap-0.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60">
            {options.map((option) => {
              const isActive = option.value === selectedValue;

              return (
                <React.Fragment key={`${group}-${option.value}`}>
                  <ToggleSwitch
                    checked={isActive}
                    onChange={() => {
                      if (!isActive) {
                        onSelect(option.value);
                      }

                      setExpandedFilterGroups((current) => ({
                        ...current,
                        [group]: false
                      }));
                    }}
                    label={option.label}
                    className={`w-full rounded-lg ${isActive ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}`}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleSort = (key: RawCustomerSortKey, defaultDirection: SortDirection = key === 'received_at' || key === 'match' ? 'desc' : 'asc') => {
    setSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const leads = parseTikTokLeadCsv(String(reader.result || ''));
        onImportLeads(leads);
        setImportMessage(tr(`${file.name}：解析到 ${leads.length} 个 TikTok 潜在客户`, `${file.name}: ${leads.length} TikTok leads parsed`, `${file.name}: ${leads.length} Prospek TikTok dihuraikan`));
      } catch (error) {
        setImportMessage(error instanceof Error ? error.message : tr('CSV 导入失败', 'CSV import failed', "Import CSV gagal"));
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = manualDraft.name.trim();
    const phoneNo = manualDraft.phone_no.trim();

    if (!name || !phoneNo) {
      setImportMessage(tr('姓名和电话号码不能为空', 'Name and phone number are required', "Nama dan nombor telefon diperlukan"));
      return;
    }

    const now = new Date().toISOString();
    const uniquePart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
      : `${Date.now()}${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
    const lead: RawCustomerLead = {
      id: `RAW-MANUAL-${uniquePart}`,
      channel: manualDraft.channel,
      lead_id: `MANUAL-${uniquePart}`,
      username: manualDraft.username.trim(),
      received_at: now,
      raw_status: 'Raw',
      source_traffic: 'Manual',
      source_action: 'Staff Entry',
      source_scenario: '',
      name,
      ic_no: manualDraft.ic_no.trim(),
      phone_no: phoneNo,
      account_number: manualDraft.account_number.trim(),
      email: manualDraft.email.trim(),
      work_phone: '',
      work_email: '',
      whatsapp: phoneNo,
      messenger: '',
      instagram: '',
      facebook: '',
      tiktok: manualDraft.channel === 'TikTok' ? manualDraft.username.trim() : '',
      city: '',
      state: '',
      country: 'Malaysia',
      company_name: '',
      job_title: '',
      imported_at: now,
      entry_method: 'Manual Entry'
    };

    onAddLead(lead);
    setManualDraft({ name: '', phone_no: '', email: '', ic_no: '', account_number: '', username: '', channel: 'TikTok' });
    setShowManualEntry(false);
    setImportMessage(currentStaffRole === 'Sales'
      ? tr(`已新增私人名单：${name}`, `Private lead added: ${name}`, `Prospek peribadi ditambah: ${name}`)
      : tr(`已新增名单：${name}`, `Lead added: ${name}`, `prospek ditambah: ${name}`));
  };

  return (
    <div id="raw-customer-database-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('潜在客户名单', 'Lead Pool', "Kumpulan Prospek")}</h2>
          <p className="max-w-3xl text-xs font-light leading-relaxed text-slate-500">
            {tr('双击电话号码就会打开 WhatsApp，并把客户交给你跟进。', 'Double-click a phone number to assign the lead to you and open WhatsApp.', "Klik dua kali nombor telefon untuk memberikan prospek kepada anda dan buka WhatsApp.")}
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canImportLeads}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <FileUp className="h-4 w-4" />
            {tr('导入 TikTok CSV', 'Import TikTok CSV', "Import TikTok CSV")}
          </button>
          <button
            type="button"
            onClick={() => setShowManualEntry(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            {tr('手动新增', 'Add Lead', "Tambah prospek")}
          </button>
          <div className="relative self-start md:self-auto">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <img src={searchIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={tr('搜索客户名单、电话、客户...', 'Search lead, phone, customer...', "Cari prospek, telefon, pelanggan...")}
              className="w-80 rounded-lg border border-slate-100 bg-white py-2 pl-9 pr-4 text-xs outline-none transition-all focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100"
            />
          </div>
        </div>
      </section>

      {importMessage && (
        <p className="rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white">{importMessage}</p>
      )}

      {showManualEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-label={tr('手动新增潜在客户', 'Add lead manually', "Tambah prospek secara manual")}>
          <form onSubmit={handleManualSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{tr('手动新增潜在客户', 'Add Lead Manually', "Tambah prospek Secara Manual")}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {currentStaffRole === 'Sales'
                    ? tr('新增后只会出现在你的私人名单。', 'This lead will be added to your private list.', "Prospek ini akan ditambahkan ke senarai peribadi anda.")
                    : tr('新增后会进入未分配名单。', 'This lead will be added to the unassigned pool.', "Prospek ini akan ditambah ke senarai belum ditugaskan.")}
                </p>
              </div>
              <button type="button" onClick={() => setShowManualEntry(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={tr('关闭', 'Close', "Tutup")}><X className="h-4 w-4" /></button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {tr('姓名', 'Name', "Nama")} <span className="text-red-700">*</span>
                <input value={manualDraft.name} onChange={(event) => setManualDraft((draft) => ({ ...draft, name: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" autoFocus />
              </label>
              <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {tr('电话号码', 'Phone Number', "Nombor Telefon")} <span className="text-red-700">*</span>
                <input value={manualDraft.phone_no} onChange={(event) => setManualDraft((draft) => ({ ...draft, phone_no: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" inputMode="tel" />
              </label>
              <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {tr('渠道', 'Channel', "Saluran")}
                <ToggleOptionGroup value={manualDraft.channel} onChange={(value) => setManualDraft((draft) => ({ ...draft, channel: value as RawCustomerChannel }))} ariaLabel={tr('渠道', 'Channel', "Saluran")} className="mt-1 h-10 w-full rounded-lg bg-slate-50 ring-1 ring-slate-100" options={(['TikTok', 'Facebook', 'Instagram', 'Google', 'Walk-in', 'Other'] as RawCustomerChannel[]).map((channel) => ({ value: channel, label: channel }))} />
              </label>
              <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {tr('用户名', 'Username', "Nama pengguna")}
                <input value={manualDraft.username} onChange={(event) => setManualDraft((draft) => ({ ...draft, username: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" />
              </label>
              <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                IC
                <input value={manualDraft.ic_no} onChange={(event) => setManualDraft((draft) => ({ ...draft, ic_no: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" />
              </label>
              <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {tr('银行户口', 'Bank Account', "Akaun Bank")}
                <input value={manualDraft.account_number} onChange={(event) => setManualDraft((draft) => ({ ...draft, account_number: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" />
              </label>
              <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:col-span-2">
                {tr('电邮', 'Email', "E-mel")}
                <input value={manualDraft.email} onChange={(event) => setManualDraft((draft) => ({ ...draft, email: event.target.value }))} className="mt-1 h-10 w-full rounded-lg bg-slate-50 px-3 text-xs font-normal normal-case tracking-normal text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-red-100" inputMode="email" />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowManualEntry(false)} className="rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200">{tr('取消', 'Cancel', "Batal")}</button>
              <button type="submit" className="rounded-lg bg-red-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-900">{tr('新增名单', 'Add Lead', "Tambah prospek")}</button>
            </div>
          </form>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-8">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('名单总数', 'Total Leads', "Jumlah prospek")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{visibleRawCustomers.length}</p>
            </div>
            <StatIcon src={totalLeadsIcon} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setScopeFilter('public')}
          className={`rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-colors hover:bg-blue-50/40 ${
            scopeFilter === 'public' ? 'ring-2 ring-blue-100' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('未分配名单', 'Unassigned Leads', "Prospek yang tidak ditugaskan")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{publicCount}</p>
            </div>
            <StatIcon src={publicLeadsIcon} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setScopeFilter('private')}
          className={`rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-colors hover:bg-violet-50/40 ${
            scopeFilter === 'private' ? 'ring-2 ring-violet-100' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('私人名单', 'Private Leads', "prospek peribadi")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{privateCount}</p>
            </div>
            <LockKeyhole className="h-10 w-10 text-violet-500" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setScopeFilter('taken')}
          className={`rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-colors hover:bg-indigo-50/40 ${
            scopeFilter === 'taken' ? 'ring-2 ring-indigo-100' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('已有人跟', 'Assigned Leads', "Prospek yang ditugaskan")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{takenCount}</p>
            </div>
            <StatIcon src={claimedLeadsIcon} />
          </div>
        </button>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('不重复号码', 'Unique Phones', "Telefon Unik")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{uniquePhoneCount}</p>
            </div>
            <StatIcon src={uniquePhonesIcon} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMatchFilter('duplicated')}
          className={`rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-colors hover:bg-rose-50/40 ${
            matchFilter === 'duplicated' ? 'ring-2 ring-rose-100' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('重复号码', 'Duplicated Phones', "Telefon Pendua")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{duplicatedPhoneCount}</p>
            </div>
            <StatIcon src={duplicatePhonesIcon} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMatchFilter((current) => (current === 'applied' ? 'all' : 'applied'))}
          className={`rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-colors hover:bg-emerald-50/40 ${
            matchFilter === 'applied' ? 'ring-2 ring-emerald-100' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('有申请关系', 'Has App. Link', "Mempunyai Apl. Pautan")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{matchedCount}</p>
            </div>
            <StatIcon src={inCustomersIcon} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMatchFilter((current) => (current === 'potential' ? 'all' : 'potential'))}
          className={`rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-colors hover:bg-slate-50 ${
            matchFilter === 'potential' ? 'ring-2 ring-slate-200' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('无关系（纯线索）', 'Lead Only', "prospek Sahaja")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{visibleRawCustomers.length - matchedCount}</p>
            </div>
            <StatIcon src={publicLeadsIcon} />
          </div>
        </button>
      </section>

      <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('渠道', 'Channel', "Saluran")}</span>
          <div className="flex flex-wrap gap-2">
            {renderFilterSwitches('channel', channelFilter, channelFilterOptions, setChannelFilter)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('原始状态', 'Raw Status', "Status Mentah")}</span>
          <div className="flex flex-wrap gap-2">
            {renderFilterSwitches('status', statusFilter, statusFilterOptions, setStatusFilter)}
            {statusFilter === 'all' && contactedRawStatusCount > 0 && (
              <ToggleSwitch
                checked={hideContactedStatus}
                onChange={setHideContactedStatus}
                label={tr('隐藏已联系', 'Hide Contacted', "Sembunyikan Dihubungi")}
                count={contactedRawStatusCount}
                className="bg-slate-50 ring-1 ring-slate-100"
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('匹配', 'Match', "Perlawanan")}</span>
          <div className="flex flex-wrap gap-2">
            {renderFilterSwitches('match', matchFilter, matchFilterOptions, (value) => setMatchFilter(value as MatchFilter))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('归属', 'Scope', "Skop")}</span>
          <div className="flex flex-wrap gap-2">
            {renderFilterSwitches('scope', scopeFilter, scopeFilterOptions, (value) => setScopeFilter(value as ScopeFilter))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <p className="border-b border-slate-100/60 bg-slate-50/60 px-4 py-1.5 text-[10px] font-semibold text-slate-400">
          {tr('双击电话号码 = 开 WhatsApp + 交给你跟进', 'Double-click a phone number = assign it to you and open WhatsApp', "Klik dua kali nombor telefon = berikannya kepada anda dan buka WhatsApp")}
        </p>
        <div className="overflow-x-auto">
          <div className="min-w-[1400px] text-left">
            <div
              className="grid border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700"
              style={{ gridTemplateColumns: RAW_LEAD_GRID_COLUMNS }}
            >
              <div className="px-4 py-2.5 whitespace-nowrap">
                <SortableHeader sortKey="name" label={tr('客户名单', 'Lead', "Prospek")} sortState={sortState} onSort={handleSort} />
              </div>
              <div className="px-4 py-2.5 whitespace-nowrap">
                <SortableHeader sortKey="phone_no" label={tr('电话', 'Phone', "Telefon")} sortState={sortState} onSort={handleSort} />
              </div>
              <div className="px-4 py-2.5 whitespace-nowrap">
                <SortableHeader sortKey="channel" label={tr('来源', 'Source', "Sumber")} sortState={sortState} onSort={handleSort} />
              </div>
              <div className="px-4 py-2.5 whitespace-nowrap">
                <SortableHeader sortKey="raw_status" label={tr('状态 / 归属', 'Status / Assignment', "Status / Penugasan")} sortState={sortState} onSort={handleSort} />
              </div>
              <div className="px-4 py-2.5 whitespace-nowrap">
                <SortableHeader sortKey="match" label={tr('客户匹配', 'Customer Match', "Padanan Pelanggan")} sortState={sortState} onSort={handleSort} defaultDirection="desc" />
              </div>
              <div className="px-4 py-2.5 whitespace-nowrap">
                <SortableHeader sortKey="received_at" label={tr('接收时间', 'Received', "Diterima")} sortState={sortState} onSort={handleSort} defaultDirection="desc" />
              </div>
            </div>

            {enrichedCustomers.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">
                {tr('没有找到符合条件的名单', 'No leads match the current filters', "Tiada prospek sepadan dengan penapis semasa")}
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="relative overflow-y-auto"
                style={{ height: Math.min(RAW_LEAD_TABLE_HEIGHT, virtualWindow.totalHeight) }}
                onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
              >
                <div className="relative" style={{ height: virtualWindow.totalHeight }}>
                  {virtualWindow.visibleRows.map(({ lead, phoneKey, leadMatches }, index) => {
                    const primaryMatch = leadMatches[0];
                    const statusConfig = primaryMatch ? STATUS_CONFIG[primaryMatch.customer_status] : undefined;
                    const duplicateCount = phoneLeadCounts.get(phoneKey) || 0;
                    const matchedFields: CustomerRiskField[] = Array.from(new Set<CustomerRiskField>(leadMatches.flatMap((match) => match.matched_fields)));

                    return (
                      <div
                        key={lead.id}
                        className="absolute left-0 right-0 grid border-b border-slate-50 text-sm transition-colors hover:bg-indigo-50/30"
                        style={{
                          gridTemplateColumns: RAW_LEAD_GRID_COLUMNS,
                          height: RAW_LEAD_ROW_HEIGHT,
                          transform: `translateY(${(virtualWindow.startIndex + index) * RAW_LEAD_ROW_HEIGHT}px)`
                        }}
                      >
                        <div className="flex min-w-0 flex-col justify-center overflow-hidden px-4 py-2 align-top">
                          <p className="truncate font-bold text-slate-800" title={lead.name || lead.username}>
                            {lead.name || 'Unnamed lead'}
                          </p>
                          <p className="mt-1 truncate text-[10px] font-semibold text-slate-400" title={`@${lead.username || 'no username'} · ${lead.lead_id || lead.id}`}>
                            @{lead.username || 'no username'} <span className="px-1 text-slate-300">·</span><span className="font-mono font-normal">{lead.lead_id || lead.id}</span>
                          </p>
                        </div>
                        <div
                          className="flex min-w-0 items-center overflow-hidden px-4 py-2 align-top font-mono text-xs text-slate-600"
                          onDoubleClick={() => onOpenWhatsApp(lead, 'api')}
                          title={lead.phone_no ? `${tr('双击打开 WhatsApp，并交给你跟进', 'Double-click to assign this lead to you and open WhatsApp', "Klik dua kali untuk memberikan prospek ini kepada anda dan buka WhatsApp")}\n${[lead.email, lead.ic_no && `IC ${lead.ic_no}`, lead.account_number && `Acct ${lead.account_number}`].filter(Boolean).join('\n')}` : undefined}
                        >
                          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 truncate whitespace-nowrap rounded-md px-1 py-0.5 transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                            {lead.phone_no && <MessageCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                            <span className="truncate">{lead.phone_no || '--'}</span>
                          </span>
                          {duplicateCount > 1 && <span className="ml-1 shrink-0 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">×{duplicateCount}</span>}
                        </div>
                        <div className="flex min-w-0 items-center gap-2 overflow-hidden px-4 py-2 align-top" title={`${lead.channel} · ${[lead.source_traffic, lead.source_action, lead.source_scenario].filter(Boolean).join(' / ') || '--'}`}>
                          <span className="inline-flex shrink-0 rounded-full bg-red-800 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            {lead.channel}
                          </span>
                          <p className="truncate text-[10px] font-semibold text-slate-500">
                            {[lead.source_traffic, lead.source_action, lead.source_scenario].filter(Boolean).join(' / ') || '--'}
                          </p>
                        </div>
                        <div className="flex min-w-0 flex-col justify-center overflow-hidden px-4 py-2 align-top">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="inline-flex shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                              {lead.raw_status || 'Raw'}
                            </span>
                          {lead.lead_visibility === 'Private' && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                              <LockKeyhole className="h-3 w-3" />
                              {tr('私人', 'Private', "Persendirian")}
                            </span>
                          )}
                          {lead.lead_scope === 'Taken Lead' || lead.taken_by_staff_name ? (
                              <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                                <UserCheck className="h-3 w-3" />
                                {tr('已有人跟', 'Assigned', "Ditugaskan")}
                              </span>
                          ) : (
                              <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                {tr('未分配', 'Unassigned', "Belum Ditugaskan")}
                              </span>
                            )}
                          </div>
                          {lead.lead_scope === 'Taken Lead' || lead.taken_by_staff_name ? (
                            <div className="mt-1 flex min-w-0 items-center gap-2 overflow-hidden">
                                <StaffNameBadge
                                  name={lead.taken_by_staff_name}
                                  role={lead.taken_by_staff_role}
                                  roleAccounts={roleAccounts}
                                  avatarClassName="h-5 w-5"
                                  nameClassName="truncate text-[10px] font-bold text-slate-500"
                                  roleClassName="hidden"
                                />
                              <span className="shrink-0 text-[10px] font-semibold text-slate-400">· {trFollowUpStatus(lead.follow_up_status || 'New')}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex min-w-0 flex-col justify-center overflow-hidden px-4 py-2 align-top">
                          {primaryMatch ? (
                            <div className="min-w-0" title={`${primaryMatch.customer_name}\n${primaryMatch.customer_id}\n${primaryMatch.handler_name}\n${matchedFields.map((field) => MATCH_FIELD_LABELS[field]).join(', ')}`}>
                              <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                                <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                                  {tr('已在客户资料', 'In Customers', "Dalam Pelanggan")}
                                </span>
                                {statusConfig && (
                                  <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                                    {primaryMatch.customer_status}
                                  </span>
                                )}
                                <span className="min-w-0 truncate text-[11px] font-bold text-slate-700">{primaryMatch.customer_name}</span>
                              </div>
                              <div className="mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden">
                                <span className="max-w-28 truncate font-mono text-[10px] text-slate-400">{primaryMatch.customer_id}</span>
                                <StaffNameBadge
                                  name={primaryMatch.handler_name}
                                  roleAccounts={roleAccounts}
                                  avatarClassName="h-5 w-5"
                                  nameClassName="truncate text-[10px] font-bold text-slate-500"
                                  roleClassName="hidden"
                                />
                                {matchedFields.length > 0 && <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-600">{matchedFields.map((field) => MATCH_FIELD_LABELS[field]).join(' · ')}</span>}
                                {leadMatches.length > 1 && (
                                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                                    +{leadMatches.length - 1}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex self-start rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                              {tr('未匹配', 'Not Matched', "Tidak Padan")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center overflow-hidden px-4 py-2 align-top font-mono text-[10px] text-slate-400" title={new Date(lead.received_at).toLocaleString()}>
                          {formatCompactReceivedAt(lead.received_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
