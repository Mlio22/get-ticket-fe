import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, ORDER_ENDPOINTS, ORDER_STATUS_LABELS, ORGANIZER_ROUTES, PUBLIC_ROUTES, USER_ROUTES } from "@/constants";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import type { DataResponse, Event, ListResponse } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { formatCurrency } from "@/utils/currency";
import { formatEventDate } from "@/utils/timezone";
import { ArrowRight, Loader2, ReceiptText, RefreshCcw } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

type OrderListItem = {
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
  items?: Array<{ ticketTypeId: string; ticketName?: string; quantity: number }>;
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
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-base">{order.event?.title ?? "Order"}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Order #{order.id.slice(-8).toUpperCase()} • {safeDate(order.createdAt)}
                      </p>
                      <p className="text-sm mt-1">
                        {order.totalQuantity} ticket{order.totalQuantity > 1 ? "s" : ""} • {formatCurrency(order.totalAmount, order.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === "paid" ? "default" : "secondary"} className="capitalize">
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={USER_ROUTES.MY_ORDER_DETAIL(order.id)}>
                          Detail <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
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
