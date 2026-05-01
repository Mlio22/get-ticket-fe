// Auth service (port 5001 in Docker)
export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5001/api";

// EventManagement service (port 5002 in Docker)
export const EVENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_EVENT_API_URL || "http://localhost:5002/api";

// Default base URL kept pointing to auth for backwards compat (authStore uses it)
export const API_BASE_URL = AUTH_API_BASE_URL;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
} as const;

// Event endpoints — routes match EventController: api/[controller] = api/event
export const EVENT_ENDPOINTS = {
  LIST: "/event",
  DETAIL: (id: string) => `/event/${id}`,
  CREATE: "/event",
  UPDATE: (id: string) => `/event/${id}`,
  DELETE: (id: string) => `/event/${id}`,
} as const;

// Ticket type endpoints — TicketTypeController: api/tickettype
export const TICKET_TYPE_ENDPOINTS = {
  BY_EVENT: (eventId: string) => `/tickettype/event/${eventId}`,
  DETAIL: (id: string) => `/tickettype/${id}`,
  CREATE: "/tickettype",
  DELETE: (id: string) => `/tickettype/${id}`,
} as const;

// Ticket endpoints
export const TICKET_ENDPOINTS = {
  MY_TICKETS: "/tickets/me",
  DETAIL: (id: string) => `/tickets/${id}`,
} as const;

// Order endpoints
export const ORDER_ENDPOINTS = {
  CREATE: "/orders",
  LIST: "/orders/me",
  DETAIL: (id: string) => `/orders/${id}`,
  CANCEL: (id: string) => `/orders/${id}/cancel`,
} as const;
