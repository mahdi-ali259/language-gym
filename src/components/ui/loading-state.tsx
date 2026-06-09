import { cn } from "@/lib/class-names";

type LoadingStateProps = {
  className?: string;
  label?: string;
};

export function LoadingState({
  className,
  label = "Loading..."
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-36 flex-col items-center justify-center gap-4 rounded-2xl border border-white/70 bg-white/65 p-6 text-center shadow-sm backdrop-blur",
        className
      )}
      role="status"
    >
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 motion-reduce:animate-none" />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
