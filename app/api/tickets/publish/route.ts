import { insertYeounTicketRow } from "@/lib/tickets/insert-yeoun-ticket";
import type { SaveYeounTicketInput } from "@/lib/tickets/supabase-tickets";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PublishBody = SaveYeounTicketInput;

function hasTicketPayload(body: PublishBody): boolean {
  return Boolean(
    body.emotion?.trim() ||
      body.quote?.trim() ||
      body.concertName?.trim() ||
      body.artist?.trim() ||
      body.venue?.trim()
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishBody;

    if (!hasTicketPayload(body)) {
      return NextResponse.json({ error: "Ticket payload is empty." }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch {
      userId = null;
    }

    const admin = createSupabaseAdmin();
    const result = await insertYeounTicketRow(admin, body, userId);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to save ticket." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
