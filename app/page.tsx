"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleGuestLogin = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("yeounGuestLoggedIn", "true");
    }
    router.push("/main");
  };

  return (
    <div
      className="h-[100dvh] overflow-hidden bg-[#FFFFF5] text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto flex h-full w-full items-center justify-center overflow-hidden">
        <section className="relative flex w-[min(38vw,60dvh)] aspect-[520/860] min-w-[320px] max-w-[420px] flex-col items-center bg-[#FFFFF5] [container-type:size]">
          <h1 className="mt-[20.4cqh] text-center text-[20.5cqw] font-black leading-none tracking-[-0.03em] text-[#F3B4C8]">
            YEOUN
          </h1>
          <p className="mt-[1.9cqh] text-center text-[3.3cqw] font-bold tracking-[-0.02em]">
            당신의 공연은 어떤 색이었나요?
          </p>

          <div className="mt-[11.6cqh] flex w-[78cqw] flex-col gap-[1.3cqh]">
            <button
              type="button"
              disabled
              className="h-[min(66px,7.2dvh)] min-h-[46px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-white text-[2.55cqw] font-bold tracking-[-0.01em] text-[#6f6f6f]"
            >
              구글 계정으로 시작
            </button>
            <button
              type="button"
              disabled
              className="h-[min(66px,7.2dvh)] min-h-[46px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-white text-[2.55cqw] font-bold tracking-[-0.01em] text-[#6f6f6f]"
            >
              애플 계정으로 시작
            </button>
            <button
              type="button"
              onClick={() => router.push("/login/email")}
              className="h-[min(66px,7.2dvh)] min-h-[46px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-white text-[2.55cqw] font-bold tracking-[-0.01em] text-[#2c2c2c] transition hover:bg-[#fff8fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b4c8]/70"
            >
              이메일로 시작
            </button>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="h-[min(66px,7.2dvh)] min-h-[46px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-white text-[2.55cqw] font-bold tracking-[-0.01em] text-[#2c2c2c] transition hover:bg-[#fff8fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b4c8]/70"
            >
              게스트로 시작
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
