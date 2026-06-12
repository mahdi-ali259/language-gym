-- Daily Language Gym
-- Supabase/PostgreSQL schema draft v0.1
-- Phase 7 only: do not apply without review.
-- This file intentionally contains no destructive commands and no required seed data.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  native_name text not null,
  text_direction text not null default 'ltr',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint languages_code_not_empty check (length(trim(code)) > 0),
  constraint languages_text_direction_check check (text_direction in ('ltr', 'rtl'))
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint levels_code_check check (code in ('A1', 'A2', 'B1', 'B2', 'C1')),
  constraint levels_sort_order_positive check (sort_order > 0)
);

create table if not exists public.language_pairs (
  id uuid primary key default gen_random_uuid(),
  source_language_id uuid not null references public.languages(id),
  target_language_id uuid not null references public.languages(id),
  slug text not null unique,
  display_name text not null,
  launch_priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint language_pairs_distinct_languages check (source_language_id <> target_language_id)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  selected_language_pair_id uuid references public.language_pairs(id),
  selected_level_id uuid references public.levels(id),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sentence_packs (
  id uuid primary key default gen_random_uuid(),
  language_pair_id uuid not null references public.language_pairs(id),
  level_id uuid references public.levels(id),
  slug text not null unique,
  title text not null,
  description text,
  topic text,
  access_tier text not null default 'free',
  status text not null default 'draft',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sentence_packs_access_tier_check check (access_tier in ('free', 'premium')),
  constraint sentence_packs_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.sentences (
  id uuid primary key default gen_random_uuid(),
  language_pair_id uuid not null references public.language_pairs(id),
  level_id uuid not null references public.levels(id),
  sentence_pack_id uuid references public.sentence_packs(id),
  text text not null,
  normalized_text text not null,
  difficulty_score numeric(4, 2),
  topic_tags text[] not null default '{}',
  grammar_tags text[] not null default '{}',
  status text not null default 'draft',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sentences_text_not_empty check (length(trim(text)) > 0),
  constraint sentences_normalized_text_not_empty check (length(trim(normalized_text)) > 0),
  constraint sentences_difficulty_score_check check (
    difficulty_score is null
    or (difficulty_score >= 0 and difficulty_score <= 100)
  ),
  constraint sentences_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.sentence_translations (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences(id) on delete cascade,
  language_id uuid not null references public.languages(id),
  translated_text text not null,
  notes text,
  status text not null default 'draft',
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sentence_translations_text_not_empty check (length(trim(translated_text)) > 0),
  constraint sentence_translations_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.sentence_audio_assets (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences(id) on delete cascade,
  bucket_name text not null default 'sentence-audio',
  storage_path text not null,
  public_url text,
  provider text,
  voice_id text,
  duration_ms integer,
  status text not null default 'draft',
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sentence_audio_assets_storage_path_not_empty check (length(trim(storage_path)) > 0),
  constraint sentence_audio_assets_duration_positive check (duration_ms is null or duration_ms > 0),
  constraint sentence_audio_assets_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.sentence_word_meanings (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences(id) on delete cascade,
  language_id uuid references public.languages(id),
  source_text text not null,
  meaning_text text not null,
  position_start integer,
  position_end integer,
  notes text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sentence_word_meanings_source_not_empty check (length(trim(source_text)) > 0),
  constraint sentence_word_meanings_meaning_not_empty check (length(trim(meaning_text)) > 0),
  constraint sentence_word_meanings_position_check check (
    position_start is null
    or position_end is null
    or position_end >= position_start
  ),
  constraint sentence_word_meanings_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  language_pair_id uuid not null references public.language_pairs(id),
  level_id uuid references public.levels(id),
  session_type text not null,
  mode text not null default 'visible_sentence',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  target_duration_seconds integer,
  sentences_completed integer not null default 0,
  accuracy_percent numeric(5, 2),
  wpm numeric(6, 2),
  audio_replay_count integer not null default 0,
  status text not null default 'started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_sessions_session_type_check check (
    session_type in ('guest', 'daily_workout', 'practice')
  ),
  constraint practice_sessions_mode_check check (
    mode in ('visible_sentence', 'dictation')
  ),
  constraint practice_sessions_status_check check (
    status in ('started', 'completed', 'abandoned')
  ),
  constraint practice_sessions_duration_check check (duration_seconds is null or duration_seconds >= 0),
  constraint practice_sessions_target_duration_check check (
    target_duration_seconds is null
    or target_duration_seconds > 0
  ),
  constraint practice_sessions_sentences_completed_check check (sentences_completed >= 0),
  constraint practice_sessions_accuracy_check check (
    accuracy_percent is null
    or (accuracy_percent >= 0 and accuracy_percent <= 100)
  ),
  constraint practice_sessions_wpm_check check (wpm is null or wpm >= 0),
  constraint practice_sessions_audio_replay_check check (audio_replay_count >= 0)
);

create table if not exists public.sentence_attempts (
  id uuid primary key default gen_random_uuid(),
  practice_session_id uuid not null references public.practice_sessions(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  sentence_id uuid not null references public.sentences(id),
  typed_text text not null default '',
  normalized_typed_text text not null default '',
  is_correct boolean not null default false,
  accuracy_percent numeric(5, 2) not null,
  time_to_complete_ms integer,
  audio_replay_count integer not null default 0,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint sentence_attempts_accuracy_check check (accuracy_percent >= 0 and accuracy_percent <= 100),
  constraint sentence_attempts_time_check check (time_to_complete_ms is null or time_to_complete_ms >= 0),
  constraint sentence_attempts_audio_replay_check check (audio_replay_count >= 0)
);

create table if not exists public.attempt_mistakes (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.sentence_attempts(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  sentence_id uuid not null references public.sentences(id),
  mistake_type text not null,
  expected_text text,
  actual_text text,
  word_text text,
  position_start integer,
  position_end integer,
  created_at timestamptz not null default now(),
  constraint attempt_mistakes_type_check check (
    mistake_type in ('spelling', 'missing_word', 'extra_word', 'wrong_word', 'word_order', 'punctuation', 'capitalization')
  ),
  constraint attempt_mistakes_position_check check (
    position_start is null
    or position_end is null
    or position_end >= position_start
  )
);

create table if not exists public.user_progress_summaries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  language_pair_id uuid not null references public.language_pairs(id),
  level_id uuid references public.levels(id),
  sessions_completed integer not null default 0,
  sentences_completed integer not null default 0,
  average_accuracy_percent numeric(5, 2),
  best_accuracy_percent numeric(5, 2),
  average_wpm numeric(6, 2),
  total_mistakes integer not null default 0,
  total_audio_replays integer not null default 0,
  current_streak_days integer not null default 0,
  last_workout_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_progress_sessions_check check (sessions_completed >= 0),
  constraint user_progress_sentences_check check (sentences_completed >= 0),
  constraint user_progress_average_accuracy_check check (
    average_accuracy_percent is null
    or (average_accuracy_percent >= 0 and average_accuracy_percent <= 100)
  ),
  constraint user_progress_best_accuracy_check check (
    best_accuracy_percent is null
    or (best_accuracy_percent >= 0 and best_accuracy_percent <= 100)
  ),
  constraint user_progress_average_wpm_check check (average_wpm is null or average_wpm >= 0),
  constraint user_progress_total_mistakes_check check (total_mistakes >= 0),
  constraint user_progress_total_audio_replays_check check (total_audio_replays >= 0),
  constraint user_progress_current_streak_check check (current_streak_days >= 0)
);

create table if not exists public.user_access_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  plan_code text not null default 'free',
  status text not null default 'active',
  daily_workout_limit integer not null default 1,
  daily_practice_sentence_limit integer not null default 15,
  premium_started_at timestamptz,
  premium_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_access_plans_plan_code_check check (plan_code in ('free', 'premium')),
  constraint user_access_plans_status_check check (status in ('active', 'paused', 'canceled')),
  constraint user_access_plans_daily_workout_limit_check check (daily_workout_limit >= 0),
  constraint user_access_plans_daily_practice_limit_check check (daily_practice_sentence_limit >= 0)
);

-- Useful indexes

create index if not exists idx_language_pairs_active
  on public.language_pairs (is_active, launch_priority);

create index if not exists idx_sentence_packs_language_pair_level
  on public.sentence_packs (language_pair_id, level_id, status, is_active);

create index if not exists idx_sentences_language_pair_level_active
  on public.sentences (language_pair_id, level_id, status, is_active);

create index if not exists idx_sentences_pack
  on public.sentences (sentence_pack_id);

create index if not exists idx_sentence_translations_sentence_language
  on public.sentence_translations (sentence_id, language_id);

create index if not exists idx_sentence_audio_assets_sentence_primary
  on public.sentence_audio_assets (sentence_id, is_primary);

create index if not exists idx_sentence_word_meanings_sentence
  on public.sentence_word_meanings (sentence_id);

create index if not exists idx_practice_sessions_profile_started
  on public.practice_sessions (profile_id, started_at desc);

create index if not exists idx_practice_sessions_daily_lookup
  on public.practice_sessions (profile_id, session_type, started_at desc);

create index if not exists idx_sentence_attempts_session_submitted
  on public.sentence_attempts (practice_session_id, submitted_at);

create index if not exists idx_sentence_attempts_profile_submitted
  on public.sentence_attempts (profile_id, submitted_at desc);

create index if not exists idx_attempt_mistakes_profile_word
  on public.attempt_mistakes (profile_id, word_text);

create unique index if not exists idx_user_progress_unique_profile_pair_level
  on public.user_progress_summaries (
    profile_id,
    language_pair_id,
    coalesce(level_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- Updated timestamp triggers

create trigger set_languages_updated_at
  before update on public.languages
  for each row
  execute function public.set_updated_at();

create trigger set_levels_updated_at
  before update on public.levels
  for each row
  execute function public.set_updated_at();

create trigger set_language_pairs_updated_at
  before update on public.language_pairs
  for each row
  execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger set_sentence_packs_updated_at
  before update on public.sentence_packs
  for each row
  execute function public.set_updated_at();

create trigger set_sentences_updated_at
  before update on public.sentences
  for each row
  execute function public.set_updated_at();

create trigger set_sentence_translations_updated_at
  before update on public.sentence_translations
  for each row
  execute function public.set_updated_at();

create trigger set_sentence_audio_assets_updated_at
  before update on public.sentence_audio_assets
  for each row
  execute function public.set_updated_at();

create trigger set_sentence_word_meanings_updated_at
  before update on public.sentence_word_meanings
  for each row
  execute function public.set_updated_at();

create trigger set_practice_sessions_updated_at
  before update on public.practice_sessions
  for each row
  execute function public.set_updated_at();

create trigger set_user_progress_summaries_updated_at
  before update on public.user_progress_summaries
  for each row
  execute function public.set_updated_at();

create trigger set_user_access_plans_updated_at
  before update on public.user_access_plans
  for each row
  execute function public.set_updated_at();

-- Row Level Security

alter table public.languages enable row level security;
alter table public.levels enable row level security;
alter table public.language_pairs enable row level security;
alter table public.profiles enable row level security;
alter table public.sentence_packs enable row level security;
alter table public.sentences enable row level security;
alter table public.sentence_translations enable row level security;
alter table public.sentence_audio_assets enable row level security;
alter table public.sentence_word_meanings enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.sentence_attempts enable row level security;
alter table public.attempt_mistakes enable row level security;
alter table public.user_progress_summaries enable row level security;
alter table public.user_access_plans enable row level security;

-- Starter public-read policies for published educational content.
-- Content writes should be handled later by admin/server-only flows.

create policy "Published languages are readable"
  on public.languages
  for select
  using (is_active = true);

create policy "Published levels are readable"
  on public.levels
  for select
  using (is_active = true);

create policy "Published language pairs are readable"
  on public.language_pairs
  for select
  using (is_active = true);

create policy "Published sentence packs are readable"
  on public.sentence_packs
  for select
  using (is_active = true and status = 'published');

create policy "Published sentences are readable"
  on public.sentences
  for select
  using (is_active = true and status = 'published');

create policy "Published sentence translations are readable"
  on public.sentence_translations
  for select
  using (status = 'published');

create policy "Published sentence audio assets are readable"
  on public.sentence_audio_assets
  for select
  using (status = 'published');

create policy "Published sentence word meanings are readable"
  on public.sentence_word_meanings
  for select
  using (status = 'published');

-- Starter private user policies.
-- These should be reviewed against the final auth/profile creation flow.

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = auth_user_id);

create policy "Users can create own profile"
  on public.profiles
  for insert
  with check (auth.uid() = auth_user_id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

create policy "Users can read own practice sessions"
  on public.practice_sessions
  for select
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own practice sessions"
  on public.practice_sessions
  for insert
  with check (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can read own attempts"
  on public.sentence_attempts
  for select
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own attempts"
  on public.sentence_attempts
  for insert
  with check (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can read own mistakes"
  on public.attempt_mistakes
  for select
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own mistakes"
  on public.attempt_mistakes
  for insert
  with check (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can read own progress summaries"
  on public.user_progress_summaries
  for select
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own progress summaries"
  on public.user_progress_summaries
  for insert
  with check (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can update own progress summaries"
  on public.user_progress_summaries
  for update
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  )
  with check (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

create policy "Users can read own access plan"
  on public.user_access_plans
  for select
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

-- Insert/update policies for access plans may be implemented in a later
-- backend/API phase to keep entitlement changes server-controlled.

-- Optional conceptual seed examples only. Do not run blindly.
-- insert into public.languages (code, name, native_name, text_direction)
-- values ('ar', 'Arabic', 'العربية', 'rtl'), ('en', 'English', 'English', 'ltr');
