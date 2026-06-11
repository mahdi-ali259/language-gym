"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import {
  calculatePracticeSessionProgress,
  createInitialPracticeSessionState,
  getCurrentPracticeSentence,
  isPracticeSessionComplete,
  moveToNextPracticeSentence,
  recordPracticeTypedText,
  type PracticeSentence
} from "@/lib/practice/session";
import { TypingSurface } from "@/components/practice/typing-surface";
import { guestPracticeSentences } from "./sample-sentences";
import {
  getCurrentWord,
  getPracticeMatchState,
  normalizePracticeText
} from "./validation";

export function GuestPracticeClient() {
  const router = useRouter();
  const [session, setSession] = useState(() =>
    createInitialPracticeSessionState({
      mode: "guest",
      sentences: getGuestPracticeSessionSentences(),
      type: "sentence_count"
    })
  );
  const [audioMessage, setAudioMessage] = useState(
    "Audio preview is visual only."
  );

  const currentSentence = getCurrentPracticeSentence(session);
  const typedText = currentSentence
    ? (session.typedTextBySentenceId[currentSentence.id] ?? "")
    : "";
  const progress = calculatePracticeSessionProgress(session);
  const progressLabel = `${progress.currentPosition} of ${progress.totalSentences}`;
  const matchState = useMemo(
    () => getPracticeMatchState(currentSentence?.targetText ?? "", typedText),
    [currentSentence?.targetText, typedText]
  );
  const currentWord = getCurrentWord(
    currentSentence?.targetText ?? "",
    typedText.length
  );
  const currentMeaning = currentWord
    ? currentSentence?.wordMeanings?.[normalizePracticeText(currentWord)]
    : undefined;

  function handleAudioMock() {
    setAudioMessage("Audio placeholder clicked. Real playback comes later.");
  }

  function handleTypedTextChange(value: string) {
    setSession((currentSession) =>
      recordPracticeTypedText(currentSession, value)
    );
  }

  const handleNext = useCallback(() => {
    const nextSession = moveToNextPracticeSentence(session);

    setSession(nextSession);
    setAudioMessage("Audio preview is visual only.");

    if (isPracticeSessionComplete(nextSession)) {
      router.push("/guest/result");
    }
  }, [router, session]);

  useEffect(() => {
    if (!matchState.isComplete) {
      return;
    }

    const timeout = window.setTimeout(() => {
      handleNext();
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [handleNext, matchState.isComplete]);

  if (!currentSentence) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-5xl flex-col justify-center px-4 py-8 text-center sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4 text-left">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">
              Sentence {progressLabel}
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
            Accuracy {matchState.accuracy}%
          </span>
          <Button
            onClick={() => handleTypedTextChange("")}
            size="sm"
            variant="ghost"
            disabled={!typedText || matchState.isComplete}
          >
            Clear
          </Button>
        </div>

        <p className="mt-3 min-h-6 text-sm text-slate-400">{audioMessage}</p>
      </div>
    </main>
  );
}

function getGuestPracticeSessionSentences(): PracticeSentence[] {
  return guestPracticeSentences.map((sentence) => ({
    id: sentence.id,
    levelCode: sentence.level,
    targetText: sentence.english,
    translationText: sentence.arabicTranslation,
    wordMeanings: sentence.wordMeanings
  }));
}
