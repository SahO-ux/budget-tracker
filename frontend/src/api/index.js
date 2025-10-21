import axios from "axios";

import { getStoredToken } from "../utils/storage";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((cfg) => {
  const token = getStoredToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default API;
