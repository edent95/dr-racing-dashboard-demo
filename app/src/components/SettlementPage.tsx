import { useMemo, useState } from 'react';
import { ArrowUpRight, Bike, CheckCircle2, HandCoins, ListChecks, Search, Wallet, type LucideIcon } from 'lucide-react';
import { LoanStatus, type DealFinance, type DeliveryPayment, type LoanApplication, type RoleAccountRole } from '../types';
import { tr } from '../lib/i18n';
import { getDealSettlementSummary, type DealSettlementStage, type DealSettlementSummary } from '../utils/dealFinance';
import { isOperationsLead } from '../utils/staffRoles';
import { DealSettlementModal } from './DealSettlementModal';

interface SettlementPageProps {
  applications: LoanApplication[];
  currentStaffRole: RoleAccountRole;
  onSaveDealFinance: (applicationId: string, finance: DealFinance) => Promise<boolean>;
  onMarkCommissionPaid?: (applicationId: string) => Promise<boolean>;
  onOpenApplication: (application: LoanApplication) => void;
  loadDeliveryPayments?: (applicationId: string) => Promise<DeliveryPayment[] | null>;
}

type SettlementFilter = 'open' | DealSettlementStage;

interface SettlementRow {
  application: LoanApplication;
  finance: DealFinance;
  summary: DealSettlementSummary;
}

const STAGE_ORDER: Record<DealSettlementStage, number> = {
  'ready-to-complete': 0,
  collecting: 1,
  commission: 2,
  'awaiting-delivery': 3,
  settled: 4
};

const STAGE_STYLE: Record<DealSettlementStage, { chip: string; icon: LucideIcon }> = {
  'awaiting-delivery': { chip: 'bg-slate-100 text-slate-600', icon: Bike },
  collecting: { chip: 'bg-amber-50 text-amber-700', icon: Wallet },
  'ready-to-complete': { chip: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  commission: { chip: 'bg-purple-50 text-purple-700', icon: HandCoins },
  settled: { chip: 'bg-slate-100 text-slate-500', icon: CheckCircle2 }
};

const stageLabel = (stage: DealSettlementStage) => {
  const labels: Record<DealSettlementStage, [string, string, string]> = {
    'awaiting-delivery': ['等交车', 'Awaiting Delivery', 'Menunggu Penghantaran'],
    collecting: ['收款中', 'Collecting Payment', 'Kutipan Bayaran'],
    'ready-to-complete': ['可完成财务', 'Ready to Complete', 'Sedia Diselesaikan'],
    commission: ['待付佣金', 'Commission to Pay', 'Komisen Belum Dibayar'],
    settled: ['已结算', 'Settled', 'Selesai']
  };
  return tr(...labels[stage]);
};

const money = (value: number) => `RM${Math.round(value).toLocaleString('en-MY')}`;

const nextStepText = ({ application, finance, summary }: SettlementRow) => {
  switch (summary.stage) {
    case 'awaiting-delivery':
      return tr('先交车：在首页的交车任务选库存并确认。', 'Deliver the bike first: pick the stock unit on the Home delivery task.', 'Hantar motosikal dahulu: pilih unit stok pada tugasan penghantaran di Laman Utama.');
    case 'collecting':
      return tr(`还有 ${money(summary.outstanding)} 未收，收到后登记。`, `${money(summary.outstanding)} still outstanding; record each receipt.`, `${money(summary.outstanding)} masih belum diterima; rekod setiap penerimaan.`);
    case 'ready-to-complete':
      return tr('款已收齐，标记财务完成。', 'Receipts are complete; mark finance completed.', 'Penerimaan lengkap; tandakan kewangan selesai.');
    case 'commission':
      return tr(`付 ${application.handler_name} 佣金 ${money(Number(finance.commission_amount) || 0)}。`, `Pay ${application.handler_name} the ${money(Number(finance.commission_amount) || 0)} commission.`, `Bayar komisen ${money(Number(finance.commission_amount) || 0)} kepada ${application.handler_name}.`);
    default:
      return tr('已完成，无需操作。', 'Done; nothing to do.', 'Selesai; tiada tindakan.');
  }
};

const tableHeaderCellClass = 'whitespace-nowrap border-b border-r border-slate-200 px-3 font-bold last:border-r-0';
const tableBodyCellClass = 'border-b border-r border-slate-200 px-3 py-3 align-top last:border-r-0';

// 结算工作台: the Operations Manager's Home-style page for every deal between
// delivery and paid commission. Settling opens the same modal as the Home tasks.
export default function SettlementPage({
  applications,
  currentStaffRole,
  onSaveDealFinance,
  onMarkCommissionPaid,
  onOpenApplication,
  loadDeliveryPayments
}: SettlementPageProps) {
  const [filter, setFilter] = useState<SettlementFilter>('open');
  const [query, setQuery] = useState('');
  const [settlementAppId, setSettlementAppId] = useState('');
  const [runningId, setRunningId] = useState('');
  const canEdit = isOperationsLead(currentStaffRole);

  const rows = useMemo<SettlementRow[]>(() => applications
    .filter((application) => (
      application.deal_finance
      && application.deal_finance.sale_status !== 'Cancelled'
      && application.status !== LoanStatus.CANCELLED
    ))
    .map((application) => {
      const finance = application.deal_finance as DealFinance;
      return { application, finance, summary: getDealSettlementSummary(finance, application.purchase_method) };
    })
    .sort((left, right) => (
      STAGE_ORDER[left.summary.stage] - STAGE_ORDER[right.summary.stage]
      || String(right.finance.updated_at || '').localeCompare(String(left.finance.updated_at || ''))
    )), [applications]);

  const countByStage = useMemo(() => rows.reduce<Record<DealSettlementStage, number>>((counts, row) => {
    counts[row.summary.stage] += 1;
    return counts;
  }, { 'awaiting-delivery': 0, collecting: 0, 'ready-to-complete': 0, commission: 0, settled: 0 }), [rows]);
  const openCount = rows.length - countByStage.settled;
  const outstandingTotal = rows.reduce((total, row) => total + (row.summary.stage === 'settled' ? 0 : row.summary.outstanding), 0);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter((row) => (
    (filter === 'open' ? row.summary.stage !== 'settled' : row.summary.stage === filter)
    && (!normalizedQuery || [row.application.applicant_name, row.application.vehicle_model, row.application.id, row.application.handler_name, row.application.ic_no]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
  ));
  const settlementApp = settlementAppId ? applications.find((application) => application.id === settlementAppId) : undefined;

  const filters: Array<{ key: SettlementFilter; label: string; count: number }> = [
    { key: 'open', label: tr('全部待结算', 'All Open', 'Semua Terbuka'), count: openCount },
    ...(['ready-to-complete', 'collecting', 'commission', 'awaiting-delivery', 'settled'] as DealSettlementStage[])
      .map((stage) => ({ key: stage, label: stageLabel(stage), count: countByStage[stage] }))
  ];

  return (
    <div id="settlement-page" data-testid="settlement-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-title-2 text-slate-900">{tr('结算', 'Settlement', 'Penyelesaian')}</h2>
          <p className="mt-1 text-footnote text-slate-500">
            {tr(
              '交车之后的每一单：登记收款、完成财务、付佣金。',
              'Every deal after delivery: record receipts, complete finance, pay commission.',
              'Setiap urus niaga selepas penghantaran: rekod penerimaan, selesaikan kewangan, bayar komisen.'
            )}
          </p>
        </div>
        <label className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={tr('搜索结算', 'Search settlements', 'Cari penyelesaian')}
            placeholder={tr('搜索客户、车型、Sales', 'Search customer, model, Sales', 'Cari pelanggan, model, Jualan')}
            className="w-full min-w-[240px] rounded-control bg-white py-2 pl-9 pr-3 text-footnote text-slate-700 ring-1 ring-slate-100 outline-none focus:ring-brand-100"
          />
        </label>
      </section>

      <section data-testid="settlement-metric-strip" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="flex min-h-[82px] flex-col rounded-card border border-slate-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-chip bg-slate-100 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-slate-600">{tr('待结算', 'Open Deals', 'Urus Niaga Terbuka')}</span>
            <ListChecks className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-slate-900">{openCount}</p>
        </div>
        <div className="flex min-h-[82px] flex-col rounded-card border border-amber-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-chip bg-amber-50 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-amber-700">{tr('未收总额', 'Outstanding', 'Baki')}</span>
            <Wallet className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-amber-600">{money(outstandingTotal)}</p>
        </div>
        <div className="flex min-h-[82px] flex-col rounded-card border border-emerald-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-chip bg-emerald-50 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-emerald-700">{stageLabel('ready-to-complete')}</span>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-emerald-600">{countByStage['ready-to-complete']}</p>
        </div>
        <div className="flex min-h-[82px] flex-col rounded-card border border-purple-100 bg-white p-2.5 shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-chip bg-purple-50 px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide text-purple-700">{stageLabel('commission')}</span>
            <HandCoins className="h-4 w-4 shrink-0 text-purple-500" aria-hidden="true" />
          </div>
          <p className="mt-auto text-title-3 text-purple-600">{countByStage.commission}</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2" role="tablist" aria-label={tr('结算阶段', 'Settlement stages', 'Peringkat penyelesaian')}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            data-testid={`settlement-filter-${item.key}`}
            onClick={() => setFilter(item.key)}
            className={`inline-flex items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
              filter === item.key ? 'bg-brand text-white' : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.label}
            <span className={`rounded-full px-1.5 py-0.5 text-caption ${filter === item.key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{item.count}</span>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-e1">
        <div className="overflow-x-auto">
          <table data-testid="settlement-table" className="w-full min-w-[960px] border-separate border-spacing-0 text-left text-footnote">
            <thead className="bg-slate-50 text-caption text-slate-500">
              <tr className="h-11">
                <th className={`${tableHeaderCellClass} w-[150px]`}>{tr('阶段', 'Stage', 'Peringkat')}</th>
                <th className={tableHeaderCellClass}>{tr('客户 / 车型', 'Customer / Model', 'Pelanggan / Model')}</th>
                <th className={`${tableHeaderCellClass} text-right`}>{tr('应收', 'Sales Value', 'Jualan')}</th>
                <th className={`${tableHeaderCellClass} text-right`}>{tr('已收', 'Received', 'Terima')}</th>
                <th className={`${tableHeaderCellClass} text-right`}>{tr('未收', 'Outstanding', 'Baki')}</th>
                <th className={tableHeaderCellClass}>{tr('下一步', 'Next step', 'Langkah seterusnya')}</th>
                <th className={`${tableHeaderCellClass} w-[220px]`}>{tr('操作', 'Actions', 'Tindakan')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const { application, finance, summary } = row;
                const style = STAGE_STYLE[summary.stage];
                const StageIcon = style.icon;
                return (
                  <tr key={application.id} data-testid={`settlement-row-${application.id}`} data-stage={summary.stage} className="bg-white">
                    <td className={tableBodyCellClass}>
                      <span className={`inline-flex items-center gap-1.5 rounded-chip px-2 py-1 text-caption font-semibold ${style.chip}`}>
                        <StageIcon aria-hidden="true" className="h-3.5 w-3.5" />
                        {stageLabel(summary.stage)}
                      </span>
                    </td>
                    <td className={tableBodyCellClass}>
                      <p className="font-semibold text-slate-900">{application.applicant_name}</p>
                      <p className="mt-0.5 text-caption text-slate-500">
                        {[application.vehicle_model, application.purchase_method, application.handler_name].filter(Boolean).join(' · ')}
                      </p>
                    </td>
                    <td className={`${tableBodyCellClass} text-right font-mono text-slate-800`}>{money(summary.salesValue)}</td>
                    <td className={`${tableBodyCellClass} text-right font-mono text-emerald-600`}>{money(summary.received)}</td>
                    <td className={`${tableBodyCellClass} text-right font-mono ${summary.outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{money(summary.outstanding)}</td>
                    <td className={`${tableBodyCellClass} text-slate-600`}>{nextStepText(row)}</td>
                    <td className={tableBodyCellClass}>
                      <div className="flex flex-wrap gap-1.5">
                        {canEdit && summary.stage !== 'settled' && (
                          <button
                            type="button"
                            onClick={() => setSettlementAppId(application.id)}
                            className="inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep"
                          >
                            {tr('结算', 'Settle', 'Selesaikan')}
                          </button>
                        )}
                        {canEdit && summary.stage === 'commission' && onMarkCommissionPaid && (
                          <button
                            type="button"
                            disabled={Boolean(runningId)}
                            onClick={async () => {
                              if (runningId) return;
                              setRunningId(application.id);
                              try {
                                await onMarkCommissionPaid(application.id);
                              } finally {
                                setRunningId('');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-control bg-emerald-700 px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300"
                          >
                            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                            {runningId === application.id ? tr('更新中...', 'Updating...', 'Mengemas kini...') : tr('标记佣金已付', 'Mark Commission Paid', 'Tanda Komisen Dibayar')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenApplication(application)}
                          className="inline-flex items-center gap-1.5 rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          {tr('申请详情', 'Application', 'Permohonan')}
                          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-body text-slate-400">
                    {tr('这里没有要结算的单。', 'No deals here.', 'Tiada urus niaga di sini.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {settlementApp && canEdit && (
        <DealSettlementModal
          application={settlementApp}
          onSave={onSaveDealFinance}
          onClose={() => setSettlementAppId('')}
          loadPayments={loadDeliveryPayments}
        />
      )}
    </div>
  );
}
