import { useEffect, useMemo, useRef, useState } from 'react';
import type { CustomerIntakeShortLink, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import { getPublicSiteOrigin, getSafePublicRouteTarget } from '../lib/publicUrls';
import { trackPublicEvent } from '../lib/publicAnalytics';
import { normalizeMalaysiaPhoneDigits as normalizePhoneNumber } from '../utils/malaysiaPhone';

const resolveShortLinkFromRemote = async (code: string) => {
  const module = await import('../services/publicRepository');
  return module.resolveShortLinkFromFirebase(code);
};

const savePublicWhatsAppClickToRemote = async (click: WhatsAppTrackingClick) => {
  const module = await import('../services/publicRepository');
  return module.savePublicWhatsAppClickToFirebase(click);
};

const loadPublicTrackingLinkFromRemote = async (linkId: string) => {
  const module = await import('../services/publicRepository');
  return module.loadPublicTrackingLinkFromFirebase(linkId);
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
  const [redirectStatus, setRedirectStatus] = useState<'waiting' | 'redirecting' | 'inactive' | 'missing' | 'unavailable'>('waiting');
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
    void processTrackingRedirect();
  }, [isWhatsAppRedirectPath, syncStatus, whatsAppTrackingLinks]);

  const processTrackingRedirect = async () => {
    const params = new URLSearchParams(window.location.search);
    const linkId = params.get('id') || '';
    const cachedLink = whatsAppTrackingLinks.find((link) => link.id === linkId);
    let matchedLink = cachedLink;

    if (linkId) {
      // The stored record decides: a deleted or disabled link must not keep
      // working through the phone number still written in old URLs.
      try {
        const remoteLink = await loadPublicTrackingLinkFromRemote(linkId);
        if (remoteLink !== undefined) {
          matchedLink = remoteLink || undefined;
        }
      } catch (error) {
        // A cached copy may belong to a link that was since disabled or
        // deleted, so it never decides the redirect on its own.
        console.warn('WhatsApp link record could not be loaded.', error);
        setRedirectStatus('unavailable');
        return;
      }

      if (!matchedLink) {
        setRedirectStatus('missing');
        return;
      }
    }

    if (matchedLink && !matchedLink.active) {
      setRedirectStatus('inactive');
      return;
    }

    const phoneNumber = normalizePhoneNumber(matchedLink?.phone_number || params.get('phone') || '');

    if (!phoneNumber) {
      setRedirectStatus('missing');
      return;
    }

    // wa_clicks Rules accept a click only when every attribution field equals
    // the stored public_tracking_links record, so copy them verbatim (an empty
    // campaign used to become 'unknown' and the click was refused). Links with
    // no stored record ('direct' /wa?phone=) cannot be attributed and are not
    // written at all.
    const click: WhatsAppTrackingClick | null = matchedLink && linkId
      ? {
        id: `CLICK-${Date.now()}`,
        link_id: linkId,
        label: matchedLink.label ?? '',
        sales_name: matchedLink.sales_name ?? '',
        phone_number: matchedLink.phone_number ?? '',
        channel: matchedLink.channel ?? '',
        medium: matchedLink.medium ?? '',
        campaign: matchedLink.campaign ?? '',
        clicked_at: new Date().toISOString(),
        // Rules cap both at 500; Facebook referrers can be longer.
        referrer: (document.referrer || '').slice(0, 500),
        user_agent: (navigator.userAgent || '').slice(0, 500)
      }
      : null;

    setRedirectStatus('redirecting');

    const message = matchedLink?.message || params.get('text') || '';
    const whatsAppUrl = buildWhatsAppSendUrl(phoneNumber, message);
    setRedirectTargetUrl(whatsAppUrl);
    // The redirect is a script navigation, not a link click, so index.html's
    // click listener never sees it: report the same key event here.
    trackPublicEvent('whatsapp_click', {
      link_url: whatsAppUrl.split('?')[0],
      page_path: window.location.pathname,
      cta: matchedLink?.label || 'wa_redirect',
      cta_location: 'wa_redirect',
      transport_type: 'beacon'
    });

    (click ? savePublicWhatsAppClickToRemote(click) : Promise.resolve())
      .catch((error) => {
        console.warn('Public WhatsApp click save failed, redirecting anyway.', error);
      })
      .finally(() => {
        window.setTimeout(() => {
          window.location.href = whatsAppUrl;
        }, 250);
      });
  };

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
