'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function UploadDropzone({
  onFile,
  accept,
  label,
  hint,
  preview,
}: {
  onFile: (file: File) => void;
  accept?: Record<string, string[]>;
  label?: string;
  hint?: string;
  preview?: string;
}) {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onFile(files[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {preview ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxHeight: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <span className="dropzone-text">Click or drag to replace</span>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '2rem', opacity: 0.4 }}>📁</div>
          <p className="dropzone-text">{label || 'Click or drag file to upload'}</p>
          <p className="dropzone-hint">{hint || 'Max 10MB · PNG, JPG, SVG, PDF'}</p>
        </>
      )}
    </div>
  );
}
