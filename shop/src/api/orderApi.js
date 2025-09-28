import axiosClient from "./axiosClient";

const orderApi = {
  checkout(data) {
    return axiosClient.post("/don-hang/thanh-toan", data);
  },

  // Lấy danh sách đơn mua (có lọc + phân trang)
  getAll: (params) => axiosClient.get("/don-mua", { params }),

  // Lấy chi tiết 1 đơn mua
  getById: (id) => axiosClient.get(`/don-mua/${id}`),

  // Hủy đơn mua (khách hàng)
  cancel: (id) => axiosClient.post(`/don-mua/${id}/cancel`),

  // Mua lại đơn mua cũ
  reorder: (id) => axiosClient.post(`/don-mua/${id}/reorder`),

  showById: (id) => axiosClient.get(`/orders/${id}`),
};

export default orderApi;
