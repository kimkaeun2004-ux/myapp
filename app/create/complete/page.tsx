"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import { FlowButtonRow, FlowPrimaryHalf, FlowSecondaryHalf } from "../_shared/FlowButtons";
import { TicketFrontContent } from "../_shared/TicketFrontContent";
import { clearTicketDraft, loadTicketDraft } from "@/lib/ticket/draft-storage";
import { saveStoredTicket } from "@/lib/tickets/storage";
import { saveTicketToSupabase } from "@/lib/tickets/supabase-tickets";
import {
  YEOUN_MUTED,
  YEOUN_TICKET_CARD,
  YEOUN_TICKET_CARD_INNER,
  YEOUN_TICKET_SLOT,
  YEOUN_TEXT,
} from "@/lib/ui/yeoun-scale";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gradientFromEmotionParam } from "../_shared/ticket-gradient";

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showBack, setShowBack] = useState(false);
  const [backImageDraft, setBackImageDraft] = useState("");
  const [registration, setRegistration] = useState(loadTicketDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const emotionsParam = searchParams.get("emotions");
  const quote = searchParams.get("quote")?.trim() ?? "";
  const backImage = searchParams.get("back") ?? backImageDraft;

  const ticketBackground = gradientFromEmotionParam(emotionsParam);
  const frontHasQuote = quote.length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = window.sessionStorage.getItem("yeounBackImageDraft") ?? "";
    setBackImageDraft(draft);
    setRegistration(loadTicketDraft());
  }, []);

  const handleSave = async () => {
    if (typeof window === "undefined" || isSaving) return;

    setIsSaving(true);
    setSaveError("");

    const reg = loadTicketDraft();
    const result = await saveStoredTicket({
      id: Date.now(),
      emotions: emotionsParam ?? "",
      quote,
      backImage: backImage ?? "",
      concertName: reg.concertName,
      artist: reg.artist,
      date: reg.date,
      day: reg.day,
      venue: reg.venue,
    });

    setIsSaving(false);

    if (!result.ok) {
      setSaveError("저장에 실패했습니다.");
      return;
    }

    try {
      await saveTicketToSupabase({
        emotion: emotionsParam ?? "",
        concertName: reg.concertName,
        artist: reg.artist,
        quote,
        venue: reg.venue,
        date: reg.date,
        day: reg.day,
        backImage: backImage ?? "",
      });
    } catch {
      // Supabase 저장은 베스트 에포트.
    }

    clearTicketDraft();
    window.sessionStorage.removeItem("yeounBackImageDraft");
    router.push("/main");
  };

  return (
    <CreateFlowShell
      title={
        <>
          티켓이 <span className="text-[#FDAFC7]">완성</span>되었어요!
        </>
      }
      subtitle={backImage ? "티켓을 눌러 뒷면을 볼 수 있어요." : undefined}
      footer={
        <>
          <FlowButtonRow>
            <FlowSecondaryHalf
              type="button"
              onClick={() => router.back()}
              disabled={isSaving}
              className="disabled:opacity-60"
            >
              이전
            </FlowSecondaryHalf>
            <FlowPrimaryHalf
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="disabled:opacity-70"
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </FlowPrimaryHalf>
          </FlowButtonRow>
          {saveError ? (
            <p className={`text-center ${YEOUN_TEXT.bodyMedium} text-[#b14d70]`}>{saveError}</p>
          ) : null}
        </>
      }
    >
      <div className={YEOUN_TICKET_SLOT}>
        <button
          type="button"
          onClick={() => {
            if (backImage) setShowBack((prev) => !prev);
          }}
          className={`${YEOUN_TICKET_CARD} p-0`}
          style={!showBack || !backImage ? { backgroundImage: ticketBackground } : undefined}
        >
          {!showBack || !backImage ? (
            <div className={YEOUN_TICKET_CARD_INNER}>
              <TicketFrontContent
                ticket={registration}
                quote={frontHasQuote ? quote : undefined}
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backImage}
              alt="티켓 뒷면"
              className="h-full w-full rounded-[14px] object-cover"
            />
          )}
        </button>
      </div>
    </CreateFlowShell>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteContent />
    </Suspense>
  );
}
