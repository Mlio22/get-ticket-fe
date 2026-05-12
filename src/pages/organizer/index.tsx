import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, DASHBOARD_ENDPOINTS, ORGANIZER_ROUTES, PUBLIC_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, OrganizerDashboardDto } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/timezone";
import { ArrowRight, Calendar, Loader2, PlusCircle, RefreshCcw, TrendingUp, Users } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const [dashboard, setDashboard] = useState<OrganizerDashboardDto | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const { data } = await eventApiClient.get<DataResponse<OrganizerDashboardDto>>(
        DASHBOARD_ENDPOINTS.ORGANIZER
      );
      setDashboard(data.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.errorMessage ||
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.message ||
        "Failed to load organizer dashboard.";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${ORGANIZER_ROUTES.DASHBOARD}`);
      return;
    }
    if (!isLoading && user && user.role !== "organizer" && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    fetchDashboard();
  }, [fetchDashboard, hasHydrated, isAuthenticated, isLoading, user, router]);

  if (!hasHydrated || !isAuthenticated || !user) return null;

  const summary = dashboard?.summary;
  const recentEvents = dashboard?.recentEvents ?? [];

  return (
    <DashboardLayout>
      <Head>
        <title>Organizer Dashboard – {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your events and track performance.
            </p>
          </div>
          <Button asChild>
            <Link href={ORGANIZER_ROUTES.CREATE_EVENT}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </Button>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={isFetching}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        {error ? (
          <div className="text-center py-10 border rounded-lg bg-muted/20">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 text-destructive opacity-80" />
            <p className="font-medium">Could not load organizer dashboard</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={fetchDashboard} className="mt-4" size="sm" variant="outline">
              Try Again
            </Button>
          </div>
        ) : null}

        {isFetching && !dashboard ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.totalEvents ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.totalAttendees ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Tickets Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.ticketsSold ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(summary?.grossRevenue ?? 0, summary?.currency ?? "IDR")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Aggregated from paid checkouts for your events
            </p>
          </CardContent>
        </Card>

        {/* My Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Events</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ORGANIZER_ROUTES.EVENTS}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentEvents.map((event) => {
              const soldRate = event.totalTickets > 0
                ? Math.round((event.soldTickets / event.totalTickets) * 100)
                : 0;
              return (
                <div key={event.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant={event.status === "published" ? "default" : "secondary"} className="capitalize">
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(event.startDate)} • {event.location}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground md:text-right">
                    <p>{event.soldTickets}/{event.totalTickets} sold ({soldRate}%)</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(event.grossRevenue, summary?.currency ?? "IDR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
