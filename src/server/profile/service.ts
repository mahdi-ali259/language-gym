import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { getCurrentUser } from "@/server/auth/session";
import type { Database } from "@/types/database";

export const DEFAULT_LANGUAGE_PAIR_SLUG = "ar-en";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Level = Database["public"]["Tables"]["levels"]["Row"];
type LanguagePair = Database["public"]["Tables"]["language_pairs"]["Row"];

function getUserDisplayName(user: User) {
  const fullName = user.user_metadata.full_name;
  const name = user.user_metadata.name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName;
  }

  if (typeof name === "string" && name.trim()) {
    return name;
  }

  return user.email ?? null;
}

function getUserAvatarUrl(user: User) {
  const avatarUrl = user.user_metadata.avatar_url;
  return typeof avatarUrl === "string" ? avatarUrl : null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function getCurrentProfile(authUserId?: string) {
  const userId = authUserId ?? (await requireCurrentUser()).id;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createProfileIfMissing(user: User) {
  const existingProfile = await getCurrentProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      auth_user_id: user.id,
      avatar_url: getUserAvatarUrl(user),
      display_name: getUserDisplayName(user)
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function ensureCurrentProfile() {
  const user = await requireCurrentUser();
  return createProfileIfMissing(user);
}

export async function getActiveLevels() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies Level[];
}

export async function getDefaultLanguagePair() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("language_pairs")
    .select("*")
    .eq("slug", DEFAULT_LANGUAGE_PAIR_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies LanguagePair | null;
}

export async function updateSelectedLevel(profileId: string, levelId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ selected_level_id: levelId })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies Profile;
}

export async function updateSelectedLanguagePair(
  profileId: string,
  languagePairId: string
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ selected_language_pair_id: languagePairId })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies Profile;
}

export async function markOnboardingCompleted(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies Profile;
}

export async function completeOnboarding({
  languagePairId,
  levelId,
  profileId
}: {
  languagePairId: string;
  levelId: string;
  profileId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      selected_language_pair_id: languagePairId,
      selected_level_id: levelId
    })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies Profile;
}
