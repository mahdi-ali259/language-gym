# Practice Result Persistence Foundation v0.1

## Purpose

Phase 19 adds a server-only foundation for saving authenticated practice results later. It maps the shared `PracticeSessionResult` domain shape into database-ready records for:

- `practice_sessions`
- `sentence_attempts`
- `attempt_mistakes`

The module lives at `src/server/practice/persistence.ts`.

## What Can Be Persisted

The persistence foundation supports authenticated `daily_workout` and `practice` session results. It requires the current server-side Supabase user, loads that user's profile, verifies onboarding is complete, and writes records using the current profile.

The client must not pass `profile_id`. The server resolves the profile from the authenticated user session.

## Sentence ID Mapping

Database attempts require `sentence_attempts.sentence_id` to reference real `sentences.id` UUIDs. Current local sample content uses local string IDs, so the save function supports a `sentenceIdByLocalId` map for later wiring.

If a sentence id is not already a UUID and no mapping is provided, saving throws instead of writing invalid data.

## Table Mapping

`practice_sessions` receives session-level summary data:

- profile
- language pair
- selected level
- session type
- started/completed timestamps
- duration
- sentences completed
- average accuracy
- status

`sentence_attempts` receives one row per attempted sentence:

- practice session
- profile
- sentence
- typed text
- normalized typed text
- correctness
- accuracy

`attempt_mistakes` receives one row per detected mistake:

- attempt
- profile
- sentence
- mistake type
- expected/actual text
- word text
- approximate word position

## Deferred

This phase does not add UI save buttons, automatic Daily Workout saving, automatic Practice Mode saving, progress summaries, streaks, XP, analytics, freemium limits, or weakness detection.

It also does not persist Guest Mode. Guest practice remains client-only because unauthenticated guest results do not have a trusted user profile and should not create anonymous database sessions in the earliest MVP.

The current foundation writes through the authenticated server Supabase client and relies on RLS. A later production hardening phase can wrap the session, attempt, and mistake writes in a database RPC/transaction if fully atomic multi-table persistence is required.

## Later Wiring

Daily Workout and Practice Mode can later call `savePracticeSessionResult` from a server action after the app loads real Supabase-backed sentence content. At that point, each practice sentence should already carry a persisted `sentences.id`, or the caller should provide a local-to-database sentence id map.

Progress summaries and streaks should be updated in a separate phase after the raw session, attempt, and mistake writes are reliable.
