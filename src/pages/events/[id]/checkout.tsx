import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES } from "@/constants";
import { INVOICE_ENDPOINTS } from "@/constants/api";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuthStore } from "@/stores/authStore";
import type { CheckoutItem, CreateInvoiceRequestDto, DataResponse, InvoiceResponse } from "@/types";
import { eventApiClient } from "@/utils/axios";
import { formatTicketPrice } from "@/utils/currency";
import { AlertCircle, ArrowLeft, Loader2, ShoppingCart, Ticket } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, hasHydrated, user } = useAuthStore();

  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: redirect to login when not authenticated
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace(`${PUBLIC_ROUTES.LOGIN}?redirect=/events/${id}/checkout`);
      return;
    }
    if (user?.role === "organizer") {
      router.replace(ORGANIZER_ROUTES.EVENTS);
    }
  }, [hasHydrated, isAuthenticated, id, router, user]);

  // Read cart from sessionStorage
  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const raw = sessionStorage.getItem(`cart_${id}`);
    if (!raw) {
      router.replace(PUBLIC_ROUTES.EVENT_DETAIL(id));
      return;
    }
    try {
      const parsed: CheckoutItem[] = JSON.parse(raw);
      if (!parsed.length) {
        router.replace(PUBLIC_ROUTES.EVENT_DETAIL(id));
        return;
      }
      setCartItems(parsed);
    } catch {
      router.replace(PUBLIC_ROUTES.EVENT_DETAIL(id));
    }
  }, [id, router]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currency = cartItems[0]?.currency ?? "IDR";

  const handlePayment = async () => {
    if (!id || typeof id !== "string" || !user) return;

    setIsLoading(true);
    setError(null);

    const payload: CreateInvoiceRequestDto = {
      eventId: id,
      items: cartItems.map((item) => ({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
      })),
      successRedirectUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/tickets`,
      failureRedirectUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/events/${id}/checkout`,
    };

    try {
      const res = await eventApiClient.post<DataResponse<InvoiceResponse>>(
        INVOICE_ENDPOINTS.CREATE,
        payload
      );
      const invoice = res.data.data;
      // Clear cart and redirect to Xendit payment page
      sessionStorage.removeItem(`cart_${id}`);
      window.location.href = invoice.invoiceUrl;
    } catch (err) {
      const msg =
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })
          ?.response?.data?.errorMessage ??
        (err as { response?: { data?: { errorMessage?: string; message?: string } } })
          ?.response?.data?.message ??
        "Failed to create invoice. Please try again.";
      setError(msg);
      setIsLoading(false);
    }
  };

  if (!hasHydrated || !isAuthenticated || user?.role === "organizer") return null;

  if (!cartItems.length) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Checkout – {APP_NAME}</title>
      </Head>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link
          href={typeof id === "string" ? PUBLIC_ROUTES.EVENT_DETAIL(id) : PUBLIC_ROUTES.EVENTS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Event
        </Link>

        <h1 className="text-2xl font-bold mb-6">Order Summary</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Your Tickets ({totalQty} item{totalQty !== 1 ? "s" : ""})
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.ticketTypeId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTicketPrice(item.price, item.currency)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  {formatTicketPrice(item.price * item.quantity, item.currency)}
                </span>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatTicketPrice(totalAmount, currency)}</span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {error && (
              <div className="w-full flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center w-full">
              You will be redirected to Xendit secure payment page to complete your purchase.
            </p>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating invoice…
                </>
              ) : (
                `Pay ${formatTicketPrice(totalAmount, currency)} via Xendit`
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
