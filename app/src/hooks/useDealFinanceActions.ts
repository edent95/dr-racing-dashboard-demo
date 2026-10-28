/**
 * Stock and deal-settlement actions: physical stock units (Finance Center
 * and Task Inbox quick add), the deal finance save with its stock
 * reservation, and the Task Inbox delivery and commission-paid shortcuts.
 * Moved verbatim from App.tsx; every value the handlers used from App's
 * closure, including the Firestore call and its conflict error classes, is
 * now an explicit dependency under its original name.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { tr } from '../lib/i18n';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import {
  AuditLogEntry,
  CommissionRules,
  CommissionTierPlan,
  DealFinance,
  FinanceProfile,
  inferFinanceProfileFromVehicle,
  inferVehicleBrandFromModel,
  LoanApplication,
  QuickStockInput,
  RoleAccount,
  StockOrder,
  VehicleCatalogItem,
  VehicleStockUnit
} from '../types';
import { buildCommissionTierSource, buildTierCommissions, getTierCommissionUpdates, isTierCommission, normalizeCommissionTierPlans, type CommissionTierSource } from '../utils/commissionTiers';
import { newId } from '../utils/id';
import { replaceItemById } from '../utils/latestListPatch';
import { isOperationsLead } from '../utils/staffRoles';
import { getVehicleStockReference, normalizeVehicleNumberPlate } from '../utils/vehicleStock';
import type { StaffSession } from './useStaffSessionAuth';
import { getOpenDeliveryStepsBeforeDelivery } from '../../shared/deliveryChecklistSteps.mjs';
import { getChecklistDealFigures } from '../../shared/dealDelivery.mjs';
import { malaysiaDate } from '../../shared/malaysiaDate.mjs';
import { reconcileSettlementReceipts } from '../utils/deliveryChecklist';

/** A deposit date is a plain YYYY-MM-DD day; anything else is dropped. */
const isDepositDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export interface DealFinanceAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface DealFinanceActionsDeps {
  currentStaff: StaffSession;
  applications: LoanApplication[];
  applicationsRef: MutableRefObject<LoanApplication[]>;
  vehicleCatalog: VehicleCatalogItem[];
  /** Each handler's progressive commission bands (their plan, Roles & Accounts; owner 2026-10-24). */
  commissionTiers: CommissionTierSource;
  /** Staff accounts, for which plan each handler follows when the plans change. */
  roleAccounts: RoleAccount[];
  commissionRules: CommissionRules;
  setCommissionRules: (rules: CommissionRules) => void;
  setApplications: (list: LoanApplication[]) => void;
  setVehicleCatalog: (list: VehicleCatalogItem[]) => void;
  setSelectedApplication: Dispatch<SetStateAction<LoanApplication | null>>;
  writeLocalDashboardState: (values: { applications: LoanApplication[]; vehicleCatalog: VehicleCatalogItem[] }) => void;
  persistDashboardState: (overrides?: Partial<DashboardState>, options?: { immediate?: boolean }) => Promise<boolean>;
  updateVehicleCatalogState: (list: VehicleCatalogItem[]) => unknown;
  reloadDashboard: () => unknown;
  saveDealFinanceWithStockReservationToFirebase: typeof Repository.saveDealFinanceWithStockReservationToFirebase;
  listDeliveryPayments: typeof Repository.listDeliveryPayments;
  StockReservationConflictError: typeof Repository.StockReservationConflictError;
  CollectionItemVersionConflictError: typeof Repository.CollectionItemVersionConflictError;
  normalizeMoneyAmount: (value: unknown) => number;
  normalizeVehicleCatalogList: (list: VehicleCatalogItem[], profiles?: FinanceProfile[]) => VehicleCatalogItem[];
  preserveLoadedApplicationFileData: (application: LoanApplication, currentApplication?: LoanApplication) => LoanApplication;
  isFirebaseWriteOutcomeUnknown: (error: unknown) => boolean;
  appendAuditLog: (input: DealFinanceAuditInput) => void;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => AuditLogEntry['changes'];
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
  /** After a save that leaves the bike delivered: raise (or re-check) its ledger invoice. Best effort. */
  onBikeDelivered?: (applicationId: string) => void;
  /** After stock units are saved to the server: bring them into the ledger's stock. Best effort. */
  onStockSaved?: (stockUnitIds: string[]) => void;
  /** Admin delivery through server.mjs; absent without Firebase, where Admin delivers locally. */
  markBikeDeliveredThroughServer?: (application: LoanApplication, stockUnitId: string, sourcePage: string) => Promise<LoanApplication>;
}

export function useDealFinanceActions({
  currentStaff,
  applications,
  applicationsRef,
  vehicleCatalog,
  commissionTiers,
  roleAccounts,
  commissionRules,
  setCommissionRules,
  setApplications,
  setVehicleCatalog,
  setSelectedApplication,
  writeLocalDashboardState,
  persistDashboardState,
  updateVehicleCatalogState,
  reloadDashboard,
  saveDealFinanceWithStockReservationToFirebase,
  listDeliveryPayments,
  StockReservationConflictError,
  CollectionItemVersionConflictError,
  normalizeMoneyAmount,
  normalizeVehicleCatalogList,
  preserveLoadedApplicationFileData,
  isFirebaseWriteOutcomeUnknown,
  appendAuditLog,
  createAuditChanges,
  triggerToast,
  onBikeDelivered,
  onStockSaved,
  markBikeDeliveredThroughServer
}: DealFinanceActionsDeps) {
  const handleSaveVehicleStockUnits = (updates: Array<{ catalogId: string; unit: VehicleStockUnit }>) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以管理库存成本', 'Only the Operations Manager can manage stock costing', "Hanya Pengurus Operasi boleh mengurus kos stok"), 'error');
      return false;
    }

    if (updates.length === 0) {
      return false;
    }

    const normalizeUnitNumber = (value: string) => value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const now = new Date().toISOString();
    const catalogById = new Map<string, VehicleCatalogItem>(vehicleCatalog.map((item) => [item.id, item]));
    const existingRows: Array<{ catalogId: string; catalog: VehicleCatalogItem; unit: VehicleStockUnit }> = vehicleCatalog.flatMap((catalog) => (
      (catalog.stock_units || []).map((unit) => ({ catalogId: catalog.id, catalog, unit }))
    ));
    const existingById = new Map<string, { catalogId: string; catalog: VehicleCatalogItem; unit: VehicleStockUnit }>(existingRows.map((row) => [row.unit.id, row]));
    const updatedIds = new Set(updates.map(({ unit }) => unit.id).filter(Boolean));
    const usedNumberPlates = new Set(existingRows
      .filter(({ unit }) => !updatedIds.has(unit.id))
      .map(({ unit }) => normalizeVehicleNumberPlate(unit.number_plate))
      .filter(Boolean));
    const usedChassis = new Set(existingRows
      .filter(({ unit }) => !updatedIds.has(unit.id))
      .map(({ unit }) => normalizeUnitNumber(unit.chassis_number))
      .filter(Boolean));
    const usedEngines = new Set(existingRows
      .filter(({ unit }) => !updatedIds.has(unit.id))
      .map(({ unit }) => normalizeUnitNumber(unit.engine_number))
      .filter(Boolean));
    const seenUpdateIds = new Set<string>();
    const normalizedUpdates: Array<{ catalogId: string; catalog: VehicleCatalogItem; existing?: VehicleStockUnit; unit: VehicleStockUnit }> = [];

    for (const [index, { catalogId, unit: draft }] of updates.entries()) {
      const catalogItem = catalogById.get(catalogId);
      const existingRow = draft.id ? existingById.get(draft.id) : undefined;
      const existing = existingRow?.unit;
      const numberPlate = normalizeVehicleNumberPlate(draft.number_plate);
      const chassisNumber = draft.chassis_number.trim().toUpperCase().replace(/\s+/g, ' ');
      const engineNumber = draft.engine_number.trim().toUpperCase().replace(/\s+/g, ' ');
      const chassisKey = normalizeUnitNumber(chassisNumber);
      const engineKey = normalizeUnitNumber(engineNumber);
      const purchaseCost = normalizeMoneyAmount(draft.purchase_cost);

      if (!catalogItem || (existingRow && existingRow.catalogId !== catalogId)) {
        triggerToast(tr('请选择正确的 Vehicle Info 车型', 'Select the correct Vehicle Info model', 'Pilih model Vehicle Info yang betul'), 'error');
        return false;
      }
      if (draft.id && seenUpdateIds.has(draft.id)) {
        triggerToast(tr('同一台库存不能重复保存', 'The same stock unit cannot be saved twice', 'Unit stok yang sama tidak boleh disimpan dua kali'), 'error');
        return false;
      }
      if (!numberPlate) {
        triggerToast(tr('每台库存都必须填写 Number Plate', 'Every stock unit needs a Number Plate', 'Setiap unit stok memerlukan Nombor Plat'), 'error');
        return false;
      }
      if (usedNumberPlates.has(numberPlate)) {
        triggerToast(tr(`车牌 ${numberPlate} 已经存在`, `Number Plate ${numberPlate} already exists`, `Nombor Plat ${numberPlate} sudah wujud`), 'error');
        return false;
      }
      if (purchaseCost <= 0) {
        triggerToast(tr('每台库存都必须填写采购成本', 'Every stock unit needs a purchase cost', 'Setiap unit stok memerlukan kos belian'), 'error');
        return false;
      }
      if (chassisKey && usedChassis.has(chassisKey)) {
        triggerToast(tr('这个车架号已经存在', 'This chassis number already exists', 'Nombor casis ini sudah wujud'), 'error');
        return false;
      }
      if (engineKey && usedEngines.has(engineKey)) {
        triggerToast(tr('这个引擎号已经存在', 'This engine number already exists', 'Nombor enjin ini sudah wujud'), 'error');
        return false;
      }
      if (existing?.sold_application_id && draft.status !== 'Sold') {
        triggerToast(tr('已交车库存必须从成交账本更正', 'Correct delivered stock from the Deal Ledger', "Betulkan stok yang telah diserah daripada Lejar Urus Niaga"), 'error');
        return false;
      }
      if (!existing && draft.status !== 'In Stock') {
        triggerToast(tr('新库存必须先设为 In Stock', 'New stock must start as In Stock', "Stok baharu mesti bermula sebagai In Stock"), 'error');
        return false;
      }

      if (draft.id) seenUpdateIds.add(draft.id);
      usedNumberPlates.add(numberPlate);
      if (chassisKey) usedChassis.add(chassisKey);
      if (engineKey) usedEngines.add(engineKey);

      normalizedUpdates.push({
        catalogId,
        catalog: catalogItem,
        existing,
        unit: {
          ...draft,
          id: existing?.id || newId('STOCK'),
          number_plate: numberPlate,
          chassis_number: chassisNumber,
          engine_number: engineNumber,
          supplier: draft.supplier.trim().replace(/\s+/g, ' '),
          purchase_cost: purchaseCost,
          transport_cost: normalizeMoneyAmount(draft.transport_cost),
          registration_cost: normalizeMoneyAmount(draft.registration_cost),
          accessories_cost: normalizeMoneyAmount(draft.accessories_cost),
          repair_cost: normalizeMoneyAmount(draft.repair_cost),
          other_direct_cost: normalizeMoneyAmount(draft.other_direct_cost),
          received_at: draft.received_at || malaysiaDate(now),
          status: existing?.status || 'In Stock',
          reserved_application_id: existing?.reserved_application_id || '',
          sold_application_id: existing?.sold_application_id || '',
          delivered_at: existing?.delivered_at || '',
          created_at: existing?.created_at || now,
          updated_at: now,
          updated_by: currentStaff.name
        }
      });
    }

    const updatesByCatalog = new Map<string, typeof normalizedUpdates>();
    normalizedUpdates.forEach((update) => {
      updatesByCatalog.set(update.catalogId, [...(updatesByCatalog.get(update.catalogId) || []), update]);
    });
    const nextCatalog = normalizeVehicleCatalogList(vehicleCatalog.map((catalog) => {
      const catalogUpdates = updatesByCatalog.get(catalog.id);
      if (!catalogUpdates) return catalog;
      const nextUnits = [...(catalog.stock_units || [])];
      catalogUpdates.forEach(({ unit }) => {
        const existingIndex = nextUnits.findIndex((current) => current.id === unit.id);
        if (existingIndex >= 0) nextUnits[existingIndex] = unit;
        else nextUnits.push(unit);
      });
      return { ...catalog, stock_units: nextUnits };
    }));

    const savedUnitIds = normalizedUpdates.map(({ unit }) => unit.id);
    // The server reads the saved catalog, so the ledger sync waits for the (debounced) save to land.
    void Promise.resolve(updateVehicleCatalogState(nextCatalog)).then((saved) => {
      if (saved !== false) onStockSaved?.(savedUnitIds);
    });
    const singleUpdate = normalizedUpdates.length === 1 ? normalizedUpdates[0] : undefined;
    const addedCount = normalizedUpdates.filter(({ existing }) => !existing).length;
    const editedCount = normalizedUpdates.length - addedCount;
    appendAuditLog({
      action: singleUpdate
        ? singleUpdate.existing ? 'UPDATE_VEHICLE_STOCK' : 'ADD_VEHICLE_STOCK'
        : addedCount > 0 && editedCount > 0 ? 'BULK_UPSERT_VEHICLE_STOCK' : addedCount > 0 ? 'BULK_ADD_VEHICLE_STOCK' : 'BULK_UPDATE_VEHICLE_STOCK',
      target_type: 'Vehicle Stock',
      target_id: singleUpdate?.unit.id || `STOCK-BATCH-${Date.now()}`,
      target_label: singleUpdate
        ? `${singleUpdate.catalog.model} · ${getVehicleStockReference(singleUpdate.unit)}`
        : `${normalizedUpdates.length} physical stock units`,
      changes: singleUpdate
        ? createAuditChanges(
            singleUpdate.existing ? { ...singleUpdate.existing } : {},
            {
              model: singleUpdate.catalog.model,
              number_plate: singleUpdate.unit.number_plate,
              chassis_number: singleUpdate.unit.chassis_number,
              engine_number: singleUpdate.unit.engine_number,
              supplier: singleUpdate.unit.supplier,
              purchase_cost: singleUpdate.unit.purchase_cost,
              transport_cost: singleUpdate.unit.transport_cost,
              registration_cost: singleUpdate.unit.registration_cost,
              accessories_cost: singleUpdate.unit.accessories_cost,
              repair_cost: singleUpdate.unit.repair_cost,
              other_direct_cost: singleUpdate.unit.other_direct_cost,
              status: singleUpdate.unit.status
            }
          )
        : [
            { field: 'units', old_value: `${editedCount} existing`, new_value: `${addedCount} added · ${editedCount} updated` },
            { field: 'models', old_value: '', new_value: Array.from(new Set(normalizedUpdates.map(({ catalog }) => catalog.model))).join(', ') }
          ],
      stateOverrides: { vehicleCatalog: nextCatalog }
    });
    triggerToast(singleUpdate
      ? tr(`库存 ${getVehicleStockReference(singleUpdate.unit)} 已保存`, `Stock ${getVehicleStockReference(singleUpdate.unit)} saved`, `Stok ${getVehicleStockReference(singleUpdate.unit)} disimpan`)
      : tr(`已保存 ${normalizedUpdates.length} 台库存`, `${normalizedUpdates.length} stock units saved`, `${normalizedUpdates.length} unit stok disimpan`));
    return true;
  };

  // Finance Center's stock-only path. It records one physical unit and its
  // landed costs without reading or changing Vehicle Info pricing.
  const handleQuickAddStock = (
    catalogId: string,
    input: QuickStockInput
  ): boolean => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以补库存', 'Only the Operations Manager can add stock', "Hanya Pengurus Operasi boleh menambah stok"), 'error');
      return false;
    }
    const catalog = vehicleCatalog.find((item) => item.id === catalogId);
    if (!catalog) {
      triggerToast(tr('找不到这个 Vehicle Info 车型', 'Vehicle Info model not found', "Model Vehicle Info tidak ditemui"), 'error');
      return false;
    }
    const purchaseCost = normalizeMoneyAmount(input.purchase_cost);
    if (purchaseCost <= 0) {
      triggerToast(tr('请填写购买成本（必须大于 0）', 'Enter the purchase cost (must be > 0)', "Isi kos belian (mesti > 0)"), 'error');
      return false;
    }
    const numberPlate = normalizeVehicleNumberPlate(input.number_plate);
    if (!numberPlate) {
      triggerToast(tr('请填写 Number Plate', 'Enter the Number Plate', 'Isi Nombor Plat'), 'error');
      return false;
    }
    if (vehicleCatalog.some((item) => (item.stock_units || []).some((unit) => normalizeVehicleNumberPlate(unit.number_plate) === numberPlate))) {
      triggerToast(tr(`车牌 ${numberPlate} 已经存在`, `Number Plate ${numberPlate} already exists`, `Nombor Plat ${numberPlate} sudah wujud`), 'error');
      return false;
    }
    const now = new Date().toISOString();
    const newUnit: VehicleStockUnit = {
      id: newId('STOCK'),
      number_plate: numberPlate,
      chassis_number: '',
      engine_number: '',
      supplier: '',
      purchase_cost: purchaseCost,
      transport_cost: normalizeMoneyAmount(input.transport_cost),
      registration_cost: 0,
      accessories_cost: normalizeMoneyAmount(input.free_gift_cost),
      repair_cost: normalizeMoneyAmount(input.repair_cost),
      other_direct_cost: 0,
      received_at: malaysiaDate(now),
      status: 'In Stock',
      reserved_application_id: '',
      sold_application_id: '',
      delivered_at: '',
      created_at: now,
      updated_at: now,
      updated_by: currentStaff.name
    };
    return handleSaveVehicleStockUnits([{ catalogId, unit: newUnit }]);
  };

  // Task Inbox inline add-stock is the one place Operations enters the deal
  // amounts. Selling/loan/deposit stay on this application; only the physical
  // unit and its landed cost stay under the model. Vehicle Info prices are not
  // read or written. A missing model gets a zero-price model shell solely so
  // the unit can be grouped and found later.
  const handleQuickAddStockForModel = async (
    applicationId: string,
    model: string,
    input: QuickStockInput,
    options: {
      /** The order this bike arrives for; marked Arrived in the same transaction as the reservation. */
      stockOrder?: StockOrder;
    } = {}
  ): Promise<boolean> => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以补库存与成交金额', 'Only the Operations Manager can add stock and deal amounts', "Hanya Pengurus Operasi boleh menambah stok dan jumlah urus niaga"), 'error');
      return Promise.resolve(false);
    }
    const application = applications.find((item) => item.id === applicationId);
    if (!application) {
      triggerToast(tr('找不到这位客户的申请', 'Customer application not found', "Permohonan pelanggan tidak ditemui"), 'error');
      return Promise.resolve(false);
    }
    const cleanModel = (model || '').trim().replace(/\s+/g, ' ');
    if (!cleanModel) {
      triggerToast(tr('这单没有填车型，请先在客户资料里填 Vehicle Model', 'This deal has no vehicle model. Fill it in the customer record first.', "Tiada model kenderaan. Isi dahulu dalam rekod pelanggan."), 'error');
      return Promise.resolve(false);
    }
    // Owner 2026-10-18: Operations only records the bike's cost here. The price,
    // loan and deposit are confirmed on the delivery checklist (step 1) and copied
    // in at delivery; until then the deal keeps what it had, or the listed price.
    const sellingPrice = normalizeMoneyAmount(input.selling_price)
      || normalizeMoneyAmount(application.deal_finance?.final_selling_price)
      || normalizeMoneyAmount(application.vehicle_options?.[0]?.motor_selling_price);
    const purchaseCost = normalizeMoneyAmount(input.purchase_cost);
    if (purchaseCost <= 0) {
      triggerToast(tr('请填写购买成本（必须大于 0）', 'Enter the purchase cost (must be > 0)', "Isi kos belian (mesti > 0)"), 'error');
      return Promise.resolve(false);
    }
    // The plate is optional: a new bike gets it at JPJ registration (checklist step 7).
    const numberPlate = normalizeVehicleNumberPlate(input.number_plate);
    if (numberPlate && vehicleCatalog.some((item) => (item.stock_units || []).some((unit) => normalizeVehicleNumberPlate(unit.number_plate) === numberPlate))) {
      triggerToast(tr(`车牌 ${numberPlate} 已经存在`, `Number Plate ${numberPlate} already exists`, `Nombor Plat ${numberPlate} sudah wujud`), 'error');
      return Promise.resolve(false);
    }
    // Owner review 2026-10-19: the success message only after the save really
    // happened, and a retry never creates a second bike. The unit id is fixed per
    // deal, so a retry after a failure or an unknown outcome finds the same unit.
    const now = new Date().toISOString();
    const dealUnitId = `STOCK-FOR-${applicationId}`;
    const existingUnit = vehicleCatalog.flatMap((item) => item.stock_units || []).find((unit) => unit.id === dealUnitId);
    const reusable = existingUnit && !existingUnit.sold_application_id
      && (!existingUnit.reserved_application_id || existingUnit.reserved_application_id === applicationId);
    const unitId = existingUnit && !reusable ? newId('STOCK') : dealUnitId;
    const newUnit: VehicleStockUnit = {
      ...(reusable ? existingUnit : {}),
      id: unitId,
      number_plate: numberPlate || (reusable ? existingUnit.number_plate : ''),
      chassis_number: reusable ? existingUnit.chassis_number : '',
      engine_number: reusable ? existingUnit.engine_number : '',
      supplier: options.stockOrder?.supplier || (reusable ? existingUnit.supplier : ''),
      purchase_cost: purchaseCost,
      transport_cost: normalizeMoneyAmount(input.transport_cost),
      registration_cost: reusable ? existingUnit.registration_cost : 0,
      accessories_cost: normalizeMoneyAmount(input.free_gift_cost),
      repair_cost: normalizeMoneyAmount(input.repair_cost),
      other_direct_cost: reusable ? existingUnit.other_direct_cost : 0,
      received_at: reusable && existingUnit.received_at ? existingUnit.received_at : malaysiaDate(now),
      status: 'In Stock',
      reserved_application_id: '',
      sold_application_id: '',
      delivered_at: '',
      created_at: reusable ? existingUnit.created_at : now,
      updated_at: now,
      updated_by: currentStaff.name
    };
    const existingCatalog = vehicleCatalog.find((item) => (item.model || '').trim().toLowerCase() === cleanModel.toLowerCase());
    const nextCatalog = normalizeVehicleCatalogList(existingCatalog
      ? vehicleCatalog.map((item) => item.id === existingCatalog.id
        ? { ...item, stock_units: [...(item.stock_units || []).filter((unit) => unit.id !== unitId), newUnit] }
        : item)
      : [
          ...vehicleCatalog,
          {
            id: newId('VEH'),
            model: cleanModel,
            brand: inferVehicleBrandFromModel(cleanModel, vehicleCatalog),
            body_type: 'Motorcycle',
            finance_profile: inferFinanceProfileFromVehicle(cleanModel, inferVehicleBrandFromModel(cleanModel, vehicleCatalog)),
            selling_price: 0,
            loan_amount: 0,
            deposit_amount: 0,
            cost_price: 0,
            profit_amount: 0,
            stock_units: [newUnit],
            created_at: now
          }
        ]);

    // 1. The bike itself: saved and confirmed before anything else.
    const catalogSaved = await persistDashboardState({ vehicleCatalog: nextCatalog }, { immediate: true });
    if (!catalogSaved) {
      triggerToast(tr('库存没有保存成功，请检查网络后再试。输入的内容还在。', 'The stock was not saved; check the connection and try again. Your entries are kept.', 'Stok tidak disimpan; semak sambungan dan cuba lagi. Maklumat anda dikekalkan.'), 'error');
      return false;
    }
    setVehicleCatalog(nextCatalog);

    // 2. Reserve it for this customer, link the customer to it and close the
    //    order, in one version-protected transaction (saveDealFinanceInternal).
    const previousFinance = application.deal_finance;
    const draft: DealFinance = {
      stock_unit_id: unitId,
      sale_status: previousFinance?.sale_status || 'Pending Acceptance',
      automation_source: previousFinance?.automation_source || 'Application Workflow',
      approved_bank_name: previousFinance?.approved_bank_name || '',
      approved_bank_offer_amount: normalizeMoneyAmount(previousFinance?.approved_bank_offer_amount),
      approved_bank_offer_at: previousFinance?.approved_bank_offer_at || '',
      listed_selling_price: normalizeMoneyAmount(previousFinance?.listed_selling_price) || sellingPrice,
      loan_amount: application.purchase_method === 'Cash' ? 0 : normalizeMoneyAmount(previousFinance?.loan_amount ?? input.loan_amount),
      deposit_amount: application.purchase_method === 'Cash' ? 0 : normalizeMoneyAmount(previousFinance?.deposit_amount ?? input.deposit_amount),
      approved_discount: normalizeMoneyAmount(previousFinance?.approved_discount),
      final_selling_price: normalizeMoneyAmount(previousFinance?.final_selling_price) || sellingPrice,
      customer_deposit_received: normalizeMoneyAmount(previousFinance?.customer_deposit_received),
      ...(previousFinance?.customer_deposit_date ? { customer_deposit_date: previousFinance.customer_deposit_date } : {}),
      customer_cash_payment: normalizeMoneyAmount(previousFinance?.customer_cash_payment),
      bank_disbursement: normalizeMoneyAmount(previousFinance?.bank_disbursement),
      other_income: normalizeMoneyAmount(previousFinance?.other_income),
      refund_amount: normalizeMoneyAmount(previousFinance?.refund_amount),
      direct_bank_charges: normalizeMoneyAmount(previousFinance?.direct_bank_charges),
      recognized_stock_cost: previousFinance?.recognized_stock_cost,
      delivery_at: previousFinance?.delivery_at || '',
      bank_disbursed_at: previousFinance?.bank_disbursed_at || '',
      finance_completed_at: previousFinance?.finance_completed_at || '',
      account_verified_at: previousFinance?.account_verified_at || '',
      account_verified_by: previousFinance?.account_verified_by || '',
      commission_status: previousFinance?.commission_status || 'Estimated',
      // A typed commission is manual; left empty, the tiers fill it in at delivery.
      commission_source: normalizeMoneyAmount(input.commission_amount) > 0 ? 'manual' : 'tier',
      commission_percent: undefined,
      commission_amount: normalizeMoneyAmount(input.commission_amount),
      commission_paid_at: previousFinance?.commission_paid_at || '',
      updated_at: now,
      updated_by: currentStaff.name
    };
    const stockOrder = options.stockOrder
      ? { ...options.stockOrder, status: 'Arrived' as const, updated_at: now, updated_by: currentStaff.name }
      : undefined;
    return saveDealFinanceInternal(applicationId, draft, { catalog: nextCatalog, stockOrder });
  };

  const saveDealFinanceInternal = async (
    applicationId: string,
    draft: DealFinance,
    options: {
      forceReason?: string;
      /** The catalog to read stock from when the caller just added a unit (state is not updated yet). */
      catalog?: VehicleCatalogItem[];
      /** Written in the same transaction as the reservation (a bike ordered outside arrived). */
      stockOrder?: StockOrder;
      /** A tier commission follow-up save: no success toast and no further follow-ups. */
      tierFollowUp?: boolean;
      /** Tiers just saved, before React state carries them. */
      tiers?: CommissionTierSource;
    } = {}
  ) => {
    const catalogNow = options.catalog || vehicleCatalog;
    const application = applicationsRef.current.find((item) => item.id === applicationId);
    if (!application) {
      triggerToast(tr('找不到 Loan Application', 'Loan Application not found', "Loan Application tidak ditemui"), 'error');
      return false;
    }

    const stockRows = catalogNow.flatMap((catalog) => (catalog.stock_units || []).map((unit) => ({ catalog, unit })));
    const selectedStock = draft.stock_unit_id ? stockRows.find((row) => row.unit.id === draft.stock_unit_id) : undefined;
    if (draft.stock_unit_id && !selectedStock) {
      triggerToast(tr('选择的库存车辆不存在', 'Selected stock unit does not exist', "Unit stok yang dipilih tidak wujud"), 'error');
      return false;
    }
    if (selectedStock && (
      (selectedStock.unit.reserved_application_id && selectedStock.unit.reserved_application_id !== applicationId) ||
      (selectedStock.unit.sold_application_id && selectedStock.unit.sold_application_id !== applicationId)
    )) {
      triggerToast(tr('这辆库存已经绑定其他客户', 'This stock unit is already linked to another customer', "Unit stok ini sudah dipautkan kepada pelanggan lain"), 'error');
      return false;
    }
    if (draft.sale_status === 'Bike Delivered' && !selectedStock) {
      triggerToast(tr('交车前必须选择库存车辆', 'Select a stock unit before marking Bike Delivered', "Pilih unit stok sebelum menandakan Bike Delivered"), 'error');
      return false;
    }
    // Delivery checklist gate (owner decision 2026-10-16, old deals included):
    // steps 1-10 must be done first. firestore.rules enforces the same for
    // Operations Manager; Super Admin is let through and the audit row below
    // names the steps that were still open.
    const isNewDelivery = draft.sale_status === 'Bike Delivered' && application.deal_finance?.sale_status !== 'Bike Delivered';
    const openDeliverySteps = isNewDelivery ? getOpenDeliveryStepsBeforeDelivery(application.delivery_checklist) : [];
    if (openDeliverySteps.length > 0 && currentStaff.role !== 'Super Admin') {
      triggerToast(tr(
        `交车清单还有 ${openDeliverySteps.length} 步没完成,不能交车`,
        `${openDeliverySteps.length} delivery checklist steps are still open; the bike cannot be delivered yet`,
        `${openDeliverySteps.length} langkah senarai penghantaran belum selesai; motor belum boleh dihantar`
      ), 'error');
      return false;
    }
    if (draft.finance_completed_at && draft.sale_status !== 'Bike Delivered') {
      triggerToast(tr('必须先完成 Bike Delivered 才能完成财务', 'Bike Delivered is required before Finance Completed', "Bike Delivered diperlukan sebelum Kewangan Selesai"), 'error');
      return false;
    }

    const now = new Date().toISOString();
    const listedPrice = normalizeMoneyAmount(draft.listed_selling_price);
    const approvedDiscount = normalizeMoneyAmount(draft.approved_discount);
    const finalSellingPrice = normalizeMoneyAmount(draft.final_selling_price);
    // Cash deals never have a bank disbursement. Force stale/hidden values to
    // zero at the save boundary so they cannot inflate Received or complete a
    // Cash journey without the actual customer payment.
    const bankDisbursement = application.purchase_method === 'Cash'
      ? 0
      : normalizeMoneyAmount(draft.bank_disbursement);
    const receipts = normalizeMoneyAmount(draft.customer_deposit_received) + normalizeMoneyAmount(draft.customer_cash_payment) + bankDisbursement;
    const salesValue = finalSellingPrice + normalizeMoneyAmount(draft.other_income) - normalizeMoneyAmount(draft.refund_amount);
    if (draft.finance_completed_at && receipts + 0.01 < Math.max(salesValue, 0)) {
      triggerToast(tr('还有未收款，不能标记 Finance Completed', 'Outstanding payment remains; Finance cannot be completed', "Masih ada bayaran belum diterima; Kewangan tidak boleh diselesaikan"), 'error');
      return false;
    }
    // Every completion/payment entry point checks fresh receipts, including Finance Center.
    if (draft.finance_completed_at) {
      try {
        const payments = await listDeliveryPayments(applicationId);
        if (!reconcileSettlementReceipts(payments, { deposit: draft.customer_deposit_received, cash: draft.customer_cash_payment }).matches) {
          triggerToast(tr('订金和现金与最新收款记录不一致，请重新核对', 'Deposit and cash do not match the latest payments; reload and reconcile them', 'Deposit dan tunai tidak sepadan dengan bayaran terkini; muat semula dan semak'), 'error');
          return false;
        }
      } catch {
        triggerToast(tr('无法核对最新收款，结算未确认，请重试', 'Could not verify the latest payments; settlement was not confirmed. Try again', 'Bayaran terkini tidak dapat disemak; penyelesaian belum disahkan. Cuba lagi'), 'error');
        return false;
      }
    }
    if (draft.commission_paid_at && !draft.finance_completed_at) {
      triggerToast(tr('财务完成后才能标记佣金已支付', 'Complete Finance before marking commission Paid', "Selesaikan Kewangan sebelum menandakan komisen Dibayar"), 'error');
      return false;
    }

    const deliveryAt = draft.sale_status === 'Bike Delivered' ? draft.delivery_at || malaysiaDate(now) : '';
    const selectedStockCost = selectedStock
      ? normalizeMoneyAmount(selectedStock.unit.purchase_cost)
        + normalizeMoneyAmount(selectedStock.unit.transport_cost)
        + normalizeMoneyAmount(selectedStock.unit.registration_cost)
        + normalizeMoneyAmount(selectedStock.unit.accessories_cost)
        + normalizeMoneyAmount(selectedStock.unit.repair_cost)
        + normalizeMoneyAmount(selectedStock.unit.other_direct_cost)
      : 0;
    const previousRecognizedCost = application.deal_finance?.stock_unit_id === draft.stock_unit_id
      ? normalizeMoneyAmount(application.deal_finance?.recognized_stock_cost)
      : 0;
    const recognizedStockCost = draft.sale_status === 'Bike Delivered'
      ? previousRecognizedCost > 0
        ? previousRecognizedCost
        : selectedStockCost
      : draft.recognized_stock_cost;
    const commissionStatus = draft.sale_status === 'Cancelled'
      ? 'Reversed'
      : draft.commission_paid_at
        ? 'Paid'
        : draft.finance_completed_at
          ? 'Payable'
          : draft.sale_status === 'Bike Delivered'
            ? 'Earned'
            : 'Estimated';
    const draftCommissionPercent = typeof draft.commission_percent === 'number' && Number.isFinite(draft.commission_percent)
      ? Math.min(Math.max(draft.commission_percent, 0), 100)
      : undefined;
    // A deal that already stores its own percent keeps recomputing from that
    // stored rate; everything else is the hand-entered amount, verbatim. There
    // is no configured rule left to fall back on.
    const appliedCommissionPercent = draftCommissionPercent;
    const commissionAmount = appliedCommissionPercent === undefined
      ? normalizeMoneyAmount(draft.commission_amount)
      : Math.round(finalSellingPrice * appliedCommissionPercent) / 100;
    const nextFinance: DealFinance = {
      ...draft,
      automation_source: undefined,
      customer_deposit_date: undefined,
      listed_selling_price: listedPrice,
      approved_discount: approvedDiscount,
      final_selling_price: finalSellingPrice,
      customer_deposit_received: normalizeMoneyAmount(draft.customer_deposit_received),
      ...(isDepositDate(draft.customer_deposit_date) && normalizeMoneyAmount(draft.customer_deposit_received) > 0 ? { customer_deposit_date: draft.customer_deposit_date } : {}),
      customer_cash_payment: normalizeMoneyAmount(draft.customer_cash_payment),
      bank_disbursement: bankDisbursement,
      other_income: normalizeMoneyAmount(draft.other_income),
      refund_amount: normalizeMoneyAmount(draft.refund_amount),
      direct_bank_charges: normalizeMoneyAmount(draft.direct_bank_charges),
      recognized_stock_cost: recognizedStockCost,
      delivery_at: deliveryAt,
      bank_disbursed_at: bankDisbursement > 0 ? draft.bank_disbursed_at || malaysiaDate(now) : '',
      finance_completed_at: draft.finance_completed_at || '',
      account_verified_at: draft.finance_completed_at ? now : '',
      account_verified_by: draft.finance_completed_at ? currentStaff.name : '',
      commission_status: commissionStatus,
      commission_percent: appliedCommissionPercent,
      commission_amount: normalizeMoneyAmount(commissionAmount),
      commission_paid_at: draft.commission_paid_at || '',
      updated_at: now,
      updated_by: currentStaff.name
    };
    // Progressive tiers (owner 2026-10-21): a tier deal earns its share of the
    // handler's delivered sales for the Malaysia month, worked out with this
    // save applied. Paying the commission keeps the figure it was paid at.
    if (appliedCommissionPercent === undefined && isTierCommission(draft) && !application.deal_finance?.commission_paid_at) {
      const delivered = nextFinance.sale_status === 'Bike Delivered'
        ? buildTierCommissions(replaceItemById(applicationsRef.current, { ...application, deal_finance: nextFinance }), options.tiers || commissionTiers).get(applicationId)
        : undefined;
      nextFinance.commission_source = 'tier';
      nextFinance.commission_amount = delivered ? delivered.amount : 0;
    }
    const previousStockId = application.deal_finance?.stock_unit_id || '';
    const nextCatalog = normalizeVehicleCatalogList(catalogNow.map((catalog) => ({
      ...catalog,
      stock_units: (catalog.stock_units || []).map((unit) => {
        if (unit.id === previousStockId && unit.id !== nextFinance.stock_unit_id && (unit.reserved_application_id === applicationId || unit.sold_application_id === applicationId)) {
          return { ...unit, status: 'In Stock', reserved_application_id: '', sold_application_id: '', delivered_at: '', updated_at: now, updated_by: currentStaff.name };
        }
        if (unit.id !== nextFinance.stock_unit_id) {
          return unit;
        }
        if (nextFinance.sale_status === 'Cancelled') {
          return { ...unit, status: 'In Stock', reserved_application_id: '', sold_application_id: '', delivered_at: '', updated_at: now, updated_by: currentStaff.name };
        }
        if (nextFinance.sale_status === 'Bike Delivered') {
          return { ...unit, status: 'Sold', reserved_application_id: '', sold_application_id: applicationId, delivered_at: deliveryAt, updated_at: now, updated_by: currentStaff.name };
        }
        return { ...unit, status: 'Reserved', reserved_application_id: applicationId, sold_application_id: '', delivered_at: '', updated_at: now, updated_by: currentStaff.name };
      })
    })));
    const deliveredNumberPlate = nextFinance.sale_status === 'Bike Delivered'
      ? normalizeVehicleNumberPlate(selectedStock?.unit.number_plate)
      : '';
    let savedApplication: LoanApplication = {
      ...application,
      vehicle_plate: deliveredNumberPlate || application.vehicle_plate,
      deal_finance: nextFinance
    };

    try {
      savedApplication = await saveDealFinanceWithStockReservationToFirebase(
        savedApplication,
        previousStockId,
        currentStaff.name,
        { stockOrder: options.stockOrder, financeOnly: true, expectedFinanceUpdatedAt: application.deal_finance?.updated_at || '' }
      );
    } catch (error) {
      if (error instanceof StockReservationConflictError) {
        triggerToast(tr(
          `库存 ${error.stockUnitId} 已被另一笔交易占用，未保存。`,
          `Stock ${error.stockUnitId} is already assigned to another deal. Nothing was saved.`,
          `Stok ${error.stockUnitId} telah digunakan oleh urus niaga lain. Tiada perubahan disimpan.`
        ), 'error');
        return false;
      }
      if (error instanceof CollectionItemVersionConflictError) {
        triggerToast(tr('客户资料已在其他设备更新，正在重新载入。', 'The customer changed on another device. Reloading the latest data.', "Pelanggan telah berubah pada peranti lain. Memuatkan semula data terkini."), 'error');
        reloadDashboard();
        return false;
      }
      if (isFirebaseWriteOutcomeUnknown(error)) {
        triggerToast(tr(
          '库存事务等待超时，结果未确认（可能已经保存）。请重新载入确认后再决定是否重试。',
          'The stock transaction timed out and its result is pending (it may still have been saved). Reload to check before trying again.',
          'Transaksi stok tamat masa dan keputusannya belum disahkan (mungkin sudah disimpan). Muat semula untuk menyemak sebelum mencuba lagi.'
        ), 'error');
        return false;
      }
      triggerToast(tr('库存事务保存失败，没有应用任何修改。', 'The stock transaction failed; no changes were applied.', "Transaksi stok gagal; tiada perubahan digunakan."), 'error');
      return false;
    }

    // Use the committed snapshot so concurrent customer edits survive the finance patch.
    const nextApplications = replaceItemById(applicationsRef.current, savedApplication);
    applicationsRef.current = nextApplications;
    setApplications(nextApplications);
    setVehicleCatalog(nextCatalog);
    setSelectedApplication((current) => current?.id === applicationId
      ? preserveLoadedApplicationFileData(savedApplication, current)
      : current);
    writeLocalDashboardState({ applications: nextApplications, vehicleCatalog: nextCatalog });
    appendAuditLog({
      action: 'UPDATE_DEAL_FINANCE',
      target_type: 'Deal Finance',
      target_id: applicationId,
      target_label: `${application.applicant_name} · ${application.vehicle_model}`,
      changes: createAuditChanges(
        {
          ...(application.deal_finance || {}),
          vehicle_plate: application.vehicle_plate
        },
        {
          vehicle_plate: deliveredNumberPlate || application.vehicle_plate,
          stock_unit_id: nextFinance.stock_unit_id,
          sale_status: nextFinance.sale_status,
          final_selling_price: nextFinance.final_selling_price,
          receipts,
          bank_disbursement: nextFinance.bank_disbursement,
          approved_bank_name: nextFinance.approved_bank_name || '',
          approved_bank_offer_amount: nextFinance.approved_bank_offer_amount || 0,
          recognized_stock_cost: nextFinance.recognized_stock_cost || 0,
          delivery_at: nextFinance.delivery_at,
          finance_completed_at: nextFinance.finance_completed_at,
          commission_status: nextFinance.commission_status,
          commission_percent: nextFinance.commission_percent ?? '',
          commission_amount: nextFinance.commission_amount,
          commission_paid_at: nextFinance.commission_paid_at,
          ...(openDeliverySteps.length > 0 ? { delivered_with_open_checklist_steps: openDeliverySteps.join(', ') } : {}),
          ...(openDeliverySteps.length > 0 && options.forceReason ? { force_delivery_reason: options.forceReason } : {})
        }
      ),
      stateOverrides: { applications: nextApplications, vehicleCatalog: nextCatalog }
    });
    if (options.tierFollowUp) return true;
    triggerToast(tr(`已更新 ${application.applicant_name} 的财务资料`, `Finance updated for ${application.applicant_name}`, `Kewangan ${application.applicant_name} dikemas kini`));
    if (nextFinance.sale_status === 'Bike Delivered') onBikeDelivered?.(applicationId);
    // The same Sales' other unpaid tier deals move with this one (a new
    // delivery, a price change or a cancellation changes the month's bands).
    void applyTierCommissionUpdates(application.handler_name);
    return true;
  };

  /**
   * Saves every open tier deal whose stored commission differs from the tiers,
   * one deal finance save each (audited like any other). Operations Manager /
   * Super Admin only: Rules keep commission away from Admin and Sales.
   */
  const applyTierCommissionUpdates = async (handlerName?: string, tiers: CommissionTierSource = commissionTiers) => {
    if (!isOperationsLead(currentStaff.role)) return { updated: 0, failed: 0 };
    let updated = 0;
    let failed = 0;
    for (const update of getTierCommissionUpdates(applicationsRef.current, tiers, handlerName)) {
      const application = applicationsRef.current.find((item) => item.id === update.applicationId);
      if (!application?.deal_finance) continue;
      const ok = await saveDealFinanceInternal(update.applicationId, { ...application.deal_finance, commission_source: 'tier' }, { tierFollowUp: true, tiers });
      if (ok) updated += 1;
      else failed += 1;
    }
    return { updated, failed };
  };

  const handleRecalculateTierCommissions = async (tiers: CommissionTierSource = commissionTiers) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以重算佣金', 'Only the Operations Manager can recalculate commission', 'Hanya Pengurus Operasi boleh mengira semula komisen'), 'error');
      return false;
    }
    const { updated, failed } = await applyTierCommissionUpdates(undefined, tiers);
    triggerToast(
      failed > 0
        ? tr(`已按分级更新 ${updated} 单佣金,${failed} 单没保存`, `Commission updated by tier on ${updated} deals; ${failed} were not saved`, `Komisen dikemas kini mengikut tahap pada ${updated} urus niaga; ${failed} tidak disimpan`)
        : tr(`已按分级更新 ${updated} 单佣金`, `Commission updated by tier on ${updated} deals`, `Komisen dikemas kini mengikut tahap pada ${updated} urus niaga`),
      failed > 0 ? 'warning' : 'success'
    );
    return failed === 0;
  };

  // Super Admin edits the plans (Financial Reports -> Commission Ledger ->
  // Commission Tiers); unpaid tier deals then move to the new bands, each save audited.
  const handleSaveCommissionTiers = async (input: CommissionTierPlan[]) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以修改佣金分级', 'Only Super Admin can change the commission tiers', 'Hanya Super Admin boleh menukar tahap komisen'), 'error');
      return false;
    }
    const plans = normalizeCommissionTierPlans({ commission_tier_plans: input });
    const previousPlans = normalizeCommissionTierPlans(commissionRules);
    // commission_tiers keeps the first plan's bands for anything reading the old field.
    const nextRules: CommissionRules = { ...commissionRules, commission_tier_plans: plans, commission_tiers: plans[0].tiers };
    setCommissionRules(nextRules);
    const saved = await persistDashboardState({ commissionRules: nextRules }, { immediate: true });
    if (!saved) {
      setCommissionRules(commissionRules);
      triggerToast(tr('佣金分级没有保存,请再试一次', 'The commission tiers were not saved; try again', 'Tahap komisen tidak disimpan; cuba lagi'), 'error');
      return false;
    }
    appendAuditLog({
      action: 'UPDATE_COMMISSION_TIERS',
      target_type: 'Commission Tiers',
      target_id: 'commission_tiers',
      target_label: tr('佣金分级', 'Commission tiers', 'Tahap komisen'),
      changes: [{ field: 'commission_tier_plans', old_value: JSON.stringify(previousPlans), new_value: JSON.stringify(plans) }],
      stateOverrides: { commissionRules: nextRules }
    });
    return handleRecalculateTierCommissions(buildCommissionTierSource(plans, roleAccounts));
  };

  // Finance editing belongs to the operational lead (Operations Manager, with
  // Super Admin retained as the emergency fallback).
  const handleSaveDealFinance = async (applicationId: string, draft: DealFinance) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以更新财务资料', 'Only the Operations Manager can update finance records', "Hanya Pengurus Operasi boleh mengemas kini rekod kewangan"), 'error');
      return false;
    }
    const current = applicationsRef.current.find((item) => item.id === applicationId)?.deal_finance;
    if (current && (draft.updated_at || '') !== (current.updated_at || '')) {
      triggerToast(tr('财务资料在编辑期间已更新，请关闭并重新打开核对后再保存。', 'Finance changed while you were editing. Close and reopen it to review the latest values before saving.', 'Kewangan berubah semasa anda mengedit. Tutup dan buka semula untuk menyemak nilai terkini sebelum menyimpan.'), 'error');
      return false;
    }
    return saveDealFinanceInternal(applicationId, draft);
  };

  // Narrow delivery (交车) action for the Task Inbox: links a stock unit and marks
  // the bike delivered, reusing the same stock-reservation + commission recompute
  // as the finance editor but only writing delivery fields. Operations only —
  // the write touches deal_finance + vehicle_stock_reservations, both of which
  // firestore.rules restricts to the operational lead. Sales sees a read-only
  // "awaiting delivery" card instead of a button that would always fail.
  // The deal a delivery writes; shared/dealDelivery.mjs computes the same on the server.
  const buildDeliveryDraft = (application: LoanApplication, stockUnitId: string): DealFinance => {
    const previous = application.deal_finance;
    // The price, loan and deposit come from delivery checklist step 1 once it is
    // done (owner 2026-10-18), the same as shared/dealDelivery.mjs on the server.
    const figures = getChecklistDealFigures(application);
    const useChecklistPrice = figures.confirmed && figures.sellingPrice > 0;
    const listedPrice = useChecklistPrice
      ? figures.sellingPrice + figures.discount
      : previous
        ? normalizeMoneyAmount(previous.listed_selling_price)
        : normalizeMoneyAmount(application.vehicle_options?.[0]?.motor_selling_price);
    const draft: DealFinance = {
      stock_unit_id: stockUnitId,
      sale_status: 'Bike Delivered',
      automation_source: previous?.automation_source,
      approved_bank_name: previous?.approved_bank_name || '',
      approved_bank_offer_amount: normalizeMoneyAmount(previous?.approved_bank_offer_amount),
      approved_bank_offer_at: previous?.approved_bank_offer_at || '',
      listed_selling_price: listedPrice,
      loan_amount: figures.confirmed ? figures.loanAmount : normalizeMoneyAmount(previous?.loan_amount),
      deposit_amount: figures.confirmed ? figures.deposit : normalizeMoneyAmount(previous?.deposit_amount),
      approved_discount: useChecklistPrice ? figures.discount : normalizeMoneyAmount(previous?.approved_discount),
      final_selling_price: useChecklistPrice ? figures.sellingPrice : previous ? normalizeMoneyAmount(previous.final_selling_price) : listedPrice,
      customer_deposit_received: normalizeMoneyAmount(previous?.customer_deposit_received),
      ...(previous?.customer_deposit_date ? { customer_deposit_date: previous.customer_deposit_date } : {}),
      customer_cash_payment: normalizeMoneyAmount(previous?.customer_cash_payment),
      bank_disbursement: normalizeMoneyAmount(previous?.bank_disbursement),
      other_income: normalizeMoneyAmount(previous?.other_income),
      refund_amount: normalizeMoneyAmount(previous?.refund_amount),
      direct_bank_charges: normalizeMoneyAmount(previous?.direct_bank_charges),
      recognized_stock_cost: previous?.recognized_stock_cost,
      delivery_at: previous?.delivery_at || malaysiaDate(),
      bank_disbursed_at: previous?.bank_disbursed_at || '',
      finance_completed_at: previous?.finance_completed_at || '',
      account_verified_at: previous?.account_verified_at || '',
      account_verified_by: previous?.account_verified_by || '',
      commission_status: 'Earned',
      ...(previous?.commission_source ? { commission_source: previous.commission_source } : {}),
      commission_percent: previous ? previous.commission_percent : undefined,
      commission_amount: previous ? normalizeMoneyAmount(previous.commission_amount) : 0,
      commission_paid_at: previous?.commission_paid_at || '',
      updated_at: previous?.updated_at || '',
      updated_by: currentStaff.name
    };
    return draft;
  };

  const handleMarkBikeDeliveredFromTaskInbox = async (applicationId: string, stockUnitId: string) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以标记交车', 'Only the Operations Manager can mark a bike delivered', "Hanya Pengurus Operasi boleh menandakan penghantaran"), 'error');
      return false;
    }
    const application = applications.find((item) => item.id === applicationId);
    if (!application) {
      triggerToast(tr('找不到 Loan Application', 'Loan Application not found', "Loan Application tidak ditemui"), 'error');
      return false;
    }
    if (!stockUnitId) {
      triggerToast(tr('交车前必须选择库存车辆', 'Select a stock unit before delivering', "Pilih unit stok sebelum menghantar"), 'error');
      return false;
    }
    const draft = buildDeliveryDraft(application, stockUnitId);
    return saveDealFinanceInternal(applicationId, draft);
  };

  // Mark delivered from the Delivery page (owner decisions 2026-10-16):
  // Admin (owner or handler of the file) delivers through the server, which
  // checks the checklist and logs who, when, IP and page; Operations Manager
  // delivers as from Home, once steps 1-10 are done; Super Admin may deliver
  // with steps open only with a written reason, kept in the audit row.
  const handleDeliverFromChecklist = async (applicationId: string, stockUnitId: string, options: { forceReason?: string } = {}) => {
    const application = applicationsRef.current.find((item) => item.id === applicationId);
    if (!application) {
      triggerToast(tr('找不到 Loan Application', 'Loan Application not found', "Loan Application tidak ditemui"), 'error');
      return false;
    }
    if (!stockUnitId) {
      triggerToast(tr('交车前必须选择库存车辆', 'Select a stock unit before delivering', "Pilih unit stok sebelum menghantar"), 'error');
      return false;
    }
    const openSteps = getOpenDeliveryStepsBeforeDelivery(application.delivery_checklist);

    if (currentStaff.role === 'Admin') {
      if (application.admin_owner_name !== currentStaff.name && application.handler_name !== currentStaff.name) {
        triggerToast(tr('只有这单的 Admin 可以交车', 'Only this file\'s Admin can deliver it', 'Hanya Pentadbir fail ini boleh menghantarnya'), 'error');
        return false;
      }
      if (openSteps.length > 0) {
        triggerToast(tr(`交车清单还有 ${openSteps.length} 步没完成,不能交车`, `${openSteps.length} delivery checklist steps are still open; the bike cannot be delivered yet`, `${openSteps.length} langkah senarai penghantaran belum selesai; motor belum boleh dihantar`), 'error');
        return false;
      }
      if (!markBikeDeliveredThroughServer) {
        // Local mode (no Firebase): no server to go through; the same save as Operations.
        return saveDealFinanceInternal(applicationId, buildDeliveryDraft(application, stockUnitId));
      }
      try {
        const delivered = await markBikeDeliveredThroughServer(application, stockUnitId, 'delivery_page');
        const nextApplications = replaceItemById(applicationsRef.current, delivered);
        applicationsRef.current = nextApplications;
        setApplications(nextApplications);
        const nextCatalog = vehicleCatalog.map((catalog) => ({
          ...catalog,
          stock_units: (catalog.stock_units || []).map((unit) => (
            unit.id === stockUnitId
              ? { ...unit, status: 'Sold' as const, reserved_application_id: '', sold_application_id: applicationId, delivered_at: delivered.deal_finance?.delivery_at || '' }
              : unit
          ))
        }));
        setVehicleCatalog(nextCatalog);
        setSelectedApplication((current) => (current?.id === applicationId ? preserveLoadedApplicationFileData(delivered, current) : current));
        writeLocalDashboardState({ applications: nextApplications, vehicleCatalog: nextCatalog });
        triggerToast(tr(`${application.applicant_name} 已交车`, `${application.applicant_name}'s bike is delivered`, `Motor ${application.applicant_name} telah dihantar`));
        return true;
      } catch (error) {
        if (error instanceof CollectionItemVersionConflictError) {
          triggerToast(tr('客户资料已在其他设备更新，正在重新载入。', 'The customer changed on another device. Reloading the latest data.', "Pelanggan telah berubah pada peranti lain. Memuatkan semula data terkini."), 'error');
          reloadDashboard();
          return false;
        }
        triggerToast(error instanceof Error && error.message ? error.message : tr('交车没有成功', 'The delivery was not saved', 'Penghantaran tidak disimpan'), 'error');
        return false;
      }
    }

    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Admin、Operations Manager 或 Super Admin 可以交车', 'Only Admin, Operations Manager or Super Admin can deliver', 'Hanya Pentadbir, Pengurus Operasi atau Super Admin boleh menghantar'), 'error');
      return false;
    }
    if (openSteps.length > 0 && currentStaff.role === 'Super Admin' && !options.forceReason?.trim()) {
      triggerToast(tr('清单没走完,强制交车要写原因', 'The checklist is not done; give a reason to force the delivery', 'Senarai belum selesai; beri sebab untuk memaksa penghantaran'), 'error');
      return false;
    }
    return saveDealFinanceInternal(applicationId, buildDeliveryDraft(application, stockUnitId), { forceReason: options.forceReason?.trim() });
  };

  // One-click "pay commission" from the Task Inbox settlement task. Operations
  // only; requires finance already completed (commission Payable). Marks the
  // commission paid today; saveDealFinanceInternal recomputes status to Paid.
  const handleMarkCommissionPaidFromTaskInbox = async (applicationId: string) => {
    if (!isOperationsLead(currentStaff.role)) {
      triggerToast(tr('只有 Operations Manager 可以支付佣金', 'Only the Operations Manager can pay commission', "Hanya Pengurus Operasi boleh membayar komisen"), 'error');
      return false;
    }
    const application = applications.find((item) => item.id === applicationId);
    if (!application?.deal_finance) {
      triggerToast(tr('找不到成交结算', 'Deal settlement not found', "Penyelesaian tidak ditemui"), 'error');
      return false;
    }
    const previous = application.deal_finance;
    if (!previous.finance_completed_at) {
      triggerToast(tr('请先完成财务结算', 'Complete finance settlement first', "Selesaikan kewangan dahulu"), 'error');
      return false;
    }
    if (previous.commission_paid_at) return true;
    return saveDealFinanceInternal(applicationId, { ...previous, commission_paid_at: malaysiaDate() });
  };

  return {
    handleSaveVehicleStockUnits,
    handleQuickAddStock,
    handleQuickAddStockForModel,
    handleSaveDealFinance,
    handleMarkBikeDeliveredFromTaskInbox,
    handleDeliverFromChecklist,
    handleMarkCommissionPaidFromTaskInbox,
    handleRecalculateTierCommissions,
    handleSaveCommissionTiers
  };
}
