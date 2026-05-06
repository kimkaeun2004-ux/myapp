"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gradientFromEmotionParam } from "../_shared/ticket-gradient";

export default function FrontCompletePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FrontCompleteContent />
    </Suspense>
  );
}

function FrontCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketBackground = gradientFromEmotionParam(searchParams.get("emotions"));
  const quote = searchParams.get("quote")?.trim() ?? "";
  const skipped = searchParams.get("skip") === "1";
  const showQuoteBlock = !skipped && quote.length > 0;

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
          티켓이 앞면이 <span className="text-[#FDAFC7]">완성</span>
          되었어요!
        </h1>

        <section
          className="mx-auto mt-10 flex h-[min(430px,40dvh)] w-full flex-col items-center rounded-[14px] border border-[#ece8e1] px-[6cqw] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
          style={{ backgroundImage: ticketBackground }}
        >
          {showQuoteBlock ? (
            <>
              <div className="mt-[95px] flex w-full flex-col items-center">
                <p className="text-[2.7cqw] font-bold tracking-[0.01em]">
                  2025 DOYOUNG ENCORE CONCERT
                </p>
                <p className="mt-[1.6cqh] text-[9.2cqw] font-black leading-none">YOURS</p>
                <p className="mt-[1.9cqh] text-[3.6cqw] font-semibold">25 - 10 - 09 Thu</p>
                <p className="mt-[1.3cqh] text-[3.8cqw] font-extrabold tracking-[0.02em]">
                  DOYOUNG
                </p>
              </div>
              <p className="mt-[26px] w-[86%] whitespace-pre-wrap break-words text-center text-[3.6cqw] font-semibold leading-[1.35] tracking-[0.01em] text-[#131313]">
                {quote}
              </p>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <p className="text-[3.1cqw] font-bold tracking-[0.01em]">
                2025 DOYOUNG ENCORE CONCERT
              </p>
              <p className="mt-[1.9cqh] text-[10.2cqw] font-black leading-none">YOURS</p>
              <p className="mt-[2.2cqh] text-[4.2cqw] font-semibold">25 - 10 - 09 Thu</p>
              <p className="mt-[1.5cqh] text-[4.4cqw] font-extrabold tracking-[0.02em]">
                DOYOUNG
              </p>
            </div>
          )}
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
            onClick={() => {
              const qs = searchParams.toString();
              router.push(qs.length > 0 ? `/create/back?${qs}` : "/create/back");
            }}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
          >
            뒷면 만들러 가기
          </button>
        </div>
      </main>
    </div>
  );
}
