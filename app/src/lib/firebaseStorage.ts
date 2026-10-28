/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { connectStorageEmulator, getBlob, getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import { ensureFirebaseAppCheckToken, getFirebaseApp } from './firebase';
import { firebaseEmulatorHosts, useFirebaseEmulators } from './firebaseEmulators';

let storageEmulatorConnected = false;

const withTimeout = <T,>(promise: Promise<T>, message: string, timeoutMs: number): Promise<T> => Promise.race([
  promise,
  new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(message)), timeoutMs))
]);

export function getFirebaseStorage() {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  try {
    const storage = getStorage(app);
    if (useFirebaseEmulators && !storageEmulatorConnected) {
      connectStorageEmulator(storage, firebaseEmulatorHosts.storage.host, firebaseEmulatorHosts.storage.port);
      storageEmulatorConnected = true;
    }
    return storage;
  } catch (error) {
    console.warn('Firebase Storage is unavailable.', error);
    return null;
  }
}

export async function uploadStorageDataUrl(objectName: string, dataUrl: string, fallback = ''): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) return fallback;

  const storageRef = ref(storage, objectName);
  await withTimeout(ensureFirebaseAppCheckToken(), 'Firebase security verification timed out', 10000);
  await withTimeout(uploadString(storageRef, dataUrl, 'data_url'), 'Firebase storage upload timed out', 30000);
  return withTimeout(getDownloadURL(storageRef), 'Firebase storage URL timed out', 10000);
}

export async function loadStorageLogo(url: string): Promise<Blob> {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Firebase Storage is unavailable.');
  const logoRef = ref(storage, url);
  if (logoRef.bucket !== ref(storage).bucket || !/^brand_logos\/[^/]+$/.test(logoRef.fullPath)) {
    throw new Error('Expected a public logo in this project.');
  }
  await withTimeout(ensureFirebaseAppCheckToken(), 'Firebase security verification timed out', 10000);
  return withTimeout(getBlob(logoRef, 2 * 1024 * 1024), 'Firebase logo download timed out', 10000);
}

// Bank icons and vehicle brand logos share one administrator-only object path,
// so their base64 never bloats the 1MB dashboard_state document; only the short
// download URL is persisted in state. The two keep distinct object names.
const slugify = (value: string, fallback: string) => (value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '') || fallback;

export function uploadBankIconToStorage(bankId: string, dataUrl: string): Promise<string> {
  return uploadStorageDataUrl(`brand_logos/bank-icon-${slugify(bankId, 'bank')}.png`, dataUrl, dataUrl);
}

export function uploadBrandLogoToStorage(brand: string, dataUrl: string): Promise<string> {
  return uploadStorageDataUrl(`brand_logos/${slugify(brand, 'brand')}.png`, dataUrl);
}
