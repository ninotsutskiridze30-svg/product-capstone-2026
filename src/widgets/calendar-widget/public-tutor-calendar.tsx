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

import {
  type CalendarEventBaseRow,
  expandCalendarEventsForRange,
  visibleRangeFromRbcRange,
  type ExpandedCalendarEvent,
} from "@/shared/lib/calendar-recurrence";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d: Date) => startOfWeek(d, { locale: enUS }),
  getDay,
  locales: { "en-US": enUS },
});

function initialVisibleRange(): { start: Date; end: Date } {
  const ws = startOfWeek(new Date(), { locale: enUS });
  const s = startOfDay(ws);
  return { start: s, end: addDays(s, 7) };
}

type CalEvent = ExpandedCalendarEvent & {
  resource: { rawId: string; color: string | null };
};

type Props = {
  events: CalendarEventBaseRow[];
};

/**
 * Read-only availability preview for the public tutor profile.
 * Only the tutor schedules lessons from their dashboard after you connect via messages.
 */
export function PublicTutorCalendar({ events: raw }: Props) {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(() => new Date());
  const [visibleRange, setVisibleRange] = useState(initialVisibleRange);

  const baseRows = useMemo<CalendarEventBaseRow[]>(
    () =>
      raw.map((e) => ({
        id: e.id,
        title: e.title,
        start_time: e.start_time,
        end_time: e.end_time,
        type: e.type,
        color: e.color,
        is_recurring: e.is_recurring ?? false,
        recurrence_rule: e.recurrence_rule ?? null,
        recurrence_until: e.recurrence_until ?? null,
      })),
    [raw]
  );

  const expanded = useMemo(
    () =>
      expandCalendarEventsForRange(
        baseRows,
        visibleRange.start,
        visibleRange.end
      ),
    [baseRows, visibleRange.start, visibleRange.end]
  );

  const events = useMemo<CalEvent[]>(
    () =>
      expanded.map((e) => ({
        ...e,
        resource: { rawId: e.seriesId, color: e.color },
      })),
    [expanded]
  );

  const eventPropGetter: EventPropGetter<CalEvent> = useCallback((event) => {
    const c =
      event.resource?.color ??
      (event.type === "available"
        ? "var(--color-success)"
        : event.type === "lesson"
          ? "var(--color-info)"
          : event.type === "blocked"
            ? "var(--color-error)"
            : "var(--color-warning)");
    return {
      style: {
        backgroundColor: c,
        borderColor: c,
        color: "var(--color-text-primary)",
      },
    };
  }, []);

  const onRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      setVisibleRange(visibleRangeFromRbcRange(range));
    },
    []
  );

  return (
    <div className="h-[480px] w-full min-w-0">
      <Calendar
        localizer={localizer}
        culture="en-US"
        date={date}
        onNavigate={(next) => setDate(new Date(next.getTime()))}
        onRangeChange={onRangeChange}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        views={["month", "week", "day"]}
        selectable={false}
        eventPropGetter={eventPropGetter}
        toolbar
        popup
      />
    </div>
  );
}
