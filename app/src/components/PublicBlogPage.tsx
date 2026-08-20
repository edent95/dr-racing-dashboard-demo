/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { BLOG_POSTS, findPostBySlug } from '../../shared/blogContent.mjs';
import { STOCK, stockImage, stockSeo } from '../../shared/seoContent.mjs';
import drRacingLogo from '../assets/dr-racing-logo-256.png';
import { WhatsAppGlyph, applyDocumentSeo, useRotatingAgents } from './publicSeoShared';

const BLOG_INDEX_TITLE = 'Blog Loan Motor — Panduan & Tips | DR Racing Simpang Ampat';
const BLOG_INDEX_DESCRIPTION =
  'Panduan loan motor di Malaysia: cara senang lulus, loan tanpa slip gaji, dan apa boleh dibuat jika ada rekod CTOS atau CCRIS. Ditulis oleh pasukan DR Racing, Simpang Ampat.';

const applicationHref = '/customer-intake?utm_source=website&utm_medium=organic&utm_campaign=seo_blog';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' });

function BlogChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="seo-page">
      <header className="seo-header">
        <a className="seo-brand" href="/" aria-label="DR Racing">
          <img src={drRacingLogo} alt="DR Racing" width="256" height="201" />
        </a>
        <div className="seo-header-actions">
          <a className="seo-button seo-button-small" href={applicationHref}>Semak kelayakan</a>
        </div>
      </header>
      {children}
      <footer className="seo-footer">
        <div className="seo-shell seo-footer-main">
          <div>
            <img src={drRacingLogo} alt="DR Racing" width="256" height="201" />
            <p>Loan motor Simpang Ampat, Pulau Pinang.</p>
          </div>
          <div className="seo-footer-links">
            <a href="/">Utama</a>
            <a href="/blog">Blog</a>
            <a href="https://bo.dr-racing.com/">Staff</a>
          </div>
        </div>
        <div className="seo-shell seo-footer-bottom">
          <p>© {new Date().getFullYear()} DR Racing. All rights reserved.</p>
          <p>
            Maklumat dalam blog ini adalah panduan umum, bukan nasihat kewangan peribadi dan bukan jaminan
            kelulusan. Kelulusan, kadar dan terma tertakluk pada penilaian pembiaya.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function PublicBlogIndexPage() {
  useEffect(() => {
    applyDocumentSeo(BLOG_INDEX_TITLE, BLOG_INDEX_DESCRIPTION, 'ms');
  }, []);

  return (
    <BlogChrome>
      <main className="seo-shell seo-blog">
        <div className="seo-section-heading" style={{ margin: '0 auto 10px', textAlign: 'left', maxWidth: 'none' }}>
          <p className="seo-eyebrow">Panduan · Loan motor Malaysia</p>
          <h1 style={{ fontSize: 'clamp(34px, 4.4vw, 52px)', letterSpacing: '-.045em', lineHeight: 1.06, margin: 0 }}>
            Blog loan motor — panduan &amp; tips
          </h1>
          <p style={{ color: 'var(--seo-muted)', fontSize: 16, lineHeight: 1.75, margin: '18px 0 0', maxWidth: 640 }}>
            Panduan jujur tentang permohonan loan motor di Malaysia — apa yang dinilai, dokumen yang perlu,
            dan pilihan yang ada kalau anda pernah ditolak.
          </p>
        </div>

        <div className="seo-blog-grid">
          {BLOG_POSTS.map((post) => (
            <a className="seo-blog-card" href={`/blog/${post.slug}`} key={post.slug}>
              <span className="seo-blog-meta">{formatDate(post.date)} · {post.readMinutes} min</span>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <span className="seo-blog-more">Baca panduan<ArrowRight aria-hidden="true" /></span>
            </a>
          ))}
        </div>
      </main>
    </BlogChrome>
  );
}

export function PublicBlogPostPage({ slug }: { slug: string }) {
  const post = findPostBySlug(slug);
  const agentFor = useRotatingAgents();

  useEffect(() => {
    if (!post) {
      applyDocumentSeo('Artikel tidak dijumpai | DR Racing', BLOG_INDEX_DESCRIPTION, 'ms');
      return;
    }
    applyDocumentSeo(`${post.title} | DR Racing`, post.description, 'ms');
  }, [post]);

  if (!post) {
    return (
      <BlogChrome>
        <main className="seo-shell seo-blog">
          <h1 style={{ fontSize: 44, letterSpacing: '-.04em' }}>404</h1>
          <p style={{ color: 'var(--seo-muted)', fontSize: 16, margin: '12px 0 26px' }}>
            Artikel ini tiada. Lihat semua panduan kami.
          </p>
          <a className="seo-button" href="/blog">Ke blog<ArrowRight aria-hidden="true" /></a>
        </main>
      </BlogChrome>
    );
  }

  const agent = agentFor(0);
  const related = BLOG_POSTS.filter((entry) => entry.slug !== post.slug);
  const featured = STOCK.slice(0, 3);

  return (
    <BlogChrome>
      <main className="seo-shell seo-blog">
        <article className="seo-article">
          <nav className="seo-crumbs" aria-label="Breadcrumb">
            <a href="/">Utama</a><span>/</span>
            <a href="/blog">Blog</a><span>/</span>
            <span style={{ color: '#3c3f44' }}>{post.title}</span>
          </nav>

          <p className="seo-blog-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock aria-hidden="true" style={{ height: 13, width: 13 }} />
            {formatDate(post.date)} · {post.readMinutes} minit bacaan
          </p>

          <h1>{post.title}</h1>
          <p className="seo-article-lede">{post.intro}</p>

          <div className="seo-article-body">
            {post.sections.map((section: { h: string; p: string[] }) => (
              <section key={section.h}>
                <h2>{section.h}</h2>
                {section.p.map((paragraph: string) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>

          <div className="seo-article-cta">
            <h2>Nak tahu anda layak atau tidak?</h2>
            <p>
              Beritahu kami keadaan sebenar anda — termasuk kalau rekod anda kurang baik. Kami semak dan beri
              jawapan jujur tentang pilihan yang ada. Showroom kami di Simpang Ampat, Pulau Pinang.
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

          <section style={{ marginTop: 56 }}>
            <h2 style={{ fontSize: 24, letterSpacing: '-.03em', marginBottom: 22 }}>Panduan lain</h2>
            <div className="seo-blog-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginTop: 0 }}>
              {related.map((entry) => (
                <a className="seo-blog-card" href={`/blog/${entry.slug}`} key={entry.slug}>
                  <span className="seo-blog-meta">{entry.readMinutes} min</span>
                  <h3>{entry.title}</h3>
                  <span className="seo-blog-more">Baca<ArrowRight aria-hidden="true" /></span>
                </a>
              ))}
            </div>
          </section>

          <p style={{ marginTop: 48 }}>
            <a className="seo-blog-more" href="/blog" style={{ display: 'inline-flex' }}>
              <ArrowLeft aria-hidden="true" />Semua panduan
            </a>
          </p>
        </article>
      </main>
    </BlogChrome>
  );
}
