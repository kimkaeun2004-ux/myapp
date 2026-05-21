"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import {
  FlowButtonRow,
  FlowCtaButton,
  FlowPrimaryHalf,
  FlowSecondaryHalf,
} from "../_shared/FlowButtons";
import { TicketPreview } from "../_shared/TicketPreview";
import {
  hasScannedTicketDraft,
  loadTicketDraft,
  saveTicketDraft,
} from "@/lib/ticket/draft-storage";
import type { TicketRegistrationDraft } from "@/lib/ticket/types";
import {
  YEOUN_CONFIRM_INPUT,
  YEOUN_CONFIRM_LABEL,
  YEOUN_TICKET_FORM_CARD,
  YEOUN_TICKET_SLOT,
} from "@/lib/ui/yeoun-scale";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    <CreateFlowShell
      title={isCompleted ? "수정 완료!" : "티켓 정보를 확인해 주세요"}
      footer={
        isCompleted ? (
          <FlowButtonRow>
            <FlowSecondaryHalf type="button" onClick={() => setIsCompleted(false)}>
              다시 수정하기
            </FlowSecondaryHalf>
            <FlowPrimaryHalf type="button" onClick={handleNext}>
              다음
            </FlowPrimaryHalf>
          </FlowButtonRow>
        ) : (
          <FlowCtaButton type="button" onClick={handleComplete} disabled={!canProceed}>
            수정 완료
          </FlowCtaButton>
        )
      }
    >
      {isCompleted ? (
        <TicketPreview ticket={ticket} />
      ) : (
        <div className={YEOUN_TICKET_SLOT}>
          <section className={YEOUN_TICKET_FORM_CARD}>
            <div className="flex h-full w-full flex-col justify-center gap-[1.6cqh]">
              <label className={YEOUN_CONFIRM_LABEL}>
                공연명
                <input
                  value={ticket.concertName}
                  onChange={(e) => updateField("concertName", e.target.value)}
                  placeholder="공연명"
                  className={YEOUN_CONFIRM_INPUT}
                />
              </label>

              <label className={YEOUN_CONFIRM_LABEL}>
                가수
                <input
                  value={ticket.artist}
                  onChange={(e) => updateField("artist", e.target.value)}
                  placeholder="가수명"
                  className={YEOUN_CONFIRM_INPUT}
                />
              </label>

              <div className="grid grid-cols-2 gap-[1.6cqw]">
                <label className={YEOUN_CONFIRM_LABEL}>
                  날짜
                  <input
                    value={ticket.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    placeholder="25-10-31"
                    className={YEOUN_CONFIRM_INPUT}
                  />
                </label>
                <label className={YEOUN_CONFIRM_LABEL}>
                  요일
                  <input
                    value={ticket.day}
                    onChange={(e) => updateField("day", e.target.value)}
                    placeholder="Fri"
                    className={YEOUN_CONFIRM_INPUT}
                  />
                </label>
              </div>

              <label className={YEOUN_CONFIRM_LABEL}>
                공연장
                <input
                  value={ticket.venue}
                  onChange={(e) => updateField("venue", e.target.value)}
                  placeholder="인스파이어 아레나"
                  className={YEOUN_CONFIRM_INPUT}
                />
              </label>
            </div>
          </section>
        </div>
      )}
    </CreateFlowShell>
  );
}
