import "server-only";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type PracticeSessionRow = Pick<
  Database["public"]["Tables"]["practice_sessions"]["Row"],
  | "accuracy_percent"
  | "completed_at"
  | "id"
  | "sentences_completed"
  | "session_type"
  | "started_at"
  | "status"
>;
type AttemptMistakeRow = Pick<
  Database["public"]["Tables"]["attempt_mistakes"]["Row"],
  "created_at" | "expected_text" | "id" | "mistake_type" | "word_text"
>;

export type ProgressMetricStatus = "limited" | "placeholder" | "ready";

export type ProgressNumberMetricDto = {
  note: string;
  status: ProgressMetricStatus;
  value: number | null;
};

export type RecentAccuracyPointDto = {
  accuracyPercent: number;
  completedAt: string | null;
  sessionId: string;
  sessionType: "daily_workout" | "guest" | "practice";
  startedAt: string;
};

export type RecentSessionDto = {
  accuracyPercent: number | null;
  completedAt: string | null;
  id: string;
  sentencesCompleted: number;
  sessionType: "daily_workout" | "guest" | "practice";
  startedAt: string;
  status: "abandoned" | "completed" | "started";
};

export type RecentMistakeDto = {
  createdAt: string;
  expectedText: string | null;
  id: string;
  mistakeType:
    | "capitalization"
    | "extra_word"
    | "missing_word"
    | "punctuation"
    | "spelling"
    | "word_order"
    | "wrong_word";
  wordText: string | null;
};

export type ProgressAggregationDto = {
  averageAccuracy: ProgressNumberMetricDto;
  queryBounds: {
    recentAccuracyLimit: number;
    recentMistakeLimit: number;
    recentSessionLimit: number;
    summarySessionLimit: number;
  };
  recentAccuracyTrend: RecentAccuracyPointDto[];
  totalMistakeCount: ProgressNumberMetricDto;
  recentMistakes: RecentMistakeDto[];
  recentSessions: RecentSessionDto[];
  totalSentencesCompleted: ProgressNumberMetricDto;
  totalSessions: ProgressNumberMetricDto;
};

type ProgressAggregationContext = {
  profileId: string;
};

const recentSessionLimit = 5;
const recentMistakeLimit = 5;
const recentAccuracyLimit = 10;
const summarySessionLimit = 100;

export async function getProgressAggregation(): Promise<ProgressAggregationDto> {
  const context = await getAuthenticatedProgressAggregationContext();
  const [totalSessions, summarySessions, recentSessions, recentMistakes] =
    await Promise.all([
      getTotalSessionsForContext(context),
      getSummarySessionsForContext(context),
      getRecentSessionsForContext(context),
      getRecentMistakesForContext(context)
    ]);

  return {
    averageAccuracy: getAverageAccuracyFromSessions(summarySessions),
    queryBounds: {
      recentAccuracyLimit,
      recentMistakeLimit,
      recentSessionLimit,
      summarySessionLimit
    },
    recentAccuracyTrend: getRecentAccuracyTrendFromSessions(summarySessions),
    totalMistakeCount: await getTotalMistakeCountForContext(context),
    recentMistakes: recentMistakes.map(mapRecentMistake),
    recentSessions: recentSessions.map(mapRecentSession),
    totalSentencesCompleted:
      getTotalSentencesCompletedFromSessions(summarySessions),
    totalSessions
  };
}

export async function getTotalSessions() {
  return getTotalSessionsForContext(
    await getAuthenticatedProgressAggregationContext()
  );
}

export async function getTotalSentencesCompleted() {
  const context = await getAuthenticatedProgressAggregationContext();
  return getTotalSentencesCompletedFromSessions(
    await getSummarySessionsForContext(context)
  );
}

export async function getAverageAccuracy() {
  const context = await getAuthenticatedProgressAggregationContext();
  return getAverageAccuracyFromSessions(
    await getSummarySessionsForContext(context)
  );
}

export async function getRecentAccuracyTrend() {
  const context = await getAuthenticatedProgressAggregationContext();
  return getRecentAccuracyTrendFromSessions(
    await getSummarySessionsForContext(context)
  );
}

export async function getTotalMistakeCount() {
  return getTotalMistakeCountForContext(
    await getAuthenticatedProgressAggregationContext()
  );
}

async function getAuthenticatedProgressAggregationContext(): Promise<ProgressAggregationContext> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

  return {
    profileId: profile.id
  };
}

async function getTotalSessionsForContext({
  profileId
}: ProgressAggregationContext): Promise<ProgressNumberMetricDto> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("practice_sessions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    note: "Exact count from saved authenticated sessions.",
    status: "ready",
    value: count ?? 0
  };
}

async function getSummarySessionsForContext({
  profileId
}: ProgressAggregationContext) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(
      "accuracy_percent, completed_at, id, sentences_completed, session_type, started_at, status"
    )
    .eq("profile_id", profileId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(summarySessionLimit);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies PracticeSessionRow[];
}

async function getRecentSessionsForContext({
  profileId
}: ProgressAggregationContext) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(
      "accuracy_percent, completed_at, id, sentences_completed, session_type, started_at, status"
    )
    .eq("profile_id", profileId)
    .order("started_at", { ascending: false })
    .limit(recentSessionLimit);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies PracticeSessionRow[];
}

async function getRecentMistakesForContext({
  profileId
}: ProgressAggregationContext) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("attempt_mistakes")
    .select("created_at, expected_text, id, mistake_type, word_text")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(recentMistakeLimit);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies AttemptMistakeRow[];
}

async function getTotalMistakeCountForContext({
  profileId
}: ProgressAggregationContext): Promise<ProgressNumberMetricDto> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("attempt_mistakes")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    note: "Exact count from saved authenticated mistakes.",
    status: "ready",
    value: count ?? 0
  };
}

function getTotalSentencesCompletedFromSessions(
  sessions: PracticeSessionRow[]
): ProgressNumberMetricDto {
  return {
    note: `Calculated from the most recent ${summarySessionLimit} completed sessions until progress summaries are introduced.`,
    status: "limited",
    value: sessions.reduce(
      (total, session) => total + session.sentences_completed,
      0
    )
  };
}

function getAverageAccuracyFromSessions(
  sessions: PracticeSessionRow[]
): ProgressNumberMetricDto {
  const accuracyValues = sessions
    .map((session) => session.accuracy_percent)
    .filter((value): value is number => value !== null);

  if (accuracyValues.length === 0) {
    return {
      note: "No saved accuracy data yet.",
      status: "placeholder",
      value: null
    };
  }

  return {
    note: `Average from the most recent ${summarySessionLimit} completed sessions with saved accuracy.`,
    status: "limited",
    value: Math.round(
      accuracyValues.reduce((total, value) => total + value, 0) /
        accuracyValues.length
    )
  };
}

function getRecentAccuracyTrendFromSessions(
  sessions: PracticeSessionRow[]
): RecentAccuracyPointDto[] {
  return sessions
    .filter(
      (session): session is PracticeSessionRow & { accuracy_percent: number } =>
        session.accuracy_percent !== null
    )
    .slice(0, recentAccuracyLimit)
    .reverse()
    .map((session) => ({
      accuracyPercent: Math.round(session.accuracy_percent),
      completedAt: session.completed_at,
      sessionId: session.id,
      sessionType: session.session_type,
      startedAt: session.started_at
    }));
}

function mapRecentSession(session: PracticeSessionRow): RecentSessionDto {
  return {
    accuracyPercent: session.accuracy_percent,
    completedAt: session.completed_at,
    id: session.id,
    sentencesCompleted: session.sentences_completed,
    sessionType: session.session_type,
    startedAt: session.started_at,
    status: session.status
  };
}

function mapRecentMistake(mistake: AttemptMistakeRow): RecentMistakeDto {
  return {
    createdAt: mistake.created_at,
    expectedText: mistake.expected_text,
    id: mistake.id,
    mistakeType: mistake.mistake_type,
    wordText: mistake.word_text
  };
}
