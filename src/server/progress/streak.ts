import "server-only";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  requireCurrentUser
} from "@/server/profile/service";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

type DailyWorkoutSessionRow = Pick<
  Database["public"]["Tables"]["practice_sessions"]["Row"],
  "completed_at" | "id" | "started_at"
>;

export type StreakStatus = "limited" | "placeholder" | "ready";

export type StreakSummaryDto = {
  currentStreakDays: number;
  isTodayCompleted: boolean;
  lastWorkoutDate: string | null;
  queryBounds: {
    dailyWorkoutSessionLimit: number;
  };
  recentWorkoutDates: string[];
  status: StreakStatus;
  summaryPayload: StreakSummaryPayload | null;
};

export type StreakSummaryPayload = {
  current_streak_days: number;
  last_workout_date: string | null;
};

type StreakContext = {
  profileId: string;
};

const dailyWorkoutSessionLimit = 120;

export async function getStreakFoundation(): Promise<StreakSummaryDto> {
  const context = await getAuthenticatedStreakContext();
  const sessions = await getCompletedDailyWorkoutSessionsForStreak(context);
  const workoutDates = extractCompletedDailyWorkoutDates(sessions);
  const currentStreakDays = calculateCurrentStreakDays(workoutDates);
  const lastWorkoutDate = calculateLastWorkoutDate(workoutDates);

  return {
    currentStreakDays,
    isTodayCompleted: calculateIsTodayCompleted(workoutDates),
    lastWorkoutDate,
    queryBounds: {
      dailyWorkoutSessionLimit
    },
    recentWorkoutDates: workoutDates,
    status: getStreakStatus(workoutDates.length),
    summaryPayload: prepareStreakSummaryPayload({
      currentStreakDays,
      lastWorkoutDate
    })
  };
}

export function extractCompletedDailyWorkoutDates(
  sessions: DailyWorkoutSessionRow[]
): string[] {
  const dates = sessions
    .map((session) => getSessionWorkoutDate(session))
    .filter((date): date is string => date !== null);

  return Array.from(new Set(dates)).sort().reverse();
}

export function calculateCurrentStreakDays(
  workoutDates: string[],
  today: Date = new Date()
) {
  const uniqueDates = new Set(workoutDates);
  const todayKey = getDateKey(today);
  const yesterdayKey = getDateKey(addDays(today, -1));

  if (!uniqueDates.has(todayKey) && !uniqueDates.has(yesterdayKey)) {
    return 0;
  }

  let cursor = uniqueDates.has(todayKey) ? today : addDays(today, -1);
  let streakDays = 0;

  while (uniqueDates.has(getDateKey(cursor))) {
    streakDays += 1;
    cursor = addDays(cursor, -1);
  }

  return streakDays;
}

export function calculateIsTodayCompleted(
  workoutDates: string[],
  today: Date = new Date()
) {
  return workoutDates.includes(getDateKey(today));
}

export function calculateLastWorkoutDate(workoutDates: string[]) {
  return workoutDates[0] ?? null;
}

export function prepareStreakSummaryPayload({
  currentStreakDays,
  lastWorkoutDate
}: {
  currentStreakDays: number;
  lastWorkoutDate: string | null;
}): StreakSummaryPayload | null {
  if (!lastWorkoutDate && currentStreakDays === 0) {
    return null;
  }

  return {
    current_streak_days: currentStreakDays,
    last_workout_date: lastWorkoutDate
  };
}

async function getAuthenticatedStreakContext(): Promise<StreakContext> {
  const user = await requireCurrentUser();
  const profile = await getCurrentProfile(user.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/level");
  }

  return {
    profileId: profile.id
  };
}

async function getCompletedDailyWorkoutSessionsForStreak({
  profileId
}: StreakContext) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("completed_at, id, started_at")
    .eq("profile_id", profileId)
    .eq("session_type", "daily_workout")
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(dailyWorkoutSessionLimit);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyWorkoutSessionRow[];
}

function getSessionWorkoutDate(session: DailyWorkoutSessionRow) {
  // TODO:
  // Use the learner's product timezone once profile timezone support exists.
  // UTC date extraction is deterministic but may differ near midnight.
  return getDateKeyFromIso(session.completed_at ?? session.started_at);
}

function getDateKeyFromIso(value: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return getDateKey(timestamp);
}

function getDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);

  return next;
}

function getStreakStatus(dateCount: number): StreakStatus {
  if (dateCount === 0) {
    return "placeholder";
  }

  // TODO:
  // Exact lifetime streaks should eventually move to an RPC or materialized
  // summary so old streak history does not depend on this bounded window.
  return "limited";
}
