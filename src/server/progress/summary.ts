import "server-only";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type PracticeSessionSummaryRow = Pick<
  Database["public"]["Tables"]["practice_sessions"]["Row"],
  | "accuracy_percent"
  | "audio_replay_count"
  | "completed_at"
  | "id"
  | "sentences_completed"
  | "session_type"
  | "started_at"
  | "status"
  | "wpm"
>;
type SentenceAttemptSummaryRow = Pick<
  Database["public"]["Tables"]["sentence_attempts"]["Row"],
  | "accuracy_percent"
  | "audio_replay_count"
  | "id"
  | "is_correct"
  | "submitted_at"
>;
type UserProgressSummaryInsert =
  Database["public"]["Tables"]["user_progress_summaries"]["Insert"];
type UserProgressSummaryUpdate =
  Database["public"]["Tables"]["user_progress_summaries"]["Update"];

export type ProgressSummaryStatus = "limited" | "placeholder" | "ready";

export type SessionSummaryMetricsDto = {
  averageAccuracyPercent: number | null;
  averageWpm: number | null;
  bestAccuracyPercent: number | null;
  lastWorkoutDate: string | null;
  sessionsCompleted: number;
  status: ProgressSummaryStatus;
  totalAudioReplays: number;
  totalSentencesCompleted: number;
};

export type AttemptSummaryMetricsDto = {
  averageAccuracyPercent: number | null;
  correctAttempts: number;
  status: ProgressSummaryStatus;
  totalAttempts: number;
  totalAudioReplays: number;
};

export type MistakeSummaryMetricsDto = {
  status: ProgressSummaryStatus;
  totalMistakes: number;
};

export type ProgressSummaryFoundationDto = {
  attempts: AttemptSummaryMetricsDto;
  mistakes: MistakeSummaryMetricsDto;
  queryBounds: {
    attemptSummaryLimit: number;
    sessionSummaryLimit: number;
  };
  sessions: SessionSummaryMetricsDto;
  status: ProgressSummaryStatus;
  upsertPayload: UserProgressSummaryInsert | null;
};

export type ProgressSummaryUpdateResult =
  | {
      foundationStatus: ProgressSummaryStatus;
      status: "skipped";
    }
  | {
      foundationStatus: ProgressSummaryStatus;
      status: "updated";
      summaryId: string;
    };

type ProgressSummaryContext = {
  languagePairId: string;
  levelId: string | null;
  profileId: string;
};

const sessionSummaryLimit = 500;
const attemptSummaryLimit = 1000;

export async function getProgressSummaryFoundation(): Promise<ProgressSummaryFoundationDto> {
  const context = await getAuthenticatedProgressSummaryContext();
  const sessions = await getSavedPracticeSessionsForSummary(context);
  const attempts = await getSentenceAttemptsForSummary({
    profileId: context.profileId,
    sessionIds: sessions.map((session) => session.id)
  });
  const mistakes = await getTotalMistakesForSummary({
    attemptIds: attempts.map((attempt) => attempt.id),
    profileId: context.profileId
  });
  const sessionMetrics = calculateSummaryFromPracticeSessions(sessions);
  const attemptMetrics = calculateSummaryFromSentenceAttempts(attempts);
  const mistakeMetrics = calculateTotalMistakesFromAttemptMistakes(mistakes);
  const upsertPayload = prepareUserProgressSummaryUpsertPayload({
    attempts: attemptMetrics,
    context,
    mistakes: mistakeMetrics,
    sessions: sessionMetrics
  });

  return {
    attempts: attemptMetrics,
    mistakes: mistakeMetrics,
    queryBounds: {
      attemptSummaryLimit,
      sessionSummaryLimit
    },
    sessions: sessionMetrics,
    status: getSummaryStatus({
      attemptStatus: attemptMetrics.status,
      mistakeStatus: mistakeMetrics.status,
      sessionStatus: sessionMetrics.status
    }),
    upsertPayload
  };
}

export async function updateUserProgressSummaryAfterSavedSession(): Promise<ProgressSummaryUpdateResult> {
  const foundation = await getProgressSummaryFoundation();

  if (!foundation.upsertPayload) {
    return {
      foundationStatus: foundation.status,
      status: "skipped"
    };
  }

  const supabase = await createSupabaseServerClient();
  const existingSummary = await getExistingProgressSummary({
    languagePairId: foundation.upsertPayload.language_pair_id,
    levelId: foundation.upsertPayload.level_id ?? null,
    profileId: foundation.upsertPayload.profile_id
  });

  // TODO:
  // Move this manual update-or-insert flow into a database RPC/transaction
  // before high-concurrency production use. Raw practice rows remain the
  // source of truth; this summary can be safely recalculated if needed.
  if (existingSummary) {
    const { data, error } = await supabase
      .from("user_progress_summaries")
      .update(getUserProgressSummaryUpdatePayload(foundation.upsertPayload))
      .eq("id", existingSummary.id)
      .select("id")
      .single();

    if (error) {
      throw new Error("Progress summary update failed.");
    }

    return {
      foundationStatus: foundation.status,
      status: "updated",
      summaryId: data.id
    };
  }

  const { data, error } = await supabase
    .from("user_progress_summaries")
    .insert(foundation.upsertPayload)
    .select("id")
    .single();

  if (error) {
    throw new Error("Progress summary update failed.");
  }

  return {
    foundationStatus: foundation.status,
    status: "updated",
    summaryId: data.id
  };
}

export function calculateSummaryFromPracticeSessions(
  sessions: PracticeSessionSummaryRow[]
): SessionSummaryMetricsDto {
  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  );
  const accuracyValues = completedSessions
    .map((session) => session.accuracy_percent)
    .filter((value): value is number => value !== null);
  const wpmValues = completedSessions
    .map((session) => session.wpm)
    .filter((value): value is number => value !== null);
  const latestDailyWorkout = completedSessions.find(
    (session) => session.session_type === "daily_workout"
  );

  return {
    averageAccuracyPercent: getAverage(accuracyValues),
    averageWpm: getAverage(wpmValues),
    bestAccuracyPercent:
      accuracyValues.length > 0 ? Math.max(...accuracyValues) : null,
    lastWorkoutDate:
      latestDailyWorkout?.completed_at?.slice(0, 10) ??
      latestDailyWorkout?.started_at.slice(0, 10) ??
      null,
    sessionsCompleted: completedSessions.length,
    status: completedSessions.length === 0 ? "placeholder" : "limited",
    totalAudioReplays: completedSessions.reduce(
      (total, session) => total + session.audio_replay_count,
      0
    ),
    totalSentencesCompleted: completedSessions.reduce(
      (total, session) => total + session.sentences_completed,
      0
    )
  };
}

export function calculateSummaryFromSentenceAttempts(
  attempts: SentenceAttemptSummaryRow[]
): AttemptSummaryMetricsDto {
  const accuracyValues = attempts.map((attempt) => attempt.accuracy_percent);

  return {
    averageAccuracyPercent: getAverage(accuracyValues),
    correctAttempts: attempts.filter((attempt) => attempt.is_correct).length,
    status: attempts.length === 0 ? "placeholder" : "limited",
    totalAttempts: attempts.length,
    totalAudioReplays: attempts.reduce(
      (total, attempt) => total + attempt.audio_replay_count,
      0
    )
  };
}

export function calculateTotalMistakesFromAttemptMistakes(
  totalMistakes: number
): MistakeSummaryMetricsDto {
  return {
    status: totalMistakes === 0 ? "placeholder" : "limited",
    totalMistakes
  };
}

export function prepareUserProgressSummaryUpsertPayload({
  attempts,
  context,
  mistakes,
  sessions
}: {
  attempts: AttemptSummaryMetricsDto;
  context: ProgressSummaryContext;
  mistakes: MistakeSummaryMetricsDto;
  sessions: SessionSummaryMetricsDto;
}): UserProgressSummaryInsert | null {
  if (
    sessions.sessionsCompleted === 0 &&
    attempts.totalAttempts === 0 &&
    mistakes.totalMistakes === 0
  ) {
    return null;
  }

  // TODO:
  // Decide the canonical source for audio replay totals before expanding this
  // summary. If practice_sessions.audio_replay_count becomes a session
  // aggregate, do not add sentence_attempts.audio_replay_count here or replay
  // counts will be double-counted.

  return {
    average_accuracy_percent:
      sessions.averageAccuracyPercent ?? attempts.averageAccuracyPercent,
    average_wpm: sessions.averageWpm,
    best_accuracy_percent: sessions.bestAccuracyPercent,
    language_pair_id: context.languagePairId,
    last_workout_date: sessions.lastWorkoutDate,
    level_id: context.levelId,
    profile_id: context.profileId,
    sentences_completed: sessions.totalSentencesCompleted,
    sessions_completed: sessions.sessionsCompleted,
    total_audio_replays:
      sessions.totalAudioReplays + attempts.totalAudioReplays,
    total_mistakes: mistakes.totalMistakes
  };
}

// TODO:
// This manual lookup-then-insert flow can race under concurrent saves.
// Future hardening should use a database RPC or an upsert strategy compatible
// with the coalesced level_id uniqueness rule.

async function getExistingProgressSummary({
  languagePairId,
  levelId,
  profileId
}: ProgressSummaryContext) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("user_progress_summaries")
    .select("id")
    .eq("profile_id", profileId)
    .eq("language_pair_id", languagePairId)
    .limit(1);

  query = levelId ? query.eq("level_id", levelId) : query.is("level_id", null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Progress summary lookup failed.");
  }

  return data;
}

function getUserProgressSummaryUpdatePayload(
  payload: UserProgressSummaryInsert
): UserProgressSummaryUpdate {
  return {
    average_accuracy_percent: payload.average_accuracy_percent,
    average_wpm: payload.average_wpm,
    best_accuracy_percent: payload.best_accuracy_percent,
    last_workout_date: payload.last_workout_date,
    sentences_completed: payload.sentences_completed,
    sessions_completed: payload.sessions_completed,
    total_audio_replays: payload.total_audio_replays,
    total_mistakes: payload.total_mistakes,
    updated_at: new Date().toISOString()
  };
}

async function getAuthenticatedProgressSummaryContext(): Promise<ProgressSummaryContext> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

  if (!profile.selected_language_pair_id) {
    redirect("/level");
  }

  return {
    languagePairId: profile.selected_language_pair_id,
    levelId: profile.selected_level_id,
    profileId: profile.id
  };
}

async function getSavedPracticeSessionsForSummary({
  languagePairId,
  levelId,
  profileId
}: ProgressSummaryContext) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("practice_sessions")
    .select(
      "accuracy_percent, audio_replay_count, completed_at, id, sentences_completed, session_type, started_at, status, wpm"
    )
    .eq("profile_id", profileId)
    .eq("language_pair_id", languagePairId)
    .order("started_at", { ascending: false })
    .limit(sessionSummaryLimit);

  query = levelId ? query.eq("level_id", levelId) : query.is("level_id", null);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies PracticeSessionSummaryRow[];
}

async function getSentenceAttemptsForSummary({
  profileId,
  sessionIds
}: {
  profileId: string;
  sessionIds: string[];
}) {
  if (sessionIds.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sentence_attempts")
    .select(
      "accuracy_percent, audio_replay_count, id, is_correct, submitted_at"
    )
    .eq("profile_id", profileId)
    .in("practice_session_id", sessionIds)
    .order("submitted_at", { ascending: false })
    .limit(attemptSummaryLimit);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies SentenceAttemptSummaryRow[];
}

async function getTotalMistakesForSummary({
  attemptIds,
  profileId
}: {
  attemptIds: string[];
  profileId: string;
}) {
  if (attemptIds.length === 0) {
    return 0;
  }

  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("attempt_mistakes")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .in("attempt_id", attemptIds);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

function getAverage(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

function getSummaryStatus({
  attemptStatus,
  mistakeStatus,
  sessionStatus
}: {
  attemptStatus: ProgressSummaryStatus;
  mistakeStatus: ProgressSummaryStatus;
  sessionStatus: ProgressSummaryStatus;
}): ProgressSummaryStatus {
  if (
    attemptStatus === "placeholder" &&
    mistakeStatus === "placeholder" &&
    sessionStatus === "placeholder"
  ) {
    return "placeholder";
  }

  if (
    attemptStatus === "limited" ||
    mistakeStatus === "limited" ||
    sessionStatus === "limited"
  ) {
    return "limited";
  }

  return "ready";
}
