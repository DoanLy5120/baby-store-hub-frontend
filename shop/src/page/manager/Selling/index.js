import "./Selling.scss";
import { Tabs } from "antd";
import { useState, useEffect } from "react";
import { Input, Radio } from "antd";
import { Tooltip, Select } from "antd";
import { AiFillThunderbolt } from "react-icons/ai";
import { TbTruckDelivery } from "react-icons/tb";
import { FaTrashAlt } from "react-icons/fa";
import Sua from "../../../assets/img/manager/sua.jpg";
import { Button, Row, Col, Typography, Space, Divider } from "antd";
import { UserOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function Selling() {
  const [activeKey, setActiveKey] = useState("quick");

  //thanh tìm kiếm
  const { Search } = Input;

  //ghi chú
  const [value, setValue] = useState("");

  //chọn sản phẩm từ tìm kiếm
  const { Option } = Select;
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  //dữ liệu giải khách hàng
  const [customers, setCustomers] = useState([
    { id: 1, name: "Nguyễn Văn A", phone: "0123456789" },
    { id: 2, name: "Trần Thị B", phone: "0987654321" },
    { id: 3, name: "Lê Minh C", phone: "0933333333" },
  ]);

  const onSearchProduct = (value) => {
    // Giả lập kết quả tìm kiếm và chọn sản phẩm
    const fakeProduct = {
      id: Date.now(),
      code: "SP001",
      name: value,
      image: Sua,
      quantity: 1,
      price: 100000,
      discount: 10000,
      discountType: "vnd", // hoặc "percent"
      finalPrice: 90000,
    };
    setSelectedProducts([...selectedProducts, fakeProduct]);
  };
  //hàm tăng giảm số lượng, xóa sp
  const handleQuantityChange = (id, type) => {
    const updated = selectedProducts.map((prod) =>
      prod.id === id
        ? {
            ...prod,
            quantity:
              type === "inc"
                ? prod.quantity + 1
                : Math.max(1, prod.quantity - 1),
          }
        : prod
    );
    setSelectedProducts(updated);
  };

  const handleDelete = (id) => {
    const updated = selectedProducts.filter((prod) => prod.id !== id);
    setSelectedProducts(updated);
  };

  const handlePriceChange = (id, field, value) => {
    const updated = selectedProducts.map((prod) => {
      if (prod.id === id) {
        let newProd = { ...prod, [field]: value };

        // Tính lại giá bán
        let discountAmount =
          newProd.discountType === "vnd"
            ? newProd.discount
            : (newProd.price * newProd.discount) / 100;

        newProd.finalPrice = newProd.price - discountAmount;
        return newProd;
      }
      return prod;
    });
    setSelectedProducts(updated);
  };

  const handleDiscountTypeChange = (id, type) => {
    handlePriceChange(id, "discountType", type);
  };

  //cấu hình kết quả thanh toán
  const { Text } = Typography;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState("Doãn Ly");
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderSummary, setOrderSummary] = useState({
    totalItems: 0,
    totalAmount: 0,
    discount: 0,
    customerPayment: 0,
  });

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format thời gian theo định dạng dd/mm/yyyy hh:mm
  const formatDateTime = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Xử lý tìm kiếm khách hàng
  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);

    const result = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.phone.includes(value)
    );

    setFilteredCustomers(result);
  };

  // Xử lý thêm khách hàng mới
  const handleAddCustomer = () => {
    const name = prompt("Nhập tên khách hàng:");
    const phone = prompt("Nhập số điện thoại:");

    if (!name || !phone) return;

    const newCustomer = {
      id: Date.now(),
      name,
      phone,
    };

    setCustomers([...customers, newCustomer]);
    setCustomerSearch(name);
    setSelectedCustomer(newCustomer);
  };

  // Xử lý thanh toán
  const handlePayment = () => {
    if (selectedProducts.length === 0) {
      return;
    }

    const invoice = {
      invoiceCode: `HD${Date.now()}`, // Mã hóa đơn giả lập
      createdAt: formatDateTime(new Date()),
      staff: selectedStaff,
      customer: selectedCustomer
        ? selectedCustomer.name
        : customerSearch || "Khách lẻ",
      customerPhone: selectedCustomer ? selectedCustomer.phone : "0123456789",
      items: selectedProducts.map((prod) => ({
        productName: prod.name,
        quantity: prod.quantity,
        unitPrice: prod.finalPrice,
        vat: 0.1,
        total: prod.finalPrice * prod.quantity,
      })),
      discount: orderSummary.discount,
      totalAmount: orderSummary.customerPayment,
    };

    setInvoices((prev) => [...prev, invoice]); // Lưu vào danh sách hóa đơn
    setSelectedInvoice(invoice); // Dùng để in hóa đơn gần nhất

    setCustomerPoint((prev) => prev + earnedPoint);
    setEarnedPoint(0);

    // Reset form bán hàng
    setSelectedProducts([]);
    setValue("");
    setCustomerSearch("");
    setOrderSummary({
      totalItems: 0,
      totalAmount: 0,
      discount: 0,
      customerPayment: 0,
    });

    // Đợi DOM cập nhật rồi mới in
    setTimeout(() => {
      window.print();
    }, 300);
  };

  useEffect(() => {
    if (selectedInvoice) {
      // Đợi DOM cập nhật rồi mới gọi in
      const timeout = setTimeout(() => {
        window.print();
      }, 300); // đủ thời gian React cập nhật renderPrintableInvoice

      return () => clearTimeout(timeout);
    }
  }, [selectedInvoice]);

  // Danh sách nhân viên mẫu
  const staffList = ["Doãn Ly", "Nguyễn Văn A", "Trần Thị B", "Lê Minh C"];

  useEffect(() => {
    const totalAmount = selectedProducts.reduce(
      (sum, prod) => sum + prod.finalPrice * prod.quantity,
      0
    );

    const totalItems = selectedProducts.reduce(
      (sum, prod) => sum + prod.quantity,
      0
    );

    const discount = orderSummary.discount || 0;
    const customerPayment = totalAmount - discount;

    setOrderSummary({
      totalAmount,
      totalItems,
      discount,
      customerPayment,
    });

    setEarnedPoint(Math.floor(customerPayment / 10000));
  }, [selectedProducts, orderSummary.discount]);

  //tích điểm
  const [customerPoint, setCustomerPoint] = useState(0); // điểm hiện tại giả lập
  const [earnedPoint, setEarnedPoint] = useState(0);

  //phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("cash");

  //các item footer
  const tabItems = [
    {
      key: "quick",
      label: (
        <span className="tab-label">
          <span className="tab-icon">
            <AiFillThunderbolt />
          </span>
          BÁN NHANH
        </span>
      ),
    },
    {
      key: "delivery",
      label: (
        <span className="tab-label">
          <span className="tab-icon">
            <TbTruckDelivery />
          </span>
          BÁN GIAO HÀNG
        </span>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeKey) {
      case "quick":
        return (
          <div className="selling__quick">
            <div className="selling__search">
              <div className="selling__search-btn">
                <Search
                  placeholder="Tìm hàng hóa"
                  onSearch={onSearchProduct}
                  enterButton
                />
              </div>
              <hr style={{ marginTop: "10px" }} />
              <div className="selling__quick-content">
                <div className="selling__search-result">
                  {selectedProducts.map((product) => (
                    <div className="product-row" key={product.id}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                      <span className="product-name">
                        {product.code} - {product.name}
                      </span>
                      <div className="product-quantity">
                        <button
                          onClick={() =>
                            handleQuantityChange(product.id, "dec")
                          }
                        >
                          -
                        </button>
                        <span>{product.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(product.id, "inc")
                          }
                        >
                          +
                        </button>
                      </div>
                      <div className="product-price">
                        <Tooltip
                          placement="bottom"
                          arrow={true}
                          overlayInnerStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                          }}
                          color="#fff"
                          title={
                            <div style={{ color: "#000" }}>
                              <div className="tooltip-row">
                                <div className="tooltip-label">Đơn giá:</div>
                                <div className="tooltip-input">
                                  <Input
                                    value={product.price}
                                    min={0}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        product.id,
                                        "price",
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div className="tooltip-row">
                                <div className="tooltip-label">Giảm giá:</div>
                                <div className="tooltip-input">
                                  <Input
                                    value={product.discount}
                                    min={0}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        product.id,
                                        "discount",
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                  <Select
                                    value={product.discountType}
                                    style={{ width: 70 }}
                                    onChange={(value) =>
                                      handleDiscountTypeChange(
                                        product.id,
                                        value
                                      )
                                    }
                                  >
                                    <Option value="vnd">₫</Option>
                                    <Option value="percent">%</Option>
                                  </Select>
                                </div>
                              </div>
                              <div className="tooltip-row">
                                <div className="tooltip-label">Giá bán:</div>
                                <div className="tooltip-input">
                                  <Input value={product.finalPrice} disabled />
                                </div>
                              </div>
                            </div>
                          }
                        >
                          <button className="price-button">
                            {product.finalPrice.toLocaleString()}đ
                          </button>
                        </Tooltip>
                      </div>

                      <div className="product-total">
                        {(
                          product.finalPrice * product.quantity
                        ).toLocaleString()}
                        đ
                      </div>
                      <button
                        className="product-delete"
                        onClick={() => handleDelete(product.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="selling__search-note">
                  <TextArea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ghi chú"
                    autoSize={{ minRows: 2, maxRows: 5 }}
                  />
                </div>
              </div>
            </div>
            <div className="selling__proceed">
              <div className="pos-checkout">
                {/* Header */}
                <div className="pos-header">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space size="middle">
                        {/* Dropdown nhân viên */}
                        <Select
                          value={selectedStaff}
                          onChange={setSelectedStaff}
                          className="staff-select"
                          suffixIcon={<UserOutlined />}
                          bordered={false}
                        >
                          {staffList.map((staff) => (
                            <Option key={staff} value={staff}>
                              {staff}
                            </Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>
                    <Col>
                      {/* Hiển thị thời gian */}
                      <Text className="current-time">
                        {formatDateTime(currentTime)}
                      </Text>
                    </Col>
                  </Row>
                </div>

                {/* Customer Search */}
                <div className="customer-search">
                  <Input
                    placeholder="Tìm khách hàng"
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    prefix={<SearchOutlined />}
                    suffix={
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={handleAddCustomer}
                        className="add-customer-btn"
                      />
                    }
                    className="search-input"
                  />
                  {filteredCustomers.length > 0 && (
                    <div className="customer-dropdown">
                      {filteredCustomers.map((cus) => (
                        <div
                          key={cus.id}
                          className="customer-item"
                          onClick={() => {
                            setCustomerSearch(`${cus.name} - ${cus.phone}`);
                            setSelectedCustomer(cus); // lưu thông tin KH
                            setFilteredCustomers([]);
                          }}
                        >
                          {cus.name} - {cus.phone}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                  <Space
                    direction="vertical"
                    size="large"
                    className="summary-content"
                  >
                    {/* Tổng tiền hàng */}
                    <Row
                      justify="space-between"
                      align="middle"
                      className="summary-row"
                    >
                      <Col>
                        <Text className="summary-label">Tổng tiền hàng</Text>
                      </Col>
                      <Col>
                        <Space>
                          <Text className="summary-value">
                            {orderSummary.totalItems}
                          </Text>
                          <Divider type="vertical" />
                          <Text className="summary-amount">
                            {orderSummary.totalAmount.toLocaleString()}
                          </Text>
                        </Space>
                      </Col>
                    </Row>

                    {/* Giảm giá */}
                    <Row
                      justify="space-between"
                      align="middle"
                      className="summary-row"
                    >
                      <Col>
                        <Text className="summary-label">Giảm giá</Text>
                      </Col>
                      <Col>
                        <Input
                          className="summary-input"
                          min={0}
                          value={orderSummary.discount}
                          onChange={(e) => {
                            const newDiscount = Number(e.target.value);
                            const totalAmount = selectedProducts.reduce(
                              (sum, prod) =>
                                sum + prod.finalPrice * prod.quantity,
                              0
                            );
                            setOrderSummary({
                              ...orderSummary,
                              discount: newDiscount,
                              customerPayment: totalAmount - newDiscount,
                            });
                          }}
                        />
                      </Col>
                    </Row>

                    {/* Khách cần trả */}
                    <Row
                      justify="space-between"
                      align="middle"
                      className="summary-row customer-payment"
                    >
                      <Col>
                        <Text className="summary-label customer-payment-label">
                          Khách cần trả
                        </Text>
                      </Col>
                      <Col>
                        <Text className="summary-amount customer-payment-amount">
                          {orderSummary.customerPayment.toLocaleString()}
                        </Text>
                      </Col>
                    </Row>
                    {/* Tích điểm */}
                    <Row
                      justify="space-between"
                      align="middle"
                      className="summary-row"
                    >
                      <Col>
                        <Text className="summary-label">Tích điểm</Text>
                      </Col>
                      <Col>
                        <Text className="summary-amount">
                          {earnedPoint} điểm
                        </Text>
                      </Col>
                    </Row>

                    {/* Điểm hiện tại */}
                    <Row
                      justify="space-between"
                      align="middle"
                      className="summary-row"
                    >
                      <Col>
                        <Text className="summary-label">Điểm hiện tại</Text>
                      </Col>
                      <Col>
                        <Text className="summary-amount">
                          {customerPoint} điểm
                        </Text>
                      </Col>
                    </Row>
                    {/* Phương thức thanh toán */}
                    <Row className="summary-row">
                      <Col span={24}>
                        <Radio.Group
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          value={paymentMethod}
                        >
                          <Space direction="horizontal">
                            <Radio value="cash">Tiền mặt</Radio>
                            <Radio value="bank">Chuyển khoản</Radio>
                          </Space>
                        </Radio.Group>
                      </Col>
                    </Row>
                  </Space>
                </div>

                {/* Payment Button */}
                <div className="payment-section">
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handlePayment}
                    className="payment-btn"
                  >
                    THANH TOÁN
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      case "delivery":
        return (
          <div className="selling__delivery">
            <div className="selling__search">
              <div className="selling__search-btn">
                <Search
                  placeholder="Tìm hàng hóa"
                  onSearch={onSearchProduct}
                  enterButton
                />
              </div>
              <hr style={{ marginTop: "10px" }} />
              <div className="selling__delivery-content">
                <div className="selling__delivery-result"></div>
                <div className="selling__delivery-note"></div>
              </div>
            </div>
            <div className="selling__proceed"></div>
          </div>
        );
      default:
        return null;
    }
  };

  //in hóa đơn
  const renderPrintableInvoice = () => {
    if (!selectedInvoice) return null;

    return (
      <div id="print-invoice" style={{ display: "none" }}>
        <h2 className="section-title">
          Chi tiết hóa đơn - {selectedInvoice.invoiceCode}
        </h2>
        <p>Khách hàng: {selectedInvoice.customer}</p>
        <p>SĐT: {selectedInvoice.customerPhone}</p>

        <h3>Chi tiết sản phẩm</h3>
        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>VAT</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {selectedInvoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice.toLocaleString("vi-VN")}₫</td>
                <td>{(item.vat * 100).toFixed(0)}%</td>
                <td>{item.total.toLocaleString("vi-VN")}₫</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ marginTop: 16 }}>
          Giảm giá: {selectedInvoice.discount.toLocaleString("vi-VN")}₫
        </p>
        <h3 className="total">
          Tổng tiền: {selectedInvoice.totalAmount.toLocaleString("vi-VN")}₫
        </h3>

        <div className="signature">
          <p>Người lập hóa đơn: ________________________</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderPrintableInvoice()}
      <div className="container">
        <div className="selling__content">{renderContent()}</div>

        <footer className="selling__choose">
          <Tabs
            items={tabItems}
            activeKey={activeKey}
            onChange={(key) => setActiveKey(key)}
            tabPosition="bottom"
          />
        </footer>
      </div>
    </>
  );
}

export default Selling;
