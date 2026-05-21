"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { resolveAuthDisplayName, ensureLoggedIn } from "@/lib/auth/session";
import { loadUserProfile } from "@/lib/profile/user-profile";
import { deleteUserTicket, loadUserTickets } from "@/lib/tickets/user-tickets";
import type { StoredTicket } from "@/lib/tickets/storage";
import {
  YEOUN_AVATAR,
  YEOUN_BLOCK_GAP,
  YEOUN_BTN,
  YEOUN_CONTENT_W,
  YEOUN_SCREEN,
  YEOUN_SHELL_SECTION,
  YEOUN_TEXT,
  YEOUN_TICKET,
  yeounFont,
} from "@/lib/ui/yeoun-scale";
import {
  FlowButtonRow,
  FlowPrimaryHalf,
  FlowSecondaryHalf,
} from "../create/_shared/FlowButtons";
import { gradientFromEmotionParam } from "../create/_shared/ticket-gradient";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function MainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainContent />
    </Suspense>
  );
}

function MainContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("게스트");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    ticket: StoredTicket;
    idx: number;
  } | null>(null);
  const isDraggingRef = useRef(false);

  const ticketKey = (ticket: StoredTicket, idx: number) =>
    ticket.supabaseId ?? String(ticket.id ?? idx);

  const handleDeleteTicket = async (ticket: StoredTicket, idx: number) => {
    const key = ticketKey(ticket, idx);
    if (deletingId === key) return;
    setDeletingId(key);
    try {
      const next = await deleteUserTicket(ticket);
      setTickets(next);
      setActiveIndex((prev) => {
        if (next.length === 0) return 0;
        if (prev >= next.length) return next.length - 1;
        return prev;
      });
      setShowBack(false);
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const ok = await ensureLoggedIn(router.replace);
      if (!ok) return;

      const fallback = await resolveAuthDisplayName();
      const profile = await loadUserProfile(fallback);
      setUserName(profile.displayName);
      setAvatarUrl(profile.avatarUrl || null);
      setTickets(await loadUserTickets());
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 삭제 직후 router 참조 변경으로 목록이 되살아나는 것 방지
  }, []);

  useEffect(() => {
    if (pathname !== "/main") return;
    void loadUserTickets().then(setTickets);
  }, [pathname]);

  const currentTicket = tickets[activeIndex] ?? null;
  const hasTicket = !!currentTicket;
  const ticketBackground = currentTicket
    ? gradientFromEmotionParam(currentTicket.emotions || null)
    : undefined;

  return (
    <div className={YEOUN_SCREEN} style={yeounFont}>
      <main className="mx-auto flex h-full w-full items-center justify-center overflow-hidden">
        <section className={`${YEOUN_SHELL_SECTION} items-stretch`}>
          <h1 className={`mt-[5.4cqh] text-center ${YEOUN_TEXT.title}`}>홈</h1>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className={`mx-auto mt-[5.2cqh] flex ${YEOUN_CONTENT_W} items-center gap-[3cqw] text-left transition hover:opacity-90`}
          >
            <div className={YEOUN_AVATAR}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">🧸</span>
              )}
            </div>
            <p className={YEOUN_TEXT.title}>{userName} 님</p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/report")}
            className={`mx-auto ${YEOUN_BLOCK_GAP} ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#ffffff] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]`}
          >
            감정 리포트 요약 보기
          </button>

          {hasTicket ? (
            <div className={`mx-auto ${YEOUN_BLOCK_GAP} ${YEOUN_CONTENT_W} [touch-action:pan-y]`}>
              <Swiper
                slidesPerView={1}
                spaceBetween={0}
                speed={350}
                simulateTouch
                allowTouchMove
                grabCursor
                touchStartPreventDefault={false}
                onSlideChange={(swiper) => {
                  setActiveIndex(swiper.activeIndex);
                  setShowBack(false);
                }}
                onTouchMove={() => {
                  isDraggingRef.current = true;
                }}
                onTouchEnd={() => {
                  window.setTimeout(() => {
                    isDraggingRef.current = false;
                  }, 60);
                }}
                onSliderMove={() => {
                  isDraggingRef.current = true;
                }}
              >
                {tickets.map((ticket, idx) => {
                  const isBack = showBack && idx === activeIndex;
                  const bg = gradientFromEmotionParam(ticket.emotions || null);
                  return (
                    <SwiperSlide key={ticketKey(ticket, idx)}>
                      <div className="relative h-[min(430px,40dvh)] min-h-[270px] w-full">
                        <button
                          type="button"
                          aria-label="티켓 삭제"
                          disabled={deletingId === ticketKey(ticket, idx)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDelete({ ticket, idx });
                          }}
                          className={`absolute right-[2.4cqw] top-[2.4cqw] z-10 flex min-h-[32px] min-w-[32px] items-center justify-center p-[0.6cqw] text-[#FDAFC7]/40 transition-colors hover:text-[#FDAFC7] active:scale-95 disabled:opacity-30 ${YEOUN_TEXT.back}`}
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isDraggingRef.current) return;
                            if (idx !== activeIndex) return;
                            if (ticket.backImage) setShowBack((prev) => !prev);
                          }}
                          className={`flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[14px] border border-[#ece8e1] bg-white text-center shadow-[0_12px_24px_rgba(0,0,0,0.2)] ${
                            !isBack || !ticket.backImage ? "px-[6cqw]" : ""
                          }`}
                          style={!isBack ? { backgroundImage: bg } : undefined}
                        >
                        {!isBack || !ticket.backImage ? (
                          <div className="flex h-full w-full flex-col items-center justify-center">
                            <p className={YEOUN_TICKET.label}>
                              {ticket.concertName || "CONCERT"}
                            </p>
                            <p className={`mt-[1.6cqh] ${YEOUN_TICKET.headline}`}>
                              {ticket.artist || "ARTIST"}
                            </p>
                            {[ticket.date, ticket.day].filter(Boolean).length > 0 ? (
                              <p className={`mt-[1.9cqh] ${YEOUN_TICKET.meta}`}>
                                {[ticket.date, ticket.day].filter(Boolean).join(" · ")}
                              </p>
                            ) : null}
                            {ticket.venue ? (
                              <p className={`mt-[1.3cqh] ${YEOUN_TICKET.meta}`}>{ticket.venue}</p>
                            ) : null}
                            {ticket.quote ? (
                              <p
                                className={`mt-[2.1cqh] w-[86%] whitespace-pre-wrap break-words ${YEOUN_TICKET.quote}`}
                              >
                                {ticket.quote}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ticket.backImage}
                            alt="티켓 뒷면 이미지"
                            className="h-full w-full rounded-[14px] object-cover"
                          />
                        )}
                        </button>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          ) : (
            <section
              className={`mx-auto ${YEOUN_BLOCK_GAP} flex h-[min(430px,40dvh)] min-h-[270px] ${YEOUN_CONTENT_W} items-center justify-center rounded-[14px] border border-[#FDAFC7] bg-[#ffffff] px-[5.1cqw] text-center shadow-[0_12px_24px_rgba(0,0,0,0.08)]`}
            >
              <p className={`${YEOUN_TEXT.title} text-[#3c3c3c]`}>첫 여운을 기록해보세요!</p>
            </section>
          )}

          <button
            type="button"
            onClick={() => router.push("/create/scan")}
            className={`mx-auto ${YEOUN_BLOCK_GAP} ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#FDAFC7] text-[#131313] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99]`}
          >
            새로운 여운 기록하기
          </button>

          {pendingDelete ? (
            <div
              className="absolute inset-0 z-50 flex flex-col overflow-hidden bg-[#FFFFF5]/96"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-ticket-title"
            >
              <div className="flex flex-1 flex-col items-center justify-center px-[6.2cqw]">
                <p
                  id="delete-ticket-title"
                  className={`text-center ${YEOUN_TEXT.title} text-[#3c3c3c]`}
                >
                  해당 티켓을 삭제하겠습니까?
                </p>
              </div>
              <div className="shrink-0 pb-[4.8cqh]">
                <FlowButtonRow>
                  <FlowPrimaryHalf
                    type="button"
                    disabled={deletingId !== null}
                    onClick={() =>
                      void handleDeleteTicket(
                        pendingDelete.ticket,
                        pendingDelete.idx
                      )
                    }
                  >
                    삭제하기
                  </FlowPrimaryHalf>
                  <FlowSecondaryHalf
                    type="button"
                    disabled={deletingId !== null}
                    onClick={() => setPendingDelete(null)}
                  >
                    이전
                  </FlowSecondaryHalf>
                </FlowButtonRow>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
