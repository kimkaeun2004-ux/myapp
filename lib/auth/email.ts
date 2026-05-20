import { supabase } from "@/lib/supabase/client";
import type { AuthError, Session } from "@supabase/supabase-js";

export function displayNameFromEmail(email: string) {
  const local = email.split("@")[0]?.trim();
  return local || "회원";
}

export async function signInOrSignUpWithEmail(
  email: string,
  password: string
): Promise<{ session: Session | null; error: AuthError | null }> {
  const normalizedEmail = email.trim().toLowerCase();

  const prepare = await fetch("/api/auth/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: normalizedEmail, password }),
  });

  if (!prepare.ok) {
    const body = (await prepare.json().catch(() => null)) as { error?: string } | null;
    return {
      session: null,
      error: {
        name: "AuthApiError",
        message: body?.error ?? "계정을 준비하지 못했습니다.",
      } as AuthError,
    };
  }

  const signIn = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (!signIn.error && signIn.data.session) {
    return { session: signIn.data.session, error: null };
  }

  return { session: null, error: signIn.error };
}
