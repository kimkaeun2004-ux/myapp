import { getCachedUserName, isGuestLoggedIn } from "@/lib/auth/storage";

const PROFILE_KEY = "yeounProfile";

export type UserProfile = {
  displayName: string;
  avatarUrl: string;
};

export const DEFAULT_AVATAR = "";

export function loadUserProfile(fallbackName: string): UserProfile {
  if (typeof window === "undefined") {
    return { displayName: fallbackName, avatarUrl: DEFAULT_AVATAR };
  }

  try {
    const raw =
      window.localStorage.getItem(PROFILE_KEY) ||
      window.sessionStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return { displayName: fallbackName, avatarUrl: DEFAULT_AVATAR };
    }
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      displayName: parsed.displayName?.trim() || fallbackName,
      avatarUrl: parsed.avatarUrl ?? DEFAULT_AVATAR,
    };
  } catch {
    return { displayName: fallbackName, avatarUrl: DEFAULT_AVATAR };
  }
}

export function saveUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(profile);
  window.localStorage.setItem(PROFILE_KEY, json);
  window.sessionStorage.setItem(PROFILE_KEY, json);
  window.localStorage.setItem("yeounUserName", profile.displayName);
  window.sessionStorage.setItem("yeounUserName", profile.displayName);
}

export function resolveFallbackDisplayName() {
  if (typeof window === "undefined") return "게스트";

  const fromProfile = getCachedUserName();
  if (fromProfile) return fromProfile;

  return isGuestLoggedIn() ? "게스트" : "회원";
}
