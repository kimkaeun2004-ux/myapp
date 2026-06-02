"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import {
  FlowButtonRow,
  FlowOutlineButton,
  FlowPrimaryHalf,
  FlowSecondaryHalf,
} from "../_shared/FlowButtons";
import { saveTicketToGallery } from "@/lib/ticket/save-ticket-image";
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
  const [isSharing, setIsSharing] = useState(false);
  const [shareHint, setShareHint] = useState("");
  const saveStartedRef = useRef(false);
  const ticketCaptureRef = useRef<HTMLDivElement>(null);

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
      concertName: reg.concertName.trim(),
      artist: reg.artist.trim(),
      date: reg.date.trim(),
      day: reg.day.trim(),
      venue: reg.venue.trim(),
    });

    if (!result.ok) {
      saveStartedRef.current = false;
      setIsSaving(false);
      setSaveError(
        result.reason === "remote"
          ? "티켓 발행에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요."
          : "저장에 실패했습니다. 용량이 크면 뒷면 사진 없이 다시 시도해 주세요."
      );
      return;
    }

    clearTicketDraft();
    await clearBackImageDraft();
    router.push("/report");
  };

  const handleShareToGallery = async () => {
    const node = ticketCaptureRef.current;
    if (!node || isSharing || isSaving) return;

    setIsSharing(true);
    setShareHint("");

    const result = await saveTicketToGallery(node);

    setIsSharing(false);

    if (!result.ok) {
      setShareHint(result.error);
      return;
    }

    if (result.method === "share") {
      setShareHint("공유 메뉴에서 「사진에 저장」을 선택해 주세요.");
    } else {
      setShareHint("이미지를 저장했어요. 갤러리 또는 다운로드 폴더를 확인해 주세요.");
    }
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
              {isSaving ? "발행 중..." : "발행하기"}
            </FlowPrimaryHalf>
          </FlowButtonRow>
          <FlowOutlineButton
            type="button"
            onClick={() => void handleShareToGallery()}
            disabled={isSaving || isSharing}
            className="disabled:opacity-60"
          >
            {isSharing ? "이미지 만드는 중..." : "갤러리에 저장"}
          </FlowOutlineButton>
          {saveError ? (
            <p className={`text-center ${YEOUN_TEXT.bodyMedium} text-[#b14d70]`}>{saveError}</p>
          ) : null}
          {shareHint ? (
            <p className={`text-center ${YEOUN_MUTED}`}>{shareHint}</p>
          ) : null}
        </>
      }
    >
      <div className={YEOUN_TICKET_SLOT}>
        <div
          ref={ticketCaptureRef}
          role={backImage ? "button" : undefined}
          tabIndex={backImage ? 0 : undefined}
          onClick={() => {
            if (backImage) setShowBack((prev) => !prev);
          }}
          onKeyDown={(e) => {
            if (!backImage) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowBack((prev) => !prev);
            }
          }}
          className={`${YEOUN_TICKET_CARD} p-0 ${backImage ? "cursor-pointer" : ""}`}
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
        </div>
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
