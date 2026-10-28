/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { firebaseConfig, isFirebaseConfigured } from '../lib/firebaseConfig';
import { getEnvironmentBadge } from '../lib/environmentBadge';

// Rendered beside <App /> in main.tsx, so it is on every page of a local
// session (staff, public, intake) and never on a deployed host. It never takes
// clicks: pointer-events stay off so it cannot cover a control.
// The production label carries all three UI languages at once, because this
// sibling of <App /> does not re-render on a language switch.
export function EnvironmentBadge() {
  const badge = getEnvironmentBadge({
    hostname: typeof window === 'undefined' ? '' : window.location.hostname,
    projectId: firebaseConfig.projectId,
    firebaseConfigured: isFirebaseConfigured
  });

  if (badge === 'production') {
    return (
      <div
        role="alert"
        data-testid="environment-badge-production"
        style={{ position: 'fixed', inset: 0, zIndex: 2147483000, pointerEvents: 'none', boxShadow: 'inset 0 0 0 4px #dc2626' }}
      >
        <div
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            background: '#dc2626', color: '#fff', font: '700 12px/1.2 system-ui, sans-serif',
            padding: '5px 14px', borderRadius: '0 0 8px 8px', whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)', maxWidth: '100vw', overflow: 'hidden', textOverflow: 'ellipsis'
          }}
        >
          正式数据 · Production data · Data sebenar — {firebaseConfig.projectId}
        </div>
      </div>
    );
  }

  if (badge === 'sandbox') {
    return (
      <div
        data-testid="environment-badge-sandbox"
        style={{
          position: 'fixed', left: 8, bottom: 8, zIndex: 2147483000, pointerEvents: 'none',
          background: 'rgba(15,23,42,0.72)', color: '#fff', font: '600 11px/1 system-ui, sans-serif',
          padding: '4px 8px', borderRadius: 999, letterSpacing: '0.02em'
        }}
      >
        Sandbox · {firebaseConfig.projectId}
      </div>
    );
  }

  return null;
}
