import { format, formatDistanceToNowStrict, isPast } from "date-fns";

import { cn } from "@/shared/lib/utils";

export function DueDateLabel({
  dueAt,
  className,
  prefix = "Due",
  overdueAware = true,
}: {
  dueAt: string | null;
  className?: string;
  prefix?: string;
  overdueAware?: boolean;
}) {
  if (!dueAt) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>
        No due date
      </span>
    );
  }

  const date = new Date(dueAt);
  const overdue = overdueAware && isPast(date);
  const relative = formatDistanceToNowStrict(date, { addSuffix: true });
  const absolute = format(date, "PPp");

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 text-xs",
        overdue ? "text-destructive" : "text-muted-foreground",
        className
      )}
      title={absolute}
    >
      <span className="font-medium">{prefix}</span>
      <span>{relative}</span>
      <span className="text-muted-foreground/70">· {absolute}</span>
    </span>
  );
}
