export const formatTimeInput = (timeMs: number): string => {
  const date = new Date(timeMs);

  // HH : MM
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};
