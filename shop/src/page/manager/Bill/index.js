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
import { useLocation } from 'react-router-dom';


const { Header, Content } = Layout;
const { Option } = Select;

export default function Bill() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewInvoiceId = queryParams.get('view');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [productMap, setProductMap] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  
  const items = Form.useWatch("items", form) || [];

  // Tính tổng tiền từ items sử dụng giá trị total từ API
  const computedTotal = items.reduce((sum, item) => {
    const total = Number(item.total) || 0;
    return sum + total;
  }, 0);

  //chuyển trang khi thêm hóa đơn
  const navigate = useNavigate();
  const handleAddNewInvoice = () => {
    navigate("/manager/ban-hang");
  };

  // Hàm load lại danh sách hóa đơn
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await billApi.getAll();
      const list = res.data || [];
      const mapped = list
        .map(mapInvoiceListFromAPI)
        .filter((inv) => inv !== null);

      setInvoices(mapped);
      setFilteredInvoices(mapped);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hóa đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  //tạo ra danh sách hóa đơn đã được tìm kiếm qua mã hđ hoặc tên kh
  const searchedInvoices = filteredInvoices.filter(
    (invoice) =>
      invoice && (
        (invoice.invoiceCode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.customer || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  //click vào 1 hđ
  const handleInvoiceClick = async (invoice) => {
    try {
      const res = await billApi.getById(invoice.id);

      // Xử lý response có cấu trúc {success: true, data: {...}}
      const responseData = res.data;

      if (!responseData || !responseData.success) {
        message.error("Không thể lấy chi tiết hóa đơn");
        return;
      }

      // mapping hóa đơn từ response chi tiết - truyền responseData.data thay vì responseData
      const mappedInvoice = mapInvoiceDetailFromAPI(responseData.data);

      if (!mappedInvoice) {
        message.error("Lỗi khi xử lý dữ liệu hóa đơn");
        return;
      }

      setSelectedInvoice(mappedInvoice);

      // gán giá trị cho form
      form.setFieldsValue({
        ...mappedInvoice,
        invoiceCode: mappedInvoice.invoiceCode || "",
        khachHang: {
          ten: mappedInvoice.khachHang.ten,
          soDienThoai: mappedInvoice.khachHang.soDienThoai,
        },
        items: mappedInvoice.items,
        // Thêm các field vận chuyển nếu có
        shippingCode: mappedInvoice.shippingCode,
        shippingUnit: mappedInvoice.shippingUnit,
        shippingFee: mappedInvoice.shippingFee,
        deliveryStatus: mappedInvoice.deliveryStatus, // Sửa từ status thành deliveryStatus
        // Thêm field phương thức thanh toán
        paymentMethod: mappedInvoice.paymentMethod,
      });

      setIsModalOpen(true);
    } catch (err) {
      message.error("Không thể lấy chi tiết hóa đơn");
    }
  };

  const handleSaveInvoice = async () => {
    try {
      // Kiểm tra selectedInvoice có tồn tại không
      if (!selectedInvoice) {
        api.error({
          message: "Lỗi",
          description: "Không tìm thấy hóa đơn để cập nhật!",
          placement: "topRight",
        });
        return;
      }

      const values = await form.validateFields();

      // Sử dụng items từ form hoặc selectedInvoice.items làm fallback
      const currentItems = values.items && values.items.length > 0 ? values.items : selectedInvoice.items || [];

      if (currentItems.length === 0) {
        api.error({
          message: "Lỗi",
          description: "Hóa đơn phải có ít nhất 1 sản phẩm!",
          placement: "topRight",
        });
        return;
      }

      const oldIds = selectedInvoice?.items?.map((item) => item.id) || [];
      const newIds = currentItems?.map((item) => item.id) || [];
      const xoaSanPhamIds = oldIds.filter((id) => !newIds.includes(id));

      const paymentMapReverse = {
        momo: "momo",
        vnpay: "vnpay",
        cod: "cod",
        bank_transfer: "bank",
        credit_card: "card",
      };

      const payload = {
        tongTienHang: currentItems.length > 0 ? computedTotal : (selectedInvoice?.subTotal || 0),
        giamVoucher: selectedInvoice?.discountVoucher || 0,
        giamDiem: selectedInvoice?.discountPoint || 0,
        thueVAT: values.vat || 0,
        tongThanhToan: currentItems.length > 0 ? computedTotal : (selectedInvoice?.totalAmount || 0),
        phuongThucThanhToan: values.paymentMethod,
        ghiChu: values.orderNote || "",
        trangThai: values.deliveryStatus || "CHO_LAY_HANG", // Sửa từ status thành deliveryStatus
        tenKhachHang: values.khachHang?.ten || "Khách lẻ",
        soDienThoai: values.khachHang?.soDienThoai || "",
        sanPhams: currentItems.map((item) => ({
          id: item.id,
          soLuong: item.quantity,
          giaBan: item.unitPrice,
          giamGia: item.discount || 0,
          tongTien: item.total,
        })),
        xoaSanPhamIds,
      };

      const res = await billApi.update(selectedInvoice.id, payload);

      // Kiểm tra response thành công
      if (res.data && (res.data.success || res.data.message)) {
        api.success({
          message: "Cập nhật hóa đơn thành công",
          placement: "topRight",
        });

        form.resetFields();
        setIsModalOpen(false);
        setSelectedInvoice(null);

        // Load lại danh sách hóa đơn từ API để đảm bảo dữ liệu mới nhất
        await fetchInvoices();
      } else {
        throw new Error("Cập nhật không thành công");
      }
    } catch (error) {
      console.error("Lỗi cập nhật hóa đơn:", error);
      api.error({
        message: "Cập nhật hóa đơn thất bại",
        description: error.response?.data?.message || error.message || "Vui lòng kiểm tra lại thông tin!",
        placement: "topRight",
      });
    }
  };

  // ====== MAPPING CHO LIST (BẢNG) - dùng khi gọi billApi.getAll() ======
  const mapInvoiceListFromAPI = (hoaDon) => {
    if (!hoaDon) return null;

    const donHang = hoaDon.don_hang || {};
    const khachHangData = donHang.khach_hang || {};

    return {
      id: hoaDon.id || "",
      invoiceCode: hoaDon.ma_hoa_don || "",
      orderCode: donHang.ma_don_hang || "",
      // payment method trả ở list là snake_case
      paymentMethod:
        hoaDon.phuong_thuc_thanh_toan ||
        donHang.phuong_thuc_thanh_toan ||
        "unknown",
      subTotal: parseFloat(hoaDon.tong_tien_hang || 0),
      discountVoucher: parseFloat(hoaDon.giam_voucher || 0),
      discountPoint: parseFloat(hoaDon.giam_diem || 0),
      shippingFee: parseFloat(hoaDon.phi_van_chuyen || 0),
      totalAmount: parseFloat(hoaDon.tong_thanh_toan || 0),
      khachHang: {
        ten: khachHangData.hoTen || donHang.ten_nguoi_nhan || "Khách lẻ",
        soDienThoai: khachHangData.sdt || donHang.so_dien_thoai || "",
        diaChi: khachHangData.diaChi || donHang.dia_chi || "",
      },
      orderNote: donHang.ghi_chu || "",
      shippingUnit: donHang.don_vi_van_chuyen || "",
      shippingCode: donHang.ma_van_don || "",
      status: donHang.trang_thai || "CHO_LAY_HANG",
      // format thời gian giống phần hiển thị
      createdAt: hoaDon.ngay_xuat
        ? moment(hoaDon.ngay_xuat).format("HH:mm DD/MM/YYYY")
        : "",
      // để an toàn, items rỗng ở list
      items: donHang.chi_tiet_don_hang || [],
    };
  };

  // ====== MAPPING CHO DETAIL (MODAL) - dùng khi gọi billApi.getById(id) ======
  const mapInvoiceDetailFromAPI = (responseData) => {
    // responseData là res.data từ API chi tiết: { success: true, data: { hoaDon, khachHang, sanPhams, vanChuyen, ... } }
    if (!responseData || !responseData.hoaDon)
      return null;

    const hoaDon = responseData.hoaDon || {};
    const khachHang = responseData.khachHang || {};
    const sanPhams = responseData.sanPhams || [];
    const vanChuyen = responseData.vanChuyen || null;
    const trangThai = responseData.trangThai || "";

    // payment map (FE canonical)
    const paymentMap = {
      momo: "momo",
      vnpay: "vnpay",
      cash: "cash",
      cod: "cod",
      bank_transfer: "bank_transfer",
      credit_card: "credit_card",
    };

    const mappedItems = sanPhams.map((sp) => ({
      id: sp.id || "",
      productName: sp.tenSanPham || "",
      quantity: parseInt(sp.soLuong || 0, 10),
      unitPrice: parseFloat(sp.giaBan || 0),
      VAT: parseFloat(sp.VAT || 0),
      discount: parseFloat(sp.flashSale || 0) *100 ,
      total: parseFloat(sp.tongTien || 0),
    }));

    // keep aliases used by your UI (selectedInvoice.discount was used in print block),
    // nên gán thêm discount = discountVoucher để UI cũ không cần sửa
    const discountVoucher = parseFloat(hoaDon.giamVoucher || 0);

    return {
      id: hoaDon.id || "",
      invoiceCode: hoaDon.maHoaDon || "",
      orderCode: hoaDon.maDonHang || "",
      paymentMethod:
        paymentMap[hoaDon.phuongThucThanhToan] ||
        paymentMap[hoaDon.phuong_thuc_thanh_toan] ||
        "unknown",
      subTotal: parseFloat(hoaDon.tongTienHang || 0),
      discountVoucher,
      discount: discountVoucher, // alias để UI dùng selectedInvoice.discount vẫn đúng
      discountPoint: parseFloat(hoaDon.giamDiem || 0),
      VAT: parseFloat(hoaDon.thueVAT || 0),
      shippingFee: vanChuyen ? parseFloat(vanChuyen.phiVanChuyen || 0) : 0,
      totalAmount: parseFloat(hoaDon.tongThanhToan || 0),
      khachHang: {
        ten: khachHang.ten || "Khách lẻ",
        soDienThoai: khachHang.soDienThoai || "",
        diaChi: khachHang.diaChi || "",
      },
      orderNote: responseData.ghiChu || "",
      shippingUnit: vanChuyen ? vanChuyen.donVi || vanChuyen.don_vi || "" : "",
      shippingCode: vanChuyen
        ? vanChuyen.maVanDon || vanChuyen.ma_van_don || ""
        : "",
      deliveryStatus: trangThai || "CHO_LAY_HANG",
      createdAt: hoaDon.ngayXuat
        ? moment(hoaDon.ngayXuat).format("HH:mm DD/MM/YYYY")
        : "",
      items: mappedItems,
    };
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
  if (viewInvoiceId) {
    (async () => {
      try {
        const res = await billApi.getById(viewInvoiceId);
        const responseData = res.data;

        if (!responseData || !responseData.success) {
          message.error("Không thể lấy chi tiết hóa đơn");
          return;
        }

        const mappedInvoice = mapInvoiceDetailFromAPI(responseData.data);
        setSelectedInvoice(mappedInvoice);

        form.setFieldsValue({
          ...mappedInvoice,
          invoiceCode: mappedInvoice.invoiceCode || "",
          khachHang: {
            ten: mappedInvoice.khachHang.ten,
            soDienThoai: mappedInvoice.khachHang.soDienThoai,
            diaChi: mappedInvoice.khachHang.diaChi,
          },
          items: mappedInvoice.items,
          shippingCode: mappedInvoice.shippingCode,
          shippingUnit: mappedInvoice.shippingUnit,
          shippingFee: mappedInvoice.shippingFee,
          deliveryStatus: mappedInvoice.deliveryStatus,
          paymentMethod: mappedInvoice.paymentMethod,
        });

        setIsModalOpen(true);
      } catch (err) {
        message.error("Không thể lấy chi tiết hóa đơn");
      }
    })();
  }
}, [viewInvoiceId]);


  useEffect(() => {
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
      key: "customer",
      render: (record) => record.khachHang?.ten || "Chưa có tên",
    },
    {
      title: "Giảm giá",
      dataIndex: "discountVoucher", // đổi đúng field
      key: "discountVoucher",
      render: (amount) => (
        <span className="discount">{formatVND(amount || 0)}</span>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <span className="amount">{formatVND(amount || 0)}</span>
      ),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => {
        switch (method) {
          case "momo":
          case "vnpay":
            return "Thanh toán Online";
          case "cash":
            return "Tiền mặt"; 
          case "cod":
            return "Ship COD";
          case "bank_transfer":
            return "Chuyển khoản";
          case "credit_card":
            return "Thẻ";
          default:
            return "Không xác định";
        }
      },
    },
    {
      title: "Phương thức",
      dataIndex: "shippingFee",
      key: "shippingFee",
      render: (fee) =>
        parseFloat(fee) > 0 ? "Bán Online" : "Bán tại cửa hàng",
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
        { key: "tuan_truoc", label: "Tuần trước", icon: <CalendarOutlined /> },
        { key: "thang_nay", label: "Tháng này", icon: <CalendarOutlined /> },
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
          key: "momo",
          label: "Momo (Online)",

          icon: <IoIosCash />,
        },
        {
          key: "vnpay",
          label: "VNPay (Online)",
          icon: <IoIosCash />,
        },
        {
          key: "cod",
          label: "Tiền mặt",
          icon: <IoIosCash />,
        },
        {
          key: "bank_transfer",
          label: "Chuyển khoản",
          icon: <FaMoneyBillTransfer />,
        },
        {
          key: "credit_card",
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

      const mapped = list.map(mapInvoiceListFromAPI);
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

      const mapped = list.map(mapInvoiceListFromAPI);
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

    // Kiểm tra xem có thông tin vận chuyển không
    const hasShippingInfo = selectedInvoice?.shippingCode;

    return (
      <div id="print-invoice" style={{ display: "none" }}>
        <h2 className="section-title">
          Chi tiết hóa đơn - {selectedInvoice?.invoiceCode || "N/A"}
        </h2>
        
        {/* Thông tin khách hàng */}
        <div className="customer-info">
          <p>Khách hàng: {selectedInvoice?.khachHang?.ten || "N/A"}</p>
          <p>SĐT: {selectedInvoice?.khachHang?.soDienThoai || "N/A"}</p>
          {hasShippingInfo && selectedInvoice?.khachHang?.diaChi && (
            <p>Địa chỉ giao hàng: {selectedInvoice.khachHang.diaChi}</p>
          )}
        </div>

        {/* Thông tin vận chuyển - chỉ hiển thị khi có mã vận đơn */}
        {hasShippingInfo && (
          <div className="shipping-info">
            <h3>Thông tin vận chuyển</h3>
            <p>Mã vận đơn: {selectedInvoice.shippingCode}</p>
            {selectedInvoice.shippingUnit && (
              <p>Đơn vị vận chuyển: {selectedInvoice.shippingUnit}</p>
            )}
            {selectedInvoice.shippingFee && (
              <p>Phí vận chuyển: {formatVND(selectedInvoice.shippingFee)}</p>
            )}
          </div>
        )}

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
            {selectedInvoice?.items?.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{formatVND(item.unitPrice)}</td>
                <td>{formatVND(item.total)}</td>
              </tr>
            )) || []}
          </tbody>
        </table>

        {/* Thông tin tổng tiền */}
        <div className="payment-summary">
          <p style={{ marginTop: 16 }}>
            Giảm giá: {formatVND(selectedInvoice?.discount || 0)}
          </p>
          {hasShippingInfo && selectedInvoice?.shippingFee && (
            <p>Phí vận chuyển: {formatVND(selectedInvoice.shippingFee)}</p>
          )}
          <h3 className="total">
            Tổng tiền: {formatVND(items.length > 0 ? computedTotal : (selectedInvoice?.totalAmount || 0))}
          </h3>
        </div>

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
                  ? `Chi tiết hóa đơn - ${selectedInvoice?.invoiceCode || "N/A"}`
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
                          required: false,
                          message: "Vui lòng nhập mã hóa đơn!",
                        },
                      ]}
                    >
                      <Input disabled placeholder="Mã hóa đơn sẽ được tạo tự động" />
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

                  {/* ✅ Nếu có mã vận đơn thì mới hiển thị các field dưới */}
                  {/* Hiển thị thông tin vận chuyển nếu có mã vận đơn */}
                  {selectedInvoice?.shippingCode && (
                    <>
                      <Col span={12}>
                        <Form.Item label="Mã vận đơn" name="shippingCode">
                          <Input placeholder="Mã vận đơn" disabled />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Đơn vị vận chuyển"
                          name="shippingUnit"
                        >
                          <Input placeholder="Đơn vị vận chuyển" />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item label="Phí vận chuyển" name="shippingFee">
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            addonAfter="VND"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Trạng thái giao hàng"
                          name="deliveryStatus"
                        >
                          <Select placeholder="Chọn trạng thái">
                            <Option value="CHO_LAY_HANG">Chờ lấy hàng</Option>
                            <Option value="DANG_GIAO">Đang giao</Option>
                            <Option value="DA_GIAO">Đã giao</Option>
                            <Option value="HOAN_THANH">Hoàn thành</Option>
                            <Option value="DA_HUY">Đã hủy</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  <Col span={12}>
                    <Form.Item
                      label="Phương thức thanh toán"
                      name="paymentMethod"
                    >
                      <Select
                        placeholder="Chọn phương thức"
                        options={[
                          { value: "cash", label: "Tiền mặt" },
                          { value: "bank_transfer", label: "Chuyển khoản" },
                          { value: "credit_card", label: "Thẻ" },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  {/* Hiển thị địa chỉ giao hàng chỉ khi có mã vận đơn */}
                  {selectedInvoice?.shippingCode && (
                    <Col span={24}>
                      <Form.Item
                        label="Địa chỉ giao hàng"
                        name={["khachHang", "diaChi"]}
                      >
                        <Input placeholder="Địa chỉ giao hàng" />
                      </Form.Item>
                    </Col>
                  )}
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
                                <InputNumber min={1} />
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
                            title: "Giảm giá",
                            render: (_, record, index) => {
                              const items = form.getFieldValue("items") || [];
                              const discount = items[index]?.discount || 0;
                              return <span>{discount}%</span>;
                            },
                          },
                          {
                            title: "Thành tiền",
                            render: (_, record, index) => {
                              const items = form.getFieldValue("items") || [];
                              const total = items[index]?.total || 0;
                              return (
                                <span>{formatVND(total)}</span>
                              );
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
                    <Form.Item label="Giảm giá" name="discountVoucher">
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
                        {formatVND(items.length > 0 ? computedTotal : (selectedInvoice?.totalAmount || 0))}
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