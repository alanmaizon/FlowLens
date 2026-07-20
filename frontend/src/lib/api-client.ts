import axios from "axios";

import { getStoredSession } from "@/lib/session";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { Accept: "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.request.use((config) => {
  const session = getStoredSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

type ValidationErrorDetail = {
  msg?: string;
};

type ApiErrorBody = {
  detail?: string | ValidationErrorDetail[];
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  const detail = error.response?.data.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return (
      detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(" ") || fallback
    );
  }
  return fallback;
}
