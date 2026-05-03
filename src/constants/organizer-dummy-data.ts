import type { OrganizerDashboardDto, UpsertEventWithTicketsRequestDto } from "@/types";

// Dummy payload for /organizer dashboard.
// This mirrors the DTO shape expected from backend.
export const ORGANIZER_DASHBOARD_DUMMY: OrganizerDashboardDto = {
  summary: {
    totalEvents: 6,
    totalAttendees: 1843,
    ticketsSold: 3270,
    grossRevenue: 785000000,
    currency: "IDR",
  },
  recentEvents: [
    {
      id: "evt-org-001",
      title: "Jakarta Jazz Festival 2026",
      startDate: "2026-06-14T18:00:00.000Z",
      endDate: "2026-06-16T23:00:00.000Z",
      location: "Ancol Beach City, Jakarta",
      status: "published",
      totalTickets: 2200,
      soldTickets: 1346,
      grossRevenue: 412000000,
    },
    {
      id: "evt-org-002",
      title: "Bali Food & Culture Festival",
      startDate: "2026-08-22T10:00:00.000Z",
      endDate: "2026-08-23T22:00:00.000Z",
      location: "Renon Park, Denpasar",
      status: "published",
      totalTickets: 2000,
      soldTickets: 1020,
      grossRevenue: 96500000,
    },
    {
      id: "evt-org-003",
      title: "Startup Growth Summit 2026",
      startDate: "2026-09-10T08:00:00.000Z",
      endDate: "2026-09-11T18:00:00.000Z",
      location: "Jakarta Convention Center",
      status: "draft",
      totalTickets: 350,
      soldTickets: 0,
      grossRevenue: 0,
    },
  ],
};

// Sample single-request payload for create/update event + ticket details.
export const ORGANIZER_EVENT_UPSERT_SAMPLE: UpsertEventWithTicketsRequestDto = {
  event: {
    title: "Jakarta Jazz Festival 2026",
    description:
      "The biggest jazz festival in Southeast Asia returns for its 20th edition.",
    category: "music",
    location: "Ancol Beach City, Jakarta",
    address: "Jl. Lodan Timur No. 7, Ancol, Jakarta Utara",
    startDate: "2026-06-14T18:00:00.000Z",
    endDate: "2026-06-16T23:00:00.000Z",
    timezone: "Asia/Jakarta",
    posterImage: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
    bannerImage: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80",
    status: "published",
  },
  ticketTypes: [
    {
      name: "General Admission",
      description: "Standard entry",
      price: 350000,
      currency: "IDR",
      totalSeats: 2000,
      availableSeats: 2000,
      saleStartDate: "2026-05-01T00:00:00.000Z",
      saleEndDate: "2026-06-14T15:00:00.000Z",
      status: "active",
    },
    {
      name: "VIP Pass",
      description: "Front-stage access, exclusive lounge, complimentary drinks",
      price: 950000,
      currency: "IDR",
      totalSeats: 200,
      availableSeats: 200,
      saleStartDate: "2026-05-01T00:00:00.000Z",
      saleEndDate: "2026-06-14T15:00:00.000Z",
      status: "active",
    },
  ],
};
