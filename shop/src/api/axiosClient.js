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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại!";

    if (error.response && error.response.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      if (error.response.data.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors)
          .flat()
          .join(", "); 
      }
    }
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default axiosClient;
