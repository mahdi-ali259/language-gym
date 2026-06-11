import { DailyWorkoutClient } from "@/features/daily-workout/daily-workout-client";
import { getDashboardProfileData } from "@/server/dashboard/service";

export const dynamic = "force-dynamic";

export default async function DailyWorkoutPage() {
  const data = await getDashboardProfileData();
  const levelLabel = data.level
    ? `${data.level.code} · ${data.level.name}`
    : "Selected level unavailable";

  return (
    <DailyWorkoutClient
      displayName={data.displayName}
      levelLabel={levelLabel}
    />
  );
}
