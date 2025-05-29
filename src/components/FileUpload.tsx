import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '../config/constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, onFileRemove, selectedFile, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      setError('Only PDF and DOCX files are supported');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return false;
    }
    
    return true;
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [disabled, onFileSelect, validateFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  }, [disabled, onFileSelect, validateFile]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFileRemove();
    setError(null);
  }, [onFileRemove]);

  const handleClick = useCallback(() => {
    if (!disabled && !selectedFile) {
      document.getElementById('file-upload')?.click();
    }
  }, [disabled, selectedFile]);

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${!selectedFile && !disabled ? 'cursor-pointer hover:border-gray-400' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Only show the hidden input when no file is selected */}
        {!selectedFile && (
          <input
            id="file-upload"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.docx"
            onChange={handleChange}
            disabled={disabled}
          />
        )}

        {selectedFile ? (
          <div className="flex items-center justify-center space-x-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={disabled}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                Drop your resume here, or click to browse
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Supports PDF and DOCX files up to 10MB
              </p>
            </div>
          </div>
        )}

        {/* Hidden input for programmatic access when file is selected */}
        {selectedFile && (
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleChange}
            disabled={disabled}
          />
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 