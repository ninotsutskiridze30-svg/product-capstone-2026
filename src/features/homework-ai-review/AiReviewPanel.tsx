"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  useHomeworkAiReview,
  useReanalyzeHomework,
  type HomeworkAiReview,
  type AiOriginality,
} from "@/entities/homework";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

type AiReviewPanelProps = {
  assignmentId: string;
  submissionId: string;
  maxScore: number | null;
  /** Latest review embedded in the detail payload, used until the live query resolves. */
  initialReview?: HomeworkAiReview | null;
};

const LIKELIHOOD_LABEL: Record<AiOriginality["likelihood_ai_generated"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function OriginalityIndicator({ originality }: { originality: AiOriginality }) {
  const level = originality.likelihood_ai_generated;
  // Deliberately warning tones, never red/danger — this is a signal, not an accusation.
  const tone =
    level === "low"
      ? "bg-muted text-muted-foreground"
      : "bg-warning-bg text-warning";

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
          AI-authorship signal
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
        >
          {LIKELIHOOD_LABEL[level]} likelihood
        </span>
        <span className="text-muted-foreground text-xs">
          {originality.confidence} confidence
        </span>
      </div>
      <details className="text-xs">
        <summary className="text-muted-foreground cursor-pointer select-none hover:underline">
          Why this estimate
        </summary>
        <p className="mt-1 whitespace-pre-wrap">{originality.reasoning}</p>
        {originality.signals.length > 0 ? (
          <ul className="text-muted-foreground mt-1 list-disc pl-4">
            {originality.signals.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : null}
      </details>
      <p className="text-muted-foreground text-[11px] italic">
        Detection is imperfect and can be wrong. Treat this as a prompt to look
        closer, not proof — you decide.
      </p>
    </div>
  );
}

export function AiReviewPanel({
  assignmentId,
  submissionId,
  maxScore,
  initialReview,
}: AiReviewPanelProps) {
  const { data, isLoading } = useHomeworkAiReview(assignmentId, submissionId);
  const reanalyze = useReanalyzeHomework(assignmentId);

  const review = data?.items?.[0] ?? initialReview ?? null;
  const status = review?.status ?? null;

  async function onReanalyze() {
    try {
      await reanalyze.mutateAsync(submissionId);
      toast.success("Re-analysis started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start analysis");
    }
  }

  const busy =
    reanalyze.isPending || status === "pending" || status === "running";

  return (
    <div className="space-y-3 rounded-md border border-dashed border-border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">AI review</span>
          <Badge variant="secondary" className="text-[10px]">
            Private · not shown to student
          </Badge>
        </div>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => void onReanalyze()}
          disabled={busy}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          {status == null ? "Analyze with AI" : "Re-analyze"}
        </Button>
      </div>

      <p className="text-muted-foreground text-[11px]">
        AI suggestions are a starting point. You decide the final grade and
        feedback.
      </p>

      {/* Loading the dedicated query for the first time, with nothing embedded. */}
      {isLoading && !review ? (
        <Skeleton className="h-20 w-full" />
      ) : status == null ? (
        <p className="text-muted-foreground text-xs">
          Not analyzed yet.
        </p>
      ) : status === "pending" || status === "running" ? (
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing submission…
        </div>
      ) : status === "skipped" ? (
        <p className="text-muted-foreground text-xs">
          {review?.error ?? "AI review was skipped for this submission."}
        </p>
      ) : status === "failed" ? (
        <div className="space-y-1">
          <div className="text-warning flex items-center gap-2 text-xs font-medium">
            <AlertTriangle className="h-3.5 w-3.5" /> Couldn&apos;t analyze
            automatically
          </div>
          {review?.error ? (
            <details className="text-muted-foreground text-[11px]">
              <summary className="cursor-pointer select-none hover:underline">
                Details
              </summary>
              <p className="mt-1 whitespace-pre-wrap">{review.error}</p>
            </details>
          ) : null}
        </div>
      ) : review ? (
        <div className="space-y-3">
          {review.originality ? (
            <OriginalityIndicator originality={review.originality} />
          ) : null}

          {review.suggested_score != null ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {review.suggested_score}
                {maxScore != null ? (
                  <span className="text-muted-foreground text-sm font-normal">
                    {" "}
                    / {maxScore}
                  </span>
                ) : null}
              </span>
              <Badge variant="outline" className="text-[10px]">
                Suggested score
              </Badge>
            </div>
          ) : null}

          {review.per_criterion && review.per_criterion.length > 0 ? (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold">
                By criterion
              </p>
              <ul className="space-y-1">
                {review.per_criterion.map((c, i) => (
                  <li key={c.criterion_id ?? i} className="text-xs">
                    <span className="font-medium">{c.label}</span>{" "}
                    <span className="text-muted-foreground">
                      {c.points_awarded} / {c.max_points}
                    </span>
                    {c.justification ? (
                      <p className="text-muted-foreground">{c.justification}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {review.strengths && review.strengths.length > 0 ? (
            <div className="space-y-0.5">
              {review.strengths.map((s, i) => (
                <p key={i} className="flex items-start gap-1.5 text-xs">
                  <CheckCircle2 className="text-success mt-0.5 h-3 w-3 shrink-0" />
                  <span>{s}</span>
                </p>
              ))}
            </div>
          ) : null}

          {review.issues && review.issues.length > 0 ? (
            <div className="space-y-0.5">
              {review.issues.map((s, i) => (
                <p key={i} className="flex items-start gap-1.5 text-xs">
                  <AlertTriangle className="text-warning mt-0.5 h-3 w-3 shrink-0" />
                  <span>{s}</span>
                </p>
              ))}
            </div>
          ) : null}

          {review.draft_feedback ? (
            <div className="bg-background/60 rounded-md border border-border p-2">
              <p className="text-muted-foreground mb-1 text-[11px] font-semibold">
                Draft feedback (editable in the grade dialog)
              </p>
              <p className="whitespace-pre-wrap text-xs">
                {review.draft_feedback}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
