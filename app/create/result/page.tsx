"use client";

import { TicketPreview } from "../_shared/TicketPreview";
import { loadTicketDraft } from "@/lib/ticket/draft-storage";
import type { TicketRegistrationDraft } from "@/lib/ticket/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketRegistrationDraft | null>(null);

  useEffect(() => {
    setTicket(loadTicketDraft());
  }, []);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#FFFFF5] px-6 py-10" style={{ fontFamily: "Inter, sans-serif" }}>
        <main className="mx-auto max-w-[420px] text-center text-[4cqw]">불러오는 중...</main>
      </div>
    );
  }

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
          티켓 인식이 <span className="text-[#FDAFC7]">완료</span>되었어요!
        </h1>
        <p className="mt-3 text-center text-[3.2cqw] font-medium text-[#7a7a76]">
          날짜·공연장은 자동으로 채웠어요. 공연명과 가수를 확인해 주세요.
        </p>

        <TicketPreview ticket={ticket} className="mt-10" />

        <div className="mx-auto mt-8 flex w-full items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/create/confirm")}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa]"
          >
            수정하기
          </button>
          <button
            type="button"
            onClick={() => router.push("/create/emotion")}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe] disabled:opacity-50"
            disabled={!ticket.concertName.trim() || !ticket.artist.trim()}
          >
            다음
          </button>
        </div>
      </main>
    </div>
  );
}
