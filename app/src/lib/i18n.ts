/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppLanguage = 'zh' | 'en' | 'ms';

// App.tsx calls setAppLanguage(language) on every render, before children
// render. Components are not memoized, so a language switch re-renders the
// whole tree and every tr() call re-evaluates — no prop threading needed.
let currentLanguage: AppLanguage = 'zh';

export function setAppLanguage(language: AppLanguage) {
  currentLanguage = language;
}

export function getAppLanguage(): AppLanguage {
  return currentLanguage;
}

// English and Malay modes must never show Chinese: every user-facing
// hardcoded string goes through tr('中文', 'English', 'Bahasa Melayu').
export function tr(zh: string, en: string, ms: string) {
  if (currentLanguage === 'en') return en;
  if (currentLanguage === 'ms') return ms;
  return zh;
}

export function getAppLocale() {
  if (currentLanguage === 'zh') return 'zh-CN';
  if (currentLanguage === 'ms') return 'ms-MY';
  return 'en-MY';
}

// Display-only status translations. Stored values stay English so data,
// filters, and analytics keys never change.
const LOAN_STATUS_ZH: Record<string, string> = {
  NEW: '新申请',
  PENDING: '待处理',
  'IN PROCESS': '处理中',
  APPROVE: '已批核',
  REJECT: '已拒绝',
  'FOLLOW UP': '跟进中',
  CANCELLED: '已取消',
  ALL: '全部'
};

const LOAN_STATUS_MS: Record<string, string> = {
  NEW: 'Permohonan Baharu',
  PENDING: 'Menunggu',
  'IN PROCESS': 'Sedang Diproses',
  APPROVE: 'Diluluskan',
  REJECT: 'Ditolak',
  'FOLLOW UP': 'Susulan',
  CANCELLED: 'Dibatalkan',
  ALL: 'Semua'
};

export function trLoanStatus(status: string) {
  if (currentLanguage === 'zh') return LOAN_STATUS_ZH[status] || status;
  if (currentLanguage === 'ms') return LOAN_STATUS_MS[status] || status;
  return status;
}

const FOLLOW_UP_STATUS_ZH: Record<string, string> = {
  New: '新名单',
  Contacted: '已联系',
  'No Reply': '未回复',
  Interested: '有意向',
  'Submitted Loan': '已提交贷款',
  Rejected: '已拒绝',
  Closed: '已结束'
};

const FOLLOW_UP_STATUS_MS: Record<string, string> = {
  New: 'Prospek Baharu',
  Contacted: 'Telah Dihubungi',
  'No Reply': 'Tiada Balasan',
  Interested: 'Berminat',
  'Submitted Loan': 'Pinjaman Dihantar',
  Rejected: 'Ditolak',
  Closed: 'Ditutup'
};

export function trFollowUpStatus(status: string) {
  if (currentLanguage === 'zh') return FOLLOW_UP_STATUS_ZH[status] || status;
  if (currentLanguage === 'ms') return FOLLOW_UP_STATUS_MS[status] || status;
  return status;
}

const BANK_STATUS_ZH: Record<string, string> = {
  Draft: '待处理',
  Submitted: '已提交',
  'Pending Review': '银行审核中',
  'Need More Info': '需补资料',
  Rejected: '已拒绝',
  Approved: '已批核',
  Cancelled: '已取消'
};

const BANK_STATUS_EN: Record<string, string> = {
  Draft: 'Pending'
};

const BANK_STATUS_MS: Record<string, string> = {
  Draft: 'Menunggu',
  Submitted: 'Dihantar',
  'Pending Review': 'Menunggu Semakan',
  'Need More Info': 'Perlu Maklumat Tambahan',
  Rejected: 'Ditolak',
  Approved: 'Diluluskan',
  Cancelled: 'Dibatalkan'
};

export function trBankStatus(status: string) {
  if (currentLanguage === 'zh') return BANK_STATUS_ZH[status] || status;
  if (currentLanguage === 'ms') return BANK_STATUS_MS[status] || status;
  return BANK_STATUS_EN[status] || status;
}

const OFFER_STATUS_ZH: Record<string, string> = {
  'No Offer': '暂无 Offer',
  'Pending Decision': '待客户决定',
  Accepted: '已接受',
  'Not Accepted': '未接受',
  Expired: '已过期',
  Withdrawn: '已撤回'
};

const OFFER_STATUS_MS: Record<string, string> = {
  'No Offer': 'Tiada Tawaran',
  'Pending Decision': 'Menunggu Keputusan',
  Accepted: 'Diterima',
  'Not Accepted': 'Tidak Diterima',
  Expired: 'Tamat Tempoh',
  Withdrawn: 'Ditarik Balik'
};

export function trOfferStatus(status: string) {
  if (currentLanguage === 'zh') return OFFER_STATUS_ZH[status] || status;
  if (currentLanguage === 'ms') return OFFER_STATUS_MS[status] || status;
  return status;
}

const ROLE_ZH: Record<string, string> = {
  'Super Admin': '超级管理员',
  'Operations Manager': '运营经理',
  Admin: '管理员',
  'Loan Officer': '贷款专员',
  'Sales Advisor': '销售顾问',
  Sales: '销售',
  Staff: '员工'
};

const ROLE_MS: Record<string, string> = {
  'Super Admin': 'Super Admin',
  'Operations Manager': 'Pengurus Operasi',
  Admin: 'Pentadbir',
  'Loan Officer': 'Pegawai Pinjaman',
  'Sales Advisor': 'Penasihat Jualan',
  Sales: 'Jualan',
  Staff: 'Kakitangan'
};

export function trRole(role: string) {
  if (currentLanguage === 'zh') return ROLE_ZH[role] || role;
  if (currentLanguage === 'ms') return ROLE_MS[role] || role;
  return role;
}

const ANALYTICS_LABEL_MS: Record<string, string> = {
  'A-Z': 'A-Z',
  'Active Links': 'Pautan Aktif',
  'Age Group': 'Kumpulan Umur',
  All: 'Semua',
  'All Cards': 'Semua Kad',
  'All time': 'Sepanjang Masa',
  'Already Applied': 'Sudah Memohon',
  'Approval Rate': 'Kadar Kelulusan',
  Approved: 'Diluluskan',
  'Approved Loans': 'Pinjaman Diluluskan',
  'Approved Sales': 'Jualan Diluluskan',
  'Approved Units': 'Unit Diluluskan',
  'Approved loan records counted by unique plate': 'Rekod pinjaman diluluskan dikira mengikut nombor plat unik',
  Bar: 'Bar',
  'Best Mix Share': 'Bahagian Campuran Terbaik',
  Birthplace: 'Tempat Lahir',
  Brand: 'Jenama',
  'Brand demand in selected timeframe': 'Permintaan jenama dalam tempoh masa dipilih',
  Breakdown: 'Pecahan',
  Campaign: 'Kempen',
  Cash: 'Tunai',
  Channel: 'Saluran',
  Clicks: 'Klik',
  Combo: 'Gabungan',
  Compare: 'Bandingkan',
  'Compare End': 'Akhir Perbandingan',
  'Compare Start': 'Mula Perbandingan',
  Custom: 'Tersuai',
  'Custom vs Custom': 'Tersuai lwn Tersuai',
  Customers: 'Pelanggan',
  Delta: 'Perubahan',
  Details: 'Butiran',
  Donut: 'Donat',
  'Dup Phones': 'Telefon Pendua',
  'End date': 'Tarikh akhir',
  'Filtered Applications': 'Permohonan Ditapis',
  'Final failed loan CODE grouped by selected timeframe': 'KOD akhir pinjaman gagal dikumpulkan mengikut tempoh masa dipilih',
  Gender: 'Jantina',
  'Last 12 months vs Previous 12 months': '12 Bulan Terakhir lwn 12 Bulan Sebelumnya',
  'Last 7 days': '7 Hari Terakhir',
  'Last 30 days': '30 Hari Terakhir',
  'Last month': 'Bulan Lepas',
  'Last week': 'Minggu Lepas',
  Leads: 'Prospek',
  Link: 'Pautan',
  Loan: 'Pinjaman',
  'Loan / Cash': 'Pinjaman / Tunai',
  'Loan Status': 'Status Pinjaman',
  'Matched to Customers by phone, IC, account, or email': 'Dipadankan dengan pelanggan melalui telefon, IC, akaun atau e-mel',
  Medium: 'Medium',
  'Missing Reject CODE': 'KOD Penolakan Tiada',
  Model: 'Model',
  'Monthly view': 'Paparan Bulanan',
  'NRIC Parsed': 'NRIC Diproses',
  New: 'Baharu',
  'New / Used': 'Baharu / Terpakai',
  'No compare': 'Tiada Perbandingan',
  'No matching customer application yet': 'Belum ada permohonan pelanggan yang sepadan',
  'Not set': 'Belum Ditetapkan',
  'Phone numbers appearing more than once': 'Nombor telefon yang muncul lebih daripada sekali',
  'Potential Leads': 'Prospek Berpotensi',
  Primary: 'Utama',
  'Primary End': 'Akhir Tempoh Utama',
  'Primary Start': 'Mula Tempoh Utama',
  'Profile Signal': 'Isyarat Profil',
  Quantity: 'Kuantiti',
  'REJECT CODE Distribution': 'Taburan KOD Penolakan',
  'REJECT CODE Rows': 'Baris KOD Penolakan',
  'Raw Leads': 'Prospek Mentah',
  'Raw lead phone numbers after normalisation': 'Nombor telefon prospek mentah selepas penyeragaman',
  'Rejected Loans': 'Pinjaman Ditolak',
  'Rejected loans without final CODE': 'Pinjaman ditolak tanpa KOD akhir',
  'Role Accounts': 'Akaun Peranan',
  Rows: 'Baris',
  Sales: 'Jualan',
  'Sales Sources': 'Sumber Jualan',
  'Sales staff with tracked clicks': 'Kakitangan jualan dengan klik yang dijejaki',
  'Secondary End': 'Akhir Tempoh Kedua',
  'Secondary Start': 'Mula Tempoh Kedua',
  Share: 'Bahagian',
  Source: 'Sumber',
  'Source Traffic': 'Trafik Sumber',
  'Staff Workload': 'Beban Kerja Kakitangan',
  'Start date': 'Tarikh mula',
  Status: 'Status',
  Today: 'Hari Ini',
  'This month': 'Bulan Ini',
  'This month vs Last month': 'Bulan Ini lwn Bulan Lepas',
  'This week': 'Minggu Ini',
  'This week vs Last week': 'Minggu Ini lwn Minggu Lepas',
  'Today vs Yesterday': 'Hari Ini lwn Semalam',
  'This year': 'Tahun Ini',
  'Top Age Group': 'Kumpulan Umur Teratas',
  'Top Birthplace': 'Tempat Lahir Teratas',
  'Top Model': 'Model Teratas',
  'Top Reject CODE': 'KOD Penolakan Teratas',
  'Top Result': 'Hasil Teratas',
  'Top Sale': 'Jualan Teratas',
  'Top Segment': 'Segmen Teratas',
  'Total Units': 'Jumlah Unit',
  Trend: 'Trend',
  'UTM Campaigns': 'Kempen UTM',
  'Unique Phones': 'Telefon Unik',
  Units: 'Unit',
  Used: 'Terpakai',
  Yesterday: 'Semalam',
  Vehicle: 'Kenderaan',
  'Vehicle Brands': 'Jenama Kenderaan',
  'Vehicle Filter': 'Penapis Kenderaan',
  'Vehicle Units': 'Unit Kenderaan',
  View: 'Paparan',
  'WhatsApp Clicks': 'Klik WhatsApp',
  accounts: 'akaun',
  records: 'rekod',
  units: 'unit'
};

export function trAnalyticsLabel(zh: string, en: string) {
  return tr(zh, en, ANALYTICS_LABEL_MS[en] || en);
}

const NOTIFICATION_TITLE_COPY: Record<string, { zh: string; ms: string }> = {
  raw_lead_assigned: { zh: '已分配新潜在客户', ms: 'Prospek baharu ditugaskan' },
  calendar_task_assigned: { zh: '已分配新日历任务', ms: 'Tugasan kalendar baharu ditugaskan' },
  customer_call_back_due: { zh: '客户回电到期', ms: 'Panggilan balik pelanggan perlu dibuat' },
  bank_submission_required: { zh: '需要提交银行申请', ms: 'Permohonan bank perlu dihantar' },
  bank_follow_up_due: { zh: '银行跟进到期', ms: 'Susulan bank perlu dibuat' },
  bank_need_more_info: { zh: '银行需要更多资料', ms: 'Bank memerlukan maklumat tambahan' },
  loan_sales_review_required: { zh: '新申请等待 Sales 检查', ms: 'Permohonan baharu menunggu semakan Jualan' },
  loan_admin_action_required: { zh: '贷款申请等待 Admin', ms: 'Permohonan pinjaman menunggu Pentadbir' },
  loan_documents_required: { zh: '贷款申请需要补资料', ms: 'Permohonan pinjaman memerlukan dokumen' },
  loan_documents_uploaded: { zh: 'Sales 已上传客户文件', ms: 'Jualan telah memuat naik dokumen pelanggan' },
  loan_rejected_action_required: { zh: '拒贷等待 Sales 处理', ms: 'Pinjaman ditolak menunggu tindakan Jualan' },
  loan_approved: { zh: '贷款已批准', ms: 'Pinjaman diluluskan' },
  vehicle_stock_required: { zh: '需要补库存与成本', ms: 'Stok dan kos diperlukan' },
  rejected_loan_missing_code: { zh: '拒贷缺少 CODE', ms: 'Pinjaman ditolak tanpa KOD' },
  mission_due_soon: { zh: '任务即将到期', ms: 'Misi akan tamat tidak lama lagi' },
  custom_mission_target_reached: { zh: '已达到自定义任务目标', ms: 'Sasaran misi tersuai dicapai' },
  internal_comment_tagged: { zh: '内部评论提及了你', ms: 'Anda ditanda dalam komen dalaman' }
};

export function trNotificationTitle(type: string, fallback: string) {
  const copy = NOTIFICATION_TITLE_COPY[type];
  if (!copy) return fallback;
  if (currentLanguage === 'zh') return copy.zh;
  if (currentLanguage === 'ms') return copy.ms;
  return fallback;
}

export function trNotificationMessage(type: string, targetLabel: string, fallback: string) {
  if (type === 'internal_comment_tagged') return fallback;
  if (currentLanguage === 'en') return fallback;
  const target = targetLabel || (currentLanguage === 'zh' ? '相关记录' : 'rekod berkaitan');
  const copy: Record<string, { zh: string; ms: string }> = {
    raw_lead_assigned: { zh: `${target} 已交给你跟进。`, ms: `${target} telah ditugaskan kepada anda untuk susulan.` },
    calendar_task_assigned: { zh: `已为你安排日历任务：${target}。`, ms: `Tugasan kalendar telah diberikan kepada anda: ${target}.` },
    customer_call_back_due: { zh: `${target} 的客户回电已经到期。`, ms: `Panggilan balik pelanggan untuk ${target} perlu dibuat.` },
    bank_submission_required: { zh: `${target} 的贷款申请需要提交给银行。`, ms: `Permohonan pinjaman untuk ${target} perlu dihantar kepada bank.` },
    bank_follow_up_due: { zh: `${target} 的银行跟进已经到期。`, ms: `Susulan bank untuk ${target} perlu dibuat.` },
    bank_need_more_info: { zh: `${target} 的银行申请需要补资料。`, ms: `Permohonan bank untuk ${target} memerlukan maklumat tambahan.` },
    loan_sales_review_required: { zh: `${target} 已提交申请，请先检查并补齐全部资料，再通知 Admin。`, ms: `${target} telah menghantar permohonan. Semak dan lengkapkan semua maklumat sebelum memaklumkan Pentadbir.` },
    loan_admin_action_required: { zh: `${target} 正在等待 Admin 检查或提交银行。`, ms: `${target} sedang menunggu Pentadbir menyemak atau menghantar ke bank.` },
    loan_documents_required: { zh: `${target} 正在等待 Handler 补资料。`, ms: `${target} sedang menunggu pengendali melengkapkan dokumen.` },
    loan_documents_uploaded: { zh: `${target} 的客户文件已由 Sales 上传，请检查。`, ms: `Dokumen pelanggan untuk ${target} telah dimuat naik oleh Jualan. Sila semak.` },
    loan_rejected_action_required: { zh: `${target} 已被银行拒绝，请选择结案或补件重提。`, ms: `${target} ditolak oleh bank. Tutup fail atau hantar dokumen baharu.` },
    loan_approved: { zh: `${target} 已获银行批准，请联系客户。`, ms: `${target} telah diluluskan oleh bank. Hubungi pelanggan.` },
    vehicle_stock_required: { zh: `${target} 的 Sales 已完成申请，但没有可用库存车。请补库存并填写成本。`, ms: `Jualan telah melengkapkan permohonan ${target}, tetapi tiada unit stok tersedia. Tambah stok dan rekod kos.` },
    rejected_loan_missing_code: { zh: `${target} 已拒贷，但还没有填写最终 CODE。`, ms: `${target} telah ditolak tetapi KOD akhir masih belum diisi.` },
    mission_due_soon: { zh: `${target} 即将到期，请检查当前进度。`, ms: `${target} akan tamat tidak lama lagi. Sila semak kemajuan semasa.` },
    custom_mission_target_reached: { zh: `${target} 已达到目标。`, ms: `${target} telah mencapai sasaran.` },
    internal_comment_tagged: { zh: `你在 ${target} 的内部评论中被提及。`, ms: `Anda ditanda dalam komen dalaman untuk ${target}.` }
  };
  return copy[type]?.[currentLanguage] || fallback;
}
