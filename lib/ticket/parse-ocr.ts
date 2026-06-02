import type { TicketRegistrationDraft } from "@/lib/ticket/types";

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const VENUE_PATTERN =
  /(?:홀|Hall|HALL|아레나|Arena|ARENA|센터|Center|CENTRE|공연장|극장|Theater|THEATRE|스타디움|Stadium|STADIUM|라이브|LIVE|DOME|돔|체육관|문화센터|아트센터|콘서트홀|팬텀|PHANTOM|인스파이어|올림픽|월드컵|예술의전당|세종문화)/i;

const CONCERT_NAME_NOISE =
  /^(?:관람\s*일|공연\s*장소|공연장|좌석|입장|seat|gate|예매|주문|order|ticket|barcode|qr|티켓|예매번호|주문번호|고객|tel|전화|www\.|http)/i;

/** 예매일·발권일 등 — 관람일로 쓰지 않음 */
const BOOKING_DATE_LABEL =
  /예매\s*일|예매일|발권\s*일|구매\s*일|결제\s*일|주문\s*일|booking\s*date|purchase\s*date|order\s*date/i;

/** 관람(공연) 일시만 인식 */
const VIEWING_DATE_LABEL =
  /관람\s*일(?:시)?|공연\s*일|입장\s*일|show\s*date/i;

const DATE_IN_LINE =
  /(?:20\d{2}|\d{2}[.\-/]\d{2})[.\-/년월]?\s*\d{1,2}|관람\s*일|일시|공연\s*일/i;

const TIME_IN_LINE = /\d{1,2}\s*[:：시]\s*\d{2}/;

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

const BOOKING_DETAIL_LABEL =
  /^(?:예매\s*(?:번호|일)|관람\s*일(?:시)?|공연\s*장소|매수|취소(?:마감)?|상태|좌석|입장|결제|주문)/i;

/** 멜론·인터파크 등 예매내역 캡처 (라벨 OCR 실패 시 휴리스틱 포함) */
function isBookingHistoryOcr(rawText: string, lines: OcrLine[]): boolean {
  const blob = `${rawText}\n${lines.map((l) => l.text).join("\n")}`;

  if (/예매/.test(blob) && /관람\s*일/.test(blob) && /공연\s*장소/.test(blob)) {
    return true;
  }

  if (/예매\s*완료|입금\s*완료/i.test(blob)) return true;
  if (/M\d{6,}/.test(blob) && /\d+\s*매/.test(blob)) return true;

  const dateLines = lines.filter((l) => parseDateValueFromText(l.text).date);
  if (dateLines.length >= 2 && VENUE_PATTERN.test(blob)) return true;

  return false;
}

function hasViewingDateContext(rawText: string, lines: OcrLine[]): boolean {
  if (isBookingHistoryOcr(rawText, lines)) return true;
  const blob = `${rawText}\n${lines.map((l) => l.text).join("\n")}`;
  return /관람\s*일(?:시)?/i.test(blob);
}

function isBookingHistoryNoiseLine(text: string): boolean {
  const normalized = normalizeOcrText(text);
  if (!normalized) return true;
  if (/^M\d{6,}$/i.test(normalized)) return true;
  if (/^\d+\s*매$/.test(normalized)) return true;
  if (/까지|취소\s*마감|예매\s*완료|입금\s*완료/i.test(normalized)) return true;
  return false;
}

function inferBookingDateFromOrphanDates(lines: OcrLine[]): string {
  const dates = lines
    .filter((l) => !isBookingHistoryNoiseLine(l.text))
    .filter((l) => !/\d{1,2}\s*시/.test(l.text))
    .map((l) => parseDateValueFromText(l.text).date.split(/\s/)[0])
    .filter(Boolean);

  if (dates.length === 0) return "";
  dates.sort((a, b) => ymdSortKey(a) - ymdSortKey(b));
  return dates[0];
}

/** OCR이 관람일·예매일 라벨을 못 읽을 때 — 공연 시간(16시) 있는 날짜 = 관람일 */
function parseViewingDateWhenLabelsMissing(lines: OcrLine[]): { date: string; day: string } {
  const bookingDate =
    extractBookingDateFromLines(lines) || inferBookingDateFromOrphanDates(lines);

  const usable = lines.filter((l) => !isBookingHistoryNoiseLine(l.text));

  const withShowTime = usable.filter(
    (l) => /\d{1,2}\s*시/.test(l.text) && !/까지|마감|취소/i.test(l.text)
  );

  if (withShowTime.length > 0) {
    if (withShowTime.length === 1) {
      return parseDateValueFromText(withShowTime[0].text);
    }
    const latest = pickLatestViewingDateExcludingBooking(withShowTime, bookingDate);
    if (latest.date) return latest;
  }

  const latest = pickLatestViewingDateExcludingBooking(usable, bookingDate);
  if (latest.date) return latest;

  return { date: "", day: "" };
}

function parseVenueFromBookingHistoryNoLabels(lines: OcrLine[]): string {
  for (const line of lines) {
    const text = normalizeOcrText(line.text);
    if (text.length < 2 || isBookingHistoryNoiseLine(text)) continue;
    if (DATE_IN_LINE.test(text) && !VENUE_PATTERN.test(text)) continue;
    if (VENUE_PATTERN.test(text)) return cleanVenueText(text);
  }
  return "";
}

function isAdjacentDetailLabel(text: string, labelPattern: RegExp): boolean {
  const normalized = normalizeOcrText(text);
  if (!normalized) return true;
  if (labelPattern.test(normalized) && normalizeOcrText(normalized.replace(labelPattern, "")).length < 3) {
    return true;
  }
  if (BOOKING_DETAIL_LABEL.test(normalized) && !/(20\d{2}|\d{1,2}\s*월)/.test(normalized)) {
    return true;
  }
  return isBookingOnlyDateLine(normalized) && !VIEWING_DATE_LABEL.test(normalized);
}

function extractBookingDateFromLines(lines: OcrLine[]): string {
  const value = findValueAfterLabel(
    lines,
    /예매\s*일/i,
    (t) => /20\d{2}/.test(t) || DATE_IN_LINE.test(t)
  );

  if (value) {
    const parsed =
      parseGenericYmd(value) ?? parseViewingDateFromOcrText(`예매일 ${value}`);
    return parsed?.date?.split(/\s/)[0] ?? "";
  }

  for (const line of lines.filter((l) => isBookingOnlyDateLine(l.text))) {
    const parsed = parseGenericYmd(line.text);
    if (parsed?.date) return parsed.date.split(/\s/)[0];
  }

  return "";
}

function findValueAfterLabel(
  lines: OcrLine[],
  labelPattern: RegExp,
  isValidValue: (text: string) => boolean
): string {
  const sorted = [...lines].sort((a, b) => a.top - b.top);

  for (let i = 0; i < sorted.length; i++) {
    const text = sorted[i].text;
    const inline = text.match(
      new RegExp(`(?:${labelPattern.source})\\s*[:：]?\\s*(.+)`, labelPattern.flags)
    );
    if (inline?.[1]) {
      const value = normalizeOcrText(inline[1]);
      if (isValidValue(value)) return value;
    }

    if (labelPattern.test(text) && normalizeOcrText(text.replace(labelPattern, "")).length < 3) {
      for (let j = i + 1; j < sorted.length && j <= i + 3; j++) {
        const candidate = normalizeOcrText(sorted[j].text);
        if (isAdjacentDetailLabel(candidate, labelPattern)) continue;
        if (isValidValue(candidate)) return candidate;
      }
    }
  }

  return "";
}

function parseDateValueFromText(text: string): { date: string; day: string } {
  const labeled = parseViewingDateFromOcrText(`관람일 ${text}`);
  if (labeled.date) return labeled;

  const generic = parseGenericYmd(text);
  if (generic?.date) {
    return {
      date: generic.date + parseTimeSuffix(text),
      day: generic.day,
    };
  }

  return { date: "", day: "" };
}

function ymdSortKey(dateStr: string): number {
  const m = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})/);
  if (!m) return 0;
  const y = Number(m[1]) + (Number(m[1]) < 70 ? 2000 : 1900);
  return y * 10000 + Number(m[2]) * 100 + Number(m[3]);
}

function pickLatestViewingDateExcludingBooking(
  lines: OcrLine[],
  bookingDate: string
): { date: string; day: string } {
  let best: { date: string; day: string } = { date: "", day: "" };
  let bestKey = -1;

  for (const line of lines) {
    if (isBookingOnlyDateLine(line.text)) continue;
    if (/^예매\s*일$/i.test(normalizeOcrText(line.text))) continue;

    const parsed = parseDateValueFromText(line.text);
    const dateOnly = parsed.date.split(/\s/)[0];
    if (!parsed.date || !dateOnly || dateOnly === bookingDate) continue;

    const key = ymdSortKey(dateOnly);
    if (key > bestKey) {
      bestKey = key;
      best = parsed;
    }
  }

  return best;
}

function parseViewingDateFromBookingHistory(lines: OcrLine[]): { date: string; day: string } {
  const bookingDate = extractBookingDateFromLines(lines);

  const value = findValueAfterLabel(
    lines,
    /관람\s*일(?:시)?/i,
    (t) => !BOOKING_DATE_LABEL.test(t) && (/20\d{2}/.test(t) || DATE_IN_LINE.test(t))
  );

  if (value) {
    const parsed = parseDateValueFromText(value);
    const dateOnly = parsed.date.split(/\s/)[0];
    if (parsed.date && dateOnly !== bookingDate) return parsed;
  }

  for (const line of lines.filter((l) => /관람\s*일(?:시)?/i.test(l.text))) {
    const parsed = parseViewingDateFromOcrText(line.text);
    const dateOnly = parsed.date.split(/\s/)[0];
    if (parsed.date && dateOnly !== bookingDate) return parsed;
  }

  const hasBookingDateLabel = lines.some((l) => /예매\s*일/i.test(l.text));
  const hasViewingDateLabel = lines.some((l) => /관람\s*일(?:시)?/i.test(l.text));

  if (hasBookingDateLabel && hasViewingDateLabel) {
    const latest = pickLatestViewingDateExcludingBooking(lines, bookingDate);
    if (latest.date) return latest;
  }

  return parseViewingDateWhenLabelsMissing(lines);
}

function parseVenueFromBookingHistory(lines: OcrLine[]): string {
  const value = findValueAfterLabel(
    lines,
    /공연\s*장소/i,
    (t) =>
      t.length >= 2 &&
      !DATE_IN_LINE.test(t) &&
      !BOOKING_DETAIL_LABEL.test(t) &&
      !/예매|매수|취소|상태|완료/i.test(t)
  );
  if (value) return cleanVenueText(value);

  for (const line of lines) {
    const fromLine = line.text.match(/공연\s*장소\s*[:：]?\s*(.+)/i);
    if (fromLine?.[1]) {
      const v = cleanVenueText(fromLine[1]);
      if (v.length >= 2) return v;
    }
  }

  return parseVenueFromBookingHistoryNoLabels(lines);
}

/** 예매내역 상단 — 바운딩 박스가 큰(진한) 제목 줄 */
function parseConcertNameFromBookingHistory(lines: OcrLine[]): string {
  if (lines.length === 0) return "";

  const tops = lines.map((l) => l.top);
  const minTop = Math.min(...tops);
  const maxTop = Math.max(...tops);
  const span = Math.max(1, maxTop - minTop);
  const upperCutoff = minTop + span * 0.42;
  const maxHeight = Math.max(...lines.map((l) => l.height), 1);

  const isTitleCandidate = (line: OcrLine) => {
    const text = line.text.trim();
    if (text.length < 6) return false;
    if (BOOKING_DETAIL_LABEL.test(text)) return false;
    if (CONCERT_NAME_NOISE.test(text)) return false;
    if (/^M\d{6,}/.test(text)) return false;
    if (/예매\s*완료|입금\s*완료|취소\s*마감/i.test(text)) return false;
    if (DATE_IN_LINE.test(text) && text.length < 28) return false;
    if (/^\d+[\d\s\-./:]*$/.test(text)) return false;
    if (line.top > upperCutoff) return false;
    return /[A-Za-z가-힣]/.test(text);
  };

  const scored = lines
    .filter(isTitleCandidate)
    .map((line) => {
      const heightRatio = line.height / maxHeight;
      const relTop = (line.top - minTop) / span;
      return {
        text: line.text,
        score: heightRatio * 220 + (1 - relTop) * 60 + line.confidence * 0.2 + Math.min(line.width, 520) * 0.03,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) return parseConcertNameFromLines(lines);

  return normalizeOcrText(best.text)
    .replace(/[>\u203a›»]+$/g, "")
    .replace(/\.{2,}$/g, "")
    .trim();
}

function parseTimeSuffix(text: string): string {
  const normalized = text.replace(/\s+/g, " ");
  const time =
    normalized.match(
      /(?:관람\s*)?(?:일시|시간|TIME|SHOW\s*TIME)\s*[:：]?\s*(\d{1,2})\s*[:：시]\s*(\d{2})/i
    ) ?? normalized.match(/(\d{1,2})\s*[:：시]\s*(\d{2})\s*(?:분)?/i);

  if (time) {
    const h = Number(time[1]);
    const m = Number(time[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return ` ${pad2(h)}:${pad2(m)}`;
    }
  }

  const hourOnly = normalized.match(/(?:일|\))\s*(\d{1,2})\s*시(?:\s*(?!\d)|$)/i);
  if (hourOnly) {
    const h = Number(hourOnly[1]);
    if (h >= 0 && h <= 23) return ` ${pad2(h)}:00`;
  }

  return "";
}

function isBookingOnlyDateLine(text: string): boolean {
  return BOOKING_DATE_LABEL.test(text) && !VIEWING_DATE_LABEL.test(text);
}

function parseLabeledViewingDate(normalized: string): { date: string; day: string } | null {
  const labeled =
    normalized.match(
      /관람\s*일(?:시)?\s*[:：]?\s*(20\d{2})\s*[년.\-/]\s*(\d{1,2})\s*[월.\-/]\s*(\d{1,2})\s*일?(?:\s*[\(,]?\s*(일|월|화|수|목|금|토|Sun|Mon|Tue|Wed|Thu|Fri|Sat)[\),]?)?/i
    ) ??
    normalized.match(
      /관람\s*일(?:시)?\s*[:：]?\s*(\d{2})[.\-/](\d{2})[.\-/](\d{2})(?:\s*[\(,]?\s*(일|월|화|수|목|금|토|Sun|Mon|Tue|Wed|Thu|Fri|Sat)[\),]?)?/i
    ) ??
    normalized.match(
      /공연\s*일\s*[:：]?\s*(20\d{2})\s*[년.\-/]\s*(\d{1,2})\s*[월.\-/]\s*(\d{1,2})\s*일?(?:\s*[\(,]?\s*(일|월|화|수|목|금|토|Sun|Mon|Tue|Wed|Thu|Fri|Sat)[\),]?)?/i
    ) ??
    normalized.match(
      /(?:SHOW\s*DATE|SHOW\s*DAY)\s*[:：]?\s*(20\d{2})\s*[년.\-/]\s*(\d{1,2})\s*[월.\-/]\s*(\d{1,2})/i
    );

  if (!labeled) return null;

  const parsed = parseDateParts(labeled[1], labeled[2], labeled[3], labeled[4]);
  if (!parsed) return null;

  return {
    date: parsed.date + parseTimeSuffix(normalized),
    day: parsed.day,
  };
}

function parseGenericYmd(normalized: string): { date: string; day: string } | null {
  const ymd =
    normalized.match(
      /(20\d{2})[.\-/년\s]*(\d{1,2})[.\-/월\s]*(\d{1,2})\s*(?:일)?(?:\s*[\(,]?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat|일|월|화|수|목|금|토)[\),]?)?/i
    ) ??
    normalized.match(
      /(\d{2})[.\-/](\d{2})[.\-/](\d{2})\s*(?:[\(,]?\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat|일|월|화|수|목|금|토)[\),]?)?/i
    );

  if (!ymd) return null;

  const parsed = parseDateParts(ymd[1], ymd[2], ymd[3], ymd[4]);
  if (!parsed) return null;

  return {
    date: parsed.date + parseTimeSuffix(normalized),
    day: parsed.day,
  };
}

/** 관람일(공연일)만 추출 — 예매일·발권일 제외 */
export function parseViewingDateFromOcrText(text: string): { date: string; day: string } {
  if (isBookingOnlyDateLine(text)) {
    return { date: "", day: "" };
  }

  const normalized = text.replace(/\s+/g, " ");

  const labeled = parseLabeledViewingDate(normalized);
  if (labeled) return labeled;

  const viewingIdx = normalized.search(/관람\s*일(?:시)?/i);
  if (viewingIdx >= 0) {
    const nearViewing = normalized.slice(viewingIdx, viewingIdx + 96);
    const fromSlice = parseLabeledViewingDate(nearViewing) ?? parseGenericYmd(nearViewing);
    if (fromSlice?.date) return fromSlice;
  }

  const showIdx = normalized.search(/공연\s*일/i);
  if (showIdx >= 0 && !BOOKING_DATE_LABEL.test(normalized.slice(0, showIdx))) {
    const nearShow = normalized.slice(showIdx, showIdx + 72);
    const fromShow = parseLabeledViewingDate(nearShow) ?? parseGenericYmd(nearShow);
    if (fromShow?.date) return fromShow;
  }

  if (BOOKING_DATE_LABEL.test(normalized) && !VIEWING_DATE_LABEL.test(normalized)) {
    return { date: "", day: "" };
  }

  const generic = parseGenericYmd(normalized);
  if (generic) return generic;

  const looseDay = normalized.match(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/i);
  if (looseDay) {
    return { date: "", day: parseWeekdayToken(looseDay[1]) };
  }

  return { date: "", day: "" };
}

/** @deprecated — parseViewingDateFromOcrText 사용 */
export function parseDateFromOcrText(text: string): { date: string; day: string } {
  return parseViewingDateFromOcrText(text);
}

/** 줄 단위로 관람일·관람일시만 탐색 (예매일 줄 무시) */
export function parseViewingDateFromLines(lines: OcrLine[]): { date: string; day: string } {
  const hasViewingLabel = lines.some((l) => /관람\s*일(?:시)?/i.test(l.text));

  if (hasViewingLabel) {
    const fromBooking = parseViewingDateFromBookingHistory(lines);
    if (fromBooking.date || fromBooking.day) return fromBooking;
  }

  const dateLike = (text: string) =>
    (DATE_IN_LINE.test(text) || TIME_IN_LINE.test(text) || /20\d{2}/.test(text)) &&
    !isBookingOnlyDateLine(text) &&
    !/^예매\s*일/i.test(text);

  const tiers: OcrLine[][] = [
    lines.filter((l) => /관람\s*일(?:시)?/i.test(l.text)),
    lines.filter((l) => /공연\s*일/i.test(l.text) && !/예매/i.test(l.text)),
    lines.filter(
      (l) => VIEWING_DATE_LABEL.test(l.text) && !BOOKING_DATE_LABEL.test(l.text)
    ),
  ];

  if (!hasViewingLabel) {
    tiers.push(lines.filter((l) => dateLike(l.text)));
  }

  const seen = new Set<string>();
  for (const tier of tiers) {
    for (const line of tier) {
      if (seen.has(line.text)) continue;
      seen.add(line.text);
      const parsed = parseViewingDateFromOcrText(line.text);
      if (parsed.date || parsed.day) return parsed;
    }
  }

  return { date: "", day: "" };
}

/** @deprecated — parseViewingDateFromLines 사용 */
export function parseDateFromLines(lines: OcrLine[]): { date: string; day: string } {
  return parseViewingDateFromLines(lines);
}

function cleanVenueText(raw: string): string {
  return normalizeOcrText(
    raw
      .replace(/^(?:공연\s*)?(?:장소|장|venue|location)\s*[:：]?\s*/i, "")
      .replace(/\s*(?:관람\s*일|좌석|입장|seat|gate).*$/i, "")
  );
}

export function parseVenueFromOcrText(
  text: string,
  lines: OcrLine[] = [],
  options?: { excludeTexts?: string[] }
): string {
  const normalized = text.replace(/\s+/g, " ");
  const exclude = new Set(
    (options?.excludeTexts ?? [])
      .map((t) => normalizeOcrText(t).toLowerCase())
      .filter(Boolean)
  );

  const isExcluded = (lineText: string) => {
    const n = normalizeOcrText(lineText).toLowerCase();
    if (!n) return true;
    for (const ex of exclude) {
      if (n === ex || n.includes(ex) || ex.includes(n)) return true;
    }
    return false;
  };

  const inline = normalized.match(
    /(?:공연\s*)?(?:장소|장)\s*[:：]?\s*([^\n|]+?)(?=\s*(?:관람|일시|좌석|입장|seat|gate|$))/i
  );
  if (inline?.[1]) {
    const v = cleanVenueText(inline[1]);
    if (v.length >= 2 && !isExcluded(v)) return v;
  }

  for (const line of lines) {
    const fromLine = line.text.match(/(?:공연\s*)?(?:장소|장)\s*[:：]?\s*(.+)/i);
    if (fromLine?.[1]) {
      const v = cleanVenueText(fromLine[1]);
      if (v.length >= 2 && !isExcluded(v)) return v;
    }
  }

  const tops = lines.map((l) => l.top);
  const minTop = tops.length ? Math.min(...tops) : 0;
  const maxTop = tops.length ? Math.max(...tops) : 1;
  const span = Math.max(1, maxTop - minTop);

  const scored = lines
    .filter((line) => !isExcluded(line.text))
    .map((line) => {
      let score = 0;
      const relTop = (line.top - minTop) / span;

      if (VENUE_PATTERN.test(line.text)) score += 8;
      if (/(?:공연\s*)?(?:장소|장)|venue|location/i.test(line.text)) score += 10;
      if (/[가-힣A-Za-z]/.test(line.text) && line.text.length >= 3 && line.text.length <= 36)
        score += 2;
      if (relTop >= 0.18 && relTop <= 0.72) score += 4;
      if (relTop < 0.12) score -= 6;
      if (/^\d+[\d\s\-./:]*$/.test(line.text)) score -= 6;
      if (/seat|좌석|입장|gate|게이트|floor|층|구역|열|번/i.test(line.text)) score -= 5;
      if (DATE_IN_LINE.test(line.text) || TIME_IN_LINE.test(line.text)) score -= 6;
      if (CONCERT_NAME_NOISE.test(line.text)) score -= 4;

      return { text: cleanVenueText(line.text), score };
    })
    .filter((item) => item.score > 0 && item.text.length >= 2)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.text ?? "";
}

function isConcertNameCandidate(text: string): boolean {
  if (text.length < 2) return false;
  if (CONCERT_NAME_NOISE.test(text)) return false;
  if (DATE_IN_LINE.test(text)) return false;
  if (TIME_IN_LINE.test(text)) return false;
  if (/(?:공연\s*)?(?:장소|장)\s*[:：]/i.test(text)) return false;
  if (VENUE_PATTERN.test(text) && text.length < 22) return false;
  if (/^\d+[\d\s\-./:]*$/.test(text)) return false;
  if (text.length > 56) return false;
  return true;
}

/** 상단·가장 큰 글씨(바운딩 박스 높이) 우선 → 공연명 */
export function parseConcertNameFromLines(lines: OcrLine[]): string {
  if (lines.length === 0) return "";

  const tops = lines.map((l) => l.top);
  const heights = lines.map((l) => l.height);
  const minTop = Math.min(...tops);
  const maxTop = Math.max(...tops);
  const maxHeight = Math.max(...heights, 1);
  const span = Math.max(1, maxTop - minTop);
  const upperCutoff = minTop + span * 0.38;

  const candidates = lines.filter((line) => isConcertNameCandidate(line.text));

  const scored = candidates
    .map((line) => {
      const heightRatio = line.height / maxHeight;
      const relTop = (line.top - minTop) / span;
      const upperBonus = line.top <= upperCutoff ? 140 : 0;
      const sizeScore = heightRatio * 200;
      const topScore = (1 - relTop) * 90;
      const confScore = line.confidence * 0.35;
      const widthScore = Math.min(line.width, 480) * 0.04;
      const lengthPenalty = line.text.length > 32 ? -20 : 0;
      const venuePenalty = VENUE_PATTERN.test(line.text) ? -40 : 0;
      return {
        text: line.text,
        top: line.top,
        heightRatio,
        score:
          sizeScore +
          topScore +
          upperBonus +
          confScore +
          widthScore +
          lengthPenalty +
          venuePenalty,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) {
    const fallback = candidates.sort((a, b) => a.top - b.top)[0];
    return fallback ? normalizeOcrText(fallback.text) : "";
  }

  const titleParts = [normalizeOcrText(best.text)];
  const second = scored.find(
    (item) =>
      item.text !== best.text &&
      item.top <= upperCutoff &&
      item.top >= best.top - 6 &&
      item.top <= best.top + maxHeight * 3.2 &&
      item.heightRatio >= 0.5 &&
      isConcertNameCandidate(item.text)
  );
  if (second) titleParts.push(normalizeOcrText(second.text));

  return titleParts.join(" ").trim();
}

export function buildDraftFromOcr(page: OcrPageLike): Pick<
  TicketRegistrationDraft,
  "concertName" | "date" | "day" | "venue" | "rawOcrText"
> {
  const rawOcrText = page.text ?? "";
  const lines = extractOcrLines(page);
  const bookingHistory = isBookingHistoryOcr(rawOcrText, lines);
  const strictViewingDate = bookingHistory || hasViewingDateContext(rawOcrText, lines);

  const concertName = bookingHistory
    ? parseConcertNameFromBookingHistory(lines)
    : parseConcertNameFromLines(lines);

  let { date, day } = strictViewingDate
    ? parseViewingDateFromBookingHistory(lines)
    : parseViewingDateFromLines(lines);

  if (!strictViewingDate && !date && !day) {
    const fromText = parseViewingDateFromOcrText(rawOcrText);
    date = fromText.date;
    day = fromText.day;
  }

  const venue = bookingHistory
    ? parseVenueFromBookingHistory(lines) ||
      parseVenueFromOcrText(rawOcrText, lines, {
        excludeTexts: concertName ? [concertName] : [],
      })
    : parseVenueFromOcrText(rawOcrText, lines, {
        excludeTexts: concertName ? [concertName] : [],
      });

  return { concertName, date, day, venue, rawOcrText };
}

/** @deprecated 텍스트만 있을 때 — 가능하면 buildDraftFromOcr(page) 사용 */
export function buildDraftFromOcrText(rawText: string): Pick<
  TicketRegistrationDraft,
  "concertName" | "date" | "day" | "venue" | "rawOcrText"
> {
  return buildDraftFromOcr({ text: rawText, blocks: null });
}
