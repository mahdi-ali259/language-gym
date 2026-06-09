import type { ReactNode } from "react";
import { cn } from "@/lib/class-names";
import { Button } from "./button";
import { GlassPanel } from "./glass-panel";

type ModalShellProps = {
  children: ReactNode;
  description?: string;
  isOpen: boolean;
  onClose?: () => void;
  title: string;
};

export function ModalShell({
  children,
  description,
  isOpen,
  onClose,
  title
}: ModalShellProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <GlassPanel className="w-full max-w-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          {onClose ? (
            <Button
              aria-label="Close dialog"
              className={cn("h-10 w-10 shrink-0 px-0")}
              onClick={onClose}
              variant="ghost"
            >
              x
            </Button>
          ) : null}
        </div>
        <div className="mt-6">{children}</div>
      </GlassPanel>
    </div>
  );
}
