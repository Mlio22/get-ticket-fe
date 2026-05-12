import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES, TICKET_ENDPOINTS, USER_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, ListResponse, Ticket as TicketType } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { formatEventDate } from "@/utils/timezone";
import { ArrowLeft, Loader2, RefreshCcw, Ticket } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

type MyTicketsResponse = ListResponse<TicketType> | DataResponse<TicketType[] | TicketType>;

function normalizeTickets(data: MyTicketsResponse): TicketType[] {
  if ("list" in data) return data.list;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === "object") return [data.data as TicketType];
  return [];
}

export default function TicketEventDetailPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!eventId || typeof eventId !== "string") return;

    setIsFetching(true);
    setError(null);
    try {
      const { data } = await eventApiClient.get<MyTicketsResponse>(TICKET_ENDPOINTS.BY_EVENT(eventId));
      setTickets(normalizeTickets(data));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.errorMessage ||
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.message ||
        "Failed to load tickets.";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoading && !isAuthenticated) {
      const redirectTarget =
        typeof eventId === "string" ? USER_ROUTES.MY_TICKET_DETAIL(eventId) : USER_ROUTES.MY_TICKETS;
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${redirectTarget}`);
      return;
    }
    if (!isLoading && user?.role === "organizer") {
      router.replace(ORGANIZER_ROUTES.EVENTS);
      return;
    }

    fetchTickets();
  }, [eventId, fetchTickets, hasHydrated, isAuthenticated, isLoading, router, user]);

  const eventInfo = useMemo(() => tickets.find((ticket) => ticket.event)?.event, [tickets]);

  if (!hasHydrated || !isAuthenticated || user?.role === "organizer") return null;

  return (
    <DashboardLayout>
      <Head>
        <title>Ticket Detail - {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <Button asChild variant="ghost" size="sm" className="px-0 text-muted-foreground">
              <Link href={USER_ROUTES.MY_TICKETS}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Tickets
              </Link>
            </Button>
            <h1 className="text-2xl font-bold mt-1">{eventInfo?.title ?? "Event Ticket Detail"}</h1>
            {eventInfo ? (
              <p className="text-sm text-muted-foreground mt-1">
                {formatEventDate(eventInfo.startDate, eventInfo.timezone, "dd MMM yyyy, HH:mm")} • {eventInfo.location}
              </p>
            ) : null}
          </div>
          <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isFetching}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        {error ? (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <Ticket className="h-10 w-10 mx-auto mb-3 text-destructive opacity-80" />
            <p className="font-medium">Could not load tickets</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={fetchTickets} className="mt-4" size="sm" variant="outline">
              Try Again
            </Button>
          </div>
        ) : isFetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium">No tickets found for this event</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tickets for this event will appear here after payment.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
