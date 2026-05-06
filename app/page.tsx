"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen overflow-y-auto bg-[#FFFFF5] text-[#1b1b1b]">
      <main className="mx-auto flex w-full items-start justify-center px-6 py-8">
        <section className="relative flex w-[min(38vw,60dvh)] aspect-[520/860] flex-col items-center bg-[#FFFFF5] [container-type:size]">
          <div className="mt-[39.5cqh] flex flex-col items-center">
            <h1
              className="text-[15cqw] leading-none tracking-[-0.04em] text-[#FDAFC7]"
              style={{ fontFamily: "Sekuya, Inter, sans-serif" }}
            >
              YEOUN
            </h1>
            <p
              className="mt-[2.7cqw] text-[2.7cqw] font-bold text-[#2f2f2f]"
            >
              당신의 공연은 어떤 색이었나요?
            </p>
          </div>

          <div className="mt-[8.1cqw] flex flex-col items-center gap-[2.3cqw]">
            <Link
              href="/login?provider=google"
              className="flex h-[9.6cqw] w-[61.5cqw] items-center justify-center rounded-[1.54cqw] border border-[#FDAFC7] bg-[#ffffff] text-[2.5cqw] font-semibold text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]"
            >
              구글 계정으로 시작
            </Link>
            <Link
              href="/login?provider=apple"
              className="flex h-[9.6cqw] w-[61.5cqw] items-center justify-center rounded-[1.54cqw] border border-[#FDAFC7] bg-[#ffffff] text-[2.5cqw] font-semibold text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]"
            >
              애플 계정으로 시작
            </Link>
            <Link
              href="/login?provider=email"
              className="flex h-[9.6cqw] w-[61.5cqw] items-center justify-center rounded-[1.54cqw] border border-[#FDAFC7] bg-[#ffffff] text-[2.5cqw] font-semibold text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]"
            >
              이메일로 시작
            </Link>
            <button
              type="button"
              onClick={() => router.push("/main?userName=게스트")}
              className="flex h-[9.6cqw] w-[61.5cqw] items-center justify-center rounded-[1.54cqw] border border-[#FDAFC7] bg-[#ffffff] text-[2.5cqw] font-semibold text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]"
            >
              게스트로 시작
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
