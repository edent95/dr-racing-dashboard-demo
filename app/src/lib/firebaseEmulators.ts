/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Local sandbox only (`npm run sandbox`): the browser talks to the Firebase
// emulators instead of production. A production build never enables this
// because import.meta.env.DEV is false there.
export const useFirebaseEmulators = import.meta.env.DEV
  && import.meta.env.VITE_FIREBASE_EMULATORS === '1'
  && String(import.meta.env.VITE_FIREBASE_PROJECT_ID || '').startsWith('demo-');

function parseHostPort(value: unknown, fallbackPort: number) {
  const [host, port] = String(value || '').split(':');
  return { host: host || '127.0.0.1', port: Number(port) || fallbackPort };
}

export const firebaseEmulatorHosts = {
  auth: parseHostPort(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR, 9099),
  firestore: parseHostPort(import.meta.env.VITE_FIRESTORE_EMULATOR, 8080),
  storage: parseHostPort(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR, 9199)
};
