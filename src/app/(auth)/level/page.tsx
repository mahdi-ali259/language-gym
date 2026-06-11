import { redirect } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  GlassPanel
} from "@/components/ui";
import { selectLevelForOnboarding } from "@/server/profile/actions";
import {
  ensureCurrentProfile,
  getActiveLevels,
  getDefaultLanguagePair
} from "@/server/profile/service";

type LevelSelectionPageProps = {
  searchParams?: Promise<{
    setup_error?: string;
  }>;
};

const levelDescriptions: Record<string, string> = {
  A1: "Simple daily sentences",
  A2: "Common situations",
  B1: "Everyday conversation",
  B2: "Longer practical sentences",
  C1: "Advanced sentence patterns"
};

const setupErrorMessages: Record<string, string> = {
  language_pair_missing:
    "Arabic to English is not available yet. Phase 11 should seed the required language pair.",
  level_not_found:
    "That level is not available yet. Phase 11 should seed the required levels.",
  missing_level: "Choose a level before continuing.",
  profile_lookup_failed:
    "Your profile could not be checked. Please try again after the database is ready."
};

export default async function LevelSelectionPage({
  searchParams
}: LevelSelectionPageProps) {
  const params = await searchParams;
  const setupError = params?.setup_error;
  const profile = await loadProfileSetup();

  if (isSetupError(profile)) {
    return renderSetupError(profile.error);
  }

  if (profile.onboarding_completed_at) {
    redirect("/dashboard");
  }

  const setupData = await loadLevelSetup();

  if (isSetupError(setupData)) {
    return renderSetupError(setupData.error);
  }

  const { languagePair, levels } = setupData;
  const errorMessage = setupError
    ? (setupErrorMessages[setupError] ??
      "The setup page needs attention. Please try again.")
    : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <GlassPanel>
        <Badge tone="accent">Arabic to English</Badge>
        <div className="mt-5 max-w-3xl">
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-5xl">
            Choose your English level.
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Pick the level that feels closest to your current ability. You can
            adjust it later from settings.
          </p>
        </div>

        {errorMessage ? (
          <ErrorState
            className="mt-6"
            message={errorMessage}
            title="Setup needs attention"
          />
        ) : null}

        {!languagePair ? (
          <ErrorState
            className="mt-6"
            message="The default Arabic to English language pair is missing. Phase 11 should seed language and level records before onboarding can be completed."
            title="Language pair missing"
          />
        ) : null}

        {levels.length === 0 ? (
          <EmptyState
            className="mt-6"
            description="No active levels are available yet. Phase 11 should seed A1, A2, B1, B2, and C1."
            title="No levels available"
          />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {levels.map((level) => (
              <form action={selectLevelForOnboarding} key={level.id}>
                <input name="levelCode" type="hidden" value={level.code} />
                <Card className="flex h-full flex-col p-5">
                  <Badge
                    tone={
                      level.code === "A1" || level.code === "A2"
                        ? "accent"
                        : "neutral"
                    }
                  >
                    {level.code}
                  </Badge>
                  <h2 className="mt-4 text-xl font-semibold text-slate-950">
                    {level.name}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                    {level.description ??
                      levelDescriptions[level.code] ??
                      "English practice level"}
                  </p>
                  <Button
                    className="mt-5 w-full"
                    disabled={!languagePair}
                    type="submit"
                    variant="secondary"
                  >
                    Select {level.code}
                  </Button>
                </Card>
              </form>
            ))}
          </div>
        )}
      </GlassPanel>
    </main>
  );
}

async function loadProfileSetup() {
  try {
    return await ensureCurrentProfile();
  } catch {
    return {
      error: "The profile setup page could not load."
    };
  }
}

async function loadLevelSetup() {
  try {
    const [levels, languagePair] = await Promise.all([
      getActiveLevels(),
      getDefaultLanguagePair()
    ]);

    return { languagePair, levels };
  } catch {
    return {
      error: "The level setup data could not load."
    };
  }
}

function renderSetupError(message: string) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
      <ErrorState
        message={`${message} Make sure Phase 7 schema tables and Phase 11 seed records exist before testing onboarding.`}
        title="Profile setup unavailable"
      />
    </main>
  );
}

function isSetupError(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}
