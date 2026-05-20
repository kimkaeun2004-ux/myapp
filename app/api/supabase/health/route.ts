import { getSupabase, getSupabaseProjectId, readSupabaseConfig } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = readSupabaseConfig();
  if (!config) {
    return NextResponse.json(
      {
        connected: false,
        projectId: null,
        error:
          "Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_* variables in Vercel project settings.",
      },
      { status: 503 }
    );
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          projectId: getSupabaseProjectId(),
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      connected: true,
      projectId: getSupabaseProjectId(),
      message: "Supabase client is connected.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        connected: false,
        projectId: getSupabaseProjectId(),
        error: message,
      },
      { status: 503 }
    );
  }
}
