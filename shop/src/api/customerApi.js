// src/api/customerApi.js
import axiosClient from "./axiosClient";

const customerApi = {
  getAll: () => axiosClient.get("/khach-hang"),
  getById: (id) => axiosClient.get(`/khach-hang/${id}`),
  timKiem: (query) => 
    axiosClient.get("/khach-hang", { params: { search: query } }),
  themKhachHang: (data) => axiosClient.post("/khach-hang", data),
};

export default customerApi;
