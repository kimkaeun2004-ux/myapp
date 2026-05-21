-- 메인 홈 티켓 삭제 (본인 행만)
drop policy if exists "yeoun_tickets_delete_own" on public.yeoun_tickets;

create policy "yeoun_tickets_delete_own"
  on public.yeoun_tickets
  for delete
  using (auth.uid() = user_id);
