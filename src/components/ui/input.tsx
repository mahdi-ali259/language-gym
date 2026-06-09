import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/class-names";
import { focusRing, transitions } from "@/styles/design-tokens";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  helperText?: string;
  label?: ReactNode;
};

export function Input({
  className,
  error,
  helperText,
  id,
  label,
  ...props
}: InputProps) {
  return (
    <label className="block text-start">
      {label ? (
        <span className="mb-2 block text-sm font-medium text-slate-800">
          {label}
        </span>
      ) : null}
      <input
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-12 w-full rounded-xl border border-slate-200/90 bg-white/80 px-4 text-base text-slate-950 shadow-sm backdrop-blur placeholder:text-slate-400",
          focusRing,
          transitions,
          error ? "border-rose-300 bg-rose-50/60" : "hover:border-slate-300",
          className
        )}
        id={id}
        {...props}
      />
      {error || helperText ? (
        <span
          className={cn(
            "mt-2 block text-sm",
            error ? "text-rose-600" : "text-slate-500"
          )}
        >
          {error ?? helperText}
        </span>
      ) : null}
    </label>
  );
}
