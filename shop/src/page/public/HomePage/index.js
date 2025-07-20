import {
  Layout,
  Menu,
  Carousel,
  Button,
  Row,
  Col,
  Card,
  Rate,
  Tag,
  notification,
  InputNumber,
} from "antd";
import { Modal, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MultiCarousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Link } from "react-router-dom";
import banner1 from "../../../assets/img/homePage/banner1.jpg";
import banner2 from "../../../assets/img/homePage/banner2.jpg";
import banner3 from "../../../assets/img/homePage/banner3.jpg";
import banner4 from "../../../assets/img/homePage/banner4.jpg";
import { FaList, FaSyncAlt, FaShoppingCart } from "react-icons/fa";
import { FaIdeal, FaGift, FaTruckFast } from "react-icons/fa6";
import { BiSolidDiscount } from "react-icons/bi";
import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import "./homePage.scss";
import { formatVND } from "../../../utils/formatter";
import categoryApi from "../../../api/categoryApi";
import productApi from "../../../api/productApi";

const { Content } = Layout;
const { Meta } = Card;

const HomePage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [categoriesSidebar, setCategoriesSidebar] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  const handleCartClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalVisible(true);
  };

  const handleAddToCart = () => {
    if (quantity > selectedProduct.soLuongTon) {
      message.warning("Vượt quá số lượng tồn kho");
      return;
    }

    api.success({
      message: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
      placement: "topRight",
    });

    setIsModalVisible(false);
  };

  const handleBuyNow = () => {
    message.success("Chuyển đến trang thanh toán...");
    setIsModalVisible(false);
  };

  const handleProductClick = (id) => {
    navigate(`/san-pham/${id}`);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getHomePage();
        setCategoriesSidebar(res.data.data);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchHotProducts = async () => {
      try {
        const response = await productApi.getHotProducts();
        const allProducts = response.data.data;

        const filtered = allProducts.filter(
          (product) => product.is_noi_bat == 1
        );
        setHotProducts(filtered);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm nổi bật:", error);
      }
    };

    fetchHotProducts();
  }, []);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const sidebarMenuItems = categoriesSidebar.map((category) => ({
    key: String(category.id),
    label: (
      <div
        onClick={() => navigate(`/danh-muc/${category.id}`)}
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <img
          src={`https://web-production-c18cf.up.railway.app/storage/${category.hinhAnh}`}
          alt={category.tenDanhMuc}
          style={{ width: 30, height: 30, objectFit: "cover" }}
        />
        <span>{category.tenDanhMuc}</span>
      </div>
    ),
  }));

  // Dữ liệu banner
  const bannerData = [
    {
      id: 1,
      title: "Tháng 7 Lễ hội rộn ràng",
      subtitle: "NGÀN QUÀ TẶNG",
      promotion: "MUA 1 TẶNG 1",
      buttonText: "MUA NGAY",
      img: banner1,
    },
    {
      id: 2,
      title: "Khuyến mãi đặc biệt",
      subtitle: "GIẢM GIÁ SỐC",
      promotion: "LÊN ĐẾN 50%",
      buttonText: "XEM NGAY",
      img: banner2,
    },
  ];

  // Dữ liệu dịch vụ
  const services = [
    {
      icon: <FaIdeal />,
      title: "Siêu deal",
      subtitle: "mỗi ngày",
      color: "#ff4d4f",
    },
    {
      icon: <BiSolidDiscount />,
      title: "Voucher",
      subtitle: "giảm giá",
      color: "#1890ff",
    },
    {
      icon: <FaGift />,
      title: "Ưu đãi",
      subtitle: "hấp dẫn",
      color: "#52c41a",
    },
    {
      icon: <MdOutlineScreenSearchDesktop />,
      title: "Tra cứu",
      subtitle: "đơn hàng",
      color: "#faad14",
    },
    {
      icon: <FaTruckFast />,
      title: "Miễn phí",
      subtitle: "giao hàng",
      color: "#13c2c2",
    },
    {
      icon: <FaSyncAlt />,
      title: "Đổi trả",
      subtitle: "15 ngày",
      color: "#eb2f96",
    },
  ];

  return (
    <div className="homepage">
      {contextHolder}
      <Layout>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <FaList />
            <h3>DANH MỤC</h3>
          </div>
          <Menu
            mode="vertical"
            items={sidebarMenuItems}
            className="sidebar-menu"
          />
        </div>
      </Layout>
      <Layout className="main-layout">
        <Content className="main-content">
          <div className="content-wrapper">
            {/* Banner */}
            <div className="banner-section">
              <Row gutter={16}>
                <Col span={16}>
                  <Carousel autoplay dots={{ className: "custom-dots" }}>
                    {bannerData.map((banner) => (
                      <div key={banner.id} className="banner-slide">
                        <div
                          className="banner-content"
                          style={{
                            backgroundImage: `url(${banner.img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            height: "300px", // hoặc chiều cao bạn muốn
                            borderRadius: "12px",
                          }}
                        >
                          <div className="banner-text">
                            <h2>{banner.title}</h2>
                            <h1>{banner.subtitle}</h1>
                            <h3>{banner.promotion}</h3>
                            <Button
                              type="primary"
                              size="large"
                              className="banner-button"
                            >
                              {banner.buttonText}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </Col>
                <Col span={8}>
                  <div
                    className="side-banners"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <img
                      src={banner3}
                      alt="Banner phụ 1"
                      style={{
                        width: "100%",
                        height: "142px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                    <img
                      src={banner4}
                      alt="Banner phụ 2"
                      style={{
                        width: "100%",
                        height: "142px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Service Icons */}
            <div className="service-icons">
              <Row gutter={25}>
                {services.map((service, index) => (
                  <Col key={index} span={24 / 7} className="service-item">
                    <div className="service-card">
                      <div
                        className="service-icon"
                        style={{ backgroundColor: service.color }}
                      >
                        {service.icon}
                      </div>
                      <div className="service-text">
                        <div className="service-title">{service.title}</div>
                        <div className="service-subtitle">
                          {service.subtitle}
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Product Categories Section */}
            <div className="product-categories">
              <div className="section-title">
                <h2>Tiện ích hằng ngày</h2>
              </div>
              <MultiCarousel
                responsive={responsive}
                arrows={true}
                infinite={false}
                keyBoardControl
                autoPlaySpeed={3000}
              >
                {categoriesSidebar.map((category) => (
                  <div key={category.id} style={{ padding: "0 10px" }}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={category.tenDanhMuc}
                          src={`https://web-production-c18cf.up.railway.app/storage/${category.hinhAnh}`}
                          style={{
                            height: 180,
                            width: 300,
                            objectFit: "contain",
                            padding: 12,
                          }}
                        />
                      }
                    >
                      <h3>{category.tenDanhMuc}</h3>
                      <p>
                        {category.moTa ||
                          "Khám phá các sản phẩm trong danh mục này."}
                      </p>
                      <Button
                        type="primary"
                        onClick={() => navigate(`/danh-muc/${category.id}`)}
                      >
                        Xem ngay
                      </Button>
                    </Card>
                  </div>
                ))}
              </MultiCarousel>
            </div>

            {hotProducts.length > 0 && (
              <div className="hot-products-carousel">
                <Row
                  justify="space-between"
                  align="middle"
                  className="section-title"
                >
                  <Col>
                    <h2>Sản phẩm nổi bật</h2>
                  </Col>
                  <Col>
                    <div className="detail">
                      <Link to="#">XEM TẤT CẢ &gt;&gt;&gt;</Link>
                    </div>
                  </Col>
                </Row>
                <MultiCarousel
                  responsive={responsive}
                  arrows={true}
                  infinite={false}
                  keyBoardControl
                  autoPlay={false}
                  autoPlaySpeed={3000}
                >
                  {hotProducts.map((product, index) => {
                    // Dữ liệu giả
                    const fakeGift = index % 2 === 0 ? "Tặng bình sữa" : null;
                    const fakeAgeRange = index % 3 === 0 ? "3-6 tuổi" : null;

                    return (
                      <div key={product.id} style={{ padding: "0 10px" }}>
                        <Card
                          hoverable
                          className="product-card"
                          onClick={() => handleProductClick(product.id)}
                          cover={
                            <div className="product-image-container">
                              <img
                                alt={product.tenSanPham}
                                src={`https://web-production-c18cf.up.railway.app/storage/${product.hinhAnh}`}
                              />
                              {fakeGift && (
                                <Tag className="gift-tag" color="magenta">
                                  {fakeGift}
                                </Tag>
                              )}
                              <Tag className="hot-tag" color="gold">
                                GIẢI THƯỞNG HẤP DẪN
                              </Tag>
                              {fakeAgeRange && (
                                <Tag className="age-tag" color="blue">
                                  {fakeAgeRange}
                                </Tag>
                              )}
                            </div>
                          }
                        >
                          <Meta
                            title={
                              <div className="product-title">
                                {product.tenSanPham}
                              </div>
                            }
                            description={
                              <div className="product-info">
                                <div className="rating-section">
                                  <Rate disabled defaultValue={5} />
                                  <span className="sold-count">
                                    Đã bán 1.4K
                                  </span>
                                </div>
                                <div className="price-section">
                                  <span className="current-price">
                                    {formatVND(
                                      product.giaBan * (1 + product.VAT / 100)
                                    )}
                                  </span>
                                  <div className="product-actions">
                                    <Button
                                      icon={<FaShoppingCart />}
                                      type="primary"
                                      shape="circle"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCartClick(product);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      </div>
                    );
                  })}
                </MultiCarousel>
              </div>
            )}
          </div>
        </Content>
      </Layout>
      <Modal
        title="Thông tin sản phẩm"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="add" onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </Button>,
          <Button key="buy" type="primary" onClick={handleBuyNow}>
            Mua ngay
          </Button>,
        ]}
      >
        {selectedProduct && (
          <div style={{ display: "flex", gap: 16 }}>
            <img
              src={`https://web-production-c18cf.up.railway.app/storage/${selectedProduct.hinhAnh}`}
              alt={selectedProduct.tenSanPham}
              style={{ width: 100, height: 100, objectFit: "contain" }}
            />
            <div>
              <h3>{selectedProduct.tenSanPham}</h3>
              <p>
                Giá: <strong>{formatVND(selectedProduct.giaBan)}</strong>
              </p>
              {selectedProduct.originalPrice && (
                <p style={{ textDecoration: "line-through", color: "#999" }}>
                  {selectedProduct.originalPrice}
                </p>
              )}
              {selectedProduct.discount && (
                <Tag color="red">{selectedProduct.discount}</Tag>
              )}
              {/* <p>Đã bán: {selectedProduct.sold}</p> 
              <Rate disabled defaultValue={selectedProduct.rating} /> */}
              <p>Đã bán: 1.4K</p>
              <Rate disabled defaultValue={5} />
              <div style={{ marginTop: 12 }}>
                <label>Số lượng:</label>
                <InputNumber
                  min={1}
                  max={selectedProduct.soLuongTon}
                  value={quantity}
                  onChange={setQuantity}
                />
                <div style={{ color: "#888", marginTop: 12 }}>
                  Tồn kho: {selectedProduct.soLuongTon}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
