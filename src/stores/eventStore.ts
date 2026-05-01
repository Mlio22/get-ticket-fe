import { EVENT_ENDPOINTS, TICKET_TYPE_ENDPOINTS } from "@/constants/api";
import type { DataResponse, Event, EventFilters, ListResponse, TicketType } from "@/types";
import { buildQueryString } from "@/utils";
import { eventApiClient } from "@/utils/axios";
import { create } from "zustand";

interface EventState {
  events: Event[];
  featuredEvents: Event[];
  selectedEvent: Event | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;

  fetchEvents: (filters?: EventFilters) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  setFilters: (filters: Partial<EventFilters>) => void;
  resetFilters: () => void;
  clearSelectedEvent: () => void;
}

const DEFAULT_FILTERS: EventFilters = { page: 1, limit: 12 };

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  featuredEvents: [],
  selectedEvent: null,
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  fetchEvents: async (filters) => {
    const merged = { ...get().filters, ...filters };
    set({ isLoading: true, error: null, filters: merged });
    try {
      const qs = buildQueryString(merged as Record<string, string | number | boolean | undefined | null>);
      const { data } = await eventApiClient.get<ListResponse<Event>>(
        `${EVENT_ENDPOINTS.LIST}${qs}`
      );
      const limit = merged.limit ?? 12;
      set({
        events: data.list,
        total: data.recordCount,
        page: merged.page ?? 1,
        totalPages: Math.ceil(data.recordCount / limit) || 1,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to load events.";
      set({ error: message, isLoading: false });
    }
  },

  fetchEventById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const [eventRes, ticketRes] = await Promise.all([
        eventApiClient.get<DataResponse<Event>>(EVENT_ENDPOINTS.DETAIL(id)),
        eventApiClient.get<ListResponse<TicketType>>(TICKET_TYPE_ENDPOINTS.BY_EVENT(id)),
      ]);
      const event: Event = {
        ...eventRes.data.data,
        ticketTypes: ticketRes.data.list,
      };
      set({ selectedEvent: event, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to load event.";
      set({ error: message, isLoading: false });
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters, page: 1 } }));
  },

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  clearSelectedEvent: () => set({ selectedEvent: null }),
}));
