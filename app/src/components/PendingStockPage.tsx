import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, PackageSearch, Truck } from 'lucide-react';
import { tr } from '../lib/i18n';
import type { LoanApplication, QuickStockInput, StockOrder, VehicleCatalogItem } from '../types';
import { buildPendingStock, type PendingStockRow } from '../utils/pendingStock';
import { QuickAddStockModal } from './TaskInboxPage';

type Filter = 'all' | 'not_ordered' | 'ordered' | 'overdue';

/**
 * 待找车 (owner 2026-10-18): after approval the Operations Manager finds the
 * bike. Approved deals without a stock unit, grouped by model with colour and
 * the basics, and the bikes ordered outside with supplier and expected arrival.
 */
export default function PendingStockPage({
  applications,
  vehicleCatalog,
  loadOrders,
  canManage,
  currentStaffName,
  onSaveOrder,
  onQuickAddStock,
  onOpenApplication,
  showHeading = true
}: {
  applications: LoanApplication[];
  vehicleCatalog: VehicleCatalogItem[];
  loadOrders: () => Promise<StockOrder[] | null>;
  canManage: boolean;
  currentStaffName: string;
  onSaveOrder: (order: StockOrder) => Promise<boolean>;
  onQuickAddStock?: (applicationId: string, model: string, input: QuickStockInput, options?: { stockOrder?: StockOrder }) => Promise<boolean>;
  onOpenApplication: (application: LoanApplication) => void;
  /** False inside the Stock page, which has its own heading. */
  showHeading?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState({ supplier: '', eta: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [arrivalFor, setArrivalFor] = useState<PendingStockRow | null>(null);
  // null while loading; the stock orders are read once when the page opens.
  const [orders, setOrders] = useState<StockOrder[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void loadOrders().then((rows) => {
      if (!cancelled) setOrders(rows || []);
    });
    return () => { cancelled = true; };
  }, []);

  const groups = useMemo(() => buildPendingStock(applications, vehicleCatalog, orders || []), [applications, vehicleCatalog, orders]);
  const allRows = groups.flatMap((group) => group.rows);
  const counts = {
    all: allRows.length,
    not_ordered: allRows.filter((row) => !row.order).length,
    ordered: allRows.filter((row) => row.order).length,
    overdue: allRows.filter((row) => row.overdue).length
  };
  const matches = (row: PendingStockRow) => (
    filter === 'all' || (filter === 'not_ordered' && !row.order) || (filter === 'ordered' && Boolean(row.order)) || (filter === 'overdue' && row.overdue)
  );

  const startEditing = (row: PendingStockRow) => {
    setEditingId(row.application.id);
    setDraft({ supplier: row.order?.supplier || '', eta: row.order?.eta || '', note: row.order?.note || '' });
  };

  const saveOrder = async (row: PendingStockRow, status: StockOrder['status'], extra: Partial<StockOrder> = {}) => {
    if (saving) return false;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const next: StockOrder = {
        application_id: row.application.id,
        vehicle_model: row.model,
        colour: row.colour,
        condition: row.condition,
        supplier: (extra.supplier ?? row.order?.supplier ?? '').trim(),
        eta: extra.eta ?? row.order?.eta ?? '',
        note: (extra.note ?? row.order?.note ?? '').trim(),
        status,
        ordered_at: row.order?.ordered_at || now,
        ordered_by: row.order?.ordered_by || currentStaffName,
        updated_at: now,
        updated_by: currentStaffName
      };
      const ok = await onSaveOrder(next);
      if (ok) {
        setEditingId('');
        setOrders((current) => [...(current || []).filter((item) => item.application_id !== next.application_id), next]);
      }
      return ok;
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'h-9 w-full rounded-control border border-slate-200 bg-white px-2.5 text-footnote text-slate-700 outline-none focus:border-brand-100 focus:ring-2 focus:ring-brand-50';
  const filters: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: tr('全部', 'All', 'Semua') },
    { key: 'not_ordered', label: tr('还没找', 'Not ordered yet', 'Belum ditempah') },
    { key: 'ordered', label: tr('已下单', 'Ordered', 'Sudah ditempah') },
    { key: 'overdue', label: tr('过了到货日', 'Past expected arrival', 'Lewat tarikh tiba') }
  ];

  return (
    <div id="pending-stock-page" data-testid="pending-stock-page" className="space-y-6">
      <div>
        {showHeading && <h2 className="text-title-2 text-slate-900">{tr('待找车', 'Pending Stock', 'Stok Belum Ada')}</h2>}
        <p className="text-footnote text-slate-500">
          {tr(
            '已批准、还没有库存车的单子。店里没有就向外面下单，记下供应商和预计到货日;到货后入库，这单就会消失。',
            'Approved deals with no stock unit yet. If the shop has none, order outside and record the supplier and expected arrival; once the bike arrives and is added to stock, the deal leaves this list.',
            'Urus niaga diluluskan yang belum ada unit stok. Jika kedai tiada, tempah dari luar dan rekod pembekal serta tarikh dijangka tiba; selepas motor tiba dan dimasukkan ke stok, urus niaga keluar dari senarai ini.'
          )}
        </p>
      </div>

      <section className="flex flex-wrap gap-2" role="tablist" aria-label={tr('筛选', 'Filter', 'Tapis')}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            data-testid={`pending-stock-filter-${item.key}`}
            onClick={() => setFilter(item.key)}
            className={`inline-flex items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold ${filter === item.key ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-100 hover:text-brand-ink'}`}
          >
            {item.label}
            <span className={`rounded-chip px-1.5 font-mono text-caption ${filter === item.key ? 'bg-white/20' : 'bg-slate-100'}`}>{counts[item.key]}</span>
          </button>
        ))}
      </section>

      {orders === null ? (
        <p className="text-footnote text-slate-500">{tr('读取中…', 'Loading…', 'Memuatkan…')}</p>
      ) : groups.every((group) => !group.rows.some(matches)) ? (
        <p data-testid="pending-stock-empty" className="rounded-card border border-dashed border-slate-200 bg-white p-6 text-center text-footnote text-slate-500">
          {tr('没有要找的车。', 'Nothing to find right now.', 'Tiada motor perlu dicari sekarang.')}
        </p>
      ) : groups.filter((group) => group.rows.some(matches)).map((group) => (
        <section key={group.model} data-testid={`pending-stock-model-${group.model}`} className="rounded-card border border-slate-100 bg-white shadow-e1">
          <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
            <PackageSearch aria-hidden="true" className="h-5 w-5 text-brand" />
            <h3 className="text-headline text-slate-900">{group.model}</h3>
            <span className="rounded-chip bg-brand-50 px-2 py-0.5 text-caption font-bold text-brand-ink">
              {tr(`要 ${group.rows.length} 辆`, `${group.rows.length} needed`, `${group.rows.length} diperlukan`)}
            </span>
            <span className={`rounded-chip px-2 py-0.5 text-caption font-bold ${group.freeUnits.length ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {group.freeUnits.length
                ? tr(`店里现货 ${group.freeUnits.length} 辆，交车时可直接选`, `${group.freeUnits.length} free in stock; pick one at delivery`, `${group.freeUnits.length} ada dalam stok; pilih semasa penghantaran`)
                : tr('店里没有现货', 'None in stock', 'Tiada dalam stok')}
            </span>
          </header>
          <ul className="divide-y divide-slate-100">
            {group.rows.filter(matches).map((row) => {
              const isEditing = editingId === row.application.id;
              return (
                <li key={row.application.id} data-testid={`pending-stock-row-${row.application.id}`} className="grid gap-3 px-4 py-3 lg:grid-cols-[1.4fr_1.4fr_1.2fr] lg:items-start">
                  <div className="min-w-0">
                    <button type="button" onClick={() => onOpenApplication(row.application)} className="inline-flex items-center gap-1 text-callout font-bold text-slate-900 hover:text-brand-ink">
                      {row.application.applicant_name}
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                    <p className="text-caption text-slate-500">
                      {[row.application.purchase_method, row.application.handler_name, tr(`批准 ${row.waitingDays} 天`, `approved ${row.waitingDays} d ago`, `lulus ${row.waitingDays} hari`)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-caption">
                    <div><dt className="text-slate-400">{tr('颜色', 'Colour', 'Warna')}</dt><dd className="font-semibold text-slate-800">{row.colour || tr('未填', 'Not set', 'Belum diisi')}</dd></div>
                    <div><dt className="text-slate-400">{tr('新 / 二手', 'New / used', 'Baharu / terpakai')}</dt><dd className="font-semibold text-slate-800">{row.condition || '—'}</dd></div>
                    <div><dt className="text-slate-400">Negeri</dt><dd className="font-semibold text-slate-800">{row.negeri || '—'}</dd></div>
                  </dl>
                  <div className="space-y-2">
                    {row.order ? (
                      <p data-testid={`pending-stock-status-${row.application.id}`} className={`text-caption font-semibold ${row.overdue ? 'text-rose-700' : row.order.status === 'Arrived' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        <Truck aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />
                        {row.order.status === 'Arrived'
                          ? tr('已到货，等入库', 'Arrived; add it to stock', 'Telah tiba; masukkan ke stok')
                          : tr(
                            `已下单 · ${row.order.supplier || '供应商未填'}${row.order.eta ? ` · 预计 ${row.order.eta}` : ''}${row.overdue ? ' · 已过到货日' : ''}`,
                            `Ordered · ${row.order.supplier || 'no supplier'}${row.order.eta ? ` · due ${row.order.eta}` : ''}${row.overdue ? ' · past due' : ''}`,
                            `Ditempah · ${row.order.supplier || 'tiada pembekal'}${row.order.eta ? ` · dijangka ${row.order.eta}` : ''}${row.overdue ? ' · lewat' : ''}`
                          )}
                      </p>
                    ) : (
                      <p data-testid={`pending-stock-status-${row.application.id}`} className="text-caption font-semibold text-slate-500">{tr('还没找', 'Not ordered yet', 'Belum ditempah')}</p>
                    )}
                    {canManage && !isEditing && (
                      <div className="flex flex-wrap gap-2">
                        <button type="button" data-testid={`pending-stock-order-${row.application.id}`} onClick={() => startEditing(row)} className="rounded-control bg-white px-2.5 py-1.5 text-caption font-bold text-slate-700 ring-1 ring-slate-200 hover:text-brand-ink">
                          {row.order ? tr('修改下单', 'Edit order', 'Ubah tempahan') : tr('已向外面下单', 'Ordered outside', 'Sudah tempah dari luar')}
                        </button>
                        {onQuickAddStock && (
                          <button type="button" data-testid={`pending-stock-arrived-${row.application.id}`} onClick={() => setArrivalFor(row)} className="rounded-control bg-emerald-700 px-2.5 py-1.5 text-caption font-bold text-white hover:bg-emerald-800">
                            {tr('到货入库', 'Arrived: add to stock', 'Tiba: masukkan ke stok')}
                          </button>
                        )}
                        {row.order && (
                          <button type="button" data-testid={`pending-stock-cancel-${row.application.id}`} disabled={saving} onClick={() => void saveOrder(row, 'Cancelled')} className="rounded-control px-2.5 py-1.5 text-caption font-semibold text-slate-500 hover:text-rose-700">
                            {tr('取消下单', 'Cancel order', 'Batal tempahan')}
                          </button>
                        )}
                      </div>
                    )}
                    {isEditing && (
                      <form
                        data-testid={`pending-stock-form-${row.application.id}`}
                        className="grid gap-2 rounded-control bg-slate-50 p-2.5 sm:grid-cols-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void saveOrder(row, 'Ordered', draft);
                        }}
                      >
                        <label className="flex flex-col gap-1 text-micro uppercase text-slate-500">
                          {tr('供应商', 'Supplier', 'Pembekal')}
                          <input value={draft.supplier} onChange={(event) => setDraft((current) => ({ ...current, supplier: event.target.value }))} aria-label="Stock order supplier" maxLength={120} className={inputClass} />
                        </label>
                        <label className="flex flex-col gap-1 text-micro uppercase text-slate-500">
                          {tr('预计到货日', 'Expected arrival', 'Dijangka tiba')}
                          <input type="date" value={draft.eta} onChange={(event) => setDraft((current) => ({ ...current, eta: event.target.value }))} aria-label="Stock order expected arrival" className={inputClass} />
                        </label>
                        <label className="flex flex-col gap-1 text-micro uppercase text-slate-500 sm:col-span-2">
                          {tr('备注(选填)', 'Note (optional)', 'Nota (pilihan)')}
                          <input value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} aria-label="Stock order note" maxLength={300} className={inputClass} />
                        </label>
                        <div className="flex justify-end gap-2 sm:col-span-2">
                          <button type="button" onClick={() => setEditingId('')} className="rounded-control px-3 py-1.5 text-caption font-semibold text-slate-500">{tr('取消', 'Cancel', 'Batal')}</button>
                          <button type="submit" disabled={saving || !draft.supplier.trim()} className="rounded-control bg-brand px-3 py-1.5 text-caption font-bold text-white disabled:bg-slate-300">{tr('保存下单', 'Save order', 'Simpan tempahan')}</button>
                        </div>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {arrivalFor && onQuickAddStock && (
        <QuickAddStockModal
          application={arrivalFor.application}
          model={arrivalFor.model}
          onSave={async (applicationId, model, input) => {
            // Owner review 2026-10-19: the bike is saved first, then reserved for
            // this customer and the order marked Arrived in one transaction; the
            // modal closes only when that really succeeded.
            const order = arrivalFor.order;
            const ok = await onQuickAddStock(applicationId, model, input, { stockOrder: order || undefined });
            if (ok && order) {
              setOrders((current) => (current || []).map((item) => item.application_id === order.application_id ? { ...item, status: 'Arrived' } : item));
            }
            return ok;
          }}
          onClose={() => setArrivalFor(null)}
        />
      )}
    </div>
  );
}
