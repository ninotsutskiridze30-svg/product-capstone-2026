"use client";

import { isPast } from "date-fns";
import { AlertTriangle, CheckCircle2, ChevronDown, Inbox, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  DueDateLabel,
  HomeworkStatusBadge,
  useHomeworkList,
  type HomeworkAssignment,
} from "@/entities/homework";
import { CreateAssignmentDialog } from "@/features/homework-create/CreateAssignmentDialog";
import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

type Tab = "needs_grading" | "active" | "graded" | "all";

const TAB_FILTER: Record<Tab, (a: HomeworkAssignment) => boolean> = {
  needs_grading: (a) => a.status === "submitted",
  active: (a) => a.status === "assigned" || a.status === "revision_requested",
  graded: (a) => a.status === "graded",
  all: () => true,
};

export function TutorHomeworkModule() {
  const { data, isLoading } = useHomeworkList();
  const [tab, setTab] = useState<Tab>("needs_grading");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const items = data?.items ?? [];

  const stats = useMemo(() => {
    let needsGrading = 0;
    let overdue = 0;
    let activeAssigned = 0;
    for (const it of items) {
      if (it.status === "submitted") needsGrading += 1;
      if (
        (it.status === "assigned" || it.status === "revision_requested") &&
        it.due_at &&
        isPast(new Date(it.due_at))
      ) {
        overdue += 1;
      }
      if (it.status === "assigned" || it.status === "revision_requested") {
        activeAssigned += 1;
      }
    }
    return { needsGrading, overdue, activeAssigned, total: items.length };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((a) => {
      if (!TAB_FILTER[tab](a)) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.peerName ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, tab, search]);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { studentName: string; assignments: HomeworkAssignment[] }
    >();
    for (const a of filtered) {
      const key = a.student_id;
      const bucket = map.get(key) ?? {
        studentName: a.peerName ?? "Student",
        assignments: [],
      };
      bucket.assignments.push(a);
      map.set(key, bucket);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[1].studentName.localeCompare(b[1].studentName, undefined, {
        sensitivity: "base",
      })
    );
  }, [filtered]);

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Homework</h1>
          <p className="text-muted-foreground text-sm">
            Assign work, review submissions, and grade — across all your students.
          </p>
        </div>
        <CreateAssignmentDialog />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Awaiting grading"
          value={stats.needsGrading}
          icon={<Inbox className="h-4 w-4" />}
          highlight={stats.needsGrading > 0}
          onClick={() => setTab("needs_grading")}
        />
        <KpiCard
          label="Overdue"
          value={stats.overdue}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="warning"
          onClick={() => setTab("active")}
        />
        <KpiCard
          label="Active assignments"
          value={stats.activeAssigned}
          icon={<CheckCircle2 className="h-4 w-4" />}
          onClick={() => setTab("active")}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="needs_grading">
              Needs grading
              {stats.needsGrading > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.needsGrading}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} />
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or student…"
            className="pl-8"
          />
        </div>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Nothing here yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(([studentId, group]) => {
            const isCollapsed = collapsed[studentId] ?? false;
            return (
              <Card key={studentId}>
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [studentId]: !isCollapsed,
                    }))
                  }
                  className="hover:bg-muted/40 flex w-full items-center justify-between gap-2 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isCollapsed ? "-rotate-90" : ""
                      }`}
                    />
                    <span className="font-medium">{group.studentName}</span>
                    <Badge variant="secondary">
                      {group.assignments.length}
                    </Badge>
                  </div>
                  <CreateAssignmentDialog
                    defaultStudentId={studentId}
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      >
                        + Assign
                      </Button>
                    }
                  />
                </button>
                {!isCollapsed ? (
                  <ul className="divide-y border-t">
                    {group.assignments.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/dashboard/tutor/homework/${a.id}`}
                          className="hover:bg-muted/30 flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{a.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <HomeworkStatusBadge status={a.status} />
                              <DueDateLabel dueAt={a.due_at} />
                              {a.submissionCount && a.submissionCount > 1 ? (
                                <span className="text-muted-foreground text-xs">
                                  · {a.submissionCount} attempts
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {a.status === "submitted" ? (
                            <Badge className="bg-warning-bg text-warning">
                              Grade now
                            </Badge>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  highlight,
  tone,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
  tone?: "warning";
  onClick?: () => void;
}) {
  const toneClass =
    tone === "warning" && value > 0
      ? "border-danger/30 bg-danger-bg"
      : highlight && value > 0
        ? "border-warning/30 bg-warning-bg"
        : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-4 transition-colors hover:bg-muted/40 ${toneClass}`}
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
        {icon} {label}
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </button>
  );
}
