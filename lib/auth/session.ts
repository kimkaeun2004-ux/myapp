import { displayNameFromEmail } from "@/lib/auth/email";
import { supabase } from "@/lib/supabase/client";

export async function resolveAuthDisplayName() {
  if (typeof window === "undefined") return "게스트";

  const isGuestLoggedIn =
    window.sessionStorage.getItem("yeounGuestLoggedIn") === "true";

  if (isGuestLoggedIn) return "게스트";

  const { data } = await supabase.auth.getSession();
  const sessionEmail = data.session?.user.email;

  if (sessionEmail) {
    const name = displayNameFromEmail(sessionEmail);
    window.sessionStorage.setItem("yeounUserEmail", sessionEmail);
    window.sessionStorage.setItem("yeounUserName", name);
    return name;
  }

  return window.sessionStorage.getItem("yeounUserName")?.trim() || "회원";
}

export async function ensureLoggedIn(routerReplace: (path: string) => void) {
  if (typeof window === "undefined") return false;

  const isGuestLoggedIn =
    window.sessionStorage.getItem("yeounGuestLoggedIn") === "true";

  if (isGuestLoggedIn) return true;

  const { data } = await supabase.auth.getSession();
  if (data.session) return true;

  if (window.sessionStorage.getItem("yeounUserName")) return true;

  routerReplace("/");
  return false;
}
