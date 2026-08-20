/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { RoleAccount } from '../types';
import { getAppLocale, tr } from '../lib/i18n';
import type { CompletedTaskEvent } from '../utils/taskCompletionAnalytics';
import {
  buildStaffExperienceProgress,
  EXP_PER_LEVEL,
  getExperienceSeasonId,
  getTaskExperiencePoints,
  isExperienceEligibleEvent,
  normalizeStaffExperienceRules,
  STAFF_EXP_RULE_VERSION,
  TASK_EXP_BY_TYPE,
  type StaffExperienceRuleMap
} from '../utils/staffExperience';

interface StaffExperienceDashboardProps {
  events: CompletedTaskEvent[];
  roleAccounts: RoleAccount[];
  rules: StaffExperienceRuleMap;
  onSaveRules: (rules: StaffExperienceRuleMap) => void;
}

const TASK_LABELS: Record<string, [string, string, string]> = {
  'Bike Delivered': ['交车', 'Bike Delivered', 'Motor Dihantar']
};

function taskLabel(taskType: string) {
  const labels = TASK_LABELS[taskType];
  return labels ? tr(labels[0], labels[1], labels[2]) : taskType;
}

function formatMonth(seasonId: string) {
  if (!seasonId) return '-';
  const [year, month] = seasonId.split('-').map(Number);
  if (!year || !month) return seasonId;
  return new Intl.DateTimeFormat(getAppLocale(), {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long'
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatCompletedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(getAppLocale(), {
    timeZone: 'Asia/Kuala_Lumpur',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function deduplicateEvents(events: CompletedTaskEvent[]) {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (!event.id || seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

export default function StaffExperienceDashboard({
  events,
  roleAccounts,
  rules,
  onSaveRules
}: StaffExperienceDashboardProps) {
  const seasonId = getExperienceSeasonId();
  const normalizedRules = useMemo(() => normalizeStaffExperienceRules(rules), [rules]);
  const [draftRules, setDraftRules] = useState<StaffExperienceRuleMap>(normalizedRules);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDraftRules(normalizedRules);
  }, [normalizedRules]);

  const rulesChanged = Object.keys(TASK_EXP_BY_TYPE).some(
    (taskType) => draftRules[taskType] !== normalizedRules[taskType]
  );
  const monthEvents = useMemo(
    () => deduplicateEvents(events)
      .filter(isExperienceEligibleEvent)
      .filter((event) => getExperienceSeasonId(event.completed_at) === seasonId)
      .sort((left, right) => (
        new Date(right.completed_at).getTime() - new Date(left.completed_at).getTime()
      )),
    [events, seasonId]
  );
  const progressRows = useMemo(
    () => buildStaffExperienceProgress(events, roleAccounts, seasonId, normalizedRules),
    [events, normalizedRules, roleAccounts, seasonId]
  );
  const totalExp = monthEvents.reduce((sum, event) => sum + getTaskExperiencePoints(event, normalizedRules), 0);
  const contributingStaff = progressRows.filter((row) => row.seasonCompletedTasks > 0);
  const topStaff = contributingStaff[0];
  const roleSummary = useMemo(() => {
    const grouped = new Map<string, { exp: number; tasks: number; staff: number }>();
    progressRows.forEach((row) => {
      const role = row.staffRole || tr('未设置', 'Not set', 'Belum ditetapkan');
      const current = grouped.get(role) || { exp: 0, tasks: 0, staff: 0 };
      current.exp += row.seasonExp;
      current.tasks += row.seasonCompletedTasks;
      current.staff += 1;
      grouped.set(role, current);
    });
    return Array.from(grouped.entries())
      .map(([role, totals]) => ({ role, ...totals }))
      .sort((left, right) => right.exp - left.exp || left.role.localeCompare(right.role));
  }, [progressRows]);

  return (
    <section
      data-testid="staff-exp-dashboard"
      className="space-y-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            {tr('员工 EXP Dashboard', 'Staff EXP Dashboard', 'Dashboard EXP Kakitangan')}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {formatMonth(seasonId)} · {tr('每次交车，负责的 Sales 和 Admin 各得 EXP；每月重置等级进度', 'Each delivery earns EXP for both the Sales handler and the Admin owner; level progress resets monthly', 'Setiap penghantaran memberi EXP kepada Sales dan Admin; kemajuan tahap ditetapkan semula setiap bulan')}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {STAFF_EXP_RULE_VERSION}
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: tr('本月总 EXP', 'Monthly EXP', 'EXP Bulanan'),
            value: totalExp.toLocaleString(),
            detail: tr(`${monthEvents.length} 项已完成任务`, `${monthEvents.length} completed tasks`, `${monthEvents.length} tugasan selesai`)
          },
          {
            label: tr('参与员工', 'Contributing Staff', 'Kakitangan Menyumbang'),
            value: `${contributingStaff.length}/${progressRows.length}`,
            detail: tr('本月获得过 EXP', 'Earned EXP this month', 'Memperoleh EXP bulan ini')
          },
          {
            label: tr('当前第一名', 'Current Leader', 'Pendahulu Semasa'),
            value: topStaff?.staffName || '-',
            detail: topStaff ? `${topStaff.seasonExp} EXP · Lv.${topStaff.level}` : tr('还没有完成记录', 'No completion yet', 'Belum ada rekod selesai')
          },
          {
            label: tr('每次交车 EXP', 'EXP per Delivery', 'EXP Setiap Penghantaran'),
            value: (normalizedRules['Bike Delivered'] ?? 0).toString(),
            detail: tr(`Sales 和 Admin 各得 · ${EXP_PER_LEVEL} EXP = 1 等级`, `Sales & Admin each · ${EXP_PER_LEVEL} EXP = 1 level`, `Sales & Admin setiap satu · ${EXP_PER_LEVEL} EXP = 1 tahap`)
          }
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className="mt-2 truncate text-2xl font-black text-slate-900" data-testid={card.label === tr('本月总 EXP', 'Monthly EXP', 'EXP Bulanan') ? 'staff-exp-total' : undefined}>
              {card.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">{tr('本月员工排行榜', 'Monthly Staff Ranking', 'Kedudukan Kakitangan Bulanan')}</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">{tr('只计算交车完成（Sales 和 Admin 各得）', 'Only vehicle deliveries earn EXP (Sales + Admin)', 'Hanya penghantaran kenderaan memperoleh EXP (Sales + Admin)')}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{progressRows.length} {tr('人', 'staff', 'kakitangan')}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-3 py-2.5">{tr('员工', 'Staff', 'Kakitangan')}</th>
                  <th className="px-3 py-2.5">{tr('等级', 'Level', 'Tahap')}</th>
                  <th className="px-3 py-2.5 text-right">{tr('完成', 'Completed', 'Selesai')}</th>
                  <th className="px-3 py-2.5 text-right">EXP</th>
                  <th className="px-4 py-2.5">{tr('下一级进度', 'Next Level', 'Tahap Seterusnya')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progressRows.map((row, index) => (
                  <tr key={`${row.staffName}-${row.staffRole}`} className="text-slate-600">
                    <td className="px-4 py-3 font-black text-slate-400">{index + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-slate-900">{row.staffName}</p>
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{row.staffRole || '-'}</p>
                    </td>
                    <td className="px-3 py-3 font-black text-indigo-600">Lv.{row.level}</td>
                    <td className="px-3 py-3 text-right font-mono">{row.seasonCompletedTasks}</td>
                    <td className="px-3 py-3 text-right font-mono font-black text-amber-600">{row.seasonExp}</td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[150px] items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                            style={{ width: `${Math.min((row.levelProgressExp / EXP_PER_LEVEL) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-[9px] text-slate-400">{row.levelProgressExp}/{EXP_PER_LEVEL}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 p-4">
          <h3 className="text-sm font-black text-slate-900">{tr('角色贡献', 'Role Contribution', 'Sumbangan Peranan')}</h3>
          <div className="mt-3 space-y-3">
            {roleSummary.map((row) => (
              <div key={row.role}>
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="font-bold text-slate-700">{row.role}</span>
                  <span className="font-mono font-bold text-amber-600">{row.exp} EXP</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${totalExp > 0 ? Math.max((row.exp / totalExp) * 100, row.exp > 0 ? 4 : 0) : 0}%` }}
                  />
                </div>
                <p className="mt-1 text-[9px] text-slate-400">{row.tasks} {tr('项完成', 'completions', 'penyelesaian')} · {row.staff} {tr('人', 'staff', 'kakitangan')}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-100">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-black text-slate-900">{tr('最近 EXP 记录', 'Recent EXP History', 'Sejarah EXP Terkini')}</h3>
          </div>
          {monthEvents.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs font-semibold text-slate-400">{tr('本月还没有完成记录', 'No completed tasks this month', 'Tiada tugasan selesai bulan ini')}</p>
          ) : (
            <div className="max-h-[430px] divide-y divide-slate-100 overflow-y-auto">
              {monthEvents.slice(0, 20).map((event) => (
                <article key={event.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{taskLabel(event.task_type)}</p>
                    <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400">
                      {event.staff_name} · {formatCompletedAt(event.completed_at)} · {event.source_label}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 font-mono text-[10px] font-black text-amber-700">
                    +{getTaskExperiencePoints(event, normalizedRules)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section data-testid="staff-exp-rules-editor" className="overflow-hidden rounded-2xl border border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">{tr('EXP 计分规则', 'EXP Scoring Rules', 'Peraturan Pemarkahan EXP')}</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">{tr('0 代表该任务不奖励 EXP；保存后所有员工按新规则重新计算。', 'Set 0 to award no EXP. Saving recalculates every staff member with the new rules.', 'Tetapkan 0 untuk tiada EXP. Simpan untuk mengira semula semua kakitangan.')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDraftRules(normalizeStaffExperienceRules(TASK_EXP_BY_TYPE));
                setSavedNotice(false);
              }}
              className="rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200"
            >
              {tr('恢复默认', 'Restore defaults', 'Pulihkan lalai')}
            </button>
          </div>
          <div className="grid max-h-[430px] gap-px overflow-y-auto bg-slate-100 sm:grid-cols-2">
            {Object.keys(TASK_EXP_BY_TYPE).map((taskType) => (
              <label key={taskType} className="flex items-center justify-between gap-3 bg-white px-4 py-2.5">
                <span className="text-[11px] font-bold text-slate-700">{taskLabel(taskType)}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={999}
                    step={1}
                    aria-label={`${taskLabel(taskType)} EXP`}
                    value={draftRules[taskType]}
                    onChange={(event) => {
                      const nextValue = Math.min(Math.max(Math.round(Number(event.target.value) || 0), 0), 999);
                      setDraftRules((current) => ({ ...current, [taskType]: nextValue }));
                      setSavedNotice(false);
                    }}
                    className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right font-mono text-xs font-black text-amber-700 outline-none focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  />
                  <span className="text-[9px] font-bold text-slate-400">EXP</span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
            <p className={`text-[10px] font-bold ${savedNotice ? 'text-emerald-600' : rulesChanged ? 'text-amber-600' : 'text-slate-400'}`}>
              {savedNotice
                ? tr('规则已保存并重新计算。', 'Rules saved and recalculated.', 'Peraturan disimpan dan dikira semula.')
                : rulesChanged
                  ? tr('有尚未保存的修改', 'Unsaved rule changes', 'Perubahan belum disimpan')
                  : tr('当前规则已同步', 'Current rules are synced', 'Peraturan semasa disegerakkan')}
            </p>
            <button
              type="button"
              disabled={!rulesChanged}
              onClick={() => {
                const nextRules = normalizeStaffExperienceRules(draftRules);
                onSaveRules(nextRules);
                setDraftRules(nextRules);
                setSavedNotice(true);
              }}
              className="rounded-lg bg-red-800 px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {tr('保存 EXP 规则', 'Save EXP Rules', 'Simpan Peraturan EXP')}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
