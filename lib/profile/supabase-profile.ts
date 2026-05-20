import { displayNameFromEmail } from "@/lib/auth/email";
import type { UserProfile } from "@/lib/profile/storage";
import { getSupabase } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/tickets/supabase-tickets";

export type YeounProfileRow = {
  user_id: string;
  display_name: string;
  avatar_url: string;
  updated_at: string;
};

function profileFromUserMetadata(
  metadata: Record<string, unknown> | undefined,
  fallbackName: string
): UserProfile | null {
  if (!metadata) return null;

  const displayName =
    typeof metadata.display_name === "string"
      ? metadata.display_name.trim()
      : typeof metadata.yeoun_display_name === "string"
        ? metadata.yeoun_display_name.trim()
        : "";

  const avatarUrl =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.yeoun_avatar_url === "string"
        ? metadata.yeoun_avatar_url
        : "";

  if (!displayName && !avatarUrl) return null;

  return {
    displayName: displayName || fallbackName,
    avatarUrl,
  };
}

export async function fetchUserProfileFromSupabase(
  fallbackName: string
): Promise<UserProfile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await getSupabase()
    .from("yeoun_profiles")
    .select("user_id, display_name, avatar_url, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) {
    const row = data as YeounProfileRow;
    return {
      displayName: row.display_name?.trim() || fallbackName,
      avatarUrl: row.avatar_url ?? "",
    };
  }

  const { data: authData } = await getSupabase().auth.getUser();
  return profileFromUserMetadata(
    authData.user?.user_metadata as Record<string, unknown> | undefined,
    fallbackName
  );
}

export async function saveUserProfileToSupabase(
  profile: UserProfile
): Promise<{ ok: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false };

  const payload = {
    user_id: userId,
    display_name: profile.displayName.trim(),
    avatar_url: profile.avatarUrl ?? "",
    updated_at: new Date().toISOString(),
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

export async function resolveProfileWithSupabase(
  fallbackName: string
): Promise<UserProfile> {
  const { data } = await getSupabase().auth.getSession();
  const email = data.session?.user.email;
  const nameFallback = email ? displayNameFromEmail(email) : fallbackName;

  const remote = await fetchUserProfileFromSupabase(nameFallback);
  if (remote) return remote;

  return { displayName: nameFallback, avatarUrl: "" };
}
