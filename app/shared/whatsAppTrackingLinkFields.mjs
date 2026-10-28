// Validation for WhatsApp tracking link fields sent to PATCH-style server
// endpoints by non-Super Admin staff. Errors carry `status = 400` so
// server.mjs returns them as client errors.
const TEXT_LIMITS = { label: 120, channel: 60, medium: 60, campaign: 60, message: 1000 };
const REQUIRED_TEXT = new Set(['label', 'channel', 'medium']);

function fieldError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export function normalizeWhatsAppTrackingLinkFields(input, { partial }) {
  const fields = {};

  for (const [key, limit] of Object.entries(TEXT_LIMITS)) {
    if (input?.[key] === undefined) {
      if (!partial && REQUIRED_TEXT.has(key)) throw fieldError(`WhatsApp link ${key} is required.`);
      continue;
    }
    const raw = String(input[key]).trim();
    const value = key === 'label' || key === 'message' ? raw : raw.toLowerCase();
    if (value.length > limit) throw fieldError(`WhatsApp link ${key} is too long.`);
    if (!value && REQUIRED_TEXT.has(key)) throw fieldError(`WhatsApp link ${key} is required.`);
    fields[key] = value;
  }

  if (input?.phone_number !== undefined) {
    const phone = String(input.phone_number).replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(phone)) throw fieldError('WhatsApp link phone number is invalid.');
    fields.phone_number = phone;
  } else if (!partial) {
    throw fieldError('WhatsApp link phone_number is required.');
  }

  if (input?.active !== undefined) fields.active = Boolean(input.active);

  // sales_name, id, and created_at are never accepted from the client: the
  // server sets sales_name to the caller and keeps the other two.
  return fields;
}
