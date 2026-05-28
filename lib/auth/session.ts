import { displayNameFromEmail } from "@/lib/auth/email";
import {
  cacheUserAuth,
  clearGuestLoggedIn,
  clearUserAuthCache,
  getCachedUserName,
  isGuestLoggedIn,
} from "@/lib/auth/storage";
import { getSupabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

function syncAuthCacheFromSession(session: Session) {
  const email = session.user.email;
  if (!email) return;
  cacheUserAuth(email, displayNameFromEmail(email));
}

/**
 * Supabase가 localStorage/쿠키에서 세션을 읽기 전에 getSession()이 null이 되는 경우 방지
 */
export async function waitForAuthSession(): Promise<Session | null> {
  const supabase = getSupabase();

  const { data: initial } = await supabase.auth.getSession();
  if (initial.session) return initial.session;

  return new Promise((resolve) => {
    let settled = false;

    const finish = (session: Session | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
      resolve(session);
    };

    const timer = setTimeout(() => finish(null), 4000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        finish(session);
      }
    });
  });
}

export async function resolveAuthDisplayName() {
  if (typeof window === "undefined") return "게스트";

  if (isGuestLoggedIn()) return "게스트";

  const session = await waitForAuthSession();
  if (session?.user.email) {
    const name = displayNameFromEmail(session.user.email);
    syncAuthCacheFromSession(session);
    return name;
  }

  return getCachedUserName() || "회원";
}

export async function ensureLoggedIn(routerReplace: (path: string) => void) {
  if (typeof window === "undefined") return false;

  if (isGuestLoggedIn()) return true;

  const session = await waitForAuthSession();
  if (session) {
    syncAuthCacheFromSession(session);
    return true;
  }

  routerReplace("/");
  return false;
}

export async function signOutUser(routerReplace?: (path: string) => void) {
  clearGuestLoggedIn();
  clearUserAuthCache();
  try {
    await getSupabase().auth.signOut();
  } catch {
    // ignore
  }
  if (routerReplace) routerReplace("/");
}
