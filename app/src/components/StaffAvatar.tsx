/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StaffAvatarProps {
  name: string;
  avatarDataUrl?: string;
  className?: string;
  /**
   * Size of the fallback initials. This is the one sanctioned place for a raw
   * `text-micro tracking-normal`-style value: the initials are a graphic that has to fit inside
   * whatever circle `className` sets, so they scale with the avatar rather than
   * with the type ramp. Everything else in the product uses a named text style.
   */
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
  textClassName = 'text-footnote'
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
