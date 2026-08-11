import { apiClient } from "./client";

export interface CreatePaymentPayload {
  orderId:              number;
  amount:               number;
  transactionReference: string;
  paymentMethod:        "MPESA" | "COD";
}

export interface PaymentResponse {
  id:                   number;
  amount:               number;
  transactionReference: string;
  paymentMethod:        string;
  paidAt:               string;
  order: {
    id:          number;
    totalAmount: number;
    orderStatus: string;
    items: {
      id:       number;
      quantity: number;
      subTotal: number;
      product: {
        id:       number;
        name:     string;
        imageUrl: string;
        category?: { id: number; name: string };
      };
    }[];
    createdAt: string;
  };
}

export const paymentApi = {
  create: (payload: CreatePaymentPayload) =>
    apiClient.post<PaymentResponse>("/api/payment", payload),

  getAll: () =>
    apiClient.get<PaymentResponse[]>("/api/payments"),
};