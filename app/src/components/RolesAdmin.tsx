/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ImagePlus, KeyRound, Plus, Search, Shuffle, Trash2, X } from 'lucide-react';
import { ATTENDANCE_MAIN_TEAM_ID, AttendancePolicy, CommissionTierPlan, getAttendanceTeamIdForAccount, RoleAccount, RoleAccountRole, RoleAccountStatus, StaffDefaultAvatar, StaffWorkloadCase, StaffWorkloadSummary } from '../types';
import { loadIgnoredWorkload, saveIgnoredWorkload } from '../services/workloadIgnoreStorage';
import DoubleClickEditField from './DoubleClickEditField';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import StaffAvatar from './StaffAvatar';
import ToggleOptionGroup from './ToggleOptionGroup';
import { tr } from '../lib/i18n';
import { hashPassword } from '../lib/password';
import { useBrandedDialog } from './BrandedDialogProvider';
import { resolveRoleAccountProvisioningId } from '../utils/roleAccountIdentity';
import {
  formatStaffLoginIdentifier,
  resolveStaffAuthEmail
} from '../../shared/staffLoginIdentifier.mjs';
import { getStaffPasswordProblem } from '../../shared/staffPasswordPolicy.mjs';
import { newId } from '../utils/id';

interface RolesAdminProps {
  accounts: RoleAccount[];
  defaultAvatars: StaffDefaultAvatar[];
  onCreateFirebaseAuthUser: (account: Pick<RoleAccount, 'id' | 'name' | 'email' | 'role' | 'default_avatar_id'> & { password?: string }) => Promise<{
    uid: string;
    temporaryPassword?: string;
    created: boolean;
    email: string;
    dashboardAccountId?: string;
    name?: string;
    role?: RoleAccountRole;
  }>;
  onResetFirebaseAuthPassword: (account: RoleAccount, password: string) => Promise<void>;
  onUpdateAccount: (id: string, updates: Partial<RoleAccount>) => Promise<boolean>;
  onAssignMissingAvatars?: () => Promise<void>;
  // Role / status / name / login edits still waiting for the server. Shown at
  // once so the table does not lag behind the click; reverted if it fails.
  pendingAccountUpdates?: Record<string, Partial<RoleAccount>>;
  onDeleteAccount: (id: string) => Promise<void>;
  staffWorkload: StaffWorkloadSummary[];
  staffWorkloadCases: StaffWorkloadCase[];
  onTransferWorkload: (sourceName: string, targetName: string) => void;
  onTransferWorkloadCase: (sourceName: string, targetName: string, caseType: StaffWorkloadCase['type'], caseId: string) => void;
  /** A staff member's shop is their attendance team (Attendance & Leave → Teams / shops); the same assignment is edited here. */
  attendancePolicy?: AttendancePolicy;
  /** Absent for anyone but Super Admin: the shop then shows read-only. */
  onAssignShop?: (accountId: string, teamId: string) => boolean;
  /** Admin only: other shops this Admin also works in. Absent for anyone but Super Admin. */
  onAssignExtraShops?: (accountId: string, shopIds: string[]) => Promise<boolean>;
  /** Commission structures (owner 2026-10-24); each staff member follows one, the first by default. */
  commissionTierPlans?: CommissionTierPlan[];
  /** Absent for anyone but Super Admin: the plan then shows read-only. */
  onAssignCommissionTierPlan?: (accountId: string, planId: string) => Promise<boolean>;
}

const ROLE_OPTIONS: RoleAccountRole[] = [
  'Super Admin',
  'Operations Manager',
  'Admin',
  'Sales'
];

const STATUS_OPTIONS: RoleAccountStatus[] = ['Active', 'Suspended'];
const MAX_AVATAR_SIZE = 512;
const MAX_AVATAR_UPLOAD_BYTES = 4 * 1024 * 1024;

type RoleSortKey = 'name' | 'email' | 'role' | 'status';

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image cannot be loaded'));
    image.src = dataUrl;
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Image cannot be read'));
    reader.readAsDataURL(file);
  });
}

async function resizeAvatar(file: File) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, MAX_AVATAR_SIZE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image canvas cannot be created');
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.86);
}

export default function RolesAdmin({
  accounts: savedAccounts,
  pendingAccountUpdates,
  defaultAvatars,
  onCreateFirebaseAuthUser,
  onResetFirebaseAuthPassword,
  onUpdateAccount,
  onAssignMissingAvatars,
  onDeleteAccount,
  staffWorkload,
  staffWorkloadCases,
  onTransferWorkload,
  onTransferWorkloadCase,
  attendancePolicy,
  onAssignShop,
  onAssignExtraShops,
  commissionTierPlans,
  onAssignCommissionTierPlan,
}: RolesAdminProps) {
  const { showConfirm } = useBrandedDialog();
  const accounts = useMemo(() => savedAccounts.map((account) => (
    pendingAccountUpdates?.[account.id] ? { ...account, ...pendingAccountUpdates[account.id] } : account
  )), [pendingAccountUpdates, savedAccounts]);
  const [searchTerm, setSearchTerm] = useState('');
  const shopOptions = useMemo(() => (attendancePolicy ? [
    { value: ATTENDANCE_MAIN_TEAM_ID, label: attendancePolicy.main_team_name?.trim() || tr('主队', 'Main team', 'Pasukan utama') },
    ...(attendancePolicy.teams || []).map((team, index) => ({
      value: team.id,
      label: team.name.trim() || tr(`团队 ${index + 1}`, `Team ${index + 1}`, `Pasukan ${index + 1}`)
    }))
  ] : []), [attendancePolicy]);
  const [transferSource, setTransferSource] = useState('');
  const [transferMode, setTransferMode] = useState<'all' | 'case'>('all');
  const [transferTarget, setTransferTarget] = useState('');
  const [transferCaseKey, setTransferCaseKey] = useState('');
  const [ignoredWorkload, setIgnoredWorkload] = useState<Set<string>>(new Set());
  const [workloadCollapsed, setWorkloadCollapsed] = useState(true);

  useEffect(() => {
    let active = true;
    void loadIgnoredWorkload().then((names) => {
      if (active) setIgnoredWorkload(new Set(names));
    });
    return () => {
      active = false;
    };
  }, []);

  const handleIgnoreWorkload = (name: string) => {
    setIgnoredWorkload((current) => {
      const next = new Set<string>(current);
      next.add(name);
      void saveIgnoredWorkload(Array.from(next));
      return next;
    });
    setTransferSource('');
  };

  const handleRestoreIgnoredWorkload = () => {
    setIgnoredWorkload(new Set());
    void saveIgnoredWorkload([]);
  };
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<RoleAccountRole>('Sales');
  const [newPassword, setNewPassword] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [processingAvatarId, setProcessingAvatarId] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createAccountError, setCreateAccountError] = useState('');
  const [createdCredential, setCreatedCredential] = useState<{ email: string; password: string; created: boolean } | null>(null);
  const [resettingPasswordAccountId, setResettingPasswordAccountId] = useState('');
  const [passwordResetDraft, setPasswordResetDraft] = useState<{ account: RoleAccount; password: string; error: string } | null>(null);
  const [sortState, setSortState] = useState<SortState<RoleSortKey>>({
    key: 'name',
    direction: 'asc'
  });

  const sortedAccounts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filteredAccounts = accounts.filter((account) => (
      !query ||
      account.name.toLowerCase().includes(query) ||
      formatStaffLoginIdentifier(account.firebase_auth_email || account.email).includes(query) ||
      account.role.toLowerCase().includes(query) ||
      account.status.toLowerCase().includes(query)
    ));

    return [...filteredAccounts].sort((a, b) => (
      compareSortValues(
        String(a[sortState.key] || '').toLowerCase(),
        String(b[sortState.key] || '').toLowerCase(),
        sortState.direction
      )
    ));
  }, [accounts, searchTerm, sortState]);

  const defaultAvatarAssignments = useMemo(() => {
    const assignments: Record<string, RoleAccount> = {};

    defaultAvatars.forEach((avatar) => {
      const assignedAccount = accounts.find((account) => (
        account.default_avatar_id === avatar.id ||
        (!account.default_avatar_id && account.avatar_data_url === avatar.avatar_data_url)
      ));

      if (assignedAccount) {
        assignments[avatar.id] = assignedAccount;
      }
    });

    return assignments;
  }, [accounts, defaultAvatars]);

  const getAvailableDefaultAvatars = (accountId = '') => (
    defaultAvatars.filter((avatar) => {
      const assignedAccount = defaultAvatarAssignments[avatar.id];
      return !assignedAccount || assignedAccount.id === accountId;
    })
  );

  const pickRandomDefaultAvatar = (accountId = '') => {
    const currentAccount = accountId ? accounts.find((account) => account.id === accountId) : undefined;
    const availableAvatars = getAvailableDefaultAvatars(accountId);
    const preferredAvatars = currentAccount?.default_avatar_id
      ? availableAvatars.filter((avatar) => avatar.id !== currentAccount.default_avatar_id)
      : availableAvatars;
    const candidates = preferredAvatars.length > 0 ? preferredAvatars : availableAvatars;

    if (candidates.length === 0) {
      return null;
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const accountsWithoutAvatar = accounts.filter((account) => account.status === 'Active' && !account.avatar_data_url).length;

  const handleSort = (key: RoleSortKey, defaultDirection: SortDirection = 'asc') => {
    setSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleAdd = async () => {
    const name = newName.trim().replace(/\s+/g, ' ');
    const email = resolveStaffAuthEmail(newEmail);
    const password = newPassword;

    if (!name || isCreatingAccount) {
      return;
    }

    if (!email) {
      setCreateAccountError(tr(
        '请输入有效的用户名或 Email。用户名只可使用英文字母、数字、点、下划线和连字符。',
        'Enter a valid username or email. Usernames may use letters, numbers, dots, underscores, and hyphens.',
        'Masukkan nama pengguna atau e-mel yang sah. Nama pengguna boleh menggunakan huruf, nombor, titik, garis bawah dan tanda sempang.'
      ));
      return;
    }

    if (password && getStaffPasswordProblem(password) === 'whitespace') {
      setCreateAccountError(tr('密码不能包含空格。', 'Password must not contain spaces.', 'Kata laluan tidak boleh mengandungi ruang.'));
      return;
    }

    if (password && password.length < 8) {
      setCreateAccountError(tr('临时密码至少需要 8 个字符。', 'Temporary password must be at least 8 characters.', "Kata laluan sementara mestilah sekurang-kurangnya 8 aksara."));
      return;
    }

    const accountId = resolveRoleAccountProvisioningId(accounts, email, `USR-${Date.now()}`);
    const randomDefaultAvatar = pickRandomDefaultAvatar();
    setIsCreatingAccount(true);
    setCreateAccountError('');
    setCreatedCredential(null);

    try {
      const authUser = await onCreateFirebaseAuthUser({
        id: accountId,
        name,
        email,
        role: newRole,
        default_avatar_id: randomDefaultAvatar?.id || '',
        password: password || undefined
      });

      setCreatedCredential({
        email: formatStaffLoginIdentifier(authUser.email || email),
        password: authUser.temporaryPassword || '',
        created: authUser.created
      });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('Sales');
    } catch (error) {
      setCreateAccountError(error instanceof Error ? error.message : tr('Firebase Auth 用户创建失败。', 'Firebase Auth user creation failed.', "Pembuatan pengguna Firebase Auth gagal."));
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleRandomAvatar = (account: RoleAccount) => {
    const randomDefaultAvatar = pickRandomDefaultAvatar(account.id);

    if (!randomDefaultAvatar) {
      setAvatarError(tr('没有可用的默认头像。请先上传更多默认头像，或释放其他账号已使用的头像。', 'No available default avatars. Upload more defaults or release one used by another account.', "Tiada avatar lalai tersedia. Muat naik lebih banyak lalai atau keluarkan yang digunakan oleh akaun lain."));
      return;
    }

    setAvatarError('');
    void onUpdateAccount(account.id, {
      avatar_data_url: randomDefaultAvatar.avatar_data_url,
      default_avatar_id: randomDefaultAvatar.id
    });
  };

  const handlePasswordReset = (account: RoleAccount) => {
    setPasswordResetDraft({ account, password: '', error: '' });
  };

  const closePasswordResetDialog = () => {
    if (resettingPasswordAccountId) {
      return;
    }

    setPasswordResetDraft(null);
  };

  const submitPasswordReset = async () => {
    if (!passwordResetDraft || resettingPasswordAccountId) {
      return;
    }

    const { account } = passwordResetDraft;
    const hasFirebaseLogin = Boolean(account.firebase_uid || account.firebase_auth_email);
    const nextPassword = passwordResetDraft.password;

    // Passwords may not contain spaces anywhere. Reject instead of silently
    // trimming, so the password staff are told is exactly the one that works.
    if (nextPassword && getStaffPasswordProblem(nextPassword) === 'whitespace') {
      setPasswordResetDraft((current) => current ? {
        ...current,
        error: tr('密码不能包含空格。', 'Password must not contain spaces.', 'Kata laluan tidak boleh mengandungi ruang.')
      } : current);
      return;
    }

    if (hasFirebaseLogin) {
      if (nextPassword.length < 8) {
        setPasswordResetDraft((current) => current ? {
          ...current,
          error: tr('Firebase 密码至少需要 8 位。', 'Firebase password must be at least 8 characters.', "Kata laluan Firebase mestilah sekurang-kurangnya 8 aksara.")
        } : current);
        return;
      }

      setResettingPasswordAccountId(account.id);

      try {
        await onResetFirebaseAuthPassword(account, nextPassword);
        setPasswordResetDraft(null);
      } catch (error) {
        setPasswordResetDraft((current) => current ? {
          ...current,
          error: error instanceof Error ? error.message : tr('Firebase Auth 密码重置失败。', 'Firebase Auth password reset failed.', "Penetapan semula kata laluan Firebase Auth gagal.")
        } : current);
      } finally {
        setResettingPasswordAccountId('');
      }

      return;
    }

    if (!nextPassword) {
      await onUpdateAccount(account.id, { password_hash: '' });
      setPasswordResetDraft(null);
      return;
    }

    if (nextPassword.length < 4) {
      setPasswordResetDraft((current) => current ? {
        ...current,
        error: tr('密码至少 4 位。', 'Password must be at least 4 characters.', "Kata laluan mestilah sekurang-kurangnya 4 aksara.")
      } : current);
      return;
    }

    await onUpdateAccount(account.id, { password_hash: await hashPassword(nextPassword) });
    setPasswordResetDraft(null);
  };

  const handleAvatarUpload = async (accountId: string, file?: File) => {
    setAvatarError('');

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please upload an image file.');
      return;
    }

    if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
      setAvatarError('Avatar image must be 4MB or smaller.');
      return;
    }

    setProcessingAvatarId(accountId);

    try {
      const avatarDataUrl = await resizeAvatar(file);
      await onUpdateAccount(accountId, { avatar_data_url: avatarDataUrl, default_avatar_id: '' });
    } catch {
      setAvatarError('Avatar upload failed. Please try another image.');
    } finally {
      setProcessingAvatarId('');
    }
  };

  return (
    <div id="roles-admin-page" className="space-y-6">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-title-2 text-slate-900">
            Roles & Accounts
          </h2>
          <p className="text-footnote text-slate-500 font-normal max-w-2xl leading-relaxed">
            {tr('登录账号、Firebase Auth 映射、角色与状态。', 'Login accounts, Firebase Auth mapping, roles, and status.', "Log masuk akaun, pemetaan Firebase Auth, peranan dan status.")}
          </p>
        </div>

        <div className="relative self-start md:self-auto">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="role-search-input"
            type="text"
              placeholder={tr('搜索姓名、邮箱、角色...', 'Search name, email, role...', "Cari nama, e-mel, peranan...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-control text-footnote w-72 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>
      </section>

      {staffWorkload.filter((entry) => !ignoredWorkload.has(entry.name) && (!entry.inSystem || !entry.active)).length > 0 && (
        <section className="bg-white rounded-panel border border-amber-100 shadow-e1 overflow-hidden">
          <button type="button" onClick={() => setWorkloadCollapsed((value) => !value)} className="flex w-full items-center justify-between gap-3 border-b border-amber-100/70 bg-amber-50/40 px-6 py-4 text-left">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-headline text-slate-900">{tr('工作转移', 'Workload Transfer', "Pemindahan Beban Kerja")}</h3>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-micro tracking-normal text-amber-700">{staffWorkload.filter((entry) => !ignoredWorkload.has(entry.name) && (!entry.inSystem || !entry.active)).length}</span>
              </div>
              <p className="mt-0.5 text-footnote text-slate-500">
                {tr('把进行中的客户与名单转给别人。已完成的客户不受影响。', 'Move in-progress customers & leads to someone else. Finished customers are untouched.', "Pindahkan pelanggan & prospek yang sedang berjalan kepada orang lain. Pelanggan yang telah selesai tidak disentuh.")}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${workloadCollapsed ? '-rotate-90' : ''}`} />
          </button>
          {!workloadCollapsed && (
          <div className="divide-y divide-slate-100">
            {ignoredWorkload.size > 0 && (
              <div className="flex items-center justify-between bg-slate-50/60 px-6 py-2">
                <span className="text-caption text-slate-400">{tr(`已忽略 ${ignoredWorkload.size} 人`, `${ignoredWorkload.size} ignored`, `${ignoredWorkload.size} diabaikan`)}</span>
                <button type="button" onClick={handleRestoreIgnoredWorkload} className="text-caption font-semibold text-indigo-600 transition-colors hover:text-indigo-800">{tr('恢复全部', 'Restore all', "Pulihkan semua")}</button>
              </div>
            )}
            {staffWorkload.filter((entry) => !ignoredWorkload.has(entry.name) && (!entry.inSystem || !entry.active)).map((entry) => {
              const targets = accounts.filter((account) => account.status === 'Active' && account.name !== entry.name);
              const isOpen = transferSource === entry.name;

              return (
                <div key={entry.name} className="px-6 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-headline text-slate-800">{entry.name}</span>
                        {!entry.inSystem ? (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-micro tracking-normal text-rose-600">{tr('已离职/不在系统', 'Not in system', "Bukan dalam sistem")}</span>
                        ) : !entry.active ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-micro tracking-normal text-slate-500">{tr('已停用', 'Suspended', "Digantung")}</span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-caption text-slate-400">
                        {tr(`进行中：${entry.customers} 客户 · ${entry.leads} 名单`, `In progress: ${entry.customers} customers · ${entry.leads} leads`, `Sedang berjalan: ${entry.customers} pelanggan · ${entry.leads} prospek`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTransferSource(isOpen ? '' : entry.name);
                        setTransferMode('all');
                        setTransferTarget('');
                        setTransferCaseKey('');
                      }}
                      disabled={targets.length === 0}
                      className={`inline-flex items-center gap-1.5 rounded-control px-3 py-2 text-footnote font-bold transition-colors ${
                        isOpen ? 'bg-brand text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:text-slate-300'
                      }`}
                    >
                      {targets.length === 0 ? tr('没有可转移的员工', 'No active staff', "Tiada kakitangan yang aktif") : isOpen ? tr('选择接收人', 'Pick target', "Pilih sasaran") : tr('转移', 'Transfer', "Pemindahan")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIgnoreWorkload(entry.name)}
                      title={tr('忽略这条（不转移，暂时从列表移走，刷新后恢复）', 'Ignore this entry (do not transfer; hidden this session, returns after refresh)', "Abaikan entri ini (jangan pindahkan; sembunyikan sesi ini, kembali selepas muat semula)")}
                      className="inline-flex items-center gap-1.5 rounded-control border border-slate-200 bg-white px-3 py-2 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-50"
                    >
                      {tr('忽略', 'Ignore', "abaikan")}
                    </button>
                    </div>
                  </div>

                  {isOpen && targets.length > 0 && (
                    <div className="mt-3 grid gap-2 rounded-card border border-slate-100 bg-slate-50/60 p-3 md:grid-cols-[190px_minmax(220px,1fr)_minmax(220px,1fr)_auto]">
                      <ToggleOptionGroup
                        value={transferMode}
                        options={[
                          { value: 'all', label: tr('转移全部', 'Transfer all', "Pindahkan semua") },
                          { value: 'case', label: tr('按案件转移', 'Transfer by case', "Pemindahan mengikut kes") },
                          { value: 'create_role', label: tr('创建新角色', 'Create new role', "Cipta peranan baharu") }
                        ]}
                        onChange={(value) => {
                          if (value === 'create_role') {
                            setTransferSource('');
                            window.setTimeout(() => {
                              const input = document.getElementById('new-role-name-input');
                              input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              input?.focus();
                            }, 0);
                            return;
                          }

                          setTransferMode(value as 'all' | 'case');
                          setTransferCaseKey('');
                        }}
                        ariaLabel={tr('选择转移方式', 'Choose transfer mode', "Pilih mod pemindahan")}
                        className="w-full rounded-control bg-white p-1 ring-1 ring-slate-100"
                      />
                      {transferMode === 'case' ? (
                        <ToggleOptionGroup
                          value={transferCaseKey}
                          options={[
                            { value: '', label: tr('选择一个案件', 'Choose a case', "Pilih kes") },
                            ...staffWorkloadCases
                              .filter((item) => item.owner_name === entry.name)
                              .map((item) => ({
                                value: `${item.type}|${item.id}`,
                                label: `${item.type === 'customer' ? tr('客户', 'Customer', "Pelanggan") : tr('名单', 'Lead', "Prospek")} · ${item.label} · ${item.meta}`
                              }))
                          ]}
                          onChange={setTransferCaseKey}
                          ariaLabel={tr('选择案件', 'Choose case', "Pilih kes")}
                          className="w-full rounded-control bg-white p-1 ring-1 ring-slate-100"
                        />
                      ) : (
                        <div className="flex items-center rounded-control bg-white px-3 text-caption text-slate-500 ring-1 ring-slate-100">
                          {tr(`${entry.customers} 个客户 · ${entry.leads} 个名单`, `${entry.customers} customers · ${entry.leads} leads`, `${entry.customers} pelanggan · ${entry.leads} prospek`)}
                        </div>
                      )}
                      <ToggleOptionGroup
                        value={transferTarget}
                        options={[
                          { value: '', label: tr('选择接收人', 'Choose target staff', "Pilih kakitangan sasaran") },
                          ...targets.map((account) => ({ value: account.name, label: `${account.name} · ${account.role}` }))
                        ]}
                        onChange={setTransferTarget}
                        ariaLabel={tr('选择接收人', 'Choose target staff', "Pilih kakitangan sasaran")}
                        className="w-full rounded-control bg-white p-1 ring-1 ring-slate-100"
                      />
                      <button
                        type="button"
                        disabled={!transferTarget || (transferMode === 'case' && !transferCaseKey)}
                        onClick={async () => {
                          const target = targets.find((account) => account.name === transferTarget);
                          if (!target) return;

                          if (transferMode === 'case') {
                            const [caseType, caseId] = transferCaseKey.split('|') as [StaffWorkloadCase['type'], string];
                            const workloadCase = staffWorkloadCases.find((item) => item.type === caseType && item.id === caseId && item.owner_name === entry.name);
                            if (!workloadCase || !await showConfirm({
                              eyebrow: tr('工作转移', 'Workload Transfer', 'Pemindahan Beban Kerja'),
                              title: tr('转移这项工作？', 'Transfer this work item?', 'Pindahkan item kerja ini?'),
                              message: tr(
                                `把 ${workloadCase.label} 从 ${entry.name} 转给 ${target.name}？`,
                                `Transfer ${workloadCase.label} from ${entry.name} to ${target.name}?`,
                                `Pindahkan ${workloadCase.label} daripada ${entry.name} kepada ${target.name}?`
                              ),
                              tone: 'warning',
                              confirmLabel: tr('确认转移', 'Transfer', 'Pindahkan')
                            })) return;
                            onTransferWorkloadCase(entry.name, target.name, caseType, caseId);
                          } else {
                            if (!await showConfirm({
                              eyebrow: tr('工作转移', 'Workload Transfer', 'Pemindahan Beban Kerja'),
                              title: tr('转移全部工作？', 'Transfer all workload?', 'Pindahkan semua beban kerja?'),
                              message: tr(
                                `把 ${entry.name} 的 ${entry.customers} 个进行中客户、${entry.leads} 个名单转给 ${target.name}？`,
                                `Transfer ${entry.name}'s ${entry.customers} in-progress customers and ${entry.leads} leads to ${target.name}?`,
                                `Pindahkan ${entry.customers} pelanggan dalam proses dan ${entry.leads} prospek ${entry.name} kepada ${target.name}?`
                              ),
                              tone: 'warning',
                              confirmLabel: tr('确认转移', 'Transfer', 'Pindahkan')
                            })) return;
                            onTransferWorkload(entry.name, target.name);
                          }

                          setTransferSource('');
                          setTransferTarget('');
                          setTransferCaseKey('');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                        {tr('确认转移', 'Transfer', "Pemindahan")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}

      <section className="bg-white rounded-panel border border-slate-100 shadow-e1 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100/70">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_180px_auto] gap-3">
            <input
              id="new-role-name-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={tr('员工姓名', 'Staff name', "Nama kakitangan")}
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
            />
            <input
              id="new-role-email-input"
              type="text"
              autoComplete="username"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={tr('用户名或 Email', 'Username or email', "Nama pengguna atau e-mel")}
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
            />
            <input
              id="new-role-password-input"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={tr('临时密码（可空，不能有空格）', 'Temporary password (optional, no spaces)', "Kata laluan sementara (pilihan, tanpa ruang)")}
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50"
            />
            <ToggleOptionGroup
              value={newRole}
              options={ROLE_OPTIONS.map((role) => ({ value: role, label: role }))}
              onChange={(value) => setNewRole(value as RoleAccountRole)}
              ariaLabel="New account role"
              className="rounded-card bg-slate-50 p-1"
              optionClassName="min-h-9 px-3"
            />
            <button
              id="add-role-account-btn"
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim() || !newEmail.trim() || isCreatingAccount}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-card bg-indigo-600 text-white text-footnote font-bold disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isCreatingAccount ? tr('创建中', 'Creating', "Mencipta") : tr('Add Account', 'Add Account', "Tambah Akaun")}
            </button>
          </div>
          {(createAccountError || createdCredential) && (
            <div className={`mt-3 rounded-card px-4 py-3 text-footnote ${
              createAccountError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {createAccountError || (
                createdCredential?.password
                  ? `${tr('Firebase Auth 用户已创建。临时密码只显示一次：', 'Firebase Auth user created. Temporary password is shown once:', "Pengguna Firebase Auth dibuat. Kata laluan sementara ditunjukkan sekali:")} ${createdCredential.email} / ${createdCredential.password}`
                  : `${tr('Firebase Auth 用户已存在，已连接到这个角色账号：', 'Firebase Auth user already exists and was linked to this role account:', "Pengguna Firebase Auth sudah wujud dan telah dipautkan ke akaun peranan ini:")} ${createdCredential?.email}`
              )}
            </div>
          )}
          {avatarError && (
            <p className="mt-3 rounded-control bg-rose-50 px-3 py-2 text-footnote text-rose-600">{avatarError}</p>
          )}
          {onAssignMissingAvatars && accountsWithoutAvatar > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-control bg-amber-50 px-3 py-2 text-footnote text-amber-800">
              <span>{tr(`${accountsWithoutAvatar} 个账号还没有头像。`, `${accountsWithoutAvatar} accounts have no avatar yet.`, `${accountsWithoutAvatar} akaun belum ada avatar.`)}</span>
              <button
                type="button"
                data-testid="assign-missing-avatars"
                onClick={() => { void onAssignMissingAvatars(); }}
                className="rounded-control bg-white px-3 py-1.5 font-bold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
              >
                {tr('分配默认头像', 'Assign default avatars', 'Beri avatar lalai')}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-200/95 text-micro tracking-normal text-slate-700 uppercase tracking-wider border-b border-slate-300">
              <tr>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="name" label={tr('账号', 'Account', "Akaun")} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="email" label={tr('登录', 'Login', "Log masuk")} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="role" label={tr('角色', 'Role', "Peranan")} sortState={sortState} onSort={handleSort} />
                </th>
                {attendancePolicy && <th className="px-6 py-3.5">{tr('分店', 'Shop', 'Cawangan')}</th>}
                {commissionTierPlans && commissionTierPlans.length > 0 && <th className="px-6 py-3.5">{tr('佣金分级', 'Commission tier', 'Tahap komisen')}</th>}
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="status" label={tr('状态', 'Status', "Status")} sortState={sortState} onSort={handleSort} />
                </th>
                <th className="pr-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
              </tr>
            </thead>
            <tbody className="text-body divide-y divide-slate-50">
              {sortedAccounts.map((account) => (
                <tr key={account.id} id={`role-row-${account.id}`} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex min-w-64 items-center gap-3">
                      <StaffAvatar name={account.name} avatarDataUrl={account.avatar_data_url} className="h-10 w-10" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <DoubleClickEditField
                          type="text"
                          value={account.name}
                          onCommit={(value) => { void onUpdateAccount(account.id, { name: value }); }}
                          displayClassName="block w-full min-w-48 truncate rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full min-w-48 rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Update name for ${account.id}`}
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          <label className={`inline-flex cursor-pointer items-center gap-1 rounded-chip px-2 py-1 text-micro tracking-normal transition-colors ${
                            processingAvatarId === account.id
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}>
                            <ImagePlus className="h-3 w-3" />
                            {processingAvatarId === account.id ? tr('上传中', 'Uploading', "Memuat naik") : tr('头像', 'Avatar', "Avatar")}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={processingAvatarId === account.id}
                              onChange={(event) => {
                                handleAvatarUpload(account.id, event.currentTarget.files?.[0]);
                                event.currentTarget.value = '';
                              }}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRandomAvatar(account)}
                            disabled={getAvailableDefaultAvatars(account.id).length === 0}
                            className="inline-flex items-center gap-1 rounded-chip bg-amber-50 px-2 py-1 text-micro tracking-normal text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                            aria-label={`Pick random default avatar for ${account.id}`}
                            title={tr('从默认头像随机选择', 'Pick random default avatar', "Pilih avatar lalai rawak")}
                          >
                            <Shuffle className="h-3 w-3" />
                            {tr('随机', 'Random', "rawak")}
                          </button>
                          {account.avatar_data_url && (
                            <button
                              type="button"
                              onClick={() => { void onUpdateAccount(account.id, { avatar_data_url: '', default_avatar_id: '' }); }}
                              className="inline-flex items-center gap-1 rounded-chip bg-slate-50 px-2 py-1 text-micro tracking-normal text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                              <X className="h-3 w-3" />
                              {tr('移除', 'Remove', "Alih keluar")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-72 space-y-2">
                      <div>
                        <p className="mb-1 text-micro uppercase text-slate-300">{tr('用户名 / Email', 'Username / Email', "Nama pengguna / E-mel")}</p>
                        <DoubleClickEditField
                          type="text"
                          value={formatStaffLoginIdentifier(account.firebase_auth_email || account.email)}
                          onCommit={(value) => {
                            const email = resolveStaffAuthEmail(value);
                            if (!email) {
                              setAvatarError(tr('用户名或 Email 格式无效。', 'Invalid username or email.', 'Format nama pengguna atau e-mel tidak sah.'));
                              return;
                            }
                            setAvatarError('');
                            void onUpdateAccount(account.id, { email });
                          }}
                          normalizeValue={(value) => value.trim().toLowerCase()}
                          displayClassName="block w-full truncate rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-full rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Update username or email for ${account.id}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <DoubleClickEditField
                      mode="select"
                      value={account.role}
                      options={ROLE_OPTIONS.map((role) => ({ value: role, label: role }))}
                      onCommit={(value) => { void onUpdateAccount(account.id, { role: value as RoleAccountRole }); }}
                      displayClassName="block w-44 rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      inputClassName="w-44 rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                      ariaLabel={`Update role for ${account.id}`}
                    />
                    {pendingAccountUpdates?.[account.id] && (
                      <p data-testid={`role-account-saving-${account.id}`} className="mt-1 text-micro tracking-normal text-slate-400">
                        {tr('保存中…', 'Saving…', 'Menyimpan…')}
                      </p>
                    )}
                  </td>
                  {attendancePolicy && (
                    <td className="px-6 py-4">
                      {shopOptions.length > 1 && onAssignShop ? (
                        <DoubleClickEditField
                          mode="select"
                          value={getAttendanceTeamIdForAccount(attendancePolicy, account.id)}
                          options={shopOptions}
                          formatDisplay={(value) => shopOptions.find((option) => option.value === value)?.label ?? value}
                          onCommit={(value) => { onAssignShop(account.id, value); }}
                          displayClassName="block w-40 rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-40 rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Update shop for ${account.id}`}
                        />
                      ) : (
                        <p
                          className="w-40 truncate px-3 py-2 text-footnote text-slate-500"
                          title={shopOptions.length > 1 ? undefined : tr(
                            '只有一间店。要加分店：Attendance & Leave → 更改规则 → 团队 / 分店。',
                            'One shop only. Add shops in Attendance & Leave → Edit rules → Teams / shops.',
                            'Satu kedai sahaja. Tambah cawangan di Attendance & Leave → Ubah peraturan → Pasukan / cawangan.'
                          )}
                        >
                          {shopOptions.find((option) => option.value === getAttendanceTeamIdForAccount(attendancePolicy, account.id))?.label}
                        </p>
                      )}
                      {account.role === 'Admin' && shopOptions.length > 1 && (() => {
                        // Extra shops: this Admin also reviews and submits the
                        // applications of these shops, as in their own. Attendance stays in the own shop.
                        const ownShop = getAttendanceTeamIdForAccount(attendancePolicy, account.id);
                        const extraShopIds = (account.extra_shop_ids || []).filter((id) => id !== ownShop && shopOptions.some((option) => option.value === id));
                        const otherShops = shopOptions.filter((option) => option.value !== ownShop);
                        if (!onAssignExtraShops) {
                          return extraShopIds.length > 0 ? (
                            <p className="mt-1 w-40 px-3 text-micro text-slate-500">
                              {tr('也管理：', 'Also manages: ', 'Juga mengurus: ')}
                              {otherShops.filter((option) => extraShopIds.includes(option.value)).map((option) => option.label).join(', ')}
                            </p>
                          ) : null;
                        }
                        return (
                          <div className="mt-1.5 w-40" title={tr(
                            '勾选的分店：这位 Admin 也能审核、提交银行，和自己的店一样。考勤仍在自己的店。',
                            'Ticked shops: this Admin also reviews and submits to the bank there, as in their own shop. Attendance stays in their own shop.',
                            'Cawangan yang ditanda: Admin ini juga menyemak dan menghantar ke bank di sana, sama seperti cawangan sendiri. Kehadiran kekal di cawangan sendiri.'
                          )}>
                            <p className="px-1 text-micro font-semibold text-slate-400">{tr('也管理', 'Also manages', 'Juga mengurus')}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {otherShops.map((option) => {
                                const active = extraShopIds.includes(option.value);
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={active}
                                    aria-label={`${active ? 'Remove' : 'Add'} extra shop ${option.label} for ${account.id}`}
                                    onClick={() => {
                                      const next = active
                                        ? extraShopIds.filter((id) => id !== option.value)
                                        : [...extraShopIds, option.value];
                                      void onAssignExtraShops(account.id, next);
                                    }}
                                    className={`max-w-full truncate rounded-full px-2 py-0.5 text-micro font-semibold transition-colors ${
                                      active
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                                    }`}
                                  >
                                    {active ? '✓ ' : '+ '}{option.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                  )}
                  {commissionTierPlans && commissionTierPlans.length > 0 && (
                    <td className="px-6 py-4">
                      {onAssignCommissionTierPlan ? (
                        <DoubleClickEditField
                          mode="select"
                          value={(commissionTierPlans.find((plan) => plan.id === account.commission_tier_plan_id) || commissionTierPlans[0]).id}
                          options={commissionTierPlans.map((plan) => ({ value: plan.id, label: plan.name }))}
                          formatDisplay={(value) => commissionTierPlans.find((plan) => plan.id === value)?.name ?? value}
                          onCommit={(value) => { void onAssignCommissionTierPlan(account.id, value); }}
                          displayClassName="block w-32 rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          inputClassName="w-32 rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-indigo-100 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                          ariaLabel={`Update commission tier for ${account.id}`}
                        />
                      ) : (
                        <p className="w-32 truncate px-3 py-2 text-footnote text-slate-500">
                          {(commissionTierPlans.find((plan) => plan.id === account.commission_tier_plan_id) || commissionTierPlans[0]).name}
                        </p>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <DoubleClickEditField
                      mode="select"
                      value={account.status}
                      options={STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
                      onCommit={(value) => { void onUpdateAccount(account.id, { status: value as RoleAccountStatus }); }}
                      displayClassName={`block w-32 rounded-control border px-3 py-2 text-left text-footnote font-bold transition-colors hover:bg-indigo-50 ${
                        account.status === 'Active'
                          ? 'border-emerald-100 bg-emerald-50/70 text-emerald-600'
                          : 'border-slate-100 bg-slate-50 text-slate-500'
                      }`}
                      inputClassName={`w-32 rounded-control border px-3 py-2 text-footnote font-bold outline-none ${
                        account.status === 'Active'
                          ? 'bg-emerald-50/70 border-emerald-100 text-emerald-600'
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                      ariaLabel={`Update status for ${account.id}`}
                    />
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handlePasswordReset(account)}
                      disabled={resettingPasswordAccountId === account.id}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-control transition-colors ${
                        resettingPasswordAccountId === account.id
                          ? 'cursor-wait text-slate-300'
                          : (account.firebase_uid || account.firebase_auth_email || account.password_hash)
                            ? 'cursor-pointer text-emerald-600 hover:bg-emerald-50'
                            : 'cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                      title={
                        account.firebase_uid || account.firebase_auth_email
                          ? tr('重置 Firebase 登录密码', 'Reset Firebase login password', "Tetapkan semula kata laluan log masuk Firebase")
                          : account.password_hash
                            ? tr('已设本地密码 · 点击重置', 'Local password set · click to reset', "Set kata laluan setempat · klik untuk menetapkan semula")
                            : tr('设置本地开发密码', 'Set local development password', "Tetapkan kata laluan pembangunan tempatan")
                      }
                      aria-label={`Set password for ${account.id}`}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { void onDeleteAccount(account.id); }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-control text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      aria-label={`Delete account ${account.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {sortedAccounts.length === 0 && (
                <tr>
                  <td colSpan={attendancePolicy ? 6 : 5} className="py-14 text-center text-body text-slate-400">
                    {tr('没有找到账号', 'No accounts found', "Tiada akaun ditemui")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {passwordResetDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePasswordResetDialog();
            }
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-reset-dialog-title"
            onSubmit={(event) => {
              event.preventDefault();
              submitPasswordReset();
            }}
            className="w-full max-w-md overflow-hidden rounded-panel border border-slate-100 bg-white shadow-e3 shadow-slate-900/20"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <p className="text-micro uppercase text-brand-ink">
                  {passwordResetDraft.account.firebase_uid || passwordResetDraft.account.firebase_auth_email
                    ? 'Firebase Auth'
                    : tr('本地开发密码', 'Local Password', "Kata Laluan Tempatan")}
                </p>
                <h3 id="password-reset-dialog-title" className="mt-1 text-headline text-slate-900">
                  {tr('重置登录密码', 'Reset Login Password', "Tetapkan Semula Kata Laluan Log Masuk")}
                </h3>
                <p className="mt-1 truncate text-footnote text-slate-500">
                  {passwordResetDraft.account.name}
                </p>
              </div>
              <button
                type="button"
                onClick={closePasswordResetDialog}
                disabled={Boolean(resettingPasswordAccountId)}
                className="rounded-control p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-wait disabled:opacity-40"
                aria-label={tr('关闭', 'Close', "Tutup")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="text-micro uppercase text-slate-400">
                  {tr('新密码', 'New Password', "Kata Laluan Baharu")}
                </span>
                <input
                  autoFocus
                  type="password"
                  value={passwordResetDraft.password}
                  onChange={(event) => setPasswordResetDraft((current) => current ? {
                    ...current,
                    password: event.target.value,
                    error: ''
                  } : current)}
                  disabled={Boolean(resettingPasswordAccountId)}
                  placeholder={
                    passwordResetDraft.account.firebase_uid || passwordResetDraft.account.firebase_auth_email
                      ? tr('至少 8 位，不能有空格', 'At least 8 characters, no spaces', "Sekurang-kurangnya 8 aksara, tanpa ruang")
                      : tr('留空 = 移除本地密码', 'Empty = remove local password', "Kosong = keluarkan kata laluan setempat")
                  }
                  className="mt-2 w-full rounded-card border border-slate-100 bg-slate-50 px-4 py-3 text-callout text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-100 focus:bg-white focus:ring-2 focus:ring-brand-50 disabled:cursor-wait disabled:opacity-60"
                />
              </label>

              {passwordResetDraft.error && (
                <div className="rounded-card border border-rose-100 bg-rose-50 px-4 py-3 text-footnote leading-relaxed text-rose-700">
                  {passwordResetDraft.error}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePasswordResetDialog}
                disabled={Boolean(resettingPasswordAccountId)}
                className="rounded-card border border-slate-100 bg-white px-4 py-2.5 text-footnote font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-wait disabled:opacity-50"
              >
                {tr('取消', 'Cancel', "Batal")}
              </button>
              <button
                type="submit"
                disabled={Boolean(resettingPasswordAccountId)}
                className="inline-flex items-center justify-center gap-2 rounded-card bg-brand px-4 py-2.5 text-footnote font-bold text-white transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:bg-slate-300"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {resettingPasswordAccountId
                  ? tr('处理中...', 'Processing...', "Memproses...")
                  : tr('重置密码', 'Reset Password', "Tetapkan Semula Kata Laluan")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
