import { DailyWorkoutClient } from "@/features/daily-workout/daily-workout-client";
import { PracticeContentEmptyState } from "@/features/practice/content-empty-state";
import { loadWorkoutSentences } from "@/server/content/sentences";
import { getDashboardProfileData } from "@/server/dashboard/service";

export const dynamic = "force-dynamic";

export default async function DailyWorkoutPage() {
  const [data, sentences] = await Promise.all([
    getDashboardProfileData(),
    loadWorkoutSentences()
  ]);
  const levelLabel = data.level
    ? `${data.level.code} · ${data.level.name}`
    : "Selected level unavailable";

  if (sentences.length === 0) {
    return (
      <PracticeContentEmptyState
        description="No published workout sentences are available for your selected level and language pair yet."
        title="Daily Workout content is not ready yet"
      />
    );
  }

  return (
    <DailyWorkoutClient
      displayName={data.displayName}
      levelLabel={levelLabel}
      sentences={sentences}
    />
  );
}
