import React, { useState } from 'react';
import { ArrowRight, Repeat } from 'lucide-react';
import { tr } from '../lib/i18n';
import { fieldLabel, fieldLabelWith, RM } from '../data/fieldLabels';
import type { UnitExchange } from '../types';
import { LOAN_TENURE_OPTIONS } from '../utils/customerApplicationForm';

type UnitExchangeDraft = Pick<UnitExchange, 'vehicle_model' | 'loan_amount' | 'installment_years' | 'number_plate' | 'mileage'>;

const emptyDraft = (): UnitExchangeDraft => ({ vehicle_model: '', loan_amount: '', installment_years: '', number_plate: '', mileage: '' });

const formatRecordedAt = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/**
 * "Change unit" on an approved bank (owner meeting 2026-10-13, Sales "add
 * exchange"): the customer moves to another model or a used bike after
 * approval. Each change is one record; the list shows every change, newest last.
 */
export default function UnitExchangeCard({
  bankApplicationId,
  exchanges,
  canRecord,
  vehicleModelSuggestions,
  onRecord
}: {
  bankApplicationId: string;
  exchanges: UnitExchange[];
  canRecord: boolean;
  vehicleModelSuggestions: string[];
  onRecord: (input: UnitExchangeDraft & { bank_application_id: string }) => Promise<boolean>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const [draft, setDraft] = useState<UnitExchangeDraft>(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  const listId = `unit-exchange-models-${bankApplicationId}`;
  const inputClass = 'h-9 w-full rounded-control border border-slate-200 bg-white px-2.5 text-footnote text-slate-700 outline-none focus:border-brand-100 focus:ring-2 focus:ring-brand-50';

  if (exchanges.length === 0 && !canRecord) {
    return null;
  }

  const update = (field: keyof UnitExchangeDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div data-testid={`unit-exchange-${bankApplicationId}`} className="mt-3 rounded-card border border-sky-100 bg-sky-50/40 p-3" onClick={(event) => event.stopPropagation()}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-micro font-semibold uppercase text-sky-800">
          <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
          {tr('换车', 'Unit change', 'Tukar unit')}
          {exchanges.length > 0 && <span className="rounded-full bg-sky-100 px-1.5 text-micro tabular-nums">{exchanges.length}</span>}
        </p>
        {canRecord && !isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1 rounded-control border border-sky-200 bg-white px-2.5 py-1.5 text-caption font-semibold text-sky-800 hover:bg-sky-50"
          >
            {tr('记录换车', 'Record unit change', 'Rekod tukar unit')}
          </button>
        )}
      </div>

      {exchanges.length > 0 && (
        <ol className="mt-2 space-y-1.5">
          {exchanges.map((exchange) => (
            <li key={exchange.id} className="rounded-control bg-white px-2.5 py-2 text-caption text-slate-600 ring-1 ring-sky-100">
              <p className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-800">
                <span className="text-slate-400 line-through decoration-slate-300">{exchange.from_model || '—'}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                <span>{exchange.vehicle_model}</span>
              </p>
              <p className="mt-0.5">
                {[
                  `RM ${exchange.loan_amount}`,
                  exchange.installment_years ? tr(`${exchange.installment_years} 年`, `${exchange.installment_years} yrs`, `${exchange.installment_years} thn`) : '',
                  exchange.number_plate,
                  exchange.mileage ? `${exchange.mileage} km` : ''
                ].filter(Boolean).join(' · ')}
              </p>
              <p className="mt-0.5 text-micro tracking-normal text-slate-400">{exchange.recorded_by} · {formatRecordedAt(exchange.recorded_at)}</p>
            </li>
          ))}
        </ol>
      )}

      {canRecord && isOpen && (
        <form
          className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (isSaving) return;
            setIsSaving(true);
            try {
              const saved = await onRecord({
                ...draft,
                number_plate: isUsed ? draft.number_plate : '',
                mileage: isUsed ? draft.mileage : '',
                bank_application_id: bankApplicationId
              });
              if (saved) {
                setDraft(emptyDraft());
                setIsUsed(false);
                setIsOpen(false);
              }
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-micro uppercase text-slate-500">{fieldLabel('vehicleModel')}</span>
            <input list={listId} value={draft.vehicle_model} onChange={(event) => update('vehicle_model', event.target.value)} aria-label="Unit change model" className={inputClass} required />
            <datalist id={listId}>
              {vehicleModelSuggestions.map((model) => <option key={model} value={model} />)}
            </datalist>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-micro uppercase text-slate-500">{fieldLabelWith('approvedLoan', RM)}</span>
            <input value={draft.loan_amount} onChange={(event) => update('loan_amount', event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" aria-label="Unit change loan amount" className={inputClass} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-micro uppercase text-slate-500">{fieldLabel('loanTenureYears')}</span>
            <select value={draft.installment_years} onChange={(event) => update('installment_years', event.target.value)} aria-label="Unit change installment years" className={inputClass}>
              <option value="">{tr('选择', 'Select', 'Pilih')}</option>
              {LOAN_TENURE_OPTIONS.map((years) => <option key={years} value={years}>{tr(`${years} 年`, `${years} years`, `${years} tahun`)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-footnote text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={isUsed} onChange={(event) => setIsUsed(event.target.checked)} aria-label="Unit change used bike" />
            {tr('二手车', 'Used bike', 'Motor terpakai')}
          </label>
          {isUsed && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-micro uppercase text-slate-500">{fieldLabel('plateNumber')}</span>
                <input value={draft.number_plate} onChange={(event) => update('number_plate', event.target.value.toUpperCase())} aria-label="Unit change number plate" className={inputClass} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-micro uppercase text-slate-500">{tr('里程 (km)', 'Mileage (km)', 'Perbatuan (km)')}</span>
                <input value={draft.mileage} onChange={(event) => update('mileage', event.target.value.replace(/\D/g, '').slice(0, 9))} inputMode="numeric" aria-label="Unit change mileage" className={inputClass} />
              </label>
            </>
          )}
          <div className="flex items-center justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-control px-3 py-1.5 text-caption font-semibold text-slate-500 hover:text-slate-800">
              {tr('取消', 'Cancel', 'Batal')}
            </button>
            <button type="submit" disabled={isSaving} className="rounded-control bg-sky-700 px-3 py-1.5 text-caption font-bold text-white hover:bg-sky-800 disabled:bg-slate-300">
              {tr('保存换车', 'Save unit change', 'Simpan tukar unit')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
