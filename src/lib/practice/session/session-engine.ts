import {
  type PracticeMistakeSummary,
  type PracticeMistakeType,
  validatePracticeAnswer
} from "@/lib/practice/validation-engine";
import type {
  PracticeAttemptResult,
  PracticeSentence,
  PracticeSessionMode,
  PracticeSessionProgress,
  PracticeSessionResult,
  PracticeSessionState,
  PracticeSessionType
} from "./types";

type CreatePracticeSessionStateOptions = {
  mode: PracticeSessionMode;
  now?: string;
  sentences: PracticeSentence[];
  type: PracticeSessionType;
};

const emptyMistakeCounts: Record<PracticeMistakeType, number> = {
  extra_word: 0,
  missing_word: 0,
  spelling: 0,
  wrong_word: 0
};

export function createInitialPracticeSessionState({
  mode,
  now,
  sentences,
  type
}: CreatePracticeSessionStateOptions): PracticeSessionState {
  const startedAt = now ?? new Date().toISOString();

  return {
    completedAt: null,
    currentIndex: 0,
    mode,
    sentenceOrder: sentences.map((sentence) => sentence.id),
    sentencesById: Object.fromEntries(
      sentences.map((sentence) => [sentence.id, sentence])
    ),
    startedAt,
    typedTextBySentenceId: {},
    type
  };
}

export function getCurrentPracticeSentence(
  state: PracticeSessionState
): PracticeSentence | null {
  const sentenceId = state.sentenceOrder[state.currentIndex];

  return sentenceId ? state.sentencesById[sentenceId] : null;
}

export function recordPracticeTypedText(
  state: PracticeSessionState,
  typedText: string
): PracticeSessionState {
  const currentSentence = getCurrentPracticeSentence(state);

  if (!currentSentence || state.completedAt) {
    return state;
  }

  return {
    ...state,
    typedTextBySentenceId: {
      ...state.typedTextBySentenceId,
      [currentSentence.id]: typedText
    }
  };
}

export function calculatePracticeSessionProgress(
  state: PracticeSessionState
): PracticeSessionProgress {
  const totalSentences = state.sentenceOrder.length;
  const completedSentences = getCompletedAttempts(state).length;
  const isComplete = isPracticeSessionComplete(state);
  const currentPosition =
    totalSentences === 0 ? 0 : Math.min(state.currentIndex + 1, totalSentences);
  const progressBase = isComplete ? totalSentences : currentPosition;

  return {
    completedSentences,
    currentIndex: state.currentIndex,
    currentPosition,
    isComplete,
    percent: getPercentage(progressBase, totalSentences),
    totalSentences
  };
}

export function moveToNextPracticeSentence(
  state: PracticeSessionState,
  now?: string
): PracticeSessionState {
  if (state.completedAt) {
    return state;
  }

  const nextIndex = state.currentIndex + 1;

  if (nextIndex >= state.sentenceOrder.length) {
    return {
      ...state,
      completedAt: now ?? new Date().toISOString(),
      currentIndex: Math.max(0, state.sentenceOrder.length - 1)
    };
  }

  return {
    ...state,
    currentIndex: nextIndex
  };
}

export function completePracticeSession(
  state: PracticeSessionState,
  now?: string
): PracticeSessionState {
  if (state.completedAt) {
    return state;
  }

  return {
    ...state,
    completedAt: now ?? new Date().toISOString()
  };
}

export function isPracticeSessionComplete(state: PracticeSessionState) {
  return Boolean(state.completedAt);
}

export function calculatePracticeSessionResult(
  state: PracticeSessionState
): PracticeSessionResult {
  const attempts = state.sentenceOrder.map((sentenceId) =>
    getPracticeAttemptResult(state, sentenceId)
  );
  const completedAttempts = attempts.filter(
    (attempt) => attempt.validation.isCorrectEnough
  );
  const mistakeSummary = mergeMistakeSummaries(
    attempts.map((attempt) => attempt.validation.mistakeSummary)
  );

  return {
    attempts,
    averageAccuracy: getAverage(
      attempts.map((attempt) => attempt.validation.characterAccuracy)
    ),
    averageWordAccuracy: getAverage(
      attempts.map((attempt) => attempt.validation.wordAccuracy)
    ),
    completedAt: state.completedAt,
    completedSentences: completedAttempts.length,
    mistakeCount: mistakeSummary.mistakes.length,
    mistakeSummary,
    mode: state.mode,
    startedAt: state.startedAt,
    totalSentences: state.sentenceOrder.length,
    type: state.type
  };
}

function getPracticeAttemptResult(
  state: PracticeSessionState,
  sentenceId: string
): PracticeAttemptResult {
  const sentence = state.sentencesById[sentenceId];
  const typedText = state.typedTextBySentenceId[sentenceId] ?? "";

  return {
    sentence,
    sentenceId,
    targetText: sentence.targetText,
    typedText,
    validation: validatePracticeAnswer(sentence.targetText, typedText)
  };
}

function getCompletedAttempts(state: PracticeSessionState) {
  return state.sentenceOrder
    .map((sentenceId) => getPracticeAttemptResult(state, sentenceId))
    .filter((attempt) => attempt.validation.isCorrectEnough);
}

function mergeMistakeSummaries(
  summaries: PracticeMistakeSummary[]
): PracticeMistakeSummary {
  return summaries.reduce<PracticeMistakeSummary>(
    (combined, summary) => ({
      counts: {
        extra_word: combined.counts.extra_word + summary.counts.extra_word,
        missing_word:
          combined.counts.missing_word + summary.counts.missing_word,
        spelling: combined.counts.spelling + summary.counts.spelling,
        wrong_word: combined.counts.wrong_word + summary.counts.wrong_word
      },
      mistakes: [...combined.mistakes, ...summary.mistakes]
    }),
    { counts: { ...emptyMistakeCounts }, mistakes: [] }
  );
}

function getAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

function getPercentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}
