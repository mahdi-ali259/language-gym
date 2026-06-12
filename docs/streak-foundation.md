# Streak Foundation v0.1

## Purpose

Phase 28 adds a server-side foundation for Daily Workout streak logic. It does not wire streak updates into persistence, progress summaries, dashboard UI, or Progress page UI.

The implementation lives in `src/server/progress/streak.ts`.

## Current Capabilities

- Loads the current authenticated user's profile server-side.
- Requires completed onboarding.
- Reads completed authenticated Daily Workout sessions only.
- Extracts unique completed workout dates.
- Calculates whether today has a completed workout.
- Calculates the current streak days from recent completed workout dates.
- Calculates the latest workout date.
- Prepares a future `user_progress_summaries` streak payload.

## Table Read

- `practice_sessions`

## Query Bounds

- Daily Workout sessions: latest 120 completed rows for the current profile.

This bound protects the app from accidental unlimited reads. It is enough for a near-term MVP streak display, but it is not a guaranteed lifetime streak calculation.

## Deferred

- Wiring streak updates into `savePracticeSessionResult`.
- Writing `current_streak_days` or `last_workout_date` to `user_progress_summaries`.
- Product timezone support.
- Exact lifetime streak calculation.
- Database RPC/materialized summary optimization.
- XP, achievements, badges, notifications, and charts.

## Future TODOs

- Add profile-level timezone support before treating a calendar day as product-canonical.
- Move exact lifetime streak calculations to a database RPC, background job, or summary table update.
- Integrate streak payloads into `user_progress_summaries` after the current summary write path is hardened.
- Add idempotency/concurrency protections when streak writes are introduced.
