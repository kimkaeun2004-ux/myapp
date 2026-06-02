export type ReportTicketRecord = {
  id?: string | number;
  emotion: string;
  concert_name?: string | null;
  artist?: string | null;
  created_at?: string | number | null;
};

export type EmotionReportResult = {
  topEmotion: string;
  topEmotionCount: number;
  totalTickets: number;
  lingeringIndex: number;
  month: number;
  latestConcertLabel: string;
  isEmpty: boolean;
};

const KNOWN_EMOTIONS = [
  "강렬",
  "행복",
  "벅참",
  "신남",
  "전율",
  "편안",
  "아련",
  "뭉클",
  "몽환",
] as const;

export function parseEmotionTags(emotion: string): string[] {
  return emotion
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => KNOWN_EMOTIONS.includes(tag as (typeof KNOWN_EMOTIONS)[number]));
}

export function primaryEmotion(emotion: string): string {
  const tags = parseEmotionTags(emotion);
  return tags[0] ?? "몽환";
}

export function formatConcertLabel(ticket: ReportTicketRecord): string {
  const name = ticket.concert_name?.trim();
  if (name) return name.includes("콘서트") ? name : `${name}`;
  const artist = ticket.artist?.trim();
  if (artist) return `${artist} 콘서트`;
  return "최근 공연";
}

export function computeEmotionReport(
  tickets: ReportTicketRecord[],
  month: number
): EmotionReportResult {
  if (tickets.length === 0) {
    return {
      topEmotion: "몽환",
      topEmotionCount: 0,
      totalTickets: 0,
      lingeringIndex: 0,
      month,
      latestConcertLabel: "최근 공연",
      isEmpty: true,
    };
  }

  const frequency = new Map<string, number>();
  let totalEmotionTags = 0;

  for (const ticket of tickets) {
    for (const tag of parseEmotionTags(ticket.emotion)) {
      totalEmotionTags += 1;
      frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
    }
  }

  if (totalEmotionTags === 0) {
    return {
      topEmotion: "몽환",
      topEmotionCount: 0,
      totalTickets: tickets.length,
      lingeringIndex: 0,
      month,
      latestConcertLabel: formatConcertLabel(tickets[0]),
      isEmpty: true,
    };
  }

  let topEmotion = "몽환";
  let topEmotionCount = 0;

  for (const [emotion, count] of frequency.entries()) {
    if (count > topEmotionCount) {
      topEmotion = emotion;
      topEmotionCount = count;
    }
  }

  const totalTickets = tickets.length;
  const lingeringIndex = Math.round((topEmotionCount / totalEmotionTags) * 100);

  const sortedByRecency = [...tickets].sort((a, b) => {
    const aTime = ticketTimestamp(a);
    const bTime = ticketTimestamp(b);
    return bTime - aTime;
  });

  return {
    topEmotion,
    topEmotionCount,
    totalTickets,
    lingeringIndex,
    month,
    latestConcertLabel: formatConcertLabel(sortedByRecency[0] ?? tickets[0]),
    isEmpty: false,
  };
}

function ticketTimestamp(ticket: ReportTicketRecord): number {
  if (ticket.created_at) {
    const parsed = new Date(ticket.created_at).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (typeof ticket.id === "number") return ticket.id;
  return 0;
}

export function startOfMonthIso(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

export function currentMonthNumber(date = new Date()): number {
  return date.getMonth() + 1;
}
