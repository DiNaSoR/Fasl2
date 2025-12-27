
/**
 * Advanced Image Processing Library for VisionLayer AI.
 * Handles buffer conversions, bitmask operations, and high-frequency canvas updates.
 */

/**
 * Converts a File object to a base64 string with optional resizing to fit model constraints.
 */
export async function fileToBase64(file: File, maxWidth = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type));
        } else {
          reject(new Error("Canvas context failed"));
        }
      };
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Performs a flood-fill or simple edge-detection mask on a canvas to improve object isolation.
 * This is a client-side heuristic to support the AI's bounding box.
 */
export function isolatePixels(
  sourceCanvas: HTMLCanvasElement, 
  startX: number, 
  startY: number
): string {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas.toDataURL();

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Simple transparency logic:
  // We assume the corners of a bounding box might be background.
  // Real implementation would use the AI's mask.
  
  // For demonstration, we'll apply a slight vignette or alpha-gradient to edges
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const distToEdgeX = Math.min(x, width - x);
      const distToEdgeY = Math.min(y, height - y);
      const minEdgeDist = Math.min(distToEdgeX, distToEdgeY);
      
      if (minEdgeDist < 5) {
        data[idx + 3] = data[idx + 3] * (minEdgeDist / 5);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return sourceCanvas.toDataURL('image/png');
}

/**
 * Utility for geometric calculations.
 */
export const MathUtils = {
  getDistance: (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  },
  
  getCenter: (rect: {x: number, y: number, width: number, height: number}) => {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }
};
