import { EventUpsertForm } from "@/components/organizer/EventUpsertForm";
import { Button } from "@/components/ui/button";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES } from "@/constants";
import { EVENT_ENDPOINTS } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, Event, UpsertEventWithTicketsRequestDto } from "@/types";
import { eventApiClient } from "@/utils/axios";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function OrganizerCreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${ORGANIZER_ROUTES.CREATE_EVENT}`);
      return;
    }

    if (!isLoading && user && user.role !== "organizer" && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isLoading, isAuthenticated, user, router]);

  const onSubmit = async (payload: UpsertEventWithTicketsRequestDto, _intent: "draft" | "publish") => {
    setIsSubmitting(true);
    try {
      const eventRes = await eventApiClient.post<DataResponse<Event | { id: string }>>(
        EVENT_ENDPOINTS.CREATE,
        payload
      );
      const createdEvent = eventRes.data.data as Event | { id: string };
      const createdId = createdEvent?.id;

      toast({
        title: "Event created",
        description: `${payload.event.title} was created successfully with ${payload.ticketTypes.length} ticket type(s).`,
      });
      if (createdId) {
        router.push(ORGANIZER_ROUTES.EDIT_EVENT(createdId));
      } else {
        router.push(ORGANIZER_ROUTES.DASHBOARD);
      }
    } catch (error) {
      const errMessage = (error as { response?: { data?: { errorMessage?: string; message?: string } } })
        ?.response?.data?.errorMessage
        || (error as { response?: { data?: { errorMessage?: string; message?: string } } })
          ?.response?.data?.message
        || (error as Error).message
        || "Failed to create event.";

      toast({
        title: "Create event failed",
        description: errMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasHydrated || !isAuthenticated || !user) return null;

  return (
    <DashboardLayout>
      <Head>
        <title>Create Event - {APP_NAME}</title>
      </Head>

      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Create Event</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your event details and ticket configuration.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={ORGANIZER_ROUTES.DASHBOARD}>Back to Dashboard</Link>
          </Button>
        </div>

        <EventUpsertForm mode="create" isSubmitting={isSubmitting} onSubmit={onSubmit} />
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
