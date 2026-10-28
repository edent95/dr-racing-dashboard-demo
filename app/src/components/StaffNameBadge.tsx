/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoleAccount } from '../types';
import StaffAvatar from './StaffAvatar';
import { tr } from '../lib/i18n';
import { isStaffLinkQueueHandler } from '../../shared/staffLinkQueue.mjs';

interface StaffNameBadgeProps {
  name?: string;
  role?: string;
  roleAccounts: RoleAccount[];
  avatarClassName?: string;
  className?: string;
  nameClassName?: string;
  roleClassName?: string;
}

export default function StaffNameBadge({
  name,
  role,
  roleAccounts,
  avatarClassName = 'h-7 w-7',
  className = '',
  nameClassName = 'text-footnote font-semibold text-slate-700',
  roleClassName = 'text-micro uppercase text-slate-400'
}: StaffNameBadgeProps) {
  // The reserved staff-link queue is not a person; show what it means.
  const isQueue = isStaffLinkQueueHandler(name?.trim());
  const displayName = isQueue
    ? tr('待分配（原员工链接）', 'Unassigned (former staff link)', 'Belum ditugaskan (pautan kakitangan lama)')
    : name?.trim() || '--';
  const account = isQueue ? undefined : roleAccounts.find((item) => item.name === displayName);
  const displayRole = isQueue ? '' : role || account?.role || '';

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <StaffAvatar
        name={displayName}
        avatarDataUrl={account?.avatar_data_url}
        className={avatarClassName}
        textClassName="text-[10px]"
      />
      <span className="min-w-0 leading-tight">
        <span className={`block truncate ${nameClassName}`} title={displayName}>
          {displayName}
        </span>
        {displayRole && (
          <span className={`block truncate ${roleClassName}`} title={displayRole}>
            {displayRole}
          </span>
        )}
      </span>
    </span>
  );
}
