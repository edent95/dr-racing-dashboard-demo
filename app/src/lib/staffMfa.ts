import {
  beforeAuthStateChanged, getMultiFactorResolver, multiFactor, sendEmailVerification, TotpMultiFactorGenerator,
  type MultiFactorError, type MultiFactorInfo, type MultiFactorResolver, type TotpSecret, type User
} from 'firebase/auth';
import { getFirebaseAuth } from './firebaseAuth';
import { ensureFirebaseAppCheckToken } from './firebase';

export type RequestStaffTotp = (factors: MultiFactorInfo[], retry: boolean, selectedEnrollmentId?: string) => Promise<{ enrollmentId: string; code: string } | null>;
export const staffMfaErrorCode = (error: unknown) => (
  error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
);

export function getStaffMfaChallenge(error: unknown): MultiFactorResolver | null {
  if (staffMfaErrorCode(error) !== 'auth/multi-factor-auth-required') return null;
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured.');
  const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
  if (!resolver.hints.some((hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
    throw Object.assign(new Error('No supported authenticator is enrolled.'), { code: 'auth/unsupported-first-factor' });
  }
  return resolver;
}

export async function resolveStaffTotp(resolver: MultiFactorResolver, enrollmentId: string, code: string, signal?: AbortSignal): Promise<User> {
  signal?.throwIfAborted();
  if (!/^\d{6}$/.test(code) || !resolver.hints.some((hint) => hint.uid === enrollmentId && hint.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
    throw Object.assign(new Error('Select an authenticator and enter its six-digit code.'), { code: 'auth/invalid-verification-code' });
  }
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured.');
  await ensureFirebaseAppCheckToken();
  signal?.throwIfAborted();
  const unsubscribe = signal ? beforeAuthStateChanged(auth, (user) => {
    if (user) signal.throwIfAborted();
  }) : () => {};
  try {
    const credential = await resolver.resolveSignIn(TotpMultiFactorGenerator.assertionForSignIn(enrollmentId, code));
    signal?.throwIfAborted();
    return credential.user;
  } finally {
    unsubscribe();
  }
}

export async function completeStaffMfaReauthentication(error: unknown, requestCode?: RequestStaffTotp): Promise<void> {
  const resolver = getStaffMfaChallenge(error);
  if (!resolver || !requestCode) throw error;
  const factors = resolver.hints.filter((hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID);
  let retry = false;
  let enrollmentId = factors[0].uid;
  for (;;) {
    const answer = await requestCode(factors, retry, enrollmentId);
    if (!answer) throw Object.assign(new Error('Verification cancelled.'), { code: 'auth/mfa-cancelled' });
    enrollmentId = answer.enrollmentId;
    try {
      await resolveStaffTotp(resolver, answer.enrollmentId, answer.code);
      return;
    } catch (failure) {
      if (staffMfaErrorCode(failure) !== 'auth/invalid-verification-code') throw failure;
      retry = true;
    }
  }
}

async function currentSuperAdmin(expectedUid?: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured.');
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user || user.isAnonymous || (expectedUid && user.uid !== expectedUid)) {
    throw Object.assign(new Error('Sign in again.'), { code: 'auth/user-mismatch' });
  }
  await user.reload();
  const token = await user.getIdTokenResult();
  if (auth.currentUser?.uid !== user.uid || token.claims.role !== 'Super Admin') {
    throw Object.assign(new Error('Super Admin access is required.'), { code: 'auth/user-mismatch' });
  }
  return user;
}

const hasUsableEmail = (user: User) => Boolean(user.email && !/\.(invalid|local|localhost|test|example)$/i.test(user.email));

export async function getStaffMfaStatus() {
  const user = await currentSuperAdmin();
  return {
    factors: multiFactor(user).enrolledFactors.filter((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID),
    emailVerified: user.emailVerified,
    hasUsableEmail: hasUsableEmail(user)
  };
}

export async function sendStaffMfaVerificationEmail() {
  const user = await currentSuperAdmin();
  if (!hasUsableEmail(user)) throw Object.assign(new Error('Update your login email first.'), { code: 'auth/invalid-email' });
  if (user.emailVerified) return false;
  await ensureFirebaseAppCheckToken();
  await sendEmailVerification(user);
  return true;
}

export async function beginStaffTotpEnrollment(expectedUid: string) {
  const user = await currentSuperAdmin(expectedUid);
  if (!user.emailVerified || !hasUsableEmail(user)) {
    throw Object.assign(new Error('Verify your login email before setting up an authenticator.'), { code: 'auth/unverified-email' });
  }
  await ensureFirebaseAppCheckToken();
  const secret = await TotpMultiFactorGenerator.generateSecret(await multiFactor(user).getSession());
  return { uid: user.uid, email: user.email!, secret };
}

export async function finishStaffTotpEnrollment(uid: string, secret: TotpSecret, code: string, name: string) {
  const user = await currentSuperAdmin(uid);
  if (!user.emailVerified || !hasUsableEmail(user)) {
    throw Object.assign(new Error('Verify your login email before setting up an authenticator.'), { code: 'auth/unverified-email' });
  }
  if (!/^\d{6}$/.test(code)) throw Object.assign(new Error('Enter six digits.'), { code: 'auth/invalid-verification-code' });
  await multiFactor(user).enroll(TotpMultiFactorGenerator.assertionForEnrollment(secret, code), name.trim().slice(0, 80) || 'Authenticator');
}

export async function removeStaffTotpFactor(uid: string, enrollmentId: string) {
  const user = await currentSuperAdmin(uid);
  if (!multiFactor(user).enrolledFactors.some((factor) => factor.uid === enrollmentId && factor.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
    throw new Error('Authenticator no longer exists. Refresh and try again.');
  }
  await multiFactor(user).unenroll(enrollmentId);
}
