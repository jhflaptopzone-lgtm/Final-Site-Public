import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Code2,
  Archive,
  File,
  Download,
  Trash2,
  Eye,
  Star,
  CheckSquare,
  Square,
  Copy,
  Edit2,
  Check,
} from 'lucide-react';
import { StoredFile } from '../types/file';
import { formatFileSize, formatDate } from '../utils/fileHelpers';

interface FileListProps {
  files: StoredFile[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onPreview: (file: StoredFile) => void;
  onDownload: (file: StoredFile) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onCopyHash: (hash: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedIds,
  onToggleSelect,
  onPreview,
  onDownload,
  onDelete,
  onToggleFavorite,
  onRename,
  onCopyHash,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const startRename = (file: StoredFile) => {
    setEditingId(file.id);
    setEditingName(file.name);
  };

  const submitRename = (id: string) => {
    if (editingName.trim()) {
      onRename(id, editingName.trim());
    }
    setEditingId(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      case 'video':
        return <Film className="w-4 h-4 text-purple-600" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-indigo-600" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-orange-600" />;
      default:
        return <File className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div id="files-list-table-container" className="w-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5 w-10 text-center"></th>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3 hidden sm:table-cell">Type</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3 hidden md:table-cell">Uploaded</th>
              <th className="py-3 px-3 hidden lg:table-cell">SHA-256</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {files.map((file) => {
              const isSelected = selectedIds.has(file.id);
              return (
                <tr
                  key={file.id}
                  id={`file-row-${file.id}`}
                  className={`hover:bg-zinc-50/60 transition-colors ${
                    isSelected ? 'bg-zinc-50' : ''
                  }`}
                >
                  {/* Select Checkbox & Favorite */}
                  <td className="py-2.5 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        id={`list-select-${file.id}`}
                        type="button"
                        onClick={() => onToggleSelect(file.id)}
                        className="text-zinc-400 hover:text-zinc-800"
                        title={isSelected ? 'Deselect' : 'Select'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-zinc-900" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-300" />
                        )}
                      </button>
                      <button
                        id={`list-fav-${file.id}`}
                        type="button"
                        onClick={() => onToggleFavorite(file.id)}
                        className="text-zinc-300 hover:text-amber-400"
                        title={file.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            file.favorite ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </td>

                  {/* File Name & Icon */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5 max-w-xs md:max-w-md">
                      <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                        {getCategoryIcon(file.category)}
                      </div>

                      {editingId === file.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            id={`inline-rename-${file.id}`}
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitRename(file.id)}
                            className="px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-800"
                            autoFocus
                            onBlur={() => submitRename(file.id)}
                          />
                          <button
                            type="button"
                            onClick={() => submitRename(file.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => onPreview(file)}
                          className="font-medium text-zinc-900 hover:text-zinc-600 cursor-pointer truncate"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-3 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium capitalize">
                      {file.category}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="py-2.5 px-3 font-mono text-zinc-600">
                    {formatFileSize(file.size)}
                  </td>

                  {/* Upload Date */}
                  <td className="py-2.5 px-3 hidden md:table-cell text-zinc-500">
                    {formatDate(file.createdAt)}
                  </td>

                  {/* SHA-256 Checksum */}
                  <td className="py-2.5 px-3 hidden lg:table-cell">
                    <button
                      id={`list-copy-hash-${file.id}`}
                      type="button"
                      onClick={() => onCopyHash(file.sha256)}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 px-2 py-1 rounded"
                      title="Click to copy full SHA-256 hash"
                    >
                      <span>{file.sha256.slice(0, 10)}...</span>
                      <Copy className="w-3 h-3 text-zinc-400" />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        id={`list-preview-btn-${file.id}`}
                        type="button"
                        onClick={() => onPreview(file)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                        title="Preview & inspect"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        id={`list-download-btn-${file.id}`}
                        type="button"
                        onClick={() => onDownload(file)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        id={`list-rename-btn-${file.id}`}
                        type="button"
                        onClick={() => startRename(file)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                        title="Rename"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`list-delete-btn-${file.id}`}
                        type="button"
                        onClick={() => onDelete(file.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
