import "server-only";
import { redirect } from "next/navigation";
import type { PracticeSentence } from "@/lib/practice/session";
import { normalizePracticeText } from "@/lib/practice/validation-engine";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type Level = Database["public"]["Tables"]["levels"]["Row"];
type LanguagePair = Database["public"]["Tables"]["language_pairs"]["Row"];
type SentenceRow = Database["public"]["Tables"]["sentences"]["Row"];
type SentenceTranslation =
  Database["public"]["Tables"]["sentence_translations"]["Row"];
type SentenceAudioAsset =
  Database["public"]["Tables"]["sentence_audio_assets"]["Row"];
type SentenceWordMeaning =
  Database["public"]["Tables"]["sentence_word_meanings"]["Row"];

export type SentenceLoadOptions = {
  limit?: number;
  offset?: number;
};

type AuthenticatedContentContext = {
  languagePair: LanguagePair;
  level: Level;
  profileId: string;
};

const defaultWorkoutSentenceLimit = 5;
const defaultPracticeSentenceLimit = 10;
const maxSentenceLimit = 50;

export async function loadWorkoutSentences(options: SentenceLoadOptions = {}) {
  return loadSentencesForLevel({
    limit: options.limit ?? defaultWorkoutSentenceLimit,
    offset: options.offset
  });
}

export async function loadPracticeSentences(options: SentenceLoadOptions = {}) {
  return loadSentencesForLevel({
    limit: options.limit ?? defaultPracticeSentenceLimit,
    offset: options.offset
  });
}

export async function loadSentencesForLevel({
  limit = defaultPracticeSentenceLimit,
  offset = 0
}: SentenceLoadOptions = {}): Promise<PracticeSentence[]> {
  const context = await getAuthenticatedContentContext();
  const packIds = await getPublishedSentencePackIds(context);

  if (packIds.length === 0) {
    return [];
  }

  const sentences = await getPublishedSentences({
    context,
    limit,
    offset,
    packIds
  });

  return mapSentenceRowsToPracticeSentences({
    context,
    sentences
  });
}

async function getAuthenticatedContentContext(): Promise<AuthenticatedContentContext> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

  if (!profile.selected_language_pair_id || !profile.selected_level_id) {
    redirect("/level");
  }

  const [languagePair, level] = await Promise.all([
    getActiveLanguagePairById(profile.selected_language_pair_id),
    getActiveLevelById(profile.selected_level_id)
  ]);

  if (!languagePair || !level) {
    return redirect("/level");
  }

  return {
    languagePair,
    level,
    profileId: profile.id
  };
}

async function getActiveLanguagePairById(languagePairId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("language_pairs")
    .select("*")
    .eq("id", languagePairId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies LanguagePair | null;
}

async function getActiveLevelById(levelId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("levels")
    .select("*")
    .eq("id", levelId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies Level | null;
}

async function getPublishedSentencePackIds({
  languagePair,
  level
}: AuthenticatedContentContext) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sentence_packs")
    .select("id")
    .eq("language_pair_id", languagePair.id)
    .eq("level_id", level.id)
    .eq("is_active", true)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((pack) => pack.id);
}

async function getPublishedSentences({
  context,
  limit,
  offset,
  packIds
}: {
  context: AuthenticatedContentContext;
  limit: number;
  offset: number;
  packIds: string[];
}) {
  const safeLimit = clampSentenceLimit(limit);
  const safeOffset = Math.max(0, offset);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sentences")
    .select("*")
    .eq("language_pair_id", context.languagePair.id)
    .eq("level_id", context.level.id)
    .eq("is_active", true)
    .eq("status", "published")
    .in("sentence_pack_id", packIds)
    .order("difficulty_score", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies SentenceRow[];
}

async function mapSentenceRowsToPracticeSentences({
  context,
  sentences
}: {
  context: AuthenticatedContentContext;
  sentences: SentenceRow[];
}) {
  if (sentences.length === 0) {
    return [];
  }

  const sentenceIds = sentences.map((sentence) => sentence.id);
  const [translations, audioAssets, wordMeanings] = await Promise.all([
    getPrimaryTranslations({
      sentenceIds,
      translationLanguageId: context.languagePair.source_language_id
    }),
    getPrimaryAudioAssets(sentenceIds),
    getWordMeanings({
      sentenceIds,
      translationLanguageId: context.languagePair.source_language_id
    })
  ]);
  const translationsBySentenceId = indexFirstBySentenceId(translations);
  const audioAssetsBySentenceId = indexFirstBySentenceId(audioAssets);
  const wordMeaningsBySentenceId = groupWordMeaningsBySentenceId(wordMeanings);

  return sentences.map((sentence) => ({
    audioPath: audioAssetsBySentenceId[sentence.id]?.storage_path,
    id: sentence.id,
    languagePairSlug: context.languagePair.slug,
    levelCode: context.level.code,
    targetText: sentence.text,
    translationText:
      translationsBySentenceId[sentence.id]?.translated_text ?? undefined,
    wordMeanings: wordMeaningsBySentenceId[sentence.id]
  }));
}

async function getPrimaryTranslations({
  sentenceIds,
  translationLanguageId
}: {
  sentenceIds: string[];
  translationLanguageId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sentence_translations")
    .select("*")
    .in("sentence_id", sentenceIds)
    .eq("language_id", translationLanguageId)
    .eq("is_primary", true)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies SentenceTranslation[];
}

async function getPrimaryAudioAssets(sentenceIds: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sentence_audio_assets")
    .select("*")
    .in("sentence_id", sentenceIds)
    .eq("is_primary", true)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies SentenceAudioAsset[];
}

async function getWordMeanings({
  sentenceIds,
  translationLanguageId
}: {
  sentenceIds: string[];
  translationLanguageId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sentence_word_meanings")
    .select("*")
    .in("sentence_id", sentenceIds)
    .or(`language_id.eq.${translationLanguageId},language_id.is.null`)
    .eq("status", "published")
    .order("position_start", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies SentenceWordMeaning[];
}

function indexFirstBySentenceId<
  Row extends { created_at: string; sentence_id: string }
>(rows: Row[]) {
  return rows.reduce<Record<string, Row>>((index, row) => {
    index[row.sentence_id] ??= row;
    return index;
  }, {});
}

function groupWordMeaningsBySentenceId(rows: SentenceWordMeaning[]) {
  return rows.reduce<Record<string, Record<string, string>>>((index, row) => {
    const sentenceMeanings = index[row.sentence_id] ?? {};
    sentenceMeanings[normalizePracticeText(row.source_text)] = row.meaning_text;
    index[row.sentence_id] = sentenceMeanings;

    return index;
  }, {});
}

function clampSentenceLimit(limit: number) {
  if (!Number.isFinite(limit)) {
    return defaultPracticeSentenceLimit;
  }

  return Math.max(1, Math.min(maxSentenceLimit, Math.trunc(limit)));
}
