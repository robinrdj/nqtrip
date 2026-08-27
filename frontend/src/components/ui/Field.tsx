import * as LabelPrimitive from "@radix-ui/react-label";
import { AlertCircle } from "lucide-react";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";

const CONTROL_CLASSES =
  "w-full rounded-xl border bg-surface px-3.5 text-ink placeholder:text-ink-muted " +
  "transition-[border-color,box-shadow] outline-none " +
  "focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/15 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Label, control, hint and error in the arrangement every form here uses.
 *
 * The error is rendered in a container that keeps its height when empty, so a
 * message appearing does not shove the rest of the form down the page.
 */
function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <LabelPrimitive.Root
        htmlFor={htmlFor}
        className="block text-sm font-medium text-ink-soft"
      >
        {label}
      </LabelPrimitive.Root>

      {children}

      <div className="min-h-5">
        {error ? (
          <p
            id={`${htmlFor}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : hint ? (
          <p className="text-sm text-ink-muted">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  wrapperClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, error, hint, className, wrapperClassName, id, ...props },
    ref
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <FieldShell
        label={label}
        htmlFor={fieldId}
        error={error}
        hint={hint}
        className={wrapperClassName}
      >
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            CONTROL_CLASSES,
            "h-11",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/15",
            className
          )}
          {...props}
        />
      </FieldShell>
    );
  }
);

export interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, error, hint, className, id, ...props }, ref) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint}>
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            CONTROL_CLASSES,
            "min-h-28 resize-y py-2.5 leading-relaxed",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/15",
            className
          )}
          {...props}
        />
      </FieldShell>
    );
  }
);

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ label, error, hint, className, id, children, ...props }, ref) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint}>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(CONTROL_CLASSES, "h-11 pr-9", className)}
          {...props}
        >
          {children}
        </select>
      </FieldShell>
    );
  }
);
