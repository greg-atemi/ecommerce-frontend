import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";
import { mockOrders } from "@/data/orders";
import { formatPrice } from "@/data/products";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Order history</h2>
        <p className="text-sm text-muted-foreground">
          {mockOrders.length} order{mockOrders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {mockOrders.length === 0 ? (
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
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} item
                    {order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(order.total)}
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
