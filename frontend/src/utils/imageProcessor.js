/**
 * imageProcessor.js
 *
 * Client-side image optimization using the browser's Canvas API.
 * - Accepts JPG, JPEG, PNG, WebP
 * - Converts everything to WebP at 83% quality
 * - Downscales to max 1920px wide (maintaining aspect ratio)
 * - Returns a new File blob (.webp) + the processed {width, height}
 *
 * No external dependencies. Works in all modern browsers.
 */

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 0.83;

/**
 * Load a File/Blob as an HTMLImageElement.
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

/**
 * Process an image file:
 *  1. Decode it via an <img> element
 *  2. Resize if width > MAX_WIDTH
 *  3. Draw onto an offscreen canvas
 *  4. Export as WebP at WEBP_QUALITY
 *
 * @param {File} file - Original image file (JPG/PNG/WebP)
 * @returns {Promise<{ file: File, width: number, height: number, originalSize: number, processedSize: number }>}
 */
export async function processImage(file) {
  // Validate type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Please use JPG, PNG, or WebP.`);
  }

  const img = await loadImage(file);

  // Calculate output dimensions
  let outWidth = img.naturalWidth;
  let outHeight = img.naturalHeight;

  if (outWidth > MAX_WIDTH) {
    outHeight = Math.round((MAX_WIDTH / outWidth) * outHeight);
    outWidth = MAX_WIDTH;
  }

  // Draw onto offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;

  const ctx = canvas.getContext('2d');
  // Use better image smoothing for downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, outWidth, outHeight);

  // Export as WebP blob
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob failed — browser may not support WebP export.'));
      },
      'image/webp',
      WEBP_QUALITY
    );
  });

  // Build new File with .webp extension
  const baseName = file.name.replace(/\.[^/.]+$/, ''); // strip original extension
  const webpFile = new File([blob], `${baseName}.webp`, { type: 'image/webp' });

  return {
    file: webpFile,
    width: outWidth,
    height: outHeight,
    originalSize: file.size,
    processedSize: webpFile.size,
  };
}

/**
 * Format bytes to a human-readable string (KB / MB).
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
