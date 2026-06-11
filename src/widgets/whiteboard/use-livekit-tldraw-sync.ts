"use client";

import { useDataChannel } from "@livekit/components-react";
import { useCallback, useEffect, useRef } from "react";
import type { Editor } from "tldraw";

type StoreDiff = Parameters<Editor["store"]["applyDiff"]>[0];

/**
 * Two-way sync of a tldraw editor over the LiveKit data channel.
 *
 * Wire protocol (JSON payloads, reliable):
 *   topic "wb-diff"     — { diffs: RecordsDiff[] } user-source changes, batched
 *                         one send per animation frame
 *   topic "wb-request"  — {} broadcast by a joiner who just opened the board
 *   topic "wb-snapshot" — { snapshot: TLEditorSnapshot } reply to "wb-request"
 *
 * Stability is load-bearing here. LiveKit's `useDataChannel` memoizes on the
 * `onMessage` identity, and its internal `useObservableState` re-subscribes —
 * and calls setState(startWith) — every time that identity changes. Passing
 * fresh inline handlers each render therefore remounts the subscription on
 * every render and spins React into "Maximum update depth exceeded". So every
 * handler below is wrapped in `useCallback` with no reactive deps; live values
 * (the editor, the latest `send`) are read through refs instead.
 *
 * Echo safety: inbound diffs are applied inside `store.mergeRemoteChanges`,
 * which tags them `source: "remote"`. Our outbound listener only fires on
 * `source: "user"`, so applied remote changes are never bounced back.
 */
export function useLivekitTldrawSync(editor: Editor | null) {
  const editorRef = useRef<Editor | null>(null);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Inbound: apply remote drawing diffs (a batch of one or more).
  const handleDiff = useCallback((msg: { payload: Uint8Array }) => {
    const target = editorRef.current;
    if (!target) return;
    try {
      const text = new TextDecoder().decode(msg.payload);
      const parsed = JSON.parse(text) as { diffs?: StoreDiff[] };
      if (!parsed.diffs?.length) return;
      target.store.mergeRemoteChanges(() => {
        for (const diff of parsed.diffs as StoreDiff[]) {
          target.store.applyDiff(diff);
        }
      });
    } catch {
      /* ignore malformed */
    }
  }, []);
  const { send: sendDiff } = useDataChannel("wb-diff", handleDiff);

  // Inbound: a full snapshot, sent in reply to our join request. Only adopt it
  // onto an empty board so we never wipe drawings already in progress locally.
  const handleSnapshot = useCallback((msg: { payload: Uint8Array }) => {
    const target = editorRef.current;
    if (!target) return;
    if (target.getCurrentPageShapeIds().size > 0) return;
    try {
      const text = new TextDecoder().decode(msg.payload);
      const parsed = JSON.parse(text) as { snapshot?: unknown };
      if (!parsed.snapshot) return;
      target.loadSnapshot(
        parsed.snapshot as Parameters<typeof target.loadSnapshot>[0]
      );
    } catch {
      /* ignore malformed */
    }
  }, []);
  const { send: sendSnapshot } = useDataChannel("wb-snapshot", handleSnapshot);

  // Keep the latest `sendSnapshot` in a ref so the request handler below can
  // stay referentially stable (empty dep array).
  const sendSnapshotRef = useRef(sendSnapshot);
  useEffect(() => {
    sendSnapshotRef.current = sendSnapshot;
  }, [sendSnapshot]);

  // Inbound: a peer just opened the board and wants the current state. Only the
  // side that actually has shapes answers, so an empty joiner can't clobber a
  // peer who is mid-drawing.
  const handleRequest = useCallback(() => {
    const target = editorRef.current;
    if (!target) return;
    if (target.getCurrentPageShapeIds().size === 0) return;
    const snapshot = target.getSnapshot();
    const payload = new TextEncoder().encode(JSON.stringify({ snapshot }));
    void sendSnapshotRef.current(payload, {
      reliable: true,
      topic: "wb-snapshot",
    }).catch(() => undefined);
  }, []);
  const { send: sendRequest } = useDataChannel("wb-request", handleRequest);

  // Outbound: forward user-source diffs, coalesced into one send per frame so a
  // fast freehand stroke or shape drag doesn't flood the data channel.
  useEffect(() => {
    if (!editor) return;
    let queue: StoreDiff[] = [];
    let raf = 0;

    const flush = () => {
      raf = 0;
      if (queue.length === 0) return;
      const diffs = queue;
      queue = [];
      const payload = new TextEncoder().encode(JSON.stringify({ diffs }));
      void sendDiff(payload, { reliable: true, topic: "wb-diff" }).catch(
        () => undefined
      );
    };

    const unsub = editor.store.listen(
      (entry) => {
        queue.push(entry.changes);
        if (raf === 0) raf = requestAnimationFrame(flush);
      },
      { source: "user", scope: "document" }
    );

    return () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      flush(); // don't strand the final frame's changes
      unsub();
    };
  }, [editor, sendDiff]);

  // On mount, ask whoever is already on the board for their state.
  useEffect(() => {
    if (!editor) return;
    const payload = new TextEncoder().encode("{}");
    void sendRequest(payload, { reliable: true, topic: "wb-request" }).catch(
      () => undefined
    );
  }, [editor, sendRequest]);
}
