import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/class-names";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/70 bg-white/65 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
