/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAuth, type Auth } from 'firebase/auth';
import { getFirebaseApp } from './firebase';

let firebaseAuth: Auth | null = null;

export function getFirebaseAuth() {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  if (!firebaseAuth) {
    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}
