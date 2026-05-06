"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMOTION_CHIPS = [
  { label: "강렬", color: "#FF7EB9" },
  { label: "행복", color: "#FFC4D0" },
  { label: "벅참", color: "#FF8E9E" },
  { label: "신남", color: "#FFC192" },
  { label: "전율", color: "#FFF6A3" },
  { label: "편안", color: "#C6F3E2" },
  { label: "아련", color: "#7DE2D1" },
  { label: "뭉클", color: "#A0D9EF" },
  { label: "몽환", color: "#C5A3FF" },
];

export default function EmotionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleChip = (label: string) => {
    setSelected((prev) => {
      if (prev.includes(label)) return prev.filter((item) => item !== label);
      if (prev.length >= 3) return prev;
      return [...prev, label];
    });
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

        <section className="relative mx-auto mt-10 flex h-[24cqh] w-[97%] flex-col items-center justify-center rounded-[50%] border border-[#f1c9d8] bg-white px-8 text-center">
          <span className="absolute -bottom-[2.1cqh] left-1/2 h-[4.2cqh] w-[4.2cqh] -translate-x-1/2 rotate-45 border-b border-r border-[#f1c9d8] bg-white" />
          <h1 className="text-[5cqw] font-extrabold leading-[1.28] tracking-[-0.03em]">
            오늘 공연은
            <br />
            어떤 느낌이었나요?
          </h1>
        </section>

        <p className="mt-9 text-center text-[4.4cqw] font-semibold leading-[1.35] tracking-[-0.02em]">
          오늘 공연을 보고 느낀 감정을 선택해 보세요!
          <br />
          (최대 3개까지만 선택이 가능합니다.)
        </p>

        <section className="mt-8 grid grid-cols-3 gap-[3.5cqw]">
          {EMOTION_CHIPS.map((chip) => {
            const isSelected = selected.includes(chip.label);
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => toggleChip(chip.label)}
                className="aspect-square w-full rounded-[1.8cqw] border border-[#e9e3dd] text-[4.4cqw] font-bold text-[#202020] shadow-[0_8px_14px_rgba(0,0,0,0.15)] transition active:scale-[0.98]"
                style={{
                  backgroundColor: chip.color,
                  outline: isSelected ? "3px solid #FDAFC7" : "none",
                  outlineOffset: "-3px",
                }}
              >
                {chip.label}
              </button>
            );
          })}
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
              const params = new URLSearchParams();
              if (selected.length > 0) {
                params.set("emotions", selected.join(","));
              }
              router.push(`/create/ticket?${params.toString()}`);
            }}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
          >
            다음
          </button>
        </div>
      </main>
    </div>
  );
}
