"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useSubmitHomework,
  type HomeworkAttachment,
} from "@/entities/homework";
import { AttachmentPicker } from "@/features/homework-shared/AttachmentPicker";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

type SubmitSolutionDialogProps = {
  assignmentId: string;
  isResubmission?: boolean;
  trigger?: React.ReactNode;
  onSubmitted?: () => void;
};

export function SubmitSolutionDialog({
  assignmentId,
  isResubmission,
  trigger,
  onSubmitted,
}: SubmitSolutionDialogProps) {
  const draftKey = `homework:draft:${assignmentId}`;

  function readDraft(): {
    content: string;
    attachment: HomeworkAttachment | null;
  } {
    if (typeof window === "undefined") return { content: "", attachment: null };
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return { content: "", attachment: null };
      const d = JSON.parse(raw) as {
        content?: string;
        attachment?: HomeworkAttachment | null;
      };
      return { content: d.content ?? "", attachment: d.attachment ?? null };
    } catch {
      return { content: "", attachment: null };
    }
  }

  const [open, setOpen] = useState(false);
  // Hydrate any saved draft on mount via lazy initializers (the dialog is closed
  // initially, so nothing reads these during SSR — no hydration mismatch).
  const [content, setContent] = useState<string>(() => readDraft().content);
  const [attachment, setAttachment] = useState<HomeworkAttachment | null>(
    () => readDraft().attachment
  );
  const [restored, setRestored] = useState<boolean>(() => {
    const d = readDraft();
    return Boolean(d.content || d.attachment);
  });
  const submit = useSubmitHomework(assignmentId);

  // Persist the draft as the student types (writes to localStorage; no setState).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (content.trim() || attachment) {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({ content, attachment })
        );
      } else {
        window.localStorage.removeItem(draftKey);
      }
    } catch {
      // storage may be unavailable (private mode) — non-fatal
    }
  }, [content, attachment, draftKey]);

  function clearDraft() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
    }
  }

  function discardDraft() {
    setContent("");
    setAttachment(null);
    setRestored(false);
    clearDraft();
  }

  async function send() {
    if (!content.trim() && !attachment) {
      toast.error("Add a note or attach a file");
      return;
    }
    try {
      await submit.mutateAsync({
        content: content.trim() ? content.trim() : null,
        attachment,
      });
      toast.success(isResubmission ? "Resubmitted" : "Solution submitted");
      clearDraft();
      setOpen(false);
      setContent("");
      setAttachment(null);
      setRestored(false);
      onSubmitted?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Send className="mr-1 h-4 w-4" />
            {isResubmission ? "Resubmit" : "Submit solution"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isResubmission ? "Resubmit homework" : "Submit your solution"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {restored ? (
            <p className="text-muted-foreground text-xs">
              Draft restored ·{" "}
              <button
                type="button"
                className="hover:underline"
                onClick={discardDraft}
              >
                Discard
              </button>
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="sol-content">Notes (optional)</Label>
            <Textarea
              id="sol-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Anything you'd like the tutor to know?"
            />
          </div>
          <div className="space-y-2">
            <Label>Attachment</Label>
            <AttachmentPicker value={attachment} onChange={setAttachment} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => void send()}
            disabled={submit.isPending}
          >
            {submit.isPending ? "Submitting…" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
