import { DashboardClient } from "@/components/skilltrack/dashboard-client";
import { getGuestDataset } from "@/lib/skilltrack/guest-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Full DB-backed dashboard queries are implemented in the next phase.
  const data = getGuestDataset();

  return (
    <DashboardClient
      initialSkills={data.skills}
      initialSessions={data.sessions}
      isGuest={!user}
    />
  );
}
