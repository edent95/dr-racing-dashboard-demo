/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single source of truth for the public SEO surface.
 *
 * Imported by BOTH the React client (src/components/Public*.tsx) and the Express
 * server (server.mjs). The server uses it to inject per-URL <title>/<meta>/JSON-LD
 * into the HTML shell before it reaches the crawler — a SPA otherwise serves the
 * same head to every URL, so /stok/... pages would be indistinguishable to Google.
 *
 * Plain .mjs (not .ts) so Node can import it directly without a build step.
 */

export const SITE_ORIGIN = 'https://dr-racing.com';
export const BUSINESS_NAME = 'DR Racing';
export const BUSINESS_AREA = 'Simpang Ampat, Pulau Pinang';
export const BUSINESS_MAP_URL = 'https://maps.app.goo.gl/bMkT1k2ywqmzu4d27t';

/** WhatsApp deep links, rotated per visit so leads spread evenly across the team. */
export const AGENTS = [
  { name: 'DEMO SALES 01', url: '#demo-contact' },
  { name: 'DEMO SALES 02', url: '#demo-contact' },
  { name: 'DEMO SALES 03', url: '#demo-contact' },
  { name: 'DEMO SALES 04', url: '#demo-contact' },
  { name: 'DEMO SALES 05', url: '#demo-contact' },
  { name: 'DEMO SALES 06', url: '#demo-contact' },
  { name: 'DEMO SALES 07', url: '#demo-contact' },
  { name: 'DEMO SALES 08', url: '#demo-contact' }
];

/**
 * Showroom stock. `slug` drives the public URL /stok/<slug> and the image
 * filenames in public/stock/. Keep slugs stable once indexed by Google.
 */
export const STOCK = [
  {
    slug: 'y15zr-pqe9734',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR',
    plate: 'PQE9734',
    year: 2022,
    colour: { ms: 'Ungu', zh: '紫色', en: 'Purple' },
    deposit: '',
    available: true
  },
  {
    slug: 'y15zr-v1-vee4989',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR V1',
    plate: 'VEE4989',
    year: 2019,
    colour: { ms: 'Hitam', zh: '黑色', en: 'Black' },
    deposit: 'RM2,500 OTR',
    available: true
  },
  {
    slug: 'y15zr-mdn7025',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR',
    plate: 'MDN7025',
    year: 2022,
    colour: { ms: 'Hitam Emas', zh: '黑金色', en: 'Black Gold' },
    deposit: '',
    available: true
  },
  {
    slug: 'y15zr-kfq6960',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR',
    plate: 'KFQ6960',
    year: 2023,
    colour: { ms: 'Hijau', zh: '墨绿色', en: 'Green' },
    deposit: '',
    available: true
  },
  {
    slug: 'y15zr-ppg1542',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR',
    plate: 'PPG1542',
    year: 2020,
    colour: { ms: 'Biru Movistar', zh: '蓝色 Movistar', en: 'Movistar Blue' },
    deposit: '',
    available: true
  },
  {
    slug: 'honda-dash-125-pqh2961',
    brand: 'Honda',
    model: 'Honda Dash 125',
    plate: 'PQH2961',
    year: 2022,
    colour: { ms: 'Kuning', zh: '黄色', en: 'Yellow' },
    deposit: '',
    available: true
  }
];

export const findStockBySlug = (slug) => STOCK.find((item) => item.slug === slug) || null;

/** Image helpers — public/stock/<slug>.webp with a .jpg fallback for old browsers. */
export const stockImage = (slug) => `/stock/${slug}.webp`;
export const stockImageSmall = (slug) => `/stock/${slug}-400.webp`;
export const stockImageJpg = (slug) => `/stock/${slug}.jpg`;

/** Per-bike SEO copy. Long-tail: "loan <model> <year> <location>". */
export const stockSeo = (item, lang = 'ms') => {
  const base = `${item.model} ${item.year}`;
  if (lang === 'zh') {
    return {
      title: `二手 ${base} (${item.plate}) 分期贷款 | Simpang Ampat 槟城 | DR Racing`,
      description: `二手 ${base}，车牌 ${item.plate}，${item.colour.zh}。Simpang Ampat 槟城摩托分期 — 店家 loan、容易批、没 payslip 也可以谈。WhatsApp 直接询问头期与月供。`,
      caption: `二手 ${base} · Simpang Ampat 槟城 摩托分期`
    };
  }
  if (lang === 'en') {
    return {
      title: `${base} Second Hand (${item.plate}) — Motorcycle Loan Simpang Ampat | DR Racing`,
      description: `Second hand ${base}, plate ${item.plate}, ${item.colour.en}. Motorcycle loan in Simpang Ampat, Penang — in-house financing, easy approval, no payslip? Still ask us. WhatsApp for deposit and monthly instalment.`,
      caption: `Loan ${base} second hand · Simpang Ampat, Penang`
    };
  }
  return {
    title: `Loan Motor ${base} (${item.plate}) Terpakai — Simpang Ampat | DR Racing`,
    description: `${base} terpakai, no plate ${item.plate}, warna ${item.colour.ms}. Loan motor Simpang Ampat, Pulau Pinang — loan kedai, senang lulus, tanpa slip gaji boleh cuba. WhatsApp untuk deposit & ansuran bulanan.`,
    caption: `Loan ${base} terpakai · Simpang Ampat, Pulau Pinang`
  };
};

/** FAQ shown on the landing page and emitted as FAQPage structured data. */
export const FAQ = {
  ms: [
    ['Berapa deposit untuk loan motor di DR Racing Simpang Ampat?', 'Deposit bergantung pada model, tahun dan profil anda — ada unit deposit rendah. Beritahu kami motor yang anda pilih, kami beri anggaran deposit dan ansuran bulanan.'],
    ['Boleh buat loan motor tanpa slip gaji?', 'Boleh cuba. Kami bekerja dengan pelbagai jenis pekerjaan termasuk kerja sendiri dan bergaji tunai. Hubungi kami untuk semak dokumen alternatif yang boleh digunakan.'],
    ['Blacklist atau CTOS / CCRIS boleh buat loan motor?', 'Setiap kes berbeza. Kami khusus membantu pelanggan yang susah lulus di bank — mohon dahulu, kami semak dan bantu tingkatkan peluang lulus anda.'],
    ['Apa beza loan kedai dengan loan bank?', 'Loan kedai lebih fleksibel dan cepat, sesuai untuk yang sukar lulus di bank. Kami terangkan terma dengan jelas sebelum anda bersetuju.'],
    ['Dokumen apa yang perlu untuk mohon loan motor?', 'Untuk pertanyaan pertama, cukup nama, nombor telefon, IC dan model motor. Pasukan kami akan maklumkan dokumen sokongan seterusnya.'],
    ['Motor second hand — urusan tukar nama diuruskan?', 'Ya, semua urusan tukar nama dan JPJ kami uruskan untuk anda. Tanya kami tentang unit yang anda minati.']
  ],
  zh: [
    ['DR Racing 的摩托分期需要多少头期？', '头期看车型、年份和你的情况而定，有些车头期很低。告诉我们你看中的车，我们给你头期和月供的估算。'],
    ['没有 payslip（薪水单）可以做 loan 吗？', '可以试。各种职业包括自雇、现金出粮都能谈。联系我们看看可以用哪些替代文件。'],
    ['黑名单 / CTOS / CCRIS 可以做分期吗？', '每个个案不同。我们专门帮银行难批的客户 —— 先申请，我们帮你评估、提高批准机会。'],
    ['loan kedai（店家分期）和银行 loan 有什么不同？', '店家分期更灵活、更快，适合银行难批的人。签约前我们会把条款讲清楚。'],
    ['申请需要什么文件？', '第一次咨询只需姓名、电话、IC 和车型。团队会再告诉你接下来要准备的文件。'],
    ['二手摩托可以过户 / 换名吗？', '可以，过户和 JPJ 手续我们全部帮你处理。看中哪台就问我们。']
  ],
  en: [
    ['How much deposit for a motorcycle loan at DR Racing Simpang Ampat?', "Deposit depends on the model, year and your profile — some units have a low deposit. Tell us which bike you like and we'll estimate the deposit and monthly instalment."],
    ['Can I get a motor loan without a payslip?', 'You can try. We work with many types of employment, including self-employed and cash-paid workers. Contact us to check what alternative documents can be used.'],
    ['Blacklist or CTOS / CCRIS — can I still apply?', "Every case is different. We specialise in helping customers who struggle to get approved at banks — apply first and we'll assess and help improve your chances."],
    ['What is the difference between kedai loan and bank loan?', 'Kedai (in-house) financing is more flexible and faster, suited to those who are hard to approve at a bank. We explain the terms clearly before you agree.'],
    ['What documents do I need to apply?', 'For the first enquiry, just your name, phone number, IC and the bike model. Our team will advise the supporting documents next.'],
    ['Second-hand bikes — is ownership transfer handled?', "Yes, we handle all name-transfer and JPJ paperwork for you. Ask us about the unit you're interested in."]
  ]
};

/** Selling-point chips under the hero. */
export const USP = {
  ms: ['Loan kedai', 'Senang lulus', 'Tanpa slip gaji boleh cuba', 'Blacklist / CTOS boleh cuba', 'Deposit rendah', 'Second hand berkualiti'],
  zh: ['店家分期 Loan kedai', '容易批 senang lulus', '没薪水单也能谈', '黑名单 / CTOS 可试', '低头期', '优质二手车'],
  en: ['In-house loan', 'Easy approval', 'No payslip? Ask us', 'Blacklist / CTOS welcome', 'Low deposit', 'Quality second-hand']
};
