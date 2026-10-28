import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Download, RefreshCw } from 'lucide-react';
import { tr } from '../lib/i18n';
import type { OpeningDepositExport } from '../lib/ledgerSync';
import type { LoanApplication, VehicleCatalogItem } from '../types';
import { buildLedgerStatusRows, type LedgerRowState, type LedgerStatusPayload, type LedgerStatusRow } from '../utils/ledgerSyncStatus';

type Filter = 'attention' | 'all';

/**
 * Ledger sync (owner 2026-10-18: bo.dr-racing.com is the record, the ledger
 * follows). Every delivery invoice and stock purchase bill bo should have sent,
 * with its ledger number, or why it is missing / out of date, and a button to
 * send it again from bo.
 */
export default function LedgerSyncPanel({
  applications,
  vehicleCatalog,
  loadStatus,
  onResendInvoice,
  onResendStock,
  loadOpeningDeposits
}: {
  applications: LoanApplication[];
  vehicleCatalog: VehicleCatalogItem[];
  loadStatus: () => Promise<LedgerStatusPayload | null>;
  onResendInvoice: (applicationId: string) => Promise<void>;
  onResendStock: (stockUnitId: string) => Promise<void>;
  /** Super Admin only: the pre-go-live deposit list for the accountant's opening import. */
  loadOpeningDeposits?: () => Promise<OpeningDepositExport | null>;
}) {
  const [status, setStatus] = useState<LedgerStatusPayload | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>('attention');
  const [busyId, setBusyId] = useState('');
  const [openingNote, setOpeningNote] = useState('');

  // Owner 2026-10-19: bo fills the contact codes. The file goes to the accountant, who adds it to the
  // ledger's opening import; each deposit then links itself to its deal (receipt OB-DRD-<id>).
  const downloadOpeningDeposits = async () => {
    if (!loadOpeningDeposits || busyId) return;
    setBusyId('opening');
    try {
      const data = await loadOpeningDeposits();
      if (!data) {
        setOpeningNote(tr('读取失败，请稍后再试', 'Could not read the list; try again later', 'Gagal membaca senarai; cuba lagi nanti'));
        return;
      }
      const body = JSON.stringify({ asOf: data.asOf, customerDeposits: data.customerDeposits }, null, 2);
      const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `ledger-opening-deposits-${data.asOf}.json`;
      link.click();
      URL.revokeObjectURL(url);
      const total = (Number(data.totalCents) / 100).toLocaleString('en-MY', { minimumFractionDigits: 2 });
      const rows = data.customerDeposits.length;
      setOpeningNote(tr(
        `已下载 ${rows} 笔，合计 RM${total}。请会计核对旧系统 ${data.asOf} 的订金余额一致后，放进 ledger 开账导入。`,
        `Downloaded ${rows} deposits, RM${total} in total. The accountant checks it against the old system's deposit balance on ${data.asOf}, then adds it to the ledger's opening import.`,
        `${rows} deposit dimuat turun, jumlah RM${total}. Akauntan menyemak dengan baki deposit sistem lama pada ${data.asOf}, kemudian menambahnya ke import pembukaan ledger.`
      ));
    } finally {
      setBusyId('');
    }
  };
  const openingBlock = loadOpeningDeposits ? (
    <div data-testid="ledger-opening-deposits" className="rounded-card bg-white p-4 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-footnote text-slate-600">
          {tr(
            '上线前收的订金：下载清单交给会计做 ledger 开账，客户代码已自动填好，交车时会自动抵扣，不会重复记账。',
            'Deposits taken before the go-live: download the list for the accountant\'s ledger opening balances. Customer codes are filled in, and each deposit settles its invoice at delivery without being recorded twice.',
            'Deposit sebelum go-live: muat turun senarai untuk baki pembukaan ledger akauntan. Kod pelanggan sudah diisi, dan setiap deposit menjelaskan invoisnya semasa penghantaran tanpa direkod dua kali.'
          )}
        </p>
        <button type="button" data-testid="ledger-opening-deposits-download" disabled={busyId === 'opening'} onClick={() => void downloadOpeningDeposits()} className="inline-flex items-center gap-1 rounded-control bg-white px-2.5 py-1.5 text-caption font-bold text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink disabled:opacity-50">
          <Download aria-hidden="true" className="h-3.5 w-3.5" />{tr('下载上线前订金清单', 'Download pre-go-live deposits', 'Muat turun deposit sebelum go-live')}
        </button>
      </div>
      {openingNote && <p data-testid="ledger-opening-deposits-note" className="mt-2 text-caption text-slate-500">{openingNote}</p>}
    </div>
  ) : null;

  const reload = useCallback(async () => {
    setStatus(await loadStatus());
  }, [loadStatus]);
  useEffect(() => {
    void reload();
    // Read once when the tab opens; Refresh reloads.
  }, []);

  const rows = useMemo(() => (status ? buildLedgerStatusRows(applications, vehicleCatalog, status) : []), [applications, vehicleCatalog, status]);
  const shown = rows.filter((row) => filter === 'all' || row.state !== 'synced');
  const count = (state: LedgerRowState) => rows.filter((row) => row.state === state).length;

  const reasonText = (row: LedgerStatusRow) => {
    if (row.state === 'missing') {
      return row.reason === 'no_chassis'
        ? tr('还没有底盘号，填好后才能进 ledger', 'No chassis number yet; it reaches the ledger once filled in', 'Belum ada nombor casis; masuk ke ledger selepas diisi')
        : tr('ledger 里还没有', 'Not in the ledger yet', 'Belum ada dalam ledger');
    }
    if (row.state === 'differs') {
      const parts = row.reason.split(',').map((part) => ({
        price: tr('售价', 'price', 'harga'),
        customer: tr('客户付款', 'customer payments', 'bayaran pelanggan'),
        bank: tr('银行放款', 'bank disbursement', 'pengeluaran bank'),
        cost: tr('成本', 'cost', 'kos')
      }[part] || part));
      return tr(`和 bo 不一致:${parts.join('、')}`, `Differs from bo: ${parts.join(', ')}`, `Berbeza daripada bo: ${parts.join(', ')}`);
    }
    return tr('已同步', 'In sync', 'Sepadan');
  };

  const resend = async (row: LedgerStatusRow) => {
    if (busyId) return;
    setBusyId(`${row.kind}-${row.id}`);
    try {
      if (row.kind === 'invoice') await onResendInvoice(row.id);
      else await onResendStock(row.id);
      await reload();
    } finally {
      setBusyId('');
    }
  };

  if (status === undefined) {
    return <p className="text-footnote text-slate-500">{tr('读取中…', 'Loading…', 'Memuatkan…')}</p>;
  }
  if (status === null || !status.connected) {
    return (
      <div className="space-y-4">
      {openingBlock}
      <p data-testid="ledger-sync-not-connected" className="rounded-card border border-dashed border-slate-200 bg-white p-6 text-center text-footnote text-slate-500">
        {tr('Ledger 还没接通，接通后这里会列出每张发票和进货单的同步情况。', 'The ledger is not connected yet; once it is, every invoice and purchase bill shows here.', 'Ledger belum disambungkan; selepas disambung, setiap invois dan bil belian dipaparkan di sini.')}
      </p>
      </div>
    );
  }

  return (
    <section data-testid="ledger-sync-panel" className="space-y-4">
      {openingBlock}
      <div className="rounded-card bg-white p-4 ring-1 ring-slate-100">
        <p className="text-footnote text-slate-600">
          {tr(
            `bo.dr-racing.com 是正本，ledger 只接收 bo 送过去的单据。不一致或缺少的，在这里点「重新同步」修正，不要在 ledger 里手动改。从 ${status.since} 起算。`,
            `bo.dr-racing.com is the record; the ledger only takes what bo sends. Fix anything missing or out of date here with Resend, never by editing the ledger. Counted from ${status.since}.`,
            `bo.dr-racing.com ialah rekod utama; ledger hanya menerima apa yang dihantar bo. Betulkan yang hilang atau tidak sepadan di sini dengan Hantar semula, jangan ubah dalam ledger. Dikira dari ${status.since}.`
          )}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-caption font-bold">
          <span className="rounded-chip bg-rose-50 px-2 py-1 text-rose-700">{tr(`缺少 ${count('missing')}`, `Missing ${count('missing')}`, `Hilang ${count('missing')}`)}</span>
          <span className="rounded-chip bg-amber-50 px-2 py-1 text-amber-700">{tr(`不一致 ${count('differs')}`, `Out of date ${count('differs')}`, `Tidak sepadan ${count('differs')}`)}</span>
          <span className="rounded-chip bg-emerald-50 px-2 py-1 text-emerald-700">{tr(`已同步 ${count('synced')}`, `In sync ${count('synced')}`, `Sepadan ${count('synced')}`)}</span>
          <span className="flex-1" />
          <button type="button" data-testid="ledger-sync-filter" onClick={() => setFilter((current) => (current === 'all' ? 'attention' : 'all'))} className="rounded-control bg-white px-2.5 py-1.5 text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink">
            {filter === 'all' ? tr('只看要处理的', 'Only what needs action', 'Hanya yang perlu tindakan') : tr('显示全部', 'Show all', 'Tunjuk semua')}
          </button>
          <button type="button" onClick={() => void reload()} className="inline-flex items-center gap-1 rounded-control bg-white px-2.5 py-1.5 text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink">
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />{tr('刷新', 'Refresh', 'Muat semula')}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-card bg-white ring-1 ring-slate-100">
        <table className="w-full min-w-[640px] text-left text-footnote">
          <thead className="text-micro uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">{tr('单据', 'Document', 'Dokumen')}</th>
              <th className="px-4 py-2">{tr('日期', 'Date', 'Tarikh')}</th>
              <th className="px-4 py-2">{tr('Ledger 号', 'Ledger no.', 'No. ledger')}</th>
              <th className="px-4 py-2">{tr('情况', 'Status', 'Status')}</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">{tr('都同步好了。', 'Everything is in sync.', 'Semuanya sepadan.')}</td></tr>
            )}
            {shown.map((row) => (
              <tr key={`${row.kind}-${row.id}`} data-testid={`ledger-row-${row.kind}-${row.id}`} data-state={row.state}>
                <td className="px-4 py-2.5">
                  <span className="block font-semibold text-slate-800">{row.label}</span>
                  <span className="block text-caption text-slate-500">{row.kind === 'invoice' ? tr('交车发票', 'Delivery invoice', 'Invois penghantaran') : tr('进货单', 'Purchase bill', 'Bil belian')}{row.detail ? ` · ${row.detail}` : ''}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-caption text-slate-600">{row.date || '—'}</td>
                <td className="px-4 py-2.5 font-mono text-caption text-slate-800">{row.docNo || '—'}</td>
                <td className={`px-4 py-2.5 text-caption font-semibold ${row.state === 'missing' ? 'text-rose-700' : row.state === 'differs' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {row.state === 'synced'
                    ? <CheckCircle2 aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />
                    : <CircleAlert aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />}
                  {reasonText(row)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {row.state !== 'synced' && row.reason !== 'no_chassis' && (
                    <button
                      type="button"
                      data-testid={`ledger-resend-${row.kind}-${row.id}`}
                      disabled={Boolean(busyId)}
                      onClick={() => void resend(row)}
                      className="rounded-control bg-brand px-2.5 py-1.5 text-caption font-bold text-white hover:bg-brand-deep disabled:bg-slate-300"
                    >
                      {busyId === `${row.kind}-${row.id}` ? tr('同步中…', 'Sending…', 'Menghantar…') : tr('重新同步', 'Resend', 'Hantar semula')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
