/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StaffAvatarProps {
  name: string;
  avatarDataUrl?: string;
  className?: string;
  textClassName?: string;
}

export function getStaffInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'U';
  }

  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
}

export default function StaffAvatar({
  name,
  avatarDataUrl,
  className = 'h-9 w-9',
  textClassName = 'text-xs'
}: StaffAvatarProps) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white font-semibold text-slate-700 ${className}`}>
      {avatarDataUrl ? (
        <img src={avatarDataUrl} alt={`${name} avatar`} className="h-full w-full object-cover" />
      ) : (
        <span className={textClassName}>{getStaffInitials(name)}</span>
      )}
    </div>
  );
}
