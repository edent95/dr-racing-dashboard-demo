/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

type OptimizedImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'width' | 'height' | 'loading' | 'decoding'
> & {
  width: number;
  height: number;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
};

export default function OptimizedImage({
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: OptimizedImageProps) {
  return (
    <img
      {...props}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
    />
  );
}
