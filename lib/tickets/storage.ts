import { compressDataUrl } from "@/lib/image/compress-data-url";
import {
  deleteTicketBackImage,
  loadTicketBackImage,
  migrateTicketBackImageToSupabaseKey,
  saveTicketBackImage,
} from "@/lib/tickets/back-image-store";

export type StoredTicket = {
  id?: number;
  /** Supabase yeoun_tickets.id (로그인 사용자 원격 삭제용) */
  supabaseId?: string;
  emotions: string;
  quote: string;
  backImage: string;
  /** sessionStorage에는 이미지 없음 — IndexedDB에 저장됨 */
  hasBackImage?: boolean;
  concertName?: string;
  artist?: string;
  date?: string;
  day?: string;
  venue?: string;
};

const MAX_TICKETS = 15;

function parseTicket(item: Partial<StoredTicket>, idx: number): StoredTicket {
  const hasBack =
    Boolean(item.hasBackImage) ||
    Boolean(item.backImage?.trim()?.startsWith("data:")) ||
    Boolean(item.backImage?.trim()?.startsWith("http"));
  return {
    id: item.id ?? Date.now() - idx,
    supabaseId: item.supabaseId,
    emotions: item.emotions ?? "",
    quote: item.quote ?? "",
    backImage: item.backImage?.startsWith("data:") || item.backImage?.startsWith("http")
      ? item.backImage
      : "",
    hasBackImage: hasBack,
    concertName: item.concertName,
    artist: item.artist,
    date: item.date,
    day: item.day,
    venue: item.venue,
  };
}

function ticketHasBack(t: StoredTicket): boolean {
  return Boolean(t.hasBackImage || t.backImage?.trim());
}

/** 동일 티켓 판별용 — id가 달라도 공연·감정·문구가 같으면 같은 티켓 */
export function ticketContentKey(t: StoredTicket): string {
  return [
    t.emotions?.trim() ?? "",
    t.concertName?.trim() ?? "",
    t.artist?.trim() ?? "",
    t.date?.trim() ?? "",
    t.day?.trim() ?? "",
    t.venue?.trim() ?? "",
    t.quote?.trim() ?? "",
    ticketHasBack(t) ? "1" : "0",
  ].join("\u0001");
}

export function storedTicketsMatch(a: StoredTicket, b: StoredTicket): boolean {
  if (a.supabaseId && b.supabaseId && a.supabaseId === b.supabaseId) return true;
  if (a.id != null && b.id != null && a.id === b.id) return true;
  return ticketContentKey(a) === ticketContentKey(b);
}

const DELETED_TICKETS_KEY = "yeounDeletedTickets";

function loadDeletedKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(DELETED_TICKETS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistDeletedKeys(keys: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DELETED_TICKETS_KEY, JSON.stringify([...keys]));
  } catch {
    // ignore
  }
}

/** 삭제한 티켓은 Supabase에 남아 있어도 목록에서 제외 */
export function markTicketDeleted(ticket: StoredTicket): void {
  const keys = loadDeletedKeys();
  keys.add(ticketContentKey(ticket));
  if (ticket.supabaseId) keys.add(`sb:${ticket.supabaseId}`);
  persistDeletedKeys(keys);
}

export function isTicketDeleted(ticket: StoredTicket): boolean {
  const keys = loadDeletedKeys();
  if (ticket.supabaseId && keys.has(`sb:${ticket.supabaseId}`)) return true;
  return keys.has(ticketContentKey(ticket));
}

export function filterDeletedTickets(list: StoredTicket[]): StoredTicket[] {
  return list.filter((t) => !isTicketDeleted(t));
}

export function dedupeStoredTickets(list: StoredTicket[]): StoredTicket[] {
  const byContent = new Map<string, StoredTicket>();
  const rank = (t: StoredTicket) =>
    (t.supabaseId ? 1_000_000_000_000 : 0) + (t.id ?? 0);

  for (const ticket of list) {
    const key = ticketContentKey(ticket);
    const prev = byContent.get(key);
    if (!prev || rank(ticket) > rank(prev)) {
      byContent.set(key, ticket);
    }
  }

  return Array.from(byContent.values())
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, MAX_TICKETS);
}

function hasTicketContent(item: Partial<StoredTicket>): boolean {
  return Boolean(
    item.emotions?.trim() ||
      item.quote?.trim() ||
      item.backImage?.trim() ||
      item.hasBackImage ||
      item.concertName?.trim() ||
      item.artist?.trim() ||
      item.venue?.trim()
  );
}

/** sessionStorage용 — 뒷면 이미지 제외(용량 초과 방지) */
export function stripTicketForSession(ticket: StoredTicket): StoredTicket {
  const hasBack = Boolean(
    ticket.hasBackImage || ticket.backImage?.trim()
  );
  return {
    ...ticket,
    backImage: "",
    hasBackImage: hasBack,
  };
}

function safeSessionSet(key: string, value: string): boolean {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function writeSessionTicketList(list: StoredTicket[]) {
  const slim = list.map(stripTicketForSession).slice(0, MAX_TICKETS);
  const json = JSON.stringify(slim);
  if (safeSessionSet("yeounTickets", json)) return;

  const minimal = slim.map((t) => ({
    ...t,
    quote: t.quote.length > 200 ? `${t.quote.slice(0, 200)}…` : t.quote,
  }));
  safeSessionSet("yeounTickets", JSON.stringify(minimal));
}

function writeSessionTicket(ticket: StoredTicket) {
  safeSessionSet("yeounTicket", JSON.stringify(stripTicketForSession(ticket)));
}

/** 기존 sessionStorage에 박혀 있던 base64 뒷면 → IndexedDB로 이전 */
export async function migrateInlineBackImagesToIdb(): Promise<void> {
  if (typeof window === "undefined") return;

  const rawList = window.sessionStorage.getItem("yeounTickets");
  if (!rawList) return;

  let list: StoredTicket[];
  try {
    list = (JSON.parse(rawList) as Partial<StoredTicket>[])
      .filter((item) => item && hasTicketContent(item))
      .map(parseTicket);
  } catch {
    return;
  }

  let changed = false;
  for (const ticket of list) {
    if (ticket.backImage?.startsWith("data:")) {
      await saveTicketBackImage(ticket, ticket.backImage);
      changed = true;
    }
  }

  if (changed) {
    writeSessionTicketList(list);
    if (list[0]) writeSessionTicket(list[0]);
  }
}

/** IndexedDB에서 뒷면 이미지 불러오기 */
export async function hydrateStoredTickets(
  tickets: StoredTicket[]
): Promise<StoredTicket[]> {
  return Promise.all(
    tickets.map(async (ticket) => {
      if (ticket.backImage?.startsWith("data:") || ticket.backImage?.startsWith("http")) {
        return ticket;
      }
      if (!ticket.hasBackImage) return ticket;
      const back = await loadTicketBackImage(ticket);
      return back ? { ...ticket, backImage: back } : ticket;
    })
  );
}

/** sessionStorage에서 티켓 제거 후 남은 목록 반환 (같은 내용 중복 포함) */
export async function removeStoredTicket(target: StoredTicket): Promise<StoredTicket[]> {
  const list = loadStoredTickets();
  const matching = list.filter((t) => storedTicketsMatch(t, target));
  await Promise.all(matching.map((t) => deleteTicketBackImage(t)));
  const next = list.filter((t) => !storedTicketsMatch(t, target));
  await writeTicketsCache(next);
  return next;
}

export async function writeTicketsCache(list: StoredTicket[]) {
  if (typeof window === "undefined") return;

  const capped = list.slice(0, MAX_TICKETS);
  for (const ticket of capped) {
    if (ticket.backImage?.trim()) {
      await saveTicketBackImage(ticket, ticket.backImage);
    } else if (ticket.hasBackImage) {
      const existing = await loadTicketBackImage(ticket);
      if (existing) {
        await saveTicketBackImage(ticket, existing);
      }
    }
  }

  writeSessionTicketList(capped);
  if (capped[0]) {
    writeSessionTicket(capped[0]);
  } else {
    try {
      window.sessionStorage.removeItem("yeounTicket");
    } catch {
      // ignore
    }
  }
}

export function loadStoredTickets(): StoredTicket[] {
  if (typeof window === "undefined") return [];

  try {
    const rawList = window.sessionStorage.getItem("yeounTickets");
    let list: StoredTicket[] = [];

    if (rawList) {
      const parsedList = JSON.parse(rawList) as Partial<StoredTicket>[];
      list = parsedList.filter((item) => item && hasTicketContent(item)).map(parseTicket);
    }

    const rawSingle = window.sessionStorage.getItem("yeounTicket");
    if (rawSingle) {
      const parsedSingle = JSON.parse(rawSingle) as Partial<StoredTicket>;
      if (parsedSingle && hasTicketContent(parsedSingle)) {
        const single = parseTicket(parsedSingle, 0);
        const alreadyInList = list.some((t) => storedTicketsMatch(t, single));

        if (!alreadyInList) {
          list = [single, ...list];
        }
      }
    }

    return dedupeStoredTickets(filterDeletedTickets(list));
  } catch {
    return [];
  }
}

/** Supabase 저장 후 로컬 캐시에 원격 id 연결 (중복 업로드 방지) */
export async function attachSupabaseIdToLocalTicket(
  ticket: StoredTicket,
  supabaseId: string
): Promise<void> {
  if (typeof window === "undefined" || !supabaseId) return;

  const list = loadStoredTickets();
  let changed = false;
  const next: StoredTicket[] = [];

  for (const t of list) {
    if (!storedTicketsMatch(t, ticket)) {
      next.push(t);
      continue;
    }
    changed = true;
    const updated = { ...t, supabaseId };
    await migrateTicketBackImageToSupabaseKey(updated);
    next.push(updated);
  }

  if (changed) {
    await writeTicketsCache(next);
  }
}

export async function saveStoredTicket(
  ticket: StoredTicket
): Promise<{ ok: true } | { ok: false; reason: "storage" }> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "storage" };
  }

  const id = ticket.id ?? Date.now();
  let backImage = ticket.backImage;
  if (backImage.startsWith("data:image/")) {
    backImage = await compressDataUrl(backImage, {
      maxWidth: 960,
      maxHeight: 960,
      quality: 0.62,
    });
  }

  const payload: StoredTicket = {
    ...ticket,
    id,
    backImage,
    hasBackImage: Boolean(backImage?.trim()),
  };

  if (payload.hasBackImage) {
    try {
      await saveTicketBackImage(payload, backImage);
    } catch {
      payload.hasBackImage = false;
      payload.backImage = "";
    }
  }

  try {
    const prevList = loadStoredTickets();
    const nextList = [
      { ...payload, backImage },
      ...prevList.filter((t) => !storedTicketsMatch(t, payload)),
    ].slice(0, MAX_TICKETS);
    await writeTicketsCache(nextList);
    return { ok: true };
  } catch {
    try {
      const withoutBack: StoredTicket = {
        ...payload,
        backImage: "",
        hasBackImage: false,
      };
      const rawList = window.sessionStorage.getItem("yeounTickets");
      const prevList = rawList ? (JSON.parse(rawList) as StoredTicket[]) : [];
      const nextList = dedupeStoredTickets([
        withoutBack,
        ...prevList.filter((t) => !storedTicketsMatch(t, withoutBack)),
      ]);
      writeSessionTicketList(nextList);
      writeSessionTicket(withoutBack);
      return { ok: true };
    } catch {
      return { ok: false, reason: "storage" };
    }
  }
}

export function formatTicketDateFromId(id?: number) {
  if (!id) return "";
  const date = new Date(id);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function ticketGridTitle(ticket: StoredTicket) {
  if (ticket.concertName?.trim()) return ticket.concertName.trim();
  const emotions = ticket.emotions
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (emotions.length > 0) return emotions.join(" · ");
  if (ticket.quote) return ticket.quote.slice(0, 12);
  return "YEOUN";
}

export function ticketGridHeadline(ticket: StoredTicket) {
  if (ticket.artist?.trim()) {
    const name = ticket.artist.trim();
    return name.length <= 10 ? name : `${name.slice(0, 10)}…`;
  }
  if (ticket.quote) {
    const line = ticket.quote.split("\n")[0]?.trim() ?? "";
    if (line.length <= 10) return line;
    return `${line.slice(0, 10)}…`;
  }
  const emotions = ticket.emotions.split(",").map((e) => e.trim()).filter(Boolean);
  return emotions[0] ?? "YOURS";
}
