"use client";

import { useState, useEffect } from "react";
import { notification } from "antd";
import orderApi from "../../../api/orderApi";
import { formatVND } from "../../../utils/formatter";
import "./Confirm.scss";

const Confirm = () => {
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

  const fetchOrders = async () => {
    try {
      setFetching(true);
      const res = await orderApi.getPending();
      // Đảm bảo lấy đúng array
      const list = (res?.data?.data || []).map((o) => ({
        ...o,
        trang_thai: "CHO_XU_LY", // vì API này chỉ trả đơn CHO_XU_LY
      }));
      setOrders(list);
    } catch (err) {
      console.error("Lỗi load orders:", err);
      setOrders([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmOrder = async (orderId) => {
    try {
      await orderApi.moveToReady(orderId);

      api.success({
        message: "Xác nhận thành công",
        description: "Đơn hàng đã được chuyển sang bán giao hàng.",
        placement: "topRight",
      });

      // reload lại danh sách
      fetchOrders();
    } catch (err) {
      console.error("Lỗi confirm:", err);

      api.error({
        message: "Xác nhận thất bại",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
        placement: "topRight",
      });
    }
  };

  return (
    <div className="order-confirmation">
      {contextHolder}
      <div className="orders-container">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className={`order-card slide-down ${order.status}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Order Header */}
            <div className="order-card-header">
              <div className="order-info">
                <div className="order-meta">
                  <span className="order-id">#{order.ma_don_hang}</span>
                  <span className="tracking-code">
                    Mã vận đơn: {order.ma_van_don}
                  </span>
                  <span className="order-time">{formatDateTime(order.ngay_tao)}</span>
                </div>
                <div className="order-total">
                  <span className="total-label">Tổng tiền:</span>
                  <span className="total-amount">
                    {formatVND(order.tong_thanh_toan)}
                  </span>
                </div>
              </div>
              <div className="order-status">
                <span className={`status-badge ${order.status}`}>
                  {order.trang_thai === "CHO_XU_LY"
                    ? "Chờ xác nhận"
                    : "Đã xác nhận"}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="customer-info">
              <div className="customer-details">
                <div className="customer-item">
                  <span className="label">Họ tên:</span>
                  <span className="value">{order.ten_khach_hang}</span>
                </div>
                <div className="customer-item">
                  <span className="label">Địa chỉ:</span>
                  <span className="value">{order.dia_chi}</span>
                </div>
                <div className="customer-item">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{order.so_dien_thoai}</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="products-section">
              <div className="products-list">
                {(order.san_pham || []).map((product, idx) => (
                  <div key={idx} className="product-item">
                    <div className="product-image">
                      <img
                        src={`http://127.0.0.1:8000/storage/${product.hinh_anh}`}
                        alt={product.ten}
                      />
                    </div>
                    <div className="product-details">
                      <h4 className="product-name">{product.ten}</h4>
                      <div className="product-meta">
                        <span className="quantity">
                          Số lượng: {product.so_luong}
                        </span>
                        <span className="price">
                          {formatVND(product.thanh_tien)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="order-actions">
              {order.trang_thai === "CHO_XU_LY" ? (
                <button
                  className="confirm-btn"
                  onClick={() => handleConfirmOrder(order.id)}
                >
                  Xác nhận đơn hàng
                </button>
              ) : (
                <button className="confirmed-btn" disabled>
                  ✓ Đã xác nhận
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Confirm;
