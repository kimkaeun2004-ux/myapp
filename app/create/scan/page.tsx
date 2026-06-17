"use client";

import { beginNewTicketCreation, saveTicketDraft } from "@/lib/ticket/draft-storage";
import { captureVideoFrame, recognizeTicketFromImage } from "@/lib/ticket/recognize";
import {
  YEOUN_BTN,
  YEOUN_CONTENT_W,
  YEOUN_MUTED,
  YEOUN_NAV_CLOSE_BTN,
  YEOUN_PAGE_MAIN,
  YEOUN_SCREEN,
  YEOUN_SHELL_SECTION,
  YEOUN_TEXT,
  yeounFont,
} from "@/lib/ui/yeoun-scale";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SCAN_FRAME =
  "relative flex h-[min(360px,36dvh)] min-h-[240px] w-full flex-col overflow-hidden rounded-[14px] border border-[#e8e4dc] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]";

const SCAN_PRIMARY_BTN = `mx-auto flex ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#FDAFC7] text-[3.5cqw] font-bold text-[#131313] shadow-none transition hover:bg-[#f99fbe] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70`;

const SCAN_OUTLINE_BTN = `mx-auto flex ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-white text-[3.5cqw] font-bold text-[#3c3c3c] shadow-none transition hover:bg-[#fffcef] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60`;

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    beginNewTicketCreation();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      setErrorMessage("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraReady(true);
    } catch {
      setErrorMessage("카메라를 켜거나 갤러리에서 사진을 선택해 주세요.");
    }
  };

  const runRecognition = async (imageDataUrl: string) => {
    setIsScanning(true);
    setErrorMessage("");

    try {
      const draft = await recognizeTicketFromImage(imageDataUrl);
      saveTicketDraft(draft);
      router.push("/create/confirm");
    } catch {
      setErrorMessage("인식에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsScanning(false);
    }
  };

  const scanFromCamera = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      setErrorMessage("카메라가 준비되지 않았습니다.");
      return;
    }
    const imageDataUrl = captureVideoFrame(videoRef.current);
    await runRecognition(imageDataUrl);
  };

  const handleScanButtonClick = async () => {
    if (!isCameraReady) {
      await startCamera();
      return;
    }
    await scanFromCamera();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        void runRecognition(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className={YEOUN_SCREEN} style={yeounFont}>
      <main className={YEOUN_PAGE_MAIN}>
        <section className={`${YEOUN_SHELL_SECTION} overflow-hidden`}>
          <div className="relative shrink-0 px-[6.2cqw] pt-[5.4cqh]">
            <div className="flex justify-end pr-[3.6cqw]">
              <button
                type="button"
                onClick={() => router.push("/main")}
                className={YEOUN_NAV_CLOSE_BTN}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <h1 className={`mt-[0.8cqh] text-center ${YEOUN_TEXT.title} text-[#131313]`}>
              티켓을 인식해보세요.
            </h1>
            <p className={`mt-[1.6cqh] text-center leading-[1.55] ${YEOUN_MUTED}`}>
              실물 티켓이나 예매 내역서 캡처본을 올려주세요.
              <br />
              글자가 흐리거나 인식되지 않는 정보는
              <br />
              다음 화면에서 직접 예쁘게 수정하실 수 있습니다 🤍
            </p>
          </div>

          <div className={`mx-auto mt-[3.2cqh] ${YEOUN_CONTENT_W}`}>
            <section className={`${SCAN_FRAME} relative`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover ${isCameraReady ? "opacity-100" : "opacity-0"}`}
              />
              {!isCameraReady && (
                <div className="relative z-[1] flex h-full flex-col items-center justify-center px-[5cqw] py-[3.2cqh]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/scan-example.png"
                    alt="예매 내역서 캡처 예시"
                    className="w-full max-w-[94%] object-contain"
                  />
                  <p className="mt-[0.8cqh] text-center text-[2.4cqw] font-medium leading-snug tracking-[-0.01em] text-[#131313]/55">
                    이런 사진을 올리면 인식이 더 잘돼요!
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="mx-auto shrink-0 pb-[4.8cqh] pt-[1.4cqh]">
            <button
              type="button"
              onClick={() => void handleScanButtonClick()}
              disabled={isScanning}
              className={SCAN_PRIMARY_BTN}
            >
              {isScanning ? "인식중..." : isCameraReady ? "티켓 인식하기" : "카메라 켜기"}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className={`${SCAN_OUTLINE_BTN} mt-[1.4cqh]`}
            >
              갤러리에서 사진 선택
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {errorMessage ? (
              <p className={`mt-[1.2cqh] px-[6.2cqw] text-center ${YEOUN_TEXT.bodyMedium} text-[#b14d70]`}>
                {errorMessage}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
