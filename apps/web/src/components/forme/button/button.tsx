/**
 * The button.
 *
 * **There is no `"use client"` here, and that is load-bearing.** This was on a
 * primitive — Base UI's `Button` — whose only real job was `useButton`: making
 * Enter and Space work on a non-native element, and handling `disabled` for one.
 * A native `<button>` already does all of that, in the browser, for free. The
 * primitive was only ever needed for `asChild`, and that path now merges onto the
 * child directly rather than going through it at all.
 *
 * So the dependency went, and with it the client boundary. That matters because a
 * client component cannot receive a function prop from a server component — so as
 * long as the button was a client component, `<Button leadingIcon={Plus} />` in a
 * server component failed with "Only plain objects can be passed to Client
 * Components". Every icon button in a server-rendered page hit that. Now it does
 * not, and a page full of buttons ships no JavaScript for any of them.
 *
 * The cost, stated plainly: a disabled native button is not focusable, which is
 * what the primitive's `focusableWhenDisabled` existed to change. That is standard
 * HTML behaviour and arguably the correct thing, so it is kept.
 */
import type { ButtonHTMLAttributes, ComponentType, ReactElement, ReactNode } from "react";
import { cloneElement } from "react";

import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "large" | "medium" | "small" | "xs";

/**
 * An icon for a button's leading or trailing slot.
 *
 * Pass a component reference — `leadingIcon={Plus}`, not `leadingIcon={<Plus />}` —
 * because the button sizes the icon per size step and needs to own the className.
 * An element would let a caller pass an icon at the wrong size, and the failure
 * would be a 24px icon inside a 24px button. Both forms are accepted because an
 * element is the one that survives the server/client boundary.
 *
 * Both are sized. An element arrives with the button's size classes merged onto
 * whatever className it already had, so the icon still cannot be the wrong size.
 */
export type ButtonIcon =
  | ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>
  | ReactElement<{ className?: string; "aria-hidden"?: boolean | "true" }>;

/** Renders an icon in whichever of the two forms it was given, sized to the button. */
function renderIcon(icon: ButtonIcon | undefined, sizeClass: string): ReactNode {
  if (!icon) return null;

  // An element has a `props` field; a component type does not.
  //
  // Not `typeof icon === "function"`, which looks equivalent and is wrong:
  // `forwardRef`, `memo` and `lazy` all produce *objects*, and a great many icon
  // libraries ship exactly those. Testing for `props` is the only check that
  // survives one.
  if ("props" in icon) {
    // Merge rather than replace, so a caller who already set a className keeps it.
    return cloneElement(icon, {
      className: cn(sizeClass, icon.props.className),
      "aria-hidden": true,
    });
  }

  const Icon = icon;
  return <Icon className={sizeClass} aria-hidden />;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Square, icon-only. Requires an `aria-label`: the icon is decorative, so without
   * a label the button has no accessible name at all.
   */
  iconOnly?: boolean;
  leadingIcon?: ButtonIcon;
  trailingIcon?: ButtonIcon;
  /**
   * Shows progress without losing the button. A loading button stays focusable and
   * keeps its label in place, so the width does not jump mid-click and the
   * keyboard focus does not disappear under the person using it.
   */
  loading?: boolean;
  /**
   * Render as the single child element instead of a `<button>`, keeping the styles
   * and the keyboard behaviour.
   *
   * This replaces the rendered element *and the button's own children*. That is
   * what makes it work: Base UI renders the element you hand it and keeps that
   * element's content, so a `<Link>` stays a `<Link>` with your label inside rather
   * than the label being re-wrapped around it.
   *
   * The cost is that anything the button would have composed itself has nowhere to
   * go — `leadingIcon`, `trailingIcon`, `iconOnly` and `loading` are all discarded
   * when `asChild` is set. They are documented rather than rejected, because a
   * type-level union here costs the rest of the library its literal inference on
   * `variant` and `size`, which is a far worse trade for one sharp edge.
   *
   * So: for a link that needs an icon use `ButtonLink`; for a framework link, put
   * the icon in its children.
   */
  asChild?: boolean;
}

/**
 * The sizing matrix, and the numbers behind it.
 *
 *            medium           small            xs
 *   height   36px             32px             24px
 *   radius   6px               6px              4px
 *   padding  8px              8px / 6px        8px
 *   gap      2px              2px              2px
 *   icon     16px             16px             12px
 *   label    4px inset        2px inset        2px inset
 *   type     body-medium      body-medium      caption-1-semibold
 *
 * Three steps rather than four, and the smallest is small on purpose: a 24px tier
 * is what a table row's icon action and a chip's dismiss need, and inventing a
 * 28px step to fill the gap gives a component that nothing in a real product uses.
 *
 * The type comes from the type scale and not from a `font-medium` here, so that
 * size and weight stay one decision. `text-body-medium` also carries the 20px
 * line-height that fits inside this height — see the note in foundation.css.
 */
const base =
  "relative inline-flex items-center justify-center gap-0.5 overflow-hidden whitespace-nowrap font-sans cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const sizes = {
  large: "h-11 rounded-md px-5 text-body-semibold",
  medium: "h-9 rounded-md p-2 text-body-medium",
  small: "h-8 rounded-md px-2 py-1.5 text-body-medium",
  xs: "h-6 rounded-sm px-2 text-caption-1-semibold",
} satisfies Record<ButtonSize, string>;

/**
 * Icon-only geometry.
 *
 * Padding around a 16px icon does not come out square at any height (8 + 16 + 8
 * is 32, not 36), so every size is forced to its height and the padding zeroed,
 * letting the flex centre the icon. The button then stays square if the icon
 * size or the padding ever changes.
 */
const iconOnlySizes = {
  large: "size-11 p-0",
  medium: "size-9 p-0",
  small: "size-8 p-0",
  xs: "size-6 p-0",
} satisfies Record<ButtonSize, string>;

/**
 * Icon sizes. 16px beside a 14px label, the same as every menu row, nav item and
 * field, so a button's icon never reads heavier than the text it labels. The
 * 24px xs button takes 12px, matching its 12px label.
 */
const icons = {
  large: "size-5 shrink-0",
  medium: "size-4 shrink-0",
  small: "size-4 shrink-0",
  xs: "size-3 shrink-0",
} satisfies Record<ButtonSize, string>;

/**
 * The label's own horizontal inset.
 *
 * This is what makes an icon and a text run line up optically. Without it the
 * gap between icon and text is the flex gap, and the icon sits closer to the
 * edge of the button than the text does, which reads as misaligned even when the
 * numbers are technically right.
 *
 * The gap is for everything a caller puts in the children rather than the icon
 * slots: an icon written inline, a count, a shortcut, a timestamp. Without it a
 * flex row has no space between its items and `Export` meets its icon, or
 * `Tales` meets `0:02`. An inline SVG with no size of its own gets the icon
 * slot's, so a bare `<Search />` is not Lucide's 24px default in a 36px button.
 */
const labels = {
  large:
    "inline-flex items-center justify-center gap-2 px-1.5 shrink-0 [&>svg]:shrink-0 [&>svg:not([class*='size-')]:size-5",
  medium:
    "inline-flex items-center justify-center gap-1.5 px-1 shrink-0 [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
  small:
    "inline-flex items-center justify-center gap-1.5 px-0.5 shrink-0 [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
  xs: "inline-flex items-center justify-center gap-1 px-0.5 shrink-0 [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3",
} satisfies Record<ButtonSize, string>;

/**
 * Every state change is instant. Hover and press swap a colour or a gradient on
 * the frame they happen; nothing fades. Feedback that lags the pointer reads as
 * a slow app, not a polished one.
 *
 * Disabled is one rule for every variant — 40% opacity — so a disabled button
 * still says which kind of action it would have been. A loading button is
 * `aria-disabled` too, but `aria-busy` exempts it: it is working, not
 * unavailable, and its spinner has to stay at full strength.
 */
const disabledState = "disabled:opacity-40 aria-disabled:not-aria-busy:opacity-40";

const variants = {
  // The mark recipe: lit from above, with a white inner ring. See foundation.css.
  primary: cn("bg-button-primary text-primary-foreground", disabledState),
  // The light recipe at a whisper: a graded surface, a hairline edge, and a top
  // highlight. Hover tints from the top, press sinks.
  secondary: cn(
    "border border-button-secondary bg-button-secondary text-text-primary",
    "hover:border-control-border-hover/60 active:border-control-border-active/40",
    disabledState,
  ),
  // No container until it is hovered, then the same tint every row uses.
  ghost: cn(
    "bg-ghost text-ghost-foreground hover:bg-ghost-hover active:bg-ghost-active",
    disabledState,
  ),
  danger: cn("bg-button-danger text-destructive-foreground", disabledState),
} satisfies Record<ButtonVariant, string>;

export function Button({
  className,
  variant = "primary",
  size = "medium",
  iconOnly = false,
  leadingIcon,
  trailingIcon,
  loading = false,
  asChild = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  // `aria-disabled` rather than `disabled` while loading, so the button keeps its
  // place in the tab order. A focused element cannot be `disabled` without
  // dropping focus, which would move the keyboard user's cursor out from under
  // them mid-action.
  const inert = disabled || loading;

  const className_ = cn(
    base,
    sizes[size],
    variants[variant],
    iconOnly && iconOnlySizes[size],
    className,
  );

  const { onClick, ...rest } = props;
  // Typed for the base `<button>` path. The `asChild` path clones onto a looser
  // element type, where the parameter is only ever used to stop the default.
  const suppress: React.MouseEventHandler = (event) => event.preventDefault();
  const handleClick = inert ? suppress : onClick;

  /*
   * `asChild` bypasses the primitive entirely and merges onto the child itself.
   *
   * This started as Base UI's `render` prop, which does not survive server
   * rendering: on the server it emits its own default `<button>`, and on the
   * client it emits the element you gave it. React then finds different markup on
   * each side and regenerates the subtree. Production hides this — React only
   * reports a hydration mismatch in development — so the site had been serving
   * a silently re-rendered button and nothing looked wrong. It took running a dev
   * server to see it, which is the argument for running one.
   *
   * Merging directly is also less machinery. Everything that matters for a link is
   * a class and a handler: the styling, `aria-disabled`, and refusing the
   * activation. None of it needed a button primitive underneath, and skipping it
   * removes a whole category of "the primitive expected a <button>" warning.
   */
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childDisabled = child.props["aria-disabled"] as boolean | undefined;

    return cloneElement(child, {
      ...rest,
      "data-slot": "button",
      className: cn(className_, child.props.className as string | undefined),
      "aria-busy": loading || child.props["aria-busy"],
      "aria-disabled": inert || childDisabled || undefined,
      onClick: handleClick,
    });
  }

  return (
    <button
      data-slot="button"
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={inert || undefined}
      onClick={handleClick}
      className={className_}
      {...rest}
    >
      {/* No wrapper element, so the padding arithmetic in `sizes` is the whole
          story: a medium icon-only button is square because 8 + 20 + 8 is 36, and
          an extra flex child would quietly break that.

          The spinner is positioned against the button rather than wrapped around
          the label, so the label stays exactly where it was and the button never
          changes width mid-click. */}
      {renderIcon(leadingIcon, icons[size])}

      {!iconOnly && children !== undefined && children !== null ? (
        <span className={cn(labels[size], loading && "opacity-0")}>{children}</span>
      ) : null}

      {!iconOnly ? renderIcon(trailingIcon, icons[size]) : null}

      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner color={spinnerColors[variant]} className={icons[size]} />
        </span>
      ) : null}
    </button>
  );
}

/** An anchor, so a navigational action looks like the button beside it. */
export interface ButtonLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  leadingIcon?: ButtonIcon;
  trailingIcon?: ButtonIcon;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "medium",
  iconOnly = false,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      data-slot="button-link"
      className={cn(
        base,
        sizes[size],
        variants[variant],
        iconOnly && iconOnlySizes[size],
        className,
      )}
      {...props}
    >
      {renderIcon(leadingIcon, icons[size])}

      {!iconOnly && children !== undefined && children !== null ? (
        <span className={labels[size]}>{children}</span>
      ) : null}

      {!iconOnly ? renderIcon(trailingIcon, icons[size]) : null}
    </a>
  );
}

/**
 * The spinner carries its own colour.
 *
 * Named per variant rather than inherited, so the arc is always the label's
 * colour even while the label itself is hidden at `opacity-0`.
 */
const spinnerColors = {
  primary: "text-primary-foreground",
  secondary: "text-text-primary",
  ghost: "text-ghost-foreground",
  danger: "text-destructive-foreground",
} satisfies Record<ButtonVariant, string>;

function Spinner({ className, color }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cn("animate-spin", color, className)}>
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * A guard for `asChild`.
 *
 * `render` needs a real element to merge onto. `asChild` with no element, or with
 * a fragment, is a mistake at the call site — and saying so here beats letting
 * Base UI merge props onto nothing and render an empty button that looks fine
 * until someone clicks it.
 */
function isValidElement(value: ReactNode): boolean {
  return value !== null && value !== undefined && typeof value === "object" && "type" in value;
}

export default Button;
