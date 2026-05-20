import type { CSSProperties } from "react";
import type { TicketRegistrationDraft } from "@/lib/ticket/types";
import {
  YEOUN_TICKET_CARD,
  YEOUN_TICKET_CARD_INNER,
  YEOUN_TICKET_SLOT,
} from "@/lib/ui/yeoun-scale";
import { TicketFrontContent } from "./TicketFrontContent";

type TicketPreviewProps = {
  ticket: Pick<TicketRegistrationDraft, "concertName" | "artist" | "date" | "day" | "venue">;
  quote?: string;
  className?: string;
  style?: CSSProperties;
};

export function TicketPreview({ ticket, quote, className = "", style }: TicketPreviewProps) {
  return (
    <div className={className ? `${YEOUN_TICKET_SLOT} ${className}` : YEOUN_TICKET_SLOT}>
      <section className={YEOUN_TICKET_CARD} style={style}>
        <div className={YEOUN_TICKET_CARD_INNER}>
          <TicketFrontContent ticket={ticket} quote={quote} />
        </div>
      </section>
    </div>
  );
}
