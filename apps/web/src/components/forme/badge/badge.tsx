import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "destructive";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

// A status travels as a pair of three: the solid dot, the tint it sits in, and
// the text step that stays readable on that tint. A saturated chip at eleven
// pixels reads as decoration, not information. The dot steps aside when the
// badge carries its own icon.
const variants = {
  neutral: "bg-accent text-muted-foreground before:bg-text-tertiary",
  brand: "bg-brand-subtle text-brand-strong before:bg-brand",
  success: "bg-success-subtle text-success-strong before:bg-success",
  warning: "bg-warning-subtle text-warning-strong before:bg-warning",
  destructive: "bg-destructive-subtle text-destructive-strong before:bg-destructive",
} satisfies Record<BadgeVariant, string>;

/**
 * Sizes take a composite step, so the line-height and tracking arrive with the
 * size.
 *
 * These were `text-caption-2-regular` and `text-caption-1-regular`. Both
 * font-sizes happened to equal the scale's caption steps, but `leading-none`
 * threw away the line-height that makes an 11px label legible, and the arbitrary
 * bracket meant a retune of the caption tier would have skipped the badge.
 */
const sizes = {
  sm: "h-5 gap-1 px-1.5 text-caption-2-medium",
  md: "h-6 gap-1.5 px-2 text-caption-1-medium",
} satisfies Record<BadgeSize, string>;

export function Badge({ className, variant = "neutral", size = "md", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
        "before:size-1.5 before:shrink-0 before:rounded-full before:content-[''] has-[svg]:before:hidden",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
