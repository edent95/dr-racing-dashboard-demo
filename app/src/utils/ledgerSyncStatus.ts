import type { LoanApplication, VehicleCatalogItem } from '../types';

/**
 * bo.dr-racing.com is the record; the ledger follows it (owner 2026-10-18). This
 * compares what the ledger was sent (server-only `ledger_sync` records, read
 * through GET /api/staff/ledger/status) with the deals and stock in bo, so a
 * missing or out-of-date ledger document is fixed from bo, never typed into the ledger.
 */
export interface LedgerStatusPayload {
  connected: boolean;
  /** Go-live date: deliveries and stock before it stay in the old system. */
  since: string;
  deals: Record<string, { invoiceDocNo?: string; priceCents?: number; customerCents?: number; bankCents?: number }>;
  stock: Record<string, { billDocNo?: string; sentCostCents?: number; external?: boolean }>;
}

export type LedgerRowState = 'synced' | 'missing' | 'differs';

export interface LedgerStatusRow {
  kind: 'invoice' | 'stock';
  id: string;
  label: string;
  detail: string;
  date: string;
  docNo: string;
  state: LedgerRowState;
  /** Why it differs, in plain words. */
  reason: string;
}

const cents = (value: unknown) => Math.round((Number(value) || 0) * 100);

export const buildLedgerStatusRows = (
  applications: LoanApplication[],
  vehicleCatalog: VehicleCatalogItem[],
  status: LedgerStatusPayload,
  today = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
): LedgerStatusRow[] => {
  const since = status.since || '0000-00-00';
  const invoices: LedgerStatusRow[] = applications
    .filter((application) => application.deal_finance?.sale_status === 'Bike Delivered' && (application.deal_finance.delivery_at || '') >= since)
    .map((application) => {
      const finance = application.deal_finance!;
      const record = status.deals[application.id];
      const priceCents = cents(finance.final_selling_price);
      const fullCustomerCents = cents(finance.customer_deposit_received) + cents(finance.customer_cash_payment);
      // A deposit dated after today is sent on its day (ledgerDealSync): waiting for it is not a difference.
      const depositDate = finance.customer_deposit_date || '';
      const customerCents = /^\d{4}-\d{2}-\d{2}$/.test(depositDate) && depositDate > today
        ? cents(finance.customer_cash_payment)
        : fullCustomerCents;
      const bankCents = application.purchase_method === 'Cash' ? 0 : cents(finance.bank_disbursement);
      const reasons = record?.invoiceDocNo
        ? [
            Number.isSafeInteger(record.priceCents) && record.priceCents !== priceCents ? 'price' : '',
            ![customerCents, fullCustomerCents].includes(Number(record.customerCents || 0)) ? 'customer' : '',
            Number(record.bankCents || 0) !== bankCents ? 'bank' : ''
          ].filter(Boolean)
        : [];
      return {
        kind: 'invoice' as const,
        id: application.id,
        label: application.applicant_name,
        detail: [application.vehicle_model, application.purchase_method].filter(Boolean).join(' · '),
        date: finance.delivery_at || '',
        docNo: record?.invoiceDocNo || '',
        state: !record?.invoiceDocNo ? 'missing' as const : reasons.length ? 'differs' as const : 'synced' as const,
        reason: reasons.join(',')
      };
    });
  const stock: LedgerStatusRow[] = vehicleCatalog.flatMap((item) => (item.stock_units || [])
    .filter((unit) => (unit.received_at || '') >= since)
    .map((unit) => {
      const record = status.stock[unit.id];
      const landed = cents(unit.purchase_cost) + cents(unit.transport_cost) + cents(unit.registration_cost)
        + cents(unit.accessories_cost) + cents(unit.repair_cost) + cents(unit.other_direct_cost);
      const hasDoc = Boolean(record?.billDocNo || record?.external);
      const differs = hasDoc && Number.isSafeInteger(record?.sentCostCents) && record!.sentCostCents !== landed;
      return {
        kind: 'stock' as const,
        id: unit.id,
        label: `${item.model}${unit.number_plate ? ` · ${unit.number_plate}` : ''}`,
        detail: unit.chassis_number || '',
        date: unit.received_at || '',
        docNo: record?.billDocNo || (record?.external ? 'external' : ''),
        // A unit with no chassis yet cannot reach the ledger; it shows as missing until Finance fills it.
        state: !hasDoc ? 'missing' as const : differs ? 'differs' as const : 'synced' as const,
        reason: differs ? 'cost' : !hasDoc && !unit.chassis_number ? 'no_chassis' : ''
      };
    }));
  const order: Record<LedgerRowState, number> = { missing: 0, differs: 1, synced: 2 };
  return [...invoices, ...stock].sort((left, right) => order[left.state] - order[right.state] || right.date.localeCompare(left.date));
};
