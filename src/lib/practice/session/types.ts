import type {
  PracticeMistakeSummary,
  PracticeValidationResult
} from "@/lib/practice/validation-engine";

export type PracticeSessionMode = "daily_workout" | "guest" | "practice";

export type PracticeSessionType = "sentence_count" | "time_boxed";

export type PracticeSentence = {
  audioPath?: string;
  id: string;
  languagePairSlug?: string;
  levelCode?: string;
  targetText: string;
  translationText?: string;
  wordMeanings?: Record<string, string>;
};

export type PracticeSessionState = {
  completedAt: string | null;
  currentIndex: number;
  mode: PracticeSessionMode;
  sentenceOrder: string[];
  sentencesById: Record<string, PracticeSentence>;
  startedAt: string;
  typedTextBySentenceId: Record<string, string>;
  type: PracticeSessionType;
};

export type PracticeAttemptResult = {
  sentence: PracticeSentence;
  sentenceId: string;
  targetText: string;
  typedText: string;
  validation: PracticeValidationResult;
};

export type PracticeSessionProgress = {
  completedSentences: number;
  currentIndex: number;
  currentPosition: number;
  isComplete: boolean;
  percent: number;
  totalSentences: number;
};

export type PracticeSessionResult = {
  attempts: PracticeAttemptResult[];
  averageAccuracy: number;
  averageWordAccuracy: number;
  completedAt: string | null;
  completedSentences: number;
  mistakeCount: number;
  mistakeSummary: PracticeMistakeSummary;
  mode: PracticeSessionMode;
  startedAt: string;
  totalSentences: number;
  type: PracticeSessionType;
};
