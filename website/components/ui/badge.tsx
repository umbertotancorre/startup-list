import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900",
        muted:
          "border-transparent bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
        outline: "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };


