/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { tr } from '../lib/i18n';
import ToggleOptionGroup from './ToggleOptionGroup';

export interface DoubleClickEditOption {
  value: string;
  label: string;
}

interface DoubleClickEditFieldProps {
  value: string | number;
  onCommit: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  mode?: 'input' | 'select' | 'textarea';
  options?: DoubleClickEditOption[];
  suggestions?: DoubleClickEditOption[];
  commitOnSuggestionMatch?: boolean;
  placeholder?: string;
  emptyText?: string;
  displayClassName?: string;
  inputClassName?: string;
  rows?: number;
  normalizeValue?: (value: string) => string;
  formatDisplay?: (value: string) => React.ReactNode;
  disabled?: boolean;
  copyOnly?: boolean;
  copyValue?: string;
  ariaLabel?: string;
  stopPropagation?: boolean;
}

export default function DoubleClickEditField({
  value,
  onCommit,
  type = 'text',
  mode = 'input',
  options = [],
  suggestions = [],
  commitOnSuggestionMatch = false,
  placeholder,
  emptyText,
  displayClassName = '',
  inputClassName = '',
  rows = 2,
  normalizeValue,
  formatDisplay,
  disabled = false,
  copyOnly = false,
  copyValue: customCopyValue,
  ariaLabel,
  stopPropagation = true
}: DoubleClickEditFieldProps) {
  const valueText = String(value ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(valueText);
  const [usesCopyThenEdit, setUsesCopyThenEdit] = useState(false);
  const [usesSingleClickCopyThenEdit, setUsesSingleClickCopyThenEdit] = useState(false);
  const [usesSingleClickEdit, setUsesSingleClickEdit] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLButtonElement | HTMLDivElement | HTMLTextAreaElement | null>(null);
  const copyFeedbackTimerRef = useRef<number | null>(null);
  const copyActionTimerRef = useRef<number | null>(null);
  const suggestionListId = useId();
  const resolvedEmptyText = emptyText ?? (copyOnly
    ? tr('未检测', 'Not detected', "Tidak dikesan")
    : usesSingleClickEdit
      ? tr('点击编辑', 'Click to edit', "Klik untuk mengedit")
    : usesSingleClickCopyThenEdit
      ? tr('双击编辑', 'Double-click to edit', "Klik dua kali untuk mengedit")
    : usesCopyThenEdit
      ? tr('三击编辑', 'Triple-click to edit', "Klik tiga kali untuk mengedit")
    : tr('双击编辑', 'Double-click to edit', "Klik dua kali untuk mengedit"));

  useEffect(() => {
    const anchor = inputRef.current;
    setUsesCopyThenEdit(Boolean(anchor?.closest('[data-dce-copy-on-double-click]')));
    setUsesSingleClickCopyThenEdit(Boolean(anchor?.closest('[data-dce-copy-on-single-click]')));
    setUsesSingleClickEdit(Boolean(anchor?.closest('[data-dce-single-click-edit]')));
  }, [isEditing]);

  useEffect(() => () => {
    if (copyFeedbackTimerRef.current) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }
    if (copyActionTimerRef.current) {
      window.clearTimeout(copyActionTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(valueText);
    }
  }, [isEditing, valueText]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const normalize = (nextValue: string) => normalizeValue ? normalizeValue(nextValue) : nextValue;

  const commit = (nextValue = draftValue) => {
    const normalized = normalize(nextValue);
    if (normalized !== valueText) {
      onCommit(normalized);
    }
    setDraftValue(normalized);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraftValue(valueText);
    setIsEditing(false);
  };

  const showCopyFeedback = (message: string) => {
    if (copyFeedbackTimerRef.current) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }

    setCopyFeedback(message);
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopyFeedback('');
      copyFeedbackTimerRef.current = null;
    }, 900);
  };

  const copyValue = async () => {
    const clipboardValue = customCopyValue ?? valueText;

    if (!clipboardValue) {
      showCopyFeedback(tr('没有内容', 'Nothing to copy', "Tiada apa-apa untuk disalin"));
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clipboardValue);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = clipboardValue;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      showCopyFeedback(tr('已复制', 'Copied', "disalin"));
    } catch {
      showCopyFeedback(tr('复制失败', 'Copy failed', "Salinan gagal"));
    }
  };

  // Inside a container marked with data-dce-scope (e.g. the application
  // detail drawer), Enter commits and jumps straight into editing the next
  // field, so users do not have to repeat the pointer gesture for every input.
  const commitAndAdvance = () => {
    const currentNode = inputRef.current as HTMLElement | null;
    const scope = currentNode?.closest('[data-dce-scope]');
    let nextAnchor: HTMLElement | undefined;

    if (currentNode && scope) {
      const anchors = Array.from(scope.querySelectorAll<HTMLElement>('[data-dce-anchor]'));
      const currentIndex = anchors.indexOf(currentNode);

      if (currentIndex !== -1) {
        nextAnchor = anchors[currentIndex + 1];
      }
    }

    commit();

    if (nextAnchor) {
      window.setTimeout(() => {
        if (usesSingleClickEdit) {
          nextAnchor.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
        } else if (usesSingleClickCopyThenEdit) {
          nextAnchor.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        } else if (usesCopyThenEdit) {
          nextAnchor.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 3 }));
        } else {
          nextAnchor.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        }
      }, 0);
    }
  };

  if (disabled) {
    return (
      <span className={displayClassName}>
        {formatDisplay ? formatDisplay(valueText) : valueText || resolvedEmptyText}
      </span>
    );
  }

  if (isEditing) {
    if (mode === 'select') {
      if (usesCopyThenEdit || usesSingleClickCopyThenEdit) {
        return (
          <div
            ref={(node) => { inputRef.current = node; }}
            className="w-full"
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            data-dce-anchor
          >
            <ToggleOptionGroup
              value={draftValue}
              options={options}
              onChange={commit}
              ariaLabel={ariaLabel}
              autoOpen={usesSingleClickEdit}
              className="w-full"
            />
          </div>
        );
      }

      return (
        <div
          ref={(node) => { inputRef.current = node; }}
          onClick={(event) => {
            if (stopPropagation) event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            if (stopPropagation) event.stopPropagation();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              cancel();
            }
          }}
          tabIndex={-1}
          data-dce-anchor=""
          className={`flex max-w-full flex-wrap gap-1.5 rounded-lg bg-slate-50 p-1.5 ring-1 ring-slate-100 ${inputClassName}`}
          aria-label={ariaLabel}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(event) => {
                if (stopPropagation) event.stopPropagation();
                commit(option.value);
              }}
              className={`min-h-8 rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors ${
                draftValue === option.value
                  ? 'bg-red-800 text-white'
                  : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    }

    if (mode === 'textarea') {
      return (
        <textarea
          ref={(node) => { inputRef.current = node; }}
          rows={rows}
          value={draftValue}
          placeholder={placeholder}
          onClick={(event) => {
            if (stopPropagation) event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            if (stopPropagation) event.stopPropagation();
          }}
          onChange={(event) => setDraftValue(event.target.value)}
          onBlur={() => commit()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              cancel();
            }
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              commitAndAdvance();
            }
          }}
          data-dce-anchor=""
          className={inputClassName}
          aria-label={ariaLabel}
        />
      );
    }

    return (
      <>
        <input
          ref={(node) => { inputRef.current = node; }}
          type={type}
          value={draftValue}
          list={suggestions.length > 0 ? suggestionListId : undefined}
          autoComplete={suggestions.length > 0 ? 'off' : undefined}
          placeholder={placeholder}
          onClick={(event) => {
            if (stopPropagation) event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            if (stopPropagation) event.stopPropagation();
          }}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);

            if (commitOnSuggestionMatch && suggestions.some((suggestion) => suggestion.value === nextValue)) {
              commit(nextValue);
            }
          }}
          onBlur={() => commit()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitAndAdvance();
            }
            if (event.key === 'Escape') {
              cancel();
            }
          }}
          data-dce-anchor=""
          className={inputClassName}
          aria-label={ariaLabel}
        />
        {suggestions.length > 0 && (
          <datalist id={suggestionListId}>
            {suggestions.map((suggestion) => (
              <option key={`${suggestion.value}-${suggestion.label}`} value={suggestion.value}>
                {suggestion.label}
              </option>
            ))}
          </datalist>
        )}
      </>
    );
  }

  return (
    <button
      ref={(node) => { inputRef.current = node; }}
      type="button"
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        if (usesSingleClickEdit) {
          if (!copyOnly) {
            setIsEditing(true);
          }
          return;
        }
        if (usesSingleClickCopyThenEdit) {
          if (event.detail === 1) {
            void copyValue();
          }
          return;
        }
        if (!usesCopyThenEdit) return;

        if (event.detail >= 3) {
          if (copyActionTimerRef.current) {
            window.clearTimeout(copyActionTimerRef.current);
            copyActionTimerRef.current = null;
          }
          if (!copyOnly) {
            setIsEditing(true);
          }
          return;
        }

        if (event.detail === 2) {
          copyActionTimerRef.current = window.setTimeout(() => {
            void copyValue();
            copyActionTimerRef.current = null;
          }, 180);
        }
      }}
      onDoubleClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        if (usesSingleClickCopyThenEdit) {
          if (!copyOnly) {
            setIsEditing(true);
          }
          return;
        }
        if (copyOnly && !usesCopyThenEdit) {
          void copyValue();
          return;
        }
        if (!usesCopyThenEdit && !copyOnly) {
          setIsEditing(true);
        }
      }}
      onKeyDown={(event) => {
        if (stopPropagation) event.stopPropagation();

        if (event.key === 'Enter' || event.key === 'F2') {
          event.preventDefault();
          if (copyOnly) {
            void copyValue();
          } else {
            setIsEditing(true);
          }
          return;
        }

        if (copyOnly && event.key === ' ') {
          event.preventDefault();
          void copyValue();
        }
      }}
      data-dce-anchor=""
      className={`relative ${displayClassName}`}
      title={copyOnly
        ? usesSingleClickCopyThenEdit
          ? 'Click or press Enter to copy'
          : 'Double click or press Enter to copy'
        : usesSingleClickEdit
          ? 'Click or press Enter to edit'
          : usesSingleClickCopyThenEdit
            ? 'Click to copy, double click or press Enter to edit'
          : usesCopyThenEdit
            ? 'Double click to copy, triple click or press Enter to edit'
            : 'Double click or press Enter to edit'}
      aria-label={copyOnly
        ? usesSingleClickCopyThenEdit
          ? `${ariaLabel || 'Read-only field'}. Click to copy; press Enter to copy`
          : `${ariaLabel || 'Read-only field'}. Double click to copy; press Enter to copy`
        : usesSingleClickEdit
          ? ariaLabel || 'Click or press Enter to edit'
          : usesSingleClickCopyThenEdit
            ? `${ariaLabel || 'Editable field'}. Click to copy, double click to edit; press Enter to edit`
          : usesCopyThenEdit
            ? `${ariaLabel || 'Editable field'}. Double click to copy, triple click to edit; press Enter to edit`
            : ariaLabel || 'Double click to edit; press Enter to edit'}
    >
      {formatDisplay ? formatDisplay(valueText) : valueText || resolvedEmptyText}
      {copyFeedback && (
        <span
          role="status"
          className="pointer-events-none absolute -top-7 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg"
        >
          {copyFeedback}
        </span>
      )}
    </button>
  );
}
