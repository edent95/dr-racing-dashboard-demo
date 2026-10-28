import { useEffect, useRef, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import type { DealFinance, DeliveryPayment, LoanApplication } from '../types';
import { tr } from '../lib/i18n';
import { fieldLabel } from '../data/fieldLabels';
import { reconcileSettlementReceipts } from '../utils/deliveryChecklist';
import { malaysiaDate } from '../../shared/malaysiaDate.mjs';
import { isTierCommission } from '../utils/commissionTiers';

// 成交结算弹窗: do the whole settlement (receipts, finance completion, commission
// payout) from the Task Inbox or the Settlement page without opening the Finance Center page.
export function DealSettlementModal({
  application,
  onSave,
  onClose,
  loadPayments
}: {
  application: LoanApplication;
  onSave: (applicationId: string, finance: DealFinance) => Promise<boolean>;
  onClose: () => void;
  /** The payments Sales recorded on the Delivery page, to reconcile against. */
  loadPayments?: (applicationId: string) => Promise<DeliveryPayment[] | null>;
}) {
  const base = application.deal_finance;
  const isCash = application.purchase_method === 'Cash';
  // Owner 2026-10-18: the Operations Manager confirms instead of retyping. A loan's
  // bank disbursement starts at the approved loan; deposit + cash start from the
  // payments Sales recorded (below). Nothing is saved until a button is pressed.
  const prefillBank = !isCash && base && !Number(base.bank_disbursement) && Number(base.loan_amount) > 0;
  const [draft, setDraft] = useState<DealFinance | null>(base ? {
    ...base,
    ...(isCash ? { bank_disbursement: 0, bank_disbursed_at: '' } : {}),
    ...(prefillBank ? { bank_disbursement: Number(base.loan_amount) } : {})
  } : null);
  const [editingRecordedField, setEditingRecordedField] = useState<'final_selling_price' | 'commission_amount' | null>(null);
  const [saving, setSaving] = useState(false);
  const refreshAfterSave = useRef(false);
  useEffect(() => {
    // Rebase only after our confirmed save; remote changes must leave an unsaved draft intact.
    if (!saving && refreshAfterSave.current && application.deal_finance) {
      refreshAfterSave.current = false;
      setDraft(application.deal_finance);
    }
  }, [saving, application.deal_finance]);
  const [payments, setPayments] = useState<DeliveryPayment[] | null>(null);
  const [paymentLoadFailed, setPaymentLoadFailed] = useState(false);
  const [paymentReload, setPaymentReload] = useState(0);
  // The loader is a new function on every parent render; read it through a ref
  // so the payments load once per opened deal, not on every realtime update.
  const loadPaymentsRef = useRef(loadPayments);
  loadPaymentsRef.current = loadPayments;
  const hasPaymentLoader = Boolean(loadPayments);
  useEffect(() => {
    let cancelled = false;
    const load = loadPaymentsRef.current;
    setPayments(null);
    setPaymentLoadFailed(false);
    if (!load) {
      setPaymentLoadFailed(true);
      return undefined;
    }
    void Promise.resolve().then(() => load(application.id)).then((list) => {
      if (cancelled) return;
      if (list === null) {
        setPaymentLoadFailed(true);
        return;
      }
      setPayments(list);
      // Nothing typed yet: take the deposit and cash from the recorded payments.
      setDraft((current) => {
        if (!current || Number(current.customer_deposit_received) || Number(current.customer_cash_payment)) return current;
        const result = reconcileSettlementReceipts(list, { deposit: Number(current.deposit_amount) || 0, cash: 0 });
        return result.hasRecords ? { ...current, ...result.fill } : current;
      });
    }).catch(() => { if (!cancelled) setPaymentLoadFailed(true); });
    return () => { cancelled = true; };
  }, [application.id, hasPaymentLoader, paymentReload]);
  if (!draft) return null;
  const num = (value: unknown) => Number(value) || 0;
  // Business day in Malaysia, not UTC (owner review 2026-10-19).
  const today = malaysiaDate();
  const salesValue = num(draft.final_selling_price) + num(draft.other_income) - num(draft.refund_amount);
  const receipts = num(draft.customer_deposit_received) + num(draft.customer_cash_payment) + num(draft.bank_disbursement);
  const outstanding = Math.max(salesValue - receipts, 0);
  const reconcile = payments ? reconcileSettlementReceipts(payments, { deposit: draft.customer_deposit_received, cash: draft.customer_cash_payment }) : null;
  // Finance cannot be completed while the deposit + cash disagree with the payments recorded.
  const paymentsMatch = reconcile !== null && reconcile.matches;
  const financeReady = salesValue > 0 && receipts + 0.01 >= salesValue && paymentsMatch;
  const formatRm = (value: number) => `RM${value.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`;
  const setField = (field: keyof DealFinance, value: number) => setDraft((current) => {
    if (!current) return current;
    const next = { ...current, [field]: value };
    if (field === 'final_selling_price' && current.commission_percent !== undefined) {
      next.commission_amount = Math.round(value * current.commission_percent) / 100;
    }
    if (field === 'commission_amount') {
      next.commission_percent = undefined;
      next.commission_source = 'manual';
    }
    return next;
  });
  const persist = async (extra: Partial<DealFinance>, keepOpen = false) => {
    if (saving) return;
    setSaving(true);
    try {
      if (extra.finance_completed_at || extra.commission_paid_at) {
        const rows = await loadPaymentsRef.current?.(application.id).catch(() => null);
        if (!rows) { setPaymentLoadFailed(true); return; }
        setPayments(rows);
        if (!reconcileSettlementReceipts(rows, { deposit: draft.customer_deposit_received, cash: draft.customer_cash_payment }).matches) return;
      }
      const next = {
        ...draft,
        ...extra,
        ...(isCash ? { bank_disbursement: 0, bank_disbursed_at: '' } : {})
      } as DealFinance;
      const ok = await onSave(application.id, next);
      if (ok) {
        if (keepOpen) { refreshAfterSave.current = true; setDraft(next); }
        else onClose();
      }
    } finally {
      setSaving(false);
    }
  };
  const moneyField = (label: string, field: keyof DealFinance) => (
    <label className="block space-y-1 text-micro uppercase text-slate-500">
      <span className="block">{label}</span>
      <span className="flex items-stretch overflow-hidden rounded-control ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="inline-flex items-center bg-slate-50 px-2 font-mono text-footnote text-slate-500">RM</span>
        <input
          type="number"
          min="0"
          step="0.01"
          aria-label={label}
          value={Number(draft[field]) || ''}
          onChange={(event) => setField(field, Number(event.target.value) || 0)}
          className="min-w-0 flex-1 px-2 py-2 text-right font-mono text-footnote font-bold text-slate-700 outline-none"
        />
      </span>
    </label>
  );
  const moneyDisplay = (label: string, field: 'final_selling_price' | 'commission_amount', testId: string, detail?: string) => (
    <span className="rounded-control bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <span className="flex items-center justify-between gap-2">
        <span className="block text-micro uppercase text-slate-500">{label}</span>
        <button
          type="button"
          data-testid={`${testId}-edit`}
          onClick={() => setEditingRecordedField((current) => current === field ? null : field)}
          className="inline-flex items-center gap-1 rounded-chip bg-white px-2 py-1 text-micro tracking-normal text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink"
          aria-label={`${editingRecordedField === field ? tr('完成', 'Done', 'Selesai') : tr('编辑', 'Edit', 'Edit')} ${label}`}
        >
          {editingRecordedField === field ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
          {editingRecordedField === field ? tr('完成', 'Done', 'Selesai') : tr('编辑', 'Edit', 'Edit')}
        </button>
      </span>
      {editingRecordedField === field ? (
        <span className="mt-2 flex items-stretch overflow-hidden rounded-control bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-100">
          <span className="inline-flex items-center bg-slate-100 px-2 font-mono text-footnote text-slate-500">RM</span>
          <input
            type="number"
            min="0"
            step="0.01"
            autoFocus
            data-testid={`${testId}-input`}
            aria-label={`${tr('编辑', 'Edit', 'Edit')} ${label}`}
            value={Number(draft[field]) || ''}
            onChange={(event) => setField(field, Number(event.target.value) || 0)}
            className="min-w-0 flex-1 px-2 py-2 text-right font-mono text-footnote font-bold text-slate-700 outline-none"
          />
        </span>
      ) : (
        <span data-testid={testId} className="mt-1 block font-mono text-headline text-slate-800">
          RM{num(draft[field]).toLocaleString('en-MY', { maximumFractionDigits: 2 })}
        </span>
      )}
      {detail && <span className="mt-1 block text-caption text-slate-500">{detail}</span>}
    </span>
  );
  return (
    <div data-testid="deal-settlement-modal" data-purchase-method={application.purchase_method} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-panel bg-white p-5 shadow-e3" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-headline text-slate-900">{tr('成交结算', 'Deal Settlement', 'Penyelesaian')}</h3>
            <p className="mt-0.5 text-footnote text-slate-500">{application.applicant_name} · {application.vehicle_model} · {application.handler_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-control p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {moneyDisplay(
            `${fieldLabel('sellingPrice')} · ${tr('已记录', 'Recorded', 'Direkod')}`,
            'final_selling_price',
            'settlement-final-selling-price',
            tr('已从成交资料带入', 'Loaded from the deal record', 'Diambil daripada rekod urus niaga')
          )}
          {!isCash && (
            <span className="space-y-1">
              {moneyField(tr('银行放款', 'Bank Disbursement', 'Pengeluaran Bank'), 'bank_disbursement')}
              {prefillBank && (
                <span data-testid="settlement-bank-prefilled" className="block text-caption text-slate-500">
                  {tr('已按批的贷款带入;银行实际到账金额不同再改。', 'Filled in from the approved loan; change it only if the bank paid a different amount.', 'Diisi daripada pinjaman yang diluluskan; tukar hanya jika bank membayar amaun berbeza.')}
                </span>
              )}
            </span>
          )}
          <span className="space-y-1">
            {moneyField(tr('实际到账订金', 'Deposit Actually Received', 'Deposit Sebenar Diterima'), 'customer_deposit_received')}
            {num(draft.customer_deposit_received) > 0 && (
              <label className="block space-y-1 text-micro uppercase text-slate-500">
                <span className="block">{tr('订金到账日', 'Deposit Date', 'Tarikh Deposit')}</span>
                <input
                  type="date"
                  data-testid="settlement-deposit-date"
                  aria-label={tr('订金到账日', 'Deposit Date', 'Tarikh Deposit')}
                  value={draft.customer_deposit_date || ''}
                  onChange={(event) => setDraft((current) => current ? { ...current, customer_deposit_date: event.target.value } : current)}
                  className="w-full rounded-control px-2 py-2 font-mono text-footnote text-slate-700 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <span data-testid="settlement-deposit-date-hint" className="block text-caption normal-case text-slate-500">
                  {draft.customer_deposit_date && draft.customer_deposit_date > today
                    ? tr(`${draft.customer_deposit_date} 才记入账本，当天自动抵扣发票。`, `Booked in the ledger on ${draft.customer_deposit_date}; it settles the invoice that day.`, `Direkod dalam lejar pada ${draft.customer_deposit_date}; ia menjelaskan invois pada hari itu.`)
                    : tr('空白 = 已经到账。订金晚到就选到账那天。', 'Blank = already received. If the deposit comes later, pick the day it arrives.', 'Kosong = sudah diterima. Jika deposit datang kemudian, pilih tarikh ia tiba.')}
                </span>
              </label>
            )}
          </span>
          {moneyField(tr('客户现金', 'Customer Cash', 'Tunai Pelanggan'), 'customer_cash_payment')}
          {moneyField(tr('银行/成交费用', 'Bank / Deal Charges', 'Caj Bank'), 'direct_bank_charges')}
          {moneyDisplay(
            draft.commission_percent !== undefined
              ? tr(`佣金 · 卖价 ${draft.commission_percent}%`, `Commission · ${draft.commission_percent}% of selling price`, `Komisen · ${draft.commission_percent}% harga jualan`)
              : isTierCommission(draft)
                ? tr('佣金 · 按月度分级自动算', 'Commission · by monthly tier (auto)', 'Komisen · ikut tahap bulanan (auto)')
                : tr('佣金金额 · 已记录', 'Commission Amount · Recorded', 'Jumlah Komisen · Direkod'),
            'commission_amount',
            'settlement-commission-amount',
            isTierCommission(draft)
              ? tr('保存时按这位 Sales 当月已交车的总额重算;改金额就变成手动', "Recalculated on save from this Sales' delivered total for the month; typing an amount makes it manual", 'Dikira semula semasa simpan daripada jumlah penghantaran bulan ini; menaip amaun menjadikannya manual')
              : tr('已从成交资料带入', 'Loaded from the deal record', 'Diambil daripada rekod urus niaga')
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-card bg-slate-50 p-3 text-center">
          <span><span className="block text-micro uppercase text-slate-500">{tr('应收', 'Sales Value', 'Jualan')}</span><span className="mt-1 block font-mono text-footnote font-bold text-slate-800">RM{Math.round(salesValue)}</span></span>
          <span><span className="block text-micro uppercase text-slate-500">{tr('已收', 'Received', 'Terima')}</span><span className="mt-1 block font-mono text-footnote font-bold text-emerald-600">RM{Math.round(receipts)}</span></span>
          <span><span className="block text-micro uppercase text-slate-500">{tr('未收', 'Outstanding', 'Baki')}</span><span className={`mt-1 block font-mono text-footnote font-bold ${outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>RM{Math.round(outstanding)}</span></span>
        </div>
        {(
          <div
            data-testid="settlement-payment-reconcile"
            data-matches={paymentLoadFailed ? 'error' : reconcile ? String(reconcile.matches) : 'loading'}
            className={`mt-3 rounded-card p-3 text-caption ring-1 ${!reconcile ? 'bg-slate-50 text-slate-500 ring-slate-100' : reconcile.matches ? 'bg-emerald-50 text-emerald-800 ring-emerald-100' : 'bg-amber-50 text-amber-800 ring-amber-200'}`}
          >
            {paymentLoadFailed ? (
              <span role="alert">{tr('收款记录读取失败，暂时不能确认结算。', 'Could not load payments; settlement cannot be confirmed yet.', 'Bayaran gagal dimuatkan; penyelesaian belum boleh disahkan.')}</span>
            ) : !reconcile ? (
              tr('正在读取 Sales 记录的收款…', 'Loading the payments Sales recorded…', 'Memuatkan bayaran yang direkod Jualan…')
            ) : !reconcile.hasRecords ? (
              tr('这单没有收款记录,按上面填的数字结算。', 'No payments recorded on this deal; settle with the amounts above.', 'Tiada bayaran direkod; selesaikan dengan amaun di atas.')
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {tr(
                    `Sales 记录收款 ${reconcile.count} 笔,共 ${formatRm(reconcile.collected)};这里的订金 + 现金 ${formatRm(reconcile.entered)}。`,
                    `Sales recorded ${reconcile.count} payment(s), ${formatRm(reconcile.collected)} in total; deposit + cash here is ${formatRm(reconcile.entered)}.`,
                    `Jualan merekod ${reconcile.count} bayaran, jumlah ${formatRm(reconcile.collected)}; deposit + tunai di sini ${formatRm(reconcile.entered)}.`
                  )}
                  {' '}
                  <b>
                    {reconcile.matches
                      ? tr('对得上。', 'They match.', 'Sepadan.')
                      : reconcile.difference > 0
                        ? tr(`少填了 ${formatRm(reconcile.difference)}。`, `${formatRm(reconcile.difference)} less than recorded.`, `${formatRm(reconcile.difference)} kurang daripada direkod.`)
                        : tr(`多填了 ${formatRm(-reconcile.difference)}。`, `${formatRm(-reconcile.difference)} more than recorded.`, `${formatRm(-reconcile.difference)} lebih daripada direkod.`)}
                  </b>
                </span>
                {!reconcile.matches && (
                  <button
                    type="button"
                    data-testid="settlement-fill-from-payments"
                    onClick={() => setDraft((current) => current ? { ...current, ...reconcile.fill } : current)}
                    className="rounded-control bg-white px-2.5 py-1.5 font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                  >
                    {tr('按收款记录填入', 'Use the recorded payments', 'Guna bayaran direkod')}
                  </button>
                )}
              </div>
            )}
            <button type="button" disabled={saving || (!reconcile && !paymentLoadFailed)} onClick={() => setPaymentReload((value) => value + 1)} className="mt-2 font-semibold underline disabled:opacity-50">{tr('重新核对收款', 'Reload payments', 'Muat semula bayaran')}</button>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-caption font-semibold">
          <span className={`rounded-chip px-2 py-1 ${draft.finance_completed_at ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{draft.finance_completed_at ? tr('财务已完成', 'Finance completed', 'Kewangan selesai') : tr('财务未完成', 'Finance pending', 'Kewangan belum')}</span>
          <span className={`rounded-chip px-2 py-1 ${draft.commission_paid_at ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{draft.commission_paid_at ? tr('佣金已付', 'Commission paid', 'Komisen dibayar') : tr('佣金未付', 'Commission unpaid', 'Komisen belum')}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-500 ring-1 ring-slate-100 hover:text-brand-ink">{tr('关闭', 'Close', 'Tutup')}</button>
          <button type="button" disabled={saving} onClick={() => persist({}, true)} className="rounded-control bg-slate-100 px-3 py-2 text-footnote font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60">{tr('保存', 'Save', 'Simpan')}</button>
          {!draft.finance_completed_at && (
            <button type="button" disabled={saving || !financeReady} title={financeReady ? '' : !paymentsMatch ? tr('订金 + 现金要和收款记录对得上', 'Deposit + cash must match the recorded payments', 'Deposit + tunai mesti sepadan dengan bayaran direkod') : tr('收齐款才能完成财务', 'Collect full payment first', 'Kutip bayaran penuh dahulu')} onClick={() => persist({ finance_completed_at: today }, true)} className="rounded-control bg-emerald-700 px-3 py-2 text-footnote font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300">{tr('标记财务完成', 'Mark Finance Completed', 'Tanda Kewangan Selesai')}</button>
          )}
          {draft.finance_completed_at && !draft.commission_paid_at && (
            <button type="button" disabled={saving || !financeReady} onClick={() => persist({ commission_paid_at: today })} className="rounded-control bg-emerald-700 px-3 py-2 text-footnote font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300">{tr('标记佣金已付', 'Mark Commission Paid', 'Tanda Komisen Dibayar')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
