import { EventUpsertForm } from "@/components/organizer/EventUpsertForm";
import { Button } from "@/components/ui/button";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES } from "@/constants";
import { EVENT_ENDPOINTS, TICKET_TYPE_ENDPOINTS } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type {
  DataResponse,
  Event,
  ListResponse,
  TicketType,
  UpsertEventWithTicketsRequestDto,
} from "@/types";
import { eventApiClient } from "@/utils/axios";
import { ArrowLeft } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const mapToInitialValue = (event: Event, ticketTypes: TicketType[]): UpsertEventWithTicketsRequestDto => ({
  event: {
    title: event.title,
    description: event.description,
    category: event.category || "other",
    location: event.location,
    address: event.address,
    startDate: event.startDate,
    endDate: event.endDate,
    timezone: event.timezone,
    posterImage: event.posterImage,
    bannerImage: event.bannerImage,
    status: event.status,
  },
  ticketTypes: ticketTypes.map((ticket) => ({
    id: ticket.id,
    name: ticket.name,
    description: ticket.description,
    price: ticket.price,
    currency: ticket.currency || "IDR",
    totalSeats: ticket.totalSeats,
    availableSeats: ticket.availableSeats,
    saleStartDate: ticket.saleStartDate,
    saleEndDate: ticket.saleEndDate,
    status: ticket.status || "active",
  })),
});

export default function OrganizerEditEventPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();

  const [initialValue, setInitialValue] = useState<UpsertEventWithTicketsRequestDto | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${router.asPath}`);
      return;
    }

    if (!isLoading && user && user.role !== "organizer" && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !id || typeof id !== "string") return;

    const fetchEvent = async () => {
      setIsFetching(true);
      try {
        const [eventRes, ticketRes] = await Promise.all([
          eventApiClient.get<DataResponse<Event>>(EVENT_ENDPOINTS.DETAIL(id)),
          eventApiClient.get<ListResponse<TicketType>>(TICKET_TYPE_ENDPOINTS.BY_EVENT(id)),
        ]);

        const event = eventRes.data.data;
        const ticketTypes = ticketRes.data.list;

        if (user?.role !== "admin" && event.organizerId !== user?.id) {
          router.replace(ORGANIZER_ROUTES.EVENTS);
          return;
        }

        setInitialValue(mapToInitialValue(event, ticketTypes));
      } catch (error) {
        const message = (error as { response?: { data?: { errorMessage?: string; message?: string } } })
          ?.response?.data?.errorMessage
          || (error as { response?: { data?: { errorMessage?: string; message?: string } } })
            ?.response?.data?.message
          || "Failed to load event for editing.";

        toast({ title: "Load event failed", description: message, variant: "destructive" });
        router.replace(ORGANIZER_ROUTES.EVENTS);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEvent();
  }, [hasHydrated, isAuthenticated, id, user, router, toast]);

  const onSubmit = async (payload: UpsertEventWithTicketsRequestDto, _intent: "draft" | "publish") => {
    if (!id || typeof id !== "string") return;

    setIsSubmitting(true);
    try {
      await eventApiClient.put(EVENT_ENDPOINTS.UPDATE(id), payload);
      toast({ title: "Event updated", description: "Event and ticket details were updated." });
      router.push(ORGANIZER_ROUTES.EVENTS);
    } catch (error) {
      const message = (error as { response?: { data?: { errorMessage?: string; message?: string } } })
        ?.response?.data?.errorMessage
        || (error as { response?: { data?: { errorMessage?: string; message?: string } } })
          ?.response?.data?.message
        || "Failed to update event.";

      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasHydrated || !isAuthenticated || !user) return null;

  return (
    <DashboardLayout>
      <Head>
        <title>Update Event - {APP_NAME}</title>
      </Head>

      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Update Event & Ticket Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit all event fields and ticket types in one combined request.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={ORGANIZER_ROUTES.EVENTS}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Events
            </Link>
          </Button>
        </div>

        {isFetching || !initialValue ? (
          <div className="h-40 rounded-lg bg-muted animate-pulse" />
        ) : (
          <EventUpsertForm
            key={JSON.stringify(initialValue)}
            mode="edit"
            initialValue={initialValue}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
