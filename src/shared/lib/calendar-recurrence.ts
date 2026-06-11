import { addDays, addWeeks, endOfDay, startOfDay } from "date-fns";

export type CalendarEventType =
  | "available"
  | "booked"
  | "blocked"
  | "lesson"
  | "pending"
  | "confirmed"
  | "invite_pending";

export type CalendarEventBaseRow = {
  id: string;
  tutor_id?: string;
  title: string | null;
  start_time: string;
  end_time: string;
  type: CalendarEventType;
  color: string | null;
  is_recurring?: boolean | null;
  recurrence_rule?: unknown;
  /** Inclusive last calendar day an occurrence may start (`YYYY-MM-DD` from DB date or ISO prefix). */
  recurrence_until?: string | null;
};

export type ExpandedCalendarEvent = {
  id: string;
  seriesId: string;
  tutor_id?: string;
  title: string;
  start: Date;
  end: Date;
  type: CalendarEventType;
  color: string | null;
};

type ParsedRule = { kind: "daily" | "weekly"; interval: number };

const MAX_OCCURRENCES = 5000;

function parseRecurrenceRule(rule: unknown): ParsedRule | null {
  if (!rule || typeof rule !== "object") return null;
  const o = rule as Record<string, unknown>;
  const t = o.type;
  if (t !== "daily" && t !== "weekly") return null;
  const n = o.interval;
  const interval =
    typeof n === "number" && Number.isFinite(n) && n >= 1
      ? Math.floor(n)
      : 1;
  return { kind: t, interval };
}

function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function advanceOccurrenceStart(
  start: Date,
  rule: ParsedRule
): Date {
  return rule.kind === "daily"
    ? addDays(start, rule.interval)
    : addWeeks(start, rule.interval);
}

const YMD_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * End of local calendar day for `recurrence_until` (inclusive last day an occurrence may start).
 * Accepts Postgres `date` as `YYYY-MM-DD` or timestamps — only the date part is used.
 */
export function getRecurrenceUntilEnd(
  recurrenceUntil: string | null | undefined
): Date | null {
  if (recurrenceUntil == null || recurrenceUntil === "") return null;
  const m = YMD_PREFIX.exec(String(recurrenceUntil).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
    return null;
  }
  const local = new Date(y, mo - 1, d);
  if (
    local.getFullYear() !== y ||
    local.getMonth() !== mo - 1 ||
    local.getDate() !== d
  ) {
    return null;
  }
  return endOfDay(local);
}

/**
 * Expands DB calendar rows into display instances for [rangeStart, rangeEnd).
 * Recurring rows use is_recurring + recurrence_rule + optional recurrence_until; non-recurring rows emit once if visible.
 */
export function expandCalendarEventsForRange(
  rows: CalendarEventBaseRow[],
  rangeStart: Date,
  rangeEnd: Date
): ExpandedCalendarEvent[] {
  const out: ExpandedCalendarEvent[] = [];

  for (const row of rows) {
    const seriesStart = new Date(row.start_time);
    const seriesEnd = new Date(row.end_time);
    const durationMs = seriesEnd.getTime() - seriesStart.getTime();
    if (durationMs <= 0) continue;

    const rule =
      row.is_recurring === true ? parseRecurrenceRule(row.recurrence_rule) : null;

    if (!rule) {
      if (intervalsOverlap(seriesStart, seriesEnd, rangeStart, rangeEnd)) {
        const one: ExpandedCalendarEvent = {
          id: row.id,
          seriesId: row.id,
          title: row.title ?? row.type,
          start: seriesStart,
          end: seriesEnd,
          type: row.type,
          color: row.color,
        };
        if (row.tutor_id) one.tutor_id = row.tutor_id;
        out.push(one);
      }
      continue;
    }

    const untilEnd = getRecurrenceUntilEnd(row.recurrence_until);

    let occStart = seriesStart;
    let guard = 0;
    let pastUntilBeforeRange = false;

    while (guard < MAX_OCCURRENCES) {
      if (untilEnd && occStart > untilEnd) {
        pastUntilBeforeRange = true;
        break;
      }
      const occEnd = new Date(occStart.getTime() + durationMs);
      if (occEnd > rangeStart) break;
      occStart = advanceOccurrenceStart(occStart, rule);
      guard++;
    }
    if (pastUntilBeforeRange || guard >= MAX_OCCURRENCES) continue;

    guard = 0;
    while (
      occStart < rangeEnd &&
      (!untilEnd || occStart <= untilEnd) &&
      guard < MAX_OCCURRENCES
    ) {
      const occEnd = new Date(occStart.getTime() + durationMs);
      if (intervalsOverlap(occStart, occEnd, rangeStart, rangeEnd)) {
        const inst: ExpandedCalendarEvent = {
          id: `${row.id}__${occStart.getTime()}`,
          seriesId: row.id,
          title: row.title ?? row.type,
          start: occStart,
          end: occEnd,
          type: row.type,
          color: row.color,
        };
        if (row.tutor_id) inst.tutor_id = row.tutor_id;
        out.push(inst);
      }
      occStart = advanceOccurrenceStart(occStart, rule);
      guard++;
    }
  }

  return out;
}

function recurrenceTypeFromRow(row: CalendarEventBaseRow): "none" | "daily" | "weekly" {
  if (row.is_recurring !== true) return "none";
  const rule = parseRecurrenceRule(row.recurrence_rule);
  if (!rule) return "none";
  return rule.kind === "daily" ? "daily" : "weekly";
}

export function getRecurrenceTypeForRow(
  row: CalendarEventBaseRow
): "none" | "daily" | "weekly" {
  return recurrenceTypeFromRow(row);
}

/** Normalize RBC `onRangeChange` payload to [rangeStart, rangeEnd) in local time. */
export function visibleRangeFromRbcRange(
  range: Date[] | { start: Date; end: Date }
): { start: Date; end: Date } {
  if (Array.isArray(range)) {
    if (range.length === 0) {
      const d = new Date();
      const s = startOfDay(d);
      return { start: s, end: addDays(s, 1) };
    }
    const first = range[0]!;
    const last = range[range.length - 1]!;
    return {
      start: startOfDay(first),
      end: addDays(startOfDay(last), 1),
    };
  }
  return {
    start: startOfDay(range.start),
    end: addDays(startOfDay(range.end), 1),
  };
}
