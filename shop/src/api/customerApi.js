// src/api/customerApi.js
import axiosClient from "./axiosClient";

const customerApi = {
  getAll: () => axiosClient.get("/khach-hang"),
  getById: (id) => axiosClient.get(`/khach-hang/${id}`),
  timKiem: (query) =>
    axiosClient.get("/ban-hang/khach-hang", { params: { q: query } }),
};

export default customerApi;
