-- YEOUN 티켓 저장 (감정 리포트용)
create table if not exists public.yeoun_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  emotion text not null default '',
  concert_name text,
  artist text,
  quote text,
  venue text,
  date_label text,
  day_label text,
  created_at timestamptz not null default now()
);

create index if not exists yeoun_tickets_user_id_created_at_idx
  on public.yeoun_tickets (user_id, created_at desc);

alter table public.yeoun_tickets enable row level security;

create policy "yeoun_tickets_select_own"
  on public.yeoun_tickets
  for select
  using (auth.uid() = user_id);

create policy "yeoun_tickets_insert_own"
  on public.yeoun_tickets
  for insert
  with check (auth.uid() = user_id);
