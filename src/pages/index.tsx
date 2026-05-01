import { EventCard } from "@/components/EventCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_NAME, EVENT_API_BASE_URL, EVENT_CATEGORIES, EVENT_ENDPOINTS, PUBLIC_ROUTES } from "@/constants";
import { MainLayout } from "@/layouts/MainLayout";
import type { Event, ListResponse } from "@/types";
import axios from "axios";
import { ArrowRight, Shield, Ticket, Zap } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

interface HomeProps {
  featuredEvents: Event[];
}

export default function HomePage({ featuredEvents }: HomeProps) {
  return (
    <MainLayout>
      <Head>
        <title>{APP_NAME} – Buy Tickets for the Best Events</title>
        <meta
          name="description"
          content="Discover and buy tickets for concerts, sports, tech events, and more."
        />
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            🎉 New events added daily
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Get Your Tickets <span className="text-primary">Instantly</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Discover concerts, sports games, tech conferences, food festivals, and more — all in one
            place.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href={PUBLIC_ROUTES.EVENTS}>
                Browse Events <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`${PUBLIC_ROUTES.REGISTER}?role=organizer`}>
                Create an Event
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {EVENT_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`${PUBLIC_ROUTES.EVENTS}?category=${cat.value}`}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-1.5 text-sm"
                >
                  {cat.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Events</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={PUBLIC_ROUTES.EVENTS}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">
              No featured events at the moment. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Why GetTicket */}
      <section className="py-16 bg-muted/40 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">Why {APP_NAME}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Instant Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Get your e-ticket immediately after purchase — no waiting, no printing.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                Your payment and personal data are always protected with industry-grade security.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Ticket className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Easy Management</h3>
              <p className="text-sm text-muted-foreground">
                Access all your tickets in one dashboard, transfer or resell with a click.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data } = await axios.get<ListResponse<Event>>(
      `${EVENT_API_BASE_URL}${EVENT_ENDPOINTS.LIST}`
    );
    return { props: { featuredEvents: data.isOk ? data.list.slice(0, 8) : [] } };
  } catch {
    return { props: { featuredEvents: [] } };
  }
};
