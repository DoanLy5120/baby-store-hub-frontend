import "./Bill.scss";
import { useState, useEffect } from "react";
import ManagerLayoutSidebar from "../../../layouts/managerLayoutSidebar";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Card,
  Space,
  notification,
  message,
  Popconfirm,
  Layout,
  Row,
  Col,
  Select,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { IoIosCash } from "react-icons/io";
import { FaReplyAll } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useWatch } from "antd/es/form/Form";
import moment from "moment";

const { Header, Content } = Layout;
const { Option } = Select;

// Sample data
const sampleInvoices = [
  {
    id: "1",
    invoiceCode: "HD000048",
    customer: "Khách lẻ",
    customerPhone: "0123456789",
    customerAddress: "123 Đường ABC, Quận 1, TP.HCM",
    discount: 0,
    totalAmount: 77000,
    createdAt: "30/06/2025 10:31",
    paymentMethod: "cash",
    status: "completed",
    items: [
      {
        id: "1",
        productName: "Sản phẩm A",
        quantity: 2,
        unitPrice: 35000,
        vat: 0.1,
        total: 77000,
      },
    ],
    notes: "Giao hàng tận nơi",
  },
  {
    id: "2",
    invoiceCode: "HD000047",
    customer: "Anh Giang - Kim Mã",
    customerPhone: "0987654321",
    customerAddress: "456 Kim Mã, Ba Đình, Hà Nội",
    discount: 4000,
    totalAmount: 40000,
    createdAt: "28/06/2025 08:56",
    paymentMethod: "transfer",
    status: "processing",
    items: [
      {
        id: "1",
        productName: "Sản phẩm B",
        quantity: 1,
        unitPrice: 40000,
        vat: 0.1,
        total: 44000,
      },
    ],
  },
  {
    id: "3",
    invoiceCode: "HD000046",
    customer: "Nguyễn Văn Hải",
    customerPhone: "0369852147",
    customerAddress: "789 Lê Lợi, Quận 3, TP.HCM",
    discount: 0,
    totalAmount: 0,
    createdAt: "27/06/2025 08:55",
    paymentMethod: "transfer",
    status: "cancelled",
    items: [],
  },
  {
    id: "4",
    invoiceCode: "HD000045",
    customer: "Chị Mai - Tân Bình",
    customerPhone: "0912345678",
    customerAddress: "321 Cộng Hòa, Tân Bình, TP.HCM",
    discount: 10000,
    totalAmount: 100000,
    createdAt: "26/06/2025 14:22",
    paymentMethod: "cash",
    status: "completed",
    items: [
      {
        id: "1",
        productName: "Sản phẩm C",
        quantity: 3,
        unitPrice: 30000,
        vat: 0.1,
        total: 99000,
      },
      {
        id: "2",
        productName: "Sản phẩm D",
        quantity: 1,
        unitPrice: 10000,
        vat: 0.1,
        total: 11000,
      },
    ],
    notes: "Khách hàng VIP",
  },
  {
    id: "5",
    invoiceCode: "HD000044",
    customer: "Anh Tuấn - Hà Nội",
    customerPhone: "0987123456",
    customerAddress: "654 Láng Hạ, Đống Đa, Hà Nội",
    discount: 0,
    totalAmount: 165000,
    createdAt: "25/06/2025 09:15",
    paymentMethod: "cash",
    status: "processing",
    items: [
      {
        id: "1",
        productName: "Sản phẩm E",
        quantity: 5,
        unitPrice: 30000,
        vat: 0.1,
        total: 165000,
      },
    ],
  },
];

export default function Bill() {
  const [invoices, setInvoices] = useState(sampleInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [filteredInvoices, setFilteredInvoices] = useState(sampleInvoices);
  const [api, contextHolder] = notification.useNotification();

  //chuyển trang khi thêm hóa đơn
  const navigate = useNavigate();
  const handleAddNewInvoice = () => {
    navigate("/manager/ban-hang");
  };

  //tính tổng thành tiền khi thêm sp trong modal
  const watchedItems = useWatch("items", form) || [];
  const watchedDiscount = useWatch("discount", form) || 0;

  const calculatedTotal =
    watchedItems.reduce((sum, item) => sum + (item?.total || 0), 0) -
    watchedDiscount;

  //tạo ra danh sách hóa đơn đã được tìm kiếm qua mã hđ hoặc tên kh
  const searchedInvoices = filteredInvoices.filter(
    (invoice) =>
      invoice.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //click vào 1 hđ
  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    form.setFieldsValue({
      ...invoice,
      items: invoice.items.map((item) => ({
        ...item,
        vat: item.vat ?? 0, // Nếu vat chưa có thì set 0
      })),
    });
    setIsModalOpen(true);
  };

  const handleSaveInvoice = async () => {
    try {
      const values = await form.validateFields();
      const items = values.items || [];
      const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
      const totalAmount = subtotal - (values.discount || 0);

      const updatedInvoice = {
        ...values,
        totalAmount,
        items,
      };

      //xử lý cập nhật
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoice.id ? { ...inv, ...updatedInvoice } : inv
        )
      );
      setIsModalOpen(false);
      setSelectedInvoice(null);
      form.resetFields();
      setTimeout(() => {
        api.success({
          message: "Cập nhật thành công",
          placement: "topRight",
        });
      }, 300);
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };
  useEffect(() => {
    setFilteredInvoices(invoices);
  }, [invoices]);

  //xóa hóa đơn
  const handleDeleteInvoice = () => {
    if (selectedInvoice) {
      setInvoices((prev) =>
        prev.filter((inv) => inv.id !== selectedInvoice.id)
      );
      setIsModalOpen(false);
      setSelectedInvoice(null);
      form.resetFields();
      setTimeout(() => {
        api.success({
          message: "Đã xóa thành công",
          placement: "topRight",
        });
      }, 300);
    }
  };

  //in hóa đơn
  const handlePrintInvoice = () => {
    const printSection = document.getElementById("print-invoice");
    if (printSection) {
      printSection.style.display = "block";

      setTimeout(() => {
        window.print();
        printSection.style.display = "none";
      }, 100); // Đợi 1 chút để trình duyệt render xong rồi mới in
    }
  };

  //bảng hóa đơn
  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "invoiceCode",
      key: "invoiceCode",
      render: (text) => <span className="invoice-code">{text}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (text) => text || "Chưa có tên",
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      render: (amount) => (
        <span className="discount">{amount.toLocaleString("vi-VN")}đ</span>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <span className="amount">{amount.toLocaleString("vi-VN")}đ</span>
      ),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => {
        switch (method) {
          case "cash":
            return "Tiền mặt";
          case "transfer":
            return "Chuyển khoản";
          default:
            return "Không xác định";
        }
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleInvoiceClick(record)}
        />
      ),
    },
  ];

  //sidebar
  const sidebarItems = [
    {
      key: "time",
      label: "Thời gian",
      icon: <CalendarOutlined />,
      children: [
        { key: "today", label: "Hôm nay", icon: <CalendarOutlined /> },
        { key: "yesterday", label: "Hôm qua", icon: <CalendarOutlined /> },
        { key: "this-week", label: "Tuần này", icon: <CalendarOutlined /> },
        {
          key: "last-week",
          label: "Tuần trước",
          icon: <CalendarOutlined />,
        },
        {
          key: "this-month",
          label: "Tháng này",
          icon: <CalendarOutlined />,
        },
        {
          key: "last-month",
          label: "Tháng trước",
          icon: <CalendarOutlined />,
        },
      ],
    },
    {
      key: "creator",
      label: "Người tạo",
      icon: <UserOutlined />,
      children: [
        {
          key: "select-creator",
          label: "Chọn người tạo",
          icon: <UserOutlined />,
        },
      ],
    },
    {
      key: "method",
      label: "Phương thức thanh toán",
      icon: <UserOutlined />,
      children: [
        {
          key: "cash",
          label: "Tiền mặt",
          icon: <IoIosCash />,
        },
        {
          key: "transfer",
          label: "Chuyển khoản",
          icon: <FaMoneyBillTransfer />,
        },
      ],
    },
  ];

  //hàm lọc hóa đơn theo ngày
  const filterInvoicesByDate = (fromDate, toDate) => {
    console.log("Filtering from:", fromDate.format("DD/MM/YYYY HH:mm"));
    console.log("Filtering to:", toDate.format("DD/MM/YYYY HH:mm"));

    const filtered = invoices.filter((invoice) => {
      const invoiceDate = moment(invoice.createdAt, "DD/MM/YYYY HH:mm");
      const isInRange = invoiceDate.isBetween(fromDate, toDate, "day", "[]");
      console.log(
        `${invoice.invoiceCode} - ${invoiceDate.format(
          "DD/MM/YYYY HH:mm"
        )} - In range: ${isInRange}`
      );

      return isInRange;
    });

    console.log(`Found ${filtered.length} invoices in date range`);
    setFilteredInvoices(filtered);
  };

  //xử lý lọc theo thời gian
  const handleTimeFilter = (key) => {
    let fromDate, toDate;

    switch (key) {
      case "today":
        fromDate = moment().startOf("day");
        toDate = moment().endOf("day");
        break;
      case "yesterday":
        fromDate = moment().subtract(1, "day").startOf("day");
        toDate = moment().subtract(1, "day").endOf("day");
        break;
      case "this-week":
        fromDate = moment().startOf("week");
        toDate = moment().endOf("week");
        break;
      case "last-week":
        fromDate = moment().subtract(1, "week").startOf("week");
        toDate = moment().subtract(1, "week").endOf("week");
        break;
      case "this-month":
        fromDate = moment().startOf("month");
        toDate = moment().endOf("month");
        break;
      case "last-month":
        fromDate = moment().subtract(1, "month").startOf("month");
        toDate = moment().subtract(1, "month").endOf("month");
        break;
      default:
        setFilteredInvoices(invoices);
        return;
    }

    filterInvoicesByDate(fromDate, toDate);
  };


  //lọc theo phương thức thanh toán
  const handleMethodFilter = (methodKey) => {
    const filtered = invoices.filter(
      (invoice) => invoice.paymentMethod === methodKey
    );

    console.log(
      `Lọc theo phương thức thanh toán: ${methodKey}, kết quả:`,
      filtered.length
    );
    setFilteredInvoices(filtered);

    const methodLabel = methodKey === "cash" ? "Tiền mặt" : "Chuyển khoản";
    message.success(
      `Đã lọc ${filtered.length} hóa đơn theo phương thức "${methodLabel}"`
    );
  };

  // Khối in hóa đơn riêng biệt
  const renderPrintableInvoice = () => {
    if (!selectedInvoice) return null;

    return (
      <div id="print-invoice" style={{ display: "none" }}>
        <h2 className="section-title">Chi tiết hóa đơn - {selectedInvoice.invoiceCode}</h2>
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
      {contextHolder}
      <ManagerLayoutSidebar
        title="HÓA ĐƠN"
        sidebarItems={sidebarItems}
        onSidebarClick={({ key, keyPath }) => {
          if (keyPath.includes("time")) {
            handleTimeFilter(key);
          } else if (keyPath.includes("method")) {
            handleMethodFilter(key);
          } else {
            setFilteredInvoices(invoices);
          }
        }}
      >
        <div className="bill-page">
          <Header className="bill__header">
            <div className="bill__header-left">
              <Input
                className="search-input"
                placeholder="Theo mã hóa đơn"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bill__header-action">
              <Space>
                <Button
                  type="primary"
                  icon={<FaReplyAll />}
                  onClick={() => setFilteredInvoices(invoices)}
                >
                  Tất cả
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNewInvoice}
                >
                  Thêm mới
                </Button>
              </Space>
            </div>
          </Header>

          <Content className="bill__content">
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <span>
                    Danh sách hóa đơn ({filteredInvoices.length} hóa đơn)
                  </span>
                </Space>
              }
            >
              <Table
                className="bill__content-table"
                columns={columns}
                dataSource={searchedInvoices}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} của ${total} hóa đơn`,
                }}
                locale={{
                  emptyText: (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <ShoppingCartOutlined />
                      </div>
                      <div>Không tìm thấy hóa đơn nào</div>
                    </div>
                  ),
                }}
              />
            </Card>
          </Content>

          <Modal
            title={
              <Space>
                <EditOutlined />
                {selectedInvoice &&
                invoices.find((inv) => inv.id === selectedInvoice.id)
                  ? `Chi tiết hóa đơn - ${selectedInvoice?.invoiceCode}`
                  : "Tạo hóa đơn mới"}
              </Space>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedInvoice(null);
              form.resetFields();
            }}
            width={700}
            className="invoice-modal"
            footer={[
              <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>,
              <Button
                key="print"
                icon={<PrinterOutlined />}
                onClick={handlePrintInvoice}
                disabled={
                  !selectedInvoice ||
                  !invoices.find((inv) => inv.id === selectedInvoice.id)
                }
              >
                In
              </Button>,
              <Popconfirm
                key="delete"
                title="Bạn có chắc chắn muốn xóa hóa đơn này?"
                onConfirm={handleDeleteInvoice}
                disabled={
                  !selectedInvoice ||
                  !invoices.find((inv) => inv.id === selectedInvoice.id)
                }
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={
                    !selectedInvoice ||
                    !invoices.find((inv) => inv.id === selectedInvoice.id)
                  }
                >
                  Xóa
                </Button>
              </Popconfirm>,
              <Button key="save" type="primary" onClick={handleSaveInvoice}>
                {selectedInvoice &&
                invoices.find((inv) => inv.id === selectedInvoice.id)
                  ? "Cập nhật"
                  : "Tạo mới"}
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <div className="bill__detail">
                <div className="bill__detail-title">Thông tin hóa đơn</div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Mã hóa đơn"
                      name="invoiceCode"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mã hóa đơn!",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Khách hàng"
                      name="customer"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên khách hàng!",
                        },
                      ]}
                    >
                      <Input placeholder="Tên khách hàng" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Số điện thoại" name="customerPhone">
                      <Input placeholder="Số điện thoại khách hàng" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Trạng thái" name="status">
                      <Select>
                        <Option value="processing">Đang xử lý</Option>
                        <Option value="completed">Hoàn thành</Option>
                        <Option value="cancelled">Đã hủy</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Phương thức thanh toán"
                      name="paymentMethod"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn phương thức thanh toán!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn phương thức">
                        <Option value="cash">Tiền mặt</Option>
                        <Option value="transfer">Chuyển khoản</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="bill__modal">
                <Form.List name="items">
                  {(fields, { add, remove }) => (
                    <>
                      <Table
                        dataSource={fields}
                        rowKey="key"
                        pagination={false}
                        size="small"
                        bordered
                        columns={[
                          {
                            title: "Tên sản phẩm",
                            dataIndex: "productName",
                            render: (_, record, index) => (
                              <Form.Item
                                name={[record.name, "productName"]}
                                rules={[
                                  { required: true, message: "Nhập tên!" },
                                ]}
                                noStyle
                              >
                                <Input placeholder="Tên sản phẩm" />
                              </Form.Item>
                            ),
                          },
                          {
                            title: "Số lượng",
                            dataIndex: "quantity",
                            render: (_, record) => (
                              <Form.Item
                                name={[record.name, "quantity"]}
                                rules={[
                                  { required: true, message: "Nhập số lượng!" },
                                ]}
                                noStyle
                              >
                                <InputNumber
                                  min={0}
                                  onChange={(val) => {
                                    const items = form.getFieldValue("items");
                                    const unitPrice =
                                      items[record.name]?.unitPrice || 0;
                                    const vat = items[record.name]?.vat || 0;
                                    const total = val * unitPrice * (1 + vat);
                                    form.setFieldValue(
                                      ["items", record.name, "total"],
                                      total
                                    );
                                  }}
                                />
                              </Form.Item>
                            ),
                          },
                          {
                            title: "Đơn giá",
                            dataIndex: "unitPrice",
                            render: (_, record) => (
                              <Form.Item
                                name={[record.name, "unitPrice"]}
                                rules={[
                                  { required: true, message: "Nhập đơn giá!" },
                                ]}
                                noStyle
                              >
                                <InputNumber
                                  min={0}
                                  onChange={(val) => {
                                    const items = form.getFieldValue("items");
                                    const quantity =
                                      items[record.name]?.quantity || 0;
                                    const vat = items[record.name]?.vat || 0;
                                    const total = val * quantity * (1 + vat);
                                    form.setFieldValue(
                                      ["items", record.name, "total"],
                                      total
                                    );
                                  }}
                                />
                              </Form.Item>
                            ),
                          },
                          {
                            title: "Thuế VAT",
                            dataIndex: "vat",
                            render: (_, record) => (
                              <Form.Item name={[record.name, "vat"]} noStyle>
                                <InputNumber
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  formatter={(value) =>
                                    `${(parseFloat(value || 0) * 100).toFixed(
                                      0
                                    )}%`
                                  }
                                  parser={(value) =>
                                    parseFloat(value.replace("%", "")) / 100
                                  }
                                  onChange={(val) => {
                                    const items = form.getFieldValue("items");
                                    const quantity =
                                      items[record.name]?.quantity || 0;
                                    const unitPrice =
                                      items[record.name]?.unitPrice || 0;
                                    const total =
                                      quantity * unitPrice * (1 + val);
                                    form.setFieldValue(
                                      ["items", record.name, "total"],
                                      total
                                    );
                                  }}
                                />
                              </Form.Item>
                            ),
                          },
                          {
                            title: "Thành tiền",
                            dataIndex: "total",
                            render: (_, record) => (
                              <Form.Item name={[record.name, "total"]} noStyle>
                                <InputNumber disabled />
                              </Form.Item>
                            ),
                          },
                          {
                            title: "Xóa",
                            render: (_, record) => (
                              <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(record.name)}
                              />
                            ),
                          },
                        ]}
                      />
                      <Button
                        block
                        icon={<PlusOutlined />}
                        type="dashed"
                        style={{ marginTop: 12 }}
                        onClick={() =>
                          add({
                            id: Date.now().toString(),
                            productName: "",
                            quantity: 1,
                            unitPrice: 0,
                            total: 0,
                          })
                        }
                      >
                        Thêm sản phẩm
                      </Button>
                    </>
                  )}
                </Form.List>
              </div>

              <div className="bill__modal">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Giảm giá" name="discount">
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Thành tiền">
                      <div className="total-amount">
                        {calculatedTotal.toLocaleString("vi-VN")}đ
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Ghi chú" name="notes">
                      <Input.TextArea placeholder="Ghi chú thêm..." rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Form>
          </Modal>
        </div>
      </ManagerLayoutSidebar>
    </>
  );
}
