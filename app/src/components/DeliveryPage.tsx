import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Bike, CheckCircle2, Circle, ClipboardCheck, Hand, Info, ListChecks, RotateCcw, Search, X } from 'lucide-react';
import { LoanStatus, type DeliveryPayment, type DeliveryStepKey, type LoanApplication, type RoleAccountRole, type VehicleCatalogItem } from '../types';
import { canRecordDeliveryPayment, type DeliveryPaymentDraft, type DeliveryPaymentRecordResult } from '../hooks/useDeliveryPaymentActions';
import DeliveryPaymentsSection, { formatRinggit } from './DeliveryPaymentsSection';
import DocumentImageViewer from './DocumentImageViewer';
import DeliveryStepAttachments from './DeliveryStepAttachments';
import DeliveryMarkDelivered from './DeliveryMarkDelivered';
import type { DeliveryAttachment } from '../services/dashboardRepository';
import { tr } from '../lib/i18n';
import DeliveryOpsCheckSummary from './DeliveryOpsCheckSummary';
import { isSettledDealFinance } from '../utils/dealFinance';
import {
  canRecordDeliveryStep,
  DELIVERY_STEPS,
  canAttachDeliveryFiles,
  DELIVERY_STEP_ATTACHMENT_HINTS,
  getDeliveryStepFields,
  getDeliveryProgress,
  getDeliveryStepDefaults,
  getFullLoanCheck,
  getMissingRequiredDeliveryFields,
  getOpenStepsBeforeDelivery,
  getNextDeliveryStep,
  isDeliveryStepDone,
  isReadyForDelivery,
  type DeliveryStepDefinition,
  type DeliveryStepField
} from '../utils/deliveryChecklist';

interface DeliveryPageProps {
  applications: LoanApplication[];
  currentStaffRole: RoleAccountRole;
  currentStaffName: string;
  onSaveDeliveryStep: (
    applicationId: string,
    stepKey: DeliveryStepKey,
    update: { done: boolean; note?: string; data?: Record<string, string>; document_ids?: string[] }
  ) => Promise<boolean>;
  onOpenApplication: (application: LoanApplication) => void;
  /** Opens one file's checklist, e.g. from Application Detail; a new id re-opens it. */
  focusRequest?: { id: number; applicationId: string } | null;
  payments: DeliveryPaymentHandlers;
  vehicleCatalog: VehicleCatalogItem[];
  onDeliver: (applicationId: string, stockUnitId: string, options?: { forceReason?: string }) => Promise<boolean>;
}

export interface DeliveryPaymentHandlers {
  list: (applicationId: string) => Promise<DeliveryPayment[] | null>;
  record: (applicationId: string, draft: DeliveryPaymentDraft) => Promise<DeliveryPaymentRecordResult>;
  // Undefined when Role Access → Delivery → Void a payment record is off.
  void?: (payment: DeliveryPayment, reason: string) => Promise<DeliveryPayment | null>;
  loadReceipt: (payment: DeliveryPayment) => Promise<string>;
  uploadAttachment: (applicationId: string, stepKey: DeliveryStepKey, file: { name: string; type: string; size: number; dataUrl: string }) => Promise<DeliveryAttachment | null>;
  listAttachments: (applicationId: string, ids: string[]) => Promise<DeliveryAttachment[]>;
  loadAttachment: (attachment: DeliveryAttachment) => Promise<string>;
}

// Owner 2026-10-21: no "My turn" filter; the page opens on every deal.
type DeliveryFilter = 'all' | 'open' | 'ready' | 'delivered' | 'done';

type DeliveryStage = 'preparing' | 'ready' | 'delivered' | 'done';

const isDelivered = (application: LoanApplication) => application.deal_finance?.sale_status === 'Bike Delivered';

const getStage = (application: LoanApplication): DeliveryStage => {
  if (isDelivered(application)) {
    const allStepsDone = DELIVERY_STEPS.every((step) => isDeliveryStepDone(application.delivery_checklist, step.key));
    return allStepsDone && isSettledDealFinance(application.deal_finance) ? 'done' : 'delivered';
  }
  return isReadyForDelivery(application.delivery_checklist) ? 'ready' : 'preparing';
};

const STAGE_STYLE: Record<DeliveryStage, string> = {
  preparing: 'bg-amber-50 text-amber-700',
  ready: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-indigo-50 text-indigo-700',
  done: 'bg-slate-100 text-slate-500'
};

const stageLabel = (stage: DeliveryStage) => ({
  preparing: tr('准备中', 'Preparing', 'Dalam persediaan'),
  ready: tr('可以交车', 'Ready to deliver', 'Sedia dihantar'),
  delivered: tr('已交车 · 跟进文书', 'Delivered · paperwork', 'Dihantar · dokumen'),
  done: tr('全部完成', 'All done', 'Semua selesai')
}[stage]);

const ownerLabel = (step: DeliveryStepDefinition) => step.owners.join(' / ');

const OWNER_CHIP: Record<string, string> = {
  Sales: 'bg-emerald-50 text-emerald-700',
  Admin: 'bg-indigo-50 text-indigo-700',
  'Sales / Admin': 'bg-slate-100 text-slate-600'
};

const formatDoneAt = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

const fieldInputClass = 'h-9 w-full rounded-control border border-slate-200 bg-white px-2.5 text-footnote text-slate-700 outline-none focus:border-brand-100 focus:ring-2 focus:ring-brand-50';

const formatMoney = (value: number) => `RM ${value.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`;

const displayFieldValue = (field: DeliveryStepField, value: string) => {
  if (field.type === 'money') return formatMoney(Number(value) || 0);
  if (field.type === 'select') {
    const option = field.options?.find((item) => item.value === value);
    return option ? tr(...option.label) : value;
  }
  if (field.type === 'datetime') return formatDoneAt(value);
  return value;
};

const fullLoanFromData = (data: Record<string, string>) => getFullLoanCheck({
  sellingPrice: Number(data.selling_price) || 0,
  approvedLoan: Number(data.approved_loan) || 0,
  deposit: Number(data.deposit) || 0
});

const fullLoanResultText = (data: Record<string, string>) => {
  const result = fullLoanFromData(data);
  return result.isFullLoan
    ? tr('Full loan ✓', 'Full loan ✓', 'Pinjaman penuh ✓')
    : tr(`客户要补 ${formatMoney(result.shortfall)}`, `Customer tops up ${formatMoney(result.shortfall)}`, `Pelanggan tambah ${formatMoney(result.shortfall)}`);
};

/** The full loan check also stores the shortfall it showed, so later steps read one number. */
const withComputedFields = (key: DeliveryStepKey, data: Record<string, string>) => (
  key === 'full_loan_check' ? { ...data, shortfall: String(fullLoanFromData(data).shortfall) } : data
);

function FullLoanResult({ data }: { data: Record<string, string> }) {
  const result = fullLoanFromData(data);
  if (!(result.sellingPrice > 0)) {
    return (
      <p data-testid="full-loan-result" className="rounded-control bg-slate-100 px-3 py-2 text-footnote text-slate-500">
        {tr('填上车价后会算出客户要不要补钱。', 'Enter the selling price to see whether the customer has to top up.', 'Masukkan harga jualan untuk melihat sama ada pelanggan perlu menambah.')}
      </p>
    );
  }
  return (
    <div
      data-testid="full-loan-result"
      className={`rounded-control px-3 py-2 text-footnote ${result.isFullLoan ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}
    >
      <p className="font-bold">{fullLoanResultText(data)}</p>
      <p className="mt-0.5 text-caption tabular-nums">
        {formatMoney(result.sellingPrice)} − {formatMoney(result.approvedLoan)} − {formatMoney(result.deposit)} = {formatMoney(result.shortfall)}
      </p>
      {!result.isFullLoan && (
        <p className="mt-0.5 text-caption">{tr('这笔钱要在收款那一步收齐。', 'Collect it in the payment step.', 'Kutip jumlah ini dalam langkah bayaran.')}</p>
      )}
    </div>
  );
}

// 交车清单 (owner meeting 2026-10-13): every approved deal from the full loan
// check to settlement, one step at a time, replacing the WhatsApp groups.
export default function DeliveryPage({
  applications,
  currentStaffRole,
  currentStaffName,
  onSaveDeliveryStep,
  onOpenApplication,
  focusRequest,
  payments,
  vehicleCatalog,
  onDeliver
}: DeliveryPageProps) {
  const [filter, setFilter] = useState<DeliveryFilter>('all');
  const [query, setQuery] = useState('');
  const [openAppId, setOpenAppId] = useState('');
  // Opened from a Home card: the step that is your turn opens ready to fill in
  // (owner 2026-10-18: as few clicks as possible).
  const [openedFromHome, setOpenedFromHome] = useState(false);
  const staff = { role: currentStaffRole, name: currentStaffName };

  useEffect(() => {
    if (focusRequest?.applicationId) {
      setOpenAppId(focusRequest.applicationId);
      setOpenedFromHome(true);
    }
  }, [focusRequest?.id, focusRequest?.applicationId]);

  const rows = useMemo(() => applications
    .filter((application) => (
      application.status === LoanStatus.APPROVE
      && application.deal_finance?.sale_status !== 'Cancelled'
    ))
    .map((application) => {
      const nextStep = getNextDeliveryStep(application.delivery_checklist);
      return {
        application,
        stage: getStage(application),
        progress: getDeliveryProgress(application.delivery_checklist),
        nextStep,
        isMyTurn: Boolean(nextStep && canRecordDeliveryStep(nextStep.key, staff, application))
      };
    })
    .sort((left, right) => Number(right.isMyTurn) - Number(left.isMyTurn)
      || left.progress.done - right.progress.done
      || String(left.application.applicant_name).localeCompare(String(right.application.applicant_name))),
  [applications, currentStaffRole, currentStaffName]);

  const counts = {
    all: rows.length,
    mine: rows.filter((row) => row.isMyTurn && row.stage !== 'done').length,
    open: rows.filter((row) => row.stage !== 'done').length,
    ready: rows.filter((row) => row.stage === 'ready').length,
    delivered: rows.filter((row) => row.stage === 'delivered').length,
    done: rows.filter((row) => row.stage === 'done').length
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter((row) => (
    (filter === 'all' ? true
      : filter === 'open' ? row.stage !== 'done'
        : row.stage === filter)
    && (!normalizedQuery || [row.application.applicant_name, row.application.vehicle_model, row.application.id, row.application.handler_name, row.application.ic_no]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
  ));

  const filters: Array<{ key: DeliveryFilter; label: string }> = [
    { key: 'all', label: tr('全部', 'All', 'Semua') },
    { key: 'open', label: tr('全部进行中', 'All open', 'Semua terbuka') },
    { key: 'ready', label: stageLabel('ready') },
    { key: 'delivered', label: stageLabel('delivered') },
    { key: 'done', label: stageLabel('done') }
  ];
  const openApp = openAppId ? applications.find((application) => application.id === openAppId) : undefined;

  return (
    <div id="delivery-page" data-testid="delivery-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-title-2 text-slate-900">{tr('交车清单', 'Delivery', 'Penghantaran')}</h2>
          <p className="mt-1 text-footnote text-slate-500">
            {tr(
              '银行批准之后的每一步:谁做、什么时候做完。资料填在这里,不用再发到各个 group。',
              'Every step after approval: who does it and when it was done. Record it here instead of in the WhatsApp groups.',
              'Setiap langkah selepas kelulusan: siapa buat dan bila siap. Rekod di sini, bukan dalam kumpulan WhatsApp.'
            )}
          </p>
        </div>
        <label className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={tr('搜索交车清单', 'Search deliveries', 'Cari penghantaran')}
            placeholder={tr('搜索客户、车型、Sales', 'Search customer, model, Sales', 'Cari pelanggan, model, Jualan')}
            className="w-full min-w-[240px] rounded-control bg-white py-2 pl-9 pr-3 text-footnote text-slate-700 ring-1 ring-slate-100 outline-none focus:ring-brand-100"
          />
        </label>
      </section>

      <section data-testid="delivery-metric-strip" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          { label: tr('轮到我', 'My turn', 'Giliran saya'), value: counts.mine, tone: 'border-brand-100 text-brand', chip: 'bg-brand-50 text-brand-ink', icon: Hand },
          { label: tr('进行中', 'Open deals', 'Terbuka'), value: counts.open, tone: 'border-slate-100 text-slate-900', chip: 'bg-slate-100 text-slate-600', icon: ListChecks },
          { label: stageLabel('ready'), value: counts.ready, tone: 'border-emerald-100 text-emerald-600', chip: 'bg-emerald-50 text-emerald-700', icon: Bike },
          { label: stageLabel('delivered'), value: counts.delivered, tone: 'border-indigo-100 text-indigo-600', chip: 'bg-indigo-50 text-indigo-700', icon: ClipboardCheck }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`flex min-h-[82px] flex-col rounded-card border bg-white p-2.5 shadow-e1 ${metric.tone.split(' ')[0]}`}>
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-chip px-1.5 py-0.5 text-micro uppercase leading-3 tracking-wide ${metric.chip}`}>{metric.label}</span>
                <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              </div>
              <p className={`mt-auto text-title-3 ${metric.tone.split(' ')[1]}`}>{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="flex flex-wrap gap-2" role="tablist" aria-label={tr('交车阶段', 'Delivery stages', 'Peringkat penghantaran')}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            data-testid={`delivery-filter-${item.key}`}
            onClick={() => setFilter(item.key)}
            className={`inline-flex items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
              filter === item.key ? 'bg-brand text-white' : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.label}
            <span className={`rounded-full px-1.5 py-0.5 text-caption ${filter === item.key ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{counts[item.key]}</span>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" data-testid="delivery-list">
        {visibleRows.map(({ application, stage, progress, nextStep, isMyTurn }) => (
          <article
            key={application.id}
            data-testid={`delivery-row-${application.id}`}
            data-stage={stage}
            className={`flex min-w-0 flex-col gap-3 rounded-card border bg-white p-4 shadow-e1 ${isMyTurn && stage !== 'done' ? 'border-brand-100 ring-1 ring-brand-50' : 'border-slate-100'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-headline text-slate-900">{application.applicant_name}</p>
                <p className="mt-0.5 truncate text-caption text-slate-500">
                  {[application.vehicle_model, application.purchase_method, application.handler_name].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className={`shrink-0 rounded-chip px-2 py-1 text-caption font-semibold ${STAGE_STYLE[stage]}`}>{stageLabel(stage)}</span>
            </div>

            <div>
              <div className="flex gap-0.5" aria-hidden="true">
                {DELIVERY_STEPS.map((step) => (
                  <span
                    key={step.key}
                    className={`h-1.5 flex-1 rounded-full ${
                      isDeliveryStepDone(application.delivery_checklist, step.key)
                        ? 'bg-emerald-500'
                        : step.key === nextStep?.key
                          ? 'bg-amber-400'
                          : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-caption tabular-nums text-slate-500">
                {tr(`${progress.done} / ${progress.total} 步完成`, `${progress.done} of ${progress.total} steps done`, `${progress.done} daripada ${progress.total} langkah selesai`)}
              </p>
            </div>

            {nextStep && (
              <p className="flex flex-wrap items-center gap-1.5 text-footnote text-slate-700">
                <span className="text-caption text-slate-500">{tr('下一步', 'Next', 'Seterusnya')}</span>
                <span className="font-semibold">{tr(...nextStep.label)}</span>
                <span className={`rounded-full px-1.5 py-px text-micro font-semibold tracking-normal ${OWNER_CHIP[ownerLabel(nextStep)] || OWNER_CHIP['Sales / Admin']}`}>{ownerLabel(nextStep)}</span>
                {isMyTurn && <span className="rounded-full bg-brand px-1.5 py-px text-micro font-semibold tracking-normal text-white">{tr('轮到你', 'Your turn', 'Giliran anda')}</span>}
              </p>
            )}

            <div className="mt-auto flex flex-wrap gap-1.5">
              <button
                type="button"
                data-testid={`delivery-open-${application.id}`}
                onClick={() => {
                  setOpenAppId(application.id);
                  setOpenedFromHome(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep"
              >
                <ListChecks aria-hidden="true" className="h-3.5 w-3.5" />
                {tr('打开清单', 'Open checklist', 'Buka senarai')}
              </button>
              <button
                type="button"
                onClick={() => onOpenApplication(application)}
                className="inline-flex items-center gap-1.5 rounded-control border border-slate-100 bg-white px-3 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                {tr('申请详情', 'Application', 'Permohonan')}
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
        {visibleRows.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-slate-200 bg-white py-14 text-center text-body text-slate-400">
            {tr('这里没有单子。已批准的单子会出现在这里。', 'No deals here. Approved deals appear here.', 'Tiada urus niaga di sini. Urus niaga yang diluluskan muncul di sini.')}
          </p>
        )}
      </section>

      {openApp && (
        <DeliveryChecklistPanel
          application={openApp}
          staff={staff}
          onSaveDeliveryStep={onSaveDeliveryStep}
          payments={payments}
          vehicleCatalog={vehicleCatalog}
          onDeliver={onDeliver}
          openNextStep={openedFromHome}
          onClose={() => setOpenAppId('')}
        />
      )}
    </div>
  );
}

function DeliveryChecklistPanel({
  application,
  staff,
  onSaveDeliveryStep,
  payments: paymentHandlers,
  vehicleCatalog,
  onDeliver,
  openNextStep = false,
  onClose
}: {
  application: LoanApplication;
  staff: { role: RoleAccountRole; name: string };
  onSaveDeliveryStep: DeliveryPageProps['onSaveDeliveryStep'];
  payments: DeliveryPaymentHandlers;
  vehicleCatalog: VehicleCatalogItem[];
  onDeliver: DeliveryPageProps['onDeliver'];
  openNextStep?: boolean;
  onClose: () => void;
}) {
  const [payments, setPayments] = useState<DeliveryPayment[] | null>(null);
  const [paymentLoadFailed, setPaymentLoadFailed] = useState(false);
  const [paymentReload, setPaymentReload] = useState(0);
  const [receiptView, setReceiptView] = useState<{ src: string; name: string } | null>(null);
  const [attachments, setAttachments] = useState<Record<string, DeliveryAttachment>>({});
  const attachmentIdsKey = DELIVERY_STEPS.flatMap((step) => application.delivery_checklist?.steps?.[step.key]?.document_ids || []).join(',');
  useEffect(() => {
    const ids = attachmentIdsKey ? attachmentIdsKey.split(',') : [];
    const missing = ids.filter((id) => !attachments[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    void paymentHandlers.listAttachments(application.id, missing).then((loaded) => {
      if (cancelled || loaded.length === 0) return;
      setAttachments((current) => ({ ...current, ...Object.fromEntries(loaded.map((item) => [item.id, item])) }));
    });
    return () => { cancelled = true; };
  // Only the set of attached ids drives loading.
  }, [application.id, attachmentIdsKey]);
  const openAttachment = async (attachment: DeliveryAttachment) => {
    const src = await paymentHandlers.loadAttachment(attachment);
    if (!src) return;
    if (attachment.file_type === 'application/pdf') {
      const blob = await (await fetch(src)).blob();
      window.open(URL.createObjectURL(blob), '_blank', 'noopener');
      return;
    }
    setReceiptView({ src, name: attachment.file_name });
  };
  useEffect(() => {
    let cancelled = false;
    setPayments(null);
    setPaymentLoadFailed(false);
    void Promise.resolve().then(() => paymentHandlers.list(application.id)).then((loaded) => {
      if (!cancelled) { setPayments(loaded); setPaymentLoadFailed(loaded === null); }
    }).catch(() => { if (!cancelled) setPaymentLoadFailed(true); });
    return () => { cancelled = true; };
  // Reload only when another file opens; the handlers are recreated every render.
  }, [application.id, paymentReload]);
  const fullLoanData = application.delivery_checklist?.steps?.full_loan_check?.data;
  const paymentDue = fullLoanData && application.delivery_checklist?.steps?.full_loan_check?.done_at
    ? Math.round(((Number(fullLoanData.deposit) || 0) + (Number(fullLoanData.shortfall) || 0)) * 100) / 100
    : null;
  const paymentCollected = Math.round((payments || []).filter((payment) => !payment.voided_at).reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100;
  const paymentShort = payments === null || (paymentDue !== null && paymentCollected < paymentDue);
  const [editingKey, setEditingKey] = useState<DeliveryStepKey | ''>('');
  const [noteDraft, setNoteDraft] = useState('');
  const [dataDraft, setDataDraft] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<DeliveryStepKey | ''>('');
  const checklist = application.delivery_checklist;
  const nextStep = getNextDeliveryStep(checklist);
  const finance = application.deal_finance;
  const delivered = isDelivered(application);

  const startEditing = (key: DeliveryStepKey) => {
    setEditingKey(key);
    setNoteDraft(checklist?.steps?.[key]?.note || '');
    setDataDraft({ ...getDeliveryStepDefaults(application, key), ...(checklist?.steps?.[key]?.data || {}) });
  };

  // From Home, open the form of the step that is this person's turn. Payment is
  // recorded in its own section first, so that step stays closed.
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openNextStep || autoOpenedRef.current || !nextStep || nextStep.key === 'collect_payment') return;
    if (!canRecordDeliveryStep(nextStep.key, staff, application)) return;
    autoOpenedRef.current = true;
    startEditing(nextStep.key);
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-testid="delivery-step-form-${nextStep.key}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }, [openNextStep, nextStep?.key]);

  const save = async (key: DeliveryStepKey, done: boolean, note?: string, data?: Record<string, string>) => {
    if (savingKey) return;
    setSavingKey(key);
    try {
      const saved = await onSaveDeliveryStep(application.id, key, { done, note, data });
      if (saved) setEditingKey('');
    } finally {
      setSavingKey('');
    }
  };

  const renderStep = (step: DeliveryStepDefinition, index: number) => {
    const record = checklist?.steps?.[step.key];
    const done = Boolean(record?.done_at);
    const canRecord = canRecordDeliveryStep(step.key, staff, application);
    const isNext = step.key === nextStep?.key;
    const isEditing = editingKey === step.key;
    const fields = getDeliveryStepFields(step.key, application.purchase_method);
    const missingFields = isEditing ? getMissingRequiredDeliveryFields(step.key, dataDraft, application.purchase_method) : [];
    return (
      <li
        key={step.key}
        data-testid={`delivery-step-${step.key}`}
        data-done={done ? 'true' : 'false'}
        className={`rounded-card border p-3 ${done ? 'border-emerald-100 bg-emerald-50/40' : isNext ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-white'}`}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0" aria-hidden="true">
            {done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className={`h-5 w-5 ${isNext ? 'text-amber-500' : 'text-slate-300'}`} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="text-caption tabular-nums text-slate-400">{index + 1}</span>
              <span className="text-footnote font-bold text-slate-900">{tr(...step.label)}</span>
              <span className={`rounded-full px-1.5 py-px text-micro font-semibold tracking-normal ${OWNER_CHIP[ownerLabel(step)] || OWNER_CHIP['Sales / Admin']}`}>{ownerLabel(step)}</span>
            </p>
            {done && record && (
              <p className="mt-1 text-caption text-emerald-700">
                {tr('完成', 'Done', 'Selesai')} · {record.done_by} · {formatDoneAt(record.done_at)}
              </p>
            )}
            {step.key === 'full_loan_check' && !canRecord && staff.role === 'Sales' && (
              <p className="mt-1 text-caption text-slate-500" data-testid="delivery-full-loan-read-only">
                {tr('由 Admin 填写，Sales 只能查看。', 'Admin fills this in; Sales can view it.', 'Admin mengisi ini; Sales boleh melihatnya.')}
              </p>
            )}
            {record?.note && !isEditing && <p className="mt-1 whitespace-pre-wrap break-words text-caption text-slate-600">{record.note}</p>}
            {!isEditing && fields.some((field) => record?.data?.[field.key]) && (
              <dl className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-caption" data-testid={`delivery-step-data-${step.key}`}>
                {fields.filter((field) => record?.data?.[field.key]).map((field) => (
                  <div key={field.key} className="flex gap-1">
                    <dt className="text-slate-400">{tr(...field.label)}</dt>
                    <dd className="font-semibold text-slate-700">{displayFieldValue(field, record?.data?.[field.key] || '')}</dd>
                  </div>
                ))}
                {step.key === 'full_loan_check' && record?.data && (
                  <div className="flex gap-1">
                    <dt className="text-slate-400">{tr('结果', 'Result', 'Keputusan')}</dt>
                    <dd className="font-semibold text-slate-700">{fullLoanResultText(record.data)}</dd>
                  </div>
                )}
              </dl>
            )}
            {step.key === 'ops_check' && !done && (
              <DeliveryOpsCheckSummary
                application={application}
                vehicleCatalog={vehicleCatalog}
                paymentDue={paymentDue}
                paymentCollected={paymentCollected}
              />
            )}
          </div>
          {canRecord && (
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {isEditing ? null : done ? (
                <button
                  type="button"
                  disabled={Boolean(savingKey)}
                  onClick={() => void save(step.key, false)}
                  className="inline-flex items-center gap-1 rounded-control border border-slate-200 bg-white px-2.5 py-1.5 text-caption font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                  {tr('重新打开', 'Reopen', 'Buka semula')}
                </button>
              ) : (
                <button
                  type="button"
                  data-testid={`delivery-step-done-${step.key}`}
                  onClick={() => startEditing(step.key)}
                  className={`inline-flex items-center gap-1 rounded-control px-2.5 py-1.5 text-caption font-bold ${isNext ? 'bg-brand text-white hover:bg-brand-deep' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {tr('标记完成', 'Mark done', 'Tanda selesai')}
                </button>
              )}
            </div>
          )}
        </div>
        {DELIVERY_STEP_ATTACHMENT_HINTS[step.key] && (
          <DeliveryStepAttachments
            stepKey={step.key}
            hint={tr(...(DELIVERY_STEP_ATTACHMENT_HINTS[step.key] as [string, string, string]))}
            attachments={(record?.document_ids || []).map((id) => attachments[id]).filter((item): item is DeliveryAttachment => Boolean(item))}
            canAttach={canRecord && canAttachDeliveryFiles(staff, application)}
            isFull={(record?.document_ids || []).length >= 10}
            onOpen={(attachment) => void openAttachment(attachment)}
            onUpload={async (file) => {
              const attachment = await paymentHandlers.uploadAttachment(application.id, step.key, file);
              if (!attachment) return false;
              setAttachments((current) => ({ ...current, [attachment.id]: attachment }));
              return onSaveDeliveryStep(application.id, step.key, {
                done: Boolean(record?.done_at),
                document_ids: [...(record?.document_ids || []), attachment.id]
              });
            }}
          />
        )}
        {step.key === 'collect_payment' && (
          <div>
          {paymentLoadFailed && <p role="alert" className="mt-2 text-caption text-rose-600">{tr('收款读取失败，暂时无法确认已收金额。', 'Could not load payments; the collected amount is unknown.', 'Bayaran gagal dimuatkan; amaun diterima belum diketahui.')} <button type="button" onClick={() => setPaymentReload((value) => value + 1)} className="font-semibold underline">{tr('重试', 'Retry', 'Cuba lagi')}</button></p>}
          <DeliveryPaymentsSection
            payments={payments}
            due={paymentDue}
            canRecord={payments !== null && canRecordDeliveryPayment(staff, application)}
            onRecord={async (draft) => {
              const saved = await paymentHandlers.record(application.id, draft);
              if (saved === 'pending') return 'pending';
              if (saved) setPayments((current) => [...(current || []).filter((item) => item.id !== saved.id), saved]);
              return Boolean(saved);
            }}
            onVoid={paymentHandlers.void && (async (payment, reason) => {
              const voided = await paymentHandlers.void!(payment, reason);
              if (voided) setPayments((current) => (current || []).map((item) => (item.id === voided.id ? voided : item)));
              return Boolean(voided);
            })}
            onViewReceipt={async (payment) => {
              const src = await paymentHandlers.loadReceipt(payment);
              if (src) setReceiptView({ src, name: payment.receipt_document_id });
            }}
          />
          </div>
        )}
        {isEditing && (
          <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3" data-testid={`delivery-step-form-${step.key}`}>
            {fields.length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {fields.map((field) => (
                  // justify-end: a label that wraps to two lines keeps its input level with the one beside it.
                  <label key={field.key} className="flex min-w-0 flex-col justify-end gap-1">
                    <span className="flex items-center gap-1 text-micro uppercase text-slate-500">
                      <span>{tr(...field.label)}{field.required && <span className="text-rose-500"> *</span>}</span>
                      {field.hint && (
                        // Hover or focus (tap on a phone) shows the explanation; the label stays short.
                        <span
                          tabIndex={0}
                          aria-label={tr(...field.hint)}
                          data-testid={`delivery-field-hint-${field.key}`}
                          className="group relative inline-flex cursor-help rounded-full text-slate-400 outline-none hover:text-slate-600 focus-visible:text-slate-600"
                          onClick={(event) => event.preventDefault()}
                        >
                          <Info className="h-3.5 w-3.5" aria-hidden="true" />
                          <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-max max-w-[14rem] -translate-x-1/2 rounded-md bg-slate-800 px-2 py-1 text-caption normal-case tracking-normal text-white shadow-lg group-hover:block group-focus:block">
                            {tr(...field.hint)}
                          </span>
                        </span>
                      )}
                    </span>
                    {field.type === 'select' ? (
                      <select
                        value={dataDraft[field.key] || ''}
                        onChange={(event) => setDataDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                        aria-label={`${step.key} ${field.key}`}
                        className={fieldInputClass}
                      >
                        <option value="">{tr('选择', 'Select', 'Pilih')}</option>
                        {(field.options || []).map((option) => <option key={option.value} value={option.value}>{tr(...option.label)}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'date' ? 'date' : field.type === 'datetime' ? 'datetime-local' : 'text'}
                        inputMode={field.type === 'money' ? 'decimal' : undefined}
                        value={dataDraft[field.key] || ''}
                        onChange={(event) => {
                          const raw = event.target.value;
                          const value = field.type === 'money' ? raw.replace(/[^\d.]/g, '') : field.uppercase ? raw.toUpperCase() : raw;
                          setDataDraft((current) => ({ ...current, [field.key]: value }));
                        }}
                        aria-label={`${step.key} ${field.key}`}
                        className={fieldInputClass}
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
            {step.key === 'full_loan_check' && (
              <FullLoanResult data={dataDraft} />
            )}
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={2}
              maxLength={1000}
              aria-label={`Note for ${step.key}`}
              placeholder={tr('备注(选填)', 'Note (optional)', 'Nota (pilihan)')}
              className="w-full resize-none rounded-control border border-slate-200 bg-white px-2.5 py-2 text-footnote text-slate-700 outline-none focus:border-brand-100 focus:ring-2 focus:ring-brand-50"
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              {step.key === 'collect_payment' && paymentShort && paymentDue !== null && (
                <span className="mr-auto text-caption text-rose-600">
                  {tr(`还差 ${formatRinggit(paymentDue - paymentCollected)} 才能完成`, `${formatRinggit(paymentDue - paymentCollected)} still owed before this is done`, `Baki ${formatRinggit(paymentDue - paymentCollected)} sebelum selesai`)}
                </span>
              )}
              {missingFields.length > 0 && (
                <span className="mr-auto text-caption text-rose-600">
                  {tr(`还要填:${missingFields.map((field) => field.label[0]).join('、')}`, `Still needed: ${missingFields.map((field) => field.label[1]).join(', ')}`, `Masih perlu: ${missingFields.map((field) => field.label[2]).join(', ')}`)}
                </span>
              )}
              <button type="button" onClick={() => setEditingKey('')} className="rounded-control px-2.5 py-1.5 text-caption font-semibold text-slate-500 hover:text-slate-800">
                {tr('取消', 'Cancel', 'Batal')}
              </button>
              <button
                type="button"
                disabled={Boolean(savingKey) || missingFields.length > 0 || (step.key === 'collect_payment' && paymentShort)}
                onClick={() => void save(
                  step.key,
                  true,
                  noteDraft,
                  step.key === 'collect_payment'
                    ? { ...dataDraft, due: paymentDue === null ? '' : String(paymentDue), collected: String(paymentCollected) }
                    : withComputedFields(step.key, dataDraft)
                )}
                className="inline-flex items-center gap-1 rounded-control bg-emerald-700 px-2.5 py-1.5 text-caption font-bold text-white hover:bg-emerald-800 disabled:bg-slate-300"
              >
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                {tr('确认完成', 'Confirm done', 'Sahkan selesai')}
              </button>
            </div>
          </div>
        )}
      </li>
    );
  };

  const beforeDelivery = DELIVERY_STEPS.filter((step) => step.phase === 'before_delivery');
  const afterDelivery = DELIVERY_STEPS.filter((step) => step.phase === 'after_delivery');
  const ready = isReadyForDelivery(checklist);

  return (
    <div data-testid="delivery-checklist-panel" className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        role="dialog"
        aria-label={tr('交车清单', 'Delivery checklist', 'Senarai penghantaran')}
        className="flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-e3"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-micro uppercase text-slate-500">{tr('交车清单', 'Delivery checklist', 'Senarai penghantaran')}</p>
            <h3 className="mt-0.5 truncate text-title-3 text-slate-900">{application.applicant_name}</h3>
            <p className="mt-0.5 truncate text-footnote text-slate-500">{[application.vehicle_model, application.purchase_method, application.handler_name].filter(Boolean).join(' · ')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={tr('关闭', 'Close', 'Tutup')} className="rounded-control p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-2">
            <h4 className="text-micro font-semibold uppercase text-slate-500">{tr('交车前', 'Before delivery', 'Sebelum penghantaran')}</h4>
            <ol className="space-y-2">{beforeDelivery.map((step, index) => renderStep(step, index))}</ol>
          </section>

          <div
            data-testid="delivery-gate"
            className={`flex items-center gap-2 rounded-card px-3 py-2.5 text-footnote font-semibold ${
              delivered ? 'bg-indigo-50 text-indigo-700' : ready ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Bike aria-hidden="true" className="h-4 w-4" />
            {delivered
              ? tr(`已交车 · ${finance?.delivery_at ? formatDoneAt(finance.delivery_at) : ''}`, `Delivered · ${finance?.delivery_at ? formatDoneAt(finance.delivery_at) : ''}`, `Dihantar · ${finance?.delivery_at ? formatDoneAt(finance.delivery_at) : ''}`)
              : ready
                ? tr('交车前的步骤都完成了,可以交车。', 'Every step before delivery is done; the bike can be delivered.', 'Semua langkah sebelum penghantaran selesai; motor boleh dihantar.')
                : tr('上面的步骤全部完成后才能交车。', 'The bike can be delivered once every step above is done.', 'Motor boleh dihantar setelah semua langkah di atas selesai.')}
          </div>

          {!delivered && (
            <DeliveryMarkDelivered
              application={application}
              vehicleCatalog={vehicleCatalog}
              staff={staff}
              isReady={ready}
              openStepCount={getOpenStepsBeforeDelivery(checklist).length}
              onDeliver={(stockUnitId, options) => onDeliver(application.id, stockUnitId, options)}
            />
          )}

          <section className="space-y-2">
            <h4 className="text-micro font-semibold uppercase text-slate-500">{tr('交车后', 'After delivery', 'Selepas penghantaran')}</h4>
            <ol className="space-y-2">{afterDelivery.map((step, index) => renderStep(step, beforeDelivery.length + index))}</ol>
            <ul className="space-y-2" data-testid="delivery-finance-steps">
              {[
                {
                  key: 'bank_disbursement',
                  label: tr('银行放款给老板', 'Loan credited to the shop', 'Pinjaman dikreditkan'),
                  done: Boolean(finance?.bank_disbursed_at) || Number(finance?.bank_disbursement) > 0,
                  detail: finance?.bank_disbursed_at ? formatDoneAt(finance.bank_disbursed_at) : ''
                },
                {
                  key: 'settlement',
                  label: tr('结算', 'Settlement', 'Penyelesaian'),
                  done: isSettledDealFinance(finance),
                  detail: finance?.finance_completed_at ? formatDoneAt(finance.finance_completed_at) : ''
                }
              ].map((item) => (
                <li key={item.key} className={`flex items-center gap-3 rounded-card border p-3 ${item.done ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-100 bg-white'}`}>
                  {item.done ? <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-600" /> : <Circle aria-hidden="true" className="h-5 w-5 text-slate-300" />}
                  <span className="text-footnote font-bold text-slate-900">{item.label}</span>
                  <span className="rounded-full bg-amber-50 px-1.5 py-px text-micro font-semibold tracking-normal text-amber-800">Operations Manager</span>
                  <span className="ml-auto text-caption text-slate-500">
                    {item.done ? item.detail || tr('完成', 'Done', 'Selesai') : tr('在结算页面登记', 'Recorded on the Settlement page', 'Direkod di halaman Penyelesaian')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      {receiptView && (
        <DocumentImageViewer src={receiptView.src} fileName={receiptView.name} onClose={() => setReceiptView(null)} />
      )}
    </div>
  );
}
