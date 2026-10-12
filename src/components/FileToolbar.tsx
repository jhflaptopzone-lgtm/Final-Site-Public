import React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  HardDrive,
  Star,
  Layers,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import { FileCategory, SortField, SortOrder, ViewMode } from '../types/file';
import { formatFileSize } from '../utils/fileHelpers';

interface FileToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: FileCategory | 'all' | 'favorites';
  onCategoryChange: (cat: FileCategory | 'all' | 'favorites') => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilesCount: number;
  filteredFilesCount: number;
  totalBytesUsed: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onOpenStorageStats: () => void;
}

export const FileToolbar: React.FC<FileToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortField,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFilesCount,
  filteredFilesCount,
  totalBytesUsed,
  allSelected,
  onToggleSelectAll,
  onOpenStorageStats,
}) => {
  const categories: { key: FileCategory | 'all' | 'favorites'; label: string }[] = [
    { key: 'all', label: 'All Files' },
    { key: 'image', label: 'Images' },
    { key: 'document', label: 'Documents' },
    { key: 'audio', label: 'Audio' },
    { key: 'video', label: 'Video' },
    { key: 'code', label: 'Code & Data' },
    { key: 'archive', label: 'Archives' },
    { key: 'favorites', label: 'Favorites' },
  ];

  return (
    <div id="file-management-toolbar" className="flex flex-col gap-4 w-full">
      {/* Search & Top Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="file-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by file name, format, or tag..."
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-md"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Storage summary button */}
          <button
            id="btn-storage-stats"
            type="button"
            onClick={onOpenStorageStats}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors shadow-xs cursor-pointer"
            title="View storage quota details"
          >
            <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formatFileSize(totalBytesUsed)} used</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <select
              id="sort-select"
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [SortField, SortOrder];
                onSortChange(f, o);
              }}
              className="text-xs font-medium text-zinc-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="size-desc">Size (Large to Small)</option>
              <option value="size-asc">Size (Small to Large)</option>
              <option value="type-asc">Type (Grouped)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div
            id="view-mode-toggle-group"
            className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200"
          >
            <button
              id="btn-view-grid"
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="btn-view-list"
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Bulk select */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-100">
        <div id="category-filter-chips" className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                id={`filter-chip-${cat.key}`}
                type="button"
                onClick={() => onCategoryChange(cat.key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat.key === 'favorites' ? (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {cat.label}
                  </span>
                ) : (
                  cat.label
                )}
              </button>
            );
          })}
        </div>

        {totalFilesCount > 0 && (
          <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500">
            <button
              id="btn-select-all"
              type="button"
              onClick={onToggleSelectAll}
              className="inline-flex items-center gap-1.5 font-medium hover:text-zinc-900 transition-colors cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-zinc-900" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400" />
              )}
              <span>Select All ({filteredFilesCount})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
