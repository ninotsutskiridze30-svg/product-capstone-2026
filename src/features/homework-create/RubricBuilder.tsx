"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export type RubricDraftRow = { key: string; label: string; maxPoints: string };

export function newRubricRow(): RubricDraftRow {
  return { key: crypto.randomUUID(), label: "", maxPoints: "" };
}

export function RubricBuilder({
  rows,
  onChange,
}: {
  rows: RubricDraftRow[];
  onChange: (rows: RubricDraftRow[]) => void;
}) {
  const total = rows.reduce((s, r) => s + (Number(r.maxPoints) || 0), 0);

  function update(key: string, patch: Partial<RubricDraftRow>) {
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function remove(key: string) {
    onChange(rows.filter((r) => r.key !== key));
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-2">
          <Input
            placeholder="Criterion (e.g. Correctness)"
            value={r.label}
            onChange={(e) => update(r.key, { label: e.target.value })}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            step="0.5"
            placeholder="Pts"
            value={r.maxPoints}
            onChange={(e) => update(r.key, { maxPoints: e.target.value })}
            className="w-20"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(r.key)}
            aria-label="Remove criterion"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...rows, newRubricRow()])}
        >
          <Plus className="mr-1 h-3 w-3" /> Add criterion
        </Button>
        {rows.length > 0 ? (
          <span className="text-muted-foreground text-xs">Total: {total} pts</span>
        ) : null}
      </div>
    </div>
  );
}

/** Convert UI rows into the API rubric input shape (drops empty rows). */
export function rubricRowsToInput(
  rows: RubricDraftRow[]
): { label: string; maxPoints: number }[] {
  return rows
    .map((r) => ({ label: r.label.trim(), maxPoints: Number(r.maxPoints) }))
    .filter((r) => r.label.length > 0 && Number.isFinite(r.maxPoints) && r.maxPoints > 0);
}
