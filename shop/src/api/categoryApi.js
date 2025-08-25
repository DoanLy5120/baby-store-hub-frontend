
import axiosClient from "./axiosClient";

const categoryApi = {
  getAll: () => axiosClient.get("/danh-muc"),

  getById: (id) => axiosClient.get(`/danh-muc/${id}`),

  create: (data) =>
    axiosClient.post("/danh-muc", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, data) =>
    axiosClient.post(`/danh-muc/${id}?_method=POST`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  delete: (id) => axiosClient.delete(`/danh-muc/${id}`),

  getHomePage: (config = {}) => axiosClient.get("/khachHang/danh-muc", config),

  getProductsByCategory: (danhMucId, config = {}) =>
    axiosClient.get(`/khachHang/danh-muc/${danhMucId}/san-pham`, config),
};

export default categoryApi;
