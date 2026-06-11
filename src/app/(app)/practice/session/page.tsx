import { getSafePracticeSentenceCount } from "@/features/practice-mode/count";
import { PracticeContentEmptyState } from "@/features/practice/content-empty-state";
import { PracticeSessionClient } from "@/features/practice-mode/practice-session-client";
import { loadPracticeSentences } from "@/server/content/sentences";
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
  const sentences = await loadPracticeSentences({ limit: count });
  const levelLabel = data.level
    ? `${data.level.code} · ${data.level.name}`
    : "Selected level unavailable";

  if (sentences.length === 0) {
    return (
      <PracticeContentEmptyState
        description="No published practice sentences are available for your selected level and language pair yet."
        title="Practice content is not ready yet"
      />
    );
  }

  return (
    <PracticeSessionClient
      count={sentences.length}
      levelLabel={levelLabel}
      sentences={sentences}
    />
  );
}
