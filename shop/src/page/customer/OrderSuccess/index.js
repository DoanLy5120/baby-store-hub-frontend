import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  ShoppingOutlined,
  HeartOutlined,
  GiftOutlined,
  StarOutlined,
} from "@ant-design/icons";
import orderApi from "../../../api/orderApi"; // chỉnh path nếu khác
import "./OrderSuccess.scss";

const { Title, Text, Paragraph } = Typography;

// Map trạng thái sang chuỗi người dùng (tuỳ bạn mở rộng)
const STATUS_LABEL = {
  CHO_XU_LY: "Chờ xử lý",
  CHO_LAY_HANG: "Chờ lấy hàng",
  DANG_GIAO: "Đang giao",
  THANH_CONG: "Thành công",
  DA_THANH_TOAN: "Đã thanh toán",
  DA_HUY: "Đã hủy",
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy orderId từ query string: /orderSuccess?orderId=<id>
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Không tìm thấy orderId trong URL");
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderApi.showById(orderId);
        // BE trả về object ở res.data
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi khi gọi showById:", err);
        setError("Không lấy được thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleGoHome = () => navigate("/");
  const handleViewOrder = () => {
    // navigate đến trang chi tiết (tuỳ router FE của bạn)
     navigate("/orderManagement");
  };

  const formatPrice = (v) =>
    new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + " đ";

  // Điều kiện thay Title khi gateway === 'cod'
  const isCod = !!order && String(order.gateway || "").toLowerCase() === "cod";

  if (loading) {
    return (
      <div className="order-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="order-success-container">
      {/* Header */}
      <div className="order-success-header">
        <div className="order-success-logo">
          <HeartOutlined className="logo-icon" />
          <span className="logo-text">Mẹ & Bé Yêu Thương</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Row justify="center">
          <Col xs={22} sm={20} md={16} lg={12} xl={10}>
            <Card className="success-card" bordered={false}>
              <div className="success-icon-container">
                <div className="success-icon floating-animation">
                  <GiftOutlined className="gift-icon" />
                  <CheckCircleOutlined className="check-icon" />
                </div>
              </div>

              {/* Title thay đổi theo gateway */}
              <div className="success-message">
                <Title level={2} className="success-title gradient-text">
                  {isCod ? (
                    <>
                      Đơn hàng đang chờ xác nhận! 🕒
                      <br />
                      Vui lòng chờ shop xác nhận nhé 💖
                    </>
                  ) : (
                    <>
                      Đặt hàng thành công! 🎉
                      <br />
                      BaByHub xin chân thành cảm ơn!
                    </>
                  )}
                </Title>

                <div className="cute-decoration">
                  <StarOutlined className="star-icon pulse-animation" />
                  <HeartOutlined className="heart-icon pulse-animation" />
                  <StarOutlined className="star-icon pulse-animation" />
                </div>

                <Paragraph className="success-description">
                  <Text>
                    {isCod
                      ? "Cảm ơn mẹ! Đơn hàng của bạn đã được ghi nhận, shop sẽ xác nhận và giao hàng sớm."
                      : "Cảm ơn mẹ đã tin tưởng và đặt hàng tại shop BaByHub! Đơn hàng đang được chuẩn bị."}
                  </Text>
                </Paragraph>

                {/* Thông tin đơn dựa trên showById (BE trả) */}
                <div className="order-info">
                  <div className="info-item">
                    <Text strong>📦 Mã đơn hàng: </Text>
                    <Text code>{order?.ma_don_hang ?? order?.id}</Text>
                  </div>

                  <div className="info-item">
                    <Text strong>📋 Trạng thái: </Text>
                    <Text>
                      {STATUS_LABEL[order?.status] ?? order?.status ?? "—"}
                    </Text>
                  </div>

                  <div className="info-item">
                    <Text strong>💰 Tổng tiền: </Text>
                    <Text>{formatPrice(order?.total)}</Text>
                  </div>

                  <div className="info-item">
                    <Text strong>✅ Thanh toán: </Text>
                    <Text>{order?.paid ? "Đã thanh toán" : "Chưa thanh toán"}</Text>
                  </div>

                  <div className="info-item">
                    <Text strong>🏦 Cổng thanh toán: </Text>
                    <Text>{(order?.gateway ?? "—").toString().toUpperCase()}</Text>
                  </div>
                </div>
              </div>

              <Divider className="custom-divider" />

              {/* Actions */}
              <div className="action-buttons">
                <Space size="large" direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={handleGoHome}
                    block
                  >
                    Quay về trang chủ
                  </Button>

                  <Button
                    size="large"
                    icon={<ShoppingOutlined />}
                    onClick={handleViewOrder}
                    block
                  >
                    Xem chi tiết đơn hàng
                  </Button>
                </Space>
              </div>

              <div className="thank-you-section">
                <div className="baby-icons">🍼 👶 🧸 🎀 🌟</div>
                <Text className="thank-you-text">
                  Cảm ơn mẹ đã lựa chọn những sản phẩm tốt nhất cho bé! Chúc mẹ và
                  bé luôn khỏe mạnh, hạnh phúc! 💖
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="footer">
        <div className="footer-text">
          <Text type="secondary">
            Trang này được tạo với tình yêu thương dành cho mẹ và bé 💕
          </Text>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
