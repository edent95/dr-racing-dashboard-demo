import React, { useEffect, useState } from 'react';
import { tr } from '../lib/i18n';
import { getEmploymentDuration, getEmploymentStartYearOptions, getStartFromDuration } from '../utils/customerApplicationForm';

/**
 * Year + month a customer started a job or moved to an address, with the
 * resulting "x yrs y mths" underneath. Application Detail uses the same pair
 * of selects (meeting 2026-10-13: "years employed / year of resident need a month").
 */
export default function StartYearMonthInput({
  label,
  year,
  month,
  fallbackYears = '',
  yearSpan = 50,
  onChange,
  labelClassName,
  selectClassName = 'h-10 w-full rounded-control border border-slate-100 bg-white px-3 text-footnote text-slate-700 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100',
  ariaPrefix
}: {
  label: string;
  year: string;
  month: string;
  /** Whole years stored before a start was picked (pasted text, older files). */
  fallbackYears?: string;
  yearSpan?: number;
  onChange: (field: 'year' | 'month', value: string) => void;
  labelClassName: string;
  selectClassName?: string;
  ariaPrefix: string;
}) {
  const duration = getEmploymentDuration(year, month);

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClassName}>{label}</span>
      {/* Native selects: the year list is long, and they scroll and type-ahead on every device. */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={year}
          onChange={(event) => onChange('year', event.target.value)}
          aria-label={`${ariaPrefix} year`}
          className={selectClassName}
        >
          <option value="">{tr('年份', 'Year', 'Tahun')}</option>
          {getEmploymentStartYearOptions(new Date(), yearSpan).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          value={month}
          onChange={(event) => onChange('month', event.target.value)}
          aria-label={`${ariaPrefix} month`}
          className={selectClassName}
        >
          <option value="">{tr('月份', 'Month', 'Bulan')}</option>
          {Array.from({ length: 12 }, (_, index) => {
            const option = String(index + 1);
            return <option key={option} value={option}>{tr(`${option} 月`, `Month ${option}`, `Bulan ${option}`)}</option>;
          })}
        </select>
      </div>
      <span className="text-caption text-slate-500" aria-live="polite">
        {duration
          ? tr(`${duration.years} 年 ${duration.months} 个月`, `${duration.years} yrs ${duration.months} mths`, `${duration.years} thn ${duration.months} bln`)
          : fallbackYears
            ? tr(`${fallbackYears} 年（请选年月）`, `${fallbackYears} yrs (pick year and month)`, `${fallbackYears} thn (pilih tahun dan bulan)`)
            : tr('选年份和月份', 'Pick year and month', 'Pilih tahun dan bulan')}
      </span>
    </div>
  );
}

const durationText = (year: string, month: string) => {
  const duration = getEmploymentDuration(year, month);
  return duration ? { years: String(duration.years), months: String(duration.months) } : { years: '', months: '' };
};

/**
 * How long a customer has lived at an address, typed as whole years plus
 * months (owner 2026-10-20: "how many years 1, 2, 3 and how many months").
 * It still stores the start year/month the other forms, the bank text and
 * the Rules read, worked back from today with getStartFromDuration.
 */
export function YearsMonthsDurationInput({
  label,
  year,
  month,
  fallbackYears = '',
  onChange,
  labelClassName,
  inputClassName = 'h-10 w-full rounded-control border border-slate-100 bg-white px-3 text-footnote text-slate-700 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100',
  ariaPrefix
}: {
  label: string;
  year: string;
  month: string;
  /** Whole years stored before a start was set (pasted text, older files). */
  fallbackYears?: string;
  onChange: (field: 'year' | 'month', value: string) => void;
  labelClassName: string;
  inputClassName?: string;
  ariaPrefix: string;
}) {
  const [text, setText] = useState(() => durationText(year, month));

  // Follow a start set from outside (paste, reset) unless it is the one just typed.
  useEffect(() => {
    const next = durationText(year, month);
    setText((current) => {
      if (!year && !month) return current.years || current.months ? { years: '', months: '' } : current;
      const typed = { years: String(Number(current.years || 0)), months: String(Number(current.months || 0)) };
      return typed.years === next.years && typed.months === next.months ? current : next;
    });
  }, [year, month]);

  const commit = (next: { years: string; months: string }) => {
    setText(next);
    if (!next.years && !next.months) {
      onChange('year', '');
      onChange('month', '');
      return;
    }
    const start = getStartFromDuration(Number(next.years || 0), Number(next.months || 0));
    onChange('year', start.year);
    onChange('month', start.month);
  };

  const field = (part: 'years' | 'months', suffix: string, max: number) => (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={text[part]}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, 2);
          commit({ ...text, [part]: digits === '' ? '' : String(Math.min(Number(digits), max)) });
        }}
        placeholder="0"
        aria-label={`${ariaPrefix} ${part}`}
        className={`${inputClassName} w-full pr-14`}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-caption text-slate-400">{suffix}</span>
    </div>
  );

  const duration = getEmploymentDuration(year, month);

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClassName}>{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {field('years', tr('年', 'yrs', 'thn'), 99)}
        {field('months', tr('个月', 'mths', 'bln'), 11)}
      </div>
      <span className="text-caption text-slate-500" aria-live="polite">
        {duration
          ? tr(`约 ${year} 年 ${month} 月搬入`, `Moved in around ${month}/${year}`, `Mula menetap sekitar ${month}/${year}`)
          : fallbackYears
            ? tr(`${fallbackYears} 年（请填年数和月数）`, `${fallbackYears} yrs (enter years and months)`, `${fallbackYears} thn (isi tahun dan bulan)`)
            : tr('填住了几年几个月', 'Enter years and months lived here', 'Isi berapa tahun dan bulan menetap')}
      </span>
    </div>
  );
}
