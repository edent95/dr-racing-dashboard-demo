/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * /kalkulator-ansuran-motor — flat-rate instalment calculator with the total
 * cost of ownership view no competitor calculator shows. Content and maths
 * are shared with server.mjs via shared/calculatorContent.mjs so the crawler
 * body and this page never drift apart.
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calculator } from 'lucide-react';
import {
  CALC_DEFAULTS,
  CALC_DESCRIPTION,
  CALC_FAQ,
  CALC_H1,
  CALC_INTRO,
  CALC_SECTIONS,
  CALC_TITLE,
  OWNERSHIP_ESTIMATES,
  calcLoan
} from '../../shared/calculatorContent.mjs';
import { STOCK, WHATSAPP_URL, stockImage, stockSeo } from '../../shared/seoContent.mjs';
import drRacingLogo from '../assets/dr-racing-logo-256.png';
import { PublicSeoFooter, WhatsAppGlyph, applyDocumentSeo, useRotatingAgents } from './publicSeoShared';

const applicationHref = WHATSAPP_URL;

const CALC_DISCLAIMER =
  'Angka kalkulator ini adalah anggaran untuk perancangan, bukan tawaran pembiayaan. Kelulusan, kadar dan terma tertakluk pada penilaian pembiaya.';

const ringgit = (value: number) =>
  `RM${Math.round(value).toLocaleString('en-MY')}`;

const fieldStyle: React.CSSProperties = {
  border: '1px solid #d8dadf',
  borderRadius: 10,
  fontSize: 16,
  padding: '10px 12px',
  width: '100%'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: '.04em',
  margin: '0 0 6px',
  textTransform: 'uppercase'
};

export default function PublicCalculatorPage() {
  const [price, setPrice] = useState(CALC_DEFAULTS.price);
  const [deposit, setDeposit] = useState(CALC_DEFAULTS.deposit);
  const [rate, setRate] = useState(CALC_DEFAULTS.ratePctPerYearFlat);
  const [months, setMonths] = useState(CALC_DEFAULTS.months);
  const agentFor = useRotatingAgents();
  const agent = agentFor(0);

  useEffect(() => {
    applyDocumentSeo(CALC_TITLE, CALC_DESCRIPTION, 'ms');
  }, []);

  const result = useMemo(
    () => calcLoan({ price, deposit, ratePctPerYearFlat: rate, months }),
    [price, deposit, rate, months]
  );

  const [insLow, insHigh] = OWNERSHIP_ESTIMATES.insuranceThirdPartyPerYear;
  const monthlyOwnershipLow = result.monthly + insLow / 12;
  const monthlyOwnershipHigh = result.monthly + insHigh / 12 + OWNERSHIP_ESTIMATES.roadTaxPerYearUpTo150cc[1] / 12;
  const featured = STOCK.filter((item) => item.available).slice(0, 3);

  return (
    <div className="seo-page">
      <header className="seo-header">
        <a className="seo-brand" href="/" aria-label="DR Racing">
          <img src={drRacingLogo} alt="DR Racing" width="256" height="201" />
        </a>
        <div className="seo-header-actions">
          <a className="seo-button seo-button-small" href={applicationHref} target="_blank" rel="noopener noreferrer">Semak kelayakan</a>
        </div>
      </header>

      <main className="seo-shell seo-blog">
        <article className="seo-article">
          <nav className="seo-crumbs" aria-label="Breadcrumb">
            <a href="/">Utama</a><span>/</span>
            <span style={{ color: '#3c3f44' }}>Kalkulator ansuran motor</span>
          </nav>

          <p className="seo-eyebrow"><Calculator aria-hidden="true" style={{ height: 14, width: 14 }} /> Kalkulator percuma</p>
          <h1>{CALC_H1}</h1>
          <p className="seo-article-lede">{CALC_INTRO}</p>

          <section
            aria-label="Kalkulator ansuran"
            style={{
              background: '#fff',
              border: '1px solid #e4e6ea',
              borderRadius: 18,
              margin: '28px 0 40px',
              padding: '26px 26px 30px'
            }}
          >
            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              <div>
                <label htmlFor="calc-price" style={labelStyle}>Harga motor (RM)</label>
                <input id="calc-price" type="number" min={0} step={100} value={price} style={fieldStyle}
                  onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))} />
              </div>
              <div>
                <label htmlFor="calc-deposit" style={labelStyle}>Deposit (RM)</label>
                <input id="calc-deposit" type="number" min={0} step={100} value={deposit} style={fieldStyle}
                  onChange={(event) => setDeposit(Math.max(0, Number(event.target.value) || 0))} />
              </div>
              <div>
                <label htmlFor="calc-rate" style={labelStyle}>Kadar setahun, rata (%)</label>
                <input id="calc-rate" type="number" min={0} max={30} step={0.5} value={rate} style={fieldStyle}
                  onChange={(event) => setRate(Math.min(30, Math.max(0, Number(event.target.value) || 0)))} />
              </div>
              <div>
                <label htmlFor="calc-months" style={labelStyle}>Tempoh (bulan)</label>
                <select id="calc-months" value={months} style={fieldStyle}
                  onChange={(event) => setMonths(Number(event.target.value))}>
                  {[12, 18, 24, 30, 36, 42, 48, 54, 60].map((option) => (
                    <option key={option} value={option}>{option} bulan</option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #eceef1',
                display: 'grid',
                gap: 18,
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                marginTop: 24,
                paddingTop: 22
              }}
            >
              <div>
                <p style={{ ...labelStyle, margin: 0 }}>Ansuran bulanan</p>
                <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', margin: '2px 0 0' }}>
                  {ringgit(result.monthly)}
                </p>
              </div>
              <div>
                <p style={{ ...labelStyle, margin: 0 }}>Jumlah faedah</p>
                <p style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 0' }}>{ringgit(result.interest)}</p>
              </div>
              <div>
                <p style={{ ...labelStyle, margin: 0 }}>Jumlah bayaran balik</p>
                <p style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 0' }}>{ringgit(result.total)}</p>
              </div>
              <div>
                <p style={{ ...labelStyle, margin: 0 }}>Kadar efektif ≈</p>
                <p style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 0' }}>{result.effectivePct.toFixed(1)}% setahun</p>
              </div>
            </div>

            <p style={{ color: '#6b6f76', fontSize: 13.5, lineHeight: 1.65, margin: '20px 0 0' }}>
              Kos milikan sebenar sebulan (ansuran + anggaran insurans pihak ketiga &amp; cukai jalan untuk kapcai):
              sekitar <b>{ringgit(monthlyOwnershipLow)}–{ringgit(monthlyOwnershipHigh)}</b>. Yuran tukar nama &amp;
              urusan JPJ (sekali sahaja): anggaran RM{OWNERSHIP_ESTIMATES.jpjTransferFee[0]}–RM{OWNERSHIP_ESTIMATES.jpjTransferFee[1]}.
              Semua angka adalah anggaran perancangan, bukan sebut harga.
            </p>
          </section>

          <div className="seo-article-body">
            {CALC_SECTIONS.map((section: { h: string; p: string[] }) => (
              <section key={section.h}>
                <h2>{section.h}</h2>
                {section.p.map((paragraph: string) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </section>
            ))}
            <section>
              <h2>Soalan lazim</h2>
              {CALC_FAQ.map(([question, answer]: [string, string]) => (
                <div key={question}>
                  <h3 style={{ fontSize: 17, letterSpacing: '-.02em', margin: '22px 0 6px' }}>{question}</h3>
                  <p>{answer}</p>
                </div>
              ))}
            </section>
          </div>

          <div className="seo-article-cta">
            <h2>Nak angka sebenar untuk unit sebenar?</h2>
            <p>
              Beritahu kami model dan bajet anda — kami balas dengan deposit, ansuran dan jumlah keseluruhan
              secara bertulis, untuk unit yang memang ada di showroom kami di Simpang Ampat.
            </p>
            <a className="seo-wa" href={agent.url} target="_blank" rel="noopener noreferrer">
              <WhatsAppGlyph />Tanya di WhatsApp · {agent.name}
            </a>
          </div>

          <section style={{ marginTop: 64 }}>
            <h2 style={{ fontSize: 24, letterSpacing: '-.03em', marginBottom: 22 }}>Stok yang boleh buat loan</h2>
            <div className="seo-blog-grid" style={{ marginTop: 0 }}>
              {featured.map((item) => {
                const seo = stockSeo(item, 'ms');
                return (
                  <a className="seo-blog-card" href={`/stok/${item.slug}`} key={item.slug} style={{ padding: 0, overflow: 'hidden' }}>
                    <img
                      src={stockImage(item.slug)}
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      alt={seo.caption}
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                    <span style={{ padding: '18px 22px 22px', display: 'block' }}>
                      <span style={{ display: 'block', fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>
                        {item.model} {item.year}
                      </span>
                      <span style={{ color: '#8b8e94', display: 'block', fontSize: 11.5, marginTop: 5 }}>
                        No plate {item.plate} · Simpang Ampat
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          <p style={{ marginTop: 48 }}>
            <a className="seo-blog-more" href="/blog" style={{ display: 'inline-flex' }}>
              Panduan loan motor<ArrowRight aria-hidden="true" />
            </a>
          </p>
        </article>
      </main>

      <PublicSeoFooter language="ms" disclaimer={CALC_DISCLAIMER} />
    </div>
  );
}
