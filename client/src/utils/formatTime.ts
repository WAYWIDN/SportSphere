export const formatTimeInput = (timeMs: number): string => {
  const date = new Date(timeMs);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

export function formatTimeEpoch(epochMs: number): string {
  if (!epochMs) {
    return "--:--";
  }

  const date = new Date(epochMs);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
