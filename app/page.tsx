"use client";

import { setGuestLoggedIn } from "@/lib/auth/storage";
import { trackEvent } from "@/lib/analytics/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  YEOUN_CONTENT_W,
  YEOUN_PAGE_MAIN,
  YEOUN_SCREEN,
  YEOUN_SHELL_SECTION,
  YEOUN_TEXT,
  YEOUN_BTN,
  yeounFont,
} from "@/lib/ui/yeoun-scale";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    void trackEvent({
      eventName: "onboarding_view",
      path: "/",
    });
  }, []);

  const handleGuestLogin = () => {
    setGuestLoggedIn();
    router.push("/main");
  };

  const handleEmailStart = async () => {
    await trackEvent({
      eventName: "email_start_click",
      path: "/",
    });
    router.push("/login/email");
  };

  const btnClass = `${YEOUN_BTN} w-full border-[#F3B4C8] bg-white`;

  return (
    <div className={YEOUN_SCREEN} style={yeounFont}>
      <main className={YEOUN_PAGE_MAIN}>
        <section className={`${YEOUN_SHELL_SECTION} items-center`}>
          <h1 className={`mt-[20.4cqh] text-center ${YEOUN_TEXT.brand}`}>YEOUN</h1>
          <p className={`mt-[1.9cqh] text-center ${YEOUN_TEXT.title}`}>
            당신의 공연은 어떤 색이었나요?
          </p>

          <div className={`mt-[11.6cqh] flex ${YEOUN_CONTENT_W} flex-col gap-[1.3cqh]`}>
            <button
              type="button"
              onClick={() => void handleEmailStart()}
              className={`${btnClass} text-[#2c2c2c] transition hover:bg-[#fff8fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b4c8]/70`}
            >
              이메일로 시작
            </button>
            <button
              type="button"
              onClick={handleGuestLogin}
              className={`${btnClass} text-[#2c2c2c] transition hover:bg-[#fff8fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b4c8]/70`}
            >
              게스트로 시작
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
