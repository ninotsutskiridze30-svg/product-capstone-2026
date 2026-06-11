import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-4 py-2 text-base text-text-primary transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus:border-border-focus focus-visible:shadow-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:opacity-50 aria-invalid:border-error aria-invalid:bg-error-bg",
        className
      )}
      {...props}
    />
  )
}

export { Input }
