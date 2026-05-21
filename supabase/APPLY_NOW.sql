-- Supabase Dashboard → SQL Editor에 붙여넣고 Run
-- (003_align_yeoun_schema.sql 과 동일, 한 번에 적용용)

alter table public.yeoun_tickets
  add column if not exists concert_name text,
  add column if not exists artist text,
  add column if not exists venue text,
  add column if not exists date_label text,
  add column if not exists day_label text,
  add column if not exists back_image text;

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

drop policy if exists "yeoun_tickets_delete_own" on public.yeoun_tickets;
create policy "yeoun_tickets_delete_own"
  on public.yeoun_tickets for delete using (auth.uid() = user_id);
