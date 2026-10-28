import type { RequestStaffTotp } from '../lib/staffMfa';
/**
 * Staff account actions: role / nav access, Firebase Auth user create and
 * password reset, role account updates (with their Auth profile sync),
 * the current staff profile, avatar and preferences, workload transfer and
 * account deletion. Moved verbatim from App.tsx; every value the handlers
 * used from App's closure is now an explicit dependency under its original
 * name. The pending-update state and the workload memos stay in App.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type * as React from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type * as Repository from '../services/dashboardRepository';
import type { DashboardState } from '../services/dashboardRepository';
import { formatStaffLoginIdentifier } from '../../shared/staffLoginIdentifier.mjs';
import { assignMissingDefaultAvatars } from '../../shared/defaultAvatars.mjs';
import { type BrandedDialogOptions } from '../components/BrandedDialogProvider';
import { normalizeRoleNavAccessSettings } from '../data/roleNavAccess';
import { tr } from '../lib/i18n';
import { type AuditLogEntry, type LoanApplication, type LoanStatus, type RawCustomerLead, RoleAccount, RoleAccountRole, RoleNavAccessSetting, StaffWorkloadCase } from '../types';
import { type useDashboardPersistence } from './useDashboardPersistence';
import { type StaffSession } from './useStaffSessionAuth';

export interface AccountAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface AccountActionsDeps {
  currentStaff: StaffSession;
  acknowledgeServerDashboardStateVersion: typeof Repository.acknowledgeServerDashboardStateVersion;
  appendAuditLog: ({ action, target_type, target_id, target_label, changes, stateOverrides }: { action: string; target_type: string; target_id: string; target_label: string; changes: AuditLogEntry["changes"]; stateOverrides?: Partial<DashboardState>; }) => void;
  applications: LoanApplication[];
  applicationsRef: React.RefObject<LoanApplication[]>;
  availableDefaultAvatars: any[];
  clearSensitiveDashboardLocalCache: () => void;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => { field: string; old_value: string; new_value: string; }[];
  currentRoleAccount: RoleAccount;
  getKnownDashboardStateVersion: typeof Repository.getKnownDashboardStateVersion;
  getLeadFollowUpStorageKey: (staffName: string) => string;
  getPasswordActionErrorMessage: (error: unknown) => string;
  getWhatsAppNewTabStorageKey: (staffName: string) => string;
  IN_PROGRESS_LOAN_STATUSES: Set<LoanStatus>;
  isActiveLead: (lead: RawCustomerLead) => boolean;
  isFirebaseConfigured: boolean;
  normalizeLeadFollowUpDays: (value: unknown) => number;
  rawCustomerLeads: RawCustomerLead[];
  rawCustomerLeadsRef: React.RefObject<RawCustomerLead[]>;
  reloadDashboard: () => void;
  requestFirestoreCacheClearOnReload: () => void;
  roleAccounts: RoleAccount[];
  roleNavAccess: RoleNavAccessSetting[];
  setLeadFollowUpDays: React.Dispatch<React.SetStateAction<number>>;
  setPendingRoleAccountUpdates: React.Dispatch<React.SetStateAction<Record<string, Partial<RoleAccount>>>>;
  setRoleAccounts: React.Dispatch<React.SetStateAction<RoleAccount[]>>;
  setWhatsAppOpenInNewTab: React.Dispatch<React.SetStateAction<boolean>>;
  requestStaffTotp?: RequestStaffTotp;
  showConfirm: (options: BrandedDialogOptions) => Promise<boolean>;
  staffWorkload: { inSystem: boolean; active: boolean; name: string; customers: number; leads: number; }[];
  staffWorkloadCases: StaffWorkloadCase[];
  triggerToast: (message: string, tone?: "success" | "warning" | "error") => void;
  updateApplicationsState: (updatedList: LoanApplication[]) => Promise<boolean>;
  updateRawCustomerLeadsState: (updatedList: RawCustomerLead[]) => Promise<boolean>;
  updateRoleAccountsState: (updatedList: RoleAccount[]) => Promise<boolean>;
  updateRoleNavAccessState: (updatedList: RoleNavAccessSetting[]) => Promise<boolean>;
  waitForDashboardPersistenceIdle: () => Promise<boolean>;
  writeLocalDashboardValue: ReturnType<typeof useDashboardPersistence>['writeLocalDashboardValue'];
}

export function useAccountActions({
  currentStaff,
  acknowledgeServerDashboardStateVersion,
  appendAuditLog,
  applications,
  applicationsRef,
  availableDefaultAvatars,
  clearSensitiveDashboardLocalCache,
  createAuditChanges,
  currentRoleAccount,
  getKnownDashboardStateVersion,
  getLeadFollowUpStorageKey,
  getPasswordActionErrorMessage,
  getWhatsAppNewTabStorageKey,
  IN_PROGRESS_LOAN_STATUSES,
  isActiveLead,
  isFirebaseConfigured,
  normalizeLeadFollowUpDays,
  rawCustomerLeads,
  rawCustomerLeadsRef,
  reloadDashboard,
  requestFirestoreCacheClearOnReload,
  roleAccounts,
  roleNavAccess,
  setLeadFollowUpDays,
  setPendingRoleAccountUpdates,
  setRoleAccounts,
  setWhatsAppOpenInNewTab,
  requestStaffTotp,
  showConfirm,
  staffWorkload,
  staffWorkloadCases,
  triggerToast,
  updateApplicationsState,
  updateRawCustomerLeadsState,
  updateRoleAccountsState,
  updateRoleNavAccessState,
  waitForDashboardPersistenceIdle,
  writeLocalDashboardValue
}: AccountActionsDeps) {
  const handleUpdateRoleNavAccess = (nextSettings: RoleNavAccessSetting[]) => {
    if (currentStaff.role !== 'Super Admin') {
      triggerToast(tr('只有 Super Admin 可以修改页面访问权限。', 'Only Super Admin can change page access.', 'Hanya Super Admin boleh mengubah akses halaman.'), 'error');
      return;
    }

    const normalizedNext = normalizeRoleNavAccessSettings(nextSettings);
    const currentByKey = new Map(
      normalizeRoleNavAccessSettings(roleNavAccess).map((setting) => [
        `${setting.role}:${setting.nav_key}`,
        setting
      ])
    );
    const changes = normalizedNext
      .filter((setting) => {
        const previous = currentByKey.get(`${setting.role}:${setting.nav_key}`);
        return !previous || previous.enabled !== setting.enabled;
      })
      .map((setting) => ({
        field: `${setting.role} / ${setting.nav_key}`,
        old_value: currentByKey.get(`${setting.role}:${setting.nav_key}`)?.enabled ? 'Allow' : 'Off',
        new_value: setting.enabled ? 'Allow' : 'Off'
      }));

    updateRoleNavAccessState(normalizedNext);

    if (changes.length > 0) {
      appendAuditLog({
        action: 'UPDATE_ROLE_NAV_ACCESS',
        target_type: 'Role Access',
        target_id: 'role_nav_access',
        target_label: tr('角色访问权限', 'Role Access', "Akses Peranan"),
        changes,
        stateOverrides: { roleNavAccess: normalizedNext }
      });
    }
  };

  const handleCreateFirebaseAuthUser = async (
    account: Pick<RoleAccount, 'id' | 'name' | 'email' | 'role' | 'default_avatar_id'> & { password?: string }
  ) => {
    if (currentStaff.role !== 'Super Admin') {
      throw new Error(tr('只有 Super Admin 可以创建 Firebase Auth 用户。', 'Only Super Admin can create Firebase Auth users.', "Hanya Pentadbir Super boleh membuat pengguna Firebase Auth."));
    }

    const pendingChangesSaved = await waitForDashboardPersistenceIdle();
    if (!pendingChangesSaved) {
      throw new Error(tr(
        '尚有资料未成功同步，请重新载入后再建立账号。',
        'Some changes are not synced. Reload before creating the account.',
        'Sesetengah perubahan belum disegerakkan. Muat semula sebelum membuat akaun.'
      ));
    }

    const { getCurrentFirebaseIdToken } = await import('../lib/auth');
    const token = await getCurrentFirebaseIdToken(true);

    if (!token) {
      throw new Error(tr('请先用 Firebase Auth 的 Super Admin 账号登录。', 'Sign in with a Firebase Auth Super Admin account first.', "Log masuk dengan akaun Pentadbir Super Firebase Auth dahulu."));
    }

    const response = await fetch('/api/admin/staff-auth-users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dashboardAccountId: account.id,
        email: account.email,
        loginIdentifier: formatStaffLoginIdentifier(account.email),
        name: account.name,
        password: account.password || '',
        defaultAvatarId: account.default_avatar_id || '',
        role: account.role
      })
    });

    const payload = await response.json().catch(() => ({})) as {
      created?: boolean;
      dashboardAccountId?: string;
      email?: string;
      error?: string;
      name?: string;
      role?: RoleAccountRole;
      temporaryPassword?: string;
      uid?: string;
    };

    if (!response.ok || !payload.uid) {
      throw new Error(payload.error || tr('Firebase Auth 用户创建失败。', 'Firebase Auth user creation failed.', "Pembuatan pengguna Firebase Auth gagal."));
    }

    reloadDashboard();

    return {
      created: Boolean(payload.created),
      dashboardAccountId: payload.dashboardAccountId || account.id,
      email: payload.email || account.email,
      name: payload.name || account.name,
      role: payload.role || account.role,
      temporaryPassword: payload.temporaryPassword || '',
      uid: payload.uid
    };
  };

  const handleResetFirebaseAuthPassword = async (account: RoleAccount, password: string) => {
    if (currentStaff.role !== 'Super Admin') {
      throw new Error(tr('只有 Super Admin 可以重置 Firebase Auth 密码。', 'Only Super Admin can reset Firebase Auth passwords.', "Hanya Pentadbir Super boleh menetapkan semula kata laluan Firebase Auth."));
    }

    const { getCurrentFirebaseIdToken } = await import('../lib/auth');
    const token = await getCurrentFirebaseIdToken(true);

    if (!token) {
      throw new Error(tr('请先用 Firebase Auth 的 Super Admin 账号登录。', 'Sign in with a Firebase Auth Super Admin account first.', "Log masuk dengan akaun Pentadbir Super Firebase Auth dahulu."));
    }

    const response = await fetch('/api/admin/staff-auth-users/password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: account.firebase_auth_email || account.email,
        password,
        uid: account.firebase_uid || ''
      })
    });

    const payload = await response.json().catch(() => ({})) as {
      email?: string;
      error?: string;
      uid?: string;
    };

    if (!response.ok || !payload.uid) {
      throw new Error(payload.error || tr('Firebase Auth 密码重置失败。', 'Firebase Auth password reset failed.', "Penetapan semula kata laluan Firebase Auth gagal."));
    }

    const accountUpdates: Partial<RoleAccount> = {};

    if (!account.firebase_uid || account.firebase_uid !== payload.uid) {
      accountUpdates.firebase_uid = payload.uid;
    }

    if (payload.email && account.firebase_auth_email !== payload.email) {
      accountUpdates.firebase_auth_email = payload.email;
    }

    if (Object.keys(accountUpdates).length > 0) {
      await handleUpdateRoleAccount(account.id, accountUpdates);
    }

    appendAuditLog({
      action: 'RESET_ROLE_ACCOUNT_PASSWORD',
      target_type: 'Role Account',
      target_id: account.id,
      target_label: account.name,
      changes: [
        {
          field: 'firebase_auth_password',
          old_value: '[hidden]',
          new_value: '[reset]'
        }
      ]
    });

    triggerToast(tr(`已重置 ${account.name} 的 Firebase 密码`, `${account.name}'s Firebase password was reset`, `Kata laluan Firebase ${account.name} telah ditetapkan semula`));
  };

  const syncRoleAccountAuthProfile = async (previous: RoleAccount, next: RoleAccount) => {
    const { getCurrentFirebaseIdToken } = await import('../lib/auth');
    const token = await getCurrentFirebaseIdToken(true);

    if (!token) {
      throw new Error(tr('请先重新登录 Super Admin。', 'Sign in as Super Admin again.', 'Log masuk semula sebagai Super Admin.'));
    }

    const response = await fetch('/api/admin/staff-auth-users', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: previous.firebase_uid || '',
        currentEmail: previous.firebase_auth_email || previous.email,
        email: next.email,
        name: next.name,
        role: next.role,
        status: next.status,
        dashboardAccountId: next.id,
        expectedVersion: getKnownDashboardStateVersion()
      })
    });
    const payload = await response.json().catch(() => ({})) as {
      uid?: string;
      email?: string;
      error?: string;
      renamed?: boolean;
      version?: number;
    };

    if (!response.ok || !payload.uid) {
      const serverMessage = String(payload.error || '');
      if (serverMessage.includes('Staff name is already in use')) {
        throw new Error(tr('员工姓名已被使用。', 'Staff name is already in use.', 'Nama kakitangan sudah digunakan.'));
      }
      if (serverMessage.includes('cannot suspend or demote')) {
        throw new Error(tr('不能停用或降级自己正在使用的账号。', 'You cannot suspend or demote the account you are signed in with.', 'Anda tidak boleh menggantung atau menurunkan akaun yang sedang anda gunakan.'));
      }
      if (serverMessage.includes('not found in the dashboard') || serverMessage.includes('changed before')) {
        throw new Error(tr('账号资料已在别处更改，请重新载入后再试。', 'Account data changed elsewhere. Reload and try again.', 'Data akaun berubah di tempat lain. Muat semula dan cuba lagi.'));
      }
      throw new Error(serverMessage || tr('Firebase 账号同步失败。', 'Firebase account synchronization failed.', 'Penyegerakan akaun Firebase gagal.'));
    }

    return payload;
  };

  const handleUpdateRoleAccount = async (id: string, updates: Partial<RoleAccount>) => {
    const previous = roleAccounts.find((account) => account.id === id);
    const normalizedUpdates: Partial<RoleAccount> = { ...updates };

    // server.mjs stores the staffName claim trimmed and space-collapsed, and
    // login matches the claim to roleAccounts by exact name. Store the same
    // form here, or a rename like "Ali " locks that staff member out.
    if (
      previous &&
      previous.name === currentStaff.name &&
      (
        (normalizedUpdates.role !== undefined && normalizedUpdates.role !== previous.role) ||
        (normalizedUpdates.status !== undefined && normalizedUpdates.status !== 'Active')
      )
    ) {
      triggerToast(tr(
        '不能停用或更改自己正在使用的账号角色。请用另一个 Super Admin 账号操作。',
        'You cannot suspend or change the role of the account you are signed in with. Use another Super Admin account.',
        'Anda tidak boleh menggantung atau menukar peranan akaun yang sedang anda gunakan. Gunakan akaun Pentadbir Super lain.'
      ), 'error');
      return false;
    }

    if (typeof normalizedUpdates.name === 'string') {
      normalizedUpdates.name = normalizedUpdates.name.trim().replace(/\s+/g, ' ');
      if (!normalizedUpdates.name) {
        triggerToast(tr('员工姓名不能为空。', 'Staff name cannot be empty.', 'Nama kakitangan tidak boleh kosong.'), 'error');
        return false;
      }
    }

    if (
      previous &&
      typeof normalizedUpdates.name === 'string' &&
      roleAccounts.some((account) => account.id !== id && account.name.toLowerCase() === normalizedUpdates.name?.trim().toLowerCase())
    ) {
      triggerToast(tr('员工姓名必须唯一。', 'Staff names must be unique.', 'Nama kakitangan mestilah unik.'), 'error');
      return false;
    }

    if ('avatar_data_url' in updates && !('default_avatar_id' in updates)) {
      normalizedUpdates.default_avatar_id = '';
    }

    if (normalizedUpdates.default_avatar_id) {
      const targetDefaultAvatar = availableDefaultAvatars.find((avatar) => avatar.id === normalizedUpdates.default_avatar_id);
      const assignedAccount = roleAccounts.find((account) => (
        account.id !== id &&
        (
          account.default_avatar_id === normalizedUpdates.default_avatar_id ||
          Boolean(targetDefaultAvatar && !account.default_avatar_id && account.avatar_data_url === targetDefaultAvatar.avatar_data_url)
        )
      ));

      if (assignedAccount) {
        triggerToast(tr(`默认头像已被 ${assignedAccount.name} 使用`, `Default avatar already used by ${assignedAccount.name}`, `Avatar lalai sudah digunakan oleh ${assignedAccount.name}`));
        return false;
      }
    }

    // Local mode (Firebase not configured) has no Auth users or server to
    // sync with; the edit is saved locally below like every other local edit.
    if (previous && currentStaff.role === 'Super Admin' && isFirebaseConfigured) {
      const nextAccount = { ...previous, ...normalizedUpdates };
      const authBoundaryChanged = (
        nextAccount.name !== previous.name ||
        nextAccount.email !== previous.email ||
        nextAccount.role !== previous.role ||
        nextAccount.status !== previous.status
      );

      if (authBoundaryChanged) {
        setPendingRoleAccountUpdates((current) => ({ ...current, [id]: { ...current[id], ...normalizedUpdates } }));
        try {
          // The server now writes the Role Account itself and bumps the
          // dashboard version, so land queued edits first or they would
          // conflict and be lost.
          if (!(await waitForDashboardPersistenceIdle())) {
            triggerToast(tr(
              '还有未保存到云端的修改，请等同步完成后再改账号。',
              'Some edits have not synced to the cloud yet. Wait for sync to finish, then edit the account again.',
              'Sesetengah suntingan belum disegerakkan ke awan. Tunggu penyegerakan selesai, kemudian edit akaun semula.'
            ), 'error');
            return false;
          }
          const synced = await syncRoleAccountAuthProfile(previous, nextAccount);
          if (synced.renamed) {
            // The server renamed every reference (customers, leads,
            // attendance, leave, calendar, links, missions, approvals...).
            // Reload instead of saving this tab's pre-rename copy over it.
            triggerToast(tr(
              `已改名为 ${nextAccount.name}，所有相关记录已同步，正在重新载入。`,
              `Renamed to ${nextAccount.name}; every related record was updated. Reloading.`,
              `Nama ditukar kepada ${nextAccount.name}; semua rekod berkaitan dikemas kini. Memuat semula.`
            ));
            reloadDashboard();
            return true;
          }
          if (typeof synced.version === 'number') {
            acknowledgeServerDashboardStateVersion(synced.version);
          }
          normalizedUpdates.firebase_uid = synced.uid || previous.firebase_uid;
          normalizedUpdates.firebase_auth_email = synced.email || nextAccount.email;
        } catch (error) {
          const message = error instanceof Error ? error.message : tr('Firebase 账号同步失败。', 'Firebase account synchronization failed.', 'Penyegerakan akaun Firebase gagal.');
          triggerToast(message, 'error');
          return false;
        } finally {
          setPendingRoleAccountUpdates((current) => {
            const { [id]: _settled, ...rest } = current;
            return rest;
          });
        }
      }
    }

    const next = roleAccounts.map((account) => (
      account.id === id
        ? { ...account, ...normalizedUpdates }
        : account
    ));
    const nextName = typeof normalizedUpdates.name === 'string' ? normalizedUpdates.name.trim() : previous?.name;
    const renamed = Boolean(previous && nextName && nextName !== previous.name);
    // Read the latest lists: this runs after the Auth-sync awaits above, and
    // the render-time arrays would write other staff's rows back stale.
    const migratedApplications = renamed && previous
      ? applicationsRef.current.map((application) => ({
        ...application,
        handler_name: application.handler_name === previous.name ? nextName : application.handler_name,
        admin_owner_name: application.admin_owner_name === previous.name ? nextName : application.admin_owner_name
      }))
      : applicationsRef.current;
    const migratedRawLeads = renamed && previous
      ? rawCustomerLeadsRef.current.map((lead) => ({
        ...lead,
        created_by_staff_name: lead.created_by_staff_name === previous.name ? nextName : lead.created_by_staff_name,
        taken_by_staff_name: lead.taken_by_staff_name === previous.name ? nextName : lead.taken_by_staff_name
      }))
      : rawCustomerLeadsRef.current;

    updateRoleAccountsState(next);
    if (renamed) {
      updateApplicationsState(migratedApplications);
      updateRawCustomerLeadsState(migratedRawLeads);
    }

    if (previous) {
      appendAuditLog({
        action: 'UPDATE_ROLE_ACCOUNT',
        target_type: 'Role Account',
        target_id: id,
        target_label: previous.name,
        changes: createAuditChanges(previous, { ...previous, ...normalizedUpdates }),
        // Only a rename changes customers/leads; otherwise leave them to the
        // latest state instead of pinning a snapshot into this save.
        stateOverrides: renamed
          ? {
            roleAccounts: next,
            applications: migratedApplications,
            rawCustomerLeads: migratedRawLeads
          }
          : { roleAccounts: next }
      });

    }

    return true;
  };

  const handleUpdateCurrentStaffProfile = async (name: string, email: string, currentPassword: string) => {
    if (!isFirebaseConfigured) {
      throw new Error(tr(
        '本机模式不能修改 Firebase 登录资料。',
        'Firebase login details cannot be updated in local mode.',
        'Butiran log masuk Firebase tidak boleh dikemas kini dalam mod tempatan.'
      ));
    }

    try {
      const { reauthenticateCurrentFirebaseStaff } = await import('../lib/auth');
      const user = await reauthenticateCurrentFirebaseStaff(currentPassword, requestStaffTotp);
      const token = await user.getIdToken(true);
      const response = await fetch('/api/staff/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name })
      });
      const payload = await response.json().catch(() => ({})) as { email?: string; error?: string; name?: string };

      if (!response.ok || !payload.name || !payload.email) {
        const serverMessage = String(payload.error || '');
        if (serverMessage.includes('Staff name is already in use')) {
          throw new Error(tr('员工姓名已被使用。', 'Staff name is already in use.', 'Nama kakitangan sudah digunakan.'));
        }
        if (serverMessage.includes('Email is already in use')) {
          throw new Error(tr('Email 已被其他账号使用。', 'Email is already in use by another account.', 'E-mel sudah digunakan oleh akaun lain.'));
        }
        if (serverMessage.includes('Role Account no longer matches')) {
          throw new Error(tr('账号资料已在其他设备更改，请重新登录。', 'Account information changed elsewhere. Sign in again.', 'Maklumat akaun berubah di tempat lain. Log masuk semula.'));
        }
        throw new Error(serverMessage || tr('账号资料更新失败。', 'Account information update failed.', 'Kemas kini maklumat akaun gagal.'));
      }

      await user.reload();
      await user.getIdToken(true);
      window.localStorage.setItem('dr_racing_current_staff', JSON.stringify({
        name: payload.name,
        role: currentStaff.role
      }));
      if (window.localStorage.getItem('dr_racing_remembered_staff_email') !== null) {
        window.localStorage.setItem('dr_racing_remembered_staff_email', formatStaffLoginIdentifier(payload.email));
      }
      clearSensitiveDashboardLocalCache();
      requestFirestoreCacheClearOnReload();
      window.location.replace(`/?profileUpdated=${Date.now()}`);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw new Error(getPasswordActionErrorMessage(error));
      }
      throw error instanceof Error
        ? error
        : new Error(tr('账号资料更新失败。', 'Account information update failed.', 'Kemas kini maklumat akaun gagal.'));
    }
  };

  // Firestore Rules only let Super Admin write roleAccounts, so every other
  // role saves its own avatar through the server. The server bumps the
  // dashboard_state version, so only local state is updated here (no re-save).
  const saveOwnAvatarThroughServer = async (accountId: string, avatarDataUrl: string, defaultAvatarId: string) => {
    const { getCurrentFirebaseIdToken } = await import('../lib/auth');
    const token = await getCurrentFirebaseIdToken(true);
    const response = await fetch('/api/staff/avatar', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defaultAvatarId ? { defaultAvatarId } : { avatarDataUrl })
    });
    const payload = await response.json().catch(() => ({})) as {
      avatarDataUrl?: string;
      defaultAvatarId?: string;
      error?: string;
      version?: number;
    };

    if (!response.ok) {
      const serverMessage = String(payload.error || '');
      if (response.status === 413 || serverMessage.includes('under 400 KB')) {
        throw new Error(tr('图片太大，请换一张较小的图片。', 'Image is too large. Try a smaller image.', 'Imej terlalu besar. Cuba imej yang lebih kecil.'));
      }
      if (serverMessage.includes('already in use')) {
        throw new Error(tr('这个默认头像已被其他员工使用。', 'This default avatar is already used by another staff member.', 'Avatar lalai ini sudah digunakan oleh kakitangan lain.'));
      }
      if (serverMessage.includes('no longer matches')) {
        throw new Error(tr('账号资料已在其他设备更改，请重新登录。', 'Account information changed elsewhere. Sign in again.', 'Maklumat akaun berubah di tempat lain. Log masuk semula.'));
      }
      throw new Error(serverMessage || tr('头像保存失败。', 'Avatar could not be saved.', 'Avatar tidak dapat disimpan.'));
    }

    if (typeof payload.version === 'number') {
      acknowledgeServerDashboardStateVersion(payload.version);
    }
    const nextAvatarDataUrl = String(payload.avatarDataUrl ?? avatarDataUrl);
    const nextDefaultAvatarId = String(payload.defaultAvatarId ?? defaultAvatarId);
    setRoleAccounts((current) => {
      const next = current.map((account) => (
        account.id === accountId
          ? { ...account, avatar_data_url: nextAvatarDataUrl, default_avatar_id: nextDefaultAvatarId }
          : account
      ));
      writeLocalDashboardValue('roleAccounts', next);
      return next;
    });
  };

  const saveCurrentUserAvatar = async (avatarDataUrl: string, defaultAvatarId: string) => {
    if (!currentRoleAccount) {
      return false;
    }

    if (isFirebaseConfigured && currentStaff.role !== 'Super Admin') {
      try {
        await saveOwnAvatarThroughServer(currentRoleAccount.id, avatarDataUrl, defaultAvatarId);
        return true;
      } catch (error) {
        triggerToast(error instanceof Error ? error.message : tr('头像保存失败。', 'Avatar could not be saved.', 'Avatar tidak dapat disimpan.'), 'error');
        return false;
      }
    }

    return handleUpdateRoleAccount(currentRoleAccount.id, {
      avatar_data_url: avatarDataUrl,
      default_avatar_id: defaultAvatarId
    });
  };

  const handleUpdateCurrentUserAvatar = (avatarDataUrl: string, defaultAvatarId = '') => {
    if (!currentRoleAccount) {
      triggerToast(tr('当前账号找不到，无法保存头像', 'Current account not found; avatar not saved', "Akaun semasa tidak ditemui; avatar tidak disimpan"));
      return;
    }

    void saveCurrentUserAvatar(avatarDataUrl, defaultAvatarId).then((updated) => {
      if (updated) {
        triggerToast(tr('头像已更新', 'Avatar updated', "Avatar dikemas kini"));
      }
    });
  };

  const handleRemoveCurrentUserAvatar = () => {
    if (!currentRoleAccount) {
      triggerToast(tr('当前账号找不到，无法移除头像', 'Current account not found; avatar not removed', "Akaun semasa tidak ditemui; avatar tidak dialih keluar"));
      return;
    }

    void saveCurrentUserAvatar('', '').then((updated) => {
      if (updated) {
        triggerToast(tr('头像已移除', 'Avatar removed', "Avatar dialih keluar"));
      }
    });
  };

  const handleAssignMissingAvatars = async () => {
    const { accounts, assigned } = assignMissingDefaultAvatars(roleAccounts, availableDefaultAvatars);
    if (assigned === 0) {
      triggerToast(tr('没有需要补头像的账号，或默认头像已用完。', 'No account needs an avatar, or every default avatar is in use.', 'Tiada akaun yang perlukan avatar, atau semua avatar lalai sudah digunakan.'));
      return;
    }
    await updateRoleAccountsState(accounts);
    triggerToast(tr(`已为 ${assigned} 个账号分配默认头像`, `Assigned default avatars to ${assigned} accounts`, `Avatar lalai diberikan kepada ${assigned} akaun`));
  };

  const handleUpdateCurrentUserLeadFollowUpDays = (days: number) => {
    const normalizedDays = normalizeLeadFollowUpDays(days);
    setLeadFollowUpDays(normalizedDays);
    window.localStorage.setItem(getLeadFollowUpStorageKey(currentStaff.name), String(normalizedDays));
    triggerToast(tr(
      `潜在客户跟进默认设为 ${normalizedDays} 天后`,
      `Lead follow-up now defaults to ${normalizedDays} day${normalizedDays === 1 ? '' : 's'} later`,
      `Susulan prospek kini ditetapkan ${normalizedDays} hari kemudian`
    ));
  };

  const handleUpdateCurrentUserWhatsAppOpenMode = (openInNewTab: boolean) => {
    setWhatsAppOpenInNewTab(openInNewTab);
    window.localStorage.setItem(getWhatsAppNewTabStorageKey(currentStaff.name), String(openInNewTab));
    triggerToast(openInNewTab
      ? tr('WhatsApp 将在新标签页打开', 'WhatsApp will open in a new tab', 'WhatsApp akan dibuka dalam tab baharu')
      : tr('WhatsApp 将在当前页面打开', 'WhatsApp will open in the current tab', 'WhatsApp akan dibuka dalam tab semasa'));
  };

  const handleTransferWorkload = (sourceName: string, targetName: string) => {
    const source = (sourceName || '').trim();
    const target = roleAccounts.find((account) => account.name === targetName && account.status === 'Active');

    if (!source || !target || source === target.name) {
      return;
    }

    const nextApplications = applications.map((application) => (
      application.handler_name === source && IN_PROGRESS_LOAN_STATUSES.has(application.status)
        ? { ...application, handler_name: target.name, handler_role: target.role }
        : application
    ));
    const movedCustomers = nextApplications.filter((application, index) => application !== applications[index]).length;

    const nextLeads = rawCustomerLeads.map((lead) => (
      lead.taken_by_staff_name === source && isActiveLead(lead)
        ? { ...lead, taken_by_staff_name: target.name, taken_by_staff_role: target.role }
        : lead
    ));
    const movedLeads = nextLeads.filter((lead, index) => lead !== rawCustomerLeads[index]).length;

    if (movedCustomers + movedLeads === 0) {
      triggerToast(tr(`${source} 没有进行中的客户或名单可转移`, `${source} has no in-progress customers or leads to transfer`, `${source} tidak mempunyai pelanggan atau prospek yang sedang dalam proses untuk dipindahkan`));
      return;
    }

    updateApplicationsState(nextApplications);
    updateRawCustomerLeadsState(nextLeads);
    appendAuditLog({
      action: 'TRANSFER_WORKLOAD',
      target_type: 'Role Account',
      target_id: source,
      target_label: `${source} → ${target.name}`,
      changes: [
        {
          field: 'workload',
          old_value: source,
          new_value: `${target.name} (${movedCustomers} customers, ${movedLeads} leads)`
        }
      ]
    });
    triggerToast(tr(
      `已把 ${source} 的 ${movedCustomers} 个进行中客户、${movedLeads} 个名单转给 ${target.name}`,
      `Transferred ${movedCustomers} customers & ${movedLeads} leads from ${source} to ${target.name}`, `Memindahkan ${movedCustomers} pelanggan & ${movedLeads} prospek daripada ${source} kepada ${target.name}`
    ));
  };

  const handleTransferWorkloadCase = (
    sourceName: string,
    targetName: string,
    caseType: StaffWorkloadCase['type'],
    caseId: string
  ) => {
    const source = sourceName.trim();
    const target = roleAccounts.find((account) => account.name === targetName && account.status === 'Active');

    if (!source || !target || source === target.name || !caseId) {
      return;
    }

    const workloadCase = staffWorkloadCases.find((item) => (
      item.id === caseId && item.type === caseType && item.owner_name === source
    ));

    if (!workloadCase) {
      triggerToast(tr('这个案件已经不在原负责人名下', 'This case is no longer assigned to the source staff', "Kes ini tidak lagi diberikan kepada kakitangan sumber"));
      return;
    }

    const nextApplications = caseType === 'customer'
      ? applications.map((application) => (
        application.id === caseId && application.handler_name === source && IN_PROGRESS_LOAN_STATUSES.has(application.status)
          ? { ...application, handler_name: target.name, handler_role: target.role }
          : application
      ))
      : applications;
    const nextLeads = caseType === 'lead'
      ? rawCustomerLeads.map((lead) => (
        lead.id === caseId && lead.taken_by_staff_name === source && isActiveLead(lead)
          ? { ...lead, taken_by_staff_name: target.name, taken_by_staff_role: target.role }
          : lead
      ))
      : rawCustomerLeads;

    updateApplicationsState(nextApplications);
    updateRawCustomerLeadsState(nextLeads);
    appendAuditLog({
      action: 'TRANSFER_WORKLOAD_CASE',
      target_type: caseType === 'customer' ? 'Loan Application' : 'Raw Customer',
      target_id: caseId,
      target_label: workloadCase.label,
      changes: [{ field: 'owner', old_value: source, new_value: target.name }],
      stateOverrides: { applications: nextApplications, rawCustomerLeads: nextLeads }
    });
    triggerToast(tr(
      `已把 ${workloadCase.label} 从 ${source} 转给 ${target.name}`,
      `Transferred ${workloadCase.label} from ${source} to ${target.name}`, `Dipindahkan ${workloadCase.label} daripada ${source} kepada ${target.name}`
    ));
  };

  const handleDeleteRoleAccount = async (id: string) => {
    const target = roleAccounts.find((account) => account.id === id);
    const workload = staffWorkload.find((entry) => entry.name === target?.name);
    const workloadNote = workload
      ? tr(
          `\n\n注意：${target?.name} 还有 ${workload.customers} 个进行中客户、${workload.leads} 个名单。建议先在「工作转移」里转给别人，否则这些记录会挂着一个已删除的员工。`,
          `\n\nNote: ${target?.name} still has ${workload.customers} in-progress customers and ${workload.leads} leads. Transfer them first in "Workload Transfer", or they will point to a deleted staff.`, `Nota: ${target?.name} masih mempunyai ${workload.customers} pelanggan dalam proses dan ${workload.leads} prospek. Pindahkan mereka dahulu dalam "Pemindahan Beban Kerja", atau mereka akan menunjuk kepada kakitangan yang dipadamkan.`
        )
      : '';

    if (await showConfirm({
      eyebrow: tr('员工账号', 'Staff Account', 'Akaun Kakitangan'),
      title: tr('删除员工账号？', 'Delete staff account?', 'Padam akaun kakitangan?'),
      message: `${tr('确认删除', 'Delete', 'Padam')} ${target?.name || id}?${workloadNote}`,
      tone: 'danger',
      confirmLabel: tr('删除账号', 'Delete Account', 'Padam Akaun')
    })) {
      if (!target) return;

      if (isFirebaseConfigured && (target.firebase_uid || target.firebase_auth_email)) {
        try {
          const { getCurrentFirebaseIdToken } = await import('../lib/auth');
          const token = await getCurrentFirebaseIdToken(true);
          if (!token) throw new Error(tr('请先重新登录 Super Admin。', 'Sign in as Super Admin again.', 'Log masuk semula sebagai Super Admin.'));
          const response = await fetch('/api/admin/staff-auth-users', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: target.firebase_uid || '',
              email: target.firebase_auth_email || target.email
            })
          });
          const payload = await response.json().catch(() => ({})) as { error?: string };
          if (!response.ok) throw new Error(payload.error || tr('Firebase 账号删除失败。', 'Firebase account deletion failed.', 'Pemadaman akaun Firebase gagal.'));
        } catch (error) {
          triggerToast(error instanceof Error ? error.message : tr('Firebase 账号删除失败。', 'Firebase account deletion failed.', 'Pemadaman akaun Firebase gagal.'), 'error');
          return;
        }
      }

      updateRoleAccountsState(roleAccounts.filter((account) => account.id !== id));
      appendAuditLog({
        action: 'DELETE_ROLE_ACCOUNT',
        target_type: 'Role Account',
        target_id: id,
        target_label: target?.name || id,
        changes: [
          {
            field: 'record',
            old_value: target ? `${target.name} / ${target.email} / ${target.role}` : id,
            new_value: 'Deleted'
          }
        ],
        stateOverrides: { roleAccounts: roleAccounts.filter((account) => account.id !== id) }
      });
      triggerToast(tr(`账号 ${target?.name || id} 已删除`, `Account ${target?.name || id} deleted`, `Akaun ${target?.name || id} dipadamkan`));
    }
  };

  return {
    handleUpdateRoleNavAccess,
    handleCreateFirebaseAuthUser,
    handleResetFirebaseAuthPassword,
    handleUpdateRoleAccount,
    handleUpdateCurrentStaffProfile,
    handleUpdateCurrentUserAvatar,
    handleRemoveCurrentUserAvatar,
    handleAssignMissingAvatars,
    handleUpdateCurrentUserLeadFollowUpDays,
    handleUpdateCurrentUserWhatsAppOpenMode,
    handleTransferWorkload,
    handleTransferWorkloadCase,
    handleDeleteRoleAccount
  };
}
