import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type SeparatorProps = ComponentProps<typeof SeparatorPrimitive>;

/**
 * A hairline, and the one component in the library with no opinion.
 *
 * Vertical is `self-stretch` rather than a fixed height so it fills the flex row
 * it sits in, which is what makes it usable between buttons without a height
 * being passed every time.
 */
export function Separator({ orientation = "horizontal", className, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 border-border",
        orientation === "horizontal" ? "h-px w-full border-t" : "w-px self-stretch border-l",
        className,
      )}
      {...props}
    />
  );
}
