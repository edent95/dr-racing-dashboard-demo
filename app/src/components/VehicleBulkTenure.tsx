/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ListChecks } from 'lucide-react';
import type { VehicleCatalogItem, VehicleCategory } from '../types';
import { tr } from '../lib/i18n';

const YEARS = [2, 3, 4, 5, 6, 7];

interface VehicleBulkTenureProps {
  catalog: VehicleCatalogItem[];
  categories: VehicleCategory[];
  canManage: boolean;
  onUpdate: (id: string, updates: Partial<VehicleCatalogItem>) => void;
}

// Multi-select models and set their category or max tenure in one action.
export default function VehicleBulkTenure({ catalog, categories, canManage, onUpdate }: VehicleBulkTenureProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((item) => !q || item.model.toLowerCase().includes(q) || (item.brand || '').toLowerCase().includes(q));
  }, [catalog, query]);

  const activeCategories = useMemo(() => categories.filter((category) => category.active), [categories]);

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  if (!canManage) {
    return null;
  }

  const toggle = (id: string) => setSelected((current) => ({ ...current, [id]: !current[id] }));
  const selectAllFiltered = () => {
    const next: Record<string, boolean> = { ...selected };
    filtered.forEach((item) => { next[item.id] = true; });
    setSelected(next);
  };
  const clearAll = () => setSelected({});
  const applyTenure = (years: number) => {
    selectedIds.forEach((id) => onUpdate(id, { max_tenure: years }));
    setSelected({});
  };
  const applyCategory = (categoryId: string) => {
    selectedIds.forEach((id) => onUpdate(id, { category_id: categoryId }));
    setSelected({});
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="border-b border-slate-100/70 p-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
      >
        <ListChecks className="h-4 w-4" />
        {tr('批量设置(类别 / 期限)', 'Bulk set (category / tenure)', "Set pukal (kategori / tempoh)")}{selectedIds.length > 0 ? ` · ${selectedIds.length}` : ''}
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tr('搜索车型/品牌...', 'Search model / brand...', "Cari model / jenama...")}
              className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-100"
            />
            <button type="button" onClick={selectAllFiltered} className="rounded-md bg-white px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">{tr('全选(当前)', 'Select all', "Pilih semua")}</button>
            <button type="button" onClick={clearAll} className="rounded-md bg-white px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">{tr('清空', 'Clear', "Jelas")}</button>
            <span className="text-[11px] font-bold text-slate-500">{tr('已选', 'Selected', "Dipilih")}: {selectedIds.length}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{tr('设类别', 'Set category', "Tetapkan kategori")}</span>
            {activeCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                disabled={!hasSelection}
                onClick={() => applyCategory(category.id)}
                className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {category.name}
              </button>
            ))}
            <button
              type="button"
              disabled={!hasSelection}
              onClick={() => applyCategory('')}
              className="rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:text-slate-300"
            >
              {tr('未分类', 'Uncategorized', "Tidak dikategorikan")}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{tr('设期限', 'Set tenure', "Tetapkan tempoh")}</span>
            {YEARS.map((year) => (
              <button
                key={year}
                type="button"
                disabled={!hasSelection}
                onClick={() => applyTenure(year)}
                className="h-7 w-7 rounded-md bg-slate-900 text-[11px] font-bold text-white transition-colors hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {year}
              </button>
            ))}
          </div>

          <div className="mt-3 grid max-h-64 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const category = item.category_id ? categories.find((entry) => entry.id === item.category_id) : undefined;
              return (
                <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-100 hover:ring-indigo-100">
                  <input type="checkbox" checked={!!selected[item.id]} onChange={() => toggle(item.id)} className="h-3.5 w-3.5" />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700">{item.model}</span>
                  <span className="max-w-[80px] truncate text-[10px] font-bold text-indigo-500">{category?.name || ''}</span>
                  <span className="text-[10px] font-bold text-slate-400">{item.max_tenure || '—'}Y</span>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-4 text-center text-[11px] font-semibold text-slate-400">{tr('没有车型', 'No models', "Tiada model")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
