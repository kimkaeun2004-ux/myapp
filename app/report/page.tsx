"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureLoggedIn, resolveAuthDisplayName } from "@/lib/auth/session";
import { loadUserProfile } from "@/lib/profile/user-profile";
import { fetchReportTickets } from "@/lib/tickets/supabase-tickets";
import {
  computeEmotionReport,
  currentMonthNumber,
  type ReportTicketRecord,
} from "@/lib/emotion/compute-report";
import { buildReportCircleBackground } from "@/lib/emotion/report-gradients";
import {
  YEOUN_BLOCK_GAP,
  YEOUN_CONTENT_W,
  YEOUN_MUTED,
  YEOUN_SCREEN,
  YEOUN_SHELL_SECTION,
  YEOUN_TEXT,
  YEOUN_TICKET,
  yeounFont,
} from "@/lib/ui/yeoun-scale";

export default function EmotionReportPage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] bg-[#FFFFF5]" />}>
      <EmotionReportContent />
    </Suspense>
  );
}

function EmotionReportContent() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("게스트");
  const [tickets, setTickets] = useState<ReportTicketRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const ok = await ensureLoggedIn(router.replace);
      if (!ok) return;

      const fallback = await resolveAuthDisplayName();
      const profile = await loadUserProfile(fallback);
      setDisplayName(profile.displayName);

      try {
        const rows = await fetchReportTickets();
        setTickets(rows);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [router]);

  const month = useMemo(() => currentMonthNumber(), []);
  const report = useMemo(() => computeEmotionReport(tickets, month), [tickets, month]);

  const circleBackground = useMemo(
    () => buildReportCircleBackground(report.topEmotion),
    [report.topEmotion]
  );

  const subtitle = `${displayName}님의 기록 중 가장 큰 비중을 차지하는 여운이에요.`;
  const bottomText = report.isEmpty
    ? `${month}월은 아직 여운이 쌓이는 중이에요. 첫 티켓을 발행하면 감정 리포트가 채워져요.`
    : `${month}월은 ${report.topEmotion}이 흐르는 한 달이었네요!\n${report.latestConcertLabel}의 여운이 ${report.lingeringIndex}%나 차지하고 있어요.`;

  const topEmotionLabel = isLoading ? "…" : report.topEmotion;
  const indexLabel = isLoading ? "…" : `${report.lingeringIndex}%`;

  return (
    <div className={YEOUN_SCREEN} style={yeounFont}>
      <main className="mx-auto flex h-full w-full items-center justify-center overflow-hidden">
        <section className={`${YEOUN_SHELL_SECTION} overflow-hidden`}>
          <button
            type="button"
            onClick={() => router.push("/main")}
            className={`mt-[5.4cqh] px-[6.2cqw] text-left ${YEOUN_TEXT.back}`}
            aria-label="뒤로"
          >
            ‹
          </button>

          <h1 className={`mt-[5.2cqh] text-center ${YEOUN_TEXT.title}`}>감정 리포트</h1>

          <p className={`mx-auto ${YEOUN_CONTENT_W} px-[2cqw] text-center ${YEOUN_MUTED} ${YEOUN_BLOCK_GAP}`}>
            {subtitle}
          </p>

          <div className={`mx-auto flex ${YEOUN_CONTENT_W} ${YEOUN_BLOCK_GAP} justify-center`}>
            <div
              className="flex aspect-square w-[min(68cqw,36dvh)] max-h-[min(430px,40dvh)] max-w-[min(430px,40dvh)] flex-col items-center justify-center rounded-full px-[5.5cqw] text-center shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
              style={{ backgroundImage: circleBackground }}
            >
              <p className={YEOUN_TICKET.label}>
                가장 많이 느낀 감정 : [{topEmotionLabel}]
              </p>
              <p className={`mt-[1.9cqh] ${YEOUN_TICKET.meta}`}>누적 여운 지수 : {indexLabel}</p>
            </div>
          </div>

          <section
            className={`mx-auto ${YEOUN_BLOCK_GAP} mb-[5.4cqh] ${YEOUN_CONTENT_W} rounded-[2.4cqw] border border-[#FDAFC7] bg-[#FDAFC7] px-[4.5cqw] py-[2.6cqh] text-center text-[#131313] shadow-[0_8px_24px_rgba(253,175,199,0.55)]`}
          >
            <p className={`whitespace-pre-line ${YEOUN_TEXT.body}`}>
              {isLoading ? "리포트를 만들고 있어요..." : bottomText}
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}
