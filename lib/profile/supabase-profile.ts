import { displayNameFromEmail } from "@/lib/auth/email";
import type { UserProfile } from "@/lib/profile/storage";
import { DEFAULT_AVATAR } from "@/lib/profile/storage";
import { getSupabase } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/tickets/supabase-tickets";

export type YeounProfileRow = {
  user_id: string;
  display_name: string;
  avatar_url: string;
  updated_at: string;
  customized_at: string | null;
  owner_email: string | null;
};

export function defaultProfileForEmail(email: string): UserProfile {
  return {
    displayName: displayNameFromEmail(email),
    avatarUrl: DEFAULT_AVATAR,
  };
}

function isMissingProfileColumnError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("customized_at") ||
    lower.includes("owner_email") ||
    lower.includes("schema cache")
  );
}

/** yeoun_profiles 테이블만 조회 (auth metadata는 계정 섞임 방지를 위해 읽지 않음) */
export async function fetchProfileRow(
  userId: string
): Promise<YeounProfileRow | null> {
  const { data, error } = await getSupabase()
    .from("yeoun_profiles")
    .select(
      "user_id, display_name, avatar_url, updated_at, customized_at, owner_email"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) return data as YeounProfileRow;

  if (error && isMissingProfileColumnError(error.message)) {
    const { data: legacy, error: legacyErr } = await getSupabase()
      .from("yeoun_profiles")
      .select("user_id, display_name, avatar_url, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (legacyErr || !legacy) return null;

    const row = legacy as YeounProfileRow;
    return {
      ...row,
      customized_at: row.updated_at,
      owner_email: null,
    };
  }

  return null;
}

/** 예전 버그로 자동 생성된 행 제거 (사용자가 직접 저장하지 않은 프로필) */
export async function deleteProfileRow(userId: string): Promise<void> {
  await getSupabase().from("yeoun_profiles").delete().eq("user_id", userId);
}

export function profileFromRow(
  row: YeounProfileRow,
  email: string
): UserProfile {
  const fallback = defaultProfileForEmail(email);
  return {
    displayName: row.display_name?.trim() || fallback.displayName,
    avatarUrl: row.avatar_url?.trim() || DEFAULT_AVATAR,
  };
}

export async function saveUserProfileToSupabase(
  profile: UserProfile,
  ownerEmail: string
): Promise<{ ok: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false };

  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    display_name: profile.displayName.trim(),
    avatar_url: profile.avatarUrl ?? "",
    owner_email: ownerEmail.trim().toLowerCase(),
    customized_at: now,
    updated_at: now,
  };

  const { error: tableError } = await getSupabase()
    .from("yeoun_profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (!tableError) return { ok: true };

  const { error: metaError } = await getSupabase().auth.updateUser({
    data: {
      yeoun_display_name: profile.displayName.trim(),
      yeoun_avatar_url: profile.avatarUrl ?? "",
    },
  });

  return { ok: !metaError };
}
