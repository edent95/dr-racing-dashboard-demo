/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getToken as getAppCheckToken, initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { firebaseConfig, FIREBASE_PROJECT_DISPLAY_NAME, isFirebaseConfigured } from './firebaseConfig';
export { FIREBASE_PROJECT_DISPLAY_NAME, isFirebaseConfigured } from './firebaseConfig';

let firebaseApp: FirebaseApp | null = null;
let firebaseAppCheck: AppCheck | null = null;
let firestoreDb: Firestore | null = null;
let appCheckInitialized = false;
let appCheckTokenRequest: Promise<void> | null = null;

type AppCheckDebugGlobal = typeof globalThis & {
  FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
};

function enableLocalAppCheckDebugProvider() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false;
  }

  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  if (localHosts.has(window.location.hostname) || window.location.hostname.endsWith('.localhost')) {
    const configuredDebugToken = String(import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN || '').trim();
    (globalThis as AppCheckDebugGlobal).FIREBASE_APPCHECK_DEBUG_TOKEN = configuredDebugToken || true;
    return true;
  }

  return false;
}

function initializeFirebaseAppCheck(app: FirebaseApp) {
  const siteKey = String(import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY || '').trim();
  const isLocalDebugProvider = enableLocalAppCheckDebugProvider();
  if (typeof window === 'undefined' || (!siteKey && !isLocalDebugProvider) || appCheckInitialized) {
    return;
  }

  // Local development must use Firebase's debug provider. Adding localhost to
  // the production reCAPTCHA key would let arbitrary local copies mint tokens.
  firebaseAppCheck = initializeAppCheck(app, {
    // App Check ignores this provider while debug mode is active. The local
    // fallback merely satisfies initialization when the production site key is
    // intentionally absent from a developer's environment.
    provider: new ReCaptchaEnterpriseProvider(siteKey || 'localhost-debug-provider'),
    isTokenAutoRefreshEnabled: true
  });
  appCheckInitialized = true;
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig, FIREBASE_PROJECT_DISPLAY_NAME);
    initializeFirebaseAppCheck(firebaseApp);
  }

  return firebaseApp;
}

export async function ensureFirebaseAppCheckToken() {
  getFirebaseApp();

  if (!firebaseAppCheck) {
    return;
  }

  if (!appCheckTokenRequest) {
    const appCheck = firebaseAppCheck;
    appCheckTokenRequest = (async () => {
      try {
        await getAppCheckToken(appCheck);
      } catch {
        // reCAPTCHA Enterprise can return a transient browser/network error.
        // Force one fresh assessment before allowing Firebase reads/writes.
        await getAppCheckToken(appCheck, true);
      }
    })().finally(() => {
      appCheckTokenRequest = null;
    });
  }

  await appCheckTokenRequest;
}

export function getFirebaseDb() {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  if (!firestoreDb) {
    try {
      // Offline persistence: writes made while offline are queued in
      // IndexedDB and replayed automatically when the network returns.
      // Multi-tab manager keeps several open dashboard tabs consistent.
      firestoreDb = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (error) {
      console.warn('Firebase persistent cache is unavailable; using plain Firestore.', error);
      // Fallback (e.g. unsupported browser/private mode): plain Firestore.
      firestoreDb = getFirestore(app);
    }
  }

  return firestoreDb;
}
