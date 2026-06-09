import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode
} from "react";
import { cn } from "@/lib/class-names";
import { focusRing, transitions } from "@/styles/design-tokens";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] hover:bg-blue-500 active:bg-blue-700",
  secondary:
    "border border-white/75 bg-white/70 text-slate-900 shadow-sm backdrop-blur hover:bg-white/85 active:bg-white",
  ghost: "text-slate-700 hover:bg-white/55 active:bg-white/75",
  success:
    "bg-emerald-600 text-white shadow-[0_12px_30px_rgba(5,150,105,0.18)] hover:bg-emerald-500 active:bg-emerald-700",
  danger:
    "bg-rose-600 text-white shadow-[0_12px_30px_rgba(225,29,72,0.18)] hover:bg-rose-500 active:bg-rose-700"
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base"
};

export function Button({
  asChild = false,
  children,
  className,
  disabled,
  isLoading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex items-center justify-center rounded-xl font-medium",
    "disabled:cursor-not-allowed disabled:opacity-55",
    focusRing,
    transitions,
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && isValidElement<{ className?: string }>(children)) {
    const child = children as ReactElement<{ className?: string }>;

    return cloneElement(child, {
      className: cn(buttonClassName, child.props.className)
    });
  }

  return (
    <button
      className={buttonClassName}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
