import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { tr } from '../lib/i18n';
import { isFirebaseConfigured } from '../lib/firebaseConfig';
import { DELIVERY_STEPS, DELIVERY_STEP_FIELDS } from '../utils/deliveryChecklist';
import '../styles/handbook.css';

// Staff handbook at bo.dr-racing.com/handbook: the recorded training videos
// (tests/video-guides, scripts/video-guides). The media is served only by
// /api/handbook/media/* after /api/handbook/session has set a one-hour session
// cookie for an Active staff member, so nothing here renders a video URL until
// that session exists. The recordings use the English UI; the page copy, step
// lists and role names follow the dashboard language.
//
// Layout follows the apple-brand-design skill (styles/handbook.css): one claim
// and one action in the hero, the player as the main visual, then role cards,
// the delivery checklist and three notes. Chapter times and durations come from
// the recording harness (raw segment length minus its trimStart and any stall
// assemble.mjs cut, in order), one chapter per recorded segment;
// re-measure them whenever the videos are re-recorded (last: 2026-10-25).

type HandbookRole = 'Customer' | 'Sales' | 'Admin' | 'Operations Manager' | 'Super Admin';
type HandbookFlowKey = 'loan' | 'cash';

// [zh, en, ms]. Button and page names follow the dashboard's own wording in each
// language, so a step here reads the same as the button the staff member sees.
type Copy = readonly [string, string, string];
const t = (copy: Copy) => tr(copy[0], copy[1], copy[2]);

type HandbookVideo = {
  role: HandbookRole;
  slug: string;
  seconds: number;
  title: Copy;
  steps: Copy[];
};

type HandbookFlow = {
  name: Copy;
  full: { slug: string; seconds: number };
  relay: Array<{ role: HandbookRole; at: number; title: Copy }>;
  videos: HandbookVideo[];
};

const ROLE_COLORS: Record<HandbookRole, string> = {
  Customer: '#0f766e',
  Sales: '#2563eb',
  Admin: '#7c3aed',
  'Operations Manager': '#c2410c',
  'Super Admin': '#b91c1c'
};

// Same display labels as the dashboard's ROLE_LABEL_COPY (App.tsx); the stored
// role values stay English.
const ROLE_LABELS: Record<HandbookRole, Copy> = {
  Customer: ['客户', 'Customer', 'Pelanggan'],
  Sales: ['销售', 'Sales', 'Jualan'],
  Admin: ['管理员', 'Admin', 'Pentadbir'],
  'Operations Manager': ['运营经理', 'Operations Manager', 'Pengurus Operasi'],
  'Super Admin': ['超级管理员', 'Super Admin', 'Super Admin']
};
const roleLabel = (role: HandbookRole) => t(ROLE_LABELS[role]);

const ROLES = Object.keys(ROLE_COLORS) as HandbookRole[];

// Shared chapter titles (the same segment appears in both flows).
const CHAPTER = {
  delivery2: ['交车清单 2:收款，附收据', 'Checklist 2: collect payments with receipts', 'Senarai 2: kutip bayaran dengan resit'] as Copy,
  delivery3: ['交车清单 3:下单', 'Checklist 3: order the motor', 'Senarai 3: tempah motor'] as Copy,
  delivery48: ['交车清单 4–8:到车、K1、保险、JPJ、合约', 'Checklist 4–8: arrival, K1, insurance, JPJ, agreement', 'Senarai 4–8: ketibaan, K1, insurans, JPJ, perjanjian'] as Copy,
  delivery910: ['交车清单 9–10:约取车、签合约', 'Checklist 9–10: pick-up and signing', 'Senarai 9–10: ambil dan tandatangan'] as Copy,
  opsCheck: ['交车清单 11:运营经理核对', 'Checklist 11: Operations check', 'Senarai 11: semakan Operasi'] as Copy,
  deliver: ['确认交车,再做 12–14', 'Confirm delivery, then 12–14', 'Sahkan penghantaran, kemudian 12–14'] as Copy,
  stock: ['补库存(只填成本)', 'Add the bike to stock (cost only)', 'Tambah motosikal ke stok (kos sahaja)'] as Copy,
  oversee: ['查看成交和利润', 'Oversee the deal and the profit', 'Pantau jualan dan keuntungan'] as Copy
};

const FLOWS: Record<HandbookFlowKey, HandbookFlow> = {
  loan: {
    name: ['贷款客户流程', 'Loan customer flow', 'Aliran pelanggan pinjaman'],
    full: { slug: 'loan-full', seconds: 956 },
    relay: [
      { role: 'Sales', at: 0, title: ['把申请链接发给客户', 'Send the application link to the customer', 'Hantar pautan permohonan kepada pelanggan'] },
      { role: 'Customer', at: 23, title: ['客户用手机填写贷款申请', 'Fill in the loan application on a phone', 'Isi permohonan pinjaman di telefon'] },
      { role: 'Sales', at: 146, title: ['检查申请、上传 Geran、通知 Admin', 'Check the application, upload the Geran, notify Admin', 'Semak permohonan, muat naik Geran, maklumkan Pentadbir'] },
      { role: 'Admin', at: 194, title: ['审核并提交银行', 'Review and submit to the bank', 'Semak dan hantar ke bank'] },
      { role: 'Admin', at: 247, title: ['记录银行结果', 'Record the bank decision', 'Rekod keputusan bank'] },
      { role: 'Sales', at: 279, title: ['通知客户贷款已批准', 'Tell the customer the loan is approved', 'Maklumkan pelanggan pinjaman diluluskan'] },
      { role: 'Admin', at: 323, title: ['交车清单 1:核对 full loan', 'Checklist 1: check full loan', 'Senarai 1: semak pinjaman penuh'] },
      { role: 'Sales', at: 371, title: CHAPTER.delivery2 },
      { role: 'Operations Manager', at: 442, title: CHAPTER.stock },
      { role: 'Operations Manager', at: 496, title: CHAPTER.delivery3 },
      { role: 'Admin', at: 544, title: CHAPTER.delivery48 },
      { role: 'Sales', at: 632, title: CHAPTER.delivery910 },
      { role: 'Operations Manager', at: 678, title: CHAPTER.opsCheck },
      { role: 'Admin', at: 720, title: CHAPTER.deliver },
      { role: 'Operations Manager', at: 790, title: ['结算并支付佣金', 'Settle payment and pay commission', 'Selesaikan bayaran dan bayar komisen'] },
      { role: 'Super Admin', at: 852, title: CHAPTER.oversee }
    ],
    videos: [
      {
        role: 'Customer', slug: 'loan-customer', seconds: 124,
        title: ['填写贷款申请', 'Fill in the loan application', 'Isi permohonan pinjaman'],
        steps: [
          ['打开销售发来的链接，选「申请贷款」', 'Open the link the salesperson sent and choose Apply for Loan', 'Buka pautan yang dihantar oleh jurujual dan pilih Mohon Pinjaman'],
          ['填车辆和个人资料;已婚、离婚或丧偶要填孩子数量(没有就填 0)', 'Enter the bike and personal details; married, divorced or widowed customers enter the number of children (0 if none)', 'Isi butiran motosikal dan maklumat peribadi; yang berkahwin, bercerai atau balu/duda mengisi bilangan anak (0 jika tiada)'],
          ['两位紧急联系人，以及工作资料(开始上班的年和月)', 'Two emergency contacts and the work details (year and month started)', 'Dua kenalan kecemasan dan butiran pekerjaan (tahun dan bulan mula bekerja)'],
          ['上传 IC（正反面）和最近 3 个月的工资单', 'Upload IC (front and back) and the last 3 payslips', 'Muat naik IC (depan dan belakang) dan 3 slip gaji terkini'],
          ['点「提交申请」，记下参考编号', 'Tap Submit Application and keep the reference number', 'Ketik Hantar Permohonan dan simpan nombor rujukan']
        ]
      },
      {
        role: 'Sales', slug: 'loan-sales', seconds: 229,
        title: ['发链接、联系客户、交车清单', 'Share the link, contact the customer, run the checklist', 'Kongsi pautan, hubungi pelanggan, jalankan senarai'],
        steps: [
          ['贷款申请 → 分享链接，贴到客户的 WhatsApp', 'Loan Applications → Share Link, paste it into the customer’s WhatsApp', 'Permohonan Pinjaman → Kongsi Pautan, tampal ke WhatsApp pelanggan'],
          ['首页 → 检查申请；二手车上传 Geran，再点「通知 Admin」', 'Home → Check application; upload the Geran for a used bike, then Notify Admin', 'Laman Utama → Semak permohonan; muat naik Geran untuk motosikal terpakai, kemudian Maklumkan Pentadbir'],
          ['银行批准后打给客户，在卡片上直接点「客户已联系」', 'After the bank approves, call the customer and click Customer Contacted on the card', 'Selepas bank lulus, telefon pelanggan dan klik Pelanggan Dihubungi pada kad'],
          ['交车清单 2:每笔收款附收据;客户付款时签好 Hire Purchase 合约，确认「已签」才能完成，之后运营经理才会被通知补库存(第 1 步由 Admin 核对，第 3 步下单由运营经理做，你只能看)', 'Checklist 2: each payment with its receipt; the customer signs the hire purchase agreement when paying, and you confirm Signed to close the step, which is when Operations is asked for the bike (step 1 is Admin\'s and step 3, ordering the motor, is the Operations Manager\'s; you can read them)', 'Senarai 2: setiap bayaran dengan resit; pelanggan menandatangani perjanjian sewa beli semasa membayar dan anda sahkan Ditandatangani untuk menutup langkah ini, barulah Operasi diminta menyediakan motosikal (langkah 1 milik Pentadbir dan langkah 3, tempah motor, milik Pengurus Operasi; anda boleh membacanya)'],
          ['交车清单 9–10:约客户取车，客户签合约', 'Checklist 9–10: arrange the pick-up, the customer signs', 'Senarai 9–10: atur ambil, pelanggan tandatangan']
        ]
      },
      {
        role: 'Admin', slug: 'loan-admin', seconds: 292,
        title: ['送银行、交车清单、确认交车', 'Bank, checklist and delivery', 'Bank, senarai dan penghantaran'],
        steps: [
          ['首页 → 审核申请；缺资料就在内部对话打开「要求补资料」再发送', 'Home → Review application; if something is missing, turn on Request Documents in Internal Chat and send', 'Laman Utama → Semak permohonan; jika ada yang kurang, hidupkan Minta Dokumen dalam Sembang Dalaman dan hantar'],
          ['贷款申请表格 → 银行那一格的「提交」→ 确认', 'Loan Applications table → SUBMIT in the bank cell → confirm', 'Jadual Permohonan Pinjaman → HANTAR dalam sel bank → sahkan'],
          ['AEON 批了以后，客户的工资银行不在 AEON 可自动扣款的 9 家里，会有黄色提示，负责的 Sales 首页也会有卡片：联系客户换户口', 'After AEON approves: if the customer\'s salary bank is not one of the 9 AEON can auto-debit, a yellow note shows and the handler gets a Home card; ask the customer for another account', 'Selepas AEON lulus: jika bank gaji pelanggan bukan salah satu daripada 9 bank yang AEON boleh debit automatik, nota kuning dipaparkan dan pengendali dapat kad di Laman Utama; minta akaun lain'],
          ['银行回复后点 IN PROCESS 那一格，记录批准或拒绝(拒绝要填 CODE)', 'When the bank replies, click the IN PROCESS cell and record Approved, or Rejected with the CODE', 'Apabila bank membalas, klik sel IN PROCESS dan rekod Diluluskan, atau Ditolak dengan KOD'],
          ['交车清单 1:核对 full loan,填车价、批准贷款和订金，再填 AGM 费、路税 + 保险费(都含在车价内)、赠品成本和折扣', 'Checklist 1: check full loan; enter the price, the approved loan and the deposit, then the AGM fee and roadtax & insurance fee (both inside the price), free gift cost and discount', 'Senarai 1: semak pinjaman penuh; isi harga, pinjaman diluluskan dan deposit, kemudian yuran AGM dan yuran cukai jalan & insurans (kedua-duanya dalam harga), kos hadiah percuma dan diskaun'],
          ['交车清单 4–8:到车、K1、保险(填保险金额)、JPJ、合约，附上文件', 'Checklist 4–8: arrival, K1, insurance (with the insurance amount), JPJ, agreement, with the files attached', 'Senarai 4–8: ketibaan, K1, insurans (dengan amaun insurans), JPJ, perjanjian, dengan fail dilampirkan'],
          ['1–11 步做完后「确认交车」，再做 12–14:申报、文件、发票号', 'Once steps 1–11 are done: Confirm delivery, then 12–14: claim, documents, invoice number', 'Selepas langkah 1–11 selesai: Sahkan penghantaran, kemudian 12–14: tuntutan, dokumen, nombor invois']
        ]
      },
      {
        role: 'Operations Manager', slug: 'loan-operations-manager', seconds: 207,
        title: ['补库存、核对、结算', 'Stock, the Operations check and settlement', 'Stok, semakan Operasi dan penyelesaian'],
        steps: [
          ['Sales 收完款并确认 Hire Purchase 合约已签后，首页出现「需要库存」→ 补库存：只填成本(赠品在交车清单 1 填，这里是配件成本)，车牌有就填;佣金留空就按月度分级自动算', 'Once Sales closes Collect payment with the hire purchase agreement signed, Home shows Stock needed → Add stock: costs only (free gifts go in checklist 1; this is the accessories cost), the plate if known; leave Commission blank to use the monthly tiers', 'Selepas Jualan menutup Kutip bayaran dengan perjanjian sewa beli ditandatangani, Laman Utama menunjukkan Perlu stok → Tambah stok: kos sahaja (hadiah percuma dalam senarai 1; di sini kos aksesori), plat jika ada; biarkan Komisen kosong untuk tahap bulanan'],
          ['交车清单 3:下单，填颜色，附颜色照片和下单表格(手机可直接拍);车牌和 Negeri 可以晚点填', 'Checklist 3: order the motor; enter the colour, attach a colour photo and the order form (a phone can take the photo); the plate and Negeri can wait', 'Senarai 3: tempah motor; isi warna, lampirkan foto warna dan borang tempahan (telefon boleh terus ambil foto); plat dan Negeri boleh diisi kemudian'],
          ['交车清单 11:看汇总的价格、贷款、订金和收款，送车就填运车费，再填 AGM 实际支出，对了就标记完成', 'Checklist 11: check the price, loan, deposit and payments in the summary, enter the delivery fee if the bike is sent and the AGM actually paid, then Mark done', 'Senarai 11: semak harga, pinjaman, deposit dan bayaran dalam ringkasan, isi yuran penghantaran jika motosikal dihantar dan AGM sebenar dibayar, kemudian Tanda selesai'],
          ['交车后结算：金额已自动带好，只要确认;订金晚到就选到账日', 'After delivery, Settle: the figures are filled in, you only confirm; pick the arrival date of a late deposit', 'Selepas penghantaran, Selesaikan: angka sudah diisi, anda hanya sahkan; pilih tarikh tiba bagi deposit lewat'],
          ['点「标记财务完成」，再点「标记佣金已付」', 'Mark Finance Completed, then Mark Commission Paid', 'Tanda Kewangan Selesai, kemudian Tanda Komisen Dibayar']
        ]
      },
      {
        role: 'Super Admin', slug: 'loan-super-admin', seconds: 104,
        title: ['查看员工、成交和利润', 'Oversee staff, deals and profit', 'Pantau kakitangan, jualan dan keuntungan'],
        steps: [
          ['首页 → 显示员工进度，看每个人的工作量', 'Home → Show Staff Attention for everyone’s workload', 'Laman Utama → Tunjukkan Perhatian Kakitangan untuk beban kerja semua orang'],
          ['贷款申请：每单的进度和内部对话记录', 'Loan Applications: each deal’s progress and its Internal Chat', 'Permohonan Pinjaman: kemajuan setiap jualan dan Sembang Dalamannya'],
          ['交车：列出所有单，每辆车走到哪一步、轮到谁', 'Delivery: every deal listed, where every bike is and whose turn it is', 'Penghantaran: semua jualan disenaraikan, di mana setiap motosikal dan giliran siapa'],
          ['财务报表：成交与利润、库存与成本、佣金总账;审计日志查改动', 'Financial Reports: Deals & P&L, stock and cost, Commission Ledger; Audit Log for changes', 'Laporan Kewangan: Jualan & P&L, stok dan kos, Lejar Komisen; Log Audit untuk perubahan'],
          ['财务报表 → 佣金总账 → 佣金分级：有 Tier A / Tier B 两套，可改名称、每级门槛和比例', 'Financial Reports → Commission Ledger → Commission Tiers: two plans (Tier A / Tier B); edit the name, each threshold and rate', 'Laporan Kewangan → Lejar Komisen → Tahap Komisen: dua pelan (Tier A / Tier B); ubah nama, setiap ambang dan kadar'],
          ['Roles & Accounts → 佣金分级：选每位员工用哪一套，未付的分级佣金马上按新方案重算', 'Roles & Accounts → Commission tier: pick each staff member\'s plan; unpaid tier commission is recalculated on it at once', 'Roles & Accounts → Tahap komisen: pilih pelan setiap kakitangan; komisen tahap belum dibayar dikira semula serta-merta']
        ]
      }
    ]
  },
  cash: {
    name: ['现金购买流程', 'Cash purchase flow', 'Aliran pembelian tunai'],
    full: { slug: 'cash-full', seconds: 647 },
    relay: [
      { role: 'Sales', at: 0, title: ['登记上门的现金买家', 'Register the walk-in cash buyer', 'Daftar pembeli tunai yang datang ke kedai'] },
      { role: 'Sales', at: 62, title: ['检查申请并通知 Admin', 'Check the application and notify Admin', 'Semak permohonan dan maklumkan Pentadbir'] },
      { role: 'Admin', at: 102, title: ['批准现金购买', 'Approve the cash purchase', 'Luluskan pembelian tunai'] },
      { role: 'Sales', at: 143, title: ['确认客户接受', 'Confirm the customer accepts', 'Sahkan pelanggan menerima'] },
      { role: 'Admin', at: 175, title: ['交车清单 1:现金价', 'Checklist 1: the cash price', 'Senarai 1: harga tunai'] },
      { role: 'Sales', at: 210, title: CHAPTER.delivery2 },
      { role: 'Operations Manager', at: 268, title: CHAPTER.stock },
      { role: 'Operations Manager', at: 317, title: CHAPTER.delivery3 },
      { role: 'Admin', at: 347, title: CHAPTER.delivery48 },
      { role: 'Sales', at: 416, title: CHAPTER.delivery910 },
      { role: 'Operations Manager', at: 461, title: CHAPTER.opsCheck },
      { role: 'Admin', at: 498, title: CHAPTER.deliver },
      { role: 'Operations Manager', at: 546, title: ['结算并支付佣金', 'Settle and pay commission', 'Selesaikan dan bayar komisen'] },
      { role: 'Super Admin', at: 598, title: CHAPTER.oversee }
    ],
    videos: [
      {
        role: 'Sales', slug: 'cash-sales', seconds: 237,
        title: ['登记买家、收款、交车清单', 'Register the buyer, collect payment, run the checklist', 'Daftar pembeli, kutip bayaran, jalankan senarai'],
        steps: [
          ['贷款申请 → 新增客户 → 现金购买;填资料，上传 IC 和 Geran → 创建客户', 'Loan Applications → Add Customer → Cash Purchase; enter the details, upload IC and Geran → Create Customer', 'Permohonan Pinjaman → Tambah Pelanggan → Pembelian Tunai; isi butiran, muat naik IC dan Geran → Cipta Pelanggan'],
          ['首页 → 检查申请 → 通知 Admin', 'Home → Check application → Notify Admin', 'Laman Utama → Semak permohonan → Maklumkan Pentadbir'],
          ['批准后打给客户，再点「客户已接受」', 'After approval, call the customer, then Customer Accepted', 'Selepas kelulusan, telefon pelanggan, kemudian Pelanggan Diterima'],
          ['交车清单 2:订金和余款各记一笔，附收据(第 1 步现金价由 Admin 填，第 3 步下单由运营经理做)', 'Checklist 2: the deposit and the balance as two payments with receipts (Admin enters the cash price in step 1; the Operations Manager orders the motor in step 3)', 'Senarai 2: deposit dan baki sebagai dua bayaran dengan resit (Pentadbir mengisi harga tunai dalam langkah 1; Pengurus Operasi menempah motor dalam langkah 3)'],
          ['交车清单 9–10', 'Checklist 9–10', 'Senarai 9–10']
        ]
      },
      {
        role: 'Admin', slug: 'cash-admin', seconds: 194,
        title: ['批准现金购买', 'Approve the cash purchase', 'Luluskan pembelian tunai'],
        steps: [
          ['首页 → 检查现金申请，核对 IC、地址和现金价', 'Home → Review cash purchase; check the IC, address and cash price', 'Laman Utama → Semak pembelian tunai; semak IC, alamat dan harga tunai'],
          ['资料齐全就在卡片上直接点「批准现金购买」', 'When nothing is missing, click Approve Cash Purchase right on the card', 'Jika tiada yang kurang, klik Luluskan Pembelian Tunai terus pada kad'],
          ['交车清单 1:填现金价，贷款填 0,再填订金;有 AGM 费、路税 + 保险费(含在车价内)、赠品或折扣也在这里填', 'Checklist 1: the cash price, loan 0, then the deposit; any AGM fee, roadtax & insurance fee (inside the price), free gift or discount goes here too', 'Senarai 1: harga tunai, pinjaman 0, kemudian deposit; sebarang yuran AGM, yuran cukai jalan & insurans (dalam harga), hadiah percuma atau diskaun juga di sini'],
          ['交车清单 4–8', 'Checklist 4–8', 'Senarai 4–8'],
          ['1–11 步做完后「确认交车」，再做 12–14', 'Once steps 1–11 are done: Confirm delivery, then 12–14', 'Selepas langkah 1–11 selesai: Sahkan penghantaran, kemudian 12–14']
        ]
      },
      {
        role: 'Operations Manager', slug: 'cash-operations-manager', seconds: 167,
        title: ['补库存、核对、结算', 'Stock, the Operations check and settlement', 'Stok, semakan Operasi dan penyelesaian'],
        steps: [
          ['Sales 收完款后补库存：只填成本;佣金留空就按月度分级自动算', 'Once Sales closes Collect payment, Add stock: costs only; leave Commission blank to use the monthly tiers', 'Selepas Jualan menutup Kutip bayaran, Tambah stok: kos sahaja; biarkan Komisen kosong untuk tahap bulanan'],
          ['交车清单 3:下单，填颜色，附颜色照片;Negeri 可以晚点填', 'Checklist 3: order the motor; enter the colour and attach a colour photo; Negeri can wait', 'Senarai 3: tempah motor; isi warna dan lampirkan foto warna; Negeri boleh diisi kemudian'],
          ['交车清单 11:核对汇总，送车就填运车费，再填 AGM 实际支出，对了就标记完成', 'Checklist 11: check the summary, enter the delivery fee if the bike is sent and the AGM actually paid, then Mark done', 'Senarai 11: semak ringkasan, isi yuran penghantaran jika motosikal dihantar dan AGM sebenar dibayar, kemudian Tanda selesai'],
          ['交车后结算：金额已自动带好，现金单没有银行放款', 'After delivery, Settle: the figures are filled in; a cash deal has no bank disbursement', 'Selepas penghantaran, Selesaikan: angka sudah diisi; jualan tunai tiada pengeluaran bank'],
          ['点「标记财务完成」，再点「标记佣金已付」', 'Mark Finance Completed, then Mark Commission Paid', 'Tanda Kewangan Selesai, kemudian Tanda Komisen Dibayar']
        ]
      },
      {
        role: 'Super Admin', slug: 'cash-super-admin', seconds: 49,
        title: ['查看现金成交', 'Oversee cash deals', 'Pantau jualan tunai'],
        steps: [
          ['贷款申请 → 打开这一单(已完成的也在表里)', 'Loan Applications → open the deal (completed deals stay in the table)', 'Permohonan Pinjaman → buka jualan (jualan selesai kekal dalam jadual)'],
          ['右下角内部对话：每一步和经手人', 'Internal Chat (bottom right): every step and who did it', 'Sembang Dalaman (kanan bawah): setiap langkah dan siapa yang melakukannya'],
          ['财务报表：这单出现在本月已交车利润里', 'Financial Reports: the deal in this month’s Delivered P&L', 'Laporan Kewangan: jualan dalam P&L Dihantar bulan ini']
        ]
      }
    ]
  }
};

const mediaUrl = (file: string) => `/api/handbook/media/${file}`;
const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
// Renew well before the one-hour session cookie expires so a long viewing
// session never hits a 401 halfway through a video.
const SESSION_RENEW_MS = 45 * 60 * 1000;

type SessionState = 'starting' | 'ready' | 'local' | 'error';

const OPS_CHECK_INDEX = DELIVERY_STEPS.findIndex((step) => step.key === 'ops_check');

// Steps with no form fields still say what is recorded there.
const STEP_NOTES: Partial<Record<(typeof DELIVERY_STEPS)[number]['key'], Copy>> = {
  collect_payment: ['每一笔收款一行：金额、方式、收据照片', 'One line per payment: amount, method, receipt photo', 'Satu baris bagi setiap bayaran: amaun, kaedah, gambar resit'],
  print_agreement: ['附上合约 PDF', 'Attach the agreement PDF', 'Lampirkan PDF perjanjian'],
  ops_check: ['看汇总：价格、贷款、订金、收款、库存车', 'Check the summary: price, loan, deposit, payments, stock unit', 'Semak ringkasan: harga, pinjaman, deposit, bayaran, unit stok'],
  documentation: ['所有文件归档', 'File every document', 'Failkan semua dokumen']
};

function RoleTag({ role }: { role: HandbookRole }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.8125rem] font-medium" style={{ color: ROLE_COLORS[role] }}>
      <span className="hb-dot" style={{ backgroundColor: ROLE_COLORS[role] }} aria-hidden="true" />
      {roleLabel(role)}
    </span>
  );
}

export default function StaffHandbookPage({
  currentStaffRole,
  languageSwitcher
}: {
  currentStaffRole: string;
  // The dashboard's own Chinese / English / Malay switcher, so the choice is
  // shared with (and remembered for) the rest of the dashboard.
  languageSwitcher?: React.ReactNode;
}) {
  const [session, setSession] = useState<SessionState>(isFirebaseConfigured ? 'starting' : 'local');
  const [flowKey, setFlowKey] = useState<HandbookFlowKey>('loan');
  const [roleFilter, setRoleFilter] = useState<HandbookRole | 'All'>(
    ROLES.includes(currentStaffRole as HandbookRole) ? currentStaffRole as HandbookRole : 'All'
  );
  const [playing, setPlaying] = useState<{ slug: string; seek?: number } | null>(null);
  const [activeLeg, setActiveLeg] = useState(-1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const flow = FLOWS[flowKey];
  const currentSlug = playing?.slug || flow.full.slug;
  const currentVideo = flow.videos.find((video) => video.slug === currentSlug);

  const startSession = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    try {
      const { getCurrentFirebaseIdToken } = await import('../lib/auth');
      const token = await getCurrentFirebaseIdToken(true);
      if (!token) throw new Error('Missing Firebase ID token.');
      const response = await fetch('/api/handbook/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error(`Handbook session failed with ${response.status}.`);
      setSession('ready');
    } catch (error) {
      console.warn('Staff handbook session could not start.', error);
      setSession((current) => (current === 'ready' ? current : 'error'));
    }
  }, []);

  useEffect(() => {
    void startSession();
    const timer = window.setInterval(() => { void startSession(); }, SESSION_RENEW_MS);
    return () => window.clearInterval(timer);
  }, [startSession]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || session !== 'ready') return;
    if (playing?.seek !== undefined) {
      const seekTo = playing.seek;
      const apply = () => {
        video.currentTime = seekTo;
        void video.play().catch(() => undefined);
      };
      if (video.readyState >= 1) apply();
      else video.addEventListener('loadedmetadata', apply, { once: true });
    } else if (playing) {
      void video.play().catch(() => undefined);
    }
  }, [playing, session]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || currentSlug !== flow.full.slug) return;
    let index = 0;
    flow.relay.forEach((leg, legIndex) => {
      if (video.currentTime >= leg.at - 0.5) index = legIndex;
    });
    setActiveLeg(index);
  };

  const selectFlow = (key: HandbookFlowKey) => {
    if (key === flowKey) return;
    videoRef.current?.pause();
    setFlowKey(key);
    setPlaying(null);
    setActiveLeg(-1);
  };

  const showPlayer = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    playerRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const visibleVideos = flow.videos.filter((video) => roleFilter === 'All' || video.role === roleFilter);

  return (
    <div className="dashboard-ui hb">
      <nav className="hb-bar" aria-label={tr('手册导航', 'Handbook', 'Panduan')}>
        <div className="hb-container hb-bar-inner">
          <a href="/" className="hb-btn hb-btn--quiet -ml-[15px]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {tr('返回面板', 'Back to dashboard', 'Kembali ke papan pemuka')}
          </a>
          {languageSwitcher}
        </div>
      </nav>

      <header className="hb-hero">
        <div className="hb-container grid gap-6">
          <p className="hb-eyebrow">DR Racing · {tr('员工培训', 'Staff training', 'Latihan kakitangan')}</p>
          <h1 className="hb-display max-w-[14em]">{tr('员工视频手册', 'Staff Video Guide', 'Panduan Video Kakitangan')}</h1>
          <p className="hb-lead">
            {tr(
              '从客户填表到交车、结算，每个角色都有一段录屏，只讲你要做的那几步。',
              'From the customer’s form to delivery and settlement: one screen recording per role, with only the steps you do.',
              'Dari borang pelanggan hingga penghantaran dan penyelesaian: satu rakaman skrin bagi setiap peranan, dengan langkah anda sahaja.'
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              className="hb-btn hb-btn--primary"
              disabled={session !== 'ready'}
              onClick={() => { setPlaying({ slug: flow.full.slug, seek: 0 }); setActiveLeg(0); showPlayer(); }}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {tr('看完整流程', 'Watch the full flow', 'Tonton aliran penuh')} · {formatDuration(flow.full.seconds)}
            </button>
            <div className="hb-segment" role="tablist" aria-label={tr('流程', 'Flow', 'Aliran')}>
              {(Object.keys(FLOWS) as HandbookFlowKey[]).map((key) => (
                <button key={key} type="button" role="tab" aria-selected={key === flowKey} onClick={() => selectFlow(key)}>
                  {t(FLOWS[key].name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="hb-section" aria-label={tr('播放器', 'Player', 'Pemain')}>
        <div ref={playerRef} className="hb-container grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]" style={{ scrollMarginTop: 72 }}>
          <div className="grid gap-4">
            <div className="hb-player">
              {session === 'ready' ? (
                <video
                  key={currentSlug}
                  ref={videoRef}
                  data-testid="handbook-video"
                  className="h-full w-full object-contain"
                  src={mediaUrl(`${currentSlug}.mp4`)}
                  poster={mediaUrl(`${currentSlug}.jpg`)}
                  controls
                  playsInline
                  preload="metadata"
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-[1.0625rem] text-[#a1a1a6]" data-testid="handbook-status">
                  {session === 'starting' && tr('正在验证员工身份…', 'Checking your staff sign-in…', 'Menyemak log masuk kakitangan…')}
                  {session === 'local' && tr('本机模式没有视频。请在 bo.dr-racing.com/handbook 登录观看。', 'Videos are not available in local mode. Sign in at bo.dr-racing.com/handbook to watch.', 'Video tidak tersedia dalam mod tempatan. Log masuk di bo.dr-racing.com/handbook untuk menonton.')}
                  {session === 'error' && tr('无法载入视频。请重新登录后再试。', 'The videos could not be loaded. Sign in again and retry.', 'Video tidak dapat dimuatkan. Log masuk semula dan cuba lagi.')}
                </div>
              )}
            </div>
            <div className="grid gap-1">
              {currentVideo && <RoleTag role={currentVideo.role} />}
              <h2 className="hb-h3">
                {currentVideo ? t(currentVideo.title) : tr('完整流程 · 所有角色', 'Full flow · every role', 'Aliran penuh · semua peranan')}
              </h2>
              <p className="hb-caption">{t(flow.name)} · {formatDuration(currentVideo ? currentVideo.seconds : flow.full.seconds)}</p>
            </div>
          </div>

          <aside className="grid gap-3" aria-label={tr('工作顺序', 'Order of work', 'Susunan kerja')}>
            <div className="grid gap-1 px-3">
              <h3 className="hb-h3">{tr('谁做什么，按顺序', 'Who does what, in order', 'Siapa buat apa, mengikut susunan')}</h3>
              <p className="hb-small">{tr('点一步，跳到完整流程视频的那个位置。', 'Tap a step to jump to it in the full-flow video.', 'Ketik langkah untuk melompat ke bahagian itu dalam video aliran penuh.')}</p>
            </div>
            <ol className="grid">
              {flow.relay.map((leg, index) => (
                <li key={`${leg.at}-${leg.title[1]}`}>
                  <button
                    type="button"
                    disabled={session !== 'ready'}
                    aria-current={activeLeg === index && currentSlug === flow.full.slug}
                    onClick={() => { setPlaying({ slug: flow.full.slug, seek: leg.at }); setActiveLeg(index); }}
                    className={`hb-chapter ${roleFilter !== 'All' && leg.role !== roleFilter ? 'is-muted' : ''}`}
                  >
                    <span className="hb-caption pt-0.5 text-right">{index + 1}</span>
                    <span className="grid gap-0.5">
                      <RoleTag role={leg.role} />
                      <span className="text-[0.9375rem] leading-[1.375rem]">{t(leg.title)}</span>
                    </span>
                    <span className="hb-caption pt-0.5">{formatDuration(leg.at)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="hb-section hb-section--alt" aria-labelledby="handbook-role-videos">
        <div className="hb-container grid gap-10">
          <div className="grid gap-5">
            <h2 id="handbook-role-videos" className="hb-h2">{tr('按角色观看', 'Videos by role', 'Video mengikut peranan')}</h2>
            <div className="flex flex-wrap items-center gap-2" aria-label={tr('按角色显示', 'Show videos for', 'Tunjukkan video untuk')}>
              {(['All', ...ROLES] as Array<HandbookRole | 'All'>).map((role) => (
                <button key={role} type="button" className="hb-chip" aria-pressed={roleFilter === role} onClick={() => setRoleFilter(role)}>
                  {role !== 'All' && <span className="hb-dot" style={{ backgroundColor: ROLE_COLORS[role] }} aria-hidden="true" />}
                  {role === 'All' ? tr('全部角色', 'All roles', 'Semua peranan') : roleLabel(role)}
                </button>
              ))}
            </div>
            {visibleVideos.length === 0 && (
              <p className="hb-small">{tr('这个角色在此流程没有步骤。', 'This role has no steps in this flow.', 'Peranan ini tiada langkah dalam aliran ini.')}</p>
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleVideos.map((video) => (
              <article
                key={video.slug}
                className="hb-card grid content-start gap-5 p-5"
                style={currentSlug === video.slug ? { boxShadow: 'inset 0 0 0 2px var(--hb-accent)' } : undefined}
              >
                <button
                  type="button"
                  disabled={session !== 'ready'}
                  onClick={() => { setPlaying({ slug: video.slug }); setActiveLeg(-1); showPlayer(); }}
                  className="hb-thumb hb-thumb-btn relative block w-full disabled:cursor-not-allowed"
                  aria-label={`${tr('播放', 'Play', 'Main')} ${roleLabel(video.role)}: ${t(video.title)}`}
                >
                  {session === 'ready' && (
                    <img src={mediaUrl(`${video.slug}.jpg`)} alt="" loading="lazy" className="h-full w-full object-contain" />
                  )}
                  <span className="hb-play-pill absolute bottom-3 left-3 inline-flex min-h-[36px] items-center gap-2 rounded-full px-4 text-[0.875rem] font-medium">
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    {tr('播放', 'Play', 'Main')} · {formatDuration(video.seconds)}
                  </span>
                </button>
                <div className="grid content-start gap-3 px-1">
                  <RoleTag role={video.role} />
                  <h3 className="hb-h3">{t(video.title)}</h3>
                  <ol className="grid list-decimal gap-2 pl-5 text-[0.9375rem] leading-[1.5rem] text-[var(--hb-text-2)]">
                    {video.steps.map((step) => <li key={step[1]}>{t(step)}</li>)}
                  </ol>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hb-section" aria-labelledby="handbook-checklist">
        <div className="hb-container grid gap-8">
          <div className="grid gap-4">
            <h2 id="handbook-checklist" className="hb-h2">{tr(`交车清单 ${DELIVERY_STEPS.length} 步`, `The ${DELIVERY_STEPS.length}-step delivery checklist`, `Senarai penghantaran ${DELIVERY_STEPS.length} langkah`)}</h2>
            <p className="hb-lead">
              {tr(
                '批准之后每一单都有一张交车清单。轮到谁，谁的首页就会出现那一步。',
                'After approval every deal gets a delivery checklist. Whoever’s turn it is sees that step on Home.',
                'Selepas kelulusan setiap jualan mendapat senarai penghantaran. Giliran siapa, langkah itu muncul di Laman Utama orang itu.'
              )}
            </p>
          </div>
          <ol className="grid" aria-label={tr('交车清单', 'Delivery checklist', 'Senarai penghantaran')}>
            {DELIVERY_STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                <li className="hb-step-row">
                  <span className="hb-caption pt-1">{index + 1}</span>
                  <span className="font-semibold">{t(step.label)}</span>
                  <span className="hb-small">{step.owners.map((owner) => roleLabel(owner)).join(' / ')}</span>
                  <span className="hb-small">{(DELIVERY_STEP_FIELDS[step.key] || []).map((field) => t(field.label)).join(' · ') || (STEP_NOTES[step.key] ? t(STEP_NOTES[step.key] as Copy) : '—')}</span>
                </li>
                {index === OPS_CHECK_INDEX && (
                  <li className="hb-gate" role="note">
                    {tr(`第 1–${index + 1} 步全部完成，才能确认交车`, `Steps 1–${index + 1} must all be done before the bike can be delivered`, `Langkah 1–${index + 1} mesti selesai sebelum motosikal boleh dihantar`)}
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        </div>
      </section>

      <section className="hb-section hb-section--alt" aria-label={tr('说明', 'Notes', 'Nota')}>
        <div className="hb-container grid gap-8 md:grid-cols-3">
          {[
            {
              title: tr('每天从首页开始', 'Start every day on Home', 'Mulakan setiap hari di Laman Utama'),
              body: tr(
                '每一步都从首页的卡片开始。卡片写明下一步;不用填资料的步骤可以直接在卡片上点完。',
                'Every step starts from a card on Home. The card says what comes next; steps that need no input can be finished right on the card.',
                'Setiap langkah bermula dari kad di Laman Utama. Kad menerangkan langkah seterusnya; langkah tanpa input boleh diselesaikan terus pada kad.'
              )
            },
            {
              title: tr('数字只打一次', 'Figures are typed once', 'Angka ditaip sekali sahaja'),
              body: tr(
                '车价、贷款和订金在交车清单第 1 步填;补库存只填成本;结算自动带出来，运营经理只确认。',
                'Price, loan and deposit are entered at checklist step 1; Add stock takes only the cost; settlement fills itself in and the Operations Manager only confirms.',
                'Harga, pinjaman dan deposit diisi di langkah 1 senarai; Tambah stok hanya kos; penyelesaian diisi sendiri dan Pengurus Operasi hanya mengesahkan.'
              )
            },
            {
              title: tr('只是演示资料', 'Demo data only', 'Data demo sahaja'),
              body: tr(
                '视频里的客户、IC、电话和文件都是培训用的假资料，文件上印有 DEMO。',
                'All customers, IC numbers, phone numbers and documents in these videos are made up for training. Documents are marked DEMO.',
                'Semua pelanggan, nombor IC, nombor telefon dan dokumen dalam video ini adalah rekaan untuk latihan. Dokumen ditanda DEMO.'
              )
            }
          ].map((note) => (
            <div key={note.title} className="grid content-start gap-2">
              <h3 className="hb-h3">{note.title}</h3>
              <p className="hb-small">{note.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
