import { apiClient } from "./client";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/api/auth/register", payload),

  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/api/auth/login", payload),
};