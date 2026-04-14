import { apiClient } from "./client";

export interface OrderItemPayload {
  productId: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  userId: string;
  addressId: number;
  paymentMethod: "MPESA" | "COD";
  items: OrderItemPayload[];
}

export interface OrderResponse {
  id: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  address: {
    id: number;
    localityArea: string;
    cityTown?: string;
    county: string;
    country: string;
    mapsPin?: string;
  };
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    product: {
      id: number;
      name: string;
      imageUrl: string;
    };
  }[];
}

export const orderApi = {
  place: (payload: PlaceOrderPayload) =>
    apiClient.post<OrderResponse>("/api/order", payload),

  getMyOrders: () =>
    apiClient.get<OrderResponse[]>("/api/orders/my"),

  getById: (id: number) =>
    apiClient.get<OrderResponse>(`/api/order/${id}`),

  getAll: () =>
    apiClient.get<OrderResponse[]>("/api/orders")
};