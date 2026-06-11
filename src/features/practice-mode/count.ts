export const allowedPracticeSentenceCounts = [5, 10, 15] as const;

export type PracticeSentenceCount =
  (typeof allowedPracticeSentenceCounts)[number];

export function getSafePracticeSentenceCount(
  value: string | string[] | undefined
): PracticeSentenceCount {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  return allowedPracticeSentenceCounts.includes(
    parsedValue as PracticeSentenceCount
  )
    ? (parsedValue as PracticeSentenceCount)
    : 5;
}
