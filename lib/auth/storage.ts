/** 로그인 상태 — sessionStorage는 탭 닫으면 사라지므로 localStorage 우선 */

const GUEST_KEY = "yeounGuestLoggedIn";
const USER_EMAIL_KEY = "yeounUserEmail";
const USER_NAME_KEY = "yeounUserName";

function readFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(key) === "true") return true;
    if (window.sessionStorage.getItem(key) === "true") {
      window.localStorage.setItem(key, "true");
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function writeFlag(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(key, "true");
      window.sessionStorage.setItem(key, "true");
    } else {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function isGuestLoggedIn(): boolean {
  return readFlag(GUEST_KEY);
}

export function setGuestLoggedIn(): void {
  writeFlag(GUEST_KEY, true);
  clearUserAuthCache();
}

export function clearGuestLoggedIn(): void {
  writeFlag(GUEST_KEY, false);
}

export function cacheUserAuth(email: string, displayName: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_EMAIL_KEY, email);
    window.localStorage.setItem(USER_NAME_KEY, displayName);
    window.sessionStorage.setItem(USER_EMAIL_KEY, email);
    window.sessionStorage.setItem(USER_NAME_KEY, displayName);
    clearGuestLoggedIn();
  } catch {
    // ignore
  }
}

export function clearUserAuthCache(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of [USER_EMAIL_KEY, USER_NAME_KEY]) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function getCachedUserEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      window.localStorage.getItem(USER_EMAIL_KEY)?.trim().toLowerCase() ||
      window.sessionStorage.getItem(USER_EMAIL_KEY)?.trim().toLowerCase() ||
      ""
    );
  } catch {
    return "";
  }
}

export function getCachedUserName(): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      window.localStorage.getItem(USER_NAME_KEY)?.trim() ||
      window.sessionStorage.getItem(USER_NAME_KEY)?.trim() ||
      ""
    );
  } catch {
    return "";
  }
}
