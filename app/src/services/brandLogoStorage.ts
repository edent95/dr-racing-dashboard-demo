/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { getFirebaseStorage } from '../lib/firebaseStorage';

const STORAGE_UPLOAD_TIMEOUT_MS = 30000;
const STORAGE_URL_TIMEOUT_MS = 10000;

function withStorageTimeout<T>(promise: Promise<T>, operation: string, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`Firebase ${operation} timed out`));
      }, timeoutMs);
    })
  ]);
}

function slugifyBrand(brand: string): string {
  return (brand || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'brand';
}

// Brand logos live in Firebase Storage (not the dashboard_state doc) so their
// base64 never bloats the 1MB Firestore document limit. Only the download URL
// is persisted in state.
export async function uploadBrandLogoToStorage(brand: string, dataUrl: string): Promise<string> {
  const storage = getFirebaseStorage();

  if (!storage) {
    return '';
  }

  const storageRef = ref(storage, `brand_logos/${slugifyBrand(brand)}.png`);

  await withStorageTimeout(
    uploadString(storageRef, dataUrl, 'data_url'),
    'storage upload',
    STORAGE_UPLOAD_TIMEOUT_MS
  );

  return withStorageTimeout(
    getDownloadURL(storageRef),
    'storage url',
    STORAGE_URL_TIMEOUT_MS
  );
}
