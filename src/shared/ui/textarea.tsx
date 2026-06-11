import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-primary transition-colors outline-none placeholder:text-text-muted focus:border-border-focus focus-visible:shadow-focus disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:opacity-50 aria-invalid:border-error aria-invalid:bg-error-bg",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
