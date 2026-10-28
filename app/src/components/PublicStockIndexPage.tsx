/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * /stok — the stock category page.
 *
 * The six /stok/<slug> pages previously had no parent: the only route into them
 * was an anchor on the homepage, and their breadcrumbs pointed at '/#stok',
 * which is not a page Google can index or link to. This is that page, and it is
 * also where a sold unit's traffic can be sent instead of a 404.
 *
 * server.mjs renders a crawlable version of the same content at this URL; this
 * component hydrates over it.
 */

import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { STOCK_INDEX_SEO, WHATSAPP_URL } from '../../shared/seoContent.mjs';
import drRacingLogo from '../assets/dr-racing-logo-256.png';
import PublicStockSection from './PublicStockSection';
import {
  PublicSeoFooter,
  applyDocumentSeo,
  readStoredSeoLanguage,
  storeSeoLanguage
} from './publicSeoShared';
import type { SeoLanguage } from './publicSeoShared';

const applicationHref = WHATSAPP_URL;

const chrome = {
  ms: {
    apply: 'Semak kelayakan',
    home: 'Utama',
    stock: 'Stok',
    disclaimer:
      'Stok dan status unit berubah dari semasa ke semasa. Kelulusan, deposit dan ansuran bulanan tertakluk pada penilaian pembiaya serta profil anda.'
  },
  zh: {
    apply: '查看资格',
    home: '首页',
    stock: '现车',
    disclaimer: '现车与状态会随时变动。批准、头期与月供取决于贷款机构的评估和你的个人情况。'
  },
  en: {
    apply: 'Check eligibility',
    home: 'Home',
    stock: 'Stock',
    disclaimer:
      'Stock and availability change over time. Approval, deposit and monthly instalment are subject to the financier assessment and your profile.'
  }
} as const;

export default function PublicStockIndexPage() {
  const [language, setLanguage] = useState<SeoLanguage>(() => readStoredSeoLanguage());
  const t = STOCK_INDEX_SEO[language] as { title: string; description: string; h1: string; intro: string };
  const c = chrome[language];

  useEffect(() => {
    storeSeoLanguage(language);
    applyDocumentSeo(t.title, t.description, language);
  }, [language, t.description, t.title]);

  const cycleLanguage = () => setLanguage(language === 'ms' ? 'zh' : language === 'zh' ? 'en' : 'ms');

  return (
    <div className="seo-page">
      <header className="seo-header">
        <a className="seo-brand" href="/" aria-label="DR Racing">
          <img src={drRacingLogo} alt="DR Racing" width="256" height="201" />
        </a>
        <div className="seo-header-actions">
          <button className="seo-language" type="button" onClick={cycleLanguage}>
            <Languages aria-hidden="true" /> {language === 'ms' ? '中文' : language === 'zh' ? 'EN' : 'BM'}
          </button>
          <a className="seo-button seo-button-small" href={applicationHref} target="_blank" rel="noopener noreferrer">{c.apply}</a>
        </div>
      </header>

      <main className="seo-shell">
        <nav aria-label="Breadcrumb" className="seo-eyebrow" style={{ margin: '0 0 10px' }}>
          <a href="/">{c.home}</a> / {c.stock}
        </nav>
        <div className="seo-section-heading" style={{ margin: '0 auto 10px', textAlign: 'left', maxWidth: 'none' }}>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 46px)', letterSpacing: '-.045em', lineHeight: 1.08, margin: 0 }}>
            {t.h1}
          </h1>
          <p style={{ color: 'var(--seo-muted)', fontSize: 16, lineHeight: 1.75, margin: '18px 0 0', maxWidth: 680 }}>
            {t.intro}
          </p>
        </div>
      </main>

      <PublicStockSection language={language} />

      <PublicSeoFooter language={language} disclaimer={c.disclaimer} />
    </div>
  );
}
