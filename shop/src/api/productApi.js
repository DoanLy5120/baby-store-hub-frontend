import axiosClient from "./axiosClient";

const productApi = {
  getAll: () => axiosClient.get("/san-pham"),
  create: (data) => axiosClient.post("/san-pham", data),
  update: (id, data) => axiosClient.post(`/san-pham/${id}?_method=POST`, data),
  delete: (id) => axiosClient.delete(`/san-pham/${id}`),

  // Lọc theo danh mục
  getByCategory: (categoryId) =>
    axiosClient.get(`/san-pham/loc-theo-danh-muc/${categoryId}`),

  // Lọc theo kho
  getByWarehouse: (warehouseId) =>
    axiosClient.get(`/san-pham/loc-theo-kho/${warehouseId}`),
};

export default productApi;
