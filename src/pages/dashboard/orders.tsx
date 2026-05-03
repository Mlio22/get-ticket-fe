import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, ORDER_ENDPOINTS, ORDER_STATUS_LABELS, ORGANIZER_ROUTES, PUBLIC_ROUTES, USER_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, Event, ListResponse } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { formatCurrency } from "@/utils/currency";
import { formatEventDate } from "@/utils/timezone";
import { Calendar, ExternalLink, Loader2, ReceiptText, RefreshCcw } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

type OrderListItem = {
  id: string;
  checkoutId?: string;
  externalId?: string;
  userId: string;
  status: string;
  event?: Event;
  invoiceUrl?: string;
  paymentMethod?: string;
  totalQuantity: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  expiresAt?: string;
  paidAt?: string;
  failureReason?: string;
  items?: Array<{ ticketTypeId: string; quantity: number }>;
};

type OrdersResponse =
  | ListResponse<OrderListItem>
  | DataResponse<OrderListItem[] | OrderListItem>
  | DataResponse<{ list?: OrderListItem[]; items?: OrderListItem[]; data?: OrderListItem[] }>;

function normalizeOrders(data: OrdersResponse): OrderListItem[] {
  if ("list" in data) return data.list;

  if (Array.isArray(data.data)) return data.data;

  if (data.data && typeof data.data === "object") {
    const wrapper = data.data as { list?: OrderListItem[]; items?: OrderListItem[]; data?: OrderListItem[] };
    if (Array.isArray(wrapper.list)) return wrapper.list;
    if (Array.isArray(wrapper.items)) return wrapper.items;
    if (Array.isArray(wrapper.data)) return wrapper.data;

    const one = data.data as OrderListItem;
    if (one.id) return [one];
  }

  return [];
}

function safeDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return formatEventDate(dateStr, undefined, "dd MMM yyyy, HH:mm");
  } catch {
    return dateStr;
  }
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const { data } = await eventApiClient.get<OrdersResponse>(ORDER_ENDPOINTS.LIST);
      setOrders(normalizeOrders(data));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.errorMessage ||
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.message ||
        "Failed to load your orders.";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoading && !isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${USER_ROUTES.MY_ORDERS}`);
      return;
    }

    if (!isLoading && user?.role === "organizer") {
      router.replace(ORGANIZER_ROUTES.EVENTS);
      return;
    }

    fetchOrders();
  }, [fetchOrders, hasHydrated, isAuthenticated, isLoading, router, user]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  if (!hasHydrated || !isAuthenticated || user?.role === "organizer") return null;

  return (
    <DashboardLayout>
      <Head>
        <title>My Orders - {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isFetching}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <ReceiptText className="h-10 w-10 mx-auto mb-3 text-destructive opacity-80" />
              <p className="font-medium">Could not load orders</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={fetchOrders} className="mt-4" variant="outline" size="sm">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : isFetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sortedOrders.length > 0 ? (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-base">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                    <Badge variant={order.status === "paid" ? "default" : "secondary"} className="capitalize">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p><span className="text-muted-foreground">id:</span> {order.id}</p>
                    <p><span className="text-muted-foreground">checkoutId:</span> {order.checkoutId ?? "-"}</p>
                    <p><span className="text-muted-foreground">externalId:</span> {order.externalId ?? "-"}</p>
                    <p><span className="text-muted-foreground">userId:</span> {order.userId}</p>
                    <p><span className="text-muted-foreground">status:</span> {order.status}</p>
                    <p><span className="text-muted-foreground">paymentMethod:</span> {order.paymentMethod ?? "-"}</p>
                    <p><span className="text-muted-foreground">totalQuantity:</span> {order.totalQuantity}</p>
                    <p>
                      <span className="text-muted-foreground">totalAmount:</span>{" "}
                      {formatCurrency(order.totalAmount, order.currency)}
                    </p>
                    <p><span className="text-muted-foreground">currency:</span> {order.currency}</p>
                    <p><span className="text-muted-foreground">createdAt:</span> {safeDate(order.createdAt)}</p>
                    <p><span className="text-muted-foreground">expiresAt:</span> {safeDate(order.expiresAt)}</p>
                    <p><span className="text-muted-foreground">paidAt:</span> {safeDate(order.paidAt)}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">event:</p>
                    {order.event ? (
                      <div className="rounded-md border p-3">
                        <p className="font-medium">{order.event.title}</p>
                        <p className="text-muted-foreground mt-1 inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {safeDate(order.event.startDate)}
                        </p>
                        <p className="text-muted-foreground">{order.event.location}</p>
                      </div>
                    ) : (
                      <p>-</p>
                    )}
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">failureReason:</p>
                    <p>{order.failureReason ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">items:</p>
                    {order.items?.length ? (
                      <div className="rounded-md border divide-y">
                        {order.items.map((item, idx) => (
                          <div key={`${item.ticketTypeId}-${idx}`} className="p-3 flex items-center justify-between">
                            <span>{item.ticketTypeId}</span>
                            <span className="font-medium">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>-</p>
                    )}
                  </div>

                  {order.invoiceUrl ? (
                    <div className="pt-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={order.invoiceUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Open Invoice
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <ReceiptText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your order history will appear here after checkout.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href={PUBLIC_ROUTES.EVENTS}>Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
