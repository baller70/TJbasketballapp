
'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Video, 
  Image, 
  X, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  File,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaUploadProps {
  onUpload: (files: FileUpload[]) => Promise<void>;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function MediaUpload({
  onUpload,
  acceptedTypes = ['video/*', 'image/*'],
  maxFileSize = 50, // 50MB default
  maxFiles = 5,
  disabled = false,
  className = ''
}: MediaUploadProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });
    
    if (!isValidType) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }
    
    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.currentTime = 1;
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
          URL.revokeObjectURL(video.src);
        };
        video.onerror = reject;
      } else {
        resolve('');
      }
    });
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const validFiles: FileUpload[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);
      
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }

      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }

      try {
        const preview = await createPreview(file);
        validFiles.push({
          file,
          preview,
          progress: 0,
          status: 'pending'
        });
      } catch (err) {
        errors.push(`${file.name}: Failed to create preview`);
      }
    }

    if (errors.length > 0) {
      // Show error toast or alert
      console.error('File upload errors:', errors);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles, maxFileSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      await handleFiles(droppedFiles);
    }
  }, [disabled, uploading, handleFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;
    
    setUploading(true);
    
    try {
      await onUpload(files);
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-orange-100 rounded-full">
              <Upload className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload your practice videos or images</h3>
              <p className="text-gray-600 mt-1">
                Drag and drop files here, or click to select files
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Badge variant="outline">Max {maxFiles} files</Badge>
              <Badge variant="outline">Up to {maxFileSize}MB each</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {files.map((fileUpload, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Preview */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {fileUpload.preview ? (
                          <img 
                            src={fileUpload.preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getFileIcon(fileUpload.file)
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1">
                        <h4 className="font-medium truncate">{fileUpload.file.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(fileUpload.file.size)}
                        </p>
                        
                        {/* Progress */}
                        {fileUpload.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={fileUpload.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              {fileUpload.progress}% uploaded
                            </p>
                          </div>
                        )}

                        {/* Status Messages */}
                        {fileUpload.status === 'error' && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {fileUpload.error || 'Upload failed'}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Status Icon */}
                      <div className="flex items-center gap-2">
                        {fileUpload.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {fileUpload.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        
                        {/* Remove Button */}
                        {fileUpload.status !== 'uploading' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} file{files.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}
