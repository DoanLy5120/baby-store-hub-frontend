import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import productApi from "../../../api/productApi";
import cartApi from "../../../api/cartApi";
import {
  Image,
  Typography,
  Spin,
  InputNumber,
  Button,
  Divider,
  notification,
} from "antd";
import { Row, Col } from "antd";
import { formatVND } from "../../../utils/formatter";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./ProductDetailPage.scss";

const { Title, Text, Paragraph } = Typography;

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2,
    slidesToSlide: 2,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    productApi.getByIdForCustomer(id).then((res) => {
      setProduct(res.data.data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await productApi.getHotProducts();
        const allProducts = res.data.data || [];

        const filtered = allProducts.filter((item) => item.id !== +id);

        const selected = filtered.slice(14, 20); // Lấy 6 sản phẩm đầu

        setRelatedProducts(selected);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm liên quan:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (quantity > product.soLuongTon) {
      api.warning({
        message: `Vượt quá giới hạn tồn kho`,
        placement: "topRight",
      });
      return;
    }

    try {
      const res = await cartApi.add({
        san_pham_id: product.id,
        so_luong: quantity,
      });

      if (res?.message || res?.data) {
        window.dispatchEvent(new Event("cart-updated"));

        api.success({
          message: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
          placement: "topRight",
        });
        
      } else {
        api.error({
          message: "Không thể thêm sản phẩm vào giỏ",
          description: res?.message || "Lỗi không xác định",
          placement: "topRight",
        });
      }
    } catch (error) {
      api.error({
        message: "Không thể thêm sản phẩm vào giỏ",
        description: error.response?.data?.message || error.message,
        placement: "topRight",
      });
    }
  };

  const handleBuyNow = () => {
    navigate("/buying");
  };

  if (loading) {
    return (
      <div className="product-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) return <div>Không tìm thấy sản phẩm.</div>;

  const giaSauVAT = product.giaBan * (1 + product.VAT / 100);

  return (
    <div className="product-detail-container">
      {contextHolder}
      <Row gutter={[32, 32]}>
        {/* Ảnh sản phẩm */}
        <Col xs={24} md={10}>
          <Image
            src={`http://127.0.0.1:8000/storage/${product.hinhAnh}`}
            alt={product.tenSanPham}
            width="400px"
            height="400px"
            style={{ borderRadius: "12px", objectFit: "cover" }}
          />
        </Col>

        {/* Thông tin chính + Mô tả */}
        <Col xs={24} md={14}>
          <div className="product-info">
            <Title level={2} className="product-name">
              {product.tenSanPham}
            </Title>

            <div className="product-price">{formatVND(giaSauVAT)} VND</div>

            <div className="product-stock">
              <Text strong>Số lượng:</Text>{" "}
              <InputNumber
                min={1}
                max={product.soLuongTon}
                value={quantity}
                onChange={setQuantity}
                style={{ marginRight: "12px" }}
              />
              <span>(Tồn kho: {product.soLuongTon})</span>
            </div>

            <div className="quantity-actions">
              <Button
                type="primary"
                size="large"
                onClick={handleAddToCart}
                style={{ backgroundColor: "#f5222d" }}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button type="primary" size="large" onClick={handleBuyNow}>
                Mua ngay
              </Button>
            </div>

            <Divider />

            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <Paragraph>{product.moTa}</Paragraph>
            </div>
          </div>
        </Col>
      </Row>

      <Divider />

      {/* Thông số kỹ thuật */}
      <Row gutter={24}>
        {/* Thông tin chi tiết */}
        <Col xs={24} md={12}>
          <div className="product-specs">
            <h3>Thông tin chi tiết</h3>
            <ul>
              {Object.entries(product.thongSoKyThuat).map(([key, value]) => (
                <li key={key}>
                  <span>{key}:</span>{" "}
                  {Array.isArray(value) ? value.join(", ") : value}
                </li>
              ))}
            </ul>
          </div>
        </Col>

        {/* Sản phẩm khác */}
        <Col xs={24} md={12}>
          <div className="related-products">
            <h3>Sản phẩm khác</h3>
            <Carousel
              responsive={responsive}
              infinite={false}
              autoPlay
              autoPlaySpeed={3000}
            >
              {relatedProducts.map((item) => (
                <div
                  className="related-item"
                  key={item.id}
                  style={{ padding: "0 8px" }}
                >
                  <img
                    src={`http://127.0.0.1:8000/storage/${item.hinhAnh}`}
                    alt={item.tenSanPham}
                    style={{
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <div className="name">{item.tenSanPham}</div>
                  <div className="price">
                    {formatVND(item.giaBan * (1 + item.VAT / 100))}
                  </div>
                  <Button size="small" type="primary">
                    Chọn mua
                  </Button>
                </div>
              ))}
            </Carousel>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;
