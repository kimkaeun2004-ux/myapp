"use client";

import { CreateFlowShell } from "../_shared/CreateFlowShell";
import { FlowCtaButton, FlowOutlineButton } from "../_shared/FlowButtons";
import { beginNewTicketCreation, saveTicketDraft } from "@/lib/ticket/draft-storage";
import { captureVideoFrame, recognizeTicketFromImage } from "@/lib/ticket/recognize";
import { YEOUN_MUTED, YEOUN_TEXT, YEOUN_TICKET_CARD, YEOUN_TICKET_SLOT } from "@/lib/ui/yeoun-scale";
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
    <CreateFlowShell
      title="티켓을 인식해보세요."
      subtitle="티켓이 없다면 예매내역을 업로드 해보세요."
      footer={
        <>
          <FlowCtaButton
            type="button"
            onClick={handleScanButtonClick}
            disabled={isScanning}
            className="disabled:opacity-70"
          >
            {isScanning ? "인식중..." : isCameraReady ? "티켓 인식하기" : "카메라 켜기"}
          </FlowCtaButton>
          <FlowOutlineButton
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="disabled:opacity-60"
          >
            갤러리에서 사진 선택
          </FlowOutlineButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {errorMessage ? (
            <p className={`px-[6.2cqw] text-center ${YEOUN_TEXT.bodyMedium} text-[#b14d70]`}>
              {errorMessage}
            </p>
          ) : null}
        </>
      }
    >
      <div className={YEOUN_TICKET_SLOT}>
        <section className={`${YEOUN_TICKET_CARD} relative bg-[#ece9df] p-0`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${isCameraReady ? "opacity-100" : "opacity-0"}`}
          />
          {!isCameraReady && (
            <div className={`absolute inset-0 flex items-center justify-center px-[6cqw] ${YEOUN_MUTED}`}>
              카메라 화면
            </div>
          )}
        </section>
      </div>
    </CreateFlowShell>
  );
}
