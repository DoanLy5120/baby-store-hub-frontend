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
} from "antd";
import { FaList } from "react-icons/fa";
import "./homePage.scss";

const { Content } = Layout;
const { Meta } = Card;

const HomePage = () => {
  // Dữ liệu menu sidebar
  const menuItems = [
    {
      key: "1",
      //icon: <HeartOutlined />,
      label: "Mẹ bầu và sau sinh",
    },
    {
      key: "2",
      //icon: <ShoppingOutlined />,
      label: "Sữa cho bé",
    },
    {
      key: "3",
      //icon: <BabyCarriageOutlined />,
      label: "Bé ăn dặm",
    },
    {
      key: "4",
      //icon: <CleaningServicesOutlined />,
      label: "Bỉm tã và vệ sinh",
    },
    {
      key: "5",
      //icon: <MedicineBoxOutlined />,
      label: "Bình sữa và phụ kiện",
    },
    {
      key: "6",
      //icon: <ShoppingOutlined />,
      label: "Đồ sơ sinh",
    },
    {
      key: "7",
      //icon: <ShirtOutlined />,
      label: "Thời trang và phụ kiện",
    },
    {
      key: "8",
      //icon: <MedicineBoxOutlined />,
      label: "Vitamin và sức khỏe",
    },
    {
      key: "9",
      //icon: <ToolOutlined />,
      label: "Đồ dùng mẹ và bé",
    },
    {
      key: "10",
      //icon: <CleaningServicesOutlined />,
      label: "Giặt xả và Tắm gội",
    },
    {
      key: "11",
      //icon: <ToyOutlined />,
      label: "Đồ chơi và Học tập",
    },
  ];

  // Dữ liệu banner
  const bannerData = [
    {
      id: 1,
      title: "Tháng 7 Lễ hội rộn ràng",
      subtitle: "NGÀN QUÀ TẶNG",
      promotion: "MUA 1 TẶNG 1",
      buttonText: "MUA NGAY",
    },
    {
      id: 2,
      title: "Khuyến mãi đặc biệt",
      subtitle: "GIẢM GIÁ SỐC",
      promotion: "LÊN ĐẾN 50%",
      buttonText: "XEM NGAY",
    },
  ];

  // Dữ liệu dịch vụ
  const services = [
    {
      //icon: <FireOutlined />,
      title: "Siêu deal",
      subtitle: "mỗi ngày",
      color: "#ff4d4f",
    },
    {
      //icon: <TagOutlined />,
      title: "Voucher",
      subtitle: "giảm giá",
      color: "#1890ff",
    },
    {
      //icon: <GiftOutlined />,
      title: "Ưu đãi",
      subtitle: "hấp dẫn",
      color: "#52c41a",
    },
    {
      //icon: <SearchOutlined />,
      title: "Tra cứu",
      subtitle: "đơn hàng",
      color: "#faad14",
    },
    {
      //icon: <EnvironmentOutlined />,
      title: "Siêu thị",
      subtitle: "gần bạn",
      color: "#722ed1",
    },
    {
      //icon: <TruckOutlined />,
      title: "Miễn phí",
      subtitle: "giao hàng",
      color: "#13c2c2",
    },
    {
      //icon: <SyncOutlined />,
      title: "Đổi trả",
      subtitle: "15 ngày",
      color: "#eb2f96",
    },
  ];

  // Dữ liệu huy hiệu chất lượng
  const badges = [
    {
      //icon: <HeartOutlined />,
      title: "Cùng Ba Mẹ",
      subtitle: "Nuôi Con",
      color: "#ff69b4",
    },
    {
      //icon: <ClockCircleOutlined />,
      title: "Giao Hàng",
      subtitle: "Siêu Tốc 1h",
      color: "#ffa500",
    },
    {
      //icon: <CheckCircleOutlined />,
      title: "100%",
      subtitle: "Chính Hãng",
      color: "#52c41a",
    },
    {
      //icon: <ShieldCheckOutlined />,
      title: "Bảo Quản",
      subtitle: "Mát",
      color: "#1890ff",
    },
    {
      //icon: <SyncOutlined />,
      title: "Đổi Trả",
      subtitle: "Dễ Dàng",
      color: "#722ed1",
    },
  ];

  // Dữ liệu sản phẩm
  const products = [
    {
      id: 1,
      name: "Tã quần Bobby size XXL, 60 miếng (giao bao bì ngẫu nhiên)",
      price: "335.000đ",
      originalPrice: "400.000đ",
      discount: "-11.6%",
      rating: 5,
      sold: "50K+",
      image: "/placeholder.svg?height=200&width=200",
      gift: "Tặng",
      isHot: true,
    },
    {
      id: 2,
      name: "Tã quần Bobby size L, 70 miếng (giao bao bì ngẫu nhiên)",
      price: "335.000đ",
      originalPrice: "400.000đ",
      discount: "-11.6%",
      rating: 5,
      sold: "50K+",
      image: "/placeholder.svg?height=200&width=200",
      gift: "Tặng",
      isHot: true,
    },
    {
      id: 3,
      name: "Thực phẩm bảo vệ sức khỏe LineaBon K2+D3 cho trẻ em",
      price: "330.000đ",
      rating: 5,
      sold: "20K+",
      image: "/placeholder.svg?height=200&width=200",
      gift: "Tặng",
    },
    {
      id: 4,
      name: "Sữa NAN INFINIPRO A2 số 3 800g (2-6 tuổi)",
      price: "649.000đ",
      rating: 5,
      sold: "50K+",
      image: "/placeholder.svg?height=200&width=200",
      ageRange: "2-6 tuổi",
    },
    {
      id: 5,
      name: "Bioamicus Vitamin K2D3",
      price: "330.000đ",
      rating: 5,
      sold: "200K+",
      image: "/placeholder.svg?height=200&width=200",
      gift: "Tặng",
      isHot: true,
    },
    {
      id: 6,
      name: "Ferrolip Baby",
      price: "280.000đ",
      rating: 4.8,
      sold: "15K+",
      image: "/placeholder.svg?height=200&width=200",
      gift: "Tặng",
      isHot: true,
    },
    {
      id: 7,
      name: "Similac Eye-Q Plus HMO",
      price: "450.000đ",
      rating: 4.9,
      sold: "30K+",
      image: "/placeholder.svg?height=200&width=200",
      gift: "Tặng",
      ageRange: "1.6kg",
    },
    {
      id: 8,
      name: "NAN OPTIPRO PLUS 4",
      price: "380.000đ",
      rating: 5,
      sold: "25K+",
      image: "/placeholder.svg?height=200&width=200",
      gift: "Tặng",
      ageRange: "1.5kg",
    },
  ];

  return (
    <div className="homepage">
      <Layout>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <FaList />
            <h3>DANH MỤC</h3>
          </div>
          <Menu mode="vertical" items={menuItems} className="sidebar-menu" />
        </div>
      </Layout>
      <Layout className="main-layout">
        <Content className="main-content">
          <div className="content-wrapper">
            {/* Banner */}
            <div className="banner">
              <Carousel autoplay dots={{ className: "custom-dots" }}>
                {bannerData.map((banner) => (
                  <div key={banner.id} className="banner-slide">
                    <div className="banner-content">
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
                      <div className="banner-image">
                        <img
                          src="/placeholder.svg?height=300&width=400"
                          alt={banner.title}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Service Icons */}
            <div className="service-icons">
              <Row gutter={16}>
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

            {/* Section Title */}
            <div className="section-title">
              <h2>Sản phẩm nổi bật</h2>
            </div>

            {/* Product Grid */}
            <div className="product-grid">
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col key={product.id} xs={12} sm={8} md={6} lg={6} xl={6}>
                    <Card
                      hoverable
                      className="product-card"
                      cover={
                        <div className="product-image-container">
                          <img
                            alt={product.name}
                            src={product.image || "/placeholder.svg"}
                          />
                          {product.gift && (
                            <Tag className="gift-tag" color="magenta">
                              {product.gift}
                            </Tag>
                          )}
                          {product.isHot && (
                            <Tag className="hot-tag" color="gold">
                              TRÚNG VÀNG
                            </Tag>
                          )}
                          {product.ageRange && (
                            <Tag className="age-tag" color="blue">
                              {product.ageRange}
                            </Tag>
                          )}
                          <div className="product-actions">
                            {/* <Button icon={<HeartOutlined />} shape="circle" />
                              <Button icon={<ShoppingCartOutlined />} type="primary" shape="circle" /> */}
                          </div>
                        </div>
                      }
                    >
                      <Meta
                        title={
                          <div className="product-title">{product.name}</div>
                        }
                        description={
                          <div className="product-info">
                            <div className="rating-section">
                              <Rate disabled defaultValue={product.rating} />
                              <span className="sold-count">
                                Đã bán {product.sold}
                              </span>
                            </div>
                            <div className="price-section">
                              <span className="current-price">
                                {product.price}
                              </span>
                              {product.originalPrice && (
                                <>
                                  <span className="original-price">
                                    {product.originalPrice}
                                  </span>
                                  <span className="discount">
                                    {product.discount}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Quality Badges */}
            <div className="quality-badges">
              <Row gutter={24} justify="center">
                {badges.map((badge, index) => (
                  <Col key={index} xs={12} sm={8} md={4} lg={4}>
                    <div className="badge-item">
                      <div
                        className="badge-icon"
                        style={{ backgroundColor: badge.color }}
                      >
                        {badge.icon}
                      </div>
                      <div className="badge-text">
                        <div className="badge-title">{badge.title}</div>
                        <div className="badge-subtitle">{badge.subtitle}</div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default HomePage;
