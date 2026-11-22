"use client";

import { LayoutGroup, MotionConfig, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { cn } from "../lib/cn";
import { spring } from "../lib/motion";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  /** Required when `label` is an icon alone. */
  "aria-label"?: string;
}

export interface SegmentedControlProps {
  options: readonly SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the group. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A small set of mutually exclusive views — Day / Week / Month, List / Board.
 *
 * The selected pill travels between options on a spring rather than jumping,
 * because the motion is the information: it says "the same control, a different
 * value", which a hard cut does not. Shared layout animation does the work, so
 * the pill measures itself and the component holds no geometry of its own.
 *
 * Semantically a radio group: one tab stop, arrow keys move and select, and
 * reduced motion turns the spring into a cut.
 */
export function SegmentedControl({
  options,
  value: controlled,
  defaultValue,
  onValueChange,
  label,
  size = "md",
  className,
}: SegmentedControlProps) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? options[0]?.value);
  const value = controlled ?? uncontrolled;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(next: string) {
    if (controlled === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = options.findIndex((option) => option.value === value);
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const index = (current + delta + options.length) % options.length;
    const option = options[index];
    if (!option) return;
    select(option.value);
    refs.current[index]?.focus();
  }

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={id}>
        <div
          role="radiogroup"
          tabIndex={-1}
          aria-label={label}
          data-slot="segmented-control"
          onKeyDown={onKeyDown}
          className={cn("inline-flex items-center gap-0.5 rounded-lg bg-muted well p-1", className)}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={option["aria-label"]}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(option.value)}
                className={cn(
                  "relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-sm [&_svg]:size-4",
                  size === "sm"
                    ? "h-7 px-2.5 text-caption-1-medium"
                    : "h-8 px-3 text-body-2-medium",
                  selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId="pill"
                    transition={spring.snappy}
                    className="absolute inset-0 rounded-sm bg-card lit shadow-overlay ring-1 ring-line"
                  />
                ) : null}
                <span className="relative inline-flex items-center gap-1.5">{option.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
