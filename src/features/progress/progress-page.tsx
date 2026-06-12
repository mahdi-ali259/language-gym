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
  const hasRecentSessions = data.aggregation.recentSessions.length > 0;
  const summaryPayload = data.summary.upsertPayload;
  const sessionsCompleted = summaryPayload?.sessions_completed ?? 0;
  const sentencesCompleted = summaryPayload?.sentences_completed ?? 0;
  const averageAccuracy = summaryPayload?.average_accuracy_percent ?? null;
  const bestAccuracy = summaryPayload?.best_accuracy_percent ?? null;
  const currentStreakDays = data.streak.currentStreakDays;

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

      <section className="mt-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Summary</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Real saved progress
            </h2>
          </div>
          <Badge>{formatSummaryStatus(data.summary.status)}</Badge>
        </div>

        {/* TODO: Add charts, richer analytics, Progress DNA, and recommendations in later phases. */}
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <ProgressMetric
            label="Sessions completed"
            note={formatSummaryNote(data.summary.sessions.status)}
            value={String(sessionsCompleted)}
          />
          <ProgressMetric
            label="Sentences completed"
            note={formatSummaryNote(data.summary.sessions.status)}
            value={String(sentencesCompleted)}
          />
          <ProgressMetric
            label="Average accuracy"
            note={formatSummaryNote(data.summary.sessions.status)}
            value={formatPercentMetric(averageAccuracy)}
          />
          <ProgressMetric
            label="Best accuracy"
            note={formatSummaryNote(data.summary.sessions.status)}
            value={formatPercentMetric(bestAccuracy)}
          />
          <ProgressMetric
            label="Current streak"
            note={formatStreakNote(data.streak)}
            value={`${currentStreakDays} day${currentStreakDays === 1 ? "" : "s"}`}
          />
        </div>
      </section>

      <section className="mt-5">
        <div>
          <p className="text-sm font-medium text-slate-500">Activity</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            Recent practice history
          </h2>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
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
                {data.aggregation.recentSessions.map((session) => (
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
                {data.aggregation.recentMistakes.length > 0
                  ? "Latest 5"
                  : "Empty"}
              </Badge>
            </div>

            {data.aggregation.recentMistakes.length > 0 ? (
              <div className="mt-5 space-y-3">
                {data.aggregation.recentMistakes.map((mistake) => (
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
        </div>
      </section>

      <section className="mt-5">
        <div>
          <p className="text-sm font-medium text-slate-500">Weakness</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            Early mistake patterns
          </h2>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <WeakWordsCard data={data.weakness} />
          <RepeatedMistakesCard data={data.weakness} />
        </div>
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
  session: ProgressPageData["aggregation"]["recentSessions"][number];
}) {
  const accuracyLabel =
    session.accuracyPercent === null
      ? "--"
      : `${Math.round(session.accuracyPercent)}%`;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold capitalize text-slate-950">
            {session.sessionType.replace("_", " ")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(session.completedAt ?? session.startedAt)}
          </p>
        </div>
        <Badge tone={session.status === "completed" ? "success" : "neutral"}>
          {session.status}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SmallStat
          label="Sentences"
          value={String(session.sentencesCompleted)}
        />
        <SmallStat label="Accuracy" value={accuracyLabel} />
      </div>
    </div>
  );
}

function RecentMistakeRow({
  mistake
}: {
  mistake: ProgressPageData["aggregation"]["recentMistakes"][number];
}) {
  const wordLabel = mistake.wordText ?? mistake.expectedText ?? "Unknown word";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold text-slate-950">{wordLabel}</p>
        <Badge>{mistake.mistakeType.replace("_", " ")}</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {formatDate(mistake.createdAt)}
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

function WeakWordsCard({ data }: { data: ProgressPageData["weakness"] }) {
  const hasWeakWords = data.weakWords.length > 0;

  return (
    <Card className="bg-white/75">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Weak words</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Repeated word mistakes
          </h2>
        </div>
        <Badge>{formatStatus(data.status)}</Badge>
      </div>

      {hasWeakWords ? (
        <div className="mt-5 space-y-3">
          {data.weakWords.map((word) => (
            <WeakWordRow key={word.wordText} word={word} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          description="Weak words will appear after enough saved mistakes exist."
          title="No weak words detected yet"
        />
      )}

      <p className="mt-4 text-sm leading-6 text-slate-500">
        {data.recentMistakeSummary.note}
      </p>
    </Card>
  );
}

function RepeatedMistakesCard({
  data
}: {
  data: ProgressPageData["weakness"];
}) {
  const hasMistakeTypes = data.repeatedMistakeTypes.length > 0;

  return (
    <Card className="bg-white/75">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Repeated mistake types
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Simple mistake patterns
          </h2>
        </div>
        <Badge>{data.recentMistakeSummary.totalMistakesInWindow} recent</Badge>
      </div>

      {hasMistakeTypes ? (
        <div className="mt-5 space-y-3">
          {data.repeatedMistakeTypes.map((mistake) => (
            <RepeatedMistakeTypeRow
              key={mistake.mistakeType}
              mistake={mistake}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          description="Mistake type patterns need saved attempts before they can appear."
          title="No repeated mistake types yet"
        />
      )}
    </Card>
  );
}

function WeakWordRow({
  word
}: {
  word: ProgressPageData["weakness"]["weakWords"][number];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold text-slate-950">
          {word.wordText}
        </p>
        <Badge>{word.mostCommonMistakeType.replace("_", " ")}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <SmallStat label="Mistakes" value={String(word.mistakeCount)} />
        <SmallStat label="Last seen" value={formatDate(word.lastSeenAt)} />
      </div>
    </div>
  );
}

function RepeatedMistakeTypeRow({
  mistake
}: {
  mistake: ProgressPageData["weakness"]["repeatedMistakeTypes"][number];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold capitalize text-slate-950">
          {mistake.mistakeType.replace("_", " ")}
        </p>
        <Badge>{mistake.status}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <SmallStat label="Count" value={String(mistake.mistakeCount)} />
        <SmallStat label="Last seen" value={formatDate(mistake.lastSeenAt)} />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatPercentMetric(value: number | null) {
  return value === null ? "--" : `${Math.round(value)}%`;
}

function formatStatus(status: ProgressPageData["weakness"]["status"]) {
  if (status === "placeholder") {
    return "No data yet";
  }

  return status;
}

function formatSummaryStatus(status: ProgressPageData["summary"]["status"]) {
  if (status === "placeholder") {
    return "No data yet";
  }

  return status;
}

function formatSummaryNote(status: ProgressPageData["summary"]["status"]) {
  if (status === "placeholder") {
    return "No saved summary data yet.";
  }

  if (status === "limited") {
    return "Calculated from bounded saved practice data.";
  }

  return "Calculated from saved practice data.";
}

function formatStreakNote(streak: ProgressPageData["streak"]) {
  if (streak.status === "placeholder") {
    return "No completed Daily Workout yet.";
  }

  const todayLabel = streak.isTodayCompleted
    ? "Today is completed."
    : "Today is not completed yet.";

  return `${todayLabel} Based on recent Daily Workout history.`;
}
