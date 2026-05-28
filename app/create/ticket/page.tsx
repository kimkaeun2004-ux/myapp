"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import { FlowButtonRow, FlowPrimaryHalf, FlowSecondaryHalf } from "../_shared/FlowButtons";
import { TicketFrontContent } from "../_shared/TicketFrontContent";
import { useTicketRegistration } from "@/lib/ticket/use-ticket-registration";
import {
  YEOUN_TEXT,
  YEOUN_TICKET,
  YEOUN_TICKET_CARD,
  YEOUN_TICKET_CARD_INNER,
  YEOUN_TICKET_SLOT,
} from "@/lib/ui/yeoun-scale";
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
    <CreateFlowShell
      title={
        <>
          가장 기억에 남는 가사나 대사를 <span className="text-[#FDAFC7]">입력</span>해주세요.
        </>
      }
      footer={
        <FlowButtonRow>
          <FlowSecondaryHalf type="button" onClick={() => router.back()}>
            이전
          </FlowSecondaryHalf>
          <FlowPrimaryHalf
            type="button"
            onClick={() => router.push(buildFrontCompleteHref({ skip: true }))}
          >
            스킵하기
          </FlowPrimaryHalf>
        </FlowButtonRow>
      }
    >
      <div className={YEOUN_TICKET_SLOT}>
        <section className={YEOUN_TICKET_CARD} style={{ backgroundImage: ticketBackground }}>
          <div className={`${YEOUN_TICKET_CARD_INNER} justify-start gap-[1.2cqh] pt-[10cqh]`}>
            <TicketFrontContent ticket={registration} />
            <div className="flex w-[86%] flex-col items-center gap-[1.2cqh] rounded-[2cqw] bg-[rgba(255,255,255,0.55)] px-[3cqw] py-[1.6cqh] shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
              <textarea
                value={draftQuote}
                onChange={(e) => setDraftQuote(e.target.value)}
                placeholder="클릭하여 입력"
                rows={2}
                className={`min-h-[2.8cqh] w-full resize-none bg-transparent text-center ${YEOUN_TICKET.quote} outline-none placeholder:text-[#131313]/55`}
              />
              <button
                type="button"
                onClick={() => {
                  const q = draftQuote.trim();
                  router.push(buildFrontCompleteHref({ quote: q }));
                }}
                className={`flex h-[min(26px,2.8dvh)] min-h-[24px] w-[min(58px,13cqw)] items-center justify-center rounded-[2cqw] border border-[#FDAFC7] bg-[#FDAFC7] ${YEOUN_TEXT.body} leading-none text-[#222] shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition hover:bg-[#f99fbe]`}
              >
                입력하기
              </button>
            </div>
          </div>
        </section>
      </div>
    </CreateFlowShell>
  );
}
