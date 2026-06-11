"use client";

import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

import {
  DueDateLabel,
  HomeworkStatusBadge,
  useHomeworkDetail,
} from "@/entities/homework";
import { AttachmentLink } from "@/features/homework-shared/AttachmentLink";
import { AiReviewPanel } from "@/features/homework-ai-review/AiReviewPanel";
import { CommentThread } from "@/features/homework-comments/CommentThread";
import { EditAssignmentDialog } from "@/features/homework-edit/EditAssignmentDialog";
import { GradeSubmissionDialog } from "@/features/homework-grade/GradeSubmissionDialog";
import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function TutorHomeworkDetailModule({ id }: { id: string }) {
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

  const latest = a.submissions[0] ?? null;
  const latestNeedsGrading = latest && !latest.grade;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/tutor/homework"
            className="text-muted-foreground inline-flex items-center text-xs hover:underline"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Back to homework
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {a.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            For <span className="font-medium">{a.peerName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {a.status === "assigned" ? <EditAssignmentDialog a={a} /> : null}
          <HomeworkStatusBadge status={a.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
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
            <p className="text-muted-foreground text-xs">
              Assigned {format(new Date(a.created_at), "PPp")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Submissions{" "}
              <span className="text-muted-foreground text-xs font-normal">
                ({a.submissions.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {a.submissions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Student hasn&apos;t submitted yet.
              </p>
            ) : (
              a.submissions.map((s) => (
                <div
                  key={s.id}
                  className="space-y-2 rounded-md border border-border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Attempt {s.attempt_no}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {format(new Date(s.submitted_at), "PPp")}
                      </span>
                      {s.isLate ? (
                        <Badge className="bg-warning-bg text-warning text-[10px]">
                          Late
                        </Badge>
                      ) : null}
                    </div>
                    {s.grade ? (
                      <Badge variant="outline">
                        {s.grade.outcome === "revision_requested"
                          ? "Revision requested"
                          : s.grade.score != null
                            ? `Score ${s.grade.score}${
                                a.max_score != null ? ` / ${a.max_score}` : ""
                              }`
                            : "Graded"}
                      </Badge>
                    ) : (
                      <Badge className="bg-warning-bg text-warning">
                        Awaiting grading
                      </Badge>
                    )}
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
                  {s.grade?.feedback ? (
                    <div className="bg-muted/50 rounded-md p-2 text-sm">
                      <p className="text-muted-foreground mb-1 text-xs font-semibold">
                        Your feedback
                      </p>
                      <p className="whitespace-pre-wrap">{s.grade.feedback}</p>
                    </div>
                  ) : null}

                  <AiReviewPanel
                    assignmentId={a.id}
                    submissionId={s.id}
                    maxScore={a.max_score}
                    initialReview={s.aiReview ?? null}
                  />

                  <div>
                    <GradeSubmissionDialog
                      assignmentId={a.id}
                      submissionId={s.id}
                      maxScore={a.max_score}
                      initialScore={s.grade?.score ?? null}
                      initialFeedback={s.grade?.feedback ?? null}
                      rubric={a.rubric}
                      initialCriteria={s.grade?.per_criterion ?? null}
                      aiReview={s.aiReview ?? null}
                      trigger={
                        <Button size="sm" variant={s.grade ? "outline" : "default"}>
                          {s.grade ? "Edit grade" : "Grade"}
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))
            )}
            {latestNeedsGrading ? null : null}
          </CardContent>
        </Card>
      </div>

      <CommentThread assignmentId={a.id} initialComments={a.comments} />
    </div>
  );
}
