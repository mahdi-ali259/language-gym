# Progress Summary Foundation v0.1

## Purpose

Phase 26 prepares the server-side foundation for maintaining `user_progress_summaries` later. It does not update summaries automatically and does not change the current result save flow.

The implementation lives in `src/server/progress/summary.ts`.

## Current Capabilities

- Loads the current authenticated user's profile server-side.
- Requires completed onboarding.
- Reads bounded saved practice data for the current selected language pair and level.
- Calculates conservative session, attempt, and mistake summary DTOs.
- Prepares a future `user_progress_summaries` upsert payload.

## Tables Read

- `practice_sessions`
- `sentence_attempts`
- `attempt_mistakes`

## Future Write Target

- `user_progress_summaries`

## Bounds

- Practice sessions: latest 500 rows for the selected profile, language pair, and level.
- Sentence attempts: latest 1000 rows linked to the bounded session set.
- Mistakes: count scoped to the bounded attempt set.

These limits prevent accidental heavy reads. Lifetime exact summaries should eventually move to a database RPC, background job, materialized summary, or transactional update that runs alongside raw result persistence.

## Deferred

- Automatic summary updates after saving a session.
- Database triggers.
- RPC functions.
- Streak, XP, achievements, and charts.
- Progress DNA and AI analytics.
- Dashboard or Progress page redesign.

## Future Wiring TODO

When raw persistence is stable, a future phase can call the summary module after `savePracticeSessionResult`. That phase should decide whether to:

- Upsert directly through a server action with RLS-compatible policies.
- Use a dedicated database RPC for atomic session save plus summary update.
- Recalculate summaries asynchronously after raw writes.

The current module intentionally prepares payloads only; it does not write them.
