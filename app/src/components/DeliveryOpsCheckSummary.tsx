import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { tr } from '../lib/i18n';
import { fieldLabel } from '../data/fieldLabels';
import type { LoanApplication, VehicleCatalogItem } from '../types';
import { getVehicleStockReference } from '../utils/vehicleStock';
import { getStockUnitLandedCost } from '../../shared/dealDelivery.mjs';
import { getDealChecklistAmounts, getDealJpjCost } from '../utils/dealProfit';

const ringgit = (value: number) => `RM ${value.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`;
const money = (value: unknown) => Math.max(0, Number(value) || 0);

/**
 * What the Operations Manager double-checks before delivery (owner 2026-10-18):
 * the figures Admin / Sales entered, the money collected and the bike, on one
 * card, with anything that does not add up marked.
 */
export default function DeliveryOpsCheckSummary({
  application,
  vehicleCatalog,
  paymentDue,
  paymentCollected
}: {
  application: LoanApplication;
  vehicleCatalog: VehicleCatalogItem[];
  paymentDue: number | null;
  paymentCollected: number;
}) {
  const steps = application.delivery_checklist?.steps || {};
  const loanCheck = steps.full_loan_check?.data || {};
  const price = money(loanCheck.selling_price);
  const loan = application.purchase_method === 'Cash' ? 0 : money(loanCheck.approved_loan);
  const deposit = money(loanCheck.deposit);
  const unitId = application.deal_finance?.stock_unit_id || '';
  const unit = vehicleCatalog.flatMap((item) => item.stock_units || []).find((candidate) => candidate.id === unitId)
    || vehicleCatalog
      .filter((item) => (item.model || '').trim().toLowerCase() === (application.vehicle_model || '').trim().toLowerCase())
      .flatMap((item) => item.stock_units || [])
      .find((candidate) => candidate.reserved_application_id === application.id);
  const cost = unit ? getStockUnitLandedCost(unit) : 0;
  const commission = money(application.deal_finance?.commission_amount);
  const extras = getDealChecklistAmounts(application);
  // The AGM and roadtax & insurance fees are inside the price (owner 2026-10-21).
  const feesInPrice = extras.agmFee + extras.roadtaxInsuranceFee;
  const extraCosts = extras.insuranceAmount + extras.freeGift + extras.deliveryFee + extras.agmPayout
    + getDealJpjCost(extras.jpjFee, money(unit?.registration_cost));
  const margin = price - cost - extraCosts - commission;
  const arrival = steps.arrival_check?.data || {};
  const chassisOnBike = String(arrival.chassis_number || '').trim().toUpperCase();
  const chassisInStock = String(unit?.chassis_number || '').trim().toUpperCase();

  const rows: Array<{ label: string; value: string; problem?: string }> = [
    {
      label: [fieldLabel('sellingPrice'), fieldLabel('approvedLoan'), fieldLabel('deposit')].join(' / '),
      value: `${ringgit(price)} · ${ringgit(loan)} · ${ringgit(deposit)}`,
      problem: price <= 0 ? tr('第 1 步还没有售价', 'Step 1 has no selling price yet', 'Langkah 1 belum ada harga') : undefined
    },
    {
      label: tr('已收客户款', 'Collected from the customer', 'Dikutip daripada pelanggan'),
      value: paymentDue === null ? ringgit(paymentCollected) : `${ringgit(paymentCollected)} / ${ringgit(paymentDue)}`,
      problem: paymentDue !== null && paymentCollected + 0.01 < paymentDue
        ? tr(`还差 ${ringgit(paymentDue - paymentCollected)}`, `${ringgit(paymentDue - paymentCollected)} still owed`, `Baki ${ringgit(paymentDue - paymentCollected)}`)
        : undefined
    },
    {
      label: tr('库存车 / 成本', 'Stock unit / landed cost', 'Unit stok / kos'),
      value: unit ? `${getVehicleStockReference(unit)} · ${ringgit(cost)}` : '—',
      problem: unit ? undefined : tr('没有保留给这单的库存车', 'No stock unit reserved for this deal', 'Tiada unit stok untuk urus niaga ini')
    },
    {
      label: `${fieldLabel('engineNumber')} / ${fieldLabel('chassisNumber')}`,
      value: [arrival.engine_number, arrival.chassis_number].filter(Boolean).join(' · ') || '—',
      problem: chassisOnBike && chassisInStock && chassisOnBike !== chassisInStock
        ? tr(`和库存记录的底盘号 ${chassisInStock} 不一样`, `Differs from the stock record's chassis ${chassisInStock}`, `Berbeza daripada casis stok ${chassisInStock}`)
        : undefined
    },
    {
      label: tr('售价内含的费用 / 保险、赠品、运车费、AGM 支出、JPJ', 'Fees inside the selling price / insurance, gift, delivery, AGM paid, JPJ', 'Yuran dalam harga jualan / insurans, hadiah, penghantaran, AGM dibayar, JPJ'),
      value: `${ringgit(feesInPrice)} · ${ringgit(extraCosts)}`
    },
    {
      label: tr('预计毛利(售价 − 成本 − 其他成本 − 佣金)', 'Estimated margin (price − cost − other costs − commission)', 'Anggaran margin (harga − kos − kos lain − komisen)'),
      value: price > 0 && unit ? ringgit(margin) : '—',
      problem: price > 0 && unit && margin < 0 ? tr('亏本', 'Below cost', 'Di bawah kos') : undefined
    }
  ];
  const problems = rows.filter((row) => row.problem).length;

  return (
    <div data-testid="delivery-ops-check-summary" data-problems={problems} className={`mt-2 rounded-control p-2.5 ring-1 ${problems ? 'bg-amber-50 ring-amber-200' : 'bg-emerald-50 ring-emerald-100'}`}>
      <p className={`flex items-center gap-1.5 text-caption font-bold ${problems ? 'text-amber-800' : 'text-emerald-800'}`}>
        {problems
          ? <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
          : <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />}
        {problems
          ? tr(`有 ${problems} 项要先确认`, `${problems} item(s) to check first`, `${problems} perkara perlu disemak dahulu`)
          : tr('数字都对得上,可以标记已核对。', 'Everything adds up; mark it checked.', 'Semua sepadan; tandakan sudah disemak.')}
      </p>
      <dl className="mt-1.5 grid gap-1 text-caption">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap justify-between gap-x-3">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className={`font-semibold ${row.problem ? 'text-amber-800' : 'text-slate-800'}`}>
              {row.value}
              {row.problem && <span className="ml-1.5 font-normal">({row.problem})</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
