"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { guestPracticeSentences } from "./sample-sentences";
import { TypingSurface } from "./typing-surface";
import {
  getCurrentWord,
  getPracticeMatchState,
  normalizePracticeText
} from "./validation";

export function GuestPracticeClient() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [audioMessage, setAudioMessage] = useState(
    "Audio preview is visual only."
  );

  const currentSentence = guestPracticeSentences[currentIndex];
  const progressLabel = `${currentIndex + 1} of ${guestPracticeSentences.length}`;
  const progressPercent =
    ((currentIndex + 1) / guestPracticeSentences.length) * 100;
  const matchState = useMemo(
    () => getPracticeMatchState(currentSentence.english, typedText),
    [currentSentence.english, typedText]
  );
  const currentWord = getCurrentWord(currentSentence.english, typedText.length);
  const currentMeaning = currentWord
    ? currentSentence.wordMeanings?.[normalizePracticeText(currentWord)]
    : undefined;

  function handleAudioMock() {
    setAudioMessage("Audio placeholder clicked. Real playback comes later.");
  }

  const handleNext = useCallback(() => {
    if (currentIndex >= guestPracticeSentences.length - 1) {
      router.push("/guest/result");
      return;
    }

    setCurrentIndex((index) => index + 1);
    setTypedText("");
    setAudioMessage("Audio preview is visual only.");
  }, [currentIndex, router]);

  useEffect(() => {
    if (!matchState.isComplete) {
      return;
    }

    const timeout = window.setTimeout(() => {
      handleNext();
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [handleNext, matchState.isComplete]);

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
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <Badge tone={currentSentence.level === "A1" ? "accent" : "neutral"}>
            {currentSentence.level}
          </Badge>
        </div>

        <TypingSurface
          currentMeaning={currentMeaning}
          onChange={setTypedText}
          target={currentSentence.english}
          value={typedText}
        />

        <p
          className="mx-auto mt-5 max-w-2xl text-center text-xl leading-9 text-slate-600 sm:text-2xl"
          dir="rtl"
        >
          {currentSentence.arabicTranslation}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={handleAudioMock} size="sm" variant="secondary">
            Play audio
          </Button>
          <span className="text-sm font-medium text-slate-500">
            Accuracy {matchState.accuracy}%
          </span>
          <Button
            onClick={() => setTypedText("")}
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
