"use client";

import { TicketPreview } from "../_shared/TicketPreview";
import {
  hasScannedTicketDraft,
  loadTicketDraft,
  saveTicketDraft,
} from "@/lib/ticket/draft-storage";
import type { TicketRegistrationDraft } from "@/lib/ticket/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inputClass =
  "mt-2 h-11 w-full rounded-[10px] border border-[#FDAFC7] bg-[#fffdfd] px-3 text-[3.2cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]";

const autoBadge = (
  <span className="ml-1.5 text-[2.6cqw] font-medium text-[#FDAFC7]">자동 인식</span>
);

export default function ConfirmPage() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [ticket, setTicket] = useState<TicketRegistrationDraft>({
    concertName: "",
    artist: "",
    date: "",
    day: "",
    venue: "",
  });

  useEffect(() => {
    if (!hasScannedTicketDraft()) {
      router.replace("/create/scan");
      return;
    }
    setTicket(loadTicketDraft());
  }, [router]);

  const updateField = (field: keyof TicketRegistrationDraft, value: string) => {
    setTicket((prev) => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    saveTicketDraft(ticket);
    setIsCompleted(true);
  };

  const handleNext = () => {
    saveTicketDraft(ticket);
    router.push("/create/emotion");
  };

  const canProceed =
    ticket.concertName.trim().length > 0 && ticket.artist.trim().length > 0;

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

        {!isCompleted ? (
          <>
            <h1 className="mt-10 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
              티켓 정보를 확인해 주세요
            </h1>
            <p className="mt-3 text-center text-[3.2cqw] font-medium text-[#7a7a76]">
              공연명과 가수는 직접 입력해 주세요.
            </p>

            <section className="mt-10 rounded-[18px] border border-[#FDAFC7] bg-white p-5 shadow-[0_10px_22px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col gap-4">
                <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                  공연명
                  <input
                    value={ticket.concertName}
                    onChange={(e) => updateField("concertName", e.target.value)}
                    placeholder="공연명을 입력해 주세요"
                    className={inputClass}
                  />
                </label>

                <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                  가수
                  <input
                    value={ticket.artist}
                    onChange={(e) => updateField("artist", e.target.value)}
                    placeholder="가수명을 입력해 주세요"
                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                    날짜{autoBadge}
                    <input
                      value={ticket.date}
                      onChange={(e) => updateField("date", e.target.value)}
                      placeholder="25-10-09"
                      className={inputClass}
                    />
                  </label>
                  <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                    요일{autoBadge}
                    <input
                      value={ticket.day}
                      onChange={(e) => updateField("day", e.target.value)}
                      placeholder="Thu"
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                  공연장{autoBadge}
                  <input
                    value={ticket.venue}
                    onChange={(e) => updateField("venue", e.target.value)}
                    placeholder="예: KSPO DOME"
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            <button
              type="button"
              onClick={handleComplete}
              disabled={!canProceed}
              className="mx-auto mt-8 block h-[min(92px,9dvh)] w-[190px] rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.18),inset_0_2px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              수정 완료
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-10 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
              수정 완료!
            </h2>

            <TicketPreview ticket={ticket} className="mt-10" />

            <div className="mx-auto mt-8 flex w-full items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsCompleted(false)}
                className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa]"
              >
                다시 수정하기
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
              >
                다음
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
