import { DashboardClient } from "@/components/skilltrack/dashboard-client";
import { getGuestDataset } from "@/lib/skilltrack/guest-data";

export default function DashboardPage() {
  const data = getGuestDataset();

  return (
    <DashboardClient
      initialSkills={data.skills}
      initialSessions={data.sessions}
    />
  );
}
