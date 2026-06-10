export type PracticeMistakeType =
  | "extra_word"
  | "missing_word"
  | "spelling"
  | "wrong_word";

export type PracticeMistake = {
  actualText: string | null;
  expectedText: string | null;
  index: number;
  type: PracticeMistakeType;
};

export type PracticeMistakeSummary = {
  counts: Record<PracticeMistakeType, number>;
  mistakes: PracticeMistake[];
};

export type PracticeValidationResult = {
  characterAccuracy: number;
  isComplete: boolean;
  isCorrectEnough: boolean;
  mistakeSummary: PracticeMistakeSummary;
  normalizedTargetText: string;
  normalizedTypedText: string;
  wordAccuracy: number;
};

type ValidatePracticeAnswerOptions = {
  correctEnoughThreshold?: number;
};

const punctuationPattern = /[.,!?;:'"()[\]{}،؟]/g;
const defaultMistakeCounts: Record<PracticeMistakeType, number> = {
  extra_word: 0,
  missing_word: 0,
  spelling: 0,
  wrong_word: 0
};

export function normalizePracticeText(value: string) {
  return value
    .toLowerCase()
    .replace(punctuationPattern, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validatePracticeAnswer(
  targetText: string,
  typedText: string,
  options: ValidatePracticeAnswerOptions = {}
): PracticeValidationResult {
  const correctEnoughThreshold = options.correctEnoughThreshold ?? 90;
  const normalizedTargetText = normalizePracticeText(targetText);
  const normalizedTypedText = normalizePracticeText(typedText);
  const characterAccuracy = getCharacterAccuracy(
    normalizedTargetText,
    normalizedTypedText
  );
  const wordAccuracy = getWordAccuracy(
    normalizedTargetText,
    normalizedTypedText
  );
  const mistakeSummary = getMistakeSummary(
    normalizedTargetText,
    normalizedTypedText
  );
  const isComplete =
    normalizedTargetText.length > 0 &&
    normalizedTypedText.length >= normalizedTargetText.length;
  const isCorrectEnough =
    isComplete && characterAccuracy >= correctEnoughThreshold;

  return {
    characterAccuracy,
    isComplete,
    isCorrectEnough,
    mistakeSummary,
    normalizedTargetText,
    normalizedTypedText,
    wordAccuracy
  };
}

function getCharacterAccuracy(target: string, typed: string) {
  if (!typed) {
    return 0;
  }

  const targetCharacters = Array.from(target);
  const typedCharacters = Array.from(typed);
  const correctCharacters = typedCharacters.filter(
    (character, index) => character === targetCharacters[index]
  ).length;

  return clampPercentage(
    Math.round((correctCharacters / typedCharacters.length) * 100)
  );
}

function getWordAccuracy(target: string, typed: string) {
  const targetWords = splitWords(target);
  const typedWords = splitWords(typed);

  if (typedWords.length === 0) {
    return 0;
  }

  const correctWords = typedWords.filter(
    (word, index) => word === targetWords[index]
  ).length;

  return clampPercentage(Math.round((correctWords / typedWords.length) * 100));
}

function getMistakeSummary(
  target: string,
  typed: string
): PracticeMistakeSummary {
  const targetWords = splitWords(target);
  const typedWords = splitWords(typed);
  const mistakes: PracticeMistake[] = [];
  const counts = { ...defaultMistakeCounts };
  const maxWords = Math.max(targetWords.length, typedWords.length);

  for (let index = 0; index < maxWords; index += 1) {
    const expectedText = targetWords[index] ?? null;
    const actualText = typedWords[index] ?? null;

    if (expectedText === actualText) {
      continue;
    }

    const type = getMistakeType(expectedText, actualText);
    counts[type] += 1;
    mistakes.push({ actualText, expectedText, index, type });
  }

  return { counts, mistakes };
}

function getMistakeType(
  expectedText: string | null,
  actualText: string | null
): PracticeMistakeType {
  if (!expectedText) {
    return "extra_word";
  }

  if (!actualText) {
    return "missing_word";
  }

  return isLikelySpellingMistake(expectedText, actualText)
    ? "spelling"
    : "wrong_word";
}

function isLikelySpellingMistake(expectedText: string, actualText: string) {
  const maxLength = Math.max(expectedText.length, actualText.length);

  if (maxLength <= 2) {
    return expectedText[0] === actualText[0];
  }

  const distance = getEditDistance(expectedText, actualText);
  const allowedDistance = maxLength <= 5 ? 1 : 2;

  return distance <= allowedDistance;
}

function getEditDistance(left: string, right: string) {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => 0)
  );

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column < columns; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return matrix[left.length][right.length];
}

function splitWords(value: string) {
  return value ? value.split(" ") : [];
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(value, 100));
}
