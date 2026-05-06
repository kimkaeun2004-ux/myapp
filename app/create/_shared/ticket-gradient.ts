export const EMOTION_COLORS: Record<string, string> = {
  강렬: "#FF7EB9",
  행복: "#FFC4D0",
  벅참: "#FF8E9E",
  신남: "#FFC192",
  전율: "#FFF6A3",
  편안: "#C6F3E2",
  아련: "#7DE2D1",
  뭉클: "#A0D9EF",
  몽환: "#C5A3FF",
};

export function buildGradient(colors: string[]) {
  if (colors.length <= 1) {
    return `linear-gradient(145deg, ${colors[0]}, ${colors[0]})`;
  }

  if (colors.length === 2) {
    return `linear-gradient(145deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  }

  return `radial-gradient(circle at 20% 20%, ${colors[0]} 0%, transparent 45%), radial-gradient(circle at 80% 20%, ${colors[1]} 0%, transparent 45%), radial-gradient(circle at 50% 85%, ${colors[2]} 0%, transparent 48%), linear-gradient(150deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
}

export function gradientFromEmotionParam(emotionsParam: string | null) {
  const emotions = (emotionsParam ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);

  const colors =
    emotions.map((emotion) => EMOTION_COLORS[emotion]).filter(Boolean) || [];
  const gradientColors = colors.length > 0 ? colors : ["#FFC4D0", "#C6F3E2"];
  return buildGradient(gradientColors);
}
