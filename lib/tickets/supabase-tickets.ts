import type { ReportTicketRecord } from "@/lib/emotion/compute-report";
import type { StoredTicket } from "@/lib/tickets/storage";
import { getSupabase } from "@/lib/supabase/client";

export type YeounTicketRow = {
  id: string;
  user_id: string;
  /** DB 컬럼명은 emotions (복수) */
  emotions: string;
  concert_name: string | null;
  artist: string | null;
  quote: string | null;
  venue: string | null;
  date_label: string | null;
  day_label: string | null;
  back_image: string | null;
  created_at: string;
};

export type SaveYeounTicketInput = {
  emotion: string;
  concertName?: string;
  artist?: string;
  quote?: string;
  venue?: string;
  date?: string;
  day?: string;
  backImage?: string;
};

const TICKET_SELECT =
  "id, user_id, emotions, concert_name, artist, quote, venue, date_label, day_label, back_image, created_at";

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.user.id ?? null;
}

export async function saveTicketToSupabase(
  input: SaveYeounTicketInput
): Promise<{ ok: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false };

  const fullRow = {
    user_id: userId,
    emotions: input.emotion,
    concert_name: input.concertName ?? null,
    artist: input.artist ?? null,
    quote: input.quote ?? null,
    venue: input.venue ?? null,
    date_label: input.date ?? null,
    day_label: input.day ?? null,
    back_image: input.backImage ?? null,
  };

  let { error } = await getSupabase().from("yeoun_tickets").insert(fullRow);

  if (error && isMissingColumnError(error.message)) {
    const minimal = {
      user_id: userId,
      emotions: input.emotion,
      quote: input.quote ?? null,
      back_image: input.backImage ?? null,
    };
    ({ error } = await getSupabase().from("yeoun_tickets").insert(minimal));
  }

  if (error && process.env.NODE_ENV === "development") {
    console.warn("[yeoun] saveTicketToSupabase:", error.message);
  }

  return { ok: !error };
}

export async function deleteTicketFromSupabase(
  supabaseId: string
): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId || !supabaseId) return false;

  const { error } = await getSupabase()
    .from("yeoun_tickets")
    .delete()
    .eq("id", supabaseId)
    .eq("user_id", userId);

  if (error && process.env.NODE_ENV === "development") {
    console.warn("[yeoun] deleteTicketFromSupabase:", error.message);
  }

  return !error;
}

function isMissingColumnError(message: string) {
  const lower = message.toLowerCase();
  return (
    (lower.includes("does not exist") && lower.includes("column")) ||
    lower.includes("could not find") ||
    lower.includes("schema cache")
  );
}

export function mapYeounTicketRowToStoredTicket(row: YeounTicketRow): StoredTicket {
  const createdMs = new Date(row.created_at).getTime();
  return {
    supabaseId: row.id,
    id: Number.isNaN(createdMs) ? undefined : createdMs,
    emotions: row.emotions ?? "",
    quote: row.quote ?? "",
    backImage: row.back_image ?? "",
    concertName: row.concert_name ?? undefined,
    artist: row.artist ?? undefined,
    date: row.date_label ?? undefined,
    day: row.day_label ?? undefined,
    venue: row.venue ?? undefined,
  };
}

export async function fetchUserStoredTickets(): Promise<StoredTicket[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await getSupabase()
    .from("yeoun_tickets")
    .select(TICKET_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingColumnError(error.message)) {
      return fetchUserStoredTicketsMinimal();
    }
    if (process.env.NODE_ENV === "development") {
      console.warn("[yeoun] fetchUserStoredTickets:", error.message);
    }
    return [];
  }

  if (!data?.length) return [];

  return (data as YeounTicketRow[]).map(mapYeounTicketRowToStoredTicket);
}

async function fetchUserStoredTicketsMinimal(): Promise<StoredTicket[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await getSupabase()
    .from("yeoun_tickets")
    .select("id, user_id, emotions, quote, back_image, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  return (data as YeounTicketRow[]).map(mapYeounTicketRowToStoredTicket);
}

/** 로그인 직후: 서버에 없고 로컬에만 있는 티켓을 한 번 업로드 */
export async function syncLocalTicketsToSupabase(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId || typeof window === "undefined") return;

  const remote = await fetchUserStoredTickets();
  if (remote.length > 0) return;

  const { loadStoredTickets } = await import("@/lib/tickets/storage");
  const local = loadStoredTickets();
  if (local.length === 0) return;

  for (const ticket of local) {
    await saveTicketToSupabase({
      emotion: ticket.emotions,
      concertName: ticket.concertName,
      artist: ticket.artist,
      quote: ticket.quote,
      venue: ticket.venue,
      date: ticket.date,
      day: ticket.day,
      backImage: ticket.backImage || undefined,
    });
  }
}

export async function fetchUserTicketsForReport(options?: {
  monthOnly?: boolean;
}): Promise<YeounTicketRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const monthOnly = options?.monthOnly ?? true;
  let query = getSupabase()
    .from("yeoun_tickets")
    .select(TICKET_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (monthOnly) {
    query = query.gte("created_at", startOfMonthIso());
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    if (monthOnly) {
      return fetchUserTicketsForReport({ monthOnly: false });
    }
    return [];
  }

  return data as YeounTicketRow[];
}

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function mapStoredTicketToReportRow(ticket: StoredTicket) {
  return {
    id: ticket.id,
    emotion: ticket.emotions,
    concert_name: ticket.concertName ?? null,
    artist: ticket.artist ?? null,
    created_at: ticket.id ?? null,
  };
}

export async function fetchReportTickets(): Promise<ReportTicketRecord[]> {
  const remote = await fetchUserTicketsForReport({ monthOnly: true });

  if (remote.length > 0) {
    return remote.map((row): ReportTicketRecord => ({
      id: row.id,
      emotion: row.emotions,
      concert_name: row.concert_name,
      artist: row.artist,
      created_at: row.created_at,
    }));
  }

  if (typeof window === "undefined") return [];

  const { loadStoredTickets } = await import("@/lib/tickets/storage");
  return loadStoredTickets().map(mapStoredTicketToReportRow);
}
