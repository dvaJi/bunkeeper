import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type { ComponentProps } from "react";

import { renderAsChild } from "../lib/as-child";
import { cn } from "../lib/cn";

export type TooltipProviderProps = ComponentProps<typeof TooltipPrimitive.Provider>;

/**
 * The shared delay.
 *
 * 200ms to open, and Base UI's own close and grouping timeouts. A tooltip that
 * waits three quarters of a second has already failed: the pointer has moved on,
 * and the thing it was going to explain is now underneath the cursor.
 *
 * The grouping is what makes a toolbar of tooltips feel considered rather than
 * twitchy — once one has shown, its neighbours open instantly while the pointer
 * travels between them.
 */
export function TooltipProvider({
  delay = 200,
  closeDelay = 0,
  timeout = 400,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider delay={delay} closeDelay={closeDelay} timeout={timeout} {...props} />
  );
}

export function Tooltip({ ...props }: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

export interface TooltipTriggerProps extends ComponentProps<typeof TooltipPrimitive.Trigger> {
  /** Render as the single child element instead of a `<button>`, keeping the trigger behaviour. */
  asChild?: boolean;
}

export function TooltipTrigger({ className, asChild, children, ...props }: TooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn("inline-flex", className)}
      {...renderAsChild(asChild, children)}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}

/**
 * The tooltip body.
 *
 * Base UI splits positioning from content: a `Positioner` does the placement and
 * a `Popup` does the rendering. Both are here so the consumer writes neither, and
 * so the popup is portalled — a tooltip is usually describing something inside a
 * toolbar or a table row, and both of those clip their overflow.
 *
 * `side` and `sideOffset` are taken from the caller's props but handed to the
 * Positioner, which is the part that owns placement. Spelled out as explicit
 * props rather than spread through, because Base UI's `Popup` type does not
 * include them and passing them there would be a type error worth avoiding
 * rather than a runtime one.
 */
export interface TooltipContentProps
  extends
    ComponentProps<typeof TooltipPrimitive.Popup>,
    Pick<ComponentProps<typeof TooltipPrimitive.Positioner>, "side" | "sideOffset" | "align"> {
  /** The caret pointing at the trigger. On by default; the popup grows out of it. */
  arrow?: boolean;
}

export function TooltipContent({
  className,
  children,
  side = "top",
  sideOffset = 9,
  align,
  arrow = true,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            // `data-starting-style` / `data-ending-style`, not `data-[state=...]`.
            // The scale comes from a transition rather than a keyframe, because
            // the popup is positioned by Base UI and a keyframe writing
            // `transform` would overwrite the position it just computed.
            // `origin-(--transform-origin)` is where Base UI says the popup is
            // anchored — the caret's tip when there is one — so it condenses out
            // of the caret. Exits are quicker than entrances.
            "z-50 max-w-64 origin-(--transform-origin) rounded-md floating px-2.5 py-1.5 text-caption-1-medium text-popover-foreground select-none",
            "transition-[opacity,scale,filter] duration-standard ease-entrance data-[ending-style]:duration-fast data-[ending-style]:ease-exit",
            "data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[starting-style]:blur-[4px] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:blur-[4px]",
            className,
          )}
          {...props}
        >
          {arrow ? <TooltipArrow /> : null}
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

/**
 * The caret. Drawn rather than a rotated square, so it carries the surface's
 * hairline on its two outer edges and none on its base, where it opens into the
 * popup and covers that stretch of the popup's own border.
 *
 * One shape, rotated per side. The rotated box keeps its unrotated layout
 * size, so each side's offset is worked out for the turned footprint: 14 by 7
 * pointing up, which on its side is 7 wide around the same centre.
 */
export function TooltipArrow({
  className,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Arrow>) {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      className={cn(
        "h-[7px] w-[14px]",
        "data-[side=bottom]:-top-1.5",
        "data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180",
        "data-[side=left]:right-[-9.5px] data-[side=left]:rotate-90",
        "data-[side=right]:left-[-9.5px] data-[side=right]:-rotate-90",
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 14 7" aria-hidden className="block size-full overflow-visible">
        <path d="M0 7.5 7 0.5l7 7Z" className="fill-popover" />
        <path d="M0 7 7 0.5 14 7" fill="none" className="stroke-line" strokeLinejoin="round" />
      </svg>
    </TooltipPrimitive.Arrow>
  );
}
