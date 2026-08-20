import { useEffect, useMemo, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
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

export type StaffSession = {
  name: string;
  role: RoleAccountRole;
};

export const DEFAULT_STAFF_SESSION: StaffSession = {
  name: 'Admin Director',
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
  'tag_normalization_rules'
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

const signInFirebaseStaff = async (email: string, password: string, remember: boolean) => {
  const module = await loadFirebaseAuthModule();
  return module.signInFirebaseStaff(email, password, remember);
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
  const [rememberLogin, setRememberLogin] = useState(() => readRememberMe());
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isPasswordResetSubmitting, setIsPasswordResetSubmitting] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [currentStaff, setCurrentStaff] = useState<StaffSession>(() => readStoredStaffSession());
  const [isLoggedIn, setIsLoggedIn] = useState(() => readStoredLoginState(firebaseConfigured));
  const [dashboardReloadToken, setDashboardReloadToken] = useState(0);

  const availableLoginAccounts = useMemo(() => {
    const activeAccounts = roleAccounts.filter((account) => account.status === 'Active');
    if (activeAccounts.length > 0) {
      return activeAccounts;
    }
    return firebaseConfigured ? [] : INITIAL_ROLE_ACCOUNTS;
  }, [firebaseConfigured, roleAccounts]);

  const handleLogin = (account: RoleAccount, options: { silent?: boolean } = {}) => {
    const nextStaff = {
      name: account.name,
      role: normalizeRoleAccountRole(account.role)
    };

    setCurrentStaff(nextStaff);
    setIsLoggedIn(true);
    onStaffChanged(nextStaff);
    localStorage.setItem(STAFF_SESSION_STORAGE_KEY, JSON.stringify(nextStaff));
    localStorage.removeItem(STAFF_LOGGED_OUT_STORAGE_KEY);
    if (!options.silent) {
      triggerToast(`${translate('已登录', 'Logged in as', 'Log masuk sebagai')} ${nextStaff.name}`);
    }
  };

  const reloadDashboard = () => {
    setDashboardReloadToken((token) => token + 1);
    onDashboardReload?.();
  };

  const handlePasswordLoginSubmit = async () => {
    if (isLoginSubmitting) {
      return;
    }

    const normalizedLoginIdentifier = normalizeStaffLoginIdentifier(loginEmail);
    const resolvedLoginEmail = resolveStaffAuthEmail(normalizedLoginIdentifier);

    if (!resolvedLoginEmail) {
      setLoginError(translate('请输入有效的用户名或 Email。', 'Enter a valid username or email.', 'Masukkan nama pengguna atau e-mel yang sah.'));
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError(translate('请输入密码。', 'Enter your password.', 'Masukkan kata laluan anda.'));
      return;
    }

    setIsLoginSubmitting(true);
    setLoginError('');

    try {
      if (firebaseConfigured) {
        const firebaseUser = await signInFirebaseStaff(resolvedLoginEmail, loginPassword, rememberLogin);
        const claimedIdentity = await getFirebaseUserStaffIdentityClaims(firebaseUser, true);
        const account = await resolveFirebaseRoleAccount(firebaseUser, claimedIdentity);

        if (!account) {
          await signOutFirebaseStaff();
          setLoginError(translate('这个 Firebase 账号没有匹配到 Active 角色账号。', 'This Firebase user does not match an active role account.', 'Pengguna Firebase ini tidak sepadan dengan akaun peranan aktif.'));
          return;
        }

        if (claimedIdentity.role !== normalizeRoleAccountRole(account.role)) {
          await signOutFirebaseStaff();
          setLoginError(translate('Firebase Custom Claim 角色不匹配，请先同步员工 claims。', 'Firebase custom claim role does not match this account. Sync staff claims first.', 'Peranan tuntutan tersuai Firebase tidak sepadan dengan akaun ini. Segerakkan tuntutan kakitangan dahulu.'));
          return;
        }

        setLoginPassword('');
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
    } catch {
      if (firebaseConfigured) {
        await signOutFirebaseStaff().catch(() => undefined);
      }
      setLoginError(translate('登录失败，请检查用户名 / Email 和密码。', 'Login failed. Check the username or email and password.', 'Log masuk gagal. Semak nama pengguna atau e-mel dan kata laluan.'));
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleSendPasswordReset = async () => {
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
    await resetDashboardSyncBookkeeping();

    if (firebaseConfigured) {
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

  useEffect(() => {
    if (!firebaseConfigured) {
      return () => undefined;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    loadFirebaseAuthModule()
      .then((module) => {
        if (cancelled) {
          return;
        }

        unsubscribe = module.onFirebaseAuthUserChanged((user) => {
          if (!user) {
            setIsLoggedIn(false);
            return;
          }

          // Anonymous identity only grants data access before login/public routes.
          if (user.isAnonymous) {
            setIsLoggedIn(false);
            return;
          }

          module.getFirebaseUserStaffIdentityClaims(user, true).then(async (claimedIdentity) => {
            const account = await resolveFirebaseRoleAccount(user, claimedIdentity);

            if (!account || claimedIdentity.role !== normalizeRoleAccountRole(account.role)) {
              setIsLoggedIn(false);
              return;
            }

            handleLogin(account, { silent: true });
          }).catch((error) => {
            console.warn('Firebase custom claim check failed.', error);
            setIsLoggedIn(false);
          });
        });
      })
      .catch((error) => {
        console.warn('Firebase auth listener failed to load.', error);
        if (!cancelled) {
          setIsLoggedIn(false);
        }
      });

    return () => {
      cancelled = true;
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
    handleSendPasswordReset,
    isLoggedIn,
    isLoginSubmitting,
    isPasswordResetSubmitting,
    loginError,
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
