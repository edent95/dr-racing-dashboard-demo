/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { ROLE_PERMISSION_PAGE_SECTIONS, ROLE_PERMISSION_ROLES, normalizeRolePermissionSettings } from '../data/rolePermissions';
import { RoleAccountRole, RolePermissionSetting } from '../types';
import { tr } from '../lib/i18n';
import ToggleOptionGroup from './ToggleOptionGroup';
import ToggleSwitch from './ToggleSwitch';

interface PermissionMatrixPageProps {
  permissions: RolePermissionSetting[];
  currentStaffName: string;
  canManagePermissions: boolean;
  onUpdatePermissions: (permissions: RolePermissionSetting[]) => void;
}

const ROLE_BADGE_CLASS: Record<RoleAccountRole, string> = {
  'Super Admin': 'bg-red-800 text-white',
  'Operations Manager': 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  Admin: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
  Sales: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
};

export default function PermissionMatrixPage({
  permissions,
  currentStaffName,
  canManagePermissions,
  onUpdatePermissions
}: PermissionMatrixPageProps) {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedPermissions = useMemo(() => normalizeRolePermissionSettings(permissions), [permissions]);
  const groups = useMemo(() => (
    ['All', ...Array.from(new Set(ROLE_PERMISSION_PAGE_SECTIONS.map((page) => page.group)))]
  ), []);

  const permissionByKey = useMemo(() => {
    const map = new Map<string, RolePermissionSetting>();

    normalizedPermissions.forEach((permission) => {
      map.set(`${permission.role}:${permission.page_id}:${permission.section_id}`, permission);
    });

    return map;
  }, [normalizedPermissions]);

  const visiblePages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return ROLE_PERMISSION_PAGE_SECTIONS.filter((page) => {
      const matchesGroup = selectedGroup === 'All' || page.group === selectedGroup;
      const matchesSearch = !query || [
        page.label,
        page.group,
        page.description,
        ...page.sections.flatMap((section) => [section.label, section.description])
      ].some((value) => value.toLowerCase().includes(query));

      return matchesGroup && matchesSearch;
    });
  }, [searchTerm, selectedGroup]);

  const isEnabled = (role: RoleAccountRole, pageId: string, sectionId: string) => (
    permissionByKey.get(`${role}:${pageId}:${sectionId}`)?.enabled || false
  );

  const commitPermissions = (nextPermissions: RolePermissionSetting[]) => {
    onUpdatePermissions(normalizeRolePermissionSettings(nextPermissions));
  };

  const updatePermission = (
    role: RoleAccountRole,
    pageId: string,
    sectionId: string,
    enabled: boolean
  ) => {
    const now = new Date().toISOString();
    const next = normalizedPermissions.map((permission) => (
      permission.role === role && permission.page_id === pageId && permission.section_id === sectionId
        ? {
          ...permission,
          enabled,
          updated_at: now,
          updated_by: currentStaffName
        }
        : permission
    ));

    commitPermissions(next);
  };

  const updatePageRole = (role: RoleAccountRole, pageId: string, enabled: boolean) => {
    const now = new Date().toISOString();
    const next = normalizedPermissions.map((permission) => (
      permission.role === role && permission.page_id === pageId
        ? {
          ...permission,
          enabled,
          updated_at: now,
          updated_by: currentStaffName
        }
        : permission
    ));

    commitPermissions(next);
  };

  const getRoleSummary = (role: RoleAccountRole) => {
    const rolePermissions = normalizedPermissions.filter((permission) => permission.role === role);
    const enabledCount = rolePermissions.filter((permission) => permission.enabled).length;

    return {
      enabledCount,
      totalCount: rolePermissions.length
    };
  };

  return (
    <div id="permission-matrix-page" className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">权限设定</h2>
              <p className="mt-1 max-w-3xl text-xs font-light leading-relaxed text-slate-500">
                设定每一个 role 在每一个 page 的每一个 section 是否可以使用。当前版本先保存权限矩阵，之后可直接接入路由和功能拦截。
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ToggleOptionGroup
            value={selectedGroup}
            options={groups.map((group) => ({ value: group, label: group === 'All' ? '全部分组' : group }))}
            onChange={setSelectedGroup}
            ariaLabel="Permission group filter"
            className="rounded-xl border border-slate-100 bg-white p-1 shadow-2xs"
            optionClassName="min-h-8 px-3"
          />
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={tr('搜索页面 / 区块...', 'Search page / section...', "Cari halaman / bahagian...")}
              className="w-full rounded-xl border border-slate-100 bg-white py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition-all focus:border-emerald-100 focus:bg-slate-50 focus:ring-2 focus:ring-emerald-50 sm:w-72"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {ROLE_PERMISSION_ROLES.map((role) => {
          const summary = getRoleSummary(role);

          return (
            <div key={role} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${ROLE_BADGE_CLASS[role]}`}>{role}</span>
                <span className="text-xs font-bold text-slate-900">{summary.enabledCount}/{summary.totalCount}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${summary.totalCount ? (summary.enabledCount / summary.totalCount) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] font-semibold text-slate-400">{tr('已开启区块 / 全部区块', 'Enabled sections / all sections', "Bahagian yang didayakan / semua bahagian")}</p>
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        {visiblePages.map((page) => (
          <div key={page.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100/70 px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{page.group}</span>
                    <h3 className="text-sm font-bold text-slate-900">{page.label}</h3>
                  </div>
                  <p className="mt-1 max-w-2xl text-xs font-light leading-relaxed text-slate-500">{page.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  {ROLE_PERMISSION_ROLES.map((role) => {
                    const enabledCount = page.sections.filter((section) => isEnabled(role, page.id, section.id)).length;
                    const pageFullyEnabled = enabledCount === page.sections.length;

                    return (
                      <React.Fragment key={role}>
                      <ToggleSwitch
                        checked={pageFullyEnabled}
                        onChange={(checked) => updatePageRole(role, page.id, checked)}
                        disabled={!canManagePermissions}
                        label={role}
                        description={`${enabledCount}/${page.sections.length}`}
                        className="rounded-xl bg-slate-50 px-2 py-1 ring-1 ring-slate-100"
                      />
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="min-w-72 px-5 py-3">{tr('区块', 'Section', "Bahagian")}</th>
                    {ROLE_PERMISSION_ROLES.map((role) => (
                      <th key={role} className="min-w-40 px-4 py-3">{role}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {page.sections.map((section) => (
                    <tr key={section.id} className="transition-colors hover:bg-emerald-50/20">
                      <td className="px-5 py-3">
                        <p className="text-xs font-bold text-slate-800">{section.label}</p>
                        <p className="mt-0.5 max-w-lg text-[10px] font-semibold leading-relaxed text-slate-400">{section.description}</p>
                      </td>
                      {ROLE_PERMISSION_ROLES.map((role) => (
                        <td key={role} className="px-4 py-3">
                          <ToggleSwitch
                            checked={isEnabled(role, page.id, section.id)}
                            onChange={(checked) => updatePermission(role, page.id, section.id, checked)}
                            disabled={!canManagePermissions}
                            label={isEnabled(role, page.id, section.id) ? '允许' : '关闭'}
                            className="rounded-xl bg-white px-2 py-1 ring-1 ring-slate-100"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {visiblePages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-xs font-bold text-slate-400">
            {tr('没有找到符合条件的权限区块。', 'No matching permission section found.', "Tiada bahagian kebenaran yang sepadan ditemui.")}
          </div>
        )}
      </section>
    </div>
  );
}
