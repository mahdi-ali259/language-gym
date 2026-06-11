"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  recordPracticeTypedText,
  type PracticeSentence
} from "@/lib/practice/session";
import {
  normalizePracticeText,
  validatePracticeAnswer
} from "@/lib/practice/validation-engine";
import {
  savePracticeModeResult,
  type SaveResultActionState
} from "@/server/practice/actions";

type PracticeSessionClientProps = {
  count: number;
  levelLabel: string;
  sentences: PracticeSentence[];
};

export function PracticeSessionClient({
  count,
  levelLabel,
  sentences
}: PracticeSessionClientProps) {
  const [session, setSession] = useState(() =>
    createInitialPracticeSessionState({
      mode: "practice",
      sentences,
      type: "sentence_count"
    })
  );
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

  const finishPractice = useCallback(() => {
    setSession((currentSession) => completePracticeSession(currentSession));
  }, []);

  const moveNext = useCallback(() => {
    setSession((currentSession) => moveToNextPracticeSentence(currentSession));
    setAudioMessage("Audio preview is visual only.");
  }, []);

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

  if (!currentSentence || isFinished) {
    return (
      <PracticeSessionResult
        count={count}
        levelLabel={levelLabel}
        result={result}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge tone="accent">Practice Mode</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
              {count}-sentence practice.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {levelLabel} · Does not count toward streaks
            </p>
          </div>

          <Button asChild variant="secondary">
            <Link href="/practice">Change count</Link>
          </Button>
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
            <Button onClick={finishPractice} size="sm" variant="ghost">
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

function PracticeSessionResult({
  count,
  levelLabel,
  result
}: {
  count: number;
  levelLabel: string;
  result: ReturnType<typeof calculatePracticeSessionResult>;
}) {
  const saveStartedRef = useRef(false);
  const [saveState, setSaveState] = useState<
    SaveResultActionState | { status: "idle" | "saving"; message: string }
  >({
    message: "Save this authenticated practice result when you are ready.",
    status: "idle"
  });

  async function handleSaveResult() {
    if (saveStartedRef.current || saveState.status === "saved") {
      return;
    }

    saveStartedRef.current = true;
    setSaveState({ message: "Saving result...", status: "saving" });
    const nextSaveState = await savePracticeModeResult(result);
    setSaveState(nextSaveState);

    if (nextSaveState.status === "failed") {
      saveStartedRef.current = false;
    }
  }

  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      <GlassPanel>
        <Badge tone="success">Practice complete</Badge>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section>
            <h1 className="text-3xl font-semibold text-slate-950 sm:text-5xl">
              Practice set finished.
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Save this raw Practice Mode result now. It still does not count
              toward streaks, and progress summaries come later.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                disabled={
                  saveState.status === "saving" || saveState.status === "saved"
                }
                onClick={handleSaveResult}
                size="lg"
              >
                {saveState.status === "saving"
                  ? "Saving..."
                  : saveState.status === "saved"
                    ? "Saved"
                    : "Save Result"}
              </Button>
              <Button asChild size="lg">
                <Link href="/practice">Practice Again</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
            <SaveStatusMessage state={saveState} />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <ResultMetric label="Selected set" value={`${count} sentences`} />
            <ResultMetric label="Level" value={levelLabel} />
            <ResultMetric
              label="Completed"
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
                Future persistence will connect these results to weak words and
                progress tracking.
              </p>
            </Card>
          </section>
        </div>
      </GlassPanel>
    </main>
  );
}

function SaveStatusMessage({
  state
}: {
  state: SaveResultActionState | { status: "idle" | "saving"; message: string };
}) {
  const toneClassName =
    state.status === "saved"
      ? "border-emerald-100 bg-emerald-50/80 text-emerald-700"
      : state.status === "failed"
        ? "border-rose-100 bg-rose-50/80 text-rose-600"
        : "border-blue-100 bg-blue-50/80 text-blue-700";

  return (
    <p className={`mt-4 rounded-2xl border p-4 text-sm ${toneClassName}`}>
      {state.message}
    </p>
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
