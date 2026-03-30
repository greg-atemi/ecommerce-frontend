import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronLeft, MapPin, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";
import { mockOrders } from "@/data/orders";
import { formatPrice } from "@/data/products";
import type { OrderStatus } from "@/types";

const STATUS_STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

function getProgressValue(status: OrderStatus): number {
  if (status === "cancelled") return 0;
  const idx = STATUS_STEPS.indexOf(status);
  return Math.round(((idx + 1) / STATUS_STEPS.length) * 100);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = mockOrders.find((o) => o.id === orderId);

  if (!order) return <Navigate to="/account/orders" replace />;

  const { line1, line2, city, state, postalCode, country } = order.shippingAddress;
  const shipping = 35000;
  const tax = Math.round(order.total * 0.16);

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2 gap-1 text-muted-foreground" asChild>
          <Link to="/account/orders">
            <ChevronLeft className="h-4 w-4" /> Back to orders
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{order.id}</h2>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== "cancelled" && (
        <div className="rounded-lg border p-5 space-y-3">
          <p className="text-sm font-medium">Fulfilment progress</p>
          <Progress value={getProgressValue(order.status)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {STATUS_STEPS.map((step) => (
              <span
                key={step}
                className={
                  STATUS_STEPS.indexOf(step) <=
                  STATUS_STEPS.indexOf(order.status)
                    ? "font-medium text-foreground"
                    : ""
                }
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Items — spans 2 cols */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-medium">Items ordered</h3>
          <div className="rounded-lg border divide-y">
            {order.items.map(({ product, quantity, selectedVariants }) => (
              <div key={product.id} className="flex gap-4 p-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      to={`/products/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                    {selectedVariants && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {Object.entries(selectedVariants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Qty {quantity}</span>
                    <span className="font-medium">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          {/* Price breakdown */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment summary
            </h3>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (16%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total + shipping + tax)}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Shipping address
            </h3>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>{line1}</p>
              {line2 && <p>{line2}</p>}
              <p>
                {city}, {state}
              </p>
              {postalCode && <p>{postalCode}</p>}
              <p>{country}</p>
            </div>
          </div>

          {/* Actions */}
          {order.status === "delivered" && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" /> Need help?
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Request return
                </Button>
                <Button variant="ghost" size="sm" className="w-full">
                  Contact support
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
