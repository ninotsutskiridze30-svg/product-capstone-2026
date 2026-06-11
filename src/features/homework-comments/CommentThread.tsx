"use client";

import { format } from "date-fns";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useAddHomeworkComment,
  useHomeworkComments,
  type HomeworkComment,
} from "@/entities/homework";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export function CommentThread({
  assignmentId,
  initialComments,
}: {
  assignmentId: string;
  initialComments?: HomeworkComment[] | undefined;
}) {
  const { data } = useHomeworkComments(assignmentId);
  const add = useAddHomeworkComment(assignmentId);
  const [text, setText] = useState("");

  const comments = data?.items ?? initialComments ?? [];

  async function send() {
    const body = text.trim();
    if (!body) return;
    try {
      await add.mutateAsync({ body });
      setText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No messages yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{c.authorName ?? "User"}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {c.author_role}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(c.created_at), "PPp")}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message…"
          />
          <Button type="submit" size="sm" disabled={add.isPending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
