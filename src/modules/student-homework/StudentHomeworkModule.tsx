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
import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

type Tab = "todo" | "revision" | "submitted" | "graded" | "all";

const TAB_FILTER: Record<Tab, (a: HomeworkAssignment) => boolean> = {
  todo: (a) => a.status === "assigned" || a.status === "revision_requested",
  revision: (a) => a.status === "revision_requested",
  submitted: (a) => a.status === "submitted",
  graded: (a) => a.status === "graded",
  all: () => true,
};

function isOverdue(a: HomeworkAssignment) {
  if (!a.due_at) return false;
  if (a.status !== "assigned" && a.status !== "revision_requested") return false;
  return isPast(new Date(a.due_at));
}

function sortForStudent(a: HomeworkAssignment, b: HomeworkAssignment) {
  const aOverdue = isOverdue(a) ? 0 : 1;
  const bOverdue = isOverdue(b) ? 0 : 1;
  if (aOverdue !== bOverdue) return aOverdue - bOverdue;
  if (a.due_at && b.due_at) {
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  }
  if (a.due_at) return -1;
  if (b.due_at) return 1;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function StudentHomeworkModule() {
  const { data, isLoading } = useHomeworkList();
  const [tab, setTab] = useState<Tab>("todo");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const items = data?.items ?? [];

  const stats = useMemo(() => {
    let todo = 0;
    let overdue = 0;
    let revision = 0;
    let awaiting = 0;
    for (const a of items) {
      if (a.status === "assigned" || a.status === "revision_requested") todo += 1;
      if (isOverdue(a)) overdue += 1;
      if (a.status === "revision_requested") revision += 1;
      if (a.status === "submitted") awaiting += 1;
    }
    return { todo, overdue, revision, awaiting };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((a) => {
        if (!TAB_FILTER[tab](a)) return false;
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          (a.peerName ?? "").toLowerCase().includes(q)
        );
      })
      .sort(sortForStudent);
  }, [items, tab, search]);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { tutorName: string; assignments: HomeworkAssignment[] }
    >();
    for (const a of filtered) {
      const bucket = map.get(a.tutor_id) ?? {
        tutorName: a.peerName ?? "Tutor",
        assignments: [],
      };
      bucket.assignments.push(a);
      map.set(a.tutor_id, bucket);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[1].tutorName.localeCompare(b[1].tutorName, undefined, {
        sensitivity: "base",
      })
    );
  }, [filtered]);

  if (isLoading) return <Skeleton className="h-[60vh] w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Homework</h1>
        <p className="text-muted-foreground text-sm">
          Everything your tutors have assigned, sorted by what&apos;s due next.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <KpiCard
          label="To do"
          value={stats.todo}
          icon={<Inbox className="h-4 w-4" />}
          highlight={stats.todo > 0}
          onClick={() => setTab("todo")}
        />
        <KpiCard
          label="Overdue"
          value={stats.overdue}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="warning"
          onClick={() => setTab("todo")}
        />
        <KpiCard
          label="Needs revision"
          value={stats.revision}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="warning"
          onClick={() => setTab("revision")}
        />
        <KpiCard
          label="Awaiting feedback"
          value={stats.awaiting}
          icon={<CheckCircle2 className="h-4 w-4" />}
          onClick={() => setTab("submitted")}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="todo">
              To do
              {stats.todo > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.todo}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="revision">Revision</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
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
            placeholder="Search title or tutor…"
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
          {grouped.map(([tutorId, group]) => {
            const isCollapsed = collapsed[tutorId] ?? false;
            return (
              <Card key={tutorId}>
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [tutorId]: !isCollapsed,
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
                    <span className="font-medium">{group.tutorName}</span>
                    <Badge variant="secondary">
                      {group.assignments.length}
                    </Badge>
                  </div>
                </button>
                {!isCollapsed ? (
                  <ul className="divide-y border-t">
                    {group.assignments.map((a) => {
                      const overdue = isOverdue(a);
                      return (
                        <li key={a.id}>
                          <Link
                            href={`/dashboard/student/homework/${a.id}`}
                            className={cn(
                              "hover:bg-muted/30 flex items-center justify-between gap-3 px-4 py-3",
                              overdue && "border-l-2 border-l-destructive"
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">{a.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <HomeworkStatusBadge status={a.status} />
                                <DueDateLabel dueAt={a.due_at} />
                              </div>
                            </div>
                            {a.status === "revision_requested" ? (
                              <Badge className="bg-danger-bg text-danger">
                                Revise
                              </Badge>
                            ) : a.status === "graded" && a.latestGrade?.score != null ? (
                              <Badge variant="outline">
                                {a.latestGrade.score}
                                {a.max_score != null ? ` / ${a.max_score}` : ""}
                              </Badge>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
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
