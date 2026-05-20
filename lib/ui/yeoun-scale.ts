/** YEOUN 메인 홈(/) · 티켓 발행 플로우 공통 레이아웃·타이포 */
export const YEOUN_SHELL_SECTION =
  "relative flex w-[min(38vw,60dvh)] aspect-[520/860] min-w-[320px] max-w-[420px] flex-col bg-[#FFFFF5] [container-type:size]";

export const YEOUN_SCREEN =
  "h-[100dvh] overflow-hidden bg-[#FFFFF5] text-[#131313]";

export const yeounFont = { fontFamily: "Inter, sans-serif" } as const;

export const YEOUN_TEXT = {
  brand: "text-[20.5cqw] font-black leading-none tracking-[-0.03em] text-[#F3B4C8]",
  title: "text-[3.3cqw] font-bold tracking-[-0.02em]",
  body: "text-[2.55cqw] font-bold tracking-[-0.01em]",
  bodyMedium: "text-[2.55cqw] font-medium tracking-[-0.01em]",
  back: "text-[3.6cqw] font-semibold leading-none text-[#F3B4C8]",
} as const;

export const YEOUN_BTN =
  "flex h-[min(66px,7.2dvh)] min-h-[46px] items-center justify-center rounded-[2cqw] border text-[2.55cqw] font-bold tracking-[-0.01em]";

export const YEOUN_CONTENT_W = "w-[78cqw]";
export const YEOUN_BLOCK_GAP = "mt-[3.2cqh]";

export const YEOUN_AVATAR =
  "flex h-[16cqw] w-[16cqw] shrink-0 items-center justify-center overflow-hidden rounded-[2cqw] bg-[#ece9df] text-[3.3cqw] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]";

/** 메인 홈 CTA — 새로운 여운 기록하기 */
export const YEOUN_HOME_CTA = `mx-auto block ${YEOUN_BLOCK_GAP} ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#FDAFC7] text-[#131313] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

/** 메인 홈 보조 버튼 — 감정 리포트 요약 보기 */
export const YEOUN_HOME_BTN_OUTLINE = `mx-auto block ${YEOUN_BLOCK_GAP} ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#ffffff] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

export const YEOUN_HOME_BTN_ROW = `mx-auto flex ${YEOUN_CONTENT_W} ${YEOUN_BLOCK_GAP} items-stretch justify-between gap-[2.4cqw]`;

export const YEOUN_HOME_BTN_HALF_PRIMARY = `${YEOUN_BTN} w-[calc(50%-1.2cqw)] shrink-0 border-[#FDAFC7] bg-[#FDAFC7] text-[#131313] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

export const YEOUN_HOME_BTN_HALF_SECONDARY = `${YEOUN_BTN} w-[calc(50%-1.2cqw)] shrink-0 border-[#FDAFC7] bg-[#ffffff] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

export const YEOUN_TICKET = {
  label: "text-[2.55cqw] font-bold tracking-[0.01em]",
  headline: "text-[3.3cqw] font-black leading-none",
  meta: "text-[2.55cqw] font-semibold",
  quote: "text-[2.55cqw] font-semibold leading-[1.35] tracking-[0.01em]",
} as const;

export const YEOUN_TICKET_SLOT = `mx-auto ${YEOUN_BLOCK_GAP} ${YEOUN_CONTENT_W}`;

export const YEOUN_TICKET_CARD =
  "flex h-[min(430px,40dvh)] min-h-[270px] w-full flex-col items-center justify-center overflow-hidden rounded-[14px] border border-[#ece8e1] bg-white text-center shadow-[0_12px_24px_rgba(0,0,0,0.2)]";

export const YEOUN_TICKET_CARD_INNER =
  "flex h-full w-full flex-col items-center justify-center px-[6cqw]";

/** 티켓 카드 안 정보 입력 (스크롤 없음, 홈 티켓과 동일 크기) */
export const YEOUN_TICKET_FORM_CARD = `${YEOUN_TICKET_CARD} items-stretch justify-start px-[4.2cqw] py-[2.4cqh] text-left`;

export const YEOUN_CONFIRM_LABEL = "text-[2.2cqw] font-bold text-[#3c3c3c]";

export const YEOUN_CONFIRM_INPUT =
  "mt-1 h-[min(36px,3.9dvh)] min-h-[30px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-[#fffdfd] px-[2.4cqw] text-[2.2cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]";

export const YEOUN_MUTED = `${YEOUN_TEXT.bodyMedium} text-[#7a7a76]`;

export const YEOUN_BADGE_AUTO = `ml-1 ${YEOUN_TEXT.bodyMedium} text-[#FDAFC7]`;

/** @deprecated — YEOUN_HOME_* 사용 */
export const YEOUN_FLOW_ACTIONS = YEOUN_HOME_BTN_ROW;
export const YEOUN_FLOW_BTN_PRIMARY = YEOUN_HOME_BTN_HALF_PRIMARY;
export const YEOUN_FLOW_BTN_SECONDARY = YEOUN_HOME_BTN_HALF_SECONDARY;
export const YEOUN_FLOW_BTN_SINGLE = YEOUN_HOME_CTA;
export const YEOUN_FLOW_BTN_WIDE = YEOUN_HOME_CTA;
export const YEOUN_FLOW_CLOSE = `ml-auto block px-[6.2cqw] pt-[5.4cqh] text-right ${YEOUN_TEXT.back} transition hover:opacity-80`;
export const YEOUN_LABEL = YEOUN_CONFIRM_LABEL;
export const YEOUN_INPUT = YEOUN_CONFIRM_INPUT;
export const YEOUN_TICKET_FORM_CARD_LEGACY = YEOUN_TICKET_FORM_CARD;
