import type { TicketRegistrationDraft } from "@/lib/ticket/types";

type TicketFrontContentProps = {
  ticket: Pick<TicketRegistrationDraft, "concertName" | "artist" | "date" | "day" | "venue">;
  quote?: string;
  className?: string;
  largeHeadline?: boolean;
};

export function TicketFrontContent({
  ticket,
  quote,
  className = "",
  largeHeadline = false,
}: TicketFrontContentProps) {
  const headline = ticket.artist.trim() || "가수명";
  const concertLine = ticket.concertName.trim() || "공연명";
  const dateLine = [ticket.date, ticket.day].filter(Boolean).join(" · ");

  return (
    <div className={`flex w-full flex-col items-center text-center ${className}`}>
      <p className="text-[2.7cqw] font-bold tracking-[0.01em]">{concertLine}</p>
      <p
        className={`mt-[1.6cqh] font-black leading-none ${
          largeHeadline ? "text-[10.2cqw]" : "text-[9.2cqw]"
        }`}
      >
        {headline}
      </p>
      {dateLine ? (
        <p
          className={`font-semibold ${largeHeadline ? "mt-[2.2cqh] text-[4.2cqw]" : "mt-[1.9cqh] text-[3.6cqw]"}`}
        >
          {dateLine}
        </p>
      ) : null}
      {ticket.venue ? (
        <p
          className={`font-semibold text-[#3c3c3c] ${
            largeHeadline ? "mt-[1.5cqh] text-[3.8cqw]" : "mt-[1.3cqh] text-[3.2cqw]"
          }`}
        >
          {ticket.venue}
        </p>
      ) : null}
      {quote ? (
        <p className="mt-[2.1cqh] w-[86%] whitespace-pre-wrap break-words text-[3.6cqw] font-semibold leading-[1.35]">
          {quote}
        </p>
      ) : null}
    </div>
  );
}
