import "./Bill.scss";
import { useState, useEffect } from "react";
import ManagerLayoutSidebar from "../../../layouts/managerLayoutSidebar";
import billApi from "../../../api/billApi";
import productApi from "../../../api/productApi";
import { formatVND } from "../../../utils/formatter";
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
import moment from "moment";

const { Header, Content } = Layout;
const { Option } = Select;

const mapInvoiceDetailFromAPI = (hoaDon) => {
  const donHang = hoaDon.don_hang;
  const khachHangData = hoaDon.khachHang || donHang?.khach_hang || {};

  const paymentMap = {
    TienMat: "cash",
    ChuyenKhoan: "transfer",
    The: "card",
  };

  const items =
    donHang?.chi_tiet_don_hang?.map((item) => {
      const vat = item.san_pham?.VAT || 0;
      const unitPrice = item.giaBan ; 
      return {
        id: item.san_pham?.id,
        productName: item.productName || "Không tên",
        quantity: item.soLuong,
        unitPrice: unitPrice, 
        discount: item.giamGia || 0,
        vat: vat,
        total: unitPrice * item.soLuong, 
      };
    }) || [];

  return {
    id: hoaDon.id,
    invoiceCode: hoaDon.maHoaDon,
    paymentMethod: paymentMap[hoaDon.phuongThucThanhToan] || "unknown",
    totalAmount: parseFloat(hoaDon.tongThanhToan),
    discount: parseFloat(hoaDon.giamGiaSanPham || 0),
    vat: parseFloat(hoaDon.thueVAT || 0),
    customer:
      khachHangData.hoTen ||
      khachHangData.ten ||
      khachHangData.name ||
      "Khách lẻ",
    customerPhone:
      khachHangData.sdt ||
      khachHangData.soDienThoai ||
      khachHangData.phone ||
      "",
    notes: donHang?.ghiChu || "",
    status: donHang?.trangThai || "completed",
    createdAt: moment(hoaDon.ngayXuat).format("HH:mm DD/MM/YYYY"),
    items: items,
  };
};

export default function Bill() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [productMap, setProductMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //chuyển trang khi thêm hóa đơn
  const navigate = useNavigate();
  const handleAddNewInvoice = () => {
    navigate("/manager/ban-hang");
  };

  const calculateSubTotal = () => {
    const items = form.getFieldValue("items") || [];
    const discount = form.getFieldValue("discount") || 0;

    const sum = items.reduce((total, item) => {
      const quantity = item?.quantity || 0;
      const unitPrice = item?.unitPrice || 0;
      return total + quantity * unitPrice;
    }, 0);

    return sum - discount;
  };

  const calculateTongTienHang = () => {
    const items = form.getFieldValue("items") || [];

    const sum = items.reduce((total, item) => {
      const quantity = item?.quantity || 0;
      const unitPrice = item?.unitPrice || 0;
      const vat = item?.vat || 0;
      return total + quantity * unitPrice * (1 + vat);
    }, 0);

    return sum;
  };

  //tạo ra danh sách hóa đơn đã được tìm kiếm qua mã hđ hoặc tên kh
  const searchedInvoices = filteredInvoices.filter(
    (invoice) =>
      (invoice.invoiceCode || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.customer || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  //click vào 1 hđ
  const handleInvoiceClick = async (invoice) => {
    try {
      const res = await billApi.getById(invoice.id);
      const fullInvoice = res.data?.data;

      if (!fullInvoice) {
        message.error("Không thể lấy chi tiết hóa đơn");
        return;
      }

      const hoaDonData = {
        id: fullInvoice.hoaDon.id,
        maHoaDon: fullInvoice.hoaDon.maHoaDon,
        khachHang: fullInvoice.khachHang,
        phuongThucThanhToan: fullInvoice.hoaDon.phuongThucThanhToan,
        tongTienHang: fullInvoice.hoaDon.tongTienHang,
        giamGiaSanPham: fullInvoice.hoaDon.giamGia,
        thueVAT: fullInvoice.hoaDon.thueVAT,
        tongThanhToan: fullInvoice.hoaDon.tongThanhToan,
        ngayXuat: fullInvoice.hoaDon.ngayXuat,
        don_hang: {
          khach_hang: fullInvoice.khachHang || {},
          ghiChu: fullInvoice.ghiChu || "",
          trangThai: fullInvoice.trangThai || "completed",
          chi_tiet_don_hang: (fullInvoice.sanPhams || []).map((sp) => ({
            san_pham: {
              id: sp.id,
              VAT: parseFloat(sp.VAT) / 100 || 0,
            },
            productName: productMap[sp.id] || "Không tên",
            soLuong: parseInt(sp.soLuong),
            giaBan: parseFloat(sp.giaBan),
            giamGia: parseFloat(sp.giamGia),
            tongTien: parseFloat(sp.tongTien),
          })),
        },
      };

      const mappedInvoice = mapInvoiceDetailFromAPI(hoaDonData);

      const itemsWithKeys = mappedInvoice.items.map((item, idx) => ({
        ...item,
        key: item.id || idx,
      }));

      const finalInvoice = {
        ...mappedInvoice,
        items: itemsWithKeys,
        khachHang: {
          ten: mappedInvoice.customer,
          soDienThoai: mappedInvoice.customerPhone,
        },
      };

      setSelectedInvoice(finalInvoice);
      form.setFieldsValue(finalInvoice);
      setIsModalOpen(true);
    } catch (err) {
      message.error("Không thể lấy chi tiết hóa đơn");
    }
  };

  const handleSaveInvoice = async () => {
    try {
      const values = await form.validateFields();

      if (!values.items || values.items.length === 0) {
        message.error("Hóa đơn phải có ít nhất 1 sản phẩm!");
        return;
      }

      const oldIds = selectedInvoice?.items?.map((item) => item.id) || [];
      const newIds = values.items?.map((item) => item.id) || [];
      const xoaSanPhamIds = oldIds.filter((id) => !newIds.includes(id));

      const paymentMapReverse = {
        cash: "TienMat",
        transfer: "ChuyenKhoan",
        card: "The",
      };

      const payload = {
        tongTienHang: calculateTongTienHang(),
        giamGiaSanPham: values.discount || 0,
        thueVAT: values.vat || 0,
        tongThanhToan: calculateSubTotal(),
        phuongThucThanhToan:
          paymentMapReverse[values.paymentMethod] || "TienMat",
        ghiChu: values.notes || "",
        trangThai: values.status || "completed",
        tenKhachHang: values.customer || "Khách lẻ",
        soDienThoai: values.customerPhone || "",
        xoaSanPhamIds: xoaSanPhamIds,
        sanPhams: values.items.map((item) => ({
          id: item.id,
          soLuong: item.quantity,
          giaBan: item.unitPrice,
          giamGia: item.discount || 0,
          tongTien: item.total,
        })),
      };

      const res = await billApi.update(selectedInvoice.id, payload);

      if (res.data?.message) {
        api.success({
          message: "Cập nhật hóa đơn thành công",
          placement: "topRight",
        });

        form.resetFields();
        setIsModalOpen(false);
        setSelectedInvoice(null);

        const updated = mapInvoiceDetailFromAPI(res.data.data);
        const updatedList = invoices.map((inv) =>
          inv.id === selectedInvoice.id ? updated : inv
        );
        setInvoices(updatedList);
        setFilteredInvoices(updatedList);
        setSelectedInvoice(updated);
      } else {
        throw new Error("Lỗi không xác định");
      }
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  //xóa hóa đơn
  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      await billApi.delete(selectedInvoice.id);

      const updatedList = invoices.filter(
        (inv) => inv.id !== selectedInvoice.id
      );
      setInvoices(updatedList);
      setFilteredInvoices(updatedList);

      api.success({
        message: "Đã xóa hóa đơn thành công",
        placement: "topRight",
      });

      setIsModalOpen(false);
      setSelectedInvoice(null);
      form.resetFields();
    } catch (error) {
      message.error("Xoá hóa đơn thất bại!");
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);

        const res = await billApi.getAll();
        const list = res.data || [];

        const mapped = list.map(mapInvoiceDetailFromAPI);

        setInvoices(mapped);
        setFilteredInvoices(mapped);
      } catch (err) {
        console.error("Lỗi khi tải danh sách hóa đơn:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll();
        const products = res.data?.data || [];

        const map = {};
        products.forEach((sp) => {
          map[sp.id] = sp.tenSanPham;
        });

        setProductMap(map);
      } catch (err) {
        console.error("Lỗi khi tải danh sách sản phẩm:", err);
      }
    };

    fetchProducts();
    fetchInvoices();
  }, []);


  const updateItemTotal = (index) => {
    const items = form.getFieldValue("items") || [];
    const quantity = items[index]?.quantity || 0;
    const unitPrice = items[index]?.unitPrice || 0;
    const total = quantity * unitPrice;
    form.setFieldValue(["items", index, "total"], total);
  };

  //in hóa đơn
  const handlePrintInvoice = () => {
    const printSection = document.getElementById("print-invoice");
    if (printSection) {
      printSection.style.display = "block";

      setTimeout(() => {
        window.print();
        printSection.style.display = "none";
      }, 100);
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
      render: (amount) => <span className="discount">{formatVND(amount)}</span>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <span className="amount">{formatVND(amount)}</span>,
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
            return "Tiền Mặt";
          case "transfer":
            return "Chuyển Khoản";
          case "card":
            return "Thẻ";
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
        { key: "hom_nay", label: "Hôm nay", icon: <CalendarOutlined /> },
        { key: "hom_qua", label: "Hôm qua", icon: <CalendarOutlined /> },
        { key: "tuan_nay", label: "Tuần này", icon: <CalendarOutlined /> },
        {
          key: "tuan_truoc",
          label: "Tuần trước",
          icon: <CalendarOutlined />,
        },
        {
          key: "thang_nay",
          label: "Tháng này",
          icon: <CalendarOutlined />,
        },
        {
          key: "thang_truoc",
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
          key: "TienMat",
          label: "Tiền Mặt",
          icon: <IoIosCash />,
        },
        {
          key: "ChuyenKhoan",
          label: "Chuyển Khoản",
          icon: <FaMoneyBillTransfer />,
        },
        {
          key: "The",
          label: "Thẻ",
          icon: <FaMoneyBillTransfer />,
        },
      ],
    },
  ];

  //xử lý lọc theo thời gian
  const handleTimeFilter = async (key) => {
    try {
      setLoading(true);

      const res = await billApi.getAll({ params: { thoiGian: key } });
      const list = res.data || []; 

      const mapped = list.map(mapInvoiceDetailFromAPI);
      setFilteredInvoices(mapped);
    } catch (err) {
      message.error("Lọc hóa đơn theo thời gian thất bại");
    } finally {
      setLoading(false);
    }
  };

  //lọc theo phương thức thanh toán
  const handleMethodFilter = async (methodKey) => {
    try {
      setLoading(true);

      const res = await billApi.getAll({ params: { phuongThuc: methodKey } });
      const list = res.data || [];

      const mapped = list.map(mapInvoiceDetailFromAPI);
      setFilteredInvoices(mapped);
    } catch (err) {
      message.error("Lọc hóa đơn theo phương thức thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Khối in hóa đơn riêng biệt
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
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {selectedInvoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice.toLocaleString("vi-VN")}₫</td>
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
                  current: currentPage,
                  onChange: (page) => setCurrentPage(page),
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
                      name={["khachHang", "ten"]}
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
                    <Form.Item
                      label="Số điện thoại"
                      name={["khachHang", "soDienThoai"]}
                    >
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
                        <Option value="card">Thẻ</Option>
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
                            render: (_, record, index) => (
                              <Form.Item
                                name={[index, "productName"]}
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
                            render: (_, record, index) => (
                              <Form.Item
                                name={[index, "quantity"]}
                                rules={[
                                  { required: true, message: "Nhập SL!" },
                                ]}
                                noStyle
                              >
                                <InputNumber
                                  min={1}
                                  onChange={() => updateItemTotal(index)}
                                />
                              </Form.Item>
                            ),
                          },
                          {
                            title: "Đơn giá",
                            render: (_, record, index) => {
                              const items = form.getFieldValue("items") || [];
                              const unitPrice = items[index]?.unitPrice || 0;
                              return <span>{formatVND(unitPrice)}</span>;
                            },
                          },
                          {
                            title: "Thành tiền",
                            render: (_, record, index) => {
                              const items = form.getFieldValue("items") || [];
                              const unitPrice = items[index]?.unitPrice || 0;
                              const quantity = items[index]?.quantity || 0;
                              const total = unitPrice * quantity;
                              return <span>{formatVND(total)}</span>;
                            },
                          },
                          {
                            title: "Xóa",
                            render: (_, record, index) => (
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(fields[index].name)} // ✅ đây mới đúng
                              />
                            ),
                          },
                        ]}
                      />
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
                    <Form.Item label="Tổng tiền">
                      <div className="total-amount">
                        {formatVND(calculateSubTotal())}
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
