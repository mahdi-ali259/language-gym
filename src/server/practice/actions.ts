"use server";

import type { PracticeSessionResult } from "@/lib/practice/session";
import { savePracticeSessionResult } from "@/server/practice/persistence";

export type SaveResultActionState =
  | {
    message: string;
    practiceSessionId: string;
    status: "saved";
  }
  | {
    message: string;
    status: "failed";
  };

const dailyWorkoutDurationSeconds = 180;

export async function saveDailyWorkoutResult(
  result: PracticeSessionResult
): Promise<SaveResultActionState> {
  if (result.mode !== "daily_workout") {
    return {
      message: "Only Daily Workout results can be saved from this action.",
      status: "failed"
    };
  }

  return saveAuthenticatedPracticeResult(result, dailyWorkoutDurationSeconds);
}

export async function savePracticeModeResult(
  result: PracticeSessionResult
): Promise<SaveResultActionState> {
  if (result.mode !== "practice") {
    return {
      message: "Only Practice Mode results can be saved from this action.",
      status: "failed"
    };
  }

  return saveAuthenticatedPracticeResult(result);
}

async function saveAuthenticatedPracticeResult(
  result: PracticeSessionResult,
  targetDurationSeconds?: number
): Promise<SaveResultActionState> {
  try {
    const savedResult = await savePracticeSessionResult({
      result,
      targetDurationSeconds
    });

    return {
      message: "Result saved.",
      practiceSessionId: savedResult.practiceSessionId,
      status: "saved"
    };
  } catch {
    return {
      message: "The result could not be saved. Please try again.",
      status: "failed"
    };
  }
}
