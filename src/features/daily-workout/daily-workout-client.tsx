"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, GlassPanel } from "@/components/ui";
import { TypingSurface } from "@/components/practice/typing-surface";
import { getCurrentPracticeWord } from "@/lib/practice/current-word";
import {
  calculatePracticeSessionProgress,
  calculatePracticeSessionResult,
  completePracticeSession,
  createInitialPracticeSessionState,
  getCurrentPracticeSentence,
  isPracticeSessionComplete,
  moveToNextPracticeSentence,
  recordPracticeTypedText
} from "@/lib/practice/session";
import type { PracticeSentence } from "@/lib/practice/session";
import {
  normalizePracticeText,
  validatePracticeAnswer
} from "@/lib/practice/validation-engine";

const workoutDurationSeconds = 180;

type DailyWorkoutClientProps = {
  displayName: string;
  levelLabel: string;
  sentences: PracticeSentence[];
};

export function DailyWorkoutClient({
  displayName,
  levelLabel,
  sentences
}: DailyWorkoutClientProps) {
  const [session, setSession] = useState(() =>
    createInitialPracticeSessionState({
      mode: "daily_workout",
      sentences,
      type: "time_boxed"
    })
  );
  const [timeRemaining, setTimeRemaining] = useState(workoutDurationSeconds);
  const [audioMessage, setAudioMessage] = useState(
    "Audio preview is visual only."
  );

  const currentSentence = getCurrentPracticeSentence(session);
  const isFinished = isPracticeSessionComplete(session);
  const typedText = currentSentence
    ? (session.typedTextBySentenceId[currentSentence.id] ?? "")
    : "";
  const progress = calculatePracticeSessionProgress(session);
  const result = useMemo(
    () => calculatePracticeSessionResult(session),
    [session]
  );
  const matchState = useMemo(
    () => validatePracticeAnswer(currentSentence?.targetText ?? "", typedText),
    [currentSentence?.targetText, typedText]
  );
  const currentWord = getCurrentPracticeWord(
    currentSentence?.targetText ?? "",
    typedText.length
  );
  const currentMeaning = currentWord
    ? currentSentence?.wordMeanings?.[normalizePracticeText(currentWord)]
    : undefined;

  const finishWorkout = useCallback(() => {
    setSession((currentSession) => completePracticeSession(currentSession));
  }, []);

  const moveNext = useCallback(() => {
    setSession((currentSession) => moveToNextPracticeSentence(currentSession));
    setAudioMessage("Audio preview is visual only.");
  }, []);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          finishWorkout();
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [finishWorkout, isFinished]);

  useEffect(() => {
    if (!matchState.isCorrectEnough || isFinished) {
      return;
    }

    const timeout = window.setTimeout(() => {
      moveNext();
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [isFinished, matchState.isCorrectEnough, moveNext]);

  function handleTypedTextChange(value: string) {
    setSession((currentSession) =>
      recordPracticeTypedText(currentSession, value)
    );
  }

  function handleAudioMock() {
    setAudioMessage("Audio placeholder clicked. Real playback comes later.");
  }

  if (!currentSentence) {
    return (
      <DailyWorkoutResult
        levelLabel={levelLabel}
        result={result}
        timeRemaining={timeRemaining}
      />
    );
  }

  if (isFinished) {
    return (
      <DailyWorkoutResult
        levelLabel={levelLabel}
        result={result}
        timeRemaining={timeRemaining}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <Badge tone="accent">Daily English Workout</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Three minutes, {displayName}.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {levelLabel} · Database-backed workout preview
            </p>
          </div>

          <div className="rounded-2xl border border-white/75 bg-white/70 px-5 py-4 text-left shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Time remaining</p>
            <p className="mt-1 text-3xl font-semibold text-slate-950">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        <GlassPanel>
          <div className="mb-8 flex items-center justify-between gap-4 text-left">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-500">
                Sentence {progress.currentPosition} of {progress.totalSentences}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
            <Badge
              tone={currentSentence.levelCode === "A1" ? "accent" : "neutral"}
            >
              {currentSentence.levelCode}
            </Badge>
          </div>

          <TypingSurface
            currentMeaning={currentMeaning}
            onChange={handleTypedTextChange}
            target={currentSentence.targetText}
            value={typedText}
          />

          <p
            className="mx-auto mt-5 max-w-2xl text-center text-xl leading-9 text-slate-600 sm:text-2xl"
            dir="rtl"
          >
            {currentSentence.translationText}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={handleAudioMock} size="sm" variant="secondary">
              Play audio
            </Button>
            <span className="text-sm font-medium text-slate-500">
              Accuracy {matchState.characterAccuracy}%
            </span>
            <Button
              onClick={() => handleTypedTextChange("")}
              size="sm"
              variant="ghost"
              disabled={!typedText || matchState.isCorrectEnough}
            >
              Clear
            </Button>
            <Button onClick={finishWorkout} size="sm" variant="ghost">
              Finish
            </Button>
          </div>

          <p className="mt-3 min-h-6 text-center text-sm text-slate-400">
            {audioMessage}
          </p>
        </GlassPanel>
      </div>
    </main>
  );
}

function DailyWorkoutResult({
  levelLabel,
  result,
  timeRemaining
}: {
  levelLabel: string;
  result: ReturnType<typeof calculatePracticeSessionResult>;
  timeRemaining: number;
}) {
  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      <GlassPanel>
        <Badge tone="success">Workout complete</Badge>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section>
            <h1 className="text-3xl font-semibold text-slate-950 sm:text-5xl">
              Nice daily reps.
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              This result is local only for now. Persistence, streak updates,
              and progress summaries will come in later phases.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/progress">View Progress</Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <ResultMetric label="Level" value={levelLabel} />
            <ResultMetric label="Time left" value={formatTime(timeRemaining)} />
            <ResultMetric
              label="Sentences completed"
              value={`${result.completedSentences}/${result.totalSentences}`}
            />
            <ResultMetric
              label="Average accuracy"
              value={`${result.averageAccuracy}%`}
            />
            <Card className="bg-white/75 sm:col-span-2">
              <p className="text-sm font-medium text-slate-500">
                Mistake preview
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {result.mistakeCount}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Future versions will save repeated mistakes and weak words after
                each authenticated workout.
              </p>
            </Card>
          </section>
        </div>
      </GlassPanel>
    </main>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-white/75">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </Card>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
