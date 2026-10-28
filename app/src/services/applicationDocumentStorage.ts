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
// 公开申请的文件在客户资料存进系统之后才逐个上传，超时只影响这一个文件，
// 所以给慢速手机网络留足时间。
const PUBLIC_INTAKE_UPLOAD_TIMEOUT_MS = 90000;

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

export function getPublicIntakeDocumentStoragePath(anonymousUid: string, documentSlot: string): string {
  return `customer_documents/public/${toStorageSegment(anonymousUid)}/${toStorageSegment(documentSlot)}`;
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

  const storagePath = getPublicIntakeDocumentStoragePath(anonymousUid, documentSlot);
  const storageRef = ref(storage, storagePath);

  await withStorageTimeout(
    uploadString(storageRef, fileDataUrl, 'data_url', {
      customMetadata: {
        applicationId: applicationId.trim()
      }
    }),
    'public intake document upload',
    PUBLIC_INTAKE_UPLOAD_TIMEOUT_MS
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
