import React, { useState } from 'react';
import { FileText, ImageIcon, Paperclip } from 'lucide-react';
import { tr } from '../lib/i18n';
import { prepareDocumentFileForUpload } from '../lib/documentImageCompression';
import type { DeliveryAttachment } from '../services/dashboardRepository';
import FileDropZone from './FileDropZone';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

/** Files attached to one checklist step, plus click-or-drop upload for whoever may record the step. */
export default function DeliveryStepAttachments({
  stepKey,
  hint,
  attachments,
  canAttach,
  isFull,
  onUpload,
  onOpen
}: {
  stepKey: string;
  hint: string;
  attachments: DeliveryAttachment[];
  canAttach: boolean;
  /** The step already holds the 10 files the Rules allow. */
  isFull: boolean;
  onUpload: (file: { name: string; type: string; size: number; dataUrl: string }) => Promise<boolean>;
  onOpen: (attachment: DeliveryAttachment) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (attachments.length === 0 && !canAttach) {
    return null;
  }

  const upload = async (files: File[]) => {
    const file = files[0];
    if (!file || isUploading) return;
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      setError(tr('文件要是 PDF 或图片,10MB 以内', 'Files must be a PDF or image up to 10 MB', 'Fail mesti PDF atau imej hingga 10 MB'));
      return;
    }
    setError('');
    setIsUploading(true);
    try {
      const prepared = await prepareDocumentFileForUpload(file);
      await onUpload({ name: file.name, type: prepared.fileType, size: prepared.fileSize, dataUrl: prepared.dataUrl });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-2 space-y-1.5" data-testid={`delivery-attachments-${stepKey}`} onClick={(event) => event.stopPropagation()}>
      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {attachments.map((attachment) => {
            const Icon = attachment.file_type === 'application/pdf' ? FileText : ImageIcon;
            return (
              <li key={attachment.id}>
                <button
                  type="button"
                  onClick={() => onOpen(attachment)}
                  title={`${attachment.file_name} · ${attachment.uploaded_by}`}
                  className="inline-flex max-w-[220px] items-center gap-1 rounded-full bg-white px-2 py-1 text-caption font-semibold text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{attachment.file_name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {canAttach && !isFull && (
        <FileDropZone
          testId={`delivery-attach-drop-${stepKey}`}
          className="rounded-control border border-dashed border-slate-200 px-2.5 py-1.5"
          disabled={isUploading}
          onFiles={(files) => void upload(files)}
        >
          <label className="flex cursor-pointer items-center gap-1.5 text-caption text-slate-500 hover:text-slate-800">
            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
            {isUploading
              ? tr('上传中…', 'Uploading…', 'Memuat naik…')
              : tr(`附上文件:${hint}(拖进来或点这里)`, `Attach: ${hint} (drop or click)`, `Lampirkan: ${hint} (seret atau klik)`)}
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              aria-label={`Attach file to ${stepKey}`}
              className="sr-only"
              disabled={isUploading}
              onChange={(event) => {
                void upload(Array.from(event.currentTarget.files || []));
                event.currentTarget.value = '';
              }}
            />
          </label>
        </FileDropZone>
      )}
      {error && <p className="text-caption text-rose-600">{error}</p>}
    </div>
  );
}
