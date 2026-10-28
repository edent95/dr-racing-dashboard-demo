/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * In-app viewer for uploaded document photos (IC, payslip, geran...). Staff
 * zoom, pan and rotate to read the small print on an IC without leaving the
 * Application Detail drawer. Portaled above the drawer (z-50) and the branded
 * dialogs (z-[120]).
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCw, Scan, X, ZoomIn, ZoomOut } from 'lucide-react';
import { tr } from '../lib/i18n';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;
const ZOOM_STEP = 1.25;

interface DocumentImageViewerProps {
  src: string;
  fileName: string;
  onClose: () => void;
}

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

export default function DocumentImageViewer({ src, fileName, onClose }: DocumentImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const zoomBy = (factor: number) => {
    setZoom((current) => {
      const next = clampZoom(current * factor);
      if (next <= 1) {
        setOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const reset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      } else if (event.key === '+' || event.key === '=') {
        zoomBy(ZOOM_STEP);
      } else if (event.key === '-') {
        zoomBy(1 / ZOOM_STEP);
      } else if (event.key === '0') {
        reset();
      } else if (event.key.toLowerCase() === 'r') {
        setRotation((current) => (current + 90) % 360);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  // Wheel / trackpad pinch zooms; React's onWheel is passive, so bind natively.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => stage.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset({ x: drag.originX + event.clientX - drag.startX, y: drag.originY + event.clientY - drag.startY });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const toolbarButtonClass = 'inline-flex h-9 w-9 items-center justify-center rounded-control text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={fileName}
      data-testid="document-image-viewer"
      className="fixed inset-0 z-[130] flex flex-col bg-slate-950/95"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="min-w-0 truncate text-footnote font-semibold text-white/90" title={fileName}>{fileName}</p>
        <div className="flex shrink-0 items-center gap-1 rounded-card bg-white/5 p-1">
          <button type="button" onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} className={toolbarButtonClass} aria-label={tr('缩小', 'Zoom out', 'Zum keluar')} title={tr('缩小 (-)', 'Zoom out (-)', 'Zum keluar (-)')}>
            <ZoomOut className="h-4 w-4" />
          </button>
          <span data-testid="document-image-viewer-zoom" className="w-12 text-center text-caption font-semibold tabular-nums text-white/80">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" onClick={() => zoomBy(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} className={toolbarButtonClass} aria-label={tr('放大', 'Zoom in', 'Zum masuk')} title={tr('放大 (+)', 'Zoom in (+)', 'Zum masuk (+)')}>
            <ZoomIn className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setRotation((current) => (current + 90) % 360)} className={toolbarButtonClass} aria-label={tr('旋转', 'Rotate', 'Putar')} title={tr('旋转 (R)', 'Rotate (R)', 'Putar (R)')}>
            <RotateCw className="h-4 w-4" />
          </button>
          <button type="button" onClick={reset} className={toolbarButtonClass} aria-label={tr('还原', 'Reset view', 'Set semula paparan')} title={tr('还原 (0)', 'Reset (0)', 'Set semula (0)')}>
            <Scan className="h-4 w-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
          <button ref={closeButtonRef} type="button" onClick={onClose} className={toolbarButtonClass} aria-label={tr('关闭预览', 'Close preview', 'Tutup pratonton')} title={tr('关闭 (Esc)', 'Close (Esc)', 'Tutup (Esc)')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        data-testid="document-image-viewer-stage"
        className={`relative flex-1 touch-none select-none overflow-hidden ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={() => (zoom > 1 ? reset() : setZoom(2.5))}
      >
        <img
          src={src}
          alt={fileName}
          draggable={false}
          className="absolute left-1/2 top-1/2 max-h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] object-contain transition-transform duration-100 ease-out"
          style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${rotation}deg) scale(${zoom})` }}
        />
      </div>

      <p className="pb-3 text-center text-micro tracking-normal text-white/45">
        {tr('滚轮或 +/- 缩放 · 放大后拖动 · 双击放大/还原 · R 旋转 · Esc 关闭', 'Scroll or +/- to zoom · drag when zoomed · double-click to zoom/reset · R rotate · Esc close', 'Tatal atau +/- untuk zum · seret semasa dizum · klik dua kali untuk zum/set semula · R putar · Esc tutup')}
      </p>
    </div>,
    document.body
  );
}
