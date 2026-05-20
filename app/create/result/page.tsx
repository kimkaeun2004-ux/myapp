"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import { FlowButtonRow, FlowPrimaryHalf, FlowSecondaryHalf } from "../_shared/FlowButtons";
import { TicketPreview } from "../_shared/TicketPreview";
import { loadTicketDraft } from "@/lib/ticket/draft-storage";
import type { TicketRegistrationDraft } from "@/lib/ticket/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildGradient } from "../_shared/ticket-gradient";

const DEFAULT_PREVIEW_GRADIENT = buildGradient(["#FFC4D0", "#C6F3E2"]);

export default function ResultPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketRegistrationDraft | null>(null);

  useEffect(() => {
    setTicket(loadTicketDraft());
  }, []);

  if (!ticket) {
    return (
      <CreateFlowShell title="불러오는 중...">
        <div />
      </CreateFlowShell>
    );
  }

  return (
    <CreateFlowShell
      title={
        <>
          티켓 인식이 <span className="text-[#FDAFC7]">완료</span>되었어요!
        </>
      }
      subtitle="내용을 확인한 뒤 다음으로 진행해 주세요."
      footer={
        <FlowButtonRow>
          <FlowSecondaryHalf type="button" onClick={() => router.push("/create/confirm")}>
            수정하기
          </FlowSecondaryHalf>
          <FlowPrimaryHalf
            type="button"
            onClick={() => router.push("/create/emotion")}
            disabled={!ticket.concertName.trim() || !ticket.artist.trim()}
          >
            다음
          </FlowPrimaryHalf>
        </FlowButtonRow>
      }
    >
      <TicketPreview ticket={ticket} style={{ backgroundImage: DEFAULT_PREVIEW_GRADIENT }} />
    </CreateFlowShell>
  );
}
