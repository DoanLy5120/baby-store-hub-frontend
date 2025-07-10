import axiosClient from "./axiosClient";

const orderApi = {
  checkout(data) {
    return axiosClient.post("/don-hang/thanh-toan", data);
  },
};

export default orderApi;
