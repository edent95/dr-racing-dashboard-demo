/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Public demo bootstrap. Only bundled and executed when the app is built with
 * VITE_DEMO_MODE=true (the GitHub Pages demo). It reseeds the browser-local
 * dataset on every load so the public demo always shows the same fixed,
 * anonymized story, and signs the visitor in as a demo Super Admin so no
 * login is required. Nothing here ever talks to Firebase.
 */

import { buildDemoDashboardSeed } from './demoData';

const DEMO_SESSION = { name: 'Admin Director', role: 'Super Admin' };

const write = (key: string, value: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

function seedDemoData() {
  const seed = buildDemoDashboardSeed();

  write('loan_applications_dashboard', seed.applications);
  write('raw_customer_leads', seed.rawCustomerLeads);
  write('loan_role_accounts', seed.roleAccounts);
  write('calendar_notes', seed.calendarNotes);
  write('dashboard_notifications', seed.notifications);
  write('approval_requests', seed.approvalRequests);
  write('channel_marketing_spend', seed.channelMarketingSpend);
  write('whatsapp_tracking_links', seed.whatsAppTrackingLinks);
  write('whatsapp_tracking_clicks', seed.whatsAppTrackingClicks);
  write('customer_intake_short_links', seed.customerIntakeShortLinks);
  write('dashboard_audit_logs', seed.auditLogs);
}

function signInDemoStaff() {
  write('dr_racing_current_staff', DEMO_SESSION);
  window.localStorage.removeItem('dr_racing_logged_out');
}

function injectDemoBanner() {
  const banner = document.createElement('div');
  banner.setAttribute('data-demo-banner', 'true');
  banner.textContent = 'PUBLIC DEMO · ANONYMIZED SAMPLE DATA · RESETS ON RELOAD';
  banner.style.cssText = [
    'position:fixed',
    'left:50%',
    'bottom:14px',
    'transform:translateX(-50%)',
    'z-index:2147483647',
    'pointer-events:none',
    'background:rgba(15,23,42,0.88)',
    'color:#f8fafc',
    'font-family:ui-sans-serif,system-ui,sans-serif',
    'font-size:11px',
    'font-weight:700',
    'letter-spacing:0.08em',
    'padding:7px 14px',
    'border-radius:999px',
    'box-shadow:0 8px 24px rgba(15,23,42,0.35)',
    'white-space:nowrap',
    'max-width:94vw',
    'overflow:hidden',
    'text-overflow:ellipsis'
  ].join(';');

  const append = () => document.body.appendChild(banner);
  if (document.body) {
    append();
  } else {
    document.addEventListener('DOMContentLoaded', append, { once: true });
  }
}

export function seedDemoEnvironment() {
  try {
    seedDemoData();
    signInDemoStaff();
  } catch (error) {
    console.warn('Demo seed failed; the app will fall back to empty local data.', error);
  }

  try {
    injectDemoBanner();
  } catch (error) {
    console.warn('Demo banner could not be injected.', error);
  }
}
