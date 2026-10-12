export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | 'other';

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  blob: Blob;
  dataUrl?: string;
  textContent?: string;
  createdAt: number;
  lastModified: number;
  sha256: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  favorite?: boolean;
  notes?: string;
  tags?: string[];
}

export type SortField = 'date' | 'name' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
