import { buildDraftFromOcr } from "@/lib/ticket/parse-ocr";
import type { TicketRegistrationDraft } from "@/lib/ticket/types";

export function captureVideoFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("이미지를 캡처하지 못했습니다.");
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export async function recognizeTicketFromImage(
  imageDataUrl: string
): Promise<TicketRegistrationDraft> {
  const { createWorker, PSM } = await import("tesseract.js");
  const worker = await createWorker("kor+eng", 1, {
    logger: () => {},
  });

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });
    const result = await worker.recognize(imageDataUrl);
    const extracted = buildDraftFromOcr(result.data);

    return {
      concertName: extracted.concertName,
      artist: "",
      date: extracted.date,
      day: extracted.day,
      venue: extracted.venue,
      rawOcrText: extracted.rawOcrText,
      imageDataUrl,
    };
  } finally {
    await worker.terminate();
  }
}
