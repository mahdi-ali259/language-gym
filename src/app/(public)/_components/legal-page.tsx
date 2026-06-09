import { Badge, GlassPanel } from "@/components/ui";

type LegalSection = {
  body: string[];
  title: string;
};

type LegalPageProps = {
  intro: string;
  sections: LegalSection[];
  title: string;
};

export function LegalPage({ intro, sections, title }: LegalPageProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <GlassPanel>
        <Badge tone="accent">MVP draft</Badge>
        <h1 className="mt-5 text-3xl font-semibold text-slate-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-600">{intro}</p>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-800">
          This page is a simple MVP draft and should be reviewed by a qualified
          legal professional before public launch.
        </p>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    className="text-sm leading-7 text-slate-600 sm:text-base"
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </GlassPanel>
    </main>
  );
}
