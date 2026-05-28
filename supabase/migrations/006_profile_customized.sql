-- 프로필: 사용자가 직접 저장한 경우만 customized_at 설정 (자동 복사 행 무시)
alter table public.yeoun_profiles
  add column if not exists customized_at timestamptz,
  add column if not exists owner_email text;

drop policy if exists "yeoun_profiles_delete_own" on public.yeoun_profiles;
create policy "yeoun_profiles_delete_own"
  on public.yeoun_profiles
  for delete
  using (auth.uid() = user_id);
