import axiosClient from "./axiosClient";

const goodsreceiptsheetApi = {
  getAll: () => axiosClient.get("/phieu-nhap-kho"),
  filter: (params) => axiosClient.get("/phieu-nhap-kho/loc", { params }),
  create: (data) => axiosClient.post("/phieu-nhap-kho", data),
  getById: (id) => axiosClient.get(`/phieu-nhap-kho/${id}`),
  update: (id, data) => axiosClient.put(`/phieu-nhap-kho/${id}`, data),
  confirm: (id) => axiosClient.post(`/phieu-nhap-kho/${id}/xac-nhan`),
  cancel: (id) => axiosClient.put(`/phieu-nhap-kho/${id}/huy`)
};

export default goodsreceiptsheetApi;