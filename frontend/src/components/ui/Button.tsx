import { Slot, Slottable } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  secondary:
    "bg-surface-inset text-ink hover:bg-line disabled:text-ink-muted",
  outline:
    "border border-line-strong bg-transparent text-ink hover:bg-surface-inset",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-inset hover:text-ink",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
  icon: "h-10 w-10 justify-center",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Swaps the label for a spinner and blocks further clicks. */
  loading?: boolean;
  /** Renders as the child element (e.g. a router Link) instead of a <button>. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        // A loading button must not be clickable again, or a slow network turns
        // one booking into three.
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium",
          "transition-[background-color,box-shadow,transform] duration-150 ease-out",
          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {/*
          Slottable marks which child receives the slotted props. Without it,
          `asChild` sees the spinner and the child as two children and throws —
          Slot requires exactly one.
        */}
        <Slottable>{children}</Slottable>
      </Component>
    );
  }
);
