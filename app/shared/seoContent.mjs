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
export const BUSINESS_MAP_URL = 'https://maps.app.goo.gl/bMkT1k2ywqmzu4d27';

/**
 * Stable, un-hashed logo URL for structured data. Vite fingerprints anything
 * under src/assets, so the schema `logo` needs its own copy under public/.
 */
export const BUSINESS_LOGO_PATH = '/seo/dr-racing-logo-512.png';

/**
 * Official profiles for LocalBusiness `sameAs`, so search engines and AI
 * answer engines tie the site, the Facebook page and the Instagram account to
 * one business. Both are the accounts labelled Simpang Ampat in public search
 * (added 2026-09-22); remove any the owner does not recognise.
 */
export const BUSINESS_SAME_AS = [
  'https://www.facebook.com/dr.racingmy/',
  'https://www.instagram.com/dr.racing_official_/'
];

/**
 * NAP (Name / Address / Phone) for LocalBusiness schema and the crawlable
 * footer. Google Business Profile and local rankings depend on this matching
 * what is on Google Maps exactly.
 *
 * These values match the public Google Maps listing. Keep the spelling,
 * postcode, phone number and opening hours aligned with that listing.
 */
export const BUSINESS_STREET_ADDRESS = 'NO 70,72, 74, Jalan Tasek SS1, Bandar Tasek Mutiara';
export const BUSINESS_LOCALITY = 'Simpang Ampat';
export const BUSINESS_REGION = 'Pulau Pinang';
export const BUSINESS_POSTCODE = '14120';
export const BUSINESS_PHONE = '+60 11-1315 2982';
export const BUSINESS_HOURS = 'Mo-Su 10:00-19:00';

/**
 * Towns we actually serve. One list, used by the LocalBusiness `areaServed`
 * schema and by the visible footer — a service area that only exists in JSON-LD
 * and never on the page is the kind of mismatch Google discounts.
 */
export const SERVICE_AREAS = [
  'Simpang Ampat',
  'Bukit Tambun',
  'Batu Kawan',
  'Bukit Mertajam',
  'Juru',
  'Nibong Tebal',
  'Seberang Perai',
  'Pulau Pinang'
];

/**
 * LocalBusiness / MotorcycleDealer JSON-LD, shared by the homepage shell.
 * No '@context' here — the caller supplies it (standalone or inside @graph).
 */
export const localBusinessJsonLd = () => ({
  '@type': ['MotorcycleDealer', 'FinancialService'],
  '@id': `${SITE_ORIGIN}/#business`,
  name: `${BUSINESS_NAME} Simpang Ampat`,
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}${BUSINESS_LOGO_PATH}`,
  image: `${SITE_ORIGIN}/seo/ansuran-motor-banner.webp`,
  description:
    'Kedai motor dan loan motor di Simpang Ampat, Pulau Pinang. Motor terpakai berkualiti, loan kedai senang lulus, tanpa slip gaji boleh cuba.',
  address: {
    '@type': 'PostalAddress',
    ...(BUSINESS_STREET_ADDRESS ? { streetAddress: BUSINESS_STREET_ADDRESS } : {}),
    addressLocality: BUSINESS_LOCALITY,
    addressRegion: BUSINESS_REGION,
    postalCode: BUSINESS_POSTCODE,
    addressCountry: 'MY'
  },
  ...(BUSINESS_PHONE ? { telephone: BUSINESS_PHONE } : {}),
  ...(BUSINESS_HOURS ? { openingHours: BUSINESS_HOURS } : {}),
  hasMap: BUSINESS_MAP_URL,
  sameAs: [...BUSINESS_SAME_AS, BUSINESS_MAP_URL],
  areaServed: SERVICE_AREAS.map((name) => ({ '@type': 'Place', name })),
  priceRange: 'RM'
});

/** The one WhatsApp link every public SEO page uses, for both the apply and WhatsApp buttons. */
/**
 * Home page (/) title and description, Malay — the SEO shell and the hydrated
 * page both read these, and index.html repeats them for the static fallback
 * (tests/unit/seo-public-surface.test.ts keeps all three in sync).
 *
 * Brand first: Search Console shows "dr racing shop" landing here at
 * position ~5 with a 1.6% CTR, and the old title only named DR Racing after
 * 51 characters of keywords (63 in total, so it was also truncated). Keep it
 * at 60 characters or fewer.
 */
export const HOME_TITLE_MS = 'DR Racing — Kedai Motor & Loan Motor Simpang Ampat';
export const HOME_DESCRIPTION_MS =
  'DR Racing — kedai motor & loan kedai di Simpang Ampat, Pulau Pinang. Senang lulus, tanpa slip gaji boleh cuba, CTOS/CCRIS boleh bincang. WhatsApp kami.';

export const WHATSAPP_URL = '#demo-contact';

/** WhatsApp buttons on the SEO pages. A single shop line now (owner decision, 2026-09-25). */
export const AGENTS = [{ name: 'DR Racing', url: WHATSAPP_URL }];

/**
 * Showroom stock. `slug` drives the public URL /stok/<slug> and the image
 * filenames in public/stock/. Keep slugs stable once indexed by Google.
 *
 * There is deliberately no `price` field. Asking prices are never published —
 * page copy, JSON-LD or llms.txt — and customers get them by PM to CS (owner
 * decision, 2026-09-22). Google therefore reports the Offer as missing a price
 * and the pages do not get product rich results; that trade-off is accepted.
 *
 * `blurb.ms` is the unique crawlable copy for each unit. Without it, all six
 * /stok/ pages look byte-identical to Google and none get indexed. Add real
 * details (mileage, service history, what was replaced) whenever you have them.
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
    available: true,
    blurb: {
      ms: 'Y15ZR 2022 warna ungu — warna yang jarang ada dalam pasaran terpakai, jadi unit ini cepat menarik perhatian. Enjin 150cc SOHC penyejukan cecair yang sama diguna pakai sejak generasi ini diperkenalkan, dan alat ganti mudah didapati di mana-mana. Unit tahun 2022 masih tergolong muda untuk model ini. Geran bersih, urusan tukar nama kami uruskan sepenuhnya.'
    }
  },
  {
    slug: 'y15zr-v1-vee4989',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR V1',
    plate: 'VEE4989',
    year: 2019,
    colour: { ms: 'Hitam', zh: '黑色', en: 'Black' },
    deposit: 'RM2,500 OTR',
    available: true,
    blurb: {
      ms: 'Y15ZR V1 2019 hitam — pilihan paling berbaloi untuk yang mahu masuk Y15 dengan bajet lebih rendah. V1 terkenal dengan enjin yang tahan lasak dan kos penyelenggaraan yang rendah. Deposit RM2,500 OTR untuk unit ini, dan ansuran bulanan antara yang paling rendah dalam stok kami. Sesuai untuk rider pertama atau kegunaan harian ke tempat kerja.'
    }
  },
  {
    slug: 'y15zr-mdn7025',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR',
    plate: 'MDN7025',
    year: 2022,
    colour: { ms: 'Hitam Emas', zh: '黑金色', en: 'Black Gold' },
    deposit: '',
    available: true,
    blurb: {
      ms: 'Y15ZR 2022 hitam emas — kombinasi warna edisi yang paling dicari dalam pasaran terpakai dan nilai jualan semulanya kekal kukuh. Plat Melaka (MDN), kini di showroom kami di Simpang Ampat. Semakan geran dan sejarah unit dibuat sebelum kami ambil masuk. Tukar nama dan urusan JPJ semua kami settlekan.'
    }
  },
  {
    slug: 'y15zr-kfq6960',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR',
    plate: 'KFQ6960',
    year: 2023,
    colour: { ms: 'Hijau', zh: '墨绿色', en: 'Green' },
    deposit: '',
    available: true,
    blurb: {
      ms: 'Y15ZR 2023 hijau — unit paling muda dalam stok semasa kami. Tahun tinggi bermakna baki hayat servis yang panjang dan kondisi yang hampir seperti baharu, tetapi pada harga terpakai. Untuk pemohon yang mahu tempoh loan lebih panjang dengan ansuran selesa, unit tahun tinggi macam ini adalah pilihan yang paling mudah diluluskan.'
    }
  },
  {
    slug: 'y15zr-ppg1542',
    brand: 'Yamaha',
    model: 'Yamaha Y15ZR',
    plate: 'PPG1542',
    year: 2020,
    colour: { ms: 'Biru Movistar', zh: '蓝色 Movistar', en: 'Movistar Blue' },
    deposit: '',
    available: true,
    blurb: {
      ms: 'Y15ZR 2020 biru Movistar — livery ikonik yang dikaitkan dengan jentera MotoGP Yamaha, dan antara warna kegemaran peminat Y15. Plat Pulau Pinang (PPG), memang unit tempatan. Harga lebih rendah daripada unit 2022–2023, jadi deposit dan ansuran lebih ringan. Sesuai untuk yang mahu Y15 dengan komitmen bulanan minimum.'
    }
  },
  {
    slug: 'honda-dash-125-pqh2961',
    brand: 'Honda',
    model: 'Honda Dash 125',
    plate: 'PQH2961',
    year: 2022,
    colour: { ms: 'Kuning', zh: '黄色', en: 'Yellow' },
    deposit: '',
    available: true,
    blurb: {
      ms: 'Honda Dash 125 2022 kuning — satu-satunya Honda dalam stok semasa, untuk yang mahu alternatif lebih jimat daripada Y15. Enjin 125cc PGM-FI Honda terkenal dengan penggunaan minyak yang sangat jimat dan penyelenggaraan murah — pilihan praktikal untuk penghantar makanan dan kegunaan harian. Ansuran bulanan paling rendah dalam senarai kami.'
    }
  }
];

export const findStockBySlug = (slug) => STOCK.find((item) => item.slug === slug) || null;

/**
 * Public stock index. Declared here so the Express route, the crawler
 * breadcrumbs and the React page can never disagree about the URL — the
 * breadcrumbs used to point at '/#stok', which is an anchor on the homepage
 * and not a page Google can index or link to on its own.
 */
export const STOCK_INDEX_PATH = '/stok';

/** Titles ≤ ~60 chars, descriptions ≤ 155 — same budget as stockSeo(). */
export const STOCK_INDEX_SEO = {
  ms: {
    title: 'Stok Motor Terpakai Simpang Ampat — Boleh Loan | DR Racing',
    description:
      'Senarai motor terpakai sedia stok di Simpang Ampat, Pulau Pinang. Setiap unit boleh buat loan kedai — senang lulus, tanpa slip gaji boleh cuba.',
    h1: 'Stok motor terpakai Simpang Ampat — semua unit boleh buat loan',
    intro:
      'Semua unit di bawah ialah stok sebenar di showroom kami di Simpang Ampat, Pulau Pinang. Setiap satu boleh buat loan kedai — pilih unit yang anda suka, kami uruskan permohonan, dokumen dan tukar nama sehingga selesai.',
    soldHeading: 'Unit yang telah dijual'
  },
  zh: {
    title: '槟城 Simpang Ampat 二手摩托现车 · 可分期 | DR Racing',
    description:
      'Simpang Ampat 槟城二手摩托现车清单，每一台都可以做分期（loan kedai）—— 容易批、没薪水单也能谈。WhatsApp 询问头期与月供。',
    h1: 'Simpang Ampat 二手摩托现车 —— 每一台都可做分期',
    intro:
      '以下全是我们 Simpang Ampat 展示厅的现车。每一台都可以做 loan（店家分期）—— 看中哪一台，申请、文件、过户我们全程帮你处理。',
    soldHeading: '已售出的车'
  },
  en: {
    title: 'Used Motorcycles Simpang Ampat — Loan Ready | DR Racing',
    description:
      'Second-hand motorcycles in stock at Simpang Ampat, Penang. Every unit is loan-ready — in-house financing, easy approval, no payslip? Still ask us.',
    h1: 'Used motorcycles in Simpang Ampat — every unit is loan-ready',
    intro:
      'Everything below is real stock at our Simpang Ampat showroom in Penang. Every unit can be financed in-house — pick the one you like and we handle the application, paperwork and ownership transfer.',
    soldHeading: 'Recently sold'
  }
};

/** Image helpers — public/stock/<slug>.webp with a .jpg fallback for old browsers. */
export const stockImage = (slug) => `/stock/${slug}.webp`;
export const stockImageSmall = (slug) => `/stock/${slug}-400.webp`;
export const stockImageJpg = (slug) => `/stock/${slug}.jpg`;

/**
 * Per-bike SEO copy. Long-tail: "loan <model> <year> <location>".
 * Titles are kept ≤ ~60 chars and descriptions ≤ 155 chars so Google does not
 * truncate the parts that matter (plate keeps sibling units distinct; the
 * location and brand must survive the cut).
 */
export const stockSeo = (item, lang = 'ms') => {
  const base = `${item.model} ${item.year}`;
  if (lang === 'zh') {
    return {
      title: `二手 ${base} ${item.plate} 分期 | 槟城 DR Racing`,
      description: `二手 ${base}，车牌 ${item.plate}，${item.colour.zh}。Simpang Ampat 槟城摩托分期 — 店家 loan、容易批、没 payslip 也能谈。WhatsApp 询问头期与月供。`,
      caption: `二手 ${base} · Simpang Ampat 槟城 摩托分期`
    };
  }
  if (lang === 'en') {
    return {
      title: `${base} ${item.plate} — Loan Simpang Ampat | DR Racing`,
      description: `Second hand ${base} (${item.plate}, ${item.colour.en}). Easy in-house motorcycle loan in Simpang Ampat, Penang. WhatsApp us for deposit & instalment.`,
      caption: `Loan ${base} second hand · Simpang Ampat, Penang`
    };
  }
  return {
    title: `Loan ${base} ${item.plate} — Simpang Ampat | DR Racing`,
    description: `${base} terpakai (${item.plate}, ${item.colour.ms}). Loan kedai senang lulus di Simpang Ampat — tanpa slip gaji boleh cuba. WhatsApp untuk deposit.`,
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
