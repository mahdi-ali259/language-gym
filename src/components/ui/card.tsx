import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/class-names";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
