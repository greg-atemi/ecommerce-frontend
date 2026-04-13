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
}

export const paymentApi = {
  create: (payload: CreatePaymentPayload) =>
    apiClient.post<PaymentResponse>("/api/payment", payload),
};