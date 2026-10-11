-- Reem English: single-student schema for future cross-device sync

create table if not exists student_profile (
  id text primary key default 'student-1',
  name text not null,
  age integer,
  current_level_id text not null default 'starter',
  points integer not null default 0,
  completed_tests integer not null default 0,
  started_at timestamptz not null default now(),
  learned_word_ids jsonb not null default '[]'::jsonb,
  review_word_ids jsonb not null default '[]'::jsonb,
  completed_daily_sets jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{"fontScale":1,"theme":"dark","accent":"pink"}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  name_ar text not null,
  name_en text not null,
  icon text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists words (
  id text primary key,
  category_id text references categories(id) on delete restrict,
  en text not null,
  ar text not null,
  pronunciation text,
  example_en text,
  example_ar text,
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists tests (
  id text primary key,
  title text not null,
  total_points integer not null default 100,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists test_questions (
  id text primary key,
  test_id text references tests(id) on delete cascade,
  type text not null,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  answer jsonb,
  points integer not null default 1,
  sort_order integer not null default 0
);

create table if not exists test_submissions (
  id text primary key,
  test_id text references tests(id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  score numeric,
  teacher_note text,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz
);
