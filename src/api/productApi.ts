import { apiClient } from "./client";
import type { Product } from "@/types";

// ── Matches your actual API response exactly ──────────────────────────────────
interface BackendProduct {
  id: number;
  brand?: string;
  name: string;
  description: string;
  imageUrl?: string | null;           // single URL from backend
  price: number;
  compareAtPrice?: number | null;     // strikethrough price
  releaseDate?: string | null;
  available: boolean;
  quantity: number;
  reviewCount?: number;
  rating?: number;
  category?: { id: number; name: string } | null;
}

// ── Maps backend shape → frontend Product type ────────────────────────────────
function normalize(p: BackendProduct): Product {
  return {
    id:             String(p.id),
    name:           p.name,
    description:    p.description,
    price:          p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    // Wrap single imageUrl in an array; fall back to placeholder if missing
    images:         p.imageUrl
                      ? [p.imageUrl]
                      : ["https://placehold.co/400x400?text=No+Image"],
    category:       p.category?.name ?? "Uncategorised",
    tags:           [],
    rating:         p.rating ?? 0,
    reviewCount:    p.reviewCount ?? 0,
    stock:          p.quantity,
    variants:       [],
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  size?: number;
}

export interface ProductsPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const productApi = {
  getAll: async (filters: ProductFilters = {}): Promise<{ data: ProductsPage }> => {
    const res = await apiClient.get<BackendProduct[]>("/api/products", { params: filters });
    const normalized = res.data.map(normalize);
    return {
      data: {
        content:       normalized,
        totalElements: normalized.length,
        totalPages:    1,
        number:        0,
      },
    };
  },

  getById: async (id: string): Promise<{ data: Product }> => {
    const res = await apiClient.get<BackendProduct>(`/api/products/${id}`);
    return { data: normalize(res.data) };
  },

  getCategories: () =>
    apiClient.get<string[]>("/api/categories"),
};