import type { ReportTicketRecord } from "@/lib/emotion/compute-report";
import type { StoredTicket } from "@/lib/tickets/storage";
import { getSupabase } from "@/lib/supabase/client";

export type YeounTicketRow = {
  id: string;
  user_id: string;
  emotion: string;
  concert_name: string | null;
  artist: string | null;
  quote: string | null;
  venue: string | null;
  date_label: string | null;
  day_label: string | null;
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
};

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.user.id ?? null;
}

export async function saveTicketToSupabase(
  input: SaveYeounTicketInput
): Promise<{ ok: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false };

  const { error } = await getSupabase().from("yeoun_tickets").insert({
    user_id: userId,
    emotion: input.emotion,
    concert_name: input.concertName ?? null,
    artist: input.artist ?? null,
    quote: input.quote ?? null,
    venue: input.venue ?? null,
    date_label: input.date ?? null,
    day_label: input.day ?? null,
  });

  return { ok: !error };
}

export async function fetchUserTicketsForReport(options?: {
  monthOnly?: boolean;
}): Promise<YeounTicketRow[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const monthOnly = options?.monthOnly ?? true;
  let query = getSupabase()
    .from("yeoun_tickets")
    .select(
      "id, user_id, emotion, concert_name, artist, quote, venue, date_label, day_label, created_at"
    )
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
      emotion: row.emotion,
      concert_name: row.concert_name,
      artist: row.artist,
      created_at: row.created_at,
    }));
  }

  if (typeof window === "undefined") return [];

  const { loadStoredTickets } = await import("@/lib/tickets/storage");
  return loadStoredTickets().map(mapStoredTicketToReportRow);
}
