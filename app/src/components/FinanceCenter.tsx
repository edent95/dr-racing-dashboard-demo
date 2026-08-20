/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeDollarSign, Bike, Boxes, ChevronDown, ExternalLink, Eye, EyeOff, Pencil, Plus, ReceiptText, Save, WalletCards, X } from 'lucide-react';
import { CommissionRules, DealCommissionStatus, DealFinance, DealSaleStatus, getDealCommissionQuote, LoanApplication, LoanStatus, QuickStockInput, VehicleCatalogItem, VehicleStockUnit } from '../types';
import { tr } from '../lib/i18n';
import { getRecognizedDealStockCost } from '../utils/dealFinance';
import { getVehicleStockReference, normalizeVehicleNumberPlate } from '../utils/vehicleStock';
import ToggleOptionGroup from './ToggleOptionGroup';
import dealsIcon from '../assets/icons/nav/approved.png';
import stockIcon from '../assets/icons/nav/vehicleInfo.png';
import { useBrandedDialog } from './BrandedDialogProvider';

interface FinanceCenterProps {
  applications: LoanApplication[];
  vehicleCatalog: VehicleCatalogItem[];
  commissionRules: CommissionRules;
  currentStaffName: string;
  canManage: boolean;
  onSaveStockUnits: (updates: Array<{ catalogId: string; unit: VehicleStockUnit }>) => boolean;
  onSaveDealFinance: (applicationId: string, finance: DealFinance) => Promise<boolean>;
  onOpenApplication: (application: LoanApplication) => void;
  canOpenVehicleInfo: boolean;
  onOpenVehicleInfo: () => void;
  stockTabRequestId?: number;
  stockFocusModel?: string;
  onQuickAddStock?: (catalogId: string, input: QuickStockInput) => boolean;
  /** Optional 佣金总账 panel (the embedded commission summary). Renders as a third tab when provided. */
  commissionPanel?: React.ReactNode;
}

type FinanceTab = 'deals' | 'stock' | 'commission';
type StockBatchRow = { key: string; unit: VehicleStockUnit };

const SALE_STATUS_STEPS: DealSaleStatus[] = ['Pending Acceptance', 'Customer Accepted', 'Bike Delivered'];

const normalizeModelKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const findCatalogItem = (vehicleCatalog: VehicleCatalogItem[], model: string) => (
  vehicleCatalog.find((item) => normalizeModelKey(item.model) === normalizeModelKey(model))
);

const toMoney = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 100) / 100 : 0;
};

const formatMoney = (value: number) => {
  const numeric = Number(value);
  const amount = Number.isFinite(numeric) ? Math.round(numeric * 100) / 100 : 0;
  return `${amount < 0 ? '-' : ''}RM ${Math.abs(amount).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const currentMonth = () => today().slice(0, 7);

export const getStockUnitCost = (unit: VehicleStockUnit) => (
  toMoney(unit.purchase_cost) +
  toMoney(unit.transport_cost) +
  toMoney(unit.registration_cost) +
  toMoney(unit.accessories_cost) +
  toMoney(unit.repair_cost) +
  toMoney(unit.other_direct_cost)
);

const getDealSalesValue = (finance: DealFinance) => (
  toMoney(finance.final_selling_price) + toMoney(finance.other_income) - toMoney(finance.refund_amount)
);

const getDealReceipts = (finance: DealFinance) => (
  toMoney(finance.customer_deposit_received) +
  toMoney(finance.customer_cash_payment) +
  toMoney(finance.bank_disbursement)
);

const getPaymentStatus = (finance: DealFinance) => {
  if (finance.finance_completed_at) return tr('已完成', 'Completed', 'Selesai');
  if (getDealReceipts(finance) > 0) return tr('部分收款', 'Partially Paid', 'Bayaran Separa');
  return tr('等待收款', 'Awaiting Payment', 'Menunggu Bayaran');
};

const getCommissionTone = (status: DealCommissionStatus) => {
  if (status === 'Paid') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Payable' || status === 'Earned') return 'bg-amber-50 text-amber-700';
  if (status === 'Reversed') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
};

const getSaleStatusTone = (status: DealSaleStatus) => {
  if (status === 'Pending Acceptance') return { badge: 'bg-amber-50 text-amber-700 ring-amber-100', dot: 'bg-amber-500' };
  if (status === 'Customer Accepted') return { badge: 'bg-indigo-50 text-indigo-700 ring-indigo-100', dot: 'bg-indigo-500' };
  if (status === 'Bike Delivered') return { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100', dot: 'bg-emerald-500' };
  return { badge: 'bg-rose-50 text-rose-700 ring-rose-100', dot: 'bg-rose-500' };
};

function SaleStatusBadge({ status, className = '' }: { status: DealSaleStatus; className?: string }) {
  const tone = getSaleStatusTone(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${tone.badge} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {status}
    </span>
  );
}

const createEmptyStockUnit = (staffName: string): VehicleStockUnit => ({
  id: '',
  number_plate: '',
  chassis_number: '',
  engine_number: '',
  supplier: '',
  purchase_cost: 0,
  transport_cost: 0,
  registration_cost: 0,
  accessories_cost: 0,
  repair_cost: 0,
  other_direct_cost: 0,
  received_at: today(),
  status: 'In Stock',
  reserved_application_id: '',
  sold_application_id: '',
  delivered_at: '',
  created_at: '',
  updated_at: '',
  updated_by: staffName
});

const createStockBatchRow = (staffName: string, purchaseCost = 0): StockBatchRow => ({
  key: `STOCK-DRAFT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  unit: { ...createEmptyStockUnit(staffName), purchase_cost: purchaseCost }
});

const buildDealFinance = (
  application: LoanApplication,
  vehicleCatalog: VehicleCatalogItem[],
  commissionRules: CommissionRules,
  staffName: string
): DealFinance => {
  const previous = application.deal_finance;
  const listedPrice = previous
    ? toMoney(previous.listed_selling_price)
    : toMoney(application.vehicle_options?.[0]?.motor_selling_price);
  const commissionQuote = getDealCommissionQuote(listedPrice, commissionRules);

  return {
    stock_unit_id: previous?.stock_unit_id || '',
    sale_status: previous?.sale_status || 'Pending Acceptance',
    automation_source: previous?.automation_source,
    approved_bank_name: previous?.approved_bank_name || '',
    approved_bank_offer_amount: toMoney(previous?.approved_bank_offer_amount),
    approved_bank_offer_at: previous?.approved_bank_offer_at || '',
    listed_selling_price: listedPrice,
    loan_amount: toMoney(previous?.loan_amount),
    deposit_amount: toMoney(previous?.deposit_amount),
    approved_discount: toMoney(previous?.approved_discount),
    final_selling_price: previous ? toMoney(previous.final_selling_price) : listedPrice,
    customer_deposit_received: toMoney(previous?.customer_deposit_received),
    customer_cash_payment: toMoney(previous?.customer_cash_payment),
    bank_disbursement: toMoney(previous?.bank_disbursement),
    other_income: toMoney(previous?.other_income),
    refund_amount: toMoney(previous?.refund_amount),
    direct_bank_charges: toMoney(previous?.direct_bank_charges),
    recognized_stock_cost: previous?.recognized_stock_cost,
    delivery_at: previous?.delivery_at || '',
    bank_disbursed_at: previous?.bank_disbursed_at || '',
    finance_completed_at: previous?.finance_completed_at || '',
    account_verified_at: previous?.account_verified_at || '',
    account_verified_by: previous?.account_verified_by || '',
    commission_status: previous?.commission_status || 'Estimated',
    commission_percent: previous ? previous.commission_percent : commissionQuote.percent,
    commission_amount: previous ? toMoney(previous.commission_amount) : toMoney(commissionQuote.amount),
    commission_paid_at: previous?.commission_paid_at || '',
    updated_at: previous?.updated_at || '',
    updated_by: previous?.updated_by || staffName
  };
};

function MoneyInput({ label, value, onChange, disabled = false }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <label className="block space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
      <span className="block">{label}</span>
      <span className="finance-money-field flex min-h-10 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors">
        <span className="finance-money-field__prefix inline-flex items-center pl-3 font-mono text-xs text-slate-500">RM</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value || ''}
          disabled={disabled}
          onChange={(event) => onChange(toMoney(event.target.value))}
          className="finance-money-field__input min-w-0 flex-1 bg-transparent px-3 py-2 text-right font-mono text-xs font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-500"
        />
      </span>
    </label>
  );
}

function StatCard({ label, value, tone = 'neutral', note }: { label: string; value: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'; note?: string }) {
  const toneClass = {
    neutral: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    brand: 'bg-red-50 text-red-700'
  }[tone];

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100">
      <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${toneClass}`}>{label}</span>
      <p className="mt-3 font-mono text-xl font-bold text-slate-900">{value}</p>
      {note && <p className="mt-1 text-[11px] font-semibold text-slate-500">{note}</p>}
    </div>
  );
}

export default function FinanceCenter({
  applications,
  vehicleCatalog,
  commissionRules,
  currentStaffName,
  canManage,
  onSaveStockUnits,
  onSaveDealFinance,
  onOpenApplication,
  canOpenVehicleInfo,
  onOpenVehicleInfo,
  stockTabRequestId = 0,
  stockFocusModel = '',
  onQuickAddStock,
  commissionPanel
}: FinanceCenterProps) {
  const { showConfirm } = useBrandedDialog();
  const [activeTab, setActiveTab] = useState<FinanceTab>('deals');
  const [quickStockOpen, setQuickStockOpen] = useState(false);
  const [quickStock, setQuickStock] = useState({
    catalogId: '',
    sellingPrice: 0,
    loanAmount: 0,
    deposit: 0,
    purchaseCost: 0,
    transportCost: 0,
    repairCost: 0,
    freeGiftCost: 0,
    numberPlate: ''
  });
  // Open the Stock tab when an "add stock / record cost" task deep-links here.
  // If a model was passed, pre-select it and open the stock-cost card.
  useEffect(() => {
    if (stockTabRequestId > 0) {
      setActiveTab('stock');
      const focus = (stockFocusModel || '').trim().toLowerCase();
      const catalog = focus ? vehicleCatalog.find((item) => (item.model || '').trim().toLowerCase() === focus) : undefined;
      if (catalog) {
        setStockCatalogId(catalog.id);
        setQuickStock({
          catalogId: catalog.id,
          sellingPrice: 0,
          loanAmount: 0,
          deposit: 0,
          purchaseCost: 0,
          transportCost: 0,
          repairCost: 0,
          freeGiftCost: 0,
          numberPlate: ''
        });
        setQuickStockOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockTabRequestId]);
  const openQuickStockFor = (catalog: VehicleCatalogItem) => {
    setStockCatalogId(catalog.id);
    setQuickStock({
      catalogId: catalog.id,
      sellingPrice: 0,
      loanAmount: 0,
      deposit: 0,
      purchaseCost: 0,
      transportCost: 0,
      repairCost: 0,
      freeGiftCost: 0,
      numberPlate: ''
    });
    setQuickStockOpen(true);
  };
  const saveQuickStock = () => {
    if (!onQuickAddStock || quickStock.purchaseCost <= 0 || !normalizeVehicleNumberPlate(quickStock.numberPlate)) return;
    const ok = onQuickAddStock(quickStock.catalogId, {
      selling_price: quickStock.sellingPrice,
      loan_amount: quickStock.loanAmount,
      deposit_amount: quickStock.deposit,
      purchase_cost: quickStock.purchaseCost,
      transport_cost: quickStock.transportCost,
      repair_cost: quickStock.repairCost,
      free_gift_cost: quickStock.freeGiftCost,
      number_plate: quickStock.numberPlate
    });
    if (ok) setQuickStockOpen(false);
  };
  const [reportMonth, setReportMonth] = useState(currentMonth);
  // Finance Center is a read-only ledger. Settlement actions live in Task Inbox.
  const showDealAdmin = false;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedApplicationId, setExpandedApplicationId] = useState('');
  const [dealDraft, setDealDraft] = useState<DealFinance | null>(null);
  const [stockCatalogId, setStockCatalogId] = useState(vehicleCatalog[0]?.id || '');
  const [stockDraft, setStockDraft] = useState<VehicleStockUnit>(() => createEmptyStockUnit(currentStaffName));
  const [showStockForm, setShowStockForm] = useState(false);
  const [showStockBatchForm, setShowStockBatchForm] = useState(false);
  const [stockBatchQuantity, setStockBatchQuantity] = useState(1);
  const [stockBatchRows, setStockBatchRows] = useState<StockBatchRow[]>(() => [createStockBatchRow(currentStaffName)]);
  const [isBulkEditingStock, setIsBulkEditingStock] = useState(false);
  const [stockBulkDrafts, setStockBulkDrafts] = useState<Record<string, VehicleStockUnit>>({});
  const [showAllStockModels, setShowAllStockModels] = useState(false);
  const [showOptionalInputs, setShowOptionalInputs] = useState(false);

  useEffect(() => {
    if (!stockCatalogId && vehicleCatalog[0]?.id) {
      setStockCatalogId(vehicleCatalog[0].id);
    }
  }, [stockCatalogId, vehicleCatalog]);

  const stockRows = useMemo(() => vehicleCatalog.flatMap((catalog) => (
    (catalog.stock_units || []).map((unit) => ({ catalog, unit, cost: getStockUnitCost(unit) }))
  )), [vehicleCatalog]);

  const stockById = useMemo(() => new Map(stockRows.map((row) => [row.unit.id, row])), [stockRows]);
  const selectedStockCatalog = vehicleCatalog.find((item) => item.id === stockCatalogId);
  const selectedStockRows = stockRows.filter(({ catalog }) => catalog.id === stockCatalogId);
  const selectedAvailableStock = selectedStockRows.filter(({ unit }) => unit.status === 'In Stock').length;
  const selectedReservedStock = selectedStockRows.filter(({ unit }) => unit.status === 'Reserved').length;
  const selectedInventoryValue = selectedStockRows
    .filter(({ unit }) => unit.status !== 'Sold')
    .reduce((sum, row) => sum + row.cost, 0);

  const dealApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return applications
      .filter((application) => application.status === LoanStatus.APPROVE || Boolean(application.deal_finance))
      .filter((application) => (
        !query ||
        application.applicant_name.toLowerCase().includes(query) ||
        application.vehicle_model.toLowerCase().includes(query) ||
        application.handler_name.toLowerCase().includes(query) ||
        application.id.toLowerCase().includes(query)
      ))
      .sort((a, b) => (b.deal_finance?.updated_at || b.submitted_at).localeCompare(a.deal_finance?.updated_at || a.submitted_at));
  }, [applications, searchTerm]);

  const monthDeals = applications.filter((application) => (
    application.deal_finance?.sale_status === 'Bike Delivered' &&
    (application.deal_finance.delivery_at || '').slice(0, 7) === reportMonth
  ));
  const monthTotals = monthDeals.reduce((totals, application) => {
    const finance = application.deal_finance!;
    const catalogCost = toMoney(findCatalogItem(vehicleCatalog, application.vehicle_model)?.cost_price);
    const stockCost = getRecognizedDealStockCost(
      finance,
      finance.stock_unit_id ? stockById.get(finance.stock_unit_id)?.cost || 0 : 0,
      catalogCost
    );
    const salesValue = getDealSalesValue(finance);
    const receipts = getDealReceipts(finance);
    const grossProfit = salesValue - stockCost - toMoney(finance.direct_bank_charges);
    const commission = finance.commission_status === 'Reversed' ? 0 : toMoney(finance.commission_amount);
    return {
      salesValue: totals.salesValue + salesValue,
      receipts: totals.receipts + receipts,
      cost: totals.cost + stockCost,
      grossProfit: totals.grossProfit + grossProfit,
      commission: totals.commission + commission,
      netProfit: totals.netProfit + grossProfit - commission
    };
  }, { salesValue: 0, receipts: 0, cost: 0, grossProfit: 0, commission: 0, netProfit: 0 });

  const openDealEditor = (application: LoanApplication) => {
    const isOpen = expandedApplicationId === application.id;
    setExpandedApplicationId(isOpen ? '' : application.id);
    setDealDraft(isOpen ? null : buildDealFinance(application, vehicleCatalog, commissionRules, currentStaffName));
  };

  const applyAutomaticDealDates = (finance: DealFinance): DealFinance => {
    const next = { ...finance };

    next.bank_disbursed_at = next.bank_disbursement > 0 ? next.bank_disbursed_at || today() : '';
    if (next.sale_status === 'Bike Delivered') {
      next.delivery_at = next.delivery_at || today();
    } else {
      next.delivery_at = '';
      next.finance_completed_at = '';
      next.commission_paid_at = '';
    }

    return next;
  };

  const updateDealMoney = (field: keyof DealFinance, value: number) => {
    setDealDraft((current) => current ? applyAutomaticDealDates({ ...current, [field]: value }) : current);
  };

  const moveSaleStatus = (direction: -1 | 1) => {
    setDealDraft((current) => {
      if (!current) return current;
      if (current.sale_status === 'Cancelled') {
        return direction < 0 ? applyAutomaticDealDates({ ...current, sale_status: 'Pending Acceptance' }) : current;
      }
      const currentIndex = SALE_STATUS_STEPS.indexOf(current.sale_status);
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), SALE_STATUS_STEPS.length - 1);
      return applyAutomaticDealDates({ ...current, sale_status: SALE_STATUS_STEPS[nextIndex] });
    });
  };

  const moveRowSaleStatus = async (application: LoanApplication, direction: -1 | 1) => {
    const current = buildDealFinance(application, vehicleCatalog, commissionRules, currentStaffName);
    if (
      direction < 0 &&
      (current.finance_completed_at || current.commission_paid_at) &&
      !await showConfirm({
        eyebrow: tr('财务结算', 'Finance Settlement', 'Penyelesaian Kewangan'),
        title: tr('退回交易状态？', 'Move deal status back?', 'Undurkan status urus niaga?'),
        message: tr(
          '这笔交易已经完成财务或支付佣金。退回上一步会清除结算日期并改写报表。',
          'This deal is finance-completed or commission-paid. Moving it back clears settlement dates and changes reports.',
          'Urus niaga ini telah selesai kewangan atau komisen telah dibayar. Undur akan mengosongkan tarikh penyelesaian dan mengubah laporan.'
        ),
        tone: 'danger',
        confirmLabel: tr('确认退回', 'Move Back', 'Undur')
      })
    ) {
      return;
    }

    if (current.sale_status === 'Cancelled') {
      if (direction > 0) {
        await onSaveDealFinance(application.id, applyAutomaticDealDates({ ...current, sale_status: 'Pending Acceptance' }));
      }
      return;
    }

    const currentIndex = SALE_STATUS_STEPS.indexOf(current.sale_status);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), SALE_STATUS_STEPS.length - 1);
    const nextStatus = SALE_STATUS_STEPS[nextIndex];
    if (nextStatus === current.sale_status) return;
    if (nextStatus === 'Bike Delivered' && !current.stock_unit_id) {
      openDealEditor(application);
      return;
    }
    await onSaveDealFinance(application.id, applyAutomaticDealDates({ ...current, sale_status: nextStatus }));
  };

  const cancelDeal = () => {
    setDealDraft((current) => current ? applyAutomaticDealDates({ ...current, sale_status: 'Cancelled' }) : current);
  };

  const saveDeal = async (application: LoanApplication) => {
    if (!dealDraft) return;
    const finalSellingPrice = toMoney(dealDraft.final_selling_price);
    if (!await onSaveDealFinance(application.id, applyAutomaticDealDates({ ...dealDraft, final_selling_price: finalSellingPrice }))) {
      return;
    }
    setExpandedApplicationId('');
    setDealDraft(null);
  };

  const startNewStock = () => {
    const catalogId = stockCatalogId || vehicleCatalog[0]?.id || '';
    setStockCatalogId(catalogId);
    setStockBatchQuantity(1);
    setStockBatchRows([createStockBatchRow(currentStaffName)]);
    setShowStockBatchForm(true);
    setShowStockForm(false);
  };

  const editStock = (catalog: VehicleCatalogItem, unit: VehicleStockUnit) => {
    setStockCatalogId(catalog.id);
    setStockDraft({ ...unit });
    setShowStockForm(true);
    setShowStockBatchForm(false);
  };

  const saveStock = () => {
    if (!stockCatalogId || stockDraft.purchase_cost <= 0 || !normalizeVehicleNumberPlate(stockDraft.number_plate)) return;
    if (!onSaveStockUnits([{ catalogId: stockCatalogId, unit: stockDraft }])) {
      return;
    }
    setStockDraft(createEmptyStockUnit(currentStaffName));
    setShowStockForm(false);
  };

  const resizeStockBatch = (quantity: number) => {
    const safeQuantity = Math.max(1, Math.min(20, Math.floor(quantity || 1)));
    setStockBatchQuantity(safeQuantity);
    setStockBatchRows((current) => Array.from({ length: safeQuantity }, (_, index) => (
      current[index] || createStockBatchRow(currentStaffName)
    )));
  };

  const updateStockBatchRow = (key: string, updates: Partial<VehicleStockUnit>) => {
    setStockBatchRows((current) => current.map((row) => row.key === key ? { ...row, unit: { ...row.unit, ...updates } } : row));
  };

  const changeStockBatchCatalog = (catalogId: string) => {
    setStockCatalogId(catalogId);
  };

  const saveStockBatch = () => {
    if (!stockCatalogId || stockBatchRows.some(({ unit }) => unit.purchase_cost <= 0 || !normalizeVehicleNumberPlate(unit.number_plate))) return;
    if (!onSaveStockUnits(stockBatchRows.map(({ unit }) => ({ catalogId: stockCatalogId, unit })))) {
      return;
    }
    setShowStockBatchForm(false);
    setStockBatchQuantity(1);
    setStockBatchRows([createStockBatchRow(currentStaffName, toMoney(selectedStockCatalog?.cost_price))]);
  };

  const startBulkStockEdit = () => {
    setStockBulkDrafts(Object.fromEntries(visibleStockRows.map(({ catalog, unit }) => [`${catalog.id}:${unit.id}`, { ...unit }])));
    setIsBulkEditingStock(true);
    setShowStockBatchForm(false);
    setShowStockForm(false);
  };

  const saveBulkStockEdits = () => {
    const changedRows = visibleStockRows.filter(({ catalog, unit }) => {
      const draft = stockBulkDrafts[`${catalog.id}:${unit.id}`];
      return draft && JSON.stringify(draft) !== JSON.stringify(unit);
    });
    if (changedRows.length === 0) {
      setIsBulkEditingStock(false);
      return;
    }
    if (!onSaveStockUnits(changedRows.map(({ catalog, unit }) => ({
      catalogId: catalog.id,
      unit: stockBulkDrafts[`${catalog.id}:${unit.id}`] || unit
    })))) {
      return;
    }
    setIsBulkEditingStock(false);
    setStockBulkDrafts({});
  };

  const updateBulkStockDraft = (key: string, updates: Partial<VehicleStockUnit>) => {
    setStockBulkDrafts((current) => ({
      ...current,
      [key]: { ...current[key], ...updates }
    }));
  };

  const visibleStockRows = stockRows.filter(({ catalog, unit }) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesModelScope = showAllStockModels || catalog.id === stockCatalogId;
    const matchesSearch = !query || [catalog.model, unit.number_plate, unit.chassis_number, unit.engine_number, unit.supplier, unit.status].some((value) => String(value || '').toLowerCase().includes(query));
    return matchesModelScope && matchesSearch;
  });

  return (
    <div id="finance-center-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{tr('财务中心', 'Finance Center', 'Pusat Kewangan')}</h2>
          <p className="mt-1 text-xs text-slate-500">{tr('查看成交利润、库存成本与佣金总账；结算操作统一在 Task Inbox 完成。', 'Review deal P&L, stock cost, and the commission ledger. Complete settlement actions in Task Inbox.', 'Semak P&L jualan, kos stok dan lejar komisen. Lengkapkan tindakan penyelesaian dalam Task Inbox.')}</p>
        </div>
        {activeTab !== 'commission' && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="month"
              value={reportMonth}
              onChange={(event) => setReportMonth(event.target.value)}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-100 outline-none focus:ring-red-100"
            />
            {showOptionalInputs && (
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={tr('搜索客户、车型或车架号', 'Search customer, model, or chassis', 'Cari pelanggan, model atau casis')}
                className="min-w-[240px] rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-100 outline-none focus:ring-red-100"
              />
            )}
            <button
              type="button"
              aria-pressed={showOptionalInputs}
              onClick={() => setShowOptionalInputs((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ring-1 transition-colors ${showOptionalInputs ? 'bg-slate-800 text-white ring-slate-800' : 'bg-white text-slate-600 ring-slate-100 hover:text-red-700 hover:ring-red-100'}`}
            >
              {showOptionalInputs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showOptionalInputs
                ? tr('隐藏可选栏位', 'Hide Optional Fields', 'Sembunyikan Medan Pilihan')
                : tr('显示可选栏位', 'Show Optional Fields', 'Tunjukkan Medan Pilihan')}
            </button>
          </div>
        )}
      </section>

      <section
        role="tablist"
        aria-label={tr('财务中心页面', 'Finance Center sections', 'Bahagian Pusat Kewangan')}
        className="grid grid-flow-col auto-cols-[minmax(max-content,1fr)] gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-slate-100"
      >
        {([
          ['deals', tr('成交与利润', 'Deals & P&L', 'Jualan & P&L'), <img key="deals" src={dealsIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />],
          ['stock', tr('库存与成本', 'Stock & Cost', 'Stok & Kos'), <img key="stock" src={stockIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />],
          ...(commissionPanel
            ? ([['commission', tr('佣金总账', 'Commission Ledger', 'Lejar Komisen'), <ReceiptText key="commission" className="h-5 w-5" />]] as Array<[FinanceTab, string, React.ReactNode]>)
            : [])
        ] as Array<[FinanceTab, string, React.ReactNode]>).map(([tab, label, icon]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-colors ${activeTab === tab ? 'bg-red-800 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            {icon}{label}
          </button>
        ))}
      </section>

      {activeTab === 'deals' && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={tr('成交', 'Delivered', 'Diserah')} value={String(monthDeals.length)} tone="brand" note={reportMonth} />
          <StatCard label={tr('销售额', 'Sales Value', 'Nilai Jualan')} value={formatMoney(monthTotals.salesValue)} tone="success" />
          <StatCard label={tr('未收款', 'Outstanding', 'Belum Terima')} value={formatMoney(Math.max(monthTotals.salesValue - monthTotals.receipts, 0))} tone="warning" />
          <StatCard label={tr('净贡献', 'Net Contribution', 'Sumbangan Bersih')} value={formatMoney(monthTotals.netProfit)} tone={monthTotals.netProfit >= 0 ? 'success' : 'danger'} />
        </section>
      )}

      {activeTab === 'deals' ? (
        <section className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-900">{tr('成交与利润', 'Deals & P&L', 'Jualan & P&L')}</h3>
            <p className="mt-1 text-xs text-slate-500">{tr('结算操作在 Task Inbox；这里查看交车后的月度利润。', 'Settle deals in Task Inbox; review monthly delivered profit here.', 'Selesaikan jualan dalam Task Inbox; semak keuntungan bulanan selepas serahan di sini.')}</p>
          </div>
          <div className="px-5 py-4">
            <h4 className="text-xs font-bold text-slate-900">{tr('本月成交利润 (P&L)', "This Month's Delivered P&L", 'P&L Serahan Bulan Ini')}</h4>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">{tr('客户 / 车型', 'Customer / Model', 'Pelanggan / Model')}</th>
                    <th className="py-2 px-3 text-right">{tr('售额', 'Sales', 'Jualan')}</th>
                    <th className="py-2 px-3 text-right">{tr('成本', 'Cost', 'Kos')}</th>
                    <th className="py-2 px-3 text-right">{tr('毛利', 'Gross', 'Kasar')}</th>
                    <th className="py-2 px-3 text-right">{tr('佣金', 'Commission', 'Komisen')}</th>
                    <th className="py-2 pl-3 text-right">{tr('净利', 'Net', 'Bersih')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthDeals.map((application) => {
                    const finance = application.deal_finance!;
                    const catalogCost = toMoney(findCatalogItem(vehicleCatalog, application.vehicle_model)?.cost_price);
                    const stockCost = getRecognizedDealStockCost(
                      finance,
                      finance.stock_unit_id ? stockById.get(finance.stock_unit_id)?.cost || 0 : 0,
                      catalogCost
                    );
                    const salesValue = getDealSalesValue(finance);
                    const grossProfit = salesValue - stockCost - toMoney(finance.direct_bank_charges);
                    const commission = finance.commission_status === 'Reversed' ? 0 : toMoney(finance.commission_amount);
                    return (
                      <tr key={application.id} className="text-slate-600">
                        <td className="py-2 pr-3"><span className="block font-bold text-slate-900">{application.applicant_name}</span><span className="block text-[10px] text-slate-500">{application.vehicle_model} · {application.handler_name}</span></td>
                        <td className="py-2 px-3 text-right font-mono">{formatMoney(salesValue)}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatMoney(stockCost)}</td>
                        <td className={`py-2 px-3 text-right font-mono ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMoney(grossProfit)}</td>
                        <td className="py-2 px-3 text-right font-mono"><span className={`rounded px-1 py-0.5 text-[10px] ${getCommissionTone(finance.commission_status)}`}>{finance.commission_status}</span> {formatMoney(commission)}</td>
                        <td className={`py-2 pl-3 text-right font-mono font-bold ${grossProfit - commission >= 0 ? 'text-red-700' : 'text-rose-600'}`}>{formatMoney(grossProfit - commission)}</td>
                      </tr>
                    );
                  })}
                  {monthDeals.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">{tr('本月还没有成交。', 'No delivered deals this month.', 'Tiada serahan bulan ini.')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {showDealAdmin && (
          <div className="divide-y divide-slate-100">
            {dealApplications.map((application) => {
              const finance = application.deal_finance || buildDealFinance(application, vehicleCatalog, commissionRules, currentStaffName);
              const catalogItem = findCatalogItem(vehicleCatalog, application.vehicle_model);
              const rowStock = finance.stock_unit_id ? stockById.get(finance.stock_unit_id) : undefined;
              const stockCost = getRecognizedDealStockCost(finance, rowStock?.cost || 0, 0);
              const salesValue = getDealSalesValue(finance);
              const grossProfit = salesValue - stockCost - toMoney(finance.direct_bank_charges);
              const isExpanded = expandedApplicationId === application.id && dealDraft;
              const linkedStockUnits = catalogItem?.stock_units || [];
              const availableLinkedStock = linkedStockUnits.filter((unit) => unit.status === 'In Stock' || unit.id === dealDraft?.stock_unit_id).length;

              return (
                <div key={application.id}>
                  <div className="finance-deal-row grid w-full gap-3 px-5 py-4 text-left transition-colors md:grid-cols-[1.2fr_1.35fr_0.7fr_0.8fr_auto] md:items-center">
                    <button type="button" onClick={() => openDealEditor(application)} className="min-w-0 text-left">
                      <span className="block truncate text-xs font-bold text-slate-900">{application.applicant_name}</span>
                      <span className="mt-1 block truncate text-[11px] font-semibold text-slate-500">{application.vehicle_model} · {application.handler_name} · {application.id}</span>
                    </button>
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{tr('成交状态', 'Sale Status', 'Status Jualan')}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <SaleStatusBadge status={finance.sale_status} />
                        {canManage && finance.sale_status !== 'Pending Acceptance' && finance.sale_status !== 'Cancelled' && (
                          <button type="button" onClick={() => moveRowSaleStatus(application, -1)} aria-label={`Move ${application.applicant_name} sale status back`} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:text-red-700"><ArrowLeft className="h-3.5 w-3.5" /></button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => finance.sale_status === 'Bike Delivered' ? openDealEditor(application) : moveRowSaleStatus(application, 1)}
                            className="inline-flex min-h-7 items-center gap-1 rounded-md bg-red-800 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-900"
                          >
                            {finance.sale_status === 'Pending Acceptance'
                              ? tr('下一步：客户接受', 'Next: Accepted', 'Seterusnya: Diterima')
                              : finance.sale_status === 'Customer Accepted'
                                ? finance.stock_unit_id
                                  ? tr('下一步：交车', 'Next: Delivered', 'Seterusnya: Diserah')
                                  : tr('选择库存再交车', 'Select Stock', 'Pilih Stok')
                                : finance.sale_status === 'Cancelled'
                                  ? tr('重新开始', 'Reopen', 'Buka Semula')
                                  : tr('查看结算', 'View Settlement', 'Lihat Penyelesaian')}
                            {finance.sale_status !== 'Bike Delivered' && <ArrowRight className="h-3 w-3" />}
                          </button>
                        )}
                      </span>
                    </span>
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{tr('毛利', 'Gross Profit', 'Untung Kasar')}</span>
                      <span className={`mt-1 block font-mono text-xs font-bold ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMoney(grossProfit)}</span>
                    </span>
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{tr('佣金', 'Commission', 'Komisen')}</span>
                      <span className={`mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-bold ${getCommissionTone(finance.commission_status)}`}>{finance.commission_status} · {formatMoney(finance.commission_amount)}</span>
                    </span>
                    <button type="button" onClick={() => openDealEditor(application)} aria-label={`Open ${application.applicant_name} finance details`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-700"><ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} /></button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
                        <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-slate-100">
                          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900"><Bike className="h-4 w-4 text-red-700" />{tr('成交与车辆', 'Sale & Vehicle', 'Jualan & Kenderaan')}</h4>
                          <div className="space-y-2">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">{tr('成交状态', 'Sale Status', 'Status Jualan')}</span>
                            <div className="finance-status-control flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100">
                              <button
                                type="button"
                                onClick={() => moveSaleStatus(-1)}
                                disabled={!canManage || dealDraft.sale_status === 'Pending Acceptance'}
                                className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-2 text-[11px] font-bold text-slate-600 ring-1 ring-slate-100 hover:text-red-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />{tr('上一步', 'Back', 'Kembali')}
                              </button>
                              <SaleStatusBadge status={dealDraft.sale_status} className="min-w-0 max-w-[150px] justify-center truncate" />
                              <button
                                type="button"
                                onClick={() => moveSaleStatus(1)}
                                disabled={!canManage || dealDraft.sale_status === 'Bike Delivered' || dealDraft.sale_status === 'Cancelled'}
                                className="inline-flex items-center gap-1 rounded-md bg-red-800 px-2.5 py-2 text-[11px] font-bold text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                              >
                                {tr('下一步', 'Next', 'Seterusnya')}<ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] font-semibold text-slate-500">Pending Acceptance → Customer Accepted → Bike Delivered</p>
                          </div>
                          {catalogItem ? (
                            <div className="finance-vehicle-summary rounded-lg p-3">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="truncate text-xs font-bold text-slate-800">{catalogItem.model}</span>
                                    <span className="finance-vehicle-summary__badge rounded-md px-1.5 py-0.5 text-[10px] font-bold">{tr('只使用车型资料', 'Model reference only', 'Rujukan model sahaja')}</span>
                                  </div>
                                  <span className="mt-1 block text-[10px] font-semibold text-slate-500">{catalogItem.brand} · {catalogItem.body_type}</span>
                                </div>
                                {canOpenVehicleInfo && (
                                  <button type="button" onClick={onOpenVehicleInfo} className="finance-vehicle-summary__link inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-emerald-700">
                                    {tr('打开 Vehicle Info', 'Open Vehicle Info', 'Buka Vehicle Info')}<ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {([
                                  [tr('本单卖价', 'Deal Selling Price', 'Harga Jualan Urus Niaga'), toMoney(dealDraft.final_selling_price)],
                                  [tr('本单贷款额', 'Deal Loan Amount', 'Jumlah Pinjaman Urus Niaga'), toMoney(dealDraft.loan_amount)],
                                  [tr('本单订金', 'Deal Deposit', 'Deposit Urus Niaga'), toMoney(dealDraft.deposit_amount)]
                                ] as Array<[string, number]>).map(([label, amount]) => (
                                  <span key={label} className="finance-vehicle-summary__metric rounded-md px-2 py-1.5">
                                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                                    <span className="mt-0.5 block font-mono text-[11px] font-bold text-slate-700">{amount > 0 ? formatMoney(amount) : '--'}</span>
                                  </span>
                                ))}
                                <span className="finance-vehicle-summary__metric rounded-md px-2 py-1.5">
                                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{tr('可用库存', 'Available Stock', 'Stok Tersedia')}</span>
                                  <span className="mt-0.5 block font-mono text-[11px] font-bold text-slate-700">{availableLinkedStock} / {linkedStockUnits.length}</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                              <span className="text-[11px] font-semibold text-amber-700">{tr('Vehicle Info 找不到这个车型，请先新增或合并车型。', 'This model is missing from Vehicle Info. Add or merge it first.', 'Model ini tiada dalam Vehicle Info. Tambah atau gabungkannya dahulu.')}</span>
                              {canOpenVehicleInfo && <button type="button" onClick={onOpenVehicleInfo} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-amber-700">{tr('打开 Vehicle Info', 'Open Vehicle Info', 'Buka Vehicle Info')}<ExternalLink className="h-3 w-3" /></button>}
                            </div>
                          )}
                          <label className="block space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <span>{tr('库存车辆', 'Stock Unit', 'Unit Stok')}</span>
                            <ToggleOptionGroup
                              value={dealDraft.stock_unit_id}
                              options={[
                                { value: '', label: tr('未选择', 'Not selected', 'Belum dipilih') },
                                ...stockRows
                                  .filter((row) => (
                                    (catalogItem && row.catalog.id === catalogItem.id) || row.unit.id === dealDraft.stock_unit_id
                                  ))
                                  .filter((row) => (
                                    row.unit.status === 'In Stock' ||
                                    row.unit.id === dealDraft.stock_unit_id ||
                                    row.unit.reserved_application_id === application.id ||
                                    row.unit.sold_application_id === application.id
                                  ))
                                  .map((row) => ({ value: row.unit.id, label: `${row.catalog.model} · ${getVehicleStockReference(row.unit)} · ${row.unit.status}` }))
                              ]}
                              onChange={(value) => setDealDraft((current) => current ? { ...current, stock_unit_id: value } : current)}
                              ariaLabel="Stock unit"
                              disabled={!canManage}
                              className="finance-select-field w-full"
                            />
                          </label>
                          <MoneyInput label={tr('最终售价', 'Final Selling Price', 'Harga Jualan Akhir')} value={dealDraft.final_selling_price} onChange={(value) => updateDealMoney('final_selling_price', value)} disabled={!canManage} />
                          {showOptionalInputs && (
                            <div className="grid grid-cols-2 gap-3">
                              <MoneyInput label={tr('标价', 'Listed Price', 'Harga Senarai')} value={dealDraft.listed_selling_price} onChange={(value) => updateDealMoney('listed_selling_price', value)} disabled={!canManage} />
                              <MoneyInput label={tr('批准折扣', 'Approved Discount', 'Diskaun Diluluskan')} value={dealDraft.approved_discount} onChange={(value) => updateDealMoney('approved_discount', value)} disabled={!canManage} />
                              <MoneyInput label={tr('其他收入', 'Other Income', 'Pendapatan Lain')} value={dealDraft.other_income} onChange={(value) => updateDealMoney('other_income', value)} disabled={!canManage} />
                              <MoneyInput label={tr('退款', 'Refund', 'Bayaran Balik')} value={dealDraft.refund_amount} onChange={(value) => updateDealMoney('refund_amount', value)} disabled={!canManage} />
                              <MoneyInput label={tr('银行/成交费用', 'Bank / Deal Charges', 'Caj Bank / Urus Niaga')} value={dealDraft.direct_bank_charges} onChange={(value) => updateDealMoney('direct_bank_charges', value)} disabled={!canManage} />
                            </div>
                          )}
                          {showOptionalInputs && canManage && dealDraft.sale_status !== 'Cancelled' && (
                            <button type="button" onClick={cancelDeal} className="text-left text-[11px] font-bold text-rose-600 hover:text-rose-700">{tr('取消成交', 'Cancel Deal', 'Batalkan Jualan')}</button>
                          )}
                        </div>

                        <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-slate-100">
                          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900"><WalletCards className="h-4 w-4 text-emerald-600" />{tr('收款与完成', 'Receipts & Completion', 'Terimaan & Selesai')}</h4>
                          <MoneyInput label={tr('银行实际放款', 'Bank Disbursement', 'Pengeluaran Bank')} value={dealDraft.bank_disbursement} onChange={(value) => updateDealMoney('bank_disbursement', value)} disabled={!canManage} />
                          {showOptionalInputs && (
                            <div className="grid grid-cols-2 gap-3">
                              <MoneyInput label={tr('已收 Deposit', 'Deposit Received', 'Deposit Diterima')} value={dealDraft.customer_deposit_received} onChange={(value) => updateDealMoney('customer_deposit_received', value)} disabled={!canManage} />
                              <MoneyInput label={tr('客户现金付款', 'Customer Cash', 'Tunai Pelanggan')} value={dealDraft.customer_cash_payment} onChange={(value) => updateDealMoney('customer_cash_payment', value)} disabled={!canManage} />
                            </div>
                          )}
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {([
                              ['delivery_at', tr('交车日期', 'Delivery Date', 'Tarikh Serahan')],
                              ['bank_disbursed_at', tr('银行放款日期', 'Bank Paid Date', 'Tarikh Bank Bayar')],
                              ['finance_completed_at', tr('财务完成日期', 'Finance Completed', 'Kewangan Selesai')]
                            ] as Array<[keyof DealFinance, string]>).map(([field, label]) => (
                              <span key={field} className="rounded-lg bg-slate-50 px-3 py-2">
                                <span className="block text-[10px] font-bold uppercase text-slate-500">{label}</span>
                                <span className="mt-1 block font-mono text-xs font-bold text-slate-700">{String(dealDraft[field] || '--')}</span>
                              </span>
                            ))}
                          </div>
                          {showOptionalInputs && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              {([
                                ['delivery_at', tr('修改交车日期', 'Edit Delivery Date', 'Edit Tarikh Serahan')],
                                ['bank_disbursed_at', tr('修改银行放款日期', 'Edit Bank Paid Date', 'Edit Tarikh Bank Bayar')],
                                ['finance_completed_at', tr('修改财务完成日期', 'Edit Finance Completed', 'Edit Kewangan Selesai')]
                              ] as Array<[keyof DealFinance, string]>).map(([field, label]) => (
                                <label key={field} className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  <span>{label}</span>
                                  <input type="date" value={String(dealDraft[field] || '')} disabled={!canManage} onChange={(event) => setDealDraft((current) => current ? { ...current, [field]: event.target.value } : current)} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100 disabled:text-slate-500" />
                                </label>
                              ))}
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
                            <span><span className="block text-[10px] font-bold uppercase text-slate-500">{tr('应收', 'Sales Value', 'Nilai Jualan')}</span><span className="mt-1 block font-mono text-xs font-bold text-slate-800">{formatMoney(getDealSalesValue(dealDraft))}</span></span>
                            <span><span className="block text-[10px] font-bold uppercase text-slate-500">{tr('已收', 'Received', 'Diterima')}</span><span className="mt-1 block font-mono text-xs font-bold text-emerald-600">{formatMoney(getDealReceipts(dealDraft))}</span></span>
                            <span><span className="block text-[10px] font-bold uppercase text-slate-500">{tr('状态', 'Status', 'Status')}</span><span className="mt-1 block text-[11px] font-bold text-amber-600">{getPaymentStatus(dealDraft)}</span></span>
                          </div>
                        </div>

                        <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-slate-100">
                          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900"><BadgeDollarSign className="h-4 w-4 text-amber-600" />{tr('佣金与利润', 'Commission & Profit', 'Komisen & Untung')}</h4>
                          <MoneyInput label={tr('佣金金额', 'Commission Amount', 'Jumlah Komisen')} value={dealDraft.commission_amount} onChange={(value) => updateDealMoney('commission_amount', value)} disabled={!canManage} />
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500">{tr('佣金付款', 'Commission Paid', 'Komisen Dibayar')}</span>
                            <span className="font-mono text-xs font-bold text-slate-700">{dealDraft.commission_paid_at || '--'}</span>
                          </div>
                          {showOptionalInputs && (
                            <div className="space-y-2">
                              <label className="block space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <span>{tr('修改佣金支付日期', 'Edit Commission Paid Date', 'Edit Tarikh Komisen Dibayar')}</span>
                                <input type="date" value={dealDraft.commission_paid_at} disabled={!canManage} onChange={(event) => setDealDraft((current) => current ? { ...current, commission_paid_at: event.target.value } : current)} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100 disabled:text-slate-500" />
                              </label>
                              {canManage && (
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" disabled={!dealDraft.finance_completed_at} onClick={() => setDealDraft((current) => current ? { ...current, commission_paid_at: today() } : current)} className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300">{tr('今天标记已付', 'Mark Paid Today', 'Tanda Dibayar Hari Ini')}</button>
                                  {dealDraft.commission_paid_at && <button type="button" onClick={() => setDealDraft((current) => current ? { ...current, commission_paid_at: '' } : current)} className="rounded-lg px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50">{tr('清除付款日期', 'Clear Paid Date', 'Kosongkan Tarikh Bayaran')}</button>}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                            {(() => {
                              const draftStockCost = getRecognizedDealStockCost(
                                dealDraft,
                                dealDraft.stock_unit_id ? stockById.get(dealDraft.stock_unit_id)?.cost || 0 : 0,
                                stockCost
                              );
                              return (
                                <>
                                  <div className="flex justify-between"><span>{tr('车辆成本', 'Stock Cost', 'Kos Stok')}</span><strong className="font-mono text-slate-800">{formatMoney(draftStockCost)}</strong></div>
                                  <div className="flex justify-between"><span>{tr('预计毛利', 'Gross Profit', 'Untung Kasar')}</span><strong className="font-mono text-emerald-600">{formatMoney(getDealSalesValue(dealDraft) - draftStockCost - dealDraft.direct_bank_charges)}</strong></div>
                                  <div className="flex justify-between"><span>{tr('扣佣金后', 'After Commission', 'Selepas Komisen')}</span><strong className="font-mono text-red-700">{formatMoney(getDealSalesValue(dealDraft) - draftStockCost - dealDraft.direct_bank_charges - dealDraft.commission_amount)}</strong></div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap justify-between gap-2">
                        <button type="button" onClick={() => onOpenApplication(application)} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-800">{tr('打开 Loan Application', 'Open Loan Application', 'Buka Loan Application')}</button>
                        {canManage && (
                          <button type="button" onClick={() => saveDeal(application)} className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900"><Save className="h-4 w-4" />{tr('保存财务资料', 'Save Finance', 'Simpan Kewangan')}</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {dealApplications.length === 0 && <p className="px-5 py-12 text-center text-xs font-semibold text-slate-500">{tr('没有 Approved 或已建立财务资料的申请。', 'No approved application or finance record yet.', 'Belum ada permohonan diluluskan atau rekod kewangan.')}</p>}
          </div>
          )}
        </section>
      ) : activeTab === 'commission' && commissionPanel ? (
        <section className="space-y-4">
          {commissionPanel}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="rounded-xl bg-white p-5 ring-1 ring-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{tr('实体库存工作台', 'Physical Stock Workspace', 'Ruang Kerja Stok Fizikal')}</h3>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{tr('车型仅供分类', 'Model grouping only', 'Model untuk kumpulan sahaja')}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{tr('先选车型，再批量新增或编辑实体车辆；未售出成本保留在 Inventory Value。', 'Select a model first, then bulk add or edit physical units; unsold cost stays in Inventory Value.', 'Pilih model dahulu, kemudian tambah atau edit unit fizikal secara pukal; kos belum dijual kekal dalam Nilai Inventori.')}</p>
              </div>
              {canOpenVehicleInfo && <button type="button" onClick={onOpenVehicleInfo} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 ring-1 ring-slate-100 hover:text-red-700"><ExternalLink className="h-3.5 w-3.5" />{tr('打开 Vehicle Info', 'Open Vehicle Info', 'Buka Vehicle Info')}</button>}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.5fr)] xl:items-end">
              <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span>{tr('1 · 选择车型', '1 · Select Model', '1 · Pilih Model')}</span>
                <ToggleOptionGroup
                  value={stockCatalogId}
                  options={vehicleCatalog.map((item) => ({ value: item.id, label: `${item.brand} · ${item.model}` }))}
                  onChange={(catalogId) => {
                    changeStockBatchCatalog(catalogId);
                    setShowAllStockModels(false);
                    setIsBulkEditingStock(false);
                    setStockBulkDrafts({});
                    setShowStockForm(false);
                  }}
                  ariaLabel="Stock workspace Vehicle Info model"
                  className="finance-select-field w-full"
                />
              </label>

              {selectedStockCatalog ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                  {([
                    [tr('实体车辆', 'Physical Units', 'Unit Fizikal'), String(selectedStockRows.length), 'text-slate-800'],
                    [tr('可用', 'Available', 'Tersedia'), String(selectedAvailableStock), 'text-emerald-600'],
                    [tr('已预留', 'Reserved', 'Ditempah'), String(selectedReservedStock), 'text-amber-600'],
                    [tr('库存价值', 'Inventory Value', 'Nilai Inventori'), formatMoney(selectedInventoryValue), 'text-red-700']
                  ] as Array<[string, string, string]>).map(([label, value, tone]) => (
                    <span key={label} className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                      <span className={`mt-1 block font-mono text-xs font-bold ${tone}`}>{value}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">{tr('Vehicle Info 还没有车型，请先新增车型。', 'No Vehicle Info model yet. Add a model first.', 'Belum ada model Vehicle Info. Tambah model dahulu.')}</div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button type="button" aria-pressed={showAllStockModels} onClick={() => { setShowAllStockModels((current) => !current); setIsBulkEditingStock(false); setStockBulkDrafts({}); }} className={`rounded-lg px-3 py-2 text-[11px] font-bold ring-1 ${showAllStockModels ? 'bg-slate-800 text-white ring-slate-800' : 'bg-white text-slate-500 ring-slate-100 hover:text-red-700'}`}>
                {showAllStockModels ? tr('只看当前车型', 'Show Selected Model', 'Tunjuk Model Dipilih') : tr('查看全部车型', 'Show All Models', 'Tunjuk Semua Model')}
              </button>
              {canManage && (
                <div className="flex flex-wrap gap-2">
                  {!isBulkEditingStock && visibleStockRows.length > 0 && <button type="button" onClick={startBulkStockEdit} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-100 hover:text-red-700"><Pencil className="h-4 w-4" />{showAllStockModels ? tr('批量编辑全部', 'Bulk Edit All', 'Edit Semua Secara Pukal') : tr('批量编辑这个车型', 'Bulk Edit This Model', 'Edit Pukal Model Ini')}</button>}
                  <button type="button" disabled={!selectedStockCatalog} onClick={() => { if (selectedStockCatalog) openQuickStockFor(selectedStockCatalog); }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500"><Plus className="h-4 w-4" />{tr('快速补库存', 'Quick Add Stock', 'Tambah Stok Pantas')}</button>
                  <button type="button" disabled={!selectedStockCatalog} onClick={startNewStock} className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-500"><Plus className="h-4 w-4" />{tr('批量新增实体车辆', 'Add Physical Units', 'Tambah Unit Fizikal')}</button>
                </div>
              )}
            </div>
          </div>

          {quickStockOpen && canManage && (() => {
            const quickCatalog = vehicleCatalog.find((item) => item.id === quickStock.catalogId);
            if (!quickCatalog) return null;
            const totalCost = quickStock.purchaseCost + quickStock.transportCost + quickStock.repairCost + quickStock.freeGiftCost;
            return (
              <div className="rounded-xl bg-white p-5 ring-1 ring-emerald-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{tr('快速补库存', 'Quick Add Stock', 'Tambah Stok Pantas')}</h4>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">{tr('这里只新增实体库存和实际成本，不读取或修改 Vehicle Info 价格。客户成交金额请从 Task Inbox 的 Add Stock 处理。', 'This adds only the physical unit and actual costs; it neither reads nor changes Vehicle Info pricing. Enter customer deal amounts from Add Stock in Task Inbox.', 'Ini hanya menambah unit fizikal dan kos sebenar; harga Vehicle Info tidak dibaca atau diubah. Masukkan jumlah urus niaga pelanggan melalui Add Stock dalam Task Inbox.')}</p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{quickCatalog.brand} · {quickCatalog.model}</span>
                </div>
                <div className="mt-4">
                  <section className="rounded-xl bg-rose-50/70 p-4 ring-1 ring-rose-100">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-rose-600 font-mono text-sm font-bold text-white">−</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">{tr('车辆成本 / 支出', 'Vehicle Costs / Outgoing Amounts', 'Kos Kenderaan / Jumlah Keluar')}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MoneyInput label={tr('− 购买成本（必填）', '− Purchase Cost (required)', '− Kos Belian (wajib)')} value={quickStock.purchaseCost} onChange={(value) => setQuickStock((current) => ({ ...current, purchaseCost: value }))} />
                      <MoneyInput label={tr('− 运输费', '− Transport Fee', '− Kos Pengangkutan')} value={quickStock.transportCost} onChange={(value) => setQuickStock((current) => ({ ...current, transportCost: value }))} />
                      <MoneyInput label={tr('− 维修费', '− Repair Fee', '− Kos Pembaikan')} value={quickStock.repairCost} onChange={(value) => setQuickStock((current) => ({ ...current, repairCost: value }))} />
                      <MoneyInput label={tr('− Free Gift 成本', '− Free Gift Cost', '− Kos Hadiah Percuma')} value={quickStock.freeGiftCost} onChange={(value) => setQuickStock((current) => ({ ...current, freeGiftCost: value }))} />
                    </div>
                  </section>
                </div>
                <label className="mt-3 block space-y-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="block">{tr('车辆基本资料 · 车牌（必填）', 'Vehicle Details · Number Plate (required)', 'Butiran Kenderaan · Nombor Plat (wajib)')}</span>
                  <input value={quickStock.numberPlate} onChange={(event) => setQuickStock((current) => ({ ...current, numberPlate: event.target.value }))} placeholder="VEE4989" className="h-10 w-full rounded-lg bg-slate-50 px-3 font-mono text-xs font-semibold uppercase text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-emerald-100" />
                </label>
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <span className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{tr('总入库成本', 'Total Landed Cost', 'Jumlah Kos Masuk')}</span>
                    <span className="mt-1 block font-mono text-sm font-bold text-rose-700">{formatMoney(totalCost)}</span>
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setQuickStockOpen(false)} className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100 hover:text-red-700">{tr('取消', 'Cancel', 'Batal')}</button>
                  <button type="button" disabled={quickStock.purchaseCost <= 0 || !normalizeVehicleNumberPlate(quickStock.numberPlate)} onClick={saveQuickStock} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500"><Save className="h-4 w-4" />{tr('保存并补库存', 'Save & Add Stock', 'Simpan & Tambah Stok')}</button>
                </div>
              </div>
            );
          })()}

          {showStockBatchForm && canManage && (
            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{tr('批量新增实体库存', 'Add Physical Stock Units', 'Tambah Unit Stok Fizikal')}</h4>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{tr('1 选择车型 · 2 输入数量与成本 · 3 一次保存', '1 Choose model · 2 Enter quantity and cost · 3 Save once', '1 Pilih model · 2 Masukkan kuantiti dan kos · 3 Simpan sekali')}</p>
                </div>
                <button type="button" onClick={() => setShowStockBatchForm(false)} aria-label="Close stock batch form" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>{tr('Vehicle Info 车型（必填）', 'Vehicle Info Model (Required)', 'Model Vehicle Info (Wajib)')}</span>
                  <ToggleOptionGroup value={stockCatalogId} options={vehicleCatalog.map((item) => ({ value: item.id, label: `${item.brand} · ${item.model}` }))} onChange={changeStockBatchCatalog} ariaLabel="Vehicle Info stock model" className="finance-select-field w-full" />
                </label>
                <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>{tr('新增数量', 'Quantity', 'Kuantiti')}</span>
                  <input type="number" min="1" max="20" value={stockBatchQuantity} onChange={(event) => resizeStockBatch(Number(event.target.value))} aria-label="Stock batch quantity" className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-red-100" />
                </label>
              </div>

              {selectedStockCatalog && (
                <div className="finance-vehicle-summary mt-4 rounded-lg p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="block text-xs font-bold text-slate-900">{selectedStockCatalog.model}</span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">{selectedStockCatalog.brand} · {selectedStockCatalog.body_type}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="finance-vehicle-summary__badge rounded-md px-1.5 py-0.5 text-[10px] font-bold">{tr('只使用车型资料', 'Model reference only', 'Rujukan model sahaja')}</span>
                      {canOpenVehicleInfo && <button type="button" onClick={onOpenVehicleInfo} className="finance-vehicle-summary__link inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-emerald-700">{tr('打开 Vehicle Info', 'Open Vehicle Info', 'Buka Vehicle Info')}<ExternalLink className="h-3 w-3" /></button>}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {([
                      [tr('目前库存', 'Current Units', 'Unit Semasa'), selectedStockCatalog.stock_units?.length || 0, true]
                    ] as Array<[string, number, boolean]>).map(([label, amount, isCount]) => (
                      <span key={label} className="finance-vehicle-summary__metric rounded-md px-2 py-1.5"><span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span><span className="mt-0.5 block font-mono text-[11px] font-bold text-slate-700">{isCount ? amount : amount > 0 ? formatMoney(amount) : '--'}</span></span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-slate-100">
                <table className={`w-full text-left ${showOptionalInputs ? 'min-w-[1160px]' : 'min-w-[680px]'}`}>
                  <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="w-12 px-3 py-2.5">#</th><th className="px-3 py-2.5">{tr('车牌（必填）', 'Number Plate (Required)', 'Nombor Plat (Wajib)')}</th>{showOptionalInputs && <><th className="px-3 py-2.5">{tr('车架号', 'Chassis', 'Casis')}</th><th className="px-3 py-2.5">{tr('引擎号', 'Engine', 'Enjin')}</th><th className="px-3 py-2.5">{tr('供应商', 'Supplier', 'Pembekal')}</th><th className="px-3 py-2.5">{tr('入库日期', 'Received', 'Diterima')}</th></>}<th className="w-56 px-3 py-2.5">{tr('采购成本（必填）', 'Purchase Cost (Required)', 'Kos Belian (Wajib)')}</th><th className="px-3 py-2.5 text-right">{tr('总成本', 'Total Cost', 'Jumlah Kos')}</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockBatchRows.map((row, index) => (
                      <tr key={row.key} className="text-xs text-slate-600">
                        <td className="px-3 py-2 font-mono font-bold text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2"><input value={row.unit.number_plate} onChange={(event) => updateStockBatchRow(row.key, { number_plate: event.target.value })} aria-label={`Number Plate row ${index + 1}`} placeholder="VEE4989" className="w-full rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs font-bold uppercase text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-red-100" /></td>
                        {showOptionalInputs && <><td className="px-3 py-2"><input value={row.unit.chassis_number} onChange={(event) => updateStockBatchRow(row.key, { chassis_number: event.target.value })} aria-label={`Chassis number row ${index + 1}`} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-red-100" /></td><td className="px-3 py-2"><input value={row.unit.engine_number} onChange={(event) => updateStockBatchRow(row.key, { engine_number: event.target.value })} aria-label={`Engine number row ${index + 1}`} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-red-100" /></td><td className="px-3 py-2"><input value={row.unit.supplier} onChange={(event) => updateStockBatchRow(row.key, { supplier: event.target.value })} aria-label={`Supplier row ${index + 1}`} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-red-100" /></td><td className="px-3 py-2"><input type="date" value={row.unit.received_at} onChange={(event) => updateStockBatchRow(row.key, { received_at: event.target.value })} aria-label={`Received date row ${index + 1}`} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-red-100" /></td></>}
                        <td className="px-3 py-2"><span className="finance-money-field flex min-h-9 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white"><span className="finance-money-field__prefix inline-flex items-center pl-3 font-mono text-[11px] text-slate-500">RM</span><input type="number" min="0" step="0.01" value={row.unit.purchase_cost || ''} onChange={(event) => updateStockBatchRow(row.key, { purchase_cost: toMoney(event.target.value) })} aria-label={`Purchase cost row ${index + 1}`} className="finance-money-field__input min-w-0 flex-1 bg-transparent px-3 py-2 text-right font-mono text-xs font-bold text-slate-700 outline-none" /></span></td>
                        <td className="px-3 py-2 text-right font-mono text-xs font-bold text-slate-900">{formatMoney(getStockUnitCost(row.unit))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-slate-500">{tr('每台车必须填写唯一 Number Plate；车架号可以留空。', 'Every unit needs a unique Number Plate; chassis can stay blank.', 'Setiap unit memerlukan Nombor Plat unik; casis boleh dibiarkan kosong.')}</span>
                <button type="button" disabled={!stockCatalogId || stockBatchRows.some(({ unit }) => unit.purchase_cost <= 0 || !normalizeVehicleNumberPlate(unit.number_plate))} onClick={saveStockBatch} className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-500"><Save className="h-4 w-4" />{tr(`一次保存 ${stockBatchRows.length} 台`, `Save ${stockBatchRows.length} Units`, `Simpan ${stockBatchRows.length} Unit`)}</button>
              </div>
            </div>
          )}

          {showStockForm && canManage && (
            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{tr('编辑库存详情', 'Edit Stock Details', 'Edit Butiran Stok')}</h4>
                <button type="button" onClick={() => setShowStockForm(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>{tr('Vehicle Info 车型', 'Vehicle Info Model', 'Model Vehicle Info')}</span>
                  <ToggleOptionGroup value={stockCatalogId} options={vehicleCatalog.map((item) => ({ value: item.id, label: `${item.brand} · ${item.model}` }))} onChange={setStockCatalogId} ariaLabel="Vehicle model" className="finance-select-field w-full" disabled />
                </label>
                <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>{tr('车牌（必填）', 'Number Plate (Required)', 'Nombor Plat (Wajib)')}</span><input value={stockDraft.number_plate} onChange={(event) => setStockDraft((current) => ({ ...current, number_plate: event.target.value }))} placeholder="VEE4989" className="w-full rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs font-bold uppercase text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                <MoneyInput label={tr('采购成本（必填）', 'Purchase Cost (Required)', 'Kos Belian (Wajib)')} value={stockDraft.purchase_cost} onChange={(value) => setStockDraft((current) => ({ ...current, purchase_cost: value }))} />
              </div>
              {showOptionalInputs && (
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>{tr('车架号', 'Chassis Number', 'Nombor Casis')}</span><input value={stockDraft.chassis_number} onChange={(event) => setStockDraft((current) => ({ ...current, chassis_number: event.target.value }))} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>{tr('引擎号', 'Engine Number', 'Nombor Enjin')}</span><input value={stockDraft.engine_number} onChange={(event) => setStockDraft((current) => ({ ...current, engine_number: event.target.value }))} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>{tr('供应商', 'Supplier', 'Pembekal')}</span><input value={stockDraft.supplier} onChange={(event) => setStockDraft((current) => ({ ...current, supplier: event.target.value }))} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <label className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>{tr('修改入库日期', 'Edit Received Date', 'Edit Tarikh Diterima')}</span><input type="date" value={stockDraft.received_at} onChange={(event) => setStockDraft((current) => ({ ...current, received_at: event.target.value }))} className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <div className="space-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>{tr('库存状态', 'Stock Status', 'Status Stok')}</span><span className="block rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold normal-case text-slate-700 ring-1 ring-slate-100">{stockDraft.status}</span></div>
                  <MoneyInput label={tr('运输成本', 'Transport', 'Pengangkutan')} value={stockDraft.transport_cost} onChange={(value) => setStockDraft((current) => ({ ...current, transport_cost: value }))} />
                  <MoneyInput label={tr('注册/JPJ', 'Registration / JPJ', 'Pendaftaran / JPJ')} value={stockDraft.registration_cost} onChange={(value) => setStockDraft((current) => ({ ...current, registration_cost: value }))} />
                  <MoneyInput label={tr('Free Gift / 配件', 'Free Gift / Accessories', 'Hadiah Percuma / Aksesori')} value={stockDraft.accessories_cost} onChange={(value) => setStockDraft((current) => ({ ...current, accessories_cost: value }))} />
                  <MoneyInput label={tr('维修/翻新', 'Repair / Refurbishment', 'Baiki / Pulih')} value={stockDraft.repair_cost} onChange={(value) => setStockDraft((current) => ({ ...current, repair_cost: value }))} />
                  <MoneyInput label={tr('其他直接成本', 'Other Direct Cost', 'Kos Langsung Lain')} value={stockDraft.other_direct_cost} onChange={(value) => setStockDraft((current) => ({ ...current, other_direct_cost: value }))} />
                </div>
              )}
              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tr('总车辆成本', 'Total Landed Cost', 'Jumlah Kos')}</span>
                <span className="font-mono text-sm font-bold text-slate-900">{formatMoney(getStockUnitCost(stockDraft))}</span>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" disabled={!stockCatalogId || stockDraft.purchase_cost <= 0 || !normalizeVehicleNumberPlate(stockDraft.number_plate)} onClick={saveStock} className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-500"><Save className="h-4 w-4" />{tr('保存库存', 'Save Stock', 'Simpan Stok')}</button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
            {!isBulkEditingStock && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <span>
                  <span className="block text-xs font-bold text-slate-900">{showAllStockModels ? tr('全部实体车辆', 'All Physical Units', 'Semua Unit Fizikal') : `${selectedStockCatalog?.model || '--'} · ${tr('实体车辆', 'Physical Units', 'Unit Fizikal')}`}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">{showAllStockModels ? tr('目前显示所有 Vehicle Info 车型。', 'Showing every Vehicle Info model.', 'Memaparkan semua model Vehicle Info.') : tr('表格只显示当前选择的车型，方便批量处理。', 'The table is limited to the selected model for easier bulk work.', 'Jadual dihadkan kepada model dipilih untuk kerja pukal yang lebih mudah.')}</span>
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{visibleStockRows.length} {tr('台', 'units', 'unit')}</span>
              </div>
            )}
            {isBulkEditingStock && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
                <span><span className="block text-xs font-bold text-slate-900">{tr('批量编辑模式', 'Bulk Edit Mode', 'Mod Edit Pukal')} · {showAllStockModels ? tr('全部车型', 'All Models', 'Semua Model') : selectedStockCatalog?.model}</span><span className="mt-0.5 block text-[11px] text-slate-500">{tr('车型与状态由 Vehicle Info／成交流程控制；这里只修改库存资料与成本。', 'Model and status stay controlled by Vehicle Info and the deal flow; edit stock details and cost here.', 'Model dan status dikawal oleh Vehicle Info dan aliran jualan; edit butiran stok dan kos di sini.')}</span></span>
                <span className="flex gap-2"><button type="button" onClick={() => { setIsBulkEditingStock(false); setStockBulkDrafts({}); }} className="rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-slate-500 ring-1 ring-slate-100">{tr('取消', 'Cancel', 'Batal')}</button><button type="button" onClick={saveBulkStockEdits} className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-3 py-2 text-[11px] font-bold text-white"><Save className="h-3.5 w-3.5" />{tr('保存全部修改', 'Save All Changes', 'Simpan Semua')}</button></span>
              </div>
            )}
            <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-left">
              <thead className="bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">{tr('Vehicle Info 车型', 'Vehicle Info Model', 'Model Vehicle Info')}</th><th className="px-5 py-3">{tr('车牌', 'Number Plate', 'Nombor Plat')}</th><th className="px-5 py-3">{tr('车架 / 引擎', 'Chassis / Engine', 'Casis / Enjin')}</th><th className="px-5 py-3">{tr('供应商', 'Supplier', 'Pembekal')}</th><th className="px-5 py-3">{tr('入库', 'Received', 'Diterima')}</th><th className="px-5 py-3">{tr('状态', 'Status', 'Status')}</th><th className="px-5 py-3 text-right">{tr('采购 / 实际成本', 'Purchase / Actual Cost', 'Kos Belian / Sebenar')}</th><th className="px-5 py-3 text-right">{tr('操作', 'Action', 'Tindakan')}</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStockRows.map(({ catalog, unit, cost }) => {
                  const rowKey = `${catalog.id}:${unit.id}`;
                  const draft = stockBulkDrafts[rowKey] || unit;
                  return (
                  <tr key={rowKey} className="text-xs text-slate-600 hover:bg-slate-50">
                    <td className="px-5 py-3"><span className="block font-bold text-slate-900">{catalog.model}</span><span className="text-[11px] text-slate-500">{catalog.brand}</span></td>
                    <td className="px-5 py-3 font-mono text-xs">{isBulkEditingStock ? <input value={draft.number_plate} onChange={(event) => updateBulkStockDraft(rowKey, { number_plate: event.target.value })} aria-label={`Edit Number Plate ${rowKey}`} placeholder="VEE4989" className="block w-full rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-bold uppercase text-slate-700 outline-none ring-1 ring-slate-100" /> : <><span className="block font-bold text-slate-900">{unit.number_plate || tr('旧资料未填写', 'Missing in legacy data', 'Tiada dalam data lama')}</span><span className="text-[10px] text-slate-500">{unit.id}</span></>}</td>
                    <td className="px-5 py-3 font-mono text-xs">{isBulkEditingStock ? <span className="space-y-1.5"><input value={draft.chassis_number} onChange={(event) => updateBulkStockDraft(rowKey, { chassis_number: event.target.value })} aria-label={`Edit chassis ${rowKey}`} placeholder={tr('车架号可选', 'Chassis optional', 'Casis pilihan')} className="block w-full rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none ring-1 ring-slate-100" /><input value={draft.engine_number} onChange={(event) => updateBulkStockDraft(rowKey, { engine_number: event.target.value })} aria-label={`Edit engine ${rowKey}`} placeholder={tr('引擎号可选', 'Engine optional', 'Enjin pilihan')} className="block w-full rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600 outline-none ring-1 ring-slate-100" /></span> : <><span className="block font-bold text-slate-700">{unit.chassis_number || tr('未填写车架号', 'No chassis', 'Tiada casis')}</span><span className="text-slate-500">{unit.engine_number || '--'}</span></>}</td>
                    <td className="px-5 py-3">{isBulkEditingStock ? <input value={draft.supplier} onChange={(event) => updateBulkStockDraft(rowKey, { supplier: event.target.value })} aria-label={`Edit supplier ${rowKey}`} className="w-full rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /> : unit.supplier || '--'}</td>
                    <td className="px-5 py-3">{isBulkEditingStock ? <input type="date" value={draft.received_at} onChange={(event) => updateBulkStockDraft(rowKey, { received_at: event.target.value })} aria-label={`Edit received date ${rowKey}`} className="w-full rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /> : unit.received_at || '--'}</td>
                    <td className="px-5 py-3"><span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${unit.status === 'Sold' ? 'bg-emerald-50 text-emerald-700' : unit.status === 'Reserved' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{unit.status}</span></td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">{isBulkEditingStock ? <span className="block"><input type="number" min="0" step="0.01" value={draft.purchase_cost || ''} onChange={(event) => updateBulkStockDraft(rowKey, { purchase_cost: toMoney(event.target.value) })} aria-label={`Edit purchase cost ${rowKey}`} className="ml-auto block w-32 rounded-md bg-slate-50 px-2 py-1.5 text-right text-[11px] font-bold text-slate-700 outline-none ring-1 ring-slate-100" /><span className="mt-1 block text-[10px] text-slate-500">{tr('实际', 'Actual', 'Sebenar')} {formatMoney(getStockUnitCost(draft))}</span></span> : <><span className="block">{formatMoney(unit.purchase_cost)}</span><span className="mt-0.5 block text-[10px] text-slate-500">{tr('实际', 'Actual', 'Sebenar')} {formatMoney(cost)}</span></>}</td>
                    <td className="px-5 py-3 text-right">{canManage && !isBulkEditingStock && <button type="button" onClick={() => editStock(catalog, unit)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-white hover:text-red-700 hover:ring-1 hover:ring-red-100"><Pencil className="h-3.5 w-3.5" />{tr('详细编辑', 'Details', 'Butiran')}</button>}</td>
                  </tr>
                );})}
                {visibleStockRows.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-xs font-semibold text-slate-500">{tr('还没有库存车辆。', 'No stock unit yet.', 'Belum ada unit stok.')}</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
