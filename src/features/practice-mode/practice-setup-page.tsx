import Link from "next/link";
import { Badge, Button, Card, GlassPanel } from "@/components/ui";
import type { DashboardProfileData } from "@/server/dashboard/service";

const sentenceCountOptions = [5, 10, 15] as const;

type PracticeSetupPageProps = {
  data: DashboardProfileData;
};

export function PracticeSetupPage({ data }: PracticeSetupPageProps) {
  const levelLabel = data.level
    ? `${data.level.code} · ${data.level.name}`
    : "Selected level unavailable";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <GlassPanel>
        <Badge tone="accent">Practice Mode</Badge>
        <div className="mt-5 max-w-3xl">
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-5xl">
            Choose your sentence count.
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Practice Mode is flexible and does not count toward streaks yet.
            Pick a short local session and focus on clean typing accuracy.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/75 bg-white/70 p-4 shadow-sm backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Current setup</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            {levelLabel}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {data.languagePair?.display_name ?? "Language path unavailable"}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {sentenceCountOptions.map((count) => (
            <Card className="flex h-full flex-col bg-white/75" key={count}>
              <Badge>{count} sentences</Badge>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                {getOptionTitle(count)}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {getOptionDescription(count)}
              </p>
              <Button asChild className="mt-5 w-full" size="lg">
                <Link href={`/practice/session?count=${count}`}>
                  Start Practice
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </GlassPanel>
    </main>
  );
}

function getOptionTitle(count: number) {
  if (count === 5) {
    return "Quick reps";
  }

  if (count === 10) {
    return "Focused set";
  }

  return "Longer practice";
}

function getOptionDescription(count: number) {
  if (count === 5) {
    return "A short warm-up when you want a fast sentence practice loop.";
  }

  if (count === 10) {
    return "A balanced local practice set for accuracy and rhythm.";
  }

  return "A longer local session for building typing stamina.";
}
