// Lấy danh sách sản phẩm trong giỏ hàng
export const getCartItems = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (newItem) => {
  const cartItems = getCartItems();
  cartItems.push(newItem);
  localStorage.setItem("cart", JSON.stringify(cartItems));
};

// Xoá sản phẩm theo id
export const removeFromCart = (productId) => {
  const cartItems = getCartItems().filter(item => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cartItems));
};

// Xoá toàn bộ giỏ hàng
export const clearCart = () => {
  localStorage.removeItem("cart");
};

// Đếm tổng số lượng
export const getCartCount = () => {
  return getCartItems().length;
};
