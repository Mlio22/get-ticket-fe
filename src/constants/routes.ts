// Public routes (accessible without auth)
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  EVENTS: "/events",
  EVENT_DETAIL: (id: string) => `/events/${id}`,
} as const;

// Authenticated user routes
export const USER_ROUTES = {
  DASHBOARD: "/dashboard",
  MY_TICKETS: "/dashboard/tickets",
  MY_ORDERS: "/dashboard/orders",
  PROFILE: "/dashboard/profile",
} as const;

// Event organizer routes
export const ORGANIZER_ROUTES = {
  DASHBOARD: "/organizer",
  EVENTS: "/organizer/events",
  CREATE_EVENT: "/organizer/events/create",
  EDIT_EVENT: (id: string) => `/organizer/events/${id}/edit`,
  EVENT_ATTENDEES: (id: string) => `/organizer/events/${id}/attendees`,
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin",
  USERS: "/admin/users",
  EVENTS: "/admin/events",
} as const;

// Auth-protected routes – users who are not logged in get redirected to /login
export const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/organizer", "/admin"];

// Routes only for unauthenticated users (redirect to home if logged in)
export const GUEST_ONLY_ROUTES = [PUBLIC_ROUTES.LOGIN, PUBLIC_ROUTES.REGISTER];
