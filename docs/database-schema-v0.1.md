# Database Schema v0.1

**Product:** Daily Language Gym  
**Phase:** Phase 7 - database schema planning and SQL draft only  
**Status:** Draft for review. Do not apply without review.

## A. Schema Goals

### MVP Must Support

- Google-authenticated users with one profile per auth user.
- User-selected learner level.
- Arabic speakers learning English as the first language pair.
- Future-ready language pairs without hardcoding English-only assumptions.
- CEFR-style levels: A1, A2, B1, B2, C1.
- Sentence packs for grouping practice content.
- Sentences, Arabic translations, and audio asset references.
- Practice sessions for authenticated Daily Workout and Practice Mode.
- Sentence attempts inside sessions.
- Mistakes attached to attempts.
- Basic progress summaries per user, language pair, and level.
- Freemium-ready access state before payments exist.

### Should Be Ready To Support Later

- French, Spanish, and additional target languages.
- Dictation Mode.
- Weakness Detection.
- Personal Progress DNA.
- More sentence packs and premium content.
- Streaks, XP, and richer progress tracking.
- Subscription entitlements and payment-provider integration.
- Admin/content workflows.
- Audio provider migration from manually uploaded files to generated TTS assets.

### Avoid For Now

- Complex AI generation workflow tables.
- Full billing/subscription lifecycle tables.
- Payment-provider-specific fields.
- Teacher/classroom tables.
- Leaderboard/social tables.
- Overly granular grammar ontology.

## B. Table List With Purpose

| Table                     | Purpose                                                                             | MVP                                |
| ------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| `profiles`                | App profile attached one-to-one to `auth.users`.                                    | Required                           |
| `languages`               | Stores languages such as Arabic, English, French, Spanish.                          | Required                           |
| `language_pairs`          | Defines learner/source and target language pairs, such as Arabic to English.        | Required                           |
| `levels`                  | Stores A1-C1 level metadata.                                                        | Required                           |
| `sentence_packs`          | Groups sentences by language pair, level, topic, and access tier.                   | Required                           |
| `sentences`               | Stores canonical target-language sentences and metadata.                            | Required                           |
| `sentence_translations`   | Stores translations for sentences, first Arabic translations for English sentences. | Required                           |
| `sentence_audio_assets`   | Stores audio storage paths and metadata for sentence playback.                      | Required                           |
| `sentence_word_meanings`  | Stores optional word/phrase meanings and notes.                                     | Post-MVP useful, safe to draft now |
| `practice_sessions`       | Stores Daily Workout, Practice Mode, and Guest session summaries.                   | Required                           |
| `sentence_attempts`       | Stores each user attempt for each sentence.                                         | Required                           |
| `attempt_mistakes`        | Stores structured mistakes detected in an attempt.                                  | Required                           |
| `user_progress_summaries` | Stores aggregated progress by profile, language pair, and level.                    | Required                           |
| `user_access_plans`       | Stores freemium-ready user plan/access state.                                       | Required                           |

## C. Relationship Explanation

- `languages` stores individual languages. `language_pairs` references `languages` twice: `source_language_id` for the learner's language and `target_language_id` for the language being learned.
- `levels` stores reusable level labels like A1 and A2. `sentences` can reference a primary `level_id`, and `sentence_packs` can also reference a level for grouped content.
- `sentence_packs` group content for a language pair, level, topic, access tier, or product campaign. `sentences` may belong to a pack through `sentence_pack_id`.
- `sentence_translations` belongs to `sentences` and references the translation language. For the first launch, English sentences have Arabic translations.
- `sentence_audio_assets` belongs to `sentences` and stores bucket/path/provider metadata. Audio files live in Supabase Storage.
- `profiles` references `auth.users`. Authenticated `practice_sessions` belongs to `profiles`. Guest Mode should remain client-only for the earliest MVP; nullable `profile_id` is kept only as future flexibility.
- `practice_sessions` has many `sentence_attempts`.
- `sentence_attempts` belongs to a session and sentence. `attempt_mistakes` belongs to an attempt and can also reference profile/sentence for faster weakness queries.
- `user_progress_summaries` belongs to a profile and summarizes progress by language pair and level.
- `user_access_plans` belongs to a profile and stores free/premium-ready access state.

## D. Recommended Columns

### `profiles`

- Primary key: `id uuid`
- Foreign key: `auth_user_id uuid references auth.users(id)`
- Important fields: `display_name`, `avatar_url`, `selected_language_pair_id`, `selected_level_id`, `onboarding_completed_at`
- Metadata: `created_at`, `updated_at`
- Constraints: one profile per auth user
- RLS: authenticated users can create/read/update only their own profile where `auth_user_id = auth.uid()`
- MVP: required

### `languages`

- Primary key: `id uuid`
- Important fields: `code`, `name`, `native_name`, `text_direction`, `is_active`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `language_pairs`

- Primary key: `id uuid`
- Foreign keys: `source_language_id`, `target_language_id`
- Important fields: `slug`, `display_name`, `is_active`, `launch_priority`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `levels`

- Primary key: `id uuid`
- Important fields: `code`, `name`, `sort_order`, `description`, `is_active`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `sentence_packs`

- Primary key: `id uuid`
- Foreign keys: `language_pair_id`, optional `level_id`
- Important fields: `slug`, `title`, `description`, `topic`, `access_tier`, `status`, `is_active`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `sentences`

- Primary key: `id uuid`
- Foreign keys: `language_pair_id`, `level_id`, optional `sentence_pack_id`
- Important fields: `text`, `normalized_text`, `difficulty_score`, `status`, `is_active`
- Future fields: `grammar_tags`, `topic_tags`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `sentence_translations`

- Primary key: `id uuid`
- Foreign keys: `sentence_id`, `language_id`
- Important fields: `translated_text`, `notes`, `status`, `is_primary`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `sentence_audio_assets`

- Primary key: `id uuid`
- Foreign keys: `sentence_id`
- Important fields: `bucket_name`, `storage_path`, `public_url`, `provider`, `voice_id`, `duration_ms`, `status`, `is_primary`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `sentence_word_meanings`

- Primary key: `id uuid`
- Foreign keys: `sentence_id`, optional `language_id`
- Important fields: `source_text`, `meaning_text`, `position_start`, `position_end`, `notes`, `status`
- Metadata: `created_at`, `updated_at`
- MVP: optional. Useful for post-MVP word meaning support.

### `practice_sessions`

- Primary key: `id uuid`
- Foreign keys: nullable `profile_id`, `language_pair_id`, optional `level_id`
- Important fields: `session_type`, `mode`, `started_at`, `completed_at`, `duration_seconds`, `target_duration_seconds`, `sentences_completed`, `accuracy_percent`, `wpm`, `audio_replay_count`, `status`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `sentence_attempts`

- Primary key: `id uuid`
- Foreign keys: `practice_session_id`, `sentence_id`, nullable `profile_id`
- Important fields: `typed_text`, `normalized_typed_text`, `is_correct`, `accuracy_percent`, `time_to_complete_ms`, `audio_replay_count`, `submitted_at`
- Empty text handling: `typed_text` and `normalized_typed_text` should be `not null default ''` so an empty submitted answer can be stored safely.
- Metadata: `created_at`
- MVP: required

### `attempt_mistakes`

- Primary key: `id uuid`
- Foreign keys: `attempt_id`, nullable `profile_id`, `sentence_id`
- Important fields: `mistake_type`, `expected_text`, `actual_text`, `word_text`, `position_start`, `position_end`
- Metadata: `created_at`
- MVP: required

### `user_progress_summaries`

- Primary key: `id uuid`
- Foreign keys: `profile_id`, `language_pair_id`, optional `level_id`
- Important fields: `sessions_completed`, `sentences_completed`, `average_accuracy_percent`, `best_accuracy_percent`, `average_wpm`, `total_mistakes`, `total_audio_replays`, `current_streak_days`, `last_workout_date`
- Metadata: `created_at`, `updated_at`
- MVP: required

### `user_access_plans`

- Primary key: `id uuid`
- Foreign key: `profile_id`
- Important fields: `plan_code`, `status`, `daily_workout_limit`, `daily_practice_sentence_limit`, `premium_started_at`, `premium_ends_at`
- Metadata: `created_at`, `updated_at`
- MVP: required as freemium-ready structure. Payment-provider-specific fields should be added later only when payments are implemented.

### `updated_at` maintenance

- Tables with `updated_at` should use a shared trigger function to set `updated_at = now()` before updates.
- Tables without `updated_at`, such as immutable attempt/mistake event rows, do not need the trigger.

## E. Indexing Recommendations

- Enforce one profile per auth user: unique index on `profiles.auth_user_id`.
- Load active language pair: unique index on `language_pairs.slug`; index active pairs.
- Load active sentences by language pair and level: index on `sentences(language_pair_id, level_id, status, is_active)`.
- Load sentences by pack: index on `sentences(sentence_pack_id)`.
- Load translations by sentence: index on `sentence_translations(sentence_id, language_id)`.
- Load primary audio by sentence: index on `sentence_audio_assets(sentence_id, is_primary)`.
- Load user sessions by profile/date: index on `practice_sessions(profile_id, started_at desc)`.
- Daily Workout lookup: index on `practice_sessions(profile_id, session_type, started_at desc)`.
- Load attempts by session: index on `sentence_attempts(practice_session_id, submitted_at)`.
- Load attempts by profile: index on `sentence_attempts(profile_id, submitted_at desc)`.
- Load mistakes by profile/word: index on `attempt_mistakes(profile_id, word_text)`.
- Progress summary lookup: unique index on `user_progress_summaries(profile_id, language_pair_id, level_id)`.
- Access state lookup: unique index on `user_access_plans(profile_id)`.

## F. RLS Policy Direction

### Public Readable Content Tables

These can be publicly readable when rows are active/published:

- `languages`
- `language_pairs`
- `levels`
- `sentence_packs`
- `sentences`
- `sentence_translations`
- `sentence_audio_assets`
- `sentence_word_meanings`

Writes should be admin/service-only in future content management flows.

### Private User-Owned Tables

These should be readable/writable only by the owning authenticated user:

- `profiles`
- `practice_sessions`
- `sentence_attempts`
- `attempt_mistakes`
- `user_progress_summaries`
- `user_access_plans`

Guest Mode should remain client-only for the earliest MVP and should not save anonymous database sessions initially. Nullable `profile_id` is kept in session/attempt tables only as future flexibility if guest result transfer or anonymous persistence is intentionally designed later. Long-term progress must be tied to a profile.

### Service Role Key

The Supabase service role key bypasses RLS. It must never be exposed in frontend code, never use `NEXT_PUBLIC_`, and never be committed to Git. Use it only in trusted server-only contexts.

## G. MVP vs Later Fields

### Required For MVP

- Profiles
- Language pairs
- Levels
- Sentence packs
- Sentences
- Translations
- Audio references
- Sessions
- Attempts
- Mistakes
- Progress summaries
- Plan/access state

### Useful For Post-MVP

- `sentence_word_meanings`
- Grammar/topic tags
- Dictation mode metadata via `practice_sessions.mode`
- Provider/version metadata on audio assets
- Payment-provider IDs in access/subscription tables later, only when payments are implemented

### Avoid For Now

- Full subscription invoice tables
- Payment-provider-specific columns before the payments phase
- AI generation queues
- Teacher/classroom modeling
- Leaderboards
- Deep grammar taxonomy

## H. Conceptual Data Examples

These are examples only and should not be treated as required seed data.

### Arabic Language

```text
languages: code=ar, name=Arabic, native_name=العربية, text_direction=rtl
```

### English Language

```text
languages: code=en, name=English, native_name=English, text_direction=ltr
```

### Arabic-To-English Language Pair

```text
language_pairs: source=ar, target=en, slug=ar-en, display_name=Arabic to English
```

### A1 Level

```text
levels: code=A1, name=Beginner, sort_order=1
```

### One Sentence

```text
sentences: language_pair=ar-en, level=A1, text=I drink water every morning.
```

### Arabic Translation

```text
sentence_translations: sentence=I drink water every morning., language=ar, translated_text=أشرب الماء كل صباح.
```

### Audio Asset Reference

```text
sentence_audio_assets: bucket=sentence-audio, storage_path=language-pairs/ar-en/levels/a1/sentences/{sentence_id}/default.mp3
```

### One Practice Session

```text
practice_sessions: profile={profile_id}, session_type=daily_workout, target_duration_seconds=180, status=completed
```

### One Attempt

```text
sentence_attempts: session={session_id}, sentence={sentence_id}, typed_text=I drink water every morning, accuracy_percent=100
```

### One Mistake

```text
attempt_mistakes: mistake_type=spelling, expected_text=morning, actual_text=mornng, word_text=morning
```

## Review Before Applying

Before applying this schema, review:

- Supabase auth profile creation flow.
- Guest Mode should stay client-only for earliest MVP; review any future anonymous persistence separately.
- Exact free daily access limits.
- Whether `sentence_word_meanings` should launch in MVP or remain empty.
- Whether public audio bucket is acceptable for all MVP audio assets.
- RLS policies against actual Supabase auth behavior.
- Whether payment-provider fields should be added later during the payments phase.
