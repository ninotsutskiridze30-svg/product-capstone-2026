import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

import type { HomeworkStatus } from "../model/homework.schema";

const STATUS_CONFIG: Record<
  HomeworkStatus,
  { label: string; className: string }
> = {
  assigned: {
    label: "Assigned",
    className: "bg-info-bg text-info border-info/20",
  },
  submitted: {
    label: "Submitted",
    className: "bg-warning-bg text-warning border-warning/20",
  },
  revision_requested: {
    label: "Revision requested",
    className: "bg-danger-bg text-danger border-danger/20",
  },
  graded: {
    label: "Graded",
    className: "bg-success-bg text-success border-success/20",
  },
};

export function HomeworkStatusBadge({
  status,
  className,
}: {
  status: HomeworkStatus;
  className?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(cfg.className, "border", className)}>
      {cfg.label}
    </Badge>
  );
}
