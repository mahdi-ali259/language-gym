"use server";

import { redirect } from "next/navigation";
import {
  completeOnboarding,
  ensureCurrentProfile,
  getActiveLevels,
  getDefaultLanguagePair
} from "@/server/profile/service";

export async function selectLevelForOnboarding(formData: FormData) {
  const selectedLevelCode = formData.get("levelCode");

  if (typeof selectedLevelCode !== "string") {
    redirect("/level?setup_error=missing_level");
  }

  const profile = await ensureCurrentProfile();
  const [levels, languagePair] = await Promise.all([
    getActiveLevels(),
    getDefaultLanguagePair()
  ]);
  const selectedLevel = levels.find(
    (level) => level.code === selectedLevelCode
  );

  if (!selectedLevel) {
    redirect("/level?setup_error=level_not_found");
  }

  if (!languagePair) {
    redirect("/level?setup_error=language_pair_missing");
  }

  await completeOnboarding({
    languagePairId: languagePair.id,
    levelId: selectedLevel.id,
    profileId: profile.id
  });

  redirect("/dashboard");
}
