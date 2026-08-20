/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc';

export interface SortState<T extends string> {
  key: T;
  direction: SortDirection;
}

export function getNextSortState<T extends string>(current: SortState<T>, key: T, defaultDirection: SortDirection = 'asc'): SortState<T> {
  if (current.key === key) {
    return {
      key,
      direction: current.direction === 'asc' ? 'desc' : 'asc'
    };
  }

  return {
    key,
    direction: defaultDirection
  };
}

export function compareSortValues(aValue: string | number, bValue: string | number, direction: SortDirection) {
  if (aValue < bValue) {
    return direction === 'asc' ? -1 : 1;
  }

  if (aValue > bValue) {
    return direction === 'asc' ? 1 : -1;
  }

  return 0;
}

export default function SortableHeader<T extends string>({
  sortKey,
  label,
  sortState,
  onSort,
  align = 'left',
  defaultDirection = 'asc',
  className = ''
}: {
  sortKey: T;
  label: React.ReactNode;
  sortState: SortState<T>;
  onSort: (key: T, defaultDirection?: SortDirection) => void;
  align?: 'left' | 'center' | 'right';
  defaultDirection?: SortDirection;
  className?: string;
}) {
  const isActive = sortState.key === sortKey;
  const Icon = isActive ? (sortState.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey, defaultDirection)}
      className={`inline-flex items-center gap-1.5 transition-colors hover:text-indigo-600 ${isActive ? 'text-indigo-600' : ''} ${
        align === 'center' ? 'w-full justify-center' : align === 'right' ? 'w-full justify-end' : ''
      } ${className}`}
      aria-label={`Sort by ${typeof label === 'string' ? label : sortKey}`}
    >
      <span>{label}</span>
      <Icon className={`h-3 w-3 ${isActive ? 'text-indigo-500' : 'text-slate-500'}`} />
    </button>
  );
}
