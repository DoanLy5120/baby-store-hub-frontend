import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { formatVND } from "../../../utils/formatter";
import "./Buypage.scss";

const { Title, Text } = Typography;

function BuyPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    {
      key: "1",
      id: 1,
      name: "Hanomilk",
      description: "Sữa tươi tiệt trùng",
      image: "/milk-carton.png",
      price: 8000,
      quantity: 1,
      total: 8000,
    },
    {
      key: "2",
      id: 2,
      name: "Tã Bobby",
      description: "Tã dán siêu thấm",
      image: "/baby-diaper-package.jpg",
      price: 105000,
      quantity: 2,
      total: 210000,
    },
    {
      key: "3",
      id: 3,
      name: "Ô tô Cầu",
      description: "Xe đồ chơi trẻ em",
      image: "/toy-car-yellow.jpg",
      price: 1800000,
      quantity: 1,
      total: 1800000,
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountCode, setDiscountCode] = useState("");
  const [useKiCoin, setUseKiCoin] = useState(false);

  // state cho thông tin địa chỉ
  const [addressInfo, setAddressInfo] = useState({
    name: "Nguyễn Thảo Như Bình",
    phone: "0396353602",
    address: "123 Núi Thành, Hòa Cường Nam, Hải Châu, Đà Nẵng",
  });

  // state cho modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const totalAmount = products.reduce((sum, product) => sum + product.total, 0);
  const voucherDiscount = 0;
  const shippingFee = 20000;
  const finalTotal = totalAmount - voucherDiscount + shippingFee;

  //thay đổi địa chỉ
  const handleSaveAddress = () => {
    form
      .validateFields()
      .then((values) => {
        setAddressInfo(values);
        setIsModalVisible(false);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
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
            <div className="product-name">{record.name}</div>
            <div className="product-description">{record.description}</div>
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
                  {addressInfo.name} {addressInfo.phone} {addressInfo.address}
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
                  <Radio value="cash" className="cash-option">
                    <span className="payment-icon cash-icon"></span>
                    Tiền mặt
                  </Radio>
                  <Radio value="card" className="card-option">
                    <span className="payment-icon card-icon"></span>
                    Thanh toán trực tuyến
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

            <Button type="primary" size="large" className="order-button">
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
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default BuyPage;
