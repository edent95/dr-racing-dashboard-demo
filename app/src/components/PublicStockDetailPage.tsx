/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, Check, Languages, MapPin } from 'lucide-react';
import {
  BUSINESS_MAP_URL,
  STOCK,
  USP,
  findStockBySlug,
  stockImage,
  stockImageSmall,
  stockSeo
} from '../../shared/seoContent.mjs';
import drRacingLogo from '../assets/dr-racing-logo-256.png';
import {
  WhatsAppGlyph,
  applyDocumentSeo,
  readStoredSeoLanguage,
  storeSeoLanguage,
  useRotatingAgents
} from './publicSeoShared';
import type { SeoLanguage } from './publicSeoShared';

const copy = {
  ms: {
    home: 'Utama', stock: 'Stok', terpakai: 'Terpakai', boleh: 'Boleh Loan',
    tahun: 'Tahun', plate: 'No Plate', warna: 'Warna', model: 'Model', deposit: 'Deposit',
    lokasi: 'Lokasi', status: 'Status', sedia: 'Sedia untuk loan',
    wa: 'Tanya di WhatsApp', apply: 'Mula permohonan', map: 'Lihat lokasi showroom', detail: 'Lihat butiran',
    lede: (m: string, y: number, p: string) =>
      `${m} tahun ${y}, no plate ${p}, tersedia di showroom DR Racing Simpang Ampat. Unit ini boleh buat loan — kami uruskan permohonan, dokumen dan tukar nama untuk anda.`,
    note: 'Kelulusan, deposit dan ansuran bulanan bergantung pada penilaian pembiaya serta profil anda. Hubungi kami untuk anggaran khusus untuk keadaan anda.',
    other: 'Stok lain yang boleh buat loan',
    back: 'Lihat semua stok'
  },
  zh: {
    home: '首页', stock: '现车', terpakai: '二手', boleh: '可做 Loan',
    tahun: '年份', plate: '车牌', warna: '颜色', model: '车型', deposit: '头期',
    lokasi: '地点', status: '状态', sedia: '可申请分期',
    wa: 'WhatsApp 询问', apply: '开始申请', map: '查看展示厅位置', detail: '查看详情',
    lede: (m: string, y: number, p: string) =>
      `${m}，${y} 年份，车牌 ${p}，现车在 DR Racing Simpang Ampat 展示厅。这台可以做 loan（分期）—— 申请、文件、过户我们全程帮你处理。`,
    note: '批准、头期与月供取决于贷款机构的评估和你的个人情况。联系我们，我们按你的实际情况给估算。',
    other: '其他可做分期的现车',
    back: '查看全部现车'
  },
  en: {
    home: 'Home', stock: 'Stock', terpakai: 'Second hand', boleh: 'Loan OK',
    tahun: 'Year', plate: 'Plate no.', warna: 'Colour', model: 'Model', deposit: 'Deposit',
    lokasi: 'Location', status: 'Status', sedia: 'Ready for financing',
    wa: 'Enquire on WhatsApp', apply: 'Start application', map: 'View showroom location', detail: 'View details',
    lede: (m: string, y: number, p: string) =>
      `${m}, year ${y}, plate ${p}, available at the DR Racing showroom in Simpang Ampat. This unit is loan-ready — we handle the application, paperwork and ownership transfer for you.`,
    note: 'Approval, deposit and monthly instalment depend on the financier assessment and your profile. Contact us for an estimate specific to your situation.',
    other: 'Other loan-ready stock',
    back: 'View all stock'
  }
} as const;

const applicationHref = '/customer-intake?utm_source=website&utm_medium=organic&utm_campaign=seo_stock';

type Props = { slug: string };

export default function PublicStockDetailPage({ slug }: Props) {
  const [language, setLanguage] = useState<SeoLanguage>(() => readStoredSeoLanguage());
  const agentFor = useRotatingAgents();
  const item = findStockBySlug(slug);
  const t = copy[language];

  useEffect(() => {
    storeSeoLanguage(language);
    if (!item) {
      applyDocumentSeo('Stok tidak dijumpai | DR Racing', 'Unit ini mungkin sudah terjual.', language);
      return;
    }
    const seo = stockSeo(item, language);
    applyDocumentSeo(seo.title, seo.description, language);
  }, [item, language]);

  const cycleLanguage = () => setLanguage(language === 'ms' ? 'zh' : language === 'zh' ? 'en' : 'ms');

  if (!item) {
    return (
      <div className="seo-page">
        <div className="seo-shell seo-detail">
          <h1>404</h1>
          <p className="seo-detail-lede">
            Unit ini tiada dalam senarai — mungkin sudah terjual. Lihat stok terkini kami.
          </p>
          <a className="seo-button" href="/">{t.back}<ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
    );
  }

  const seo = stockSeo(item, language);
  const agent = agentFor(0);
  const others = STOCK.filter((entry) => entry.slug !== item.slug).slice(0, 3);

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
          <a className="seo-button seo-button-small" href={applicationHref}>{t.apply}</a>
        </div>
      </header>

      <main className="seo-shell seo-detail">
        <nav className="seo-crumbs" aria-label="Breadcrumb">
          <a href="/">{t.home}</a><span>/</span>
          <a href="/#stok">{t.stock}</a><span>/</span>
          <span style={{ color: '#3c3f44' }}>{item.model} {item.plate}</span>
        </nav>

        <div className="seo-detail-grid">
          <div className="seo-detail-photo">
            <img
              src={stockImage(item.slug)}
              srcSet={`${stockImageSmall(item.slug)} 400w, ${stockImage(item.slug)} 800w`}
              sizes="(max-width: 900px) 100vw, 620px"
              width={800}
              height={600}
              // Above the fold on this page: load eagerly so the largest paint is fast.
              loading="eager"
              fetchPriority="high"
              decoding="async"
              alt={`${seo.caption} — no plate ${item.plate}`}
            />
          </div>

          <div>
            <p className="seo-eyebrow"><BadgeCheck aria-hidden="true" /> {t.boleh}</p>
            <h1>{item.model} <span style={{ color: 'var(--seo-red)' }}>{item.year}</span></h1>
            <p className="seo-detail-lede">{t.lede(item.model, item.year, item.plate)}</p>

            <ul className="seo-spec">
              <li><b>{t.model}</b><span>{item.model}</span></li>
              <li><b>{t.tahun}</b><span>{item.year}</span></li>
              <li><b>{t.plate}</b><span>{item.plate}</span></li>
              <li><b>{t.warna}</b><span>{item.colour[language]}</span></li>
              {item.deposit ? <li><b>{t.deposit}</b><span>{item.deposit}</span></li> : null}
              <li><b>{t.lokasi}</b><span>Simpang Ampat, Pulau Pinang</span></li>
              <li><b>{t.status}</b><span style={{ color: '#10803f' }}>{t.sedia}</span></li>
            </ul>

            <ul className="seo-usp" style={{ margin: '0 0 24px' }}>
              {(USP[language] as string[]).slice(0, 4).map((point) => (
                <li key={point}><Check aria-hidden="true" />{point}</li>
              ))}
            </ul>

            <div className="seo-detail-actions">
              <a className="seo-wa" href={agent.url} target="_blank" rel="noopener noreferrer">
                <WhatsAppGlyph />{t.wa} · {agent.name}
              </a>
              <a className="seo-stock-detail-link" href={BUSINESS_MAP_URL} target="_blank" rel="noopener noreferrer">
                <MapPin aria-hidden="true" style={{ height: 14, width: 14 }} />{t.map}
              </a>
            </div>
            <p className="seo-detail-note">{t.note}</p>
          </div>
        </div>

        <section style={{ marginTop: 88 }}>
          <div className="seo-section-heading" style={{ marginBottom: 34 }}>
            <h2 style={{ fontSize: 30 }}>{t.other}</h2>
          </div>
          <div className="seo-stock-grid" style={{ marginTop: 0 }}>
            {others.map((entry, index) => {
              const entrySeo = stockSeo(entry, language);
              const entryAgent = agentFor(index + 1);
              return (
                <article className="seo-stock-card" key={entry.slug}>
                  <a className="seo-stock-photo" href={`/stok/${entry.slug}`} aria-label={entrySeo.title}>
                    <img
                      src={stockImage(entry.slug)}
                      srcSet={`${stockImageSmall(entry.slug)} 400w, ${stockImage(entry.slug)} 800w`}
                      sizes="(max-width: 900px) 100vw, 380px"
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      alt={`${entrySeo.caption} — no plate ${entry.plate}`}
                    />
                    <span className="seo-stock-badge">{t.terpakai}</span>
                  </a>
                  <div className="seo-stock-body">
                    <h3>{entry.model}</h3>
                    <p className="seo-stock-caption">{entrySeo.caption}</p>
                    <ul className="seo-stock-meta">
                      <li><b>{t.tahun}</b>{entry.year}</li>
                      <li><b>No Plate</b>{entry.plate}</li>
                    </ul>
                    <div className="seo-stock-actions">
                      <a className="seo-stock-detail-link" href={`/stok/${entry.slug}`}>
                        {t.detail}
                        <ArrowRight aria-hidden="true" style={{ height: 14, width: 14 }} />
                      </a>
                      <a className="seo-wa" href={entryAgent.url} target="_blank" rel="noopener noreferrer">
                        <WhatsAppGlyph />{t.wa} · {entryAgent.name}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="seo-footer">
        <div className="seo-shell seo-footer-main">
          <div>
            <img src={drRacingLogo} alt="DR Racing" width="256" height="201" />
            <p>Loan motor Simpang Ampat, Pulau Pinang.</p>
          </div>
          <div className="seo-footer-links">
            <a href="/">{t.home}</a>
            <a href="/blog">Blog</a>
            <a href="https://bo.dr-racing.com/">Staff</a>
          </div>
        </div>
        <div className="seo-shell seo-footer-bottom">
          <p>© {new Date().getFullYear()} DR Racing. All rights reserved.</p>
          <p>{t.note}</p>
        </div>
      </footer>
    </div>
  );
}
