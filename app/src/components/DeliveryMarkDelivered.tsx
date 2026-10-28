import React, { useMemo, useState } from 'react';
import { Bike } from 'lucide-react';
import { tr } from '../lib/i18n';
import type { LoanApplication, RoleAccountRole, VehicleCatalogItem } from '../types';
import { getVehicleStockReference } from '../utils/vehicleStock';

/**
 * Mark delivered on the Delivery page (owner decisions 2026-10-16): the file's
 * Admin (through the server, logged with IP and page), Operations Manager, or
 * Super Admin. Steps 1-10 must be done first; only Super Admin may go ahead
 * without them, and only with a written reason.
 */
export default function DeliveryMarkDelivered({
  application,
  vehicleCatalog,
  staff,
  isReady,
  openStepCount,
  onDeliver
}: {
  application: LoanApplication;
  vehicleCatalog: VehicleCatalogItem[];
  staff: { role: RoleAccountRole; name: string };
  isReady: boolean;
  openStepCount: number;
  onDeliver: (stockUnitId: string, options?: { forceReason?: string }) => Promise<boolean>;
}) {
  const [stockUnitId, setStockUnitId] = useState(application.deal_finance?.stock_unit_id || '');
  const [forceReason, setForceReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canDeliver = staff.role === 'Super Admin'
    || staff.role === 'Operations Manager'
    || (staff.role === 'Admin' && (application.admin_owner_name === staff.name || application.handler_name === staff.name));
  const needsForceReason = !isReady && staff.role === 'Super Admin';

  // Same choice as the Home delivery card: units of the deal's model that are
  // free, or already reserved for this deal.
  const stockOptions = useMemo(() => {
    const modelKey = (application.vehicle_model || '').trim().toLowerCase();
    const reservedId = application.deal_finance?.stock_unit_id || '';
    return vehicleCatalog
      .filter((item) => (item.model || '').trim().toLowerCase() === modelKey)
      .flatMap((item) => item.stock_units || [])
      .filter((unit) => (
        unit.id === reservedId
        || (unit.status === 'In Stock' && !unit.sold_application_id && (!unit.reserved_application_id || unit.reserved_application_id === application.id))
      ));
  }, [application.deal_finance?.stock_unit_id, application.id, application.vehicle_model, vehicleCatalog]);

  if (!canDeliver) {
    return null;
  }

  const blocked = !isReady && !needsForceReason;
  const inputClass = 'h-9 w-full rounded-control border border-slate-200 bg-white px-2.5 text-footnote text-slate-700 outline-none focus:border-brand-100 focus:ring-2 focus:ring-brand-50';

  return (
    <form
      data-testid="delivery-mark-delivered"
      className="space-y-2 rounded-card border border-emerald-100 bg-white p-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (isSaving || blocked || !stockUnitId) return;
        setIsSaving(true);
        try {
          await onDeliver(stockUnitId, needsForceReason ? { forceReason } : undefined);
        } finally {
          setIsSaving(false);
        }
      }}
    >
      <p className="flex items-center gap-1.5 text-footnote font-bold text-slate-900">
        <Bike className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        {tr('标记交车', 'Mark delivered', 'Tanda dihantar')}
      </p>
      {stockOptions.length === 0 ? (
        <p className="text-caption text-amber-700">
          {tr('没有这款车的可用库存车,先在 Finance Center 补库存。', 'No free stock unit of this model; add stock in Finance Center first.', 'Tiada unit stok model ini; tambah stok di Pusat Kewangan dahulu.')}
        </p>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-slate-500">{tr('交哪一辆库存车', 'Stock unit to deliver', 'Unit stok untuk dihantar')}</span>
          <select value={stockUnitId} onChange={(event) => setStockUnitId(event.target.value)} aria-label="Delivery stock unit" className={inputClass}>
            <option value="">{tr('选择库存车', 'Select a stock unit', 'Pilih unit stok')}</option>
            {stockOptions.map((unit) => <option key={unit.id} value={unit.id}>{getVehicleStockReference(unit)}</option>)}
          </select>
        </label>
      )}
      {blocked && (
        <p className="text-caption text-slate-500">
          {tr(`交车清单还有 ${openStepCount} 步没完成,完成后才能交车。`, `${openStepCount} checklist steps are still open; deliver once they are done.`, `${openStepCount} langkah senarai belum selesai; hantar selepas semuanya selesai.`)}
        </p>
      )}
      {needsForceReason && (
        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-rose-600">
            {tr(`清单还有 ${openStepCount} 步没完成 · 强制交车原因(必填)`, `${openStepCount} steps still open · reason to force the delivery (required)`, `${openStepCount} langkah belum selesai · sebab memaksa penghantaran (wajib)`)}
          </span>
          <textarea
            value={forceReason}
            onChange={(event) => setForceReason(event.target.value)}
            rows={2}
            maxLength={500}
            aria-label="Force delivery reason"
            className="w-full resize-none rounded-control border border-rose-200 bg-white px-2.5 py-2 text-footnote text-slate-700 outline-none focus:ring-2 focus:ring-rose-100"
          />
        </label>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving || blocked || !stockUnitId || (needsForceReason && !forceReason.trim())}
          className={`inline-flex items-center gap-1.5 rounded-control px-3 py-2 text-caption font-bold text-white disabled:bg-slate-300 ${needsForceReason ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}
        >
          {isSaving
            ? tr('交车中…', 'Delivering…', 'Menghantar…')
            : needsForceReason
              ? tr('强制交车', 'Force delivery', 'Paksa penghantaran')
              : tr('确认交车', 'Confirm delivery', 'Sahkan penghantaran')}
        </button>
      </div>
    </form>
  );
}
