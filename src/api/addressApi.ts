import { apiClient } from "./client";

export interface AddressPayload {
  localityArea: string;
  county: string;
  country?: string;
  mapsPin?: string;
  cityTown?: string;
}

export interface AddressResponse {
  id: number;
  localityArea: string;
  cityTown?: string;
  county: string;
  country: string;
  mapsPin?: string;
}

export const addressApi = {
  // Step 1: create the address entity (no auth required)
  create: (payload: AddressPayload) =>
    apiClient.post<AddressResponse>("/api/address", payload),

  // Step 2: assign the created address to the logged-in user (JWT required)
  assign: (addressId: number) =>
    apiClient.post<AddressResponse>(`/api/address/${addressId}/assign`),

  // Convenience: create then assign in one call
  createAndAssign: async (payload: AddressPayload) => {
    const { data: address } = await apiClient.post<AddressResponse>("/api/address", payload);
    return apiClient.post<AddressResponse>(`/api/address/${address.id}/assign`);
  },

  // Get addresses belonging to the logged-in user
  getMyAddresses: () =>
    apiClient.get<AddressResponse[]>("/api/address/my"),

  delete: (id: number) =>
    apiClient.delete(`/api/address/${id}`),
};