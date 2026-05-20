import { createSupabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function isAlreadyRegistered(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("already") ||
    lower.includes("registered") ||
    lower.includes("exists")
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError && !isAlreadyRegistered(createError.message)) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (createError && isAlreadyRegistered(createError.message)) {
      const { data: listData, error: listError } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const existing = listData.users.find(
        (user) => user.email?.toLowerCase() === email
      );

      if (existing) {
        const { error: updateError } = await admin.auth.admin.updateUserById(
          existing.id,
          { email_confirm: true }
        );
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "서버 설정을 확인해 주세요. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.",
      },
      { status: 500 }
    );
  }
}
