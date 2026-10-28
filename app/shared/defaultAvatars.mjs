// Built-in staff default avatars, shipped as static files under public/avatars/.
// Imported by both server.mjs and the SPA so the server accepts the same ids the
// User Profile page offers. Super Admin library entries (dashboard_state
// defaultAvatarLibrary) are merged after these; a stored entry never overrides a
// built-in id.
const BUILT_IN_DEFAULT_AVATAR_COUNT = 14;

export const BUILT_IN_DEFAULT_AVATARS = Array.from({ length: BUILT_IN_DEFAULT_AVATAR_COUNT }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return {
    id: `builtin-avatar-${number}`,
    label: `Avatar ${number}`,
    file_name: `default-${number}.webp`,
    file_type: 'image/webp',
    file_size: 0,
    uploaded_by: 'System',
    uploaded_at: '2026-09-28T00:00:00.000Z',
    avatar_data_url: `/avatars/default-${number}.webp`
  };
});

const BUILT_IN_DEFAULT_AVATAR_IDS = new Set(BUILT_IN_DEFAULT_AVATARS.map((avatar) => avatar.id));

export function isBuiltInDefaultAvatarId(id) {
  return BUILT_IN_DEFAULT_AVATAR_IDS.has(String(id || ''));
}

export function mergeDefaultAvatarLibrary(library) {
  const stored = Array.isArray(library)
    ? library.filter((avatar) => avatar && !isBuiltInDefaultAvatarId(avatar.id))
    : [];
  return [...BUILT_IN_DEFAULT_AVATARS, ...stored];
}

function isDefaultAvatarUsedBy(account, avatar) {
  const assignedId = String(account?.default_avatar_id || '');
  return assignedId === avatar.id
    || (!assignedId && Boolean(avatar.avatar_data_url) && String(account?.avatar_data_url || '') === avatar.avatar_data_url);
}

// First avatar (built-ins before the Super Admin library) that no other account
// uses, or null when every one is taken. Default avatars stay one per staff.
export function pickUnusedDefaultAvatar(library, accounts, exceptAccountId = '') {
  const others = (Array.isArray(accounts) ? accounts : [])
    .filter((account) => account && String(account.id || '') !== String(exceptAccountId || ''));
  return mergeDefaultAvatarLibrary(library)
    .find((avatar) => !others.some((account) => isDefaultAvatarUsedBy(account, avatar))) || null;
}

// Gives every Active account that has no avatar an unused default one.
export function assignMissingDefaultAvatars(accounts, library) {
  const next = Array.isArray(accounts) ? [...accounts] : [];
  let assigned = 0;
  next.forEach((account, index) => {
    if (!account || account.status !== 'Active' || account.avatar_data_url) return;
    const avatar = pickUnusedDefaultAvatar(library, next, account.id);
    if (!avatar) return;
    next[index] = { ...account, avatar_data_url: avatar.avatar_data_url, default_avatar_id: avatar.id };
    assigned += 1;
  });
  return { accounts: next, assigned };
}
