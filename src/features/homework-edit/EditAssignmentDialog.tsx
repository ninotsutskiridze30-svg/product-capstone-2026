"use client";

import { format } from "date-fns";
import { Lock, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useUpdateHomework,
  type HomeworkAssignmentDetail,
} from "@/entities/homework";
import {
  RubricBuilder,
  rubricRowsToInput,
  type RubricDraftRow,
} from "@/features/homework-create/RubricBuilder";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  try {
    return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

export function EditAssignmentDialog({ a }: { a: HomeworkAssignmentDetail }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateHomework(a.id);

  const [title, setTitle] = useState(a.title);
  const [description, setDescription] = useState(a.description ?? "");
  const [dueAt, setDueAt] = useState(toLocalInput(a.due_at));
  const [maxScore, setMaxScore] = useState(
    a.max_score != null ? String(a.max_score) : ""
  );
  const [rubricRows, setRubricRows] = useState<RubricDraftRow[]>(
    (a.rubric ?? []).map((c) => ({
      key: c.id,
      label: c.label,
      maxPoints: String(c.max_points),
    }))
  );
  const [answerKey, setAnswerKey] = useState(a.grading?.answer_key ?? "");
  const [gradingNotes, setGradingNotes] = useState(
    a.grading?.grading_notes ?? ""
  );

  async function submit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const parsedScore = maxScore.trim() ? Number(maxScore) : null;
    if (parsedScore !== null && (Number.isNaN(parsedScore) || parsedScore <= 0)) {
      toast.error("Max score must be a positive number");
      return;
    }
    try {
      await update.mutateAsync({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        maxScore: parsedScore,
        rubric: rubricRowsToInput(rubricRows),
        answerKey: answerKey.trim() ? answerKey.trim() : null,
        gradingNotes: gradingNotes.trim() ? gradingNotes.trim() : null,
      });
      toast.success("Homework updated");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="mr-1 h-3 w-3" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit homework</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto py-2">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="e-title">Title</Label>
              <Input
                id="e-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-due">Due date</Label>
              <Input
                id="e-due"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-desc">Description</Label>
            <Textarea
              id="e-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-max">Max score (optional)</Label>
            <Input
              id="e-max"
              type="number"
              min={0}
              step="0.5"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
            />
          </div>

          <details className="rounded-md border border-border p-3" open={rubricRows.length > 0}>
            <summary className="cursor-pointer select-none text-sm font-medium">
              Rubric (optional)
            </summary>
            <p className="text-muted-foreground mb-2 mt-1 text-xs">
              Shown to the student and used to guide AI grading.
            </p>
            <RubricBuilder rows={rubricRows} onChange={setRubricRows} />
          </details>

          <details
            className="bg-muted/30 rounded-md border border-border p-3"
            open={Boolean(answerKey || gradingNotes)}
          >
            <summary className="cursor-pointer select-none text-sm font-medium">
              <Lock className="mr-1 inline h-3 w-3" /> Private answer key &amp;
              notes (optional)
            </summary>
            <p className="text-muted-foreground mb-2 mt-1 text-xs">
              Only you can see this. It guides AI grading and is never shown to
              the student.
            </p>
            <div className="space-y-2">
              <Textarea
                rows={4}
                value={answerKey}
                onChange={(e) => setAnswerKey(e.target.value)}
                placeholder="Model solution / answer key…"
              />
              <Textarea
                rows={2}
                value={gradingNotes}
                onChange={(e) => setGradingNotes(e.target.value)}
                placeholder="Extra grading instructions for the AI…"
              />
            </div>
          </details>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={update.isPending}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
