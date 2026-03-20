"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  Loader2,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  initialFileName?: string;
}

export function FileUploader({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx", 
  maxSizeMB = 5,
  label = "Upload Document",
  className,
  initialFileName
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
    toast.success("File added successfully");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        className={cn(
          "relative border-2 border-dashed rounded-[20px] p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
          isDragOver ? "border-primary bg-primary/5 scale-[0.99]" : "border-primary/10 hover:border-primary/30 bg-muted/20",
          selectedFile ? "border-emerald-500/30 bg-emerald-500/[0.02]" : ""
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept={accept}
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/5">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-primary/80 mb-1">{label}</p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase opacity-60">
              Drag & Drop or Click to browse (PDF, DOCX up to {maxSizeMB}MB)
            </p>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full px-4 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{selectedFile.name}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mt-0.5">Ready to upload</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {initialFileName && !selectedFile && (
           <div className="absolute bottom-2 right-4 flex items-center gap-1.5 opacity-40">
              <FileText className="w-3 h-3" />
              <span className="text-[9px] font-bold truncate max-w-[120px]">{initialFileName}</span>
           </div>
        )}
      </div>
    </div>
  );
}
