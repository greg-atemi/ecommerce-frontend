import { apiClient } from "./client";
import { type OrderResponse } from "./orderApi";

export interface AdminProductPayload {
  brand?: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  available: boolean;
  quantity: number;
  categoryId: number;
  reviewCount?: number;
  rating?: number;
}

export interface AdminProductResponse {
  id: number;
  brand?: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  quantity: number;
  reviewCount: number;
  rating: number;
  category?: { id: number; name: string };
}

export const adminApi = {
  // ── Orders ──────────────────────────────────────────────────────────────
  getAllOrders: () =>
    apiClient.get<OrderResponse[]>("/api/admin/orders"),

  updateOrderStatus: (id: number, status: string) =>
    apiClient.put<OrderResponse>(`/api/admin/orders/${id}/status`, null, {
      params: { status },
    }),

  // ── Products ─────────────────────────────────────────────────────────────
  getAllProducts: () =>
    apiClient.get<AdminProductResponse[]>("/api/admin/products"),

  createProduct: (payload: AdminProductPayload) =>
    apiClient.post<AdminProductResponse>("/api/admin/products", payload),

  updateProduct: (id: number, payload: Partial<AdminProductPayload>) =>
    apiClient.put<AdminProductResponse>(`/api/admin/products/${id}`, payload),

  deleteProduct: (id: number) =>
    apiClient.delete(`/api/admin/products/${id}`),

  updateStock: (id: number, quantity: number) =>
    apiClient.patch<AdminProductResponse>(`/api/admin/products/${id}/stock`, null, {
      params: { quantity },
    }),
};