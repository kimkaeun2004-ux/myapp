"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Tesseract from "tesseract.js";

type ExtractedTicketInfo = {
  concertName: string;
  date: string;
  artist: string;
};

function normalizeDate(raw: string) {
  const cleaned = raw.replace(/[년./]/g, "-").replace(/[월]/g, "-").replace(/[일]/g, "");
  const dateMatch = cleaned.match(/(20\d{2})-(\d{1,2})-(\d{1,2})/);
  if (!dateMatch) return "";

  const year = dateMatch[1];
  const month = dateMatch[2].padStart(2, "0");
  const day = dateMatch[3].padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function extractTicketInfo(text: string): ExtractedTicketInfo {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const dateLine =
    lines.find((line) => /(20\d{2})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/.test(line)) ?? "";
  const date = normalizeDate(dateLine);

  const concertName =
    lines.find((line) =>
      /(CONCERT|TOUR|ENCORE|FESTIVAL|SHOW|LIVE)/i.test(line),
    ) ??
    lines.find((line) => /^[A-Z0-9\s\-:]{6,}$/.test(line)) ??
    "미분류 티켓";

  const artist =
    lines.find((line) => /^[가-힣]{2,12}$/.test(line)) ??
    lines.find((line) => /^[A-Za-z\s]{2,20}$/.test(line)) ??
    "미상";

  return {
    concertName,
    date: date || "미상",
    artist,
  };
}

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedInfo, setExtractedInfo] = useState<ExtractedTicketInfo | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
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
      setErrorMessage("카메라 권한을 허용해 주세요.");
    }
  };

  const scanTicket = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setErrorMessage("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("캔버스 컨텍스트를 가져올 수 없습니다.");

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const result = await Tesseract.recognize(imageDataUrl, "kor+eng");
      const info = extractTicketInfo(result.data.text);
      setExtractedInfo(info);

      const params = new URLSearchParams({
        concertName: info.concertName,
        date: info.date,
        artist: info.artist,
      });
      router.push(`/create/question?${params.toString()}`);
    } catch {
      setErrorMessage("인식에 실패했습니다. 티켓을 다시 비춰주세요.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanButtonClick = async () => {
    if (!isCameraReady) {
      await startCamera();
      return;
    }
    await scanTicket();
  };

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

        <h1 className="mt-12 text-center text-[5cqw] font-extrabold tracking-[-0.03em]">
          티켓을 인식해보세요.
        </h1>

        <section className="mt-10 rounded-[18px] bg-[#ecece8] p-5">
          <div className="relative h-[430px] w-full overflow-hidden rounded-[14px] bg-[#d9d9d5]">
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
            className="mx-auto mt-6 block h-[92px] w-[190px] rounded-[18px] bg-[#FDAFC7] text-[4.4cqw] font-semibold tracking-[-0.02em] text-[#222] shadow-[0_10px_16px_rgba(0,0,0,0.2)] transition hover:bg-[#f99fbe] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isScanning ? "인식중..." : "티켓 인식하기"}
          </button>

          {errorMessage ? (
            <p className="mt-4 text-center text-[3.8cqw] font-semibold text-[#b14d70]">{errorMessage}</p>
          ) : null}

          {extractedInfo ? (
            <p className="mt-3 text-center text-[3.4cqw] text-[#3f3f3f]">
              {extractedInfo.concertName} / {extractedInfo.date} / {extractedInfo.artist}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
