"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const EMOTION_COLORS: Record<string, string> = {
  강렬: "#FF7EB9",
  행복: "#FFC4D0",
  벅참: "#FF8E9E",
  신남: "#FFC192",
  전율: "#FFF6A3",
  편안: "#C6F3E2",
  아련: "#7DE2D1",
  뭉클: "#A0D9EF",
  몽환: "#C5A3FF",
};

function buildGradient(colors: string[]) {
  if (colors.length <= 1) {
    return `linear-gradient(145deg, ${colors[0]}, ${colors[0]})`;
  }

  if (colors.length === 2) {
    return `linear-gradient(145deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  }

  return `radial-gradient(circle at 20% 20%, ${colors[0]} 0%, transparent 45%), radial-gradient(circle at 80% 20%, ${colors[1]} 0%, transparent 45%), radial-gradient(circle at 50% 85%, ${colors[2]} 0%, transparent 48%), linear-gradient(150deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
}

export default function TicketPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketContent />
    </Suspense>
  );
}

function TicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftQuote, setDraftQuote] = useState("");
  const [isInputEnabled, setIsInputEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const emotions = (searchParams.get("emotions") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);

  const colors =
    emotions.map((emotion) => EMOTION_COLORS[emotion]).filter(Boolean) || [];
  const gradientColors = colors.length > 0 ? colors : ["#FFC4D0", "#C6F3E2"];
  const ticketBackground = buildGradient(gradientColors);

  return (
    <div
      className="min-h-screen bg-[#FFFFF5] px-6 py-10 text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto w-full max-w-[420px] [container-type:size]">
        <button
          type="button"
          onClick={() => router.back()}
          className="ml-auto block text-[8cqw] leading-none text-[#FDAFC7] transition hover:opacity-80"
          aria-label="닫기"
        >
          ×
        </button>

        <section className="relative mx-auto mt-7 flex h-[22cqh] w-[78cqw] flex-col items-center justify-center rounded-[50%] border border-[#f1c9d8] bg-white px-6 text-center">
          <span className="absolute -bottom-[1.8cqh] left-1/2 h-[3.6cqh] w-[3.6cqh] -translate-x-1/2 rotate-45 border-b border-r border-[#f1c9d8] bg-white" />
          <h1 className="text-[4.1cqw] font-extrabold leading-[1.35] tracking-[-0.02em]">
            가장 기억에 남는
            <br />
            가사나 대사를
            <br />
            입력해주세요.
          </h1>
        </section>

        <section
          className="mx-auto mt-8 flex h-[430px] w-full flex-col items-center rounded-[14px] px-6 pt-[95px] text-center shadow-[0_10px_22px_rgba(0,0,0,0.18)]"
          style={{ backgroundImage: ticketBackground }}
        >
          <p className="text-[2.7cqw] font-bold tracking-[0.01em] text-[#111111]">
            2025 DOYOUNG ENCORE CONCERT
          </p>
          <p className="mt-[1.6cqh] text-[9.2cqw] font-black leading-none text-[#111111]">
            YOURS
          </p>
          <p className="mt-[1.9cqh] text-[3.6cqw] font-semibold text-[#111111]">
            25 - 10 - 09 Thu
          </p>
          <p className="mt-[1.3cqh] text-[3.8cqw] font-extrabold tracking-[0.02em] text-[#111111]">
            DOYOUNG
          </p>

          <div className="mt-[26px] flex h-[155px] w-[86%] flex-col items-center justify-between rounded-[10px] bg-[rgba(255,255,255,0.5)] px-4 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
            <textarea
              ref={textareaRef}
              value={draftQuote}
              onChange={(e) => setDraftQuote(e.target.value)}
              readOnly={!isInputEnabled}
              placeholder=""
              className="h-[72px] w-full resize-none bg-transparent text-center text-[3.1cqw] font-medium text-[#222] outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setIsInputEnabled(true);
                textareaRef.current?.focus();
              }}
              className="h-[32px] w-[92px] rounded-[12px] border border-[#FDAFC7] bg-[#FDAFC7] text-[2.8cqw] font-semibold text-[#222] shadow-[0_4px_8px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
            >
              입력하기
            </button>
          </div>
        </section>

        <div className="mx-auto mt-8 flex w-full items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/create/emotion")}
            className="h-[92px] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa]"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => router.push("/main")}
            className="h-[92px] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
          >
            스킵하기
          </button>
        </div>

      </main>
    </div>
  );
}
