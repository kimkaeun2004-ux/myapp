import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0efe8] text-[#1b1b1b]">
      <main className="mx-auto flex min-h-screen w-full items-center justify-center px-6 py-10">
        <section className="relative flex h-[860px] w-[520px] flex-col bg-[#f0efe8] shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
          <div className="mt-[340px] flex flex-col items-center">
            <h1
              className="text-[78px] leading-none tracking-[-0.04em] text-[#efacc5]"
              style={{ fontFamily: "Arial Black, Helvetica Neue, sans-serif" }}
            >
              YEOUN
            </h1>
            <p
              className="mt-[14px] text-[14px] font-medium text-[#2f2f2f]"
              style={{ fontFamily: "Apple SD Gothic Neo, Noto Sans KR, sans-serif" }}
            >
              당신의 공연은 어떤 색이었나요?
            </p>
          </div>

          <div className="mt-[42px] flex flex-col items-center gap-[12px]">
            <Link
              href="/login?provider=google"
              className="flex h-[50px] w-[320px] items-center justify-center rounded-[8px] border border-[#efb3ca] bg-[#f0efe8] text-[13px] font-semibold text-[#3c3c3c] transition hover:bg-[#f8f6f0] active:scale-[0.99]"
              style={{ fontFamily: "Apple SD Gothic Neo, Noto Sans KR, sans-serif" }}
            >
              구글 계정으로 시작
            </Link>
            <Link
              href="/login?provider=apple"
              className="flex h-[50px] w-[320px] items-center justify-center rounded-[8px] border border-[#efb3ca] bg-[#f0efe8] text-[13px] font-semibold text-[#3c3c3c] transition hover:bg-[#f8f6f0] active:scale-[0.99]"
              style={{ fontFamily: "Apple SD Gothic Neo, Noto Sans KR, sans-serif" }}
            >
              애플 계정으로 시작
            </Link>
            <Link
              href="/login?provider=email"
              className="flex h-[50px] w-[320px] items-center justify-center rounded-[8px] border border-[#efb3ca] bg-[#f0efe8] text-[13px] font-semibold text-[#3c3c3c] transition hover:bg-[#f8f6f0] active:scale-[0.99]"
              style={{ fontFamily: "Apple SD Gothic Neo, Noto Sans KR, sans-serif" }}
            >
              이메일로 시작
            </Link>
            <Link
              href="/login?provider=guest"
              className="flex h-[50px] w-[320px] items-center justify-center rounded-[8px] border border-[#efb3ca] bg-[#f0efe8] text-[13px] font-semibold text-[#3c3c3c] transition hover:bg-[#f8f6f0] active:scale-[0.99]"
              style={{ fontFamily: "Apple SD Gothic Neo, Noto Sans KR, sans-serif" }}
            >
              게스트로 시작
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
