import Link from "next/link";
import { Badge, Button, Card, GlassPanel, Input } from "@/components/ui";

const features = [
  {
    title: "Daily English Workout",
    description: "A short daily routine designed to feel easy to start."
  },
  {
    title: "Typing + Listening Practice",
    description: "Hear the sentence, read it, and type it accurately."
  },
  {
    title: "Arabic Translation Support",
    description: "Understand the meaning while building English recall."
  },
  {
    title: "Progress Tracking",
    description: "Track accuracy, typing speed, and improvement over time."
  },
  {
    title: "Weakness Detection",
    description: "Coming later: review weak words and repeated patterns."
  },
  {
    title: "Personal Progress DNA",
    description: "Coming later: a clearer view of your learning profile."
  }
];

const levels = [
  { label: "A1", description: "Beginner daily sentences", status: "MVP focus" },
  { label: "A2", description: "Common situations", status: "MVP focus" },
  { label: "B1", description: "Everyday conversation", status: "Planned" },
  { label: "B2", description: "Longer practical sentences", status: "Planned" },
  { label: "C1", description: "Advanced sentence patterns", status: "Planned" }
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div>
          <Badge tone="accent">For Arabic speakers learning English</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Your daily language gym for English listening and typing.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Build English confidence through short daily workouts with audio,
            Arabic meaning, accurate typing, and simple progress feedback.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/guest/practice">Start Guest Practice</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
          <div className="mt-7 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <p>3-minute daily workout</p>
            <p>Listen, read, type</p>
            <p>Track measurable progress</p>
          </div>
        </div>

        <PracticePreview />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 max-w-2xl">
          <Badge>Product promise</Badge>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            Built around the daily habit loop.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            The MVP stays focused: practice a little, get feedback, and return
            tomorrow.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white/75">
              <h3 className="text-lg font-semibold text-slate-950">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <GlassPanel>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge tone="success">Levels preview</Badge>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                Start simple. Grow through levels.
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                The product is designed for A1 through C1. The first real
                content can begin with A1 and A2 while the system stays ready
                for higher levels.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {levels.map((level) => (
                <Card key={level.label} className="p-4">
                  <p className="text-2xl font-semibold text-slate-950">
                    {level.label}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {level.description}
                  </p>
                  <Badge
                    className="mt-4"
                    tone={level.status === "MVP focus" ? "accent" : "neutral"}
                  >
                    {level.status}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-white/80">
            <Badge tone="accent">Free access</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              Try the daily habit for free.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Free users will get limited daily access, enough to build the
              habit and feel the practice loop.
            </p>
          </Card>
          <Card className="bg-white/80">
            <Badge>Premium later</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              Advanced practice is planned.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Premium can later unlock expanded practice, deeper stats, more
              sentence packs, and weakness analysis. Payments are not part of
              the MVP.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
        <GlassPanel>
          <Badge tone="success">Ready for your first rep?</Badge>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Start with a short guest practice.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            No account needed for the first sample. Listen, type, and see how
            the workout feels.
          </p>
          <div className="mt-7">
            <Button asChild size="lg">
              <Link href="/guest/practice">Start Guest Practice</Link>
            </Button>
          </div>
        </GlassPanel>
      </section>
    </main>
  );
}

function PracticePreview() {
  return (
    <GlassPanel className="relative overflow-hidden">
      <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-blue-200/35 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="accent">Visual preview</Badge>
          <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            92% accuracy
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">English sentence</p>
          <p className="mt-2 text-2xl font-semibold leading-snug text-slate-950">
            I practice English for ten minutes every day.
          </p>
          <p
            className="mt-4 text-right text-base leading-7 text-slate-600"
            dir="rtl"
          >
            أتدرب على الإنجليزية لمدة عشر دقائق كل يوم.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button className="pointer-events-none" variant="secondary">
            Play audio
          </Button>
          <div className="grid flex-1 grid-cols-2 gap-3">
            <Metric label="WPM" value="28" />
            <Metric label="Mistakes" value="2" />
          </div>
        </div>

        <div className="mt-4">
          <Input
            aria-label="Typing input preview"
            readOnly
            value="I practice English for ten minutes every day."
          />
        </div>
      </div>
    </GlassPanel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/65 p-3 text-center shadow-sm backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
