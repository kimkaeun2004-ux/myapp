-- 북극성 지표(온보딩 진입 > 이메일 시작 클릭 > 로그인 성공) 이벤트 수집
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  session_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  path text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_event_time_idx
  on public.analytics_events (event_name, occurred_at desc);

create index if not exists analytics_events_session_time_idx
  on public.analytics_events (session_id, occurred_at desc);

create index if not exists analytics_events_user_time_idx
  on public.analytics_events (user_id, occurred_at desc)
  where user_id is not null;
