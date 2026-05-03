import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EVENT_CATEGORIES, PUBLIC_ROUTES } from "@/constants";
import type { Event } from "@/types";
import { formatTicketPrice } from "@/utils/currency";
import { formatDate, formatTime } from "@/utils/timezone";
import { Calendar, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  showTicketAction?: boolean;
}

export function EventCard({ event, showTicketAction = true }: EventCardProps) {
  const categoryLabel =
    EVENT_CATEGORIES.find((c) => c.value === event.category)?.label ?? event.category;

  const ticketTypes = event.ticketTypes ?? [];
  const lowestPrice = ticketTypes.length
    ? Math.min(...ticketTypes.map((t) => t.price))
    : null;

  const priceDisplay =
    lowestPrice !== null
      ? lowestPrice === 0
        ? "Free"
        : `From ${formatTicketPrice(lowestPrice)}`
      : "See details";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Poster image */}
      <div className="relative h-48 bg-muted">
        {event.posterImage ? (
          <Image
            src={event.posterImage}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Calendar className="h-12 w-12 opacity-40" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="capitalize">
            <Tag className="mr-1 h-3 w-3" />
            {categoryLabel}
          </Badge>
        </div>
        {event.status === "cancelled" && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge variant="destructive" className="text-base px-4 py-1.5">
              Cancelled
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 pt-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">{event.title}</h3>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatDate(event.startDate, event.timezone ?? undefined)}{" "}
              &middot; {formatTime(event.startDate, event.timezone ?? undefined)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-3 pb-4">
        <span className="font-semibold text-primary">{priceDisplay}</span>
        {showTicketAction ? (
          <Button size="sm" asChild disabled={event.status === "cancelled"}>
            <Link href={PUBLIC_ROUTES.EVENT_DETAIL(event.id)}>
              {event.status === "cancelled" ? "Cancelled" : "Get Tickets"}
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
