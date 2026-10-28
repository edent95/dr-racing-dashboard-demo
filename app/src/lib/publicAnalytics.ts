// GA4 events sent from React code on the public site. The inline loader in
// index.html defines window.gtag only on dr-racing.com / www.dr-racing.com and
// never on a staff device, so calling through it keeps the same host gate and
// staff opt-out: everywhere else this is a no-op. Never pass customer details
// (name, phone, IC, address) as a parameter.
type GtagFunction = (command: 'event', eventName: string, params?: Record<string, unknown>) => void;

export function trackPublicEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const gtag = (window as unknown as { gtag?: GtagFunction }).gtag;
  if (typeof gtag !== 'function') {
    return;
  }

  try {
    gtag('event', eventName, params);
  } catch {
    /* analytics must never break a public page */
  }
}
