import {
  deleteTicketFromSupabase,
  fetchUserStoredTickets,
  getCurrentUserId,
  syncLocalTicketsToSupabase,
} from "@/lib/tickets/supabase-tickets";
import {
  loadStoredTickets,
  removeStoredTicket,
  type StoredTicket,
} from "@/lib/tickets/storage";

function cacheTicketsLocally(tickets: StoredTicket[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("yeounTickets", JSON.stringify(tickets));
  if (tickets[0]) {
    window.sessionStorage.setItem("yeounTicket", JSON.stringify(tickets[0]));
  }
}

/** 이메일 로그인 시 Supabase, 게스트는 sessionStorage */
export async function loadUserTickets(): Promise<StoredTicket[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return loadStoredTickets();
  }

  await syncLocalTicketsToSupabase();

  const remote = await fetchUserStoredTickets();
  if (remote.length > 0) {
    cacheTicketsLocally(remote);
    return remote;
  }

  return loadStoredTickets();
}

function storedTicketsMatch(a: StoredTicket, b: StoredTicket): boolean {
  if (a.supabaseId && b.supabaseId) return a.supabaseId === b.supabaseId;
  if (a.id != null && b.id != null) return a.id === b.id;
  return (
    a.emotions === b.emotions &&
    a.quote === b.quote &&
    a.backImage === b.backImage
  );
}

/** 메인 등에서 티켓 삭제 — 로컬 캐시 + (로그인 시) Supabase */
export async function deleteUserTicket(
  ticket: StoredTicket
): Promise<StoredTicket[]> {
  const userId = await getCurrentUserId();
  let supabaseId = ticket.supabaseId;

  if (userId && !supabaseId) {
    const remote = await fetchUserStoredTickets();
    const match = remote.find((r) => storedTicketsMatch(r, ticket));
    supabaseId = match?.supabaseId;
  }

  if (userId && supabaseId) {
    await deleteTicketFromSupabase(supabaseId);
  }

  return removeStoredTicket(ticket);
}
