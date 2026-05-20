import { createSupabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.auth.getSession();

  if (error) {
    return NextResponse.json(
      { connected: false, error: error.message },
      { status: 503 }
    );
  }

  return NextResponse.json({
    connected: true,
    message: "Supabase service role client is connected.",
  });
}
