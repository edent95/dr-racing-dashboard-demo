/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react';
import { CALC_PATH } from '../../shared/calculatorContent.mjs';
import {
  AGENTS,
  BUSINESS_LOCALITY,
  BUSINESS_MAP_URL,
  BUSINESS_PHONE,
  BUSINESS_POSTCODE,
  BUSINESS_REGION,
  BUSINESS_STREET_ADDRESS,
  SERVICE_AREAS,
  STOCK_INDEX_PATH
} from '../../shared/seoContent.mjs';
import { LEGACY_STAFF_SITE_ORIGIN } from '../lib/publicUrls';
import drRacingLogo from '../assets/dr-racing-logo-256.png';

export type SeoLanguage = 'en' | 'zh' | 'ms';

export type SeoAgent = { name: string; url: string };

/** Language chosen in the public site header, shared by the landing and stock pages. */
export const SEO_LANGUAGE_STORAGE_KEY = 'dr_racing_seo_language';

export const readStoredSeoLanguage = (): SeoLanguage => {
  try {
    const stored = localStorage.getItem(SEO_LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'zh' || stored === 'ms') {
      return stored;
    }
  } catch {
    // localStorage unavailable (private mode) — fall through to the default.
  }
  return 'ms';
};

export const storeSeoLanguage = (language: SeoLanguage) => {
  try {
    localStorage.setItem(SEO_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Persisting the choice is a convenience, never a requirement.
  }
};

export const seoHtmlLang = (language: SeoLanguage) =>
  language === 'zh' ? 'zh-MY' : language === 'ms' ? 'ms-MY' : 'en-MY';

/**
 * Rotates the WhatsApp agent per page load so enquiries spread evenly across the
 * team instead of always landing on whoever is listed first.
 */
export function useRotatingAgents(): (index: number) => SeoAgent {
  const start = useMemo(() => Math.floor(Math.random() * AGENTS.length), []);
  return (index: number) => AGENTS[(start + index) % AGENTS.length] as SeoAgent;
}

export function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.977-1.019zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

/**
 * Applies the page title / meta description on the client.
 *
 * server.mjs already injects the correct tags into the HTML shell for crawlers;
 * this keeps the browser tab and in-app navigation consistent for humans.
 */
export const applyDocumentSeo = (title: string, description: string, language: SeoLanguage) => {
  document.title = title;
  document.documentElement.lang = seoHtmlLang(language);
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', description);
  }
};


/**
 * Shared footer for every public page.
 *
 * Was duplicated five times, and every copy inherited one bug: the CSS applied
 * `filter: brightness(0) invert(1)` to the logo. That turns a monochrome
 * wordmark white — but this logo is a full-colour mascot badge, so the filter
 * flattened it into a featureless white blob on the dark footer, which reads as
 * "the logo is missing". The colour logo is legible on #111317 as-is.
 *
 * The footer also carries the NAP block now. Google weighs a visible, crawlable
 * address/phone that matches the Business Profile, and it made the footer look
 * finished instead of a logo floating next to three links.
 */
const FOOTER_COPY = {
  ms: {
    tagline: 'Kedai motor terpakai & loan kedai di Simpang Ampat, Pulau Pinang.',
    hours: 'Buka setiap hari · 10:00 pagi – 7:00 malam',
    nav: 'Laman',
    areas: 'Kawasan kami',
    home: 'Utama',
    stock: 'Stok motor',
    blog: 'Blog',
    calculator: 'Kalkulator ansuran',
    staff: 'Staff',
    map: 'Lihat lokasi di Google Maps'
  },
  zh: {
    tagline: '槟城 Simpang Ampat 二手摩托与店家分期。',
    hours: '每天营业 · 上午 10:00 – 晚上 7:00',
    nav: '网站链接',
    areas: '服务地区',
    home: '首页',
    stock: '现车',
    blog: '博客',
    calculator: '分期计算器',
    staff: '员工',
    map: '在 Google 地图查看位置'
  },
  en: {
    tagline: 'Used motorcycles & in-house financing in Simpang Ampat, Penang.',
    hours: 'Open daily · 10:00am – 7:00pm',
    nav: 'Site links',
    areas: 'Areas we serve',
    home: 'Home',
    stock: 'Stock',
    blog: 'Blog',
    calculator: 'Instalment calculator',
    staff: 'Staff',
    map: 'View location on Google Maps'
  }
} as const;

const FOOTER_ADDRESS = `${BUSINESS_STREET_ADDRESS}, ${BUSINESS_POSTCODE} ${BUSINESS_LOCALITY}, ${BUSINESS_REGION}`;
const FOOTER_TEL = `tel:${BUSINESS_PHONE.replace(/[^+\d]/g, '')}`;

export function PublicSeoFooter({
  language,
  disclaimer
}: {
  language: SeoLanguage;
  disclaimer: string;
}) {
  const t = FOOTER_COPY[language];

  return (
    <footer className="seo-footer">
      <div className="seo-shell seo-footer-main">
        <div className="seo-footer-brand">
          <img src={drRacingLogo} alt="DR Racing" width="256" height="201" />
          <p>{t.tagline}</p>
          <ul className="seo-footer-nap">
            <li>
              <MapPin aria-hidden="true" />
              <span>{FOOTER_ADDRESS}</span>
            </li>
            <li>
              <Phone aria-hidden="true" />
              <a href={FOOTER_TEL}>{BUSINESS_PHONE}</a>
            </li>
            <li>
              <Clock aria-hidden="true" />
              <span>{t.hours}</span>
            </li>
          </ul>
          <a
            className="seo-footer-map"
            href={BUSINESS_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.map}
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div className="seo-footer-col">
          <h3>{t.nav}</h3>
          <nav className="seo-footer-links" aria-label={t.nav}>
            <a href="/">{t.home}</a>
            <a href={STOCK_INDEX_PATH}>{t.stock}</a>
            <a href="/blog">{t.blog}</a>
            <a href={CALC_PATH}>{t.calculator}</a>
            <a href={`${LEGACY_STAFF_SITE_ORIGIN}/`}>{t.staff}</a>
          </nav>
        </div>
        <div className="seo-footer-col">
          <h3>{t.areas}</h3>
          <ul className="seo-footer-areas">
            {(SERVICE_AREAS as string[]).map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="seo-shell seo-footer-bottom">
        <p>© {new Date().getFullYear()} DR Racing. All rights reserved.</p>
        <p>{disclaimer}</p>
      </div>
    </footer>
  );
}
