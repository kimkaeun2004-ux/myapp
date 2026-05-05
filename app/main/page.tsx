"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MainPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("게스트");
  const hasTicket = false;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const queryName = params.get("userName");
    if (!queryName) {
      setUserName("게스트");
      return;
    }

    setUserName(queryName === "게스트" ? "게스트" : "가은");
  }, []);

  return (
    <div
      className="h-[100dvh] overflow-hidden bg-[#FFFFF5] text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto flex h-full w-full items-center justify-center overflow-hidden">
        <section className="relative -translate-y-[3.2cqh] flex w-[min(38vw,60dvh)] aspect-[520/860] min-w-[320px] max-w-[420px] flex-col bg-[#FFFFF5] [container-type:size]">
          <h1 className="mt-[6.4cqh] text-center text-[4.4cqw] font-bold">홈</h1>

          <div className="mt-[8.4cqh] flex items-center gap-[2.4cqw] px-[6.2cqw]">
            <div className="flex h-[9.8cqw] w-[9.8cqw] items-center justify-center rounded-full bg-[#ece9df] text-[5.2cqw] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
              👤
            </div>
            <p className="text-[5.2cqw] font-bold tracking-[-0.02em]">{userName} 님</p>
          </div>

          <button
            type="button"
            className="mx-auto mt-[5.8cqh] flex h-[16.4cqh] w-[84.6cqw] items-center justify-center rounded-[2.2cqw] border border-[#FDAFC7] bg-[#ffffff] text-[5.6cqw] font-extrabold tracking-[-0.02em] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]"
          >
            감정 레포트 요약 보기
          </button>

          {hasTicket ? (
            <section className="mx-auto mt-[5.2cqh] w-[84.6cqw] rounded-[2.4cqw] bg-gradient-to-b from-[#ffe3b7] via-[#FDAFC7] to-[#FDAFC7] px-[5.1cqw] py-[4.6cqh] text-center shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
              <p className="text-[2.7cqw] font-bold tracking-[0.01em]">
                2025 DOYOUNG ENCORE CONCERT
              </p>
              <p className="mt-[1.3cqh] text-[8.6cqw] font-black leading-none">YOURS</p>
              <div className="mt-[1.8cqh] flex items-center justify-center gap-[5.6cqw] text-[3.4cqw] font-bold">
                <span>2025-10-09</span>
                <span>도영</span>
              </div>
              <p className="mt-[4.2cqh] whitespace-pre-line text-[4.4cqw] font-extrabold leading-[1.35]">
                {`“산다는 거 견디는 거\n함께라면 조금 더 행복해져”`}
              </p>
              <p className="mt-[4.2cqh] text-[4.2cqw] font-extrabold">WITHOUT YOU</p>
            </section>
          ) : (
            <section className="mx-auto mt-[5.2cqh] flex h-[35cqh] w-[84.6cqw] items-center justify-center rounded-[2.2cqw] border border-[#FDAFC7] bg-[#ffffff] px-[5.1cqw] text-center shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
              <p className="text-[5cqw] font-bold tracking-[-0.02em] text-[#3c3c3c]">
                첫 여운을 기록해보세요!
              </p>
            </section>
          )}

          <button
            type="button"
            onClick={() => router.push("/create/scan")}
            className="mx-auto mt-[4cqh] h-[20cqh] w-[84.6cqw] rounded-[2.2cqw] border border-[#FDAFC7] bg-[#FDAFC7] text-[5.6cqw] font-extrabold tracking-[-0.02em] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99]"
          >
            새로운 여운 기록하기
          </button>
        </section>
      </main>
    </div>
  );
}
