import Link from "next/link";
import { Badge, Button, Card, EmptyState, GlassPanel } from "@/components/ui";
import type { ProgressPageData } from "@/server/progress/service";

type ProgressPageProps = {
  data: ProgressPageData;
};

export function ProgressPage({ data }: ProgressPageProps) {
  const levelLabel = data.level
    ? `${data.level.code} · ${data.level.name}`
    : "Level not selected";
  const languagePairLabel =
    data.languagePair?.display_name ?? "Language pair not selected";
  const hasRecentSessions = data.recentSessions.length > 0;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <GlassPanel className="flex min-h-[19rem] flex-col justify-between">
          <div>
            <Badge tone="accent">Progress foundation</Badge>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950 sm:text-5xl">
              Your learning progress
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              A clean starting point for saved practice history, built around
              your current profile and ready for richer summaries later.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/practice">Practice Mode</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/workout/daily">Daily Workout</Link>
            </Button>
          </div>
        </GlassPanel>

        <Card className="bg-white/75">
          <p className="text-sm font-medium text-slate-500">Profile snapshot</p>
          <div className="mt-5 space-y-4">
            <ProgressDetail label="Learner" value={data.displayName} />
            <ProgressDetail label="Current level" value={levelLabel} />
            <ProgressDetail label="Language pair" value={languagePairLabel} />
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <ProgressMetric
          label="Current level"
          note="Read from your profile."
          value={levelLabel}
        />
        <ProgressMetric
          label="Language pair"
          note="Read from your profile."
          value={languagePairLabel}
        />
        <ProgressMetric
          label="Total sentences"
          note="Progress summaries will power this later."
          value="--"
        />
        <ProgressMetric
          label="Average accuracy"
          note="Analytics are intentionally deferred."
          value="--"
        />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-white/75">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Recent saved sessions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Session history will fill in here.
              </h2>
            </div>
            <Badge>{hasRecentSessions ? "Read-only" : "No data yet"}</Badge>
          </div>

          {hasRecentSessions ? (
            <div className="mt-5 space-y-3">
              {data.recentSessions.map((session) => (
                <RecentSessionRow key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-5"
              description="Saved authenticated sessions can appear here once Practice Mode or Daily Workout starts writing results."
              title="No saved sessions yet"
            />
          )}
        </Card>

        <Card className="bg-white/75">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Recent mistakes
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Mistake review starts simple.
              </h2>
            </div>
            <Badge>
              {data.recentMistakes.length > 0 ? "Latest 5" : "Empty"}
            </Badge>
          </div>

          {data.recentMistakes.length > 0 ? (
            <div className="mt-5 space-y-3">
              {data.recentMistakes.map((mistake) => (
                <RecentMistakeRow key={mistake.id} mistake={mistake} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-5"
              description="Mistakes will appear after authenticated practice results are persisted."
              title="No mistakes saved yet"
            />
          )}
        </Card>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-2">
        <ComingLaterCard
          label="Weak words"
          title="Weak words coming later"
          description="This remains placeholder-only until the weakness detection phase defines reliable word scoring."
        />
        <ComingLaterCard
          label="Progress DNA"
          title="Progress DNA coming later"
          description="The fuller learning profile dashboard is deferred until the approved roadmap reaches analytics."
        />
      </section>
    </main>
  );
}

function ProgressDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ProgressMetric({
  label,
  note,
  value
}: {
  label: string;
  note: string;
  value: string;
}) {
  return (
    <Card className="bg-white/75">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{note}</p>
    </Card>
  );
}

function RecentSessionRow({
  session
}: {
  session: ProgressPageData["recentSessions"][number];
}) {
  const accuracyLabel =
    session.accuracy_percent === null
      ? "--"
      : `${Math.round(session.accuracy_percent)}%`;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold capitalize text-slate-950">
            {session.session_type.replace("_", " ")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(session.completed_at ?? session.started_at)}
          </p>
        </div>
        <Badge tone={session.status === "completed" ? "success" : "neutral"}>
          {session.status}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SmallStat
          label="Sentences"
          value={String(session.sentences_completed)}
        />
        <SmallStat label="Accuracy" value={accuracyLabel} />
      </div>
    </div>
  );
}

function RecentMistakeRow({
  mistake
}: {
  mistake: ProgressPageData["recentMistakes"][number];
}) {
  const wordLabel =
    mistake.word_text ?? mistake.expected_text ?? "Unknown word";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold text-slate-950">{wordLabel}</p>
        <Badge>{mistake.mistake_type.replace("_", " ")}</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {formatDate(mistake.created_at)}
      </p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ComingLaterCard({
  description,
  label,
  title
}: {
  description: string;
  label: string;
  title: string;
}) {
  return (
    <Card className="bg-white/75">
      <Badge>{label}</Badge>
      <h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
