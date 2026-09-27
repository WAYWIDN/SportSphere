export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    const value = obj[key];

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        cleaned[key] = trimmed;
      }
      continue;
    }

    if (typeof value === "number") {
      if (!Number.isNaN(value) && value !== 0) {
        cleaned[key] = value;
      }
      continue;
    }

    cleaned[key] = value;
  }

  return cleaned as Partial<T>;
}
