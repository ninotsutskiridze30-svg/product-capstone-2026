"use client";

import { useRouter } from "@/shared/i18n/navigation";

import { useState } from "react";
import { toast } from "sonner";

import { useCreateStudentGroup } from "@/entities/group/api/group.query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type FieldOpt = { id: string; name: string };

export function CreateGroupDialog({
  fields,
  tutorId,
}: {
  fields: FieldOpt[];
  tutorId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [fieldId, setFieldId] = useState(fields[0]?.id ?? "");
  const [max, setMax] = useState(8);
  const [desc, setDesc] = useState("");
  const createGroup = useCreateStudentGroup();

  async function submit() {
    if (!fieldId) {
      toast.error("Pick a subject");
      return;
    }
    if (!tutorId) {
      toast.error("Not signed in");
      return;
    }
    try {
      await createGroup.mutateAsync({
        tutorId,
        name,
        fieldId,
        maxStudents: max,
        description: desc || null,
      });
      toast.success("Group created");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create group");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={fieldId} onValueChange={setFieldId}>
              <SelectTrigger>
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Max students</Label>
            <Input
              type="number"
              min={1}
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={createGroup.isPending}
          >
            {createGroup.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
