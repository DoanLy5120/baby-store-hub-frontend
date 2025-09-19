import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Divider, Image } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { formatVND } from "../../../utils/formatter";
import cartApi from "../../../api/cartApi";
import "./CartPage.scss";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
  const handleGoToCheckout = () => {
    navigate("/buying");
  };

  // Utility function để xử lý response data structure
  const extractCartData = (response) => {
    if (!response?.data) return [];
    
    // Kiểm tra các cấu trúc response khác nhau
    if (response.data.data?.san_pham && Array.isArray(response.data.data.san_pham)) {
      return response.data.data.san_pham;
    }
    if (response.data.san_pham && Array.isArray(response.data.san_pham)) {
      return response.data.san_pham;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  };

  // Utility function để fetch và cập nhật cart data
  const refreshCartData = async () => {
    try {
      const fetchRes = await cartApi.getAll();
      const cartItems = extractCartData(fetchRes);
      const mappedCart = mapCartFromAPI(cartItems);
      setCartItems(mappedCart);
      return mappedCart;
    } catch (error) {
      console.error("Failed to refresh cart data:", error);
      setCartItems([]);
      return [];
    }
  };

  // Tối ưu hóa mapCartFromAPI dựa trên cấu trúc dữ liệu thực tế
  const mapCartFromAPI = (data) => {
    return (data || []).map((item) => ({
      id: item.id,
      name: item.ten || "No name",
      image: item.hinhAnh || "",
      desc: item.moTa || "",
      price: item.gia || 0,
      priceWithVAT: item.giaSauVAT || item.gia_cuoi || 0,
      discount: item.giamGia,
      isHot: item.noiBat || false,
      quantity: item.soLuong || 1,
      VAT: item.VAT || 0,
      thanh_tien: item.thanh_tien || 0,
      tonKho: item.tonKho || 0
    }));
  };

  const updateQuantity = async (id, newQuantity) => {
    
    // Validation: kiểm tra số lượng hợp lệ
    if (newQuantity < 1) {
      console.warn("Invalid quantity:", newQuantity);
      return;
    }

    const originalItems = cartItems;
    const currentItem = cartItems.find(item => item.id === id);
    
    try {
      // Cập nhật ngay lập tức trong UI (optimistic update)
      setCartItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        return updatedItems;
      });
      
      const res = await cartApi.update(id, { 
        san_pham_id: id,
        so_luong: newQuantity 
      });
      
      // Dispatch event để cập nhật header
      setTimeout(() => {
        window.dispatchEvent(new Event("cart-updated"));
      }, 100);
      
      // Kiểm tra response status thay vì res.success
      if (res.status >= 200 && res.status < 300) {
        console.log("API update successful, keeping optimistic update");
      } else {
        console.log("API update failed, reverting to original state");
        setCartItems(originalItems); // Khôi phục trạng thái ban đầu
        await refreshCartData(); // Sau đó fetch dữ liệu mới
      }
    } catch (error) {
      // Khôi phục trạng thái ban đầu trước khi fetch
      setCartItems(originalItems);
      await refreshCartData();
    }
  };

  const removeItem = async (id) => {
    const originalItems = cartItems;
    const itemToRemove = cartItems.find(item => item.id === id);
    
    if (!itemToRemove) {
      return;
    }

    try {
      // Xóa ngay lập tức khỏi UI (optimistic update)
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      
      const res = await cartApi.delete(id);
      
      // Dispatch event để cập nhật header
      setTimeout(() => {
        window.dispatchEvent(new Event("cart-updated"));
      }, 100);
      
      // Kiểm tra response status thay vì res.success
      if (res.status >= 200 && res.status < 300) {
        console.log("API delete successful, keeping optimistic update");
      } else {
        console.log("API delete failed, reverting to original state");
        setCartItems(originalItems); // Khôi phục trạng thái ban đầu
        await refreshCartData(); // Sau đó fetch dữ liệu mới
      }
    } catch (error) {
      // Khôi phục trạng thái ban đầu trước khi fetch
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

  // Hàm lấy giá đã gồm VAT từ cart (ưu tiên lấy priceWithVAT nếu có)
  const getFinalPrice = (item) => {
    if (typeof item.priceWithVAT !== "undefined") return item.priceWithVAT;
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
    refreshCartData();
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
                        <div
                          className="price-info"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span className="current-price">
                            {formatVND(getFinalPrice(item))}
                          </span>
                          {!item.isHot &&
                            item.price !== getFinalPrice(item) && (
                              <>
                                <span
                                  className="original-price"
                                  style={{ marginLeft: 8 }}
                                >
                                  {formatVND(item.price)}
                                </span>
                                {item.discount && (
                                  <span
                                    className="discount-badge"
                                    style={{ marginLeft: 8 }}
                                  >
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
