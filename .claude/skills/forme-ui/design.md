# Forme design tokens

Everything below is a CSS custom property in `foundation.css`. Components never
read a literal — that is what makes the library rethemeable, and it is the rule
most worth keeping.

## Semantic slots

Address colour through these, never through a palette class.

| Token                                                      | Role                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `--background` `--foreground`                              | The page.                                                                                          |
| `--card` `--popover`                                       | Raised surfaces, one step above the page.                                                          |
| `--primary` `--primary-foreground`                         | The filled action. Primary is the accent hue, not ink — a filled button should read as a decision. |
| `--secondary` `--muted`                                    | Quiet fills: table stripes, inactive tabs.                                                         |
| `--accent` `--accent-foreground`                           | Hover fill. Mixed from `--primary`, so it follows a retheme.                                       |
| `--text-primary` `-secondary` `-tertiary`                  | Four steps of emphasis, so a heading is not a label and a caption is not body copy.                |
| `--surface-default` `-hover` `-active` `-disabled`         | Controls that sit on the page rather than in a panel.                                              |
| `--border` `--input` `--control-border` `-hover` `-active` | Hairlines. A border is never the only signal for a state.                                          |
| `--ring`                                                   | Focus. The accent hue.                                                                             |

### Dark mode is one declaration per token

Every token is a single `light-dark(light value, dark value)`, resolved against
`color-scheme`. The consumer flips `.dark` (or `data-mode="dark"`) on `<html>`
and every component follows. There is no second set of rules to keep in sync,
which is why **no component contains a `dark:` colour** — if one seems needed,
the token layer is missing a value.

### Derived, so a retheme stays consistent

These are `color-mix()` off `--primary`, not hand-picked. That is why changing the
accent does not leave blue ghost buttons in a green theme:

```css
--ghost-background: color-mix(in oklch, var(--primary) 12%, var(--background));
--ghost-hover: color-mix(in oklch, var(--primary) 20%, var(--background));
--ghost-active: color-mix(in oklch, var(--primary) 30%, var(--background));
--accent: color-mix(in oklch, var(--primary) 14%, var(--background));
--brand: var(--primary);
--brand-subtle: var(--ghost-background);
--ring: var(--primary);
```

If you add a token that is the accent at a different strength, derive it the same
way rather than picking a value.

### Status travels as a pair

A status colour is three tokens used together — the solid for the dot or icon,
`-subtle` for the fill behind it, `-strong` for text sitting on that fill:

```css
--success  --success-subtle  --success-strong
--warning  --warning-subtle  --warning-strong
--danger   --danger-subtle   --danger-strong
--info     --info-subtle     --info-strong
```

`bg-success-subtle text-success-strong` with a `bg-success` dot is a badge.
The `-strong` step exists because text on a tint needs more contrast than body
copy does. Never mix the steps across hues.

### Charts read from slots

Series colours are `--chart-1` through `--chart-8`. A chart component never
hard-codes a hue; recolouring every chart in a product is a token edit.

## Surfaces are lit, not painted

Structure is flat; shadows are events.

- **Static card**: `rounded-xl border border-border bg-card` + the `lit` and
  `edge` recipes. No outer shadow.
- **Floating panel** (dropdown, dialog, popover, toast): the `floating` recipe —
  a `--line` border, the lit gradient, and `--shadow-overlay`, the one shadow in
  the system. Never stack floating panels on floating panels.
- **Fields, tracks, wells**: the `well` recipe — an inner shadow, because they
  recede.

```css
@utility lit {
  background-image: linear-gradient(180deg, var(--surface-lit), var(--card));
}
@utility edge {
  box-shadow: inset 0 1px 0 var(--edge-highlight);
}
@utility well {
  box-shadow: inset 0 1px 2px light-dark(oklch(0% 0 0 / 0.05), oklch(0% 0 0 / 0.35));
}
```

`--surface-lit` (a whisper of the accent near the top, achromatic step in the
dark) and `--edge-highlight` (a 1px inner top highlight) are the two tokens that
make a flat card read as lit rather than painted. They work in both modes; the
dark mode is where they earn their keep.

### Filled controls wear the mark recipe

A gradient lit from above plus a 1px white inner ring at 20% — the ring is what
makes the fill look machined rather than painted. It ships as `bg-button-primary`
and `bg-button-danger` (both stops mixed from `--primary`/`--destructive`, darker
than the base, so the label keeps ≥ 4.5:1 contrast at either end), `bg-mark` for
brand tiles, and `bg-meter` for quantity fills. Hover swaps the gradient
instantly; press flattens to the darkest stop; the ring stays. Never rebuild it
by hand, and never put it on a surface that is not a filled control.

### Gradients have three homes

1. **Light** — the recipes above.
2. **Data** — chart series fades and `bg-meter`.
3. **The marketing canvas** — the consumer's landing hero and closing band, which
   are theirs to brand.

A gradient anywhere else is decoration. Delete it.

## Neutrals are achromatic

Every step is `oklch(L% 0 0)` — chroma zero.

```css
--neutral-50: oklch(99% 0 0); /* page */
--neutral-100: oklch(97% 0 0); /* card */
--neutral-200: oklch(92% 0 0); /* hairline */
--neutral-300: oklch(87% 0 0);
--neutral-400: oklch(70% 0 0); /* tertiary text */
--neutral-500: oklch(55% 0 0); /* muted text */
--neutral-700: oklch(38% 0 0); /* secondary text */
--neutral-950: oklch(15% 0 0); /* primary text */
```

A tinted grey looks deliberate against the blue you happen to ship with and turns
muddy against the next one. The cast that flatters one accent ruins another, and
retheming is the case this system exists to handle.

## Type scale

Seven families × weights. Each step carries size, weight, line-height and, for
captions, letter-spacing. Use the step; do not restack it.

| Family      | Size      | Line      | Used for                                             |
| ----------- | --------- | --------- | ---------------------------------------------------- |
| `body`      | 0.875rem  | 1.25rem   | Default UI text.                                     |
| `body-2`    | 0.8125rem | 1.125rem  | Dense text: table cells, sidebars, compact controls. |
| `caption-1` | 0.75rem   | 1rem      | Metadata, labels. Tracking 0.15px.                   |
| `caption-2` | 0.6875rem | 0.9375rem | Uppercase eyebrows. Tracking 0.2px.                  |
| `title-3`   | 0.8125rem | 1.25rem   | —                                                    |
| `title-2`   | 0.9375rem | 1.375rem  | Section headings.                                    |
| `title-1`   | 1.0625rem | 1.5rem    | —                                                    |
| `headline`  | 1.3125rem | 1.75rem   | Page headings.                                       |

Weights: `regular`, `medium`, `semibold`, `bold` where the family defines them.

Two tiers carry the interface. Body scales are the default — labels, cells, field
text, button labels. Title and headline scales are for headings only. Weight is
the emphasis mechanism _inside_ a tier, not a way to reach a different one.

**Two tiers, one rule:** never write `text-sm font-medium leading-5`. The line-height
that makes 14px work is not the one that makes 11px work.

## Radius is a ladder

Every rung is a clear step down, so corners share one centre:

| Rung       | Class          | Used for                                         |
| ---------- | -------------- | ------------------------------------------------ |
| `3xl` 20px | `rounded-xl`   | **Containers: cards, dialogs, menus, panels.**   |
| `xl` 12px  | `rounded-xl`   | **Wells: sunken bands, inner trays.**            |
| `md` 6px   | `rounded-md`   | **Controls: buttons, fields, menu rows, icons.** |
| `sm` 4px   | `rounded-sm`   | **Chips, ticks, tiny fragments.**                |
| `full`     | `rounded-full` | Things that are actually pills.                  |

`lg` (8px) and `2xl` (16px) stay on the scale for the concentric math — a
segmented track is an 8px shell around a 4px thumb with 4px of padding — and for
toasts. Where borders sit within 8px of each other, strict math wins:
`outer radius = inner radius + padding`. A pill on a button is a regression.

## Spacing

Tailwind's scale on a `0.25rem` base. Prefer `gap` over per-child margins, so a
group can be re-ordered without touching each child.

## Motion: feedback is instant, choreography is animated

Colour never transitions. A hover, a press, a theme flip — the colour lands on
the frame it happens. What animates is geometry and choreography, on these
tokens:

| Token                 | Value                            | Used for                                    |
| --------------------- | -------------------------------- | ------------------------------------------- |
| `--duration-instant`  | 0ms                              | Colour and state flips.                     |
| `--duration-fast`     | 150ms                            | Menus, tooltips, all exits.                 |
| `--duration-standard` | 200ms                            | Switch thumb, tick draw, toasts.            |
| `--duration-modal`    | 300ms                            | Dialogs, backdrops, sidebar slide.          |
| `--duration-enter`    | 340ms                            | Content entrances.                          |
| `--duration-data`     | 400ms                            | Chart draws, meter fills.                   |
| `--ease-standard`     | `cubic-bezier(0.22, 1, 0.36, 1)` | The default: strong ease-out, no overshoot. |
| `--ease-modal`        | `cubic-bezier(0.32, 0.72, 0, 1)` | Modals.                                     |
| `--ease-exit`         | `cubic-bezier(0.4, 0, 1, 1)`     | Exits — always faster than entrances.       |
| `--ease-draw`         | `cubic-bezier(0.65, 0, 0.35, 1)` | The checkbox tick draw.                     |

The keyframed animations ship as utilities: `animate-enter`, `animate-panel-in`
/`-out`, `animate-pop-in`/`-out`, `animate-toast-in`/`-out`, `animate-fade-in`
/`-out`, `animate-icon-swap`, `animate-draw`, `animate-dot-in`. Entrances
condense — fade + scale + a small blur; they arrive into place rather than
sliding in from a distance.

`prefers-reduced-motion` is honoured globally in `foundation.css` — do not add
motion that ignores it, and do not remove the guard.

## Direction

Forme uses logical properties, so it mirrors under `dir="rtl"`: `ms-`/`me-`,
`ps-`/`pe-`, `start`/`end`, `text-start`/`text-end`, `rounded-s`/`rounded-e`,
`border-s`/`border-e`.

**Write logical properties in new code.** A `left-2.5` is a bug the moment
someone sets `dir="rtl"`.

Two things stay physical on purpose, and both are commented in the source:

- **Centring** — `left-1/2` with `-translate-x-1/2`. Both halves are
  direction-agnostic.
- **Chart and canvas geometry** — the y-axis labels on a bar chart are anchored
  to the plot's right edge because that is where the axis is drawn.

Keep code, digits, email addresses and URLs in explicit LTR regions so a value
never drags the field it sits in out of alignment.
