/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, Layers, Plus } from 'lucide-react';
import type { VehicleCategory, VehicleRateVersion } from '../types';
import { getEffectiveCategoryRate, getTodayDateKey, MAX_VEHICLE_TENURE, MIN_VEHICLE_TENURE } from '../data/vehicleCategories';
import { tr } from '../lib/i18n';
import ToggleSwitch from './ToggleSwitch';

interface VehicleCategoryManagerProps {
  categories: VehicleCategory[];
  currentStaffName: string;
  canManage: boolean;
  onUpdate: (next: VehicleCategory[]) => void;
}

const TENURE_CHOICES = [2, 3, 4, 5, 6, 7];

export default function VehicleCategoryManager({
  categories,
  currentStaffName,
  canManage,
  onUpdate
}: VehicleCategoryManagerProps) {
  const today = getTodayDateKey();
  const [expandedId, setExpandedId] = useState('');
  const [rateDraft, setRateDraft] = useState<Record<string, string>>({});
  const [dateDraft, setDateDraft] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [newName, setNewName] = useState('');
  const [newCc, setNewCc] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newTenure, setNewTenure] = useState('7');

  const commitRate = (category: VehicleCategory) => {
    if (!canManage) {
      return;
    }
    const rate = Number(rateDraft[category.id]);
    const effectiveFrom = (dateDraft[category.id] || today).trim();
    if (!Number.isFinite(rate) || rate < 0 || !effectiveFrom) {
      return;
    }
    const version: VehicleRateVersion = {
      rate,
      effective_from: effectiveFrom,
      updated_at: new Date().toISOString(),
      updated_by: currentStaffName
    };
    onUpdate(categories.map((item) => (
      item.id === category.id ? { ...item, rate_history: [...(item.rate_history || []), version] } : item
    )));
    setRateDraft((draft) => ({ ...draft, [category.id]: '' }));
    setDateDraft((draft) => ({ ...draft, [category.id]: '' }));
  };

  const setDefaultTenure = (category: VehicleCategory, years: number) => {
    if (!canManage) {
      return;
    }
    onUpdate(categories.map((item) => (item.id === category.id ? { ...item, default_max_tenure: years } : item)));
  };

  const setActive = (category: VehicleCategory, active: boolean) => {
    if (!canManage) {
      return;
    }
    onUpdate(categories.map((item) => (item.id === category.id ? { ...item, active } : item)));
  };

  const addCategory = () => {
    if (!canManage) {
      return;
    }
    const name = newName.trim();
    const rate = Number(newRate);
    if (!name || !Number.isFinite(rate) || rate < 0) {
      return;
    }
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `cat_${categories.length + 1}`;
    if (categories.some((item) => item.id === id)) {
      return;
    }
    const tenure = Math.min(MAX_VEHICLE_TENURE, Math.max(MIN_VEHICLE_TENURE, Math.floor(Number(newTenure) || 7)));
    const category: VehicleCategory = {
      id,
      name,
      cc_label: newCc.trim(),
      default_max_tenure: tenure,
      active: true,
      rate_history: [{ rate, effective_from: today, updated_at: new Date().toISOString(), updated_by: currentStaffName }]
    };
    onUpdate([...categories, category]);
    setShowAdd(false);
    setNewName('');
    setNewCc('');
    setNewRate('');
    setNewTenure('7');
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setCollapsed((value) => !value)} className="flex items-center gap-2 text-left">
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('车辆类别与利率', 'Vehicle Categories & Rates', "Kategori & Kadar Kenderaan")}</h3>
            <p className="mt-0.5 max-w-2xl text-[11px] font-light leading-relaxed text-slate-500">
              {tr(
                '每个类别一个 flat 年利率,改利率会记录生效日期(可回溯历史)。月供 = 本金×(1+利率×年)÷(年×12)。',
                'One flat annual rate per category; rate changes are stored with an effective date (history is kept). Monthly = principal×(1+rate×years)÷(years×12).', "Satu kadar tahunan rata bagi setiap kategori; perubahan kadar disimpan dengan tarikh berkuatkuasa (sejarah disimpan). Bulanan = prinsipal×(1+kadar×tahun)÷(tahun×12)."
              )}
            </p>
          </div>
        </button>
        {canManage && (
          <button
            type="button"
            onClick={() => { setCollapsed(false); setShowAdd((value) => !value); }}
            className="inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {tr('新增类别', 'Add category', "Tambah kategori")}
          </button>
        )}
      </div>

      {!collapsed && (
        <>
      {showAdd && canManage && (
        <div className="grid grid-cols-1 gap-2 border-b border-slate-100/70 bg-slate-50/60 px-5 py-4 sm:grid-cols-5">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={tr('类别名称', 'Category name', "Nama kategori")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-100" />
          <input value={newCc} onChange={(e) => setNewCc(e.target.value)} placeholder={tr('排量提示 例:≥500cc', 'cc hint e.g. ≥500cc', "petunjuk cc cth. ≥500cc")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-100" />
          <input value={newRate} onChange={(e) => setNewRate(e.target.value)} inputMode="decimal" placeholder={tr('年利率 %', 'Annual rate %', "Kadar tahunan %")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-100" />
          <input value={newTenure} onChange={(e) => setNewTenure(e.target.value)} inputMode="numeric" placeholder={tr('最长年限', 'Max years', "Tahun maks")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-100" />
          <button type="button" onClick={addCategory} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700">{tr('添加', 'Add', "Tambah")}</button>
        </div>
      )}

      <div className="divide-y divide-slate-50">
        {categories.map((category) => {
          const currentRate = getEffectiveCategoryRate(category, today);
          const isOpen = expandedId === category.id;
          const history = [...(category.rate_history || [])].sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1));

          return (
            <div key={category.id} className="px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{category.name}</span>
                    {category.cc_label && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{category.cc_label}</span>}
                    {!category.active && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">{tr('停用', 'Inactive', "Tidak Aktif")}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <span>{tr('当前利率', 'Current rate', "Kadar semasa")}: <span className="text-indigo-700">{currentRate}% / {tr('年', 'yr', "thn")}</span></span>
                    <span>{tr('最长年限', 'Max years', "Tahun maks")}: {category.default_max_tenure}</span>
                    <button type="button" onClick={() => setExpandedId(isOpen ? '' : category.id)} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700">
                      {tr('历史', 'History', "Sejarah")} ({history.length})
                      <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg bg-slate-50 p-1 ring-1 ring-slate-100">
                      {TENURE_CHOICES.map((years) => (
                        <button
                          key={years}
                          type="button"
                          onClick={() => setDefaultTenure(category, years)}
                          className={`h-7 w-7 rounded-md text-[11px] font-bold transition-colors ${category.default_max_tenure === years ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                          {years}
                        </button>
                      ))}
                    </div>
                    <ToggleSwitch checked={category.active} onChange={(checked) => setActive(category, checked)} label={tr('启用', 'Active', "Aktif")} className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-100" />
                  </div>
                )}
              </div>

              {canManage && (
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{tr('新利率 %', 'New rate %', "Kadar baharu %")}</span>
                    <input value={rateDraft[category.id] || ''} onChange={(e) => setRateDraft((d) => ({ ...d, [category.id]: e.target.value }))} inputMode="decimal" placeholder={`${currentRate}`} className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-100" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{tr('生效日期', 'Effective from', "Berkesan daripada")}</span>
                    <input type="date" value={dateDraft[category.id] || today} onChange={(e) => setDateDraft((d) => ({ ...d, [category.id]: e.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-100" />
                  </label>
                  <button type="button" onClick={() => commitRate(category)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700">{tr('保存利率', 'Save rate', "Jimat kadar")}</button>
                </div>
              )}

              {isOpen && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50/60 font-bold text-slate-500">
                      <tr><th className="px-3 py-2">{tr('生效日期', 'Effective from', "Berkesan daripada")}</th><th className="px-3 py-2">{tr('利率', 'Rate', "Kadar")}</th><th className="px-3 py-2">{tr('修改人', 'By', "Oleh")}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.map((version, index) => (
                        <tr key={`${version.effective_from}-${index}`} className={index === history.findIndex((v) => v.effective_from <= today) ? 'bg-indigo-50/30' : ''}>
                          <td className="px-3 py-1.5 font-semibold text-slate-700">{version.effective_from}</td>
                          <td className="px-3 py-1.5 text-slate-700">{version.rate}%</td>
                          <td className="px-3 py-1.5 text-slate-400">{version.updated_by || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}
