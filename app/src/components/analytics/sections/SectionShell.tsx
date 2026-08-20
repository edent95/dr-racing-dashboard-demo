/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, BarChart3, ChevronDown, Layers3, PieChart } from 'lucide-react';
import { tr, trAnalyticsLabel } from '../../../lib/i18n';

const ANALYTICS_ZH: Record<string, string> = {
  'Top Sale': '本月热销', 'Top Model': '库存最多车型', 'Approval Rate': '批核率', 'Approved Units': '批核台数',
  'Top Reject CODE': '最多拒贷代码', 'Missing Reject CODE': '缺失拒贷代码', 'Vehicle Units': '车辆台数',
  'Best Mix Share': '最高占比', 'Vehicle Brands': '品牌数', 'Total Units': '总台数', 'Approved Sales': '批核成交', 'Approved Loans': '贷款批核',
  'Top Segment': '最高分组', 'NRIC Parsed': 'IC 解析数', 'Top Age Group': '主力年龄段', 'Top Birthplace': '主力出生地',
  'Filtered Applications': '筛选后申请', Breakdown: '维度', 'Vehicle Filter': '车型筛选', Customers: '客户数',
  'Top Result': '最高结果', 'Raw Leads': '名单总数', 'Already Applied': '已申请', 'Potential Leads': '潜在客户',
  'Unique Phones': '不重复号码', 'Dup Phones': '重复号码', Rows: '行数', Share: '占比',
  'WhatsApp Clicks': 'WhatsApp 点击', 'UTM Campaigns': 'UTM 活动', 'Active Links': '启用链接', 'Sales Sources': '引流员工',
  'REJECT CODE Rows': '拒贷代码行数', 'Rejected Loans': '拒贷数', 'REJECT CODE Distribution': '拒贷代码分布',
  Units: '台数', units: '台数', Approved: '已批核', Clicks: '点击', Leads: '名单', records: '记录', accounts: '账号',
  View: '视图', Details: '明细', Compare: '对比', Delta: '差异', Quantity: '数量', 'A-Z': 'A-Z',
  Campaign: '活动', Source: '来源', Medium: '媒介', Sales: '销售', Link: '链接', Primary: '主时段',
  Channel: '渠道', Status: '状态', 'Source Traffic': '来源流量', 'Loan Status': '贷款状态',
  'Staff Workload': '员工工作量', 'Role Accounts': '角色账号', Model: '车型', Brand: '品牌',
  All: '全部', New: '新车', Used: '二手', 'Not set': '未填写', Loan: '贷款', Cash: '现金',
  Vehicle: '车辆', 'New / Used': '新车 / 二手', 'Loan / Cash': '贷款 / 现金',
  'Start date': '开始日期', 'End date': '结束日期', 'Primary Start': '主时段开始', 'Primary End': '主时段结束',
  'Secondary Start': '对比时段开始', 'Secondary End': '对比时段结束', 'Profile Signal': '画像信号',
  'Approved loan records counted by unique plate': '按唯一车牌统计的批核贷款',
  'Rejected loans without final CODE': '没有填写最终代码的拒贷',
  'Brand demand in selected timeframe': '所选时间段的品牌需求',
  'Matched to Customers by phone, IC, account, or email': '按电话 / IC / 账号 / Email 匹配到客户',
  'No matching customer application yet': '还没有匹配的贷款申请',
  'Raw lead phone numbers after normalisation': '归一化后的名单电话号码',
  'Phone numbers appearing more than once': '出现超过一次的号码',
  'Sales staff with tracked clicks': '有追踪点击的销售',
  'Final failed loan CODE grouped by selected timeframe': '按所选时间段统计的最终拒贷代码'
};

export const tra = (label?: string) => {
  const text = label ?? '';
  return trAnalyticsLabel(ANALYTICS_ZH[text] || text, text);
};

function getStatTitleBadgeClass(title: string, primary = false) {
  const normalized = title.toLowerCase();

  if (/(reject|rejected|missing|dup|error)/.test(normalized)) {
    return 'bg-rose-50 text-rose-700';
  }

  if (/(approved|approval|success|active|parsed|unique)/.test(normalized)) {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (/(pending|warning|top|best|potential)/.test(normalized)) {
    return 'bg-amber-50 text-amber-700';
  }

  if (primary) {
    return 'bg-red-50 text-red-700';
  }

  return 'bg-slate-100 text-slate-600';
}

export type StatComparison = {
  primaryLabel: string;
  secondaryLabel: string;
  secondaryValue: string | number;
  delta?: number;
  suffix?: string;
  inverse?: boolean;
};

export type AnalyticsChartMode = 'bar' | 'donut' | 'combo' | 'trend';

type AnalyticsChartPreferenceContextValue = {
  modes: Record<string, AnalyticsChartMode>;
  onChange: (sectionId: string, mode: AnalyticsChartMode) => void;
  lockedOpen?: boolean;
  forcedMode?: AnalyticsChartMode;
};

const AnalyticsChartPreferenceContext = React.createContext<AnalyticsChartPreferenceContextValue | null>(null);

const ANALYTICS_CHART_OPTIONS: Array<{
  value: AnalyticsChartMode;
  zh: string;
  en: string;
  ms: string;
  icon: React.ReactNode;
}> = [
  { value: 'bar', zh: '条形', en: 'Bar', ms: 'Bar', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { value: 'donut', zh: '环形', en: 'Donut', ms: 'Donut', icon: <PieChart className="h-3.5 w-3.5" /> },
  { value: 'combo', zh: '组合', en: 'Combo', ms: 'Gabungan', icon: <Layers3 className="h-3.5 w-3.5" /> },
  { value: 'trend', zh: '趋势', en: 'Trend', ms: 'Trend', icon: <Activity className="h-3.5 w-3.5" /> }
];

export function AnalyticsChartPreferenceProvider({
  modes,
  onChange,
  lockedOpen = false,
  forcedMode,
  children
}: AnalyticsChartPreferenceContextValue & { children: React.ReactNode }) {
  return (
    <AnalyticsChartPreferenceContext.Provider value={{ modes, onChange, lockedOpen, forcedMode }}>
      {children}
    </AnalyticsChartPreferenceContext.Provider>
  );
}

function AnalyticsChartPicker({ sectionId }: { sectionId: string }) {
  const preferences = React.useContext(AnalyticsChartPreferenceContext);

  if (!preferences) return null;

  const activeMode = preferences.forcedMode || preferences.modes[sectionId] || 'bar';

  return (
    <div
      className="flex items-center gap-1 rounded-xl bg-slate-100 p-1"
      role="group"
      aria-label={tr('图表类型', 'Chart type', 'Jenis carta')}
    >
      {ANALYTICS_CHART_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => preferences.onChange(sectionId, option.value)}
          disabled={Boolean(preferences.forcedMode && option.value !== preferences.forcedMode)}
          aria-pressed={activeMode === option.value}
          aria-label={tr(option.zh, option.en, option.ms)}
          title={preferences.forcedMode && option.value !== preferences.forcedMode
            ? tr('月度视图固定使用趋势明细', 'Monthly view uses monthly trend detail', 'Paparan bulanan menggunakan butiran trend bulanan')
            : tr(option.zh, option.en, option.ms)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
            activeMode === option.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-500'
          }`}
        >
          {option.icon}
          <span className="hidden 2xl:inline">{tr(option.zh, option.en, option.ms)}</span>
        </button>
      ))}
    </div>
  );
}

function formatCompareValue(value: string | number, suffix = '') {
  return typeof value === 'number' ? `${value}${suffix}` : value;
}

export function CompareDeltaBadge({
  delta,
  suffix = '',
  inverse = false
}: {
  delta?: number;
  suffix?: string;
  inverse?: boolean;
}) {
  if (typeof delta !== 'number') {
    return null;
  }

  const isFlat = delta === 0;
  const isPositive = inverse ? delta < 0 : delta > 0;
  const deltaLabel = `${delta > 0 ? '+' : ''}${delta}${suffix}`;

  return (
    <span className={`shrink-0 rounded-full px-2 py-1 font-mono text-[10px] font-bold ${
      isFlat
        ? 'bg-slate-100 text-slate-500'
        : isPositive
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-rose-50 text-rose-700'
    }`}>
      {tra('Delta')} {deltaLabel}
    </span>
  );
}

export function AnalyticsSection({
  id,
  title,
  subtitle,
  icon,
  isOpen,
  onToggle,
  children
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const preferences = React.useContext(AnalyticsChartPreferenceContext);
  const lockedOpen = Boolean(preferences?.lockedOpen);

  return (
    <section id={`analytics-section-${id}`} className="scroll-mt-28 overflow-hidden rounded-2xl bg-white/90 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold text-slate-900">{title}</span>
            <span className="block text-[11px] text-slate-400">{subtitle}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2 pl-14 lg:pl-0">
          {isOpen && <AnalyticsChartPicker sectionId={id} />}
          {!lockedOpen && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={isOpen ? tr('收起分析', 'Collapse analysis', 'Tutup analisis') : tr('展开分析', 'Expand analysis', 'Kembangkan analisis')}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {isOpen && <div className="space-y-5 p-5">{children}</div>}
    </section>
  );
}

export function StatTile({
  title,
  value,
  subtitle,
  icon,
  tone,
  valueClassName = 'text-xl',
  comparison,
  badge,
  primary = false
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  tone: string;
  valueClassName?: string;
  comparison?: StatComparison;
  badge?: React.ReactNode;
  // 帕累托层级:板块主指标高亮(细描边),其余保持扁平。
  primary?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${primary ? 'bg-white ring-1 ring-indigo-100' : 'bg-white/70'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className={`inline-flex max-w-full items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatTitleBadgeClass(title, primary)}`}>{tra(title)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className={`${valueClassName} font-bold tracking-tight text-slate-900 tabular-nums`}>{value}</p>
            {badge}
          </div>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{tra(subtitle)}</p>
      {comparison && (
        <div className="mt-4 rounded-xl bg-slate-50 p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra('Compare')}</p>
            <CompareDeltaBadge delta={comparison.delta} suffix={comparison.suffix} inverse={comparison.inverse} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0 rounded-lg bg-white px-2.5 py-2">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{comparison.primaryLabel}</p>
              <p className="mt-1 truncate font-mono text-sm font-bold text-slate-900">{formatCompareValue(value, comparison.suffix)}</p>
            </div>
            <div className="min-w-0 rounded-lg bg-white px-2.5 py-2">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{comparison.secondaryLabel}</p>
              <p className="mt-1 truncate font-mono text-sm font-bold text-slate-600">{formatCompareValue(comparison.secondaryValue, comparison.suffix)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AssetIcon({ src, className = 'h-11 w-11' }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden="true" className={`${className} object-contain`} />;
}

// 样本量诚实原则:分母 < SMALL_SAMPLE_THRESHOLD 时,百分比 / Top N 不具代表性。
export const SMALL_SAMPLE_THRESHOLD = 5;

export function isSmallSample(total?: number, threshold = SMALL_SAMPLE_THRESHOLD) {
  return typeof total === 'number' && total > 0 && total < threshold;
}

// 样本过小徽标:数据上量后自动消失(total >= threshold 或为 0 时不渲染)。
export function SampleBadge({ total, threshold = SMALL_SAMPLE_THRESHOLD }: { total?: number; threshold?: number }) {
  if (!isSmallSample(total, threshold)) {
    return null;
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500">
      {tr('样本小', 'Small sample', "Sampel kecil")} n={total}
    </span>
  );
}

export type MetaBarItem = {
  label: string;
  value: React.ReactNode;
  // 小样本时隐藏(如占比 / Top N 这类满值强调),避免误导。
  hideOnSmallSample?: boolean;
};

// 把原本重复的「维度 / 行数 / 最高结果 / 占比」四张卡压成一行图表标题栏,
// 并在小样本时挂出诚实徽标、隐藏占比强调。
export function MetaBar({
  items,
  sample,
  threshold = SMALL_SAMPLE_THRESHOLD
}: {
  items: MetaBarItem[];
  sample?: number;
  threshold?: number;
}) {
  const small = isSmallSample(sample, threshold);
  const visibleItems = items.filter((item) => !(item.hideOnSmallSample && small));

  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-slate-50 px-4 py-2.5">
      {visibleItems.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 && <span className="text-slate-300" aria-hidden="true">·</span>}
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra(item.label)}</span>
          <span className="max-w-[12rem] truncate font-mono text-xs font-bold text-slate-800">{item.value}</span>
        </span>
      ))}
      {typeof sample === 'number' && (
        <span className="ml-auto">
          <SampleBadge total={sample} threshold={threshold} />
        </span>
      )}
    </div>
  );
}

// 空态折叠:0 条数据时收敛成一行(≈48px),不再占满整块高度。
export function EmptyChartRow({ text }: { text?: string }) {
  return (
    <div className="flex h-12 items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 text-xs font-medium text-slate-400">
      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
      {text ?? tr('本周暂无数据', 'No data this period', "Tiada data tempoh ini")}
    </div>
  );
}

export function MetricSummaryTile({
  title,
  value,
  comparison,
  valueClassName = 'font-mono text-2xl'
}: {
  title: string;
  value: string | number;
  comparison?: StatComparison;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra(title)}</p>
        {comparison && <CompareDeltaBadge delta={comparison.delta} suffix={comparison.suffix} inverse={comparison.inverse} />}
      </div>
      <p className={`mt-1 truncate ${valueClassName} font-bold text-slate-900`}>{formatCompareValue(value, comparison?.suffix)}</p>
      {comparison && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="min-w-0 rounded-lg bg-white px-2.5 py-2">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{comparison.primaryLabel}</p>
            <p className="mt-1 truncate font-mono text-xs font-bold text-slate-900">{formatCompareValue(value, comparison.suffix)}</p>
          </div>
          <div className="min-w-0 rounded-lg bg-white px-2.5 py-2">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{comparison.secondaryLabel}</p>
            <p className="mt-1 truncate font-mono text-xs font-bold text-slate-600">{formatCompareValue(comparison.secondaryValue, comparison.suffix)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CompareSummaryTile({
  title,
  primaryValue,
  secondaryValue,
  primaryLabel,
  secondaryLabel,
  suffix = '',
  inverse = false
}: {
  title: string;
  primaryValue: string | number;
  secondaryValue: string | number;
  primaryLabel: string;
  secondaryLabel: string;
  suffix?: string;
  inverse?: boolean;
}) {
  const delta = typeof primaryValue === 'number' && typeof secondaryValue === 'number'
    ? primaryValue - secondaryValue
    : undefined;

  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{tra(title)}</p>
        <CompareDeltaBadge delta={delta} suffix={suffix} inverse={inverse} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-lg bg-white px-3 py-2">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{primaryLabel}</p>
          <p className="mt-1 truncate font-mono text-sm font-bold text-slate-900">{formatCompareValue(primaryValue, suffix)}</p>
        </div>
        <div className="min-w-0 rounded-lg bg-white px-3 py-2">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{secondaryLabel}</p>
          <p className="mt-1 truncate font-mono text-sm font-bold text-slate-600">{formatCompareValue(secondaryValue, suffix)}</p>
        </div>
      </div>
    </div>
  );
}
