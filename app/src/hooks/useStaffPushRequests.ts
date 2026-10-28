import { useEffect, useRef } from 'react';
import type { NotificationItem } from '../types';
import { bindStaffPushToCurrentStaff, requestStaffPush } from '../lib/staffPush';
import { pickNewPushNotificationIds } from '../utils/staffPushIds';

/** Wait for the debounced dashboard_state save before the server reads the rows. */
const SEND_DELAY_MS = 4000;

/**
 * Sends notifications that appear on this dashboard to the push endpoint. The
 * rows present when the dashboard loads are only remembered, never pushed; the
 * server ignores rows another dashboard already pushed.
 */
export function useStaffPushRequests({ notifications, enabled }: { notifications: NotificationItem[]; enabled: boolean }) {
  const knownIdsRef = useRef<Set<string> | null>(null);
  const queuedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getIdToken = async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true);

  useEffect(() => {
    if (!enabled) {
      knownIdsRef.current = null;
      return;
    }
    if (!knownIdsRef.current) {
      knownIdsRef.current = new Set(notifications.map((notification) => notification.id));
      // Bind this device to whoever is signed in now (owner review 2026-10-19).
      void (async () => {
        const { getFirebaseAuth } = await import('../lib/firebaseAuth');
        const uid = getFirebaseAuth()?.currentUser?.uid || '';
        await bindStaffPushToCurrentStaff(getIdToken, uid);
      })();
      return;
    }
    const fresh = pickNewPushNotificationIds(notifications, knownIdsRef.current);
    notifications.forEach((notification) => knownIdsRef.current?.add(notification.id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => queuedRef.current.add(id));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const ids = Array.from(queuedRef.current);
      queuedRef.current.clear();
      timerRef.current = null;
      void requestStaffPush(ids, getIdToken);
    }, SEND_DELAY_MS);
  }, [enabled, notifications]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
}
