import { supabase, supabaseProjectId } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await supabase.auth.getSession();

  if (error) {
    return NextResponse.json(
      {
        connected: false,
        projectId: supabaseProjectId,
        error: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    connected: true,
    projectId: supabaseProjectId,
    message: "Supabase client is connected.",
  });
}
