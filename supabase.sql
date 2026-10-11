-- English Daily / Supabase schema
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Learner',
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  current_level int not null default 1 check (current_level between 1 and 6),
  unlocked_level int not null default 1 check (unlocked_level between 1 and 6),
  level_status jsonb not null default '{"1":"in_progress","2":"locked","3":"locked","4":"locked","5":"locked","6":"locked"}'::jsonb,
  completed_steps jsonb not null default '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}'::jsonb,
  quiz_scores jsonb not null default '{}'::jsonb,
  xp int not null default 0,
  saved_words jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.words (
  id bigint generated always as identity primary key,
  level_id int not null check (level_id between 1 and 6),
  group_id int not null check (group_id between 1 and 5),
  word_en text not null,
  word_ar text not null,
  phonetic_ar text,
  image_url text,
  example_en text,
  example_ar text
);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.words enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "progress_select_own" on public.user_progress
for select using (auth.uid() = user_id);

create policy "progress_insert_own" on public.user_progress
for insert with check (auth.uid() = user_id);

create policy "progress_update_own" on public.user_progress
for update using (auth.uid() = user_id);

create policy "words_public_read" on public.words
for select using (true);

create or replace function public.create_profile_and_progress()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id,name)
  values(new.id, coalesce(new.raw_user_meta_data->>'name','Learner'))
  on conflict do nothing;

  insert into public.user_progress(user_id)
  values(new.id)
  on conflict(user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_and_progress();