-- 게스트 발행 티켓: user_id 없이 yeoun_tickets에만 적재
alter table public.yeoun_tickets
  alter column user_id drop not null;
