import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/data/products";
import { orderApi, type OrderResponse } from "@/api/orderApi";
import { paymentApi } from "@/api/paymentApi";
import { addressApi, type AddressResponse } from "@/api/addressApi";

// ── Schemas ──────────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  addressId:     z.string().min(1, "Please select a delivery address"),
  paymentMethod: z.enum(["MPESA", "COD"]),
});

const mpesaSchema = z.object({
  transactionCode: z
    .string()
    .min(6, "Enter a valid M-Pesa transaction code"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
type MpesaForm    = z.infer<typeof mpesaSchema>;

const MPESA_TILL = "123456";

// ── Component ─────────────────────────────────────────────────────────────────

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated }      = useAuth();
  const navigate                       = useNavigate();

  const [submitError, setSubmitError]           = useState<string | null>(null);
  const [addresses, setAddresses]               = useState<AddressResponse[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // After order is placed, hold it here and show M-Pesa form
  const [pendingOrder, setPendingOrder] = useState<OrderResponse | null>(null);
  const [mpesaError, setMpesaError]     = useState<string | null>(null);

  const shipping = subtotal >= 5000 ? 0 : 350;
  const total    = subtotal + shipping;

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ── Load addresses ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingAddresses(true);
    addressApi.getMyAddresses()
      .then(({ data }) => setAddresses(data))
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, [isAuthenticated]);

  // ── Checkout form ────────────────────────────────────────────────────────
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { addressId: "", paymentMethod: "MPESA" },
  });

  const isSubmitting  = form.formState.isSubmitting;
  const paymentMethod = form.watch("paymentMethod");

  async function onSubmit(data: CheckoutForm) {
    setSubmitError(null);
    try {
      const { data: order } = await orderApi.place({
        userId:        user!.id,
        addressId:     Number(data.addressId),
        paymentMethod: data.paymentMethod,
        items:         items.map(({ product, quantity }) => ({
          productId: Number(product.id),
          quantity,
        })),
      });

      if (data.paymentMethod === "COD") {
        clearCart();
        navigate(`/account/orders/${order.id}?success=true`);
      } else {
        // MPESA: show payment step
        setPendingOrder(order);
      }
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message ?? "Failed to place order. Please try again."
      );
    }
  }

  // ── M-Pesa form ──────────────────────────────────────────────────────────
  const mpesaForm = useForm<MpesaForm>({
    resolver: zodResolver(mpesaSchema),
    defaultValues: { transactionCode: "" },
  });

  async function onMpesaSubmit(data: MpesaForm) {
    if (!pendingOrder) return;
    setMpesaError(null);
    try {
      await paymentApi.create({
        orderId:              pendingOrder.id,
        amount:               pendingOrder.totalAmount,
        transactionReference: data.transactionCode.toUpperCase(),
        paymentMethod:        "MPESA",
      });
      clearCart();
      navigate(`/account/orders/${pendingOrder.id}?success=true`);
    } catch (err: any) {
      setMpesaError(
        err.response?.data?.message ?? "Payment verification failed. Check your code and try again."
      );
    }
  }

  // ── Empty cart ───────────────────────────────────────────────────────────
  if (items.length === 0 && !pendingOrder) {
    return (
      <div className="container flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link to="/products">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  // ── M-Pesa payment step ──────────────────────────────────────────────────
  if (pendingOrder) {
    return (
      <div className="container py-10 max-w-md">
        <div className="rounded-lg border p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold">M-Pesa Payment</h1>
            <p className="text-sm text-muted-foreground">Order #{pendingOrder.id}</p>
          </div>

          <Separator />

          {/* Payment details */}
          <div className="rounded-md bg-muted/50 p-4 space-y-3 text-sm">
            <p className="font-medium">Payment details</p>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Till Number</span>
                <span className="font-bold">{MPESA_TILL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatPrice(pendingOrder.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm space-y-1.5">
            <p className="font-medium">How to pay</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to M-Pesa on your phone</li>
              <li>Select <span className="font-medium text-foreground">Lipa na M-Pesa</span></li>
              <li>Select <span className="font-medium text-foreground">Buy Goods & Services</span></li>
              <li>Enter Till Number <span className="font-bold text-foreground">{MPESA_TILL}</span></li>
              <li>Enter Amount <span className="font-bold text-foreground">{formatPrice(pendingOrder.totalAmount)}</span></li>
              <li>Enter your M-Pesa PIN and confirm</li>
            </ol>
          </div>

          <Separator />

          {/* Transaction code entry */}
          {mpesaError && (
            <Alert variant="destructive">
              <AlertDescription>{mpesaError}</AlertDescription>
            </Alert>
          )}

          <Form {...mpesaForm}>
            <form onSubmit={mpesaForm.handleSubmit(onMpesaSubmit)} className="space-y-4">
              <FormField
                control={mpesaForm.control}
                name="transactionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. QHX4K2ABCD"
                        className="uppercase tracking-widest"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={mpesaForm.formState.isSubmitting}
              >
                {mpesaForm.formState.isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying payment…</>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            Haven't paid yet?{" "}
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={() => setPendingOrder(null)}
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Main checkout form ───────────────────────────────────────────────────
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>

      {submitError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]"
        >
          {/* ── Left: address + payment ──────────────────────────────── */}
          <div className="space-y-8">

            {/* Address selection */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Delivery address</h2>
                <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                  <Link to="/account/address">
                    <Plus className="h-4 w-4" /> Add new
                  </Link>
                </Button>
              </div>

              {loadingAddresses ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading addresses…
                </div>
              ) : addresses.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed p-8 text-center space-y-3">
                  <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">No saved addresses</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add a delivery address to continue.
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/account/address">Add address</Link>
                  </Button>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="addressId"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <div className="space-y-2">
                        {addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => field.onChange(String(addr.id))}
                            className={`w-full text-left rounded-lg border p-4 transition-colors ${
                              field.value === String(addr.id)
                                ? "border-primary bg-primary/5"
                                : "hover:border-muted-foreground"
                            }`}
                          >
                            <p className="font-medium text-sm">{addr.localityArea}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {addr.cityTown && `${addr.cityTown}, `}{addr.county}, {addr.country}
                            </p>
                            {addr.mapsPin && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                📍 {addr.mapsPin}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </section>

            <Separator />

            {/* Payment method */}
            <section>
              <h2 className="text-base font-semibold">Payment method</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { value: "MPESA", label: "M-Pesa",            disabled: false },
                  { value: "COD",   label: "Cash on delivery",   disabled: true  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() =>
                      form.setValue("paymentMethod", opt.value as "MPESA" | "COD")
                    }
                    className={`rounded-md border p-3 text-sm font-medium transition-colors ${
                      opt.disabled
                        ? "cursor-not-allowed opacity-40"
                        : paymentMethod === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:border-muted-foreground"
                    }`}
                  >
                    {opt.label}
                    {opt.disabled && (
                      <span className="ml-1.5 text-xs font-normal">(coming soon)</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || addresses.length === 0}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing order…</>
              ) : paymentMethod === "MPESA" ? (
                `Continue to M-Pesa · ${formatPrice(total)}`
              ) : (
                `Place order · ${formatPrice(total)}`
              )}
            </Button>
          </div>

          {/* ── Right: order summary ─────────────────────────────────── */}
          <aside>
            <div className="sticky top-24 rounded-lg border p-6 space-y-4">
              <h2 className="text-base font-semibold">Order summary</h2>
              <ul className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-14 w-14 rounded-md object-cover"
                      />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(product.price)} each
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </form>
      </Form>
    </div>
  );
}