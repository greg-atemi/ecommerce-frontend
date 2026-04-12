import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, MapPin, CreditCard, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";
import { orderApi, type OrderResponse } from "@/api/orderApi";
import { formatPrice } from "@/data/products";

const STATUS_STEPS = ["PROCESSING", "SHIPPED", "DELIVERED"];

function getProgressValue(status: string): number {
  if (status === "CANCELLED") return 0;
  const idx = STATUS_STEPS.indexOf(status.toUpperCase());
  if (idx === -1) return 0;
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
  const [order, setOrder]     = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setIsLoading(true);
    orderApi.getById(Number(orderId))
      .then(({ data }) => setOrder(data))
      .catch(() => setError("Failed to load order. Please try again."))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1 text-muted-foreground" asChild>
          <Link to="/account/orders">
            <ChevronLeft className="h-4 w-4" /> Back to orders
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error ?? "Order not found."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const shipping = order.totalAmount >= 5000 ? 0 : 350;

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">

      {/* Back + header */}
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2 gap-1 text-muted-foreground" asChild>
          <Link to="/account/orders">
            <ChevronLeft className="h-4 w-4" /> Back to orders
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Order #{order.id}</h2>
            {order.createdAt && (
              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
            )}
          </div>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Progress tracker */}
      {order.orderStatus.toUpperCase() !== "CANCELLED" && (
        <div className="rounded-lg border p-5 space-y-3">
          <p className="text-sm font-medium">Fulfilment progress</p>
          <Progress value={getProgressValue(order.orderStatus)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {STATUS_STEPS.map((step) => (
              <span
                key={step}
                className={
                  STATUS_STEPS.indexOf(step) <=
                  STATUS_STEPS.indexOf(order.orderStatus.toUpperCase())
                    ? "font-medium text-foreground"
                    : ""
                }
              >
                {step.charAt(0).toUpperCase() + step.slice(1).toLowerCase()}
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
            {order.items.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No items found.</p>
            ) : (
              order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${item.product.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.product.name}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Qty {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.subTotal)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount + shipping)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.address && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Shipping address
              </h3>
              <div className="text-sm text-muted-foreground space-y-0.5">
                {order.address.localityArea && <p>{order.address.localityArea}</p>}
                {order.address.cityTown && <p>{order.address.cityTown}</p>}
                <p>{order.address.county}, {order.address.country}</p>
                {order.address.mapsPin && (
                  <a
                    href={order.address.mapsPin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {order.orderStatus.toUpperCase() === "DELIVERED" && (
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