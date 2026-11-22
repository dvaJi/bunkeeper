# Before you finish

Run these against the diff, not against the whole repo. Each is a grep, because
the failure modes they catch are invisible in a screenshot and obvious in a diff.

## Did I reintroduce a hard-coded colour?

```bash
git diff -U0 | grep -nE '#[0-9a-fA-F]{3,8}\b|rgb\(|oklch\(|hsl\(' -- | grep -v '\.css:'
```

Any hit in a component is a bug. A hit in `foundation.css` is the token itself,
which is the one place a literal belongs.

Then check nothing slipped past as an arbitrary-value utility:

```bash
git diff -U0 | grep -nE '(bg|text|border|ring|fill)-\[[^]]+\]'
```

And nothing slipped in as a dark-mode override:

```bash
git diff -U0 | grep -nE 'dark:(bg|text|border|ring|fill)-'
```

Every token carries both modes in one `light-dark()` declaration. A `dark:`
colour means the token layer is missing a value — fix it there.

## Did I animate a colour?

```bash
git diff -U0 | grep -nE 'transition-colors|transition:(.*),?\s*color|transition-all'
```

Colour feedback is instant — it lands on the frame it happens. What animates is
geometry and choreography, on the `--duration-*` / `--ease-*` tokens. Exits are
faster than entrances. A gradient swap on a filled control is instant too, and
that is by design: `background-image` cannot interpolate. If a change feels like
it needs a colour transition, the choreography around it is missing — add an
entrance or an exit, not a transition.

## Did I paint a gradient by hand?

```bash
git diff -U0 | grep -nE 'linear-gradient|bg-gradient|radial-gradient'
```

Gradients have three homes: the light recipes (`lit`, `edge`, `well`, `floating`,
`bg-button-*`, `bg-mark`, `bg-meter` — all already in `foundation.css`), data
(a chart series fade), and the consumer's marketing canvas. A hand-written
gradient in a component is decoration. Reach for a recipe; if none fits, the
gradient does not belong.

## Did I restack the type scale?

```bash
git diff -U0 | grep -nE '\btext-(sm|xs)\b|text-\[0\.[0-9]+rem\]'
```

Both mean the same thing: a size was picked instead of a step. `text-body-medium`
is the answer. The one exception is a `<pre>` code listing, which keeps an
explicit line-height because monospace at a loose leading is a legibility
requirement.

## Did I use a physical property where a logical one belongs?

```bash
git diff -U0 | grep -nE '(^|["'"'"' ])(ml|mr|pl|pr|left|right)-[a-z0-9]'
```

`ms`, `me`, `ps`, `pe`, `start` and `end` mirror under `dir="rtl"`; `ml` and `left`
do not. Physical is correct in exactly two places: centring with
`left-1/2 -translate-x-1/2`, and chart or canvas geometry.

## Did I put a radius on the wrong rung of the ladder?

```bash
git diff -U0 | grep -nE 'rounded-(sm|md|lg|2lg|xl|2xl|3xl|full)'
```

Every rung is a clear step down: container → `rounded-xl`. Well →
`rounded-xl`. Control → `rounded-md`. Chip → `rounded-sm`. Pill → only
if the thing is actually a pill. `rounded-2lg` is gone from the scale —
migrate it to `rounded-md` (controls) while you are here. Where borders nearly
touch, check the math: outer radius = inner radius + padding.

## Did I widen a client boundary?

```bash
git diff -U0 | grep -n '"use client"'
```

Every one of these ships to the browser along with everything under it. Adding one
to a component that did not need it is usually the difference between a 4kB page
and a 90kB one.

## Did I leave a focus trap or a broken keyboard path?

Open the change and press Tab. Then open it and press Escape. Every interactive
element needs a visible focus ring (`focus-visible`, never `outline-none` without a
replacement), and every dismissible layer needs Escape.

## Is the claim I am making true?

If the change is described as working, it works in both themes at three widths.
Check it. An unverified claim in a commit message is worse than no claim, because
the next person trusts it.
