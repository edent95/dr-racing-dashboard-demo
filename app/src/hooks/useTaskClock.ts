import { useEffect, useState } from 'react';

export const TASK_CLOCK_INTERVAL_MS = 60_000;

// Local-time midnight of the day containing `now`. Pure so task derivation and
// tests can share it; a new value appears as soon as `now` crosses midnight.
export function getStartOfDay(now: number): Date {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date;
}

// A shared "now" for time-based task rules (due today, overdue, missing
// check-out). Ticks every minute and refreshes immediately when the window
// regains focus or the tab becomes visible again, so a dashboard left open
// overnight rolls over to the new day without a reload. A change of
// `refreshKey` (e.g. the active page) also re-reads the time, so opening a page
// never shows tasks computed against a minute-old clock.
export function useTaskClock(enabled = true, refreshKey?: unknown): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const refresh = () => setNow(Date.now());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    refresh();
    const intervalId = window.setInterval(refresh, TASK_CLOCK_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) setNow(Date.now());
  }, [enabled, refreshKey]);

  return now;
}
