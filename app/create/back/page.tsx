"use client";

import { compressDataUrl } from "@/lib/image/compress-data-url";
import { ChangeEvent, Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BackContent />
    </Suspense>
  );
}

function BackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [backDataUrl, setBackDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const buildCompleteHref = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("back");
    const qs = params.toString();
    return qs.length > 0 ? `/create/complete?${qs}` : "/create/complete";
  };

  const persistBackImage = (dataUrl: string | null) => {
    if (typeof window === "undefined") return;
    if (dataUrl) {
      window.sessionStorage.setItem("yeounBackImageDraft", dataUrl);
    } else {
      window.sessionStorage.removeItem("yeounBackImageDraft");
    }
  };

  const goToComplete = async (opts: { skipBack?: boolean }) => {
    setErrorMessage("");
    setIsProcessing(true);

    try {
      if (!opts.skipBack && backDataUrl) {
        const compressed = await compressDataUrl(backDataUrl, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.7,
        });
        persistBackImage(compressed);
      } else {
        persistBackImage(null);
      }
      router.push(buildCompleteHref());
    } catch {
      setErrorMessage("뒷면 사진을 저장하지 못했습니다. 다른 사진을 선택해 주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickImage = () => {
    inputRef.current?.click();
  };

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      void (async () => {
        const result = typeof reader.result === "string" ? reader.result : null;
        if (!result) return;
        const compressed = await compressDataUrl(result, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.7,
        });
        setBackDataUrl(compressed);
      })();
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#FFFFF5] px-6 py-10 pb-12 text-[#131313]"
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
          티켓 뒷면에 담을 사진을 골라주세요.
        </h1>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChangeImage}
        />

        <button
          type="button"
          onClick={handlePickImage}
          className="mx-auto mt-10 flex h-[min(430px,40dvh)] w-full items-center justify-center overflow-hidden rounded-[14px] border border-[#ece8e1] bg-white text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="업로드한 뒷면 사진 미리보기"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="px-6">
              <p className="text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222]">
                사진 업로드
              </p>
              <p className="mt-2 text-[3.4cqw] font-medium text-[#222]/70">
                클릭해서 갤러리에서 사진을 선택하세요.
              </p>
            </div>
          )}
        </button>

        <div className="mx-auto mt-8 flex w-full items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isProcessing}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa] disabled:opacity-60"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => void goToComplete({ skipBack: true })}
            disabled={isProcessing}
            className="h-[min(92px,9dvh)] w-1/2 rounded-[18px] border border-[#FDAFC7] bg-white text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#fff7fa] disabled:opacity-60"
          >
            스킵하기
          </button>
        </div>

        <button
          type="button"
          onClick={() => void goToComplete({})}
          disabled={isProcessing || !backDataUrl}
          className="mx-auto mt-4 h-[min(92px,9dvh)] w-full rounded-[18px] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:bg-[#f99fbe] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? "처리 중..." : "완성하기"}
        </button>

        {errorMessage ? (
          <p className="mt-4 text-center text-[3.4cqw] font-semibold text-[#b14d70]">
            {errorMessage}
          </p>
        ) : null}
      </main>
    </div>
  );
}
