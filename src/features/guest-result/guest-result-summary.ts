import { guestPracticeSentences } from "@/features/guest-practice/sample-sentences";

export type GuestResultSummary = {
  accuracy: number;
  isFallback: boolean;
  sentencesCompleted: number;
  wordsToReview: string[];
};

export function getGuestResultFallback(): GuestResultSummary {
  const wordsToReview = guestPracticeSentences
    .flatMap((sentence) => Object.keys(sentence.wordMeanings ?? {}))
    .slice(0, 4);

  return {
    accuracy: 92,
    isFallback: true,
    sentencesCompleted: guestPracticeSentences.length,
    wordsToReview
  };
}
