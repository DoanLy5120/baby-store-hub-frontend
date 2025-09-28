import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { formatVND } from "../../../utils/formatter";
import orderApi from "../../../api/orderApi";
import "./OrderManagement.scss";

const OrderManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getAll();

        // Lấy đúng mảng orders
        setOrders(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  const groupedOrders = {
    all: orders,
    pending: orders.filter((o) => o.trang_thai === "CHO_XU_LY"),
    processing: orders.filter((o) => o.trang_thai === "CHO_LAY_HANG"),
    shipping: orders.filter((o) => o.trang_thai === "DANG_GIAO"),
    completed: orders.filter(
      (o) => o.trang_thai === "THANH_CONG" || o.trang_thai === "DA_THANH_TOAN"
    ),
    cancelled: orders.filter((o) => o.trang_thai === "DA_HUY"),
  };

  const currentOrders = groupedOrders[activeTab] || [];

  // Chuyển API → format cho UI
  const mappedOrders = currentOrders.map((o) => {
    const discount =
      Number(o.tong_tien_san_pham) -
      Number(o.tong_thanh_toan) +
      Number(o.phi_van_chuyen);

    return {
      id: o.id,
      code: o.ma_don_hang,
      date: new Date(o.ngay_tao).toLocaleString(),
      status: o.trang_thai,
      statusText: getStatusText(o.trang_thai),
      total: Number(o.tong_thanh_toan),

      shippingFee: Number(o.phi_van_chuyen),
      shippingProvider: o.don_vi_van_chuyen,
      trackingCode: o.ma_van_don,
      discount: discount,

      products: (o.san_pham || []).map((p) => ({
        id: p.san_pham_id,
        name: p.ten_san_pham,
        quantity: p.so_luong,
        price: Number(p.thanh_tien),
        description: `Giá gốc: ${formatVND(p.don_gia)}`,
        image: `http://127.0.0.1:8000/storage/${p.hinh_anh || "default.jpg"}`,
      })),
    };
  });

  async function handleCancel(orderId) {
    try {
      const res = await orderApi.cancel(orderId);
      api.success({
        message: "Thành công",
        description: res.data.message || "Đã hủy đơn thành công",
      });

      // reload lại list sau khi hủy
      const refreshed = await orderApi.getAll();
      setOrders(refreshed.data.data || []);
    } catch (err) {
      api.error({
        message: "Thất bại",
        description: err.response?.data?.message || "Hủy đơn thất bại",
      });
    }
  }

  async function handleReorder(orderId) {
    try {
      const res = await orderApi.reorder(orderId);
      api.success({
        message: "Đã thêm lại sản phẩm vào giỏ hàng",
        description: res.data.message,
        duration: 2, // chờ 2s
        onClose: () => navigate("/cart"),
      });
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      api.error({
        message: "Mua lại thất bại",
        description: err.response?.data?.message,
      });
    }
  }

  async function handleTracking(orderId) {
    try {
      const res = await orderApi.getById(orderId);
      console.log("Chi tiết đơn:", res.data);
      alert(`Mã vận đơn: ${res.data.ma_van_don || "Chưa có"}`);
    } catch (err) {
      console.error("Xem vận đơn thất bại:", err);
      alert("Không lấy được chi tiết đơn");
    }
  }

  const menuItems = [
    {
      key: "all",
      icon: "🛒",
      label: "Tất cả",
      count: groupedOrders.all.length,
    },
    {
      key: "pending",
      icon: "⏰",
      label: "Chờ xử lý",
      count: groupedOrders.pending.length,
    },
    {
      key: "processing",
      icon: "📦",
      label: "Chờ lấy hàng",
      count: groupedOrders.processing.length,
    },
    {
      key: "shipping",
      icon: "🚚",
      label: "Đang giao",
      count: groupedOrders.shipping.length,
    },
    {
      key: "completed",
      icon: "✅",
      label: "Thành công",
      count: groupedOrders.completed.length,
    },
    {
      key: "cancelled",
      icon: "❌",
      label: "Đã hủy",
      count: groupedOrders.cancelled.length,
    },
  ];

  function getActionButtons(order) {
    if (order.status === "CHO_XU_LY") {
      return (
        <button
          className="btn cancel-btn"
          onClick={() => handleCancel(order.id)}
        >
          Hủy đơn
        </button>
      );
    }
    if (order.status === "DANG_GIAO") {
      return (
        <button
          className="btn tracking-btn"
          onClick={() => handleTracking(order.id)}
        >
          Xem vận đơn
        </button>
      );
    }
    if (order.status === "THANH_CONG" || order.status === "DA_THANH_TOAN") {
      return (
        <>
          <button
            className="btn review-btn"
            onClick={() => alert("Đi đến trang đánh giá")}
          >
            Đánh giá
          </button>
          <button
            className="btn reorder-btn"
            onClick={() => handleReorder(order.id)}
          >
            Mua lại
          </button>
        </>
      );
    }
    return null;
  }

  function getStatusColor(status) {
    switch (status) {
      case "CHO_LAY_HANG":
        return "#facc15"; // vàng
      case "CHO_XU_LY":
        return "#60a5fa"; // xanh dương
      case "DANG_GIAO":
        return "#34d399"; // xanh lá
      case "THANH_CONG":
      case "DA_THANH_TOAN":
        return "#22c55e"; // xanh đậm
      case "DA_HUY":
        return "#ef4444"; // đỏ
      default:
        return "#9ca3af"; // xám
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "CHO_LAY_HANG":
        return "Chờ lấy hàng";
      case "CHO_XU_LY":
        return "Chờ xử lý";
      case "DANG_GIAO":
        return "Đang giao";
      case "THANH_CONG":
      case "DA_THANH_TOAN":
        return "Hoàn thành";
      case "DA_HUY":
        return "Đã hủy";
      default:
        return status;
    }
  }

  return (
    <div className="order-management">
      {contextHolder}
      <div className="order-layout">
        <div className="order-sidebar">
          <div className="order-sidebar-header">
            <h3 className="order-sidebar-title">ĐƠN MUA</h3>
          </div>
          <div className="order-menu">
            {menuItems.map((item) => {
              return (
                <div
                  key={item.key}
                  className={`menu-item ${
                    activeTab === item.key ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <div className="menu-item-content">
                    <span className="menu-label">
                      {item.icon}
                      {item.label}
                    </span>
                    {groupedOrders[item.key]?.length > 0 && (
                      <span className="menu-count">
                        {groupedOrders[item.key].length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="order-content">
          <div className="order-content-header">
            <input type="date" className="date-input" />
            <span className="date-separator">-</span>
            <input type="date" className="date-input" />
          </div>

          <div className="orders-list">
            {mappedOrders.length === 0 ? (
              <div className="empty-orders">
                <p>Không có đơn hàng nào</p>
              </div>
            ) : (
              mappedOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <strong>Mã đơn hàng: {order.code}</strong>
                    </div>
                    <div className="order-status">
                      <span className="order-date">{order.date}</span>
                      <span
                        className="status-tag"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        {order.statusText}
                      </span>
                    </div>
                  </div>

                  <div className="order-products">
                    {order.products.map((product) => (
                      <div key={product.id} className="product-item">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                        />
                        <div className="product-details">
                          <strong className="product-name">
                            {product.name}
                          </strong>
                          <p className="product-description">
                            {product.description}
                          </p>
                          <span className="product-quantity">
                            x{product.quantity}
                          </span>
                        </div>
                        <div className="product-price">
                          <strong>{formatVND(product.price)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="order-divider" />

                  <div className="order-footer">
                    <div className="order-summary">
                      <div className="order-total">
                        <span>Tổng tiền: </span>
                        <strong className="total-amount">
                          {formatVND(order.total)}
                        </strong>
                      </div>
                      <div className="order-discount">
                        <span>Giảm giá: </span>
                        <span className="discount-amount">
                          - {formatVND(order.discount)}
                        </span>
                      </div>
                    </div>

                    <div className="order-actions">
                      {getActionButtons(order)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
