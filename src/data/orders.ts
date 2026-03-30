import type { Order } from "@/types";
import { products } from "@/data/products";

export const mockOrders: Order[] = [
  {
    id: "ORD-2026-001",
    status: "delivered",
    createdAt: "2026-03-01T10:30:00Z",
    total: products[0].price + products[1].price,
    items: [
      { product: products[0], quantity: 1, selectedVariants: { Size: "UK 9", Color: "Black" } },
      { product: products[1], quantity: 1, selectedVariants: { Size: "M", Color: "Navy" } },
    ],
    shippingAddress: {
      id: "addr-1",
      line1: "14 Waiyaki Way",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00100",
      country: "KE",
      isDefault: true,
    },
  },
  {
    id: "ORD-2026-002",
    status: "shipped",
    createdAt: "2026-03-20T09:15:00Z",
    total: products[2].price * 2,
    items: [{ product: products[2], quantity: 2 }],
    shippingAddress: {
      id: "addr-1",
      line1: "14 Waiyaki Way",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00100",
      country: "KE",
      isDefault: true,
    },
  },
  {
    id: "ORD-2026-003",
    status: "processing",
    createdAt: "2026-03-28T14:45:00Z",
    total: products[3].price,
    items: [{ product: products[3], quantity: 1, selectedVariants: { Waist: "32", Length: "32" } }],
    shippingAddress: {
      id: "addr-1",
      line1: "14 Waiyaki Way",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00100",
      country: "KE",
      isDefault: true,
    },
  },
];
