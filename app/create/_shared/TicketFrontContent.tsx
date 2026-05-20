import type { TicketRegistrationDraft } from "@/lib/ticket/types";
import { YEOUN_TICKET } from "@/lib/ui/yeoun-scale";

type TicketFrontContentProps = {
  ticket: Pick<TicketRegistrationDraft, "concertName" | "artist" | "date" | "day" | "venue">;
  quote?: string;
  className?: string;
};

export function TicketFrontContent({
  ticket,
  quote,
  className = "",
}: TicketFrontContentProps) {
  const headline = ticket.artist.trim() || "가수명";
  const concertLine = ticket.concertName.trim() || "공연명";
  const dateLine = [ticket.date, ticket.day].filter(Boolean).join(" · ");

  return (
    <div className={`flex w-full flex-col items-center text-center ${className}`}>
      <p className={YEOUN_TICKET.label}>{concertLine}</p>
      <p className={`mt-[1.6cqh] ${YEOUN_TICKET.headline}`}>{headline}</p>
      {dateLine ? <p className={`mt-[1.9cqh] ${YEOUN_TICKET.meta}`}>{dateLine}</p> : null}
      {ticket.venue ? (
        <p className={`mt-[1.3cqh] ${YEOUN_TICKET.meta} text-[#3c3c3c]`}>{ticket.venue}</p>
      ) : null}
      {quote ? (
        <p className={`mt-[2.1cqh] w-[86%] whitespace-pre-wrap break-words ${YEOUN_TICKET.quote}`}>
          {quote}
        </p>
      ) : null}
    </div>
  );
}
