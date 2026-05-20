import {
  loadUserProfile as loadLocalProfile,
  saveUserProfile as saveLocalProfile,
  type UserProfile,
} from "@/lib/profile/storage";
import {
  fetchUserProfileFromSupabase,
  resolveProfileWithSupabase,
  saveUserProfileToSupabase,
} from "@/lib/profile/supabase-profile";
import { getCurrentUserId } from "@/lib/tickets/supabase-tickets";

export async function loadUserProfile(fallbackName: string): Promise<UserProfile> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return loadLocalProfile(fallbackName);
  }

  const profile = await resolveProfileWithSupabase(fallbackName);
  saveLocalProfile(profile);
  return profile;
}

export async function saveUserProfileForAccount(
  profile: UserProfile
): Promise<void> {
  saveLocalProfile(profile);

  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    await saveUserProfileToSupabase(profile);
  } catch {
    // 베스트 에포트
  }
}

export async function ensureRemoteProfile(fallbackName: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const existing = await fetchUserProfileFromSupabase(fallbackName);
  if (existing) return;

  const local = loadLocalProfile(fallbackName);
  await saveUserProfileToSupabase(local);
}
