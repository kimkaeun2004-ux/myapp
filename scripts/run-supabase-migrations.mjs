/**
 * Supabase 마이그레이션 실행
 * - SUPABASE_ACCESS_TOKEN: Management API (supabase login 후 ~/.supabase/access-token)
 * - 또는 SUPABASE_DB_PASSWORD / DATABASE_URL: Postgres 직접 연결
 *
 * 실행: npm run db:migrate
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, join } from "path";
import pg from "pg";

const ROOT = process.cwd();
const MIGRATIONS_DIR = resolve(ROOT, "supabase/migrations");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const envPath = resolve(ROOT, name);
    if (!existsSync(envPath)) continue;
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }

  const tokenPath = resolve(
    process.env.HOME ?? "",
    ".supabase/access-token"
  );
  if (!process.env.SUPABASE_ACCESS_TOKEN && existsSync(tokenPath)) {
    process.env.SUPABASE_ACCESS_TOKEN = readFileSync(tokenPath, "utf8").trim();
  }
}

function projectRef() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID ??
    process.env.SUPABASE_PROJECT_REF ??
    (process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([a-z0-9-]+)\.supabase\.co/
    )?.[1] ??
      null)
  );
}

function migrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => ({
      name: f,
      sql: readFileSync(join(MIGRATIONS_DIR, f), "utf8"),
    }));
}

async function runViaManagementApi(ref, sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return { ok: false, error: "SUPABASE_ACCESS_TOKEN 없음" };

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const body = await res.text();
  if (!res.ok) {
    return { ok: false, error: `${res.status} ${body}` };
  }
  return { ok: true, body };
}

function postgresConnectionString(ref) {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password =
    process.env.SUPABASE_DB_PASSWORD ?? process.env.POSTGRES_PASSWORD;
  if (!password) return null;

  const host =
    process.env.SUPABASE_DB_HOST ?? `db.${ref}.supabase.co`;
  const port = process.env.SUPABASE_DB_PORT ?? "5432";
  const user = process.env.SUPABASE_DB_USER ?? "postgres";
  const database = process.env.SUPABASE_DB_NAME ?? "postgres";

  if (host.includes("pooler")) {
    return `postgresql://${user}.${ref}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function runViaPostgres(connectionString, sql) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    return { ok: true };
  } finally {
    await client.end();
  }
}

async function main() {
  loadEnv();
  const ref = projectRef();
  if (!ref) {
    console.error("❌ 프로젝트 ref를 찾을 수 없습니다 (NEXT_PUBLIC_SUPABASE_URL 등).");
    process.exit(1);
  }

  const files = migrationFiles();
  console.log(`\n=== Supabase 마이그레이션 (${ref}) ===\n`);

  const conn = postgresConnectionString(ref);
  const usePg = Boolean(conn);
  const useApi = Boolean(process.env.SUPABASE_ACCESS_TOKEN);

  if (!usePg && !useApi) {
    console.error(
      "❌ 실행 방법이 없습니다. 아래 중 하나를 설정해 주세요.\n" +
        "  1) npx supabase login  후 npm run db:migrate\n" +
        "  2) .env.local 에 SUPABASE_DB_PASSWORD=... (Dashboard → Database → password)\n" +
        "  3) .env.local 에 DATABASE_URL=postgresql://...\n"
    );
    process.exit(1);
  }

  console.log(
    usePg
      ? "연결: Postgres 직접"
      : "연결: Supabase Management API"
  );

  for (const file of files) {
    process.stdout.write(`▶ ${file.name} ... `);
    try {
      let result;
      if (usePg) {
        result = await runViaPostgres(conn, file.sql);
      } else {
        result = await runViaManagementApi(ref, file.sql);
      }
      if (result.ok) {
        console.log("OK");
      } else {
        console.log("FAIL");
        console.error(`   ${result.error}`);
        process.exit(1);
      }
    } catch (e) {
      console.log("FAIL");
      console.error(`   ${e instanceof Error ? e.message : e}`);
      process.exit(1);
    }
  }

  console.log("\n✅ 모든 마이그레이션 적용 완료.\n");
}

main();
