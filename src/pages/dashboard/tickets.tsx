import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES, TICKET_ENDPOINTS, USER_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, ListResponse, Ticket as TicketType } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { formatEventDate } from "@/utils/timezone";
import { ArrowRight, Loader2, RefreshCcw, Ticket } from "lucide-react";
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

function safeDate(dateStr?: string, timezone?: string): string {
  if (!dateStr) return "Date not available";
  try {
    return formatEventDate(dateStr, timezone, "dd MMM yyyy, HH:mm");
  } catch {
    return dateStr;
  }
}

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const { data } = await eventApiClient.get<MyTicketsResponse>(TICKET_ENDPOINTS.MY_TICKETS);
      setTickets(normalizeTickets(data));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.errorMessage ||
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.message ||
        "Failed to load your tickets.";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${USER_ROUTES.MY_TICKETS}`);
      return;
    }
    if (!isLoading && user?.role === "organizer") {
      router.replace(ORGANIZER_ROUTES.EVENTS);
      return;
    }

    fetchTickets();
  }, [hasHydrated, isAuthenticated, isLoading, router, user, fetchTickets]);

  const groupedTickets = useMemo(() => {
    const groups = tickets.reduce<
      Array<{
        key: string;
        eventId?: string;
        title: string;
        startDate?: string;
        timezone?: string;
        location?: string;
        ticketCount: number;
        activeCount: number;
        usedCount: number;
        expiredCount: number;
      }>
    >((accumulator, ticket) => {
      const event = ticket.event;
      const key = event?.id ?? `ungrouped-${ticket.id}`;
      const existingGroup = accumulator.find((group) => group.key === key);

      if (existingGroup) {
        existingGroup.ticketCount += 1;
        if (ticket.status === "active") existingGroup.activeCount += 1;
        if (ticket.status === "used") existingGroup.usedCount += 1;
        if (ticket.status === "expired") existingGroup.expiredCount += 1;
        return accumulator;
      }

      accumulator.push({
        key,
        eventId: event?.id,
        title: event?.title ?? "Other Tickets",
        startDate: event?.startDate,
        timezone: event?.timezone,
        location: event?.location,
        ticketCount: 1,
        activeCount: ticket.status === "active" ? 1 : 0,
        usedCount: ticket.status === "used" ? 1 : 0,
        expiredCount: ticket.status === "expired" ? 1 : 0,
      });

      return accumulator;
    }, []);

    return groups.sort((left, right) => {
      const leftTime = left.startDate ? new Date(left.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightTime = right.startDate ? new Date(right.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime;
    });
  }, [tickets]);

  if (!hasHydrated || !isAuthenticated || user?.role === "organizer") return null;

  return (
    <DashboardLayout>
      <Head>
        <title>My Tickets – {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">My Tickets</h1>
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
          ) : groupedTickets.length > 0 ? (
            <div className="space-y-6">
              {groupedTickets.map((group) => (
                <section key={group.key} className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
                  <div className="flex flex-col gap-1 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{group.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {safeDate(group.startDate, group.timezone)}
                        {group.location ? ` • ${group.location}` : ""}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {group.ticketCount} ticket{group.ticketCount > 1 ? "s" : ""}
                    </p>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Ticket Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <p>Active: <span className="font-semibold">{group.activeCount}</span></p>
                        <p>Used: <span className="font-semibold">{group.usedCount}</span></p>
                        <p>Expired: <span className="font-semibold">{group.expiredCount}</span></p>
                      </div>

                      {group.eventId ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={USER_ROUTES.MY_TICKET_DETAIL(group.eventId)}>
                            View Tickets <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium">You don&apos;t have any tickets yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Buy tickets to see them here.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href={PUBLIC_ROUTES.EVENTS}>Browse Events</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
