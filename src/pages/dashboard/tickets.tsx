import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES, TICKET_ENDPOINTS, USER_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, ListResponse, Ticket as TicketType } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { Loader2, RefreshCcw, Ticket } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

type MyTicketsResponse = ListResponse<TicketType> | DataResponse<TicketType[] | TicketType>;

function normalizeTickets(data: MyTicketsResponse): TicketType[] {
  if ("list" in data) return data.list;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === "object") return [data.data as TicketType];
  return [];
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
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
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
