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
    const raw = window.sessionStorage.getItem(PROFILE_KEY);
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
  window.sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.sessionStorage.setItem("yeounUserName", profile.displayName);
}

export function resolveFallbackDisplayName() {
  if (typeof window === "undefined") return "게스트";

  const fromProfile = window.sessionStorage.getItem("yeounUserName");
  if (fromProfile?.trim()) return fromProfile.trim();

  const isGuest = window.sessionStorage.getItem("yeounGuestLoggedIn") === "true";
  return isGuest ? "게스트" : "회원";
}
