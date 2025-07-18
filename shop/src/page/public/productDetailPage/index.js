import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import productApi from "../../../api/productApi";
import { Row, Col, Image, Typography, Divider } from "antd";
import "./ProductDetailPage.scss";

const { Title, Text } = Typography;

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    productApi.getById(id).then((res) => {
      setProduct(res);
    });
  }, [id]);

  if (!product) return <div>Đang tải...</div>;

  return (
    <div className="product-detail-container">
      <Row gutter={32}>
        {/* Ảnh sản phẩm */}
        <Col xs={24} md={10}>
          <Image
            src={product.image}
            alt={product.tenSanPham}
            width="100%"
            style={{ borderRadius: "12px" }}
          />
        </Col>

        {/* Thông tin sản phẩm */}
        <Col xs={24} md={14}>
          <Title level={2}>{product.tenSanPham}</Title>
          <Text strong>Giá: </Text>
          <Text type="danger" style={{ fontSize: "18px" }}>
            {product.price} VND
          </Text>
          <Divider />
          <Title level={5}>Mô tả sản phẩm</Title>
          <Text>{product.moTa}</Text>
        </Col>
      </Row>

      <Divider />

      {/* Thông số kỹ thuật */}
      <Row gutter={16} className="product-specs">
        <Col span={12}>
          <p><strong>Độ tuổi:</strong> Từ 2 tuổi</p>
          <p><strong>Hạn sử dụng sau mở nắp:</strong> 3 tuần</p>
          <p><strong>Nơi sản xuất:</strong> Việt Nam</p>
        </Col>
        <Col span={12}>
          <p><strong>Đặc tính sữa:</strong></p>
          <ul>
            <li>Tăng cường hệ miễn dịch, sức đề kháng</li>
            <li>Sữa non</li>
            <li>Phát triển trí não</li>
            <li>Phát triển chiều cao</li>
            <li>Hỗ trợ tiêu hóa</li>
            <li>Hỗ trợ tăng cân</li>
          </ul>
          <p><strong>Khối lượng:</strong> 800g</p>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;
