"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";
import { Attachment } from "@/lib/types/ticket";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  files: Attachment[];
  onChange: (files: Attachment[]) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({ files, onChange, maxFiles = 3, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newAttachments: Attachment[] = [];

    Array.from(fileList).forEach((file, index) => {
      if (files.length + newAttachments.length >= maxFiles) return;

      const isImg = file.type.startsWith("image/");
      const sizeFormatted =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      newAttachments.push({
        id: `att-custom-${Date.now()}-${index}`,
        name: file.name,
        size: sizeFormatted,
        url: URL.createObjectURL(file),
        type: isImg ? "image" : "file",
      });
    });

    if (newAttachments.length > 0) {
      onChange([...files, ...newAttachments]);
    }
  };

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors bg-white",
          isDragging
            ? "border-sky-500 bg-sky-50/50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,.pdf,.log,.txt"
        />
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <UploadCloud className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            Click to upload or drag & drop screenshots / logs
          </p>
          <p className="text-xs text-slate-400">
            PNG, JPG, PDF up to 10MB (max {maxFiles} files)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {file.type === "image" ? (
                  <ImageIcon className="w-4 h-4 text-sky-600 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="font-medium text-slate-700 truncate max-w-[160px]">
                  {file.name}
                </span>
                <span className="text-slate-400 shrink-0">({file.size})</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
