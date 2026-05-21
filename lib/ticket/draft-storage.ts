import {
  EMPTY_TICKET_DRAFT,
  type TicketRegistrationDraft,
} from "@/lib/ticket/types";

const DRAFT_KEY = "yeounTicketDraft";

export function loadTicketDraft(): TicketRegistrationDraft {
  if (typeof window === "undefined") return { ...EMPTY_TICKET_DRAFT };

  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...EMPTY_TICKET_DRAFT };
    const parsed = JSON.parse(raw) as Partial<TicketRegistrationDraft>;
    return {
      concertName: parsed.concertName ?? "",
      artist: parsed.artist ?? "",
      date: parsed.date ?? "",
      day: parsed.day ?? "",
      venue: parsed.venue ?? "",
      rawOcrText: parsed.rawOcrText,
      imageDataUrl: parsed.imageDataUrl,
    };
  } catch {
    return { ...EMPTY_TICKET_DRAFT };
  }
}

function toPersistedDraft(draft: TicketRegistrationDraft): TicketRegistrationDraft {
  return {
    concertName: draft.concertName,
    artist: draft.artist,
    date: draft.date,
    day: draft.day,
    venue: draft.venue,
    rawOcrText: draft.rawOcrText,
    // imageDataUrl는 용량 때문에 sessionStorage에 저장하지 않음
  };
}

export function saveTicketDraft(draft: TicketRegistrationDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(toPersistedDraft(draft)));
}

export function clearTicketDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

/** 새 티켓 제작 시작 시 이전 제작 임시 데이터 제거 (저장된 티켓 목록은 유지) */
export function beginNewTicketCreation() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_KEY);
  window.sessionStorage.removeItem("yeounTicket");
  window.sessionStorage.removeItem("yeounBackImageDraft");
  void import("@/lib/tickets/back-image-store").then(({ clearBackImageDraft }) =>
    clearBackImageDraft()
  );
}

export function hasScannedTicketDraft(): boolean {
  const draft = loadTicketDraft();
  return Boolean(draft.rawOcrText || draft.imageDataUrl);
}
