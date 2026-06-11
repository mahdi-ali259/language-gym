import { getSafePracticeSentenceCount } from "@/features/practice-mode/count";
import { PracticeSessionClient } from "@/features/practice-mode/practice-session-client";
import { practiceModeSentences } from "@/features/practice-mode/practice-sentences";
import { getDashboardProfileData } from "@/server/dashboard/service";

type PracticeSessionPageProps = {
  searchParams?: Promise<{
    count?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

export default async function PracticeSessionPage({
  searchParams
}: PracticeSessionPageProps) {
  const [data, params] = await Promise.all([
    getDashboardProfileData(),
    searchParams
  ]);
  const count = getSafePracticeSentenceCount(params?.count);
  const levelLabel = data.level
    ? `${data.level.code} · ${data.level.name}`
    : "Selected level unavailable";
  const sentences = practiceModeSentences.slice(0, count);

  return (
    <PracticeSessionClient
      count={count}
      levelLabel={levelLabel}
      sentences={sentences}
    />
  );
}
