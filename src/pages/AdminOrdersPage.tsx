import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi } from "@/api/adminApi";
import { type OrderResponse } from "@/api/orderApi";
import { formatPrice } from "@/data/products";

const ORDER_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "secondary",
  SHIPPED:    "default",
  DELIVERED:  "success",
  CANCELLED:  "destructive",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID:    "default",
  PENDING: "secondary",
  UNPAID:  "destructive",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export function AdminOrdersPage() {
  const [orders, setOrders]     = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    adminApi.getAllOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Failed to load orders."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(orderId: number, status: string) {
    setUpdating(orderId);
    try {
      const { data: updated } = await adminApi.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? updated : o));
    } catch {
      setError(`Failed to update order #${orderId}.`);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${orders.length} total orders`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(order as any).user?.firstName} {(order as any).user?.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} item
                    {order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={(PAYMENT_COLORS[order.paymentStatus] ?? "secondary") as any}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {updating === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Select
                          value={order.orderStatus}
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
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