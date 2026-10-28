import React, { useRef, useState } from 'react';
import { tr } from '../lib/i18n';

/**
 * Wraps a document upload card so files can also be dragged onto it
 * (meeting 2026-10-13). Dropped files go through the same handler as the
 * card's file input, so its type, size and count checks still apply.
 */
export default function FileDropZone({
  id,
  onFiles,
  disabled = false,
  className = '',
  activeClassName = 'ring-2 ring-indigo-300 bg-indigo-50/60',
  testId,
  children
}: {
  id?: string;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  testId?: string;
  children: React.ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave also fire for every child element; count them so the highlight does not flicker.
  const dragDepth = useRef(0);
  const hasFiles = (event: React.DragEvent) => Array.from(event.dataTransfer?.types || []).includes('Files');

  return (
    <div
      id={id}
      data-testid={testId}
      className={`relative transition-colors ${className} ${isDragging ? activeClassName : ''}`}
      onDragEnter={(event) => {
        if (disabled || !hasFiles(event)) return;
        event.preventDefault();
        dragDepth.current += 1;
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        if (disabled || !hasFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={() => {
        if (disabled) return;
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsDragging(false);
      }}
      onDrop={(event) => {
        if (disabled || !hasFiles(event)) return;
        event.preventDefault();
        dragDepth.current = 0;
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files || []);
        if (files.length > 0) onFiles(files);
      }}
    >
      {children}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-card border-2 border-dashed border-indigo-300 bg-white/70 text-footnote font-semibold text-indigo-600">
          {tr('放开即可上传', 'Drop to upload', 'Lepaskan untuk muat naik')}
        </div>
      )}
    </div>
  );
}
