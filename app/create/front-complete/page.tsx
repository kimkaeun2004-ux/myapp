"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import { FlowButtonRow, FlowPrimaryHalf, FlowSecondaryHalf } from "../_shared/FlowButtons";
import { TicketFrontContent } from "../_shared/TicketFrontContent";
import { useTicketRegistration } from "@/lib/ticket/use-ticket-registration";
import {
  YEOUN_TICKET_CARD,
  YEOUN_TICKET_CARD_INNER,
  YEOUN_TICKET_SLOT,
} from "@/lib/ui/yeoun-scale";
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
    <CreateFlowShell
      title={
        <>
          티켓 앞면이 <span className="text-[#FDAFC7]">완성</span>되었어요!
        </>
      }
      footer={
        <FlowButtonRow>
          <FlowSecondaryHalf type="button" onClick={() => router.back()}>
            이전
          </FlowSecondaryHalf>
          <FlowPrimaryHalf
            type="button"
            onClick={() => {
              const qs = searchParams.toString();
              router.push(qs.length > 0 ? `/create/back?${qs}` : "/create/back");
            }}
          >
            뒷면 만들기
          </FlowPrimaryHalf>
        </FlowButtonRow>
      }
    >
      <div className={YEOUN_TICKET_SLOT}>
        <section className={YEOUN_TICKET_CARD} style={{ backgroundImage: ticketBackground }}>
          <div
            className={`${YEOUN_TICKET_CARD_INNER} ${showQuoteBlock ? "justify-start pt-[14cqh]" : ""}`}
          >
            <TicketFrontContent
              ticket={registration}
              quote={showQuoteBlock ? quote : undefined}
            />
          </div>
        </section>
      </div>
    </CreateFlowShell>
  );
}
