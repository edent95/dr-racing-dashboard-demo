/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ChevronDown, Lock, ShieldCheck } from 'lucide-react';
import {
  ROLE_NAV_ACCESS_ITEMS,
  ROLE_NAV_ACCESS_ROLES,
  getRoleNavAccessDetails,
  isRoleNavAccessConfigurable,
  normalizeRoleNavAccessSettings,
  type ConfigurableRole
} from '../data/roleNavAccess';
import { RoleNavAccessSetting } from '../types';
import { V1_HIDDEN_NAV_KEYS } from '../data/v1Scope';
import { tr } from '../lib/i18n';
import ToggleSwitch from './ToggleSwitch';

interface RoleAccessControlPageProps {
  settings: RoleNavAccessSetting[];
  currentStaffName: string;
  canManage: boolean;
  onUpdate: (settings: RoleNavAccessSetting[]) => void;
}

const ROLE_BADGE_CLASS: Record<ConfigurableRole, string> = {
  'Operations Manager': 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  Admin: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
  Sales: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
};

export default function RoleAccessControlPage({
  settings,
  currentStaffName,
  canManage,
  onUpdate
}: RoleAccessControlPageProps) {
  const [expandedPages, setExpandedPages] = useState<Set<string>>(() => new Set());
  const normalized = useMemo(() => normalizeRoleNavAccessSettings(settings), [settings]);
  const visibleItems = useMemo(() => (
    ROLE_NAV_ACCESS_ITEMS.filter((item) => !V1_HIDDEN_NAV_KEYS.has(item.key))
  ), []);

  const enabledByKey = useMemo(() => {
    const map = new Map<string, boolean>();
    normalized.forEach((setting) => map.set(`${setting.role}:${setting.nav_key}`, setting.enabled));
    return map;
  }, [normalized]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, typeof ROLE_NAV_ACCESS_ITEMS>();

    visibleItems.forEach((item) => {
      const groupKey = tr(item.group_zh, item.group_en, item.group_ms);
      if (!byGroup.has(groupKey)) {
        byGroup.set(groupKey, []);
        order.push(groupKey);
      }
      byGroup.get(groupKey)!.push(item);
    });

    return order.map((groupKey) => ({ group: groupKey, items: byGroup.get(groupKey)! }));
  }, [visibleItems]);

  const isEnabled = (role: ConfigurableRole, navKey: string) => enabledByKey.get(`${role}:${navKey}`) || false;

  const roleSummary = (role: ConfigurableRole) => {
    const total = visibleItems.length;
    const enabled = visibleItems.filter((item) => isEnabled(role, item.key)).length;
    return { enabled, total };
  };

  const toggle = (role: ConfigurableRole, navKey: string, enabled: boolean) => {
    if (!canManage || !isRoleNavAccessConfigurable(role, navKey)) {
      return;
    }

    const now = new Date().toISOString();
    const next = normalized.map((setting) => (
      setting.role === role && setting.nav_key === navKey
        ? { ...setting, enabled, updated_at: now, updated_by: currentStaffName }
        : setting
    ));

    onUpdate(normalizeRoleNavAccessSettings(next));
  };

  const togglePageDetails = (navKey: string) => {
    setExpandedPages((current) => {
      const next = new Set(current);
      if (next.has(navKey)) {
        next.delete(navKey);
      } else {
        next.add(navKey);
      }
      return next;
    });
  };

  return (
    <div id="role-access-control-page" className="space-y-6">
      <section className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('角色访问权限', 'Role Access', "Akses Peranan")}</h2>
            <p className="mt-1 max-w-3xl text-xs font-light leading-relaxed text-slate-500">
              {tr(
                '控制 Operations Manager、Admin 与 Sales 的页面入口；有“页面细节”的项目可进一步限制页面内可见资料。',
                'Controls page entry for Operations Manager, Admin, and Sales. Expand Page details to restrict what each role can see inside a page.',
                'Mengawal akses halaman untuk Pengurus Operasi, Pentadbir dan Jualan. Buka Butiran halaman untuk mengehadkan perkara yang boleh dilihat dalam halaman.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-red-800 px-3 py-1 text-[10px] font-bold text-white">Super Admin</span>
            <span className="text-xs font-bold text-slate-900">{tr('全部', 'All', "Semua")}</span>
          </div>
          <p className="mt-3 text-[10px] font-semibold text-slate-400">{tr('拥有全部页面，不可关闭', 'Full access, cannot be disabled', "Akses penuh, tidak boleh dilumpuhkan")}</p>
        </div>
        {ROLE_NAV_ACCESS_ROLES.map((role) => {
          const summary = roleSummary(role);

          return (
            <div key={role} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${ROLE_BADGE_CLASS[role]}`}>{role}</span>
                <span className="text-xs font-bold text-slate-900">{summary.enabled}/{summary.total}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${summary.total ? (summary.enabled / summary.total) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] font-semibold text-slate-400">{tr('可访问页面 / 可管理页面', 'Accessible / managed pages', "Boleh diakses / halaman terurus")}</p>
            </div>
          );
        })}
      </section>

      {!canManage && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs font-semibold text-amber-700">
          {tr('只有 Super Admin 可以修改角色访问权限。', 'Only Super Admin can change role access.', "Hanya Pentadbir Super boleh menukar akses peranan.")}
        </div>
      )}

      <section className="space-y-4">
        {groups.map(({ group, items }) => (
          <div key={group} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100/70 px-5 py-3">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{group}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="min-w-56 px-5 py-3">{tr('页面', 'Page', "Halaman")}</th>
                    <th className="min-w-28 px-4 py-3">Super Admin</th>
                    {ROLE_NAV_ACCESS_ROLES.map((role) => (
                      <th key={role} className="min-w-32 px-4 py-3">{role}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item) => {
                    const details = getRoleNavAccessDetails(item.key);
                    const isExpanded = expandedPages.has(item.key);

                    return (
                      <React.Fragment key={item.key}>
                        <tr className="transition-colors hover:bg-emerald-50/20">
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-bold text-slate-800">{tr(item.label_zh, item.label_en, item.label_ms)}</p>
                              {details.length > 0 && (
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  onClick={() => togglePageDetails(item.key)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-100"
                                >
                                  {tr('页面细节', 'Page details', "Butiran halaman")}
                                  <span className="rounded-full bg-white/80 px-1.5 py-0.5">{details.length}</span>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100">
                              <Lock className="h-3 w-3" />
                              {tr('始终开启', 'Always on', "Sentiasa hidup")}
                            </span>
                          </td>
                          {ROLE_NAV_ACCESS_ROLES.map((role) => {
                            const configurable = isRoleNavAccessConfigurable(role, item.key);

                            return (
                              <td key={role} className="px-4 py-3">
                                {configurable ? (
                                  <ToggleSwitch
                                    checked={isEnabled(role, item.key)}
                                    onChange={(checked) => toggle(role, item.key, checked)}
                                    disabled={!canManage}
                                    label={isEnabled(role, item.key) ? tr('允许', 'Allow', "Benarkan") : tr('关闭', 'Off', "Mati")}
                                    className="rounded-xl bg-white px-2 py-1 ring-1 ring-slate-100"
                                  />
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100">
                                    <Lock className="h-3 w-3" />
                                    {tr('固定关闭', 'Locked off', "Dikunci mati")}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        {isExpanded && details.map((detail) => (
                          <tr key={detail.key} className="bg-indigo-50/30">
                            <td className="border-l-4 border-indigo-200 px-5 py-2.5 pl-9">
                              <p className="text-[11px] font-bold text-slate-700">{tr(detail.label_zh, detail.label_en, detail.label_ms)}</p>
                              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-indigo-400">
                                {tr('页面内资料', 'Inside-page data', "Data dalam halaman")}
                              </p>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100">
                                <Lock className="h-3 w-3" />
                                {tr('始终开启', 'Always on', "Sentiasa hidup")}
                              </span>
                            </td>
                            {ROLE_NAV_ACCESS_ROLES.map((role) => {
                              const parentEnabled = isEnabled(role, item.key);
                              const detailEnabled = isEnabled(role, detail.key);
                              const configurable = isRoleNavAccessConfigurable(role, detail.key);
                              const isAssignedSalesApplicationEdit = (
                                detail.key === 'customers.editApplication' && role === 'Sales'
                              );

                              return (
                                <td key={role} className="px-4 py-2.5">
                                  {configurable ? (
                                    <ToggleSwitch
                                      checked={detailEnabled}
                                      onChange={(checked) => toggle(role, detail.key, checked)}
                                      disabled={!canManage || !parentEnabled}
                                      label={!parentEnabled
                                        ? tr('先开启页面', 'Enable page first', "Hidupkan halaman dahulu")
                                        : detailEnabled
                                          ? tr('允许', 'Allow', "Benarkan")
                                          : tr('关闭', 'Off', "Mati")}
                                      className="rounded-xl bg-white px-2 py-1 ring-1 ring-slate-100"
                                    />
                                  ) : isAssignedSalesApplicationEdit ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                                      <ShieldCheck className="h-3 w-3" />
                                      {tr('只限负责的申请', 'Assigned applications only', "Permohonan ditugaskan sahaja")}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100">
                                      <Lock className="h-3 w-3" />
                                      {tr('固定关闭', 'Locked off', "Dikunci mati")}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
