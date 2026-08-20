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

function bankIconObjectName(bankId: string): string {
  const safeId = (bankId || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'bank';

  // Reuse the existing administrator-only configuration image path so this
  // migration remains compatible with the currently deployed Storage Rules.
  return `brand_logos/bank-icon-${safeId}.png`;
}

export async function uploadBankIconToStorage(bankId: string, dataUrl: string): Promise<string> {
  const storage = getFirebaseStorage();

  if (!storage) {
    return dataUrl;
  }

  const storageRef = ref(storage, bankIconObjectName(bankId));
  await withStorageTimeout(
    uploadString(storageRef, dataUrl, 'data_url'),
    'bank icon upload',
    STORAGE_UPLOAD_TIMEOUT_MS
  );

  return withStorageTimeout(
    getDownloadURL(storageRef),
    'bank icon url',
    STORAGE_URL_TIMEOUT_MS
  );
}
