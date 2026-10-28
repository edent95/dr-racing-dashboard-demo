// Business dates are Malaysia dates (owner review 2026-10-19): a delivery at
// 07:30 on 1 December in Penang is a 1 December delivery, even though it is
// still 30 November in UTC. Malaysia keeps UTC+8 all year (no daylight saving).
// Event timestamps stay ISO UTC; only the YYYY-MM-DD business day uses this.
// Plain ESM: server.mjs, shared/*.mjs and the client import it.

const MALAYSIA_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * YYYY-MM-DD in Malaysia for a Date, an ISO string or epoch milliseconds (default: now).
 * @param {Date | string | number} [value]
 * @returns {string}
 */
export function malaysiaDate(value = new Date()) {
  const time = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(String(value));
  if (!Number.isFinite(time)) return '';
  return new Date(time + MALAYSIA_OFFSET_MS).toISOString().slice(0, 10);
}
