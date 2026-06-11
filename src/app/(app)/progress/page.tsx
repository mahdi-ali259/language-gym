import { ProgressPage } from "@/features/progress/progress-page";
import { getProgressPageData } from "@/server/progress/service";

export const dynamic = "force-dynamic";

export default async function ProgressRoute() {
  const data = await getProgressPageData();

  return <ProgressPage data={data} />;
}
