import { getCachedUserName, isGuestLoggedIn } from "@/lib/auth/storage";

/** 게스트·레거시용 (로그인 계정은 userId별 키 사용) */
const PROFILE_KEY = "yeounProfile";

export type UserProfile = {
  displayName: string;
  avatarUrl: string;
};

export const DEFAULT_AVATAR = "";

function profileKeyForUser(userId: string) {
  return `${PROFILE_KEY}:${userId}`;
}

function readProfile(key: string, fallbackName: string): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      displayName: parsed.displayName?.trim() || fallbackName,
      avatarUrl: parsed.avatarUrl ?? DEFAULT_AVATAR,
    };
  } catch {
    return null;
  }
}

function writeProfile(key: string, profile: UserProfile) {
  if (typeof window === "undefined") return;

  const json = JSON.stringify(profile);
  window.localStorage.setItem(key, json);
  window.sessionStorage.setItem(key, json);
}

/** 로그인 계정이 없을 때(게스트)만 공용 키 사용 */
export function loadUserProfile(fallbackName: string): UserProfile {
  if (typeof window === "undefined") {
    return { displayName: fallbackName, avatarUrl: DEFAULT_AVATAR };
  }

  const profile = readProfile(PROFILE_KEY, fallbackName);
  return profile ?? { displayName: fallbackName, avatarUrl: DEFAULT_AVATAR };
}

export function loadUserProfileForUser(
  userId: string,
  fallbackName: string
): UserProfile {
  const profile = readProfile(profileKeyForUser(userId), fallbackName);
  return profile ?? { displayName: fallbackName, avatarUrl: DEFAULT_AVATAR };
}

export function saveUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  writeProfile(PROFILE_KEY, profile);
  window.localStorage.setItem("yeounUserName", profile.displayName);
  window.sessionStorage.setItem("yeounUserName", profile.displayName);
}

export function saveUserProfileForUser(userId: string, profile: UserProfile) {
  if (typeof window === "undefined") return;
  writeProfile(profileKeyForUser(userId), profile);
}

/** 예전 단일 키 — 다른 계정 프로필이 섞이지 않도록 로그인·로그아웃 시 제거 */
export function clearLegacyProfileStorage() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(PROFILE_KEY);
    window.sessionStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
}

/** 계정별 캐시 전체 삭제 (이메일 전환 시) */
export function clearAllProfileCaches() {
  if (typeof window === "undefined") return;

  try {
    const storages = [window.localStorage, window.sessionStorage];
    for (const storage of storages) {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(`${PROFILE_KEY}:`)) keys.push(key);
      }
      for (const key of keys) storage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function clearProfileCacheForUser(userId: string) {
  if (typeof window === "undefined") return;

  const key = profileKeyForUser(userId);
  try {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function resolveFallbackDisplayName() {
  if (typeof window === "undefined") return "게스트";

  const fromProfile = getCachedUserName();
  if (fromProfile) return fromProfile;

  return isGuestLoggedIn() ? "게스트" : "회원";
}
