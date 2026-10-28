import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, PackageSearch } from 'lucide-react';
import { tr } from '../lib/i18n';
import type { LoanApplication, StockOrder } from '../types';
import { buildPendingStock } from '../utils/pendingStock';
import FinanceCenter from './FinanceCenter';
import PendingStockPage from './PendingStockPage';

type StockTab = 'pending' | 'inventory';

/**
 * 库存 (owner 2026-10-18): finding, ordering and keeping bikes in one place.
 * "To source" lists approved deals without a bike; "In stock" is the physical
 * stock with its cost (the stock workspace that used to be a Finance Center tab).
 */
export default function StockPage({
  pendingProps,
  inventoryProps,
  inventoryRequestId
}: {
  pendingProps: Omit<React.ComponentProps<typeof PendingStockPage>, 'showHeading'>;
  inventoryProps: Omit<React.ComponentProps<typeof FinanceCenter>, 'view'>;
  /** Bumped by a Home card that sends Operations to add stock / record cost. */
  inventoryRequestId: number;
}) {
  const [tab, setTab] = useState<StockTab>('pending');
  useEffect(() => {
    if (inventoryRequestId > 0) setTab('inventory');
  }, [inventoryRequestId]);

  const pendingCount = useMemo(
    () => buildPendingStock(pendingProps.applications as LoanApplication[], pendingProps.vehicleCatalog, [] as StockOrder[])
      .reduce((sum, group) => sum + group.rows.length, 0),
    [pendingProps.applications, pendingProps.vehicleCatalog]
  );
  const inStockCount = useMemo(
    () => inventoryProps.vehicleCatalog.flatMap((item) => item.stock_units || []).filter((unit) => unit.status === 'In Stock' && !unit.sold_application_id).length,
    [inventoryProps.vehicleCatalog]
  );

  const tabs: Array<{ key: StockTab; label: string; count: number; icon: React.ReactNode }> = [
    { key: 'pending', label: tr('待找车', 'To source', 'Perlu dicari'), count: pendingCount, icon: <PackageSearch aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} /> },
    { key: 'inventory', label: tr('现货与成本', 'In stock & cost', 'Stok & kos'), count: inStockCount, icon: <Boxes aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} /> }
  ];

  return (
    <div id="stock-page" data-testid="stock-page" className="space-y-6">
      <div>
        <h2 className="text-title-2 text-slate-900">{tr('库存', 'Stock', 'Stok')}</h2>
        <p className="mt-1 text-footnote text-slate-500">
          {tr(
            '批准后要找的车、向外面下的单、店里的现货和成本，都在这里。',
            'Bikes to find after approval, orders placed outside, and the bikes in the shop with their cost, in one place.',
            'Motor yang perlu dicari selepas kelulusan, tempahan dari luar, dan motor di kedai dengan kosnya, di satu tempat.'
          )}
        </p>
      </div>
      <section role="tablist" aria-label={tr('库存分页', 'Stock sections', 'Bahagian stok')} className="grid grid-flow-col auto-cols-[minmax(max-content,1fr)] gap-1 overflow-x-auto rounded-card bg-white p-1 ring-1 ring-slate-100">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            data-testid={`stock-tab-${item.key}`}
            onClick={() => setTab(item.key)}
            className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 py-2 text-footnote font-bold transition-colors ${tab === item.key ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            {item.icon}{item.label}
            <span className={`rounded-chip px-1.5 font-mono text-caption ${tab === item.key ? 'bg-white/20' : 'bg-slate-100'}`}>{item.count}</span>
          </button>
        ))}
      </section>
      {tab === 'pending'
        ? <PendingStockPage {...pendingProps} showHeading={false} />
        : <FinanceCenter {...inventoryProps} view="stock" />}
    </div>
  );
}
