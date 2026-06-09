type RoutePlaceholderProps = {
  title: string;
  description: string;
  phaseLabel?: string;
};

export function RoutePlaceholder({
  title,
  description,
  phaseLabel = "Phase 2 Placeholder"
}: RoutePlaceholderProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-2xl rounded-3xl border border-white/70 bg-white/75 p-6 text-center shadow-sm backdrop-blur sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          {phaseLabel}
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </section>
    </main>
  );
}
