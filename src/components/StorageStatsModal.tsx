import React from 'react';
import { X, HardDrive, Trash2, PieChart, Database, FileSpreadsheet } from 'lucide-react';
import { StoredFile } from '../types/file';
import { formatFileSize } from '../utils/fileHelpers';

interface StorageStatsModalProps {
  files: StoredFile[];
  onClose: () => void;
  onClearAll: () => void;
}

export const StorageStatsModal: React.FC<StorageStatsModalProps> = ({
  files,
  onClose,
  onClearAll,
}) => {
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  // Group by category
  const categoriesCount: Record<string, { count: number; bytes: number }> = {};
  files.forEach((f) => {
    if (!categoriesCount[f.category]) {
      categoriesCount[f.category] = { count: 0, bytes: 0 };
    }
    categoriesCount[f.category].count += 1;
    categoriesCount[f.category].bytes += f.size;
  });

  return (
    <div
      id="storage-stats-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="storage-stats-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/80">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
            <HardDrive className="w-4 h-4 text-zinc-700" />
            <span>Local Storage Analysis</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 text-xs text-zinc-600">
          {/* Main stats */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
            <div>
              <p className="text-zinc-500 font-medium">Total Files</p>
              <p className="text-xl font-bold text-zinc-900 mt-0.5">{files.length}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 font-medium">Space Occupied</p>
              <p className="text-xl font-bold text-zinc-900 mt-0.5">{formatFileSize(totalBytes)}</p>
            </div>
          </div>

          {/* Category breakdown */}
          <div>
            <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-zinc-500" />
              Category Breakdown
            </h4>

            {files.length === 0 ? (
              <p className="text-zinc-400 italic py-2">No files stored yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {Object.entries(categoriesCount).map(([cat, data]) => {
                  const percentage = totalBytes > 0 ? (data.bytes / totalBytes) * 100 : 0;
                  return (
                    <div key={cat} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="capitalize text-zinc-700">
                          {cat} ({data.count})
                        </span>
                        <span className="text-zinc-500 font-mono">
                          {formatFileSize(data.bytes)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-zinc-800 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Persistent storage note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-50 text-zinc-500 border border-zinc-100 text-[11px] leading-relaxed">
            <Database className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
            <span>
              All uploaded files are saved using client-side IndexedDB persistence. Files remain
              accessible even if you reload or reopen your browser.
            </span>
          </div>

          {/* Danger zone */}
          {files.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-zinc-500 text-xs">Clear all stored files</span>
              <button
                id="btn-clear-all-storage"
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all uploaded files?')) {
                    onClearAll();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
