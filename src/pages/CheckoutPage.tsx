import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  county: z.string().min(1, "County is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["mpesa", "card", "cod"]),
  mpesaNumber: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const KE_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Nyeri", "Machakos", "Kisii", "Kakamega",
];

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      county: "",
      postalCode: "",
      paymentMethod: "mpesa",
      mpesaNumber: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const shipping = subtotal >= 500000 ? 0 : 35000; // free shipping over KSh 5,000
  const total = subtotal + shipping;

  function onSubmit(data: CheckoutForm) {
    console.log("Order submitted:", data);
    // TODO: integrate with backend / payment gateway
    alert("Order placed! (Demo only)");
    clearCart();
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild><Link to="/products">Continue shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">

          {/* Left: details */}
          <div className="space-y-8">
            {/* Contact */}
            <section>
              <h2 className="text-base font-semibold">Contact information</h2>
              <div className="mt-4 grid gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (M-Pesa)</FormLabel>
                    <FormControl><Input placeholder="+254 7XX XXX XXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            <Separator />

            {/* Shipping */}
            <section>
              <h2 className="text-base font-semibold">Shipping address</h2>
              <div className="mt-4 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street address</FormLabel>
                    <FormControl><Input placeholder="14 Waiyaki Way" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Town</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="county" render={({ field }) => (
                    <FormItem>
                      <FormLabel>County</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {KE_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </section>

            <Separator />

            {/* Payment */}
            <section>
              <h2 className="text-base font-semibold">Payment method</h2>
              <div className="mt-4 space-y-3">
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "mpesa", label: "M-Pesa" },
                        { value: "card", label: "Card" },
                        { value: "cod", label: "Cash on delivery" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`rounded-md border p-3 text-sm font-medium transition-colors ${
                            field.value === opt.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "hover:border-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                {paymentMethod === "mpesa" && (
                  <FormField control={form.control} name="mpesaNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>M-Pesa number</FormLabel>
                      <FormControl><Input placeholder="07XX XXX XXX" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                {paymentMethod === "card" && (
                  <p className="text-sm text-muted-foreground">
                    Card payment integration (Stripe / Flutterwave) goes here.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right: order summary */}
          <aside>
            <div className="sticky top-24 rounded-lg border p-6 space-y-4">
              <h2 className="text-base font-semibold">Order summary</h2>
              <ul className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img src={product.images[0]} alt="" className="h-14 w-14 rounded-md object-cover" />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(product.price * quantity)}</p>
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

              <Button type="submit" className="w-full" size="lg">
                Place order
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By placing your order you agree to our{" "}
                <Link to="/terms" className="underline hover:text-foreground">terms of service</Link>.
              </p>
            </div>
          </aside>
        </form>
      </Form>
    </div>
  );
}
