/**
 * Motion presets. Every Forme component that animates uses these, so motion
 * across the whole library feels like one hand made it.
 *
 * Nothing is imported here on purpose: these are plain values, so the shared
 * timing costs no bundle and installs no animation runtime.
 */
// These mirror the `--ease-*` and `--duration-*` tokens in foundation.css, so a
// Motion animation and a CSS transition on the same page move with one curve.
export const ease = {
  /** Default for state changes: a strong ease-out. `--ease-standard`. */
  standard: [0.22, 1, 0.36, 1],
  /** For something entering. `--ease-entrance`. */
  entrance: [0.22, 1, 0.36, 1],
  /** For something leaving, always at `fast`: it accelerates away. `--ease-exit`. */
  exit: [0.4, 0, 1, 1],
  /** For a dialog or drawer. `--ease-modal`. */
  modal: [0.32, 0.72, 0, 1],
} as const;

export const duration = {
  instant: 0,
  /** Menus, popovers, tooltips, every exit. */
  fast: 0.15,
  /** Toasts, a switch thumb, a checkbox tick. */
  standard: 0.2,
  /** Dialogs and drawers. */
  modal: 0.3,
  /** Content entering a page. */
  enter: 0.34,
  /** Charts drawing, bars and meters growing. */
  slow: 0.4,
} as const;

export const spring = {
  /** Presses, toggles, small movement. */
  snappy: { type: "spring", stiffness: 420, damping: 34, mass: 0.7 },
  /** Panels and layout that should settle rather than snap. */
  gentle: { type: "spring", stiffness: 220, damping: 26, mass: 0.9 },
} as const;
