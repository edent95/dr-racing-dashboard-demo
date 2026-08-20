/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sales Budget data: all constants, derived costs, and display rows for the
 * read-only transparency costing page. Update the constants here (with the
 * check date) instead of editing SalesBudgetPage.tsx.
 */

// ---------------------------------------------------------------------------
// Base constants (last checked: 2026-07-05)
// ---------------------------------------------------------------------------

export const RATES_CHECKED_ON = '2026-07-05';
export const USD_TO_MYR = 4.071; // USD/MYR interbank reference, 2026-07-03
export const MACBOOK_COST = 16974; // Actual purchase reference (M4 Max 64GB/1TB)
export const MONTHLY_SALARY = 8000;
export const WORKING_DAYS_PER_MONTH = 22;
export const PROJECT_DAYS = 14;
export const DOMAIN_YEARLY_COST = 300;
export const SERVER_USD_MONTHLY = 120;
export const AI_SERVICE_MONTHLY = 1000;
export const MONTHLY_BILL_SUPPORT_DAYS = 4;

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

export const dailyRate = MONTHLY_SALARY / WORKING_DAYS_PER_MONTH;
export const timeCost = dailyRate * PROJECT_DAYS;
export const serverMonthlyCost = SERVER_USD_MONTHLY * USD_TO_MYR;
export const domainMonthlyCost = DOMAIN_YEARLY_COST / 12;
export const monthlyBillFounderCost = dailyRate * MONTHLY_BILL_SUPPORT_DAYS;
export const monthlyBillTotal = domainMonthlyCost + serverMonthlyCost + monthlyBillFounderCost;
export const recurringMonthlyCost = serverMonthlyCost + AI_SERVICE_MONTHLY;
export const recurringYearlyCost = DOMAIN_YEARLY_COST + (serverMonthlyCost * 12) + (AI_SERVICE_MONTHLY * 12);
export const firstMonthTotal = MACBOOK_COST + timeCost + DOMAIN_YEARLY_COST + serverMonthlyCost + AI_SERVICE_MONTHLY;
export const firstMonthWithoutHardware = timeCost + DOMAIN_YEARLY_COST + serverMonthlyCost + AI_SERVICE_MONTHLY;
export const yearOneTotal = MACBOOK_COST + timeCost + recurringYearlyCost;

export const formatCurrency = (value: number) => `RM ${value.toLocaleString('en-MY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;

// ---------------------------------------------------------------------------
// Display rows
// ---------------------------------------------------------------------------

export type CostRowTone = 'hardware' | 'time' | 'recurring' | 'value';

export interface CostRow {
  item: string;
  type: string;
  tone: CostRowTone;
  formula: string;
  amount: number;
  note: string;
}

export const costRows: CostRow[] = [
  {
    item: 'MacBook Pro M4 Max 64GB / 1TB',
    type: 'One-time hardware',
    tone: 'hardware',
    formula: 'Actual purchase reference (Malaysia market)',
    amount: MACBOOK_COST,
    note: 'M4 Max is discontinued; the 2026 M5 Max 14-inch lineup runs RM14,999 (36GB/2TB) to RM20,524 (64GB/4TB), so RM16,974 stays a fair mid-range reference. Recheck before invoicing.'
  },
  {
    item: 'Founder / builder time',
    type: 'Opportunity cost',
    tone: 'time',
    formula: `RM8,000 salary / ${WORKING_DAYS_PER_MONTH} working days x ${PROJECT_DAYS} days`,
    amount: timeCost,
    note: `Daily rate: ${formatCurrency(dailyRate)}. Calendar-day method would be lower, but working-day costing is more honest for project effort.`
  },
  {
    item: 'Domain',
    type: 'Yearly recurring',
    tone: 'recurring',
    formula: 'One year domain cost',
    amount: DOMAIN_YEARLY_COST,
    note: 'Covers domain ownership only. Email hosting, DNS security, or premium DNS can be separate.'
  },
  {
    item: 'Server',
    type: 'Monthly recurring',
    tone: 'recurring',
    formula: `USD ${SERVER_USD_MONTHLY} x ${USD_TO_MYR.toFixed(3)} USD/MYR`,
    amount: serverMonthlyCost,
    note: `Converted with the ${RATES_CHECKED_ON} reference rate. Actual card charge can move with FX and bank fees.`
  },
  {
    item: 'AI service',
    type: 'Monthly recurring',
    tone: 'recurring',
    formula: 'AI tools / API / assistant services',
    amount: AI_SERVICE_MONTHLY,
    note: 'Budgeted monthly usage. Heavy automation, image generation, or API overage can increase this.'
  },
  {
    item: 'AI, marketing, sales, data analytic skills',
    type: 'Skill value',
    tone: 'value',
    formula: 'Professional know-how used to build and position the system',
    amount: 0,
    note: 'Not counted as direct cash cost here because there is no fixed receipt. It should be explained as value contributed, not hidden cost.'
  }
];

export interface BillRow {
  item: string;
  formula: string;
  amount: number;
  note: string;
}

export const billRows: BillRow[] = [
  {
    item: 'Domain / 12',
    formula: `${formatCurrency(DOMAIN_YEARLY_COST)} / 12 months`,
    amount: domainMonthlyCost,
    note: 'Spread the yearly domain cost into a monthly bill.'
  },
  {
    item: 'Server per month',
    formula: `USD ${SERVER_USD_MONTHLY} x ${USD_TO_MYR.toFixed(3)} USD/MYR`,
    amount: serverMonthlyCost,
    note: 'Monthly hosting/server cost before any extra bank FX fee.'
  },
  {
    item: 'Founder / builder time',
    formula: `${MONTHLY_BILL_SUPPORT_DAYS} days x ${formatCurrency(dailyRate)} per day`,
    amount: monthlyBillFounderCost,
    note: 'One month support/maintenance time allocation.'
  }
];

export const skillValueItems: Array<[string, string]> = [
  ['AI skill', 'Prompting, workflow design, AI-assisted automation, model selection, and cost control.'],
  ['Marketing skill', 'Lead source thinking, tracking, WhatsApp message flow, and conversion visibility.'],
  ['Sales skill', 'Follow-up process, approval workflow, customer transparency, and staff accountability.'],
  ['Data analytic skill', 'Dashboard metrics, raw lead matching, status reporting, and decision-ready summaries.']
];

export const suggestedRows: Array<[string, string]> = [
  ['AppleCare / accessories', 'Optional but practical if the machine is used as production equipment.'],
  ['Maintenance support', 'Bug fixes, small feature changes, Firebase/server checks, backup review, and monthly health check.'],
  ['AI/API overage buffer', 'Keep a monthly buffer when usage grows, especially for automation, OCR, image, or heavy analysis.'],
  ['Software subscriptions', 'Design tools, database tools, monitoring, email hosting, storage, analytics, or paid libraries.'],
  ['Security and backup', 'Domain privacy, WAF/CDN, backup storage, uptime monitor, and recovery testing.'],
  ['Admin and communication', 'Meetings, documentation, handover, training, accounting, and payment/platform fees.']
];

// ---------------------------------------------------------------------------
// Friend Offer (the actual deal shown to the buyer)
// Structure: full market value -> itemised waivers with real reasons -> final
// price. Setup fee is fully waived; buyer only pays the monthly fee.
// ---------------------------------------------------------------------------

// Module-based build valuation (reviewed against the actual codebase on
// 2026-07-05: 30 components, ~31k lines). 10+ core modules — customer/loan
// management, approval workflow, commission engine, analytics dashboard,
// notification center, roles/permissions, audit log, WhatsApp tracking,
// raw leads + follow up, calendar — at RM800–1,500/module outsourcing rate.
export const BUILD_VALUE = 12000;
export const MARKET_MONTHLY_RETAINER = 3000; // Market reference for maintenance retainer (estimate)
export const FRIEND_SETUP_FEE = 0;
export const FRIEND_MONTHLY_FEE = 1888;

export const setupValueTotal = BUILD_VALUE + MACBOOK_COST;
export const setupSavings = setupValueTotal - FRIEND_SETUP_FEE;
export const monthlySavingsVsMarket = MARKET_MONTHLY_RETAINER - FRIEND_MONTHLY_FEE;

// Buyer-facing monthly breakdown: hard cost (server + domain) + service income.
// The service income is openly shown as profit and maps to the support
// services below (maintenance, offline face-to-face, system design, etc).
export const hardMonthlyCost = serverMonthlyCost + domainMonthlyCost;
export const friendMonthlyProfit = FRIEND_MONTHLY_FEE - hardMonthlyCost;

// Cooperation terms confirmed by owner: no lock-in, RM200 per new feature,
// data belongs to the client. The Data Export center (Tools > 数据导出) backs
// the export promise — every table downloads as CSV.
export const NEW_FEATURE_PRICE = 200;

export const cooperationTerms: Array<{ zh: string; en: string; ms: string }> = [
  { zh: '月费不锁约，随时可以停', en: 'No lock-in — stop the monthly plan anytime', ms: 'Tiada kontrak terikat — hentikan pelan bulanan pada bila-bila masa' },
  { zh: `以后要加新功能：RM${NEW_FEATURE_PRICE}/个，先报价后动工`, en: `New features: RM${NEW_FEATURE_PRICE} each, quoted before work starts`, ms: `Ciri baharu: RM${NEW_FEATURE_PRICE} setiap satu, sebut harga diberi sebelum kerja bermula` },
  { zh: '数据 100% 属于你，全部表格随时导出 CSV', en: 'All data is 100% yours — every table exports to CSV anytime', ms: 'Semua data 100% milik anda — setiap jadual boleh dieksport ke CSV pada bila-bila masa' }
];

export const supportServices: Array<{ zh: string; en: string; ms: string }> = [
  { zh: '日常维护与 bug 修复', en: 'Day-to-day maintenance and bug fixes', ms: 'Penyelenggaraan harian dan pembaikan pepijat' },
  { zh: 'Offline face-to-face 会面与培训', en: 'Offline face-to-face meetings and training', ms: 'Mesyuarat bersemuka dan latihan secara fizikal' },
  { zh: '系统设计与新功能规划', en: 'System design and new feature planning', ms: 'Reka bentuk sistem dan perancangan ciri baharu' },
  { zh: 'WhatsApp / 电话即时支持', en: 'WhatsApp / phone support', ms: 'Sokongan segera melalui WhatsApp / telefon' }
];

export interface OfferLine {
  item: string;
  value: number | null; // null = priceless / not priced
  charged: number;
  reasonZh: string;
  reasonEn: string;
}

export const offerLines: OfferLine[] = [
  {
    item: 'System build + know-how (14 days, 10+ modules)',
    value: BUILD_VALUE,
    charged: 0,
    reasonZh: '按实际功能模块估价：客户/贷款管理、审批流、佣金结算、分析报表、通知中心、角色权限、审计记录、WhatsApp 追踪等 10+ 模块 × 外包行情 RM800–1,500/模块。营销、销售、数据分析 know-how 已含在内。朋友价全免。',
    reasonEn: 'Valued by actual modules: customer/loan management, approval workflow, commission engine, analytics, notifications, roles, audit log, WhatsApp tracking — 10+ modules x RM800–1,500/module outsourcing rate. Marketing, sales, and data analytics know-how included. Fully waived.'
  },
  {
    item: 'MacBook Pro development hardware',
    value: MACBOOK_COST,
    charged: 0,
    reasonZh: '当作我自己的长期设备，一分钱不算进你的账。',
    reasonEn: 'Treated as my own long-term equipment. Not charged to you at all.'
  }
];

// ---------------------------------------------------------------------------
// Friend Plan page content (buyer-facing). Module list mirrors the real app.
// ---------------------------------------------------------------------------

export interface ModuleItem {
  key: string; // icon key resolved in the component
  nameZh: string;
  nameEn: string;
  nameMs: string;
  descZh: string;
  descEn: string;
  descMs: string;
}

export const moduleShowcase: ModuleItem[] = [
  { key: 'customers', nameZh: '客户与贷款管理', nameEn: 'Customer & Loan Management', nameMs: 'Pengurusan Pelanggan & Pinjaman', descZh: '全部客户资料和贷款进度一目了然。', descEn: 'All customer records and loan progress in one view.', descMs: 'Semua rekod pelanggan dan kemajuan pinjaman dalam satu paparan.' },
  { key: 'leads', nameZh: '潜在名单与跟进', nameEn: 'Leads & Follow Up', nameMs: 'Prospek & Susulan', descZh: '名单不流失，每次跟进都有记录。', descEn: 'No lead gets lost; every follow-up is recorded.', descMs: 'Tiada prospek tercicir; setiap susulan direkodkan.' },
  { key: 'approval', nameZh: '审批流程', nameEn: 'Approval Workflow', nameMs: 'Aliran Kerja Kelulusan', descZh: '状态改动和佣金发放都经过审批。', descEn: 'Status changes and payouts go through approval.', descMs: 'Perubahan status dan bayaran melalui proses kelulusan.' },
  { key: 'commission', nameZh: '佣金与奖励', nameEn: 'Commission & Rewards', nameMs: 'Komisen & Ganjaran', descZh: '自动算佣金、排行榜和战队奖励。', descEn: 'Auto commission, leaderboard, and team battle rewards.', descMs: 'Komisen, papan pendahulu dan ganjaran pasukan dikira secara automatik.' },
  { key: 'analytics', nameZh: '数据分析', nameEn: 'Analytics Dashboard', nameMs: 'Papan Pemuka Analitik', descZh: '业绩、来源、转化率随时看。', descEn: 'Performance, sources, and conversion at a glance.', descMs: 'Lihat prestasi, sumber dan penukaran sepintas lalu.' },
  { key: 'notifications', nameZh: '通知中心', nameEn: 'Notification Center', nameMs: 'Pusat Pemberitahuan', descZh: '到期、跟进、审批提醒不漏。', descEn: 'Due dates, follow-ups, and approvals never missed.', descMs: 'Tarikh akhir, susulan dan peringatan kelulusan tidak terlepas.' },
  { key: 'roles', nameZh: '角色与权限', nameEn: 'Roles & Permissions', nameMs: 'Peranan & Kebenaran', descZh: 'Sales、Admin、老板各看各的。', descEn: 'Sales, Admin, and owner each see their own view.', descMs: 'Jualan, Admin dan pemilik melihat paparan masing-masing.' },
  { key: 'audit', nameZh: '审计记录', nameEn: 'Audit Log', nameMs: 'Log Audit', descZh: '谁改了什么，全部有记录。', descEn: 'Every change is tracked with who and when.', descMs: 'Setiap perubahan direkodkan bersama siapa dan bila.' },
  { key: 'whatsapp', nameZh: 'WhatsApp 追踪', nameEn: 'WhatsApp Tracking', nameMs: 'Penjejakan WhatsApp', descZh: '消息模板与响应速度追踪。', descEn: 'Message templates and response tracking.', descMs: 'Templat mesej dan masa respons dijejaki.' },
  { key: 'mobile', nameZh: '手机模式与日历', nameEn: 'Mobile View & Calendar', nameMs: 'Paparan Mudah Alih & Kalendar', descZh: '外勤用手机照样跑整套流程。', descEn: 'Run the whole flow from a phone in the field.', descMs: 'Jalankan keseluruhan aliran kerja melalui telefon semasa di luar.' }
];

export interface IncludeItem {
  zh: string;
  en: string;
  ms: string;
}

export const monthlyIncludes: IncludeItem[] = [
  { zh: '云端服务器与数据备份全年运行', en: 'Cloud server and data backup running all year', ms: 'Pelayan awan dan sandaran data berjalan sepanjang tahun' },
  { zh: '专属域名', en: 'Your own domain', ms: 'Domain anda sendiri' },
  { zh: '日常维护与 bug 修复', en: 'Day-to-day maintenance and bug fixes', ms: 'Penyelenggaraan harian dan pembaikan pepijat' },
  { zh: 'Offline face-to-face 会面与培训', en: 'Offline face-to-face meetings and training', ms: 'Mesyuarat bersemuka dan latihan secara fizikal' },
  { zh: '系统设计与新功能规划', en: 'System design and new feature planning', ms: 'Reka bentuk sistem dan perancangan ciri baharu' },
  { zh: 'WhatsApp / 电话即时支持', en: 'WhatsApp / phone support', ms: 'Sokongan segera melalui WhatsApp / telefon' }
];

export const referenceNotes: Array<[string, string, string]> = [
  [
    'MacBook purchase reference',
    'RM16,974 is the recorded M4 Max 64GB/1TB market reference at purchase time. Keep it as the hardware cost unless the machine is replaced.',
    'https://my.priceshop.com/product/apple-macbook-pro-14-m4-max-chip-64gb-1tb'
  ],
  [
    'Current 2026 lineup',
    'MacBook Pro 14 M5 Max (March 2026): RM14,999 for 36GB/2TB up to RM20,524 for 64GB/4TB. M4 Max is no longer sold new.',
    'https://soyacincau.com/2026/03/04/apple-macbook-pro-m5-pro-max-2026-malaysia-price-specs/'
  ],
  [
    'Apple config check',
    'Apple Support confirms the 14-inch M4 Max model can be configured to 64GB unified memory.',
    'https://support.apple.com/en-my/121553'
  ],
  [
    'FX reference',
    `USD/MYR checked at about ${USD_TO_MYR.toFixed(3)} (${RATES_CHECKED_ON}), so USD ${SERVER_USD_MONTHLY} server is budgeted as ${formatCurrency(serverMonthlyCost)} monthly.`,
    'https://www.bnm.gov.my/usd/myr-interbank-intraday-rate'
  ]
];
