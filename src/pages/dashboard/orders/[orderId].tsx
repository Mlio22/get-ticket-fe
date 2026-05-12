import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, ORDER_ENDPOINTS, ORDER_STATUS_LABELS, ORGANIZER_ROUTES, PUBLIC_ROUTES, USER_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, Event } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { formatCurrency } from "@/utils/currency";
import { formatEventDate } from "@/utils/timezone";
import { ArrowLeft, Calendar, ExternalLink, Loader2, ReceiptText, RefreshCcw } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

type OrderDetail = {
  id: string;
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
  items?: Array<{ ticketTypeId: string; ticketName?: string; quantity: number; unitPrice?: number; lineTotal?: number }>;
};

function safeDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return formatEventDate(dateStr, undefined, "dd MMM yyyy, HH:mm");
  } catch {
    return dateStr;
  }
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId || typeof orderId !== "string") return;

    setIsFetching(true);
    setError(null);
    try {
      const { data } = await eventApiClient.get<DataResponse<OrderDetail>>(ORDER_ENDPOINTS.DETAIL(orderId));
      setOrder(data.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.errorMessage ||
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })?.response?.data
          ?.message ||
        "Failed to load order detail.";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoading && !isAuthenticated) {
      const redirectTarget = typeof orderId === "string" ? USER_ROUTES.MY_ORDER_DETAIL(orderId) : USER_ROUTES.MY_ORDERS;
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=${redirectTarget}`);
      return;
    }

    if (!isLoading && user?.role === "organizer") {
      router.replace(ORGANIZER_ROUTES.EVENTS);
      return;
    }

    fetchOrder();
  }, [fetchOrder, hasHydrated, isAuthenticated, isLoading, orderId, router, user]);

  if (!hasHydrated || !isAuthenticated || user?.role === "organizer") return null;

  return (
    <DashboardLayout>
      <Head>
        <title>Order Detail - {APP_NAME}</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <Button asChild variant="ghost" size="sm" className="px-0 text-muted-foreground">
              <Link href={USER_ROUTES.MY_ORDERS}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
              </Link>
            </Button>
            <h1 className="text-2xl font-bold mt-1">Order Detail</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrder} disabled={isFetching}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <ReceiptText className="h-10 w-10 mx-auto mb-3 text-destructive opacity-80" />
              <p className="font-medium">Could not load order</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </CardContent>
          </Card>
        ) : isFetching || !order ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{order.event?.title ?? "Order"}</CardTitle>
                  <Badge variant={order.status === "paid" ? "default" : "secondary"} className="capitalize">
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Order #{order.id.slice(-8).toUpperCase()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.event ? (
                  <div className="rounded-md border p-3">
                    <p className="font-medium">{order.event.title}</p>
                    <p className="text-muted-foreground mt-1 inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {safeDate(order.event.startDate)}
                    </p>
                    <p className="text-muted-foreground">{order.event.location}</p>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  {order.items?.length ? (
                    <div className="rounded-md border divide-y">
                      {order.items.map((item, idx) => (
                        <div key={`${item.ticketTypeId}-${idx}`} className="p-3 flex items-center justify-between gap-3 text-sm">
                          <div>
                            <p>{item.ticketName ?? "Ticket"}</p>
                            <p className="text-muted-foreground">x{item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.lineTotal ?? 0, order.currency)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No item detail available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receipt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tickets</span><span>{order.totalQuantity}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatCurrency(order.totalAmount, order.currency)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{order.paymentMethod ?? "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ordered</span><span>{safeDate(order.createdAt)}</span></div>
                {order.paidAt ? <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>{safeDate(order.paidAt)}</span></div> : null}
                {!order.paidAt && order.expiresAt ? <div className="flex justify-between"><span className="text-muted-foreground">Expires</span><span>{safeDate(order.expiresAt)}</span></div> : null}

                {order.failureReason ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {order.failureReason}
                  </div>
                ) : null}

                {order.invoiceUrl ? (
                  <Button asChild size="sm" className="w-full">
                    <Link href={order.invoiceUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Open Invoice / Payment Page
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
