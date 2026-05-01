import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { APP_NAME, PUBLIC_ROUTES, USER_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { Ticket as TicketType } from "@/types";
import { Ticket } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { DUMMY_TICKETS } from "@/constants/dummy-data";

const mockTickets: TicketType[] = DUMMY_TICKETS;

export default function MyTicketsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${USER_ROUTES.MY_TICKETS}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <Head>
        <title>My Tickets – {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Tickets</h1>

        {mockTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTickets.map((ticket) => (
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
