const punctuationPattern = /[.,!?;:'"()[\]{}،؟]/g;

export function normalizePracticeText(value: string) {
  return value
    .toLowerCase()
    .replace(punctuationPattern, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPracticeMatchState(target: string, typed: string) {
  if (!typed) {
    return {
      accuracy: 0,
      isComplete: false,
      tone: "neutral" as const
    };
  }

  const targetCharacters = Array.from(target);
  const typedCharacters = Array.from(typed);
  const correctCharacters = typedCharacters.filter(
    (character, index) => character === targetCharacters[index]
  ).length;
  const accuracy = Math.round(
    (correctCharacters / typedCharacters.length) * 100
  );
  const isComplete =
    typedCharacters.length >= targetCharacters.length && accuracy >= 90;

  return {
    accuracy: Math.max(0, Math.min(accuracy, 100)),
    isComplete,
    tone: isComplete
      ? ("success" as const)
      : accuracy < 80
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
