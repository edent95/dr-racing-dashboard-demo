/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseApp } from './firebase';

let firebaseStorage: FirebaseStorage | null = null;

export function getFirebaseStorage() {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  if (!firebaseStorage) {
    try {
      firebaseStorage = getStorage(app);
    } catch (error) {
      console.warn('Firebase Storage is unavailable.', error);
      return null;
    }
  }

  return firebaseStorage;
}
