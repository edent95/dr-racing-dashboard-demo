/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// After a bike is marked delivered (or a delivered deal's settlement is saved), ask the server to raise its
// invoice in the ledger and send the settlement's differences: price notes and receipts
// (POST /api/staff/ledger/delivery-invoices, see shared/ledgerDeliverySync.mjs and ledgerDealSync.mjs).
// Best effort: the delivery itself is already saved; a failed or skipped invoice is
// reported back so the operator can fix it, and a Super Admin re-run picks it up later.

export type LedgerDeliveryOutcome =
  | { outcome: 'invoiced' | 'price_changed' | 'credit_note' | 'debit_note' | 'receipt' | 'refund_needed'; docNo: string }
  | { outcome: 'skipped' | 'failed'; reason: string };

// One save can produce several rows (invoice, a price note, receipts); the operator hears the one that
// matters most: anything that needs a person first, then what was sent.
const OUTCOME_PRIORITY = ['failed', 'skipped', 'refund_needed', 'price_changed', 'credit_note', 'debit_note', 'invoiced', 'receipt'];

interface DeliveryResponse {
  items?: { id: string; outcome: string; docNo?: string; reason?: string }[];
}

/** Null when there is nothing to tell the operator, the ledger is not connected (503) or unreachable. */
export async function requestLedgerDeliveryInvoice(
  applicationId: string,
  getIdToken: () => Promise<string>,
  fetchImpl: typeof fetch = fetch,
): Promise<LedgerDeliveryOutcome | null> {
  try {
    const response = await fetchImpl('/api/staff/ledger/delivery-invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await getIdToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as DeliveryResponse;
    const item = (payload.items || [])
      .filter((entry) => entry.id === applicationId && OUTCOME_PRIORITY.includes(entry.outcome))
      .sort((left, right) => OUTCOME_PRIORITY.indexOf(left.outcome) - OUTCOME_PRIORITY.indexOf(right.outcome))[0];
    // No row: invoiced earlier and nothing changed, or a delivery before the ledger's go-live. Nothing to say.
    if (!item) return null;
    if (item.outcome !== 'skipped' && item.outcome !== 'failed') {
      return { outcome: item.outcome as Exclude<LedgerDeliveryOutcome['outcome'], 'skipped' | 'failed'>, docNo: String(item.docNo || '') };
    }
    if (item.outcome === 'skipped' || item.outcome === 'failed') return { outcome: item.outcome, reason: String(item.reason || '') };
    return null;
  } catch {
    return null;
  }
}

/** What to tell the operator, as [zh, en, ms] for tr(), and the toast tone. */
export function ledgerDeliveryMessage(result: LedgerDeliveryOutcome): { text: [string, string, string]; tone: 'success' | 'warning' } {
  switch (result.outcome) {
    case 'invoiced':
      return { tone: 'success', text: [`Ledger 已开发票 ${result.docNo}`, `Ledger invoice ${result.docNo} raised`, `Invois ledger ${result.docNo} dikeluarkan`] };
    case 'price_changed':
      return {
        tone: 'warning',
        text: [
          `售价改了，但 ledger 发票 ${result.docNo} 已开：请会计在 ledger 开 credit / debit note 调整`,
          `The price changed after ledger invoice ${result.docNo}; the accountant needs a credit or debit note in the ledger`,
          `Harga berubah selepas invois ledger ${result.docNo}; akauntan perlu nota kredit atau debit`,
        ],
      };
    case 'credit_note':
      return { tone: 'success', text: [`售价调低：ledger 已开 credit note ${result.docNo}`, `Price lowered: ledger credit note ${result.docNo} raised`, `Harga diturunkan: nota kredit ledger ${result.docNo} dikeluarkan`] };
    case 'debit_note':
      return { tone: 'success', text: [`售价调高：ledger 已开 debit note ${result.docNo}`, `Price raised: ledger debit note ${result.docNo} raised`, `Harga dinaikkan: nota debit ledger ${result.docNo} dikeluarkan`] };
    case 'receipt':
      return { tone: 'success', text: [`Ledger 已记收款 ${result.docNo}`, `Ledger receipt ${result.docNo} recorded`, `Resit ledger ${result.docNo} direkodkan`] };
    case 'refund_needed':
      return {
        tone: 'warning',
        text: [
          `金额调低到比 ledger 已记的还少：要退钱给客户，请会计在 ledger 对发票 ${result.docNo} 办退款`,
          `An amount went below what the ledger already has: money goes back to the customer, so the accountant needs a refund on ledger invoice ${result.docNo}`,
          `Jumlah lebih rendah daripada yang direkod dalam ledger: akauntan perlu membuat bayaran balik pada invois ledger ${result.docNo}`,
        ],
      };
    default: {
      const reasons: Record<string, [string, string, string]> = {
        customer_receipt_history_unknown: ['旧收款记录无法区分订金和现金，请会计先核对，尚未新增收款', 'the earlier receipts cannot be split into deposit and cash; ask the accountant to reconcile them before sending more money', 'resit terdahulu tidak dapat dipisahkan kepada deposit dan tunai; minta akauntan menyemaknya sebelum menghantar kutipan baharu'],
        no_chassis: ['这台车没有车架号', 'this bike has no chassis number', 'motosikal ini tiada nombor casis'],
        no_price: ['没有成交价', 'there is no final selling price', 'tiada harga jualan akhir'],
        unknown_vehicle: ['这个车架号不在 ledger 库存（在面板补库存时要填供应商和进货价，才会自动进 ledger）', 'the chassis is not in the ledger stock (stock saved in the dashboard goes there once it has a supplier and purchase cost)', 'casis tiada dalam stok ledger (stok dalam papan pemuka dihantar apabila ada pembekal dan kos belian)'],
        vehicle_not_in_stock: ['ledger 里这台车已经卖出', 'the ledger shows this bike as already sold', 'ledger menunjukkan motosikal ini sudah dijual'],
        vehicle_wrong_branch: ['这台车在 ledger 里分属不同分店', 'the bike is at another branch in the ledger', 'motosikal di cawangan lain dalam ledger'],
      };
      const [zh, en, ms] = reasons[result.reason] ?? [result.reason || '未知原因', result.reason || 'unknown reason', result.reason || 'sebab tidak diketahui'];
      return { tone: 'warning', text: [`结算已保存，但 ledger 没更新：${zh}`, `Settlement saved, but the ledger was not updated: ${en}`, `Penyelesaian disimpan, tetapi ledger tidak dikemas kini: ${ms}`] };
    }
  }
}
