import { FileCategory, StoredFile } from '../types/file';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${value} ${sizes[i]}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function detectCategory(fileName: string, mimeType: string): FileCategory {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (
    lowerMime.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)$/.test(lowerName)
  ) {
    return 'image';
  }

  if (
    lowerMime.startsWith('video/') ||
    /\.(mp4|webm|ogg|mov|mkv|avi|wmv|flv)$/.test(lowerName)
  ) {
    return 'video';
  }

  if (
    lowerMime.startsWith('audio/') ||
    /\.(mp3|wav|ogg|flac|aac|m4a|weba)$/.test(lowerName)
  ) {
    return 'audio';
  }

  if (
    lowerMime === 'application/pdf' ||
    lowerMime.includes('word') ||
    lowerMime.includes('document') ||
    lowerMime.includes('presentation') ||
    lowerMime.includes('spreadsheet') ||
    /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|odt|rtf|epub)$/.test(lowerName)
  ) {
    return 'document';
  }

  if (
    lowerMime.startsWith('text/') ||
    lowerMime.includes('json') ||
    lowerMime.includes('javascript') ||
    lowerMime.includes('typescript') ||
    lowerMime.includes('xml') ||
    /\.(txt|md|json|js|jsx|ts|tsx|html|css|scss|py|rb|java|c|cpp|cs|go|rs|php|sh|yaml|yml|xml|sql|csv|env|toml)$/.test(
      lowerName
    )
  ) {
    return 'code';
  }

  if (
    lowerMime.includes('zip') ||
    lowerMime.includes('tar') ||
    lowerMime.includes('compressed') ||
    /\.(zip|tar|gz|bz2|7z|rar|xz)$/.test(lowerName)
  ) {
    return 'archive';
  }

  return 'other';
}

export async function calculateSha256(file: File | Blob): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Failed to calculate SHA-256 hash:', err);
    return 'unavailable';
  }
}

export function isTextFile(file: File, category: FileCategory): boolean {
  if (category === 'code') return true;
  if (file.type.startsWith('text/')) return true;
  const lower = file.name.toLowerCase();
  return /\.(txt|md|json|csv|js|ts|tsx|jsx|html|css|xml|yaml|yml|log|svg)$/.test(lower);
}

export async function extractFileMetadata(
  file: File
): Promise<{
  category: FileCategory;
  sha256: string;
  dataUrl?: string;
  textContent?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
}> {
  const category = detectCategory(file.name, file.type);
  const sha256 = await calculateSha256(file);

  let dataUrl: string | undefined = undefined;
  let textContent: string | undefined = undefined;
  let dimensions: { width: number; height: number } | undefined = undefined;
  let duration: number | undefined = undefined;

  // For images, read dimensions and dataUrl
  if (category === 'image') {
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = dataUrl!;
      });
    } catch (e) {
      console.warn('Could not read image dimensions:', e);
    }
  }

  // For audio / video, calculate duration
  if (category === 'audio' || category === 'video') {
    try {
      const objectUrl = URL.createObjectURL(file);
      const media = document.createElement(category === 'video' ? 'video' : 'audio');
      media.preload = 'metadata';
      duration = await new Promise<number | undefined>((resolve) => {
        media.onloadedmetadata = () => {
          resolve(media.duration && !isNaN(media.duration) ? media.duration : undefined);
          URL.revokeObjectURL(objectUrl);
        };
        media.onerror = () => {
          resolve(undefined);
          URL.revokeObjectURL(objectUrl);
        };
        media.src = objectUrl;
      });
    } catch (e) {
      console.warn('Could not read media duration:', e);
    }
  }

  // For text/code, read content (limit to first 250KB for speed and memory)
  if (isTextFile(file, category) && file.size < 5 * 1024 * 1024) {
    try {
      textContent = await file.text();
    } catch (e) {
      console.warn('Could not read text content:', e);
    }
  }

  return {
    category,
    sha256,
    dataUrl,
    textContent,
    dimensions,
    duration,
  };
}

export function downloadStoredFile(file: StoredFile) {
  const blobUrl = URL.createObjectURL(file.blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
