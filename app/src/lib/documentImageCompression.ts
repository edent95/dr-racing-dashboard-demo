/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 客户在手机上拍的证件 / 工资单照片动辄 5–10MB，用手机流量上传常常 30 秒传不完。
// 上传前把照片缩到最长边 2000px、JPEG 82%（一般 300–800KB，小字仍清楚）；
// PDF、小图、解码失败或压完反而更大的，原样保留。
export const DOCUMENT_IMAGE_MAX_SIDE = 2000;
export const DOCUMENT_IMAGE_JPEG_QUALITY = 0.82;
export const DOCUMENT_IMAGE_SKIP_BELOW_BYTES = 500 * 1024;

export type PreparedDocumentFile = {
  dataUrl: string;
  fileType: string;
  fileSize: number;
  compressed: boolean;
};

const readFileAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error || new Error('Document could not be read.'));
  reader.readAsDataURL(file);
});

const loadImage = (file: File) => new Promise<HTMLImageElement | null>((resolve) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(null);
  };
  image.src = objectUrl;
});

const canvasToJpegBlob = (canvas: HTMLCanvasElement) => new Promise<Blob | null>((resolve) => {
  try {
    canvas.toBlob(resolve, 'image/jpeg', DOCUMENT_IMAGE_JPEG_QUALITY);
  } catch {
    resolve(null);
  }
});

export async function prepareDocumentFileForUpload(file: File): Promise<PreparedDocumentFile> {
  const original = async (): Promise<PreparedDocumentFile> => ({
    dataUrl: await readFileAsDataUrl(file),
    fileType: file.type,
    fileSize: file.size,
    compressed: false
  });

  if (!file.type.startsWith('image/') || file.size < DOCUMENT_IMAGE_SKIP_BELOW_BYTES) {
    return original();
  }

  const image = await loadImage(file);
  if (!image || !image.naturalWidth || !image.naturalHeight) {
    return original();
  }

  const scale = Math.min(1, DOCUMENT_IMAGE_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(Math.round(image.naturalWidth * scale), 1);
  canvas.height = Math.max(Math.round(image.naturalHeight * scale), 1);
  const context = canvas.getContext('2d');
  if (!context) {
    return original();
  }

  // JPEG 没有透明通道：先铺白底，透明 PNG 不会变成黑底。
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await canvasToJpegBlob(canvas);
  if (!blob || blob.size >= file.size) {
    return original();
  }

  return {
    dataUrl: await readFileAsDataUrl(blob),
    fileType: 'image/jpeg',
    fileSize: blob.size,
    compressed: true
  };
}
