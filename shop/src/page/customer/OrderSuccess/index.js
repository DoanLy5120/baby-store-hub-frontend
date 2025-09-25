import { Button, Card, Space, Typography, Row, Col, Divider } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  ShoppingOutlined,
  HeartOutlined,
  GiftOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./OrderSuccess.scss";

const { Title, Text, Paragraph } = Typography;

const OrderSuccess = () => {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewProducts = () => {
    // Navigate to products page
    console.log("Navigating to products");
  };

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
              {/* Success Icon */}
              <div className="success-icon-container">
                <div className="success-icon floating-animation">
                  <GiftOutlined className="gift-icon" />
                  <CheckCircleOutlined className="check-icon" />
                </div>
              </div>

              {/* Success Message */}
              <div className="success-message">
                <Title level={2} className="success-title gradient-text">
                  Đặt hàng thành công! 🎉<br />
                  BaByHub xin chân thành cảm ơn!
                </Title>

                <div className="cute-decoration">
                  <StarOutlined className="star-icon pulse-animation" />
                  <HeartOutlined className="heart-icon pulse-animation" />
                  <StarOutlined className="star-icon pulse-animation" />
                </div>

                <Paragraph className="success-description">
                  <Text>
                    Cảm ơn mẹ đã tin tưởng và đặt hàng tại shop BaByHub! 💕 Đơn hàng của
                    mẹ đang được chuẩn bị với tất cả tình yêu thương. Chúng mình
                    sẽ giao hàng nhanh nhất để bé có thể sử dụng sớm nhé! 👶✨
                  </Text>
                </Paragraph>

                <div className="order-info">
                  <div className="info-item">
                    <Text strong>📦 Mã đơn hàng: </Text>
                    <Text code>#MB2024001</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>🚚 Thời gian giao hàng: </Text>
                    <Text>2-3 ngày làm việc</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>📱 Thông báo: </Text>
                    <Text>Đơn hàng sẽ được thông báo qua email</Text>
                  </div>
                </div>
              </div>

              <Divider className="custom-divider" />

              {/* Action Buttons */}
              <div className="action-buttons">
                <Space
                  size="large"
                  direction="vertical"
                  style={{ width: "100%" }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={handleGoHome}
                    className="primary-button"
                    block
                  >
                    Quay về trang chủ
                  </Button>

                  <Button
                    size="large"
                    icon={<ShoppingOutlined />}
                    onClick={handleViewProducts}
                    className="secondary-button"
                    block
                  >
                    Xem đơn hàng
                  </Button>
                </Space>
              </div>

              {/* Thank You Message */}
              <div className="thank-you-section">
                <div className="baby-icons">🍼 👶 🧸 🎀 🌟</div>
                <Text className="thank-you-text">
                  Cảm ơn mẹ đã lựa chọn những sản phẩm tốt nhất cho bé! Chúc mẹ
                  và bé luôn khỏe mạnh, hạnh phúc! 💖
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Footer */}
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
