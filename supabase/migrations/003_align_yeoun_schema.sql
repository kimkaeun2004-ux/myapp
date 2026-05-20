-- 앱 코드와 DB 스키마 정렬 (기존 yeoun_tickets에 emotions 컬럼이 있는 경우)

alter table public.yeoun_tickets
  add column if not exists concert_name text,
  add column if not exists artist text,
  add column if not exists venue text,
  add column if not exists date_label text,
  add column if not exists day_label text,
  add column if not exists back_image text;

-- emotion 단수 컬럼만 있고 emotions가 없을 때 (001만 적용된 경우)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'yeoun_tickets' and column_name = 'emotion'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'yeoun_tickets' and column_name = 'emotions'
  ) then
    alter table public.yeoun_tickets rename column emotion to emotions;
  end if;
end $$;

-- profiles (002와 동일, idempotent)
create table if not exists public.yeoun_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.yeoun_profiles enable row level security;

drop policy if exists "yeoun_profiles_select_own" on public.yeoun_profiles;
create policy "yeoun_profiles_select_own"
  on public.yeoun_profiles for select using (auth.uid() = user_id);

drop policy if exists "yeoun_profiles_insert_own" on public.yeoun_profiles;
create policy "yeoun_profiles_insert_own"
  on public.yeoun_profiles for insert with check (auth.uid() = user_id);

drop policy if exists "yeoun_profiles_update_own" on public.yeoun_profiles;
create policy "yeoun_profiles_update_own"
  on public.yeoun_profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
