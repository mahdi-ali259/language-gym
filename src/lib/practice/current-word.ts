import { normalizePracticeText } from "@/lib/practice/validation-engine";

export function getCurrentPracticeWord(target: string, typedLength: number) {
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
