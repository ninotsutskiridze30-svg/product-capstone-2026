"use client";

import { Download, Paperclip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { homeworkApi } from "@/entities/homework";
import { Button } from "@/shared/ui/button";

type AttachmentLinkProps = {
  path: string;
  name: string;
  size?: number | null;
};

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

export function AttachmentLink({ path, name, size }: AttachmentLinkProps) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const { url } = await homeworkApi.signFile(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open file");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Paperclip className="h-4 w-4 shrink-0" />
        <span className="truncate">{name}</span>
        {size ? (
          <span className="text-muted-foreground shrink-0 text-xs">
            · {humanSize(size)}
          </span>
        ) : null}
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => void open()}
        disabled={loading}
      >
        <Download className="mr-1 h-4 w-4" />
        {loading ? "Opening…" : "Open"}
      </Button>
    </div>
  );
}
