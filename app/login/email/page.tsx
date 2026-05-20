"use client";

import { displayNameFromEmail, signInOrSignUpWithEmail } from "@/lib/auth/email";
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

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("yeounGuestLoggedIn");
        const userEmail = session.user.email ?? email.trim();
        window.sessionStorage.setItem("yeounUserEmail", userEmail);
        window.sessionStorage.setItem(
          "yeounUserName",
          displayNameFromEmail(userEmail)
        );
      }

      router.push("/main");
    } catch {
      setErrorMessage("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-[100dvh] overflow-hidden bg-[#FFFFF5] text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
        <main className="mx-auto flex h-full w-full items-center justify-center overflow-hidden">
          <section className="relative flex w-[min(38vw,60dvh)] aspect-[520/860] min-w-[320px] max-w-[420px] flex-col items-center bg-[#FFFFF5] [container-type:size]">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="absolute left-[6cqw] top-[6cqh] text-[3.6cqw] font-semibold text-[#F3B4C8]"
            >
              ←
            </button>

            <h1 className="mt-[20.4cqh] text-center text-[20.5cqw] font-black leading-none tracking-[-0.03em] text-[#F3B4C8]">
              YEOUN
            </h1>
            <p className="mt-[1.9cqh] text-center text-[3.3cqw] font-bold tracking-[-0.02em]">
              이메일로 시작하기
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-[11.6cqh] flex w-[78cqw] flex-col gap-[1.3cqh]"
            >
              <label className="text-[2.55cqw] font-bold tracking-[-0.01em] text-[#3c3c3c]">
                이메일
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-[0.8cqh] h-[min(66px,7.2dvh)] min-h-[46px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-white px-[3cqw] text-[2.55cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]"
                  placeholder="example@email.com"
                />
              </label>

              <label className="text-[2.55cqw] font-bold tracking-[-0.01em] text-[#3c3c3c]">
                비밀번호
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-[0.8cqh] h-[min(66px,7.2dvh)] min-h-[46px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-white px-[3cqw] text-[2.55cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]"
                  placeholder="6자 이상"
                />
              </label>

              {errorMessage ? (
                <p className="text-center text-[2.4cqw] font-semibold text-[#b14d70]">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-[1cqh] h-[min(66px,7.2dvh)] min-h-[46px] w-full rounded-[2cqw] border border-[#FDAFC7] bg-[#FDAFC7] text-[2.55cqw] font-bold tracking-[-0.01em] text-[#2c2c2c] transition hover:bg-[#f99fbe] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "시작하는 중..." : "시작하기"}
              </button>
            </form>
          </section>
        </main>
    </div>
  );
}
