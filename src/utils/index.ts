export * from "./axios";
export * from "./currency";
export * from "./timezone";

/** Truncate a string to maxLen with an ellipsis. */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

/** Generate initials from a full name (e.g. "John Doe" → "JD"). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Safely extract an Axios/API error message. */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (err.response && typeof err.response === "object") {
      const response = err.response as Record<string, unknown>;
      if (response.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        if (typeof data.message === "string") return data.message;
      }
    }
    if (typeof err.message === "string") return err.message;
  }
  return "An unexpected error occurred.";
}

/** Build a query string from an object, omitting undefined/null values. */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      search.set(key, String(val));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
