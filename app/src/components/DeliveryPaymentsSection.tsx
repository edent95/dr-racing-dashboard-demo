import React, { useState } from 'react';
import { Ban, ImageIcon, Paperclip, Plus, Receipt } from 'lucide-react';
import { tr } from '../lib/i18n';
import { prepareDocumentFileForUpload } from '../lib/documentImageCompression';
import type { DeliveryPayment, DeliveryPaymentMethod } from '../types';
import type { DeliveryPaymentDraft } from '../hooks/useDeliveryPaymentActions';
import FileDropZone from './FileDropZone';

const METHODS: Array<{ value: DeliveryPaymentMethod; label: [string, string, string] }> = [
  { value: 'Cash', label: ['现金', 'Cash', 'Tunai'] },
  { value: 'Bank Transfer', label: ['转账', 'Bank transfer', 'Pindahan bank'] },
  { value: 'Card', label: ['刷卡', 'Card', 'Kad'] },
  { value: 'Other', label: ['其他', 'Other', 'Lain-lain'] }
];

const RECEIPT_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

export const formatRinggit = (value: number) => `RM ${value.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const methodLabel = (method: DeliveryPaymentMethod) => {
  const found = METHODS.find((item) => item.value === method);
  return found ? tr(...found.label) : method;
};

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * The "Collect payment" step: what the customer owes (deposit plus the full
 * loan top-up), every payment on its own line with its receipt, and voiding a
 * mistake with a reason instead of deleting it.
 */
export default function DeliveryPaymentsSection({
  payments,
  due,
  canRecord,
  onRecord,
  onVoid,
  onViewReceipt
}: {
  payments: DeliveryPayment[] | null;
  /** Deposit + top-up from the full loan check; null when the check has not been done. */
  due: number | null;
  canRecord: boolean;
  /** 'pending': the save could not be confirmed; the form keeps the draft (and its id) so the next save checks first. */
  onRecord: (draft: DeliveryPaymentDraft) => Promise<boolean | 'pending'>;
  // Undefined when Role Access → Delivery → Void a payment record is off.
  onVoid?: (payment: DeliveryPayment, reason: string) => Promise<boolean>;
  onViewReceipt: (payment: DeliveryPayment) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<DeliveryPaymentMethod>('Cash');
  const [receivedAt, setReceivedAt] = useState(todayIso);
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState<{ name: string; dataUrl: string } | null>(null);
  const [receiptError, setReceiptError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // One id per opened form, so retrying after a timeout cannot record the payment twice.
  const [draftId, setDraftId] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [voidingId, setVoidingId] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const collected = Math.round((payments || []).filter((payment) => !payment.voided_at).reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100;
  const remaining = due === null || payments === null ? null : Math.max(0, Math.round((due - collected) * 100) / 100);
  const inputClass = 'h-9 w-full rounded-control border border-slate-200 bg-white px-2.5 text-footnote text-slate-700 outline-none focus:border-brand-100 focus:ring-2 focus:ring-brand-50';

  const pickReceipt = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!RECEIPT_TYPES.includes(file.type) || file.size > MAX_RECEIPT_BYTES) {
      setReceiptError(tr('收据要是 PDF 或图片,10MB 以内', 'The receipt must be a PDF or image up to 10 MB', 'Resit mesti PDF atau imej hingga 10 MB'));
      return;
    }
    setReceiptError('');
    const prepared = await prepareDocumentFileForUpload(file);
    setReceipt({ name: file.name, dataUrl: prepared.dataUrl });
  };

  const reset = () => {
    setIsAdding(false);
    setDraftId('');
    setIsUnconfirmed(false);
    setAmount('');
    setMethod('Cash');
    setReceivedAt(todayIso());
    setNote('');
    setReceipt(null);
    setReceiptError('');
  };

  return (
    <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3" data-testid="delivery-payments" onClick={(event) => event.stopPropagation()}>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { key: 'due', label: tr('应收', 'Due', 'Perlu dibayar'), value: due === null ? '—' : formatRinggit(due), tone: 'text-slate-900' },
          { key: 'collected', label: tr('已收', 'Collected', 'Diterima'), value: payments === null ? '—' : formatRinggit(collected), tone: 'text-emerald-700' },
          { key: 'remaining', label: tr('还差', 'Still owed', 'Baki'), value: remaining === null ? '—' : formatRinggit(remaining), tone: remaining ? 'text-amber-700' : 'text-emerald-700' }
        ].map((item) => (
          <div key={item.key} className="rounded-control bg-white px-2 py-1.5 ring-1 ring-slate-100">
            <p className="text-micro uppercase text-slate-500">{item.label}</p>
            <p className={`text-footnote font-bold tabular-nums ${item.tone}`} data-testid={`delivery-payments-${item.key}`}>{item.value}</p>
          </div>
        ))}
      </div>
      {due === null && (
        <p className="text-caption text-slate-500">{tr('先做「核对 full loan」,系统才知道要收多少。', 'Do the full loan check first so the amount due is known.', 'Buat semakan pinjaman penuh dahulu supaya amaun diketahui.')}</p>
      )}

      {payments === null ? (
        <p className="text-caption text-slate-400">{tr('读取收款记录中…', 'Loading payments…', 'Memuatkan bayaran…')}</p>
      ) : payments.length === 0 ? (
        <p className="text-caption text-slate-400">{tr('还没有收款记录。', 'No payments recorded yet.', 'Belum ada bayaran direkod.')}</p>
      ) : (
        <ul className="space-y-1.5">
          {payments.map((payment) => (
            <li
              key={payment.id}
              data-testid={`delivery-payment-${payment.id}`}
              data-voided={payment.voided_at ? 'true' : 'false'}
              className={`rounded-control px-2.5 py-2 text-caption ring-1 ${payment.voided_at ? 'bg-slate-50 text-slate-400 ring-slate-100' : 'bg-white text-slate-700 ring-emerald-100'}`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Receipt className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className={`font-bold tabular-nums ${payment.voided_at ? 'line-through' : 'text-slate-900'}`}>{formatRinggit(payment.amount)}</span>
                <span>{methodLabel(payment.method)}</span>
                <span className="text-slate-400">{payment.received_at} · {payment.recorded_by}</span>
                {payment.receipt_document_id && (
                  <button type="button" onClick={() => onViewReceipt(payment)} className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800">
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {tr('看收据', 'Receipt', 'Resit')}
                  </button>
                )}
                {canRecord && onVoid && !payment.voided_at && voidingId !== payment.id && (
                  <button
                    type="button"
                    onClick={() => { setVoidingId(payment.id); setVoidReason(''); }}
                    className="ml-auto inline-flex items-center gap-1 font-semibold text-slate-400 hover:text-rose-600"
                  >
                    <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                    {tr('作废', 'Void', 'Batal')}
                  </button>
                )}
              </div>
              {payment.note && <p className="mt-0.5 text-slate-500">{payment.note}</p>}
              {payment.voided_at && (
                <p className="mt-0.5 text-rose-500">{tr('已作废', 'Voided', 'Dibatalkan')} · {payment.voided_by} · {payment.void_reason}</p>
              )}
              {voidingId === payment.id && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <input
                    value={voidReason}
                    maxLength={500}
                    onChange={(event) => setVoidReason(event.target.value)}
                    placeholder={tr('作废原因(必填)', 'Why void it (required)', 'Sebab batal (wajib)')}
                    aria-label={`Void reason for ${payment.id}`}
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  <button type="button" onClick={() => setVoidingId('')} className="px-2 py-1 font-semibold text-slate-500">{tr('取消', 'Cancel', 'Batal')}</button>
                  <button
                    type="button"
                    disabled={!voidReason.trim()}
                    onClick={async () => {
                      if (onVoid && await onVoid(payment, voidReason)) setVoidingId('');
                    }}
                    className="rounded-control bg-rose-600 px-2.5 py-1 font-bold text-white hover:bg-rose-700 disabled:bg-slate-300"
                  >
                    {tr('确认作废', 'Confirm void', 'Sahkan batal')}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {canRecord && !isAdding && (
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setDraftId(`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
            if (remaining) setAmount(String(remaining));
          }}
          className="inline-flex items-center gap-1 rounded-control border border-emerald-200 bg-white px-2.5 py-1.5 text-caption font-semibold text-emerald-800 hover:bg-emerald-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {tr('记一笔收款', 'Record a payment', 'Rekod bayaran')}
        </button>
      )}

      {canRecord && isAdding && (
        <form
          data-testid="delivery-payment-form"
          className="grid grid-cols-1 gap-2 rounded-control bg-white p-2.5 ring-1 ring-emerald-100 sm:grid-cols-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (isSaving) return;
            setIsSaving(true);
            try {
              const saved = await onRecord({ id: draftId || undefined, amount: Number(amount), method, received_at: receivedAt, note, receiptDataUrl: receipt?.dataUrl || '' });
              if (saved === 'pending') setIsUnconfirmed(true);
              else if (saved) reset();
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-micro uppercase text-slate-500">{tr('金额 (RM)', 'Amount (RM)', 'Amaun (RM)')}</span>
            <input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" required aria-label="Payment amount" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-micro uppercase text-slate-500">{tr('方式', 'Method', 'Kaedah')}</span>
            <select value={method} onChange={(event) => setMethod(event.target.value as DeliveryPaymentMethod)} aria-label="Payment method" className={inputClass}>
              {METHODS.map((item) => <option key={item.value} value={item.value}>{tr(...item.label)}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-micro uppercase text-slate-500">{tr('收款日期', 'Received on', 'Diterima pada')}</span>
            <input type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} aria-label="Payment date" className={inputClass} />
          </label>
          <FileDropZone className="rounded-control border border-dashed border-slate-200 px-2.5 py-2 sm:col-span-3" onFiles={(files) => void pickReceipt(files)} testId="delivery-receipt-drop">
            <label className="flex cursor-pointer items-center gap-2 text-caption text-slate-600">
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              {receipt ? receipt.name : tr('收据照片(拖进来或点这里,选填)', 'Receipt photo (drop or click, optional)', 'Foto resit (seret atau klik, pilihan)')}
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                aria-label="Payment receipt"
                className="sr-only"
                onChange={(event) => {
                  void pickReceipt(Array.from(event.currentTarget.files || []));
                  event.currentTarget.value = '';
                }}
              />
            </label>
            {receiptError && <p className="mt-1 text-caption text-rose-600">{receiptError}</p>}
          </FileDropZone>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={tr('备注(选填)', 'Note (optional)', 'Nota (pilihan)')}
            aria-label="Payment note"
            className={`${inputClass} sm:col-span-3`}
          />
          {isUnconfirmed && (
            <p data-testid="delivery-payment-unconfirmed" role="status" className="rounded-control bg-amber-50 px-2.5 py-1.5 text-caption text-amber-800 ring-1 ring-amber-200 sm:col-span-3">
              {tr(
                '待确认:还不知道这笔有没有存进去。不要另记一笔,等网络恢复后再按「保存收款」,系统会先核对。',
                'Waiting to confirm: we do not know yet whether this payment was saved. Do not record it again; when the connection is back, press Save payment and it will check first.',
                'Menunggu pengesahan: belum pasti bayaran ini disimpan. Jangan rekod sekali lagi; apabila sambungan pulih, tekan Simpan bayaran dan sistem akan menyemak dahulu.'
              )}
            </p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-3">
            <button type="button" onClick={reset} className="px-2.5 py-1.5 text-caption font-semibold text-slate-500 hover:text-slate-800">{tr('取消', 'Cancel', 'Batal')}</button>
            <button type="submit" disabled={isSaving || !(Number(amount) > 0)} className="rounded-control bg-emerald-700 px-3 py-1.5 text-caption font-bold text-white hover:bg-emerald-800 disabled:bg-slate-300">
              {tr('保存收款', 'Save payment', 'Simpan bayaran')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
