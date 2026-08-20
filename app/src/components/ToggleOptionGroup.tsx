/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface ToggleOption {
  value: string;
  label: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

interface ToggleOptionGroupProps {
  value: string;
  options: ToggleOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  ariaRequired?: boolean;
  className?: string;
  optionClassName?: string;
  disabled?: boolean;
  activationClicks?: 1 | 2 | 3;
  autoOpen?: boolean;
  plainWhenCollapsed?: boolean;
  onOptionClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface MenuPosition {
  left: number;
  top?: number;
  bottom?: number;
  minWidth?: number;
}

const ESTIMATED_OPTION_ROW_HEIGHT = 38;

const resolveMenuPosition = (
  container: HTMLDivElement | null,
  optionCount: number
): MenuPosition | null => {
  const rect = container?.getBoundingClientRect();

  if (!rect) {
    return null;
  }

  const estimatedHeight = optionCount * ESTIMATED_OPTION_ROW_HEIGHT + 12;
  const shouldOpenUp = rect.bottom + estimatedHeight + 8 > window.innerHeight && rect.top > estimatedHeight;

  return shouldOpenUp
    ? { left: rect.left, bottom: window.innerHeight - rect.top + 4, minWidth: rect.width }
    : { left: rect.left, top: rect.bottom + 4, minWidth: rect.width };
};

// A conventional dropdown: the collapsed state is a button showing the current
// value + a chevron; opening reveals a list of plain option rows with a check
// on the active one. Uses fixed positioning so it floats above table scroll
// containers, opens upward when there is not enough room below, and closes on
// outside click, Escape, scroll, or resize.
export default function ToggleOptionGroup({
  value,
  options,
  onChange,
  ariaLabel,
  ariaRequired = false,
  className = '',
  optionClassName = '',
  disabled = false,
  activationClicks = 1,
  autoOpen = false,
  plainWhenCollapsed = false,
  onOptionClick
}: ToggleOptionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];
  const isPlainCollapsed = plainWhenCollapsed && !isExpanded;
  const optionListId = useId();

  const openMenu = () => {
    const nextPosition = resolveMenuPosition(containerRef.current, options.length);

    if (!nextPosition) {
      return;
    }

    setMenuPosition(nextPosition);
    setHighlightedIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setIsExpanded(true);
  };

  useEffect(() => {
    if (!autoOpen || disabled) {
      return;
    }

    const nextPosition = resolveMenuPosition(containerRef.current, options.length);
    if (!nextPosition) {
      return;
    }

    setMenuPosition(nextPosition);
    setHighlightedIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setIsExpanded(true);
  }, [autoOpen, disabled, options, value]);

  const handleKeyboardNavigation = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      if (!isExpanded) {
        // Match a native select for fast keyboard entry: once Tab focuses the
        // control, arrows immediately cycle the value without requiring the
        // portalled menu to stay open while the page scrolls.
        const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
        const nextIndex = (selectedIndex + step + options.length) % options.length;
        const nextOption = options[nextIndex];
        setHighlightedIndex(nextIndex);
        if (nextOption && nextOption.value !== value) onChange(nextOption.value);
        return;
      }

      setHighlightedIndex((current) => (current + step + options.length) % options.length);
      return;
    }

    if (isExpanded && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option && option.value !== value) onChange(option.value);
      setIsExpanded(false);
      return;
    }

    if (isExpanded && event.key === 'Escape') {
      event.preventDefault();
      setIsExpanded(false);
      return;
    }

    if (isExpanded && event.key === 'Tab') {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    const handleReposition = (event?: Event) => {
      // Scrolling *inside* the menu (its own scrollbar) must not close it —
      // otherwise a long option list can never be scrolled to reach the bottom
      // items. For external scrolling, keep the fixed menu attached to its
      // trigger instead of closing it before a click can land.
      const eventTarget = event?.target;
      if (
        eventTarget instanceof Node &&
        (containerRef.current?.contains(eventTarget) || menuRef.current?.contains(eventTarget))
      ) {
        return;
      }

      const nextPosition = resolveMenuPosition(containerRef.current, options.length);
      if (nextPosition) {
        setMenuPosition(nextPosition);
      } else {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isExpanded, options.length]);

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? optionListId : undefined}
        aria-activedescendant={isExpanded ? `${optionListId}-${highlightedIndex}` : undefined}
        aria-label={ariaLabel}
        aria-required={ariaRequired || undefined}
        disabled={disabled}
        onKeyDown={handleKeyboardNavigation}
        onClick={(event) => {
          onOptionClick?.(event);
          if (event.defaultPrevented || disabled) {
            return;
          }

          if (!isExpanded && event.detail < activationClicks) {
            return;
          }

          if (isExpanded) {
            setIsExpanded(false);
          } else {
            openMenu();
          }
        }}
        title={activationClicks === 3 ? 'Triple-click to change' : activationClicks === 2 ? 'Double-click to change' : undefined}
        className={`inline-flex min-h-8 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-left text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${optionClassName} ${
          isPlainCollapsed ? '!border-transparent !bg-transparent !px-0 !ring-0 hover:!bg-transparent' : ''
        }`}
      >
        {selectedOption?.leading}
        <span className="min-w-0 flex-1 truncate whitespace-nowrap">{selectedOption?.label}</span>
        {selectedOption?.trailing}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isPlainCollapsed ? 'hidden' : ''}`} aria-hidden="true" />
      </button>

      {isExpanded && menuPosition && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="toggle-pop fixed z-50 flex max-h-[60vh] w-max min-w-44 flex-col items-stretch gap-0.5 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-300/50"
          style={menuPosition}
          role="listbox"
          id={optionListId}
          aria-label={ariaLabel}
        >
          {options.map((option, optionIndex) => {
            const isActive = value === option.value;
            const isHighlighted = highlightedIndex === optionIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                id={`${optionListId}-${optionIndex}`}
                aria-selected={isActive}
                disabled={disabled}
                onMouseEnter={() => setHighlightedIndex(optionIndex)}
                onMouseDown={(event) => {
                  // The menu is portalled outside its owning form/cell. Keep
                  // the current field focused so a parent blur-to-save handler
                  // cannot commit the previous value before this click runs.
                  event.preventDefault();
                }}
                onClick={(event) => {
                  onOptionClick?.(event);
                  if (event.defaultPrevented || disabled) {
                    return;
                  }

                  if (!isActive) {
                    onChange(option.value);
                  }

                  setIsExpanded(false);
                }}
                className={`flex min-h-8 w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : isHighlighted ? 'bg-slate-50 text-slate-800' : 'text-slate-600 hover:bg-slate-50'
                } ${optionClassName}`}
              >
                {option.leading}
                <span className="min-w-0 flex-1 truncate whitespace-nowrap">{option.label}</span>
                {option.trailing}
                {isActive && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      , document.body)}
    </div>
  );
}
