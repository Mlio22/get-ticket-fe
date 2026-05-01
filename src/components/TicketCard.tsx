import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TICKET_STATUS_LABELS } from "@/constants";
import type { Ticket } from "@/types";
import { formatEventDate } from "@/utils/timezone";
import { Calendar, MapPin, QrCode } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  used: "secondary",
  cancelled: "destructive",
  refunded: "outline",
};

export function TicketCard({ ticket }: TicketCardProps) {
  const event = ticket.event;
  const ticketType = ticket.ticketType;

  return (
    <Card className="overflow-hidden border-2 border-dashed border-border">
      {/* Top half */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {ticketType?.name ?? "Ticket"}
            </p>
            <h3 className="font-semibold text-lg line-clamp-2">
              {event?.title ?? "Event"}
            </h3>
          </div>
          <Badge variant={statusVariant[ticket.status] ?? "outline"}>
            {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
          </Badge>
        </div>
      </CardHeader>

      <Separator className="mx-4" style={{ width: "auto" }} />

      {/* Details */}
      <CardContent className="pt-3 space-y-2">
        {event && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {formatEventDate(event.startDate, event.timezone, "dd MMM yyyy · HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </>
        )}
      </CardContent>

      {/* Stub */}
      <CardFooter className="border-t bg-muted/40 flex items-center justify-between py-3">
        <div>
          <p className="text-xs text-muted-foreground">Ticket ID</p>
          <p className="text-sm font-mono"># {ticket.id.slice(-8).toUpperCase()}</p>
        </div>
        {ticket.status === "active" && (
          <div className="flex items-center gap-1 text-primary text-sm font-medium">
            <QrCode className="h-4 w-4" />
            View QR
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
