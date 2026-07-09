import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X, FileCheck, FileWarning, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onFileReady: (file: { name: string; type: string; size: number; content: string }) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['.txt', '.csv', '.json', '.md', '.log', '.xml', '.html', '.rtf'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function DocumentUpload({ onFileReady, disabled }: DocumentUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAccepted = (name: string) => {
    const ext = '.' + name.split('.').pop()?.toLowerCase();
    return ACCEPTED_TYPES.includes(ext);
  };

  const readFile = useCallback((file: File) => {
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum 5MB.');
      return;
    }
    if (!isAccepted(file.name)) {
      setError(`Unsupported file type. Accepted: ${ACCEPTED_TYPES.join(', ')}`);
      return;
    }

    setError(null);
    setParsing(true);
    setSelectedFile({ name: file.name, size: file.size, type: file.type });

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setParsing(false);
      onFileReady({ name: file.name, type: file.type, size: file.size, content });
    };
    reader.onerror = () => {
      setParsing(false);
      setError('Failed to read file.');
    };
    reader.readAsText(file);
  }, [onFileReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, [readFile, disabled]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleSelect}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-blue-500 bg-blue-500/5'
              : 'border-border hover:border-border-light hover:bg-bg-elevated/30'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">
            {dragging ? 'Drop file here' : 'Drag & drop a document'}
          </p>
          <p className="text-xs text-text-muted mb-3">or click to browse</p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {ACCEPTED_TYPES.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-bg-elevated border border-border text-text-muted font-mono">
                {t}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-text-muted mt-3">Max 5MB</p>
        </div>
      ) : (
        <div className="rounded-xl p-5 bg-bg-elevated/50 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              {parsing ? <Loader2 className="w-5 h-5 text-blue-400 animate-spin" /> : <FileCheck className="w-5 h-5 text-emerald-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                <p className="text-sm font-medium text-text-primary truncate">{selectedFile.name}</p>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {formatSize(selectedFile.size)} • {selectedFile.type || 'text/plain'}
                {parsing && ' • Reading file...'}
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
          <FileWarning className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
