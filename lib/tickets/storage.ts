export type StoredTicket = {
  id?: number;
  emotions: string;
  quote: string;
  backImage: string;
};

function parseTicket(item: Partial<StoredTicket>, idx: number): StoredTicket {
  return {
    id: item.id ?? Date.now() - idx,
    emotions: item.emotions ?? "",
    quote: item.quote ?? "",
    backImage: item.backImage ?? "",
  };
}

export function loadStoredTickets(): StoredTicket[] {
  if (typeof window === "undefined") return [];

  try {
    const rawList = window.sessionStorage.getItem("yeounTickets");
    let list: StoredTicket[] = [];

    if (rawList) {
      const parsedList = JSON.parse(rawList) as Partial<StoredTicket>[];
      list = parsedList
        .filter((item) => item && (item.emotions || item.quote || item.backImage))
        .map(parseTicket);
    }

    const rawSingle = window.sessionStorage.getItem("yeounTicket");
    if (rawSingle) {
      const parsedSingle = JSON.parse(rawSingle) as Partial<StoredTicket>;
      if (
        parsedSingle &&
        (parsedSingle.emotions || parsedSingle.quote || parsedSingle.backImage)
      ) {
        const single = parseTicket(parsedSingle, 0);
        const sameAsFirst =
          list.length > 0 &&
          list[0].emotions === single.emotions &&
          list[0].quote === single.quote &&
          list[0].backImage === single.backImage;

        if (!sameAsFirst) {
          list = [single, ...list];
        }
      }
    }

    return list;
  } catch {
    return [];
  }
}

export function formatTicketDateFromId(id?: number) {
  if (!id) return "";
  const date = new Date(id);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function ticketGridTitle(ticket: StoredTicket) {
  const emotions = ticket.emotions
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (emotions.length > 0) return emotions.join(" · ");
  if (ticket.quote) return ticket.quote.slice(0, 12);
  return "YEOUN";
}

export function ticketGridHeadline(ticket: StoredTicket) {
  if (ticket.quote) {
    const line = ticket.quote.split("\n")[0]?.trim() ?? "";
    if (line.length <= 10) return line;
    return `${line.slice(0, 10)}…`;
  }
  const emotions = ticket.emotions.split(",").map((e) => e.trim()).filter(Boolean);
  return emotions[0] ?? "YOURS";
}
