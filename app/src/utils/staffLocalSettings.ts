// Per-staff device settings (lead follow-up days, WhatsApp open mode, default
// WhatsApp message) are keyed by the lowercased staff name. A rename — by the
// staff member or by Super Admin on another device — would otherwise reset
// them. This remembers which name last owned an account's settings on this
// device and copies the keys forward when that name changes.

type SettingsStorage = Pick<Storage, 'getItem' | 'setItem'>;

const OWNER_KEY_PREFIX = 'dr_racing_staff_settings_owner:';

export function carryStaffLocalSettingsAcrossRename(
  storage: SettingsStorage,
  accountId: string,
  staffName: string,
  keyBuilders: Array<(staffName: string) => string>
): boolean {
  const id = accountId.trim();
  const nextName = staffName.trim().toLowerCase();
  if (!id || !nextName) return false;

  const ownerKey = `${OWNER_KEY_PREFIX}${id}`;
  const previousName = storage.getItem(ownerKey);
  let copied = false;

  if (previousName && previousName !== nextName) {
    for (const buildKey of keyBuilders) {
      const value = storage.getItem(buildKey(previousName));
      const targetKey = buildKey(nextName);
      if (value !== null && storage.getItem(targetKey) === null) {
        storage.setItem(targetKey, value);
        copied = true;
      }
    }
  }

  if (previousName !== nextName) {
    storage.setItem(ownerKey, nextName);
  }
  return copied;
}
