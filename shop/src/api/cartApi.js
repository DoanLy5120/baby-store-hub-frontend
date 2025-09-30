import axiosClient from "./axiosClient";

const cartApi = {
  
  getAll: () => axiosClient.get("/gio-hang"),

  add: (data) => axiosClient.post("/gio-hang/them", data),

  update: (sanPhamId, data) =>
    axiosClient.post(`/gio-hang/cap-nhat/${sanPhamId}`, data),

  delete: (sanPhamId) => axiosClient.delete(`/gio-hang/xoa/${sanPhamId}`),

  clear: () => axiosClient.delete("/gio-hang/xoa-het"),

  calculateTotal: (data) => axiosClient.post("/gio-hang/tinh-tong", data),

  checkout: (payload) => axiosClient.post("/checkout/dat-hang", payload),

  buyNow: (payload) => axiosClient.post("/checkout/mua-ngay", payload),
  
};

export default cartApi;
