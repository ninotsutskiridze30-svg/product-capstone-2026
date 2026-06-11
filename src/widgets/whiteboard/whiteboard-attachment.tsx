"use client";

import { Download, Image as ImageIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { callApi } from "@/entities/call/api/call.api";
import { cn } from "@/shared/lib/utils";

type Props = {
  snapshotId: string;
  className?: string;
};

/**
 * Renders a saved whiteboard inside a chat message. Lazily fetches signed URLs
 * so we don't request signing for every message in the conversation list.
 */
export function WhiteboardAttachment({ snapshotId, className }: Props) {
  const t = useTranslations("call");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    callApi
      .getSnapshotUrls(snapshotId)
      .then((urls) => {
        if (cancelled) return;
        setImageUrl(urls.imageUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [snapshotId]);

  return (
    <>
      <button
        type="button"
        onClick={() => imageUrl && setOpen(true)}
        className={cn(
          "border-border bg-surface group flex w-full max-w-[260px] flex-col overflow-hidden rounded-lg border text-left transition-shadow hover:shadow-md",
          className
        )}
        disabled={!imageUrl}
      >
        <div className="bg-muted relative aspect-video w-full">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={t("savedWhiteboard")}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              <ImageIcon size={24} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 text-xs">
          <ImageIcon size={14} className="text-muted-foreground" />
          <span>{error ? t("snapshotLoadFailed") : t("savedWhiteboard")}</span>
        </div>
      </button>

      {open && imageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={t("savedWhiteboard")}
              className="max-h-[90vh] max-w-[90vw] rounded-md bg-white object-contain"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <a
                href={imageUrl}
                download="whiteboard.png"
                className="flex items-center gap-1 rounded-md bg-neutral-900/80 px-3 py-1.5 text-xs text-white hover:bg-neutral-800"
              >
                <Download size={14} />
                {t("download")}
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-md bg-neutral-900/80 p-1.5 text-white hover:bg-neutral-800"
                aria-label={t("close")}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
