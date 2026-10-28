/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { getFirebaseApp } from './firebase';
import { firebaseEmulatorHosts, useFirebaseEmulators } from './firebaseEmulators';

let authEmulatorConnected = false;

// getAuth(app) is already memoized per app inside the Firebase SDK.
export function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app) return null;

  const auth = getAuth(app);
  if (useFirebaseEmulators && !authEmulatorConnected) {
    connectAuthEmulator(auth, `http://${firebaseEmulatorHosts.auth.host}:${firebaseEmulatorHosts.auth.port}`, { disableWarnings: true });
    authEmulatorConnected = true;
  }
  return auth;
}
