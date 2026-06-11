import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { getDashboardProfileData } from "@/server/dashboard/service";

export const dynamic = "force-dynamic";

export default async function DashboardRoute() {
  const data = await getDashboardProfileData();

  return <DashboardPage data={data} />;
}
