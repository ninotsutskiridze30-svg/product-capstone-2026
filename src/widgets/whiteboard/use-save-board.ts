"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Editor } from "tldraw";

import { messageKeys } from "@/entities/message/api/message.query";

/**
 * Save the current whiteboard to chat (PNG preview + tldraw snapshot).
 *
 * Shared by the manual Save button and the auto-save-on-close path. Pass
 * `{ silent: true }` for auto-save so closing an empty board doesn't nag with a
 * toast; a successful save still confirms either way.
 *
 * Returns whether a snapshot was actually written so callers can clear their
 * "unsaved changes" flag.
 */
export function useSaveBoard(editor: Editor | null, callId: string) {
  const t = useTranslations("call");
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const save = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}): Promise<boolean> => {
      if (!editor) return false;
      const shapeIds = Array.from(editor.getCurrentPageShapeIds());
      if (shapeIds.length === 0) {
        if (!silent) toast.info(t("boardEmpty"));
        return false;
      }
      setBusy(true);
      try {
        const image = await editor.toImage(shapeIds, {
          format: "png",
          background: true,
          padding: 24,
        });
        const snapshot = editor.getSnapshot();

        const form = new FormData();
        form.append("image", image.blob, "board.png");
        form.append(
          "snapshot",
          new Blob([JSON.stringify(snapshot)], { type: "application/json" }),
          "board.json"
        );
        form.append("callSessionId", callId);

        const response = await fetch("/api/whiteboard-snapshots", {
          method: "POST",
          credentials: "include",
          body: form,
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? "Save failed");
        }
        const json = (await response.json()) as {
          message: { conversation_id: string };
        };
        // Refresh the chat panel for whoever has it open.
        queryClient.invalidateQueries({
          queryKey: messageKeys.conversation(json.message.conversation_id),
        });
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });

        toast.success(t("boardSaved"));
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("saveFailed"));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [editor, callId, t, queryClient]
  );

  return { save, busy };
}
