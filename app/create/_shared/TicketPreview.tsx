import type { TicketRegistrationDraft } from "@/lib/ticket/types";
import { TicketFrontContent } from "./TicketFrontContent";

type TicketPreviewProps = {
  ticket: Pick<TicketRegistrationDraft, "concertName" | "artist" | "date" | "day" | "venue">;
  quote?: string;
  className?: string;
};

export function TicketPreview({ ticket, quote, className = "" }: TicketPreviewProps) {
  return (
    <section
      className={`mx-auto flex h-[min(430px,40dvh)] w-full flex-col items-center justify-center rounded-[14px] border border-[#ece8e1] bg-white px-[6cqw] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] ${className}`}
    >
      <TicketFrontContent ticket={ticket} quote={quote} />
    </section>
  );
}
