"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render a placeholder on the server and on the
  // first client paint, then upgrade once next-themes has read the resolved
  // theme from the DOM. This is the standard next-themes pattern; the
  // set-state-in-effect rule doesn't apply here because the effect runs
  // exactly once on mount, not in response to any external state change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "border-border-default text-text-subtle hover:bg-surface-2 hover:text-text-strong inline-flex h-8 w-8 items-center justify-center rounded-md border bg-transparent transition-colors",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
