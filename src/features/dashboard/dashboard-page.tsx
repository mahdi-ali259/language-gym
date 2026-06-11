import Link from "next/link";
import { Badge, Button, Card, GlassPanel } from "@/components/ui";
import type { DashboardProfileData } from "@/server/dashboard/service";

type DashboardPageProps = {
  data: DashboardProfileData;
};

export function DashboardPage({ data }: DashboardPageProps) {
  const levelLabel = data.level
    ? `${data.level.code} · ${data.level.name}`
    : "Level not selected";
  const languagePairLabel =
    data.languagePair?.display_name ?? "Language pair not selected";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <GlassPanel className="flex flex-col justify-between">
          <div>
            <Badge tone="accent">Today&apos;s gym</Badge>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950 sm:text-5xl">
              Welcome back, {data.displayName}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Start with a short Daily English Workout, or choose Practice Mode
              when you want a more flexible sentence session.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/workout/daily">Start Daily Workout</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/practice">Practice Mode</Link>
            </Button>
          </div>
        </GlassPanel>

        <Card className="bg-white/75">
          <p className="text-sm font-medium text-slate-500">Your setup</p>
          <div className="mt-5 space-y-4">
            <ProfileDetail label="Level" value={levelLabel} />
            <ProfileDetail label="Language path" value={languagePairLabel} />
            <ProfileDetail label="Plan" value="Free preview" />
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-3">
        <DashboardActionCard
          badge="3 minutes"
          description="A focused daily placeholder for the future timed workout loop."
          href="/workout/daily"
          title="Daily English Workout"
        />
        <DashboardActionCard
          badge="Flexible"
          description="A future configurable practice entry for sentence-count sessions."
          href="/practice"
          title="Practice Mode"
        />
        <DashboardActionCard
          badge="Preview"
          description="A lightweight progress area until real session history is persisted."
          href="/progress"
          title="View Progress"
        />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-white/75">
          <p className="text-sm font-medium text-slate-500">Streak and XP</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="Streak" value="0 days" />
            <MiniStat label="XP" value="0" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Daily Workout will count toward streaks when real practice sessions
            are implemented.
          </p>
        </Card>

        <Card className="bg-white/75">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Progress summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Your practice pattern will appear here.
              </h2>
            </div>
            <Button asChild variant="secondary">
              <Link href="/progress">View Progress</Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Accuracy" value="--" />
            <MiniStat label="Typing speed" value="--" />
            <MiniStat label="Weak words" value="--" />
          </div>
        </Card>
      </section>
    </main>
  );
}

function DashboardActionCard({
  badge,
  description,
  href,
  title
}: {
  badge: string;
  description: string;
  href: string;
  title: string;
}) {
  return (
    <Card className="flex h-full flex-col bg-white/75">
      <Badge>{badge}</Badge>
      <h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
        {description}
      </p>
      <Button asChild className="mt-5 w-full" variant="secondary">
        <Link href={href}>{title}</Link>
      </Button>
    </Card>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
