import {
  getLoanPendingAction,
  getLoanPendingWith,
  LoanStatus,
  type LoanApplication,
  type VehicleCatalogItem,
  type VehicleStockUnit
} from '../types';

export function normalizeVehicleNumberPlate(value: unknown): string {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function getVehicleStockReference(unit: VehicleStockUnit): string {
  const numberPlate = normalizeVehicleNumberPlate(unit.number_plate);
  if (numberPlate) return numberPlate;

  const legacyReference = String(unit.chassis_number || '').trim().toUpperCase();
  return legacyReference || `ID ${unit.id.slice(-8)}`;
}

const getStockModelKey = (value: unknown) => String(value || '').trim().toLowerCase();

const isActiveVehicleStockDemand = (application: LoanApplication) => {
  const finance = application.deal_finance;
  const salesSubmissionComplete = !(
    getLoanPendingWith(application) === 'Handler'
    && getLoanPendingAction(application) === 'Complete Application'
  );

  return Boolean(
    application.purchase_method
    && getStockModelKey(application.vehicle_model)
    && salesSubmissionComplete
    && application.status !== LoanStatus.REJECT
    && application.status !== LoanStatus.CANCELLED
    && finance?.sale_status !== 'Bike Delivered'
    && finance?.sale_status !== 'Cancelled'
  );
};

/**
 * Matches active customer demand to physical stock one unit at a time.
 * Explicit reservations win; remaining unreserved units cover the newest
 * submitted applications first so adding one unit resolves the next visible
 * stock task deterministically instead of one unit hiding every application.
 */
export function getApplicationIdsRequiringVehicleStock(
  applications: LoanApplication[],
  vehicleCatalog: VehicleCatalogItem[]
): Set<string> {
  const unitsByModel = new Map<string, VehicleStockUnit[]>();
  vehicleCatalog.forEach((item) => {
    const modelKey = getStockModelKey(item.model);
    if (!modelKey) return;
    unitsByModel.set(modelKey, [
      ...(unitsByModel.get(modelKey) || []),
      ...(item.stock_units || [])
    ]);
  });

  const applicationsByModel = new Map<string, LoanApplication[]>();
  applications.filter(isActiveVehicleStockDemand).forEach((application) => {
    const modelKey = getStockModelKey(application.vehicle_model);
    applicationsByModel.set(modelKey, [
      ...(applicationsByModel.get(modelKey) || []),
      application
    ]);
  });

  const requiringStock = new Set<string>();
  applicationsByModel.forEach((modelApplications, modelKey) => {
    const units = unitsByModel.get(modelKey) || [];
    const coveredApplicationIds = new Set<string>();

    modelApplications.forEach((application) => {
      const financeStockUnitId = application.deal_finance?.stock_unit_id || '';
      const hasExplicitStock = units.some((unit) => (
        Boolean(financeStockUnitId) && unit.id === financeStockUnitId
      ) || (
        unit.status === 'In Stock'
        && !unit.sold_application_id
        && unit.reserved_application_id === application.id
      ));
      if (hasExplicitStock) {
        coveredApplicationIds.add(application.id);
      }
    });

    const unreservedStockCount = units.filter((unit) => (
      unit.status === 'In Stock'
      && !unit.sold_application_id
      && !unit.reserved_application_id
    )).length;
    const unreservedDemand = modelApplications
      .filter((application) => !coveredApplicationIds.has(application.id))
      .sort((left, right) => (
        new Date(right.submitted_at || 0).getTime() - new Date(left.submitted_at || 0).getTime()
        || right.id.localeCompare(left.id)
      ));

    unreservedDemand.slice(unreservedStockCount).forEach((application) => {
      requiringStock.add(application.id);
    });
  });

  return requiringStock;
}
