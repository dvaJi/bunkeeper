---
name: forme-ui
description: Use when building or changing a React interface with Tailwind CSS v4 — finding a Forme component, installing it, and editing it correctly. Covers the design tokens, the radius ladder, the type scale, the motion rules and the accessibility contract. Trigger on "Forme", "formeui", "@forme/", or when a project already has a components/forme/ directory.
---

# Forme UI

Forme is a React component library you **copy** instead of install. There is no
`@forme/ui` in `node_modules` and nothing Forme ships runs at runtime — every
component becomes a file in the user's project.

**This changes how you work.** You are not adding a dependency, you are editing
someone's code. Read the file before you change it. If the component does not fit,
change it — do not add a wrapper to route around it, and do not suggest a package.

## Before you write anything

Check what exists before you write something that does:

```bash
ls components/forme 2>/dev/null && cat components/forme/foundation.css | head -40
```

If a `forme/` directory exists, the user already has Forme. Read the source of the
component you are about to touch, match its conventions, and do not introduce a
second styling approach beside it.

If it does not exist, install from the catalogue:

```bash
npx shadcn@latest add @forme/button
```

The first install pulls `forme-foundation`, the token file. It is not optional:
without it the utility classes resolve to nothing and components render as bare
text in a box. That is the single most common Forme problem.

For the full catalogue, the MCP server, or the machine-readable index, see
[formeui.com/docs/agent-skills](https://formeui.com/docs/agent-skills).

## The rules that matter

### Colour is a token, always

`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`. Never a
hex, never `rgb()`, never an arbitrary colour utility. A literal is the one value
that cannot follow a theme, a dark mode, or a rebrand — and retheming is the whole
reason the library is token-based.

Every token is one `light-dark()` declaration, resolved against `color-scheme`,
which `.dark` (or `data-mode="dark"`) flips. Because of that, **there is no
`dark:` colour variant anywhere in Forme** — if you typed `dark:` followed by a
colour, the token layer is missing a value. Fix the token, not the component.

Neutrals are achromatic. Do not add a hue to a grey.

### Radius is a ladder, not a taste

Every rung is a clear step down: **containers `rounded-xl` →
wells `rounded-xl` → controls `rounded-md` → chips `rounded-sm`**. Pills
(`rounded-full`) are for things that are actually pills. Where borders nearly
touch, strict math wins: outer radius = inner radius + padding. Never hand-write
a radius; pick from the scale.

### Type is a whole step

`text-body-medium` carries its size, weight, line-height and letter-spacing
together. Never rebuild it as `text-sm font-medium leading-5` — the leading and
tracking that work at 14px are not the ones that work at 11px, and a bare
`font-medium` on a step is a contradiction.

If a step seems missing, add it to `foundation.css` rather than reaching for
`text-[0.8125rem]`.

### Feedback is instant; choreography is animated

Colour never transitions — not on hover, not on press, not on theme change. A
state change lands on the frame it happens, and the polish lives in the
choreography instead: entrances condense (fade + scale + blur), exits are faster
than entrances, geometry animates with the duration and easing tokens, and
`prefers-reduced-motion` is honoured globally. `transition-colors` and
`transition: all` do not exist in a Forme file.

### Surfaces are lit, not painted

Static cards are flat and hairline-bordered, wearing `lit edge` — a faint
top-down lightness gradient and a 1px inner highlight. Fields and tracks sink
(`well`). Dropdowns, dialogs and toasts **float** (`floating`): the overlay shadow
is an event, and it is the only shadow a surface gets.

Filled controls — primary and destructive buttons, the on-state of a switch or
checkbox, brand marks — wear the **mark recipe**: a gradient lit from above plus
a 1px white inner ring. It is already in `bg-button-primary`, `bg-button-danger`
and `bg-mark`; do not rebuild it, and do not put it on anything that is not a
filled control. Gradients have exactly three homes: light (the recipes), data
(chart series fades, `bg-meter`), and the consumer's own marketing canvas.
Anything else is decoration — delete it.

### Status travels as a pair

A status colour is three tokens used together: the solid colour for the dot or
icon, `-subtle` for the fill behind it, `-strong` for the text on that fill.
`bg-success-subtle text-success-strong` with a `bg-success` dot — never a tint
with body text on it, and never a raw red that happens to look right.

### Server component by default

Only add `"use client"` when the component needs state, effects, refs or event
handlers. Everything under that boundary ships to the browser. Keep it as low in
the tree as you can — a leaf button handler should not turn a whole page into
client JavaScript.

### Accessibility is part of the component, not an afterthought

A real `<label>`. `aria-*` where the semantics are not obvious. A keyboard path for
every interaction. A loading button keeps its label and uses `aria-busy` rather
than `disabled` — disabling a focused element drops focus and loses the person
using it.

## Never

- Do not add a Forme runtime dependency. It is the one thing that does not exist.
- Do not write a lookalike next to an installed Forme component. Install the real
  one.
- Do not wrap a Forme component to work around it. Fix it.
- Do not write `transition-colors` or `transition: all`. Colour feedback is
  instant; choreography uses the motion tokens.
- Do not write a `dark:` colour. The token layer already carries both modes.
- Do not paint a gradient by hand. The recipes are in `foundation.css`; if a
  gradient is not light, data, or the consumer's marketing canvas, it is
  decoration.
- Do not rebuild a type step from `text-sm font-medium leading-5`.
- Do not paraphrase a component's source when you have been asked to read it. Return
  the source.

## For the human on your team

The install-and-design flow — the registry setup, the one import, dark mode,
retheming, building with the recipes — lives at
[formeui.com/docs/flows](https://formeui.com/docs/flows). Everything above is the
agent's half of the same system.

## More

| File                                                              | What is in it                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| [design.md](https://formeui.com/r/skills/forme/design.md)         | Every token, the type scale, radius, motion and direction |
| [components.md](https://formeui.com/r/skills/forme/components.md) | The catalogue with ids and install commands               |
| [review.md](https://formeui.com/r/skills/forme/review.md)         | The checks to run before you finish                       |
