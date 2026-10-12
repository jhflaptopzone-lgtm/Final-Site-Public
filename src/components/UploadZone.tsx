import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image, Film, Music, Code2, Archive, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  processingProgress: { current: number; total: number; filename: string };
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  isProcessing,
  processingProgress,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = ''; // Reset input to allow re-uploading same file
    }
  };

  return (
    <div
      id="upload-dropzone-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 bg-white ${
        isDragOver
          ? 'border-zinc-900 bg-zinc-50 scale-[0.995]'
          : 'border-zinc-300 hover:border-zinc-400'
      } p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[260px] shadow-sm`}
    >
      <input
        ref={fileInputRef}
        id="hidden-file-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={folderInputRef}
        id="hidden-folder-input"
        type="file"
        {...{ webkitdirectory: '', directory: '' }}
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {isProcessing ? (
        <div id="upload-progress-state" className="flex flex-col items-center max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-zinc-800 animate-spin" />
          </div>
          <p className="text-base font-semibold text-zinc-900 mb-1">Processing Files...</p>
          <p className="text-xs text-zinc-500 truncate max-w-xs mb-3 font-mono">
            {processingProgress.filename || 'Computing checksums and metadata...'}
          </p>

          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-zinc-900 h-2 rounded-full transition-all duration-200"
              style={{
                width: `${
                  processingProgress.total > 0
                    ? Math.round((processingProgress.current / processingProgress.total) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            {processingProgress.current} of {processingProgress.total} completed
          </span>
        </div>
      ) : (
        <div id="upload-idle-state" className="flex flex-col items-center max-w-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4 text-zinc-700 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            Drag & drop files here, or browse
          </h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            Upload images, documents, audio, videos, code, or archives. Files are stored securely
            in your browser with instant metadata extraction.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              id="btn-browse-files"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Browse Files</span>
            </button>

            <button
              id="btn-browse-folder"
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-700 text-sm font-medium hover:bg-zinc-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Folder</span>
            </button>
          </div>

          <div
            id="supported-formats-badges"
            className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-zinc-100"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium">
              <Image className="w-3.5 h-3.5 text-zinc-500" />
              Images
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              PDFs & Docs
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium">
              <Film className="w-3.5 h-3.5 text-zinc-500" />
              Video
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium">
              <Music className="w-3.5 h-3.5 text-zinc-500" />
              Audio
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium">
              <Code2 className="w-3.5 h-3.5 text-zinc-500" />
              Code & Data
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium">
              <Archive className="w-3.5 h-3.5 text-zinc-500" />
              Archives
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
