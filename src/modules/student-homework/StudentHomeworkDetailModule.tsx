"use client";

import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

import {
  DueDateLabel,
  HomeworkStatusBadge,
  useHomeworkDetail,
} from "@/entities/homework";
import { AttachmentLink } from "@/features/homework-shared/AttachmentLink";
import { CommentThread } from "@/features/homework-comments/CommentThread";
import { SubmitSolutionDialog } from "@/features/homework-submit/SubmitSolutionDialog";
import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function StudentHomeworkDetailModule({ id }: { id: string }) {
  const { data: a, isLoading, isError } = useHomeworkDetail(id);

  if (isLoading) return <Skeleton className="h-[60vh] w-full" />;
  if (isError || !a) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          Could not load this homework.
        </CardContent>
      </Card>
    );
  }

  const canSubmit = a.status === "assigned" || a.status === "revision_requested";
  const isResubmission = a.submissions.length > 0;
  const latest = a.submissions[0] ?? null;
  const previous = a.submissions.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/student/homework"
            className="text-muted-foreground inline-flex items-center text-xs hover:underline"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Back to homework
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {a.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            From <span className="font-medium">{a.peerName}</span>
          </p>
        </div>
        <HomeworkStatusBadge status={a.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DueDateLabel dueAt={a.due_at} />
          {a.max_score != null ? (
            <p className="text-muted-foreground text-xs">
              Max score: <span className="font-medium">{a.max_score}</span>
            </p>
          ) : null}
          {a.description ? (
            <p className="whitespace-pre-wrap">{a.description}</p>
          ) : (
            <p className="text-muted-foreground text-xs">No description.</p>
          )}
          {a.attachment_url && a.attachment_name ? (
            <AttachmentLink
              path={a.attachment_url}
              name={a.attachment_name}
              size={a.attachment_size}
            />
          ) : null}
        </CardContent>
      </Card>

      {a.rubric && a.rubric.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How this is graded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {a.rubric.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2"
              >
                <span>{c.label}</span>
                <span className="text-muted-foreground text-xs">
                  {c.max_points} pts
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {latest?.grade ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tutor feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              {latest.grade.outcome === "revision_requested" ? (
                <Badge className="bg-danger-bg text-danger">
                  Revision requested
                </Badge>
              ) : (
                <Badge className="bg-success-bg text-success">
                  Graded
                </Badge>
              )}
              {latest.grade.score != null ? (
                <span className="text-lg font-semibold">
                  {latest.grade.score}
                  {a.max_score != null ? (
                    <span className="text-muted-foreground text-sm font-normal">
                      {" "}
                      / {a.max_score}
                    </span>
                  ) : null}
                </span>
              ) : null}
              <span className="text-muted-foreground text-xs">
                {format(new Date(latest.grade.graded_at), "PPp")}
              </span>
            </div>
            {latest.grade.feedback ? (
              <p className="whitespace-pre-wrap">{latest.grade.feedback}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                No written feedback.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Your submissions</CardTitle>
          {canSubmit ? (
            <SubmitSolutionDialog
              assignmentId={a.id}
              isResubmission={isResubmission}
            />
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {a.submissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              You haven&apos;t submitted yet.
            </p>
          ) : (
            <>
              {latest ? (
                <SubmissionRow assignmentMaxScore={a.max_score} s={latest} primary />
              ) : null}
              {previous.length > 0 ? (
                <details className="text-sm">
                  <summary className="text-muted-foreground cursor-pointer text-xs">
                    Previous attempts ({previous.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {previous.map((s) => (
                      <SubmissionRow
                        key={s.id}
                        assignmentMaxScore={a.max_score}
                        s={s}
                      />
                    ))}
                  </div>
                </details>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <CommentThread assignmentId={a.id} initialComments={a.comments} />
    </div>
  );
}

type SubmissionRowProps = {
  s: {
    id: string;
    attempt_no: number;
    submitted_at: string;
    content: string | null;
    attachment_url: string | null;
    attachment_name: string | null;
    attachment_size: number | null;
    isLate?: boolean | undefined;
    grade?:
      | {
          score: number | null;
          outcome: "graded" | "revision_requested";
        }
      | null
      | undefined;
  };
  assignmentMaxScore: number | null;
  primary?: boolean;
};

function SubmissionRow({ s, assignmentMaxScore, primary }: SubmissionRowProps) {
  return (
    <div
      className={`space-y-2 rounded-md border border-border p-3 ${
        primary ? "bg-muted/20" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Attempt {s.attempt_no}</Badge>
          <span className="text-muted-foreground text-xs">
            {format(new Date(s.submitted_at), "PPp")}
          </span>
          {s.isLate ? (
            <Badge className="bg-warning-bg text-warning text-[10px]">Late</Badge>
          ) : null}
        </div>
        {s.grade ? (
          <Badge variant="outline">
            {s.grade.outcome === "revision_requested"
              ? "Revision requested"
              : s.grade.score != null
                ? `Score ${s.grade.score}${
                    assignmentMaxScore != null ? ` / ${assignmentMaxScore}` : ""
                  }`
                : "Graded"}
          </Badge>
        ) : null}
      </div>
      {s.content ? (
        <p className="whitespace-pre-wrap text-sm">{s.content}</p>
      ) : null}
      {s.attachment_url && s.attachment_name ? (
        <AttachmentLink
          path={s.attachment_url}
          name={s.attachment_name}
          size={s.attachment_size}
        />
      ) : null}
    </div>
  );
}
