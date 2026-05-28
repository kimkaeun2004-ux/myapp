"use client";

import { displayNameFromEmail, signInOrSignUpWithEmail } from "@/lib/auth/email";
import { cacheUserAuth } from "@/lib/auth/storage";
import { ensureRemoteProfile } from "@/lib/profile/user-profile";
import { syncLocalTicketsToSupabase } from "@/lib/tickets/supabase-tickets";
import {
  YEOUN_BTN,
  YEOUN_CONTENT_W,
  YEOUN_INPUT,
  YEOUN_LABEL,
  YEOUN_PAGE_MAIN,
  YEOUN_SCREEN,
  YEOUN_SHELL_SECTION,
  YEOUN_NAV_BACK_EMAIL,
  YEOUN_TEXT,
  yeounFont,
} from "@/lib/ui/yeoun-scale";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmailLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { session, error } = await signInOrSignUpWithEmail(email, password);

      if (error || !session) {
        const message = error?.message ?? "";
        if (message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setErrorMessage(message || "로그인에 실패했습니다. 다시 시도해 주세요.");
        }
        return;
      }

      const userEmail = session.user.email ?? email.trim();
      cacheUserAuth(userEmail, displayNameFromEmail(userEmail));

      try {
        await syncLocalTicketsToSupabase();
        await ensureRemoteProfile(displayNameFromEmail(session.user.email ?? email));
      } catch {
        // Supabase 미설정·오프라인 시 로컬만 사용
      }

      router.push("/main");
    } catch {
      setErrorMessage("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBtn = `${YEOUN_BTN} w-full border-[#FDAFC7] bg-[#FDAFC7] text-[#2c2c2c] transition hover:bg-[#f99fbe] disabled:cursor-not-allowed disabled:opacity-70`;

  return (
    <div className={YEOUN_SCREEN} style={yeounFont}>
      <main className={YEOUN_PAGE_MAIN}>
        <section className={`${YEOUN_SHELL_SECTION} items-center`}>
          <button
            type="button"
            onClick={() => router.push("/")}
            className={YEOUN_NAV_BACK_EMAIL}
            aria-label="뒤로"
          >
            ‹
          </button>

          <h1 className={`mt-[20.4cqh] text-center ${YEOUN_TEXT.brand}`}>YEOUN</h1>
          <p className={`mt-[1.9cqh] text-center ${YEOUN_TEXT.title}`}>이메일로 시작하기</p>

          <form
            onSubmit={handleSubmit}
            className={`mt-[11.6cqh] flex ${YEOUN_CONTENT_W} flex-col gap-[1.3cqh]`}
          >
            <label className={YEOUN_LABEL}>
              이메일
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={YEOUN_INPUT}
                placeholder="example@email.com"
              />
            </label>

            <label className={YEOUN_LABEL}>
              비밀번호
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={YEOUN_INPUT}
                placeholder="6자 이상"
              />
            </label>

            {errorMessage ? (
              <p className={`text-center ${YEOUN_TEXT.bodyMedium} text-[#b14d70]`}>
                {errorMessage}
              </p>
            ) : null}

            <button type="submit" disabled={isSubmitting} className={`mt-[1cqh] ${submitBtn}`}>
              {isSubmitting ? "시작하는 중..." : "시작하기"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
