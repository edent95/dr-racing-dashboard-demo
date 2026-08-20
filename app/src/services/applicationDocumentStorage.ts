/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getBlob, getMetadata, ref, uploadString } from 'firebase/storage';
import { ensureFirebaseAppCheckToken } from '../lib/firebase';
import { getFirebaseAuth } from '../lib/firebaseAuth';
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

function toStorageSegment(value: string): string {
  return encodeURIComponent(value.trim());
}

async function ensureFreshStaffStorageTokens() {
  await ensureFirebaseAppCheckToken();
  const auth = getFirebaseAuth();
  await auth?.authStateReady();

  if (auth?.currentUser && !auth.currentUser.isAnonymous) {
    await auth.currentUser.getIdToken(true);
  }
}

export async function uploadApplicationDocumentToStorage(
  applicationId: string,
  documentId: string,
  fileDataUrl: string
): Promise<string> {
  await ensureFirebaseAppCheckToken();
  const storage = getFirebaseStorage();

  if (!storage) {
    return '';
  }

  const storagePath = `customer_documents/${toStorageSegment(applicationId)}/${toStorageSegment(documentId)}`;
  const storageRef = ref(storage, storagePath);

  await withStorageTimeout(
    uploadString(storageRef, fileDataUrl, 'data_url'),
    'storage upload',
    STORAGE_UPLOAD_TIMEOUT_MS
  );

  return storagePath;
}

export async function uploadPublicIntakeDocumentToStorage(
  anonymousUid: string,
  applicationId: string,
  documentSlot: string,
  fileDataUrl: string
): Promise<string> {
  await ensureFirebaseAppCheckToken();
  const storage = getFirebaseStorage();

  if (!storage) {
    return '';
  }

  const storagePath = `customer_documents/public/${toStorageSegment(anonymousUid)}/${toStorageSegment(documentSlot)}`;
  const storageRef = ref(storage, storagePath);

  await withStorageTimeout(
    uploadString(storageRef, fileDataUrl, 'data_url', {
      customMetadata: {
        applicationId: applicationId.trim()
      }
    }),
    'public intake document upload',
    STORAGE_UPLOAD_TIMEOUT_MS
  );

  return storagePath;
}

export async function loadApplicationDocumentFromStorage(storagePath: string): Promise<string> {
  await ensureFreshStaffStorageTokens();
  const storage = getFirebaseStorage();

  if (!storage || !storagePath.startsWith('customer_documents/')) {
    return '';
  }

  const blob = await withStorageTimeout(
    getBlob(ref(storage, storagePath)),
    'storage download',
    STORAGE_URL_TIMEOUT_MS
  );

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Application document could not be read.'));
    reader.readAsDataURL(blob);
  });
}

export async function applicationDocumentExistsInStorage(storagePath: string): Promise<boolean> {
  await ensureFreshStaffStorageTokens();
  const storage = getFirebaseStorage();

  if (!storage || !storagePath.startsWith('customer_documents/')) {
    return false;
  }

  try {
    await withStorageTimeout(
      getMetadata(ref(storage, storagePath)),
      'storage metadata lookup',
      STORAGE_URL_TIMEOUT_MS
    );
    return true;
  } catch {
    return false;
  }
}
