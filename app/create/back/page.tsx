"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import {
  FlowButtonRow,
  FlowCtaButton,
  FlowSecondaryHalf,
} from "../_shared/FlowButtons";
import { compressDataUrl } from "@/lib/image/compress-data-url";
import { YEOUN_MUTED, YEOUN_TEXT, YEOUN_TICKET_CARD, YEOUN_TICKET_SLOT } from "@/lib/ui/yeoun-scale";
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
      setErrorMessage("사진을 저장하지 못했습니다.");
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
    <CreateFlowShell
      title="티켓 뒷면 사진을 골라주세요."
      subtitle="탭해서 갤러리에서 선택하세요."
      footer={
        <>
          <FlowButtonRow>
            <FlowSecondaryHalf
              type="button"
              onClick={() => router.back()}
              disabled={isProcessing}
              className="disabled:opacity-60"
            >
              이전
            </FlowSecondaryHalf>
            <FlowSecondaryHalf
              type="button"
              onClick={() => void goToComplete({ skipBack: true })}
              disabled={isProcessing}
              className="disabled:opacity-60"
            >
              스킵하기
            </FlowSecondaryHalf>
          </FlowButtonRow>
          <FlowCtaButton
            type="button"
            onClick={() => void goToComplete({})}
            disabled={isProcessing || !backDataUrl}
            className="disabled:opacity-60"
          >
            {isProcessing ? "처리 중..." : "완성하기"}
          </FlowCtaButton>
          {errorMessage ? (
            <p className={`text-center ${YEOUN_TEXT.bodyMedium} text-[#b14d70]`}>{errorMessage}</p>
          ) : null}
        </>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChangeImage}
      />

      <div className={YEOUN_TICKET_SLOT}>
        <button
          type="button"
          onClick={handlePickImage}
          className={`${YEOUN_TICKET_CARD} bg-[#ffffff] p-0`}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="티켓 뒷면 사진"
              className="h-full w-full rounded-[14px] object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-[1.2cqh] px-[6cqw]">
              <p className={YEOUN_TEXT.title}>사진 업로드</p>
              <p className={YEOUN_MUTED}>갤러리에서 사진 선택</p>
            </div>
          )}
        </button>
      </div>
    </CreateFlowShell>
  );
}
