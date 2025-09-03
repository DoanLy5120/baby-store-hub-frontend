import axiosClient from "./axiosClient";

const productApi = {
  getAll: () => axiosClient.get("/san-pham"),
  create: (data) =>
    axiosClient.post("/san-pham", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    axiosClient.post(`/san-pham/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => axiosClient.delete(`/san-pham/${id}`),
  getById: (id) => axiosClient.get(`/san-pham/${id}`),
  getByCategory: (categoryId) => axiosClient.get(`/danh-muc/${categoryId}/san-pham`),
  search: (query) => axiosClient.post("/ban-hang/san-pham", { noiDungTim: query }),
  searchHeader: (keyword) =>
    axiosClient.post("/khachHang/san-pham/tim-kiem", { noiDungTim: keyword }),
  getHotProducts: () => axiosClient.get("/khachHang/san-pham"),
  getByIdForCustomer: (id) => axiosClient.get(`/khachHang/san-pham/${id}`),
  changeNoiBat: (id) => axiosClient.post(`/san-pham/change-noi-bat/${id}`), 
};

export default productApi;