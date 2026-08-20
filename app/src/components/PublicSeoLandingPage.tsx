import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Check,
  ChevronDown,
  FileCheck2,
  Languages,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import drRacingLogo from '../assets/dr-racing-logo-256.png';
import { USP } from '../../shared/seoContent.mjs';
import PublicStockSection from './PublicStockSection';

type LandingLanguage = 'en' | 'zh' | 'ms';

const content = {
  en: {
    nav: ['Stock', 'How it works', 'Why DR Racing', 'Blog'],
    apply: 'Check eligibility',
    eyebrow: 'Motorcycle financing made simpler',
    titleLead: 'Your next ride,',
    titleAccent: 'within reach.',
    hero: 'Tell us the motorcycle you want. Our team will guide you through the financing application, documents and next steps — clearly and personally.',
    heroPrimary: 'Start my application',
    heroSecondary: 'See how it works',
    trust: ['Simple online enquiry', 'Personal guidance', 'Secure application process'],
    cardTag: 'START HERE',
    cardTitle: 'Find your monthly plan',
    cardBody: 'Share a few details and our team will help you explore a suitable financing route.',
    cardSteps: ['Choose your motorcycle', 'Submit your details', 'Get guided by our team'],
    cardCta: 'Check my options',
    financeEyebrow: 'BUILT AROUND YOUR JOURNEY',
    financeTitle: 'Less paperwork. More time to ride.',
    financeBody: 'From first enquiry to document follow-up, DR Racing keeps the process focused and easy to understand.',
    benefits: [
      ['One clear application', 'Send your details through one secure, mobile-friendly form.'],
      ['Guidance that feels human', 'A real team member helps you understand what is needed next.'],
      ['Plans for new or used bikes', 'Explore financing for the motorcycle that fits your needs and budget.']
    ],
    stepsEyebrow: 'HOW IT WORKS',
    stepsTitle: 'Three steps to get moving',
    steps: [
      ['01', 'Tell us what you need', 'Complete a short enquiry with your contact and motorcycle details.'],
      ['02', 'Prepare your documents', 'Our team confirms the supporting documents required for your application.'],
      ['03', 'Track the next step', 'We follow up with you as your application moves forward.']
    ],
    whyEyebrow: 'WHY DR RACING',
    whyTitle: 'A financing experience built on clarity',
    whyBody: 'Buying a motorcycle is exciting. The financing should not feel confusing. We keep communication direct, explain each step and help you stay prepared.',
    whyPoints: ['Mobile-first application', 'Clear document checklist', 'Dedicated follow-up', 'Malaysia-focused support'],
    faqEyebrow: 'COMMON QUESTIONS',
    faqTitle: 'Before you apply',
    faqs: [
      ['What details do I need to start?', 'Your name, Malaysian phone number, IC number and the motorcycle model you are interested in are enough for the first enquiry.'],
      ['Can I apply for a used motorcycle?', 'Yes. You can tell us the motorcycle model first, and our team will confirm the available route for your situation.'],
      ['Does submitting the form guarantee approval?', 'No. Approval and final terms depend on the relevant financier’s assessment, required documents and eligibility criteria.'],
      ['What happens after I submit?', 'Your enquiry is recorded securely and a DR Racing team member will follow up on the documents and next steps.']
    ],
    finalTitle: 'Ready to move closer to your next motorcycle?',
    finalBody: 'Start with a short online enquiry. We will help you understand the rest.',
    finalCta: 'Start my application',
    footer: 'Motorcycle financing support in Malaysia.',
    disclaimer: 'Financing approval, rates and terms are subject to the financier’s assessment and eligibility requirements.',
    privacy: 'Privacy',
    staff: 'Staff login'
  },
  zh: {
    nav: ['现车', '申请流程', '选择我们', '博客'],
    apply: '查看申请资格',
    eyebrow: '让摩托贷款更简单',
    titleLead: '下一台爱车，',
    titleAccent: '离你更近。',
    hero: '告诉我们你想要的摩托。团队会清楚地协助你完成贷款申请、准备文件及了解下一步。',
    heroPrimary: '开始申请',
    heroSecondary: '了解流程',
    trust: ['简单线上咨询', '专人协助跟进', '安全申请流程'],
    cardTag: '从这里开始',
    cardTitle: '寻找适合你的月供方案',
    cardBody: '提供简单资料，团队会协助你了解合适的贷款方向。',
    cardSteps: ['选择心仪摩托', '提交基本资料', '由团队协助跟进'],
    cardCta: '查看我的选择',
    financeEyebrow: '为你的骑行旅程而设',
    financeTitle: '少一点手续，多一点骑行时间。',
    financeBody: '从首次咨询到文件跟进，DR Racing 让整个流程更集中、更容易明白。',
    benefits: [
      ['一份清楚的申请', '通过安全、适合手机使用的表格提交资料。'],
      ['真正有人协助', '由团队成员告诉你接下来需要准备什么。'],
      ['新车与二手车选择', '为符合你需求与预算的摩托了解贷款选择。']
    ],
    stepsEyebrow: '申请流程',
    stepsTitle: '三个步骤，开始前进',
    steps: [
      ['01', '告诉我们你的需求', '填写简单咨询表格，包括联络方式与摩托资料。'],
      ['02', '准备申请文件', '团队会确认你的申请所需文件。'],
      ['03', '跟进下一步', '申请推进时，我们会与你保持联络。']
    ],
    whyEyebrow: '为什么选择 DR RACING',
    whyTitle: '清楚、直接的贷款体验',
    whyBody: '买摩托让人期待，贷款过程不该让人混乱。我们会清楚沟通、说明每一步，并协助你准备所需资料。',
    whyPoints: ['手机优先申请', '清楚文件清单', '专人持续跟进', '马来西亚本地支援'],
    faqEyebrow: '常见问题',
    faqTitle: '申请之前',
    faqs: [
      ['开始申请需要什么资料？', '第一次咨询只需要姓名、马来西亚电话号码、身份证号码及心仪摩托型号。'],
      ['二手摩托可以申请吗？', '可以。先告诉我们摩托型号，团队会根据你的情况确认可行选择。'],
      ['提交表格就一定会获批吗？', '不会。最终批准与条款取决于相关贷款机构的审核、所需文件及申请资格。'],
      ['提交之后会怎样？', '咨询资料会被安全记录，DR Racing 团队成员会与你跟进文件和下一步。']
    ],
    finalTitle: '准备好更靠近你的下一台摩托了吗？',
    finalBody: '先完成简单线上咨询，接下来的步骤交给我们协助。',
    finalCta: '开始申请',
    footer: '马来西亚摩托贷款申请协助。',
    disclaimer: '贷款批准、利率及条款取决于贷款机构的审核与申请资格。',
    privacy: '隐私政策',
    staff: '员工登录'
  },
  ms: {
    nav: ['Stok', 'Cara permohonan', 'Mengapa DR Racing', 'Blog'],
    apply: 'Semak kelayakan',
    eyebrow: 'Pembiayaan motosikal yang lebih mudah',
    titleLead: 'Motosikal idaman anda,',
    titleAccent: 'semakin dekat.',
    hero: 'Beritahu kami motosikal yang anda inginkan. Pasukan kami akan membimbing anda melalui permohonan pembiayaan, dokumen dan langkah seterusnya dengan jelas dan mesra.',
    heroPrimary: 'Mulakan permohonan',
    heroSecondary: 'Lihat cara permohonan',
    trust: ['Pertanyaan dalam talian yang mudah', 'Bimbingan peribadi', 'Proses permohonan selamat'],
    cardTag: 'MULA DI SINI',
    cardTitle: 'Cari pelan bulanan anda',
    cardBody: 'Kongsi beberapa butiran dan pasukan kami akan membantu anda meneroka pilihan pembiayaan yang sesuai.',
    cardSteps: ['Pilih motosikal anda', 'Hantar butiran anda', 'Dapatkan bimbingan pasukan kami'],
    cardCta: 'Semak pilihan saya',
    financeEyebrow: 'DIBINA UNTUK PERJALANAN ANDA',
    financeTitle: 'Kurang urusan kertas. Lebih masa untuk menunggang.',
    financeBody: 'Daripada pertanyaan pertama hingga susulan dokumen, DR Racing memastikan proses kekal teratur dan mudah difahami.',
    benefits: [
      ['Satu permohonan yang jelas', 'Hantar butiran anda melalui satu borang selamat yang mesra telefon.'],
      ['Bimbingan daripada manusia sebenar', 'Ahli pasukan kami membantu anda memahami perkara yang diperlukan seterusnya.'],
      ['Pelan untuk motosikal baharu atau terpakai', 'Terokai pembiayaan untuk motosikal yang sesuai dengan keperluan dan bajet anda.']
    ],
    stepsEyebrow: 'CARA PERMOHONAN',
    stepsTitle: 'Tiga langkah untuk mula bergerak',
    steps: [
      ['01', 'Beritahu kami keperluan anda', 'Lengkapkan pertanyaan ringkas dengan maklumat hubungan dan motosikal anda.'],
      ['02', 'Sediakan dokumen anda', 'Pasukan kami akan mengesahkan dokumen sokongan yang diperlukan untuk permohonan anda.'],
      ['03', 'Ikuti langkah seterusnya', 'Kami akan menghubungi anda apabila permohonan anda bergerak ke peringkat seterusnya.']
    ],
    whyEyebrow: 'MENGAPA DR RACING',
    whyTitle: 'Pengalaman pembiayaan yang jelas',
    whyBody: 'Membeli motosikal ialah pengalaman yang menyeronokkan. Proses pembiayaan tidak sepatutnya mengelirukan. Kami berkomunikasi secara terus, menerangkan setiap langkah dan membantu anda membuat persediaan.',
    whyPoints: ['Permohonan mesra telefon', 'Senarai semak dokumen yang jelas', 'Susulan khusus', 'Sokongan berfokuskan Malaysia'],
    faqEyebrow: 'SOALAN LAZIM',
    faqTitle: 'Sebelum anda memohon',
    faqs: [
      ['Apakah butiran yang diperlukan untuk bermula?', 'Nama, nombor telefon Malaysia, nombor IC dan model motosikal yang anda minati sudah mencukupi untuk pertanyaan pertama.'],
      ['Bolehkah saya memohon untuk motosikal terpakai?', 'Ya. Beritahu kami model motosikal terlebih dahulu dan pasukan kami akan mengesahkan pilihan yang tersedia untuk keadaan anda.'],
      ['Adakah penghantaran borang menjamin kelulusan?', 'Tidak. Kelulusan dan terma akhir bergantung pada penilaian pembiaya, dokumen yang diperlukan dan syarat kelayakan.'],
      ['Apakah yang berlaku selepas saya menghantar borang?', 'Pertanyaan anda akan direkodkan dengan selamat dan ahli pasukan DR Racing akan membuat susulan mengenai dokumen dan langkah seterusnya.']
    ],
    finalTitle: 'Bersedia untuk mendekati motosikal idaman anda?',
    finalBody: 'Mulakan dengan pertanyaan dalam talian yang ringkas. Kami akan membantu anda memahami langkah selebihnya.',
    finalCta: 'Mulakan permohonan',
    footer: 'Sokongan pembiayaan motosikal di Malaysia.',
    disclaimer: 'Kelulusan pembiayaan, kadar dan terma tertakluk pada penilaian dan syarat kelayakan pembiaya.',
    privacy: 'Privasi',
    staff: 'Log masuk kakitangan'
  }
} as const;

const applicationHref = '/customer-intake?utm_source=website&utm_medium=organic&utm_campaign=seo_home';

export default function PublicSeoLandingPage() {
  const [language, setLanguage] = useState<LandingLanguage>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const copy = content[language];

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-MY' : language === 'ms' ? 'ms-MY' : 'en-MY';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = 'light';
    document.title = language === 'zh'
      ? 'DR Racing 摩托贷款申请 | 马来西亚摩托融资协助'
      : language === 'ms'
        ? 'Pembiayaan Motosikal DR Racing Malaysia | Mohon Dalam Talian'
        : 'DR Racing Motorcycle Financing Malaysia | Apply Online';
  }, [language]);

  return (
    <div className="seo-page">
      <header className="seo-header">
        <a className="seo-brand" href="#top" aria-label="DR Racing home">
          <img src={drRacingLogo} alt="DR Racing" width="256" height="201" />
        </a>
        <nav className={`seo-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#stok" onClick={() => setMenuOpen(false)}>{copy.nav[0]}</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>{copy.nav[1]}</a>
          <a href="#why-us" onClick={() => setMenuOpen(false)}>{copy.nav[2]}</a>
          <a href="/blog" onClick={() => setMenuOpen(false)}>{copy.nav[3]}</a>
        </nav>
        <div className="seo-header-actions">
          <button className="seo-language" type="button" onClick={() => setLanguage(language === 'en' ? 'zh' : language === 'zh' ? 'ms' : 'en')} aria-label={language === 'zh' ? '切换语言' : language === 'ms' ? 'Tukar bahasa' : 'Change language'}>
            <Languages aria-hidden="true" /> {language === 'en' ? '中文' : language === 'zh' ? 'BM' : 'EN'}
          </button>
          <a className="seo-button seo-button-small" href={applicationHref}>{copy.apply}</a>
          <button className="seo-menu" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="seo-hero">
          <div className="seo-hero-glow" />
          <div className="seo-shell seo-hero-grid">
            <div className="seo-hero-copy">
              <p className="seo-eyebrow"><Sparkles aria-hidden="true" /> {copy.eyebrow}</p>
              <h1>{copy.titleLead}<span>{copy.titleAccent}</span></h1>
              <p className="seo-hero-text">{copy.hero}</p>
              <div className="seo-hero-actions">
                <a className="seo-button" href={applicationHref}>{copy.heroPrimary}<ArrowRight aria-hidden="true" /></a>
                <a className="seo-text-link" href="#how-it-works">{copy.heroSecondary}<ChevronDown aria-hidden="true" /></a>
              </div>
              <ul className="seo-trust-row">
                {copy.trust.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}
              </ul>
              <ul className="seo-usp">
                {(USP[language] as string[]).map((point) => (
                  <li key={point}><Check aria-hidden="true" />{point}</li>
                ))}
              </ul>
            </div>

            <div className="seo-plan-card" aria-label={copy.cardTitle}>
              <div className="seo-plan-visual">
                <img
                  src="/seo/ansuran-motor-banner.webp"
                  alt="DR Racing ansuran motor paling selamat di Malaysia"
                  width="1641"
                  height="720"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="seo-plan-content">
                <span className="seo-card-tag">{copy.cardTag}</span>
                <h2>{copy.cardTitle}</h2>
                <p>{copy.cardBody}</p>
                <ol>
                  {copy.cardSteps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
                </ol>
                <a className="seo-button seo-button-full" href={applicationHref}>{copy.cardCta}<ArrowRight aria-hidden="true" /></a>
              </div>
            </div>
          </div>
        </section>

        <PublicStockSection language={language} />

        <section className="seo-section" id="financing">
          <div className="seo-shell">
            <div className="seo-section-heading">
              <p className="seo-eyebrow">{copy.financeEyebrow}</p>
              <h2>{copy.financeTitle}</h2>
              <p>{copy.financeBody}</p>
            </div>
            <div className="seo-benefit-grid">
              {[FileCheck2, MessageCircle, Calculator].map((Icon, index) => (
                <article className="seo-benefit" key={copy.benefits[index][0]}>
                  <span><Icon aria-hidden="true" /></span>
                  <h3>{copy.benefits[index][0]}</h3>
                  <p>{copy.benefits[index][1]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-section seo-section-dark" id="how-it-works">
          <div className="seo-shell">
            <div className="seo-section-heading seo-section-heading-light">
              <p className="seo-eyebrow">{copy.stepsEyebrow}</p>
              <h2>{copy.stepsTitle}</h2>
            </div>
            <div className="seo-steps">
              {copy.steps.map((step) => (
                <article key={step[0]}>
                  <span>{step[0]}</span>
                  <h3>{step[1]}</h3>
                  <p>{step[2]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-section" id="why-us">
          <div className="seo-shell seo-why-grid">
            <div className="seo-why-art" aria-hidden="true">
              <div className="seo-shield"><ShieldCheck /></div>
              <div className="seo-mile-card"><BadgeCheck /><span>DR RACING</span><strong>READY TO RIDE</strong></div>
            </div>
            <div className="seo-why-copy">
              <p className="seo-eyebrow">{copy.whyEyebrow}</p>
              <h2>{copy.whyTitle}</h2>
              <p>{copy.whyBody}</p>
              <ul>{copy.whyPoints.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
              <a className="seo-text-link seo-text-link-red" href={applicationHref}>{copy.heroPrimary}<ArrowRight aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="seo-section seo-faq-section" id="faq">
          <div className="seo-shell seo-faq-grid">
            <div className="seo-section-heading seo-faq-heading">
              <p className="seo-eyebrow">{copy.faqEyebrow}</p>
              <h2>{copy.faqTitle}</h2>
            </div>
            <div className="seo-faq-list">
              {copy.faqs.map((faq, index) => (
                <article className={openFaq === index ? 'is-open' : ''} key={faq[0]}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                    {faq[0]}<ChevronDown aria-hidden="true" />
                  </button>
                  {openFaq === index && <p>{faq[1]}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-final">
          <div className="seo-shell seo-final-inner">
            <div><h2>{copy.finalTitle}</h2><p>{copy.finalBody}</p></div>
            <a className="seo-button seo-button-white" href={applicationHref}>{copy.finalCta}<ArrowRight aria-hidden="true" /></a>
          </div>
        </section>
      </main>

      <footer className="seo-footer">
        <div className="seo-shell seo-footer-main">
          <div><img src={drRacingLogo} alt="DR Racing" width="256" height="201" /><p>{copy.footer}</p></div>
          <div className="seo-footer-links"><a href="https://bo.dr-racing.com/">{copy.staff}</a></div>
        </div>
        <div className="seo-shell seo-footer-bottom"><p>© {new Date().getFullYear()} DR Racing. All rights reserved.</p><p>{copy.disclaimer}</p></div>
      </footer>
    </div>
  );
}
