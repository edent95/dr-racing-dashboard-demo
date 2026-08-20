/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Friend Plan — buyer-facing proposal page: what you get, what it would cost
 * elsewhere, and the friend price. Numbers live in src/data/salesBudget.ts.
 */

import React from 'react';
import {
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  Coins,
  FileCheck,
  MessageCircle,
  PhoneCall,
  ScrollText,
  Shield,
  Users,
  Wrench
} from 'lucide-react';
import { tr } from '../lib/i18n';
import {
  RATES_CHECKED_ON,
  serverMonthlyCost,
  domainMonthlyCost,
  hardMonthlyCost,
  friendMonthlyProfit,
  supportServices,
  formatCurrency,
  MARKET_MONTHLY_RETAINER,
  cooperationTerms,
  FRIEND_MONTHLY_FEE,
  setupValueTotal,
  moduleShowcase,
  monthlyIncludes
} from '../data/salesBudget';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  customers: <Users className="h-4 w-4" />,
  leads: <PhoneCall className="h-4 w-4" />,
  approval: <FileCheck className="h-4 w-4" />,
  commission: <Coins className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  roles: <Shield className="h-4 w-4" />,
  audit: <ScrollText className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  mobile: <CalendarDays className="h-4 w-4" />
};

export default function SalesBudgetPage() {
  return (
    <div id="sales-budget-page" className="space-y-6">
      {/* 1. Hero: title + price */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Friend Plan</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              {tr('你的专属系统方案', 'Your System Plan', "Pelan Sistem Anda")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {tr(
                '一套为你的生意量身做的贷款客户管理系统。开发和设备我全部承担，你只负责让它继续跑。',
                'A loan CRM built specifically for your business. I cover all the build and equipment — you only keep it running.', "CRM pinjaman yang dibina khusus untuk perniagaan anda. Saya meliputi semua binaan dan peralatan — anda hanya meneruskannya."
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-6 md:gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{tr('一次性费用', 'One-time fee', "Bayaran sekali")}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-4xl font-bold tracking-tight">RM 0</p>
              </div>
              <p className="mt-1 font-mono text-[11px] text-white/50 line-through">{formatCurrency(setupValueTotal)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{tr('月费', 'Monthly', "Bulanan")}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <p className="text-4xl font-bold tracking-tight">{formatCurrency(FRIEND_MONTHLY_FEE).replace('.00', '')}</p>
              </div>
              <p className="mt-1 text-[11px] text-white/50">{tr('全包，无隐藏费用', 'all-in, no hidden fees', "all-in, tiada yuran tersembunyi")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. What you get */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">{tr('你得到什么', 'What you get', "Apa yang anda dapat")}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {tr('10 个核心模块，全部已经做好并在运行中。', '10 core modules, all built and already running.', "10 modul teras, semuanya dibina dan sudah berjalan.")}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {moduleShowcase.map((mod) => (
            <div key={mod.key} className="rounded-lg bg-slate-50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-800 text-white">
                {MODULE_ICONS[mod.key]}
              </div>
              <p className="mt-2 text-xs font-bold text-slate-900">{tr(mod.nameZh, mod.nameEn, mod.nameMs)}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{tr(mod.descZh, mod.descEn, mod.descMs)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Market comparison */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr('请团队维护', 'Maintenance team', "Pasukan penyelenggaraan")}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{formatCurrency(MARKET_MONTHLY_RETAINER).replace('.00', '')}{tr('/月', '/mo', "/bln")}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {tr('市场维护 retainer 行情，通常不包新功能。', 'Typical market retainer, usually excluding new features.', "Penahan pasaran biasa, biasanya tidak termasuk ciri baharu.")}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-600 p-5 text-white shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{tr('朋友价', 'Friend price', "Harga kawan")}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">RM 0 + {formatCurrency(FRIEND_MONTHLY_FEE).replace('.00', '')}{tr('/月', '/mo', "/bln")}</p>
          <p className="mt-2 text-xs leading-relaxed text-white/80">
            {tr('系统直接可用，月费还包每月 4 天支持。', 'System ready now; monthly fee even includes 4 days of support.', "Sistem sedia sekarang; yuran bulanan malah termasuk 4 hari sokongan.")}
          </p>
        </div>
      </section>

      {/* 4. Cooperation terms — the safety answers */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">{tr('合作方式，先讲清楚', 'The terms, upfront', "Syaratnya, di muka")}</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {cooperationTerms.map((term) => (
            <div key={term.en} className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-xs leading-relaxed text-slate-700">{tr(term.zh, term.en, term.ms)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. What the monthly fee covers + transparency note */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">{tr('月费包含', 'Monthly fee includes', "Yuran bulanan termasuk")}</h3>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {monthlyIncludes.map((item) => (
              <div key={item.en} className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-xs leading-relaxed text-slate-700">{tr(item.zh, item.en, item.ms)}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-xl bg-red-800 p-5 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
            <div>
              <h3 className="text-sm font-bold">{tr('月费怎么算 — 明账', 'How the fee breaks down — open book', "Bagaimana yuran pecah — buka buku")}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {tr(
                  `${formatCurrency(FRIEND_MONTHLY_FEE)} = 硬成本 ${formatCurrency(hardMonthlyCost)} + 我的服务收入 ${formatCurrency(friendMonthlyProfit)}。赚多少直接给你看，服务收入对应下面的支持内容。`,
                  `${formatCurrency(FRIEND_MONTHLY_FEE)} = hard cost ${formatCurrency(hardMonthlyCost)} + my service income ${formatCurrency(friendMonthlyProfit)}. The profit is shown openly — it pays for the support below.`, `${formatCurrency(FRIEND_MONTHLY_FEE)} = kos keras ${formatCurrency(hardMonthlyCost)} + pendapatan perkhidmatan saya ${formatCurrency(friendMonthlyProfit)}. Keuntungan ditunjukkan secara terbuka — ia membayar untuk sokongan di bawah.`
                )}
              </p>
              <details className="group mt-3 rounded-lg bg-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white/70 [&::-webkit-details-marker]:hidden">
                  {tr('查看完整明细', 'View full breakdown', "Lihat pecahan penuh")}
                  <span className="text-white/50 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="space-y-1.5 border-t border-white/10 px-4 py-3 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span>{tr('服务器 (USD 120)', 'Server (USD 120)', "Pelayan (USD 120)")}</span>
                    <span>{formatCurrency(serverMonthlyCost)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>{tr('域名（年费 ÷ 12）', 'Domain (yearly ÷ 12)', "Domain (tahunan ÷ 12)")}</span>
                    <span>{formatCurrency(domainMonthlyCost)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-1.5">
                    <span>{tr('硬成本小计', 'Hard cost subtotal', "Subjumlah kos keras")}</span>
                    <span>{formatCurrency(hardMonthlyCost)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1.5">
                    <span>{tr('我的服务收入', 'My service income', "Pendapatan perkhidmatan saya")}</span>
                    <span>{formatCurrency(friendMonthlyProfit)}</span>
                  </div>
                  <div className="pl-3 font-sans text-[11px] leading-relaxed text-slate-400">
                    {supportServices.map((svc) => (
                      <p key={svc.en}>· {tr(svc.zh, svc.en, svc.ms)}</p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-1.5 font-bold text-white">
                    <span>{tr('月费', 'Monthly fee', "Yuran bulanan")}</span>
                    <span>{formatCurrency(FRIEND_MONTHLY_FEE)}</span>
                  </div>
                </div>
              </details>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Rates checked {RATES_CHECKED_ON}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
