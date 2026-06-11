"use client";

import "tldraw/tldraw.css";

import { Tldraw, type Editor, type TLUiComponents } from "tldraw";
import { Grid3x3, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

import { StemToolbar } from "./stem-toolbar";
import { useLivekitTldrawSync } from "./use-livekit-tldraw-sync";
import { useSaveBoard } from "./use-save-board";

type Props = {
  callId: string;
  onClose: () => void;
};

// Strip the chrome we don't need but keep what teaching relies on:
//   Toolbar    → our curated STEM tool set (StemToolbar, left-docked)
//   StylePanel → pen colour + width
//   MenuPanel  → undo/redo (QuickActions) live here; left default so they show
const UI_COMPONENTS: TLUiComponents = {
  MainMenu: null,
  PageMenu: null,
  ActionsMenu: null,
  HelpMenu: null,
  ZoomMenu: null,
  NavigationPanel: null,
  Minimap: null,
  DebugPanel: null,
  DebugMenu: null,
  SharePanel: null,
  TopPanel: null,
  PeopleMenu: null,
  HelperButtons: null,
  Toolbar: StemToolbar,
};

export function Whiteboard({ callId, onClose }: Props) {
  const t = useTranslations("call");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [gridOn, setGridOn] = useState(true);
  const { save, busy } = useSaveBoard(editor, callId);
  const dirtyRef = useRef(false);

  useLivekitTldrawSync(editor);

  const handleMount = useCallback((next: Editor) => {
    setEditor(next);
    // STEM defaults: graph-paper grid on, freehand draw selected. (tldraw's
    // default pen is already black/medium on a light canvas, so no override.)
    next.updateInstanceState({ isGridMode: true });
    next.setCurrentTool("draw");
  }, []);

  // Track unsaved user changes so auto-save can skip a no-op and we don't write
  // a duplicate snapshot when nothing changed since the last save.
  useEffect(() => {
    if (!editor) return;
    const unsub = editor.store.listen(
      () => {
        dirtyRef.current = true;
      },
      { source: "user", scope: "document" }
    );
    return unsub;
  }, [editor]);

  const handleSave = useCallback(
    async (opts?: { silent?: boolean }) => {
      const saved = await save(opts);
      if (saved) dirtyRef.current = false;
      return saved;
    },
    [save]
  );

  const toggleGrid = useCallback(() => {
    if (!editor) return;
    const next = !editor.getInstanceState().isGridMode;
    editor.updateInstanceState({ isGridMode: next });
    setGridOn(next);
  }, [editor]);

  // Auto-save on close: the person who closes the board archives it to chat so
  // the work isn't lost. The peer only receives the toggle and unmounts, so a
  // single snapshot is written. Close anyway if the save fails.
  const handleClose = useCallback(async () => {
    if (dirtyRef.current) await handleSave({ silent: true });
    onClose();
  }, [handleSave, onClose]);

  return (
    <div className="relative h-full w-full">
      <Tldraw
        onMount={handleMount}
        components={UI_COMPONENTS}
        // A stable persistenceKey would cache the doc locally; we want each
        // call to start clean, so we leave it unset and rely on data-channel
        // sync for state.
      />

      {/* Board actions, centered up top to clear tldraw's own zones: undo/redo
          sit top-left, the style panel top-right, the tool dock on the left. */}
      <div className="pointer-events-none absolute top-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        <button
          type="button"
          onClick={toggleGrid}
          aria-pressed={gridOn}
          title={t("grid")}
          className={cn(
            "pointer-events-auto flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-white shadow-sm transition-colors",
            gridOn
              ? "bg-brand-primary hover:opacity-90"
              : "bg-neutral-900/80 hover:bg-neutral-800"
          )}
        >
          <Grid3x3 size={16} />
          {t("grid")}
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!editor || busy}
          className="pointer-events-auto flex items-center gap-2 rounded-md bg-neutral-900/80 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
        >
          <Save size={16} />
          {t("saveBoard")}
        </button>
        <button
          type="button"
          onClick={() => void handleClose()}
          disabled={busy}
          className="pointer-events-auto rounded-md bg-neutral-900/80 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
        >
          {t("closeWhiteboard")}
        </button>
      </div>
    </div>
  );
}
