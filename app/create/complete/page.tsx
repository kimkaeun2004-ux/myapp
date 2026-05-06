"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gradientFromEmotionParam } from "../_shared/ticket-gradient";

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showBack, setShowBack] = useState(false);
  const [backImageDraft, setBackImageDraft] = useState("");

  const emotionsParam = searchParams.get("emotions");
  const quote = searchParams.get("quote")?.trim() ?? "";
  const backImage = searchParams.get("back") ?? backImageDraft;

  const ticketBackground = gradientFromEmotionParam(emotionsParam);
  const frontHasQuote = quote.length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = window.sessionStorage.getItem("yeounBackImageDraft") ?? "";
    setBackImageDraft(draft);
  }, []);

  const handleSave = () => {
    if (typeof window === "undefined") return;
    const payload = {
      emotions: emotionsParam ?? "",
      quote,
      backImage: backImage ?? "",
    };
    window.localStorage.setItem("yeounTicket", JSON.stringify(payload));
    router.push("/main");
  };

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
          티켓이 <span className="text-[#FDAFC7]">완성</span>되었어요!
        </h1>

        <button
          type="button"
          onClick={() => {
            if (backImage) setShowBack((prev) => !prev);
          }}
          className={`mx-auto mt-10 flex h-[430px] w-full flex-col items-center overflow-hidden rounded-[14px] border border-[#ece8e1] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] ${
            !showBack || !backImage ? "px-[6cqw]" : ""
          }`}
          style={!showBack ? { backgroundImage: ticketBackground } : undefined}
        >
          {!showBack || !backImage ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <p className="text-[2.7cqw] font-bold tracking-[0.01em]">
                2025 DOYOUNG ENCORE CONCERT
              </p>
              <p className="mt-[1.6cqh] text-[9.2cqw] font-black leading-none">YOURS</p>
              <p className="mt-[1.9cqh] text-[3.6cqw] font-semibold">25 - 10 - 09 Thu</p>
              <p className="mt-[1.3cqh] text-[3.8cqw] font-extrabold tracking-[0.02em]">
                DOYOUNG
              </p>
              {frontHasQuote ? (
                <p className="mt-[2.1cqh] w-[86%] whitespace-pre-wrap break-words text-center text-[3.6cqw] font-semibold leading-[1.35] tracking-[0.01em] text-[#131313]">
                  {quote}
                </p>
              ) : null}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backImage}
              alt="티켓 뒷면 이미지"
              className="h-full w-full rounded-[14px] object-cover"
            />
          )}
        </button>

        {backImage ? (
          <p className="mt-3 text-center text-[3cqw] font-medium text-[#131313]/50">
            티켓 클릭해서 뒷면 보기
          </p>
        ) : null}

        <div className="mx-auto mt-6 flex w-full items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-[92px] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa]"
          >
            이전
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-[92px] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe]"
          >
            저장하기
          </button>
        </div>
      </main>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteContent />
    </Suspense>
  );
}

