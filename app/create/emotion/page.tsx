"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import { FlowButtonRow, FlowPrimaryHalf, FlowSecondaryHalf } from "../_shared/FlowButtons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { YEOUN_TEXT, YEOUN_TICKET_CARD, YEOUN_TICKET_SLOT } from "@/lib/ui/yeoun-scale";

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
    <CreateFlowShell
      title="오늘 공연은 어떤 느낌이었나요?"
      subtitle="최대 3개까지 선택할 수 있어요."
      footer={
        <FlowButtonRow>
          <FlowSecondaryHalf type="button" onClick={() => router.back()}>
            이전
          </FlowSecondaryHalf>
          <FlowPrimaryHalf
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (selected.length > 0) {
                params.set("emotions", selected.join(","));
              }
              router.push(`/create/ticket?${params.toString()}`);
            }}
          >
            다음
          </FlowPrimaryHalf>
        </FlowButtonRow>
      }
    >
      <div className={YEOUN_TICKET_SLOT}>
        <section
          className={`${YEOUN_TICKET_CARD} !h-[min(520px,50dvh)] !min-h-[340px] border-[#FDAFC7] bg-[#ffffff] px-[4cqw] py-[6.5cqw]`}
        >
          <div className="grid w-full grid-cols-3 gap-[1.8cqw]">
            {EMOTION_CHIPS.map((chip) => {
              const isSelected = selected.includes(chip.label);
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => toggleChip(chip.label)}
                  aria-pressed={isSelected}
                  className={`flex aspect-square w-full items-center justify-center rounded-[2cqw] border border-[#e9e3dd] ${YEOUN_TEXT.body} text-[#202020] shadow-[0_6px_12px_rgba(0,0,0,0.12)] transition-opacity duration-150 active:scale-[0.98] ${
                    isSelected ? "opacity-30" : "opacity-100"
                  }`}
                  style={{ backgroundColor: chip.color }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </CreateFlowShell>
  );
}
