const toMoney = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 100) / 100 : 0;
};

/**
 * One RM field for every money form (Financial Reports stock, Quick Add Stock). It fills its
 * grid cell and keeps the box at the bottom, so a label that wraps to two lines does not push
 * its input below the one beside it.
 */
export default function MoneyInput({ label, value, onChange, disabled = false }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <label className="flex h-full flex-col justify-end gap-1.5 text-micro uppercase text-slate-500">
      <span className="block">{label}</span>
      <span className="finance-money-field flex min-h-10 items-stretch overflow-hidden rounded-control border border-slate-200 bg-white shadow-e1 transition-colors">
        <span className="finance-money-field__prefix inline-flex items-center pl-3 font-mono text-footnote text-slate-500">RM</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value || ''}
          disabled={disabled}
          onChange={(event) => onChange(toMoney(event.target.value))}
          className="finance-money-field__input min-w-0 flex-1 bg-transparent px-3 py-2 text-right font-mono text-footnote font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-500"
        />
      </span>
    </label>
  );
}
