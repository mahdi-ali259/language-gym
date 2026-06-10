import {
  normalizePracticeText,
  validatePracticeAnswer
} from "@/lib/practice/validation-engine";

export { normalizePracticeText };

export function getPracticeMatchState(target: string, typed: string) {
  const result = validatePracticeAnswer(target, typed);

  return {
    accuracy: result.characterAccuracy,
    isComplete: result.isCorrectEnough,
    mistakeSummary: result.mistakeSummary,
    normalizedTargetText: result.normalizedTargetText,
    normalizedTypedText: result.normalizedTypedText,
    wordAccuracy: result.wordAccuracy,
    tone: result.isCorrectEnough
      ? ("success" as const)
      : result.characterAccuracy < 80
        ? ("warning" as const)
        : ("neutral" as const)
  };
}

export function getCurrentWord(target: string, typedLength: number) {
  const words = target.matchAll(/\S+/g);

  for (const word of words) {
    const start = word.index ?? 0;
    const end = start + word[0].length;

    if (typedLength >= start && typedLength <= end) {
      return normalizePracticeText(word[0]);
    }
  }

  return "";
}
