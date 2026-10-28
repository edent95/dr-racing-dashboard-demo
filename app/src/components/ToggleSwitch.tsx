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
  className = ''
}: ToggleSwitchProps) {
  return (
    <label className={`relative inline-flex min-h-8 items-center gap-2 rounded-control px-1.5 py-1 text-left transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${className}`}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      {/* State-driven classes: the knob is not a peer sibling, and the dark theme force-overrides .bg-white / .bg-slate-200. */}
      <span className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? 'bg-[#10b981]' : 'bg-[#94a3b8]/40'}`}>
        <span className={`h-5 w-5 rounded-full bg-[#ffffff] shadow-e1 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </span>
      {leading}
      <span className="min-w-0">
        <span className={`flex items-center gap-1.5 whitespace-nowrap text-footnote font-semibold ${checked ? 'text-slate-800' : 'text-slate-400'}`}>
          {label}
          {count !== undefined && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-micro tracking-normal font-medium text-slate-500">{count}</span>}
        </span>
        {description && <span className="mt-0.5 block text-caption text-slate-400">{description}</span>}
      </span>
    </label>
  );
}
