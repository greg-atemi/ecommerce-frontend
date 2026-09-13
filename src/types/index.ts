// ─── Product ───────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  brand: string;
  name: string;
  stock: number;
  images: string[];
  imageUrl: string | null;
  description: string;
  price: number;
  compareAtPrice: number | null;
  releaseDate: string | null;
  isAvailable: boolean;
  quantity: number;
  reviewCount: number | null;
  rating: number;
  categories: ProductCategory[];
}

export interface ProductCategory {
  id: number;
  name: string;
  imageUrl: string | null;
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
  firstName: string;
  lastName: string;
  name: string;
  role: string;   // ← needed by AdminRoute
  avatarUrl?: string;
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
