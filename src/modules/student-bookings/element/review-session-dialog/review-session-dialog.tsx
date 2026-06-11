"use client";

import { useRouter } from "@/shared/i18n/navigation";

import { useState } from "react";
import { toast } from "sonner";

import { useSubmitSessionReview } from "@/entities/review/api/review.query";
import { track } from "@/shared/lib/analytics/events";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type Props = {
  sessionId: string;
  tutorId: string;
};

export function ReviewSessionDialog({ sessionId, tutorId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("5");
  const [content, setContent] = useState("");
  const submitReview = useSubmitSessionReview();

  async function submit() {
    try {
      await submitReview.mutateAsync({
        sessionId,
        tutorId,
        tutorSlug: tutorId,
        rating: Number(rating),
        content: content.trim() || null,
      });
      void track("review_submitted", { tutor_id: tutorId, rating: Number(rating), has_content: content.trim().length > 0 });
      toast.success("Thanks for your review");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit review");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Leave a review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate this lesson</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-2">
            <Label>Rating</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={submitReview.isPending}
          >
            {submitReview.isPending ? "Submitting…" : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
