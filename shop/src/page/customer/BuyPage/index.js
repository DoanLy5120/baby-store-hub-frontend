import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Table,
  Radio,
  Switch,
  Input,
  Space,
  Typography,
  Divider,
  Modal,
  Form,
  notification,
} from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { formatVND } from "../../../utils/formatter";
import cartApi from "../../../api/cartApi";
import profileApi from "../../../api/profileApi";
import "./Buypage.scss";

const { Title, Text } = Typography;

function BuyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    tam_tinh: 0,
    phi_van_chuyen: 20000,
    tong_thanh_toan: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [useKiCoin, setUseKiCoin] = useState(false);

  // state cho thông tin địa chỉ
  const [addressInfo, setAddressInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // state cho modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [shippingFee, setShippingFee] = useState(cartSummary.phi_van_chuyen);

  const totalAmount = cartSummary.tam_tinh;
  const voucherDiscount = 0;
  const finalTotal = cartSummary.tong_thanh_toan;

  const buyState = location.state || {};
  const buyProduct = buyState.product || null;
  const buyQuantity = buyState.quantity ?? 1;
  const isBuyNow = Boolean(buyProduct);

  useEffect(() => {
    if (paymentMethod === "cod") {
      setShippingFee(40000);
    } else {
      // momo / vnpay
      setShippingFee(20000);
    }

    // Cập nhật luôn tổng thanh toán
    setCartSummary((prev) => ({
      ...prev,
      tong_thanh_toan:
        prev.tam_tinh + (paymentMethod === "cod" ? 40000 : 20000),
    }));
  }, [paymentMethod, cartSummary.tam_tinh]);

  // Lấy dữ liệu giỏ hàng từ API khi component được tải
  useEffect(() => {
    if (isBuyNow) return; // skip nếu là mua ngay

    const fetchCartFromApi = async () => {
      try {
        const res = await cartApi.getAll();
        const cartData = res?.data?.data;
        if (!cartData) return;

        const mappedProducts = (cartData.san_pham || []).map((item) => ({
          key: item.id,
          id: item.id,
          name: item.ten,
          image: item.hinhAnh
            ? `http://127.0.0.1:8000/storage/${item.hinhAnh}`
            : "/placeholder.svg",
          price: item.gia || 0,
          quantity: item.soLuong || 1,
          total: item.thanh_tien || (item.gia || 0) * (item.soLuong || 1),
        }));

        setProducts(mappedProducts);

        const tamTinh = Number(
          cartData.tam_tinh ??
            mappedProducts.reduce((s, p) => s + (p.total || 0), 0)
        );
        const phiVC = Number(cartData.phi_van_chuyen ?? 20000);
        setCartSummary({
          tam_tinh: tamTinh,
          phi_van_chuyen: phiVC,
          tong_thanh_toan: tamTinh + phiVC,
        });
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      }
    };

    fetchCartFromApi();
  }, [isBuyNow]);

  // Nếu là Mua ngay, khởi tạo products & summary từ product được truyền
  useEffect(() => {
    if (!isBuyNow) return;

    const p = buyProduct;
    const price = p.gia_cuoi ?? p.giaBan ?? 0; // dùng giá hiển thị (tùy cấu trúc product)
    const mapped = {
      key: p.id,
      id: p.id,
      name: p.tenSanPham ?? p.ten ?? p.name,
      image: p.hinhAnh
        ? `http://127.0.0.1:8000/storage/${p.hinhAnh}`
        : "/placeholder.svg",
      price: price,
      quantity: buyQuantity,
      total: price * buyQuantity,
      soLuongTon: p.soLuongTon ?? p.tonKho ?? 0,
    };

    setProducts([mapped]);

    const tamTinh = mapped.total;
    const phiVC = 20000;
    setCartSummary({
      tam_tinh: tamTinh,
      phi_van_chuyen: phiVC,
      tong_thanh_toan: tamTinh + phiVC,
    });
  }, [isBuyNow, buyProduct, buyQuantity]);

  // Lấy thông tin khách hàng từ API khi component được tải
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        console.log("Profile response:", res);
        const user = res?.data;

        if (user) {
          setAddressInfo({
            name: user.hoTen || "",
            phone: user.sdt || "",
            address: user.diaChi || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tài khoản:", error);
      }
    };

    fetchProfile();
  }, []);

  //thay đổi địa chỉ
  const handleSaveAddress = () => {
    form.validateFields().then((values) => {
      // Gộp thành format chuẩn
      const fullAddress = `${values.street}, ${values.ward}, ${values.district}, ${values.province}`;

      setAddressInfo({
        name: addressInfo.name,
        phone: addressInfo.phone,
        ...values,
        address: fullAddress, // full chuỗi hiển thị
      });

      setIsModalVisible(false);
    });
  };

  // thêm hàm này vào trong component BuyPage
  const handleCheckout = async () => {
    try {
      // Validate địa chỉ cơ bản
      if (!addressInfo.name || !addressInfo.phone || !addressInfo.address) {
        api.error({
          message: "Vui lòng điền đầy đủ thông tin nhận hàng",
          placement: "topRight",
        });
        return;
      }

      if (isBuyNow) {
        // mua ngay (1 sp)
        const product = products[0];
        if (!product) {
          api.error({
            message: "Không có sản phẩm để mua",
            placement: "topRight",
          });
          return;
        }

        const payload = {
          san_pham_id: product.id,
          so_luong: product.quantity,
          ten_nguoi_nhan: addressInfo.name,
          so_dien_thoai: addressInfo.phone,
          dia_chi: addressInfo.address,
          giam_voucher: discountCode || 0,
          giam_diem: useKiCoin ? 1000 : 0, // bạn có thể thay bằng logic tính điểm thực tế
          phuong_thuc_thanh_toan: paymentMethod, // cod | vnpay | momo
        };

        const res = await cartApi.buyNow(payload);
        const data = res?.data;
        console.log("Mua ngay response:", data);

        if (data?.payment_url) {
          window.location.href = data.payment_url;
          return;
        }

        const orderId = data?.don_hang_id;
        navigate(`/orderSuccess?orderId=${orderId}&gw=${paymentMethod}`);
        return;
      }

      // --- Giữ nguyên flow checkout giỏ hàng (bạn đã có sẵn) ---
      const payload = {
        ten_nguoi_nhan: addressInfo.name,
        so_dien_thoai: addressInfo.phone,
        dia_chi: addressInfo.address,
        phuong_thuc_thanh_toan: paymentMethod,
        su_dung_ki_coin: useKiCoin,
        ma_giam_gia: discountCode || null,
        phi_van_chuyen: cartSummary.phi_van_chuyen,
        san_pham: products.map((p) => ({
          san_pham_id: p.id,
          so_luong: p.quantity,
        })),
      };

      const res = await cartApi.checkout(payload);
      const data = res?.data;
      if (data?.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      const orderId = data?.don_hang_id || data?.data?.id || data?.order?.id;
      navigate(`/orderSuccess?orderId=${orderId}&gw=${paymentMethod}`);
    } catch (error) {
      api.error({
        message: isBuyNow ? "Mua ngay thất bại" : "Đặt hàng thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Vui lòng thử lại.",
        placement: "topRight",
      });
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      width: "40%",
      render: (_, record) => (
        <div className="product-info">
          <img
            src={record.image || "/placeholder.svg"}
            alt={record.name}
            className="product-image"
          />
          <div className="product-details">
            <h2 className="product-name">{record.name}</h2>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: "20%",
      render: (price) => formatVND(price),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "15%",
      render: (quantity) => quantity,
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      width: "25%",
      render: (total) => formatVND(total),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div className="header">
        <ArrowLeftOutlined className="back-icon" onClick={() => navigate(-1)} />
        <Title level={4} className="header-title">
          MUA HÀNG
        </Title>
      </div>
      <div className="buying-container">
        <div className="main-content">
          <div className="left-section">
            <Card className="address-card">
              <div className="address-header">
                <Text strong style={{ color: "#f5077a", fontSize: 16 }}>
                  Địa chỉ nhận hàng:
                </Text>
                <Text
                  className="change-address"
                  onClick={() => {
                    form.setFieldsValue(addressInfo);
                    setIsModalVisible(true);
                  }}
                >
                  Thay Đổi
                </Text>
              </div>
              <div className="address-info">
                <EnvironmentOutlined className="location-icon" />
                <Text>
                  {addressInfo.name} - {addressInfo.phone} -{" "}
                  {addressInfo.address}
                </Text>
              </div>
            </Card>

            <Card className="products-card">
              <Table
                columns={columns}
                dataSource={products}
                pagination={false}
                className="products-table"
              />
            </Card>
          </div>

          <div className="right-section">
            <div className="payment-section">
              <div className="discount-section">
                <h3 className="section-title">Mã giảm giá</h3>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập mã giảm giá"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="discount-input"
                  />
                  <Button type="primary" className="apply-btn">
                    ÁP DỤNG
                  </Button>
                </Space.Compact>
                <Button block className="select-code-btn">
                  CHỌN MÃ
                </Button>
              </div>

              <Divider />

              <div className="kicoin-section">
                <h3 className="section-title">Sử dụng điểm tích</h3>
                <div className="kicoin-toggle">
                  <span>Dùng 100 điểm</span>
                  <Switch checked={useKiCoin} onChange={setUseKiCoin} />
                </div>
              </div>

              <Divider />

              <div className="payment-card">
                <h3 className="section-title">Phương thức thanh toán</h3>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-options"
                >
                  <Radio value="cod" className="cash-option">
                    <span className="payment-icon cash-icon"></span>
                    Thanh toán khi nhận hàng
                  </Radio>
                  <Radio value="vnpay" className="card-option">
                    <span className="payment-icon card-icon"></span>
                    VNPay
                  </Radio>
                  <Radio value="momo" className="card-option">
                    <span className="payment-icon card-icon"></span>
                    Momo
                  </Radio>
                </Radio.Group>
              </div>
            </div>

            <Card className="summary-card">
              <div className="summary-row">
                <Text>Tổng tiền hàng</Text>
                <Text strong>{formatVND(totalAmount)}</Text>
              </div>
              <div className="summary-row">
                <Text>Tổng tiền Voucher giảm giá</Text>
                <Text>{formatVND(voucherDiscount)}</Text>
              </div>
              <div className="summary-row">
                <Text>Tổng phí vận chuyển</Text>
                <Text>{formatVND(shippingFee)}</Text>
              </div>
              <Divider />
              <div className="summary-row total-row">
                <Text strong>Tổng thanh toán</Text>
                <Text strong className="final-total">
                  {formatVND(finalTotal)}
                </Text>
              </div>
            </Card>

            <Button
              type="primary"
              size="large"
              className="order-button"
              onClick={handleCheckout}
            >
              ĐẶT HÀNG
            </Button>
          </div>
        </div>
      </div>
      {/* Modal thay đổi địa chỉ */}
      <Modal
        title="Thay đổi địa chỉ nhận hàng"
        open={isModalVisible}
        onOk={handleSaveAddress}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="street"
            label="Địa chỉ (VD: 01 ABC)"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ chi tiết" },
            ]}
          >
            <Input placeholder="Nhập số nhà, tên đường" />
          </Form.Item>

          <Form.Item
            name="ward"
            label="Phường/Xã"
            rules={[{ required: true, message: "Vui lòng nhập phường/xã" }]}
          >
            <Input placeholder="Nhập tên phường/xã" />
          </Form.Item>

          <Form.Item
            name="district"
            label="Quận/Huyện"
            rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}
          >
            <Input placeholder="Nhập tên quận/huyện" />
          </Form.Item>

          <Form.Item
            name="province"
            label="Tỉnh/Thành phố"
            rules={[
              { required: true, message: "Vui lòng nhập tỉnh/thành phố" },
            ]}
          >
            <Input placeholder="Nhập tên tỉnh/thành phố" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default BuyPage;
