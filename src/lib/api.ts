import axios from "axios";
import { trackUIEvent } from "@/lib/uiEventTracker";

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Interceptor for JWT tokens and API diagnostics
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  trackUIEvent("api_request", {
    method: config.method,
    url: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
    data: config.data,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    trackUIEvent("api_response", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const response = error?.response;
    trackUIEvent("api_error", {
      message: error?.message,
      url: response?.config?.url || error?.config?.url,
      status: response?.status,
      data: response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;
