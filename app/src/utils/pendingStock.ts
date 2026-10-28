import { LoanStatus, type LoanApplication, type StockOrder, type VehicleCatalogItem, type VehicleStockUnit } from '../types';
import { malaysiaDate } from '../../shared/malaysiaDate.mjs';
import { isReadyForStock } from './deliveryChecklist';

/**
 * Bikes the Operations Manager still has to find (owner 2026-10-18): every
 * approved deal that is not delivered or cancelled and has no stock unit of its
 * own yet. Free units of the same model are listed so a deal can be matched
 * from stock before anything is ordered outside.
 */
export interface PendingStockRow {
  application: LoanApplication;
  model: string;
  colour: string;
  condition: string;
  negeri: string;
  approvedAt: string;
  waitingDays: number;
  order: StockOrder | null;
  /** Ordered and the expected arrival has passed. */
  overdue: boolean;
}

export interface PendingStockGroup {
  model: string;
  rows: PendingStockRow[];
  /** In-stock units of this model not reserved or sold to anyone. */
  freeUnits: VehicleStockUnit[];
}

const modelKey = (value: unknown) => String(value || '').trim().toLowerCase();

const hasOwnUnit = (application: LoanApplication, units: VehicleStockUnit[]) => units.some((unit) => (
  (application.deal_finance?.stock_unit_id && unit.id === application.deal_finance.stock_unit_id)
  || (unit.reserved_application_id === application.id && !unit.sold_application_id)
));

export const buildPendingStock = (
  applications: LoanApplication[],
  vehicleCatalog: VehicleCatalogItem[],
  orders: StockOrder[],
  now = Date.now()
): PendingStockGroup[] => {
  const unitsByModel = new Map<string, VehicleStockUnit[]>();
  vehicleCatalog.forEach((item) => {
    const key = modelKey(item.model);
    if (key) unitsByModel.set(key, [...(unitsByModel.get(key) || []), ...(item.stock_units || [])]);
  });
  const orderById = new Map(orders.map((order) => [order.application_id, order]));
  const today = malaysiaDate(now);
  const groups = new Map<string, PendingStockGroup>();

  applications
    .filter((application) => (
      application.status === LoanStatus.APPROVE
      // Only once Collect payment closed with the hire purchase agreement signed.
      && isReadyForStock(application)
      && modelKey(application.vehicle_model)
      && application.deal_finance?.sale_status !== 'Bike Delivered'
      && application.deal_finance?.sale_status !== 'Cancelled'
    ))
    .forEach((application) => {
      const key = modelKey(application.vehicle_model);
      const units = unitsByModel.get(key) || [];
      if (hasOwnUnit(application, units)) return;
      // A cancelled order puts the deal back to "not found yet"; an arrived one
      // waits only until its stock unit is added and reserved (then hasOwnUnit).
      const order = orderById.get(application.id) || null;
      const activeOrder = order && order.status !== 'Cancelled' ? order : null;
      const motorOrder = application.delivery_checklist?.steps?.motor_order?.data || {};
      const approvedAt = application.pending_since || application.submitted_at || '';
      const approvedTime = Date.parse(approvedAt);
      const row: PendingStockRow = {
        application,
        model: String(application.vehicle_model || '').trim(),
        colour: String(motorOrder.color || '').trim(),
        condition: String(application.vehicle_condition || '').trim(),
        negeri: String(motorOrder.negeri || '').trim(),
        approvedAt,
        waitingDays: Number.isFinite(approvedTime) ? Math.max(0, Math.floor((now - approvedTime) / 86_400_000)) : 0,
        order: activeOrder,
        overdue: Boolean(activeOrder?.status === 'Ordered' && activeOrder.eta && activeOrder.eta < today)
      };
      const group = groups.get(key) || {
        model: row.model,
        rows: [],
        freeUnits: units.filter((unit) => unit.status === 'In Stock' && !unit.reserved_application_id && !unit.sold_application_id)
      };
      group.rows.push(row);
      groups.set(key, group);
    });

  return [...groups.values()]
    .map((group) => ({ ...group, rows: group.rows.sort((left, right) => right.waitingDays - left.waitingDays) }))
    .sort((left, right) => right.rows.length - left.rows.length || left.model.localeCompare(right.model));
};
