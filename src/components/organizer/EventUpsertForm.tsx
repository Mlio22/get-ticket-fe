import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CURRENCY_OPTIONS,
  DEFAULT_EVENT_BANNER_IMAGE,
  DEFAULT_EVENT_POSTER_IMAGE,
  DEFAULT_TIMEZONE,
  EVENT_CATEGORIES,
  TIME_SLOT_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/constants";
import type {
  EventCategory,
  EventStatus,
  UpsertEventTicketDto,
  UpsertEventWithTicketsRequestDto,
} from "@/types";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type SubmitIntent = "draft" | "publish";

type TicketDraft = {
  key: string;
  id?: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  totalSeats: string;
  saleStartDate: string;
  saleEndDate: string;
};

type EventDraft = {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  address: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  posterImage: string;
  bannerImage: string;
};

interface EventUpsertFormProps {
  mode: "create" | "edit";
  initialValue?: UpsertEventWithTicketsRequestDto;
  isSubmitting: boolean;
  onSubmit: (payload: UpsertEventWithTicketsRequestDto, intent: SubmitIntent) => Promise<void>;
}

const createTicketDraft = (index: number): TicketDraft => ({
  key: `ticket-${Date.now()}-${index}`,
  name: index === 0 ? "General Admission" : "",
  description: "",
  price: "",
  currency: "IDR",
  totalSeats: "",
  saleStartDate: "",
  saleEndDate: "",
});

const splitIsoDateTime = (iso?: string): { date: string; time: string } => {
  if (!iso) return { date: "", time: "" };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [localDate, localTime] = local.split("T");
  return { date: localDate || "", time: localTime || "" };
};

const combineDateTimeToIso = (date: string, time: string): string | undefined => {
  if (!date || !time) return undefined;
  return new Date(`${date}T${time}`).toISOString();
};

const combineDateOnlyToIso = (date: string, endOfDay = false): string | undefined => {
  if (!date) return undefined;
  return new Date(`${date}T${endOfDay ? "23:59" : "00:00"}`).toISOString();
};

const toLocalDate = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const toLocalTime = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(11, 16);
};

const requiredMark = <span className="text-destructive">*</span>;

const resolvePublishedStatus = (startIso?: string): EventStatus => {
  if (!startIso) return "upcoming";
  return new Date(startIso).getTime() <= Date.now() ? "ongoing" : "upcoming";
};

const createDefaultEventDraft = (): EventDraft => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  return {
    title: "",
    description: "",
    category: "music",
    location: "",
    address: "",
    startDate: toLocalDate(now),
    startTime: toLocalTime(now),
    endDate: toLocalDate(tomorrow),
    endTime: toLocalTime(now),
    timezone: DEFAULT_TIMEZONE,
    posterImage: DEFAULT_EVENT_POSTER_IMAGE,
    bannerImage: DEFAULT_EVENT_BANNER_IMAGE,
  };
};

export function EventUpsertForm({ mode, initialValue, isSubmitting, onSubmit }: EventUpsertFormProps) {
  const startParts = splitIsoDateTime(initialValue?.event.startDate);
  const endParts = splitIsoDateTime(initialValue?.event.endDate);

  const [eventDraft, setEventDraft] = useState<EventDraft>(() => ({
    ...createDefaultEventDraft(),
    title: initialValue?.event.title ?? "",
    description: initialValue?.event.description ?? "",
    category: initialValue?.event.category ?? "music",
    location: initialValue?.event.location ?? "",
    address: initialValue?.event.address ?? "",
    startDate: startParts.date,
    startTime: startParts.time,
    endDate: endParts.date,
    endTime: endParts.time,
    timezone: initialValue?.event.timezone ?? DEFAULT_TIMEZONE,
    posterImage: initialValue?.event.posterImage ?? DEFAULT_EVENT_POSTER_IMAGE,
    bannerImage: initialValue?.event.bannerImage ?? DEFAULT_EVENT_BANNER_IMAGE,
  }));

  const [ticketDrafts, setTicketDrafts] = useState<TicketDraft[]>(() => {
    if (!initialValue?.ticketTypes?.length) return [createTicketDraft(0)];
    return initialValue.ticketTypes.map((ticket, index) => ({
      key: `existing-${Date.now()}-${index}`,
      id: ticket.id,
      name: ticket.name,
      description: ticket.description ?? "",
      price: String(ticket.price),
      currency: ticket.currency || "IDR",
      totalSeats: String(ticket.totalSeats),
      saleStartDate: splitIsoDateTime(ticket.saleStartDate).date,
      saleEndDate: splitIsoDateTime(ticket.saleEndDate).date,
    }));
  });

  const [eventErrors, setEventErrors] = useState<Partial<Record<keyof EventDraft, string>>>({});
  const [ticketErrors, setTicketErrors] = useState<
    Record<string, Partial<Record<Exclude<keyof TicketDraft, "key" | "id">, string>>>
  >({});

  const payloadPreview = useMemo<UpsertEventWithTicketsRequestDto>(() => {
    const ticketTypes: UpsertEventTicketDto[] = ticketDrafts.map((ticket) => ({
      id: ticket.id,
      name: ticket.name.trim(),
      description: ticket.description.trim() || undefined,
      price: Number(ticket.price || 0),
      currency: ticket.currency.trim() || "IDR",
      totalSeats: Number(ticket.totalSeats || 0),
      saleStartDate: combineDateOnlyToIso(ticket.saleStartDate),
      saleEndDate: combineDateOnlyToIso(ticket.saleEndDate, true),
    }));

    return {
      event: {
        title: eventDraft.title.trim(),
        description: eventDraft.description.trim(),
        category: eventDraft.category,
        location: eventDraft.location.trim(),
        address: eventDraft.address.trim() || undefined,
        startDate: combineDateTimeToIso(eventDraft.startDate, eventDraft.startTime) || "",
        endDate: combineDateTimeToIso(eventDraft.endDate, eventDraft.endTime) || "",
        timezone: eventDraft.timezone.trim() || DEFAULT_TIMEZONE,
        posterImage: eventDraft.posterImage.trim() || undefined,
        bannerImage: eventDraft.bannerImage.trim() || undefined,
        status: "draft",
      },
      ticketTypes,
    };
  }, [eventDraft, ticketDrafts]);

  const onEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEventDraft((prev) => ({ ...prev, [name]: value }));
    setEventErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onTicketChange = (key: string, field: Exclude<keyof TicketDraft, "key" | "id">, value: string) => {
    setTicketDrafts((prev) =>
      prev.map((ticket) => (ticket.key === key ? { ...ticket, [field]: value } : ticket))
    );
    setTicketErrors((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: undefined },
    }));
  };

  const addTicketDraft = () => {
    setTicketDrafts((prev) => [...prev, createTicketDraft(prev.length)]);
  };

  const removeTicketDraft = (key: string) => {
    setTicketDrafts((prev) => prev.filter((ticket) => ticket.key !== key));
    setTicketErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateEvent = () => {
    const nextErrors: Partial<Record<keyof EventDraft, string>> = {};
    if (!eventDraft.title.trim()) nextErrors.title = "Event title is required.";
    if (!eventDraft.description.trim()) nextErrors.description = "Event description is required.";
    if (!eventDraft.location.trim()) nextErrors.location = "Location is required.";
    if (!eventDraft.startDate) nextErrors.startDate = "Start date/time is required.";
    if (!eventDraft.startTime) nextErrors.startTime = "Start date/time is required.";
    if (!eventDraft.endDate) nextErrors.endDate = "End date/time is required.";
    if (!eventDraft.endTime) nextErrors.endTime = "End date/time is required.";

    const startIso = combineDateTimeToIso(eventDraft.startDate, eventDraft.startTime);
    const endIso = combineDateTimeToIso(eventDraft.endDate, eventDraft.endTime);
    if (
      startIso &&
      endIso &&
      new Date(endIso) <= new Date(startIso)
    ) {
      nextErrors.endDate = "End date must be after start date.";
    }
    return nextErrors;
  };

  const validateTickets = () => {
    const nextErrors: Record<
      string,
      Partial<Record<Exclude<keyof TicketDraft, "key" | "id">, string>>
    > = {};

    ticketDrafts.forEach((ticket) => {
      const rowErrors: Partial<Record<Exclude<keyof TicketDraft, "key" | "id">, string>> = {};
      if (!ticket.name.trim()) rowErrors.name = "Ticket name is required.";
      if (ticket.price === "" || Number(ticket.price) < 0) {
        rowErrors.price = "Ticket price must be zero or greater.";
      }
      if (ticket.totalSeats === "" || Number(ticket.totalSeats) < 1) {
        rowErrors.totalSeats = "Total seats must be at least 1.";
      }
      if (
        ticket.saleStartDate &&
        ticket.saleEndDate
      ) {
        const saleStart = combineDateOnlyToIso(ticket.saleStartDate);
        const saleEnd = combineDateOnlyToIso(ticket.saleEndDate, true);
        if (saleStart && saleEnd && new Date(saleEnd) < new Date(saleStart)) {
          rowErrors.saleEndDate = "Sale end must be after sale start.";
        }
      }
      if (Object.keys(rowErrors).length) nextErrors[ticket.key] = rowErrors;
    });

    return nextErrors;
  };

  const resetForm = () => {
    setEventDraft(createDefaultEventDraft());
    setTicketDrafts([createTicketDraft(0)]);
    setEventErrors({});
    setTicketErrors({});
  };

  const submitWithIntent = async (e: React.FormEvent, intent: SubmitIntent) => {
    e.preventDefault();
    const nextEventErrors = validateEvent();
    const nextTicketErrors = validateTickets();

    if (Object.keys(nextEventErrors).length || Object.keys(nextTicketErrors).length) {
      setEventErrors(nextEventErrors);
      setTicketErrors(nextTicketErrors);
      return;
    }

    const startIso = combineDateTimeToIso(eventDraft.startDate, eventDraft.startTime);
    const status: EventStatus = intent === "draft" ? "draft" : resolvePublishedStatus(startIso);

    await onSubmit(
      {
        ...payloadPreview,
        event: {
          ...payloadPreview.event,
          status,
        },
      },
      intent
    );
  };

  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Event Title {requiredMark}</Label>
            <Input id="title" name="title" value={eventDraft.title} onChange={onEventChange} placeholder="e.g. Jakarta Jazz Festival" />
            {eventErrors.title && <p className="text-xs text-destructive">{eventErrors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description {requiredMark}</Label>
            <textarea
              id="description"
              name="description"
              value={eventDraft.description}
              onChange={onEventChange}
              placeholder="Describe your event..."
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {eventErrors.description && <p className="text-xs text-destructive">{eventErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category {requiredMark}</Label>
              <select id="category" name="category" value={eventDraft.category} onChange={onEventChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone {requiredMark}</Label>
              <select id="timezone" name="timezone" value={eventDraft.timezone} onChange={onEventChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {TIMEZONE_OPTIONS.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>{timezone.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location {requiredMark}</Label>
              <Input id="location" name="location" value={eventDraft.location} onChange={onEventChange} placeholder="e.g. Istora Senayan" />
              {eventErrors.location && <p className="text-xs text-destructive">{eventErrors.location}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={eventDraft.address} onChange={onEventChange} placeholder="Full venue address" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date {requiredMark}</Label>
              <Input id="startDate" name="startDate" type="date" value={eventDraft.startDate} onChange={onEventChange} />
              {eventErrors.startDate && <p className="text-xs text-destructive">{eventErrors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start Time {requiredMark}</Label>
              <select id="startTime" name="startTime" value={eventDraft.startTime} onChange={onEventChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select time</option>
                {TIME_SLOT_OPTIONS.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
              {eventErrors.startTime && <p className="text-xs text-destructive">{eventErrors.startTime}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date {requiredMark}</Label>
              <Input id="endDate" name="endDate" type="date" value={eventDraft.endDate} onChange={onEventChange} />
              {eventErrors.endDate && <p className="text-xs text-destructive">{eventErrors.endDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">End Time {requiredMark}</Label>
              <select id="endTime" name="endTime" value={eventDraft.endTime} onChange={onEventChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select time</option>
                {TIME_SLOT_OPTIONS.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
              {eventErrors.endTime && <p className="text-xs text-destructive">{eventErrors.endTime}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="posterImage">Poster Image URL</Label>
              <Input id="posterImage" name="posterImage" value={eventDraft.posterImage} onChange={onEventChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bannerImage">Banner Image URL</Label>
              <Input id="bannerImage" name="bannerImage" value={eventDraft.bannerImage} onChange={onEventChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketDrafts.map((ticket, index) => (
            <div key={ticket.key} className="border rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Ticket Type {index + 1}</h3>
                {ticketDrafts.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeTicketDraft(ticket.key)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`ticket-name-${ticket.key}`}>Ticket Name {requiredMark}</Label>
                  <Input id={`ticket-name-${ticket.key}`} value={ticket.name} onChange={(e) => onTicketChange(ticket.key, "name", e.target.value)} placeholder="General Admission" />
                  {ticketErrors[ticket.key]?.name && <p className="text-xs text-destructive">{ticketErrors[ticket.key]?.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`ticket-description-${ticket.key}`}>Description (optional)</Label>
                  <Input id={`ticket-description-${ticket.key}`} value={ticket.description} onChange={(e) => onTicketChange(ticket.key, "description", e.target.value)} placeholder="Perks or seat area" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`ticket-price-${ticket.key}`}>Price {requiredMark}</Label>
                  <Input id={`ticket-price-${ticket.key}`} type="number" min="0" step="1000" value={ticket.price} onChange={(e) => onTicketChange(ticket.key, "price", e.target.value)} placeholder="50000" />
                  {ticketErrors[ticket.key]?.price && <p className="text-xs text-destructive">{ticketErrors[ticket.key]?.price}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`ticket-currency-${ticket.key}`}>Currency {requiredMark}</Label>
                  <select id={`ticket-currency-${ticket.key}`} value={ticket.currency} onChange={(e) => onTicketChange(ticket.key, "currency", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`ticket-total-${ticket.key}`}>Total Seats {requiredMark}</Label>
                  <Input id={`ticket-total-${ticket.key}`} type="number" min="1" step="1" value={ticket.totalSeats} onChange={(e) => onTicketChange(ticket.key, "totalSeats", e.target.value)} placeholder="100" />
                  {ticketErrors[ticket.key]?.totalSeats && <p className="text-xs text-destructive">{ticketErrors[ticket.key]?.totalSeats}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`ticket-sale-start-date-${ticket.key}`}>Sale Start Date</Label>
                  <Input id={`ticket-sale-start-date-${ticket.key}`} type="date" value={ticket.saleStartDate} onChange={(e) => onTicketChange(ticket.key, "saleStartDate", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`ticket-sale-end-date-${ticket.key}`}>Sale End Date</Label>
                  <Input id={`ticket-sale-end-date-${ticket.key}`} type="date" value={ticket.saleEndDate} onChange={(e) => onTicketChange(ticket.key, "saleEndDate", e.target.value)} />
                  {ticketErrors[ticket.key]?.saleEndDate && <p className="text-xs text-destructive">{ticketErrors[ticket.key]?.saleEndDate}</p>}
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addTicketDraft}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Another Ticket Type
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        {mode === "create" && (
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>
        )}
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={(e) => submitWithIntent(e, "draft")}>
          {isSubmitting ? (
            <>
              <Save className="mr-2 h-4 w-4" /> Saving Draft...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </>
          )}
        </Button>
        <Button type="button" disabled={isSubmitting} onClick={(e) => submitWithIntent(e, "publish")}>
          {isSubmitting ? (
            <>
              <Save className="mr-2 h-4 w-4" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> {mode === "create" ? "Publish Event" : "Update & Publish"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
