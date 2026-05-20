"use client";

import { loadTicketDraft } from "@/lib/ticket/draft-storage";
import { EMPTY_TICKET_DRAFT, type TicketRegistrationDraft } from "@/lib/ticket/types";
import { useEffect, useState } from "react";

export function useTicketRegistration() {
  const [registration, setRegistration] =
    useState<TicketRegistrationDraft>(EMPTY_TICKET_DRAFT);

  useEffect(() => {
    setRegistration(loadTicketDraft());
  }, []);

  return registration;
}
