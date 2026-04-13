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

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status.toLowerCase()] ?? { label: status, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
