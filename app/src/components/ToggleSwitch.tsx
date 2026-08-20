/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  leading?: React.ReactNode;
  description?: string;
  count?: number;
  id?: string;
  disabled?: boolean;
  className?: string;
  onBeforeToggle?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  leading,
  description,
  count,
  id,
  disabled = false,
  className = '',
  onBeforeToggle
}: ToggleSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(event) => {
        onBeforeToggle?.(event);
        if (event.defaultPrevented) {
          return;
        }
        onChange(!checked);
      }}
      disabled={disabled}
      className={`inline-flex min-h-8 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}>
        <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`} />
      </span>
      {leading}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold text-slate-800">
          {label}
          {count !== undefined && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{count}</span>
          )}
        </span>
        {description && (
          <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">{description}</span>
        )}
      </span>
    </button>
  );
}
