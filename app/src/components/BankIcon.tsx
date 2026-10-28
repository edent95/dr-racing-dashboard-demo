/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BankApplicationStatus, BankDefinition } from '../types';
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
    // Plain white, not a brand tint: `brand-50` is a near-white surface in light
    // mode but a dark maroon in dark mode, so using it as TEXT on a brand fill
    // would disappear the label the moment the theme flips.
    className: 'border-brand-100 bg-brand-deep text-white',
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
  const isStorageIcon = customIcon?.startsWith('https://firebasestorage.googleapis.com/');
  const [loadedIcon, setLoadedIcon] = useState<{ source: string; url: string } | null>(null);
  useEffect(() => {
    setLoadedIcon(null);
    if (!isStorageIcon || !customIcon) return;
    let active = true;
    let objectUrl = '';
    // Plain image requests cannot attach App Check; use the Storage SDK first.
    void import('../lib/firebaseStorage').then(({ loadStorageLogo }) => loadStorageLogo(customIcon)).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setLoadedIcon({ source: customIcon, url: objectUrl });
    }).catch(() => undefined);
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [customIcon, isStorageIcon]);
  const image = isStorageIcon
    ? (loadedIcon?.source === customIcon ? loadedIcon.url : iconMeta.image)
    : customIcon || iconMeta.image;
  const isRejected = status === 'Rejected';
  const sizeClass = {
    xs: 'h-6 w-6 text-micro tracking-normal',
    sm: 'h-7 w-7 text-micro tracking-normal',
    md: 'h-9 w-9 text-caption'
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
      {image ? (
        <img
          src={image}
          alt=""
          width={sizePixels}
          height={sizePixels}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${isRejected ? 'grayscale opacity-60' : ''}`}
        />
      ) : (
        <span className="font-bold leading-none tracking-tight">{iconMeta.label}</span>
      )}
    </span>
  );
}
