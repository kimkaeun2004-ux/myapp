/**
 * 잘못 복사된 프로필 데이터 정리 (1회성)
 * 실행: node scripts/fix-profile-data.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();

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
}

function nameFromEmail(email) {
  return email.split("@")[0]?.trim() || "회원";
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FIX = [
  {
    email: "rkdms0323@naver.com",
    action: "mark_customized",
    displayName: "가영이",
  },
  {
    email: "kimkaeun2004@gmail.com",
    action: "reset_default",
  },
];

async function main() {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;

  for (const item of FIX) {
    const user = list.users.find(
      (u) => u.email?.toLowerCase() === item.email.toLowerCase()
    );
    if (!user) {
      console.log(`⚠️  ${item.email} — 사용자 없음`);
      continue;
    }

    if (item.action === "reset_default") {
      const { error } = await admin
        .from("yeoun_profiles")
        .delete()
        .eq("user_id", user.id);
      if (error) {
        console.log(`❌ ${item.email} 삭제 실패:`, error.message);
      } else {
        console.log(
          `✅ ${item.email} — 잘못된 프로필 행 삭제 (앱에서 기본값: ${nameFromEmail(item.email)})`
        );
      }
      continue;
    }

    if (item.action === "mark_customized") {
      const { data: row } = await admin
        .from("yeoun_profiles")
        .select("display_name, avatar_url, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!row) {
        console.log(`⚠️  ${item.email} — yeoun_profiles 행 없음`);
        continue;
      }

      const payload = {
        user_id: user.id,
        display_name: item.displayName || row.display_name,
        avatar_url: row.avatar_url ?? "",
        owner_email: item.email.toLowerCase(),
        customized_at: row.updated_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await admin
        .from("yeoun_profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.log(`❌ ${item.email} 표시 실패:`, error.message);
        console.log("   → migration 006_profile_customized.sql 먼저 적용해 주세요.");
      } else {
        console.log(`✅ ${item.email} — 가영이 프로필 유지 (customized_at 설정)`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
