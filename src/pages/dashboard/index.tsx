import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, PUBLIC_ROUTES, USER_ROUTES } from "@/constants";
import { DUMMY_TICKETS } from "@/constants/dummy-data";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import { ArrowRight, Calendar, ShoppingBag, Ticket } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${USER_ROUTES.DASHBOARD}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated || !user) return null;

  const activeTickets = DUMMY_TICKETS.filter((t) => t.status === "active");
  const upcomingEvents = new Set(DUMMY_TICKETS.filter((t) => t.status === "active").map((t) => t.event?.id)).size;

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard – {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s a summary of your account.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ticket className="h-4 w-4" /> Active Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeTickets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{DUMMY_TICKETS.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{upcomingEvents}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Tickets</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={USER_ROUTES.MY_TICKETS}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {DUMMY_TICKETS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DUMMY_TICKETS.slice(0, 4).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="font-medium">No tickets yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Browse events and grab your first ticket!
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href={PUBLIC_ROUTES.EVENTS}>Browse Events</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
