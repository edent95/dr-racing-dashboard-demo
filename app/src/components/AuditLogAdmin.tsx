/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileClock, Search } from 'lucide-react';
import { AuditLogEntry } from '../types';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import { useDebouncedValue } from '../utils/tableUx';
import { tr } from '../lib/i18n';

interface AuditLogAdminProps {
  logs: AuditLogEntry[];
}

type AuditLogSortKey = 'created_at' | 'staff_name' | 'action' | 'target_label' | 'change_count' | 'ip_address' | 'user_agent';

const AUDIT_ROW_HEIGHT = 72;
const AUDIT_TABLE_HEIGHT = 648;
const AUDIT_OVERSCAN_ROWS = 6;
const AUDIT_GRID_COLUMNS = '9rem 10rem 11rem 13rem 31rem 16rem';

const formatCompactAuditTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '--';

  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date);
  const year = new Intl.DateTimeFormat('en-GB', { year: '2-digit' }).format(date);
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

  return `${day} / ${month} / ${year} · ${time}`;
};

export default function AuditLogAdmin({ logs }: AuditLogAdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [sortState, setSortState] = useState<SortState<AuditLogSortKey>>({
    key: 'created_at',
    direction: 'desc'
  });

  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const sortedLogs = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const filteredLogs = logs.filter((log) => (
      !query ||
      log.staff_name.toLowerCase().includes(query) ||
      log.staff_role.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.target_type.toLowerCase().includes(query) ||
      log.target_id.toLowerCase().includes(query) ||
      log.target_label.toLowerCase().includes(query) ||
      log.ip_address.toLowerCase().includes(query) ||
      log.changes.some((change) => (
        change.field.toLowerCase().includes(query) ||
        change.old_value.toLowerCase().includes(query) ||
        change.new_value.toLowerCase().includes(query)
      ))
    ));

    const getSortValue = (log: AuditLogEntry) => {
      if (sortState.key === 'created_at') {
        return new Date(log.created_at).getTime();
      }

      if (sortState.key === 'change_count') {
        return log.changes.length;
      }

      return String(log[sortState.key] || '').toLowerCase();
    };

    return [...filteredLogs].sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), sortState.direction));
  }, [logs, debouncedSearchTerm, sortState]);

  useEffect(() => {
    setScrollTop(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [debouncedSearchTerm, sortState.key, sortState.direction]);

  const virtualWindow = useMemo(() => {
    const viewportRowCount = Math.ceil(AUDIT_TABLE_HEIGHT / AUDIT_ROW_HEIGHT);
    const startIndex = Math.max(Math.floor(scrollTop / AUDIT_ROW_HEIGHT) - AUDIT_OVERSCAN_ROWS, 0);
    const endIndex = Math.min(startIndex + viewportRowCount + (AUDIT_OVERSCAN_ROWS * 2), sortedLogs.length);

    return {
      startIndex,
      visibleLogs: sortedLogs.slice(startIndex, endIndex),
      totalHeight: sortedLogs.length * AUDIT_ROW_HEIGHT
    };
  }, [scrollTop, sortedLogs]);

  const handleSort = (key: AuditLogSortKey, defaultDirection: SortDirection = key === 'created_at' || key === 'change_count' ? 'desc' : 'asc') => {
    setSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  return (
    <div id="audit-log-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('审计记录', 'Audit Log', "Log Audit")}</h2>
          <p className="max-w-2xl text-xs font-light leading-relaxed text-slate-500">
            {tr('谁在什么时候改了什么。', 'Who changed what, and when.', "Siapa yang mengubah apa, dan bila.")}
          </p>
        </div>

        <div className="relative self-start md:self-auto">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="audit-search-input"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={tr('搜索员工、操作、IP、对象...', 'Search staff, action, IP, target...', "Kakitangan carian, tindakan, IP, sasaran...")}
            className="w-80 rounded-lg border border-slate-100 bg-white py-2 pl-9 pr-4 text-xs outline-none transition-all focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-transparent bg-white p-5 shadow-none">
          <p className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">{tr('记录总数', 'Total Logs', "Jumlah Log")}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{logs.length}</p>
        </div>
        <div className="rounded-xl border border-transparent bg-white p-5 shadow-none">
          <p className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">{tr('涉及员工', 'Staff Tracked', "Kakitangan Dijejaki")}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{new Set(logs.map((log) => log.staff_name)).size}</p>
        </div>
        <div className="rounded-xl border border-transparent bg-white p-5 shadow-none">
          <p className="inline-flex rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">{tr('最近 IP', 'Latest IP', "IP terkini")}</p>
          <p className="mt-1 truncate font-mono text-sm font-bold text-slate-900">{logs[0]?.ip_address || '--'}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1440px]">
            <div
              className="grid border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700"
              style={{ gridTemplateColumns: AUDIT_GRID_COLUMNS }}
            >
              <div className="px-4 py-2.5">
                <SortableHeader sortKey="created_at" label={tr('时间', 'Time', "Masa")} sortState={sortState} onSort={handleSort} defaultDirection="desc" />
              </div>
              <div className="px-4 py-2.5">
                <SortableHeader sortKey="staff_name" label={tr('员工', 'Staff', "Kakitangan")} sortState={sortState} onSort={handleSort} />
              </div>
              <div className="px-4 py-2.5">
                <SortableHeader sortKey="action" label={tr('操作', 'Action', "Tindakan")} sortState={sortState} onSort={handleSort} />
              </div>
              <div className="px-4 py-2.5">
                <SortableHeader sortKey="target_label" label={tr('对象', 'Target', "Sasaran")} sortState={sortState} onSort={handleSort} />
              </div>
              <div className="px-4 py-2.5">
                <SortableHeader sortKey="change_count" label={tr('变更内容', 'Changes', "Perubahan")} sortState={sortState} onSort={handleSort} defaultDirection="desc" />
              </div>
              <div className="px-4 py-2.5">
                <SortableHeader sortKey="ip_address" label={tr('设备 / IP', 'Device / IP', "Peranti / IP")} sortState={sortState} onSort={handleSort} />
              </div>
            </div>

            {sortedLogs.length === 0 ? (
              <div className="flex py-14 text-center">
                <div className="mx-auto flex flex-col items-center gap-3 text-slate-400">
                  <FileClock className="h-8 w-8" />
                  <p className="text-sm">{tr('还没有审计记录', 'No audit logs yet', "Tiada log audit lagi")}</p>
                </div>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="relative overflow-y-auto"
                style={{ height: Math.min(AUDIT_TABLE_HEIGHT, virtualWindow.totalHeight) }}
                onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
              >
                <div className="relative" style={{ height: virtualWindow.totalHeight }}>
                  {virtualWindow.visibleLogs.map((log, index) => (
                    <div
                      key={log.id}
                      id={`audit-row-${log.id}`}
                      className="absolute left-0 right-0 grid border-b border-slate-50 text-sm hover:bg-indigo-50/20"
                      style={{
                        gridTemplateColumns: AUDIT_GRID_COLUMNS,
                        height: AUDIT_ROW_HEIGHT,
                        transform: `translateY(${(virtualWindow.startIndex + index) * AUDIT_ROW_HEIGHT}px)`
                      }}
                    >
                      <div className="flex items-center overflow-hidden px-4 py-2 font-mono text-[10px] text-slate-500" title={new Date(log.created_at).toLocaleString()}>
                        {formatCompactAuditTime(log.created_at)}
                      </div>
                      <div className="flex min-w-0 flex-col justify-center overflow-hidden px-4 py-2">
                        <p className="truncate text-xs font-bold text-slate-800" title={log.staff_name}>{log.staff_name}</p>
                        <p className="mt-0.5 truncate text-[9px] font-bold uppercase text-slate-400">{log.staff_role}</p>
                      </div>
                      <div className="flex min-w-0 items-center overflow-hidden px-4 py-2">
                        <span className="inline-flex max-w-full rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                          <span className="truncate" title={log.action}>{log.action}</span>
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-col justify-center overflow-hidden px-4 py-2">
                        <p className="truncate text-xs font-bold text-slate-700" title={log.target_label}>{log.target_label}</p>
                        <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400" title={`${log.target_type} · ${log.target_id}`}>
                          {log.target_type} · {log.target_id}
                        </p>
                      </div>
                      <div
                        className="flex min-w-0 items-center gap-2 overflow-hidden px-4 py-2"
                        title={log.changes.map((change) => `${change.field}: ${change.old_value} → ${change.new_value}`).join('\n')}
                      >
                        {log.changes[0] ? (
                          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <span className="max-w-28 shrink-0 truncate text-[9px] font-bold uppercase text-slate-400">{log.changes[0].field}</span>
                            <span className="min-w-0 truncate text-[10px] text-slate-600">
                              <span className="text-rose-500">{log.changes[0].old_value}</span>
                              <span className="px-1.5 text-slate-300">→</span>
                              <span className="text-emerald-600">{log.changes[0].new_value}</span>
                            </span>
                          </div>
                        ) : <span className="text-[10px] text-slate-400">--</span>}
                        {log.changes.length > 1 && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">+{log.changes.length - 1}</span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col justify-center overflow-hidden px-4 py-2" title={`${log.ip_address}\n${log.user_agent || '--'}`}>
                        <p className="truncate font-mono text-[10px] text-slate-600">{log.ip_address}</p>
                        <p className="mt-0.5 truncate text-[9px] text-slate-400">
                          {log.user_agent || '--'}
                        </p>
                      </div>
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
