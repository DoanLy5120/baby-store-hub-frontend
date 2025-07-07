import axiosClient from "./axiosClient";

const warehouseApi = {
  getAll: () => axiosClient.get("/kho"), // tùy đường dẫn Laravel của bạn
};

export default warehouseApi;
