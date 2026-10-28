/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeDollarSign, Boxes, CheckCircle2, ChevronDown, ExternalLink, Eye, EyeOff, Pencil, Plus, ReceiptText, RefreshCw, Save, WalletCards, X } from 'lucide-react';
import { DealCommissionStatus, DealFinance, DealSaleStatus, LoanApplication, LoanStatus, QuickStockInput, VehicleCatalogItem, VehicleStockUnit } from '../types';
import { tr } from '../lib/i18n';
import MoneyInput from './MoneyInput';
import { fieldLabel, fieldLabelWith, OPTIONAL, REQUIRED } from '../data/fieldLabels';
import { getRecognizedDealStockCost } from '../utils/dealFinance';
import { getVehicleStockReference, normalizeVehicleNumberPlate } from '../utils/vehicleStock';
import ToggleOptionGroup from './ToggleOptionGroup';
import { useBrandedDialog } from './BrandedDialogProvider';
import { newId } from '../utils/id';
import { getDealProfit } from '../utils/dealProfit';

interface FinanceCenterProps {
  /**
   * Owner 2026-10-18: the reports (P&L, commission) and the physical stock live on
   * two pages. 'reports' is the Finance Center page; 'stock' is the In stock tab of
   * the Stock page. Default 'reports'.
   */
  view?: 'reports' | 'stock';
  /** Ledger sync status (owner 2026-10-18: bo is the record, the ledger follows); Operations leads only. */
  ledgerPanel?: React.ReactNode;
  applications: LoanApplication[];
  vehicleCatalog: VehicleCatalogItem[];
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
  /** Super Admin: send customers, stock and delivered deals to the ledger again. */
  onSyncLedger?: () => Promise<void>;
}

type FinanceTab = 'deals' | 'stock' | 'commission' | 'ledger';
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
    <span className={`inline-flex items-center gap-1.5 rounded-chip px-2 py-1 text-caption font-semibold ring-1 ${tone.badge} ${className}`}>
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
  key: newId('STOCK-DRAFT'),
  unit: { ...createEmptyStockUnit(staffName), purchase_cost: purchaseCost }
});

const buildDealFinance = (
  application: LoanApplication,
  vehicleCatalog: VehicleCatalogItem[],
  staffName: string
): DealFinance => {
  const previous = application.deal_finance;
  const listedPrice = previous
    ? toMoney(previous.listed_selling_price)
    : toMoney(application.vehicle_options?.[0]?.motor_selling_price);

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
    ...(previous?.customer_deposit_date ? { customer_deposit_date: previous.customer_deposit_date } : {}),
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
    // A new deal follows the commission tiers unless someone types an amount.
    ...(previous?.commission_source ? { commission_source: previous.commission_source } : {}),
    commission_percent: previous?.commission_percent,
    commission_amount: toMoney(previous?.commission_amount),
    commission_paid_at: previous?.commission_paid_at || '',
    updated_at: previous?.updated_at || '',
    updated_by: previous?.updated_by || staffName
  };
};


function StatCard({ label, value, tone = 'neutral', note }: { label: string; value: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'; note?: string }) {
  const toneClass = {
    neutral: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    brand: 'bg-brand-50 text-brand-ink'
  }[tone];

  return (
    <div className="rounded-card bg-white p-4 ring-1 ring-slate-100">
      <span className={`inline-flex rounded-chip px-1.5 py-0.5 text-micro uppercase ${toneClass}`}>{label}</span>
      <p className="mt-3 font-mono text-title-3 text-slate-900">{value}</p>
      {note && <p className="mt-1 text-caption text-slate-500">{note}</p>}
    </div>
  );
}

export default function FinanceCenter({
  view = 'reports',
  ledgerPanel,
  applications,
  vehicleCatalog,
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
  commissionPanel,
  onSyncLedger
}: FinanceCenterProps) {
  const { showConfirm } = useBrandedDialog();
  const [syncingLedger, setSyncingLedger] = useState(false);
  const [activeTab, setActiveTab] = useState<FinanceTab>(view === 'stock' ? 'stock' : 'deals');
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
  // The deal's stock unit registration cost decides whether the JPJ step fee is a separate cost (getDealJpjCost).
  const stockRegistrationCostOf = (finance: DealFinance) => (
    finance.stock_unit_id ? toMoney(stockById.get(finance.stock_unit_id)?.unit.registration_cost) : 0
  );
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
    const profit = getDealProfit(application, finance, stockCost, stockRegistrationCostOf(finance));
    const receipts = getDealReceipts(finance);
    return {
      salesValue: totals.salesValue + profit.salesValue,
      receipts: totals.receipts + receipts,
      cost: totals.cost + profit.cost,
      grossProfit: totals.grossProfit + profit.grossProfit,
      commission: totals.commission + profit.commission,
      netProfit: totals.netProfit + profit.netProfit
    };
  }, { salesValue: 0, receipts: 0, cost: 0, grossProfit: 0, commission: 0, netProfit: 0 });

  const openDealEditor = (application: LoanApplication) => {
    const isOpen = expandedApplicationId === application.id;
    setExpandedApplicationId(isOpen ? '' : application.id);
    setDealDraft(isOpen ? null : buildDealFinance(application, vehicleCatalog, currentStaffName));
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
    const current = buildDealFinance(application, vehicleCatalog, currentStaffName);
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
    <div id={view === 'stock' ? 'stock-inventory' : 'finance-center-page'} className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {view === 'reports' && (
          <div>
            <h2 className="text-title-2 text-slate-900">{tr('财务报表', 'Financial Reports', 'Laporan Kewangan')}</h2>
            <p className="mt-1 text-footnote text-slate-500">{tr('查看成交利润与佣金总账。库存在「库存」页面，结算在「结算」页面或首页完成。', 'Review deal P&L and the commission ledger. Stock is on the Stock page; settle deals on the Settlement page or Home.', 'Semak P&L jualan dan lejar komisen. Stok di halaman Stok; selesaikan jualan di halaman Penyelesaian atau Laman Utama.')}</p>
          </div>
        )}
        {view === 'reports' && onSyncLedger && (
          <button
            type="button"
            data-testid="finance-ledger-sync"
            disabled={syncingLedger}
            onClick={async () => {
              setSyncingLedger(true);
              try {
                await onSyncLedger();
              } finally {
                setSyncingLedger(false);
              }
            }}
            className="inline-flex items-center gap-2 self-start rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-600 ring-1 ring-slate-100 transition-colors hover:text-brand-ink hover:ring-brand-100 disabled:cursor-wait disabled:opacity-60 md:self-auto"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${syncingLedger ? 'animate-spin' : ''}`} />
            {syncingLedger ? tr('同步中…', 'Syncing…', 'Menyegerak…') : tr('全部同步到 ledger', 'Sync all to ledger', 'Segerak semua ke ledger')}
          </button>
        )}
        {activeTab !== 'commission' && activeTab !== 'ledger' && (
          <div className="flex flex-wrap items-center gap-2">
            {view === 'reports' && <input
              type="month"
              value={reportMonth}
              onChange={(event) => setReportMonth(event.target.value)}
              className="rounded-control bg-white px-3 py-2 text-footnote font-bold text-slate-700 ring-1 ring-slate-100 outline-none focus:ring-brand-100"
            />}
            {showOptionalInputs && (
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={tr('搜索客户、车型或车架号', 'Search customer, model, or chassis', 'Cari pelanggan, model atau casis')}
                className="min-w-[240px] rounded-control bg-white px-3 py-2 text-footnote text-slate-700 ring-1 ring-slate-100 outline-none focus:ring-brand-100"
              />
            )}
            <button
              type="button"
              aria-pressed={showOptionalInputs}
              onClick={() => setShowOptionalInputs((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-control px-3 py-2 text-footnote font-bold ring-1 transition-colors ${showOptionalInputs ? 'bg-slate-800 text-white ring-slate-800' : 'bg-white text-slate-600 ring-slate-100 hover:text-brand-ink hover:ring-brand-100'}`}
            >
              {showOptionalInputs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showOptionalInputs
                ? tr('隐藏可选栏位', 'Hide Optional Fields', 'Sembunyikan Medan Pilihan')
                : tr('显示可选栏位', 'Show Optional Fields', 'Tunjukkan Medan Pilihan')}
            </button>
          </div>
        )}
      </section>

      {view === 'reports' && <section
        role="tablist"
        aria-label={tr('财务报表分页', 'Financial Reports sections', 'Bahagian Laporan Kewangan')}
        className="grid grid-flow-col auto-cols-[minmax(max-content,1fr)] gap-1 overflow-x-auto rounded-card bg-white p-1 ring-1 ring-slate-100"
      >
        {([
          ['deals', tr('成交与利润', 'Deals & P&L', 'Jualan & P&L'), <CheckCircle2 key="deals" aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />],
          ...(commissionPanel
            ? ([['commission', tr('佣金总账', 'Commission Ledger', 'Lejar Komisen'), <ReceiptText key="commission" className="h-5 w-5" />]] as Array<[FinanceTab, string, React.ReactNode]>)
            : []),
          ...(ledgerPanel
            ? ([['ledger', tr('Ledger 同步', 'Ledger sync', 'Segerak ledger'), <RefreshCw key="ledger" aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />]] as Array<[FinanceTab, string, React.ReactNode]>)
            : [])
        ] as Array<[FinanceTab, string, React.ReactNode]>).map(([tab, label, icon]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 py-2 text-footnote font-bold transition-colors ${activeTab === tab ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            {icon}{label}
          </button>
        ))}
      </section>}

      {activeTab === 'deals' && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={tr('成交', 'Delivered', 'Diserah')} value={String(monthDeals.length)} tone="brand" note={reportMonth} />
          <StatCard label={tr('销售额', 'Sales Value', 'Nilai Jualan')} value={formatMoney(monthTotals.salesValue)} tone="success" />
          <StatCard label={tr('未收款', 'Outstanding', 'Belum Terima')} value={formatMoney(Math.max(monthTotals.salesValue - monthTotals.receipts, 0))} tone="warning" />
          <StatCard label={tr('净贡献', 'Net Contribution', 'Sumbangan Bersih')} value={formatMoney(monthTotals.netProfit)} tone={monthTotals.netProfit >= 0 ? 'success' : 'danger'} />
        </section>
      )}

      {activeTab === 'deals' ? (
        <section className="overflow-hidden rounded-card bg-white ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-headline text-slate-900">{tr('成交与利润', 'Deals & P&L', 'Jualan & P&L')}</h3>
            <p className="mt-1 text-footnote text-slate-500">{tr('结算操作在「结算」页面或首页；这里查看交车后的月度利润。', 'Settle deals on the Settlement page or Home; review monthly delivered profit here.', 'Selesaikan jualan di halaman Penyelesaian atau Laman Utama; semak keuntungan bulanan selepas serahan di sini.')}</p>
          </div>
          <div className="px-5 py-4">
            <h4 className="text-footnote font-bold text-slate-900">{tr('本月成交利润 (P&L)', "This Month's Delivered P&L", 'P&L Serahan Bulan Ini')}</h4>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-footnote">
                <thead className="text-micro uppercase text-slate-500">
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
                    const { salesValue, cost, extraCosts, feesInPrice, grossProfit, commission } = getDealProfit(application, finance, stockCost, stockRegistrationCostOf(finance));
                    return (
                      <tr key={application.id} data-testid={`pnl-row-${application.id}`} className="text-slate-600">
                        <td className="py-2 pr-3"><span className="block font-bold text-slate-900">{application.applicant_name}</span><span className="block text-micro tracking-normal text-slate-500">{application.vehicle_model} · {application.handler_name}</span></td>
                        <td className="py-2 px-3 text-right font-mono" title={feesInPrice > 0 ? tr(`车价内含 AGM、路税 + 保险费 ${formatMoney(feesInPrice)}`, `Price includes AGM, roadtax & insurance fees of ${formatMoney(feesInPrice)}`, `Harga termasuk yuran AGM, cukai jalan & insurans ${formatMoney(feesInPrice)}`) : undefined}>{formatMoney(salesValue)}</td>
                        <td className="py-2 px-3 text-right font-mono" title={extraCosts > 0 ? tr(`车成本 ${formatMoney(stockCost)} + 保险、赠品、运车费、AGM 支出、JPJ ${formatMoney(extraCosts)}`, `Bike ${formatMoney(stockCost)} + insurance, gift, delivery, AGM paid, JPJ ${formatMoney(extraCosts)}`, `Motor ${formatMoney(stockCost)} + insurans, hadiah, penghantaran, AGM dibayar, JPJ ${formatMoney(extraCosts)}`) : undefined}>{formatMoney(cost)}</td>
                        <td className={`py-2 px-3 text-right font-mono ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMoney(grossProfit)}</td>
                        <td className="py-2 px-3 text-right font-mono"><span className={`rounded px-1 py-0.5 text-micro tracking-normal ${getCommissionTone(finance.commission_status)}`}>{finance.commission_status}</span> {formatMoney(commission)}</td>
                        <td className={`py-2 pl-3 text-right font-mono font-bold ${grossProfit - commission >= 0 ? 'text-brand-ink' : 'text-rose-600'}`}>{formatMoney(grossProfit - commission)}</td>
                      </tr>
                    );
                  })}
                  {monthDeals.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">{tr('本月还没有成交。', 'No delivered deals this month.', 'Tiada serahan bulan ini.')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      ) : activeTab === 'commission' && commissionPanel ? (
        <section className="space-y-4">
          {commissionPanel}
        </section>
      ) : activeTab === 'ledger' && ledgerPanel ? (
        ledgerPanel
      ) : (
        <section className="space-y-4">
          <div className="rounded-card bg-white p-5 ring-1 ring-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-headline text-slate-900">{tr('实体库存工作台', 'Physical Stock Workspace', 'Ruang Kerja Stok Fizikal')}</h3>
                  <span className="rounded-chip bg-emerald-50 px-2 py-1 text-micro tracking-normal text-emerald-700">{tr('车型仅供分类', 'Model grouping only', 'Model untuk kumpulan sahaja')}</span>
                </div>
                <p className="mt-1 text-footnote text-slate-500">{tr('先选车型，再批量新增或编辑实体车辆；未售出成本保留在 Inventory Value。', 'Select a model first, then bulk add or edit physical units; unsold cost stays in Inventory Value.', 'Pilih model dahulu, kemudian tambah atau edit unit fizikal secara pukal; kos belum dijual kekal dalam Nilai Inventori.')}</p>
              </div>
              {canOpenVehicleInfo && <button type="button" onClick={onOpenVehicleInfo} className="inline-flex items-center gap-1.5 rounded-control bg-slate-50 px-3 py-2 text-caption font-semibold text-slate-600 ring-1 ring-slate-100 hover:text-brand-ink"><ExternalLink className="h-3.5 w-3.5" />{tr('打开 Vehicle Info', 'Open Vehicle Info', 'Buka Vehicle Info')}</button>}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.5fr)] xl:items-end">
              <label className="space-y-1.5 text-micro uppercase text-slate-500">
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
                    [tr('库存价值', 'Inventory Value', 'Nilai Inventori'), formatMoney(selectedInventoryValue), 'text-brand-ink']
                  ] as Array<[string, string, string]>).map(([label, value, tone]) => (
                    <span key={label} className="rounded-control bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                      <span className="block text-micro uppercase text-slate-500">{label}</span>
                      <span className={`mt-1 block font-mono text-footnote font-bold ${tone}`}>{value}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-control bg-amber-50 px-4 py-3 text-footnote text-amber-700">{tr('Vehicle Info 还没有车型，请先新增车型。', 'No Vehicle Info model yet. Add a model first.', 'Belum ada model Vehicle Info. Tambah model dahulu.')}</div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button type="button" aria-pressed={showAllStockModels} onClick={() => { setShowAllStockModels((current) => !current); setIsBulkEditingStock(false); setStockBulkDrafts({}); }} className={`rounded-control px-3 py-2 text-caption font-semibold ring-1 ${showAllStockModels ? 'bg-slate-800 text-white ring-slate-800' : 'bg-white text-slate-500 ring-slate-100 hover:text-brand-ink'}`}>
                {showAllStockModels ? tr('只看当前车型', 'Show Selected Model', 'Tunjuk Model Dipilih') : tr('查看全部车型', 'Show All Models', 'Tunjuk Semua Model')}
              </button>
              {canManage && (
                <div className="flex flex-wrap gap-2">
                  {!isBulkEditingStock && visibleStockRows.length > 0 && <button type="button" onClick={startBulkStockEdit} className="inline-flex items-center gap-2 rounded-control bg-white px-4 py-2 text-footnote font-bold text-slate-600 ring-1 ring-slate-100 hover:text-brand-ink"><Pencil className="h-4 w-4" />{showAllStockModels ? tr('批量编辑全部', 'Bulk Edit All', 'Edit Semua Secara Pukal') : tr('批量编辑这个车型', 'Bulk Edit This Model', 'Edit Pukal Model Ini')}</button>}
                  <button type="button" disabled={!selectedStockCatalog} onClick={() => { if (selectedStockCatalog) openQuickStockFor(selectedStockCatalog); }} className="inline-flex items-center gap-2 rounded-control bg-emerald-700 px-4 py-2 text-footnote font-bold text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500"><Plus className="h-4 w-4" />{tr('快速补库存', 'Quick Add Stock', 'Tambah Stok Pantas')}</button>
                  <button type="button" disabled={!selectedStockCatalog} onClick={startNewStock} className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-500"><Plus className="h-4 w-4" />{tr('批量新增实体车辆', 'Add Physical Units', 'Tambah Unit Fizikal')}</button>
                </div>
              )}
            </div>
          </div>

          {quickStockOpen && canManage && (() => {
            const quickCatalog = vehicleCatalog.find((item) => item.id === quickStock.catalogId);
            if (!quickCatalog) return null;
            const totalCost = quickStock.purchaseCost + quickStock.transportCost + quickStock.repairCost + quickStock.freeGiftCost;
            return (
              <div className="rounded-card bg-white p-5 ring-1 ring-emerald-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-headline text-slate-900">{tr('快速补库存', 'Quick Add Stock', 'Tambah Stok Pantas')}</h4>
                    <p className="mt-1 text-caption text-slate-500">{tr('这里只新增实体库存和实际成本，不读取或修改 Vehicle Info 价格。客户成交金额请从首页的 Add Stock 处理。', 'This adds only the physical unit and actual costs; it neither reads nor changes Vehicle Info pricing. Enter customer deal amounts from Add Stock on Home.', 'Ini hanya menambah unit fizikal dan kos sebenar; harga Vehicle Info tidak dibaca atau diubah. Masukkan jumlah urus niaga pelanggan melalui Add Stock di Laman Utama.')}</p>
                  </div>
                  <span className="rounded-chip bg-emerald-50 px-2.5 py-1 text-footnote font-bold text-emerald-700">{quickCatalog.brand} · {quickCatalog.model}</span>
                </div>
                <div className="mt-4">
                  <section className="rounded-card bg-rose-50/70 p-4 ring-1 ring-rose-100">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-chip bg-rose-600 font-mono text-headline text-white">−</span>
                      <span className="text-micro uppercase text-rose-700">{tr('车辆成本 / 支出', 'Vehicle Costs / Outgoing Amounts', 'Kos Kenderaan / Jumlah Keluar')}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MoneyInput label={`− ${fieldLabelWith('purchaseCost', REQUIRED)}`} value={quickStock.purchaseCost} onChange={(value) => setQuickStock((current) => ({ ...current, purchaseCost: value }))} />
                      <MoneyInput label={`− ${fieldLabel('transportCost')}`} value={quickStock.transportCost} onChange={(value) => setQuickStock((current) => ({ ...current, transportCost: value }))} />
                      <MoneyInput label={`− ${fieldLabel('repairCost')}`} value={quickStock.repairCost} onChange={(value) => setQuickStock((current) => ({ ...current, repairCost: value }))} />
                      <MoneyInput label={`− ${fieldLabel('accessoriesCost')}`} value={quickStock.freeGiftCost} onChange={(value) => setQuickStock((current) => ({ ...current, freeGiftCost: value }))} />
                    </div>
                  </section>
                </div>
                <label className="mt-3 block space-y-1.5 text-micro uppercase text-slate-500">
                  <span className="block">{tr('车辆基本资料', 'Vehicle details', 'Butiran kenderaan') + ' · ' + fieldLabelWith('plateNumber', REQUIRED)}</span>
                  <input value={quickStock.numberPlate} onChange={(event) => setQuickStock((current) => ({ ...current, numberPlate: event.target.value }))} placeholder="VEE4989" className="h-10 w-full rounded-control bg-slate-50 px-3 font-mono text-footnote uppercase text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-emerald-100" />
                </label>
                <div className="mt-4 rounded-card bg-slate-50 p-3">
                  <span className="rounded-control bg-white px-3 py-2 ring-1 ring-slate-100">
                    <span className="block text-micro uppercase text-slate-500">{tr('总入库成本', 'Total Landed Cost', 'Jumlah Kos Masuk')}</span>
                    <span className="mt-1 block font-mono text-headline text-rose-700">{formatMoney(totalCost)}</span>
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setQuickStockOpen(false)} className="rounded-control bg-white px-4 py-2 text-footnote font-bold text-slate-500 ring-1 ring-slate-100 hover:text-brand-ink">{tr('取消', 'Cancel', 'Batal')}</button>
                  <button type="button" disabled={quickStock.purchaseCost <= 0 || !normalizeVehicleNumberPlate(quickStock.numberPlate)} onClick={saveQuickStock} className="inline-flex items-center gap-2 rounded-control bg-emerald-700 px-4 py-2 text-footnote font-bold text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500"><Save className="h-4 w-4" />{tr('保存并补库存', 'Save & Add Stock', 'Simpan & Tambah Stok')}</button>
                </div>
              </div>
            );
          })()}

          {showStockBatchForm && canManage && (
            <div className="rounded-card bg-white p-5 ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-headline text-slate-900">{tr('批量新增实体库存', 'Add Physical Stock Units', 'Tambah Unit Stok Fizikal')}</h4>
                  <p className="mt-1 text-caption text-slate-500">{tr('1 选择车型 · 2 输入数量与成本 · 3 一次保存', '1 Choose model · 2 Enter quantity and cost · 3 Save once', '1 Pilih model · 2 Masukkan kuantiti dan kos · 3 Simpan sekali')}</p>
                </div>
                <button type="button" onClick={() => setShowStockBatchForm(false)} aria-label="Close stock batch form" className="rounded-control p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                <label className="space-y-1 text-micro uppercase text-slate-500">
                  <span>{tr('Vehicle Info 车型（必填）', 'Vehicle Info Model (Required)', 'Model Vehicle Info (Wajib)')}</span>
                  <ToggleOptionGroup value={stockCatalogId} options={vehicleCatalog.map((item) => ({ value: item.id, label: `${item.brand} · ${item.model}` }))} onChange={changeStockBatchCatalog} ariaLabel="Vehicle Info stock model" className="finance-select-field w-full" />
                </label>
                <label className="space-y-1 text-micro uppercase text-slate-500">
                  <span>{tr('新增数量', 'Quantity', 'Kuantiti')}</span>
                  <input type="number" min="1" max="20" value={stockBatchQuantity} onChange={(event) => resizeStockBatch(Number(event.target.value))} aria-label="Stock batch quantity" className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote font-bold text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-brand-100" />
                </label>
              </div>

              {selectedStockCatalog && (
                <div className="finance-vehicle-summary mt-4 rounded-control p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="block text-footnote font-bold text-slate-900">{selectedStockCatalog.model}</span>
                      <span className="mt-0.5 block text-caption text-slate-500">{selectedStockCatalog.brand} · {selectedStockCatalog.body_type}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="finance-vehicle-summary__badge rounded-chip px-1.5 py-0.5 text-micro tracking-normal">{tr('只使用车型资料', 'Model reference only', 'Rujukan model sahaja')}</span>
                      {canOpenVehicleInfo && <button type="button" onClick={onOpenVehicleInfo} className="finance-vehicle-summary__link inline-flex items-center gap-1 rounded-chip px-2 py-1 text-micro tracking-normal text-emerald-700">{tr('打开 Vehicle Info', 'Open Vehicle Info', 'Buka Vehicle Info')}<ExternalLink className="h-3 w-3" /></button>}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {([
                      [tr('目前库存', 'Current Units', 'Unit Semasa'), selectedStockCatalog.stock_units?.length || 0, true]
                    ] as Array<[string, number, boolean]>).map(([label, amount, isCount]) => (
                      <span key={label} className="finance-vehicle-summary__metric rounded-chip px-2 py-1.5"><span className="block text-micro uppercase text-slate-500">{label}</span><span className="mt-0.5 block font-mono text-caption font-semibold text-slate-700">{isCount ? amount : amount > 0 ? formatMoney(amount) : '--'}</span></span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 overflow-x-auto rounded-control ring-1 ring-slate-100">
                <table className={`w-full text-left ${showOptionalInputs ? 'min-w-[1160px]' : 'min-w-[680px]'}`}>
                  <thead className="bg-slate-100 text-micro uppercase text-slate-500"><tr><th className="w-12 px-3 py-2.5">#</th><th className="px-3 py-2.5">{fieldLabelWith('plateNumber', REQUIRED)}</th>{showOptionalInputs && <><th className="px-3 py-2.5">{fieldLabel('chassisNumber')}</th><th className="px-3 py-2.5">{fieldLabel('engineNumber')}</th><th className="px-3 py-2.5">{tr('供应商', 'Supplier', 'Pembekal')}</th><th className="px-3 py-2.5">{tr('入库日期', 'Received', 'Diterima')}</th></>}<th className="w-56 px-3 py-2.5">{fieldLabelWith('purchaseCost', REQUIRED)}</th><th className="px-3 py-2.5 text-right">{tr('总成本', 'Total Cost', 'Jumlah Kos')}</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockBatchRows.map((row, index) => (
                      <tr key={row.key} className="text-footnote text-slate-600">
                        <td className="px-3 py-2 font-mono font-bold text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2"><input value={row.unit.number_plate} onChange={(event) => updateStockBatchRow(row.key, { number_plate: event.target.value })} aria-label={`Number Plate row ${index + 1}`} placeholder="VEE4989" className="w-full rounded-control bg-slate-50 px-3 py-2 font-mono text-footnote font-bold uppercase text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-brand-100" /></td>
                        {showOptionalInputs && <><td className="px-3 py-2"><input value={row.unit.chassis_number} onChange={(event) => updateStockBatchRow(row.key, { chassis_number: event.target.value })} aria-label={`Chassis number row ${index + 1}`} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-brand-100" /></td><td className="px-3 py-2"><input value={row.unit.engine_number} onChange={(event) => updateStockBatchRow(row.key, { engine_number: event.target.value })} aria-label={`Engine number row ${index + 1}`} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-brand-100" /></td><td className="px-3 py-2"><input value={row.unit.supplier} onChange={(event) => updateStockBatchRow(row.key, { supplier: event.target.value })} aria-label={`Supplier row ${index + 1}`} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-brand-100" /></td><td className="px-3 py-2"><input type="date" value={row.unit.received_at} onChange={(event) => updateStockBatchRow(row.key, { received_at: event.target.value })} aria-label={`Received date row ${index + 1}`} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100 focus:bg-white focus:ring-brand-100" /></td></>}
                        <td className="px-3 py-2"><span className="finance-money-field flex min-h-9 items-stretch overflow-hidden rounded-control border border-slate-200 bg-white"><span className="finance-money-field__prefix inline-flex items-center pl-3 font-mono text-caption text-slate-500">RM</span><input type="number" min="0" step="0.01" value={row.unit.purchase_cost || ''} onChange={(event) => updateStockBatchRow(row.key, { purchase_cost: toMoney(event.target.value) })} aria-label={`Purchase cost row ${index + 1}`} className="finance-money-field__input min-w-0 flex-1 bg-transparent px-3 py-2 text-right font-mono text-footnote font-bold text-slate-700 outline-none" /></span></td>
                        <td className="px-3 py-2 text-right font-mono text-footnote font-bold text-slate-900">{formatMoney(getStockUnitCost(row.unit))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-caption text-slate-500">{tr('每台车必须填写唯一的车牌；底盘号可以留空。', 'Every unit needs a unique plate number; the chassis number can stay blank.', 'Setiap unit memerlukan No. plat yang unik; nombor casis boleh dibiarkan kosong.')}</span>
                <button type="button" disabled={!stockCatalogId || stockBatchRows.some(({ unit }) => unit.purchase_cost <= 0 || !normalizeVehicleNumberPlate(unit.number_plate))} onClick={saveStockBatch} className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-500"><Save className="h-4 w-4" />{tr(`一次保存 ${stockBatchRows.length} 台`, `Save ${stockBatchRows.length} Units`, `Simpan ${stockBatchRows.length} Unit`)}</button>
              </div>
            </div>
          )}

          {showStockForm && canManage && (
            <div className="rounded-card bg-white p-5 ring-1 ring-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-footnote font-bold text-slate-900">{tr('编辑库存详情', 'Edit Stock Details', 'Edit Butiran Stok')}</h4>
                <button type="button" onClick={() => setShowStockForm(false)} className="rounded-control p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-1 text-micro uppercase text-slate-500">
                  <span>{tr('Vehicle Info 车型', 'Vehicle Info Model', 'Model Vehicle Info')}</span>
                  <ToggleOptionGroup value={stockCatalogId} options={vehicleCatalog.map((item) => ({ value: item.id, label: `${item.brand} · ${item.model}` }))} onChange={setStockCatalogId} ariaLabel="Vehicle model" className="finance-select-field w-full" disabled />
                </label>
                <label className="space-y-1 text-micro uppercase text-slate-500"><span>{fieldLabelWith('plateNumber', REQUIRED)}</span><input value={stockDraft.number_plate} onChange={(event) => setStockDraft((current) => ({ ...current, number_plate: event.target.value }))} placeholder="VEE4989" className="w-full rounded-control bg-slate-50 px-3 py-2 font-mono text-footnote font-bold uppercase text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                <MoneyInput label={fieldLabelWith('purchaseCost', REQUIRED)} value={stockDraft.purchase_cost} onChange={(value) => setStockDraft((current) => ({ ...current, purchase_cost: value }))} />
              </div>
              {showOptionalInputs && (
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-1 text-micro uppercase text-slate-500"><span>{fieldLabel('chassisNumber')}</span><input value={stockDraft.chassis_number} onChange={(event) => setStockDraft((current) => ({ ...current, chassis_number: event.target.value }))} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <label className="space-y-1 text-micro uppercase text-slate-500"><span>{fieldLabel('engineNumber')}</span><input value={stockDraft.engine_number} onChange={(event) => setStockDraft((current) => ({ ...current, engine_number: event.target.value }))} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <label className="space-y-1 text-micro uppercase text-slate-500"><span>{tr('供应商', 'Supplier', 'Pembekal')}</span><input value={stockDraft.supplier} onChange={(event) => setStockDraft((current) => ({ ...current, supplier: event.target.value }))} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <label className="space-y-1 text-micro uppercase text-slate-500"><span>{tr('修改入库日期', 'Edit Received Date', 'Edit Tarikh Diterima')}</span><input type="date" value={stockDraft.received_at} onChange={(event) => setStockDraft((current) => ({ ...current, received_at: event.target.value }))} className="w-full rounded-control bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none ring-1 ring-slate-100" /></label>
                  <div className="space-y-1 text-micro uppercase text-slate-500"><span>{tr('库存状态', 'Stock Status', 'Status Stok')}</span><span className="block rounded-control bg-slate-50 px-3 py-2 text-footnote font-bold normal-case text-slate-700 ring-1 ring-slate-100">{stockDraft.status}</span></div>
                  <MoneyInput label={fieldLabel('transportCost')} value={stockDraft.transport_cost} onChange={(value) => setStockDraft((current) => ({ ...current, transport_cost: value }))} />
                  <MoneyInput label={fieldLabel('jpjFee')} value={stockDraft.registration_cost} onChange={(value) => setStockDraft((current) => ({ ...current, registration_cost: value }))} />
                  <MoneyInput label={tr('配件成本(赠品在 Check full loan 填)', 'Accessories cost (free gifts go in Check full loan)', 'Kos aksesori (hadiah percuma dalam Semak pinjaman penuh)')} value={stockDraft.accessories_cost} onChange={(value) => setStockDraft((current) => ({ ...current, accessories_cost: value }))} />
                  <MoneyInput label={fieldLabel('repairCost')} value={stockDraft.repair_cost} onChange={(value) => setStockDraft((current) => ({ ...current, repair_cost: value }))} />
                  <MoneyInput label={tr('其他直接成本', 'Other Direct Cost', 'Kos Langsung Lain')} value={stockDraft.other_direct_cost} onChange={(value) => setStockDraft((current) => ({ ...current, other_direct_cost: value }))} />
                </div>
              )}
              <div className="mt-4 flex items-center justify-between rounded-control bg-slate-50 px-4 py-3">
                <span className="text-micro uppercase text-slate-500">{tr('总车辆成本', 'Total Landed Cost', 'Jumlah Kos')}</span>
                <span className="font-mono text-headline text-slate-900">{formatMoney(getStockUnitCost(stockDraft))}</span>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" disabled={!stockCatalogId || stockDraft.purchase_cost <= 0 || !normalizeVehicleNumberPlate(stockDraft.number_plate)} onClick={saveStock} className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-500"><Save className="h-4 w-4" />{tr('保存库存', 'Save Stock', 'Simpan Stok')}</button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-card bg-white ring-1 ring-slate-100">
            {!isBulkEditingStock && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <span>
                  <span className="block text-footnote font-bold text-slate-900">{showAllStockModels ? tr('全部实体车辆', 'All Physical Units', 'Semua Unit Fizikal') : `${selectedStockCatalog?.model || '--'} · ${tr('实体车辆', 'Physical Units', 'Unit Fizikal')}`}</span>
                  <span className="mt-0.5 block text-caption text-slate-500">{showAllStockModels ? tr('目前显示所有 Vehicle Info 车型。', 'Showing every Vehicle Info model.', 'Memaparkan semua model Vehicle Info.') : tr('表格只显示当前选择的车型，方便批量处理。', 'The table is limited to the selected model for easier bulk work.', 'Jadual dihadkan kepada model dipilih untuk kerja pukal yang lebih mudah.')}</span>
                </span>
                <span className="rounded-chip bg-slate-100 px-2 py-1 text-caption font-semibold text-slate-600">{visibleStockRows.length} {tr('台', 'units', 'unit')}</span>
              </div>
            )}
            {isBulkEditingStock && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
                <span><span className="block text-footnote font-bold text-slate-900">{tr('批量编辑模式', 'Bulk Edit Mode', 'Mod Edit Pukal')} · {showAllStockModels ? tr('全部车型', 'All Models', 'Semua Model') : selectedStockCatalog?.model}</span><span className="mt-0.5 block text-caption text-slate-500">{tr('车型与状态由 Vehicle Info／成交流程控制；这里只修改库存资料与成本。', 'Model and status stay controlled by Vehicle Info and the deal flow; edit stock details and cost here.', 'Model dan status dikawal oleh Vehicle Info dan aliran jualan; edit butiran stok dan kos di sini.')}</span></span>
                <span className="flex gap-2"><button type="button" onClick={() => { setIsBulkEditingStock(false); setStockBulkDrafts({}); }} className="rounded-control bg-white px-3 py-2 text-caption font-semibold text-slate-500 ring-1 ring-slate-100">{tr('取消', 'Cancel', 'Batal')}</button><button type="button" onClick={saveBulkStockEdits} className="inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-2 text-caption font-semibold text-white"><Save className="h-3.5 w-3.5" />{tr('保存全部修改', 'Save All Changes', 'Simpan Semua')}</button></span>
              </div>
            )}
            <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-left">
              <thead className="bg-slate-100 text-micro uppercase text-slate-500"><tr><th className="px-5 py-3">{tr('Vehicle Info 车型', 'Vehicle Info Model', 'Model Vehicle Info')}</th><th className="px-5 py-3">{fieldLabel('plateNumber')}</th><th className="px-5 py-3">{`${fieldLabel('chassisNumber')} / ${fieldLabel('engineNumber')}`}</th><th className="px-5 py-3">{tr('供应商', 'Supplier', 'Pembekal')}</th><th className="px-5 py-3">{tr('入库', 'Received', 'Diterima')}</th><th className="px-5 py-3">{tr('状态', 'Status', 'Status')}</th><th className="px-5 py-3 text-right">{tr('采购 / 实际成本', 'Purchase / Actual Cost', 'Kos Belian / Sebenar')}</th><th className="px-5 py-3 text-right">{tr('操作', 'Action', 'Tindakan')}</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStockRows.map(({ catalog, unit, cost }) => {
                  const rowKey = `${catalog.id}:${unit.id}`;
                  const draft = stockBulkDrafts[rowKey] || unit;
                  return (
                  <tr key={rowKey} className="text-footnote text-slate-600 hover:bg-slate-50">
                    <td className="px-5 py-3"><span className="block font-bold text-slate-900">{catalog.model}</span><span className="text-caption text-slate-500">{catalog.brand}</span></td>
                    <td className="px-5 py-3 font-mono text-footnote">{isBulkEditingStock ? <input value={draft.number_plate} onChange={(event) => updateBulkStockDraft(rowKey, { number_plate: event.target.value })} aria-label={`Edit Number Plate ${rowKey}`} placeholder="VEE4989" className="block w-full rounded-chip bg-slate-50 px-2 py-1.5 text-micro uppercase text-slate-700 outline-none ring-1 ring-slate-100" /> : <><span className="block font-bold text-slate-900">{unit.number_plate || tr('旧资料未填写', 'Missing in legacy data', 'Tiada dalam data lama')}</span><span className="text-micro tracking-normal text-slate-500">{unit.id}</span></>}</td>
                    <td className="px-5 py-3 font-mono text-footnote">{isBulkEditingStock ? <span className="space-y-1.5"><input value={draft.chassis_number} onChange={(event) => updateBulkStockDraft(rowKey, { chassis_number: event.target.value })} aria-label={`Edit chassis ${rowKey}`} placeholder={fieldLabelWith('chassisNumber', OPTIONAL)} className="block w-full rounded-chip bg-slate-50 px-2 py-1.5 text-caption font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /><input value={draft.engine_number} onChange={(event) => updateBulkStockDraft(rowKey, { engine_number: event.target.value })} aria-label={`Edit engine ${rowKey}`} placeholder={fieldLabelWith('engineNumber', OPTIONAL)} className="block w-full rounded-chip bg-slate-50 px-2 py-1.5 text-caption text-slate-600 outline-none ring-1 ring-slate-100" /></span> : <><span className="block font-bold text-slate-700">{unit.chassis_number || tr('未填写底盘号', 'No chassis number', 'Tiada nombor casis')}</span><span className="text-slate-500">{unit.engine_number || '--'}</span></>}</td>
                    <td className="px-5 py-3">{isBulkEditingStock ? <input value={draft.supplier} onChange={(event) => updateBulkStockDraft(rowKey, { supplier: event.target.value })} aria-label={`Edit supplier ${rowKey}`} className="w-full rounded-chip bg-slate-50 px-2 py-1.5 text-caption text-slate-700 outline-none ring-1 ring-slate-100" /> : unit.supplier || '--'}</td>
                    <td className="px-5 py-3">{isBulkEditingStock ? <input type="date" value={draft.received_at} onChange={(event) => updateBulkStockDraft(rowKey, { received_at: event.target.value })} aria-label={`Edit received date ${rowKey}`} className="w-full rounded-chip bg-slate-50 px-2 py-1.5 text-caption text-slate-700 outline-none ring-1 ring-slate-100" /> : unit.received_at || '--'}</td>
                    <td className="px-5 py-3"><span className={`rounded-chip px-1.5 py-0.5 text-caption font-semibold ${unit.status === 'Sold' ? 'bg-emerald-50 text-emerald-700' : unit.status === 'Reserved' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{unit.status}</span></td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">{isBulkEditingStock ? <span className="block"><input type="number" min="0" step="0.01" value={draft.purchase_cost || ''} onChange={(event) => updateBulkStockDraft(rowKey, { purchase_cost: toMoney(event.target.value) })} aria-label={`Edit purchase cost ${rowKey}`} className="ml-auto block w-32 rounded-chip bg-slate-50 px-2 py-1.5 text-right text-caption font-semibold text-slate-700 outline-none ring-1 ring-slate-100" /><span className="mt-1 block text-micro tracking-normal text-slate-500">{tr('实际', 'Actual', 'Sebenar')} {formatMoney(getStockUnitCost(draft))}</span></span> : <><span className="block">{formatMoney(unit.purchase_cost)}</span><span className="mt-0.5 block text-micro tracking-normal text-slate-500">{tr('实际', 'Actual', 'Sebenar')} {formatMoney(cost)}</span></>}</td>
                    <td className="px-5 py-3 text-right">{canManage && !isBulkEditingStock && <button type="button" onClick={() => editStock(catalog, unit)} className="inline-flex items-center gap-1 rounded-control px-2.5 py-1.5 text-caption font-semibold text-slate-500 hover:bg-white hover:text-brand-ink hover:ring-1 hover:ring-brand-100"><Pencil className="h-3.5 w-3.5" />{tr('详细编辑', 'Details', 'Butiran')}</button>}</td>
                  </tr>
                );})}
                {visibleStockRows.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-footnote text-slate-500">{tr('还没有库存车辆。', 'No stock unit yet.', 'Belum ada unit stok.')}</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
