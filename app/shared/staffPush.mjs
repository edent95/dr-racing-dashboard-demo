// Phone push for staff notifications (owner meeting 2026-10-13: staff should not
// need to pass messages around WhatsApp groups; owner 2026-10-18: "做").
//
// The dashboard already builds NotificationItem rows in dashboard_state. A client
// that creates new rows asks POST /api/staff/push/notify to push them; the server
// reads the rows itself, so a caller can only trigger a push for a notification
// that really exists, never choose its text or its recipients.
//
// Plain ESM with no imports: server.mjs and the unit tests both load it.

/** A notification older than this is not pushed (a client that reconnects after a day must not replay it). */
export const PUSH_MAX_AGE_MS = 30 * 60 * 1000;

/** At most this many notification ids per request. */
export const PUSH_MAX_IDS = 20;

/** Devices kept per staff account; the oldest is dropped beyond this. */
export const PUSH_MAX_DEVICES_PER_STAFF = 5;

export const isValidPushToken = (token) => (
  typeof token === 'string' && token.length >= 20 && token.length <= 4096 && /^[A-Za-z0-9_:\-.]+$/.test(token)
);

export const normalizePushNotificationIds = (value) => (
  Array.isArray(value)
    ? Array.from(new Set(value.filter((id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(id)))).slice(0, PUSH_MAX_IDS)
    : []
);

/**
 * Whether a stored notification should go out as a push now: not resolved, and
 * created recently (created_at is an ISO string written by the client).
 */
export const isPushableNotification = (notification, now = Date.now()) => {
  if (!notification || typeof notification !== 'object') return false;
  if (notification.resolved_at) return false;
  const createdAt = Date.parse(String(notification.created_at || ''));
  if (!Number.isFinite(createdAt)) return false;
  return now - createdAt <= PUSH_MAX_AGE_MS && createdAt - now <= 5 * 60 * 1000;
};

/**
 * The Active staff a notification is for, by the same test the dashboard uses
 * to show it (isNotificationVisibleToStaff): the staff name is a recipient, or
 * the role is a recipient role.
 *   staff: [{ uid, staff_name, role, status }]
 */
export const pickPushRecipientUids = (notification, staff) => {
  const names = new Set((notification?.recipient_staff_names || []).map((name) => String(name || '').trim()).filter(Boolean));
  const roles = new Set((notification?.recipient_roles || []).map((role) => String(role || '')));
  return Array.from(new Set(staff
    .filter((row) => row && row.status === 'Active' && row.uid)
    .filter((row) => names.has(String(row.staff_name || '').trim()) || roles.has(String(row.role || '')))
    .map((row) => row.uid)));
};

const clip = (value, size) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > size ? `${text.slice(0, size - 1)}…` : text;
};

/**
 * The FCM data payload: data-only, so the service worker (public/staff-push-sw.js)
 * draws the notification itself and opens the dashboard on the notification's target.
 */
export const buildPushData = (notification) => ({
  title: clip(notification.title || 'Dr Racing', 80),
  body: clip([notification.target_label, notification.message].filter(Boolean).join(' · '), 180),
  notification_id: String(notification.id || ''),
  target_type: String(notification.target_type || ''),
  target_id: String(notification.target_id || ''),
  url: '/?from=push',
  tag: clip(notification.dedupe_key || notification.id || 'dr-racing', 120)
});

/** FCM error codes that mean the device token is gone and should be deleted. */
export const isDeadPushTokenError = (code) => [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument'
].includes(String(code || ''));

/** How long one dashboard holds a delivery while it sends; after that another may take it over. */
export const PUSH_DELIVERY_LEASE_MS = 60 * 1000;

/**
 * Whether this request may send a notification, given its push_deliveries row:
 * no row yet, a failed attempt, or a send whose lease ran out. A row without a
 * status was written before 2026-10-21, when the row only existed once sent.
 */
export const canClaimPushDelivery = (existing, now = Date.now()) => {
  if (!existing) return true;
  if (!existing.status || existing.status === 'sent') return false;
  if (existing.status === 'sending') return Number(existing.lease_until || 0) <= now;
  return true;
};

/**
 * Pushes one notification to its recipients' devices, once however many
 * dashboards ask (audit 2026-10-21: a failed send used to block every retry).
 * push_deliveries/{id} is claimed in a transaction as 'sending' with a lease,
 * then becomes 'sent' or 'failed'. Devices that already got it are listed in
 * done_tokens, so a retry only sends to the ones that failed.
 *   Returns { outcome: 'sent' | 'skipped' | 'failed', sent }.
 */
export const deliverStaffPush = async ({ db, messaging, notification, staff, deliveriesCollection, tokensCollection, now = Date.now() }) => {
  const ref = db.collection(deliveriesCollection).doc(String(notification.id));
  const doneTokens = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists ? snapshot.data() : null;
    if (!canClaimPushDelivery(existing, now)) return null;
    const done = Array.isArray(existing?.done_tokens) ? existing.done_tokens : [];
    transaction.set(ref, {
      dedupe_key: String(notification.dedupe_key || ''),
      status: 'sending',
      lease_until: now + PUSH_DELIVERY_LEASE_MS,
      done_tokens: done,
      attempts: Number(existing?.attempts || 0) + 1,
      created_at: existing?.created_at || new Date(now),
      updated_at: new Date(now)
    });
    return done;
  });
  if (!doneTokens) return { outcome: 'skipped', sent: 0 };

  const finish = (status, done) => ref.update({ status, lease_until: 0, done_tokens: done, updated_at: new Date() });
  try {
    const uids = pickPushRecipientUids(notification, staff);
    const tokenDocs = [];
    for (let index = 0; index < uids.length; index += 30) {
      const chunk = await db.collection(tokensCollection).where('uid', 'in', uids.slice(index, index + 30)).get();
      tokenDocs.push(...chunk.docs.filter((doc) => !doneTokens.includes(doc.id)));
    }
    if (tokenDocs.length === 0) {
      await finish('sent', doneTokens);
      return { outcome: 'sent', sent: 0 };
    }
    // Each message names the account its device is bound to, so the service
    // worker shows it only while that account is the one signed in there.
    const data = buildPushData(notification);
    const result = await messaging.sendEach(tokenDocs.map((doc) => ({
      token: doc.get('token'),
      data: { ...data, uid: String(doc.get('uid') || '') },
      webpush: { headers: { Urgency: 'high', TTL: '3600' } }
    })));
    const done = [...doneTokens];
    let retryable = false;
    await Promise.all(result.responses.map((response, index) => {
      if (response.success) {
        done.push(tokenDocs[index].id);
        return null;
      }
      if (isDeadPushTokenError(response.error?.code)) return tokenDocs[index].ref.delete();
      retryable = true;
      return null;
    }));
    await finish(retryable ? 'failed' : 'sent', done);
    return { outcome: retryable ? 'failed' : 'sent', sent: result.successCount };
  } catch (error) {
    await finish('failed', doneTokens).catch(() => {}); // else the lease runs out
    throw error;
  }
};
