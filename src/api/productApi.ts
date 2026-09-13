import { apiClient } from "./client";
import type { Product } from "@/types";

// ── Matches your actual API response exactly ──────────────────────────────────
interface BackendProduct {
  id: number;
  brand?: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  price: number;
  compareAtPrice?: number | null;
  releaseDate?: string | null;
  isAvailable: boolean;                              // was `available`
  quantity: number;
  reviewCount?: number;
  rating?: number;
  categories?: { id: number; name: string; imageUrl: string | null }[];  // was singular `category`
}

// ── Maps backend shape → frontend Product type ────────────────────────────────
function normalize(p: BackendProduct): Product {
  return {
    id:             String(p.id),
    brand:          p.brand ?? "",
    name:           p.name,
    description:    p.description,
    price:          p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    images:         p.imageUrl
                      ? [p.imageUrl]
                      : ["https://placehold.co/400x400?text=No+Image"],
    imageUrl:       p.imageUrl ?? null,
    categories:     p.categories ?? [],               // pass array through as-is
    releaseDate:    p.releaseDate ?? null,
    isAvailable:    p.isAvailable,                    // now actually mapped
    rating:         p.rating ?? 0,
    reviewCount:    p.reviewCount ?? 0,
    quantity:       p.quantity,
    stock:          p.quantity,
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

export interface Category {
  id: number;
  name: string;
  imageUrl: string | null;
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
    apiClient.get<Category[]>("/api/category"),
};