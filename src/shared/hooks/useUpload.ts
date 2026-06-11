"use client";

import { useCallback, useState } from "react";

export type UploadBucket = "avatars" | "covers" | "gallery" | "certificates";

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    (file: File, bucket: UploadBucket, path?: string) => {
      setError(null);
      setProgress(0);
      setUploading(true);

      return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const form = new FormData();
        form.append("file", file);
        form.append("bucket", bucket);
        if (path) form.append("path", path);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };

        xhr.onerror = () => {
          setUploading(false);
          const msg = "Network error";
          setError(msg);
          reject(new Error(msg));
        };

        xhr.onload = () => {
          setUploading(false);
          try {
            const body = JSON.parse(xhr.responseText) as {
              url?: string;
              error?: string;
            };
            if (xhr.status >= 200 && xhr.status < 300 && body.url) {
              setProgress(100);
              resolve(body.url);
              return;
            }
            const msg = body.error ?? `Upload failed (${xhr.status})`;
            setError(msg);
            reject(new Error(msg));
          } catch {
            const msg = "Invalid response";
            setError(msg);
            reject(new Error(msg));
          }
        };

        xhr.open("POST", "/api/upload");
        xhr.send(form);
      });
    },
    []
  );

  return { upload, uploading, error, progress };
}
