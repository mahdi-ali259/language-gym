# Practice Session Domain Foundation v0.1

## Purpose

The practice session domain module provides pure session-flow helpers for the typing and listening practice experience. It is designed to prevent Guest Practice, Daily Workout, and Practice Mode from each inventing their own sentence index, progress, attempt, and result logic.

The module lives in `src/lib/practice/session/` and is independent from React, routing, Supabase, browser APIs, and persistence.

## Reuse Model

- Guest Practice can use the module for local sample sessions.
- Daily Workout can use the same state and progress helpers for a timed or fixed daily flow before persistence is added.
- Practice Mode can use the same result and attempt calculation with configurable sentence counts.

The UI layer should own React state and routing. The domain layer should receive plain objects and return plain objects.

## Included in v0.1

- Shared TypeScript types for session mode, session type, sentences, session state, progress, attempts, and results.
- Helper to create an initial session state from a sentence list.
- Helper to get the current sentence.
- Helper to record typed text locally.
- Helper to calculate current progress.
- Helper to calculate a final local result.
- Helper to move to the next sentence.
- Helper to determine whether the session is complete.

## Intentionally Not Included Yet

- Supabase reads or writes.
- `practice_sessions` persistence.
- `sentence_attempts` persistence.
- Mistake persistence.
- Timer countdown behavior for Daily Workout.
- Result transfer from Guest Mode to signed-in accounts.
- Audio playback state.
- Analytics events.
- Payments or entitlement checks.

## Future Persistence Additions

When persistence is implemented, server-side services can translate the local `PracticeSessionResult` into database writes for `practice_sessions`, `sentence_attempts`, and `attempt_mistakes`.

The domain module should remain pure. Database access should live in dedicated server-side modules so the same session calculation can be reused in browser-only Guest Mode and authenticated server-backed practice flows.
