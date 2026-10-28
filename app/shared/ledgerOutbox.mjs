/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Sends ledger documents for the sync modules (ledgerDealSync, ledgerStockSync) so that a timeout, a lost
// answer, two syncs of the same deal at once or a server restart can never post a document twice or
// compute a difference from a baseline the ledger never confirmed. Server-only.
//
// Each state record (`deal_<id>`, `stock_<id>` in the server-only `ledger_sync` collection) holds the
// CONFIRMED baseline plus at most one `pending` operation. One step:
//
//   1. claim, in a transaction: if the record already has a pending operation it is replayed exactly as
//      stored; otherwise `plan(record, seq)` computes the next one from the confirmed baseline and it is
//      written (fixed source key + full request body) BEFORE anything is sent. A concurrent sync that
//      loses the transaction sees the pending operation and replays it instead of computing its own delta.
//   2. send the stored body.
//   3. settle, in a transaction, only if the record still holds that same operation:
//        - 200/201 (posted now, or the ledger's earlier document for the same source key) -> confirmed:
//          the operation's `confirm` fields become the new baseline and `pending` is cleared;
//        - 4xx business refusal -> the ledger posted nothing: `pending` is cleared, the baseline stays;
//        - no answer, 5xx, 408, 429, 401, 403 -> unknown: `pending` stays and the next sync replays it
//          with the same key and payload. The ledger de-duplicates by (sourceType, sourceId) (receipts,
//          sales documents, purchase documents) or by requestId (deposit applications), so a replay of
//          something that did land returns the first document.
//
// `state` is { get(key), update(key, fn) }: `update` runs `fn(record | null)` -> { value?, result } in a
// transaction, may call `fn` more than once on contention, and writes `value` as the whole record.

import { errorCode, ledgerCall } from './ledgerClient.mjs';

const MAX_STEPS = 12;

/** What a ledger HTTP status means for a sent operation: 'confirmed', 'rejected' or 'unknown'. */
export function ledgerVerdict(status) {
  if (status === 200 || status === 201) return 'confirmed';
  if (!status || status >= 500 || [401, 403, 408, 429].includes(status)) return 'unknown';
  return 'rejected';
}

/**
 * One claim -> send -> settle. `plan(record, seq)` is pure (it may run more than once) and returns null or
 * { id, kind, method, path, body, confirm?, docNoField?, docNoFrom? }; `id` must be unique per operation
 * (it carries the source key). `onRejected(record, reason, op)` may return extra fields to store when the
 * ledger refuses. Returns { status: 'idle' } or { status, op, replayed, httpStatus, payload, reason }.
 */
export async function runLedgerStep({ state, key, plan, config, fetchImpl, onRejected = null, now = () => new Date().toISOString() }) {
  const claim = await state.update(key, (record) => {
    const current = record || {};
    if (current.pending) return { result: { op: current.pending, replayed: true } };
    const seq = Number(current.opSeq || 0) + 1;
    const planned = plan(current, seq);
    if (!planned) return { result: { op: null, replayed: false } };
    const op = { ...planned, seq, queuedAt: now() };
    return { value: { ...current, opSeq: seq, pending: op }, result: { op, replayed: false } };
  });
  if (!claim?.op) return { status: 'idle' };
  const { op, replayed } = claim;

  let answer;
  try {
    answer = await ledgerCall(config, fetchImpl, op.method, op.path, op.body);
  } catch {
    return { status: 'unknown', op, replayed, httpStatus: 0, payload: {}, reason: 'unreachable' };
  }
  const httpStatus = answer.response.status;
  const verdict = ledgerVerdict(httpStatus);
  const docNo = answer.payload?.[op.docNoFrom || 'docNo'];
  if (verdict === 'confirmed' && (typeof docNo !== 'string' || !docNo.trim())) {
    return { status: 'unknown', op, replayed, httpStatus, payload: answer.payload, reason: 'confirmation_unreadable' };
  }
  const reason = errorCode(answer.payload);
  if (verdict === 'unknown') return { status: 'unknown', op, replayed, httpStatus, payload: answer.payload, reason: reason || 'no_answer' };

  await state.update(key, (record) => {
    const current = record || {};
    // Settled already by a concurrent sync that replayed the same operation.
    if (!current.pending || current.pending.id !== op.id) return { result: false };
    const next = { ...current };
    delete next.pending;
    if (verdict === 'confirmed') {
      Object.assign(next, op.confirm || {});
      const docNo = String(answer.payload?.[op.docNoFrom || 'docNo'] || '');
      if (op.docNoField && docNo) next[op.docNoField] = docNo;
      if (op.docNoList && docNo) next[op.docNoList] = [...(Array.isArray(current[op.docNoList]) ? current[op.docNoList] : []).filter((value) => value !== docNo), docNo];
    } else if (onRejected) {
      Object.assign(next, onRejected(current, reason, op) || {});
    }
    return { value: next, result: true };
  });
  return { status: verdict, op, replayed, httpStatus, payload: answer.payload, reason };
}

/**
 * Steps until nothing is left to send, an operation's outcome is unknown, or MAX_STEPS. `plan` gets a
 * third argument, the set of operation kinds the ledger refused in this run, so a refused kind is not
 * planned again until the next sync. `context()` (optional, async) is read before each claim and handed
 * to `plan` as its fourth argument, e.g. what is still owed on the invoice right now.
 */
export async function runLedgerSteps({ state, key, plan, context = null, config, fetchImpl, onRejected = null, now }) {
  const steps = [];
  const refused = new Set();
  for (let index = 0; index < MAX_STEPS; index += 1) {
    const ctx = context ? await context() : undefined;
    if (ctx && ctx.failed) {
      steps.push({ status: 'context_failed', ...ctx });
      break;
    }
    const step = await runLedgerStep({ state, key, plan: (record, seq) => plan(record, seq, refused, ctx), config, fetchImpl, onRejected, ...(now ? { now } : {}) });
    if (step.status === 'idle') break;
    steps.push(step);
    if (step.status === 'unknown') break;
    if (step.status === 'rejected') refused.add(step.op.kind);
  }
  return steps;
}
