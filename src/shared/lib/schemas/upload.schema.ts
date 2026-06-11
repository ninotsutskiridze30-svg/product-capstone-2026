import { z } from "zod";

export const uploadBucketSchema = z.enum([
  "avatars",
  "covers",
  "gallery",
  "certificates",
  "homework",
]);

export const uploadPayloadSchema = z.object({
  bucket: uploadBucketSchema,
  path: z.string().trim().max(200).optional(),
});

export const maxImageUploadSize = 5 * 1024 * 1024;
export const maxHomeworkUploadSize = 25 * 1024 * 1024;
export const maxUploadSize = maxImageUploadSize;

const HOMEWORK_MIME_ALLOWLIST = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/csv",
];

export type UploadBucket = z.infer<typeof uploadBucketSchema>;

export function validateUploadFile(
  file: File,
  bucket: UploadBucket = "avatars"
) {
  if (bucket === "homework") {
    const isImage = file.type.startsWith("image/");
    const isAllowed = isImage || HOMEWORK_MIME_ALLOWLIST.includes(file.type);
    if (!isAllowed) {
      return {
        valid: false,
        error: "Unsupported file type for homework",
      } as const;
    }
    if (file.size > maxHomeworkUploadSize) {
      return {
        valid: false,
        error: "File size must be 25 MB or less",
      } as const;
    }
    return { valid: true } as const;
  }

  const mimeOk = file.type.startsWith("image/");
  const sizeOk = file.size <= maxImageUploadSize;

  if (!mimeOk) {
    return { valid: false, error: "Only image files are allowed" } as const;
  }

  if (!sizeOk) {
    return { valid: false, error: "File size must be 5 MB or less" } as const;
  }

  return { valid: true } as const;
}

export type UploadPayloadInput = z.infer<typeof uploadPayloadSchema>;
