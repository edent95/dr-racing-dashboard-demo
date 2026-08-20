/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BankApplicationStatus, BankDefinition } from '../types';
import OptimizedImage from './OptimizedImage';
import cimbIcon from '../assets/cimb-icon.png';
import hongLeongBankIcon from '../assets/hong-leong-bank-icon.png';
import maybankIcon from '../assets/maybank-icon.png';
import publicBankIcon from '../assets/public-bank-icon.png';
import rhbBankIcon from '../assets/rhb-bank-icon.png';

const BANK_ICON_META: Record<string, { label: string; className: string; image?: string }> = {
  Maybank: {
    label: 'MB',
    className: 'border-yellow-200 bg-yellow-400 text-slate-950',
    image: maybankIcon
  },
  'Public Bank': {
    label: 'PB',
    className: 'border-rose-100 bg-white text-rose-600',
    image: publicBankIcon
  },
  CIMB: {
    label: 'CI',
    className: 'border-red-100 bg-red-900 text-red-50',
    image: cimbIcon
  },
  'Hong Leong Bank': {
    label: 'HL',
    className: 'border-slate-100 bg-black text-white',
    image: hongLeongBankIcon
  },
  'RHB Bank': {
    label: 'RH',
    className: 'border-slate-100 bg-black text-white',
    image: rhbBankIcon
  }
};

const getBankIconMeta = (bankName: string) => (
  BANK_ICON_META[bankName] || {
    label: bankName.slice(0, 2).toUpperCase(),
    className: 'border-slate-100 bg-slate-50 text-slate-500'
  }
);

interface BankIconProps {
  bankName: string;
  bankDefinitions?: BankDefinition[];
  status?: BankApplicationStatus;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export default function BankIcon({
  bankName,
  bankDefinitions = [],
  status,
  size = 'sm',
  className = ''
}: BankIconProps) {
  const iconMeta = getBankIconMeta(bankName);
  const customIcon = bankDefinitions.find((bank) => bank.name.toLowerCase() === bankName.toLowerCase())?.icon_data_url;
  const isRejected = status === 'Rejected';
  const sizeClass = {
    xs: 'h-6 w-6 text-[8px]',
    sm: 'h-7 w-7 text-[9px]',
    md: 'h-9 w-9 text-[11px]'
  }[size];
  const sizePixels = {
    xs: 24,
    sm: 28,
    md: 36
  }[size];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border ${
        isRejected
          ? 'border-slate-200 bg-slate-100 text-slate-500'
          : iconMeta.className
      } ${sizeClass} ${className}`}
      aria-label={`${bankName}${status ? ` ${status}` : ''}`}
    >
      {customIcon || iconMeta.image ? (
        <OptimizedImage
          src={customIcon || iconMeta.image}
          alt=""
          width={sizePixels}
          height={sizePixels}
          className={`h-full w-full object-cover ${isRejected ? 'grayscale opacity-60' : ''}`}
        />
      ) : (
        <span className="font-black leading-none tracking-tight">{iconMeta.label}</span>
      )}
    </span>
  );
}
