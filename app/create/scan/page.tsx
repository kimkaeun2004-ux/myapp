"use client";

import { beginNewTicketCreation, saveTicketDraft } from "@/lib/ticket/draft-storage";
import { captureVideoFrame, recognizeTicketFromImage } from "@/lib/ticket/recognize";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      setErrorMessage("카메라 권한을 허용해 주세요. 또는 아래에서 사진을 선택해 주세요.");
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
      setErrorMessage("인식에 실패했습니다. 티켓을 다시 비추거나 사진을 선택해 주세요.");
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

        <h1 className="mt-12 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
          티켓을 인식해보세요.
        </h1>
        <p className="mt-3 text-center text-[3.2cqw] font-medium text-[#7a7a76]">
          날짜와 공연장은 자동으로 채워져요.
        </p>

        <section className="mt-10 rounded-[18px] bg-[#ecece8] p-5">
          <div className="relative h-[min(430px,40dvh)] w-full overflow-hidden rounded-[14px] bg-[#d9d9d5]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${isCameraReady ? "opacity-100" : "opacity-0"}`}
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-[3.6cqw] font-semibold text-[#7a7a76]">
                카메라 화면이 여기에 표시됩니다
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleScanButtonClick}
            disabled={isScanning}
            className="mx-auto mt-6 block h-[min(92px,9dvh)] w-[190px] rounded-[18px] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2)] transition hover:bg-[#f99fbe] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isScanning ? "인식중..." : isCameraReady ? "티켓 인식하기" : "카메라 켜기"}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="mx-auto mt-3 block text-[3.4cqw] font-semibold text-[#b14d70] underline-offset-2 hover:underline disabled:opacity-60"
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
            <p className="mt-4 text-center text-[3.8cqw] font-semibold text-[#b14d70]">
              {errorMessage}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
