import { ADMIN_ROUTES, ORGANIZER_ROUTES, PUBLIC_ROUTES, USER_ROUTES } from "@/constants/routes";

export type RouteItem = {
  label: string;
  href: string;
  icon?: string;
  children?: RouteItem[];
};

// Navigation items for the public top navbar
export const PUBLIC_NAV_ROUTES: RouteItem[] = [
  { label: "Home", href: PUBLIC_ROUTES.HOME },
  { label: "Events", href: PUBLIC_ROUTES.EVENTS },
];

// Sidebar navigation for authenticated users
export const USER_NAV_ROUTES: RouteItem[] = [
  { label: "Dashboard", href: USER_ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "My Tickets", href: USER_ROUTES.MY_TICKETS, icon: "Ticket" },
  { label: "My Orders", href: USER_ROUTES.MY_ORDERS, icon: "ShoppingBag" },
  { label: "Profile", href: USER_ROUTES.PROFILE, icon: "User" },
];

// Sidebar navigation for organizers
export const ORGANIZER_NAV_ROUTES: RouteItem[] = [
  { label: "Dashboard", href: ORGANIZER_ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "My Events", href: ORGANIZER_ROUTES.EVENTS, icon: "Calendar" },
  { label: "Create Event", href: ORGANIZER_ROUTES.CREATE_EVENT, icon: "PlusCircle" },
];

// Sidebar navigation for admins
export const ADMIN_NAV_ROUTES: RouteItem[] = [
  { label: "Dashboard", href: ADMIN_ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Users", href: ADMIN_ROUTES.USERS, icon: "Users" },
  { label: "Events", href: ADMIN_ROUTES.EVENTS, icon: "Calendar" },
];
