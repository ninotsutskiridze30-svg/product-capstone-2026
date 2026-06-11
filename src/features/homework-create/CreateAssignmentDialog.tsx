"use client";

import { Lock, Plus, Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useCreateHomework,
  useHomeworkRecipients,
  type HomeworkAttachment,
} from "@/entities/homework";
import { AttachmentPicker } from "@/features/homework-shared/AttachmentPicker";
import {
  RubricBuilder,
  rubricRowsToInput,
  type RubricDraftRow,
} from "@/features/homework-create/RubricBuilder";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
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
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Textarea } from "@/shared/ui/textarea";

type CreateAssignmentDialogProps = {
  defaultStudentId?: string;
  trigger?: React.ReactNode;
  onCreated?: () => void;
};

export function CreateAssignmentDialog({
  defaultStudentId,
  trigger,
  onCreated,
}: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> New homework
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="top-0 left-0 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Assign homework</DialogTitle>
        </DialogHeader>
        {open ? (
          <CreateAssignmentForm
            {...(defaultStudentId ? { defaultStudentId } : {})}
            onDone={() => {
              setOpen(false);
              onCreated?.();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CreateAssignmentForm({
  defaultStudentId,
  onDone,
}: {
  defaultStudentId?: string;
  onDone: () => void;
}) {
  const recipients = useHomeworkRecipients();
  const create = useCreateHomework();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState<string>("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [attachment, setAttachment] = useState<HomeworkAttachment | null>(null);
  const [rubricRows, setRubricRows] = useState<RubricDraftRow[]>([]);
  const [answerKey, setAnswerKey] = useState("");
  const [gradingNotes, setGradingNotes] = useState("");
  const [studentIds, setStudentIds] = useState<Set<string>>(
    new Set(defaultStudentId ? [defaultStudentId] : [])
  );
  const [groupIds, setGroupIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const students = recipients.data?.students ?? [];
  const groups = recipients.data?.groups ?? [];

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      (s.full_name ?? "").toLowerCase().includes(q)
    );
  }, [search, students]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [search, groups]);

  const totalSelectedStudents = studentIds.size;
  const totalSelectedGroupMembers = Array.from(groupIds).reduce((sum, gid) => {
    const g = groups.find((x) => x.id === gid);
    return sum + (g?.memberCount ?? 0);
  }, 0);

  function toggleStudent(id: string) {
    setStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleGroup(id: string) {
    setGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (studentIds.size === 0 && groupIds.size === 0) {
      toast.error("Pick at least one student or group");
      return;
    }
    try {
      const parsedScore = maxScore.trim() ? Number(maxScore) : null;
      if (parsedScore !== null && (Number.isNaN(parsedScore) || parsedScore <= 0)) {
        toast.error("Max score must be a positive number");
        return;
      }
      const dueIso = dueAt ? new Date(dueAt).toISOString() : null;
      const res = await create.mutateAsync({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        dueAt: dueIso,
        maxScore: parsedScore,
        attachment,
        studentIds: Array.from(studentIds),
        groupIds: Array.from(groupIds),
        rubric: rubricRowsToInput(rubricRows),
        answerKey: answerKey.trim() ? answerKey.trim() : null,
        gradingNotes: gradingNotes.trim() ? gradingNotes.trim() : null,
      });
      const count = res.created.length;
      toast.success(`Assigned to ${count} student${count === 1 ? "" : "s"}`);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign");
    }
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto grid max-w-3xl gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hw-title">Title</Label>
              <Input
                id="hw-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chapter 4 — exercises 1 to 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hw-due">Due date</Label>
              <Input
                id="hw-due"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hw-desc">Description</Label>
            <Textarea
              id="hw-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the task? Anything to read first?"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hw-max">Max score (optional)</Label>
              <Input
                id="hw-max"
                type="number"
                min={0}
                step="0.5"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="e.g. 20"
              />
            </div>
            <div className="space-y-2">
              <Label>Attachment (optional)</Label>
              <AttachmentPicker value={attachment} onChange={setAttachment} />
            </div>
          </div>

          <details className="rounded-md border border-border p-3">
            <summary className="cursor-pointer select-none text-sm font-medium">
              Rubric (optional)
            </summary>
            <p className="text-muted-foreground mb-2 mt-1 text-xs">
              Add criteria with points. Shown to the student and used to guide AI
              grading.
            </p>
            <RubricBuilder rows={rubricRows} onChange={setRubricRows} />
          </details>

          <details className="bg-muted/30 rounded-md border border-border p-3">
            <summary className="cursor-pointer select-none text-sm font-medium">
              <Lock className="mr-1 inline h-3 w-3" /> Private answer key &amp; notes
              (optional)
            </summary>
            <p className="text-muted-foreground mb-2 mt-1 text-xs">
              Only you can see this. It guides AI grading and is never shown to the
              student.
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

          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">
                {totalSelectedStudents} student{totalSelectedStudents === 1 ? "" : "s"}
              </Badge>
              {groupIds.size > 0 ? (
                <Badge variant="outline">
                  + {groupIds.size} group{groupIds.size === 1 ? "" : "s"} (~
                  {totalSelectedGroupMembers} students)
                </Badge>
              ) : null}
              {(studentIds.size > 0 || groupIds.size > 0) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStudentIds(new Set());
                    setGroupIds(new Set());
                  }}
                >
                  <X className="mr-1 h-3 w-3" /> Clear
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students or groups…"
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-64 rounded-md border">
              <div className="divide-y">
                {filteredGroups.length > 0 ? (
                  <div className="p-2">
                    <p className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider">
                      Groups
                    </p>
                    <ul>
                      {filteredGroups.map((g) => (
                        <li key={g.id}>
                          <label className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm">
                            <Checkbox
                              checked={groupIds.has(g.id)}
                              onCheckedChange={() => toggleGroup(g.id)}
                            />
                            <Users className="text-muted-foreground h-4 w-4" />
                            <span className="flex-1">{g.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {g.memberCount}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="p-2">
                  <p className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider">
                    Students
                  </p>
                  {filteredStudents.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-2 text-xs">
                      {recipients.isLoading
                        ? "Loading…"
                        : students.length === 0
                          ? "You have no connected students yet."
                          : "No matches."}
                    </p>
                  ) : (
                    <ul>
                      {filteredStudents.map((s) => (
                        <li key={s.id}>
                          <label className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm">
                            <Checkbox
                              checked={studentIds.has(s.id)}
                              onCheckedChange={() => toggleStudent(s.id)}
                            />
                            <span className="flex-1 truncate">
                              {s.full_name ?? "Unnamed student"}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <DialogFooter className="shrink-0 border-t px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl justify-end">
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={create.isPending}
          >
            {create.isPending ? "Assigning…" : "Assign homework"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
