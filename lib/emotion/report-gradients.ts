/** 감정 리포트 중앙 원 — 피그마 시안 기준 몽환적 3색 그라디언트 */
export const REPORT_EMOTION_GRADIENTS: Record<string, [string, string, string]> = {
  벅참: ["#FF9A9E", "#FECFEF", "#A1C4FD"],
  강렬: ["#FF7EB9", "#FFB8D9", "#C5A3FF"],
  행복: ["#FFC4D0", "#FFE8F0", "#C6F3E2"],
  신남: ["#FFC192", "#FFE4A8", "#FF9A62"],
  전율: ["#FFF6A3", "#FFE8B8", "#A0D9EF"],
  편안: ["#C6F3E2", "#E8FFF4", "#A1C4FD"],
  아련: ["#7DE2D1", "#B8F0E8", "#FECFEF"],
  뭉클: ["#A0D9EF", "#D4ECFA", "#FECFEF"],
  몽환: ["#C5A3FF", "#E8D4FF", "#A1C4FD"],
};

export const DEFAULT_REPORT_GRADIENT: [string, string, string] = [
  "#FF9A9E",
  "#FECFEF",
  "#A1C4FD",
];

export function buildReportCircleBackground(emotion: string): string {
  const [c0, c1, c2] =
    REPORT_EMOTION_GRADIENTS[emotion] ?? DEFAULT_REPORT_GRADIENT;

  return [
    `radial-gradient(circle at 28% 22%, ${c0} 0%, transparent 52%)`,
    `radial-gradient(circle at 72% 28%, ${c1} 0%, transparent 54%)`,
    `radial-gradient(circle at 50% 82%, ${c2} 0%, transparent 56%)`,
    `linear-gradient(155deg, ${c0} 0%, ${c1} 45%, ${c2} 100%)`,
  ].join(", ");
}
