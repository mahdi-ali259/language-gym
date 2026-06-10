# Seed Data v0.1

**Product:** Daily Language Gym  
**Phase:** Phase 11 - seed language, level, and initial sentence/audio content structure only  
**Status:** Draft only. Do not apply to Supabase without review.

## Purpose

The Phase 11 seed draft provides the minimum reference and starter content records needed for onboarding and early sentence practice testing after the Phase 7 schema is applied.

It creates:

- Arabic and English language records.
- Arabic to English language pair with slug `ar-en`.
- CEFR-style levels: `A1`, `A2`, `B1`, `B2`, `C1`.
- Two starter sentence packs.
- Five A1 sentences.
- Five A2 sentences.
- Arabic translations for each starter sentence.
- Placeholder audio asset references for each starter sentence.

## Audio Placeholder Policy

The seed file stores audio storage paths only. It does not include real audio files, upload logic, TTS provider integration, or raw audio bytes.

Audio asset rows are placeholders. They should remain in `draft` status until matching real audio files are uploaded to Supabase Storage and verified.

Real audio still needs to be uploaded later to Supabase Storage bucket:

```text
sentence-audio
```

The placeholder paths follow this pattern:

```text
language-pairs/ar-en/levels/{level}/sentences/{sentence-slug}/default.mp3
```

Later app phases should handle missing, draft, or unavailable audio gracefully instead of assuming every sentence has playable audio.

## Duplicate Safety

The seed draft avoids duplicates by:

- Using `on conflict` for records with unique natural keys, such as language code, level code, language pair slug, and sentence pack slug.
- Checking for existing sentences by `language_pair_id` and `normalized_text`.
- Checking for existing primary translations by sentence and translation language.
- Checking for existing audio references by sentence and storage path.

Future schema hardening may add a unique constraint or unique index on `(language_pair_id, normalized_text)` for `sentences`. Future multi-language expansion may also revisit global `sentence_packs.slug` uniqueness if pack slugs need to be scoped by language pair or content family.

## Before Applying

Before applying this seed draft to Supabase:

1. Review and apply the Phase 7 schema.
2. Confirm RLS/content write approach for seed execution.
3. Confirm the `sentence-audio` bucket exists or will be created before audio upload.
4. Review Arabic translations for quality and tone.
5. Replace placeholder audio references with real uploaded files when audio is ready.
6. Confirm this small starter set is enough for the next implementation phase.

## Not Included

This seed draft does not include:

- User profiles.
- Practice sessions.
- Attempts.
- Mistakes.
- Progress summaries.
- Access plans.
- Real audio files.
- Premium content.
- AI-generated content.
