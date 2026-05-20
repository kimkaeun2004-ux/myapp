import { NextResponse } from "next/server";
import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { readSupabaseConfig } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function migrationSqlFiles() {
  const dir = join(process.cwd(), "supabase/migrations");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"));
}

function connectionString(projectId: string) {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password =
    process.env.SUPABASE_DB_PASSWORD ?? process.env.POSTGRES_PASSWORD;
  if (!password) return null;

  const host = process.env.SUPABASE_DB_HOST ?? `db.${projectId}.supabase.co`;
  const port = process.env.SUPABASE_DB_PORT ?? "5432";
  const user = process.env.SUPABASE_DB_USER ?? "postgres";
  const database = process.env.SUPABASE_DB_NAME ?? "postgres";

  if (host.includes("pooler")) {
    return `postgresql://${user}.${projectId}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export async function POST(request: Request) {
  const config = readSupabaseConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, error: "Supabase env가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const secret = process.env.SUPABASE_MIGRATE_SECRET;
  if (secret) {
    const header = request.headers.get("x-migrate-secret");
    if (header !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const conn = connectionString(config.projectId);
  if (!conn) {
    return NextResponse.json(
      {
        ok: false,
        error:
          ".env.local에 SUPABASE_DB_PASSWORD 또는 DATABASE_URL을 추가한 뒤 다시 시도해 주세요.",
      },
      { status: 400 }
    );
  }

  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    const applied: string[] = [];
    for (const sql of migrationSqlFiles()) {
      await client.query(sql);
      applied.push(sql.slice(0, 40).replace(/\s+/g, " "));
    }
    return NextResponse.json({ ok: true, applied: applied.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Migration failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await client.end();
  }
}
