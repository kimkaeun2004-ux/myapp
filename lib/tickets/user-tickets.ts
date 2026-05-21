import {
  deleteTicketFromSupabase,
  fetchUserStoredTickets,
  getCurrentUserId,
  saveTicketToSupabase,
  syncLocalTicketsToSupabase,
} from "@/lib/tickets/supabase-tickets";
import {
  attachSupabaseIdToLocalTicket,
  dedupeStoredTickets,
  filterDeletedTickets,
  hydrateStoredTickets,
  loadStoredTickets,
  markTicketDeleted,
  migrateInlineBackImagesToIdb,
  removeStoredTicket,
  saveStoredTicket,
  storedTicketsMatch,
  writeTicketsCache,
  type StoredTicket,
} from "@/lib/tickets/storage";

async function cacheTicketsLocally(tickets: StoredTicket[]) {
  if (typeof window === "undefined") return;
  await writeTicketsCache(tickets);
}

function mergeTicketLists(
  remote: StoredTicket[],
  local: StoredTicket[]
): StoredTicket[] {
  const merged: StoredTicket[] = [];

  const pushUnique = (ticket: StoredTicket) => {
    if (merged.some((t) => storedTicketsMatch(t, ticket))) return;
    merged.push(ticket);
  };

  for (const ticket of remote) pushUnique(ticket);
  for (const ticket of local) {
    if (merged.some((t) => storedTicketsMatch(t, ticket))) continue;
    pushUnique(ticket);
  }

  return dedupeStoredTickets(
    filterDeletedTickets(merged.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)))
  );
}

/** 이메일 로그인 시 Supabase + sessionStorage 병합, 게스트는 sessionStorage */
export async function loadUserTickets(): Promise<StoredTicket[]> {
  if (typeof window !== "undefined") {
    await migrateInlineBackImagesToIdb();
    try {
      window.sessionStorage.removeItem("yeounBackImageDraft");
    } catch {
      // ignore
    }
  }

  const local = filterDeletedTickets(loadStoredTickets());
  const userId = await getCurrentUserId();

  if (!userId) {
    const hydrated = await hydrateStoredTickets(local);
    await cacheTicketsLocally(hydrated);
    return hydrated;
  }

  await syncLocalTicketsToSupabase();

  const remote = await fetchUserStoredTickets();
  const merged = mergeTicketLists(remote, local);
  await cacheTicketsLocally(merged);

  return hydrateStoredTickets(merged);
}

/** 완성 화면 저장 — 로컬 목록에 추가 후 (로그인 시) Supabase 동기화 */
export async function saveUserTicket(
  ticket: StoredTicket
): Promise<{ ok: true } | { ok: false; reason: "storage" }> {
  const stored = await saveStoredTicket(ticket);
  if (!stored.ok) return stored;

  const userId = await getCurrentUserId();
  if (!userId) return { ok: true };

  const backForRemote =
    ticket.backImage?.trim() && ticket.backImage.length < 400_000
      ? ticket.backImage
      : undefined;

  const { ok, id: supabaseId } = await saveTicketToSupabase({
    emotion: ticket.emotions,
    concertName: ticket.concertName,
    artist: ticket.artist,
    quote: ticket.quote,
    venue: ticket.venue,
    date: ticket.date,
    day: ticket.day,
    backImage: backForRemote,
  });

  if (ok && supabaseId) {
    await attachSupabaseIdToLocalTicket(ticket, supabaseId);
  }

  const local = loadStoredTickets();
  if (ok) {
    const remote = await fetchUserStoredTickets();
    await cacheTicketsLocally(mergeTicketLists(remote, local));
  } else {
    await cacheTicketsLocally(local);
  }

  return { ok: true };
}

/** 메인 등에서 티켓 삭제 — 로컬·Supabase·삭제 기록 모두 반영 */
export async function deleteUserTicket(
  ticket: StoredTicket
): Promise<StoredTicket[]> {
  markTicketDeleted(ticket);

  const userId = await getCurrentUserId();

  if (userId) {
    const remote = await fetchUserStoredTickets();
    const ids = new Set<string>();
    for (const row of remote) {
      if (storedTicketsMatch(row, ticket) && row.supabaseId) {
        ids.add(row.supabaseId);
      }
    }
    if (ticket.supabaseId) ids.add(ticket.supabaseId);

    await Promise.all([...ids].map((id) => deleteTicketFromSupabase(id)));
  }

  const removed = await removeStoredTicket(ticket);
  const next = filterDeletedTickets(removed);
  await cacheTicketsLocally(next);
  return hydrateStoredTickets(next);
}
