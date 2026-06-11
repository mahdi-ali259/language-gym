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
type PracticeSession = Pick<
  Database["public"]["Tables"]["practice_sessions"]["Row"],
  | "accuracy_percent"
  | "completed_at"
  | "id"
  | "sentences_completed"
  | "session_type"
  | "started_at"
  | "status"
>;
type AttemptMistake = Pick<
  Database["public"]["Tables"]["attempt_mistakes"]["Row"],
  "created_at" | "expected_text" | "id" | "mistake_type" | "word_text"
>;

export type ProgressPageData = {
  displayName: string;
  languagePair: LanguagePair | null;
  level: Level | null;
  profile: {
    id: string;
    onboardingCompletedAt: string | null;
  };
  recentMistakes: AttemptMistake[];
  recentSessions: PracticeSession[];
};

export async function getProgressPageData(): Promise<ProgressPageData> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

  const [level, languagePair, recentSessions, recentMistakes] =
    await Promise.all([
      profile.selected_level_id
        ? getLevelById(profile.selected_level_id)
        : Promise.resolve(null),
      profile.selected_language_pair_id
        ? getLanguagePairById(profile.selected_language_pair_id)
        : Promise.resolve(null),
      getRecentPracticeSessions(profile.id),
      getRecentMistakes(profile.id)
    ]);

  return {
    displayName: profile.display_name ?? user.email ?? "Language athlete",
    languagePair,
    level,
    profile: {
      id: profile.id,
      onboardingCompletedAt: profile.onboarding_completed_at
    },
    recentMistakes,
    recentSessions
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

async function getRecentPracticeSessions(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(
      "accuracy_percent, completed_at, id, sentences_completed, session_type, started_at, status"
    )
    .eq("profile_id", profileId)
    .order("started_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies PracticeSession[];
}

async function getRecentMistakes(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("attempt_mistakes")
    .select("created_at, expected_text, id, mistake_type, word_text")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies AttemptMistake[];
}
