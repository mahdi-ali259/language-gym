import Link from "next/link";
import { Badge, Button, Card, GlassPanel } from "@/components/ui";
import { getGuestResultFallback } from "./guest-result-summary";

export function GuestResultPage() {
  const result = getGuestResultFallback();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <GlassPanel>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section>
            <Badge tone="success">Guest sample complete</Badge>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950 sm:text-5xl">
              Nice first workout.
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              You tried the core loop: read, understand the Arabic meaning, and
              type the English sentence. Create an account when you are ready to
              save progress and continue daily practice.
            </p>

            {result.isFallback ? (
              <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm leading-6 text-blue-700">
                This is a preview result. Guest metrics are not saved yet, so
                the full personalized summary will come later.
              </p>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/level">Choose your level</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/sign-in">Sign in with Google</Link>
              </Button>
            </div>
            <Button asChild className="mt-3" variant="ghost">
              <Link href="/guest/practice">Try guest practice again</Link>
            </Button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Sentences completed"
              value={String(result.sentencesCompleted)}
            />
            <MetricCard
              label="Accuracy preview"
              value={`${result.accuracy}%`}
            />
            <Card className="bg-white/75 sm:col-span-2">
              <p className="text-sm font-medium text-slate-500">
                Words to review later
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.wordsToReview.map((word) => (
                  <Badge key={word}>{word}</Badge>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Future versions can track weak words, repeated mistakes, and
                listening difficulty after you sign in.
              </p>
            </Card>
          </section>
        </div>
      </GlassPanel>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-white/75">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold text-slate-950">{value}</p>
    </Card>
  );
}
