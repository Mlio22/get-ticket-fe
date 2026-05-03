import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, EVENT_CATEGORIES, ORGANIZER_ROUTES, PUBLIC_ROUTES } from "@/constants";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuthStore } from "@/stores/authStore";
import { useEventStore } from "@/stores/eventStore";
import type { TicketType } from "@/types";
import { formatTicketPrice } from "@/utils/currency";
import { formatEventDate } from "@/utils/timezone";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Tag,
} from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface CartItem {
  ticketType: TicketType;
  quantity: number;
}

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { selectedEvent: event, isLoading, error, fetchEventById } = useEventStore();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const isOrganizerUser = user?.role === "organizer";

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  const categoryLabel = event
    ? EVENT_CATEGORIES.find((c) => c.value === event.category)?.label ?? event.category ?? ""
    : "";

  const updateQty = (tt: TicketType, delta: number) => {
    setCart((prev) => {
      const current = prev[tt.id]?.quantity ?? 0;
      const next = Math.max(0, Math.min(current + delta, tt.availableSeats));
      if (next === 0) {
        const { [tt.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [tt.id]: { ticketType: tt, quantity: next } };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Object.values(cart).reduce(
    (sum, item) => sum + item.ticketType.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (isOrganizerUser) {
      router.push(ORGANIZER_ROUTES.EVENTS);
      return;
    }
    if (!isAuthenticated) {
      router.push(`${PUBLIC_ROUTES.LOGIN}?redirect=/events/${id}/checkout`);
      return;
    }
    // Persist cart to sessionStorage so checkout page can read it
    const cartItems = Object.values(cart).map((item) => ({
      ticketTypeId: item.ticketType.id,
      name: item.ticketType.name,
      price: item.ticketType.price,
      currency: item.ticketType.currency ?? "IDR",
      quantity: item.quantity,
    }));
    sessionStorage.setItem(`cart_${id}`, JSON.stringify(cartItems));
    router.push(`/events/${id}/checkout`);
  };

  if (!hasHydrated || (isAuthenticated && !user)) return null;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive" />
          <p className="font-medium text-lg">{error ?? "Event not found"}</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href={PUBLIC_ROUTES.EVENTS}>Back to Events</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>{event.title} – {APP_NAME}</title>
        <meta name="description" content={event.description.slice(0, 160)} />
      </Head>

      {/* Banner */}
      <div className="relative h-56 md:h-80 bg-muted w-full">
        {event.bannerImage ? (
          <Image
            src={event.bannerImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="capitalize">
            <Tag className="mr-1 h-3 w-3" />
            {categoryLabel}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href={PUBLIC_ROUTES.EVENTS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left – details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              {event.status !== "published" && (
                <Badge
                  variant={event.status === "cancelled" ? "destructive" : "secondary"}
                  className="mb-2 capitalize"
                >
                  {event.status}
                </Badge>
              )}
              <h1 className="text-3xl font-bold">{event.title}</h1>
              {event.organizer && (
                <p className="text-muted-foreground mt-1 text-sm">
                  Organized by{" "}
                  <span className="font-medium text-foreground">{event.organizer.name}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  {formatEventDate(event.startDate, event.timezone ?? undefined, "EEEE, dd MMMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  {formatEventDate(event.startDate, event.timezone ?? undefined, "HH:mm")}
                  {" – "}
                  {formatEventDate(event.endDate, event.timezone ?? undefined, "HH:mm z")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  {event.location}
                  {event.address && `, ${event.address}`}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* Right – ticket selection */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isOrganizerUser ? "Organizer View" : "Select Tickets"}
                </CardTitle>
              </CardHeader>
              {isOrganizerUser ? (
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Organizer accounts cannot buy tickets. Use the organizer dashboard to manage your own events.
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={ORGANIZER_ROUTES.EVENTS}>Go to My Events</Link>
                  </Button>
                </CardContent>
              ) : (
                <>
                  <CardContent className="space-y-4">
                    {(event.ticketTypes ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tickets available.</p>
                    ) : (
                      (event.ticketTypes ?? []).map((tt) => {
                        const qty = cart[tt.id]?.quantity ?? 0;
                        const isSoldOut = tt.availableSeats === 0;
                        return (
                          <div key={tt.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{tt.name}</p>
                                {tt.description && (
                                  <p className="text-xs text-muted-foreground">{tt.description}</p>
                                )}
                              </div>
                              <span className="font-semibold text-primary text-sm">
                                {formatTicketPrice(tt.price)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {isSoldOut ? "Sold out" : `${tt.availableSeats} left`}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQty(tt, -1)}
                                  disabled={qty === 0 || isSoldOut}
                                  className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">{qty}</span>
                                <button
                                  onClick={() => updateQty(tt, 1)}
                                  disabled={isSoldOut || qty >= tt.availableSeats}
                                  className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                  {totalItems > 0 && (
                    <CardFooter className="flex flex-col gap-3 border-t pt-4">
                      <div className="flex justify-between w-full text-sm">
                        <span className="text-muted-foreground">
                          {totalItems} ticket{totalItems !== 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold">
                          {formatTicketPrice(totalAmount)}
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleCheckout}
                        disabled={event.status !== "published"}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {isAuthenticated ? "Proceed to Checkout" : "Log in to Buy"}
                      </Button>
                    </CardFooter>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
