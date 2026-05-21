"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import { FlowButtonRow, FlowPrimaryHalf, FlowSecondaryHalf } from "../_shared/FlowButtons";
import { TicketFrontContent } from "../_shared/TicketFrontContent";
import { clearTicketDraft, loadTicketDraft } from "@/lib/ticket/draft-storage";
import {
  clearBackImageDraft,
  loadBackImageDraft,
} from "@/lib/tickets/back-image-store";
import { saveUserTicket } from "@/lib/tickets/user-tickets";
import {
  YEOUN_MUTED,
  YEOUN_TICKET_CARD,
  YEOUN_TICKET_CARD_INNER,
  YEOUN_TICKET_SLOT,
  YEOUN_TEXT,
} from "@/lib/ui/yeoun-scale";
import { Suspense, useEffect, useRef, useState } from "react";
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
  const saveStartedRef = useRef(false);

  const emotionsParam = searchParams.get("emotions");
  const quote = searchParams.get("quote")?.trim() ?? "";
  const backImage = searchParams.get("back") ?? backImageDraft;

  const ticketBackground = gradientFromEmotionParam(emotionsParam);
  const frontHasQuote = quote.length > 0;

  useEffect(() => {
    void (async () => {
      setBackImageDraft(await loadBackImageDraft());
      setRegistration(loadTicketDraft());
    })();
  }, []);

  const handleSave = async () => {
    if (typeof window === "undefined" || isSaving || saveStartedRef.current) return;

    saveStartedRef.current = true;
    setIsSaving(true);
    setSaveError("");

    const reg = loadTicketDraft();
    const resolvedBack =
      searchParams.get("back") ?? backImageDraft ?? (await loadBackImageDraft());

    const result = await saveUserTicket({
      id: Date.now(),
      emotions: emotionsParam ?? "",
      quote,
      backImage: resolvedBack,
      concertName: reg.concertName,
      artist: reg.artist,
      date: reg.date,
      day: reg.day,
      venue: reg.venue,
    });

    if (!result.ok) {
      saveStartedRef.current = false;
      setIsSaving(false);
      setSaveError("저장에 실패했습니다. 용량이 크면 뒷면 사진 없이 다시 시도해 주세요.");
      return;
    }

    clearTicketDraft();
    await clearBackImageDraft();
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
