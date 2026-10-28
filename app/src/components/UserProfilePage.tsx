import StaffMfaSettings from './StaffMfaSettings';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, Eye, EyeOff, ImagePlus, KeyRound, Mail, MessageCircle, Pencil, ShieldCheck, Sparkles, Trash2, Trophy, Upload, X } from 'lucide-react';
import { RoleAccount, RoleAccountRole, StaffDefaultAvatar } from '../types';
import { tr } from '../lib/i18n';
import { EXP_PER_LEVEL, STAFF_EXP_RULE_VERSION, type StaffExperienceProgress } from '../utils/staffExperience';
import ToggleSwitch from './ToggleSwitch';
import {
  formatStaffLoginIdentifier,
  resolveStaffAuthEmail
} from '../../shared/staffLoginIdentifier.mjs';
import { getStaffPasswordProblem } from '../../shared/staffPasswordPolicy.mjs';
import StaffPushToggle from './StaffPushToggle';

interface UserProfilePageProps {
  currentStaffName: string;
  currentStaffRole: RoleAccountRole;
  account?: RoleAccount;
  signedInLoginEmail?: string;
  experience: StaffExperienceProgress;
  defaultAvatars: StaffDefaultAvatar[];
  defaultAvatarUsage: Record<string, string>;
  onUpdateAvatar: (avatarDataUrl: string, defaultAvatarId?: string) => void;
  onRemoveAvatar: () => void;
  leadFollowUpDays: number;
  onUpdateLeadFollowUpDays: (days: number) => void;
  whatsAppOpenInNewTab: boolean;
  onUpdateWhatsAppOpenMode: (openInNewTab: boolean) => void;
  canEditProfile: boolean;
  onUpdateProfile: (name: string, email: string, currentPassword: string) => Promise<void>;
  canChangePassword: boolean;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const MAX_AVATAR_SIZE = 512;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'U';
  }

  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
}

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

export default function UserProfilePage({
  currentStaffName,
  currentStaffRole,
  account,
  signedInLoginEmail = '',
  experience,
  defaultAvatars,
  defaultAvatarUsage,
  onUpdateAvatar,
  onRemoveAvatar,
  leadFollowUpDays,
  onUpdateLeadFollowUpDays,
  whatsAppOpenInNewTab,
  onUpdateWhatsAppOpenMode,
  canEditProfile,
  onUpdateProfile,
  canChangePassword,
  onChangePassword
}: UserProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFollowUpExpanded, setIsFollowUpExpanded] = useState(false);
  const [isDefaultAvatarsVisible, setIsDefaultAvatarsVisible] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileName, setProfileName] = useState(account?.name || currentStaffName);
  const [profileEmail, setProfileEmail] = useState(formatStaffLoginIdentifier(account?.firebase_auth_email || account?.email || ''));
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [followUpDaysDraft, setFollowUpDaysDraft] = useState(String(leadFollowUpDays));
  const displayName = account?.name || currentStaffName;
  const displayRole = account?.role || currentStaffRole;
  const storedLoginEmail = account?.firebase_auth_email || account?.email || signedInLoginEmail;
  const displayLoginIdentifier = storedLoginEmail
    ? formatStaffLoginIdentifier(storedLoginEmail)
    : tr('没有登录账号记录', 'No login account record', "Tiada rekod akaun log masuk");
  const avatarDataUrl = account?.avatar_data_url || '';

  useEffect(() => {
    setFollowUpDaysDraft(String(leadFollowUpDays));
  }, [leadFollowUpDays]);

  // Commit on blur / Enter instead of every keystroke: typing "15" used to save
  // (and toast) "1" first, and clearing the field snapped straight back to 1.
  const commitFollowUpDaysDraft = () => {
    const parsed = Number(followUpDaysDraft);
    if (!followUpDaysDraft.trim() || !Number.isFinite(parsed)) {
      setFollowUpDaysDraft(String(leadFollowUpDays));
      return;
    }
    const normalized = Math.min(Math.max(Math.round(parsed), 1), 30);
    setFollowUpDaysDraft(String(normalized));
    if (normalized !== leadFollowUpDays) {
      onUpdateLeadFollowUpDays(normalized);
    }
  };

  useEffect(() => {
    if (isProfileEditing) return;
    setProfileName(account?.name || currentStaffName);
    setProfileEmail(formatStaffLoginIdentifier(account?.firebase_auth_email || account?.email || signedInLoginEmail));
  }, [account?.email, account?.firebase_auth_email, account?.name, currentStaffName, isProfileEditing, signedInLoginEmail]);

  const closeProfileEditor = () => {
    setIsProfileEditing(false);
    setProfileName(account?.name || currentStaffName);
    setProfileEmail(formatStaffLoginIdentifier(account?.firebase_auth_email || account?.email || signedInLoginEmail));
    setProfileCurrentPassword('');
    setProfileError('');
  };

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = profileName.trim().replace(/\s+/g, ' ');
    const normalizedEmail = resolveStaffAuthEmail(profileEmail);
    setProfileError('');

    if (!normalizedName) {
      setProfileError(tr('请输入姓名。', 'Enter your name.', 'Masukkan nama anda.'));
      return;
    }
    if (!normalizedEmail) {
      setProfileError(tr('请输入有效的用户名或 Email。', 'Enter a valid username or email.', 'Masukkan nama pengguna atau e-mel yang sah.'));
      return;
    }
    if (!profileCurrentPassword) {
      setProfileError(tr('请输入当前密码以保存资料。', 'Enter your current password to save profile changes.', 'Masukkan kata laluan semasa untuk menyimpan perubahan profil.'));
      return;
    }
    if (normalizedName === displayName && normalizedEmail === storedLoginEmail.toLowerCase()) {
      closeProfileEditor();
      return;
    }

    setIsProfileSaving(true);
    try {
      await onUpdateProfile(normalizedName, normalizedEmail, profileCurrentPassword);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : tr(
        '账号资料更新失败。',
        'Account information update failed.',
        'Kemas kini maklumat akaun gagal.'
      ));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError(tr('请输入当前密码。', 'Enter your current password.', 'Masukkan kata laluan semasa anda.'));
      return;
    }
    const newPasswordProblem = getStaffPasswordProblem(newPassword);
    if (newPasswordProblem === 'whitespace') {
      setPasswordError(tr('新密码不能包含空格。', 'New password must not contain spaces.', 'Kata laluan baharu tidak boleh mengandungi ruang.'));
      return;
    }
    if (newPasswordProblem === 'too_short') {
      setPasswordError(tr('新密码至少需要 8 个字符。', 'New password must be at least 8 characters.', 'Kata laluan baharu mesti sekurang-kurangnya 8 aksara.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(tr('两次输入的新密码不一致。', 'New passwords do not match.', 'Kata laluan baharu tidak sepadan.'));
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError(tr('新密码不能与当前密码相同。', 'New password must be different from the current password.', 'Kata laluan baharu mesti berbeza daripada kata laluan semasa.'));
      return;
    }

    setIsChangingPassword(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(tr('密码已更新。', 'Password updated.', 'Kata laluan dikemas kini.'));
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : tr(
        '密码更新失败，请重试。',
        'Password update failed. Try again.',
        'Kemas kini kata laluan gagal. Cuba lagi.'
      ));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setErrorMessage('');

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage(tr('请上传图片文件。', 'Please upload an image file.', 'Sila muat naik fail imej.'));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage(tr('图片不能超过 4MB。', 'Image must be 4MB or smaller.', 'Imej mestilah 4MB atau lebih kecil.'));
      return;
    }

    setIsProcessing(true);

    try {
      const resizedAvatar = await resizeAvatar(file);
      onUpdateAvatar(resizedAvatar);
    } catch {
      setErrorMessage(tr('头像上传失败，请换一张图片。', 'Avatar upload failed. Please try another image.', 'Muat naik avatar gagal. Sila cuba imej lain.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="user-profile-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-title-2 text-slate-900">{tr('用户资料', 'User Profile', "Profil Pengguna")}</h2>
          <p className="max-w-2xl text-footnote font-normal leading-relaxed text-slate-500">
            {tr('头像与账号资料。', 'Avatar and account details.', "Avatar dan butiran akaun.")}
          </p>
        </div>
      </section>

      <StaffPushToggle />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <div className="rounded-card border border-slate-100 bg-white p-5 shadow-e1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 text-title-1 text-slate-700 shadow-e1">
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
                ) : (
                  getInitials(displayName)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white bg-brand text-white shadow-e2 transition-colors hover:bg-brand-deep"
                aria-label={tr('上传头像', 'Upload avatar', "Muat naik avatar")}
                title={tr('上传头像', 'Upload avatar', "Muat naik avatar")}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-4 text-title-3 text-slate-900">{displayName}</h3>
            <p className="text-footnote text-slate-400">{displayRole}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-micro tracking-normal text-amber-700">
              <Sparkles className="h-3 w-3" />
              Level {experience.level} · {experience.seasonExp} EXP
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!account || isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-footnote font-bold text-white transition-colors hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Upload className="h-4 w-4" />
                {isProcessing ? tr('处理中...', 'Processing...', "Memproses...") : tr('上传头像', 'Upload Avatar', "Muat naik Avatar")}
              </button>
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={!account || !avatarDataUrl || isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-control border border-slate-100 bg-white px-4 py-2.5 text-footnote font-bold text-slate-500 transition-colors hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 disabled:bg-slate-50 disabled:text-slate-300"
              >
                <Trash2 className="h-4 w-4" />
                {tr('移除头像', 'Remove Avatar', "Alih keluar Avatar")}
              </button>
            </div>

            <div className="mt-5 w-full rounded-card bg-slate-50/70 p-3 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="text-micro uppercase text-slate-400">{tr('默认头像', 'Default Avatars', "Avatar lalai")}</p>
                <button
                  type="button"
                  onClick={() => setIsDefaultAvatarsVisible((current) => !current)}
                  className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-micro tracking-normal font-bold text-slate-500 transition-colors hover:bg-white hover:text-indigo-600"
                  aria-expanded={isDefaultAvatarsVisible}
                  aria-controls="user-default-avatars"
                  data-testid="user-default-avatars-toggle"
                >
                  {isDefaultAvatarsVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {isDefaultAvatarsVisible ? tr('隐藏', 'Hide', "Sembunyi") : tr('显示', 'Show', "Tunjuk")}
                </button>
              </div>
              {!isDefaultAvatarsVisible ? null : defaultAvatars.length > 0 ? (
                <div id="user-default-avatars" data-testid="user-default-avatars" className="mt-3 grid grid-cols-5 gap-2">
                  {defaultAvatars.map((avatar) => {
                    const usedByAccountId = defaultAvatarUsage[avatar.id];
                    const isUsedByOther = Boolean(usedByAccountId && usedByAccountId !== account?.id);

                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => onUpdateAvatar(avatar.avatar_data_url, avatar.id)}
                        disabled={!account || isProcessing || isUsedByOther}
                        className="flex items-center justify-center rounded-control bg-white p-1.5 ring-1 ring-slate-100 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-45"
                        title={isUsedByOther ? tr('其他员工已使用', 'Used by another staff', "Digunakan oleh kakitangan lain") : undefined}
                        aria-label={tr('选择默认头像', 'Choose default avatar', "Pilih avatar lalai")}
                      >
                        <span className="relative">
                          <img src={avatar.avatar_data_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                          {isUsedByOther && (
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-1 text-[7px] font-bold text-white">{tr('已用', 'Used', "terpakai")}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 rounded-control bg-white px-3 py-2 text-caption text-slate-400 ring-1 ring-slate-100">
                  {tr('还没有上传默认头像。Super Admin 可以在 设置 > 角色与账号 添加。', 'No default avatars uploaded. Super Admin can add them in Setting > Roles & Accounts.', "Tiada avatar lalai dimuat naik. Pentadbir Super boleh menambahkan mereka dalam Tetapan > Peranan & Akaun.")}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="mt-3 rounded-control bg-rose-50 px-3 py-2 text-footnote text-rose-600">{errorMessage}</p>
            )}
            {!account && (
              <p className="mt-3 rounded-control bg-amber-50 px-3 py-2 text-footnote text-amber-700">
                {tr('找不到对应的有效账号，无法保存头像。', 'No matching active account; avatar cannot be saved.', "Tiada akaun aktif yang sepadan; avatar tidak boleh disimpan.")}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-card border border-slate-100 bg-white p-5 shadow-e1">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-headline text-slate-900">{tr('账号资料', 'Account Information', "Maklumat Akaun")}</h3>
              <p className="text-footnote text-slate-400">{tr('员工可修改自己的姓名和登录用户名 / Email；角色仍由 Super Admin 管理。', 'Staff can edit their own name and login username or email; role remains managed by Super Admin.', 'Kakitangan boleh mengedit nama dan nama pengguna atau e-mel log masuk sendiri; peranan kekal diurus oleh Pentadbir Super.')}</p>
            </div>
            {canEditProfile && !isProfileEditing && (
              <button
                type="button"
                onClick={() => setIsProfileEditing(true)}
                className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-control bg-slate-100 px-3 py-2 text-footnote font-bold text-slate-600 transition-colors hover:bg-slate-200"
                data-testid="user-profile-edit"
              >
                <Pencil className="h-3.5 w-3.5" />
                {tr('编辑', 'Edit', 'Edit')}
              </button>
            )}
          </div>

          {isProfileEditing && canEditProfile ? (
            <form className="space-y-3" onSubmit={handleUpdateProfile} data-testid="user-profile-form">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <label className="block">
                  <span className="text-micro uppercase text-slate-500">{tr('姓名', 'Name', 'Nama')}</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    maxLength={200}
                    className="mt-1 w-full rounded-control bg-white px-3 py-2.5 text-callout text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-brand-100"
                    data-testid="user-profile-name-input"
                  />
                </label>
                <div className="rounded-control bg-slate-50 px-4 py-3">
                  <p className="text-micro uppercase text-slate-400">{tr('角色', 'Role', 'Peranan')}</p>
                  <p className="mt-1 truncate text-headline text-slate-800">{displayRole}</p>
                  <p className="mt-1 text-micro tracking-normal font-medium text-slate-400">{tr('只有 Super Admin 可以修改角色。', 'Only Super Admin can change roles.', 'Hanya Pentadbir Super boleh menukar peranan.')}</p>
                </div>
              </div>
              <label className="block">
                <span className="text-micro uppercase text-slate-500">{tr('登录用户名 / Email', 'Login Username / Email', 'Nama Pengguna / E-mel Log Masuk')}</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={profileEmail}
                  onChange={(event) => setProfileEmail(event.target.value)}
                  className="mt-1 w-full rounded-control bg-white px-3 py-2.5 text-callout text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-brand-100"
                  data-testid="user-profile-email-input"
                />
              </label>
              <label className="block">
                <span className="text-micro uppercase text-slate-500">{tr('当前密码', 'Current Password', 'Kata Laluan Semasa')}</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={profileCurrentPassword}
                  onChange={(event) => setProfileCurrentPassword(event.target.value)}
                  className="mt-1 w-full rounded-control bg-white px-3 py-2.5 text-callout text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-brand-100"
                  data-testid="user-profile-current-password"
                />
                <span className="mt-1 block text-micro tracking-normal font-medium text-slate-400">{tr('修改姓名或登录账号前必须验证当前密码。', 'Your current password is required before changing your name or login.', 'Kata laluan semasa diperlukan sebelum menukar nama atau log masuk anda.')}</span>
              </label>
              {profileError && <p className="rounded-control bg-rose-50 px-3 py-2 text-footnote text-rose-700">{profileError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeProfileEditor}
                  disabled={isProfileSaving}
                  className="inline-flex min-h-10 items-center gap-2 rounded-control bg-white px-4 py-2 text-footnote font-bold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  {tr('取消', 'Cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isProfileSaving}
                  className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep disabled:bg-slate-300"
                  data-testid="user-profile-save"
                >
                  {isProfileSaving ? tr('保存中...', 'Saving...', 'Menyimpan...') : tr('保存资料', 'Save Profile', 'Simpan Profil')}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-control bg-slate-50 px-4 py-3">
                <p className="text-micro uppercase text-slate-400">{tr('姓名', 'Name', "Nama")}</p>
                <p className="mt-1 truncate text-headline text-slate-800">{displayName}</p>
              </div>
              <div className="rounded-control bg-slate-50 px-4 py-3">
                <p className="text-micro uppercase text-slate-400">{tr('角色', 'Role', "Peranan")}</p>
                <p className="mt-1 truncate text-headline text-slate-800">{displayRole}</p>
              </div>
              <div className="rounded-control bg-slate-50 px-4 py-3 lg:col-span-2">
                <p className="text-micro uppercase text-slate-400">{tr('用户名 / Email', 'Username / Email', "Nama pengguna / E-mel")}</p>
                <p className="mt-1 flex items-center gap-2 truncate text-callout text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {displayLoginIdentifier}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-card border border-slate-100 bg-slate-50/60 p-4">
            <button
              type="button"
              onClick={() => setIsPasswordExpanded((current) => !current)}
              disabled={!canChangePassword}
              className="flex w-full items-center gap-3 rounded-control text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-expanded={isPasswordExpanded}
              aria-controls="user-password-settings"
              data-testid="user-password-toggle"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-ink">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-footnote font-bold text-slate-700">{tr('更改密码', 'Change Password', 'Tukar Kata Laluan')}</p>
                <p className="mt-0.5 text-micro tracking-normal font-medium text-slate-400">
                  {canChangePassword
                    ? tr('输入当前密码后设置新密码（至少 8 位，不能有空格）。', 'Confirm your current password, then set a new one (8+ characters, no spaces).', 'Sahkan kata laluan semasa, kemudian tetapkan yang baharu (8+ aksara, tanpa ruang).')
                    : tr('Firebase 登录账号才能自行更改密码。', 'A Firebase login account is required.', 'Akaun log masuk Firebase diperlukan.')}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isPasswordExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isPasswordExpanded && canChangePassword && (
              <form id="user-password-settings" data-testid="user-password-form" onSubmit={handleChangePassword} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <label className="block">
                  <span className="text-micro uppercase text-slate-500">{tr('当前密码', 'Current Password', 'Kata Laluan Semasa')}</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="mt-1 w-full rounded-control bg-white px-3 py-2.5 text-callout text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-brand-100"
                    data-testid="current-password-input"
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-micro uppercase text-slate-500">{tr('新密码', 'New Password', 'Kata Laluan Baharu')}</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="mt-1 w-full rounded-control bg-white px-3 py-2.5 text-callout text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-brand-100"
                      data-testid="new-password-input"
                    />
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase text-slate-500">{tr('确认新密码', 'Confirm New Password', 'Sahkan Kata Laluan Baharu')}</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="mt-1 w-full rounded-control bg-white px-3 py-2.5 text-callout text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-brand-100"
                      data-testid="confirm-password-input"
                    />
                  </label>
                </div>
                {passwordError && <p className="rounded-control bg-rose-50 px-3 py-2 text-footnote text-rose-700">{passwordError}</p>}
                {passwordSuccess && <p className="rounded-control bg-emerald-50 px-3 py-2 text-footnote text-emerald-700">{passwordSuccess}</p>}
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep disabled:bg-slate-300"
                >
                  {isChangingPassword ? tr('更新中...', 'Updating...', 'Mengemas kini...') : tr('更新密码', 'Update Password', 'Kemas Kini Kata Laluan')}
                </button>
              </form>
            )}
          </div>

          {canChangePassword && currentStaffRole === 'Super Admin' && <StaffMfaSettings />}

          <div data-testid="staff-experience-card" className="mt-5 overflow-hidden rounded-card border border-amber-100 bg-amber-50/35">
            <div className="flex items-start justify-between gap-3 border-b border-amber-100/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-amber-100 text-amber-700">
                  <Trophy className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-footnote font-bold text-slate-800">{tr('员工经验值', 'Staff Experience', "Pengalaman Kakitangan")}</p>
                  <p className="mt-0.5 text-caption text-slate-400">
                    {experience.seasonId} · {tr('每月重新开始', 'Monthly season reset', "Set semula musim bulanan")}
                  </p>
                </div>
              </div>
              <span data-testid="staff-experience-level" className="rounded-control bg-slate-900 px-3 py-1.5 text-footnote font-bold text-white">
                Level {experience.level}
              </span>
            </div>

            <div className="p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-micro uppercase text-slate-400">{tr('本月 EXP', 'Monthly EXP', "EXP Bulanan")}</p>
                  <p data-testid="staff-experience-exp" className="mt-1 font-mono text-title-2 text-slate-900">{experience.seasonExp}</p>
                </div>
                <p className="text-caption text-slate-500">
                  {experience.levelProgressExp} / {EXP_PER_LEVEL} · {experience.expToNextLevel} {tr('到下一级', 'to next level', "ke tahap seterusnya")}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-[width]"
                  style={{ width: `${Math.min((experience.levelProgressExp / EXP_PER_LEVEL) * 100, 100)}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-control bg-white px-3 py-2 ring-1 ring-amber-100/70">
                  <p className="text-micro uppercase text-slate-400">{tr('本月完成', 'Month Tasks', "Tugas Bulan")}</p>
                  <p className="mt-1 font-mono text-headline text-slate-800">{experience.seasonCompletedTasks}</p>
                </div>
                <div className="rounded-control bg-white px-3 py-2 ring-1 ring-amber-100/70">
                  <p className="text-micro uppercase text-slate-400">{tr('记录 EXP', 'Tracked EXP', "EXP Direkod")}</p>
                  <p className="mt-1 font-mono text-headline text-slate-800">{experience.trackedExp}</p>
                </div>
                <div className="rounded-control bg-white px-3 py-2 ring-1 ring-amber-100/70">
                  <p className="text-micro uppercase text-slate-400">{tr('记录任务', 'Tracked Tasks', "Tugas Direkod")}</p>
                  <p className="mt-1 font-mono text-headline text-slate-800">{experience.trackedCompletedTasks}</p>
                </div>
              </div>

              <p className="mt-3 text-micro tracking-normal leading-relaxed text-slate-400">
                {tr(
                  'EXP 来自不可重复的交车记录；负责的 Sales 和 Admin 每次各得 EXP，每 100 EXP 升一级。',
                  'EXP comes from deduplicated delivery history; each delivery rewards both the Sales handler and Admin owner, and every 100 EXP raises one level.',
                  'EXP datang daripada sejarah penghantaran tanpa pendua; setiap penghantaran memberi ganjaran kepada Sales dan Admin, dan setiap 100 EXP menaikkan satu tahap.'
                )} · {STAFF_EXP_RULE_VERSION}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-control border border-dashed border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white text-slate-500">
                <ImagePlus className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-footnote font-bold text-slate-700">{tr('头像显示', 'Avatar Display', "Paparan Avatar")}</p>
                <p className="mt-1 text-footnote leading-relaxed text-slate-500">
                  {tr('全站头像统一使用这里的设置。', 'Used everywhere your avatar appears.', "Digunakan di mana-mana sahaja avatar anda dipaparkan.")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-control border border-slate-100 bg-slate-50/60 p-4">
            <button
              type="button"
              onClick={() => setIsFollowUpExpanded((current) => !current)}
              className="flex w-full items-center gap-3 rounded-control text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
              aria-expanded={isFollowUpExpanded}
              aria-controls="user-follow-up-settings"
              data-testid="user-follow-up-toggle"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-footnote font-bold text-slate-700">
                  {tr('跟进设置', 'Follow Up', "Tetapan Susulan")}
                </p>
                <p className="mt-0.5 truncate text-micro tracking-normal font-medium text-slate-400">
                  {tr(
                    `潜在客户 ${leadFollowUpDays} 天 · WhatsApp ${whatsAppOpenInNewTab ? '新标签' : '当前页'}`,
                    `Lead ${leadFollowUpDays}d · WhatsApp ${whatsAppOpenInNewTab ? 'new tab' : 'same tab'}`,
                    `Prospek ${leadFollowUpDays} hari · WhatsApp ${whatsAppOpenInNewTab ? 'tab baharu' : 'tab sama'}`
                  )}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isFollowUpExpanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {isFollowUpExpanded && (
              <div id="user-follow-up-settings" data-testid="user-follow-up-settings" className="mt-4 grid grid-cols-1 gap-3">
                <section className="rounded-control bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-micro uppercase text-slate-500">
                    {tr('默认潜在客户跟进', 'Default Lead Follow-up', "Susulan Prospek Lalai")}
                  </p>
                  <p className="mt-1 text-footnote leading-relaxed text-slate-500">
                    {tr('从 Open Leads 打开 WhatsApp 后，系统会按这个天数安排下一次跟进。设置保存在当前设备。', 'After opening WhatsApp from Open Leads, the next follow-up uses this delay. This setting is saved on this device.', "Selepas membuka WhatsApp daripada Prospek Terbuka, susulan seterusnya menggunakan tempoh ini. Tetapan disimpan pada peranti ini.")}
                  </p>
                  <label className="mt-3 block">
                    <span className="text-micro uppercase text-slate-400">
                      {tr('几天后跟进', 'Follow up after', "Susulan selepas")}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={followUpDaysDraft}
                        onChange={(event) => setFollowUpDaysDraft(event.target.value)}
                        onBlur={commitFollowUpDaysDraft}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            commitFollowUpDaysDraft();
                          }
                        }}
                        className="w-24 rounded-control bg-slate-50 px-3 py-2 text-headline text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-emerald-200"
                        aria-label="Default lead follow-up days"
                      />
                      <span className="text-footnote text-slate-500">{tr('天', 'day(s)', "hari")}</span>
                    </div>
                  </label>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <ToggleSwitch
                      id="whatsapp-open-new-tab-setting"
                      checked={whatsAppOpenInNewTab}
                      onChange={onUpdateWhatsAppOpenMode}
                      label={tr('WhatsApp 在新标签页打开', 'Open WhatsApp in a new tab', 'Buka WhatsApp dalam tab baharu')}
                      description={whatsAppOpenInNewTab
                        ? tr('保留 Dashboard 在当前标签页。', 'Keep the Dashboard open in the current tab.', 'Kekalkan Dashboard dalam tab semasa.')
                        : tr('使用 WhatsApp 取代当前 Dashboard 页面。', 'Replace the current Dashboard page with WhatsApp.', 'Gantikan halaman Dashboard semasa dengan WhatsApp.')}
                      className="w-full justify-start px-0 py-1"
                    />
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
