import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES } from "@/constants";
import { ORGANIZER_DASHBOARD_DUMMY } from "@/constants/organizer-dummy-data";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/timezone";
import { ArrowRight, Calendar, PlusCircle, TrendingUp, Users } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const summary = ORGANIZER_DASHBOARD_DUMMY.summary;
  const recentEvents = ORGANIZER_DASHBOARD_DUMMY.recentEvents;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${ORGANIZER_ROUTES.DASHBOARD}`);
      return;
    }
    if (!isLoading && user && user.role !== "organizer" && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, isLoading, user, router]);

  if (!hasHydrated || !isAuthenticated || !user) return null;

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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary.totalEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary.totalAttendees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Tickets Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary.ticketsSold}</p>
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
              {formatCurrency(summary.grossRevenue, summary.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Dummy payload from organizer dashboard DTO contract
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
                      {formatCurrency(event.grossRevenue, summary.currency)}
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
