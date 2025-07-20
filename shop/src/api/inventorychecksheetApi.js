import axiosClient from "./axiosClient";

const inventorychecksheetApi = {
  getAll: () => axiosClient.get("/phieu-kiem-kho"),
  getById: (id) => axiosClient.get(`/phieu-kiem-kho/${id}`),
  create: (data) => axiosClient.post("/phieu-kiem-kho", data),
  update: (id, data) => axiosClient.post(`/phieu-kiem-kho/${id}`, data),
  delete: (id) => axiosClient.delete(`/phieu-kiem-kho/${id}`),
  addDetail: (phieuId, data) =>
    axiosClient.post(`/phieu-kiem-kho/${phieuId}/add-detail`, data),
  deleteDetail: (id) => axiosClient.delete(`/phieu-kiem-kho/chi-tiet/${id}`),
  canBang: (id) => axiosClient.post(`/phieu-kiem-kho/${id}/can-bang`),
};

export default inventorychecksheetApi;