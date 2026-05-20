import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabasePublicConfig = {
  projectId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

const MISSING_ENV_MESSAGE =
  "Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_PROJECT_ID, NEXT_PUBLIC_SUPABASE_URL (optional), and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

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

/** 빌드 시점에는 throw 하지 않음 — Vercel 등 env 미설정 빌드 통과용 */
export function readSupabaseConfig(): SupabasePublicConfig | null {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    (projectId ? `https://${projectId}.supabase.co` : undefined);

  if (!projectId || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { projectId, supabaseUrl, supabaseAnonKey };
}

function assertSupabaseConfig(config: SupabasePublicConfig): SupabasePublicConfig {
  const { projectId, supabaseUrl, supabaseAnonKey } = config;

  if (!supabaseUrl.includes(projectId)) {
    throw new Error(
      "Supabase project ID does not match NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  const anonKeyProjectRef = getAnonKeyProjectRef(supabaseAnonKey);

  if (anonKeyProjectRef && anonKeyProjectRef !== projectId) {
    throw new Error(
      "Supabase anon key does not match NEXT_PUBLIC_SUPABASE_PROJECT_ID."
    );
  }

  return config;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const config = readSupabaseConfig();
  if (!config) {
    throw new Error(MISSING_ENV_MESSAGE);
  }

  assertSupabaseConfig(config);

  if (!cachedClient) {
    cachedClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  return cachedClient;
}

export function getSupabaseProjectId(): string | null {
  return readSupabaseConfig()?.projectId ?? null;
}

/** 기존 import 호환 — 실제 사용 시점에만 초기화 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
