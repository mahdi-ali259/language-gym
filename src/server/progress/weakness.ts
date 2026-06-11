import "server-only";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type MistakeType =
  Database["public"]["Tables"]["attempt_mistakes"]["Row"]["mistake_type"];
type AttemptMistakeRow = Pick<
  Database["public"]["Tables"]["attempt_mistakes"]["Row"],
  | "actual_text"
  | "created_at"
  | "expected_text"
  | "id"
  | "mistake_type"
  | "word_text"
>;

export type WeaknessDetectionStatus = "limited" | "placeholder" | "ready";

export type WeakWordDto = {
  lastSeenAt: string;
  mistakeCount: number;
  mostCommonMistakeType: MistakeType;
  status: WeaknessDetectionStatus;
  wordText: string;
};

export type RepeatedMistakeTypeDto = {
  lastSeenAt: string;
  mistakeCount: number;
  mistakeType: MistakeType;
  status: WeaknessDetectionStatus;
};

export type RecentMistakeSummaryDto = {
  latestMistakeAt: string | null;
  note: string;
  status: WeaknessDetectionStatus;
  totalMistakesInWindow: number;
  windowLimit: number;
};

export type WeaknessDetectionDto = {
  queryBounds: {
    mistakeWindowLimit: number;
    repeatedMistakeTypeLimit: number;
    weakWordLimit: number;
  };
  recentMistakeSummary: RecentMistakeSummaryDto;
  repeatedMistakeTypes: RepeatedMistakeTypeDto[];
  status: WeaknessDetectionStatus;
  weakWords: WeakWordDto[];
};

type WeaknessDetectionContext = {
  profileId: string;
};

const mistakeWindowLimit = 100;
const weakWordLimit = 5;
const repeatedMistakeTypeLimit = 4;
const readyMistakeThreshold = 10;

export async function getWeaknessDetection(): Promise<WeaknessDetectionDto> {
  const context = await getAuthenticatedWeaknessDetectionContext();
  const mistakes = await getRecentMistakesForWeakness(context);
  const status = getDetectionStatus(mistakes.length);

  return {
    queryBounds: {
      mistakeWindowLimit,
      repeatedMistakeTypeLimit,
      weakWordLimit
    },
    recentMistakeSummary: getRecentMistakeSummaryFromRows(mistakes, status),
    repeatedMistakeTypes: getRepeatedMistakeTypesFromRows(mistakes, status),
    status,
    weakWords: getWeakWordsFromRows(mistakes, status)
  };
}

export async function getWeakWords() {
  const context = await getAuthenticatedWeaknessDetectionContext();
  const mistakes = await getRecentMistakesForWeakness(context);

  return getWeakWordsFromRows(mistakes, getDetectionStatus(mistakes.length));
}

export async function getRepeatedMistakeTypes() {
  const context = await getAuthenticatedWeaknessDetectionContext();
  const mistakes = await getRecentMistakesForWeakness(context);

  return getRepeatedMistakeTypesFromRows(
    mistakes,
    getDetectionStatus(mistakes.length)
  );
}

export async function getRecentMistakeSummary() {
  const context = await getAuthenticatedWeaknessDetectionContext();
  const mistakes = await getRecentMistakesForWeakness(context);

  return getRecentMistakeSummaryFromRows(
    mistakes,
    getDetectionStatus(mistakes.length)
  );
}

async function getAuthenticatedWeaknessDetectionContext(): Promise<WeaknessDetectionContext> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

  return {
    profileId: profile.id
  };
}

async function getRecentMistakesForWeakness({
  profileId
}: WeaknessDetectionContext) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("attempt_mistakes")
    .select(
      "actual_text, created_at, expected_text, id, mistake_type, word_text"
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(mistakeWindowLimit);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies AttemptMistakeRow[];
}

function getWeakWordsFromRows(
  mistakes: AttemptMistakeRow[],
  status: WeaknessDetectionStatus
): WeakWordDto[] {
  const words = new Map<
    string,
    {
      lastSeenAt: string;
      mistakeCountsByType: Map<MistakeType, number>;
      wordText: string;
    }
  >();

  for (const mistake of mistakes) {
    const wordText = getMistakeWordText(mistake);

    if (!wordText) {
      continue;
    }

    const key = wordText.toLowerCase();
    const existing = words.get(key) ?? {
      lastSeenAt: mistake.created_at,
      mistakeCountsByType: new Map<MistakeType, number>(),
      wordText
    };

    if (new Date(mistake.created_at) > new Date(existing.lastSeenAt)) {
      existing.lastSeenAt = mistake.created_at;
    }

    existing.mistakeCountsByType.set(
      mistake.mistake_type,
      (existing.mistakeCountsByType.get(mistake.mistake_type) ?? 0) + 1
    );
    words.set(key, existing);
  }

  return Array.from(words.values())
    .map((word) => {
      const mistakeTypes = Array.from(word.mistakeCountsByType.entries()).sort(
        ([, leftCount], [, rightCount]) => rightCount - leftCount
      );

      return {
        lastSeenAt: word.lastSeenAt,
        mistakeCount: mistakeTypes.reduce(
          (total, [, count]) => total + count,
          0
        ),
        mostCommonMistakeType: mistakeTypes[0]?.[0] ?? "wrong_word",
        status,
        wordText: word.wordText
      };
    })
    .sort((left, right) => {
      if (right.mistakeCount !== left.mistakeCount) {
        return right.mistakeCount - left.mistakeCount;
      }

      return (
        new Date(right.lastSeenAt).getTime() -
        new Date(left.lastSeenAt).getTime()
      );
    })
    .slice(0, weakWordLimit);
}

function getRepeatedMistakeTypesFromRows(
  mistakes: AttemptMistakeRow[],
  status: WeaknessDetectionStatus
): RepeatedMistakeTypeDto[] {
  const mistakeTypes = new Map<
    MistakeType,
    { lastSeenAt: string; mistakeCount: number; mistakeType: MistakeType }
  >();

  for (const mistake of mistakes) {
    const existing = mistakeTypes.get(mistake.mistake_type) ?? {
      lastSeenAt: mistake.created_at,
      mistakeCount: 0,
      mistakeType: mistake.mistake_type
    };

    existing.mistakeCount += 1;

    if (new Date(mistake.created_at) > new Date(existing.lastSeenAt)) {
      existing.lastSeenAt = mistake.created_at;
    }

    mistakeTypes.set(mistake.mistake_type, existing);
  }

  return Array.from(mistakeTypes.values())
    .sort((left, right) => {
      if (right.mistakeCount !== left.mistakeCount) {
        return right.mistakeCount - left.mistakeCount;
      }

      return (
        new Date(right.lastSeenAt).getTime() -
        new Date(left.lastSeenAt).getTime()
      );
    })
    .slice(0, repeatedMistakeTypeLimit)
    .map((mistake) => ({ ...mistake, status }));
}

function getRecentMistakeSummaryFromRows(
  mistakes: AttemptMistakeRow[],
  status: WeaknessDetectionStatus
): RecentMistakeSummaryDto {
  return {
    latestMistakeAt: mistakes[0]?.created_at ?? null,
    note:
      mistakes.length === 0
        ? "No saved mistakes yet."
        : `Calculated from the latest ${mistakeWindowLimit} saved mistakes.`,
    status,
    totalMistakesInWindow: mistakes.length,
    windowLimit: mistakeWindowLimit
  };
}

function getDetectionStatus(mistakeCount: number): WeaknessDetectionStatus {
  if (mistakeCount === 0) {
    return "placeholder";
  }

  if (mistakeCount < readyMistakeThreshold) {
    return "limited";
  }

  return "ready";
}

function getMistakeWordText(mistake: AttemptMistakeRow) {
  return (
    mistake.word_text?.trim() ||
    mistake.expected_text?.trim() ||
    mistake.actual_text?.trim() ||
    null
  );
}
