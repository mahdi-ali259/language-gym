import { PracticeSetupPage } from "@/features/practice-mode/practice-setup-page";
import { getDashboardProfileData } from "@/server/dashboard/service";

export const dynamic = "force-dynamic";

export default async function PracticeModeSetupRoute() {
  const data = await getDashboardProfileData();

  return <PracticeSetupPage data={data} />;
}
