/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, ChevronDown, Pencil, X } from 'lucide-react';
import type { LoanApplication } from '../types';
import { tr } from '../lib/i18n';

interface MissingVehicleModelChipProps {
  model: string;
  brand: string;
  applications: number;
  canManage: boolean;
  applicationList: LoanApplication[];
  onAdd: (model: string) => void;
  onRename: (oldModel: string, newModel: string) => void;
  onOpenApplication: (application: LoanApplication) => void;
}

// One missing-model chip with inline rename. Renaming corrects the messy
// spelling across the applications that use it, so variants consolidate.
export default function MissingVehicleModelChip({
  model,
  brand,
  applications,
  canManage,
  applicationList,
  onAdd,
  onRename,
  onOpenApplication
}: MissingVehicleModelChipProps) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(model);

  const save = () => {
    const next = draft.trim();
    if (next && next !== model) {
      onRename(model, next);
    }
    setEditing(false);
  };

  return (
    <div className="relative">
    <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') { save(); }
              if (event.key === 'Escape') { setDraft(model); setEditing(false); }
            }}
            autoFocus
            className="w-44 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-100"
          />
          <button type="button" onClick={save} title={tr('保存', 'Save', "Simpan")} className="rounded bg-emerald-600 p-1 text-white hover:bg-emerald-700"><Check className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => { setDraft(model); setEditing(false); }} title={tr('取消', 'Cancel', "Batal")} className="rounded bg-white p-1 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-800">{model}</p>
            <p className="text-[10px] font-semibold text-slate-400">{brand} · {tr('申请', 'apps', "permohonan")} {applications}</p>
          </div>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => { setDraft(model); setEditing(true); }}
                title={tr('改名(会改所有用此写法的申请)', 'Rename (updates all applications using this spelling)', "Namakan semula (kemas kini semua permohonan menggunakan ejaan ini)")}
                className="rounded-md bg-white p-1.5 text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onAdd(model)} className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-slate-700">{tr('加入', 'Add', "Tambah")}</button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            title={tr('查看并编辑相关申请', 'View and edit related applications', "Lihat dan edit permohonan berkaitan")}
            className="inline-flex items-center rounded-md bg-white p-1.5 text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </>
      )}
    </div>
      {open && !editing && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-64 w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">{tr('点选直接编辑申请', 'Tap to edit an application', "Ketik untuk mengedit permohonan")}</p>
          {applicationList.length === 0 ? (
            <p className="px-3 py-2 text-[10px] text-slate-400">{tr('没有相关申请', 'No related applications', "Tiada permohonan berkaitan")}</p>
          ) : (
            applicationList.map((application) => (
              <button
                key={application.id}
                type="button"
                onClick={() => { setOpen(false); onOpenApplication(application); }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-indigo-50"
              >
                <span className="truncate text-xs font-bold text-slate-700">{application.applicant_name || application.id}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{application.status}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
