/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// The dashboard is the master of the ledger: after a save here, ask the server to send it on.
//   - a customer saved → its ledger contact (POST /api/staff/ledger/contacts, quiet);
//   - stock saved → purchase bill / landed costs by chassis (POST /api/staff/ledger/stock).
// Best effort, like the delivery invoice (ledgerDelivery.ts): the dashboard save already happened, a
// missing ledger connection (503) or an unreachable ledger says nothing, and a Super Admin re-run
// catches up later.

type GetIdToken = () => Promise<string>;

const post = async (path: string, body: unknown, getIdToken: GetIdToken, fetchImpl: typeof fetch) => fetchImpl(path, {
  method: 'POST',
  headers: { Authorization: `Bearer ${await getIdToken()}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/** Sends one customer to the ledger as a contact. Never throws, never tells the operator. */
export async function requestLedgerContactSync(applicationId: string, getIdToken: GetIdToken, fetchImpl: typeof fetch = fetch): Promise<void> {
  try {
    await post('/api/staff/ledger/contacts', { applicationId }, getIdToken, fetchImpl);
  } catch {
    // The ledger catches up on the next save or the Super Admin bulk sync.
  }
}

export type LedgerStockOutcome =
  | { outcome: 'posted'; count: number }
  | { outcome: 'cost_decreased'; count: number }
  | { outcome: 'skipped' | 'failed'; reason: string; count: number };

interface StockResponse {
  items?: { id: string; outcome: string; reason?: string }[];
}

/** Null when there is nothing to tell the operator, the ledger is not connected (503) or unreachable. */
export async function requestLedgerStockSync(stockUnitIds: string[], getIdToken: GetIdToken, fetchImpl: typeof fetch = fetch): Promise<LedgerStockOutcome | null> {
  const ids = stockUnitIds.filter(Boolean).slice(0, 100);
  if (ids.length === 0) return null;
  try {
    const response = await post('/api/staff/ledger/stock', { stockUnitIds: ids }, getIdToken, fetchImpl);
    if (!response.ok) return null;
    const items = ((await response.json()) as StockResponse).items || [];
    const count = (outcome: string) => items.filter((item) => item.outcome === outcome).length;
    // What needs a person first, then what was sent.
    const failed = items.find((item) => item.outcome === 'failed');
    if (failed) return { outcome: 'failed', reason: String(failed.reason || ''), count: count('failed') };
    // Quick add stock never has a chassis yet: it reaches the ledger once Finance Center fills it in.
    const skipped = items.find((item) => item.outcome === 'skipped' && item.reason !== 'no_chassis');
    if (skipped) return { outcome: 'skipped', reason: String(skipped.reason || ''), count: count('skipped') };
    if (count('cost_decreased') > 0) return { outcome: 'cost_decreased', count: count('cost_decreased') };
    if (count('posted') > 0) return { outcome: 'posted', count: count('posted') };
    return null;
  } catch {
    return null;
  }
}

/** What to tell the operator, as [zh, en, ms] for tr(), and the toast tone. */
export function ledgerStockMessage(result: LedgerStockOutcome): { text: [string, string, string]; tone: 'success' | 'warning' } {
  switch (result.outcome) {
    case 'posted':
      return { tone: 'success', text: [`已进 ledger 库存：${result.count} 台`, `Added to the ledger stock: ${result.count}`, `Ditambah ke stok ledger: ${result.count}`] };
    case 'cost_decreased':
      return {
        tone: 'warning',
        text: [
          '成本调低了：ledger 已记的成本比较高，请会计在 ledger 开供应商 credit note',
          'A cost went down below what the ledger has; the accountant needs a supplier credit note in the ledger',
          'Kos diturunkan di bawah yang direkod dalam ledger; akauntan perlu nota kredit pembekal',
        ],
      };
    default: {
      const reasons: Record<string, [string, string, string]> = {
        no_supplier: ['没填供应商', 'no supplier', 'tiada pembekal'],
        no_purchase_cost: ['没填进货价', 'no purchase cost', 'tiada kos belian'],
        no_chassis: ['没填车架号', 'no chassis number', 'tiada nombor casis'],
        no_received_date: ['没有到货日期', 'no received date', 'tiada tarikh terima'],
        duplicate_vehicle: ['这个车架号已在 ledger', 'the chassis is already in the ledger', 'casis sudah ada dalam ledger'],
        vehicle_not_in_stock: ['ledger 里这台车已经卖出', 'the ledger shows this bike as already sold', 'ledger menunjukkan motosikal ini sudah dijual'],
        item_has_stock: ['ledger 里这个车型的会计科目不同', 'the model is set up differently in the ledger', 'model disediakan secara berbeza dalam ledger'],
      };
      const [zh, en, ms] = reasons[result.reason] ?? [result.reason || '未知原因', result.reason || 'unknown reason', result.reason || 'sebab tidak diketahui'];
      return { tone: 'warning', text: [`库存已保存，但没进 ledger：${zh}`, `Stock saved, but not in the ledger: ${en}`, `Stok disimpan, tetapi tiada dalam ledger: ${ms}`] };
    }
  }
}

type ContactFields = { id: string; applicant_name?: string; ic_no?: string; phone_no?: string; personal_info?: unknown };

const contactFingerprint = (application: ContactFields) => JSON.stringify([
  application.applicant_name || '',
  application.ic_no || '',
  application.phone_no || '',
  application.personal_info || null
]);

/** Customers whose ledger contact details (name, IC, phone, email / address) are new or changed in this save. */
export function getLedgerContactChanges(previous: ContactFields[], next: ContactFields[], limit = 20): string[] {
  const before = new Map(previous.map((application) => [application.id, contactFingerprint(application)]));
  return next
    .filter((application) => application.id && before.get(application.id) !== contactFingerprint(application))
    .map((application) => application.id)
    .slice(0, limit);
}

export type LedgerFullSyncResult =
  | { connected: false }
  | {
      connected: true;
      contacts: { synced: number; failed: number };
      stock: { posted: number; failed: number; skipped: number };
      deliveries: { invoiced: number; failed: number; skipped: number };
    };

/**
 * Super Admin: send everything again in order (customers, stock since the go-live, delivered deals with
 * their settlement), e.g. right after the ledger is connected. Each step is idempotent in the ledger.
 */
export async function requestLedgerFullSync(getIdToken: GetIdToken, fetchImpl: typeof fetch = fetch): Promise<LedgerFullSyncResult> {
  const contacts = await post('/api/admin/ledger/sync-customers', {}, getIdToken, fetchImpl);
  if (contacts.status === 503) return { connected: false };
  if (!contacts.ok) throw new Error(`contacts ${contacts.status}`);
  const contactBody = await contacts.json() as { synced?: number; failed?: number };
  const stock = await post('/api/staff/ledger/stock', {}, getIdToken, fetchImpl);
  if (!stock.ok) throw new Error(`stock ${stock.status}`);
  const stockBody = await stock.json() as { posted?: number; failed?: number; skipped?: number };
  const deliveries = await post('/api/staff/ledger/delivery-invoices', {}, getIdToken, fetchImpl);
  if (!deliveries.ok) throw new Error(`deliveries ${deliveries.status}`);
  const deliveryBody = await deliveries.json() as { invoiced?: number; failed?: number; skipped?: number };
  return {
    connected: true,
    contacts: { synced: Number(contactBody.synced || 0), failed: Number(contactBody.failed || 0) },
    stock: { posted: Number(stockBody.posted || 0), failed: Number(stockBody.failed || 0), skipped: Number(stockBody.skipped || 0) },
    deliveries: { invoiced: Number(deliveryBody.invoiced || 0), failed: Number(deliveryBody.failed || 0), skipped: Number(deliveryBody.skipped || 0) }
  };
}

/** What the ledger holds per deal and stock unit (GET /api/staff/ledger/status); null when unreachable. */
export async function fetchLedgerStatus(getIdToken: GetIdToken, fetchImpl: typeof fetch = fetch): Promise<import('../utils/ledgerSyncStatus').LedgerStatusPayload | null> {
  try {
    const response = await fetchImpl('/api/staff/ledger/status', { headers: { Authorization: `Bearer ${await getIdToken()}` } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Sends deposits that arrive after delivery on their day (POST /api/staff/ledger/due-deposits). True
 * when the server answered (sent, nothing due, or the ledger is not connected), false to try again later.
 */
export async function requestLedgerDueDeposits(getIdToken: GetIdToken, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await post('/api/staff/ledger/due-deposits', {}, getIdToken, fetchImpl);
    return response.ok || response.status === 503 || response.status === 403;
  } catch {
    return false;
  }
}

export interface OpeningDepositExport {
  since: string;
  asOf: string;
  customerDeposits: { contactCode: string; contactName: string; ref: string; date: string; branchCode: string; amountCents: string }[];
  totalCents: string;
}

/**
 * Super Admin: the deposits bo took before the go-live, as `customerDeposits` rows for the ledger's
 * opening-balance import (GET /api/admin/ledger/opening-deposits/export). Null when it could not be read.
 */
export async function fetchOpeningDepositExport(getIdToken: GetIdToken, fetchImpl: typeof fetch = fetch): Promise<OpeningDepositExport | null> {
  try {
    const response = await fetchImpl('/api/admin/ledger/opening-deposits/export', { headers: { Authorization: `Bearer ${await getIdToken()}` } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
