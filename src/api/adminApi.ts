import { apiClient } from "./client";
import { type OrderResponse } from "./orderApi";
import type { Category } from "./productApi";

export interface AdminProductPayload {
  brand?: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  available: boolean;
  quantity: number;
  categoryIds: number[];
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
  isAvailable: boolean;
  quantity: number;
  reviewCount: number;
  rating: number;
  categories: { id: number; name: string }[];
}

export interface AdminUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
}

export interface AdminUserUpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  password?: string;
}

export interface CategoryPayload {
  name: string;
  imageUrl?: string;
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

  getAllUsers: () =>
    apiClient.get<AdminUserResponse[]>("/api/admin/users"),
  
  createUser: (payload: AdminUserCreatePayload) =>
    apiClient.post<AdminUserResponse>("/api/admin/users", payload),

  updateUser: (id: string, payload: AdminUserUpdatePayload) =>
    apiClient.put<AdminUserResponse>(`/api/admin/users/${id}`, payload),

  setActive: (id: string, active: boolean) =>
    apiClient.patch<AdminUserResponse>(`/api/admin/users/${id}/status`, null, {
      params: { active },
    }),

  getAllCategories: () =>
    apiClient.get<Category[]>("/api/admin/categories"), // 404 — this GET was never created

  createCategory: (payload: CategoryPayload) =>
    apiClient.post<Category>("/api/admin/categories", payload),

  updateCategory: (id: number, payload: CategoryPayload) =>
    apiClient.put<Category>(`/api/admin/categories/${id}`, payload),

  deleteCategory: (id: number) =>
    apiClient.delete(`/api/admin/categories/${id}`),
};