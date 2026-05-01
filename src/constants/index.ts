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
  published: "Published",
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
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_TIMEZONE = "Asia/Jakarta";
