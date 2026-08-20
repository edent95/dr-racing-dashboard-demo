/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase';
import { ensureFirebaseAuthUser } from '../lib/auth';

// Names of resigned/suspended staff whose orphaned workload has been dismissed
// from the Workload Transfer list. Stored in a SEPARATE Firestore doc (not the
// 1MB dashboard_state doc) so the choice persists across refresh / device / user.
const COLLECTION = 'dashboard_state';
const DOCUMENT = 'dr_racing_workload_ignore';

async function getAuthedDb() {
  if (!isFirebaseConfigured) {
    return null;
  }
  const db = getFirebaseDb();
  if (!db) {
    return null;
  }
  await ensureFirebaseAuthUser();
  return db;
}

export async function loadIgnoredWorkload(): Promise<string[]> {
  const db = await getAuthedDb();
  if (!db) {
    return [];
  }
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, DOCUMENT));
    if (!snapshot.exists()) {
      return [];
    }
    const names = (snapshot.data() || {}).names;
    return Array.isArray(names)
      ? Array.from(new Set(names.map((value) => String(value)).filter(Boolean)))
      : [];
  } catch (error) {
    console.warn('Failed to load ignored workload.', error);
    return [];
  }
}

export async function saveIgnoredWorkload(names: string[]): Promise<boolean> {
  const db = await getAuthedDb();
  if (!db) {
    return false;
  }
  try {
    await setDoc(
      doc(db, COLLECTION, DOCUMENT),
      { names: Array.from(new Set(names.filter(Boolean))), updatedAt: serverTimestamp() },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Failed to save ignored workload.', error);
    return false;
  }
}
