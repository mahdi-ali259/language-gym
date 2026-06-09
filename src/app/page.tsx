export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-white/70 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Phase 1 Setup
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-5xl">
          Daily Language Gym
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          Base Next.js, TypeScript, and Tailwind CSS foundation is ready.
        </p>
      </section>
    </main>
  );
}
