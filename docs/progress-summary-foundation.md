# Progress Summary Foundation v0.1

## Purpose

Phase 26 prepared the server-side foundation for maintaining `user_progress_summaries`. Phase 27 wires a conservative server-side summary update after authenticated raw result persistence.

The implementation lives in `src/server/progress/summary.ts`.

## Current Capabilities

- Loads the current authenticated user's profile server-side.
- Requires completed onboarding.
- Reads bounded saved practice data for the current selected language pair and level.
- Calculates conservative session, attempt, and mistake summary DTOs.
- Prepares a `user_progress_summaries` write payload.
- Updates an existing summary row or inserts a new one after authenticated Daily Workout and Practice Mode saves.
- Includes Daily Workout streak values from the streak foundation in `current_streak_days` and `last_workout_date`.
- Keeps raw `practice_sessions`, `sentence_attempts`, and `attempt_mistakes` as the source of truth.

## Tables Read

- `practice_sessions`
- `sentence_attempts`
- `attempt_mistakes`

Streak values are calculated from completed authenticated Daily Workout rows in `practice_sessions`.

## Write Target

- `user_progress_summaries`

The write is server-side only and uses the current authenticated user's profile context. Client callers never provide `profile_id`.

## Bounds

- Practice sessions: latest 500 rows for the selected profile, language pair, and level.
- Sentence attempts: latest 1000 rows linked to the bounded session set.
- Mistakes: count scoped to the bounded attempt set.
- Daily Workout streak sessions: latest 120 completed Daily Workout rows for the selected profile.

These limits prevent accidental heavy reads. Lifetime exact summaries should eventually move to a database RPC, background job, materialized summary, or transactional update that runs alongside raw result persistence.

## Deferred

- Database triggers.
- RPC functions.
- Atomic raw-save-plus-summary-write transactions.
- Exact lifetime streak calculation, product timezone support, XP, achievements, and charts.
- Progress DNA and AI analytics.
- Dashboard or Progress page redesign.

## Wiring Notes

`savePracticeSessionResult` calls the summary update after raw practice rows are saved. If the summary update fails, the raw save is still treated as successful because raw rows remain authoritative and the summary can be recalculated.

The current write path manually looks up an existing summary row and then updates or inserts. A future hardening phase should decide whether to:

- Use a dedicated database RPC for atomic session save plus summary update.
- Recalculate summaries asynchronously after raw writes.
- Add idempotency/correlation support to avoid race conditions during repeated or concurrent saves.
