/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// One call to the ledger API (accounting + e-Invoice) for the server-side sync modules
// (ledgerDeliverySync, ledgerStockSync, ledgerDealSync). Server-only: `config` holds the API key.
//
// The ledger answers business errors as { error: "<code>", message }, and every amount in a
// response as a string of sen. Only the short error code ever leaves these modules: a message
// could echo personal data.

const REQUEST_TIMEOUT_MS = 15_000;

/** { response, payload } for one request; `body` is omitted for GET. Throws when the ledger is unreachable or a successful response cannot be read. */
export async function ledgerCall(config, fetchImpl, method, path, body) {
  const response = await fetchImpl(`${config.baseUrl}/api/tenants/${encodeURIComponent(config.tenantId)}${path}`, {
    method,
    headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    // A successful status alone cannot confirm which document was posted.
    if (response.ok) throw error;
  }
  return { response, payload };
}

/** The ledger's error code when it is a plain code, else ''. */
export function errorCode(payload) {
  const code = String(payload?.error || '');
  return /^[a-z_]{1,40}$/.test(code) ? code : '';
}

/** Ledger amounts come back as strings of sen; a missing or bad one reads as null. */
export function sen(value) {
  const amount = Number(value);
  return Number.isSafeInteger(amount) ? amount : null;
}

/** Today in Malaysia (UTC+8) as YYYY-MM-DD: the date a receipt recorded now carries. */
export function malaysiaToday(now = new Date()) {
  return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Where the sync remembers what it already sent, one small record per key. The ledger cannot look a
 * document up by its source, and a posted document never changes, so later edits are sent as differences
 * against this record. server.mjs keeps it in the server-only Firestore collection `ledger_sync`, and every
 * change goes through `update` (a Firestore transaction there): see ledgerOutbox.mjs.
 *
 * This in-memory copy behaves like that transaction for tests: `update(key, fn)` reads, yields (so another
 * sync can commit in between), and runs `fn` again when the record changed meanwhile. Like Firestore it
 * refuses `undefined` values.
 */
export function memoryLedgerState(initial = {}) {
  const clone = (value) => (value == null ? value : structuredClone(value));
  const records = new Map(Object.entries(initial).map(([key, value]) => [key, clone(value)]));
  const versions = new Map();
  const bump = (key) => versions.set(key, (versions.get(key) || 0) + 1);
  const refuseUndefined = (value, path) => {
    if (value === undefined) throw new Error(`ledger state ${path} is undefined`);
    if (value && typeof value === 'object') for (const [name, inner] of Object.entries(value)) refuseUndefined(inner, `${path}.${name}`);
  };
  return {
    records,
    async get(key) {
      return records.has(key) ? clone(records.get(key)) : null;
    },
    async set(key, value) {
      refuseUndefined(value, key);
      records.set(key, { ...(records.get(key) || {}), ...clone(value) });
      bump(key);
    },
    async update(key, fn) {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const version = versions.get(key) || 0;
        const outcome = fn(records.has(key) ? clone(records.get(key)) : null) || {};
        await new Promise((resolve) => setImmediate(resolve));
        if ((versions.get(key) || 0) !== version) continue;
        if (outcome.value) {
          refuseUndefined(outcome.value, key);
          records.set(key, clone(outcome.value));
          bump(key);
        }
        return outcome.result;
      }
      throw new Error('ledger state contention');
    },
  };
}
