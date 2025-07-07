import axiosClient from "./axiosClient";

const productApi = {
  getAll: () => axiosClient.get("/san-pham"),
  create: (data) => axiosClient.post("/san-pham", data),
  update: (id, data) => axiosClient.post(`/san-pham/${id}?_method=POST`, data),
  delete: (id) => axiosClient.delete(`/san-pham/${id}`),

  getByCategory: (categoryId) =>
    axiosClient.get(`/danh-muc/${categoryId}/san-pham`),

  getByWarehouse: (warehouseId) =>
  axiosClient.get(`/san-pham/kho/${warehouseId}?_=${Date.now()}`),
};

export default productApi;
