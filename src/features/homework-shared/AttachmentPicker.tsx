"use client";

import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import type { HomeworkAttachment } from "@/entities/homework";
import { Button } from "@/shared/ui/button";
import { useHomeworkUpload } from "@/shared/hooks/useHomeworkUpload";
import { validateUploadFile } from "@/shared/lib/schemas/upload.schema";

function humanSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

type AttachmentPickerProps = {
  value: HomeworkAttachment | null;
  onChange: (value: HomeworkAttachment | null) => void;
  label?: string;
  disabled?: boolean;
};

export function AttachmentPicker({
  value,
  onChange,
  label = "Attach a file",
  disabled,
}: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { upload, uploading, progress } = useHomeworkUpload();

  async function handleFile(file: File) {
    const check = validateUploadFile(file, "homework");
    if (!check.valid) {
      toast.error(check.error);
      return;
    }
    try {
      const result = await upload(file);
      onChange({
        path: result.path,
        name: result.name,
        size: result.size,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{value.name}</span>
          {value.size ? (
            <span className="text-muted-foreground shrink-0 text-xs">
              · {humanSize(value.size)}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange(null)}
          disabled={disabled || uploading}
          aria-label="Remove attachment"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
      className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/30"
      }`}
    >
      <Paperclip className="text-muted-foreground h-5 w-5" />
      <p className="text-muted-foreground text-xs">
        {uploading ? `Uploading… ${progress}%` : "Drag a file here, or"}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      <p className="text-muted-foreground text-[10px]">
        PDF, images, Office docs, up to 25 MB
      </p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.zip,image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
