import {
  fetchUserStoredTickets,
  getCurrentUserId,
  syncLocalTicketsToSupabase,
} from "@/lib/tickets/supabase-tickets";
import { loadStoredTickets, type StoredTicket } from "@/lib/tickets/storage";

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
