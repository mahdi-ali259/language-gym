import "server-only";
import type { PracticeMistake } from "@/lib/practice/validation-engine";
import type {
  PracticeAttemptResult,
  PracticeSessionResult
} from "@/lib/practice/session";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type PracticeSessionInsert =
  Database["public"]["Tables"]["practice_sessions"]["Insert"];
type SentenceAttemptInsert =
  Database["public"]["Tables"]["sentence_attempts"]["Insert"];
type AttemptMistakeInsert =
  Database["public"]["Tables"]["attempt_mistakes"]["Insert"];
type SentenceRow = Pick<
  Database["public"]["Tables"]["sentences"]["Row"],
  "id" | "is_active" | "language_pair_id" | "level_id" | "status"
>;
type PendingSentenceAttemptInsert = Omit<
  SentenceAttemptInsert,
  "practice_session_id"
>;
type PendingAttemptMistakeInsert = Omit<AttemptMistakeInsert, "attempt_id">;

type PersistablePracticeSessionMode = "daily_workout" | "practice";

export type SavePracticeSessionResultInput = {
  result: PracticeSessionResult;
  sentenceIdByLocalId?: Record<string, string>;
  targetDurationSeconds?: number;
};

export type PracticeSessionPersistenceRecords = {
  attempts: PendingSentenceAttemptInsert[];
  mistakesByAttemptIndex: PendingAttemptMistakeInsert[][];
  session: PracticeSessionInsert;
};

export type SavedPracticeSessionResult = {
  attemptCount: number;
  mistakeCount: number;
  practiceSessionId: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// TODO:
// This currently performs multiple inserts across
// practice_sessions, sentence_attempts, and attempt_mistakes.
//
// Future production hardening should move this write flow
// into a single database transaction or database RPC
// to prevent partial writes if one insert succeeds and
// a later insert fails.

export async function savePracticeSessionResult({
  result,
  sentenceIdByLocalId,
  targetDurationSeconds
}: SavePracticeSessionResultInput): Promise<SavedPracticeSessionResult> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    throw new Error("Practice results can only be saved after onboarding.");
  }

  if (!profile.selected_language_pair_id) {
    throw new Error("Practice results require a selected language pair.");
  }

  if (!profile.selected_level_id) {
    throw new Error("Practice results require a selected level.");
  }

  const supabase = await createSupabaseServerClient();
  const persistedSentenceIds = getPersistedSentenceIds({
    result,
    sentenceIdByLocalId
  });

  await verifyPersistedSentenceAccess({
    languagePairId: profile.selected_language_pair_id,
    levelId: profile.selected_level_id,
    sentenceIds: persistedSentenceIds,
    supabase
  });

  const records = mapPracticeSessionResultToRecords({
    languagePairId: profile.selected_language_pair_id,
    levelId: profile.selected_level_id,
    profileId: profile.id,
    result,
    sentenceIdByLocalId,
    targetDurationSeconds
  });
  const { data: savedSession, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert(records.session)
    .select("id")
    .single();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const attemptsWithSessionId = records.attempts.map((attempt) => ({
    ...attempt,
    practice_session_id: savedSession.id
  }));
  const { data: savedAttempts, error: attemptsError } = await supabase
    .from("sentence_attempts")
    .insert(attemptsWithSessionId)
    .select("id");

  if (attemptsError) {
    throw new Error(attemptsError.message);
  }
  // TODO:
  // This currently assumes Supabase returns inserted
  // sentence_attempts in the same order they were inserted.
  //
  // Future hardening should introduce a correlation key
  // (client_attempt_index or similar) and map mistakes
  // using that identifier instead of relying on return order.

  const mistakes = savedAttempts.flatMap((attempt, attemptIndex) =>
    records.mistakesByAttemptIndex[attemptIndex].map((mistake) => ({
      ...mistake,
      attempt_id: attempt.id
    }))
  );

  if (mistakes.length > 0) {
    const { error: mistakesError } = await supabase
      .from("attempt_mistakes")
      .insert(mistakes);

    if (mistakesError) {
      throw new Error(mistakesError.message);
    }
  }

  return {
    attemptCount: savedAttempts.length,
    mistakeCount: mistakes.length,
    practiceSessionId: savedSession.id
  };
}

export function mapPracticeSessionResultToRecords({
  languagePairId,
  levelId,
  profileId,
  result,
  sentenceIdByLocalId,
  targetDurationSeconds
}: {
  languagePairId: string;
  levelId: string | null;
  profileId: string;
  result: PracticeSessionResult;
  sentenceIdByLocalId?: Record<string, string>;
  targetDurationSeconds?: number;
}): PracticeSessionPersistenceRecords {
  assertPersistableSessionMode(result.mode);

  const durationSeconds = result.completedAt
    ? getDurationSeconds(result.startedAt, result.completedAt)
    : null;
  const session: PracticeSessionInsert = {
    accuracy_percent: result.averageAccuracy,
    completed_at: result.completedAt,
    duration_seconds: durationSeconds,
    language_pair_id: languagePairId,
    level_id: levelId,
    mode: "visible_sentence",
    profile_id: profileId,
    sentences_completed: result.completedSentences,
    session_type: result.mode,
    started_at: result.startedAt,
    status: result.completedAt ? "completed" : "abandoned",
    target_duration_seconds: targetDurationSeconds ?? null
  };

  const attempts = result.attempts.map((attempt) =>
    mapAttemptResultToRecord({
      attempt,
      profileId,
      sentenceId: getPersistedSentenceId(attempt, sentenceIdByLocalId)
    })
  );
  const mistakesByAttemptIndex = result.attempts.map((attempt) =>
    attempt.validation.mistakeSummary.mistakes.map((mistake) =>
      mapMistakeToRecord({
        mistake,
        profileId,
        sentenceId: getPersistedSentenceId(attempt, sentenceIdByLocalId)
      })
    )
  );

  return { attempts, mistakesByAttemptIndex, session };
}

function mapAttemptResultToRecord({
  attempt,
  profileId,
  sentenceId
}: {
  attempt: PracticeAttemptResult;
  profileId: string;
  sentenceId: string;
}): PendingSentenceAttemptInsert {
  return {
    accuracy_percent: attempt.validation.characterAccuracy,
    is_correct: attempt.validation.isCorrectEnough,
    normalized_typed_text: attempt.validation.normalizedTypedText,
    profile_id: profileId,
    sentence_id: sentenceId,
    typed_text: attempt.typedText
  };
}

function mapMistakeToRecord({
  mistake,
  profileId,
  sentenceId
}: {
  mistake: PracticeMistake;
  profileId: string;
  sentenceId: string;
}): PendingAttemptMistakeInsert {
  return {
    actual_text: mistake.actualText,
    expected_text: mistake.expectedText,
    mistake_type: mistake.type,
    position_end: null,
    position_start: mistake.index,
    profile_id: profileId,
    sentence_id: sentenceId,
    word_text: mistake.expectedText ?? mistake.actualText
  };
}

function assertPersistableSessionMode(
  mode: PracticeSessionResult["mode"]
): asserts mode is PersistablePracticeSessionMode {
  if (mode === "guest") {
    throw new Error("Guest practice results are not persisted.");
  }
}

function getPersistedSentenceIds({
  result,
  sentenceIdByLocalId
}: {
  result: PracticeSessionResult;
  sentenceIdByLocalId?: Record<string, string>;
}) {
  const sentenceIds = result.attempts.map((attempt) =>
    getPersistedSentenceId(attempt, sentenceIdByLocalId)
  );

  return Array.from(new Set(sentenceIds));
}

function getPersistedSentenceId(
  attempt: PracticeAttemptResult,
  sentenceIdByLocalId?: Record<string, string>
) {
  const mappedId = sentenceIdByLocalId?.[attempt.sentenceId];
  const sentenceId = mappedId ?? attempt.sentenceId;

  if (!uuidPattern.test(sentenceId)) {
    throw new Error(
      `Sentence ${attempt.sentenceId} must map to a persisted database sentence id before saving.`
    );
  }

  return sentenceId;
}

// TODO:
// This currently restricts saved results to the user's selected profile level.
// Future flows that allow mixed-level practice, review sessions, or explicit
// level selection should pass the intended session level/context into the
// persistence boundary and verify against that context instead.

async function verifyPersistedSentenceAccess({
  languagePairId,
  levelId,
  sentenceIds,
  supabase
}: {
  languagePairId: string;
  levelId: string;
  sentenceIds: string[];
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}) {
  if (sentenceIds.length === 0) {
    throw new Error("Practice results must include at least one sentence.");
  }

  const { data, error } = await supabase
    .from("sentences")
    .select("id, is_active, language_pair_id, level_id, status")
    .in("id", sentenceIds);

  if (error) {
    throw new Error(error.message);
  }

  const allowedSentenceIds = new Set(
    (data satisfies SentenceRow[])
      .filter(
        (sentence) =>
          sentence.is_active &&
          sentence.status === "published" &&
          sentence.language_pair_id === languagePairId &&
          sentence.level_id === levelId
      )
      .map((sentence) => sentence.id)
  );

  if (allowedSentenceIds.size !== sentenceIds.length) {
    throw new Error(
      "Practice results include sentences outside the current learner context."
    );
  }
}

function getDurationSeconds(startedAt: string, completedAt: string) {
  const started = new Date(startedAt).getTime();
  const completed = new Date(completedAt).getTime();

  if (Number.isNaN(started) || Number.isNaN(completed)) {
    return null;
  }

  return Math.max(0, Math.round((completed - started) / 1000));
}
