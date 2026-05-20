"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveAuthDisplayName, ensureLoggedIn } from "@/lib/auth/session";
import { loadUserProfile } from "@/lib/profile/storage";
import { loadStoredTickets, type StoredTicket } from "@/lib/tickets/storage";
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
  const [userName, setUserName] = useState("게스트");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const ok = await ensureLoggedIn(router.replace);
      if (!ok) return;

      const fallback = await resolveAuthDisplayName();
      const profile = loadUserProfile(fallback);
      setUserName(profile.displayName);
      setAvatarUrl(profile.avatarUrl || null);
      setTickets(loadStoredTickets());
    };

    void init();
  }, [router]);

  const currentTicket = tickets[activeIndex] ?? null;
  const hasTicket = !!currentTicket;
  const ticketBackground = currentTicket
    ? gradientFromEmotionParam(currentTicket.emotions || null)
    : undefined;

  return (
    <div
      className="h-[100dvh] overflow-hidden bg-[#FFFFF5] text-[#131313]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto flex h-full w-full items-center justify-center overflow-hidden">
        <section className="relative flex w-[min(38vw,60dvh)] aspect-[520/860] min-w-[320px] max-w-[420px] flex-col bg-[#FFFFF5] [container-type:size]">
          <h1 className="mt-[5.4cqh] text-center text-[4cqw] font-bold">홈</h1>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="mt-[5.2cqh] flex w-full items-center gap-[2.1cqw] px-[6.2cqw] text-left transition hover:opacity-90"
          >
            <div className="flex h-[22cqw] w-[22cqw] shrink-0 items-center justify-center overflow-hidden rounded-[2.2cqw] bg-[#ece9df] text-[10cqw] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>🧸</span>
              )}
            </div>
            <p className="text-[4.8cqw] font-bold tracking-[-0.02em]">{userName} 님</p>
          </button>

          <button
            type="button"
            className="mx-auto mt-[3.2cqh] flex h-[min(80px,9dvh)] min-h-[56px] w-[84.6cqw] items-center justify-center rounded-[2.2cqw] border border-[#FDAFC7] bg-[#ffffff] text-[4.8cqw] font-extrabold tracking-[-0.02em] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]"
          >
            감정 리포트 요약 보기
          </button>

          {hasTicket ? (
            <div className="mx-auto mt-[3.2cqh] w-[84.6cqw] [touch-action:pan-y]">
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
                    <SwiperSlide key={ticket.id ?? idx}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isDraggingRef.current) return;
                          if (idx !== activeIndex) return;
                          if (ticket.backImage) setShowBack((prev) => !prev);
                        }}
                        className={`flex h-[min(430px,40dvh)] min-h-[270px] w-full flex-col items-center justify-center overflow-hidden rounded-[14px] border border-[#ece8e1] bg-white text-center shadow-[0_12px_24px_rgba(0,0,0,0.2)] ${
                          !isBack || !ticket.backImage ? "px-[6cqw]" : ""
                        }`}
                        style={!isBack ? { backgroundImage: bg } : undefined}
                      >
                        {!isBack || !ticket.backImage ? (
                          <div className="flex h-full w-full flex-col items-center justify-center">
                            <p className="text-[2.7cqw] font-bold tracking-[0.01em]">
                              {ticket.concertName || "CONCERT"}
                            </p>
                            <p className="mt-[1.6cqh] text-[9.2cqw] font-black leading-none">
                              {ticket.artist || "ARTIST"}
                            </p>
                            {[ticket.date, ticket.day].filter(Boolean).length > 0 ? (
                              <p className="mt-[1.9cqh] text-[3.6cqw] font-semibold">
                                {[ticket.date, ticket.day].filter(Boolean).join(" · ")}
                              </p>
                            ) : null}
                            {ticket.venue ? (
                              <p className="mt-[1.3cqh] text-[3.2cqw] font-semibold">{ticket.venue}</p>
                            ) : null}
                            {ticket.quote ? (
                              <p className="mt-[2.1cqh] w-[86%] whitespace-pre-wrap break-words text-[3.6cqw] font-semibold leading-[1.35] tracking-[0.01em]">
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
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          ) : (
            <section className="mx-auto mt-[3.2cqh] flex h-[min(430px,40dvh)] min-h-[270px] w-[84.6cqw] items-center justify-center rounded-[14px] border border-[#FDAFC7] bg-[#ffffff] px-[5.1cqw] text-center shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
              <p className="text-[5cqw] font-bold tracking-[-0.02em] text-[#3c3c3c]">
                첫 여운을 기록해보세요!
              </p>
            </section>
          )}

          <button
            type="button"
            onClick={() => router.push("/create/scan")}
            className="mx-auto mt-[3.2cqh] h-[min(100px,11dvh)] min-h-[60px] w-[84.6cqw] rounded-[2.2cqw] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.8cqw] font-extrabold tracking-[-0.02em] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99]"
          >
            새로운 여운 기록하기
          </button>
        </section>
      </main>
    </div>
  );
}
