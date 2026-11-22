import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

/**
 * A key, as printed on a keyboard.
 *
 * A real `<kbd>`, so a screen reader and a copy-paste both get the semantics. The
 * bottom border is heavier than the others, which is the whole trick: it reads as
 * a keycap at eleven pixels where a uniform outline reads as a tag.
 */
export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-sm border border-b-2 border-border bg-muted px-1 font-sans text-caption-2-medium text-muted-foreground [&_svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

/** A chord: keys pressed together, with the separator hidden from assistive tech. */
export function KbdGroup({
  keys,
  className,
  ...props
}: ComponentProps<"span"> & { keys: readonly string[] }) {
  return (
    <span
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {keys.map((key, index) => (
        <Kbd key={`${key}-${index}`}>{key}</Kbd>
      ))}
    </span>
  );
}
