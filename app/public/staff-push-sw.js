/* Dr Racing staff push (shared/staffPush.mjs). Firebase Cloud Messaging delivers
 * data-only messages; this worker draws the notification and opens the dashboard.
 * No Firebase SDK here: the page registers this worker and passes it to getToken. */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Who is signed in on this device, told by the page on login / logout and kept
// in Cache Storage so it survives the worker being stopped. A push for another
// account (a device that changed hands, a logout that could not unbind while
// offline) shows no content.
const SESSION_CACHE = 'dr-racing-staff-push-session';
const SESSION_URL = '/__staff-push-session';

const readSessionUid = async () => {
  try {
    const cache = await caches.open(SESSION_CACHE);
    const response = await cache.match(SESSION_URL);
    return response ? (await response.json()).uid || '' : '';
  } catch {
    return '';
  }
};

self.addEventListener('message', (event) => {
  const message = event.data || {};
  if (message.type !== 'staff-push-session') return;
  event.waitUntil((async () => {
    const cache = await caches.open(SESSION_CACHE);
    await cache.put(SESSION_URL, new Response(JSON.stringify({ uid: String(message.uid || '') }), { headers: { 'Content-Type': 'application/json' } }));
  })());
});

const readPushData = (event) => {
  if (!event.data) return {};
  try {
    const payload = event.data.json();
    // FCM wraps the data block; accept a bare object too.
    return (payload && (payload.data || payload)) || {};
  } catch {
    return { body: event.data.text() };
  }
};

self.addEventListener('push', (event) => {
  const data = readPushData(event);
  event.waitUntil((async () => {
    const signedIn = await readSessionUid();
    // Browsers require a notification for every push, so a push for someone else
    // still shows one, without its content.
    if (data.uid && data.uid !== signedIn) {
      await self.registration.showNotification('Dr Racing', {
        body: 'Sign in to Dr Racing to see your updates.',
        tag: 'dr-racing-signed-out',
        icon: '/push-icon-192.png',
        badge: '/push-icon-192.png',
        data: { url: '/' }
      });
      return;
    }
    await self.registration.showNotification(data.title || 'Dr Racing', {
      body: data.body || '',
      tag: data.tag || data.notification_id || undefined,
      renotify: Boolean(data.tag),
      icon: '/push-icon-192.png',
      badge: '/push-icon-192.png',
      data: { url: data.url || '/', notification_id: data.notification_id || '' }
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (open) {
      await open.focus();
      return;
    }
    await self.clients.openWindow(url);
  })());
});
