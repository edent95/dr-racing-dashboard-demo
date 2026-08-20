/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SECURITY: staff leave (MC) attachments and other user-supplied "file_data_url"
 * values are attacker-controlled strings. A lower-privileged account can store
 * `javascript:...` (or an `image/svg+xml` payload) and have it execute inside an
 * Admin / Super Admin browser context the moment the link is clicked.
 *
 * Never bind a stored data-url string straight to `href` / `src`. Route it
 * through `createAttachmentObjectUrl` (or at minimum `isSafeAttachmentDataUrl`)
 * so only an allow-listed, non-scriptable MIME type ever reaches the DOM, and
 * only as a same-origin blob: URL.
 */

/**
 * Allow-listed attachment MIME types. `image/svg+xml` is deliberately excluded:
 * SVG is a scriptable document format.
 */
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/heic',
  'image/heif'
] as const;

export type AllowedAttachmentMimeType = (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number];

/** `accept` value for file inputs, kept in sync with the allow-list. */
export const ATTACHMENT_ACCEPT_ATTRIBUTE = ALLOWED_ATTACHMENT_MIME_TYPES.join(',');

const BASE64_DATA_URL = /^data:([a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*);base64,([A-Za-z0-9+/]+={0,2})$/i;

export type SafeAttachmentLike = {
  name?: string;
  type?: string;
  size?: number;
  file_data_url?: string;
};

export const isAllowedAttachmentMimeType = (type: string | undefined | null): boolean =>
  typeof type === 'string'
  && (ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(type.trim().toLowerCase());

type ParsedAttachmentDataUrl = { mimeType: AllowedAttachmentMimeType; base64: string };

/**
 * Parse a stored attachment value, returning null unless it is a base64 data
 * URL whose MIME type is allow-listed and (when a declared type is supplied)
 * matches that declared type. Any other scheme — `javascript:`, `http:`,
 * `data:text/html`, a mismatched declaration — is rejected.
 */
export const parseAttachmentDataUrl = (
  dataUrl: string | undefined | null,
  declaredType?: string | null
): ParsedAttachmentDataUrl | null => {
  if (typeof dataUrl !== 'string') return null;
  const match = BASE64_DATA_URL.exec(dataUrl.trim());
  if (!match) return null;

  const mimeType = match[1].toLowerCase();
  if (!isAllowedAttachmentMimeType(mimeType)) return null;

  if (typeof declaredType === 'string' && declaredType.trim().length > 0) {
    if (declaredType.trim().toLowerCase() !== mimeType) return null;
  }

  return { mimeType: mimeType as AllowedAttachmentMimeType, base64: match[2] };
};

export const isSafeAttachmentDataUrl = (
  dataUrl: string | undefined | null,
  declaredType?: string | null
): boolean => parseAttachmentDataUrl(dataUrl, declaredType) !== null;

/**
 * Turn a validated attachment into a same-origin `blob:` object URL that is safe
 * to place in `href`. Returns null when the stored value is not an allow-listed
 * data URL. Callers own the returned URL and must call `URL.revokeObjectURL`.
 */
export const createAttachmentObjectUrl = (attachment: SafeAttachmentLike | null | undefined): string | null => {
  if (!attachment) return null;
  const parsed = parseAttachmentDataUrl(attachment.file_data_url, attachment.type);
  if (!parsed) return null;

  try {
    const binary = atob(parsed.base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return URL.createObjectURL(new Blob([bytes], { type: parsed.mimeType }));
  } catch {
    return null;
  }
};
