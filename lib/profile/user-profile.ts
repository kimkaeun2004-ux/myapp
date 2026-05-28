import { displayNameFromEmail } from "@/lib/auth/email";
import { cacheUserAuth } from "@/lib/auth/storage";
import { waitForAuthSession } from "@/lib/auth/session";
import {
  DEFAULT_AVATAR,
  loadUserProfile as loadGuestProfile,
  saveUserProfile as saveGuestProfile,
  saveUserProfileForUser,
  type UserProfile,
} from "@/lib/profile/storage";
import {
  defaultProfileForEmail,
  deleteProfileRow,
  fetchProfileRow,
  profileFromRow,
  saveUserProfileToSupabase,
} from "@/lib/profile/supabase-profile";

function syncProfileAuthCache(email: string, profile: UserProfile) {
  cacheUserAuth(email, profile.displayName);
}

/**
 * 로그인 계정: Supabase yeoun_profiles (없으면 이메일@앞 닉네임 + 기본 아바타)
 * 게스트: 로컬 공용 프로필
 */
export async function loadUserProfile(): Promise<UserProfile> {
  const session = await waitForAuthSession();

  if (!session?.user.id) {
    return loadGuestProfile("게스트");
  }

  const userId = session.user.id;
  const email = session.user.email?.trim().toLowerCase() ?? "";
  const defaults = email
    ? defaultProfileForEmail(email)
    : { displayName: "회원", avatarUrl: DEFAULT_AVATAR };

  const row = await fetchProfileRow(userId);

  // 예전 로그인 버그로 다른 계정 프로필이 복사된 행 → 무시 후 기본값
  const isStaleRow =
    row &&
    row.customized_at === null &&
    (!row.owner_email ||
      !email ||
      row.owner_email.trim().toLowerCase() === email);

  if (isStaleRow) {
    try {
      await deleteProfileRow(userId);
    } catch {
      // ignore
    }
    saveUserProfileForUser(userId, defaults);
    if (email) syncProfileAuthCache(email, defaults);
    return defaults;
  }

  if (!row) {
    saveUserProfileForUser(userId, defaults);
    if (email) syncProfileAuthCache(email, defaults);
    return defaults;
  }

  const profile = email ? profileFromRow(row, email) : {
    displayName: row.display_name?.trim() || defaults.displayName,
    avatarUrl: row.avatar_url?.trim() || DEFAULT_AVATAR,
  };

  saveUserProfileForUser(userId, profile);
  if (email) syncProfileAuthCache(email, profile);
  return profile;
}

export async function saveUserProfileForAccount(
  profile: UserProfile
): Promise<void> {
  const session = await waitForAuthSession();
  const userId = session?.user.id;
  const email = session?.user.email?.trim().toLowerCase();

  const normalized: UserProfile = {
    displayName: profile.displayName.trim() || (email ? displayNameFromEmail(email) : "회원"),
    avatarUrl: profile.avatarUrl ?? DEFAULT_AVATAR,
  };

  if (userId) {
    saveUserProfileForUser(userId, normalized);
  } else {
    saveGuestProfile(normalized);
  }

  if (!userId || !email) return;

  try {
    await saveUserProfileToSupabase(normalized, email);
    if (email) syncProfileAuthCache(email, normalized);
  } catch {
    // 베스트 에포트
  }
}
