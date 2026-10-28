/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Which environment marker a page shows (owner decision 2026-09-30: localhost
// is for testing, so a local page that reaches production data must say so).
//
//   none        a deployed host (dr-racing.com, bo.dr-racing.com, anything not
//               local), or no Firebase project configured (local-state mode)
//   sandbox     a local host talking to a demo- project (the emulators)
//   production  a local host talking to a real Firebase project
export type EnvironmentBadge = 'none' | 'sandbox' | 'production';

// localhost, loopback, RFC 1918 LAN addresses, link-local, and mDNS / OrbStack
// *.local names. Everything else counts as a deployed host.
export function isLocalDevelopmentHost(hostname: string) {
  const host = String(hostname || '').trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host) return false;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (host === '::1' || host === '0.0.0.0') return true;
  if (/^fe80:/.test(host)) return true;
  const octets = host.split('.');
  if (octets.length !== 4 || !octets.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)) return false;
  const [a, b] = octets.map(Number);
  return a === 127
    || a === 10
    || (a === 192 && b === 168)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 169 && b === 254);
}

export function getEnvironmentBadge({ hostname, projectId, firebaseConfigured }: {
  hostname: string;
  projectId: string | undefined;
  firebaseConfigured: boolean;
}): EnvironmentBadge {
  if (!isLocalDevelopmentHost(hostname)) return 'none';
  const project = String(projectId || '').trim();
  if (!firebaseConfigured || !project) return 'none';
  return project.startsWith('demo-') ? 'sandbox' : 'production';
}
