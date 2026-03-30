import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }
> = {
  pending:    { label: "Pending",    variant: "outline" },
  processing: { label: "Processing", variant: "secondary" },
  shipped:    { label: "Shipped",    variant: "default" },
  delivered:  { label: "Delivered",  variant: "success" },
  cancelled:  { label: "Cancelled",  variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
