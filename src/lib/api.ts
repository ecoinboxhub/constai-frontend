import axios from "axios";
import { trackUIEvent } from "@/lib/uiEventTracker";

const rawBase: string = (import.meta as any).env.VITE_API_URL || "http://localhost:8008/api/v1";
let baseURL = rawBase;
try {
  if (!baseURL.endsWith("/api/v1")) {
    baseURL = baseURL.replace(/\/+$/, "") + "/api/v1";
  }
} catch (e) {
  baseURL = "http://localhost:8008/api/v1";
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    trackUIEvent("api_response", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
