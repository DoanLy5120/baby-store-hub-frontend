import axiosClient from "./axiosClient";

const productApi = {
  getAll: () => axiosClient.get("/san-pham"),
  create: (data) => axiosClient.post("/san-pham", data),
  update: (id, data) => axiosClient.post(`/san-pham/${id}?_method=POST`, data),
  delete: (id) => axiosClient.delete(`/san-pham/${id}`),
  getById: (id) => axiosClient.get(`/san-pham/${id}`),

  getByCategory: (categoryId) =>
    axiosClient.get(`/danh-muc/${categoryId}/san-pham`),

  search: (query) =>
    axiosClient.post("/ban-hang/san-pham", {
      noiDungTim: query,
    }),

  searchHeader: (keyword) => {
    return axiosClient.post("/khachHang/san-pham/tim-kiem", {
      noiDungTim: keyword,
    });
  },

  getHotProducts: () => axiosClient.get("/khachHang/san-pham"),

  getByIdForCustomer: (id) => axiosClient.get(`/khachHang/san-pham/${id}`),
};

export default productApi;
