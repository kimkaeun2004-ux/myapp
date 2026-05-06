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
          onClick={() => router.push("/main")}
          className="ml-auto block text-[8cqw] leading-none text-[#FDAFC7] transition hover:opacity-80"
          aria-label="닫기"
        >
          ×
        </button>

        <h1 className="mt-10 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
          티켓이 인식이 <span className="text-[#FDAFC7]">완료</span>되었어요!
        </h1>

        <section className="mx-auto mt-10 flex h-[430px] w-full flex-col items-center justify-center rounded-[14px] border border-[#ece8e1] bg-white px-[6cqw] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
          <p className="text-[2.7cqw] font-bold tracking-[0.01em]">
            2025 DOYOUNG ENCORE CONCERT
          </p>
          <p className="mt-[1.6cqh] text-[9.2cqw] font-black leading-none">YOURS</p>
          <p className="mt-[1.9cqh] text-[3.6cqw] font-semibold">25 - 10 - 09 Thu</p>
          <p className="mt-[1.3cqh] text-[3.8cqw] font-extrabold tracking-[0.02em]">DOYOUNG</p>
        </section>

        <div className="mx-auto mt-8 flex w-full items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/create/confirm")}
            className="h-[92px] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa]"
          >
            수정하기
          </button>
          <button
            type="button"
            onClick={() => router.push("/create/emotion")}
            className="h-[92px] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
          >
            다음
          </button>
        </div>
      </main>
    </div>
  );
}
