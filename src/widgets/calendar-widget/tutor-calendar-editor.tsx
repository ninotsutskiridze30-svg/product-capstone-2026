"use client";

import {
  addDays,
  format,
  getDay,
  parse,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type EventPropGetter,
  type View,
} from "react-big-calendar/lib";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "sonner";

import {
  useCreateCalendarEvent,
  useCreateTutorLessonInvite,
  useDeleteCalendarEvent,
  useUpdateCalendarEvent,
} from "@/entities/calendar/api/calendar.query";
import {
  type CalendarEventBaseRow,
  expandCalendarEventsForRange,
  getRecurrenceTypeForRow,
  visibleRangeFromRbcRange,
  type ExpandedCalendarEvent,
} from "@/shared/lib/calendar-recurrence";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { useRouter } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/utils";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d: Date) => startOfWeek(d, { locale: enUS }),
  getDay,
  locales: { "en-US": enUS },
});

const DEFAULT_EVENT_COLOR = "#22c55e";

const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

function combineLocalDateAndTime(dateYmd: string, timeHm: string): Date {
  const [y, mo, d] = dateYmd.split("-").map((x) => Number(x));
  const [hh, mm] = timeHm.split(":").map((x) => Number(x));
  return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}

function initialVisibleRange(): { start: Date; end: Date } {
  const ws = startOfWeek(new Date(), { locale: enUS });
  const s = startOfDay(ws);
  return { start: s, end: addDays(s, 7) };
}

function ymdFromRecurrenceUntil(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(value).trim());
  return m?.[0] ?? "";
}

export type ConnectedStudentOption = { id: string; name: string };

type Props = {
  tutorId: string;
  initialEvents: CalendarEventBaseRow[];
  connectedStudents?: ConnectedStudentOption[];
};

function toCalendarApiType(
  t: ExpandedCalendarEvent["type"]
): "available" | "booked" | "blocked" | "lesson" {
  if (t === "available" || t === "booked" || t === "blocked" || t === "lesson") {
    return t;
  }
  return "lesson";
}

export function TutorCalendarEditor({
  tutorId,
  initialEvents,
  connectedStudents = [],
}: Props) {
  const router = useRouter();
  const createCalendarEvent = useCreateCalendarEvent();
  const updateCalendarEvent = useUpdateCalendarEvent();
  const deleteCalendarEvent = useDeleteCalendarEvent();
  const createTutorLessonInvite = useCreateTutorLessonInvite();
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(() => new Date());
  const [visibleRange, setVisibleRange] = useState(initialVisibleRange);

  const [baseRows, setBaseRows] = useState<CalendarEventBaseRow[]>(() =>
    initialEvents.map((e) => ({
      id: e.id,
      title: e.title,
      start_time: e.start_time,
      end_time: e.end_time,
      type: e.type,
      color: e.color,
      is_recurring: e.is_recurring ?? false,
      recurrence_rule: e.recurrence_rule ?? null,
      recurrence_until: e.recurrence_until ?? null,
    }))
  );

  const displayedEvents = useMemo(
    () =>
      expandCalendarEventsForRange(
        baseRows,
        visibleRange.start,
        visibleRange.end
      ),
    [baseRows, visibleRange.start, visibleRange.end]
  );

  const [open, setOpen] = useState(false);
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ExpandedCalendarEvent["type"]>("available");
  const [startIso, setStartIso] = useState("");
  const [endIso, setEndIso] = useState("");
  const [color, setColor] = useState(DEFAULT_EVENT_COLOR);
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly">(
    "none"
  );
  const [recurrenceUntilDate, setRecurrenceUntilDate] = useState("");
  const [saving, setSaving] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteStudentId, setInviteStudentId] = useState(
    () => connectedStudents[0]?.id ?? ""
  );
  const [inviteLessonDate, setInviteLessonDate] = useState("");
  const [inviteStartTime, setInviteStartTime] = useState("09:00");
  const [inviteEndTime, setInviteEndTime] = useState("10:00");
  const [inviteLessonType, setInviteLessonType] = useState<"online" | "onsite">(
    "online"
  );
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteMode, setInviteMode] = useState<"once" | "recurring">("once");
  const [inviteRepeatWeekdays, setInviteRepeatWeekdays] = useState<number[]>(
    []
  );
  const [inviteRepeatUntilDate, setInviteRepeatUntilDate] = useState("");
  const [inviteSaving, setInviteSaving] = useState(false);

  const resolvedInviteStudentId = connectedStudents.some(
    (student) => student.id === inviteStudentId
  )
    ? inviteStudentId
    : (connectedStudents[0]?.id ?? "");

  const eventPropGetter: EventPropGetter<ExpandedCalendarEvent> = useCallback(
    (event) => {
      const c =
        event.color ??
        (event.type === "available"
          ? "var(--color-success)"
          : event.type === "lesson"
            ? "var(--color-info)"
            : event.type === "blocked"
              ? "var(--color-error)"
              : event.type === "invite_pending" || event.type === "pending"
                ? "var(--color-warning)"
                : "var(--color-warning)");
      return {
        style: {
          backgroundColor: c,
          borderColor: c,
          color: "var(--color-text-primary)",
        },
      };
    },
    []
  );

  const onRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      setVisibleRange(visibleRangeFromRbcRange(range));
    },
    []
  );

  function openNew(slot?: { start: Date; end: Date }) {
    setEditingSeriesId(null);
    setTitle("");
    setDescription("");
    setType("available");
    const s = slot?.start ?? new Date();
    const e = slot?.end ?? new Date(s.getTime() + 60 * 60 * 1000);
    setStartIso(s.toISOString().slice(0, 16));
    setEndIso(e.toISOString().slice(0, 16));
    setColor(DEFAULT_EVENT_COLOR);
    setRecurrence("none");
    setRecurrenceUntilDate("");
    setOpen(true);
  }

  function openInvite(slot?: { start: Date; end: Date }) {
    const anchor = slot?.start ?? date;
    const day = startOfDay(anchor);
    const now = new Date();
    const s = slot?.start ?? now;
    const e = slot?.end ?? new Date(now.getTime() + 60 * 60 * 1000);
    setInviteLessonDate(format(day, "yyyy-MM-dd"));
    if (slot) {
      setInviteStartTime(format(slot.start, "HH:mm"));
      setInviteEndTime(format(slot.end, "HH:mm"));
    } else {
      setInviteStartTime(format(s, "HH:mm"));
      setInviteEndTime(format(e, "HH:mm"));
    }
    if (connectedStudents[0] && !inviteStudentId) {
      setInviteStudentId(connectedStudents[0].id);
    }
    setInviteMode("once");
    setInviteRepeatWeekdays([anchor.getDay()]);
    setInviteRepeatUntilDate(format(addDays(day, 28), "yyyy-MM-dd"));
    setInviteOpen(true);
  }

  async function submitInvite() {
    if (!resolvedInviteStudentId) {
      toast.error("Choose a student");
      return;
    }
    if (inviteLessonDate.trim() === "") {
      toast.error(
        inviteMode === "once"
          ? "Choose a lesson date"
          : "Choose a start date for the series"
      );
      return;
    }
    const start = combineLocalDateAndTime(inviteLessonDate, inviteStartTime);
    const end = combineLocalDateAndTime(inviteLessonDate, inviteEndTime);
    if (!(start < end)) {
      toast.error("End time must be after start time");
      return;
    }
    if (inviteMode === "recurring") {
      if (inviteRepeatUntilDate.trim() === "") {
        toast.error("Choose when the series should end");
        return;
      }
      if (inviteRepeatWeekdays.length === 0) {
        toast.error("Pick at least one weekday for the series");
        return;
      }
    }
    setInviteSaving(true);
    const invitePayload = {
      studentId: resolvedInviteStudentId,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      type: inviteLessonType,
      message: inviteMessage.trim() || null,
      ...(inviteMode === "recurring"
        ? {
            recurrenceWeekdays: [...inviteRepeatWeekdays].sort((a, b) => a - b),
            recurrenceUntilDate: inviteRepeatUntilDate,
          }
        : {}),
    };
    try {
      await createTutorLessonInvite.mutateAsync(invitePayload);
      toast.success("Lesson invite sent — pending student approval");
      setInviteOpen(false);
      setInviteMessage("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invite failed");
    }
    setInviteSaving(false);
  }

  function openEdit(ev: ExpandedCalendarEvent) {
    const row = baseRows.find((r) => r.id === ev.seriesId);
    setEditingSeriesId(ev.seriesId);
    setTitle(ev.title);
    setDescription("");
    setType(ev.type);
    setStartIso(
      new Date(ev.start.getTime() - ev.start.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    );
    setEndIso(
      new Date(ev.end.getTime() - ev.end.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    );
    setColor(ev.color ?? DEFAULT_EVENT_COLOR);
    setRecurrence(row ? getRecurrenceTypeForRow(row) : "none");
    setRecurrenceUntilDate(row ? ymdFromRecurrenceUntil(row.recurrence_until) : "");
    setOpen(true);
  }

  async function save() {
    if (!tutorId) {
      toast.error("Missing tutor session");
      return;
    }
    setSaving(true);
    const start = new Date(startIso);
    const end = new Date(endIso);
    const untilYmd = recurrenceUntilDate.trim();
    const apiType = toCalendarApiType(type);
    const titleOrType = title || apiType;
    const recurrenceUntil =
      recurrence === "none" ? null : untilYmd === "" ? null : untilYmd;

    try {
      if (editingSeriesId) {
        await updateCalendarEvent.mutateAsync({
          eventId: editingSeriesId,
          input: {
            tutorId,
            title: titleOrType,
            description: description || null,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            type: apiType,
            color,
            recurrenceType: recurrence,
            recurrenceUntil,
          },
        });
      } else {
        await createCalendarEvent.mutateAsync({
          tutorId,
          title: titleOrType,
          description: description || null,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          type: apiType,
          color,
          recurrenceType: recurrence,
          recurrenceUntil,
        });
      }
    } catch (error) {
      setSaving(false);
      toast.error(error instanceof Error ? error.message : "Save failed");
      return;
    }
    setSaving(false);
    toast.success("Saved");
    setOpen(false);
    if (editingSeriesId) {
      setBaseRows((prev) =>
        prev.map((r) =>
          r.id === editingSeriesId
            ? {
                ...r,
                title: title || type,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                type,
                color,
                is_recurring: recurrence !== "none",
                recurrence_rule:
                  recurrence === "none"
                    ? null
                    : { type: recurrence, interval: 1 },
                recurrence_until:
                  recurrence === "none"
                    ? null
                    : untilYmd === ""
                      ? null
                      : untilYmd,
              }
            : r
        )
      );
    } else {
      window.location.reload();
    }
  }

  async function remove() {
    if (!editingSeriesId) return;
    setSaving(true);
    try {
      await deleteCalendarEvent.mutateAsync(editingSeriesId);
    } catch (error) {
      setSaving(false);
      toast.error(error instanceof Error ? error.message : "Delete failed");
      return;
    }
    setSaving(false);
    toast.success("Deleted");
    setOpen(false);
    setBaseRows((prev) => prev.filter((x) => x.id !== editingSeriesId));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Green = available, blue = lesson, red = blocked, orange = invite pending
          student response.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => openNew()}>
            New event
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => openInvite()}
            disabled={connectedStudents.length === 0}
            title={
              connectedStudents.length === 0
                ? "A student must message you first"
                : undefined
            }
          >
            Propose lesson
          </Button>
        </div>
      </div>
      <div className="h-[560px] w-full min-w-0">
        <Calendar
          localizer={localizer}
          culture="en-US"
          date={date}
          onNavigate={(next) => setDate(new Date(next.getTime()))}
          onRangeChange={onRangeChange}
          events={displayedEvents}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          views={["month", "week", "day"]}
          selectable
          onSelectSlot={(s) => openNew({ start: s.start, end: s.end })}
          onSelectEvent={(e) => openEdit(e as ExpandedCalendarEvent)}
          eventPropGetter={eventPropGetter}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSeriesId ? "Edit event" : "Create event"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ExpandedCalendarEvent["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={startIso}
                  onChange={(e) => setStartIso(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={endIso}
                  onChange={(e) => setEndIso(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select
                value={recurrence}
                onValueChange={(v) => {
                  const next = v as "none" | "daily" | "weekly";
                  setRecurrence(next);
                  if (next === "none") setRecurrenceUntilDate("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recurrence !== "none" ? (
              <div className="space-y-2">
                <Label>Repeat until (optional)</Label>
                <Input
                  type="date"
                  value={recurrenceUntilDate}
                  onChange={(e) => setRecurrenceUntilDate(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  Leave empty for no end date. Occurrences stop after this day
                  (inclusive).
                </p>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {editingSeriesId ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void remove()}
                disabled={saving}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      >
        <DialogContent className="flex h-[min(92vh,56rem)] w-[calc(100vw-1rem)] max-w-[min(1600px,calc(100vw-1rem))] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl md:w-[calc(100vw-2rem)] md:max-w-[min(1600px,calc(100vw-2rem))]">
          <DialogHeader className="shrink-0 space-y-1 px-6 pt-6 pr-14">
            <DialogTitle>Propose lesson to student</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select
                    value={resolvedInviteStudentId}
                    onValueChange={setInviteStudentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[1100]">
                      {connectedStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {connectedStudents.length === 0 ? (
                    <p className="text-muted-foreground text-xs">
                      Students you have a conversation with appear here.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Lesson type</Label>
                  <Select
                    value={inviteLessonType}
                    onValueChange={(v) =>
                      setInviteLessonType(v as "online" | "onsite")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note to student (optional)</Label>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={6}
                    placeholder="Topic, materials, meeting link later…"
                  />
                </div>
              </div>
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Schedule</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant={inviteMode === "once" ? "primary" : "outline"}
                      className={cn(
                        "h-auto min-h-0 w-full flex-col items-stretch gap-1.5 py-4 whitespace-normal text-left font-semibold",
                        inviteMode === "once" && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => setInviteMode("once")}
                      aria-pressed={inviteMode === "once"}
                    >
                      <span>Propose one-time lesson</span>
                      <span className="text-muted-foreground font-normal">
                        One invite on the lesson date you pick below.
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant={
                        inviteMode === "recurring" ? "primary" : "outline"
                      }
                      className={cn(
                        "h-auto min-h-0 w-full flex-col items-stretch gap-1.5 py-4 whitespace-normal text-left font-semibold",
                        inviteMode === "recurring" &&
                          "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => {
                        setInviteMode("recurring");
                        setInviteRepeatWeekdays((prev) =>
                          prev.length > 0
                            ? prev
                            : inviteLessonDate
                              ? [
                                  combineLocalDateAndTime(
                                    inviteLessonDate,
                                    inviteStartTime
                                  ).getDay(),
                                ]
                              : [new Date().getDay()]
                        );
                      }}
                      aria-pressed={inviteMode === "recurring"}
                    >
                      <span>Select occurrence</span>
                      <span className="text-muted-foreground font-normal">
                        Same times on the weekdays you choose until the series
                        ends.
                      </span>
                    </Button>
                  </div>
                </div>
                {inviteMode === "once" ? (
                  <div className="space-y-2">
                    <Label>Lesson date</Label>
                    <Input
                      type="date"
                      value={inviteLessonDate}
                      onChange={(e) => setInviteLessonDate(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Start from date</Label>
                    <Input
                      type="date"
                      value={inviteLessonDate}
                      onChange={(e) => setInviteLessonDate(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                      Occurrences are counted from this day through the series
                      end date.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start time</Label>
                    <Input
                      type="time"
                      value={inviteStartTime}
                      onChange={(e) => setInviteStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End time</Label>
                    <Input
                      type="time"
                      value={inviteEndTime}
                      onChange={(e) => setInviteEndTime(e.target.value)}
                    />
                  </div>
                </div>
                {inviteMode === "recurring" ? (
                  <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                    <div className="space-y-2">
                      <Label>Repeat on</Label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAY_OPTIONS.map((weekday) => {
                          const selected = inviteRepeatWeekdays.includes(
                            weekday.value
                          );
                          return (
                            <Button
                              key={weekday.value}
                              type="button"
                              variant={selected ? "primary" : "outline"}
                              size="sm"
                              className="min-w-[3rem]"
                              onClick={() =>
                                setInviteRepeatWeekdays((prev) =>
                                  prev.includes(weekday.value)
                                    ? prev.filter((d) => d !== weekday.value)
                                    : [...prev, weekday.value].sort(
                                        (a, b) => a - b
                                      )
                                )
                              }
                            >
                              {weekday.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Series end date</Label>
                      <Input
                        type="date"
                        value={inviteRepeatUntilDate}
                        onChange={(e) =>
                          setInviteRepeatUntilDate(e.target.value)
                        }
                      />
                    </div>
                    {inviteLessonDate && inviteRepeatWeekdays.length > 0 ? (
                      <p className="text-muted-foreground text-xs">
                        Repeats on{" "}
                        {inviteRepeatWeekdays
                          .slice()
                          .sort((a, b) => a - b)
                          .map(
                            (d) =>
                              WEEKDAY_OPTIONS.find((o) => o.value === d)
                                ?.label ?? d
                          )
                          .join(", ")}{" "}
                        at {inviteStartTime}–{inviteEndTime}
                        {inviteRepeatUntilDate
                          ? ` until ${format(
                              parse(
                                inviteRepeatUntilDate,
                                "yyyy-MM-dd",
                                new Date()
                              ),
                              "PP"
                            )}`
                          : ""}
                        .
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <DialogFooter className="border-border shrink-0 flex-row flex-wrap items-center justify-end gap-3 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-auto min-w-[7rem]"
              onClick={() => setInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="w-auto min-w-[7rem]"
              onClick={() => void submitInvite()}
              disabled={inviteSaving || connectedStudents.length === 0}
            >
              {inviteSaving ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
