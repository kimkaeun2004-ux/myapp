"use client";

import { TicketFrontContent } from "../_shared/TicketFrontContent";
import { useTicketRegistration } from "@/lib/ticket/use-ticket-registration";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildGradient, EMOTION_COLORS } from "../_shared/ticket-gradient";

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
  const registration = useTicketRegistration();
  const [draftQuote, setDraftQuote] = useState("");
  const emotions = (searchParams.get("emotions") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);

  const colors =
    emotions.map((emotion) => EMOTION_COLORS[emotion]).filter(Boolean) || [];
  const gradientColors = colors.length > 0 ? colors : ["#FFC4D0", "#C6F3E2"];
  const ticketBackground = buildGradient(gradientColors);

  const buildFrontCompleteHref = (opts: { quote?: string; skip?: boolean }) => {
    const params = new URLSearchParams();
    const emo = searchParams.get("emotions");
    if (emo) params.set("emotions", emo);
    if (opts.skip) {
      params.set("skip", "1");
    } else if (opts.quote && opts.quote.trim().length > 0) {
      params.set("quote", opts.quote.trim());
    }
    const qs = params.toString();
    return qs.length > 0 ? `/create/front-complete?${qs}` : "/create/front-complete";
  };

  return (
    <div
      className="min-h-screen bg-[#FFFFF5] px-6 py-10 text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto w-full max-w-[420px] [container-type:size]">
        <button
          type="button"
          onClick={() => router.push("/main")}
          className="ml-auto block text-[8cqw] leading-none text-[#FDAFC7] transition hover:opacity-80"
          aria-label="닫기"
        >
          ×
        </button>

        <h1 className="mt-10 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
          가장 기억에 남는 가사나 대사를{" "}
          <span className="text-[#FDAFC7]">입력</span>해주세요.
        </h1>

        <section
          className="mx-auto mt-10 flex h-[min(430px,40dvh)] w-full flex-col items-center justify-center rounded-[14px] border border-[#ece8e1] px-[6cqw] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
          style={{ backgroundImage: ticketBackground }}
        >
          <TicketFrontContent ticket={registration} />

          <div className="mt-[26px] flex h-[155px] w-[86%] flex-col items-center justify-center gap-3 rounded-[10px] bg-[rgba(255,255,255,0.5)] px-4 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
            <textarea
              value={draftQuote}
              onChange={(e) => setDraftQuote(e.target.value)}
              placeholder="클릭하여 입력해주세요."
              rows={3}
              className="min-h-[72px] w-full resize-none bg-transparent text-center text-[3.6cqw] font-semibold leading-[1.35] text-[#131313] outline-none placeholder:text-[#131313]/60 placeholder:text-center"
            />
            <button
              type="button"
              onClick={() => {
                const q = draftQuote.trim();
                router.push(buildFrontCompleteHref({ quote: q }));
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
            onClick={() => router.back()}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa]"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => router.push(buildFrontCompleteHref({ skip: true }))}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
          >
            스킵하기
          </button>
        </div>
      </main>
    </div>
  );
}
