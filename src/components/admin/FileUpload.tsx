"use client";

import { useState, useRef } from "react";
import { Upload, X, File, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/supabase";

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  children?: React.ReactNode;
}

export default function FileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 5,
  className = "",
  children,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError("");

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      setError("Invalid file type");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      if (result.error) {
        throw new Error(result.error.message);
      }
      if (result.data?.publicUrl) {
        onUpload(result.data.publicUrl);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isImage = accept.includes("image");

  return (
    <div className={`bg-background ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {children ? (
        <div onClick={openFileDialog} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}
            ${uploading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <div className="flex flex-col items-center gap-4">
            {isImage ? (
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            ) : (
              <File className="w-12 h-12 text-muted-foreground" />
            )}

            <div>
              <p className="text-foreground font-medium">
                {uploading
                  ? "Uploading..."
                  : "Drop files here or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isImage ? "Images" : "Files"} up to {maxSize}MB
              </p>
            </div>

            {!uploading && (
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            )}

            {uploading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">
                  Uploading...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-destructive/20 text-destructive text-sm rounded border border-destructive/30 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
