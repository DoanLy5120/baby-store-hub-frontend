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
  Tag,
  Space,
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
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { IoIosCash } from "react-icons/io";
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
    totalAmount: 70000,
    createdAt: "30/06/2025 10:31",
    status: "completed",
    items: [
      {
        id: "1",
        productName: "Sản phẩm A",
        quantity: 2,
        unitPrice: 35000,
        total: 70000,
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
    discount: 5000,
    totalAmount: 35000,
    createdAt: "28/06/2025 08:56",
    status: "processing",
    items: [
      {
        id: "1",
        productName: "Sản phẩm B",
        quantity: 1,
        unitPrice: 40000,
        total: 40000,
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
    totalAmount: 90000,
    createdAt: "26/06/2025 14:22",
    status: "completed",
    items: [
      {
        id: "1",
        productName: "Sản phẩm C",
        quantity: 3,
        unitPrice: 30000,
        total: 90000,
      },
      {
        id: "2",
        productName: "Sản phẩm D",
        quantity: 1,
        unitPrice: 10000,
        total: 10000,
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
    totalAmount: 150000,
    createdAt: "25/06/2025 09:15",
    status: "processing",
    items: [
      {
        id: "1",
        productName: "Sản phẩm E",
        quantity: 5,
        unitPrice: 30000,
        total: 150000,
      },
    ],
  },
];

const statusConfig = {
  processing: {
    label: "Đang xử lý",
    color: "orange",
    icon: <ClockCircleOutlined />,
  },
  completed: {
    label: "Hoàn thành",
    color: "green",
    icon: <CheckCircleOutlined />,
  },
  cancelled: { label: "Đã hủy", color: "red", icon: <CloseCircleOutlined /> },
  pending: {
    label: "Chờ xử lý",
    color: "blue",
    icon: <ExclamationCircleOutlined />,
  },
};

export default function Bill() {
  const [invoices, setInvoices] = useState(sampleInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [filteredInvoices, setFilteredInvoices] = useState(sampleInvoices);

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
      items: invoice.items || [],
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
      message.success("Xóa hóa đơn thành công!");
    }
  };

  //in hóa đơn
  const handlePrintInvoice = () => {
    if (selectedInvoice) {
      window.print();
      message.info("Đang in hóa đơn...");
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={statusConfig[status].color}
          icon={statusConfig[status].icon}
          className={`status-${status}`}
        >
          {statusConfig[status].label}
        </Tag>
      ),
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
      key: "status",
      label: "Trạng thái",
      icon: <ClockCircleOutlined />,
      children: [
        {
          key: "processing",
          label: "Đang xử lý",
          icon: <ClockCircleOutlined />,
        },
        {
          key: "completed",
          label: "Hoàn thành",
          icon: <CheckCircleOutlined />,
        },
        { key: "cancelled", label: "Đã hủy", icon: <CloseCircleOutlined /> },
        {
          key: "pending",
          label: "Chờ xử lý",
          icon: <ExclamationCircleOutlined />,
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

  //lọc theo trạng thái
  const handleStatusFilter = (statusKey) => {
    const filtered = invoices.filter((invoice) => invoice.status === statusKey);

    console.log(`Lọc trạng thái: ${statusKey}, kết quả:`, filtered.length);
    setFilteredInvoices(filtered);

    message.success(
      `Đã lọc ${filtered.length} hóa đơn theo trạng thái "${statusConfig[statusKey].label}"`
    );
  };

  return (
    <ManagerLayoutSidebar
      sidebarItems={sidebarItems}
      onSidebarClick={({ key, keyPath }) => {
        if (keyPath.includes("time")) {
          handleTimeFilter(key);
        } else if (keyPath.includes("status")) {
          handleStatusFilter(key);
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNewInvoice}
            >
              Thêm mới
            </Button>
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
                      { required: true, message: "Vui lòng nhập mã hóa đơn!" },
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
                      <Option value="pending">Chờ xử lý</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Địa chỉ" name="customerAddress">
                    <Input.TextArea placeholder="Địa chỉ khách hàng" rows={2} />
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
                              rules={[{ required: true, message: "Nhập tên!" }]}
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
                                  form.setFieldValue(
                                    ["items", record.name, "total"],
                                    val * unitPrice
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
                                  form.setFieldValue(
                                    ["items", record.name, "total"],
                                    val * quantity
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
  );
}
