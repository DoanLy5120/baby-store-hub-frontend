import axiosClient from "./axiosClient";

const cartApi = {
  // Lấy giỏ hàng
  getAll: () => axiosClient.get("/gio-hang"),

  // Thêm sản phẩm vào giỏ
  add: (data) => axiosClient.post("/gio-hang/them", data),

  // Cập nhật số lượng sản phẩm trong giỏ
  update: (sanPhamId, data) =>
    axiosClient.post(`/gio-hang/cap-nhat/${sanPhamId}`, data),

  // Xóa 1 sản phẩm trong giỏ
  delete: (sanPhamId) => axiosClient.delete(`/gio-hang/xoa/${sanPhamId}`),

  // Xóa toàn bộ giỏ hàng
  clear: () => axiosClient.delete("/gio-hang/xoa-het"),
};

export default cartApi;
