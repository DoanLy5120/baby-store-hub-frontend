// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://web-production-c18cf.up.railway.app/api", 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tự động gắn token nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
