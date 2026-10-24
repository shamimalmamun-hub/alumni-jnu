// Browser-side unsigned uploads to Cloudinary. The returned https URL is what gets
// stored in Firestore instead of a base64 data URL (keeps documents far below the 1MB limit).
//
// Setup (Cloudinary dashboard -> Settings -> Upload -> Upload presets):
//   create an *unsigned* preset, then set in .env:
//     VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//     VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Upload a File or a data URL to Cloudinary and return its secure URL.
 * If Cloudinary isn't configured, a data URL is returned so the app keeps working as before.
 */
export async function uploadToCloudinary(
  source: File | string,
  folder = 'alumni-jnu'
): Promise<string> {
  if (!isCloudinaryConfigured) {
    if (typeof source === 'string') return source;
    return fileToDataUrl(source);
  }

  const body = new FormData();
  body.append('file', source);
  body.append('upload_preset', UPLOAD_PRESET!);
  body.append('folder', folder);

  // "auto" lets the same endpoint accept images and PDFs.
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || `Cloudinary upload failed (${res.status})`);
  }
  return json.secure_url as string;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src || !file.type.startsWith('image/')) {
        return resolve(src);
      }
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            return resolve(compressed);
          }
        } catch {}
        resolve(src);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Shrink an image in the browser before upload. Never throws and never makes things worse:
 * - non-raster files (PDF, SVG, GIF, anything not an image) are returned untouched
 * - EXIF rotation is applied, images are never upscaled
 * - PNGs stay PNG (keeps transparency, e.g. signatures); everything else becomes JPEG
 * - if the result isn't smaller than the original (or anything fails), the original is returned
 */
export async function optimizeImage(
  file: File,
  { maxDim = 1600, quality = 0.82 }: { maxDim?: number; quality?: number } = {}
): Promise<File> {
  const type = file.type;
  // iPhone photos arrive as HEIC/HEIF (or with an empty type on some pickers) — they must be
  // re-encoded to JPEG, otherwise raw HEIC flows to the server and blows past the body cap.
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(type) && (type !== '' || !/\.(heic|heif)$/i.test(file.name))) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    const keepPng = type === 'image/png';
    if (!keepPng) {
      ctx.fillStyle = '#fff'; // JPEG has no alpha
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const outType = keepPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, outType, quality));
    if (!blob || blob.size >= file.size) return file;
    const ext = keepPng ? 'png' : 'jpg';
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type: outType });
  } catch {
    return file;
  }
}
