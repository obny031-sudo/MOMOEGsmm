export function translate(
  dict: Record<string, unknown>,
  key: string,
  fallback?: string
): string {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return fallback ?? key;
    }
  }
  return typeof cur === "string" ? cur : fallback ?? key;
}
