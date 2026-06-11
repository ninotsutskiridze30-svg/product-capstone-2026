"use client";

import {
  ArrowToolbarItem,
  DefaultToolbar,
  DrawToolbarItem,
  EllipseToolbarItem,
  EraserToolbarItem,
  LineToolbarItem,
  RectangleToolbarItem,
  SelectToolbarItem,
  TextToolbarItem,
} from "tldraw";

/**
 * Curated whiteboard toolbar for math & physics tutoring.
 *
 * Keeps the tools teachers actually reach for — select, freehand draw, eraser,
 * rectangle, ellipse, straight line, arrow, and keyboard text — and drops
 * tldraw's stickies, frames, laser, highlighter and the exotic geo shapes to
 * keep the surface uncluttered. Every tool keeps its native keyboard shortcut
 * (V, D, E, R, O, L, A, T), and DefaultToolbar still renders the tool-lock
 * toggle and overflow handling for us.
 *
 * Docked vertically on the left: tldraw's `--vertical` styles pin it to the
 * left edge, which keeps it clear of the call control dock (mic/cam/leave)
 * that sits bottom-center over the board.
 */
export function StemToolbar() {
  return (
    <DefaultToolbar orientation="vertical">
      <SelectToolbarItem />
      <DrawToolbarItem />
      <EraserToolbarItem />
      <RectangleToolbarItem />
      <EllipseToolbarItem />
      <LineToolbarItem />
      <ArrowToolbarItem />
      <TextToolbarItem />
    </DefaultToolbar>
  );
}
