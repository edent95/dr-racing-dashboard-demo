/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { tr } from '../lib/i18n';

interface MobileSubpageFrameProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

// Compact-viewport wrapper for desktop pages the five mobile tabs do not
// render natively. The page content is the exact desktop component; wide
// tables scroll inside the content container instead of the page.
export default function MobileSubpageFrame({ title, onBack, children }: MobileSubpageFrameProps) {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-slate-50 text-slate-900" data-testid="mobile-subpage">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-slate-100 bg-white/95 px-2 backdrop-blur md:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={tr('返回', 'Back', 'Kembali')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="min-w-0 truncate text-headline text-slate-900" data-testid="mobile-subpage-title">
          {title}
        </h1>
      </header>
      <main className="w-full min-w-0 flex-1 overflow-x-auto px-3 pb-24 pt-4 md:px-6" data-testid="mobile-subpage-content">
        <div className="mx-auto w-full min-w-0 max-w-[1180px] space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
