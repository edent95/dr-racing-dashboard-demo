/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Phone push for staff (shared/staffPush.mjs has the server half). This device
// asks for permission, registers public/staff-push-sw.js, gets a Firebase Cloud
// Messaging token with the project's default web push key, and hands it to the
// server. New notifications created on this dashboard are then sent to the
// server, which pushes them to every recipient's devices.

import { getFirebaseApp } from './firebase';
import { getFirebaseAuth } from './firebaseAuth';

type GetIdToken = () => Promise<string>;

export type StaffPushState = 'unsupported' | 'not_configured' | 'needs_install' | 'blocked' | 'off' | 'on';

const TOKEN_STORAGE_KEY = 'dr_racing_staff_push_token';
const SERVICE_WORKER_PATH = '/staff-push-sw.js';
let sessionVersion = 0;

const readStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const writeStoredToken = (token: string) => {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Private mode: the device stays registered on the server until FCM drops it.
  }
};

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isStandalone = () => (
  window.matchMedia?.('(display-mode: standalone)').matches
  || (navigator as Navigator & { standalone?: boolean }).standalone === true
);

export function getStaffPushState(): StaffPushState {
  if (typeof window === 'undefined') return 'unsupported';
  if (!getFirebaseApp()) return 'not_configured';
  // iPhone / iPad only deliver web push to an app added to the Home Screen.
  if (isIos() && !isStandalone()) return 'needs_install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  return Notification.permission === 'granted' && readStoredToken() ? 'on' : 'off';
}

const post = async (path: string, body: unknown, getIdToken: GetIdToken) => fetch(path, {
  method: 'POST',
  headers: { Authorization: `Bearer ${await getIdToken()}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

const getMessagingToken = async () => {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase is not configured.');
  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: '/' });
  await navigator.serviceWorker.ready;
  const { getMessaging, getToken } = await import('firebase/messaging');
  // No vapidKey: Firebase uses its default web push key for the project.
  return getToken(getMessaging(app), { serviceWorkerRegistration: registration });
};

/** Asks for permission (must run from a click) and registers this device. */
export async function enableStaffPush(getIdToken: GetIdToken): Promise<StaffPushState> {
  const state = getStaffPushState();
  if (state === 'unsupported' || state === 'not_configured' || state === 'needs_install' || state === 'blocked') return state;
  const uid = getFirebaseAuth()?.currentUser?.uid || '';
  if (!uid) return 'off';
  const session = sessionVersion;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'blocked' : 'off';
  const token = await getMessagingToken();
  if (!token) throw new Error('No push token was issued.');
  const response = await post('/api/staff/push/register', { token }, getIdToken);
  if (!response.ok) throw new Error(`Push register failed (${response.status}).`);
  if (session !== sessionVersion || getFirebaseAuth()?.currentUser?.uid !== uid) return getStaffPushState();
  await tellServiceWorker(uid, session);
  if (session !== sessionVersion) return getStaffPushState();
  writeStoredToken(token);
  return 'on';
}

export async function disableStaffPush(getIdToken: GetIdToken): Promise<StaffPushState> {
  const token = readStoredToken();
  writeStoredToken('');
  if (token) {
    try {
      await post('/api/staff/push/unregister', { token }, getIdToken);
      const { deleteToken, getMessaging } = await import('firebase/messaging');
      const app = getFirebaseApp();
      if (app) await deleteToken(getMessaging(app));
    } catch {
      // The server drops a dead token the next time it pushes to it.
    }
  }
  return getStaffPushState();
}

const PENDING_RELEASE_KEY = 'dr_racing_staff_push_pending_release';

/** Tells this device's service worker who is signed in ('' after logout). */
const tellServiceWorker = async (uid: string, session = sessionVersion) => {
  try {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (session === sessionVersion) registration?.active?.postMessage({ type: 'staff-push-session', uid });
  } catch {
    // No worker yet: nothing can arrive for anyone.
  }
};

/**
 * On every sign-in (owner review 2026-10-19): bind this device to the account
 * signed in now, even when the token did not change, so a device that changed
 * hands stops showing the previous account's pushes. FCM rotating the token is
 * covered too.
 */
export async function bindStaffPushToCurrentStaff(getIdToken: GetIdToken, uid: string): Promise<void> {
  const session = ++sessionVersion;
  await flushPendingPushRelease();
  await tellServiceWorker(uid, session);
  if (session !== sessionVersion) return;
  if (getStaffPushState() !== 'on') return;
  try {
    const token = await getMessagingToken();
    if (!token) return;
    const response = await post('/api/staff/push/register', { token }, getIdToken);
    if (response.ok) writeStoredToken(token);
  } catch {
    // Best effort; the next sign-in tries again.
  }
}

/** Kept for the older call site: the same as binding on sign-in. */
export async function refreshStaffPushToken(getIdToken: GetIdToken, uid = ''): Promise<void> {
  await bindStaffPushToCurrentStaff(getIdToken, uid);
}

const releaseDevice = async (token: string) => {
  const response = await fetch('/api/push/release-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!response.ok) throw new Error(`release ${response.status}`);
};

/**
 * Before logout: unbind this device so the account's pushes stop here. If the
 * server cannot be reached the token is kept and released on the next page load;
 * meanwhile the service worker already knows nobody is signed in and shows no content.
 */
export async function releaseStaffPushOnLogout(getIdToken?: GetIdToken): Promise<void> {
  await tellServiceWorker('', ++sessionVersion);
  const token = readStoredToken();
  if (!token) return;
  // The next person on this device turns push on for their own account.
  writeStoredToken('');
  try {
    if (getIdToken) {
      const response = await post('/api/staff/push/unregister', { token }, getIdToken);
      if (!response.ok) throw new Error(`unregister ${response.status}`);
    } else {
      await releaseDevice(token);
    }
    try { localStorage.removeItem(PENDING_RELEASE_KEY); } catch { /* private mode */ }
  } catch {
    try { localStorage.setItem(PENDING_RELEASE_KEY, token); } catch { /* private mode */ }
  }
}

/** A logout that could not unbind is finished here, signed in or not. */
export async function flushPendingPushRelease(): Promise<void> {
  let token = '';
  try { token = localStorage.getItem(PENDING_RELEASE_KEY) || ''; } catch { return; }
  if (!token) return;
  try {
    await releaseDevice(token);
    localStorage.removeItem(PENDING_RELEASE_KEY);
  } catch {
    // Still offline; the next load tries again.
  }
}

/** Waits before each retry of a push request; after the last one the ids are dropped. */
export const STAFF_PUSH_RETRY_DELAYS_MS = [8000, 60000, 300000];

/**
 * Asks the server to push notifications this dashboard just created. Rows the
 * server cannot see yet (pending: not saved) and sends that failed come back and
 * are retried with backoff, a few times at most (the server stops pushing a
 * notification 30 minutes after it was created anyway). Never throws: the
 * in-app notification already exists.
 */
export async function requestStaffPush(notificationIds: string[], getIdToken: GetIdToken, attempt = 0): Promise<void> {
  const ids = Array.from(new Set(notificationIds.filter(Boolean))).slice(0, 20);
  if (ids.length === 0) return;
  let retryIds: string[] = [];
  try {
    const response = await post('/api/staff/push/notify', { notificationIds: ids }, getIdToken);
    if (response.ok) {
      const { pending, failed } = (await response.json()) as { pending?: string[]; failed?: string[] };
      retryIds = [...(Array.isArray(pending) ? pending : []), ...(Array.isArray(failed) ? failed : [])];
    } else if (response.status >= 500) {
      retryIds = ids;
    }
  } catch {
    retryIds = ids; // offline or the server did not answer
  }
  const delay = STAFF_PUSH_RETRY_DELAYS_MS[attempt];
  if (retryIds.length > 0 && delay !== undefined) {
    setTimeout(() => { void requestStaffPush(retryIds, getIdToken, attempt + 1); }, delay);
  }
}
