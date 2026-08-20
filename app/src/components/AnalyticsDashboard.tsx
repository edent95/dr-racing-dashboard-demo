/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CalendarDays, Download, PieChart, Search, X } from 'lucide-react';
import { AuditLogEntry, CalendarNote, ErrorCodeDefinition, LoanApplication, LoanStatus, NotificationItem, RawCustomerLead, RoleAccount, TagNormalizationRule, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import { getAppLocale, tr, trAnalyticsLabel, trLoanStatus } from '../lib/i18n';
import { getApplicationRejectCodes, getPrimaryRejectCode } from '../utils/rejectCodes';
import { AnalyticsChartPreferenceProvider, AssetIcon, EmptyChartRow, type AnalyticsChartMode } from './analytics/sections/SectionShell';
import VehicleDemandSection from './analytics/sections/VehicleDemandSection';
import VehicleStatusRelationshipCard, { type VehicleStatusRelationshipData } from './analytics/VehicleStatusRelationshipCard';
import RawCustomerSection from './analytics/sections/RawCustomerSection';
import MarketingSection from './analytics/sections/MarketingSection';
import CustomerProfileSection from './analytics/sections/CustomerProfileSection';
import OperationsSection from './analytics/sections/OperationsSection';
import { buildApplicationMatchIndex, hasMatchingApplication } from '../utils/analyticsMatching';
import { normalizeMalaysiaPhoneDigits as normalizePhoneDigits } from '../utils/malaysiaPhone';
import { downloadCsvFromRows, type CsvCell } from '../utils/csvExport';
import {
  buildCompletedTaskEvents,
  type CompletedTaskCategory,
  type CompletedTaskEvent
} from '../utils/taskCompletionAnalytics';
import approvalOverviewIcon from '../assets/icons/nav/approvalOverview.png';
import approvedIcon from '../assets/icons/nav/approved.png';
import totalLeadsIcon from '../assets/icons/nav/totalLeads.png';
import whatsappContactIcon from '../assets/icons/nav/whatsappContact.png';
import analyticsIcon from '../assets/icons/nav/analytics.png';
import vehicleInfoIcon from '../assets/icons/nav/vehicleInfo.png';
import customersIcon from '../assets/icons/nav/customers.png';
import auditIcon from '../assets/icons/nav/audit.png';
import rawCustomersIcon from '../assets/icons/nav/rawCustomers.png';

// 中文模式下的显示词典：key 保持英文（数据/排序键不变），只翻显示。
const ANALYTICS_ZH: Record<string, string> = {
  'Top Sale': '本月热销', 'Top Model': '库存最多车型', 'Approval Rate': '批核率', 'Approved Units': '批核台数',
  'Top Reject CODE': '最多拒贷代码', 'Missing Reject CODE': '缺失拒贷代码', 'Vehicle Units': '车辆台数',
  'Best Mix Share': '最高占比', 'Vehicle Brands': '品牌数', 'Total Units': '总台数', 'Approved Sales': '批核成交',
  'Top Segment': '最高分组', 'NRIC Parsed': 'IC 解析数', 'Top Age Group': '主力年龄段', 'Top Birthplace': '主力出生地',
  'Filtered Applications': '筛选后申请', Breakdown: '维度', 'Vehicle Filter': '车型筛选', Customers: '客户数',
  'Top Result': '最高结果', 'Raw Leads': '名单总数', 'Already Applied': '已申请', 'Potential Leads': '潜在客户',
  'Unique Phones': '不重复号码', 'Dup Phones': '重复号码', Rows: '行数', Share: '占比',
  'WhatsApp Clicks': 'WhatsApp 点击', 'UTM Campaigns': 'UTM 活动', 'Active Links': '启用链接', 'Sales Sources': '引流员工',
  'REJECT CODE Rows': '拒贷代码行数', 'Rejected Loans': '拒贷数', 'REJECT CODE Distribution': '拒贷代码分布',
  Units: '台数', Approved: '已批核', Clicks: '点击', Leads: '名单', records: '记录', accounts: '账号',
  View: '视图', Details: '明细', 'Profile Signal': '画像信号',
  'Approved loan records counted by unique plate': '按唯一车牌统计的批核贷款',
  'Rejected loans without final CODE': '没有填写最终代码的拒贷',
  'Brand demand in selected timeframe': '所选时间段的品牌需求',
  'Matched to Customers by phone, IC, account, or email': '按电话 / IC / 账号 / Email 匹配到客户',
  'No matching customer application yet': '还没有匹配的贷款申请',
  'Raw lead phone numbers after normalisation': '归一化后的名单电话号码',
  'Phone numbers appearing more than once': '出现超过一次的号码',
  'Sales staff with tracked clicks': '有追踪点击的销售',
  'Final failed loan CODE grouped by selected timeframe': '按所选时间段统计的最终拒贷代码',
  Today: '今天', Yesterday: '昨天', 'Last 7 days': '近 7 天',
  'This week': '本周', 'Last week': '上周', 'This month': '本月', 'Last month': '上月',
  'Last 30 days': '近 30 天', 'Monthly view': '月度视图', 'This year': '今年', 'All time': '全部时间', Custom: '自定义',
  'No compare': '不对比', 'Today vs Yesterday': '今天 vs 昨天', 'This week vs Last week': '本周 vs 上周', 'This month vs Last month': '本月 vs 上月',
  'Last 12 months vs Previous 12 months': '近 12 个月 vs 前 12 个月',
  'Custom vs Custom': '自定义对比',
  Bar: '条形', Donut: '环形', Combo: '组合', Trend: '趋势',
  'Age Group': '年龄段', Birthplace: '出生地', Gender: '性别',
  Campaign: '活动', Source: '来源', Medium: '媒介', Sales: '销售', Link: '链接',
  'Loan Status': '贷款状态', 'Staff Workload': '员工工作量', 'Role Accounts': '角色账号',
  Channel: '渠道', Status: '状态', 'Source Traffic': '来源流量', Model: '车型', Brand: '品牌',
  All: '全部', New: '新车', Used: '二手', 'Not set': '未设置', Loan: '贷款', Cash: '现金',
  'New / Used': '新车 / 二手', 'Loan / Cash': '贷款 / 现金', 'All Cards': '全部卡片',
  'Start date': '开始日期', 'End date': '结束日期',
  'Primary Start': '主时段开始', 'Primary End': '主时段结束', 'Compare Start': '对比开始', 'Compare End': '对比结束'
};

const tra = (label?: string) => {
  const text = label ?? '';
  return trAnalyticsLabel(ANALYTICS_ZH[text] || text, text);
};

interface AnalyticsDashboardProps {
  applications: LoanApplication[];
  rawCustomerLeads: RawCustomerLead[];
  errorCodeDefinitions: ErrorCodeDefinition[];
  roleAccounts: RoleAccount[];
  auditLogs: AuditLogEntry[];
  calendarNotes: CalendarNote[];
  notifications: NotificationItem[];
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
  whatsAppTrackingClicks: WhatsAppTrackingClick[];
  tagNormalizationRules: TagNormalizationRule[];
  canExportData?: boolean;
  scopeLabel?: string;
}

type AggregateRow = {
  key: string;
  label: string;
  value: number;
  percentage: number;
};

type VehicleStockRow = AggregateRow & {
  brand: string;
  approvedUnits: number;
};

type RejectedCodeRow = AggregateRow & {
  issue: string;
  customerRequest: string;
};

type MarketingSortKey = 'label' | 'value' | 'percentage';
type ApplicationTableSortKey = 'submitted_at' | 'applicant_name' | 'handler_name' | 'status' | 'vehicle_model';
type ReportMode = 'daily' | 'weekly' | 'overall';
type TimeframeKey = 'all' | 'today' | 'yesterday' | 'last_7_days' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'last_30_days' | 'monthly' | 'this_year' | 'custom';
type ComparePresetKey = 'none' | 'today_vs_yesterday' | 'this_week_vs_last_week' | 'this_month_vs_last_month' | 'monthly_vs_previous' | 'custom';
type AnalyticsVisualMode = AnalyticsChartMode;
type AnalyticsDetailTab = 'marketing' | 'vehicle' | 'customer' | 'operations' | 'rawCustomer';
type CustomerProfileBreakdown = 'ageGroup' | 'birthplace' | 'gender';
type CustomerProfileSortKey = 'label' | 'value' | 'percentage';
type CustomerVehicleFilterSort = 'name' | 'quantity';
type MarketingBreakdown = 'campaign' | 'source' | 'medium' | 'sales' | 'link';
type OperationsBreakdown = 'status' | 'staff' | 'role';
type OperationsSortKey = 'label' | 'value' | 'percentage';
type RawCustomerBreakdown = 'channel' | 'status' | 'sourceTraffic';
type RawCustomerSortKey = 'label' | 'value' | 'percentage';
type VehicleDemandBreakdown = 'model' | 'brand';
type VehicleConditionFilter = 'all' | 'New' | 'Used' | 'not_set';
type PurchaseMethodFilter = 'all' | 'Loan' | 'Cash' | 'not_set';
type VehicleDemandSortKey = 'label' | 'value' | 'approvedUnits' | 'approvalRate' | 'percentage';
type VehicleDemandVisualMode = AnalyticsVisualMode;

interface NricProfile {
  ic: string;
  birthDate: Date;
  age: number;
  ageGroup: string;
  birthPlaceCode: string;
  birthPlace: string;
  gender: 'Male' | 'Female';
}

interface DemographicMotorRow {
  key: string;
  label: string;
  applications: number;
  approved: number;
  topModel: string;
  topModelCount: number;
  averageAge?: number;
}

type VehicleDemandRow = AggregateRow & {
  approvedUnits: number;
  approvalRate: number;
  meta: string;
};

type VehicleDemandTrendPoint = {
  key: string;
  label: string;
  value: number;
  approvedUnits: number;
};

type VehicleDemandTrendSeries = {
  key: string;
  label: string;
  points: VehicleDemandTrendPoint[];
};

type AggregateTrendPoint = {
  key: string;
  label: string;
  value: number;
};

type AggregateTrendSeries = {
  key: string;
  label: string;
  points: AggregateTrendPoint[];
};

type MarketingPerformanceRow = AggregateRow & {
  meta: string;
  salesName?: string;
  phoneNumber?: string;
  latest?: string;
};

type CustomerProfileRow = AggregateRow & {
  meta: string;
  approved?: number;
  topModel?: string;
  averageAge?: number;
};

type CustomerVehicleModelOption = {
  value: string;
  label: string;
  count: number;
};

type AnalyticsDateRange = {
  start?: Date;
  end?: Date;
  label: string;
};

type TrendPeriodOptions = {
  bucket: 'day' | 'week' | 'month';
  range?: Pick<AnalyticsDateRange, 'start' | 'end'>;
};

type ComparisonRanges = {
  primary: AnalyticsDateRange;
  secondary: AnalyticsDateRange;
  label: string;
};

type ComparisonSnapshot = {
  applications: number;
  approved: number;
  approvalRate: number;
  vehicleUnits: number;
  rawLeads: number;
  clicks: number;
};

type StatComparison = {
  primaryLabel: string;
  secondaryLabel: string;
  secondaryValue: string | number;
  delta?: number;
  suffix?: string;
  inverse?: boolean;
};

const TIMEFRAME_OPTIONS: { value: TimeframeKey; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'this_week', label: 'This week' },
  { value: 'last_week', label: 'Last week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'monthly', label: 'Monthly view' },
  { value: 'this_year', label: 'This year' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom' }
];

const REPORT_MODE_OPTIONS: Array<{ value: ReportMode; zh: string; en: string; ms: string }> = [
  { value: 'daily', zh: '每日', en: 'Daily', ms: 'Harian' },
  { value: 'weekly', zh: '每周', en: 'Weekly', ms: 'Mingguan' },
  { value: 'overall', zh: '整体', en: 'Overall', ms: 'Keseluruhan' }
];

const TIMEFRAME_BY_REPORT_MODE: Record<ReportMode, TimeframeKey[]> = {
  daily: ['today', 'yesterday', 'custom'],
  weekly: ['this_week', 'last_week', 'custom'],
  overall: ['last_7_days', 'last_30_days', 'this_month', 'last_month', 'monthly', 'this_year', 'all', 'custom']
};

const COMPARE_PRESET_OPTIONS: { value: ComparePresetKey; label: string }[] = [
  { value: 'none', label: 'No compare' },
  { value: 'today_vs_yesterday', label: 'Today vs Yesterday' },
  { value: 'this_week_vs_last_week', label: 'This week vs Last week' },
  { value: 'this_month_vs_last_month', label: 'This month vs Last month' },
  { value: 'monthly_vs_previous', label: 'Last 12 months vs Previous 12 months' },
  { value: 'custom', label: 'Custom vs Custom' }
];

const CUSTOMER_PROFILE_BREAKDOWN_OPTIONS: { value: CustomerProfileBreakdown; label: string }[] = [
  { value: 'ageGroup', label: 'Age Group' },
  { value: 'birthplace', label: 'Birthplace' },
  { value: 'gender', label: 'Gender' }
];

const MARKETING_BREAKDOWN_OPTIONS: { value: MarketingBreakdown; label: string }[] = [
  { value: 'campaign', label: 'Campaign' },
  { value: 'source', label: 'Source' },
  { value: 'medium', label: 'Medium' },
  { value: 'sales', label: 'Sales' },
  { value: 'link', label: 'Link' }
];

const OPERATIONS_BREAKDOWN_OPTIONS: { value: OperationsBreakdown; label: string }[] = [
  { value: 'status', label: 'Loan Status' },
  { value: 'staff', label: 'Staff Workload' },
  { value: 'role', label: 'Role Accounts' }
];

const RAW_CUSTOMER_BREAKDOWN_OPTIONS: { value: RawCustomerBreakdown; label: string }[] = [
  { value: 'channel', label: 'Channel' },
  { value: 'status', label: 'Status' },
  { value: 'sourceTraffic', label: 'Source Traffic' }
];

const VEHICLE_DEMAND_BREAKDOWN_OPTIONS: { value: VehicleDemandBreakdown; label: string }[] = [
  { value: 'model', label: 'Model' },
  { value: 'brand', label: 'Brand' }
];

const VEHICLE_CONDITION_FILTER_OPTIONS: { value: VehicleConditionFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'Used', label: 'Used' },
  { value: 'not_set', label: 'Not set' }
];

const PURCHASE_METHOD_FILTER_OPTIONS: { value: PurchaseMethodFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Cash', label: 'Cash' },
  { value: 'not_set', label: 'Not set' }
];

const VEHICLE_DEMAND_VISUAL_OPTIONS: { value: VehicleDemandVisualMode; label: string; icon: React.ReactNode }[] = [
  { value: 'bar', label: 'Bar', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { value: 'donut', label: 'Donut', icon: <PieChart className="h-3.5 w-3.5" /> },
  { value: 'combo', label: 'Combo', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { value: 'trend', label: 'Trend', icon: <Activity className="h-3.5 w-3.5" /> }
];

const NRIC_BIRTHPLACE_BY_CODE: Record<string, string> = {
  '00': 'Unknown',
  '01': 'Johor',
  '02': 'Kedah',
  '03': 'Kelantan',
  '04': 'Malacca',
  '05': 'Negeri Sembilan',
  '06': 'Pahang',
  '07': 'Penang',
  '08': 'Perak',
  '09': 'Perlis',
  '10': 'Selangor',
  '11': 'Terengganu',
  '12': 'Sabah',
  '13': 'Sarawak',
  '14': 'Federal Territory of Kuala Lumpur',
  '15': 'Federal Territory of Labuan',
  '16': 'Federal Territory of Putrajaya',
  '21': 'Johor',
  '22': 'Johor',
  '23': 'Johor',
  '24': 'Johor',
  '25': 'Kedah',
  '26': 'Kedah',
  '27': 'Kedah',
  '28': 'Kelantan',
  '29': 'Kelantan',
  '30': 'Malacca',
  '31': 'Negeri Sembilan',
  '32': 'Pahang',
  '33': 'Pahang',
  '34': 'Penang',
  '35': 'Penang',
  '36': 'Perak',
  '37': 'Perak',
  '38': 'Perak',
  '39': 'Perak',
  '40': 'Perlis',
  '41': 'Selangor',
  '42': 'Selangor',
  '43': 'Selangor',
  '44': 'Selangor',
  '45': 'Terengganu',
  '46': 'Terengganu',
  '47': 'Sabah',
  '48': 'Sabah',
  '49': 'Sabah',
  '50': 'Sarawak',
  '51': 'Sarawak',
  '52': 'Sarawak',
  '53': 'Sarawak',
  '54': 'Federal Territory of Kuala Lumpur',
  '55': 'Federal Territory of Kuala Lumpur',
  '56': 'Federal Territory of Kuala Lumpur',
  '57': 'Federal Territory of Kuala Lumpur',
  '58': 'Federal Territory of Labuan',
  '59': 'Negeri Sembilan',
  '60': 'Brunei',
  '61': 'Indonesia',
  '62': 'Cambodia / Democratic Kampuchea / Kampuchea',
  '63': 'Laos',
  '64': 'Myanmar',
  '65': 'Philippines',
  '66': 'Singapore',
  '67': 'Thailand',
  '68': 'Vietnam',
  '71': 'Born outside Malaysia before 2001',
  '72': 'Born outside Malaysia before 2001',
  '74': 'China',
  '75': 'India',
  '76': 'Pakistan',
  '77': 'Saudi Arabia',
  '78': 'Sri Lanka',
  '79': 'Bangladesh',
  '82': 'Unknown state',
  '83': 'Asia-Pacific',
  '84': 'South America',
  '85': 'Africa',
  '86': 'Western Europe',
  '87': 'Britain / Great Britain / Ireland',
  '88': 'Middle East',
  '89': 'Far East',
  '90': 'Caribbean',
  '91': 'North America',
  '92': 'Eastern Europe',
  '93': 'Other foreign country',
  '98': 'Stateless',
  '99': 'Unspecified Nationality'
};

const palette = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-slate-500'
];

const chartPalette = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#64748b'];

const staffPalette = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#06b6d4',
  '#8b5cf6',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
  '#64748b',
  '#0ea5e9',
  '#d946ef',
  '#22c55e',
  '#f97316'
];

function normalizeColorKey(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function getStableColorIndex(value: string, colorCount: number) {
  const normalizedValue = normalizeColorKey(value);
  let hash = 0;

  for (let index = 0; index < normalizedValue.length; index += 1) {
    hash = ((hash << 5) - hash + normalizedValue.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) % colorCount;
}

function getStaffColor(staffName: string, staffColorMap?: Map<string, string>) {
  const mappedColor = staffColorMap?.get(normalizeColorKey(staffName));

  if (mappedColor) {
    return mappedColor;
  }

  return staffPalette[getStableColorIndex(staffName || 'unknown staff', staffPalette.length)];
}

function aggregateBy<T>(items: T[], getKey: (item: T) => string, fallback = 'unknown'): AggregateRow[] {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item).trim() || fallback;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const total = items.length;

  return Object.entries(counts)
    .map(([key, value]) => ({
      key,
      label: key,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value);
}

function normalizeVehiclePlate(plate: string) {
  return plate.trim().replace(/\s+/g, ' ').toUpperCase();
}

function formatDateInputValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function buildDateRangeLabel(start?: Date, end?: Date) {
  if (!start && !end) {
    return 'All time';
  }

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endDisplay = end ? new Date(end.getTime()) : undefined;

  if (endDisplay) {
    endDisplay.setDate(endDisplay.getDate() - 1);
  }

  return `${start ? formatDate(start) : 'Start'} - ${endDisplay ? formatDate(endDisplay) : 'End'}`;
}

function normalizeAnalyticsDateRange(range: { start?: Date; end?: Date }, label: string): AnalyticsDateRange {
  return {
    ...range,
    label: label || buildDateRangeLabel(range.start, range.end)
  };
}

function getTimeframeInputValues(timeframe: TimeframeKey) {
  const range = getTimeframeRange(timeframe);
  const endDisplay = range.end ? new Date(range.end) : undefined;

  if (endDisplay) {
    endDisplay.setDate(endDisplay.getDate() - 1);
  }

  return {
    start: range.start ? formatDateInputValue(range.start) : '',
    end: endDisplay ? formatDateInputValue(endDisplay) : ''
  };
}

function getTimeframeRange(timeframe: TimeframeKey) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfLast7Days = new Date(startOfToday);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);
  const startOfThisWeek = getWeekStart(now);
  const startOfNextWeek = new Date(startOfThisWeek);
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfMonthlyView = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const startOfThisYear = new Date(now.getFullYear(), 0, 1);
  const startOfLast30Days = new Date(startOfToday);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);

  if (timeframe === 'today') {
    return { start: startOfToday, end: startOfTomorrow };
  }

  if (timeframe === 'yesterday') {
    return { start: startOfYesterday, end: startOfToday };
  }

  if (timeframe === 'last_7_days') {
    return { start: startOfLast7Days, end: startOfTomorrow };
  }

  if (timeframe === 'this_week') {
    return { start: startOfThisWeek, end: startOfNextWeek };
  }

  if (timeframe === 'last_week') {
    return { start: startOfLastWeek, end: startOfThisWeek };
  }

  if (timeframe === 'this_month') {
    return { start: startOfThisMonth, end: startOfNextMonth };
  }

  if (timeframe === 'last_month') {
    return { start: startOfLastMonth, end: startOfThisMonth };
  }

  if (timeframe === 'last_30_days') {
    return { start: startOfLast30Days, end: startOfTomorrow };
  }

  if (timeframe === 'monthly') {
    return { start: startOfMonthlyView, end: startOfNextMonth };
  }

  if (timeframe === 'this_year') {
    return { start: startOfThisYear, end: now };
  }

  return { start: undefined, end: undefined };
}

function getCustomTimeframeRange(startDate: string, endDate: string) {
  const start = startDate ? new Date(`${startDate}T00:00:00`) : undefined;
  const end = endDate ? new Date(`${endDate}T00:00:00`) : undefined;

  if (end) {
    end.setDate(end.getDate() + 1);
  }

  return {
    start: start && !Number.isNaN(start.getTime()) ? start : undefined,
    end: end && !Number.isNaN(end.getTime()) ? end : undefined
  };
}

function isWithinTimeframe(value: string, timeframe: TimeframeKey, customStartDate = '', customEndDate = '') {
  if (timeframe === 'all') {
    return true;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const { start, end } = timeframe === 'custom'
    ? getCustomTimeframeRange(customStartDate, customEndDate)
    : getTimeframeRange(timeframe);
  return (!start || date >= start) && (!end || date < end);
}

function isWithinAnalyticsDateRange(value: string, range: AnalyticsDateRange) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (!range.start || date >= range.start) && (!range.end || date < range.end);
}

function getComparisonRanges(
  comparePreset: ComparePresetKey,
  primaryStartDate: string,
  primaryEndDate: string,
  secondaryStartDate: string,
  secondaryEndDate: string
): ComparisonRanges | undefined {
  if (comparePreset === 'none') {
    return undefined;
  }

  if (comparePreset === 'today_vs_yesterday') {
    return {
      primary: normalizeAnalyticsDateRange(getTimeframeRange('today'), 'Today'),
      secondary: normalizeAnalyticsDateRange(getTimeframeRange('yesterday'), 'Yesterday'),
      label: 'Today vs Yesterday'
    };
  }

  if (comparePreset === 'this_week_vs_last_week') {
    return {
      primary: normalizeAnalyticsDateRange(getTimeframeRange('this_week'), 'This week'),
      secondary: normalizeAnalyticsDateRange(getTimeframeRange('last_week'), 'Last week'),
      label: 'This week vs Last week'
    };
  }

  if (comparePreset === 'this_month_vs_last_month') {
    return {
      primary: normalizeAnalyticsDateRange(getTimeframeRange('this_month'), 'This month'),
      secondary: normalizeAnalyticsDateRange(getTimeframeRange('last_month'), 'Last month'),
      label: 'This month vs Last month'
    };
  }

  if (comparePreset === 'monthly_vs_previous') {
    const primary = getTimeframeRange('monthly');
    const secondaryStart = primary.start ? new Date(primary.start) : undefined;
    const secondaryEnd = primary.start ? new Date(primary.start) : undefined;

    secondaryStart?.setMonth(secondaryStart.getMonth() - 12);

    return {
      primary: normalizeAnalyticsDateRange(primary, 'Last 12 months'),
      secondary: normalizeAnalyticsDateRange({ start: secondaryStart, end: secondaryEnd }, 'Previous 12 months'),
      label: 'Last 12 months vs Previous 12 months'
    };
  }

  const primary = getCustomTimeframeRange(primaryStartDate, primaryEndDate);
  const secondary = getCustomTimeframeRange(secondaryStartDate, secondaryEndDate);
  const primaryLabel = buildDateRangeLabel(primary.start, primary.end);
  const secondaryLabel = buildDateRangeLabel(secondary.start, secondary.end);

  return {
    primary: normalizeAnalyticsDateRange(primary, primaryLabel),
    secondary: normalizeAnalyticsDateRange(secondary, secondaryLabel),
    label: `${primaryLabel} vs ${secondaryLabel}`
  };
}

function getAgeGroup(age: number) {
  if (age < 18) return '<18';
  if (age <= 24) return '18-24';
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  if (age <= 54) return '45-54';
  return '55+';
}

function parseNricProfile(icNo: string): NricProfile | null {
  const digits = icNo.replace(/\D/g, '');
  if (digits.length !== 12) {
    return null;
  }

  const now = new Date();
  const yy = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  let year = yy <= now.getFullYear() % 100 ? 2000 + yy : 1900 + yy;
  let birthDate = new Date(year, month - 1, day);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null;
  }

  if (birthDate > now) {
    year -= 100;
    birthDate = new Date(year, month - 1, day);
  }

  let age = now.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed = (
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate())
  );

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  const birthPlaceCode = digits.slice(6, 8);
  const genderDigit = Number(digits.slice(11, 12));

  return {
    ic: digits,
    birthDate,
    age,
    ageGroup: getAgeGroup(age),
    birthPlaceCode,
    birthPlace: NRIC_BIRTHPLACE_BY_CODE[birthPlaceCode] || 'Unknown',
    gender: genderDigit % 2 === 1 ? 'Male' : 'Female'
  };
}

function findMarketingRule(value: string, rules: TagNormalizationRule[]) {
  const normalizedValue = value.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!normalizedValue) {
    return undefined;
  }

  return rules.find((rule) => (
    rule.active &&
    rule.domain === 'marketing' &&
    (
      rule.raw_value.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedValue ||
      rule.normalized_tag.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedValue
    )
  ));
}

function getNormalizedMarketingSource(click: WhatsAppTrackingClick, rules: TagNormalizationRule[]) {
  return findMarketingRule(click.channel, rules)?.normalized_tag || click.channel;
}

function getNormalizedMarketingMedium(click: WhatsAppTrackingClick, rules: TagNormalizationRule[]) {
  return findMarketingRule(click.channel, rules)?.parent_tag || click.medium;
}

function buildMarketingAggregateRows(
  clicks: WhatsAppTrackingClick[],
  getKey: (click: WhatsAppTrackingClick) => string,
  metaLabel: string,
  fallback: string
): MarketingPerformanceRow[] {
  return aggregateBy(clicks, getKey, fallback).map((row) => ({
    ...row,
    meta: metaLabel
  }));
}

function buildMarketingPerformanceRows(
  clicks: WhatsAppTrackingClick[],
  links: WhatsAppTrackingLink[],
  breakdown: MarketingBreakdown,
  rules: TagNormalizationRule[]
): MarketingPerformanceRow[] {
  if (breakdown === 'link') {
    const totalClicks = clicks.length;
    const clicksByLink = clicks.reduce<Map<string, WhatsAppTrackingClick[]>>((acc, click) => {
      const linkClicks = acc.get(click.link_id) || [];
      linkClicks.push(click);
      acc.set(click.link_id, linkClicks);
      return acc;
    }, new Map<string, WhatsAppTrackingClick[]>());

    return links
      .map((link) => {
        const linkClicks = clicksByLink.get(link.id) || [];

        return {
          key: link.id,
          label: link.label.trim() || 'Untitled link',
          value: linkClicks.length,
          percentage: totalClicks > 0 ? Math.round((linkClicks.length / totalClicks) * 100) : 0,
          meta: `${link.channel || 'Unknown channel'} / ${link.medium || 'Unknown medium'} / ${link.campaign || 'Unknown campaign'}`,
          salesName: link.sales_name,
          phoneNumber: link.phone_number,
          latest: latestClickTime(linkClicks)
        };
      });
  }

  if (breakdown === 'source') {
    return buildMarketingAggregateRows(clicks, (click) => getNormalizedMarketingSource(click, rules), 'UTM source channel', 'Unknown source');
  }

  if (breakdown === 'medium') {
    return buildMarketingAggregateRows(clicks, (click) => getNormalizedMarketingMedium(click, rules), 'UTM medium / parent tag', 'Unknown medium');
  }

  if (breakdown === 'sales') {
    return buildMarketingAggregateRows(clicks, (click) => click.sales_name, 'Sales owner', 'Unknown sales');
  }

  return buildMarketingAggregateRows(clicks, (click) => click.campaign, 'UTM campaign', 'Unknown campaign');
}

function buildCustomerProfileRows(
  rowsByAgeGroup: DemographicMotorRow[],
  rowsByBirthPlace: DemographicMotorRow[],
  rowsByGender: AggregateRow[],
  breakdown: CustomerProfileBreakdown,
  vehicleFilterLabel = 'All vehicles'
): CustomerProfileRow[] {
  const hasVehicleFilter = vehicleFilterLabel !== 'All vehicles';

  if (breakdown === 'gender') {
    return rowsByGender.map((row) => ({
      ...row,
      meta: hasVehicleFilter ? `Vehicle: ${vehicleFilterLabel}` : 'NRIC gender'
    }));
  }

  const rows = breakdown === 'birthplace' ? rowsByBirthPlace : rowsByAgeGroup;
  const total = rows.reduce((sum, row) => sum + row.applications, 0);

  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    value: row.applications,
    percentage: total > 0 ? Math.round((row.applications / total) * 100) : 0,
    meta: hasVehicleFilter ? `${row.approved} approved · ${vehicleFilterLabel}` : `${row.topModel || 'No model'} · ${row.approved} approved`,
    approved: row.approved,
    topModel: row.topModel,
    averageAge: row.averageAge
  }));
}

function buildVehicleStockRows(applications: LoanApplication[]): VehicleStockRow[] {
  const stockByModel = applications.reduce<Record<string, {
    brand: string;
    unitKeys: Set<string>;
    approvedUnitKeys: Set<string>;
  }>>((acc, application) => {
    const model = application.vehicle_model.trim() || 'Unknown model';
    const unitKey = normalizeVehiclePlate(application.vehicle_plate) || application.id;

    if (!acc[model]) {
      acc[model] = {
        brand: application.vehicle_brand,
        unitKeys: new Set<string>(),
        approvedUnitKeys: new Set<string>()
      };
    }

    acc[model].unitKeys.add(unitKey);

    if (application.status === LoanStatus.APPROVE) {
      acc[model].approvedUnitKeys.add(unitKey);
    }

    return acc;
  }, {});

  const totalUnits = Object.values(stockByModel).reduce((sum, item) => sum + item.unitKeys.size, 0);

  return Object.entries(stockByModel)
    .map(([model, item]) => ({
      key: model,
      label: model,
      brand: item.brand,
      value: item.unitKeys.size,
      approvedUnits: item.approvedUnitKeys.size,
      percentage: totalUnits > 0 ? Math.round((item.unitKeys.size / totalUnits) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value || b.approvedUnits - a.approvedUnits);
}

function buildComparisonSnapshot(
  applications: LoanApplication[],
  rawCustomerLeads: RawCustomerLead[],
  whatsAppTrackingClicks: WhatsAppTrackingClick[],
  range: AnalyticsDateRange
): ComparisonSnapshot {
  const filteredApplications = applications.filter((application) => isWithinAnalyticsDateRange(application.submitted_at, range));
  const filteredRawLeads = rawCustomerLeads.filter((lead) => isWithinAnalyticsDateRange(lead.received_at, range));
  const filteredClicks = whatsAppTrackingClicks.filter((click) => isWithinAnalyticsDateRange(click.clicked_at, range));
  const approved = filteredApplications.filter((application) => application.status === LoanStatus.APPROVE).length;
  const vehicleUnits = buildVehicleStockRows(filteredApplications).reduce((sum, row) => sum + row.value, 0);

  return {
    applications: filteredApplications.length,
    approved,
    approvalRate: filteredApplications.length > 0 ? Math.round((approved / filteredApplications.length) * 100) : 0,
    vehicleUnits,
    rawLeads: filteredRawLeads.length,
    clicks: filteredClicks.length
  };
}

function getVehicleDemandGroup(application: LoanApplication, breakdown: VehicleDemandBreakdown) {
  if (breakdown === 'brand') {
    return {
      key: application.vehicle_brand.trim() || 'Other',
      meta: 'Brand'
    };
  }

  return {
    key: application.vehicle_model.trim() || 'Unknown model',
    meta: application.vehicle_brand.trim() || 'Other'
  };
}

function matchesVehicleDemandFilters(application: LoanApplication, conditionFilter: VehicleConditionFilter, purchaseFilter: PurchaseMethodFilter) {
  const condition = application.vehicle_condition || '';
  const purchaseMethod = application.purchase_method || '';
  const conditionMatches = conditionFilter === 'all'
    || (conditionFilter === 'not_set' ? !condition : condition === conditionFilter);
  const purchaseMatches = purchaseFilter === 'all'
    || (purchaseFilter === 'not_set' ? !purchaseMethod : purchaseMethod === purchaseFilter);

  return conditionMatches && purchaseMatches;
}

function buildVehicleDemandRows(applications: LoanApplication[], breakdown: VehicleDemandBreakdown): VehicleDemandRow[] {
  const demandByGroup = applications.reduce<Record<string, {
    meta: string;
    unitKeys: Set<string>;
    approvedUnitKeys: Set<string>;
  }>>((acc, application) => {
    const group = getVehicleDemandGroup(application, breakdown);
    const unitKey = normalizeVehiclePlate(application.vehicle_plate) || application.id;

    if (!acc[group.key]) {
      acc[group.key] = {
        meta: group.meta,
        unitKeys: new Set<string>(),
        approvedUnitKeys: new Set<string>()
      };
    }

    acc[group.key].unitKeys.add(unitKey);

    if (application.status === LoanStatus.APPROVE) {
      acc[group.key].approvedUnitKeys.add(unitKey);
    }

    return acc;
  }, {});

  const totalUnits = Object.values(demandByGroup).reduce((sum, item) => sum + item.unitKeys.size, 0);

  return Object.entries(demandByGroup)
    .map(([key, item]) => {
      const units = item.unitKeys.size;
      const approvedUnits = item.approvedUnitKeys.size;

      return {
        key,
        label: key,
        value: units,
        approvedUnits,
        approvalRate: units > 0 ? Math.round((approvedUnits / units) * 100) : 0,
        percentage: totalUnits > 0 ? Math.round((units / totalUnits) * 100) : 0,
        meta: item.meta
      };
    })
    .sort((a, b) => b.value - a.value || b.approvedUnits - a.approvedUnits || a.label.localeCompare(b.label));
}

function formatTrendDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  return weekStart;
}

function formatTrendLabel(date: Date, bucket: 'day' | 'week' | 'month') {
  if (bucket === 'month') {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTrendTickIndexes(periodCount: number, maxTicks = 8) {
  const safeMaxTicks = Math.max(1, Math.floor(maxTicks));

  if (periodCount <= safeMaxTicks) {
    return new Set(Array.from({ length: periodCount }, (_, index) => index));
  }

  // Keep a constant interval between labels. Evenly fitting the first and last
  // periods with rounding produces visibly irregular gaps (for example, a
  // single weekly gap among otherwise fortnightly labels).
  const tickStep = Math.ceil(periodCount / safeMaxTicks);

  return new Set(Array.from(
    { length: Math.ceil(periodCount / tickStep) },
    (_, index) => index * tickStep
  ));
}

function buildTrendPeriods(dates: Date[], options?: TrendPeriodOptions) {
  if (dates.length === 0) {
    return { bucket: 'day' as const, periods: [] as VehicleDemandTrendPoint[] };
  }

  const rangeEnd = options?.range?.end
    ? new Date(options.range.end.getTime() - 1)
    : undefined;
  const periodBoundaryDates = [options?.range?.start, rangeEnd]
    .filter((date): date is Date => Boolean(date));
  const sortedDates = [...dates, ...periodBoundaryDates]
    .map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    .sort((a, b) => a.getTime() - b.getTime());
  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];
  const spanDays = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / 86400000) + 1);
  const bucket: 'day' | 'week' | 'month' = options?.bucket || (spanDays > 120 ? 'month' : spanDays > 45 ? 'week' : 'day');
  const periods: VehicleDemandTrendPoint[] = [];
  const cursor = bucket === 'month'
    ? new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
    : bucket === 'week'
      ? getWeekStart(firstDate)
      : new Date(firstDate);
  const end = bucket === 'month'
    ? new Date(lastDate.getFullYear(), lastDate.getMonth(), 1)
    : bucket === 'week'
      ? getWeekStart(lastDate)
      : new Date(lastDate);

  while (cursor <= end) {
    const key = bucket === 'month'
      ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      : formatTrendDateKey(cursor);

    periods.push({
      key,
      label: formatTrendLabel(cursor, bucket),
      value: 0,
      approvedUnits: 0
    });

    if (bucket === 'month') {
      cursor.setMonth(cursor.getMonth() + 1);
    } else if (bucket === 'week') {
      cursor.setDate(cursor.getDate() + 7);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return { bucket, periods };
}

function getTrendPeriodKey(date: Date, bucket: 'day' | 'week' | 'month') {
  if (bucket === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  if (bucket === 'week') {
    return formatTrendDateKey(getWeekStart(date));
  }

  return formatTrendDateKey(date);
}

function buildVehicleDemandTrendSeries(
  applications: LoanApplication[],
  breakdown: VehicleDemandBreakdown,
  demandRows: VehicleDemandRow[],
  trendOptions?: TrendPeriodOptions,
  topCount = 3
): VehicleDemandTrendSeries[] {
  const topRows = demandRows
    .filter((row) => row.value > 0 && row.label !== 'Not set')
    .slice(0, topCount);
  const topKeys = new Set(topRows.map((row) => row.key));
  const applicationDates = applications
    .map((application) => new Date(application.submitted_at))
    .filter((date) => !Number.isNaN(date.getTime()));
  const { bucket, periods } = buildTrendPeriods(applicationDates, trendOptions);
  const periodMaps = new Map<string, Record<string, {
    label: string;
    unitKeys: Set<string>;
    approvedUnitKeys: Set<string>;
  }>>();

  topRows.forEach((row) => {
    periodMaps.set(row.key, periods.reduce<Record<string, {
      label: string;
      unitKeys: Set<string>;
      approvedUnitKeys: Set<string>;
    }>>((acc, period) => {
      acc[period.key] = {
        label: period.label,
        unitKeys: new Set<string>(),
        approvedUnitKeys: new Set<string>()
      };
      return acc;
    }, {}));
  });

  applications.forEach((application) => {
    const group = getVehicleDemandGroup(application, breakdown);
    const submittedAt = new Date(application.submitted_at);

    if (!topKeys.has(group.key) || Number.isNaN(submittedAt.getTime())) return;

    const period = periodMaps.get(group.key)?.[getTrendPeriodKey(submittedAt, bucket)];
    if (!period) return;

    const unitKey = normalizeVehiclePlate(application.vehicle_plate) || application.id;
    period.unitKeys.add(unitKey);

    if (application.status === LoanStatus.APPROVE) period.approvedUnitKeys.add(unitKey);
  });

  return topRows.map((row) => {
    const periodMap = periodMaps.get(row.key) || {};

    return {
      key: row.key,
      label: row.label,
      points: periods.map((period) => ({
        key: period.key,
        label: period.label,
        value: periodMap[period.key]?.unitKeys.size || 0,
        approvedUnits: periodMap[period.key]?.approvedUnitKeys.size || 0
      }))
    };
  });
}

function buildSnapshotTrendSeries(rows: AggregateRow[], topCount = 3): AggregateTrendSeries[] {
  return rows
    .filter((row) => row.value > 0)
    .slice(0, topCount)
    .map((row) => ({
      key: row.key,
      label: row.label,
      points: [{
        key: 'current',
        label: 'Current',
        value: row.value
      }]
    }));
}

function buildAggregateTrendSeries<T>(
  items: T[],
  rows: AggregateRow[],
  getKey: (item: T) => string,
  getDateValue: (item: T) => string,
  fallback = 'unknown',
  trendOptions?: TrendPeriodOptions,
  topCount = 3
): AggregateTrendSeries[] {
  const topRows = rows
    .filter((row) => row.value > 0)
    .slice(0, topCount);
  const topKeys = new Set(topRows.map((row) => row.key));
  const itemDates = items
    .map((item) => new Date(getDateValue(item)))
    .filter((date) => !Number.isNaN(date.getTime()));
  const { bucket, periods } = buildTrendPeriods(itemDates, trendOptions);

  if (topRows.length === 0) {
    return [];
  }

  if (periods.length === 0) {
    return buildSnapshotTrendSeries(topRows, topCount);
  }
  const periodMaps = new Map<string, Record<string, number>>();

  topRows.forEach((row) => {
    periodMaps.set(row.key, periods.reduce<Record<string, number>>((acc, period) => {
      acc[period.key] = 0;
      return acc;
    }, {}));
  });

  items.forEach((item) => {
    const key = getKey(item).trim() || fallback;
    const date = new Date(getDateValue(item));

    if (!topKeys.has(key) || Number.isNaN(date.getTime())) return;

    const periodKey = getTrendPeriodKey(date, bucket);
    const periodMap = periodMaps.get(key);
    if (periodMap && periodKey in periodMap) periodMap[periodKey] += 1;
  });

  return topRows.map((row) => {
    const periodMap = periodMaps.get(row.key) || {};

    return {
      key: row.key,
      label: row.label,
      points: periods.map((period) => ({
        key: period.key,
        label: period.label,
        value: periodMap[period.key] || 0
      }))
    };
  });
}

function getCustomerProfileGroup(application: LoanApplication, breakdown: CustomerProfileBreakdown) {
  const profile = parseNricProfile(application.ic_no);

  if (!profile) {
    return '';
  }

  if (breakdown === 'gender') {
    return profile.gender;
  }

  return breakdown === 'birthplace' ? profile.birthPlace : profile.ageGroup;
}

function getRejectedCodeKey(application: LoanApplication) {
  return getPrimaryRejectCode(application) || 'NO_CODE';
}

function buildRejectedCodeRows(applications: LoanApplication[], definitions: ErrorCodeDefinition[]): RejectedCodeRow[] {
  const rejectedApplications = applications.filter((application) => application.status === LoanStatus.REJECT);
  const definitionByCode = definitions.reduce<Record<string, ErrorCodeDefinition>>((acc, definition) => {
    acc[definition.code.trim().toUpperCase()] = definition;
    return acc;
  }, {});
  const counts = rejectedApplications.reduce<Record<string, number>>((acc, application) => {
    const codes = getApplicationRejectCodes(application);
    if (codes.length === 0) {
      acc.NO_CODE = (acc.NO_CODE || 0) + 1;
      return acc;
    }

    codes.forEach((code) => {
      acc[code] = (acc[code] || 0) + 1;
    });
    return acc;
  }, {});
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return Object.entries(counts)
    .map(([code, value]) => {
      const definition = definitionByCode[code];
      return {
        key: code,
        label: code === 'NO_CODE' ? 'No CODE' : code,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        issue: code === 'NO_CODE' ? 'Rejected but CODE not selected' : definition?.issue || 'CODE definition not found',
        customerRequest: code === 'NO_CODE' ? 'Staff needs to choose a final reject CODE' : definition?.customer_request || 'No customer request defined'
      };
    })
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function getApplicationCancellationReason(application: LoanApplication) {
  const cancelledBankApplications = application.bank_applications
    .filter((bankApplication) => bankApplication.status === 'Cancelled')
    .sort((a, b) => {
      const aTime = new Date(a.decision_at || a.submitted_at).getTime();
      const bTime = new Date(b.decision_at || b.submitted_at).getTime();
      return (Number.isNaN(aTime) ? 0 : aTime) - (Number.isNaN(bTime) ? 0 : bTime);
    });
  const latestCancelledBankApplication = cancelledBankApplications[cancelledBankApplications.length - 1];

  return latestCancelledBankApplication?.status_reason.trim()
    || latestCancelledBankApplication?.reason_category.trim()
    || application.remarks.trim()
    || 'NO_REASON';
}

function buildVehicleStatusRelationship(
  applications: LoanApplication[],
  definitions: ErrorCodeDefinition[]
): VehicleStatusRelationshipData {
  const modelGroups = new Map<string, {
    total: number;
    approved: number;
    rejected: number;
    cancelled: number;
  }>();

  applications.forEach((application) => {
    const model = application.vehicle_model.trim() || 'Unknown model';
    const group = modelGroups.get(model) || { total: 0, approved: 0, rejected: 0, cancelled: 0 };
    group.total += 1;
    if (application.status === LoanStatus.APPROVE) group.approved += 1;
    if (application.status === LoanStatus.REJECT) group.rejected += 1;
    if (application.status === LoanStatus.CANCELLED) group.cancelled += 1;
    modelGroups.set(model, group);
  });

  const modelRows = Array.from(modelGroups.entries())
    .map(([model, group]) => ({
      key: model,
      label: model,
      total: group.total,
      approved: group.approved,
      rejected: group.rejected,
      cancelled: group.cancelled,
      open: group.total - group.approved - group.rejected - group.cancelled,
      approvalRate: group.total > 0 ? Math.round((group.approved / group.total) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total || b.approved - a.approved || a.label.localeCompare(b.label));

  const approvedApplications = applications.filter((application) => application.status === LoanStatus.APPROVE);
  const approvedModelGroups = approvedApplications.reduce<Map<string, { brand: string; approved: number; approvedLoans: number }>>((acc, application) => {
    const model = application.vehicle_model.trim() || 'Unknown model';
    const group = acc.get(model) || { brand: application.vehicle_brand || 'Other', approved: 0, approvedLoans: 0 };
    group.approved += 1;
    if (application.purchase_method === 'Loan') group.approvedLoans += 1;
    acc.set(model, group);
    return acc;
  }, new Map());
  const approvedModelRows = Array.from(approvedModelGroups.entries())
    .map(([model, group]) => ({
      key: model,
      label: model,
      brand: group.brand,
      approved: group.approved,
      approvedLoans: group.approvedLoans,
      percentage: approvedApplications.length > 0 ? Math.round((group.approved / approvedApplications.length) * 100) : 0
    }))
    .sort((a, b) => b.approved - a.approved || b.approvedLoans - a.approvedLoans || a.label.localeCompare(b.label));

  const rejectedApplications = applications.filter((application) => application.status === LoanStatus.REJECT);
  const rejectCodeModelCounts = new Map<string, Map<string, number>>();
  rejectedApplications.forEach((application) => {
    const model = application.vehicle_model.trim() || 'Unknown model';
    const codes = getApplicationRejectCodes(application);
    (codes.length > 0 ? codes : ['NO_CODE']).forEach((code) => {
      const modelCounts = rejectCodeModelCounts.get(code) || new Map<string, number>();
      modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
      rejectCodeModelCounts.set(code, modelCounts);
    });
  });
  const rejectedCodeRows = buildRejectedCodeRows(applications, definitions).map((row) => {
    const [topModel, topModelCount] = Array.from(rejectCodeModelCounts.get(row.key)?.entries() || [])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || ['-', 0];
    return { ...row, topModel, topModelCount };
  });

  const cancelledApplications = applications.filter((application) => application.status === LoanStatus.CANCELLED);
  const cancellationGroups = cancelledApplications.reduce<Map<string, { label: string; count: number; modelCounts: Map<string, number> }>>((acc, application) => {
    const rawReason = getApplicationCancellationReason(application);
    const key = rawReason === 'NO_REASON' ? 'NO_REASON' : rawReason.trim().replace(/\s+/g, ' ').toLowerCase();
    const model = application.vehicle_model.trim() || 'Unknown model';
    const group = acc.get(key) || { label: rawReason, count: 0, modelCounts: new Map<string, number>() };
    group.count += 1;
    group.modelCounts.set(model, (group.modelCounts.get(model) || 0) + 1);
    acc.set(key, group);
    return acc;
  }, new Map());
  const cancellationReasonRows = Array.from(cancellationGroups.entries())
    .map(([key, group]) => {
      const [topModel, topModelCount] = Array.from(group.modelCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || ['-', 0];
      return {
        key,
        label: group.label,
        value: group.count,
        percentage: cancelledApplications.length > 0 ? Math.round((group.count / cancelledApplications.length) * 100) : 0,
        topModel,
        topModelCount
      };
    })
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  return {
    modelRows,
    approvedModelRows,
    rejectedCodeRows,
    cancellationReasonRows,
    approvedApplications: approvedApplications.length,
    approvedLoans: approvedApplications.filter((application) => application.purchase_method === 'Loan').length,
    rejectedApplications: rejectedApplications.length,
    cancelledApplications: cancelledApplications.length,
    missingRejectCodeCount: rejectedApplications.filter((application) => getApplicationRejectCodes(application).length === 0).length,
    missingCancellationReasonCount: cancelledApplications.filter((application) => getApplicationCancellationReason(application) === 'NO_REASON').length
  };
}

function buildDemographicRows(
  applications: LoanApplication[],
  getGroup: (profile: NricProfile) => string
): DemographicMotorRow[] {
  const groups = new Map<string, {
    applications: LoanApplication[];
    profiles: NricProfile[];
    modelCounts: Map<string, number>;
    approved: number;
  }>();

  applications.forEach((application) => {
    const profile = parseNricProfile(application.ic_no);
    if (!profile) {
      return;
    }

    const key = getGroup(profile);
    const group = groups.get(key) || {
      applications: [],
      profiles: [],
      modelCounts: new Map<string, number>(),
      approved: 0
    };
    const model = application.vehicle_model.trim() || 'Unknown model';

    group.applications.push(application);
    group.profiles.push(profile);
    group.modelCounts.set(model, (group.modelCounts.get(model) || 0) + 1);

    if (application.status === LoanStatus.APPROVE) {
      group.approved += 1;
    }

    groups.set(key, group);
  });

  return Array.from(groups.entries())
    .map(([key, group]) => {
      const [topModel, topModelCount] = Array.from(group.modelCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || ['-', 0];
      const averageAge = Math.round(group.profiles.reduce((sum, profile) => sum + profile.age, 0) / group.profiles.length);

      return {
        key,
        label: key,
        applications: group.applications.length,
        approved: group.approved,
        topModel,
        topModelCount,
        averageAge
      };
    })
    .sort((a, b) => b.applications - a.applications || a.label.localeCompare(b.label));
}

function latestClickTime(clicks: WhatsAppTrackingClick[]) {
  if (clicks.length === 0) {
    return 'No clicks yet';
  }

  const latest = clicks.reduce((current, click) => (
    new Date(click.clicked_at).getTime() > new Date(current.clicked_at).getTime() ? click : current
  ));

  return new Date(latest.clicked_at).toLocaleString(getAppLocale(), {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatCompareValue(value: string | number, suffix = '') {
  return typeof value === 'number' ? `${value}${suffix}` : value;
}

function CompareDeltaBadge({
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
    <span className={`shrink-0 rounded-full px-2 py-1 font-mono text-[11px] font-bold ${
      isFlat
        ? 'bg-slate-100 text-slate-500'
        : isPositive
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-rose-50 text-rose-700'
    }`}>
      Delta {deltaLabel}
    </span>
  );
}

function HeroStatTile({
  title,
  value,
  suffix = '',
  icon,
  tone,
  comparison,
  primary = false,
  caption,
  badge,
  onClick
}: {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  tone: string;
  comparison?: StatComparison;
  // 帕累托层级:primary 为板块主指标(数字更大、卡更重),其余为支撑卡。
  primary?: boolean;
  caption?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`flex w-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition-colors ${
        primary ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-100'
      } ${onClick ? 'hover:border-indigo-200 hover:bg-indigo-50/40' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`font-bold uppercase tracking-wider text-slate-500 ${primary ? 'text-xs' : 'text-[11px]'}`}>{tra(title)}</p>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className={`font-mono font-bold tracking-tight text-slate-900 tabular-nums ${primary ? 'text-5xl' : 'text-3xl'}`}>{value}{suffix}</p>
        {badge}
      </div>
      {caption && <p className="mt-1 text-xs font-semibold text-slate-500">{caption}</p>}
      {comparison && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CompareDeltaBadge delta={comparison.delta} suffix={comparison.suffix} inverse={comparison.inverse} />
          <span className="text-[11px] font-semibold text-slate-500">
            {comparison.secondaryLabel}: {formatCompareValue(comparison.secondaryValue, comparison.suffix)}
          </span>
        </div>
      )}
    </Tag>
  );
}

// Reference-dashboard executive overview: KPIs, status comparison/share, table, and stacked trend.
function AnalyticsExecutiveOverview({
  activeTimeframeLabel,
  approvalRate,
  approvedLoans,
  rejectedLoans,
  applicationsCount,
  rawLeadsCount,
  totalClicks,
  topSaleLabel,
  statusRows,
  applications,
  timeframe,
  trendRange,
  canExportData
}: {
  activeTimeframeLabel: string;
  approvalRate: number;
  approvedLoans: number;
  rejectedLoans: number;
  applicationsCount: number;
  rawLeadsCount: number;
  totalClicks: number;
  topSaleLabel?: string;
  statusRows: AggregateRow[];
  applications: LoanApplication[];
  timeframe: TimeframeKey;
  trendRange: Pick<AnalyticsDateRange, 'start' | 'end'>;
  canExportData: boolean;
}) {
  const [statusView, setStatusView] = useState<'comparison' | 'share' | 'performance'>(() => {
    const saved = window.localStorage.getItem(ANALYTICS_STATUS_VIEW_STORAGE_KEY);
    return saved === 'share' || saved === 'performance' ? saved : 'comparison';
  });
  const [tableSearch, setTableSearch] = useState('');
  const deferredTableSearch = useDeferredValue(tableSearch);
  const [tableSort, setTableSort] = useState<{ key: ApplicationTableSortKey; direction: SortDirection }>({ key: 'submitted_at', direction: 'desc' });
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(() => {
    const saved = Number(window.localStorage.getItem(ANALYTICS_TABLE_PAGE_SIZE_STORAGE_KEY));
    return [10, 25, 50].includes(saved) ? saved : 10;
  });
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>();
  const [detailApplication, setDetailApplication] = useState<LoanApplication>();
  const palette = ['#38bdf8', '#8b5cf6', '#fb7185', '#fbbf24', '#2dd4bf', '#818cf8', '#f97316'];
  const secondaryMetrics = [
    {
      label: tr('范围内申请', 'Applications in range', 'Permohonan dalam julat'),
      value: applicationsCount.toLocaleString(),
      detail: activeTimeframeLabel,
      tone: 'text-slate-900'
    },
    {
      label: tr('已批核申请', 'Approved applications', 'Permohonan diluluskan'),
      value: approvedLoans.toLocaleString(),
      detail: applicationsCount ? `${Math.round((approvedLoans / applicationsCount) * 100)}%` : '0%',
      tone: 'text-emerald-600'
    },
    {
      label: tr('已拒绝申请', 'Rejected applications', 'Permohonan ditolak'),
      value: rejectedLoans.toLocaleString(),
      detail: applicationsCount ? `${Math.round((rejectedLoans / applicationsCount) * 100)}%` : '0%',
      tone: 'text-rose-600'
    }
  ];
  const supportingMetrics = [
    {
      label: tr('热销车型', 'Top approved model', 'Model diluluskan teratas'),
      value: topSaleLabel || '--',
      detail: tr('按已批核申请统计', 'Based on approved applications', 'Berdasarkan permohonan diluluskan'),
      tone: 'text-amber-600'
    },
    {
      label: tr('WhatsApp 点击', 'WhatsApp clicks', 'Klik WhatsApp'),
      value: totalClicks.toLocaleString(),
      detail: tr('追踪链接互动', 'Tracked link interactions', 'Interaksi pautan dijejaki'),
      tone: 'text-cyan-600'
    },
    {
      label: tr('潜在名单', 'Raw leads', 'Prospek mentah'),
      value: rawLeadsCount.toLocaleString(),
      detail: activeTimeframeLabel,
      tone: 'text-slate-900'
    }
  ];

  const { trendData, trendGranularity } = useMemo(() => {
    const validDates = applications
      .map((application) => new Date(application.submitted_at))
      .filter((date) => !Number.isNaN(date.getTime()));
    const dataStart = validDates.length ? new Date(Math.min(...validDates.map((date) => date.getTime()))) : new Date();
    const dataEnd = validDates.length ? new Date(Math.max(...validDates.map((date) => date.getTime()))) : new Date();
    const rangeStart = trendRange.start ? new Date(trendRange.start) : dataStart;
    const configuredRangeEnd = trendRange.end ? new Date(trendRange.end) : new Date(dataEnd.getTime() + 24 * 60 * 60 * 1000);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const rangeEnd = ['this_week', 'this_month', 'this_year'].includes(timeframe) && configuredRangeEnd > tomorrow
      ? tomorrow
      : configuredRangeEnd;
    rangeStart.setHours(0, 0, 0, 0);

    const spanDays = Math.max(1, Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)));
    const granularity: 'day' | 'month' = timeframe === 'monthly' || timeframe === 'this_year' || timeframe === 'all' || spanDays > 45
      ? 'month'
      : 'day';
    const buckets: Array<{ key: string; date: Date; label: string; counts: Map<string, number>; total: number }> = [];
    const cursor = granularity === 'month'
      ? new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
      : new Date(rangeStart);

    while (cursor < rangeEnd) {
      const key = granularity === 'month'
        ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
        : `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      const label = granularity === 'month'
        ? new Intl.DateTimeFormat(getAppLocale(), { month: 'short', year: '2-digit' }).format(cursor)
        : new Intl.DateTimeFormat(getAppLocale(), { month: '2-digit', day: '2-digit' }).format(cursor);
      buckets.push({ key, date: new Date(cursor), label, counts: new Map<string, number>(), total: 0 });
      if (granularity === 'month') cursor.setMonth(cursor.getMonth() + 1);
      else cursor.setDate(cursor.getDate() + 1);
    }

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    applications.forEach((application) => {
      const date = new Date(application.submitted_at);
      if (Number.isNaN(date.getTime())) return;
      const key = granularity === 'month'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      bucket.counts.set(application.status, (bucket.counts.get(application.status) || 0) + 1);
      bucket.total += 1;
    });

    return { trendData: buckets, trendGranularity: granularity };
  }, [applications, timeframe, trendRange.end, trendRange.start]);
  const trendMaximum = Math.max(...trendData.map((bucket) => bucket.total), 1);
  const statusColor = new Map(statusRows.map((row, index) => [row.key, palette[index % palette.length]]));
  const filteredTableRows = useMemo(() => {
    const query = deferredTableSearch.trim().toLocaleLowerCase();
    const filtered = query
      ? applications.filter((application) => [
        application.applicant_name,
        application.handler_name,
        application.status,
        application.vehicle_model,
        application.vehicle_brand,
        application.id
      ].some((value) => String(value || '').toLocaleLowerCase().includes(query)))
      : applications;

    return [...filtered].sort((left, right) => {
      const leftValue = left[tableSort.key] || '';
      const rightValue = right[tableSort.key] || '';
      if (!leftValue && rightValue) return 1;
      if (leftValue && !rightValue) return -1;
      const comparison = tableSort.key === 'submitted_at'
        ? new Date(leftValue).getTime() - new Date(rightValue).getTime()
        : String(leftValue).localeCompare(String(rightValue), getAppLocale(), { numeric: true, sensitivity: 'base' });
      return tableSort.direction === 'asc' ? comparison : -comparison;
    });
  }, [applications, deferredTableSearch, tableSort]);
  const tablePageCount = Math.max(1, Math.ceil(filteredTableRows.length / tablePageSize));
  const safeTablePage = Math.min(tablePage, tablePageCount);
  const pageRows = filteredTableRows.slice((safeTablePage - 1) * tablePageSize, safeTablePage * tablePageSize);
  const selectedApplication = filteredTableRows.find((application) => application.id === selectedApplicationId);

  useEffect(() => {
    setTablePage(1);
  }, [deferredTableSearch, tablePageSize, applications]);

  useEffect(() => {
    window.localStorage.setItem(ANALYTICS_TABLE_PAGE_SIZE_STORAGE_KEY, String(tablePageSize));
  }, [tablePageSize]);

  useEffect(() => {
    window.localStorage.setItem(ANALYTICS_STATUS_VIEW_STORAGE_KEY, statusView);
  }, [statusView]);

  useEffect(() => {
    if (selectedApplicationId && !filteredTableRows.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId(undefined);
    }
  }, [filteredTableRows, selectedApplicationId]);

  useEffect(() => {
    if (!detailApplication) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailApplication(undefined);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [detailApplication]);

  const toggleTableSort = (key: ApplicationTableSortKey) => {
    setTableSort((current) => current.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: key === 'submitted_at' ? 'desc' : 'asc' });
  };

  const exportFilteredApplications = () => {
    // SECURITY: these rows carry attacker-controlled public-intake text. Always
    // encode through the shared hardened helper (src/utils/csvExport.ts) so
    // spreadsheet formula payloads are neutralised. Never hand-roll an encoder.
    const header = ['Submitted At', 'Applicant', 'Handler', 'Status', 'Vehicle Model', 'Vehicle Brand', 'Application ID'];
    const rows: CsvCell[][] = filteredTableRows.map((application) => [
      application.submitted_at,
      application.applicant_name,
      application.handler_name,
      application.status,
      application.vehicle_model,
      application.vehicle_brand,
      application.id
    ]);
    downloadCsvFromRows(header, rows, `analytics-applications-${new Date().toISOString().slice(0, 10)}.csv`);
  };
  const applicationTableColumns: Array<{ key: ApplicationTableSortKey; label: string; align?: 'right' }> = [
    { key: 'submitted_at', label: tr('提交日期', 'Submitted', 'Dihantar') },
    { key: 'applicant_name', label: tr('申请人', 'Applicant', 'Pemohon') },
    { key: 'handler_name', label: tr('负责人', 'Handler', 'Pengendali') },
    { key: 'status', label: tr('状态', 'Status', 'Status') },
    { key: 'vehicle_model', label: tr('车型', 'Vehicle model', 'Model kenderaan') }
  ];

  return (
    <div id="analytics-section-timeframe" className="space-y-4 scroll-mt-28">
      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.618fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 text-white shadow-sm">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100">{tr('主要指标', 'Primary metric', 'Metrik utama')}</p>
          <p className="relative mt-5 font-mono text-6xl font-bold tracking-tight tabular-nums">{approvalRate}%</p>
          <p className="relative mt-3 text-sm font-bold">{tr('批核率', 'Approval rate', 'Kadar kelulusan')}</p>
          <p className="relative mt-1 text-xs text-indigo-100">{tr(`${approvedLoans} / ${applicationsCount} 份申请已批核`, `${approvedLoans} of ${applicationsCount} applications approved`, `${approvedLoans} daripada ${applicationsCount} permohonan diluluskan`)}</p>
          <span className="relative mt-6 inline-flex rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-indigo-50">{activeTimeframeLabel}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {secondaryMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className={`truncate font-mono text-2xl font-bold tracking-tight ${metric.tone}`} title={metric.value}>{metric.value}</p>
                <p className="shrink-0 text-[11px] font-semibold text-slate-500">{metric.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {supportingMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className={`mt-3 truncate font-mono text-xl font-bold tracking-tight ${metric.tone}`} title={metric.value}>{metric.value}</p>
            <p className="mt-1.5 text-[11px] font-semibold text-slate-500">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('申请状态', 'Application Status', 'Status Permohonan')}</h3>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              {statusView === 'comparison'
                ? tr('按申请数量比较各贷款状态。', 'Compare loan statuses by application volume.', 'Bandingkan status pinjaman mengikut jumlah permohonan.')
                : statusView === 'share'
                  ? tr(`查看 ${activeTimeframeLabel} 的状态占比。`, `View status share for ${activeTimeframeLabel}.`, `Lihat bahagian status untuk ${activeTimeframeLabel}.`)
                  : tr('查看各贷款状态的申请数量、占比和分布。', 'Review application volume, share, and distribution for every loan status.', 'Semak jumlah, bahagian dan pengagihan bagi setiap status pinjaman.')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1" aria-label={tr('申请状态视图', 'Application status view', 'Paparan status permohonan')}>
            {([
              { key: 'comparison' as const, zh: '对比', en: 'Comparison', ms: 'Perbandingan' },
              { key: 'share' as const, zh: '占比', en: 'Share', ms: 'Bahagian' },
              { key: 'performance' as const, zh: '表现', en: 'Performance', ms: 'Prestasi' }
            ]).map((view) => (
              <button
                key={view.key}
                type="button"
                onClick={() => setStatusView(view.key)}
                aria-pressed={statusView === view.key}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${
                  statusView === view.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                {tr(view.zh, view.en, view.ms)}
              </button>
            ))}
          </div>
        </div>
        {statusView === 'comparison' && (
          <div className="p-5">
            <SharedAggregateVisual
              rows={statusRows}
              visualMode="bar"
              valueLabel={tr('申请', 'applications', 'permohonan')}
              emptyText={tr('本期暂无申请', 'No applications this period', 'Tiada permohonan tempoh ini')}
              ariaLabel={tr('申请状态对比', 'Application status comparison', 'Perbandingan status permohonan')}
              showBarValueOnHoverOnly
              expandToContent
            />
          </div>
        )}
        {statusView === 'share' && (
          <div className="p-5">
            <SharedAggregateVisual
              rows={statusRows}
              visualMode="donut"
              valueLabel={tr('申请', 'applications', 'permohonan')}
              emptyText={tr('本期暂无申请', 'No applications this period', 'Tiada permohonan tempoh ini')}
              ariaLabel={tr('申请状态占比', 'Application status share', 'Bahagian status permohonan')}
              expandToContent
            />
          </div>
        )}
        {statusView === 'performance' && (
          <>
            <div>
              <table className="w-full table-fixed text-left">
                <thead className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="w-[30%] px-5 py-3">{tr('状态', 'Status', 'Status')}</th>
                    <th className="w-[18%] px-4 py-3 text-right">{tr('申请', 'Applications', 'Permohonan')}</th>
                    <th className="w-[14%] px-4 py-3 text-right">{tr('占比', 'Share', 'Bahagian')}</th>
                    <th className="w-[38%] px-5 py-3">{tr('分布', 'Distribution', 'Pengagihan')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {statusRows.map((row, index) => (
                    <tr key={row.key} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[index % palette.length] }} />
                          {row.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-slate-800">{row.value.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-slate-600">{row.percentage}%</td>
                      <td className="px-5 py-3.5">
                        <span className="block h-1.5 w-full max-w-64 overflow-hidden rounded-full bg-slate-100">
                          <span className="block h-full rounded-full" style={{ width: `${row.percentage}%`, backgroundColor: palette[index % palette.length] }} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {statusRows.length === 0 && <div className="p-8 text-center text-xs font-semibold text-slate-500">{tr('本期暂无申请', 'No applications this period', 'Tiada permohonan tempoh ini')}</div>}
          </>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('申请提交趋势', 'Application Submission Trend', 'Trend Penghantaran Permohonan')}</h3>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              {activeTimeframeLabel} · {trendGranularity === 'month'
                ? tr('按月及贷款状态堆叠。', 'Grouped monthly and stacked by loan status.', 'Dikumpulkan mengikut bulan dan ditindan mengikut status pinjaman.')
                : tr('按日及贷款状态堆叠。', 'Grouped daily and stacked by loan status.', 'Dikumpulkan mengikut hari dan ditindan mengikut status pinjaman.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {statusRows.map((row, index) => (
              <span key={row.key} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: palette[index % palette.length] }} />
                {row.label}
              </span>
            ))}
          </div>
        </div>
        {applicationsCount === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center text-xs font-semibold text-slate-500">
            {tr('本期暂无申请趋势', 'No application trend this period', 'Tiada trend permohonan tempoh ini')}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-xl bg-slate-50 px-4 pb-4 pt-5">
            <div className="flex h-72 items-end justify-center gap-2 border-b border-slate-200" style={{ minWidth: `${Math.max(760, trendData.length * 54)}px` }}>
              {trendData.map((bucket) => (
                <div
                  key={bucket.key}
                  className="group relative flex h-full min-w-0 flex-1 flex-col justify-end outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                  style={{ maxWidth: '80px' }}
                  tabIndex={0}
                  aria-label={`${bucket.key}: ${bucket.total.toLocaleString()}`}
                >
                  <div className="pointer-events-none absolute left-1/2 top-2 z-20 hidden min-w-36 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-white shadow-xl group-hover:block group-focus:block">
                    <p className="font-mono text-[11px] font-bold">{bucket.label}</p>
                    <div className="mt-1.5 space-y-1 border-t border-white/15 pt-1.5">
                      <div className="flex items-center justify-between gap-5 text-[10px] font-bold">
                        <span>{tr('总数', 'Total', 'Jumlah')}</span>
                        <span className="font-mono">{bucket.total.toLocaleString()}</span>
                      </div>
                      {statusRows.map((row) => (
                        <div key={row.key} className="flex items-center justify-between gap-5 text-[10px]">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusColor.get(row.key) }} />
                            <span className="truncate">{row.label}</span>
                          </span>
                          <span className="shrink-0 font-mono font-bold">{(bucket.counts.get(row.key) || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="mb-1 text-center text-[9px] font-bold text-slate-500">{bucket.total || ''}</span>
                  <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-sm" style={{ height: `${bucket.total ? Math.max((bucket.total / trendMaximum) * 100, 4) : 1}%` }}>
                    {statusRows.map((row) => {
                      const count = bucket.counts.get(row.key) || 0;
                      return count > 0 ? <span key={row.key} style={{ height: `${(count / bucket.total) * 100}%`, backgroundColor: statusColor.get(row.key) }} /> : null;
                    })}
                    {bucket.total === 0 && <span className="h-full bg-slate-200" />}
                  </div>
                  <span className="mt-2 text-center text-[9px] font-semibold text-slate-500">{bucket.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-white/90 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{tr('申请明细', 'Application Records', 'Rekod Permohonan')}</h3>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">{tr(`当前筛选共 ${filteredTableRows.length} 条；单击查看摘要，双击打开详情。`, `${filteredTableRows.length} filtered records; click for a summary or double-click for details.`, `${filteredTableRows.length} rekod ditapis; klik untuk ringkasan atau klik dua kali untuk butiran.`)}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block min-w-64">
              <span className="sr-only">{tr('搜索申请', 'Search applications', 'Cari permohonan')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={tableSearch}
                onChange={(event) => setTableSearch(event.target.value)}
                placeholder={tr('搜索申请人、负责人、状态或车型...', 'Search applicant, handler, status, or model...', 'Cari pemohon, pengendali, status atau model...')}
                className="w-full rounded-xl bg-slate-100 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none ring-indigo-100 transition focus:bg-white focus:ring-2"
              />
            </label>
            {canExportData && (
              <button type="button" onClick={exportFilteredApplications} disabled={filteredTableRows.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
                <Download className="h-3.5 w-3.5" />
                {tr('导出当前结果', 'Export results', 'Eksport hasil')}
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="sticky top-0 z-10 bg-slate-100/95 text-[11px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur">
              <tr>
                {applicationTableColumns.map((column) => (
                  <th key={column.key} className="px-5 py-3">
                    <button type="button" onClick={() => toggleTableSort(column.key)} className="inline-flex items-center gap-1 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                      {column.label}
                      <span className={tableSort.key === column.key ? 'text-indigo-600' : 'text-slate-300'} aria-hidden="true">
                        {tableSort.key === column.key ? (tableSort.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3">{tr('申请编号', 'Application ID', 'ID Permohonan')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((application, index) => {
                const selected = application.id === selectedApplicationId;
                return (
                  <tr
                    key={application.id}
                    tabIndex={0}
                    aria-selected={selected}
                    onClick={() => setSelectedApplicationId(application.id)}
                    onDoubleClick={() => setDetailApplication(application)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') setDetailApplication(application);
                    }}
                    className={`cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 ${
                      selected ? 'bg-indigo-50' : index % 2 === 1 ? 'bg-slate-50/50 hover:bg-indigo-50/60' : 'hover:bg-indigo-50/60'
                    }`}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{new Intl.DateTimeFormat(getAppLocale(), { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(application.submitted_at))}</td>
                    <td className="px-5 py-3 text-xs font-bold text-slate-800">{application.applicant_name || '--'}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-slate-600">{application.handler_name || '--'}</td>
                    <td className="px-5 py-3"><span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{trLoanStatus(application.status)}</span></td>
                    <td className="px-5 py-3 text-xs font-semibold text-slate-600">{application.vehicle_model || '--'}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-500">{application.id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pageRows.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-xs font-bold text-slate-500">{applications.length === 0 ? tr('所选日期范围没有申请。', 'No applications in the selected date range.', 'Tiada permohonan dalam julat tarikh dipilih.') : tr('搜索条件没有匹配结果。', 'No records match the search.', 'Tiada rekod sepadan dengan carian.')}</p>
              {tableSearch && <button type="button" onClick={() => setTableSearch('')} className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700">{tr('清除搜索', 'Clear search', 'Kosongkan carian')}</button>}
            </div>
          )}
        </div>

        {selectedApplication && (
          <div className="grid gap-3 border-t border-indigo-100 bg-indigo-50/60 px-5 py-4 text-xs sm:grid-cols-2 xl:grid-cols-4">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{tr('已选申请', 'Selected record', 'Rekod dipilih')}</p><p className="mt-1 font-bold text-indigo-900">{selectedApplication.applicant_name}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{tr('车辆', 'Vehicle', 'Kenderaan')}</p><p className="mt-1 font-semibold text-indigo-900">{selectedApplication.vehicle_brand} {selectedApplication.vehicle_model}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{tr('负责人', 'Handler', 'Pengendali')}</p><p className="mt-1 font-semibold text-indigo-900">{selectedApplication.handler_name || '--'}</p></div>
            <button type="button" onClick={() => setDetailApplication(selectedApplication)} className="justify-self-start rounded-lg bg-indigo-600 px-4 py-2 text-[11px] font-bold text-white sm:justify-self-end">{tr('打开详情', 'Open details', 'Buka butiran')}</button>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>{tr('每页', 'Rows per page', 'Baris setiap halaman')}</span>
            {[10, 25, 50].map((size) => <button key={size} type="button" onClick={() => setTablePageSize(size)} aria-pressed={tablePageSize === size} className={`rounded-lg px-2.5 py-1.5 font-bold ${tablePageSize === size ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>{size}</button>)}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setTablePage((page) => Math.max(1, page - 1))} disabled={safeTablePage <= 1} className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600 disabled:opacity-40">{tr('上一页', 'Previous', 'Sebelumnya')}</button>
            <span className="min-w-24 text-center font-mono text-[11px] font-bold text-slate-500">{safeTablePage} / {tablePageCount}</span>
            <button type="button" onClick={() => setTablePage((page) => Math.min(tablePageCount, page + 1))} disabled={safeTablePage >= tablePageCount} className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600 disabled:opacity-40">{tr('下一页', 'Next', 'Seterusnya')}</button>
          </div>
        </div>
      </section>

      {detailApplication && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="analytics-record-detail-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailApplication(undefined); }}>
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">{detailApplication.id}</p>
                <h3 id="analytics-record-detail-title" className="mt-1 text-xl font-bold text-slate-900">{detailApplication.applicant_name}</h3>
                <p className="mt-1 text-xs text-slate-500">{tr('当前筛选结果中的申请详情。', 'Application detail from the current filtered result set.', 'Butiran permohonan daripada set hasil ditapis semasa.')}</p>
              </div>
              <button type="button" onClick={() => setDetailApplication(undefined)} aria-label={tr('关闭详情', 'Close details', 'Tutup butiran')} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                [tr('状态', 'Status', 'Status'), trLoanStatus(detailApplication.status)],
                [tr('负责人', 'Handler', 'Pengendali'), detailApplication.handler_name || '--'],
                [tr('提交日期', 'Submitted', 'Dihantar'), new Intl.DateTimeFormat(getAppLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(detailApplication.submitted_at))],
                [tr('车型', 'Vehicle model', 'Model kenderaan'), detailApplication.vehicle_model || '--'],
                [tr('品牌', 'Brand', 'Jenama'), detailApplication.vehicle_brand || '--'],
                [tr('车牌', 'Vehicle plate', 'Nombor plat'), detailApplication.vehicle_plate || '--']
              ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-sm font-bold text-slate-800">{value}</p></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mergeComparisonRows<T extends AggregateRow & { meta?: string }>(primaryRows: T[], comparisonRows: T[] = []): T[] {
  const rowsByKey = new Map<string, T>();

  primaryRows.forEach((row) => rowsByKey.set(row.key, row));
  comparisonRows.forEach((row) => {
    if (!rowsByKey.has(row.key)) {
      rowsByKey.set(row.key, {
        ...row,
        value: 0,
        percentage: 0
      });
    }
  });

  return Array.from(rowsByKey.values())
    .sort((a, b) => {
      const comparisonA = comparisonRows.find((row) => row.key === a.key)?.value || 0;
      const comparisonB = comparisonRows.find((row) => row.key === b.key)?.value || 0;
      return b.value - a.value || comparisonB - comparisonA || a.label.localeCompare(b.label);
    });
}

function getComparisonRow<T extends AggregateRow>(comparisonRows: T[] | undefined, key: string) {
  return comparisonRows?.find((row) => row.key === key);
}

type MonthlyMatrixSeries = {
  key: string;
  label: string;
  points: Array<{ key: string; label: string; value: number }>;
};

const MONTHLY_MATRIX_PAGE_SIZE = 5;

function MonthlyBreakdownMatrix({
  series,
  comparisonSeries = [],
  valueLabel,
  ariaLabel,
  primaryLabel,
  comparisonLabel,
  getSeriesColor
}: {
  series: MonthlyMatrixSeries[];
  comparisonSeries?: MonthlyMatrixSeries[];
  valueLabel: string;
  ariaLabel: string;
  primaryLabel?: string;
  comparisonLabel?: string;
  getSeriesColor?: (series: MonthlyMatrixSeries, index: number) => string;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(series.length / MONTHLY_MATRIX_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * MONTHLY_MATRIX_PAGE_SIZE;
  const pagedSeries = series.slice(pageStart, pageStart + MONTHLY_MATRIX_PAGE_SIZE);
  const periods = series[0]?.points || [];
  const hasComparison = comparisonSeries.length > 0;
  const comparisonByKey = new Map(comparisonSeries.map((item) => [item.key, item]));
  const seriesColor = (item: MonthlyMatrixSeries, index: number) => (
    getSeriesColor?.(item, index) || chartPalette[index % chartPalette.length]
  );

  useEffect(() => {
    setPage(1);
  }, [series, comparisonSeries]);

  if (series.length === 0 || periods.length === 0) {
    return <EmptyChartRow text={tr('当前时间段没有月度数据', 'No monthly data in this timeframe', 'Tiada data bulanan dalam tempoh ini')} />;
  }

  return (
    <section className="overflow-hidden rounded-xl bg-slate-50" aria-label={`${ariaLabel} monthly breakdown`}>
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{tr('每月明细', 'Monthly breakdown', 'Pecahan bulanan')}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            {tr('每一行显示一个分组在各月份的实际数量。', 'Each row shows the actual count for one group in every month.', 'Setiap baris menunjukkan kiraan sebenar satu kumpulan bagi setiap bulan.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-full bg-white px-2.5 py-1">{primaryLabel || tr('当前范围', 'Current range', 'Julat semasa')}</span>
          {hasComparison && <span className="rounded-full bg-white px-2.5 py-1 text-slate-500">vs {comparisonLabel || tr('对比范围', 'Comparison range', 'Julat perbandingan')}</span>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-max table-fixed text-left text-xs">
          <thead className="bg-white/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="sticky left-0 z-10 w-48 bg-slate-50 px-4 py-2.5">{tr('分组', 'Group', 'Kumpulan')}</th>
              {periods.map((period) => <th key={period.key} className="w-20 px-2 py-2.5 text-right">{period.label}</th>)}
              <th className="w-24 px-4 py-2.5 text-right">{tr('总数', 'Total', 'Jumlah')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedSeries.map((item, localIndex) => {
              const globalIndex = pageStart + localIndex;
              const comparison = comparisonByKey.get(item.key);
              const total = item.points.reduce((sum, point) => sum + point.value, 0);
              const comparisonTotal = comparison?.points.reduce((sum, point) => sum + point.value, 0) || 0;

              return (
                <tr key={item.key} className="hover:bg-white/70">
                  <td className="sticky left-0 z-10 w-48 bg-slate-50 px-4 py-2.5 font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seriesColor(item, globalIndex) }} />
                      <span className="max-w-36 truncate" title={item.label}>{item.label}</span>
                    </span>
                  </td>
                  {item.points.map((point, pointIndex) => {
                    const comparisonValue = comparison?.points[pointIndex]?.value || 0;
                    return (
                      <td
                        key={point.key}
                        className="px-2 py-2.5 text-right font-mono font-bold text-slate-700"
                        title={`${point.label} · ${item.label}: ${point.value} ${valueLabel}${hasComparison ? ` / ${comparisonValue}` : ''}`}
                      >
                        {point.value.toLocaleString()}
                        {hasComparison && <span className="ml-1 text-[10px] font-semibold text-slate-500">/{comparisonValue.toLocaleString()}</span>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600">
                    {total.toLocaleString()}
                    {hasComparison && <span className="ml-1 text-[10px] font-semibold text-slate-500">/{comparisonTotal.toLocaleString()}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white/50 px-4 py-2.5">
        <span className="font-mono text-[11px] font-bold text-slate-500">
          {pageStart + 1}–{Math.min(pageStart + MONTHLY_MATRIX_PAGE_SIZE, series.length)} / {series.length}
        </span>
        <div className="flex items-center gap-2" aria-label={tr('月度明细分页', 'Monthly breakdown pagination', 'Penomboran pecahan bulanan')}>
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1} className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-xs disabled:cursor-not-allowed disabled:opacity-40">
            {tr('上一页', 'Previous', 'Sebelumnya')}
          </button>
          <span className="min-w-12 text-center font-mono text-[11px] font-bold text-slate-500">{safePage} / {pageCount}</span>
          <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={safePage >= pageCount} className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-xs disabled:cursor-not-allowed disabled:opacity-40">
            {tr('下一页', 'Next', 'Seterusnya')}
          </button>
        </div>
      </div>
    </section>
  );
}

function SharedAggregateVisual({
  rows,
  visualMode,
  valueLabel,
  emptyText,
  ariaLabel,
  trendSeries = [],
  comparisonRows = [],
  comparisonTrendSeries = [],
  primaryLabel,
  comparisonLabel,
  colorMode = 'default',
  staffColorMap,
  getRowColor,
  showBarValueOnHoverOnly = false,
  expandToContent = false,
  monthlyView = false
}: {
  rows: (AggregateRow & { meta?: string })[];
  visualMode: AnalyticsVisualMode;
  valueLabel: string;
  emptyText: string;
  ariaLabel: string;
  trendSeries?: AggregateTrendSeries[];
  comparisonRows?: (AggregateRow & { meta?: string })[];
  comparisonTrendSeries?: AggregateTrendSeries[];
  primaryLabel?: string;
  comparisonLabel?: string;
  colorMode?: 'default' | 'staff';
  staffColorMap?: Map<string, string>;
  getRowColor?: (row: AggregateRow, index: number) => string;
  showBarValueOnHoverOnly?: boolean;
  expandToContent?: boolean;
  monthlyView?: boolean;
}) {
  const [trendHover, setTrendHover] = useState<{
    x: number; y: number; period: string; series: string; value: number; color: string;
  } | null>(null);
  const hasComparison = comparisonRows.length > 0;
  const mergedRows = hasComparison ? mergeComparisonRows(rows, comparisonRows) : rows;
  const chartRows = mergedRows.filter((row) => row.value > 0 || Boolean(getComparisonRow(comparisonRows, row.key)?.value));
  const maxValue = Math.max(...chartRows.map((row) => Math.max(row.value, getComparisonRow(comparisonRows, row.key)?.value || 0)), 1);
  const totalValue = chartRows.reduce((sum, row) => sum + row.value, 0);
  const rowColor = (row: AggregateRow, index: number) => (
    getRowColor
      ? getRowColor(row, index)
      : colorMode === 'staff'
        ? getStaffColor(row.label, staffColorMap)
        : chartPalette[index % chartPalette.length]
  );
  const compactNumber = (value: number) => new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1
  }).format(value);

  if (monthlyView) {
    return (
      <MonthlyBreakdownMatrix
        series={trendSeries}
        comparisonSeries={comparisonTrendSeries}
        valueLabel={valueLabel}
        ariaLabel={ariaLabel}
        primaryLabel={primaryLabel}
        comparisonLabel={comparisonLabel}
        getSeriesColor={(item, index) => rowColor({ key: item.key, label: item.label, value: 0, percentage: 0 }, index)}
      />
    );
  }

  if (chartRows.length === 0) {
    return <EmptyChartRow text={emptyText} />;
  }

  if (visualMode === 'donut') {
    const radius = 52;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    let accumulatedLength = 0;

    return (
      <div className={`grid grid-cols-1 gap-5 rounded-xl bg-slate-50 p-5 lg:grid-cols-[260px_1fr] ${expandToContent ? 'min-h-[360px]' : 'h-[360px] overflow-hidden'}`}>
        <div className="relative mx-auto flex h-[240px] w-[240px] items-center justify-center self-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140" role="img" aria-label={`${ariaLabel} donut`}>
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
            {chartRows.map((row, index) => {
              const segmentLength = totalValue > 0 ? (row.value / totalValue) * circumference : 0;
              const dashOffset = -accumulatedLength;
              accumulatedLength += segmentLength;

              return (
                <circle
                  key={row.key}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={rowColor(row, index)}
                  strokeLinecap="round"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${Math.max(segmentLength - 3, 0)} ${circumference}`}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono text-3xl font-bold text-slate-900">{compactNumber(totalValue)}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{valueLabel}</p>
          </div>
        </div>

        <div className={`space-y-2 pr-1 ${expandToContent ? '' : 'overflow-y-auto'}`}>
          {rows.map((row, index) => (
            <div key={row.key} className="rounded-lg bg-white px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: rowColor(row, index) }} />
                  <span className="truncate font-semibold text-slate-700">{row.label}</span>
                </div>
                <span className="shrink-0 rounded-md bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600">{row.percentage}%</span>
              </div>
              <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">
                {row.value} {valueLabel}{row.meta ? ` · ${row.meta}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visualMode === 'combo') {
    const topRows = chartRows.slice(0, 8);
    const chartWidth = 880;
    const chartHeight = 280;
    const margin = { top: 28, right: 58, bottom: 54, left: 54 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;
    const getY = (value: number) => margin.top + innerHeight - (value / maxValue) * innerHeight;
    const getShareY = (value: number) => margin.top + innerHeight - (value / 100) * innerHeight;
    const points = topRows.map((row, index) => {
      const x = topRows.length === 1
        ? margin.left + innerWidth / 2
        : margin.left + (index / (topRows.length - 1)) * innerWidth;
      return { x, y: getShareY(row.percentage), row };
    });
    const comparisonPoints = topRows.map((row, index) => {
      const comparisonRow = getComparisonRow(comparisonRows, row.key);
      const x = topRows.length === 1
        ? margin.left + innerWidth / 2
        : margin.left + (index / (topRows.length - 1)) * innerWidth;
      return {
        x,
        y: getShareY(comparisonRow?.percentage || 0),
        row,
        comparisonRow
      };
    });
    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const comparisonLinePath = comparisonPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const groupBarWidth = Math.min(48, Math.max(24, innerWidth / Math.max(topRows.length, 1) * 0.38));
    const barWidth = hasComparison ? Math.max(12, groupBarWidth * 0.44) : groupBarWidth;
    const barGap = hasComparison ? 4 : 0;

    return (
      <div className="h-[360px] overflow-hidden rounded-xl bg-slate-50 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{tr('数量 + 占比', 'Count + Share', "Kira + Kongsi")}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{ariaLabel}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {hasComparison && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-1.5 w-5 rounded-full bg-red-800" />
                  {primaryLabel || tra('Primary')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-0 w-5 border-t-2 border-dashed border-slate-400" />
                  {comparisonLabel || tra('Compare')}
                </span>
              </>
            )}
            <span className="font-mono text-xs font-bold text-slate-500">{tr(`前 ${topRows.length}`, `Top ${topRows.length}`, `${topRows.length} teratas`)}</span>
          </div>
        </div>
        <div className="h-[294px] overflow-hidden">
          <svg className="h-full w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${ariaLabel} combo`}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const countValue = Math.round(maxValue * ratio);
              const y = getY(countValue);

              return (
                <g key={ratio}>
                  <line x1={margin.left} x2={chartWidth - margin.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                  <text x={margin.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-semibold">
                    {compactNumber(countValue)}
                  </text>
                  <text x={chartWidth - margin.right + 12} y={y + 4} className="fill-slate-400 text-[11px] font-semibold">
                    {Math.round(ratio * 100)}%
                  </text>
                </g>
              );
            })}
            {topRows.map((row, index) => {
              const point = points[index];
              const comparisonValue = getComparisonRow(comparisonRows, row.key)?.value || 0;
              const barY = getY(row.value);
              const barHeight = margin.top + innerHeight - barY;
              const comparisonBarY = getY(comparisonValue);
              const comparisonBarHeight = margin.top + innerHeight - comparisonBarY;
              const primaryX = hasComparison ? point.x - barGap / 2 - barWidth : point.x - barWidth / 2;
              const comparisonX = point.x + barGap / 2;

              return (
                <g key={row.key}>
                  {hasComparison && (
                    <rect
                      x={comparisonX}
                      y={comparisonBarY}
                      width={barWidth}
                      height={comparisonBarHeight}
                      rx="8"
                      fill="white"
                      stroke={rowColor(row, index)}
                      strokeDasharray="4 3"
                      strokeWidth="2"
                      opacity="0.95"
                    />
                  )}
                  <rect
                    x={primaryX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="8"
                    fill={rowColor(row, index)}
                    opacity="0.88"
                  />
                  <text x={hasComparison ? primaryX + barWidth / 2 : point.x} y={Math.max(barY - 8, 12)} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">
                    {compactNumber(row.value)}
                  </text>
                  {hasComparison && comparisonValue > 0 && (
                    <text x={comparisonX + barWidth / 2} y={Math.max(comparisonBarY - 8, 12)} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                      {compactNumber(comparisonValue)}
                    </text>
                  )}
                </g>
              );
            })}
            {linePath && <path d={linePath} fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />}
            {hasComparison && comparisonLinePath && <path d={comparisonLinePath} fill="none" stroke="#64748b" strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />}
            {points.map((point) => (
              <g key={`${point.row.key}-share`}>
                <circle cx={point.x} cy={point.y} r="4.5" fill="white" stroke="#0f172a" strokeWidth="3" />
                {hasComparison && (
                  <circle cx={point.x} cy={comparisonPoints.find((comparisonPoint) => comparisonPoint.row.key === point.row.key)?.y || getShareY(0)} r="4" fill="white" stroke="#64748b" strokeDasharray="2 2" strokeWidth="2.5" />
                )}
                <text x={point.x} y={Math.max(point.y - 10, 12)} textAnchor="middle" className="fill-slate-900 text-[11px] font-bold">
                  {point.row.percentage}%
                </text>
                <text x={point.x} y={margin.top + innerHeight + 24} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                  {point.row.label.length > 12 ? `${point.row.label.slice(0, 12)}...` : point.row.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }

  if (visualMode === 'trend') {
    const series = trendSeries.length > 0 ? trendSeries : buildSnapshotTrendSeries(rows);
    const comparisonSeries = comparisonTrendSeries.length > 0
      ? comparisonTrendSeries
      : hasComparison
        ? buildSnapshotTrendSeries(comparisonRows)
        : [];
    const trendPoints = [...series, ...comparisonSeries].flatMap((item) => item.points);
    const periods = series[0]?.points || [];
    const maxTrendValue = Math.max(...trendPoints.map((point) => point.value), 1);
    const chartWidth = 880;
    const chartHeight = 280;
    const margin = { top: 30, right: 30, bottom: 52, left: 54 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;
    const getX = (index: number) => periods.length <= 1
      ? margin.left + innerWidth / 2
      : margin.left + (index / (periods.length - 1)) * innerWidth;
    const getSeriesX = (index: number, pointCount: number) => pointCount <= 1
      ? margin.left + innerWidth / 2
      : margin.left + (index / (pointCount - 1)) * innerWidth;
    const getY = (value: number) => margin.top + innerHeight - (value / maxTrendValue) * innerHeight;
    const trendTickIndexes = getTrendTickIndexes(periods.length);

    return (
      <div className="h-[360px] overflow-hidden rounded-xl bg-slate-50 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{tr('趋势', 'Trend', "Trend")}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{ariaLabel} · {tr(`前 ${series.length}`, `top ${series.length}`, `atas ${series.length}`)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {hasComparison && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-1.5 w-5 rounded-full bg-red-800" />
                  {primaryLabel || tra('Primary')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-0 w-5 border-t-2 border-dashed border-slate-400" />
                  {comparisonLabel || tra('Compare')}
                </span>
              </>
            )}
            {series.map((item, index) => (
              <span key={item.key} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />
                {item.label.length > 16 ? `${item.label.slice(0, 16)}...` : item.label}
              </span>
            ))}
          </div>
        </div>
        <div className="h-[294px] overflow-hidden">
          {series.length === 0 || periods.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
              {tr('当前时间段没有足够的趋势数据', 'Not enough trend data in this timeframe', "Data aliran tidak mencukupi dalam jangka masa ini")}
            </div>
          ) : (
            <svg className="h-full w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${ariaLabel} trend`}>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const value = Math.round(maxTrendValue * ratio);
                const y = getY(value);

                return (
                  <g key={ratio}>
                    <line x1={margin.left} x2={chartWidth - margin.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text x={margin.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-semibold">
                      {compactNumber(value)}
                    </text>
                  </g>
                );
              })}
              {series.map((item, seriesIndex) => {
                const path = item.points
                  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`)
                  .join(' ');

                return (
                  <g key={item.key}>
                    <path d={path} fill="none" stroke={chartPalette[seriesIndex % chartPalette.length]} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
                    {item.points.map((point, index) => (
                      <circle
                        key={`${item.key}-${point.key}`}
                        cx={getX(index)}
                        cy={getY(point.value)}
                        r="3.5"
                        fill="white"
                        stroke={chartPalette[seriesIndex % chartPalette.length]}
                        strokeWidth="2.5"
                        className="cursor-pointer"
                        onMouseEnter={() => setTrendHover({ x: getX(index), y: getY(point.value), period: point.label, series: item.label, value: point.value, color: chartPalette[seriesIndex % chartPalette.length] })}
                        onMouseLeave={() => setTrendHover(null)}
                      >
                        <title>{`${point.label} · ${item.label}: ${point.value} ${valueLabel}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
              {comparisonSeries.map((item, seriesIndex) => {
                const path = item.points
                  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getSeriesX(index, item.points.length)} ${getY(point.value)}`)
                  .join(' ');
                const stroke = chartPalette[seriesIndex % chartPalette.length];

                return (
                  <g key={`${item.key}-compare`}>
                    <path d={path} fill="none" stroke={stroke} strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" opacity="0.75" />
                    {item.points.map((point, index) => (
                      <circle
                        key={`${item.key}-${point.key}-compare`}
                        cx={getSeriesX(index, item.points.length)}
                        cy={getY(point.value)}
                        r="3"
                        fill="white"
                        stroke={stroke}
                        strokeDasharray="2 2"
                        strokeWidth="2"
                        opacity="0.8"
                        className="cursor-pointer"
                        onMouseEnter={() => setTrendHover({ x: getSeriesX(index, item.points.length), y: getY(point.value), period: point.label, series: `${item.label} (${comparisonLabel || tra('Compare')})`, value: point.value, color: stroke })}
                        onMouseLeave={() => setTrendHover(null)}
                      >
                        <title>{`${point.label} · ${item.label} (${comparisonLabel || tra('Compare')}): ${point.value} ${valueLabel}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
              {periods.map((period, index) => trendTickIndexes.has(index) && (
                <text key={period.key} x={getX(index)} y={margin.top + innerHeight + 24} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                  {period.label}
                </text>
              ))}
              {trendHover && (() => {
                const width = 190;
                const x = Math.min(Math.max(trendHover.x - width / 2, margin.left), chartWidth - margin.right - width);
                const y = trendHover.y > 78 ? trendHover.y - 58 : trendHover.y + 14;
                return (
                  <g pointerEvents="none">
                    <rect x={x} y={y} width={width} height="46" rx="9" fill="#0f172a" opacity="0.96" />
                    <circle cx={x + 13} cy={y + 15} r="4" fill={trendHover.color} />
                    <text x={x + 23} y={y + 18} className="fill-slate-300 text-[11px] font-semibold">{trendHover.period}</text>
                    <text x={x + 12} y={y + 35} className="fill-white text-xs font-bold">{`${trendHover.series}: ${trendHover.value} ${valueLabel}`}</text>
                  </g>
                );
              })()}
            </svg>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-slate-50 p-5 ${expandToContent ? 'min-h-[360px]' : 'h-[360px] overflow-y-auto'}`}>
      {hasComparison && (
        <div className="mb-3 flex flex-wrap justify-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
            <span className="h-2 w-5 rounded-full bg-red-800" />
            {primaryLabel || 'Primary'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
            <span className="h-2 w-5 rounded-full border border-dashed border-slate-400 bg-white" />
            {comparisonLabel || 'Compare'}
          </span>
        </div>
      )}
      <div className="space-y-2 pr-1">
        {chartRows.map((row, index) => {
          const comparisonRow = getComparisonRow(comparisonRows, row.key);
          const comparisonValue = comparisonRow?.value || 0;
          const primaryWidth = Math.max((row.value / maxValue) * 100, row.value > 0 ? 5 : 0);
          const comparisonWidth = Math.max((comparisonValue / maxValue) * 100, comparisonValue > 0 ? 5 : 0);

          return (
          <div
            key={row.key}
            className="group rounded-lg bg-white px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            tabIndex={showBarValueOnHoverOnly ? 0 : undefined}
            aria-label={showBarValueOnHoverOnly ? `${row.label}: ${row.value.toLocaleString()}` : undefined}
          >
            <div className={`mb-1.5 flex items-center gap-2 text-xs ${showBarValueOnHoverOnly ? 'justify-end' : 'justify-between'}`}>
              {!showBarValueOnHoverOnly && (
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: rowColor(row, index) }} />
                  <span className="truncate font-semibold text-slate-700">{row.label}</span>
                </div>
              )}
              <div className="flex shrink-0 items-center gap-1.5">
                {showBarValueOnHoverOnly && (
                  <span
                    role="tooltip"
                    className="rounded-md bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                  >
                    {row.value.toLocaleString()}{hasComparison ? ` / ${comparisonValue.toLocaleString()}` : ''}
                  </span>
                )}
                {hasComparison && (
                  <span className="rounded-md bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-500">{comparisonRow?.percentage || 0}%</span>
                )}
                <span className="rounded-md bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600">{row.percentage}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showBarValueOnHoverOnly && (
                <div className="flex w-24 shrink-0 items-center gap-2 text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: rowColor(row, index) }} />
                  <span className="truncate font-semibold text-slate-700">{row.label}</span>
                </div>
              )}
              {!showBarValueOnHoverOnly && (
                <span className="w-20 shrink-0 font-mono text-[11px] text-slate-500">
                  {row.value}{hasComparison ? ` / ${comparisonValue}` : ''} {valueLabel}
                </span>
              )}
              <div className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                {hasComparison && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full border border-dashed bg-white/60"
                    style={{
                      width: `${comparisonWidth}%`,
                      borderColor: rowColor(row, index)
                    }}
                  />
                )}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${primaryWidth}%`,
                    backgroundColor: rowColor(row, index)
                  }}
                />
              </div>
            </div>
            {row.meta && (
              <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">{row.meta}</p>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBars({
  title,
  subtitle,
  rows,
  emptyText,
  valueLabel = 'clicks',
  visualMode,
  colorMode = 'default',
  staffColorMap,
  trendSeries,
  comparisonRows = [],
  comparisonTrendSeries = [],
  primaryLabel,
  comparisonLabel,
  monthlyView = false
}: {
  title: string;
  subtitle: string;
  rows: AggregateRow[];
  emptyText: string;
  valueLabel?: string;
  visualMode: AnalyticsVisualMode;
  colorMode?: 'default' | 'staff';
  staffColorMap?: Map<string, string>;
  trendSeries?: AggregateTrendSeries[];
  comparisonRows?: AggregateRow[];
  comparisonTrendSeries?: AggregateTrendSeries[];
  primaryLabel?: string;
  comparisonLabel?: string;
  monthlyView?: boolean;
}) {
  const hasComparison = comparisonRows.length > 0;
  const mergedRows = hasComparison ? mergeComparisonRows(rows, comparisonRows) : rows;
  const maxValue = Math.max(...mergedRows.map((row) => Math.max(row.value, getComparisonRow(comparisonRows, row.key)?.value || 0)), 1);
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
  const chartRows = mergedRows.filter((row) => row.value > 0 || Boolean(getComparisonRow(comparisonRows, row.key)?.value));
  const radius = 42;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  let accumulatedLength = 0;
  const getRowHexColor = (row: AggregateRow, index: number) => (
    colorMode === 'staff' ? getStaffColor(row.label, staffColorMap) : chartPalette[index % chartPalette.length]
  );

  if (monthlyView || visualMode === 'combo' || visualMode === 'trend') {
    return (
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex min-h-[46px] items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          {visualMode === 'trend' ? (
            <Activity className="h-4 w-4 text-slate-300" />
          ) : (
            <BarChart3 className="h-4 w-4 text-slate-300" />
          )}
        </div>
        <SharedAggregateVisual
          rows={rows}
          visualMode={visualMode}
          valueLabel={valueLabel}
          emptyText={emptyText ?? tr('还没有数据', 'No data yet', "Tiada data lagi")}
          ariaLabel={title}
          trendSeries={trendSeries}
          comparisonRows={comparisonRows}
          comparisonTrendSeries={comparisonTrendSeries}
          primaryLabel={primaryLabel}
          comparisonLabel={comparisonLabel}
          colorMode={colorMode}
          staffColorMap={staffColorMap}
          getRowColor={getRowHexColor}
          monthlyView={monthlyView}
        />
      </section>
    );
  }

  return (
    <section className="h-[380px] overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex min-h-[46px] items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {visualMode === 'donut' ? (
          <PieChart className="h-4 w-4 text-slate-300" />
        ) : (
          <BarChart3 className="h-4 w-4 text-slate-300" />
        )}
      </div>

      {chartRows.length === 0 ? (
        <EmptyChartRow text={emptyText} />
      ) : visualMode === 'donut' ? (
        <div className="grid h-[290px] grid-rows-[136px_1fr] gap-3 overflow-hidden">
          <div className="relative mx-auto h-[132px] w-[132px]">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label={`${title} chart`}>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {chartRows.map((row, index) => {
                const segmentLength = totalValue > 0 ? (row.value / totalValue) * circumference : 0;
                const dashOffset = -accumulatedLength;
                const rowColor = getRowHexColor(row, index);
                accumulatedLength += segmentLength;

                return (
                  <circle
                    key={row.key}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={rowColor}
                    strokeLinecap="round"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${Math.max(segmentLength - 2, 0)} ${circumference}`}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-mono text-xl font-bold text-slate-900">{totalValue}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{valueLabel}</p>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1">
            {rows.slice(0, 6).map((row, index) => (
              <div key={row.key} className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: getRowHexColor(row, index) }} />
                    <span className="truncate font-semibold text-slate-700">{row.label}</span>
                  </div>
                  <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600 shadow-xs">{row.percentage}%</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-14 shrink-0 font-mono text-[11px] text-slate-500">{row.value} {valueLabel}</span>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max((row.value / maxValue) * 100, 5)}%`,
                        backgroundColor: getRowHexColor(row, index)
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {rows.length > 6 && (
              <p className="px-1 text-[11px] font-semibold text-slate-500">+{rows.length - 6} more rows in this group</p>
            )}
          </div>
        </div>
      ) : (
        <div className="h-[290px] space-y-2 overflow-y-auto pr-1">
          {hasComparison && (
            <div className="flex flex-wrap justify-end gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500">
                <span className="h-2 w-5 rounded-full bg-red-800" />
                {primaryLabel || 'Primary'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500">
                <span className="h-2 w-5 rounded-full border border-dashed border-slate-400 bg-white" />
                {comparisonLabel || 'Compare'}
              </span>
            </div>
          )}
          {chartRows.map((row, index) => {
            const comparisonRow = getComparisonRow(comparisonRows, row.key);
            const comparisonValue = comparisonRow?.value || 0;
            const rowHexColor = colorMode === 'staff' ? getStaffColor(row.label, staffColorMap) : chartPalette[index % chartPalette.length];

            return (
              <div key={row.key} className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${colorMode === 'staff' ? '' : palette[index % palette.length]}`}
                      style={colorMode === 'staff' ? { backgroundColor: getStaffColor(row.label, staffColorMap) } : undefined}
                    />
                    <span className="truncate font-semibold text-slate-700">{row.label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {hasComparison && <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-500 shadow-xs">{comparisonRow?.percentage || 0}%</span>}
                    <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600 shadow-xs">{row.percentage}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 font-mono text-[11px] text-slate-500">{row.value}{hasComparison ? ` / ${comparisonValue}` : ''} {valueLabel}</span>
                  <div className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white">
                    {hasComparison && (
                      <div
                        className="absolute inset-y-0 left-0 rounded-full border border-dashed bg-white/70"
                        style={{
                          width: `${Math.max((comparisonValue / maxValue) * 100, comparisonValue > 0 ? 5 : 0)}%`,
                          borderColor: rowHexColor
                        }}
                      />
                    )}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${colorMode === 'staff' ? '' : palette[index % palette.length]}`}
                      style={{
                        width: `${Math.max((row.value / maxValue) * 100, row.value > 0 ? 5 : 0)}%`,
                        ...(colorMode === 'staff' ? { backgroundColor: getStaffColor(row.label, staffColorMap) } : {})
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MarketingPerformanceVisual({
  rows,
  visualMode,
  breakdown,
  staffColorMap,
  trendSeries,
  comparisonRows,
  comparisonTrendSeries,
  primaryLabel,
  comparisonLabel,
  monthlyView = false
}: {
  rows: MarketingPerformanceRow[];
  visualMode: AnalyticsVisualMode;
  breakdown: MarketingBreakdown;
  staffColorMap?: Map<string, string>;
  trendSeries?: AggregateTrendSeries[];
  comparisonRows?: MarketingPerformanceRow[];
  comparisonTrendSeries?: AggregateTrendSeries[];
  primaryLabel?: string;
  comparisonLabel?: string;
  monthlyView?: boolean;
}) {
  const getRowColor = (row: MarketingPerformanceRow, index: number) => (
    breakdown === 'sales' || breakdown === 'link'
      ? getStaffColor(row.salesName || row.label, staffColorMap)
      : chartPalette[index % chartPalette.length]
  );

  return (
    <SharedAggregateVisual
      rows={rows}
      visualMode={visualMode}
      valueLabel="clicks"
      emptyText={tr('还没有营销点击数据', 'No marketing click data yet', "Tiada data klik pemasaran lagi")}
      ariaLabel="Marketing Performance"
      trendSeries={trendSeries}
      comparisonRows={comparisonRows}
      comparisonTrendSeries={comparisonTrendSeries}
      primaryLabel={primaryLabel}
      comparisonLabel={comparisonLabel}
      getRowColor={(row, index) => getRowColor(row as MarketingPerformanceRow, index)}
      monthlyView={monthlyView}
    />
  );
}

function OperationsPerformanceVisual({
  rows,
  visualMode,
  valueLabel,
  colorMode = 'default',
  staffColorMap,
  ariaLabel = 'Operations Performance',
  emptyText,
  trendSeries,
  comparisonRows,
  comparisonTrendSeries,
  primaryLabel,
  comparisonLabel,
  monthlyView = false
}: {
  rows: (AggregateRow & { meta?: string })[];
  visualMode: AnalyticsVisualMode;
  valueLabel: string;
  colorMode?: 'default' | 'staff';
  staffColorMap?: Map<string, string>;
  ariaLabel?: string;
  emptyText?: string;
  trendSeries?: AggregateTrendSeries[];
  comparisonRows?: (AggregateRow & { meta?: string })[];
  comparisonTrendSeries?: AggregateTrendSeries[];
  primaryLabel?: string;
  comparisonLabel?: string;
  monthlyView?: boolean;
}) {
  const getRowColor = (row: AggregateRow, index: number) => (
    colorMode === 'staff' ? getStaffColor(row.label, staffColorMap) : chartPalette[index % chartPalette.length]
  );

  return (
    <SharedAggregateVisual
      rows={rows}
      visualMode={visualMode}
      valueLabel={valueLabel}
      emptyText={emptyText ?? tr('还没有数据', 'No data yet', "Tiada data lagi")}
      ariaLabel={ariaLabel}
      trendSeries={trendSeries}
      comparisonRows={comparisonRows}
      comparisonTrendSeries={comparisonTrendSeries}
      primaryLabel={primaryLabel}
      comparisonLabel={comparisonLabel}
      colorMode={colorMode}
      staffColorMap={staffColorMap}
      getRowColor={getRowColor}
      monthlyView={monthlyView}
    />
  );
}

function VehicleDemandVisual({
  rows,
  trendSeries,
  comparisonRows = [],
  comparisonTrendSeries = [],
  mode,
  valueLabel,
  timeframeLabel,
  primaryLabel,
  comparisonLabel,
  monthlyView = false
}: {
  rows: VehicleDemandRow[];
  trendSeries: VehicleDemandTrendSeries[];
  comparisonRows?: VehicleDemandRow[];
  comparisonTrendSeries?: VehicleDemandTrendSeries[];
  mode: VehicleDemandVisualMode;
  valueLabel: string;
  timeframeLabel: string;
  primaryLabel?: string;
  comparisonLabel?: string;
  monthlyView?: boolean;
}) {
  const [trendHover, setTrendHover] = useState<{
    x: number; y: number; period: string; series: string; value: number; color: string;
  } | null>(null);
  const hasComparison = comparisonRows.length > 0;
  const chartRows = (hasComparison ? mergeComparisonRows(rows, comparisonRows) : rows)
    .filter((row) => row.value > 0 || Boolean(getComparisonRow(comparisonRows, row.key)?.value))
    .slice(0, 8);
  const maxValue = Math.max(...chartRows.map((row) => Math.max(row.value, getComparisonRow(comparisonRows, row.key)?.value || 0)), 1);
  const totalValue = chartRows.reduce((sum, row) => sum + row.value, 0);
  const chartWidth = 880;
  const chartHeight = 280;
  const margin = { top: 26, right: mode === 'combo' ? 58 : 28, bottom: 52, left: 54 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  const getY = (value: number) => margin.top + innerHeight - (value / maxValue) * innerHeight;
  const compactNumber = (value: number) => new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1
  }).format(value);
  const getColor = (rowLabel: string, index: number) => (
    rowLabel === 'Not set' || rowLabel === 'Unknown model' ? '#94a3b8' : chartPalette[index % chartPalette.length]
  );
  const cardClassName = 'h-[380px] overflow-hidden rounded-xl bg-slate-50 p-4';
  const visualLabel = VEHICLE_DEMAND_VISUAL_OPTIONS.find((option) => option.value === mode)?.label || 'Bar';

  if (monthlyView) {
    return (
      <MonthlyBreakdownMatrix
        series={trendSeries}
        comparisonSeries={comparisonTrendSeries}
        valueLabel={tr('台数', 'units', 'unit')}
        ariaLabel={`${valueLabel} monthly demand`}
        primaryLabel={primaryLabel}
        comparisonLabel={comparisonLabel}
        getSeriesColor={(item, index) => getColor(item.label, index)}
      />
    );
  }

  if (chartRows.length === 0) {
    return <EmptyChartRow text={tr('本周暂无车辆需求数据', 'No vehicle demand this period', "Tiada permintaan kenderaan dalam tempoh ini")} />;
  }

  if (mode === 'donut') {
    const radius = 74;
    const strokeWidth = 18;
    const circumference = 2 * Math.PI * radius;
    let accumulatedLength = 0;

    return (
      <div className={cardClassName}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{valueLabel} Composition</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{timeframeLabel}</p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-500">{compactNumber(totalValue)} units</span>
        </div>
        <div className="grid h-[304px] grid-cols-1 items-center gap-5 lg:grid-cols-[320px_1fr]">
          <div className="flex items-center justify-center">
            <div className="relative h-[252px] w-[252px]">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 190 190" role="img" aria-label={`${valueLabel} donut`}>
                <circle cx="95" cy="95" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
                {chartRows.map((row, index) => {
                  const segmentLength = totalValue > 0 ? (row.value / totalValue) * circumference : 0;
                  const dashOffset = -accumulatedLength;
                  accumulatedLength += segmentLength;

                  return (
                    <circle
                      key={row.key}
                      cx="95"
                      cy="95"
                      r={radius}
                      fill="none"
                      stroke={getColor(row.label, index)}
                      strokeLinecap="round"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${Math.max(segmentLength - 2, 0)} ${circumference}`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-mono text-2xl font-bold text-slate-900">{compactNumber(totalValue)}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tra('units')}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {chartRows.slice(0, 6).map((row, index) => (
              <div key={row.key} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getColor(row.label, index) }} />
                  <span className="truncate text-xs font-bold text-slate-700">{row.label}</span>
                </div>
                <span className="shrink-0 font-mono text-xs font-bold text-slate-500">{row.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'combo') {
    const points = chartRows.map((row, index) => {
      const x = chartRows.length === 1
        ? margin.left + innerWidth / 2
        : margin.left + (index / (chartRows.length - 1)) * innerWidth;
      const y = margin.top + innerHeight - (row.approvalRate / 100) * innerHeight;

      return { x, y, row };
    });
    const comparisonPoints = chartRows.map((row, index) => {
      const comparisonRow = getComparisonRow(comparisonRows, row.key);
      const x = chartRows.length === 1
        ? margin.left + innerWidth / 2
        : margin.left + (index / (chartRows.length - 1)) * innerWidth;
      return {
        x,
        y: margin.top + innerHeight - ((comparisonRow?.approvalRate || 0) / 100) * innerHeight,
        row,
        comparisonRow
      };
    });
    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const comparisonLinePath = comparisonPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const groupBarWidth = Math.min(48, Math.max(24, innerWidth / Math.max(chartRows.length, 1) * 0.4));
    const barWidth = hasComparison ? Math.max(12, groupBarWidth * 0.44) : groupBarWidth;
    const barGap = hasComparison ? 4 : 0;

    return (
      <div className={cardClassName}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{valueLabel} Units + Approval</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{timeframeLabel}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {hasComparison && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-1.5 w-5 rounded-full bg-red-800" />
                  {primaryLabel || 'Primary'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-0 w-5 border-t-2 border-dashed border-slate-400" />
                  {comparisonLabel || 'Compare'}
                </span>
              </>
            )}
            <span className="font-mono text-xs font-bold text-slate-500">Top {chartRows.length}</span>
          </div>
        </div>
        <div className="h-[304px] overflow-hidden">
          <svg className="h-full w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${valueLabel} combo`}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = Math.round(maxValue * ratio);
              const y = getY(value);

              return (
                <g key={ratio}>
                  <line x1={margin.left} x2={chartWidth - margin.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                  <text x={margin.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-semibold">
                    {compactNumber(value)}
                  </text>
                  <text x={chartWidth - margin.right + 12} y={y + 4} className="fill-slate-400 text-[11px] font-semibold">
                    {Math.round(ratio * 100)}%
                  </text>
                </g>
              );
            })}
            {chartRows.map((row, index) => {
              const point = points[index];
              const comparisonValue = getComparisonRow(comparisonRows, row.key)?.value || 0;
              const barY = getY(row.value);
              const barHeight = margin.top + innerHeight - barY;
              const comparisonBarY = getY(comparisonValue);
              const comparisonBarHeight = margin.top + innerHeight - comparisonBarY;
              const primaryX = hasComparison ? point.x - barGap / 2 - barWidth : point.x - barWidth / 2;
              const comparisonX = point.x + barGap / 2;

              return (
                <g key={row.key}>
                  {hasComparison && (
                    <rect
                      x={comparisonX}
                      y={comparisonBarY}
                      width={barWidth}
                      height={comparisonBarHeight}
                      rx="8"
                      fill="white"
                      stroke={getColor(row.label, index)}
                      strokeDasharray="4 3"
                      strokeWidth="2"
                      opacity="0.95"
                    />
                  )}
                  <rect
                    x={primaryX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="8"
                    fill={getColor(row.label, index)}
                    opacity="0.88"
                  />
                  <text x={hasComparison ? primaryX + barWidth / 2 : point.x} y={Math.max(barY - 8, 12)} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">
                    {compactNumber(row.value)}
                  </text>
                  {hasComparison && comparisonValue > 0 && (
                    <text x={comparisonX + barWidth / 2} y={Math.max(comparisonBarY - 8, 12)} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                      {compactNumber(comparisonValue)}
                    </text>
                  )}
                </g>
              );
            })}
            <path d={linePath} fill="none" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
            {hasComparison && <path d={comparisonLinePath} fill="none" stroke="#64748b" strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />}
            {points.map((point) => (
              <circle key={`${point.row.key}-rate`} cx={point.x} cy={point.y} r="4.5" fill="white" stroke="#0f172a" strokeWidth="3" />
            ))}
            {hasComparison && comparisonPoints.map((point) => (
              <circle key={`${point.row.key}-compare-rate`} cx={point.x} cy={point.y} r="4" fill="white" stroke="#64748b" strokeDasharray="2 2" strokeWidth="2.5" />
            ))}
            {points.map((point) => (
              <g key={`${point.row.key}-label`}>
                <text x={point.x} y={margin.top + innerHeight + 24} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                  {point.row.label.length > 12 ? `${point.row.label.slice(0, 12)}...` : point.row.label}
                </text>
                <text x={point.x} y={Math.max(point.y - 10, 12)} textAnchor="middle" className="fill-slate-900 text-[11px] font-bold">
                  {point.row.approvalRate}%
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }

  if (mode === 'trend') {
    const trendPoints = [...trendSeries, ...comparisonTrendSeries].flatMap((series) => series.points);
    const maxTrendValue = Math.max(...trendPoints.map((point) => point.value), 1);
    const periods = trendSeries[0]?.points || [];
    const trendMargin = { top: 28, right: 28, bottom: 48, left: 54 };
    const trendInnerWidth = chartWidth - trendMargin.left - trendMargin.right;
    const trendInnerHeight = chartHeight - trendMargin.top - trendMargin.bottom;
    const getTrendX = (index: number) => periods.length <= 1
      ? trendMargin.left + trendInnerWidth / 2
      : trendMargin.left + (index / (periods.length - 1)) * trendInnerWidth;
    const getSeriesTrendX = (index: number, pointCount: number) => pointCount <= 1
      ? trendMargin.left + trendInnerWidth / 2
      : trendMargin.left + (index / (pointCount - 1)) * trendInnerWidth;
    const getTrendY = (value: number) => trendMargin.top + trendInnerHeight - (value / maxTrendValue) * trendInnerHeight;
    const trendTickIndexes = getTrendTickIndexes(periods.length);

    return (
      <div className={cardClassName}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{valueLabel} Trend</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{timeframeLabel} · top {trendSeries.length}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {hasComparison && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-1.5 w-5 rounded-full bg-red-800" />
                  {primaryLabel || 'Primary'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-0 w-5 border-t-2 border-dashed border-slate-400" />
                  {comparisonLabel || 'Compare'}
                </span>
              </>
            )}
            {trendSeries.map((series, index) => (
              <span key={series.key} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getColor(series.label, index) }} />
                {series.label.length > 16 ? `${series.label.slice(0, 16)}...` : series.label}
              </span>
            ))}
          </div>
        </div>
        <div className="h-[304px] overflow-hidden">
          {trendSeries.length === 0 || periods.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
              {tr('当前时间段没有足够的趋势数据', 'Not enough trend data in this timeframe', "Data aliran tidak mencukupi dalam jangka masa ini")}
            </div>
          ) : (
            <svg className="h-full w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${valueLabel} trend`}>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const value = Math.round(maxTrendValue * ratio);
                const y = getTrendY(value);

                return (
                  <g key={ratio}>
                    <line x1={trendMargin.left} x2={chartWidth - trendMargin.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text x={trendMargin.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-semibold">
                      {compactNumber(value)}
                    </text>
                  </g>
                );
              })}
              {trendSeries.map((series, seriesIndex) => {
                const path = series.points
                  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getTrendX(index)} ${getTrendY(point.value)}`)
                  .join(' ');

                return (
                  <g key={series.key}>
                    <path d={path} fill="none" stroke={getColor(series.label, seriesIndex)} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
                    {series.points.map((point, index) => (
                      <circle
                        key={`${series.key}-${point.key}`}
                        cx={getTrendX(index)}
                        cy={getTrendY(point.value)}
                        r="3.5"
                        fill="white"
                        stroke={getColor(series.label, seriesIndex)}
                        strokeWidth="2.5"
                        className="cursor-pointer"
                        onMouseEnter={() => setTrendHover({ x: getTrendX(index), y: getTrendY(point.value), period: point.label, series: series.label, value: point.value, color: getColor(series.label, seriesIndex) })}
                        onMouseLeave={() => setTrendHover(null)}
                      >
                        <title>{`${point.label} · ${series.label}: ${point.value} ${valueLabel}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
              {comparisonTrendSeries.map((series, seriesIndex) => {
                const path = series.points
                  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getSeriesTrendX(index, series.points.length)} ${getTrendY(point.value)}`)
                  .join(' ');
                const stroke = getColor(series.label, seriesIndex);

                return (
                  <g key={`${series.key}-compare`}>
                    <path d={path} fill="none" stroke={stroke} strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" opacity="0.75" />
                    {series.points.map((point, index) => (
                      <circle
                        key={`${series.key}-${point.key}-compare`}
                        cx={getSeriesTrendX(index, series.points.length)}
                        cy={getTrendY(point.value)}
                        r="3"
                        fill="white"
                        stroke={stroke}
                        strokeDasharray="2 2"
                        strokeWidth="2"
                        opacity="0.8"
                        className="cursor-pointer"
                        onMouseEnter={() => setTrendHover({ x: getSeriesTrendX(index, series.points.length), y: getTrendY(point.value), period: point.label, series: `${series.label} (${comparisonLabel || tra('Compare')})`, value: point.value, color: stroke })}
                        onMouseLeave={() => setTrendHover(null)}
                      >
                        <title>{`${point.label} · ${series.label} (${comparisonLabel || tra('Compare')}): ${point.value} ${valueLabel}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
              {periods.map((period, index) => trendTickIndexes.has(index) && (
                <text key={period.key} x={getTrendX(index)} y={trendMargin.top + trendInnerHeight + 24} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                  {period.label}
                </text>
              ))}
              {trendHover && (() => {
                const width = 190;
                const x = Math.min(Math.max(trendHover.x - width / 2, trendMargin.left), chartWidth - trendMargin.right - width);
                const y = trendHover.y > 78 ? trendHover.y - 58 : trendHover.y + 14;
                return (
                  <g pointerEvents="none">
                    <rect x={x} y={y} width={width} height="46" rx="9" fill="#0f172a" opacity="0.96" />
                    <circle cx={x + 13} cy={y + 15} r="4" fill={trendHover.color} />
                    <text x={x + 23} y={y + 18} className="fill-slate-300 text-[11px] font-semibold">{trendHover.period}</text>
                    <text x={x + 12} y={y + 35} className="fill-white text-xs font-bold">{`${trendHover.series}: ${trendHover.value} ${valueLabel}`}</text>
                  </g>
                );
              })()}
            </svg>
          )}
        </div>
      </div>
    );
  }

  const barHeight = 22;

  return (
      <div className={cardClassName}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{valueLabel} Ranking</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{timeframeLabel}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {hasComparison && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-2 w-5 rounded-full bg-red-800" />
                  {primaryLabel || 'Primary'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500">
                  <span className="h-2 w-5 rounded-full border border-dashed border-slate-400 bg-white" />
                  {comparisonLabel || 'Compare'}
                </span>
              </>
            )}
            <span className="font-mono text-xs font-bold text-slate-500">Top {chartRows.length}</span>
          </div>
      </div>
      <div className="h-[304px] overflow-hidden">
        <svg className="h-full w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${valueLabel} ${visualLabel}`}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = Math.round(maxValue * ratio);
            const x = margin.left + ratio * innerWidth;

            return (
              <g key={ratio}>
                <line className="model-ranking-grid-line" x1={x} x2={x} y1={margin.top} y2={margin.top + innerHeight} stroke="#e2e8f0" strokeWidth="1" />
                <text x={x} y={margin.top + innerHeight + 34} textAnchor="middle" className="model-ranking-axis-label fill-slate-400 text-[11px] font-semibold">
                  {compactNumber(value)}
                </text>
              </g>
            );
          })}
          {chartRows.map((row, index) => {
            const comparisonRow = getComparisonRow(comparisonRows, row.key);
            const comparisonValue = comparisonRow?.value || 0;
            const rowGap = innerHeight / Math.max(chartRows.length, 1);
            const y = margin.top + index * rowGap + Math.max((rowGap - barHeight) / 2, 2);
            const labelColumnWidth = 156;
            const barStartX = margin.left + labelColumnWidth;
            const barWidth = innerWidth - labelColumnWidth;
            const width = (row.value / maxValue) * barWidth;
            const comparisonWidth = (comparisonValue / maxValue) * barWidth;
            const rowColor = getColor(row.label, index);
            const labelText = row.label.length > 22 ? `${row.label.slice(0, 22)}...` : row.label;
            const valueX = Math.min(barStartX + Math.max(width, 18) + 12, chartWidth - margin.right - 112);
            const shareX = valueX + 54;

            return (
              <g key={row.key}>
                <text x={margin.left} y={y + barHeight / 2 + 4} className="model-ranking-row-label fill-slate-800 text-[11px] font-bold">
                  {labelText}
                </text>
                <rect className="model-ranking-track" x={barStartX} y={y} width={barWidth} height={barHeight} rx="9" fill="#e2e8f0" opacity="0.65" />
                {hasComparison && (
                  <rect
                    x={barStartX}
                    y={y}
                    width={Math.max(comparisonWidth, comparisonValue > 0 ? 8 : 0)}
                    height={barHeight}
                    rx="9"
                    fill="white"
                    stroke={rowColor}
                    strokeDasharray="4 3"
                    strokeWidth="2"
                    opacity="0.95"
                  />
                )}
                <rect x={barStartX} y={y} width={Math.max(width, row.value > 0 ? 8 : 0)} height={barHeight} rx="9" fill={rowColor} />
                <rect className="model-ranking-value-pill" x={valueX} y={y + 2} width="46" height="18" rx="9" fill="#0f172a" />
                <text x={valueX + 23} y={y + 14} textAnchor="middle" className="model-ranking-value-text fill-white text-[11px] font-bold">
                  {`${compactNumber(row.value)} units`}
                </text>
                {hasComparison && comparisonValue > 0 && (
                  <text x={Math.min(barStartX + Math.max(comparisonWidth, 18) + 10, chartWidth - margin.right - 18)} y={y - 3} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                    {compactNumber(comparisonValue)}
                  </text>
                )}
                <rect className="model-ranking-share-pill" x={shareX} y={y + 2} width="52" height="18" rx="9" fill="white" stroke={rowColor} strokeWidth="1.5" />
                <text x={shareX + 26} y={y + 14} textAnchor="middle" className="model-ranking-share-text fill-slate-900 text-[11px] font-bold">
                  {`${row.percentage}%`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function DemographicMotorVisual({
  title,
  subtitle,
  rows,
  icon,
  emptyText,
  visualMode
}: {
  title: string;
  subtitle: string;
  rows: DemographicMotorRow[];
  icon: React.ReactNode;
  emptyText: string;
  visualMode: AnalyticsVisualMode;
}) {
  const maxApplications = Math.max(...rows.map((row) => row.applications), 1);
  const totalApplications = rows.reduce((sum, row) => sum + row.applications, 0);
  const chartRows = rows.filter((row) => row.applications > 0);
  const radius = 42;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  let accumulatedLength = 0;

  return (
    <section className="h-[380px] overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex min-h-[46px] items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="text-slate-300">{icon}</div>
      </div>

      {rows.length === 0 ? (
        <EmptyChartRow text={emptyText} />
      ) : visualMode === 'donut' ? (
        <div className="grid h-[290px] grid-rows-[136px_1fr] gap-3 overflow-hidden">
          <div className="relative mx-auto h-[132px] w-[132px]">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label={`${title} chart`}>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {chartRows.map((row, index) => {
                const segmentLength = totalApplications > 0 ? (row.applications / totalApplications) * circumference : 0;
                const dashOffset = -accumulatedLength;
                accumulatedLength += segmentLength;

                return (
                  <circle
                    key={row.key}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={chartPalette[index % chartPalette.length]}
                    strokeLinecap="round"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${Math.max(segmentLength - 2, 0)} ${circumference}`}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-mono text-xl font-bold text-slate-900">{totalApplications}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{tra('records')}</p>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1">
            {rows.slice(0, 6).map((row, index) => (
              <div key={row.key} className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />
                    <span className="truncate font-semibold text-slate-700">{row.label}</span>
                  </div>
                  <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600 shadow-xs">
                    {totalApplications > 0 ? Math.round((row.applications / totalApplications) * 100) : 0}%
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">{row.topModel} · {row.topModelCount} records</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-14 shrink-0 font-mono text-[11px] text-slate-500">{row.applications} rec</span>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max((row.applications / maxApplications) * 100, 5)}%`,
                        backgroundColor: chartPalette[index % chartPalette.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {rows.length > 6 && (
              <p className="px-1 text-[11px] font-semibold text-slate-500">+{rows.length - 6} more rows in this group</p>
            )}
          </div>
        </div>
      ) : (
        <div className="h-[290px] space-y-2 overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <div key={row.key} className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="mb-1.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex min-w-0 gap-2">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${palette[index % palette.length]}`} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-700">{row.label}</p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{row.topModel}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600 shadow-xs">
                  {totalApplications > 0 ? Math.round((row.applications / totalApplications) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 font-mono text-[11px] text-slate-500">{row.applications} rec</span>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${palette[index % palette.length]}`}
                    style={{ width: `${Math.max((row.applications / maxApplications) * 100, 5)}%` }}
                  />
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[11px] text-slate-500">
                <span>{row.approved} approved · {row.topModelCount} model records</span>
                <span>{row.averageAge ? `${row.averageAge} yrs avg` : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const SHOW_MARKETING_WHATSAPP_TRACKING = false;

const ALL_ANALYTICS_DETAIL_TABS: Array<{ id: AnalyticsDetailTab; zh: string; en: string; ms: string; icon: string }> = [
  { id: 'marketing', zh: '营销表现', en: 'Marketing', ms: 'Pemasaran', icon: analyticsIcon },
  { id: 'vehicle', zh: '车辆需求', en: 'Vehicle Demand', ms: 'Permintaan Kenderaan', icon: vehicleInfoIcon },
  { id: 'customer', zh: '客户画像', en: 'Customer Profile', ms: 'Profil Pelanggan', icon: customersIcon },
  { id: 'operations', zh: '运营表现', en: 'Operations', ms: 'Operasi', icon: auditIcon },
  { id: 'rawCustomer', zh: '潜在客户名单', en: 'Lead Pool', ms: 'Kumpulan Prospek', icon: rawCustomersIcon }
];

const ANALYTICS_DETAIL_TABS = ALL_ANALYTICS_DETAIL_TABS
  .filter((tab) => SHOW_MARKETING_WHATSAPP_TRACKING || tab.id !== 'marketing');

const ANALYTICS_DETAIL_TAB_STORAGE_KEY = 'analytics_detail_tab';
const ANALYTICS_TIMEFRAME_STORAGE_KEY = 'analytics_timeframe';
const ANALYTICS_CHART_MODES_STORAGE_KEY = 'analytics_chart_modes_v1';
const ANALYTICS_TABLE_PAGE_SIZE_STORAGE_KEY = 'analytics_table_page_size';
const ANALYTICS_STATUS_VIEW_STORAGE_KEY = 'analytics_status_view';

const COMPLETED_TASK_CATEGORIES: Array<{
  key: CompletedTaskCategory;
  zh: string;
  en: string;
  ms: string;
  tone: string;
}> = [
  { key: 'newApplication', zh: '新申请', en: 'New Applications', ms: 'Permohonan Baharu', tone: 'bg-amber-50 text-amber-700' },
  { key: 'missing', zh: '缺失资料', en: 'Missing Info', ms: 'Maklumat Tiada', tone: 'bg-rose-50 text-rose-700' },
  { key: 'lead', zh: '潜在客户', en: 'Lead', ms: 'Prospek', tone: 'bg-cyan-50 text-cyan-700' },
  { key: 'cash', zh: '现金', en: 'Cash', ms: 'Tunai', tone: 'bg-emerald-50 text-emerald-700' },
  { key: 'bank', zh: '银行', en: 'Bank', ms: 'Bank', tone: 'bg-indigo-50 text-indigo-700' },
  { key: 'reminder', zh: '提醒', en: 'Reminder', ms: 'Peringatan', tone: 'bg-orange-50 text-orange-700' },
  { key: 'mission', zh: '任务', en: 'Mission', ms: 'Misi', tone: 'bg-red-50 text-red-700' },
  { key: 'vehicle', zh: '车辆资料', en: 'Vehicle Info', ms: 'Maklumat Kenderaan', tone: 'bg-violet-50 text-violet-700' }
];

const COMPLETED_TASK_TYPE_LABELS: Record<string, [string, string, string]> = {
  'Cash Review': ['现金审核', 'Cash Review', 'Semakan Tunai'],
  'New Application Review': ['新申请审核', 'New Application Review', 'Semakan Permohonan Baharu'],
  'Missing Documents': ['补齐文件', 'Missing Documents', 'Dokumen Tiada'],
  'Missing Information': ['补齐资料', 'Missing Information', 'Maklumat Tiada'],
  'Bank Submission': ['提交银行', 'Bank Submission', 'Penyerahan Bank'],
  'Bank Resubmission': ['重新提交银行', 'Bank Resubmission', 'Penyerahan Semula Bank'],
  'Bank Decision': ['处理银行决定', 'Bank Decision', 'Keputusan Bank'],
  'Rejected Loan Action': ['拒贷后续处理', 'Rejected Loan Action', 'Tindakan Pinjaman Ditolak'],
  'Customer Acceptance': ['客户接受确认', 'Customer Acceptance', 'Penerimaan Pelanggan'],
  'Approved Customer Contact': ['联系已批准客户', 'Approved Customer Contact', 'Hubungi Pelanggan Diluluskan'],
  'Customer Call-back': ['客户回电', 'Customer Call-back', 'Panggilan Balik Pelanggan'],
  'Bank Follow-up': ['银行跟进', 'Bank Follow-up', 'Susulan Bank'],
  'Lead Follow-up': ['名单跟进', 'Lead Follow-up', 'Susulan Prospek'],
  'Calendar Task': ['日历指派任务', 'Calendar Task', 'Tugasan Kalendar'],
  'Mission Target Reached': ['任务目标达成', 'Mission Target Reached', 'Sasaran Misi Dicapai'],
  'Vehicle Info Added': ['新增车辆资料', 'Vehicle Info Added', 'Maklumat Kenderaan Ditambah']
};

const trCompletedTaskType = (taskType: string) => {
  const labels = COMPLETED_TASK_TYPE_LABELS[taskType];
  return labels ? tr(labels[0], labels[1], labels[2]) : taskType;
};

function CompletedTasksAnalytics({
  events,
  secondaryEvents,
  timeframeLabel
}: {
  events: CompletedTaskEvent[];
  secondaryEvents?: CompletedTaskEvent[];
  timeframeLabel: string;
}) {
  const categoryCounts = new Map<CompletedTaskCategory, number>();
  const staffRows = new Map<string, {
    name: string;
    total: number;
    categories: Record<CompletedTaskCategory, number>;
  }>();
  const typeRows = new Map<string, { taskType: string; category: CompletedTaskCategory; total: number; staff: Set<string> }>();

  events.forEach((event) => {
    categoryCounts.set(event.category, (categoryCounts.get(event.category) || 0) + 1);
    const staffRow = staffRows.get(event.staff_name) || {
      name: event.staff_name,
      total: 0,
      categories: {
        newApplication: 0,
        missing: 0,
        lead: 0,
        cash: 0,
        bank: 0,
        reminder: 0,
        mission: 0,
        vehicle: 0,
        delivery: 0
      }
    };
    staffRow.total += 1;
    staffRow.categories[event.category] += 1;
    staffRows.set(event.staff_name, staffRow);

    const typeRow = typeRows.get(event.task_type) || {
      taskType: event.task_type,
      category: event.category,
      total: 0,
      staff: new Set<string>()
    };
    typeRow.total += 1;
    typeRow.staff.add(event.staff_name);
    typeRows.set(event.task_type, typeRow);
  });

  const sortedStaffRows = Array.from(staffRows.values()).sort((left, right) => (
    right.total - left.total || left.name.localeCompare(right.name)
  ));
  const sortedTypeRows = Array.from(typeRows.values()).sort((left, right) => (
    right.total - left.total || left.taskType.localeCompare(right.taskType)
  ));
  const overdueCompleted = events.filter((event) => event.was_overdue).length;
  const trackedDueTasks = events.filter((event) => Boolean(event.due_at)).length;
  const comparisonDelta = secondaryEvents ? events.length - secondaryEvents.length : undefined;
  return (
    <section data-testid="completed-tasks-analytics" className="mb-5 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{tr('已完成任务', 'Completed Tasks', 'Tugasan Selesai')}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {tr(
              '按实际完成时间统计员工处理的新申请、补件、名单、现金、银行、提醒、任务和车辆资料。',
              'Counts New Application, Missing Info, Lead, Cash, Bank, Reminder, Mission, and Vehicle Info work by actual completion time.',
              'Mengira kerja Permohonan Baharu, Maklumat Tiada, Prospek, Tunai, Bank, Peringatan, Misi dan Maklumat Kenderaan mengikut masa selesai sebenar.'
            )}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-500">{tra(timeframeLabel)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="inline-flex rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-700">{tr('已完成', 'Completed', 'Selesai')}</p>
          <p data-testid="completed-tasks-total" className="mt-2 text-2xl font-bold text-slate-900">{events.length}</p>
          {comparisonDelta !== undefined && (
            <p className={`mt-1 text-[11px] font-bold ${comparisonDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {comparisonDelta >= 0 ? '+' : ''}{comparisonDelta} {tr('对比上期', 'vs comparison', 'berbanding perbandingan')}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="inline-flex rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">{tr('完成员工', 'Staff Completed', 'Kakitangan Selesai')}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{staffRows.size}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{tr('有完成记录的员工', 'Staff with completion records', 'Kakitangan dengan rekod selesai')}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">{tr('任务种类', 'Task Types', 'Jenis Tugasan')}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{typeRows.size}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{tr('这段时间实际完成', 'Actually completed in this period', 'Sebenarnya selesai dalam tempoh ini')}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="inline-flex rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">{tr('逾期后完成', 'Completed Overdue', 'Selesai Lewat')}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{overdueCompleted}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{tr(`有截止时间记录：${trackedDueTasks}`, `Due dates tracked: ${trackedDueTasks}`, `Tarikh akhir dijejak: ${trackedDueTasks}`)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 pb-5 sm:grid-cols-4 xl:grid-cols-8">
        {COMPLETED_TASK_CATEGORIES.map((category) => (
          <div key={category.key} className="rounded-xl border border-slate-100 bg-white px-3 py-3">
            <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${category.tone}`}>
              {tr(category.zh, category.en, category.ms)}
            </span>
            <p className="mt-2 font-mono text-xl font-bold text-slate-900">{categoryCounts.get(category.key) || 0}</p>
          </div>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="border-t border-slate-100 px-5 py-10 text-center text-xs text-slate-500">
          {tr('所选时间段还没有完成记录。新完成的 Task Inbox 动作会自动进入这里。', 'No completion records in this timeframe yet. Newly completed Task Inbox actions will appear here automatically.', 'Belum ada rekod selesai dalam tempoh ini. Tindakan Peti Masuk Tugasan yang baru selesai akan muncul di sini secara automatik.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 border-t border-slate-100 p-5 2xl:grid-cols-2">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800">{tr('员工完成数量', 'Completed by Staff', 'Selesai mengikut Kakitangan')}</h4>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2">{tr('员工', 'Staff', 'Kakitangan')}</th>
                    <th className="px-3 py-2 text-right">{tr('总数', 'Total', 'Jumlah')}</th>
                    {COMPLETED_TASK_CATEGORIES.map((category) => (
                      <th key={category.key} className="px-2 py-2 text-right">{tr(category.zh, category.en, category.ms)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedStaffRows.map((row) => (
                    <tr key={row.name}>
                      <td className="px-3 py-3 font-bold text-slate-700">{row.name}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">{row.total}</td>
                      {COMPLETED_TASK_CATEGORIES.map((category) => (
                        <td key={category.key} className="px-2 py-3 text-right font-mono text-slate-500">{row.categories[category.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800">{tr('任务种类明细', 'Task Type Detail', 'Butiran Jenis Tugasan')}</h4>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2">{tr('任务种类', 'Task Type', 'Jenis Tugasan')}</th>
                    <th className="px-3 py-2">{tr('分类', 'Category', 'Kategori')}</th>
                    <th className="px-3 py-2 text-right">{tr('员工', 'Staff', 'Kakitangan')}</th>
                    <th className="px-3 py-2 text-right">{tr('完成', 'Completed', 'Selesai')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedTypeRows.map((row) => {
                    const category = COMPLETED_TASK_CATEGORIES.find((item) => item.key === row.category);
                    return (
                      <tr key={row.taskType}>
                        <td className="px-3 py-3 font-bold text-slate-700">{trCompletedTaskType(row.taskType)}</td>
                        <td className="px-3 py-3">
                          {category && <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${category.tone}`}>{tr(category.zh, category.en, category.ms)}</span>}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-500">{row.staff.size}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">{row.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const DEFAULT_ANALYTICS_CHART_MODES: Record<string, AnalyticsChartMode> = {
  marketing: 'trend',
  vehicle: 'bar',
  customer: 'donut',
  operations: 'bar',
  rawCustomer: 'bar'
};

function readStoredAnalyticsChartModes() {
  try {
    const saved = window.localStorage.getItem(ANALYTICS_CHART_MODES_STORAGE_KEY);
    if (!saved) return DEFAULT_ANALYTICS_CHART_MODES;
    const parsed = JSON.parse(saved) as Record<string, string>;
    const allowed: AnalyticsChartMode[] = ['bar', 'donut', 'combo', 'trend'];
    return Object.fromEntries(
      Object.entries({ ...DEFAULT_ANALYTICS_CHART_MODES, ...parsed }).map(([key, value]) => [
        key,
        allowed.includes(value as AnalyticsChartMode) ? value : DEFAULT_ANALYTICS_CHART_MODES[key] || 'bar'
      ])
    ) as Record<string, AnalyticsChartMode>;
  } catch {
    return DEFAULT_ANALYTICS_CHART_MODES;
  }
}

function AnalyticsDashboard({
  applications,
  rawCustomerLeads,
  errorCodeDefinitions,
  roleAccounts,
  auditLogs,
  calendarNotes,
  notifications,
  whatsAppTrackingLinks,
  whatsAppTrackingClicks,
  tagNormalizationRules,
  canExportData = false,
  scopeLabel = 'All Staff Analytics'
}: AnalyticsDashboardProps) {
  const [customerProfileBreakdown, setCustomerProfileBreakdown] = useState<CustomerProfileBreakdown>('birthplace');
  const [customerProfileSortState, setCustomerProfileSortState] = useState<SortState<CustomerProfileSortKey>>({
    key: 'value',
    direction: 'desc'
  });
  const [customerVehicleFilter, setCustomerVehicleFilter] = useState('all');
  const [isCustomerVehicleFilterOpen, setIsCustomerVehicleFilterOpen] = useState(false);
  const [customerVehicleFilterSort, setCustomerVehicleFilterSort] = useState<CustomerVehicleFilterSort>('quantity');
  const [showCustomerProfileDetails, setShowCustomerProfileDetails] = useState(false);
  const [vehicleDemandSortState, setVehicleDemandSortState] = useState<SortState<VehicleDemandSortKey>>({
    key: 'value',
    direction: 'desc'
  });
  const [vehicleDemandBreakdown, setVehicleDemandBreakdown] = useState<VehicleDemandBreakdown>('model');
  const [vehicleConditionFilter, setVehicleConditionFilter] = useState<VehicleConditionFilter>('all');
  const [purchaseMethodFilter, setPurchaseMethodFilter] = useState<PurchaseMethodFilter>('all');
  const [showVehicleDemandDetails, setShowVehicleDemandDetails] = useState(false);
  const [marketingSortState, setMarketingSortState] = useState<SortState<MarketingSortKey>>({
    key: 'value',
    direction: 'desc'
  });
  const [marketingBreakdown, setMarketingBreakdown] = useState<MarketingBreakdown>('campaign');
  const [showMarketingDetails, setShowMarketingDetails] = useState(false);
  const [operationsBreakdown, setOperationsBreakdown] = useState<OperationsBreakdown>('status');
  const [operationsSortState, setOperationsSortState] = useState<SortState<OperationsSortKey>>({
    key: 'value',
    direction: 'desc'
  });
  const [showOperationsDetails, setShowOperationsDetails] = useState(false);
  const [rawCustomerBreakdown, setRawCustomerBreakdown] = useState<RawCustomerBreakdown>('status');
  const [rawCustomerSortState, setRawCustomerSortState] = useState<SortState<RawCustomerSortKey>>({
    key: 'value',
    direction: 'desc'
  });
  const [showRawCustomerDetails, setShowRawCustomerDetails] = useState(false);
  const [timeframe, setTimeframe] = useState<TimeframeKey>(() => {
    const saved = window.localStorage.getItem(ANALYTICS_TIMEFRAME_STORAGE_KEY);
    return saved && TIMEFRAME_OPTIONS.some((option) => option.value === saved) ? saved as TimeframeKey : 'all';
  });
  const [reportMode, setReportMode] = useState<ReportMode>(() => {
    const saved = window.localStorage.getItem(ANALYTICS_TIMEFRAME_STORAGE_KEY) as TimeframeKey | null;
    if (saved && TIMEFRAME_BY_REPORT_MODE.daily.includes(saved)) return 'daily';
    if (saved && TIMEFRAME_BY_REPORT_MODE.weekly.includes(saved)) return 'weekly';
    return 'overall';
  });
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [comparePreset, setComparePreset] = useState<ComparePresetKey>('none');
  const [showComparisonSetup, setShowComparisonSetup] = useState(false);
  const [comparePrimaryStartDate, setComparePrimaryStartDate] = useState('');
  const [comparePrimaryEndDate, setComparePrimaryEndDate] = useState('');
  const [compareSecondaryStartDate, setCompareSecondaryStartDate] = useState('');
  const [compareSecondaryEndDate, setCompareSecondaryEndDate] = useState('');
  const [chartTypeBySection, setChartTypeBySection] = useState<Record<string, AnalyticsChartMode>>(readStoredAnalyticsChartModes);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalyticsDetailTab>(() => {
    const saved = window.localStorage.getItem(ANALYTICS_DETAIL_TAB_STORAGE_KEY) as AnalyticsDetailTab | null;
    return saved && ANALYTICS_DETAIL_TABS.some((tab) => tab.id === saved)
      ? saved
      : 'vehicle';
  });
  const deferredApplications: LoanApplication[] = useDeferredValue(applications) as LoanApplication[];
  const deferredRawCustomerLeads: RawCustomerLead[] = useDeferredValue(rawCustomerLeads) as RawCustomerLead[];
  const deferredWhatsAppTrackingClicks: WhatsAppTrackingClick[] = useDeferredValue(whatsAppTrackingClicks) as WhatsAppTrackingClick[];
  const deferredWhatsAppTrackingLinks: WhatsAppTrackingLink[] = useDeferredValue(whatsAppTrackingLinks) as WhatsAppTrackingLink[];
  const applicationMatchIndex = useMemo(
    () => buildApplicationMatchIndex(deferredApplications),
    [deferredApplications]
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(ANALYTICS_DETAIL_TAB_STORAGE_KEY, activeAnalysisTab);
      window.localStorage.setItem(ANALYTICS_TIMEFRAME_STORAGE_KEY, timeframe);
      window.localStorage.setItem(ANALYTICS_CHART_MODES_STORAGE_KEY, JSON.stringify(chartTypeBySection));
    } catch {
      // View preferences are convenience only; ignore storage failures.
    }
  }, [activeAnalysisTab, chartTypeBySection, timeframe]);

  const handleChartTypeChange = (sectionId: string, mode: AnalyticsChartMode) => {
    setChartTypeBySection((current) => ({ ...current, [sectionId]: mode }));
  };

  // Memoized: getComparisonRanges returns a fresh object each call, and it feeds
  // the analytics / secondaryAnalytics / derivedAnalytics memos. Recomputing it
  // every render (e.g. on each keystroke in the compare date inputs) invalidated
  // all of them and nullified useDeferredValue in compare mode.
  const comparisonRanges = useMemo(
    () => getComparisonRanges(
      comparePreset,
      comparePrimaryStartDate,
      comparePrimaryEndDate,
      compareSecondaryStartDate,
      compareSecondaryEndDate
    ),
    [comparePreset, comparePrimaryStartDate, comparePrimaryEndDate, compareSecondaryStartDate, compareSecondaryEndDate]
  );
  const activeFilterRange = comparisonRanges?.primary;
  const completedTaskEvents = useMemo(() => buildCompletedTaskEvents({
    auditLogs,
    applications: deferredApplications,
    calendarNotes,
    notifications,
    roleAccounts
  }), [auditLogs, calendarNotes, deferredApplications, notifications, roleAccounts]);
  const filteredCompletedTaskEvents = useMemo(() => (
    completedTaskEvents.filter((event) => (
      activeFilterRange
        ? isWithinAnalyticsDateRange(event.completed_at, activeFilterRange)
        : isWithinTimeframe(event.completed_at, timeframe, customStartDate, customEndDate)
    ))
  ), [activeFilterRange, completedTaskEvents, customEndDate, customStartDate, timeframe]);
  const secondaryCompletedTaskEvents = useMemo(() => (
    comparisonRanges
      ? completedTaskEvents.filter((event) => (
        isWithinAnalyticsDateRange(event.completed_at, comparisonRanges.secondary)
      ))
      : undefined
  ), [comparisonRanges, completedTaskEvents]);
  const isVehicleSectionOpen = activeAnalysisTab === 'vehicle';
  const isCustomerSectionOpen = activeAnalysisTab === 'customer';
  const isRawCustomerSectionOpen = activeAnalysisTab === 'rawCustomer';
  const isMarketingSectionOpen = activeAnalysisTab === 'marketing';
  const isOperationsSectionOpen = activeAnalysisTab === 'operations';
  const staffColorMap = useMemo(() => {
    if (!isMarketingSectionOpen && !isOperationsSectionOpen) {
      return new Map<string, string>();
    }

    const staffNames = new Set<string>();

    roleAccounts.forEach((account) => {
      if (account.name.trim()) {
        staffNames.add(account.name.trim());
      }
    });

    deferredApplications.forEach((application) => {
      if (application.handler_name.trim()) {
        staffNames.add(application.handler_name.trim());
      }
    });

    deferredWhatsAppTrackingClicks.forEach((click) => {
      if (click.sales_name.trim()) {
        staffNames.add(click.sales_name.trim());
      }
    });

    deferredWhatsAppTrackingLinks.forEach((link) => {
      if (link.sales_name.trim()) {
        staffNames.add(link.sales_name.trim());
      }
    });

    return Array.from(staffNames)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Map<string, string>>((acc, staffName, index) => {
        acc.set(normalizeColorKey(staffName), staffPalette[index % staffPalette.length]);
        return acc;
      }, new Map<string, string>());
  }, [deferredApplications, deferredWhatsAppTrackingClicks, deferredWhatsAppTrackingLinks, isMarketingSectionOpen, isOperationsSectionOpen, roleAccounts]);

  const analytics = useMemo(() => {
    const primaryTrendOptions: TrendPeriodOptions | undefined = timeframe === 'monthly'
      ? { bucket: 'month', range: activeFilterRange || getTimeframeRange('monthly') }
      : undefined;
    const trendSeriesLimit = timeframe === 'monthly' ? Number.MAX_SAFE_INTEGER : 3;
    const isInActiveRange = (value: string) => activeFilterRange
      ? isWithinAnalyticsDateRange(value, activeFilterRange)
      : isWithinTimeframe(value, timeframe, customStartDate, customEndDate);
    const filteredApplications = deferredApplications.filter((app) => isInActiveRange(app.submitted_at));
    const filteredRawLeads = deferredRawCustomerLeads.filter((lead) => isInActiveRange(lead.received_at));
    const filteredClicks = deferredWhatsAppTrackingClicks.filter((click) => isInActiveRange(click.clicked_at));
    const customerVehicleModelCounts = isCustomerSectionOpen ? filteredApplications.reduce<Map<string, number>>((acc, application) => {
      const model = application.vehicle_model.trim() || 'Unknown model';
      acc.set(model, (acc.get(model) || 0) + 1);
      return acc;
    }, new Map<string, number>()) : new Map<string, number>();
    const customerVehicleModelOptions = Array.from(customerVehicleModelCounts.entries())
      .map(([model, count]) => ({
        value: model,
        label: model,
        count
      }));
    const customerProfileApplications = !isCustomerSectionOpen
      ? []
      : customerVehicleFilter === 'all'
      ? filteredApplications
      : filteredApplications.filter((application) => (application.vehicle_model.trim() || 'Unknown model') === customerVehicleFilter);
    const nricProfiles = isCustomerSectionOpen
      ? filteredApplications.map((application) => parseNricProfile(application.ic_no)).filter((profile): profile is NricProfile => Boolean(profile))
      : [];
    const averageAge = nricProfiles.length > 0
      ? Math.round(nricProfiles.reduce((sum, profile) => sum + profile.age, 0) / nricProfiles.length)
      : 0;
    const totalClicks = filteredClicks.length;
    const activeLinks = deferredWhatsAppTrackingLinks.filter((link) => link.active).length;
    const approvedLoans = filteredApplications.filter((app) => app.status === LoanStatus.APPROVE).length;
    const rejectedLoans = filteredApplications.filter((app) => app.status === LoanStatus.REJECT).length;
    const approvalRate = filteredApplications.length > 0 ? Math.round((approvedLoans / filteredApplications.length) * 100) : 0;
    const clicksBySource = isMarketingSectionOpen ? aggregateBy(filteredClicks, (click) => getNormalizedMarketingSource(click, tagNormalizationRules)) : [];
    const clicksByMedium = isMarketingSectionOpen ? aggregateBy(filteredClicks, (click) => getNormalizedMarketingMedium(click, tagNormalizationRules)) : [];
    const clicksByCampaign = isMarketingSectionOpen ? aggregateBy(filteredClicks, (click) => click.campaign) : [];
    const clicksBySales = isMarketingSectionOpen ? aggregateBy(filteredClicks, (click) => click.sales_name) : [];
    const loansByStatus = aggregateBy(filteredApplications, (app) => app.status);
    const loansByVehicleBrand = isVehicleSectionOpen ? aggregateBy(filteredApplications, (app) => app.vehicle_brand) : [];
    const loansByStaff = isOperationsSectionOpen ? aggregateBy(filteredApplications, (app) => app.handler_name) : [];
    const accountsByRole = isOperationsSectionOpen ? aggregateBy(roleAccounts, (account) => account.role) : [];
    const rejectedCodeRows = buildRejectedCodeRows(filteredApplications, errorCodeDefinitions);
    const rejectedCodeTrendSeries = isOperationsSectionOpen ? buildAggregateTrendSeries(
      filteredApplications.filter((application) => application.status === LoanStatus.REJECT),
      rejectedCodeRows,
      getRejectedCodeKey,
      (application) => application.submitted_at,
      'NO_CODE',
      primaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const topRejectedCode = rejectedCodeRows[0];
    const missingRejectCodeCount = rejectedCodeRows.find((row) => row.key === 'NO_CODE')?.value || 0;
    const rawLeadsByChannel = isRawCustomerSectionOpen ? aggregateBy(filteredRawLeads, (lead) => lead.channel, 'Other') : [];
    const rawLeadsByStatus = isRawCustomerSectionOpen ? aggregateBy(filteredRawLeads, (lead) => lead.raw_status, 'Raw') : [];
    const rawLeadsBySourceTraffic = isRawCustomerSectionOpen ? aggregateBy(filteredRawLeads, (lead) => lead.source_traffic, 'Unknown') : [];
    const rawLeadsApplied = isRawCustomerSectionOpen
      ? filteredRawLeads.filter((lead) => hasMatchingApplication(lead, applicationMatchIndex)).length
      : 0;
    const rawLeadPhoneCounts = isRawCustomerSectionOpen ? filteredRawLeads.reduce<Map<string, number>>((acc, lead) => {
      const phoneKey = normalizePhoneDigits(lead.phone_no);
      if (!phoneKey) {
        return acc;
      }

      acc.set(phoneKey, (acc.get(phoneKey) || 0) + 1);
      return acc;
    }, new Map<string, number>()) : new Map<string, number>();
    const duplicatedRawPhoneCount = Array.from(rawLeadPhoneCounts.values()).filter((count) => count > 1).length;
    const rawVehicleStockRows = buildVehicleStockRows(filteredApplications);
    const filteredVehicleDemandApplications = isVehicleSectionOpen
      ? filteredApplications.filter((application) => matchesVehicleDemandFilters(application, vehicleConditionFilter, purchaseMethodFilter))
      : [];
    const vehicleStatusRelationship = isVehicleSectionOpen
      ? buildVehicleStatusRelationship(filteredVehicleDemandApplications, errorCodeDefinitions)
      : undefined;
    const vehicleDemandRows = isVehicleSectionOpen ? buildVehicleDemandRows(filteredVehicleDemandApplications, vehicleDemandBreakdown).sort((a, b) => (
      compareSortValues(
        typeof a[vehicleDemandSortState.key] === 'number' ? a[vehicleDemandSortState.key] : String(a[vehicleDemandSortState.key] || '').toLowerCase(),
        typeof b[vehicleDemandSortState.key] === 'number' ? b[vehicleDemandSortState.key] : String(b[vehicleDemandSortState.key] || '').toLowerCase(),
        vehicleDemandSortState.direction
      )
    )) : [];
    const vehicleDemandTrendSeries = isVehicleSectionOpen ? buildVehicleDemandTrendSeries(filteredVehicleDemandApplications, vehicleDemandBreakdown, vehicleDemandRows, primaryTrendOptions, trendSeriesLimit) : [];
    const marketingPerformanceRows = isMarketingSectionOpen ? buildMarketingPerformanceRows(filteredClicks, deferredWhatsAppTrackingLinks, marketingBreakdown, tagNormalizationRules).sort((a, b) => (
      compareSortValues(
        typeof a[marketingSortState.key] === 'number' ? a[marketingSortState.key] : String(a[marketingSortState.key] || '').toLowerCase(),
        typeof b[marketingSortState.key] === 'number' ? b[marketingSortState.key] : String(b[marketingSortState.key] || '').toLowerCase(),
        marketingSortState.direction
      )
    )) : [];
    const totalVehicleUnits = rawVehicleStockRows.reduce((sum, row) => sum + row.value, 0);
    const approvedVehicleUnits = rawVehicleStockRows.reduce((sum, row) => sum + row.approvedUnits, 0);
    const topVehicleModel = [...rawVehicleStockRows].sort((a, b) => b.value - a.value || b.approvedUnits - a.approvedUnits)[0];
    const selectedTopSaleModel = buildVehicleStockRows(filteredApplications.filter((application) => application.status === LoanStatus.APPROVE))[0];
    const selectedTopModel = topVehicleModel;
    const customerProfileNricProfiles = isCustomerSectionOpen ? customerProfileApplications.map((application) => parseNricProfile(application.ic_no)).filter((profile): profile is NricProfile => Boolean(profile)) : [];
    const rowsByAgeGroup = isCustomerSectionOpen ? buildDemographicRows(customerProfileApplications, (profile) => profile.ageGroup) : [];
    const rowsByBirthPlace = isCustomerSectionOpen ? buildDemographicRows(customerProfileApplications, (profile) => profile.birthPlace) : [];
    const rowsByGender = isCustomerSectionOpen ? aggregateBy(customerProfileNricProfiles, (profile) => profile.gender, 'Unknown') : [];
    const topAgeGroup = rowsByAgeGroup[0];
    const topBirthPlace = rowsByBirthPlace[0];

    return {
      totalClicks,
      activeLinks,
      filteredApplications,
      nricProfiles,
      averageAge,
      approvedLoans,
      rejectedLoans,
      approvalRate,
      clicksBySource,
      clicksByMedium,
      clicksByCampaign,
      marketingPerformanceRows,
      clicksBySales,
      loansByStatus,
      loansByVehicleBrand,
      loansByStaff,
      accountsByRole,
      rejectedCodeRows,
      rejectedCodeTrendSeries,
      topRejectedCode,
      missingRejectCodeCount,
      filteredRawLeads,
      rawLeadsByChannel,
      rawLeadsByStatus,
      rawLeadsBySourceTraffic,
      rawLeadsApplied,
      rawLeadsPotential: filteredRawLeads.length - rawLeadsApplied,
      duplicatedRawPhoneCount,
      uniqueRawPhones: rawLeadPhoneCounts.size,
      vehicleStockRows: rawVehicleStockRows,
      vehicleDemandRows,
      vehicleDemandTrendSeries,
      totalVehicleUnits,
      approvedVehicleUnits,
      topVehicleModel,
      selectedTopSaleModel,
      selectedTopModel,
      customerProfileApplications,
      customerVehicleModelOptions,
      filteredVehicleDemandApplications,
      vehicleStatusRelationship,
      rowsByAgeGroup,
      rowsByBirthPlace,
      rowsByGender,
      topAgeGroup,
      topBirthPlace
    };
  }, [activeFilterRange, applicationMatchIndex, customEndDate, customStartDate, customerVehicleFilter, deferredApplications, deferredRawCustomerLeads, deferredWhatsAppTrackingClicks, deferredWhatsAppTrackingLinks, errorCodeDefinitions, isCustomerSectionOpen, isMarketingSectionOpen, isOperationsSectionOpen, isRawCustomerSectionOpen, isVehicleSectionOpen, marketingBreakdown, marketingSortState, purchaseMethodFilter, roleAccounts, tagNormalizationRules, timeframe, vehicleConditionFilter, vehicleDemandBreakdown, vehicleDemandSortState]);

  // Conversion by lead source: per channel, how many leads came in and how many
  // converted (have a matching loan application). Uses the analytics date range.
  const conversionBySource = useMemo(() => {
    const grouped: Record<string, { source: string; total: number; converted: number }> = {};
    analytics.filteredRawLeads.forEach((lead) => {
      const source = (lead.channel || '').trim() || tr('其他', 'Other', "Lain-lain");
      const entry = grouped[source] || (grouped[source] = { source, total: 0, converted: 0 });
      entry.total += 1;
      if (hasMatchingApplication(lead, applicationMatchIndex)) {
        entry.converted += 1;
      }
    });
    return Object.values(grouped)
      .map((row) => ({ ...row, rate: row.total > 0 ? Math.round((row.converted / row.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total || b.converted - a.converted);
  }, [analytics.filteredRawLeads, applicationMatchIndex]);

  const secondaryAnalytics = useMemo(() => {
    if (!comparisonRanges) {
      return undefined;
    }

    const isInSecondaryRange = (value: string) => isWithinAnalyticsDateRange(value, comparisonRanges.secondary);
    const filteredApplications = deferredApplications.filter((app) => isInSecondaryRange(app.submitted_at));
    const filteredRawLeads = deferredRawCustomerLeads.filter((lead) => isInSecondaryRange(lead.received_at));
    const filteredClicks = deferredWhatsAppTrackingClicks.filter((click) => isInSecondaryRange(click.clicked_at));
    const customerVehicleModelCounts = isCustomerSectionOpen ? filteredApplications.reduce<Map<string, number>>((acc, application) => {
      const model = application.vehicle_model.trim() || 'Unknown model';
      acc.set(model, (acc.get(model) || 0) + 1);
      return acc;
    }, new Map<string, number>()) : new Map<string, number>();
    const customerVehicleModelOptions = Array.from(customerVehicleModelCounts.entries())
      .map(([model, count]) => ({
        value: model,
        label: model,
        count
      }));
    const customerProfileApplications = !isCustomerSectionOpen
      ? []
      : customerVehicleFilter === 'all'
      ? filteredApplications
      : filteredApplications.filter((application) => (application.vehicle_model.trim() || 'Unknown model') === customerVehicleFilter);
    const nricProfiles = isCustomerSectionOpen
      ? filteredApplications.map((application) => parseNricProfile(application.ic_no)).filter((profile): profile is NricProfile => Boolean(profile))
      : [];
    const averageAge = nricProfiles.length > 0
      ? Math.round(nricProfiles.reduce((sum, profile) => sum + profile.age, 0) / nricProfiles.length)
      : 0;
    const approvedLoans = filteredApplications.filter((app) => app.status === LoanStatus.APPROVE).length;
    const rejectedLoans = filteredApplications.filter((app) => app.status === LoanStatus.REJECT).length;
    const approvalRate = filteredApplications.length > 0 ? Math.round((approvedLoans / filteredApplications.length) * 100) : 0;
    const loansByVehicleBrand = isVehicleSectionOpen ? aggregateBy(filteredApplications, (app) => app.vehicle_brand) : [];
    const loansByStatus = aggregateBy(filteredApplications, (app) => app.status);
    const loansByStaff = isOperationsSectionOpen ? aggregateBy(filteredApplications, (app) => app.handler_name) : [];
    const accountsByRole = isOperationsSectionOpen ? aggregateBy(roleAccounts, (account) => account.role) : [];
    const rejectedCodeRows = buildRejectedCodeRows(filteredApplications, errorCodeDefinitions);
    const topRejectedCode = rejectedCodeRows[0];
    const missingRejectCodeCount = rejectedCodeRows.find((row) => row.key === 'NO_CODE')?.value || 0;
    const rawLeadsApplied = isRawCustomerSectionOpen
      ? filteredRawLeads.filter((lead) => hasMatchingApplication(lead, applicationMatchIndex)).length
      : 0;
    const rawLeadPhoneCounts = isRawCustomerSectionOpen ? filteredRawLeads.reduce<Map<string, number>>((acc, lead) => {
      const phoneKey = normalizePhoneDigits(lead.phone_no);
      if (phoneKey) {
        acc.set(phoneKey, (acc.get(phoneKey) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>()) : new Map<string, number>();
    const duplicatedRawPhoneCount = Array.from(rawLeadPhoneCounts.values()).filter((count) => count > 1).length;
    const rawLeadsByChannel = isRawCustomerSectionOpen ? aggregateBy(filteredRawLeads, (lead) => lead.channel, 'Other') : [];
    const rawLeadsByStatus = isRawCustomerSectionOpen ? aggregateBy(filteredRawLeads, (lead) => lead.raw_status, 'Raw') : [];
    const rawLeadsBySourceTraffic = isRawCustomerSectionOpen ? aggregateBy(filteredRawLeads, (lead) => lead.source_traffic, 'Unknown') : [];
    const rawVehicleStockRows = buildVehicleStockRows(filteredApplications);
    const totalVehicleUnits = rawVehicleStockRows.reduce((sum, row) => sum + row.value, 0);
    const approvedVehicleUnits = rawVehicleStockRows.reduce((sum, row) => sum + row.approvedUnits, 0);
    const topVehicleModel = [...rawVehicleStockRows].sort((a, b) => b.value - a.value || b.approvedUnits - a.approvedUnits)[0];
    const selectedTopSaleModel = buildVehicleStockRows(filteredApplications.filter((application) => application.status === LoanStatus.APPROVE))[0];
    const selectedTopModel = topVehicleModel;
    const filteredVehicleDemandApplications = isVehicleSectionOpen
      ? filteredApplications.filter((application) => matchesVehicleDemandFilters(application, vehicleConditionFilter, purchaseMethodFilter))
      : [];
    const vehicleDemandRows = isVehicleSectionOpen ? buildVehicleDemandRows(filteredVehicleDemandApplications, vehicleDemandBreakdown).sort((a, b) => (
      compareSortValues(
        typeof a[vehicleDemandSortState.key] === 'number' ? a[vehicleDemandSortState.key] : String(a[vehicleDemandSortState.key] || '').toLowerCase(),
        typeof b[vehicleDemandSortState.key] === 'number' ? b[vehicleDemandSortState.key] : String(b[vehicleDemandSortState.key] || '').toLowerCase(),
        vehicleDemandSortState.direction
      )
    )) : [];
    const vehicleDemandTotalUnits = vehicleDemandRows.reduce((sum, row) => sum + row.value, 0);
    const vehicleDemandApprovedUnits = vehicleDemandRows.reduce((sum, row) => sum + row.approvedUnits, 0);
    const vehicleDemandApprovalRate = vehicleDemandTotalUnits > 0 ? Math.round((vehicleDemandApprovedUnits / vehicleDemandTotalUnits) * 100) : 0;
    const vehicleDemandTopSegment = vehicleDemandRows.find((row) => row.value > 0);
    const marketingPerformanceRows = isMarketingSectionOpen ? buildMarketingPerformanceRows(filteredClicks, deferredWhatsAppTrackingLinks, marketingBreakdown, tagNormalizationRules).sort((a, b) => (
      compareSortValues(
        typeof a[marketingSortState.key] === 'number' ? a[marketingSortState.key] : String(a[marketingSortState.key] || '').toLowerCase(),
        typeof b[marketingSortState.key] === 'number' ? b[marketingSortState.key] : String(b[marketingSortState.key] || '').toLowerCase(),
        marketingSortState.direction
      )
    )) : [];
    const customerProfileNricProfiles = isCustomerSectionOpen ? customerProfileApplications.map((application) => parseNricProfile(application.ic_no)).filter((profile): profile is NricProfile => Boolean(profile)) : [];
    const rowsByAgeGroup = isCustomerSectionOpen ? buildDemographicRows(customerProfileApplications, (profile) => profile.ageGroup) : [];
    const rowsByBirthPlace = isCustomerSectionOpen ? buildDemographicRows(customerProfileApplications, (profile) => profile.birthPlace) : [];
    const rowsByGender = isCustomerSectionOpen ? aggregateBy(customerProfileNricProfiles, (profile) => profile.gender, 'Unknown') : [];
    const customerProfileRows = buildCustomerProfileRows(rowsByAgeGroup, rowsByBirthPlace, rowsByGender, customerProfileBreakdown, customerVehicleFilter === 'all' ? 'All vehicles' : customerVehicleFilter).sort((a, b) => (
      compareSortValues(
        typeof a[customerProfileSortState.key] === 'number' ? a[customerProfileSortState.key] : String(a[customerProfileSortState.key] || '').toLowerCase(),
        typeof b[customerProfileSortState.key] === 'number' ? b[customerProfileSortState.key] : String(b[customerProfileSortState.key] || '').toLowerCase(),
        customerProfileSortState.direction
      )
    ));
    const operationsRows = [...(
      operationsBreakdown === 'staff'
        ? loansByStaff
        : operationsBreakdown === 'role'
          ? accountsByRole
          : loansByStatus
    )].sort((a, b) => (
      compareSortValues(
        typeof a[operationsSortState.key] === 'number' ? a[operationsSortState.key] : String(a[operationsSortState.key] || '').toLowerCase(),
        typeof b[operationsSortState.key] === 'number' ? b[operationsSortState.key] : String(b[operationsSortState.key] || '').toLowerCase(),
        operationsSortState.direction
      )
    ));
    const rawCustomerRows = [...(
      rawCustomerBreakdown === 'status'
        ? rawLeadsByStatus
        : rawCustomerBreakdown === 'sourceTraffic'
          ? rawLeadsBySourceTraffic
          : rawLeadsByChannel
    )].sort((a, b) => (
      compareSortValues(
        typeof a[rawCustomerSortState.key] === 'number' ? a[rawCustomerSortState.key] : String(a[rawCustomerSortState.key] || '').toLowerCase(),
        typeof b[rawCustomerSortState.key] === 'number' ? b[rawCustomerSortState.key] : String(b[rawCustomerSortState.key] || '').toLowerCase(),
        rawCustomerSortState.direction
      )
    ));

    return {
      totalClicks: filteredClicks.length,
      filteredApplications,
      filteredRawLeads,
      nricProfiles,
      averageAge,
      approvedLoans,
      rejectedLoans,
      approvalRate,
      loansByVehicleBrand,
      clicksByCampaign: isMarketingSectionOpen ? aggregateBy(filteredClicks, (click) => click.campaign) : [],
      clicksBySource: isMarketingSectionOpen ? aggregateBy(filteredClicks, (click) => getNormalizedMarketingSource(click, tagNormalizationRules)) : [],
      clicksBySales: isMarketingSectionOpen ? aggregateBy(filteredClicks, (click) => click.sales_name) : [],
      rejectedCodeRows,
      topRejectedCode,
      missingRejectCodeCount,
      rawLeadsApplied,
      rawLeadsPotential: filteredRawLeads.length - rawLeadsApplied,
      uniqueRawPhones: rawLeadPhoneCounts.size,
      duplicatedRawPhoneCount,
      vehicleStockRows: rawVehicleStockRows,
      totalVehicleUnits,
      approvedVehicleUnits,
      topVehicleModel,
      selectedTopSaleModel,
      selectedTopModel,
      customerVehicleModelOptions,
      vehicleDemandRows,
      vehicleDemandTotalUnits,
      vehicleDemandApprovedUnits,
      vehicleDemandApprovalRate,
      vehicleDemandTopSegment,
      customerProfileRows,
      customerProfileApplications,
      topAgeGroup: rowsByAgeGroup[0],
      topBirthPlace: rowsByBirthPlace[0],
      rawCustomerRows,
      rawCustomerTopRow: rawCustomerRows.find((row) => row.value > 0),
      marketingPerformanceRows,
      marketingTopRow: marketingPerformanceRows.find((row) => row.value > 0),
      operationsRows,
      operationsTopRow: operationsRows.find((row) => row.value > 0)
    };
  }, [applicationMatchIndex, comparisonRanges, customerProfileBreakdown, customerProfileSortState, customerVehicleFilter, deferredApplications, deferredRawCustomerLeads, deferredWhatsAppTrackingClicks, deferredWhatsAppTrackingLinks, errorCodeDefinitions, isCustomerSectionOpen, isMarketingSectionOpen, isOperationsSectionOpen, isRawCustomerSectionOpen, isVehicleSectionOpen, marketingBreakdown, marketingSortState, operationsBreakdown, operationsSortState, purchaseMethodFilter, rawCustomerBreakdown, rawCustomerSortState, roleAccounts, tagNormalizationRules, vehicleConditionFilter, vehicleDemandBreakdown, vehicleDemandSortState]);

  const handleVehicleDemandSort = (key: VehicleDemandSortKey, defaultDirection: SortDirection = key === 'value' || key === 'approvedUnits' || key === 'approvalRate' || key === 'percentage' ? 'desc' : 'asc') => {
    setVehicleDemandSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleMarketingSort = (key: MarketingSortKey, defaultDirection: SortDirection = key === 'value' || key === 'percentage' ? 'desc' : 'asc') => {
    setMarketingSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleOperationsSort = (key: OperationsSortKey, defaultDirection: SortDirection = key === 'value' || key === 'percentage' ? 'desc' : 'asc') => {
    setOperationsSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleRawCustomerSort = (key: RawCustomerSortKey, defaultDirection: SortDirection = key === 'value' || key === 'percentage' ? 'desc' : 'asc') => {
    setRawCustomerSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleCustomerProfileSort = (key: CustomerProfileSortKey, defaultDirection: SortDirection = key === 'value' || key === 'percentage' ? 'desc' : 'asc') => {
    setCustomerProfileSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const selectedTimeframeLabel = timeframe === 'custom'
    ? buildDateRangeLabel(getCustomTimeframeRange(customStartDate, customEndDate).start, getCustomTimeframeRange(customStartDate, customEndDate).end)
    : TIMEFRAME_OPTIONS.find((option) => option.value === timeframe)?.label || 'All time';
  const activeTimeframeLabel = comparisonRanges ? comparisonRanges.primary.label : selectedTimeframeLabel;
  const effectiveDateRange = useMemo(
    () => activeFilterRange || (timeframe === 'custom'
      ? getCustomTimeframeRange(customStartDate, customEndDate)
      : getTimeframeRange(timeframe)),
    [activeFilterRange, customEndDate, customStartDate, timeframe]
  );
  const resolvedDateRangeLabel = buildDateRangeLabel(effectiveDateRange.start, effectiveDateRange.end);
  const visibleTimeframeOptions = TIMEFRAME_OPTIONS.filter((option) => TIMEFRAME_BY_REPORT_MODE[reportMode].includes(option.value));
  const visibleComparePresetOptions = COMPARE_PRESET_OPTIONS.filter((option) => {
    if (option.value === 'none') return false;
    if (reportMode === 'daily') return option.value === 'today_vs_yesterday' || option.value === 'custom';
    if (reportMode === 'weekly') return option.value === 'this_week_vs_last_week' || option.value === 'custom';
    return option.value === 'this_month_vs_last_month' || option.value === 'monthly_vs_previous' || option.value === 'custom';
  });
  const selectedCustomerProfileBreakdownLabel = CUSTOMER_PROFILE_BREAKDOWN_OPTIONS.find((option) => option.value === customerProfileBreakdown)?.label || 'Age Group';
  const selectedCustomerVehicleFilterLabel = customerVehicleFilter === 'all' ? 'All vehicles' : customerVehicleFilter;
  // All derived rows/trends/comparisons are memoized so unrelated parent
  // re-renders (toasts, nav state) do not re-run the heavy aggregations.
  const derivedAnalytics = useMemo(() => {
    const primaryTrendOptions: TrendPeriodOptions | undefined = timeframe === 'monthly'
      ? { bucket: 'month', range: comparisonRanges?.primary || getTimeframeRange('monthly') }
      : undefined;
    const secondaryTrendOptions: TrendPeriodOptions | undefined = timeframe === 'monthly' && comparisonRanges
      ? { bucket: 'month', range: comparisonRanges.secondary }
      : undefined;
    const trendSeriesLimit = timeframe === 'monthly' ? Number.MAX_SAFE_INTEGER : 3;
    const sortedCustomerVehicleModelOptions = isCustomerSectionOpen
      ? [...analytics.customerVehicleModelOptions].sort((a, b) => (
        customerVehicleFilterSort === 'quantity'
          ? b.count - a.count || a.label.localeCompare(b.label)
          : a.label.localeCompare(b.label)
      ))
      : [];
    const customerVehicleFilterOptions: CustomerVehicleModelOption[] = [
      { value: 'all', label: 'All vehicles', count: analytics.filteredApplications.length },
      ...sortedCustomerVehicleModelOptions
    ];
    const customerProfileRows = isCustomerSectionOpen
      ? buildCustomerProfileRows(analytics.rowsByAgeGroup, analytics.rowsByBirthPlace, analytics.rowsByGender, customerProfileBreakdown, selectedCustomerVehicleFilterLabel).sort((a, b) => (
        compareSortValues(
          typeof a[customerProfileSortState.key] === 'number' ? a[customerProfileSortState.key] : String(a[customerProfileSortState.key] || '').toLowerCase(),
          typeof b[customerProfileSortState.key] === 'number' ? b[customerProfileSortState.key] : String(b[customerProfileSortState.key] || '').toLowerCase(),
          customerProfileSortState.direction
        )
      ))
      : [];
    const customerProfileTopRow = customerProfileRows.find((row) => row.value > 0);
    const selectedMarketingBreakdownLabel = MARKETING_BREAKDOWN_OPTIONS.find((option) => option.value === marketingBreakdown)?.label || 'Campaign';
    const selectedOperationsBreakdownLabel = OPERATIONS_BREAKDOWN_OPTIONS.find((option) => option.value === operationsBreakdown)?.label || 'Loan Status';
    const selectedOperationsValueLabel = operationsBreakdown === 'role' ? 'accounts' : 'records';
    const operationsRows = isOperationsSectionOpen
      ? [...(
        operationsBreakdown === 'staff'
          ? analytics.loansByStaff
          : operationsBreakdown === 'role'
            ? analytics.accountsByRole
            : analytics.loansByStatus
      )].sort((a, b) => (
        compareSortValues(
          typeof a[operationsSortState.key] === 'number' ? a[operationsSortState.key] : String(a[operationsSortState.key] || '').toLowerCase(),
          typeof b[operationsSortState.key] === 'number' ? b[operationsSortState.key] : String(b[operationsSortState.key] || '').toLowerCase(),
          operationsSortState.direction
        )
      ))
      : [];
    const operationsTopRow = operationsRows.find((row) => row.value > 0);
    const selectedRawCustomerBreakdownLabel = RAW_CUSTOMER_BREAKDOWN_OPTIONS.find((option) => option.value === rawCustomerBreakdown)?.label || 'Channel';
    const rawCustomerRows = isRawCustomerSectionOpen
      ? [...(
        rawCustomerBreakdown === 'status'
          ? analytics.rawLeadsByStatus
          : rawCustomerBreakdown === 'sourceTraffic'
            ? analytics.rawLeadsBySourceTraffic
            : analytics.rawLeadsByChannel
      )].sort((a, b) => (
        compareSortValues(
          typeof a[rawCustomerSortState.key] === 'number' ? a[rawCustomerSortState.key] : String(a[rawCustomerSortState.key] || '').toLowerCase(),
          typeof b[rawCustomerSortState.key] === 'number' ? b[rawCustomerSortState.key] : String(b[rawCustomerSortState.key] || '').toLowerCase(),
          rawCustomerSortState.direction
        )
      ))
      : [];
    const rawCustomerTopRow = rawCustomerRows.find((row) => row.value > 0);
    const selectedVehicleDemandBreakdownLabel = VEHICLE_DEMAND_BREAKDOWN_OPTIONS.find((option) => option.value === vehicleDemandBreakdown)?.label || 'Model';
    const selectedVehicleConditionFilterLabel = VEHICLE_CONDITION_FILTER_OPTIONS.find((option) => option.value === vehicleConditionFilter)?.label || 'All';
    const selectedPurchaseMethodFilterLabel = PURCHASE_METHOD_FILTER_OPTIONS.find((option) => option.value === purchaseMethodFilter)?.label || 'All';
    const vehicleDemandTotalUnits = isVehicleSectionOpen ? analytics.vehicleDemandRows.reduce((sum, row) => sum + row.value, 0) : 0;
    const vehicleDemandApprovedUnits = isVehicleSectionOpen ? analytics.vehicleDemandRows.reduce((sum, row) => sum + row.approvedUnits, 0) : 0;
    const vehicleDemandApprovedLoanUnits = isVehicleSectionOpen
      ? new Set(analytics.filteredVehicleDemandApplications
        .filter((application) => application.purchase_method === 'Loan' && application.status === LoanStatus.APPROVE)
        .map((application) => normalizeVehiclePlate(application.vehicle_plate) || application.id)).size
      : 0;
    const vehicleDemandApprovalRate = vehicleDemandTotalUnits > 0 ? Math.round((vehicleDemandApprovedUnits / vehicleDemandTotalUnits) * 100) : 0;
    const vehicleDemandTopSegment = isVehicleSectionOpen ? analytics.vehicleDemandRows.find((row) => row.value > 0) : undefined;
    const customerProfileTrendSeries = isCustomerSectionOpen ? buildAggregateTrendSeries<LoanApplication>(
      analytics.customerProfileApplications,
      customerProfileRows,
      (application) => getCustomerProfileGroup(application, customerProfileBreakdown),
      (application) => application.submitted_at,
      'Unknown',
      primaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const rawCustomerTrendSeries = isRawCustomerSectionOpen ? buildAggregateTrendSeries<RawCustomerLead>(
      analytics.filteredRawLeads,
      rawCustomerRows,
      (lead) => (
        rawCustomerBreakdown === 'status'
          ? lead.raw_status
          : rawCustomerBreakdown === 'sourceTraffic'
            ? lead.source_traffic
            : lead.channel
      ),
      (lead) => lead.received_at,
      rawCustomerBreakdown === 'status' ? 'Raw' : rawCustomerBreakdown === 'sourceTraffic' ? 'Unknown' : 'Other',
      primaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const marketingTrendSeries = isMarketingSectionOpen ? buildAggregateTrendSeries(
      deferredWhatsAppTrackingClicks.filter((click) => activeFilterRange
        ? isWithinAnalyticsDateRange(click.clicked_at, activeFilterRange)
        : isWithinTimeframe(click.clicked_at, timeframe, customStartDate, customEndDate)),
      analytics.marketingPerformanceRows,
      (click) => (
        marketingBreakdown === 'link'
          ? click.link_id
          : marketingBreakdown === 'source'
            ? getNormalizedMarketingSource(click, tagNormalizationRules)
            : marketingBreakdown === 'medium'
              ? getNormalizedMarketingMedium(click, tagNormalizationRules)
              : marketingBreakdown === 'sales'
                ? click.sales_name
                : click.campaign
      ),
      (click) => click.clicked_at,
      marketingBreakdown === 'link' ? 'Unknown link' : `Unknown ${marketingBreakdown}`,
      primaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const operationsTrendSeries = isOperationsSectionOpen
      ? operationsBreakdown === 'role'
      ? buildSnapshotTrendSeries(operationsRows)
      : buildAggregateTrendSeries<LoanApplication>(
        analytics.filteredApplications,
        operationsRows,
        (application) => operationsBreakdown === 'staff' ? application.handler_name : application.status,
        (application) => application.submitted_at,
        operationsBreakdown === 'staff' ? 'Unknown staff' : 'Unknown status',
        primaryTrendOptions,
        trendSeriesLimit
      )
      : [];
    const secondaryCustomerProfileTrendSeries = secondaryAnalytics && isCustomerSectionOpen ? buildAggregateTrendSeries<LoanApplication>(
      secondaryAnalytics.customerProfileApplications,
      secondaryAnalytics.customerProfileRows,
      (application) => getCustomerProfileGroup(application, customerProfileBreakdown),
      (application) => application.submitted_at,
      'Unknown',
      secondaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const secondaryRawCustomerTrendSeries = secondaryAnalytics && isRawCustomerSectionOpen ? buildAggregateTrendSeries<RawCustomerLead>(
      secondaryAnalytics.filteredRawLeads,
      secondaryAnalytics.rawCustomerRows,
      (lead) => (
        rawCustomerBreakdown === 'status'
          ? lead.raw_status
          : rawCustomerBreakdown === 'sourceTraffic'
            ? lead.source_traffic
            : lead.channel
      ),
      (lead) => lead.received_at,
      rawCustomerBreakdown === 'status' ? 'Raw' : rawCustomerBreakdown === 'sourceTraffic' ? 'Unknown' : 'Other',
      secondaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const secondaryMarketingTrendSeries = secondaryAnalytics && isMarketingSectionOpen ? buildAggregateTrendSeries(
      deferredWhatsAppTrackingClicks.filter((click) => comparisonRanges
        ? isWithinAnalyticsDateRange(click.clicked_at, comparisonRanges.secondary)
        : false),
      secondaryAnalytics.marketingPerformanceRows,
      (click) => (
        marketingBreakdown === 'link'
          ? click.link_id
          : marketingBreakdown === 'source'
            ? getNormalizedMarketingSource(click, tagNormalizationRules)
            : marketingBreakdown === 'medium'
              ? getNormalizedMarketingMedium(click, tagNormalizationRules)
              : marketingBreakdown === 'sales'
                ? click.sales_name
                : click.campaign
      ),
      (click) => click.clicked_at,
      marketingBreakdown === 'link' ? 'Unknown link' : `Unknown ${marketingBreakdown}`,
      secondaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const secondaryOperationsTrendSeries = secondaryAnalytics && isOperationsSectionOpen
      ? operationsBreakdown === 'role'
        ? buildSnapshotTrendSeries(secondaryAnalytics.operationsRows)
        : buildAggregateTrendSeries<LoanApplication>(
          secondaryAnalytics.filteredApplications,
          secondaryAnalytics.operationsRows,
          (application) => operationsBreakdown === 'staff' ? application.handler_name : application.status,
          (application) => application.submitted_at,
          operationsBreakdown === 'staff' ? 'Unknown staff' : 'Unknown status',
          secondaryTrendOptions,
          trendSeriesLimit
        )
      : [];
    const secondaryVehicleDemandTrendSeries = secondaryAnalytics && isVehicleSectionOpen ? buildVehicleDemandTrendSeries(
      secondaryAnalytics.filteredApplications.filter((application) => matchesVehicleDemandFilters(application, vehicleConditionFilter, purchaseMethodFilter)),
      vehicleDemandBreakdown,
      secondaryAnalytics.vehicleDemandRows,
      secondaryTrendOptions,
      trendSeriesLimit
    ) : [];
    const secondaryRejectedCodeTrendSeries = secondaryAnalytics && isOperationsSectionOpen ? buildAggregateTrendSeries(
      secondaryAnalytics.filteredApplications.filter((application) => application.status === LoanStatus.REJECT),
      secondaryAnalytics.rejectedCodeRows,
      getRejectedCodeKey,
      (application) => application.submitted_at,
      'NO_CODE',
      secondaryTrendOptions,
      trendSeriesLimit
    ) : [];
    return {
      selectedMarketingBreakdownLabel,
      selectedOperationsBreakdownLabel,
      selectedOperationsValueLabel,
      selectedRawCustomerBreakdownLabel,
      selectedVehicleDemandBreakdownLabel,
      selectedVehicleConditionFilterLabel,
      selectedPurchaseMethodFilterLabel,
      customerVehicleFilterOptions,
      customerProfileRows,
      customerProfileTopRow,
      operationsRows,
      operationsTopRow,
      rawCustomerRows,
      rawCustomerTopRow,
      vehicleDemandTotalUnits,
      vehicleDemandApprovedUnits,
      vehicleDemandApprovedLoanUnits,
      vehicleDemandApprovalRate,
      vehicleDemandTopSegment,
      customerProfileTrendSeries,
      rawCustomerTrendSeries,
      marketingTrendSeries,
      operationsTrendSeries,
      secondaryCustomerProfileTrendSeries,
      secondaryRawCustomerTrendSeries,
      secondaryMarketingTrendSeries,
      secondaryOperationsTrendSeries,
      secondaryVehicleDemandTrendSeries,
      secondaryRejectedCodeTrendSeries
    };
  }, [activeFilterRange, analytics, comparisonRanges, customStartDate, customEndDate, customerProfileBreakdown, customerProfileSortState, customerVehicleFilter, customerVehicleFilterSort, deferredWhatsAppTrackingClicks, isCustomerSectionOpen, isMarketingSectionOpen, isOperationsSectionOpen, isRawCustomerSectionOpen, isVehicleSectionOpen, marketingBreakdown, operationsBreakdown, operationsSortState, purchaseMethodFilter, rawCustomerBreakdown, rawCustomerSortState, secondaryAnalytics, selectedCustomerVehicleFilterLabel, tagNormalizationRules, timeframe, vehicleConditionFilter, vehicleDemandBreakdown]);

  const {
    selectedMarketingBreakdownLabel,
    selectedOperationsBreakdownLabel,
    selectedOperationsValueLabel,
    selectedRawCustomerBreakdownLabel,
    selectedVehicleDemandBreakdownLabel,
    selectedVehicleConditionFilterLabel,
    selectedPurchaseMethodFilterLabel,
    customerVehicleFilterOptions,
    customerProfileRows,
    customerProfileTopRow,
    operationsRows,
    operationsTopRow,
    rawCustomerRows,
    rawCustomerTopRow,
    vehicleDemandTotalUnits,
    vehicleDemandApprovedUnits,
    vehicleDemandApprovedLoanUnits,
    vehicleDemandApprovalRate,
    vehicleDemandTopSegment,
    customerProfileTrendSeries,
    rawCustomerTrendSeries,
    marketingTrendSeries,
    operationsTrendSeries,
    secondaryCustomerProfileTrendSeries,
    secondaryRawCustomerTrendSeries,
    secondaryMarketingTrendSeries,
    secondaryOperationsTrendSeries,
    secondaryVehicleDemandTrendSeries,
    secondaryRejectedCodeTrendSeries
  } = derivedAnalytics;
  const getStatComparison = (
    secondaryValue: string | number | undefined,
    delta?: number,
    suffix = '',
    inverse = false
  ): StatComparison | undefined => (
    comparisonRanges && secondaryAnalytics && secondaryValue !== undefined
      ? {
        primaryLabel: comparisonRanges.primary.label,
        secondaryLabel: comparisonRanges.secondary.label,
        secondaryValue,
        delta,
        suffix,
        inverse
      }
      : undefined
  );
  const handleComparePresetChange = (preset: ComparePresetKey) => {
    setComparePreset(preset);

    if (preset === 'none') {
      return;
    }

    if (preset === 'today_vs_yesterday') {
      setTimeframe('today');
      return;
    }

    if (preset === 'this_week_vs_last_week') {
      setTimeframe('this_week');
      return;
    }

    if (preset === 'this_month_vs_last_month') {
      setTimeframe('this_month');
      return;
    }

    if (preset === 'monthly_vs_previous') {
      setTimeframe('monthly');
      setVehicleDemandBreakdown('model');
      return;
    }

    const primaryDefault = getTimeframeInputValues(reportMode === 'daily' ? 'today' : reportMode === 'weekly' ? 'this_week' : 'this_month');
    const secondaryDefault = getTimeframeInputValues(reportMode === 'daily' ? 'yesterday' : reportMode === 'weekly' ? 'last_week' : 'last_month');

    setComparePrimaryStartDate(primaryDefault.start);
    setComparePrimaryEndDate(primaryDefault.end);
    setCompareSecondaryStartDate(secondaryDefault.start);
    setCompareSecondaryEndDate(secondaryDefault.end);
  };

  const handleReportModeChange = (mode: ReportMode) => {
    setReportMode(mode);
    setComparePreset('none');
    setShowComparisonSetup(false);
    if (mode === 'daily') setTimeframe('today');
    else if (mode === 'weekly') setTimeframe('this_week');
    else if (!TIMEFRAME_BY_REPORT_MODE.overall.includes(timeframe)) setTimeframe('last_30_days');
  };

  return (
    <div id="analytics-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{tr('数据分析', 'Analytics', "Analitik")}</h2>
          <p className="max-w-2xl text-xs font-light leading-relaxed text-slate-500">
            {tr('生意数据总览。', 'Business data at a glance.', "Data perniagaan sepintas lalu.")}
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-700 shadow-sm">
            {scopeLabel}
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
            {tr('最后点击', 'Last click', "klik terakhir")}: <span className="font-mono font-semibold text-slate-700">{latestClickTime(whatsAppTrackingClicks)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">{tr('报表模式', 'Report mode', 'Mod laporan')}</span>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1" aria-label={tr('报表模式', 'Report mode', 'Mod laporan')}>
              {REPORT_MODE_OPTIONS.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => handleReportModeChange(mode.value)}
                  aria-pressed={reportMode === mode.value}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                    reportMode === mode.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {tr(mode.zh, mode.en, mode.ms)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1" aria-label={tr('对比模式', 'Comparison mode', 'Mod perbandingan')}>
            <button type="button" onClick={() => { setComparePreset('none'); setShowComparisonSetup(false); }} aria-pressed={!showComparisonSetup && comparePreset === 'none'} className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${!showComparisonSetup && comparePreset === 'none' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{tr('标准', 'Standard', 'Standard')}</button>
            <button type="button" onClick={() => setShowComparisonSetup(true)} aria-pressed={showComparisonSetup || comparePreset !== 'none'} className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${showComparisonSetup || comparePreset !== 'none' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>{tr('对比设定', 'Compare setup', 'Tetapan perbandingan')}</button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">{tr('申请日期', 'Application date', 'Tarikh permohonan')}</span>
            {visibleTimeframeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setComparePreset('none');
                  setShowComparisonSetup(false);
                  setTimeframe(option.value);
                  if (option.value === 'monthly') setVehicleDemandBreakdown('model');
                }}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${
                  timeframe === option.value ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tra(option.label)}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-indigo-700">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{tr('统计范围', 'Data range', 'Julat data')}:</span>
            <span className="font-mono font-bold">{resolvedDateRangeLabel}</span>
          </div>
        </div>
        {timeframe === 'custom' && comparePreset === 'none' && (
          <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
            <label>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tra('Start date')}</span>
              <input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} aria-label={tra('Start date')} className="mt-1.5 w-full rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none ring-indigo-100 focus:ring-2" />
            </label>
            <label>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tra('End date')}</span>
              <input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} aria-label={tra('End date')} className="mt-1.5 w-full rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none ring-indigo-100 focus:ring-2" />
            </label>
          </div>
        )}
        {showComparisonSetup && (
          <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label={tr('对比时段', 'Comparison range', 'Julat perbandingan')}>
              {visibleComparePresetOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleComparePresetChange(option.value)}
                  aria-pressed={comparePreset === option.value}
                  className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${comparePreset === option.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:text-slate-900'}`}
                >
                  {tra(option.label)}
                </button>
              ))}
            </div>
            {comparePreset === 'custom' && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Primary Start', value: comparePrimaryStartDate, onChange: setComparePrimaryStartDate },
                  { label: 'Primary End', value: comparePrimaryEndDate, onChange: setComparePrimaryEndDate },
                  { label: 'Compare Start', value: compareSecondaryStartDate, onChange: setCompareSecondaryStartDate },
                  { label: 'Compare End', value: compareSecondaryEndDate, onChange: setCompareSecondaryEndDate }
                ].map((field) => (
                  <label key={field.label}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tra(field.label)}</span>
                    <input type="date" value={field.value} onChange={(event) => field.onChange(event.target.value)} aria-label={tra(field.label)} className="mt-1.5 w-full rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none ring-indigo-100 focus:ring-2" />
                  </label>
                ))}
              </div>
            )}
            {comparisonRanges && (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-white px-3 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tr('基准', 'Baseline', 'Asas')}</span>
                  <p className="mt-1 font-mono text-xs font-bold text-slate-800">{comparisonRanges.primary.label}</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{tr('对比', 'Comparison', 'Perbandingan')}</span>
                  <p className="mt-1 font-mono text-xs font-bold text-slate-800">{comparisonRanges.secondary.label}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <AnalyticsExecutiveOverview
        activeTimeframeLabel={activeTimeframeLabel}
        approvalRate={analytics.approvalRate}
        approvedLoans={analytics.approvedLoans}
        rejectedLoans={analytics.rejectedLoans}
        applicationsCount={analytics.filteredApplications.length}
        rawLeadsCount={analytics.filteredRawLeads.length}
        totalClicks={analytics.totalClicks}
        topSaleLabel={analytics.selectedTopSaleModel?.label}
        statusRows={analytics.loansByStatus.map((row) => ({ ...row, label: trLoanStatus(row.label) }))}
        applications={analytics.filteredApplications}
        timeframe={timeframe}
        trendRange={effectiveDateRange}
        canExportData={canExportData}
      />

      {comparisonRanges && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-2.5">
          <p className="text-xs font-bold text-indigo-700">
            {tr('对比中：', 'Comparing: ', "Membandingkan:")}{comparisonRanges.primary.label} vs {comparisonRanges.secondary.label}{tr(' — 展开的深入分析卡会显示与上期的差值', ' — expanded detail cards show the delta vs the previous period', "— kad analisis terperinci yang dibuka menunjukkan delta berbanding tempoh sebelumnya")}
          </p>
          <button
            type="button"
            onClick={() => { setComparePreset('none'); setShowComparisonSetup(false); }}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-100"
          >
            {tr('取消对比', 'Clear compare', "Jelas perbandingan")}
          </button>
        </div>
      )}

      <section id="analytics-detail-tabs" className="sticky top-16 z-20 rounded-2xl bg-white/90 p-2 shadow-sm backdrop-blur">
        <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label={tr('深入分析', 'Detailed analysis', 'Analisis terperinci')}>
          {ANALYTICS_DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeAnalysisTab === tab.id}
              onClick={() => setActiveAnalysisTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                activeAnalysisTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <img src={tab.icon} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
              {tr(tab.zh, tab.en, tab.ms)}
            </button>
          ))}
        </div>
      </section>

      <AnalyticsChartPreferenceProvider
        modes={chartTypeBySection}
        onChange={handleChartTypeChange}
        lockedOpen
        forcedMode={timeframe === 'monthly' ? 'trend' : undefined}
      >
      <div className="flex flex-col gap-6">
      <div className={activeAnalysisTab === 'vehicle' ? 'block' : 'hidden'}>
      <VehicleDemandSection
        isOpen
        onToggle={() => undefined}
        totalVehicleUnits={analytics.totalVehicleUnits}
        vehicleStockRowsCount={analytics.vehicleStockRows.length}
        topVehicleModel={analytics.topVehicleModel}
        loansByVehicleBrandCount={analytics.loansByVehicleBrand.length}
        vehicleDemandBreakdown={vehicleDemandBreakdown}
        onVehicleDemandBreakdownChange={setVehicleDemandBreakdown}
        vehicleConditionFilter={vehicleConditionFilter}
        onVehicleConditionFilterChange={setVehicleConditionFilter}
        purchaseMethodFilter={purchaseMethodFilter}
        onPurchaseMethodFilterChange={setPurchaseMethodFilter}
        selectedVehicleConditionFilterLabel={selectedVehicleConditionFilterLabel}
        selectedPurchaseMethodFilterLabel={selectedPurchaseMethodFilterLabel}
        selectedVehicleDemandBreakdownLabel={selectedVehicleDemandBreakdownLabel}
        filteredVehicleDemandApplicationsCount={analytics.filteredVehicleDemandApplications.length}
        vehicleDemandTotalUnits={vehicleDemandTotalUnits}
        vehicleDemandApprovedUnits={vehicleDemandApprovedUnits}
        vehicleDemandApprovedLoanUnits={vehicleDemandApprovedLoanUnits}
        vehicleDemandApprovalRate={vehicleDemandApprovalRate}
        vehicleDemandTopSegment={vehicleDemandTopSegment}
        visual={(
          <VehicleDemandVisual
            rows={analytics.vehicleDemandRows}
            trendSeries={analytics.vehicleDemandTrendSeries}
            comparisonRows={secondaryAnalytics?.vehicleDemandRows}
            comparisonTrendSeries={secondaryVehicleDemandTrendSeries}
            mode={chartTypeBySection.vehicle}
            valueLabel={selectedVehicleDemandBreakdownLabel}
            timeframeLabel={activeTimeframeLabel}
            primaryLabel={comparisonRanges?.primary.label}
            comparisonLabel={comparisonRanges?.secondary.label}
            monthlyView={timeframe === 'monthly'}
          />
        )}
        showDetails={showVehicleDemandDetails}
        onToggleDetails={() => setShowVehicleDemandDetails((current) => !current)}
        rows={analytics.vehicleDemandRows}
        sortState={vehicleDemandSortState}
        onSort={handleVehicleDemandSort}
        comparisons={{
          totalVehicleUnits: getStatComparison(secondaryAnalytics?.totalVehicleUnits, secondaryAnalytics ? analytics.totalVehicleUnits - secondaryAnalytics.totalVehicleUnits : undefined),
          topVehicleModelLabel: getStatComparison(secondaryAnalytics?.topVehicleModel?.label || '-'),
          topVehicleModelShare: getStatComparison(secondaryAnalytics?.topVehicleModel?.percentage || 0, secondaryAnalytics ? (analytics.topVehicleModel?.percentage || 0) - (secondaryAnalytics.topVehicleModel?.percentage || 0) : undefined, '%'),
          loansByVehicleBrandCount: getStatComparison(secondaryAnalytics?.loansByVehicleBrand.length, secondaryAnalytics ? analytics.loansByVehicleBrand.length - secondaryAnalytics.loansByVehicleBrand.length : undefined),
          vehicleDemandTotalUnits: getStatComparison(secondaryAnalytics?.vehicleDemandTotalUnits, secondaryAnalytics ? vehicleDemandTotalUnits - secondaryAnalytics.vehicleDemandTotalUnits : undefined),
          vehicleDemandApprovedUnits: getStatComparison(secondaryAnalytics?.vehicleDemandApprovedUnits, secondaryAnalytics ? vehicleDemandApprovedUnits - secondaryAnalytics.vehicleDemandApprovedUnits : undefined),
          vehicleDemandApprovalRate: getStatComparison(secondaryAnalytics?.vehicleDemandApprovalRate, secondaryAnalytics ? vehicleDemandApprovalRate - secondaryAnalytics.vehicleDemandApprovalRate : undefined, '%'),
          vehicleDemandTopSegment: getStatComparison(secondaryAnalytics?.vehicleDemandTopSegment?.label || '-')
        }}
      />
      {analytics.vehicleStatusRelationship && (
        <div className="mt-6">
          <VehicleStatusRelationshipCard
            timeframeLabel={tra(activeTimeframeLabel)}
            data={analytics.vehicleStatusRelationship}
          />
        </div>
      )}
      </div>
      <div className={activeAnalysisTab === 'customer' ? 'block' : 'hidden'}>
      <CustomerProfileSection
        isOpen
        onToggle={() => undefined}
        activeTimeframeLabel={activeTimeframeLabel}
        nricProfileCount={analytics.nricProfiles.length}
        averageAge={analytics.averageAge}
        topAgeGroup={analytics.topAgeGroup}
        topBirthPlace={analytics.topBirthPlace}
        filteredApplicationsCount={analytics.filteredApplications.length}
        customerProfileBreakdown={customerProfileBreakdown}
        onCustomerProfileBreakdownChange={setCustomerProfileBreakdown}
        isVehicleFilterOpen={isCustomerVehicleFilterOpen}
        onToggleVehicleFilter={() => setIsCustomerVehicleFilterOpen((current) => !current)}
        onCloseVehicleFilter={() => setIsCustomerVehicleFilterOpen(false)}
        selectedCustomerVehicleFilterLabel={selectedCustomerVehicleFilterLabel}
        customerVehicleFilter={customerVehicleFilter}
        onCustomerVehicleFilterChange={setCustomerVehicleFilter}
        customerVehicleFilterSort={customerVehicleFilterSort}
        onCustomerVehicleFilterSortChange={setCustomerVehicleFilterSort}
        customerVehicleFilterOptions={customerVehicleFilterOptions}
        selectedCustomerProfileBreakdownLabel={selectedCustomerProfileBreakdownLabel}
        customerProfileApplicationsCount={analytics.customerProfileApplications.length}
        topRow={customerProfileTopRow}
        rows={customerProfileRows}
        visual={(
          <OperationsPerformanceVisual
            rows={customerProfileRows}
            visualMode={chartTypeBySection.customer}
            valueLabel="customers"
            ariaLabel="Customer Profile Performance"
            emptyText={tr('当前时间段没有可解析的客户画像数据', 'No parsable customer profile data in this timeframe', "Tiada data profil pelanggan yang boleh dihuraikan dalam jangka masa ini")}
            trendSeries={customerProfileTrendSeries}
            comparisonRows={secondaryAnalytics?.customerProfileRows}
            comparisonTrendSeries={secondaryCustomerProfileTrendSeries}
            primaryLabel={comparisonRanges?.primary.label}
            comparisonLabel={comparisonRanges?.secondary.label}
            monthlyView={timeframe === 'monthly'}
          />
        )}
        showDetails={showCustomerProfileDetails}
        onToggleDetails={() => setShowCustomerProfileDetails((current) => !current)}
        sortState={customerProfileSortState}
        onSort={handleCustomerProfileSort}
        comparisons={{
          nricProfileCount: getStatComparison(secondaryAnalytics?.nricProfiles.length, secondaryAnalytics ? analytics.nricProfiles.length - secondaryAnalytics.nricProfiles.length : undefined),
          topAgeGroupLabel: getStatComparison(secondaryAnalytics?.topAgeGroup?.label || '-'),
          topBirthPlaceLabel: getStatComparison(secondaryAnalytics?.topBirthPlace?.label || '-'),
          filteredApplicationsCount: getStatComparison(secondaryAnalytics?.filteredApplications.length, secondaryAnalytics ? analytics.filteredApplications.length - secondaryAnalytics.filteredApplications.length : undefined),
          customerProfileApplicationsCount: getStatComparison(secondaryAnalytics?.customerProfileApplications.length, secondaryAnalytics ? analytics.customerProfileApplications.length - secondaryAnalytics.customerProfileApplications.length : undefined),
          topRowLabel: getStatComparison(secondaryAnalytics?.customerProfileRows.find((row) => row.value > 0)?.label || '-')
        }}
      />
      </div>
      <div className={activeAnalysisTab === 'rawCustomer' ? 'block' : 'hidden'}>
      <RawCustomerSection
        isOpen
        onToggle={() => undefined}
        activeTimeframeLabel={activeTimeframeLabel}
        filteredRawLeadsCount={analytics.filteredRawLeads.length}
        rawLeadsApplied={analytics.rawLeadsApplied}
        rawLeadsPotential={analytics.rawLeadsPotential}
        uniqueRawPhones={analytics.uniqueRawPhones}
        duplicatedRawPhoneCount={analytics.duplicatedRawPhoneCount}
        rawCustomerBreakdown={rawCustomerBreakdown}
        onRawCustomerBreakdownChange={setRawCustomerBreakdown}
        selectedRawCustomerBreakdownLabel={selectedRawCustomerBreakdownLabel}
        rows={rawCustomerRows}
        topRow={rawCustomerTopRow}
        visual={(
          <OperationsPerformanceVisual
            rows={rawCustomerRows}
            visualMode={chartTypeBySection.rawCustomer}
            valueLabel="leads"
            ariaLabel="Raw Customer Performance"
            emptyText={tr('当前时间段没有名单数据', 'No lead data in this timeframe', "Tiada data prospek dalam jangka masa ini")}
            trendSeries={rawCustomerTrendSeries}
            comparisonRows={secondaryAnalytics?.rawCustomerRows}
            comparisonTrendSeries={secondaryRawCustomerTrendSeries}
            primaryLabel={comparisonRanges?.primary.label}
            comparisonLabel={comparisonRanges?.secondary.label}
            monthlyView={timeframe === 'monthly'}
          />
        )}
        showDetails={showRawCustomerDetails}
        onToggleDetails={() => setShowRawCustomerDetails((current) => !current)}
        sortState={rawCustomerSortState}
        onSort={handleRawCustomerSort}
        comparisons={{
          filteredRawLeadsCount: getStatComparison(secondaryAnalytics?.filteredRawLeads.length, secondaryAnalytics ? analytics.filteredRawLeads.length - secondaryAnalytics.filteredRawLeads.length : undefined),
          rawLeadsApplied: getStatComparison(secondaryAnalytics?.rawLeadsApplied, secondaryAnalytics ? analytics.rawLeadsApplied - secondaryAnalytics.rawLeadsApplied : undefined),
          rawLeadsPotential: getStatComparison(secondaryAnalytics?.rawLeadsPotential, secondaryAnalytics ? analytics.rawLeadsPotential - secondaryAnalytics.rawLeadsPotential : undefined),
          uniqueRawPhones: getStatComparison(secondaryAnalytics?.uniqueRawPhones, secondaryAnalytics ? analytics.uniqueRawPhones - secondaryAnalytics.uniqueRawPhones : undefined),
          duplicatedRawPhoneCount: getStatComparison(secondaryAnalytics?.duplicatedRawPhoneCount, secondaryAnalytics ? analytics.duplicatedRawPhoneCount - secondaryAnalytics.duplicatedRawPhoneCount : undefined, '', true),
          rowsCount: getStatComparison(secondaryAnalytics?.rawCustomerRows.length, secondaryAnalytics ? rawCustomerRows.length - secondaryAnalytics.rawCustomerRows.length : undefined),
          topRowLabel: getStatComparison(secondaryAnalytics?.rawCustomerTopRow?.label || '-'),
          topRowShare: getStatComparison(secondaryAnalytics?.rawCustomerTopRow?.percentage || 0, secondaryAnalytics ? (rawCustomerTopRow?.percentage || 0) - (secondaryAnalytics.rawCustomerTopRow?.percentage || 0) : undefined, '%')
        }}
      />
      {activeAnalysisTab === 'rawCustomer' && (
        <section className="mt-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">{tr('转化来源分析', 'Conversion by Source', "Penukaran mengikut Sumber")}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{tr('各来源潜在客户数、转成贷款申请数与转化率。', 'Leads, converted applications and conversion rate per source.', "prospek, permohonan ditukar dan kadar penukaran bagi setiap sumber.")}</p>
          </div>
          {conversionBySource.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">{tr('当前时间段没有名单数据', 'No lead data in this timeframe', "Tiada data prospek dalam jangka masa ini")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">{tr('来源', 'Source', "Sumber")}</th>
                    <th className="py-2 pr-3 text-right">{tr('潜在客户', 'Leads', "Prospek")}</th>
                    <th className="py-2 pr-3 text-right">{tr('转化数', 'Converted', "Ditukar")}</th>
                    <th className="py-2 pl-3 text-right">{tr('转化率', 'Rate', "Kadar")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {conversionBySource.map((row) => (
                    <tr key={row.source}>
                      <td className="py-2 pr-3 font-bold text-slate-700">{row.source}</td>
                      <td className="py-2 pr-3 text-right font-mono text-slate-600">{row.total.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-right font-mono font-bold text-emerald-600">{row.converted.toLocaleString()}</td>
                      <td className="py-2 pl-3 text-right">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, row.rate)}%` }} />
                          </span>
                          <span className="w-9 text-right font-mono font-bold text-slate-700">{row.rate}%</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      </div>
      {SHOW_MARKETING_WHATSAPP_TRACKING && (
      <div className={activeAnalysisTab === 'marketing' ? 'block' : 'hidden'}>
      <MarketingSection
        isOpen
        onToggle={() => undefined}
        totalClicks={analytics.totalClicks}
        activeLinks={analytics.activeLinks}
        totalLinks={whatsAppTrackingLinks.length}
        campaignsCount={analytics.clicksByCampaign.length}
        sourcesCount={analytics.clicksBySource.length}
        salesSourcesCount={analytics.clicksBySales.length}
        marketingBreakdown={marketingBreakdown}
        onMarketingBreakdownChange={setMarketingBreakdown}
        selectedMarketingBreakdownLabel={selectedMarketingBreakdownLabel}
        rows={analytics.marketingPerformanceRows}
        visual={(
          <MarketingPerformanceVisual
            rows={analytics.marketingPerformanceRows}
            visualMode={chartTypeBySection.marketing}
            breakdown={marketingBreakdown}
            staffColorMap={staffColorMap}
            trendSeries={marketingTrendSeries}
            comparisonRows={secondaryAnalytics?.marketingPerformanceRows}
            comparisonTrendSeries={secondaryMarketingTrendSeries}
            primaryLabel={comparisonRanges?.primary.label}
            comparisonLabel={comparisonRanges?.secondary.label}
            monthlyView={timeframe === 'monthly'}
          />
        )}
        showDetails={showMarketingDetails}
        onToggleDetails={() => setShowMarketingDetails((current) => !current)}
        sortState={marketingSortState}
        onSort={handleMarketingSort}
        comparisons={{
          totalClicks: getStatComparison(secondaryAnalytics?.totalClicks, secondaryAnalytics ? analytics.totalClicks - secondaryAnalytics.totalClicks : undefined),
          campaignsCount: getStatComparison(secondaryAnalytics?.clicksByCampaign.length, secondaryAnalytics ? analytics.clicksByCampaign.length - secondaryAnalytics.clicksByCampaign.length : undefined),
          activeLinks: getStatComparison(analytics.activeLinks, 0),
          salesSourcesCount: getStatComparison(secondaryAnalytics?.clicksBySales.length, secondaryAnalytics ? analytics.clicksBySales.length - secondaryAnalytics.clicksBySales.length : undefined),
          rowsCount: getStatComparison(secondaryAnalytics?.marketingPerformanceRows.length, secondaryAnalytics ? analytics.marketingPerformanceRows.length - secondaryAnalytics.marketingPerformanceRows.length : undefined),
          topRowLabel: getStatComparison(secondaryAnalytics?.marketingTopRow?.label || '-'),
          topRowShare: getStatComparison(secondaryAnalytics?.marketingTopRow?.percentage || 0, secondaryAnalytics ? (analytics.marketingPerformanceRows[0]?.percentage || 0) - (secondaryAnalytics.marketingTopRow?.percentage || 0) : undefined, '%')
        }}
      />
      </div>
      )}
      <div className={activeAnalysisTab === 'operations' ? 'block' : 'hidden'}>
      <CompletedTasksAnalytics
        events={filteredCompletedTaskEvents}
        secondaryEvents={secondaryCompletedTaskEvents}
        timeframeLabel={activeTimeframeLabel}
      />
      <OperationsSection
        isOpen
        onToggle={() => undefined}
        comparisonActive={Boolean(comparisonRanges && secondaryAnalytics)}
        comparisonLabels={comparisonRanges ? { primary: comparisonRanges.primary.label, secondary: comparisonRanges.secondary.label } : undefined}
        rejectedCodeRows={analytics.rejectedCodeRows}
        secondaryRejectedCodeRowsCount={secondaryAnalytics?.rejectedCodeRows.length}
        topRejectedCodeLabel={analytics.topRejectedCode?.label || '-'}
        secondaryTopRejectedCodeLabel={secondaryAnalytics?.topRejectedCode?.label || '-'}
        rejectedLoans={analytics.rejectedLoans}
        secondaryRejectedLoans={secondaryAnalytics?.rejectedLoans}
        rejectedCodeVisual={(
          <HorizontalBars
            title={tr('拒贷代码分布', 'REJECT CODE Distribution', "TOLAK Agihan KOD")}
            subtitle={tr('按所选时间段统计最终失败贷款代码', 'Final failed loan CODE grouped by selected timeframe', "KOD pinjaman gagal akhir dikumpulkan mengikut jangka masa yang dipilih")}
            rows={analytics.rejectedCodeRows}
            emptyText={tr('当前时间段没有拒贷代码数据', 'No reject code data in this timeframe', "Tiada data kod penolakan dalam jangka masa ini")}
            valueLabel="rejects"
            visualMode={chartTypeBySection.operations}
            trendSeries={analytics.rejectedCodeTrendSeries}
            comparisonRows={secondaryAnalytics?.rejectedCodeRows}
            comparisonTrendSeries={secondaryRejectedCodeTrendSeries}
            primaryLabel={comparisonRanges?.primary.label}
            comparisonLabel={comparisonRanges?.secondary.label}
            monthlyView={timeframe === 'monthly'}
          />
        )}
        operationsBreakdown={operationsBreakdown}
        onOperationsBreakdownChange={setOperationsBreakdown}
        selectedOperationsBreakdownLabel={selectedOperationsBreakdownLabel}
        selectedOperationsValueLabel={selectedOperationsValueLabel}
        rows={operationsRows}
        topRow={operationsTopRow}
        visual={(
          <OperationsPerformanceVisual
            rows={operationsRows}
            visualMode={chartTypeBySection.operations}
            valueLabel={selectedOperationsValueLabel}
            colorMode={operationsBreakdown === 'staff' ? 'staff' : 'default'}
            staffColorMap={staffColorMap}
            trendSeries={operationsTrendSeries}
            comparisonRows={secondaryAnalytics?.operationsRows}
            comparisonTrendSeries={secondaryOperationsTrendSeries}
            primaryLabel={comparisonRanges?.primary.label}
            comparisonLabel={comparisonRanges?.secondary.label}
            monthlyView={timeframe === 'monthly' && operationsBreakdown !== 'role'}
          />
        )}
        showDetails={showOperationsDetails}
        onToggleDetails={() => setShowOperationsDetails((current) => !current)}
        sortState={operationsSortState}
        onSort={handleOperationsSort}
        comparisons={{
          rowsCount: getStatComparison(secondaryAnalytics?.operationsRows.length, secondaryAnalytics ? operationsRows.length - secondaryAnalytics.operationsRows.length : undefined),
          topRowLabel: getStatComparison(secondaryAnalytics?.operationsTopRow?.label || '-'),
          topRowShare: getStatComparison(secondaryAnalytics?.operationsTopRow?.percentage || 0, secondaryAnalytics ? (operationsTopRow?.percentage || 0) - (secondaryAnalytics.operationsTopRow?.percentage || 0) : undefined, '%')
        }}
      />
      </div>
      </div>
      </AnalyticsChartPreferenceProvider>


    </div>
  );
}

export default React.memo(AnalyticsDashboard);
