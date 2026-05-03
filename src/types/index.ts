// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "organizer" | "admin";
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user?: User;
  tokens?: AuthTokens;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  id?: string;
  userId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "user" | "organizer";
}

// ─── Events ───────────────────────────────────────────────────────────────────

export type EventCategory =
  | "music"
  | "sports"
  | "technology"
  | "food"
  | "art"
  | "business"
  | "education"
  | "other";

export type EventStatus = "draft" | "upcoming" | "published" | "ongoing" | "cancelled" | "completed";

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  // Fields not returned by the BE API — optional for UI/dummy usage
  ticketTypes?: TicketType[];
  category?: EventCategory;
  address?: string;
  timezone?: string;
  posterImage?: string;
  bannerImage?: string;
  organizer?: User;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status?: string;
  // Optional fields not in BE
  currency?: string;
  saleStartDate?: string;
  saleEndDate?: string;
}

export interface Ticket {
  id: string;
  ticketTypeId: string;
  ticketType?: TicketType;
  userId: string;
  orderId: string;
  event?: Event;
  qrCode?: string;
  status: "active" | "used" | "cancelled" | "refunded";
  purchasedAt: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface OrderItem {
  ticketTypeId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  event?: Event;
  tickets: Ticket[];
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── API – matches BE Common.DTO response wrappers ───────────────────────────

export interface BaseResponse {
  isOk: boolean;
  errorMessage: string;
  message: string;
  anyChange: number;
  isRefresh: boolean;
}

export interface SearchColumn {
  field: string;
  label: string;
}

export interface DataResponse<T> extends BaseResponse {
  data: T;
}

export interface ListResponse<T> extends BaseResponse {
  list: T[];
  searchColumnList: SearchColumn[];
  recordCount: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ─── Filter / Query ───────────────────────────────────────────────────────────

export interface EventFilters {
  search?: string;
  category?: EventCategory;
  location?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ─── Organizer Dashboard DTOs ────────────────────────────────────────────────

export interface OrganizerDashboardSummaryDto {
  totalEvents: number;
  totalAttendees: number;
  ticketsSold: number;
  grossRevenue: number;
  currency: string;
}

export interface OrganizerDashboardEventDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatus;
  totalTickets: number;
  soldTickets: number;
  grossRevenue: number;
}

export interface OrganizerDashboardDto {
  summary: OrganizerDashboardSummaryDto;
  recentEvents: OrganizerDashboardEventDto[];
}

// ─── Organizer Event Write DTOs ─────────────────────────────────────────────

export interface UpsertEventTicketDto {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  totalSeats: number;
  availableSeats?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  status?: string;
}

export interface UpsertEventDto {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  address?: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  posterImage?: string;
  bannerImage?: string;
  status?: EventStatus;
}

export interface UpsertEventWithTicketsRequestDto {
  event: UpsertEventDto;
  ticketTypes: UpsertEventTicketDto[];
}

// ─── Checkout / Invoice ───────────────────────────────────────────────────────

export interface CheckoutItem {
  ticketTypeId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}

export interface CreateInvoiceRequestDto {
  eventId: string;
  items: { ticketTypeId: string; quantity: number }[];
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface InvoiceResponse {
  id: string;
  orderId?: string;
  externalId?: string;
  invoiceUrl: string;
  status: string;
  amount: number;
  currency: string;
  expiryDate?: string;
  payerEmail?: string;
}
