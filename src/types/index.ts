// ─── Product ───────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;       // e.g. "Size", "Color"
  options: string[];  // e.g. ["S", "M", "L"]
}

// ─── Cart ───────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>; // { Size: "M", Color: "Black" }
}

// ─── User / Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  productId: string;
  author: string;
  avatarUrl?: string;
  rating: number; // 1-5
  title: string;
  body: string;
  createdAt: string;
  verified: boolean;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItem {
  productId: string;
  addedAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: Address;
}
