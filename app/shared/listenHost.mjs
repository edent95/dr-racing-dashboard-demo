/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The address server.mjs binds to.
 *
 * Production (Cloud Run / App Hosting, Dockerfile) must keep listening on every
 * interface, so the default stays 0.0.0.0 and production sets nothing. Local
 * launchers (scripts/sandbox.mjs, scripts/dev.mjs, scripts/verify-runtime.mjs)
 * pass HOST=127.0.0.1 so a sandbox or preview on this machine is not reachable
 * from the rest of the Wi-Fi.
 *
 * Only an IP literal or `localhost` is accepted: a platform that happens to set
 * HOST to a machine name must not make production bind somewhere unexpected, so
 * anything else falls back to the default.
 */

import { isIP } from 'node:net';

export const DEFAULT_LISTEN_HOST = '0.0.0.0';

export function resolveListenHost(value) {
  const host = String(value ?? '').trim();
  if (!host) return DEFAULT_LISTEN_HOST;
  if (host === 'localhost' || isIP(host)) return host;
  return DEFAULT_LISTEN_HOST;
}
