export function formatUserName(
  user: { firstName?: string; lastName?: string } | null | undefined,
  fallback: string,
) {
  if (!user) {
    return fallback;
  }

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  if (name) {
    return name;
  }

  return fallback;
}
