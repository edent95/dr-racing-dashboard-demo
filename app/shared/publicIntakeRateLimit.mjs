/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Public intake abuse control, used by server.mjs (POST /api/public-intake/permit).
// An anonymous Auth uid is free to reset, so the per-uid guard alone bounds
// nothing. The server issues a short-lived permit per uid only while the caller's
// IP and the short link are under their fixed-window budgets, and Firestore Rules
// refuse a public customer create without that permit.

import { createHash } from 'node:crypto';

export const PUBLIC_INTAKE_PERMIT_TTL_MS = 60 * 60 * 1000;

export const PUBLIC_INTAKE_RATE_LIMITS = {
  // One person resubmitting after a mistake stays well inside this.
  ip: { limit: 5, windowMs: 60 * 60 * 1000 },
  // A salesperson's link rarely sees this many genuine customers in an hour;
  // the cap bounds what a distributed attacker can push through one link.
  link: { limit: 30, windowMs: 60 * 60 * 1000 }
};

export function normalizePublicIntakeShortLinkCode(value) {
  const code = String(value || '').trim();
  return /^[A-Za-z0-9_-]{1,80}$/.test(code) ? code : '';
}

// The raw IP is personal data; only a digest is stored as the counter key.
export function getPublicIntakeIpRateKey(ipAddress) {
  const ip = String(ipAddress || '').trim().toLowerCase().replace(/^::ffff:/, '') || 'unknown';
  return `ip_${createHash('sha256').update(`dr-racing-public-intake:${ip}`).digest('hex').slice(0, 40)}`;
}

export function getPublicIntakeLinkRateKey(shortLinkCode) {
  return `link_${shortLinkCode}`;
}

// Fixed window: the first hit after the window ends starts a new one.
// `existing` is the stored { window_start_ms, count } (or null).
export function consumePublicIntakeRateWindow(existing, nowMs, { limit, windowMs }) {
  const windowStart = Number(existing?.window_start_ms);
  const count = Number(existing?.count);
  const isCurrent = Number.isFinite(windowStart)
    && Number.isFinite(count)
    && windowStart <= nowMs
    && nowMs < windowStart + windowMs;

  if (!isCurrent) {
    return { allowed: true, next: { window_start_ms: nowMs, count: 1 }, retryAfterMs: 0 };
  }
  if (count >= limit) {
    return { allowed: false, next: { window_start_ms: windowStart, count }, retryAfterMs: windowStart + windowMs - nowMs };
  }
  return { allowed: true, next: { window_start_ms: windowStart, count: count + 1 }, retryAfterMs: 0 };
}

// A retry from the same uid for the same link reuses its unexpired permit
// instead of spending budget again (timeouts, double taps, documents-only retries).
export function isReusablePublicIntakePermit(permit, uid, shortLinkCode, nowMs) {
  const expiresAt = Number(permit?.expires_at_ms);
  return Boolean(permit)
    && permit.uid === uid
    && permit.short_link_code === shortLinkCode
    && Number.isFinite(expiresAt)
    && nowMs < expiresAt;
}
