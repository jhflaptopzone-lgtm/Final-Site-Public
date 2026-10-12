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
  MoreVertical,
  Edit2,
  Check,
  CheckSquare,
  Square,
  Copy,
} from 'lucide-react';
import { StoredFile } from '../types/file';
import { formatFileSize, formatDate } from '../utils/fileHelpers';

interface FileCardProps {
  file: StoredFile;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (file: StoredFile) => void;
  onDownload: (file: StoredFile) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onCopyHash: (hash: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onToggleSelect,
  onPreview,
  onDownload,
  onDelete,
  onToggleFavorite,
  onRename,
  onCopyHash,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const getCategoryIcon = () => {
    switch (file.category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-600" />;
      case 'video':
        return <Film className="w-5 h-5 text-purple-600" />;
      case 'audio':
        return <Music className="w-5 h-5 text-amber-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-indigo-600" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-orange-600" />;
      default:
        return <File className="w-5 h-5 text-zinc-600" />;
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== file.name) {
      onRename(file.id, newName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div
      id={`file-card-${file.id}`}
      className={`group relative flex flex-col justify-between bg-white border rounded-xl overflow-hidden transition-all duration-150 hover:shadow-md ${
        isSelected
          ? 'border-zinc-900 ring-2 ring-zinc-900/10'
          : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      {/* Top Preview Area */}
      <div
        className="relative w-full h-36 bg-zinc-50 flex items-center justify-center overflow-hidden cursor-pointer border-b border-zinc-100"
        onClick={() => onPreview(file)}
      >
        {file.category === 'image' && file.dataUrl ? (
          <img
            src={file.dataUrl}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : file.category === 'code' && file.textContent ? (
          <div className="w-full h-full p-3 font-mono text-[11px] text-zinc-600 bg-zinc-50 overflow-hidden leading-relaxed select-none">
            <pre className="overflow-hidden line-clamp-6">{file.textContent}</pre>
          </div>
        ) : file.category === 'video' ? (
          <div className="flex flex-col items-center gap-1.5 text-zinc-400 group-hover:text-zinc-600 transition-colors">
            <Film className="w-10 h-10 text-purple-400" />
            <span className="text-[11px] font-medium text-zinc-500">Video Media</span>
          </div>
        ) : file.category === 'audio' ? (
          <div className="flex flex-col items-center gap-1.5 text-zinc-400 group-hover:text-zinc-600 transition-colors">
            <Music className="w-10 h-10 text-amber-500" />
            <span className="text-[11px] font-medium text-zinc-500">Audio Track</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-400 group-hover:text-zinc-600 transition-colors">
            {getCategoryIcon()}
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              {file.name.split('.').pop() || file.category}
            </span>
          </div>
        )}

        {/* Floating selection checkbox on hover or when selected */}
        <button
          id={`btn-select-${file.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(file.id);
          }}
          className={`absolute top-2.5 left-2.5 p-1 rounded-md transition-all z-10 cursor-pointer ${
            isSelected
              ? 'opacity-100 bg-zinc-900 text-white shadow-xs'
              : 'opacity-0 group-hover:opacity-100 bg-white/90 text-zinc-600 hover:text-zinc-900 border border-zinc-200'
          }`}
          title={isSelected ? 'Deselect file' : 'Select file'}
        >
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>

        {/* Favorite star */}
        <button
          id={`btn-favorite-${file.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(file.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1 rounded-md transition-all z-10 cursor-pointer ${
            file.favorite
              ? 'opacity-100 bg-white/95 text-amber-500 border border-amber-200 shadow-xs'
              : 'opacity-0 group-hover:opacity-100 bg-white/90 text-zinc-400 hover:text-amber-500 border border-zinc-200'
          }`}
          title={file.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${file.favorite ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Dimension or duration badge */}
        {file.dimensions && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white">
            {file.dimensions.width}×{file.dimensions.height}
          </div>
        )}
      </div>

      {/* Card Body & Info */}
      <div className="p-3.5 flex flex-col gap-2">
        {isEditingName ? (
          <form onSubmit={handleRenameSubmit} className="flex items-center gap-1">
            <input
              id={`rename-input-${file.id}`}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-800"
              autoFocus
              onBlur={() => setIsEditingName(false)}
            />
            <button
              type="submit"
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-1.5">
            <h4
              onClick={() => onPreview(file)}
              className="text-xs font-semibold text-zinc-900 truncate hover:text-zinc-600 cursor-pointer flex-1"
              title={file.name}
            >
              {file.name}
            </h4>

            {/* Actions dropdown trigger */}
            <div className="relative">
              <button
                id={`btn-menu-${file.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                title="Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-6 z-30 w-36 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 text-xs text-zinc-700">
                    <button
                      id={`menu-preview-${file.id}`}
                      onClick={() => {
                        setShowMenu(false);
                        onPreview(file);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-50"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Preview</span>
                    </button>
                    <button
                      id={`menu-download-${file.id}`}
                      onClick={() => {
                        setShowMenu(false);
                        onDownload(file);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-50"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Download</span>
                    </button>
                    <button
                      id={`menu-rename-${file.id}`}
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditingName(true);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-50"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Rename</span>
                    </button>
                    <button
                      id={`menu-copy-hash-${file.id}`}
                      onClick={() => {
                        setShowMenu(false);
                        onCopyHash(file.sha256);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-50"
                    >
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Copy Hash</span>
                    </button>
                    <div className="border-t border-zinc-100 my-1" />
                    <button
                      id={`menu-delete-${file.id}`}
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(file.id);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Metadata row */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span className="font-medium text-zinc-600">{formatFileSize(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>

        {/* Quick action footer */}
        <div className="flex items-center justify-end gap-1 pt-2 border-t border-zinc-100">
          <button
            id={`card-quick-preview-${file.id}`}
            type="button"
            onClick={() => onPreview(file)}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
            title="Inspect file"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            id={`card-quick-download-${file.id}`}
            type="button"
            onClick={() => onDownload(file)}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            id={`card-quick-delete-${file.id}`}
            type="button"
            onClick={() => onDelete(file.id)}
            className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete file"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
