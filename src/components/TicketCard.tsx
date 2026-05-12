import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TICKET_STATUS_LABELS } from "@/constants";
import type { Ticket } from "@/types";
import { formatEventDate } from "@/utils/timezone";
import { Calendar, MapPin, QrCode, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";

interface TicketCardProps {
  ticket: Ticket;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  used: "secondary",
  expired: "outline",
  cancelled: "destructive",
  refunded: "outline",
};

export function TicketCard({ ticket }: TicketCardProps) {
  const event = ticket.event;
  const ticketType = ticket.ticketType;
  const [isQrOpen, setIsQrOpen] = useState(false);

  return (
    <>
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
          {ticket.qrCode && ticket.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setIsQrOpen(true)}
            >
              <QrCode className="mr-2 h-4 w-4" />
              View QR
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      {isQrOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close QR modal"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsQrOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-xl border bg-background p-5 shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted"
              onClick={() => setIsQrOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-xs uppercase tracking-wider text-muted-foreground">Ticket QR</p>
            <h3 className="mt-1 text-base font-semibold line-clamp-2">{event?.title ?? "Event Ticket"}</h3>
            <p className="text-sm text-muted-foreground">{ticketType?.name ?? "Ticket"}</p>

            <div className="mt-4 rounded-lg border bg-white p-4">
              <QRCodeCanvas
                value={ticket.qrCode ?? ""}
                size={220}
                includeMargin
                className="mx-auto h-auto max-w-full"
              />
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Show this QR code to event staff for check-in.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
