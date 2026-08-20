import { useEffect, useMemo, useRef, useState } from 'react';
import type { CustomerIntakeShortLink, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import { getPublicSiteOrigin, getSafePublicRouteTarget } from '../lib/publicUrls';
import { normalizeMalaysiaPhoneDigits as normalizePhoneNumber } from '../utils/malaysiaPhone';

const resolveShortLinkFromRemote = async (code: string) => {
  const module = await import('../services/publicRepository');
  return module.resolveShortLinkFromFirebase(code);
};

const savePublicWhatsAppClickToRemote = async (click: WhatsAppTrackingClick) => {
  const module = await import('../services/publicRepository');
  return module.savePublicWhatsAppClickToFirebase(click);
};

const buildWhatsAppSendUrl = (phoneNumber: string, message: string) => {
  const params = new URLSearchParams({
    phone: phoneNumber
  });

  if (message) {
    params.set('text', message);
  }

  return `https://api.whatsapp.com/send?${params.toString()}`;
};

type UsePublicRoutesOptions = {
  customerIntakeShortLinks: CustomerIntakeShortLink[];
  syncStatus: 'loading' | 'cached' | 'firebase' | 'local' | 'error';
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
};

export function usePublicRoutes({
  customerIntakeShortLinks,
  syncStatus,
  whatsAppTrackingLinks
}: UsePublicRoutesOptions) {
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const isWhatsAppRedirectPath = pathname === '/wa';
  const isCustomerIntakePath = pathname === '/customer-intake';
  const shortLinkMatch = pathname.match(/^\/s\/([^/]+)$/);
  const isShortLinkPath = Boolean(shortLinkMatch);
  const shortLinkCode = shortLinkMatch?.[1] || '';
  const isPublicRoutePath = isWhatsAppRedirectPath || isCustomerIntakePath || isShortLinkPath;
  const customerIntakeParams = useMemo(() => new URLSearchParams(search), [search]);
  const [redirectStatus, setRedirectStatus] = useState<'waiting' | 'redirecting' | 'inactive' | 'missing'>('waiting');
  const [redirectTargetUrl, setRedirectTargetUrl] = useState('');
  const [shortLinkRedirectStatus, setShortLinkRedirectStatus] = useState<'waiting' | 'redirecting' | 'missing'>('waiting');
  const [shortLinkRedirectTargetUrl, setShortLinkRedirectTargetUrl] = useState('');
  const hasProcessedTrackingRedirect = useRef(false);

  useEffect(() => {
    if (!import.meta.env.DEV || !isPublicRoutePath || window.location.hostname !== 'localhost') {
      return;
    }

    const publicOrigin = getPublicSiteOrigin();
    if (publicOrigin === window.location.origin) {
      return;
    }

    window.location.replace(`${publicOrigin}${window.location.pathname}${window.location.search}${window.location.hash}`);
  }, [isPublicRoutePath]);

  useEffect(() => {
    if (!isWhatsAppRedirectPath || syncStatus === 'loading' || hasProcessedTrackingRedirect.current) {
      return;
    }

    hasProcessedTrackingRedirect.current = true;

    const params = new URLSearchParams(window.location.search);
    const linkId = params.get('id') || '';
    const matchedLink = whatsAppTrackingLinks.find((link) => link.id === linkId);

    if (matchedLink && !matchedLink.active) {
      setRedirectStatus('inactive');
      return;
    }

    const phoneNumber = normalizePhoneNumber(matchedLink?.phone_number || params.get('phone') || '');

    if (!phoneNumber) {
      setRedirectStatus('missing');
      return;
    }

    const click: WhatsAppTrackingClick = {
      id: `CLICK-${Date.now()}`,
      link_id: linkId || 'direct',
      label: matchedLink?.label || params.get('label') || 'Direct WhatsApp Link',
      sales_name: matchedLink?.sales_name || params.get('sales') || '',
      phone_number: phoneNumber,
      channel: matchedLink?.channel || params.get('utm_source') || 'unknown',
      medium: matchedLink?.medium || params.get('utm_medium') || 'unknown',
      campaign: matchedLink?.campaign || params.get('utm_campaign') || 'unknown',
      clicked_at: new Date().toISOString(),
      referrer: document.referrer || '',
      user_agent: navigator.userAgent || ''
    };

    setRedirectStatus('redirecting');

    const message = matchedLink?.message || params.get('text') || '';
    const whatsAppUrl = buildWhatsAppSendUrl(phoneNumber, message);
    setRedirectTargetUrl(whatsAppUrl);

    savePublicWhatsAppClickToRemote(click)
      .catch((error) => {
        console.warn('Public WhatsApp click save failed, redirecting anyway.', error);
      })
      .finally(() => {
        window.setTimeout(() => {
          window.location.href = whatsAppUrl;
        }, 250);
      });
  }, [isWhatsAppRedirectPath, syncStatus, whatsAppTrackingLinks]);

  useEffect(() => {
    if (!isShortLinkPath || syncStatus === 'loading') {
      return;
    }

    const matchedShortLink = customerIntakeShortLinks.find((link) => (
      link.active && link.code.toLowerCase() === shortLinkCode.toLowerCase()
    ));

    if (matchedShortLink) {
      const safeTarget = getSafePublicRouteTarget(matchedShortLink.full_url);

      if (!safeTarget) {
        setShortLinkRedirectStatus('missing');
        return;
      }

      setShortLinkRedirectStatus('redirecting');
      setShortLinkRedirectTargetUrl(safeTarget);
      window.setTimeout(() => {
        window.location.href = safeTarget;
      }, 250);
      return;
    }

    let cancelled = false;

    resolveShortLinkFromRemote(shortLinkCode)
      .then((remoteLink) => {
        if (cancelled) {
          return;
        }

        const safeRemoteTarget = remoteLink && remoteLink.active
          ? getSafePublicRouteTarget(remoteLink.full_url)
          : null;

        if (safeRemoteTarget) {
          setShortLinkRedirectStatus('redirecting');
          setShortLinkRedirectTargetUrl(safeRemoteTarget);
          window.setTimeout(() => {
            window.location.href = safeRemoteTarget;
          }, 250);
        } else {
          setShortLinkRedirectStatus('missing');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShortLinkRedirectStatus('missing');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [customerIntakeShortLinks, isShortLinkPath, shortLinkCode, syncStatus]);

  return {
    customerIntakeParams,
    isCustomerIntakePath,
    isPublicRoutePath,
    isShortLinkPath,
    isWhatsAppRedirectPath,
    redirectStatus,
    redirectTargetUrl,
    shortLinkRedirectStatus,
    shortLinkRedirectTargetUrl
  };
}
