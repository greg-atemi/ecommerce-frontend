import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";
import { orderApi, type OrderResponse } from "@/api/orderApi";
import { formatPrice } from "@/data/products";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function OrdersPage() {
  const [orders, setOrders]   = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    orderApi.getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Failed to load orders. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-6 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Order history</h2>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              When you place an order it will appear here.
            </p>
          </div>
          <Button asChild>
            <Link to="/products">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.orderStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} item
                    {order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/account/orders/${order.id}`} className="flex items-center gap-1">
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}