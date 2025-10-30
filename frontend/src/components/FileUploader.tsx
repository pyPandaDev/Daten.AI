import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File, userGoal?: string) => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isUploading }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0], undefined);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
      'application/x-parquet': ['.parquet'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 transform ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl'
            : 'border-gray-300 hover:border-blue-400 hover:shadow-lg bg-white hover:scale-102'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-5">
          {isUploading ? (
            <>
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-800">Uploading and analyzing...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
                <Upload className={`h-16 w-16 text-blue-600 transition-transform ${isDragActive ? 'animate-bounce' : ''}`} />
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-bold text-gray-800">
                  {isDragActive ? '📂 Drop your file here!' : '📊 Upload Your Dataset'}
                </p>
                <p className="text-base text-gray-600">
                  Drag & drop or click to browse
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">CSV, Excel, JSON, Parquet</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">Max 50 MB</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
