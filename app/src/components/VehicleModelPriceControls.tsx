/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { VehicleCatalogItem, VehiclePriceVersion } from '../types';
import { getTodayDateKey } from '../data/vehicleCategories';
import { tr } from '../lib/i18n';

const TENURE_YEARS = [2, 3, 4, 5, 6, 7];

interface VehicleModelPriceControlsProps {
  id: string;
  loanAmount: number;
  depositAmount: number;
  priceHistory?: VehiclePriceVersion[];
  maxTenure?: number;
  categoryDefaultTenure?: number;
  canManage: boolean;
  currentStaffName: string;
  onUpdate: (id: string, updates: Partial<VehicleCatalogItem>) => void;
}

// Per-model tenure override + effective-dated price editing. Saving a price
// appends a dated version to price_history (so past prices can be looked up)
// and keeps the legacy loan_amount/deposit_amount fields in sync as a fallback.
export default function VehicleModelPriceControls({
  id,
  loanAmount,
  depositAmount,
  priceHistory,
  maxTenure,
  categoryDefaultTenure,
  canManage,
  currentStaffName,
  onUpdate
}: VehicleModelPriceControlsProps) {
  const [open, setOpen] = useState(false);
  const [loan, setLoan] = useState(String(loanAmount || ''));
  const [deposit, setDeposit] = useState(String(depositAmount || ''));
  const [date, setDate] = useState(getTodayDateKey());

  if (!canManage) {
    return null;
  }

  const effectiveMax = maxTenure || categoryDefaultTenure || 5;
  const historyCount = (priceHistory || []).length;

  const savePrice = () => {
    const nextLoan = Math.max(0, Number(loan) || 0);
    const nextDeposit = Math.max(0, Number(deposit) || 0);
    const version: VehiclePriceVersion = {
      loan_amount: nextLoan,
      deposit: nextDeposit,
      effective_from: date || getTodayDateKey(),
      updated_at: new Date().toISOString(),
      updated_by: currentStaffName
    };
    onUpdate(id, {
      loan_amount: nextLoan,
      deposit_amount: nextDeposit,
      price_history: [...(priceHistory || []), version]
    });
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{tr('期限', 'Tenure', "Pegangan")}</span>
        {TENURE_YEARS.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onUpdate(id, { max_tenure: year })}
            className={`h-6 w-6 rounded-md text-[10px] font-bold transition-colors ${effectiveMax === year ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {year}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
        >
          {tr('改价', 'Price', "harga")}{historyCount > 0 ? ` (${historyCount})` : ''}
        </button>
      </div>
      {open && (
        <div className="flex flex-wrap items-end gap-1.5 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100">
          <label className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400">{tr('贷款额', 'Loan', "Pinjaman")}</span>
            <input value={loan} onChange={(event) => setLoan(event.target.value)} inputMode="decimal" className="w-20 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-indigo-100" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400">{tr('订金', 'Deposit', "Deposit")}</span>
            <input value={deposit} onChange={(event) => setDeposit(event.target.value)} inputMode="decimal" className="w-20 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-indigo-100" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400">{tr('生效', 'From', "daripada")}</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-indigo-100" />
          </label>
          <button type="button" onClick={savePrice} className="rounded bg-indigo-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-indigo-700">{tr('保存', 'Save', "Simpan")}</button>
        </div>
      )}
    </div>
  );
}
