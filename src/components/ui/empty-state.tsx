import type { ReactNode } from "react";
import { cn } from "@/lib/class-names";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

export function EmptyState({
  action,
  className,
  description = "There is nothing to show here yet.",
  title = "No data yet"
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-center shadow-sm backdrop-blur",
        className
      )}
    >
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
