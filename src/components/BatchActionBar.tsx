import React from 'react';
import { Download, Trash2, X, CheckSquare } from 'lucide-react';

interface BatchActionBarProps {
  selectedCount: number;
  onDownloadSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onDownloadSelected,
  onDeleteSelected,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      id="batch-actions-floating-bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 border border-zinc-800 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center gap-2 text-xs font-semibold">
        <CheckSquare className="w-4 h-4 text-emerald-400" />
        <span>{selectedCount} selected</span>
      </div>

      <div className="h-4 w-px bg-zinc-700" />

      <div className="flex items-center gap-2">
        <button
          id="btn-batch-download"
          type="button"
          onClick={onDownloadSelected}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download All</span>
        </button>

        <button
          id="btn-batch-delete"
          type="button"
          onClick={onDeleteSelected}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/50 text-xs font-medium text-rose-200 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <button
        id="btn-batch-close"
        type="button"
        onClick={onClearSelection}
        className="p-1 text-zinc-400 hover:text-white rounded transition-colors ml-1 cursor-pointer"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
