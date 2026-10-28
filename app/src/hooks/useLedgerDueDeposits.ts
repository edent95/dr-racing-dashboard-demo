/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { requestLedgerDueDeposits } from '../lib/ledgerSync';

const DAY_KEY = 'dr_racing_ledger_due_deposits_day';
const CHECK_EVERY_MS = 60 * 60 * 1000;

const malaysiaDay = () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);

/**
 * Owner 2026-10-19: a deposit paid after delivery reaches the ledger on its own day without anyone
 * pressing a button. Once a Malaysia day per device, an Operations Manager's or Super Admin's dashboard
 * asks the server to send the deposits that fell due (the server re-runs the last week, so a day nobody
 * opened the dashboard still catches up); an open dashboard checks again every hour for a new day.
 */
export function useLedgerDueDeposits({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    const run = async () => {
      const today = malaysiaDay();
      try {
        if (window.localStorage.getItem(DAY_KEY) === today) return;
      } catch {
        // No storage: ask anyway; the server replays nothing already sent.
      }
      const getIdToken = async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true);
      const done = await requestLedgerDueDeposits(getIdToken);
      if (!done || cancelled) return;
      try {
        window.localStorage.setItem(DAY_KEY, today);
      } catch {
        // Best effort.
      }
    };
    void run();
    const timer = window.setInterval(() => { void run(); }, CHECK_EVERY_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled]);
}
