/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Renders a stored attachment as a download link without ever binding the
 * untrusted stored string to `href`. The value is validated and re-materialised
 * as a same-origin blob: URL; anything that is not an allow-listed base64 data
 * URL renders as inert text instead of a clickable link.
 */

import React, { useEffect, useState } from 'react';
import { tr } from '../lib/i18n';
import { createAttachmentObjectUrl, type SafeAttachmentLike } from '../utils/attachmentSafety';

type SafeAttachmentLinkProps = {
  attachment: SafeAttachmentLike | null | undefined;
  className?: string;
  unsafeClassName?: string;
  children: React.ReactNode;
};

const SafeAttachmentLink: React.FC<SafeAttachmentLinkProps> = ({
  attachment,
  className,
  unsafeClassName,
  children
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const dataUrl = attachment?.file_data_url;
  const declaredType = attachment?.type;

  useEffect(() => {
    const url = createAttachmentObjectUrl(attachment);
    setObjectUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
    // Re-materialise only when the underlying stored value changes.
  }, [dataUrl, declaredType]);

  if (!attachment) return null;

  if (!objectUrl) {
    return (
      <span
        className={unsafeClassName || className}
        title={tr(
          '附件格式不受支持或已被安全策略拦截。',
          'Attachment type is unsupported or was blocked by the security policy.',
          'Jenis lampiran tidak disokong atau disekat oleh dasar keselamatan.'
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={objectUrl}
      download={attachment.name || 'attachment'}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
};

export default SafeAttachmentLink;
