"use client";

import { useState, useRef } from "react";

interface DragDropUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function DragDropUpload({
  onUpload,
  isUploading,
  accept = "image/*",
  maxSize = 5,
  className = ""
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (accept === "image/*" && !file.type.startsWith("image/")) {
      return "Please upload an image file";
    }
    
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  };

  const handleFile = (file: File) => {
    setError("");
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-blue-600">Uploading...</p>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Drop your image here</p>
                <p className="text-xs text-gray-500">or click to browse</p>
              </div>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF, WebP up to {maxSize}MB
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}


