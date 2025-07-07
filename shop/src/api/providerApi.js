// src/api/providerApi.js
import axiosClient from "./axiosClient";

const providerApi = {
  getAll: () => axiosClient.get("/nha-cung-cap"),
};

export default providerApi;
