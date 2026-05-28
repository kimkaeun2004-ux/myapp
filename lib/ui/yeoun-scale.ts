/** YEOUN 메인 홈(/) · 티켓 발행 플로우 공통 레이아웃·타이포 */

/** 모바일: 화면 전체 / 웹(md+): 앱 창 테두리·그림자 */
export const YEOUN_SCREEN =
  "flex h-[100dvh] w-full min-h-[100dvh] flex-col overflow-hidden bg-[#FFFFF5] text-[#131313] max-md:max-w-none md:h-[min(100dvh-48px,900px)] md:min-h-[680px] md:max-h-[900px] md:max-w-[420px] md:flex-none md:rounded-[24px] md:border md:border-[#E8C4D4] md:shadow-[0_24px_64px_rgba(43,24,36,0.12),0_0_0_1px_rgba(243,180,200,0.4)]";

/** 모바일: 꽉 참 / 웹: 기존 폰 비율 카드 */
export const YEOUN_SHELL_SECTION =
  "relative flex w-full min-w-0 max-w-none flex-1 flex-col bg-[#FFFFF5] [container-type:size] max-md:h-full max-md:min-h-0 md:w-[min(100%,420px)] md:max-w-[420px] md:min-w-[320px] md:flex-none md:aspect-[520/860] md:h-auto";

export const YEOUN_PAGE_MAIN =
  "mx-auto flex h-full min-h-0 w-full flex-1 flex-col items-stretch overflow-hidden max-md:justify-stretch md:items-center md:justify-center";

export const yeounFont = { fontFamily: "Inter, sans-serif" } as const;

export const YEOUN_TEXT = {
  brand: "text-[24cqw] font-black leading-none tracking-[-0.03em] text-[#F3B4C8]",
  /** 메인 홈 상단 로고 — 로그인 brand보다 작게 */
  brandHome: "text-[8.5cqw] font-black leading-none tracking-[-0.03em] text-[#F3B4C8]",
  title: "text-[4cqw] font-bold tracking-[-0.02em]",
  body: "text-[3.1cqw] font-bold tracking-[-0.01em]",
  bodyMedium: "text-[3.1cqw] font-medium tracking-[-0.01em]",
  back: "text-[4.3cqw] font-semibold leading-none text-[#F3B4C8]",
  /** 상단 뒤로가기 ‹ */
  backNav: "text-[7.2cqw] font-semibold leading-none text-[#F3B4C8]",
  /** 플로우 닫기 × */
  closeNav: "text-[5.8cqw] font-semibold leading-none text-[#F3B4C8]",
} as const;

const yeounNavBackBase = `inline-flex min-h-[56px] min-w-[56px] items-center justify-center ${YEOUN_TEXT.backNav} transition hover:opacity-80 active:scale-95`;

/** 이메일 로그인 — 좌상단 절대 위치 */
export const YEOUN_NAV_BACK_EMAIL = `absolute left-[6cqw] top-[6cqh] z-10 ${yeounNavBackBase}`;

/** 프로필·리포트 — 상단 좌측 (기존 mt/px와 동일한 시각 위치) */
export const YEOUN_NAV_BACK_PAGE = `absolute left-0 top-[5.4cqh] z-10 px-[6.2cqw] text-left ${yeounNavBackBase}`;

/** × 닫기 — 새 여운 기록 플로우 */
export const YEOUN_NAV_CLOSE_BTN = `inline-flex min-h-[48px] min-w-[48px] items-center justify-center ${YEOUN_TEXT.closeNav} transition hover:opacity-80 active:scale-95`;

export const YEOUN_BTN =
  "flex h-[min(72px,7.8dvh)] min-h-[52px] items-center justify-center rounded-[2cqw] border text-[3.1cqw] font-bold tracking-[-0.01em]";

export const YEOUN_CONTENT_W = "w-[78cqw]";
export const YEOUN_BLOCK_GAP = "mt-[3.2cqh]";

export const YEOUN_AVATAR =
  "flex h-[16cqw] w-[16cqw] shrink-0 items-center justify-center overflow-hidden rounded-[2cqw] bg-[#ece9df] text-[4cqw] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]";

/** 메인 홈 CTA — 새로운 여운 기록하기 (기본 버튼보다 글자 크게) */
export const YEOUN_HOME_CTA = `mx-auto block ${YEOUN_BLOCK_GAP} flex h-[min(72px,7.8dvh)] min-h-[52px] ${YEOUN_CONTENT_W} items-center justify-center rounded-[2cqw] border border-[#FDAFC7] bg-[#FDAFC7] text-[3.9cqw] font-bold tracking-[-0.01em] text-[#131313] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

/** 메인 홈 로그아웃 — 배경과 비슷하게, 글자는 또렷하게 */
export const YEOUN_HOME_LOGOUT = `mx-auto block ${YEOUN_BLOCK_GAP} ${YEOUN_CONTENT_W} w-full bg-transparent py-[1.2cqh] text-center text-[3.1cqw] font-semibold tracking-[-0.01em] text-[#7a5c68] underline decoration-[#d4a8b8] decoration-1 underline-offset-[0.35em] transition hover:text-[#5c3f4a] hover:decoration-[#c892a6] active:opacity-75 disabled:opacity-50`;

/** 메인 홈 보조 버튼 — 감정 리포트 요약 보기 */
export const YEOUN_HOME_BTN_OUTLINE = `mx-auto block ${YEOUN_BLOCK_GAP} ${YEOUN_BTN} ${YEOUN_CONTENT_W} border-[#FDAFC7] bg-[#ffffff] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

export const YEOUN_HOME_BTN_ROW = `mx-auto flex ${YEOUN_CONTENT_W} ${YEOUN_BLOCK_GAP} items-stretch justify-between gap-[2.4cqw]`;

export const YEOUN_HOME_BTN_HALF_PRIMARY = `${YEOUN_BTN} w-[calc(50%-1.2cqw)] shrink-0 border-[#FDAFC7] bg-[#FDAFC7] text-[#131313] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-[#f99fbe] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

export const YEOUN_HOME_BTN_HALF_SECONDARY = `${YEOUN_BTN} w-[calc(50%-1.2cqw)] shrink-0 border-[#FDAFC7] bg-[#ffffff] text-[#3c3c3c] transition hover:bg-[#fffcef] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50`;

export const YEOUN_TICKET = {
  label: "text-[3.1cqw] font-bold tracking-[0.01em]",
  headline: "text-[4cqw] font-black leading-none",
  meta: "text-[3.1cqw] font-semibold",
  quote: "text-[3.1cqw] font-semibold leading-[1.35] tracking-[0.01em]",
} as const;

export const YEOUN_TICKET_SLOT = `mx-auto ${YEOUN_BLOCK_GAP} ${YEOUN_CONTENT_W}`;

export const YEOUN_TICKET_CARD =
  "flex h-[min(430px,40dvh)] min-h-[270px] w-full flex-col items-center justify-center overflow-hidden rounded-[14px] border border-[#ece8e1] bg-white text-center shadow-[0_12px_24px_rgba(0,0,0,0.2)]";

export const YEOUN_TICKET_CARD_INNER =
  "flex h-full w-full flex-col items-center justify-center px-[6cqw]";

/** 티켓 카드 안 정보 입력 (스크롤 없음, 홈 티켓과 동일 크기) */
export const YEOUN_TICKET_FORM_CARD = `${YEOUN_TICKET_CARD} items-stretch justify-start px-[4.2cqw] py-[2.4cqh] text-left`;

export const YEOUN_CONFIRM_LABEL = "text-[2.7cqw] font-bold text-[#3c3c3c]";

export const YEOUN_CONFIRM_INPUT =
  "mt-1 h-[min(42px,4.5dvh)] min-h-[36px] w-full rounded-[2cqw] border border-[#F3B4C8] bg-[#fffdfd] px-[2.4cqw] text-[2.7cqw] font-medium outline-none focus:ring-2 focus:ring-[#FDAFC7]";

export const YEOUN_MUTED = `${YEOUN_TEXT.bodyMedium} text-[#7a7a76]`;

export const YEOUN_BADGE_AUTO = `ml-1 ${YEOUN_TEXT.bodyMedium} text-[#FDAFC7]`;

/** @deprecated — YEOUN_HOME_* 사용 */
export const YEOUN_FLOW_ACTIONS = YEOUN_HOME_BTN_ROW;
export const YEOUN_FLOW_BTN_PRIMARY = YEOUN_HOME_BTN_HALF_PRIMARY;
export const YEOUN_FLOW_BTN_SECONDARY = YEOUN_HOME_BTN_HALF_SECONDARY;
export const YEOUN_FLOW_BTN_SINGLE = YEOUN_HOME_CTA;
export const YEOUN_FLOW_BTN_WIDE = YEOUN_HOME_CTA;
export const YEOUN_FLOW_CLOSE = `ml-auto block px-[6.2cqw] pt-[5.4cqh] pr-[3.6cqw] text-right ${YEOUN_TEXT.closeNav} transition hover:opacity-80`;
export const YEOUN_LABEL = YEOUN_CONFIRM_LABEL;
export const YEOUN_INPUT = YEOUN_CONFIRM_INPUT;
export const YEOUN_TICKET_FORM_CARD_LEGACY = YEOUN_TICKET_FORM_CARD;
