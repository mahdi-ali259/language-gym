import "server-only";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type Level = Database["public"]["Tables"]["levels"]["Row"];
type LanguagePair = Database["public"]["Tables"]["language_pairs"]["Row"];

export type DashboardProfileData = {
  displayName: string;
  languagePair: LanguagePair | null;
  level: Level | null;
  profile: {
    id: string;
    onboardingCompletedAt: string | null;
  };
};

export async function getDashboardProfileData(): Promise<DashboardProfileData> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

  const [level, languagePair] = await Promise.all([
    profile.selected_level_id
      ? getLevelById(profile.selected_level_id)
      : Promise.resolve(null),
    profile.selected_language_pair_id
      ? getLanguagePairById(profile.selected_language_pair_id)
      : Promise.resolve(null)
  ]);

  return {
    displayName: profile.display_name ?? user.email ?? "Language athlete",
    languagePair,
    level,
    profile: {
      id: profile.id,
      onboardingCompletedAt: profile.onboarding_completed_at
    }
  };
}

async function getLevelById(levelId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .eq("id", levelId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies Level | null;
}

async function getLanguagePairById(languagePairId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("language_pairs")
    .select("*")
    .eq("id", languagePairId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies LanguagePair | null;
}
