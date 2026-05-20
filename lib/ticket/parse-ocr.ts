import type { TicketRegistrationDraft } from "@/lib/ticket/types";

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const VENUE_PATTERN =
  /(?:홀|Hall|HALL|아레나|Arena|ARENA|센터|Center|CENTRE|공연장|극장|Theater|THEATRE|스타디움|Stadium|STADIUM|라이브|LIVE|DOME|돔|체육관|문화센터|아트센터|콘서트홀|팬텀|PHANTOM|인스파이어|올림픽|월드컵|예술의전당|세종문화)/i;

const CONCERT_NAME_NOISE =
  /^(?:관람\s*일|공연\s*장소|공연장|좌석|입장|seat|gate|예매|주문|order|ticket|barcode|qr|티켓|예매번호|주문번호|고객|tel|전화|www\.|http)/i;

const DATE_IN_LINE =
  /(?:20\d{2}|\d{2}[.\-/]\d{2})[.\-/년월]?\s*\d{1,2}|관람\s*일/i;

export type OcrLine = {
  text: string;
  top: number;
  height: number;
  width: number;
  confidence: number;
};

export type OcrPageLike = {
  text: string;
  blocks?: Array<{
    paragraphs?: Array<{
      lines?: Array<{
        text: string;
        confidence?: number;
        bbox: { x0: number; y0: number; x1: number; y1: number };
      }>;
    }>;
  }> | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDisplayDate(y: number, m: number, d: number) {
  const yy = y >= 100 ? String(y).slice(-2) : pad2(y);
  return `${yy}-${pad2(m)}-${pad2(d)}`;
}

function weekdayFromDate(y: number, m: number, d: number): string {
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAYS_EN[date.getDay()] ?? "";
}

function parseWeekdayToken(token: string): string {
  const t = token.trim();
  const en = WEEKDAYS_EN.find((w) => t.toLowerCase().startsWith(w.toLowerCase()));
  if (en) return en;
  const koIdx = WEEKDAYS_KO.findIndex((w) => t.includes(w));
  if (koIdx >= 0) return WEEKDAYS_EN[koIdx];
  return "";
}

function normalizeOcrText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Tesseract Page → 줄 단위 (위치·높이·신뢰도) */
export function extractOcrLines(page: OcrPageLike): OcrLine[] {
  const lines: OcrLine[] = [];

  for (const block of page.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const text = line.text?.replace(/\s+/g, " ").trim() ?? "";
        if (text.length < 2) continue;
        const { x0, y0, x1, y1 } = line.bbox;
        lines.push({
          text,
          top: y0,
          height: Math.max(1, y1 - y0),
          width: Math.max(1, x1 - x0),
          confidence: line.confidence ?? 0,
        });
      }
    }
  }

  if (lines.length > 0) return lines;

  return page.text
    .split(/\r?\n/)
    .map((raw) => raw.replace(/\s+/g, " ").trim())
    .filter((text) => text.length >= 2)
    .map((text, index) => ({
      text,
      top: index * 80,
      height: Math.max(24, 48 - index * 4),
      width: text.length * 12,
      confidence: Math.max(20, 90 - index * 8),
    }));
}

function parseDateParts(
  yRaw: string,
  mRaw: string,
  dRaw: string,
  dayToken?: string
): { date: string; day: string } | null {
  let y = Number(yRaw);
  const m = Number(mRaw);
  const d = Number(dRaw);
  if (y < 100) y = 2000 + y;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return {
    date: formatDisplayDate(y, m, d),
    day: dayToken ? parseWeekdayToken(dayToken) : weekdayFromDate(y, m, d),
  };
}

export function parseDateFromOcrText(text: string): { date: string; day: string } {
  const normalized = text.replace(/\s+/g, " ");

  const labeledKorean =
    normalized.match(
      /관람\s*일\s*[:：]?\s*(20\d{2})\s*[년.\-/]\s*(\d{1,2})\s*[월.\-/]\s*(\d{1,2})\s*일?(?:\s*[\(,]?\s*(일|월|화|수|목|금|토|Sun|Mon|Tue|Wed|Thu|Fri|Sat)[\),]?)?/i
    ) ??
    normalized.match(
      /관람\s*일\s*[:：]?\s*(\d{2})[.\-/](\d{2})[.\-/](\d{2})(?:\s*[\(,]?\s*(일|월|화|수|목|금|토|Sun|Mon|Tue|Wed|Thu|Fri|Sat)[\),]?)?/i
    );

  if (labeledKorean) {
    const parsed = parseDateParts(labeledKorean[1], labeledKorean[2], labeledKorean[3], labeledKorean[4]);
    if (parsed) return parsed;
  }

  const ymd =
    normalized.match(
      /(20\d{2})[.\-/년\s]*(\d{1,2})[.\-/월\s]*(\d{1,2})\s*(?:일)?(?:\s*[\(,]?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat|일|월|화|수|목|금|토)[\),]?)?/i
    ) ??
    normalized.match(
      /(\d{2})[.\-/](\d{2})[.\-/](\d{2})\s*(?:[\(,]?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat|일|월|화|수|목|금|토)[\),]?)?/i
    );

  if (ymd) {
    const parsed = parseDateParts(ymd[1], ymd[2], ymd[3], ymd[4]);
    if (parsed) return parsed;
  }

  const looseDay = normalized.match(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/i);
  if (looseDay) {
    return { date: "", day: parseWeekdayToken(looseDay[1]) };
  }

  return { date: "", day: "" };
}

export function parseVenueFromOcrText(text: string, lines: OcrLine[] = []): string {
  const normalized = text.replace(/\s+/g, " ");

  const inline = normalized.match(
    /공연\s*장소\s*[:：]?\s*([^\n|]+?)(?=\s*(?:관람\s*일|좌석|입장|seat|gate|$))/i
  );
  if (inline?.[1]) {
    const v = normalizeOcrText(inline[1]);
    if (v.length >= 2) return v;
  }

  for (const line of lines) {
    const fromLine = line.text.match(/공연\s*장소\s*[:：]?\s*(.+)/i);
    if (fromLine?.[1]) {
      const v = normalizeOcrText(fromLine[1]);
      if (v.length >= 2) return v;
    }
  }

  const scored = lines
    .map((line) => {
      let score = 0;
      if (VENUE_PATTERN.test(line.text)) score += 5;
      if (/공연\s*장소/.test(line.text)) score += 6;
      if (/[가-힣]/.test(line.text) && line.text.length <= 32) score += 1;
      if (/^\d+$/.test(line.text)) score -= 4;
      if (/seat|좌석|입장|gate|게이트|floor|층|관람\s*일/i.test(line.text)) score -= 4;
      if (DATE_IN_LINE.test(line.text)) score -= 3;
      return { line: line.text, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.line.replace(/공연\s*장소\s*[:：]?\s*/i, "").trim() ?? "";
}

function isConcertNameCandidate(text: string): boolean {
  if (text.length < 2) return false;
  if (CONCERT_NAME_NOISE.test(text)) return false;
  if (DATE_IN_LINE.test(text)) return false;
  if (VENUE_PATTERN.test(text) && text.length < 18) return false;
  if (/^\d+[\d\s\-./:]*$/.test(text)) return false;
  if (text.length > 48) return false;
  return true;
}

/** 상단·큰 글씨(바운딩 박스 높이) 우선 → 공연명 */
export function parseConcertNameFromLines(lines: OcrLine[]): string {
  if (lines.length === 0) return "";

  const tops = lines.map((l) => l.top);
  const minTop = Math.min(...tops);
  const maxTop = Math.max(...tops);
  const span = Math.max(1, maxTop - minTop);
  const upperCutoff = minTop + span * 0.42;

  const scored = lines
    .filter((line) => isConcertNameCandidate(line.text))
    .map((line) => {
      const upperBonus = line.top <= upperCutoff ? 120 : 0;
      const sizeScore = line.height * 3.5;
      const topScore = (1 - (line.top - minTop) / span) * 80;
      const confScore = line.confidence * 0.4;
      const widthScore = Math.min(line.width, 400) * 0.05;
      const lengthPenalty = line.text.length > 28 ? -15 : 0;
      return {
        text: line.text,
        score: sizeScore + topScore + upperBonus + confScore + widthScore + lengthPenalty,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best) return normalizeOcrText(best.text);

  const fallback = lines
    .filter((line) => isConcertNameCandidate(line.text))
    .sort((a, b) => a.top - b.top)[0];
  return fallback ? normalizeOcrText(fallback.text) : "";
}

export function buildDraftFromOcr(page: OcrPageLike): Pick<
  TicketRegistrationDraft,
  "concertName" | "date" | "day" | "venue" | "rawOcrText"
> {
  const rawOcrText = page.text ?? "";
  const lines = extractOcrLines(page);
  const { date, day } = parseDateFromOcrText(rawOcrText);
  const venue = parseVenueFromOcrText(rawOcrText, lines);
  const concertName = parseConcertNameFromLines(lines);

  return { concertName, date, day, venue, rawOcrText };
}

/** @deprecated 텍스트만 있을 때 — 가능하면 buildDraftFromOcr(page) 사용 */
export function buildDraftFromOcrText(rawText: string): Pick<
  TicketRegistrationDraft,
  "concertName" | "date" | "day" | "venue" | "rawOcrText"
> {
  return buildDraftFromOcr({ text: rawText, blocks: null });
}
