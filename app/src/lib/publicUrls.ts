/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const PUBLIC_SITE_ORIGIN = 'https://dr-racing.com';
export const LEGACY_STAFF_SITE_ORIGIN = 'https://bo.dr-racing.com';

const LEGACY_PUBLIC_ROUTE_PATHS = ['/customer-intake', '/wa'];

export function getPublicSiteOrigin() {
  if (typeof window === 'undefined' || !import.meta.env.DEV) {
    return PUBLIC_SITE_ORIGIN;
  }

  // Keep the public Firebase Auth session separate from the staff dashboard
  // during local development. Both hostnames resolve to the same Vite server,
  // but browser storage (including Firebase Auth persistence) is origin-bound.
  if (window.location.hostname === 'localhost') {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//customer.localhost${port}`;
  }

  return window.location.origin;
}

export function buildPublicSiteUrl(pathAndQuery: string) {
  return new URL(pathAndQuery, `${getPublicSiteOrigin()}/`).toString();
}

export function getSafePublicRouteTarget(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl, window.location.origin);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    if (parsed.origin === window.location.origin) {
      return parsed.toString();
    }

    const isLegacyPublicTarget = (
      !import.meta.env.DEV
      && window.location.origin === PUBLIC_SITE_ORIGIN
      && parsed.origin === LEGACY_STAFF_SITE_ORIGIN
      && LEGACY_PUBLIC_ROUTE_PATHS.includes(parsed.pathname)
    );

    if (!isLegacyPublicTarget) {
      return null;
    }

    return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, `${PUBLIC_SITE_ORIGIN}/`).toString();
  } catch {
    return null;
  }
}
