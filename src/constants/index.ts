export * from "./api";
export * from "./routes";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GetTicket";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const EVENT_CATEGORIES = [
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
  { value: "food", label: "Food & Drink" },
  { value: "art", label: "Art & Culture" },
  { value: "business", label: "Business" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
] as const;

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  published: "Published",
  ongoing: "Ongoing",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Payment",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const TICKET_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  used: "Used",
  expired: "Expired",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_TIMEZONE = "Asia/Jakarta";
export const TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (GMT+7)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (GMT+8)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (GMT+9)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "UTC", label: "UTC (GMT+0)" },
] as const;

export const DEFAULT_EVENT_POSTER_IMAGE =
  "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80";
export const DEFAULT_EVENT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80";

// NOTE: These can be replaced by DB-driven tables/API in the future.
export const TIME_SLOT_OPTIONS = Array.from({ length: 24 * 6 }, (_, i) => {
  const minutes = i * 10;
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  const value = `${hh}:${mm}`;
  return { value, label: value };
});

export const CURRENCY_OPTIONS = [
  { value: "IDR", label: "Indonesian Rupiah (IDR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "SGD", label: "Singapore Dollar (SGD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
] as const;
