// Reserved handler for public intake submitted through a staff short link whose
// owner is no longer an Active staff member (suspended, deleted, renamed or
// re-roled away from the link). Such applications wait here until a Super
// Admin / Operations Manager assigns them to an Active Sales through
// POST /api/staff/customer-assignments. Used by server.mjs and the browser.
//
// firestore.rules and storage.rules cannot import this module; they repeat the
// literal, and tests/unit/staff-link-queue.test.ts keeps the copies in sync.
export const STAFF_LINK_QUEUE = '__staff_link_queue__';

// Handler name used by website SEO intake before assignment.
export const SEO_HANDLER_NAME = 'SEO';

// Handler names that only Super Admin / Operations Manager may act on. Rules
// repeat this list in firestore.rules isReservedHandlerName and storage.rules
// isStaffApplicationOwner.
export const RESERVED_HANDLER_NAMES = [STAFF_LINK_QUEUE, SEO_HANDLER_NAME];

const RESERVED_STAFF_NAME_KEYS = RESERVED_HANDLER_NAMES.map((name) => name.toLowerCase());

// No staff account may be created or renamed to a reserved handler name,
// otherwise its staffName claim would match the queue / SEO rows (Rules also
// refuse it). Case-insensitive and whitespace-normalised.
export function isReservedStaffName(value) {
  const key = String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
  return RESERVED_STAFF_NAME_KEYS.includes(key);
}

export function isStaffLinkQueueHandler(value) {
  return value === STAFF_LINK_QUEUE;
}

// True while an application is waiting for a manager to pick a Sales handler:
// website SEO intake, or a staff-link intake parked in the queue.
export function isAwaitingHandlerAssignment(application) {
  const handlerName = String(application?.handler_name || '');
  if (handlerName === STAFF_LINK_QUEUE) return true;
  return handlerName === SEO_HANDLER_NAME
    && String(application?.customer_intake_tracking?.submitted_from || '') === 'seo_website';
}

// The handler assignments a public intake may submit for a stored short link
// record. `owner` routes the lead to the link's staff member; `queue` is the
// fallback the Rules accept only when the link carries an owner_uid whose
// staff_access row is no longer Active / matching. Legacy links without
// owner_uid have no fallback.
export function buildShortLinkIntakeAssignments(link) {
  const staffName = String(link?.staff_name || '');
  const staffRole = String(link?.staff_role || '');
  const tracking = { sales_name: staffName, sales_role: staffRole };
  const owner = {
    handler_name: staffName,
    handler_role: staffRole,
    admin_owner_name: String(link?.admin_owner_name || '')
  };
  const ownerUid = typeof link?.owner_uid === 'string' ? link.owner_uid : '';

  return {
    tracking,
    owner,
    queue: ownerUid
      ? { handler_name: STAFF_LINK_QUEUE, handler_role: 'Sales', admin_owner_name: '' }
      : null
  };
}
