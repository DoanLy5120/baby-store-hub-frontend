import axiosClient from "./axiosClient";

const warehouseApi = {
  getAll: () => axiosClient.get("/kho"),
  getById: (id) => axiosClient.get(`/kho/${id}`),
  create: (data) => axiosClient.post("/kho", data),
  update: (id, data) => axiosClient.post(`/kho/${id}`, data),
  delete: (id) => axiosClient.delete(`/kho/${id}`),
  getProducts: (id) => axiosClient.get(`/kho/${id}/san-pham`),
  getCategories: (id) => axiosClient.get(`/kho/${id}/danh-muc`),
};

export default warehouseApi;