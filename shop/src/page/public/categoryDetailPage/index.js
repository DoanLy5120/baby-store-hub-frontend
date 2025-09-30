import "./categoryDetailPage.scss";
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
  Modal,
} from "antd";
import { FaList, FaShoppingCart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import categoryApi from "../../../api/categoryApi";
import cartApi from "../../../api/cartApi";
import { formatVND } from "../../../utils/formatter";
import Abbott from "../../../assets/img/homePage/Abbott.png";
import Aptamil from "../../../assets/img/homePage/Aptamil.jpg";
import HiPP from "../../../assets/img/homePage/HiPP.png";
import Huggies from "../../../assets/img/homePage/Huggies.png";
import Megumi from "../../../assets/img/homePage/MEGUMI.png";
import Merries from "../../../assets/img/homePage/Merries.png";
import Nestlé from "../../../assets/img/homePage/Nestlé.png";
import Pigeon from "../../../assets/img/homePage/Pigeon.png";
import HealthyCare from "../../../assets/img/homePage/healthcare.jpg";
import Hoppi from "../../../assets/img/homePage/hoppi.png";

const { Content } = Layout;
const { Meta } = Card;

function CategoryDetailPage() {
  const [categoriesSidebar, setCategoriesSidebar] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [api, contextHolder] = notification.useNotification();
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

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
    if (!id) return;

    const fetchProductsByCategory = async () => {
      try {
        const res = await categoryApi.getProductsByCategory(id);
        setProducts(res.data.data); // Tùy API trả về mà bạn map lại
      } catch (error) {
        console.error("Lỗi lấy sản phẩm theo danh mục:", error);
      }
    };

    fetchProductsByCategory();
  }, [id]);

  const handleCartClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalVisible(true);
  };

  const handleAddToCart = async () => {
    if (quantity > selectedProduct.soLuongTon) {
      api.warning({
        message: `Vượt quá giới hạn tồn kho`,
        placement: "topRight",
      });
      return;
    }

    try {
      const res = await cartApi.add({
        san_pham_id: selectedProduct.id,
        so_luong: quantity,
      });

      if (res?.message || res?.data) {
        window.dispatchEvent(new Event("cart-updated"));

        api.success({
          message: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
          placement: "topRight",
        });

        setIsModalVisible(false);
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
    // truyền product hiện tại và quantity qua state của react-router
    navigate("/buying", {
      state: {
        product: selectedProduct,
        quantity: quantity,
      },
    });
    setIsModalVisible(false);
  };

  const handleProductClick = (id) => {
    navigate(`/san-pham/${id}`);
  };

  const sidebarMenuItems = categoriesSidebar.map((category) => ({
    key: String(category.id),
    label: (
      <div
        onClick={() => navigate(`/danh-muc/${category.id}`)}
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <img
          src={`http://127.0.0.1:8000/storage/${category.hinhAnh}`}
          alt={category.tenDanhMuc}
          style={{ width: 30, height: 30, objectFit: "cover" }}
        />
        <span>{category.tenDanhMuc}</span>
      </div>
    ),
  }));

  //thương hiệu
  const brandData = [
    {
      name: "Abbott",
      logo: Abbott,
    },
    {
      name: "Healthy Care",
      logo: HealthyCare,
    },
    {
      name: "Hoppi",
      logo: Hoppi,
    },
    {
      name: "Merries",
      logo: Merries,
    },
    {
      name: "Nestlé",
      logo: Nestlé,
    },
    {
      name: "Huggies",
      logo: Huggies,
    },
    {
      name: "Aptamil",
      logo: Aptamil,
    },
    { name: "MEGUMI", logo: Megumi },
    {
      name: "Pigeon",
      logo: Pigeon,
    },
    {
      name: "HiPP",
      logo: HiPP,
    },
  ];

  // Helper: chia brandData thành từng nhóm 6 thương hiệu
  const chunkArray = (arr, size) =>
    arr.reduce(
      (acc, _, i) => (i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc),
      []
    );

  const onChange = (currentSlide) => {
    console.log("Current Slide:", currentSlide);
  };

  const brandChunks = chunkArray(brandData, 6); // mỗi slide 6 logo

  return (
    <div className="category-detail-page">
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
            <div className="featured-brands">
              <h2>Thương hiệu</h2>
              <Carousel afterChange={onChange} dots={true} autoplay>
                {brandChunks.map((group, idx) => (
                  <div key={idx} className="brand-slide">
                    <div className="brand-grid">
                      {group.map((brand, i) => (
                        <div key={i} className="brand-item">
                          <img src={brand.logo} alt={brand.name} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
            {products.length > 0 && (
              <div className="products-grid">
                <Row
                  justify="space-between"
                  align="middle"
                  className="section-title"
                >
                  <Col>
                    <h2>Sản phẩm nổi bật</h2>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  {products.map((product, index) => {
                    const fakeAgeRange = index % 3 === 0 ? "3-6 tuổi" : null;

                    return (
                      <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          hoverable
                          className="product-card"
                          onClick={() => handleProductClick(product.id)}
                          cover={
                            <div className="product-image-container">
                              <img
                                alt={product.tenSanPham}
                                src={`http://127.0.0.1:8000/storage/${product.hinhAnh}`}
                              />
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
                      </Col>
                    );
                  })}
                </Row>
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
              src={`http://127.0.0.1:8000/storage/${selectedProduct.hinhAnh}`}
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
}

export default CategoryDetailPage;
