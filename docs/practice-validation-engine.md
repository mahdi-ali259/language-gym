# Practice Validation Engine v0.1

**Phase:** 13 - reusable practice validation engine only

The reusable engine lives at:

```text
src/lib/practice/validation-engine.ts
```

It is pure TypeScript and has no UI, database, Supabase, browser storage, or network dependencies.

## Normalization Rules

The MVP normalization rules are:

- Lowercase comparison.
- Trim leading/trailing spaces.
- Collapse repeated spaces.
- Ignore punctuation for scoring.
- Do not penalize capitalization.

## Returned Values

`validatePracticeAnswer(targetText, typedText)` returns:

- `normalizedTargetText`
- `normalizedTypedText`
- `characterAccuracy`
- `wordAccuracy`
- `isComplete`
- `isCorrectEnough`
- `mistakeSummary`

## Mistake Types

The engine currently detects:

- `spelling`
- `missing_word`
- `extra_word`
- `wrong_word`

## Validation Examples

These examples are documentation-only until a test runner is added.

```text
Target: I drink water every morning.
Typed:  i drink water every morning
Expected: capitalization and punctuation do not reduce score.
```

```text
Target: I usually listen to music after work.
Typed:  I usually listen to music after wrok.
Expected: high character accuracy, one spelling mistake.
```

```text
Target: Can you help me find the station?
Typed:  Can you help me station
Expected: missing/wrong word summary, lower word accuracy.
```
