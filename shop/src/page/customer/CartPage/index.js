import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Divider,
  Image,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { formatVND } from "../../../utils/formatter";
import "./CartPage.scss";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
  const handleGoToCheckout = () => {
    navigate("/buying");
  };

  const updateQuantity = (id, newQuantity) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const maxQuantity = item.stock || 0;
        let validQuantity = newQuantity;
        if (validQuantity < 1) validQuantity = 1;
        if (validQuantity > maxQuantity) validQuantity = maxQuantity;
        return { ...item, quantity: validQuantity };
      })
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => {
      const newItems = items.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(newItems));
      return newItems;
    });
  };

  // Hàm lấy giá đã gồm VAT từ cart (ưu tiên lấy priceWithVAT nếu có)
  const getFinalPrice = (item) => {
    if (typeof item.priceWithVAT !== 'undefined') return item.priceWithVAT;
    const vat = item.VAT || item.vat || 0;
    let priceWithVAT = item.price * (1 + vat / 100);
    if (!item.isHot && item.discount) {
      priceWithVAT = priceWithVAT * (1 - item.discount);
    }
    return priceWithVAT;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + getFinalPrice(item) * item.quantity,
      0
    );
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const processedCart = storedCart.map((item) => ({
      ...item,
      key: item.id,
      image: item.image ,
      name: item.name || "Không rõ tên",
      desc: item.desc,
      price: item.price || 0,
      quantity: item.quantity || 1,
      stock: item.stock || 0,
      discount: 0.08,
      isHot: item.isHot || false,
    }));
    setCartItems(processedCart);
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
              {cartItems.map((item, index) => (
                <div key={item.id} className="product-card">
                  <div className="product-card-content">
                    <div className="product-image-container">
                      {item.isHot && (
                        <div className="hot-badge">Hot & Trending</div>
                      )}
                      <Image
                        src={`http://127.0.0.1:8000/storage/${item.image}`}
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
                        <div className="price-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="current-price">
                            {formatVND(getFinalPrice(item))}
                          </span>
                          {!item.isHot && item.price !== getFinalPrice(item) && (
                            <>
                              <span className="original-price" style={{ marginLeft: 8 }}>
                                {formatVND(item.price)}
                              </span>
                              {item.discount && (
                                <span className="discount-badge" style={{ marginLeft: 8 }}>
                                  -{Math.round((item.discount || 0) * 100)}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {item.isFlashSale && (
                          <div className="flash-sale-badge">⚡ Flash Sale</div>
                        )}
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
                <span>{formatVND(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{formatVND(20000)}</span>
              </div>

              <Divider />

              <div className="summary-row total-row">
                <span>Tạm tính</span>
                <span className="total-price">{formatVND(total)}</span>
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
