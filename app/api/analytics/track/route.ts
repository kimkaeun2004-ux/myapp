import { createSupabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type TrackPayload = {
  eventName?: string;
  sessionId?: string;
  userId?: string | null;
  path?: string | null;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrackPayload;
    const eventName = body.eventName?.trim();
    const sessionId = body.sessionId?.trim();

    if (!eventName || !sessionId) {
      return NextResponse.json(
        { error: "eventName, sessionId are required." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();
    const { error } = await admin.from("analytics_events").insert({
      event_name: eventName,
      session_id: sessionId,
      user_id: body.userId ?? null,
      path: body.path ?? null,
      metadata: body.metadata ?? {},
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track event." }, { status: 500 });
  }
}
