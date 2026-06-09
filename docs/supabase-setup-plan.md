# Supabase Project Setup Plan v0.1

**Product:** Daily Language Gym  
**Phase:** Phase 6 - Supabase setup planning only  
**Status:** Planning document, no Supabase integration implemented yet

## 1. Required Supabase Services

The MVP should use Supabase for three core responsibilities:

- **Auth:** Google sign-in first, with Apple sign-in planned later if the selected setup supports it cleanly.
- **PostgreSQL database:** Structured storage for users, profiles, languages, language pairs, levels, sentences, translations, audio references, sessions, attempts, mistakes, progress summaries, and freemium-ready access state.
- **Storage:** Audio asset storage for sentence playback files. The database should store audio references, not raw audio files.

## 2. Environment Variables

Environment variables should be configured separately for local development, preview/staging, and production.

### Public Client Variables

These may be exposed to the browser:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Use these only for browser-safe Supabase access with Row Level Security enabled.

### Server-Only Variables

These must never be exposed to frontend code:

```text
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
```

The service role key may be needed later for admin-only server operations, migrations, background jobs, content management, or privileged API routes. It must only be used in server-only contexts and must never be imported into client components.

### Future Provider Variables

These may be needed in later phases:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Payments are not part of the MVP. Stripe variables should not be added until the payments phase.

## 3. Auth Setup Plan

### First Auth Provider

Google sign-in is the first authentication priority.

Planned user flow:

1. User completes or exits Guest Mode.
2. User chooses a level.
3. User clicks Google sign-in.
4. Supabase handles the OAuth flow.
5. User returns to the app through an auth callback route.
6. App creates or loads the user's profile.

### Later Auth Provider

Apple sign-in can be added later if the auth provider setup is straightforward and product demand justifies it.

### Redirect URLs

Local development redirect URLs should include:

```text
http://localhost:3000/auth/callback
```

Production redirect URLs should include the final Vercel production domain:

```text
https://YOUR-PRODUCTION-DOMAIN.vercel.app/auth/callback
https://YOUR-CUSTOM-DOMAIN.com/auth/callback
```

Preview/staging URLs should include either a dedicated staging domain or the relevant Vercel preview URL pattern if previews are used for auth testing.

### Auth Callback Route Planning

Future implementation should create an App Router callback route:

```text
/auth/callback
```

That route should exchange the auth code/session as required by the Supabase auth helpers, then redirect users to the correct next page:

- New profile missing level: `/level`
- Profile complete: `/dashboard`
- Auth error: `/sign-in`

## 4. Storage Setup Plan

### Bucket Strategy

Create a Supabase Storage bucket for sentence audio:

```text
sentence-audio
```

Recommended starting point:

- Use a **public bucket** for MVP sentence audio if all sentence audio is non-sensitive educational content.
- Store only stable paths or public URLs in database rows.
- Keep private buckets in mind if premium-only audio or licensed audio later requires access control.

If premium content requires restricted access later, consider:

- Private storage bucket
- Signed URLs
- Server-side entitlement checks
- CDN/cache strategy

### Audio Path Strategy

Use predictable, future-ready paths:

```text
language-pairs/ar-en/levels/a1/sentences/{sentence_id}/{voice_id}.mp3
language-pairs/ar-en/levels/a2/sentences/{sentence_id}/{voice_id}.mp3
```

Future examples:

```text
language-pairs/ar-fr/levels/a1/sentences/{sentence_id}/{voice_id}.mp3
language-pairs/ar-es/levels/a1/sentences/{sentence_id}/{voice_id}.mp3
```

### Database Audio References

The database should store:

- Audio asset ID
- Sentence ID
- Storage bucket
- Storage path
- Public URL or generated URL strategy
- Language pair
- Voice/provider metadata
- Duration if available
- Version/status

Do not store raw audio bytes in database rows.

## 5. Database Responsibility Boundaries

### Belongs In Supabase Database

- User profiles
- Language records
- Language pair records
- Level records, such as A1, A2, B1, B2, C1
- Sentence records
- Arabic translations
- Word meanings or glossary entries, when added
- Audio asset references
- Practice sessions
- Sentence attempts
- Mistake records
- Progress summaries
- Daily workout completion records
- Freemium user plan/access state
- Future subscription status/entitlements

### Belongs In Supabase Storage

- Audio files
- Future generated audio variants
- Potential content attachments, if needed later

### Belongs In The Frontend

- Page rendering
- UI state
- Form state
- Temporary typing input before submission
- Local loading, error, and empty states
- Non-sensitive ephemeral state

### Should Not Be Stored In localStorage

Do not rely on `localStorage` for important data such as:

- User identity
- Long-term progress
- Practice history
- Mistakes
- Access limits
- Subscription state
- Sentences or content authority
- Secrets or API keys

Guest Mode may use temporary in-memory state. If local persistence is ever used for guest convenience, it must be treated as non-authoritative and optional.

## 6. Security Planning

### Row Level Security Direction

Enable Row Level Security for user-owned tables from the beginning.

User-owned private data should only be readable/writable by that authenticated user:

- Profiles
- Practice sessions
- Attempts
- Mistakes
- Progress summaries
- Plan/access state

Public educational content may be readable by all users or anonymous users:

- Languages
- Language pairs
- Levels
- Published sentence content
- Published translations
- Public audio references

Admin/content-management writes should require privileged server-side access or admin roles.

### Service Role Key Safety

The Supabase service role key bypasses Row Level Security. It must:

- Never be exposed in frontend code
- Never be prefixed with `NEXT_PUBLIC_`
- Never be committed to Git
- Only be used in server-only files or trusted operational scripts

### Public Content vs Private User Data

Public content can support Guest Mode and browsing beginner practice examples.

Private user data must remain account-scoped:

- Results
- Mistakes
- Progress
- Streaks
- Access limits
- Subscription/plan state

## 7. Development Environments

### Local

Use local `.env.local` values for:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Copy `.env.example` to `.env.local` and fill in the public Supabase URL and anon key for local development. Do not put real secret values in `.env.example`.

Server-only variables should be added only when required by a later backend phase.

### Preview / Staging

Recommended options:

- Use a separate Supabase staging project, or
- Use the same Supabase project with clearly separated test data only during early MVP development.

For a serious MVP, a separate staging Supabase project is cleaner.

### Production

Production should use:

- Dedicated Supabase production project
- Production Vercel environment variables
- Production OAuth redirect URLs
- Reviewed RLS policies
- Storage bucket policies reviewed before launch

## 8. Future Scalability Notes

### Multiple Languages

The schema should support language pairs, not hardcode English-only behavior. First launch is Arabic to English, but future pairs may include Arabic to French and Arabic to Spanish.

### Levels

Support CEFR-like levels:

```text
A1, A2, B1, B2, C1
```

Initial real content may start with A1/A2 while the system supports all levels.

### Freemium Plan State

The database should include plan/access state early, even before payments exist:

- Free plan
- Premium-ready flags
- Daily access limits
- Future entitlements

### Weakness Detection

Mistake and attempt data should be structured enough to support future weakness detection:

- Weak words
- Repeated spelling mistakes
- Missing words
- Wrong word order
- Weak sentence patterns
- Audio replay correlation

### Dictation Mode

Dictation Mode is post-MVP but should be supported by the data model later. It may reuse sentences and audio assets while changing attempt mode metadata.

### Audio Provider Migration

The audio model should not assume one provider forever. Store provider, voice, version, and storage path metadata so audio can move from manual uploads to TTS-generated files later.

## 9. Step-By-Step Supabase Setup Checklist

1. Create a new Supabase project for local/MVP development.
2. Save the project URL and anon key for `.env.local`.
3. Do not add the service role key until a server-only phase requires it.
4. Configure Google OAuth in Supabase Auth.
5. Add local redirect URL: `http://localhost:3000/auth/callback`.
6. Add production redirect URL after the Vercel domain is known.
7. Add any staging/preview redirect URL if staging auth will be tested.
8. Create the `sentence-audio` storage bucket.
9. Decide whether the MVP audio bucket is public. Recommendation: public for non-sensitive MVP sentence audio.
10. Plan private/signed URL strategy before adding premium-only or licensed audio.
11. Enable Row Level Security for user-owned tables when Phase 7 schema is created.
12. Allow public read access only for published educational content tables.
13. Keep user progress, attempts, mistakes, and access state private.
14. Store audio paths/references in the database, not raw audio files.
15. Configure Vercel environment variables for preview and production once deployment starts.
16. Review all RLS and storage policies before public launch.

## Phase 7 Handoff

Phase 7 should define the database schema v0.1. It should create table plans and, when implementation is requested, SQL/migrations for:

- Profiles
- Languages
- Language pairs
- Levels
- Sentences
- Translations
- Audio assets
- Practice sessions
- Sentence attempts
- Mistakes
- Progress summaries
- User plan/access state

Phase 7 should still avoid frontend Supabase integration unless explicitly requested in that phase.
