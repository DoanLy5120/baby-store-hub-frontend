import axiosClient from "./axiosClient";
const bangiaohangApi = {
   
    getOrders: (params) => {
        return axiosClient.get("/don-hang", { params });
    },
    getOrderDetails: (orderId) => {
        return axiosClient.get(`/hoa-don/${orderId}`); 
    },
    moveToReadyForPickup: (orderId, payload) => {
        return axiosClient.post(`/orders/${orderId}/to-ready`, payload);
    },
    moveToShipping: (orderId, payload) => {
        return axiosClient.post(`/orders/${orderId}/to-shipping`, payload);
    },
};

export default bangiaohangApi;