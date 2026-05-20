/**
 * 이메일 계정 기준 티켓·프로필 Supabase 영속화 검증
 * 실행: node scripts/verify-supabase-persistence.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local 없음");
    process.exit(1);
  }
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TICKET_SELECT =
  "id, user_id, emotions, concert_name, artist, quote, venue, date_label, day_label, back_image, created_at";
const TICKET_SELECT_MIN =
  "id, user_id, emotions, quote, back_image, created_at";

const testEmail = `yeoun-verify-${Date.now()}@test.local`;
const testPassword = "verify-test-12";

const results = [];
let hasProfilesTable = false;

function pass(msg) {
  results.push({ ok: true, msg });
  console.log(`✅ ${msg}`);
}
function fail(msg, detail) {
  results.push({ ok: false, msg, detail });
  console.log(`❌ ${msg}`);
  if (detail) console.log(`   ${detail}`);
}

async function main() {
  console.log("\n=== YEOUN Supabase 영속화 검증 ===\n");

  // 1) 테이블·컬럼 존재
  let ticketSelect = TICKET_SELECT;
  let { error: ticketsProbeErr } = await admin.from("yeoun_tickets").select(ticketSelect).limit(1);

  if (ticketsProbeErr && ticketsProbeErr.message.includes("does not exist")) {
    ticketSelect = TICKET_SELECT_MIN;
    ({ error: ticketsProbeErr } = await admin.from("yeoun_tickets").select(ticketSelect).limit(1));
    if (!ticketsProbeErr) {
      pass("yeoun_tickets (기본 컬럼 — 공연 메타 컬럼 없음)");
      console.log("   → supabase/migrations/003_align_yeoun_schema.sql 실행 권장");
    }
  } else if (!ticketsProbeErr) {
    pass("yeoun_tickets 전체 컬럼");
  }

  if (ticketsProbeErr) {
    fail("yeoun_tickets 테이블/스키마", ticketsProbeErr.message);
  }

  const { error: profilesProbeErr } = await admin
    .from("yeoun_profiles")
    .select("user_id, display_name, avatar_url, updated_at")
    .limit(1);

  hasProfilesTable = !profilesProbeErr;
  if (hasProfilesTable) {
    pass("yeoun_profiles 테이블");
  } else {
    console.log("⚠️  yeoun_profiles 없음 — Auth user_metadata로 프로필 저장");
    console.log("   → supabase/migrations/003_align_yeoun_schema.sql 실행 권장");
  }

  if (ticketsProbeErr) {
    printSummary();
    process.exit(1);
  }

  // 2) 테스트 유저 생성 + 로그인
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (createErr) {
    fail("테스트 계정 생성", createErr.message);
    printSummary();
    process.exit(1);
  }

  const userId = created.user.id;
  pass(`테스트 계정 생성 (${testEmail})`);

  const anon = createClient(url, anonKey);
  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInErr || !signIn.session) {
    fail("테스트 계정 로그인", signInErr?.message ?? "no session");
    await cleanup(userId);
    printSummary();
    process.exit(1);
  }
  pass("이메일 로그인 세션 발급");

  const userClient = createClient(url, anonKey);
  await userClient.auth.setSession({
    access_token: signIn.session.access_token,
    refresh_token: signIn.session.refresh_token,
  });

  // 3) 프로필 저장·조회
  const profilePayload = {
    user_id: userId,
    display_name: "검증닉네임",
    avatar_url: "data:image/png;base64,iVBORw0KGgo=",
    updated_at: new Date().toISOString(),
  };

  if (hasProfilesTable) {
    const { error: profileUpsertErr } = await userClient
      .from("yeoun_profiles")
      .upsert(profilePayload, { onConflict: "user_id" });

    if (profileUpsertErr) {
      fail("프로필 저장 (테이블)", profileUpsertErr.message);
    } else {
      pass("프로필 저장 (yeoun_profiles)");
    }
  } else {
    const { error: metaErr } = await userClient.auth.updateUser({
      data: {
        yeoun_display_name: "검증닉네임",
        yeoun_avatar_url: "data:image/png;base64,iVBORw0KGgo=",
      },
    });
    if (metaErr) fail("프로필 저장 (user_metadata)", metaErr.message);
    else pass("프로필 저장 (Auth user_metadata)");
  }

  let profileOk = false;
  if (hasProfilesTable) {
    const { data: profileRow, error: profileFetchErr } = await userClient
      .from("yeoun_profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();
    profileOk =
      !profileFetchErr &&
      profileRow?.display_name === "검증닉네임" &&
      profileRow?.avatar_url?.startsWith("data:image");
  } else {
    const { data: userData } = await userClient.auth.getUser();
    const meta = userData.user?.user_metadata ?? {};
    profileOk =
      meta.yeoun_display_name === "검증닉네임" &&
      String(meta.yeoun_avatar_url ?? "").startsWith("data:image");
  }

  if (profileOk) pass("프로필 조회 (수정 내용 유지)");
  else fail("프로필 조회");

  // 4) 티켓 저장·조회
  const ticketFull = {
    user_id: userId,
    emotions: "몽환,전율",
    concert_name: "검증 공연",
    artist: "검증 아티스트",
    quote: "검증 가사",
    venue: "검증 홀",
    date_label: "2026.05.21",
    day_label: "수",
    back_image: "data:image/jpeg;base64,/9j/4AAQ",
  };
  const ticketMinimal = {
    user_id: userId,
    emotions: "몽환,전율",
    quote: "검증 가사",
    back_image: "data:image/jpeg;base64,/9j/4AAQ",
  };

  const missingCol = (msg) =>
    msg &&
    (msg.includes("does not exist") ||
      msg.includes("Could not find") ||
      msg.includes("schema cache"));

  let { error: ticketInsertErr } = await userClient.from("yeoun_tickets").insert(ticketFull);
  if (missingCol(ticketInsertErr?.message)) {
    ({ error: ticketInsertErr } = await userClient.from("yeoun_tickets").insert(ticketMinimal));
  }

  if (ticketInsertErr) {
    fail("티켓 저장 (RLS insert)", ticketInsertErr.message);
  } else {
    pass("티켓 저장 (메타 + 뒷면 이미지)");
  }

  let { data: ticketRows, error: ticketFetchErr } = await userClient
    .from("yeoun_tickets")
    .select(ticketSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const row = ticketRows?.[0];
  if (
    ticketFetchErr ||
    !row ||
    row.emotions !== "몽환,전율" ||
    row.quote !== "검증 가사" ||
    !row.back_image?.startsWith("data:image")
  ) {
    fail("티켓 조회", ticketFetchErr?.message ?? JSON.stringify(row));
  } else {
    pass("티켓 조회 (발행 내용·뒷면 유지)");
  }

  // 5) 재로그인 시뮬레이션 (새 클라이언트)
  const anon2 = createClient(url, anonKey);
  const { data: signIn2, error: signIn2Err } = await anon2.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signIn2Err || !signIn2.session) {
    fail("재로그인", signIn2Err?.message ?? "no session");
  } else {
    const client2 = createClient(url, anonKey);
    await client2.auth.setSession({
      access_token: signIn2.session.access_token,
      refresh_token: signIn2.session.refresh_token,
    });
    const { data: tickets2 } = await client2
      .from("yeoun_tickets")
      .select(ticketSelect)
      .eq("user_id", userId);
    let profileName2 = null;
    if (hasProfilesTable) {
      const { data: profile2 } = await client2
        .from("yeoun_profiles")
        .select("display_name")
        .eq("user_id", userId)
        .maybeSingle();
      profileName2 = profile2?.display_name;
    } else {
      const { data: u2 } = await client2.auth.getUser();
      profileName2 = u2.user?.user_metadata?.yeoun_display_name;
    }

    if ((tickets2?.length ?? 0) >= 1 && profileName2 === "검증닉네임") {
      pass("재로그인 후 티켓·프로필 그대로 조회");
    } else {
      fail(
        "재로그인 후 데이터",
        `tickets=${tickets2?.length ?? 0}, profile=${profileName2}`
      );
    }
  }

  await cleanup(userId);
  printSummary();
  process.exit(results.some((r) => !r.ok) ? 1 : 0);
}

async function cleanup(userId) {
  await admin.from("yeoun_tickets").delete().eq("user_id", userId);
  if (hasProfilesTable) {
    await admin.from("yeoun_profiles").delete().eq("user_id", userId);
  }
  await admin.auth.admin.deleteUser(userId);
  console.log("\n🧹 테스트 데이터 삭제됨");
}

function printSummary() {
  const failed = results.filter((r) => !r.ok);
  console.log("\n--- 요약 ---");
  if (failed.length === 0) {
    console.log("모든 검증 통과. 이메일 로그인 시 티켓·프로필이 Supabase에 유지됩니다.");
  } else {
    console.log(`${failed.length}개 실패:`);
    for (const f of failed) console.log(`  - ${f.msg}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
