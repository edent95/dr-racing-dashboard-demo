/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Patch helpers for handlers that `await` before writing a list back.
//
// A handler that captured `applications` (or calendarNotes, rawCustomerLeads)
// at render time and writes `captured.map(...)` after an await replaces every
// other row with its pre-await copy. The realtime listener meanwhile advanced
// the split-collection sync cache to the newer server version, so the next
// save writes the old object over the other staff member's edit with a
// matching version. Handlers must therefore re-read the latest list after the
// await and change only the row(s) they own.

type Identified = { id: string };

// Replace the row with `updated.id` in the latest list. Rows the handler does
// not own keep their current object (and reference). When the row is missing,
// it is prepended only if `insertIfMissing` is set.
export function replaceItemById<T extends Identified>(
  latest: readonly T[],
  updated: T,
  options: { insertIfMissing?: boolean } = {}
): T[] {
  let found = false;
  const next = latest.map((item) => {
    if (item.id !== updated.id) return item;
    found = true;
    return updated;
  });

  if (!found && options.insertIfMissing) {
    return [updated, ...next];
  }

  return next;
}

// Undo an optimistic write of one row after the save was refused. The previous
// value is restored only while the row still holds the handler's own optimistic
// object; if something newer (a realtime update or a conflict recovery) already
// replaced it, that newer value is kept. `previous === undefined` means the row
// did not exist before, so the optimistic row is removed.
export function rollbackItemById<T extends Identified>(
  latest: readonly T[],
  optimistic: T,
  previous: T | undefined
): T[] {
  const current = latest.find((item) => item.id === optimistic.id);
  if (current !== optimistic) {
    return latest.slice();
  }

  if (!previous) {
    return latest.filter((item) => item.id !== optimistic.id);
  }

  return latest.map((item) => (item.id === optimistic.id ? previous : item));
}

// Remove one row from the latest list.
export function removeItemById<T extends Identified>(latest: readonly T[], id: string): T[] {
  return latest.filter((item) => item.id !== id);
}

// A split-collection document (customers/{id}, raw_leads/{id}) as the app's
// object: drop the sync metadata exactly like the realtime listener does, so a
// value built from a transaction snapshot compares equal to a listener value.
export function withoutSyncMetadata<T extends Identified>(
  data: Record<string, unknown>,
  fallbackId: string
): T {
  const { updatedAt: _updatedAt, _sync_version: _syncVersion, ...rest } = data;
  return {
    ...rest,
    id: (typeof rest.id === 'string' && rest.id) || fallbackId
  } as unknown as T;
}
