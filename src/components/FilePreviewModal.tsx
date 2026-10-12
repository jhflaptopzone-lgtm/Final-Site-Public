import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Trash2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  FileCode,
  Calendar,
  HardDrive,
  ShieldCheck,
  Tag,
  MessageSquare,
  Maximize2,
  Table,
} from 'lucide-react';
import { StoredFile } from '../types/file';
import { formatFileSize, formatDate, downloadStoredFile } from '../utils/fileHelpers';

interface FilePreviewModalProps {
  file: StoredFile | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdateFile: (file: StoredFile) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onDelete,
  onUpdateFile,
  onShowToast,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'preview' | 'table' | 'raw'>('preview');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState(file?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    setZoomLevel(1);
    setActiveTab('preview');
    setNotes(file?.notes || '');
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(label);
      onShowToast(`Copied ${label} to clipboard`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    if (!cleanTag) return;
    const currentTags = file.tags || [];
    if (!currentTags.includes(cleanTag)) {
      const updated = { ...file, tags: [...currentTags, cleanTag] };
      onUpdateFile(updated);
      onShowToast(`Added tag "${cleanTag}"`, 'info');
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = {
      ...file,
      tags: (file.tags || []).filter((t) => t !== tagToRemove),
    };
    onUpdateFile(updated);
  };

  const handleSaveNotes = () => {
    const updated = { ...file, notes: notes.trim() };
    onUpdateFile(updated);
    setIsEditingNotes(false);
    onShowToast('Notes updated', 'success');
  };

  // Check if file is CSV
  const isCsv =
    file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv');

  const parseCsvPreview = () => {
    if (!file.textContent) return null;
    const lines = file.textContent.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return null;

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1, 101).map((line) =>
      line.split(',').map((cell) => cell.trim().replace(/^["']|["']$/g, ''))
    );

    return { headers, rows, totalLines: lines.length };
  };

  const csvData = isCsv ? parseCsvPreview() : null;

  return (
    <div
      id="file-preview-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="file-preview-modal-card"
        className="relative w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 rounded-md bg-zinc-200/80 text-zinc-700 text-xs font-semibold uppercase tracking-wider shrink-0">
              {file.category}
            </span>
            <h2 className="text-base font-semibold text-zinc-900 truncate" title={file.name}>
              {file.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-btn-download"
              type="button"
              onClick={() => downloadStoredFile(file)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              id="modal-btn-delete"
              type="button"
              onClick={() => {
                onDelete(file.id);
                onClose();
              }}
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="modal-btn-close"
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer ml-1"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content: Split into Preview & Metadata Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Viewer Area */}
          <div className="flex-1 bg-zinc-100/70 flex flex-col overflow-hidden relative border-r border-zinc-200">
            {/* Context bar for images/csv */}
            {(file.category === 'image' || csvData) && (
              <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-200 text-xs text-zinc-600">
                {file.category === 'image' ? (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-zoom-in"
                      onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-700"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-xs">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      id="btn-zoom-out"
                      onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-700"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      id="btn-zoom-reset"
                      onClick={() => setZoomLevel(1)}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-700"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                ) : csvData ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('table')}
                      className={`px-2.5 py-1 rounded font-medium ${
                        activeTab === 'table' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-2.5 py-1 rounded font-medium ${
                        activeTab === 'raw' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'
                      }`}
                    >
                      Raw Text
                    </button>
                  </div>
                ) : null}

                {file.dimensions && (
                  <span className="font-mono text-zinc-500">
                    {file.dimensions.width} × {file.dimensions.height} px
                  </span>
                )}
              </div>
            )}

            {/* Viewer Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              {/* IMAGE PREVIEW */}
              {file.category === 'image' && file.dataUrl ? (
                <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
                  <img
                    id="modal-preview-image"
                    src={file.dataUrl}
                    alt={file.name}
                    className="max-h-[60vh] max-w-full object-contain rounded transition-transform duration-150"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              ) : /* VIDEO PREVIEW */
              file.category === 'video' ? (
                <div className="w-full max-w-2xl flex flex-col items-center">
                  <video
                    id="modal-preview-video"
                    controls
                    autoPlay={false}
                    className="w-full max-h-[60vh] rounded-lg shadow-md bg-black"
                    src={URL.createObjectURL(file.blob)}
                  />
                </div>
              ) : /* AUDIO PREVIEW */
              file.category === 'audio' ? (
                <div className="w-full max-w-md p-6 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4 border border-amber-200">
                    <FileCode className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-zinc-900 mb-1 text-center truncate max-w-xs">
                    {file.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mb-5">{formatFileSize(file.size)}</p>
                  <audio
                    id="modal-preview-audio"
                    controls
                    className="w-full"
                    src={URL.createObjectURL(file.blob)}
                  />
                </div>
              ) : /* CSV TABLE VIEW */
              csvData && activeTab === 'table' ? (
                <div className="w-full h-full overflow-auto bg-white rounded-lg border border-zinc-200 shadow-xs text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-100/90 border-b border-zinc-200 text-zinc-700">
                        <th className="p-2 border-r border-zinc-200 text-center w-10 text-zinc-400">
                          #
                        </th>
                        {csvData.headers.map((h, i) => (
                          <th key={i} className="p-2 text-left font-semibold border-r border-zinc-200">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {csvData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-zinc-50">
                          <td className="p-2 border-r border-zinc-200 text-center font-mono text-zinc-400">
                            {rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-zinc-200 truncate max-w-xs">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : /* TEXT OR CODE PREVIEW */
              file.textContent ? (
                <div className="w-full h-full overflow-auto bg-zinc-900 text-zinc-200 rounded-lg p-4 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-zinc-400">
                    <span>
                      {file.textContent.split('\n').length} lines ·{' '}
                      {file.textContent.length.toLocaleString()} characters
                    </span>
                    <button
                      id="btn-copy-raw-text"
                      type="button"
                      onClick={() => copyToClipboard(file.textContent || '', 'Text Content')}
                      className="inline-flex items-center gap-1 hover:text-white px-2 py-1 rounded bg-zinc-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed select-text font-mono">
                    {file.textContent}
                  </pre>
                </div>
              ) : /* PDF OR APPLICATION EMBED */
              file.type === 'application/pdf' ? (
                <div className="w-full h-full flex flex-col items-center">
                  <iframe
                    src={URL.createObjectURL(file.blob)}
                    title={file.name}
                    className="w-full h-full rounded-lg border border-zinc-200 bg-white"
                  />
                </div>
              ) : (
                /* GENERIC FALLBACK */
                <div className="flex flex-col items-center text-center p-8 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-200/80 flex items-center justify-center text-zinc-600 mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 mb-1">{file.name}</h4>
                  <p className="text-xs text-zinc-500 mb-4">
                    Binary or unsupported preview format. You can download or inspect file metadata.
                  </p>
                  <button
                    id="btn-fallback-download"
                    type="button"
                    onClick={() => downloadStoredFile(file)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download to View</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Deep Inspection & Metadata */}
          <div className="w-full md:w-80 bg-white p-5 overflow-y-auto flex flex-col gap-6 text-xs text-zinc-600">
            {/* Metadata Group */}
            <div>
              <h3 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] mb-3">
                File Details
              </h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Size</span>
                  <span className="font-medium text-zinc-900 font-mono">
                    {formatFileSize(file.size)} ({file.size.toLocaleString()} B)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">MIME Type</span>
                  <span className="font-mono text-zinc-800 text-[11px] truncate max-w-[150px]" title={file.type}>
                    {file.type || 'application/octet-stream'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Uploaded</span>
                  <span className="text-zinc-800">{formatDate(file.createdAt)}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Last Modified</span>
                  <span className="text-zinc-800">{formatDate(file.lastModified)}</span>
                </div>

                {file.dimensions && (
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Dimensions</span>
                    <span className="font-mono text-zinc-800">
                      {file.dimensions.width} × {file.dimensions.height} px
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Checksum & Integrity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  SHA-256 Checksum
                </span>
                <button
                  id="btn-copy-sha"
                  onClick={() => copyToClipboard(file.sha256, 'SHA-256 Checksum')}
                  className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium"
                >
                  {copiedField === 'SHA-256 Checksum' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-zinc-600 break-all bg-zinc-50 p-2 rounded border border-zinc-200">
                {file.sha256}
              </p>
            </div>

            {/* Tags section */}
            <div>
              <h3 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(file.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px]"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-400 hover:text-zinc-700 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {(!file.tags || file.tags.length === 0) && (
                  <span className="text-zinc-400 italic text-[11px]">No tags attached</span>
                )}
              </div>

              <form onSubmit={handleAddTag} className="flex gap-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag (e.g. invoice)..."
                  className="flex-1 px-2.5 py-1 text-xs border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-md font-medium text-zinc-700"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                  Notes
                </h3>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-zinc-500 hover:text-zinc-900 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add personal notes or annotations about this file..."
                    rows={3}
                    className="w-full p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-800 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNotes(file.notes || '');
                        setIsEditingNotes(false);
                      }}
                      className="px-2.5 py-1 text-zinc-500 hover:text-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-zinc-900 text-white rounded-md font-medium hover:bg-zinc-800"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-200 min-h-[50px] whitespace-pre-wrap">
                  {file.notes || 'No notes added yet.'}
                </p>
              )}
            </div>

            {/* Quick Export Actions */}
            <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
              {file.dataUrl && (
                <button
                  id="btn-copy-data-url"
                  type="button"
                  onClick={() => copyToClipboard(file.dataUrl || '', 'Data URL')}
                  className="w-full py-2 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Base64 / Data URL</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
