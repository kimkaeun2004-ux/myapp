export type TicketRegistrationDraft = {
  concertName: string;
  artist: string;
  date: string;
  day: string;
  venue: string;
  rawOcrText?: string;
  imageDataUrl?: string;
};

export const EMPTY_TICKET_DRAFT: TicketRegistrationDraft = {
  concertName: "",
  artist: "",
  date: "",
  day: "",
  venue: "",
};
