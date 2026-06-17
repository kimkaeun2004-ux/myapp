import type { SupabaseClient } from "@supabase/supabase-js";
import type { SaveYeounTicketInput } from "@/lib/tickets/supabase-tickets";

function isMissingColumnError(message: string) {
  const lower = message.toLowerCase();
  return (
    (lower.includes("does not exist") && lower.includes("column")) ||
    lower.includes("could not find") ||
    lower.includes("schema cache")
  );
}

/** service role / admin 클라이언트로 yeoun_tickets insert (게스트는 user_id null) */
export async function insertYeounTicketRow(
  client: SupabaseClient,
  input: SaveYeounTicketInput,
  userId: string | null
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const fullRow = {
    user_id: userId,
    emotions: input.emotion.trim(),
    concert_name: input.concertName?.trim() || null,
    artist: input.artist?.trim() || null,
    quote: input.quote?.trim() || null,
    venue: input.venue?.trim() || null,
    date_label: input.date?.trim() || null,
    day_label: input.day?.trim() || null,
    back_image: input.backImage ?? null,
  };

  let { data, error } = await client
    .from("yeoun_tickets")
    .insert(fullRow)
    .select("id")
    .single();

  if (error && isMissingColumnError(error.message)) {
    const minimal = {
      user_id: userId,
      emotions: input.emotion,
      quote: input.quote ?? null,
      back_image: input.backImage ?? null,
    };
    ({ data, error } = await client
      .from("yeoun_tickets")
      .insert(minimal)
      .select("id")
      .single());
  }

  const id =
    data && typeof data === "object" && "id" in data ? String(data.id) : undefined;

  return { ok: !error, id, error: error?.message };
}
