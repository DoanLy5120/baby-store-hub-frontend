// src/api/billApi.js
import axiosClient from "./axiosClient";

const billApi = {
  getAll: (config = {}) => axiosClient.get("/hoa-don", config),
  update: (id, data) => axiosClient.put(`/hoa-don/${id}`, data),
  delete: (id) => axiosClient.delete(`/hoa-don/${id}`),
  getById: (id) => axiosClient.get(`/hoa-don/${id}`), 
  thanhToan: (data) => axiosClient.post("/thanh-toan", data),
};

export default billApi;
