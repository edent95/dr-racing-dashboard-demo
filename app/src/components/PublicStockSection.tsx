/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowRight, BadgeCheck, Check, ChevronDown } from 'lucide-react';
import { FAQ, STOCK, USP, stockImage, stockImageSmall, stockSeo } from '../../shared/seoContent.mjs';
import { WhatsAppGlyph, useRotatingAgents } from './publicSeoShared';
import type { SeoLanguage } from './publicSeoShared';

const copy = {
  ms: {
    eyebrow: 'Stok terkini · Simpang Ampat',
    title: 'Stok sedia untuk loan',
    body: 'Semua ini stok sebenar di showroom kami di Simpang Ampat. Setiap unit boleh buat loan — pilih yang anda suka, pasukan kami bantu permohonan dari awal hingga selesai.',
    terpakai: 'Terpakai',
    boleh: 'Boleh Loan',
    tahun: 'Tahun',
    deposit: 'Deposit',
    detail: 'Lihat butiran',
    wa: 'Tanya di WhatsApp',
    faqEyebrow: 'Soalan lazim · Loan motor',
    faqTitle: 'Loan kedai · senang lulus · tanpa slip gaji pun boleh cuba'
  },
  zh: {
    eyebrow: '近期现车 · Simpang Ampat',
    title: '现车 · 即可申请分期',
    body: '这些全是我们 Simpang Ampat 展示厅的现车，每一台都可以做 loan（分期）。看中哪一台，团队从头到尾协助你办手续。',
    terpakai: '二手',
    boleh: '可做 Loan',
    tahun: '年份',
    deposit: '头期',
    detail: '查看详情',
    wa: 'WhatsApp 询问',
    faqEyebrow: '常见问题 · 摩托分期',
    faqTitle: '店家分期 · 容易批 · 没 payslip 也能谈'
  },
  en: {
    eyebrow: 'Latest stock · Simpang Ampat',
    title: 'Bikes ready for financing',
    body: 'Every bike here is real stock at our Simpang Ampat showroom. All units are loan-ready — pick the one you like and our team guides you through the whole application.',
    terpakai: 'Second hand',
    boleh: 'Loan OK',
    tahun: 'Year',
    deposit: 'Deposit',
    detail: 'View details',
    wa: 'Enquire on WhatsApp',
    faqEyebrow: 'FAQ · Motorcycle loan',
    faqTitle: 'In-house loan · easy approval · no payslip? still ask us'
  }
} as const;

type Props = { language: SeoLanguage };

export default function PublicStockSection({ language }: Props) {
  const t = copy[language];
  const agentFor = useRotatingAgents();
  const [openFaq, setOpenFaq] = useState(-1);
  const faqs = FAQ[language] as [string, string][];

  return (
    <>
      <section className="seo-stock-section" id="stok">
        <div className="seo-shell">
          <div className="seo-section-heading">
            <p className="seo-eyebrow">{t.eyebrow}</p>
            <h2>{t.title}</h2>
            <p style={{ color: 'var(--seo-muted)', fontSize: 15, lineHeight: 1.75, margin: '18px 0 0' }}>{t.body}</p>
          </div>

          <div className="seo-stock-grid">
            {STOCK.map((item, index) => {
              const seo = stockSeo(item, language);
              const agent = agentFor(index);
              return (
                <article className="seo-stock-card" key={item.slug}>
                  <a className="seo-stock-photo" href={`/stok/${item.slug}`} aria-label={seo.title}>
                    <img
                      src={stockImage(item.slug)}
                      srcSet={`${stockImageSmall(item.slug)} 400w, ${stockImage(item.slug)} 800w`}
                      sizes="(max-width: 900px) 100vw, 380px"
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      alt={`${seo.caption} — no plate ${item.plate}`}
                    />
                    <span className="seo-stock-badge">{t.terpakai}</span>
                    <span className="seo-stock-loan"><BadgeCheck aria-hidden="true" />{t.boleh}</span>
                  </a>
                  <div className="seo-stock-body">
                    <h3>{item.model}</h3>
                    <p className="seo-stock-caption">{seo.caption}</p>
                    <ul className="seo-stock-meta">
                      <li><b>{t.tahun}</b>{item.year}</li>
                      <li><b>No Plate</b>{item.plate}</li>
                    </ul>
                    {item.deposit ? <p className="seo-stock-deposit">{t.deposit}: {item.deposit}</p> : null}
                    <div className="seo-stock-actions">
                      <a className="seo-stock-detail-link" href={`/stok/${item.slug}`}>
                        {t.detail}<ArrowRight aria-hidden="true" style={{ height: 14, width: 14 }} />
                      </a>
                      <a className="seo-wa" href={agent.url} target="_blank" rel="noopener noreferrer">
                        <WhatsAppGlyph />{t.wa} · {agent.name}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="seo-section" id="faq-loan">
        <div className="seo-shell">
          <div className="seo-section-heading">
            <p className="seo-eyebrow">{t.faqEyebrow}</p>
            <h2>{t.faqTitle}</h2>
          </div>
          <ul className="seo-usp" style={{ justifyContent: 'center', marginBottom: 44 }}>
            {(USP[language] as string[]).map((point) => (
              <li key={point}><Check aria-hidden="true" />{point}</li>
            ))}
          </ul>
          <div className="seo-faq-wrap">
            {faqs.map(([question, answer], index) => (
              <article className={`seo-faq-item${openFaq === index ? ' is-open' : ''}`} key={question}>
                <button
                  className="seo-faq-q"
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  aria-expanded={openFaq === index}
                >
                  {question}
                  <span><ChevronDown aria-hidden="true" /></span>
                </button>
                {openFaq === index ? <p className="seo-faq-a">{answer}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
