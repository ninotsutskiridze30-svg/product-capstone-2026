import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:shadow-focus focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark",
        primary: "bg-primary text-white hover:bg-primary-dark",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary/10",
        secondary: "bg-gray-100 text-text-primary hover:bg-gray-200",
        ghost: "bg-transparent text-primary hover:bg-primary/10",
        destructive: "bg-error text-white hover:bg-error/90",
        danger: "bg-error text-white hover:bg-error/90",
        link: "text-text-link underline-offset-4 hover:text-primary-dark hover:underline",
      },
      size: {
        default: "",
        xs: "min-h-[32px] px-3 py-1.5 text-xs",
        sm: "min-h-[36px] px-4 py-2 text-xs",
        lg: "min-h-[52px] px-8 py-4 text-base",
        icon: "size-11 p-0",
        "icon-xs": "size-8 p-0",
        "icon-sm": "size-10 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
