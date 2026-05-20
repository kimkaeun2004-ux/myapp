"use client";

import { TicketFrontContent } from "../_shared/TicketFrontContent";
import { useTicketRegistration } from "@/lib/ticket/use-ticket-registration";
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
  const registration = useTicketRegistration();
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
          className={`mx-auto mt-10 flex h-[min(430px,40dvh)] w-full flex-col items-center rounded-[14px] border border-[#ece8e1] px-[6cqw] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] ${
            showQuoteBlock ? "" : "justify-center"
          }`}
          style={{ backgroundImage: ticketBackground }}
        >
          <TicketFrontContent
            ticket={registration}
            quote={showQuoteBlock ? quote : undefined}
            largeHeadline={!showQuoteBlock}
            className={showQuoteBlock ? "mt-[95px]" : undefined}
          />
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
