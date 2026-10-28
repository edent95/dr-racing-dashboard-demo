import { useEffect, useMemo, useRef, useState } from 'react';
import type { MultiFactorResolver, User as FirebaseUser } from 'firebase/auth';
import { INITIAL_ROLE_ACCOUNTS } from '../data/mockData';
import { verifyPassword } from '../lib/password';
import type { FirebaseStaffIdentityClaims } from '../lib/auth';
import type { RoleAccount, RoleAccountRole } from '../types';
import {
  isStaffUsernameIdentifier,
  isUsernameBackedStaffEmail,
  normalizeStaffLoginIdentifier,
  resolveStaffAuthEmail
} from '../../shared/staffLoginIdentifier.mjs';
import { classifyStaffLoginError, getStaffLoginErrorCode } from '../utils/staffLoginErrors';
import {
  DASHBOARD_CACHE_OWNER_STORAGE_KEY,
  decideCacheOwnerAction,
  hasStaffScopedCachedData,
  readCacheOwnerKey,
  toCacheOwnerKey,
  type CacheOwnerDecision
} from '../utils/dashboardCacheOwner';

export type StaffSession = {
  name: string;
  role: RoleAccountRole;
};

export const DEFAULT_STAFF_SESSION: StaffSession = {
  name: 'DEMO SUPER ADMIN',
  role: 'Super Admin'
};

const STAFF_SESSION_STORAGE_KEY = 'dr_racing_current_staff';
const STAFF_LOGGED_OUT_STORAGE_KEY = 'dr_racing_logged_out';
const STAFF_REMEMBER_EMAIL_STORAGE_KEY = 'dr_racing_remembered_staff_email';
const STAFF_REMEMBER_ME_STORAGE_KEY = 'dr_racing_remember_staff_login';

const SENSITIVE_LOCAL_STORAGE_KEYS = [
  'loan_applications_dashboard',
  'raw_customer_leads',
  'loan_error_code_definitions',
  'loan_role_accounts',
  'role_permissions',
  'role_nav_access',
  'staff_default_avatars',
  'whatsapp_tracking_links',
  'dashboard_audit_logs',
  'dashboard_notifications',
  'approval_requests',
  'whatsapp_tracking_clicks',
  'whatsapp_default_message',
  'customer_intake_short_links',
  'custom_missions',
  'reward_teams',
  'calendar_notes',
  'vehicle_tags',
  'vehicle_brand_tags',
  'vehicle_catalog',
  'vehicle_categories',
  'vehicle_brand_logos',
  'finance_profiles',
  'commission_rules',
  'channel_marketing_spend',
  'bank_definitions',
  'marketing_tag_relationships',
  'tag_normalization_rules',
  // Office network IPs, staff team assignments and penalty rules.
  'attendance_policy',
  // Excluded lead fingerprints + the staff who excluded them; merged into the
  // remote relationship meta on the next load, so it must not carry over.
  'raw_lead_import_exclusions',
  DASHBOARD_CACHE_OWNER_STORAGE_KEY
];
const FIREBASE_LOGOUT_CACHE_CLEAR_REQUEST_KEY = 'dr_racing_clear_firestore_cache_on_start';

export const isLocalhostDashboard = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1' ||
    window.location.hostname.endsWith('.localhost')
  );
};

const loadFirebaseAuthModule = async () => import('../lib/auth');

const signInFirebaseStaff = async (email: string, password: string, remember: boolean, signal: AbortSignal) => {
  const module = await loadFirebaseAuthModule();
  signal.throwIfAborted();
  return module.signInFirebaseStaff(email, password, remember, signal);
};

const getFirebaseUserStaffIdentityClaims = async (user: FirebaseUser, forceRefresh = false) => {
  const module = await loadFirebaseAuthModule();
  return module.getFirebaseUserStaffIdentityClaims(user, forceRefresh);
};

const signOutFirebaseStaff = async () => {
  const module = await loadFirebaseAuthModule();
  return module.signOutFirebaseStaff();
};

const sendFirebaseStaffPasswordReset = async (email: string) => {
  const module = await loadFirebaseAuthModule();
  return module.sendFirebaseStaffPasswordReset(email);
};

const resetDashboardSyncBookkeeping = async () => {
  const module = await import('../services/dashboardRepository');
  module.resetSyncBookkeeping();
};

const loadStaffLoginDirectory = async () => {
  const module = await import('../services/publicRepository');
  return module.loadStaffLoginDirectoryFromFirebase();
};

const requestFirestoreCacheClear = async () => {
  const module = await import('../lib/firebaseCacheCleanup');
  module.requestFirestoreCacheClearOnReload();
};

export const normalizeRoleAccountRole = (role: string): RoleAccountRole => {
  if (role === 'Super Admin' || role === 'Operations Manager' || role === 'Admin' || role === 'Sales') {
    return role;
  }

  if (role === 'Sales Advisor') {
    return 'Sales';
  }

  return 'Admin';
};

export const normalizeAuthEmail = (email?: string | null) => String(email || '').trim().toLowerCase();

export const getRoleAccountAuthEmail = (account: RoleAccount) => (
  normalizeAuthEmail(account.firebase_auth_email || account.email)
);

export const findRoleAccountForFirebaseClaims = (
  claims: FirebaseStaffIdentityClaims,
  accounts: RoleAccount[]
) => {
  if (!claims.dashboardAccountId || !claims.staffName || !claims.role) {
    return undefined;
  }

  return accounts.find((account) => (
    account.status === 'Active' &&
    account.id === claims.dashboardAccountId &&
    account.name === claims.staffName &&
    normalizeRoleAccountRole(account.role) === claims.role
  ));
};

const createLocalhostClaimsAccount = (
  user: FirebaseUser,
  claims: FirebaseStaffIdentityClaims
): RoleAccount | undefined => {
  if (
    !isLocalhostDashboard() ||
    !claims.dashboardAccountId ||
    !claims.staffName ||
    !claims.role
  ) {
    return undefined;
  }

  const email = normalizeAuthEmail(user.email);
  return {
    id: claims.dashboardAccountId,
    name: claims.staffName,
    email,
    firebase_auth_email: email,
    firebase_uid: user.uid,
    role: claims.role,
    status: 'Active'
  };
};

const resolveFirebaseRoleAccount = async (
  user: FirebaseUser,
  claims: FirebaseStaffIdentityClaims
) => {
  try {
    const staffDirectory = await loadStaffLoginDirectory();
    return findRoleAccountForFirebaseClaims(claims, staffDirectory);
  } catch (error) {
    const localAccount = createLocalhostClaimsAccount(user, claims);
    if (localAccount) {
      console.warn('Staff directory unavailable on localhost; using verified Firebase custom claims.', error);
      return localAccount;
    }
    throw error;
  }
};

const findRoleAccountForLoginIdentifier = (loginIdentifier: string, accounts: RoleAccount[]) => {
  const normalizedIdentifier = normalizeStaffLoginIdentifier(loginIdentifier);
  const resolvedEmail = resolveStaffAuthEmail(normalizedIdentifier);

  return accounts.find((account) => (
    account.status === 'Active' &&
    (
      getRoleAccountAuthEmail(account) === resolvedEmail ||
      normalizeAuthEmail(account.email) === resolvedEmail ||
      (
        isStaffUsernameIdentifier(normalizedIdentifier) &&
        !account.firebase_uid &&
        getRoleAccountAuthEmail(account).endsWith('.invalid') &&
        getRoleAccountAuthEmail(account).split('@')[0] === normalizedIdentifier
      )
    )
  ));
};

export const readStoredStaffSession = (): StaffSession => {
  if (typeof window === 'undefined') {
    return DEFAULT_STAFF_SESSION;
  }

  const saved = window.localStorage.getItem(STAFF_SESSION_STORAGE_KEY);
  if (!saved) {
    return DEFAULT_STAFF_SESSION;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<StaffSession>;
    return {
      name: parsed.name || DEFAULT_STAFF_SESSION.name,
      role: normalizeRoleAccountRole(parsed.role || DEFAULT_STAFF_SESSION.role)
    };
  } catch {
    return DEFAULT_STAFF_SESSION;
  }
};

const readStoredLoginState = (firebaseConfigured: boolean) => {
  if (typeof window === 'undefined') {
    return true;
  }

  if (window.localStorage.getItem(STAFF_LOGGED_OUT_STORAGE_KEY) === 'true') {
    return false;
  }

  return !firebaseConfigured && Boolean(window.localStorage.getItem(STAFF_SESSION_STORAGE_KEY));
};

// With Firebase, whether someone is signed in is only known after the auth
// listener has checked the persisted user, refreshed the token and read the
// staff directory, which can take several seconds. Until then the login form
// used to show, so a signed-in staff member opening /handbook (or reloading)
// saw it and signed in a second time. When this browser holds a previous staff
// session that was not logged out, show a "checking sign-in" screen instead.
export const hasRestorableStaffSession = (
  firebaseConfigured: boolean,
  storage: Pick<Storage, 'getItem'> | undefined = typeof window === 'undefined' ? undefined : window.localStorage
) => (
  firebaseConfigured
  && Boolean(storage)
  && storage!.getItem(STAFF_LOGGED_OUT_STORAGE_KEY) !== 'true'
  && Boolean(storage!.getItem(STAFF_SESSION_STORAGE_KEY))
);

// Allow token restoration plus one bounded directory read before showing login.
const SESSION_RESTORE_MAX_MS = 15_000;
const PASSWORD_LOGIN_MAX_MS = 15_000;

const readRememberMe = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(STAFF_REMEMBER_ME_STORAGE_KEY) !== 'false';
};

const readRememberedEmail = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(STAFF_REMEMBER_EMAIL_STORAGE_KEY) || '';
};

const writeRememberedLogin = (email: string, remember: boolean) => {
  localStorage.setItem(STAFF_REMEMBER_ME_STORAGE_KEY, remember ? 'true' : 'false');

  if (remember) {
    localStorage.setItem(STAFF_REMEMBER_EMAIL_STORAGE_KEY, normalizeAuthEmail(email));
  } else {
    localStorage.removeItem(STAFF_REMEMBER_EMAIL_STORAGE_KEY);
  }
};

export const clearSensitiveDashboardLocalCache = () => {
  SENSITIVE_LOCAL_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

// The stored staff session, or null when none is stored or it was logged out.
const readActiveStoredStaffSession = (): StaffSession | null => {
  if (
    typeof window === 'undefined' ||
    window.localStorage.getItem(STAFF_LOGGED_OUT_STORAGE_KEY) === 'true' ||
    !window.localStorage.getItem(STAFF_SESSION_STORAGE_KEY)
  ) {
    return null;
  }
  return readStoredStaffSession();
};

// Make sure the cached dashboard data belongs to `staff` before anyone sees
// it: clears the sensitive cache when it was written by someone else (or by
// an unknown owner), then records `staff` as the owner. `fallbackOwner` is the
// stored session from before this sign-in (see decideCacheOwnerAction).
export const reconcileDashboardCacheOwner = (
  staff: StaffSession | null,
  fallbackOwner: StaffSession | null
): CacheOwnerDecision => {
  if (typeof window === 'undefined') {
    return 'keep';
  }

  const decision = decideCacheOwnerAction({
    owner: readCacheOwnerKey(window.localStorage),
    hasCachedData: hasStaffScopedCachedData(window.localStorage),
    fallbackOwner,
    staff
  });

  if (decision === 'clear') {
    clearSensitiveDashboardLocalCache();
  }

  const ownerKey = toCacheOwnerKey(staff);
  if (ownerKey && decision !== 'keep') {
    window.localStorage.setItem(DASHBOARD_CACHE_OWNER_STORAGE_KEY, ownerKey);
  }

  return decision;
};

// Hydration entry point: before the cached state is applied on page load, the
// cache must belong to the stored (not logged-out) staff session.
export const reconcileDashboardCacheOwnerForStoredSession = () => {
  const storedStaff = readActiveStoredStaffSession();
  return reconcileDashboardCacheOwner(storedStaff, storedStaff);
};

type UseStaffSessionAuthOptions = {
  roleAccounts: RoleAccount[];
  firebaseConfigured: boolean;
  onStaffChanged: (staff: StaffSession) => void;
  onLogoutCleanup: () => void;
  onDashboardReload?: () => void;
  triggerToast: (message: string, tone?: 'success' | 'error') => void;
  translate: (zh: string, en: string, ms: string) => string;
};

export function useStaffSessionAuth({
  roleAccounts,
  firebaseConfigured,
  onStaffChanged,
  onLogoutCleanup,
  onDashboardReload,
  triggerToast,
  translate
}: UseStaffSessionAuthOptions) {
  const [loginEmail, setLoginEmail] = useState(() => readRememberedEmail());
  const [loginPassword, setLoginPassword] = useState('');
  const [mfaChallenge, setMfaChallenge] = useState<MultiFactorResolver | null>(null);
  const mfaChallengeRef = useRef<MultiFactorResolver | null>(null);
  const [mfaEnrollmentId, setMfaEnrollmentId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberLogin, setRememberLogin] = useState(() => readRememberMe());
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [loginProgress, setLoginProgress] = useState('');
  const [isPasswordResetSubmitting, setIsPasswordResetSubmitting] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [currentStaff, setCurrentStaff] = useState<StaffSession>(() => readStoredStaffSession());
  const [isLoggedIn, setIsLoggedIn] = useState(() => readStoredLoginState(firebaseConfigured));
  const [isRestoringSession, setIsRestoringSession] = useState(() => hasRestorableStaffSession(firebaseConfigured));
  const [dashboardReloadToken, setDashboardReloadToken] = useState(0);

  const availableLoginAccounts = useMemo(() => {
    const activeAccounts = roleAccounts.filter((account) => account.status === 'Active');
    if (activeAccounts.length > 0) {
      return activeAccounts;
    }
    return firebaseConfigured ? [] : INITIAL_ROLE_ACCOUNTS;
  }, [firebaseConfigured, roleAccounts]);

  // A persisted session also needs cache cleanup when Auth revokes it at startup.
  // This flag controls cleanup only; claims and directory still gate access.
  const staffSessionActiveRef = useRef(hasRestorableStaffSession(firebaseConfigured));
  const logoutInProgressRef = useRef(false);
  const passwordLoginInProgressRef = useRef(false);
  const passwordLoginAbortRef = useRef<AbortController | null>(null);
  const loginRequiresReloadRef = useRef(false);
  const sessionCheckVersionRef = useRef(0);
  const cacheResetReloadPendingRef = useRef(false);
  const onLogoutCleanupRef = useRef(onLogoutCleanup);
  onLogoutCleanupRef.current = onLogoutCleanup;

  const handleLogin = (account: RoleAccount, options: { silent?: boolean } = {}) => {
    const nextStaff = {
      name: account.name,
      role: normalizeRoleAccountRole(account.role)
    };

    if (cacheResetReloadPendingRef.current) {
      // A previous call already discarded the cache and is reloading the page.
      return;
    }

    // Whose data is cached here? Decide BEFORE the stored session is replaced,
    // so a previous staff member's customers never reach this one.
    const cacheDecision = reconcileDashboardCacheOwner(nextStaff, readActiveStoredStaffSession());
    localStorage.setItem(STAFF_SESSION_STORAGE_KEY, JSON.stringify(nextStaff));
    localStorage.removeItem(STAFF_LOGGED_OUT_STORAGE_KEY);

    if (cacheDecision === 'clear') {
      // React state still holds what was hydrated from the old cache, so never
      // render the dashboard for the new staff member in this page: reload
      // (same URL). The session survives the reload — Firebase persists it,
      // local mode reads `dr_racing_current_staff`. An interactive Firebase
      // sign-in also drops the Firestore IndexedDB cache, which is only
      // possible before startup; the silent restore path does not, because
      // that request reloads every open tab and two tabs signed in as
      // different staff would keep reloading each other.
      const clearFirestoreCache = firebaseConfigured && (!options.silent || passwordLoginInProgressRef.current);
      cacheResetReloadPendingRef.current = true;
      const reloadPage = () => window.location.reload();
      if (clearFirestoreCache) {
        void requestFirestoreCacheClear().catch(() => undefined).then(reloadPage);
      } else {
        reloadPage();
      }
      return;
    }

    if (firebaseConfigured) {
      staffSessionActiveRef.current = true;
    }

    setCurrentStaff(nextStaff);
    setIsLoggedIn(true);
    onStaffChanged(nextStaff);
    if (!options.silent) {
      triggerToast(`${translate('已登录', 'Logged in as', 'Log masuk sebagai')} ${nextStaff.name}`);
    }
  };

  const reloadDashboard = () => {
    setDashboardReloadToken((token) => token + 1);
    onDashboardReload?.();
  };

  const handlePasswordLoginSubmit = async () => {
    if (loginRequiresReloadRef.current) {
      window.location.reload();
      return;
    }
    if (passwordLoginInProgressRef.current || isPasswordResetSubmitting) {
      return;
    }

    const normalizedLoginIdentifier = normalizeStaffLoginIdentifier(loginEmail);
    const resolvedLoginEmail = resolveStaffAuthEmail(normalizedLoginIdentifier);

    if (!resolvedLoginEmail) {
      setLoginError(translate('请输入有效的用户名或 Email。', 'Enter a valid username or email.', 'Masukkan nama pengguna atau e-mel yang sah.'));
      return;
    }

    if (mfaChallenge && !/^\d{6}$/.test(mfaCode)) {
      setLoginError(translate('请输入 6 位验证码。', 'Enter the six-digit authenticator code.', 'Masukkan kod pengesah enam digit.'));
      return;
    }

    if (!mfaChallenge && !loginPassword.trim()) {
      setLoginError(translate('请输入密码。', 'Enter your password.', 'Masukkan kata laluan anda.'));
      return;
    }

    setIsLoginSubmitting(true);
    passwordLoginInProgressRef.current = true;
    sessionCheckVersionRef.current += 1;
    setLoginError('');
    setLoginProgress(translate('正在验证账号…', 'Verifying account…', 'Mengesahkan akaun…'));
    let credentialsVerified = false;
    const controller = new AbortController();
    passwordLoginAbortRef.current = controller;
    const timer = firebaseConfigured ? window.setTimeout(() => {
      loginRequiresReloadRef.current = true;
      controller.abort();
      sessionCheckVersionRef.current += 1;
      setIsLoggedIn(false);
      setIsLoginSubmitting(false);
      setIsRestoringSession(false);
      setLoginProgress('');
      setLoginError(credentialsVerified
        ? translate('账号已验证，但权限检查超过 15 秒仍未完成。请重新载入再试。', 'Account verified, but the access check did not finish within 15 seconds. Reload and try again.', 'Akaun disahkan, tetapi semakan akses tidak selesai dalam 15 saat. Muat semula dan cuba lagi.')
        : translate('登录验证超过 15 秒仍未完成。请检查网络并重新载入再试。', 'Sign-in verification did not finish within 15 seconds. Check your connection, then reload and try again.', 'Pengesahan log masuk tidak selesai dalam 15 saat. Semak sambungan, kemudian muat semula dan cuba lagi.'));
      // Timeout locks this page; signing out here would also interrupt other tabs.
    }, PASSWORD_LOGIN_MAX_MS) : undefined;
    controller.signal.addEventListener('abort', () => window.clearTimeout(timer), { once: true });

    try {
      if (firebaseConfigured) {
        const firebaseUser = mfaChallenge
          ? await (await import('../lib/staffMfa')).resolveStaffTotp(mfaChallenge, mfaEnrollmentId, mfaCode, controller.signal)
          : await signInFirebaseStaff(resolvedLoginEmail, loginPassword, rememberLogin, controller.signal);
        controller.signal.throwIfAborted();
        credentialsVerified = true;
        setLoginProgress(translate('正在检查员工权限…', 'Checking staff access…', 'Menyemak akses kakitangan…'));
        // Password sign-in just issued a fresh token; do not fetch it again.
        const claimedIdentity = await getFirebaseUserStaffIdentityClaims(firebaseUser);
        controller.signal.throwIfAborted();
        const account = await resolveFirebaseRoleAccount(firebaseUser, claimedIdentity);
        controller.signal.throwIfAborted();

        if (!account) {
          await signOutFirebaseStaff();
          controller.signal.throwIfAborted();
          setLoginError(translate('这个 Firebase 账号没有匹配到 Active 角色账号。', 'This Firebase user does not match an active role account.', 'Pengguna Firebase ini tidak sepadan dengan akaun peranan aktif.'));
          return;
        }

        if (claimedIdentity.role !== normalizeRoleAccountRole(account.role)) {
          await signOutFirebaseStaff();
          controller.signal.throwIfAborted();
          setLoginError(translate('Firebase Custom Claim 角色不匹配，请先同步员工 claims。', 'Firebase custom claim role does not match this account. Sync staff claims first.', 'Peranan tuntutan tersuai Firebase tidak sepadan dengan akaun ini. Segerakkan tuntutan kakitangan dahulu.'));
          return;
        }

        setLoginPassword('');
        mfaChallengeRef.current = null;
        setMfaChallenge(null);
        setMfaCode('');
        writeRememberedLogin(normalizedLoginIdentifier, rememberLogin);
        handleLogin(account);
        reloadDashboard();
        return;
      }

      const account = findRoleAccountForLoginIdentifier(normalizedLoginIdentifier, availableLoginAccounts);

      if (!account) {
        setLoginError(translate('这个用户名或 Email 没有匹配到 Active 角色账号。', 'This username or email does not match an active role account.', 'Nama pengguna atau e-mel ini tidak sepadan dengan akaun peranan yang aktif.'));
        return;
      }

      const isValid = await verifyPassword(loginPassword, account.password_hash || '');

      if (isValid) {
        setLoginPassword('');
        writeRememberedLogin(normalizedLoginIdentifier, rememberLogin);
        handleLogin(account);
      } else {
        setLoginError(translate('密码错误，请重试。', 'Wrong password, try again.', 'Kata laluan salah, cuba lagi.'));
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      const code = getStaffLoginErrorCode(error);
      if (code === 'auth/multi-factor-auth-required') {
        try {
          const { getStaffMfaChallenge } = await import('../lib/staffMfa');
          controller.signal.throwIfAborted();
          const challenge = getStaffMfaChallenge(error);
          mfaChallengeRef.current = challenge;
          setMfaChallenge(challenge);
          setMfaEnrollmentId(challenge?.hints.find((hint) => hint.factorId === 'totp')?.uid || '');
          setLoginPassword('');
          setMfaCode('');
        } catch {
          if (!controller.signal.aborted) setLoginError(translate('此账号需要支持的验证器，请联系管理员。', 'This account needs a supported authenticator. Contact the administrator.', 'Akaun ini memerlukan pengesah yang disokong. Hubungi pentadbir.'));
        }
        return;
      }
      if (mfaChallenge) {
        setMfaCode('');
        if (code === 'auth/invalid-verification-code') {
          setLoginError(translate('验证码不正确，请输入 App 当前显示的验证码。', 'Code not accepted. Enter the current code from your authenticator app.', 'Kod tidak diterima. Masukkan kod semasa daripada aplikasi pengesah anda.'));
          return;
        }
        if (code === 'auth/invalid-multi-factor-session' || code === 'auth/multi-factor-info-not-found' || code === 'auth/code-expired') {
          mfaChallengeRef.current = null;
          setMfaChallenge(null);
          setLoginError(translate('两步验证已过期，请重新输入密码登录。', 'Two-step verification expired. Enter your password and sign in again.', 'Pengesahan dua langkah tamat tempoh. Masukkan kata laluan dan log masuk semula.'));
          return;
        }
      }
      if (firebaseConfigured) {
        await signOutFirebaseStaff().catch(() => undefined);
      }
      if (controller.signal.aborted) return;
      const failure = classifyStaffLoginError(error);
      // Code only, never the password or the full error object, so the console
      // shows why a login failed without leaking anything.
      console.warn(`Staff login failed (${failure}${getStaffLoginErrorCode(error) ? `: ${getStaffLoginErrorCode(error)}` : ''}).`);
      if (failure === 'credentials' && !credentialsVerified) {
        setLoginError(translate('用户名 / Email 或密码错误。', 'Wrong username, email or password.', 'Nama pengguna, e-mel atau kata laluan salah.'));
      } else if (failure === 'too-many-attempts') {
        setLoginError(translate('尝试次数太多，请等几分钟再登录。', 'Too many attempts. Wait a few minutes, then sign in again.', 'Terlalu banyak cubaan. Tunggu beberapa minit, kemudian log masuk semula.'));
      } else if (failure === 'disabled') {
        setLoginError(translate('这个账号已停用，请联系 Super Admin。', 'This account is suspended. Contact the Super Admin.', 'Akaun ini digantung. Hubungi Super Admin.'));
      } else if (failure === 'connection') {
        setLoginError(credentialsVerified
          ? translate('账号已验证，但员工权限检查连接超时或中断。请重试；这不是密码错误。', 'Account verified, but the staff access check timed out or lost connection. Please retry; this is not a password error.', 'Akaun disahkan, tetapi semakan akses tamat masa atau terputus. Cuba lagi; ini bukan ralat kata laluan.')
          : translate('无法连接登录服务，登录没有完成。请检查网络后重试。', 'Could not connect to the sign-in service. Check your connection and try again.', 'Tidak dapat menyambung ke perkhidmatan log masuk. Semak sambungan dan cuba lagi.'));
      } else if (failure === 'access') {
        setLoginError(translate('员工权限检查被拒绝，登录没有完成。请联系系统管理员检查账号权限。', 'The staff access check was denied. Contact the system administrator to check account access.', 'Semakan akses kakitangan ditolak. Hubungi pentadbir sistem untuk menyemak akses akaun.'));
      } else if (failure === 'service') {
        setLoginError(translate('登录服务或安全验证暂时出错。请重试；若持续发生，请联系系统管理员。', 'The sign-in service or security check failed. Try again; if it continues, contact the system administrator.', 'Perkhidmatan log masuk atau semakan keselamatan gagal. Cuba lagi; jika berterusan, hubungi pentadbir sistem.'));
      } else {
        setLoginError(translate('登录遇到系统错误，未能完成。请重试；若持续发生，请联系系统管理员。', 'A system error prevented sign-in. Try again; if it continues, contact the system administrator.', 'Ralat sistem menghalang log masuk. Cuba lagi; jika berterusan, hubungi pentadbir sistem.'));
      }
    } finally {
      window.clearTimeout(timer);
      passwordLoginAbortRef.current = null;
      passwordLoginInProgressRef.current = false;
      setIsLoginSubmitting(false);
      setLoginProgress('');
      setIsRestoringSession(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (loginRequiresReloadRef.current) {
      window.location.reload();
      return;
    }
    if (passwordLoginInProgressRef.current || isPasswordResetSubmitting) return;
    const normalizedLoginIdentifier = normalizeStaffLoginIdentifier(loginEmail);
    const resolvedLoginEmail = resolveStaffAuthEmail(normalizedLoginIdentifier);
    setLoginError('');
    setPasswordResetMessage('');

    if (!firebaseConfigured) {
      setLoginError(translate(
        '本机模式不能发送重设密码邮件。',
        'Password-reset email is unavailable in local mode.',
        'E-mel tetapan semula kata laluan tidak tersedia dalam mod tempatan.'
      ));
      return;
    }

    if (!resolvedLoginEmail) {
      setLoginError(translate('请先输入有效的 Email。', 'Enter a valid email first.', 'Masukkan e-mel yang sah dahulu.'));
      return;
    }

    if (isUsernameBackedStaffEmail(resolvedLoginEmail)) {
      setLoginError(translate(
        '用户名账号不能接收重设密码邮件，请联系 Super Admin 重置密码。',
        'Username accounts cannot receive password-reset email. Contact Super Admin to reset the password.',
        'Akaun nama pengguna tidak boleh menerima e-mel tetapan semula kata laluan. Hubungi Pentadbir Super untuk menetapkan semula kata laluan.'
      ));
      return;
    }

    setIsPasswordResetSubmitting(true);
    try {
      await sendFirebaseStaffPasswordReset(resolvedLoginEmail);
      setPasswordResetMessage(translate(
        '如果这是有效员工账号，重设密码邮件已发送。请检查收件箱和垃圾邮件。',
        'If this is a valid staff account, a password-reset email has been sent. Check your inbox and spam folder.',
        'Jika ini akaun kakitangan yang sah, e-mel tetapan semula kata laluan telah dihantar. Semak peti masuk dan folder spam.'
      ));
    } catch {
      setLoginError(translate(
        '暂时无法发送重设密码邮件，请稍后再试或联系 Super Admin。',
        'Password-reset email could not be sent. Try again later or contact Super Admin.',
        'E-mel tetapan semula kata laluan tidak dapat dihantar. Cuba lagi kemudian atau hubungi Pentadbir Super.'
      ));
    } finally {
      setIsPasswordResetSubmitting(false);
    }
  };

  const handleLogout = async () => {
    logoutInProgressRef.current = true;
    await resetDashboardSyncBookkeeping();

    if (firebaseConfigured) {
      // Unbind this device's phone push while the session can still sign the
      // request (owner review 2026-10-19); never let it hold up the logout.
      await Promise.race([
        import('../lib/staffPush').then(({ releaseStaffPushOnLogout }) => releaseStaffPushOnLogout(
          async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(false)
        )),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]).catch(() => undefined);
      try {
        await signOutFirebaseStaff();
      } catch {
        // Local logout still clears dashboard access if Firebase sign-out fails.
      }
    }

    setIsLoggedIn(false);
    onLogoutCleanup();
    clearSensitiveDashboardLocalCache();
    localStorage.setItem(STAFF_LOGGED_OUT_STORAGE_KEY, 'true');
    await requestFirestoreCacheClear();
    triggerToast(translate('已登出', 'Logged out', 'Telah log keluar'));
    window.location.reload();
  };

  // The staff session ended without Logout (token revoked after a suspension,
  // expiry, sign-out elsewhere): run the same cleanup as Logout. The reload
  // keeps the current URL and is what lets the Firestore IndexedDB cache be
  // deleted before it is opened again.
  const endInterruptedStaffSession = async () => {
    if (!staffSessionActiveRef.current || logoutInProgressRef.current) {
      return;
    }

    staffSessionActiveRef.current = false;
    logoutInProgressRef.current = true;
    setIsLoggedIn(false);
    try {
      await resetDashboardSyncBookkeeping();
    } catch {
      // Cache cleanup below must still run.
    }
    onLogoutCleanupRef.current();
    clearSensitiveDashboardLocalCache();
    localStorage.setItem(STAFF_LOGGED_OUT_STORAGE_KEY, 'true');
    // The session is gone: release the device without it (kept for the next load if offline).
    if (firebaseConfigured) {
      await import('../lib/staffPush').then(({ releaseStaffPushOnLogout }) => releaseStaffPushOnLogout()).catch(() => undefined);
    }
    await requestFirestoreCacheClear().catch(() => undefined);
    window.location.reload();
  };

  useEffect(() => {
    if (!firebaseConfigured) {
      return () => undefined;
    }

    // Finish a phone-push unbind an earlier logout could not do (offline).
    void import('../lib/staffPush').then(({ flushPendingPushRelease }) => flushPendingPushRelease()).catch(() => undefined);
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    const endRestore = () => {
      if (!cancelled) setIsRestoringSession(false);
    };
    const restoreTimer = window.setTimeout(endRestore, SESSION_RESTORE_MAX_MS);

    loadFirebaseAuthModule()
      .then((module) => {
        if (cancelled) {
          return;
        }

        unsubscribe = module.onFirebaseAuthUserChanged((user) => {
          // The submit handler owns password sign-in, including failure cleanup.
          // An expired page stays locked until reload, including cross-tab Auth events.
          if (cancelled || passwordLoginInProgressRef.current || mfaChallengeRef.current || loginRequiresReloadRef.current) return;
          const checkVersion = ++sessionCheckVersionRef.current;
          const isCurrentCheck = () => !cancelled && checkVersion === sessionCheckVersionRef.current;
          if (!user) {
            setIsLoggedIn(false);
            endRestore();
            void endInterruptedStaffSession();
            return;
          }

          // Anonymous identity only grants data access before login/public routes.
          if (user.isAnonymous) {
            setIsLoggedIn(false);
            endRestore();
            void endInterruptedStaffSession();
            return;
          }

          module.getFirebaseUserStaffIdentityClaims(user, true).then(async (claimedIdentity) => {
            if (!isCurrentCheck()) return;
            const account = await resolveFirebaseRoleAccount(user, claimedIdentity);
            if (!isCurrentCheck()) return;

            if (!account || claimedIdentity.role !== normalizeRoleAccountRole(account.role)) {
              setIsLoggedIn(false);
              void endInterruptedStaffSession();
              return;
            }

            handleLogin(account, { silent: true });
          }).catch((error) => {
            if (!isCurrentCheck()) return;
            console.warn('Firebase custom claim check failed.', error);
            setIsLoggedIn(false);
            void endInterruptedStaffSession();
          }).finally(() => { if (isCurrentCheck()) endRestore(); });
        });
      })
      .catch((error) => {
        console.warn('Firebase auth listener failed to load.', error);
        if (!cancelled) {
          setIsLoggedIn(false);
        }
        endRestore();
      });

    return () => {
      cancelled = true;
      passwordLoginAbortRef.current?.abort();
      window.clearTimeout(restoreTimer);
      unsubscribe?.();
    };
  }, [firebaseConfigured]);

  useEffect(() => {
    const handleCrossTabLogout = (event: StorageEvent) => {
      if (event.key === FIREBASE_LOGOUT_CACHE_CLEAR_REQUEST_KEY && event.newValue) {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleCrossTabLogout);
    return () => window.removeEventListener('storage', handleCrossTabLogout);
  }, []);

  return {
    availableLoginAccounts,
    currentStaff,
    dashboardReloadToken,
    handleLogout,
    handlePasswordLoginSubmit,
    mfaFactors: mfaChallenge?.hints.filter((hint) => hint.factorId === 'totp') || [],
    mfaEnrollmentId,
    setMfaEnrollmentId,
    mfaCode,
    setMfaCode,
    cancelMfa: () => {
      if (passwordLoginInProgressRef.current || loginRequiresReloadRef.current) return;
      mfaChallengeRef.current = null;
      setMfaChallenge(null);
      setMfaCode('');
      setLoginPassword('');
      setLoginError('');
    },
    handleSendPasswordReset,
    isLoggedIn,
    isLoginSubmitting,
    isRestoringSession,
    isPasswordResetSubmitting,
    loginError,
    loginProgress,
    loginRequiresReload: loginRequiresReloadRef.current,
    loginEmail,
    loginPassword,
    passwordResetMessage,
    reloadDashboard,
    rememberLogin,
    setLoginEmail,
    setLoginError,
    setLoginPassword,
    setRememberLogin
  };
}
