import { toBlob } from "html-to-image";

export type SaveTicketImageResult =
  | { ok: true; method: "share" | "download" }
  | { ok: false; error: string };

async function captureElementAsPngBlob(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, {
    type: "image/png",
    cacheBust: true,
    pixelRatio: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 3),
  });

  if (!blob) {
    throw new Error("티켓 이미지를 만들지 못했습니다.");
  }

  return blob;
}

/**
 * 티켓 DOM을 PNG로 캡처해 갤러리(공유 시트) 또는 다운로드로 저장합니다.
 * iOS/Android: 공유 시트 → 「사진에 저장」
 */
export async function saveTicketToGallery(
  ticketElement: HTMLElement
): Promise<SaveTicketImageResult> {
  if (typeof window === "undefined") {
    return { ok: false, error: "브라우저에서만 저장할 수 있어요." };
  }

  try {
    const blob = await captureElementAsPngBlob(ticketElement);
    const file = new File([blob], `yeoun-ticket-${Date.now()}.png`, {
      type: "image/png",
    });

    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "YEOUN 티켓",
        });
        return { ok: true, method: "share" };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { ok: true, method: "share" };
        }
        throw err;
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return { ok: true, method: "download" };
  } catch {
    return {
      ok: false,
      error: "갤러리에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
