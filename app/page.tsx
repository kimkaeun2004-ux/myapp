"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gradientFromEmotionParam } from "./create/_shared/ticket-gradient";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

type StoredTicket = {
  id?: number;
  emotions: string;
  quote: string;
  backImage: string;
};

const DUMMY_TICKETS: StoredTicket[] = [
  { id: 1, emotions: "행복,벅참", quote: "첫 번째 여운", backImage: "" },
  { id: 2, emotions: "아련,몽환", quote: "두 번째 여운", backImage: "" },
  { id: 3, emotions: "강렬,신남", quote: "세 번째 여운", backImage: "" },
  { id: 4, emotions: "편안,뭉클", quote: "네 번째 여운", backImage: "" },
];

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const parseTicket = (item: Partial<StoredTicket>, idx: number): StoredTicket => ({
      id: item.id ?? Date.now() - idx,
      emotions: item.emotions ?? "",
      quote: item.quote ?? "",
      backImage: item.backImage ?? "",
    });

    let list: StoredTicket[] = [];
    try {
      const rawList = window.localStorage.getItem("yeounTickets");
      if (rawList) {
        const parsed = JSON.parse(rawList) as Partial<StoredTicket>[];
        list = parsed
          .filter((item) => item && (item.emotions || item.quote || item.backImage))
          .map(parseTicket);
      }
    } catch {
      list = [];
    }

    try {
      const rawSingle = window.localStorage.getItem("yeounTicket");
      if (rawSingle) {
        const parsedSingle = JSON.parse(rawSingle) as Partial<StoredTicket>;
        if (parsedSingle && (parsedSingle.emotions || parsedSingle.quote || parsedSingle.backImage)) {
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
    } catch {
      // ignore malformed ticket
    }

    if (list.length > 0) {
      setTickets(list);
      window.localStorage.setItem("yeounTickets", JSON.stringify(list));
    } else {
      // 스와이프 UX 확인을 위한 더미 데이터
      setTickets(DUMMY_TICKETS);
    }
  }, []);

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

          <div className="mt-[5.2cqh] flex items-center gap-[2.1cqw] px-[6.2cqw]">
            <div className="flex h-[8.8cqw] w-[8.8cqw] items-center justify-center rounded-full bg-[#ece9df] text-[4.8cqw] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
              👤
            </div>
            <p className="text-[4.8cqw] font-bold tracking-[-0.02em]">게스트 님</p>
          </div>

          <button
            type="button"
            className="mx-auto mt-[3.2cqh] flex h-[min(80px,9dvh)] min-h-[56px] w-[84.6cqw] items-center justify-center rounded-[2.2cqw] border border-[#FDAFC7] bg-[#ffffff] text-[4.8cqw] font-extrabold tracking-[-0.02em] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99]"
          >
            감정 리포트 요약 보기
          </button>

          {hasTicket ? (
            <div className="mx-auto mt-[2.6cqh] w-[84.6cqw] [touch-action:pan-y]">
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
                              2025 DOYOUNG ENCORE CONCERT
                            </p>
                            <p className="mt-[1.6cqh] text-[9.2cqw] font-black leading-none">YOURS</p>
                            <p className="mt-[1.9cqh] text-[3.6cqw] font-semibold">
                              25 - 10 - 09 Thu
                            </p>
                            <p className="mt-[1.3cqh] text-[3.8cqw] font-extrabold tracking-[0.02em]">
                              DOYOUNG
                            </p>
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
            <section className="mx-auto mt-[2.6cqh] flex h-[min(430px,40dvh)] min-h-[270px] w-[84.6cqw] items-center justify-center rounded-[14px] border border-[#FDAFC7] bg-[#ffffff] px-[5.1cqw] text-center shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
              <p className="text-[5cqw] font-bold tracking-[-0.02em] text-[#3c3c3c]">
                첫 여운을 기록해보세요!
              </p>
            </section>
          )}

          <button
            type="button"
            onClick={() => router.push("/create/scan")}
            className="mx-auto mt-[2.4cqh] h-[min(100px,11dvh)] min-h-[60px] w-[84.6cqw] rounded-[2.2cqw] border border-[#FDAFC7] bg-[#FDAFC7] text-[4.8cqw] font-extrabold tracking-[-0.02em] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99]"
          >
            새로운 여운 기록하기
          </button>
        </section>
      </main>
    </div>
  );
}
