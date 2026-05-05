"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TicketDraft = {
  concertName: string;
  title: string;
  date: string;
  day: string;
  artist: string;
};

export default function ConfirmPage() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [ticket, setTicket] = useState<TicketDraft>({
    concertName: "2025 DOYOUNG ENCORE CONCERT",
    title: "YOURS",
    date: "25-10-09",
    day: "Thu",
    artist: "DOYOUNG",
  });

  const updateField = (field: keyof TicketDraft, value: string) => {
    setTicket((prev) => ({ ...prev, [field]: value }));
  };

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

        {!isCompleted ? (
          <>
            <h1 className="mt-12 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
              티켓 정보를 확인해 주세요
            </h1>

            <section className="mt-10 rounded-[18px] border border-[#FDAFC7] bg-white p-5 shadow-[0_10px_22px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col gap-4">
                <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                  콘서트명
                  <input
                    value={ticket.concertName}
                    onChange={(e) => updateField("concertName", e.target.value)}
                    className="mt-2 h-11 w-full rounded-[10px] border border-[#FDAFC7] bg-[#fffdfd] px-3 text-[3.2cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]"
                  />
                </label>

                <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                  티켓 타이틀
                  <input
                    value={ticket.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="mt-2 h-11 w-full rounded-[10px] border border-[#FDAFC7] bg-[#fffdfd] px-3 text-[3.2cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                    날짜
                    <input
                      value={ticket.date}
                      onChange={(e) => updateField("date", e.target.value)}
                      className="mt-2 h-11 w-full rounded-[10px] border border-[#FDAFC7] bg-[#fffdfd] px-3 text-[3.2cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]"
                    />
                  </label>
                  <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                    요일
                    <input
                      value={ticket.day}
                      onChange={(e) => updateField("day", e.target.value)}
                      className="mt-2 h-11 w-full rounded-[10px] border border-[#FDAFC7] bg-[#fffdfd] px-3 text-[3.2cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]"
                    />
                  </label>
                </div>

                <label className="text-[3.2cqw] font-semibold text-[#3c3c3c]">
                  가수
                  <input
                    value={ticket.artist}
                    onChange={(e) => updateField("artist", e.target.value)}
                    className="mt-2 h-11 w-full rounded-[10px] border border-[#FDAFC7] bg-[#fffdfd] px-3 text-[3.2cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]"
                  />
                </label>
              </div>
            </section>

            <button
              type="button"
              onClick={() => setIsCompleted(true)}
              className="mx-auto mt-8 block h-[92px] w-[190px] rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.18),inset_0_2px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe] active:translate-y-[1px]"
            >
              수정 완료
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-12 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
              수정 완료!
            </h2>

            <section className="mx-auto mt-8 w-[84cqw] rounded-[12px] border border-[#e7e7e7] bg-white px-6 py-8 text-center shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
              <p className="text-[2.5cqw] font-medium tracking-[0.01em]">{ticket.concertName}</p>
              <p className="mt-2 text-[7cqw] font-black leading-none">{ticket.title}</p>
              <p className="mt-2 text-[2.9cqw] font-semibold">
                {ticket.date} · {ticket.day}
              </p>
              <p className="mt-2 text-[3cqw] font-bold tracking-[0.02em]">{ticket.artist}</p>
            </section>

            <button
              type="button"
              onClick={() => router.push("/main")}
              className="mx-auto mt-10 block h-[52px] w-[120px] rounded-[13px] border border-[#FDAFC7] bg-[#FDAFC7] text-[3.2cqw] font-semibold text-[#2b2b2b] shadow-[0_7px_10px_rgba(0,0,0,0.22),inset_0_2px_0_rgba(255,255,255,0.48)] transition hover:bg-[#f99fbe] active:translate-y-[1px]"
            >
              다음
            </button>
          </>
        )}
      </main>
    </div>
  );
}
