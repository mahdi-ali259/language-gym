-- Daily Language Gym
-- Seed data draft v0.1
-- Phase 11 only: do not apply without review.
-- This file contains reference/content seed data only and does not upload audio files.

-- Languages

insert into public.languages (code, name, native_name, text_direction, is_active)
values
  ('ar', 'Arabic', 'العربية', 'rtl', true),
  ('en', 'English', 'English', 'ltr', true)
on conflict (code) do update
set
  name = excluded.name,
  native_name = excluded.native_name,
  text_direction = excluded.text_direction,
  is_active = excluded.is_active;

-- Levels

insert into public.levels (code, name, description, sort_order, is_active)
values
  ('A1', 'Beginner', 'Simple daily sentences for first English practice.', 1, true),
  ('A2', 'Elementary', 'Common situations and slightly longer daily sentences.', 2, true),
  ('B1', 'Intermediate', 'Everyday conversation and practical sentence patterns.', 3, true),
  ('B2', 'Upper intermediate', 'Longer practical sentences with richer structure.', 4, true),
  ('C1', 'Advanced', 'Advanced sentence patterns and precise expression.', 5, true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- Arabic to English language pair

insert into public.language_pairs (
  source_language_id,
  target_language_id,
  slug,
  display_name,
  launch_priority,
  is_active
)
select
  source_language.id,
  target_language.id,
  'ar-en',
  'Arabic to English',
  1,
  true
from public.languages as source_language
cross join public.languages as target_language
where source_language.code = 'ar'
  and target_language.code = 'en'
on conflict (slug) do update
set
  source_language_id = excluded.source_language_id,
  target_language_id = excluded.target_language_id,
  display_name = excluded.display_name,
  launch_priority = excluded.launch_priority,
  is_active = excluded.is_active;

-- Starter sentence packs

insert into public.sentence_packs (
  language_pair_id,
  level_id,
  slug,
  title,
  description,
  topic,
  access_tier,
  status,
  is_active
)
select
  language_pairs.id,
  levels.id,
  seed_pack.slug,
  seed_pack.title,
  seed_pack.description,
  seed_pack.topic,
  'free',
  'published',
  true
from (
  values
    (
      'a1-daily-starter',
      'A1',
      'A1 Daily Starter',
      'A small beginner pack for first daily listening and typing practice.',
      'daily-life'
    ),
    (
      'a2-daily-starter',
      'A2',
      'A2 Daily Starter',
      'A small elementary pack for common daily sentence practice.',
      'daily-life'
    )
) as seed_pack(slug, level_code, title, description, topic)
join public.language_pairs on language_pairs.slug = 'ar-en'
join public.levels on levels.code = seed_pack.level_code
on conflict (slug) do update
set
  language_pair_id = excluded.language_pair_id,
  level_id = excluded.level_id,
  title = excluded.title,
  description = excluded.description,
  topic = excluded.topic,
  access_tier = excluded.access_tier,
  status = excluded.status,
  is_active = excluded.is_active;

-- Starter A1/A2 sentences, Arabic translations, and placeholder audio references.
-- Audio files are not included here. Upload real files to Supabase Storage later.

with seed_sentences as (
  select *
  from (
    values
      (
        'A1',
        'a1-daily-starter',
        'I drink water every morning.',
        'i drink water every morning',
        'أشرب الماء كل صباح.',
        'language-pairs/ar-en/levels/a1/sentences/i-drink-water-every-morning/default.mp3',
        5.00
      ),
      (
        'A1',
        'a1-daily-starter',
        'She likes apples.',
        'she likes apples',
        'هي تحب التفاح.',
        'language-pairs/ar-en/levels/a1/sentences/she-likes-apples/default.mp3',
        6.00
      ),
      (
        'A1',
        'a1-daily-starter',
        'We go to school.',
        'we go to school',
        ' نذهب إلى المدرسة.',
        'language-pairs/ar-en/levels/a1/sentences/we-go-to-school/default.mp3',
        7.00
      ),
      (
        'A1',
        'a1-daily-starter',
        'This is my book.',
        'this is my book',
        'هذا كتابي.',
        'language-pairs/ar-en/levels/a1/sentences/this-is-my-book/default.mp3',
        6.00
      ),
      (
        'A1',
        'a1-daily-starter',
        'The door is open.',
        'the door is open',
        'الباب مفتوح.',
        'language-pairs/ar-en/levels/a1/sentences/the-door-is-open/default.mp3',
        7.00
      ),
      (
        'A2',
        'a2-daily-starter',
        'I need to finish my homework tonight.',
        'i need to finish my homework tonight',
        'أحتاج إلى إنهاء واجبي الليلة.',
        'language-pairs/ar-en/levels/a2/sentences/i-need-to-finish-my-homework-tonight/default.mp3',
        18.00
      ),
      (
        'A2',
        'a2-daily-starter',
        'Can you help me find the station?',
        'can you help me find the station',
        'هل يمكنك مساعدتي في العثور على المحطة؟',
        'language-pairs/ar-en/levels/a2/sentences/can-you-help-me-find-the-station/default.mp3',
        20.00
      ),
      (
        'A2',
        'a2-daily-starter',
        'They are waiting outside the restaurant.',
        'they are waiting outside the restaurant',
        'انهم ينتظرون خارج المطعم.',
        'language-pairs/ar-en/levels/a2/sentences/they-are-waiting-outside-the-restaurant/default.mp3',
        19.00
      ),
      (
        'A2',
        'a2-daily-starter',
        'I usually listen to music after work.',
        'i usually listen to music after work',
        'عادة أستمع إلى الموسيقى بعد العمل.',
        'language-pairs/ar-en/levels/a2/sentences/i-usually-listen-to-music-after-work/default.mp3',
        21.00
      ),
      (
        'A2',
        'a2-daily-starter',
        'My brother bought a new phone yesterday.',
        'my brother bought a new phone yesterday',
        'اشترى أخي هاتفًا جديدًا أمس.',
        'language-pairs/ar-en/levels/a2/sentences/my-brother-bought-a-new-phone-yesterday/default.mp3',
        22.00
      )
  ) as seed(
    level_code,
    pack_slug,
    text,
    normalized_text,
    arabic_translation,
    audio_storage_path,
    difficulty_score
  )
),
inserted_sentences as (
  insert into public.sentences (
    language_pair_id,
    level_id,
    sentence_pack_id,
    text,
    normalized_text,
    difficulty_score,
    topic_tags,
    status,
    is_active
  )
  select
    language_pairs.id,
    levels.id,
    sentence_packs.id,
    seed_sentences.text,
    seed_sentences.normalized_text,
    seed_sentences.difficulty_score,
    array['daily-life'],
    'published',
    true
  from seed_sentences
  join public.language_pairs on language_pairs.slug = 'ar-en'
  join public.levels on levels.code = seed_sentences.level_code
  join public.sentence_packs on sentence_packs.slug = seed_sentences.pack_slug
  where not exists (
    select 1
    from public.sentences
    where sentences.language_pair_id = language_pairs.id
      and sentences.normalized_text = seed_sentences.normalized_text
  )
  returning id, normalized_text
),
all_seed_sentences as (
  select sentences.id, sentences.normalized_text
  from public.sentences
  join seed_sentences on seed_sentences.normalized_text = sentences.normalized_text
  join public.language_pairs on language_pairs.id = sentences.language_pair_id
  where language_pairs.slug = 'ar-en'
),
inserted_translations as (
  insert into public.sentence_translations (
    sentence_id,
    language_id,
    translated_text,
    status,
    is_primary
  )
  select
    all_seed_sentences.id,
    languages.id,
    seed_sentences.arabic_translation,
    'published',
    true
  from seed_sentences
  join all_seed_sentences on all_seed_sentences.normalized_text = seed_sentences.normalized_text
  join public.languages on languages.code = 'ar'
  where not exists (
    select 1
    from public.sentence_translations
    where sentence_translations.sentence_id = all_seed_sentences.id
      and sentence_translations.language_id = languages.id
      and sentence_translations.is_primary = true
  )
  returning id
)
insert into public.sentence_audio_assets (
  sentence_id,
  bucket_name,
  storage_path,
  provider,
  voice_id,
  status,
  is_primary
)
select
  all_seed_sentences.id,
  'sentence-audio',
  seed_sentences.audio_storage_path,
  'placeholder',
  'default',
  'draft',
  true
from seed_sentences
join all_seed_sentences on all_seed_sentences.normalized_text = seed_sentences.normalized_text
where not exists (
  select 1
  from public.sentence_audio_assets
  where sentence_audio_assets.sentence_id = all_seed_sentences.id
    and sentence_audio_assets.storage_path = seed_sentences.audio_storage_path
);
