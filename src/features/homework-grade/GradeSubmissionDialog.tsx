"use client";

import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useGradeHomework,
  type HomeworkAiReview,
  type RubricCriterion,
} from "@/entities/homework";
import type { GradePerCriterion } from "@/entities/homework";
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

type GradeSubmissionDialogProps = {
  assignmentId: string;
  submissionId: string;
  maxScore: number | null;
  initialScore?: number | null;
  initialFeedback?: string | null;
  rubric?: RubricCriterion[] | undefined;
  initialCriteria?: GradePerCriterion[] | null;
  aiReview?: HomeworkAiReview | null;
  trigger?: React.ReactNode;
  onDone?: () => void;
};

function initialCriteriaState(
  rubric: RubricCriterion[],
  initial: GradePerCriterion[] | null | undefined
): Record<string, string> {
  const byId = new Map((initial ?? []).map((c) => [c.criterion_id ?? "", c]));
  const out: Record<string, string> = {};
  for (const c of rubric) {
    const match = byId.get(c.id);
    out[c.id] = match ? String(match.points_awarded) : "";
  }
  return out;
}

export function GradeSubmissionDialog({
  assignmentId,
  submissionId,
  maxScore,
  initialScore,
  initialFeedback,
  rubric,
  initialCriteria,
  aiReview,
  trigger,
  onDone,
}: GradeSubmissionDialogProps) {
  const hasRubric = Boolean(rubric && rubric.length > 0);
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<string>(
    initialScore != null ? String(initialScore) : ""
  );
  const [feedback, setFeedback] = useState<string>(initialFeedback ?? "");
  const [criteria, setCriteria] = useState<Record<string, string>>(() =>
    rubric ? initialCriteriaState(rubric, initialCriteria) : {}
  );
  // When a rubric exists, the total auto-sums from criteria unless the tutor
  // explicitly takes over the headline number.
  const [manualTotal, setManualTotal] = useState<boolean>(!hasRubric);
  const grade = useGradeHomework(assignmentId);

  const criterionSum =
    rubric?.reduce((acc, c) => acc + (Number(criteria[c.id]) || 0), 0) ?? 0;
  const effectiveScore = hasRubric && !manualTotal ? String(criterionSum) : score;
  const aiSuggestable = aiReview?.status === "complete";

  function applyAiSuggestion() {
    if (!aiReview) return;
    if (aiReview.draft_feedback) setFeedback(aiReview.draft_feedback);
    if (hasRubric && rubric && aiReview.per_criterion) {
      const next: Record<string, string> = { ...criteria };
      for (const c of rubric) {
        const match = aiReview.per_criterion.find(
          (p) => p.criterion_id === c.id || p.label === c.label
        );
        if (match) next[c.id] = String(match.points_awarded);
      }
      setCriteria(next);
      setManualTotal(false);
    } else if (aiReview.suggested_score != null) {
      setScore(String(aiReview.suggested_score));
      setManualTotal(true);
    }
    toast.success("AI suggestion applied — edit freely before saving");
  }

  async function send(outcome: "graded" | "revision_requested") {
    const parsedScore =
      hasRubric && !manualTotal
        ? criterionSum
        : effectiveScore.trim() === ""
          ? null
          : Number(effectiveScore);

    if (parsedScore !== null && Number.isNaN(parsedScore)) {
      toast.error("Score must be a number");
      return;
    }
    if (
      outcome === "graded" &&
      parsedScore !== null &&
      maxScore != null &&
      parsedScore > maxScore
    ) {
      toast.error(`Score cannot exceed ${maxScore}`);
      return;
    }
    let perCriterion: GradePerCriterion[] | null = null;
    if (hasRubric && rubric) {
      for (const c of rubric) {
        const awarded = Number(criteria[c.id]) || 0;
        if (awarded > c.max_points) {
          toast.error(`"${c.label}" cannot exceed ${c.max_points}`);
          return;
        }
      }
      perCriterion = rubric.map((c) => ({
        criterion_id: c.id,
        label: c.label,
        points_awarded: Number(criteria[c.id]) || 0,
        max_points: c.max_points,
      }));
    }

    try {
      await grade.mutateAsync({
        submissionId,
        outcome,
        score: parsedScore,
        feedback: feedback.trim() ? feedback.trim() : null,
        perCriterion,
        aiReviewId: aiReview?.id ?? null,
      });
      toast.success(
        outcome === "graded" ? "Grade saved" : "Revision requested"
      );
      setOpen(false);
      onDone?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <CheckCircle2 className="mr-1 h-4 w-4" /> Grade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Grade submission</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto py-2">
          {aiSuggestable ? (
            <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-border p-2">
              <span className="text-muted-foreground text-xs">
                <Sparkles className="mr-1 inline h-3 w-3" />
                AI suggested{" "}
                <span className="text-foreground font-medium">
                  {aiReview?.suggested_score ?? "—"}
                  {maxScore != null && aiReview?.suggested_score != null
                    ? ` / ${maxScore}`
                    : ""}
                </span>
              </span>
              <Button type="button" size="xs" variant="outline" onClick={applyAiSuggestion}>
                Use AI suggestion
              </Button>
            </div>
          ) : null}

          {hasRubric && rubric ? (
            <div className="space-y-2">
              <Label>Rubric</Label>
              <div className="space-y-2">
                {rubric.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{c.label}</p>
                      {c.description ? (
                        <p className="text-muted-foreground truncate text-xs">
                          {c.description}
                        </p>
                      ) : null}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={c.max_points}
                      step="0.5"
                      value={criteria[c.id] ?? ""}
                      onChange={(e) =>
                        setCriteria((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="w-20"
                    />
                    <span className="text-muted-foreground w-12 text-xs">
                      / {c.max_points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="g-score">
                Score {maxScore != null ? `(out of ${maxScore})` : "(optional)"}
              </Label>
              {hasRubric ? (
                <button
                  type="button"
                  className="text-muted-foreground text-xs hover:underline"
                  onClick={() => {
                    if (!manualTotal) setScore(String(criterionSum));
                    setManualTotal((v) => !v);
                  }}
                >
                  {manualTotal ? "Use rubric total" : "Adjust total manually"}
                </button>
              ) : null}
            </div>
            <Input
              id="g-score"
              type="number"
              min={0}
              step="0.5"
              value={effectiveScore}
              readOnly={hasRubric && !manualTotal}
              onChange={(e) => {
                setScore(e.target.value);
                if (hasRubric) setManualTotal(true);
              }}
              placeholder="Leave blank for qualitative-only feedback"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-feedback">Feedback</Label>
            <Textarea
              id="g-feedback"
              rows={6}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What was strong? What to improve?"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void send("revision_requested")}
            disabled={grade.isPending}
          >
            <RotateCcw className="mr-1 h-4 w-4" /> Request revision
          </Button>
          <Button
            type="button"
            onClick={() => void send("graded")}
            disabled={grade.isPending}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            {grade.isPending ? "Saving…" : "Save grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
