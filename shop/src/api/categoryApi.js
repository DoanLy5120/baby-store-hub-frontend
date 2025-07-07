// src/api/categoryApi.js
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
};

export default categoryApi;
