import axiosClient from "./axiosClient";

const providerApi = {
  getAll: () => axiosClient.get("/nha-cung-cap"),
  getById: (id) => axiosClient.get(`/nha-cung-cap/${id}`),
  create: (data) => axiosClient.post("/nha-cung-cap", data),
  update: (id, data) => axiosClient.post(`/nha-cung-cap/${id}`, data),
  delete: (id) => axiosClient.delete(`/nha-cung-cap/${id}`),
};

export default providerApi;
