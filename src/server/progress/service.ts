import "server-only";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import {
  getProgressAggregation,
  type ProgressAggregationDto
} from "@/server/progress/aggregation";
import type { StreakSummaryDto } from "@/server/progress/streak";
import {
  getProgressSummaryFoundation,
  type ProgressSummaryFoundationDto
} from "@/server/progress/summary";
import {
  getWeaknessDetection,
  type WeaknessDetectionDto
} from "@/server/progress/weakness";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type Level = Database["public"]["Tables"]["levels"]["Row"];
type LanguagePair = Database["public"]["Tables"]["language_pairs"]["Row"];

export type ProgressPageData = {
  aggregation: ProgressAggregationDto;
  displayName: string;
  languagePair: LanguagePair | null;
  level: Level | null;
  profile: {
    id: string;
    onboardingCompletedAt: string | null;
  };
  streak: StreakSummaryDto;
  summary: ProgressSummaryFoundationDto;
  weakness: WeaknessDetectionDto;
};

export async function getProgressPageData(): Promise<ProgressPageData> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

// TODO:
// Progress aggregation, summary, and weakness modules currently resolve their
// own authenticated profile context. Future hardening should allow passing a
// shared server-side profile context into these modules to avoid duplicate
// auth/profile lookups on one page load.

  const [level, languagePair, aggregation, summary, weakness] =
    await Promise.all([
      profile.selected_level_id
        ? getLevelById(profile.selected_level_id)
        : Promise.resolve(null),
      profile.selected_language_pair_id
        ? getLanguagePairById(profile.selected_language_pair_id)
        : Promise.resolve(null),
      getProgressAggregation(),
      getProgressSummaryFoundation(),
      getWeaknessDetection()
    ]);

  return {
    aggregation,
    displayName: profile.display_name ?? user.email ?? "Language athlete",
    languagePair,
    level,
    profile: {
      id: profile.id,
      onboardingCompletedAt: profile.onboarding_completed_at
    },
    streak: summary.streak,
    summary,
    weakness
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
