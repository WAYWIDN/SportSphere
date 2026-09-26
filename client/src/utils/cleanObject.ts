/**
 * Generic helper function to filter out fields that have no value,
 * empty strings, null, undefined, 0, or NaN before sending to the backend.
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    const value = obj[key];

    // Filter out null or undefined
    if (value === null || value === undefined) {
      continue;
    }

    // Filter out empty or whitespace-only strings
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        cleaned[key] = trimmed;
      }
      continue;
    }

    // Filter out 0 or NaN for numbers
    if (typeof value === "number") {
      if (!Number.isNaN(value) && value !== 0) {
        cleaned[key] = value;
      }
      continue;
    }

    // Retain all other valid data types
    cleaned[key] = value;
  }

  return cleaned as Partial<T>;
}
