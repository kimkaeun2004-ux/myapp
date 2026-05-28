import { clearLegacyProfileStorage, clearAllProfileCaches } from "@/lib/profile/storage";

const TICKET_LIST_KEY = "yeounTickets";
const TICKET_SINGLE_KEY = "yeounTicket";
const DELETED_TICKETS_KEY = "yeounDeletedTickets";

/** 다른 이메일로 로그인할 때 이전 계정의 로컬 데이터 제거 */
export function clearLocalDataForAccountSwitch() {
  clearLegacyProfileStorage();
  clearAllProfileCaches();

  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(TICKET_LIST_KEY);
    window.sessionStorage.removeItem(TICKET_SINGLE_KEY);
    window.sessionStorage.removeItem(DELETED_TICKETS_KEY);
    window.sessionStorage.removeItem("yeounBackImageDraft");
  } catch {
    // ignore
  }
}
