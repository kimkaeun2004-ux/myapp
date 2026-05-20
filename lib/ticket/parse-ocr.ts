import type { TicketRegistrationDraft } from "@/lib/ticket/types";

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

const VENUE_PATTERN =
  /(?:홀|Hall|HALL|아레나|Arena|ARENA|센터|Center|CENTRE|공연장|극장|Theater|THEATRE|스타디움|Stadium|STADIUM|라이브|LIVE|DOME|돔|체육관|문화센터|아트센터|콘서트홀|팬텀|PHANTOM)/i;

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

export function parseDateFromOcrText(text: string): { date: string; day: string } {
  const normalized = text.replace(/\s+/g, " ");

  const ymd =
    normalized.match(
      /(20\d{2})[.\-/년\s]*(\d{1,2})[.\-/월\s]*(\d{1,2})\s*(?:일)?(?:\s*[\(,]?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat|일|월|화|수|목|금|토)[\),]?)?/i
    ) ??
    normalized.match(
      /(\d{2})[.\-/](\d{2})[.\-/](\d{2})\s*(?:[\(,]?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat|일|월|화|수|목|금|토)[\),]?)?/i
    );

  if (ymd) {
    let y = Number(ymd[1]);
    let m = Number(ymd[2]);
    let d = Number(ymd[3]);
    const dayToken = ymd[4];

    if (y < 100) {
      y = 2000 + y;
    }

    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const date = formatDisplayDate(y, m, d);
      const day = dayToken ? parseWeekdayToken(dayToken) : weekdayFromDate(y, m, d);
      return { date, day };
    }
  }

  const looseDay = normalized.match(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/i);
  if (looseDay) {
    return { date: "", day: parseWeekdayToken(looseDay[1]) };
  }

  return { date: "", day: "" };
}

export function parseVenueFromOcrText(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter((line) => line.length >= 2);

  const scored = lines
    .map((line) => {
      let score = 0;
      if (VENUE_PATTERN.test(line)) score += 4;
      if (/[가-힣]/.test(line) && line.length <= 28) score += 1;
      if (/^\d+$/.test(line)) score -= 3;
      if (/seat|좌석|입장|gate|게이트|floor|층/i.test(line)) score -= 2;
      return { line, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.line ?? "";
}

export function buildDraftFromOcrText(rawText: string): Pick<
  TicketRegistrationDraft,
  "date" | "day" | "venue" | "rawOcrText"
> {
  const { date, day } = parseDateFromOcrText(rawText);
  const venue = parseVenueFromOcrText(rawText);
  return { date, day, venue, rawOcrText: rawText };
}
