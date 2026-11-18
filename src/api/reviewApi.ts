// import api from "@/api/axios"; // ← same client as orderApi
import { apiClient } from "./client";

export interface OrderItemReview {
    id: number;
    rating: number;
    comment: string | null;
    anonymous: boolean;
}

export interface ReviewPayload {
    rating: number;
    comment?: string;
    anonymous: boolean;
}

export const reviewApi = {
    create: (orderItemId: number, payload: ReviewPayload) =>
        apiClient.post<OrderItemReview>(`/api/order-items/${orderItemId}/review`, payload),

    update: (orderItemId: number, payload: ReviewPayload) =>
        apiClient.put<OrderItemReview>(`/api/order-items/${orderItemId}/review`, payload),
};