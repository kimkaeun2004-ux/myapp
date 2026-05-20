import { createClient } from "@supabase/supabase-js";

const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  (projectId ? `https://${projectId}.supabase.co` : undefined);

if (!projectId || !supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_PROJECT_ID, NEXT_PUBLIC_SUPABASE_URL (optional), and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

if (!supabaseUrl.includes(projectId)) {
  throw new Error(
    "Supabase project ID does not match NEXT_PUBLIC_SUPABASE_URL."
  );
}

function getAnonKeyProjectRef(anonKey: string): string | null {
  try {
    const payload = anonKey.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64)) as { ref?: string };
    return json.ref ?? null;
  } catch {
    return null;
  }
}

const anonKeyProjectRef = getAnonKeyProjectRef(supabaseAnonKey);

if (anonKeyProjectRef && anonKeyProjectRef !== projectId) {
  throw new Error(
    "Supabase anon key does not match NEXT_PUBLIC_SUPABASE_PROJECT_ID."
  );
}

export const supabaseProjectId = projectId;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
