import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES } from "@/constants";
import { EVENT_ENDPOINTS } from "@/constants/api";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, Event, ListResponse } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { Calendar, Pencil, PlusCircle, RefreshCcw, SearchX } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

type MineEventsResponse = ListResponse<Event> | DataResponse<Event[] | Event>;

function normalizeMineEvents(data: MineEventsResponse): Event[] {
  if ("list" in data) return data.list;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === "object") return [data.data as Event];
  return [];
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();

  const [events, setEvents] = useState<Event[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMineEvents = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const { data } = await eventApiClient.get<MineEventsResponse>(EVENT_ENDPOINTS.MINE);
      setEvents(normalizeMineEvents(data));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data?.errorMessage
        || (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data?.message
        || "Failed to load your events.";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${ORGANIZER_ROUTES.EVENTS}`);
      return;
    }

    if (!isLoading && user && user.role !== "organizer" && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    fetchMineEvents();
  }, [hasHydrated, isLoading, isAuthenticated, user, router, fetchMineEvents]);

  if (!hasHydrated || !isAuthenticated || !user) return null;

  return (
    <DashboardLayout>
      <Head>
        <title>My Events - {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Events</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage events created from your organizer account.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchMineEvents} disabled={isFetching}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button asChild>
              <Link href={ORGANIZER_ROUTES.CREATE_EVENT}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Event
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <SearchX className="h-8 w-8 mx-auto text-destructive mb-2" />
              <p className="font-medium">Could not load events</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button className="mt-4" variant="outline" onClick={fetchMineEvents}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <div key={event.id} className="space-y-2">
                <EventCard event={event} showTicketAction={false} />
                {(user.role === "admin" || event.organizerId === user.id) && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={ORGANIZER_ROUTES.EDIT_EVENT(event.id)}>
                      <Pencil className="mr-2 h-4 w-4" /> Update Event & Tickets
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="font-medium">No events found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by creating your first event.
              </p>
              <Button asChild className="mt-4">
                <Link href={ORGANIZER_ROUTES.CREATE_EVENT}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
