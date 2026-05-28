"use client";

import {
  YEOUN_BLOCK_GAP,
  YEOUN_MUTED,
  YEOUN_PAGE_MAIN,
  YEOUN_SCREEN,
  YEOUN_SHELL_SECTION,
  YEOUN_NAV_CLOSE_BTN,
  YEOUN_TEXT,
  yeounFont,
} from "@/lib/ui/yeoun-scale";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type CreateFlowShellProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/** 메인 홈과 동일한 프레임 — 고정 비율, 스크롤 없음 */
export function CreateFlowShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: CreateFlowShellProps) {
  const router = useRouter();
  const handleClose = onClose ?? (() => router.push("/main"));

  return (
    <div className={YEOUN_SCREEN} style={yeounFont}>
      <main className={YEOUN_PAGE_MAIN}>
        <section className={`${YEOUN_SHELL_SECTION} overflow-hidden`}>
          <div className="relative shrink-0 px-[6.2cqw] pt-[5.4cqh]">
            <div className="flex justify-end pr-[3.6cqw]">
              <button
                type="button"
                onClick={handleClose}
                className={YEOUN_NAV_CLOSE_BTN}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <h1 className={`mt-[0.8cqh] text-center ${YEOUN_TEXT.title}`}>{title}</h1>
            {subtitle ? (
              <p className={`mt-[1.6cqh] text-center ${YEOUN_MUTED}`}>{subtitle}</p>
            ) : null}
          </div>

          {children}

          {footer ? <div className="shrink-0 pb-[4.8cqh]">{footer}</div> : null}
        </section>
      </main>
    </div>
  );
}
