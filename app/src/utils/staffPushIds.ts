import type { NotificationItem } from '../types';

/** Only rows this young are pushed; older ones arriving later (a reload, a slow sync) were seen in the app already. */
const RECENT_MS = 10 * 60 * 1000;

export const pickNewPushNotificationIds = (
  notifications: NotificationItem[],
  knownIds: Set<string>,
  now = Date.now()
) => notifications
  .filter((notification) => !knownIds.has(notification.id))
  .filter((notification) => !notification.resolved_at)
  .filter((notification) => {
    const createdAt = Date.parse(notification.created_at);
    return Number.isFinite(createdAt) && now - createdAt <= RECENT_MS;
  })
  .map((notification) => notification.id);
