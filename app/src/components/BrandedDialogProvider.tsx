/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, CircleHelp, Info, X } from 'lucide-react';
import { tr } from '../lib/i18n';

export type BrandedDialogTone = 'info' | 'success' | 'warning' | 'danger';

export interface BrandedDialogOptions {
  title: string;
  message: string;
  eyebrow?: string;
  tone?: BrandedDialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
  closeLabel?: string;
  detail?: ReactNode;
  testId?: string;
}

export interface BrandedPasswordPromptOptions extends BrandedDialogOptions {
  inputLabel: string;
  inputPlaceholder?: string;
}

type DialogResult = boolean | string | null;

interface DialogRequest extends BrandedDialogOptions {
  id: number;
  kind: 'alert' | 'confirm' | 'password';
  inputLabel?: string;
  inputPlaceholder?: string;
  resolve: (result: DialogResult) => void;
}

interface BrandedDialogContextValue {
  showAlert: (options: BrandedDialogOptions) => Promise<void>;
  showConfirm: (options: BrandedDialogOptions) => Promise<boolean>;
  showPasswordPrompt: (options: BrandedPasswordPromptOptions) => Promise<string | null>;
}

const BrandedDialogContext = createContext<BrandedDialogContextValue | null>(null);

const TONE_STYLES: Record<BrandedDialogTone, {
  badge: string;
  icon: string;
  button: string;
  focus: string;
  iconNode: ReactNode;
}> = {
  info: {
    badge: 'text-slate-600',
    icon: 'bg-slate-100 text-slate-700 ring-slate-200',
    button: 'bg-red-800 hover:bg-red-900',
    focus: 'focus-visible:ring-red-200',
    iconNode: <Info className="h-5 w-5" aria-hidden="true" />
  },
  success: {
    badge: 'text-emerald-700',
    icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    button: 'bg-emerald-700 hover:bg-emerald-800',
    focus: 'focus-visible:ring-emerald-200',
    iconNode: <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
  },
  warning: {
    badge: 'text-amber-700',
    icon: 'bg-amber-50 text-amber-700 ring-amber-100',
    button: 'bg-amber-600 hover:bg-amber-700',
    focus: 'focus-visible:ring-amber-200',
    iconNode: <CircleHelp className="h-5 w-5" aria-hidden="true" />
  },
  danger: {
    badge: 'text-rose-700',
    icon: 'bg-rose-50 text-rose-700 ring-rose-100',
    button: 'bg-red-800 hover:bg-red-900',
    focus: 'focus-visible:ring-red-200',
    iconNode: <AlertTriangle className="h-5 w-5" aria-hidden="true" />
  }
};

export function BrandedDialogProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogRequest | null>(null);
  const activeDialogRef = useRef<DialogRequest | null>(null);
  const queueRef = useRef<DialogRequest[]>([]);
  const nextIdRef = useRef(0);
  const [passwordValue, setPasswordValue] = useState('');

  const enqueue = useCallback((kind: DialogRequest['kind'], options: BrandedDialogOptions) => (
    new Promise<DialogResult>((resolve) => {
      const request: DialogRequest = {
        ...options,
        id: ++nextIdRef.current,
        kind,
        resolve
      };

      if (activeDialogRef.current) {
        queueRef.current.push(request);
        return;
      }

      activeDialogRef.current = request;
      setPasswordValue('');
      setActiveDialog(request);
    })
  ), []);

  const showConfirm = useCallback(async (options: BrandedDialogOptions) => (
    await enqueue('confirm', options) === true
  ), [enqueue]);
  const showAlert = useCallback(async (options: BrandedDialogOptions) => {
    await enqueue('alert', options);
  }, [enqueue]);
  const showPasswordPrompt = useCallback(async (options: BrandedPasswordPromptOptions) => {
    const result = await enqueue('password', options);
    return typeof result === 'string' ? result : null;
  }, [enqueue]);

  const finishDialog = useCallback((result: DialogResult) => {
    const current = activeDialogRef.current;
    if (!current) return;

    const next = queueRef.current.shift() || null;
    activeDialogRef.current = next;
    current.resolve(result);
    setPasswordValue('');
    setActiveDialog(next);
  }, []);

  useEffect(() => {
    if (!activeDialog) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        finishDialog(activeDialog.kind === 'alert' ? true : activeDialog.kind === 'password' ? null : false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeDialog, finishDialog]);

  const dialogTone = activeDialog?.tone || 'info';
  const toneStyle = TONE_STYLES[dialogTone];
  const dialogTitleId = activeDialog ? `branded-dialog-title-${activeDialog.id}` : '';
  const defaultEyebrow = dialogTone === 'danger'
    ? tr('需要确认', 'Confirmation Required', 'Pengesahan Diperlukan')
    : dialogTone === 'warning'
      ? tr('请注意', 'Attention', 'Perhatian')
      : dialogTone === 'success'
        ? tr('确认操作', 'Confirm Action', 'Sahkan Tindakan')
        : tr('系统提示', 'System Notice', 'Notis Sistem');

  return (
    <BrandedDialogContext.Provider value={{ showAlert, showConfirm, showPasswordPrompt }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeDialog && (
            <motion.div
              data-testid={activeDialog.testId || 'branded-dialog'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  finishDialog(activeDialog.kind === 'alert' ? true : activeDialog.kind === 'password' ? null : false);
                }
              }}
            >
              <motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-200 sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${toneStyle.icon}`}>
                    {toneStyle.iconNode}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${toneStyle.badge}`}>
                      {activeDialog.eyebrow || defaultEyebrow}
                    </p>
                    <h2 id={dialogTitleId} className="mt-1 text-base font-bold text-slate-900">
                      {activeDialog.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label={activeDialog.closeLabel || tr('关闭弹窗', 'Close dialog', 'Tutup dialog')}
                    onClick={() => finishDialog(activeDialog.kind === 'alert' ? true : activeDialog.kind === 'password' ? null : false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {activeDialog.message}
                </p>

                {activeDialog.kind === 'password' && (
                  <label className="mt-4 block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {activeDialog.inputLabel}
                    </span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      value={passwordValue}
                      onChange={(event) => setPasswordValue(event.target.value)}
                      placeholder={activeDialog.inputPlaceholder}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50"
                      data-testid="branded-password-input"
                    />
                  </label>
                )}

                {activeDialog.detail && (
                  <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
                    {activeDialog.detail}
                  </div>
                )}

                <div className={`mt-6 grid gap-3 ${activeDialog.kind !== 'alert' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {activeDialog.kind !== 'alert' && (
                    <button
                      type="button"
                      autoFocus={activeDialog.kind !== 'password' && dialogTone === 'danger'}
                      onClick={() => finishDialog(activeDialog.kind === 'password' ? null : false)}
                      className="min-h-11 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-800"
                    >
                      {activeDialog.cancelLabel || tr('取消', 'Cancel', 'Batal')}
                    </button>
                  )}
                  <button
                    type="button"
                    autoFocus={activeDialog.kind !== 'password' && (activeDialog.kind === 'alert' || dialogTone !== 'danger')}
                    disabled={activeDialog.kind === 'password' && passwordValue.length === 0}
                    onClick={() => finishDialog(activeDialog.kind === 'password' ? passwordValue : true)}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${toneStyle.button} ${toneStyle.focus}`}
                  >
                    {activeDialog.confirmLabel || (activeDialog.kind === 'alert'
                      ? tr('知道了', 'Got It', 'Faham')
                      : tr('确认', 'Confirm', 'Sahkan'))}
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </BrandedDialogContext.Provider>
  );
}

export function useBrandedDialog() {
  const context = useContext(BrandedDialogContext);
  if (!context) {
    throw new Error('useBrandedDialog must be used inside BrandedDialogProvider.');
  }
  return context;
}
