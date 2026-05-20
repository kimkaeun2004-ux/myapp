-- 프로필 (이메일 계정별)
create table if not exists public.yeoun_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.yeoun_profiles enable row level security;

create policy "yeoun_profiles_select_own"
  on public.yeoun_profiles
  for select
  using (auth.uid() = user_id);

create policy "yeoun_profiles_insert_own"
  on public.yeoun_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "yeoun_profiles_update_own"
  on public.yeoun_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 티켓 뒷면 이미지 (압축 data URL)
alter table public.yeoun_tickets
  add column if not exists back_image text;
