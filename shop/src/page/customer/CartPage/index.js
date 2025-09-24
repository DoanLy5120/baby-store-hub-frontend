import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Divider, Image } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { formatVND } from "../../../utils/formatter";
import cartApi from "../../../api/cartApi";
import "./CartPage.scss";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    tam_tinh: 0,
    phi_van_chuyen: 20000,
    tong_thanh_toan: 0,
  });

  const navigate = useNavigate();
  const handleGoToCheckout = () => {
    navigate("/buying", {
      state: {
        cartItems,
        cartSummary,
      },
    });
  };

  const extractCartData = (response) => {
    if (response?.data?.data?.san_pham) {
      return response.data.data.san_pham;
    }
    return [];
  };

  const refreshCartData = async () => {
    try {
      const fetchRes = await cartApi.getAll();
      const san_pham = extractCartData(fetchRes);
      const mappedCart = mapCartFromAPI(san_pham);
      setCartItems(mappedCart);

      // cập nhật cartSummary từ BE luôn
      if (fetchRes?.data?.data?.tam_tinh) {
        setCartSummary((prev) => ({
          ...prev,
          tam_tinh: fetchRes.data.data.tam_tinh,
          tong_thanh_toan: fetchRes.data.data.tam_tinh + prev.phi_van_chuyen,
        }));
      }

      return mappedCart;
    } catch (error) {
      console.error("Failed to refresh cart data:", error);
      setCartItems([]);
      return [];
    }
  };

  const refreshCartSummary = async (extraData = {}) => {
    try {
      const res = await cartApi.calculateTotal(extraData);
      if (res?.data?.success) {
        setCartSummary(res.data.data);
      }
    } catch (error) {
      console.error("Failed to calculate total:", error);
    }
  };

  const mapCartFromAPI = (data) => {
    return (data || []).map((item) => ({
      id: item.id,
      name: item.ten,
      image: item.hinhAnh
        ? `http://127.0.0.1:8000/storage/${item.hinhAnh}`
        : "",
      desc: item.moTa,
      price: item.gia_cuoi, 
      original: item.gia,
      discount: item.giamGia,
      isHot: item.noiBat,
      quantity: item.soLuong,
      VAT: item.VAT,
      thanh_tien: item.thanh_tien,
      tonKho: item.tonKho,
      isFlashSale: item.flash_sale > 0, // bổ sung nếu muốn dùng ở UI
    }));
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) {
      console.warn("Invalid quantity:", newQuantity);
      return;
    }

    const originalItems = cartItems;

    try {
      setCartItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        return updatedItems;
      });

      const res = await cartApi.update(id, {
        san_pham_id: id,
        so_luong: newQuantity,
      });

      setTimeout(() => {
        window.dispatchEvent(new Event("cart-updated"));
      }, 100);

      if (res.status >= 200 && res.status < 300) {
        console.log("API update successful, keeping optimistic update");
      } else {
        setCartItems(originalItems);
        await refreshCartData();
      }
    } catch (error) {
      setCartItems(originalItems);
      await refreshCartData();
    }
  };

  const removeItem = async (id) => {
    const originalItems = cartItems;
    const itemToRemove = cartItems.find((item) => item.id === id);

    if (!itemToRemove) {
      return;
    }

    try {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

      const res = await cartApi.delete(id);
      setTimeout(() => {
        window.dispatchEvent(new Event("cart-updated"));
      }, 100);

      if (res.status >= 200 && res.status < 300) {
        console.log("API delete successful, keeping optimistic update");
      } else {
        setCartItems(originalItems);
        await refreshCartData();
      }
    } catch (error) {
      setCartItems(originalItems);
      await refreshCartData();
    }
  };

  // const clearCart = async () => {
  //   try {
  //     const res = await cartApi.clear();
  //     if (res.success) {
  //       setCartItems([]);
  //     }
  //   } catch (error) {
  //     console.error("Xóa giỏ hàng thất bại:", error);
  //   }
  // };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    (async () => {
      await refreshCartData();
      await refreshCartSummary();
    })();
  }, []);

  const subtotal = calculateSubtotal();
  const shipping = 20000; // Chưa tính
  const total = subtotal + shipping;

  return (
    <div className="shopping-cart">
      <Row gutter={24}>
        <Col xs={20} lg={16}>
          <Card className="cart-card">
            <div className="cart-header-new">
              <h2 className="cart-title-new">
                Danh sách sản phẩm ({cartItems.length})
              </h2>
            </div>

            <div className="product-list">
              {cartItems.map((item) => (
                <div key={item.id} className="product-card">
                  <div className="product-card-content">
                    <div className="product-image-container">
                      {item.isHot && (
                        <div className="hot-badge">Hot & Trending</div>
                      )}
                      {item.isFlashSale && (
                        <div className="flash-sale-badge">⚡ Flash Sale</div>
                      )}
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={150}
                        height={150}
                        className="product-image-new"
                      />
                    </div>

                    <div className="product-details">
                      <h3 className="product-name-new">{item.name}</h3>

                      <span>{item.desc}</span>

                      <div className="price-section">
                        <div
                          className="price-info"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span className="current-price">
                            {formatVND(item.price)}
                          </span>
                          {!item.isHot &&(
                              <>
                                <span
                                  className="original-price"
                                  style={{ marginLeft: 8 }}
                                >
                                  {formatVND(item.original)}
                                </span>
                              </>
                            )}
                        </div>
                      </div>

                      <div className="quantity-section">
                        <div className="quantity-controls-new">
                          <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="quantity-btn-new"
                          />
                          <span className="quantity-display">
                            {item.quantity}
                          </span>
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="quantity-btn-new quantity-btn-plus"
                          />
                        </div>
                      </div>
                      <div className="remove">
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() => removeItem(item.id)}
                          className="remove-btn"
                        >
                          <i class="fa-solid fa-trash-can"></i>
                          Xoá sản phẩm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="summary-card">
            <div className="order-summary">
              <h3 className="section-title">Thông tin đơn hàng</h3>

              <div className="summary-row">
                <span>Tổng giá sản phẩm</span>
                <span>{formatVND(cartSummary.tam_tinh)}</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{formatVND(cartSummary.phi_van_chuyen)}</span>
              </div>

              <Divider />

              <div className="summary-row total-row">
                <span>Tạm tính</span>
                <span className="total-price">
                  {formatVND(cartSummary.tong_thanh_toan)}
                </span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              className="continue-btn"
              onClick={handleGoToCheckout}
            >
              MUA HÀNG
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage;
