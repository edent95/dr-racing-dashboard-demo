/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { beforeAuthStateChanged, browserLocalPersistence, browserSessionPersistence, EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, sendPasswordResetEmail, setPersistence, signInAnonymously, signInWithEmailAndPassword, signOut, updatePassword, type User } from 'firebase/auth';
import { getFirebaseAuth } from './firebaseAuth';
import { ensureFirebaseAppCheckToken } from './firebase';
import type { RoleAccountRole } from '../types';
import { completeStaffMfaReauthentication, type RequestStaffTotp } from './staffMfa';
import { getStaffPasswordProblem } from '../../shared/staffPasswordPolicy.mjs';
export { hashPassword, verifyPassword } from './password';

const VALID_ROLE_CLAIMS = new Set<RoleAccountRole>(['Super Admin', 'Operations Manager', 'Admin', 'Sales']);

const isLocalFirebaseHost = () => (
  typeof window !== 'undefined' &&
  (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1' ||
    window.location.hostname.endsWith('.localhost')
  )
);

export type FirebaseStaffIdentityClaims = {
  role: RoleAccountRole | '';
  staffName: string;
  dashboardAccountId: string;
};

// Firestore 规则要求所有请求至少带登录身份(匿名也算)。公开页面
// (/customer-intake、/wa、/s/{code})和员工登录前的读取用匿名登录取得
// 身份;员工正式登录后 signInWithEmailAndPassword 会替换匿名用户。
export async function ensureFirebaseAuthUser(): Promise<User | null> {
  const auth = getFirebaseAuth();

  if (!auth) {
    return null;
  }

  await ensureFirebaseAppCheckToken();
  await auth.authStateReady();

  if (auth.currentUser) {
    return auth.currentUser;
  }

  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch {
    // Anonymous provider 未开启或网络失败:调用方按未登录处理。
    return null;
  }
}

export async function rotateFirebaseAnonymousAuthUser(): Promise<User> {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }

  await auth.authStateReady();

  if (!auth.currentUser?.isAnonymous) {
    throw new Error('Public intake requires an anonymous Firebase user.');
  }

  await signOut(auth);
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function onFirebaseAuthUserChanged(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();

  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInFirebaseStaff(email: string, password: string, remember = true, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }

  // Production Auth enforces App Check; the local sandbox uses Auth emulation.
  if (!isLocalFirebaseHost()) {
    await ensureFirebaseAppCheckToken();
  }
  signal?.throwIfAborted();
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  signal?.throwIfAborted();
  // The SDK request cannot be cancelled. Block a late response before it sets
  // the Auth user; the expired login page requires a reload before retrying.
  const unsubscribe = signal ? beforeAuthStateChanged(auth, (user) => {
    if (user) signal.throwIfAborted();
  }) : () => {};
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    signal?.throwIfAborted();
    return credential.user;
  } finally {
    unsubscribe();
  }
}

export async function sendFirebaseStaffPasswordReset(email: string) {
  const auth = getFirebaseAuth();
  const normalizedEmail = email.trim().toLowerCase();

  if (!auth || !normalizedEmail) {
    throw new Error('Firebase Auth email is required.');
  }

  if (!isLocalFirebaseHost()) {
    await ensureFirebaseAppCheckToken();
  }
  await sendPasswordResetEmail(auth, normalizedEmail);
}

export async function reauthenticateCurrentFirebaseStaff(password: string, requestCode?: RequestStaffTotp): Promise<User> {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }

  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user || user.isAnonymous || !user.email) {
    throw new Error('A signed-in Firebase staff account is required.');
  }

  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } catch (error) {
    await completeStaffMfaReauthentication(error, requestCode);
  }
  if (auth.currentUser?.uid !== user.uid) {
    throw Object.assign(new Error('Account changed. Sign in again.'), { code: 'auth/user-mismatch' });
  }
  await user.getIdToken(true);
  return user;
}

export async function changeCurrentFirebaseStaffPassword(currentPassword: string, newPassword: string, requestCode?: RequestStaffTotp) {
  const problem = getStaffPasswordProblem(newPassword);
  if (problem === 'whitespace') {
    throw new Error('New password must not contain spaces.');
  }
  if (problem === 'too_short') {
    throw new Error('New password must be at least 8 characters.');
  }

  const user = await reauthenticateCurrentFirebaseStaff(currentPassword, requestCode);
  await updatePassword(user, newPassword);
  await user.getIdToken(true);
}

export async function getFirebaseUserStaffIdentityClaims(
  user: User,
  forceRefresh = false
): Promise<FirebaseStaffIdentityClaims> {
  const token = await user.getIdTokenResult(forceRefresh);
  const role = token.claims.role;

  return {
    role: typeof role === 'string' && VALID_ROLE_CLAIMS.has(role as RoleAccountRole)
      ? role as RoleAccountRole
      : '',
    staffName: typeof token.claims.staffName === 'string' ? token.claims.staffName.trim() : '',
    dashboardAccountId: typeof token.claims.dashboardAccountId === 'string'
      ? token.claims.dashboardAccountId.trim()
      : ''
  };
}

export async function getFirebaseUserRoleClaim(user: User, forceRefresh = false): Promise<RoleAccountRole | ''> {
  const identity = await getFirebaseUserStaffIdentityClaims(user, forceRefresh);

  return identity.role;
}

export async function getCurrentFirebaseIdToken(forceRefresh = false) {
  const auth = getFirebaseAuth();

  if (!auth) {
    return '';
  }

  await auth.authStateReady();
  return auth.currentUser?.getIdToken(forceRefresh) || '';
}

// Sales / Admin receive roleAccounts from the staff_dashboard projection with
// email blanked, so the User page reads the login email from Auth instead.
export async function getCurrentFirebaseStaffEmail() {
  const auth = getFirebaseAuth();

  if (!auth) {
    return '';
  }

  await auth.authStateReady();
  const user = auth.currentUser;
  return user && !user.isAnonymous ? String(user.email || '') : '';
}

export async function signOutFirebaseStaff() {
  const auth = getFirebaseAuth();

  if (!auth) {
    return;
  }

  await signOut(auth);
}
