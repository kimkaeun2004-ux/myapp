"use client";

import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-[#FFFFF5] px-6 py-10 text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto w-full max-w-[420px] [container-type:size]">
        <button
          type="button"
          onClick={() => router.back()}
          className="ml-auto block text-[8cqw] leading-none text-[#FDAFC7] transition hover:opacity-80"
          aria-label="닫기"
        >
          ×
        </button>

        <h1 className="mt-10 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
          티켓이 인식이 <span className="text-[#FDAFC7]">완료</span>되었어요!
        </h1>

        <section className="mx-auto mt-10 w-[84.6cqw] rounded-[2.2cqw] border border-[#ece8e1] bg-white px-[5cqw] py-[5.6cqh] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
          <p className="text-[2.7cqw] font-bold tracking-[0.01em]">
            2025 DOYOUNG ENCORE CONCERT
          </p>
          <p className="mt-[1.4cqh] text-[8.4cqw] font-black leading-none">YOURS</p>
          <p className="mt-[1.7cqh] text-[3.2cqw] font-semibold">25 - 10 - 09 Thu</p>
          <p className="mt-[1.2cqh] text-[3.3cqw] font-extrabold tracking-[0.02em]">DOYOUNG</p>
        </section>

        <div className="mx-auto mt-8 flex w-[84.6cqw] items-center justify-between">
          <button
            type="button"
            className="h-[5.2cqh] w-[28.8cqw] rounded-[1.5cqw] border border-[#e7e2db] bg-[#f7f7f6] text-[2.8cqw] font-semibold text-[#3b3b3b] shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition hover:bg-[#efefed]"
          >
            수정하기
          </button>
          <button
            type="button"
            className="h-[5.2cqh] w-[30cqw] rounded-[1.5cqw] border border-[#FDAFC7] bg-[#FDAFC7] text-[2.8cqw] font-semibold text-[#3b3b3b] shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
          >
            다음
          </button>
        </div>
      </main>
    </div>
  );
}
