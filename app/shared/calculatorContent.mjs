/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Content for /kalkulator-ansuran-motor — shared by the React page and
 * server.mjs (crawler body + meta + FAQPage schema).
 *
 * Targets: "ansuran motor", "kira ansuran motor", "bayaran bulanan motor".
 * Differentiator vs every competitor calculator: total cost of ownership
 * (instalment + insurance + road tax + transfer fee) and an honest
 * explanation that Malaysian motorcycle HP is quoted FLAT, not
 * reducing-balance.
 */

export const CALC_PATH = '/kalkulator-ansuran-motor';

export const CALC_TITLE = 'Kira Ansuran Motor — Kalkulator & Kos Sebenar | DR Racing';
export const CALC_DESCRIPTION =
  'Kalkulator ansuran motor percuma: kira bayaran bulanan ikut harga, deposit dan tempoh — plus kos sebenar termasuk insurans, cukai jalan & tukar nama.';

export const CALC_H1 = 'Kira Ansuran Motor — Kalkulator & Panduan Kos Sebenar';

export const CALC_INTRO =
  'Kebanyakan kalkulator loan motor hanya bagi satu angka: ansuran bulanan. Angka itu tidak cukup untuk buat keputusan. Kalkulator ini menunjukkan jumlah yang sebenarnya keluar dari poket anda — ansuran, jumlah faedah, plus anggaran insurans, cukai jalan dan yuran tukar nama — dan menerangkan satu perkara yang jarang diterangkan: kadar "sekian peratus" yang anda nampak dalam iklan pembiayaan motor di Malaysia ialah kadar rata, dan kadar efektif sebenarnya hampir dua kali ganda.';

/** Default calculator inputs (typical unit at our showroom). */
export const CALC_DEFAULTS = {
  price: 6000,
  deposit: 500,
  ratePctPerYearFlat: 10,
  months: 36
};

/**
 * Flat-rate hire purchase maths, the standard for Malaysian motorcycle
 * financing (bank and kedai alike).
 */
export const calcLoan = ({ price, deposit, ratePctPerYearFlat, months }) => {
  const principal = Math.max(0, price - deposit);
  const years = months / 12;
  const interest = principal * (ratePctPerYearFlat / 100) * years;
  const total = principal + interest;
  const monthly = months > 0 ? total / months : 0;
  // Effective annual rate approximation for a flat-rate HP loan
  // (n = number of payments): EAR ≈ flat × 2n / (n + 1).
  const effectivePct = months > 0 ? (ratePctPerYearFlat * 2 * months) / (months + 1) : 0;
  return { principal, interest, total, monthly, effectivePct };
};

/**
 * Ownership cost estimates (annual, RM) for the small-capacity segment.
 * Deliberately labelled as estimates in the UI — actual premium depends on
 * insurer, coverage and engine capacity.
 */
export const OWNERSHIP_ESTIMATES = {
  insuranceThirdPartyPerYear: [70, 150],
  roadTaxPerYearUpTo150cc: [2, 30],
  jpjTransferFee: [100, 200]
};

export const CALC_SECTIONS = [
  {
    h: 'Macam mana ansuran motor dikira di Malaysia',
    p: [
      'Pembiayaan motosikal di Malaysia — di bank mahupun di kedai — lazimnya menggunakan kadar rata (flat rate). Formula penuhnya mudah: faedah = jumlah dibiayai × kadar setahun × bilangan tahun. Jumlah bayaran balik ialah jumlah dibiayai campur faedah itu, dan ansuran bulanan ialah jumlah bayaran balik dibahagi bilangan bulan.',
      'Contoh: motor RM6,000, deposit RM500, jadi jumlah dibiayai RM5,500. Pada kadar 10% setahun rata untuk 36 bulan: faedah = RM5,500 × 10% × 3 = RM1,650. Jumlah bayaran balik RM7,150, ansuran bulanan sekitar RM199.',
      'Perhatikan yang faedah dikira atas RM5,500 penuh untuk ketiga-tiga tahun — walaupun selepas setahun anda sudah membayar balik sebahagian besar hutang itu. Di situlah beza kadar rata dengan kadar baki berkurangan, dan sebab kenapa angka "10%" tidak semurah yang ia bunyi.'
    ]
  },
  {
    h: 'Kadar rata vs kadar efektif — perkara yang iklan tak terangkan',
    p: [
      'Kadar rata 10% setahun bersamaan kira-kira 18–19% setahun dalam kadar efektif (APR) untuk tempoh 36 bulan. Sebagai bandingan mudah: 0.833% sebulan yang kelihatan kecil dalam iklan ialah 10% setahun rata — bukan 10% efektif.',
      'Ini bukan penipuan sesiapa — ia cara standard industri sewa beli mempersembahkan kadar, dan bank besar pun menggunakannya untuk pembiayaan kenderaan. Tetapi ia bermakna anda tidak boleh bandingkan kadar rata loan motor dengan kadar efektif loan peribadi secara terus. Sentiasa bandingkan jumlah bayaran balik keseluruhan — itu satu-satunya angka yang tidak boleh mengelirukan.',
      'Petua praktikal: tempoh terpendek yang ansurannya masih selesa ialah pilihan paling jimat. Ansuran RM275 selama 24 bulan berjumlah RM6,600; ansuran RM160 selama 48 bulan untuk unit yang sama berjumlah RM7,700 — beza RM1,100 untuk motor yang sama.'
    ]
  },
  {
    h: 'Kos sebenar memiliki motor: bukan ansuran sahaja',
    p: [
      'Ansuran hanyalah sebahagian daripada kos bulanan sebenar. Untuk motor kapcai bawah 150cc, tambahkan anggaran ini: insurans pihak ketiga sekitar RM70–150 setahun (lebih tinggi untuk perlindungan komprehensif), cukai jalan yang murah untuk kapasiti kecil (bermula serendah RM2 setahun untuk 150cc ke bawah), dan yuran tukar nama JPJ serta urusan berkaitan sekali sahaja semasa pembelian.',
      'Dikira secara bulanan, kos milikan sebenar motor RM199 sebulan biasanya sekitar RM210–220 sebulan selepas insurans dan cukai jalan diambil kira — masih jauh lebih murah daripada mana-mana kereta, tetapi berbaloi dirancang dengan angka penuh.',
      'Jangan lupa kos berjalan: minyak, servis berkala (penukaran minyak hitam setiap beberapa ribu kilometer), dan tayar. Untuk penunggang harian, peruntukkan RM50–100 sebulan untuk keseluruhan penyelenggaraan adalah anggaran yang selamat bagi kapcai.'
    ]
  },
  {
    h: 'Cara guna kalkulator ini untuk buat keputusan',
    p: [
      'Mula dengan harga motor yang anda minati dan deposit yang anda ada. Lihat ansurannya — kemudian tanya diri: selepas semua komitmen lain, adakah lebihan bulanan saya sekurang-kurangnya dua kali ansuran ini? Kalau ya, anda dalam zon selamat. Kalau lebihan anda hampir sama dengan ansuran, pilih unit lebih murah atau tambah deposit.',
      'Cuba juga senario berbeza: naikkan deposit RM500 dan lihat berapa ansuran turun; pendekkan tempoh dan lihat berapa faedah dijimatkan. Perubahan kecil pada dua angka ini selalunya lebih besar kesannya daripada tawar-menawar harga motor.',
      'Angka daripada kalkulator ini ialah anggaran untuk perancangan — kadar sebenar bergantung pada profil anda dan unit yang dipilih. Untuk sebut harga sebenar dengan semua angka bertulis, hantar pertanyaan kepada kami; kami balas dengan deposit, ansuran dan jumlah keseluruhan untuk unit sebenar dalam stok.'
    ]
  }
];

export const CALC_FAQ = [
  ['Berapa ansuran motor RM6,000?', 'Dengan deposit RM500 dan tempoh 36 bulan pada contoh kadar 10% setahun rata: ansuran sekitar RM199 sebulan, jumlah bayaran balik RM7,150. Gunakan kalkulator di atas untuk harga, deposit dan tempoh anda sendiri.'],
  ['Apa itu kadar rata (flat rate)?', 'Kadar di mana faedah dikira atas jumlah asal dibiayai untuk keseluruhan tempoh, bukan atas baki yang menurun. Ia cara standard pembiayaan motor di Malaysia. Kadar rata 10% setahun bersamaan kira-kira 18–19% kadar efektif.'],
  ['Deposit motor biasanya berapa?', 'Bergantung pada model, tahun dan profil pemohon — ada unit deposit rendah, dan deposit lebih tinggi menaikkan peluang kelulusan serta mengurangkan ansuran. Beritahu kami unit yang anda minati untuk angka sebenar.'],
  ['Tempoh loan motor paling lama berapa tahun?', 'Lazimnya antara 2 hingga 5 tahun bergantung pembiaya dan usia motor. Tempoh panjang meringankan ansuran tetapi menambah jumlah faedah — pilih tempoh terpendek yang masih selesa.'],
  ['Selain ansuran, apa lagi kos bulanan motor?', 'Insurans (anggaran RM70–150 setahun untuk pihak ketiga, kapcai), cukai jalan (sangat murah bawah 150cc), minyak dan servis berkala. Peruntukkan tambahan RM50–100 sebulan adalah anggaran selamat untuk penunggang harian.'],
  ['Angka kalkulator ini tepat ke?', 'Ia anggaran perancangan menggunakan formula kadar rata standard. Kadar dan terma sebenar bergantung pada penilaian pembiaya serta unit dipilih. Hubungi kami untuk sebut harga sebenar secara bertulis.']
];
