import type { ReactNode } from "react";
import { cn } from "@/lib/class-names";

type ErrorStateProps = {
  action?: ReactNode;
  className?: string;
  message?: string;
  title?: string;
};

export function ErrorState({
  action,
  className,
  message = "Something went wrong. Please try again.",
  title = "Unable to load"
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center shadow-sm",
        className
      )}
      role="alert"
    >
      <p className="text-base font-semibold text-rose-700">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-600">
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
