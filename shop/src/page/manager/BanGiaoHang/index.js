import { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Input,
  Button,
  Spin,
  message,
  Typography,
  Radio,
  Empty,
  Card,
  Form,
  InputNumber,
  Scrollbar,
} from "antd";
import { CarOutlined, UserOutlined } from "@ant-design/icons";
import "./BanGiaoHang.scss";
import bangiaohangApi from "../../../api/bangiaohangApi";
import { formatVND } from "../../../utils/formatter";

const { Text } = Typography;

const shippingPartners = [
  { id: "ghn", name: "Giao Hàng Nhanh", fee: 20000, type: "Nhanh" },
  { id: "ghtk", name: "Giao Hàng Tiết Kiệm", fee: 22000, type: "Tiêu chuẩn" },
  { id: "vtp", name: "Viettel Post", fee: 28000, type: "Nhanh" },
];

const BanGiaoHang = ({ staffName = "Doãn Ly" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingPartner, setShippingPartner] = useState("ghn");
  const [form] = Form.useForm();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [printVisible, setPrintVisible] = useState(false);

  const handlePrintDeliveryInvoice = () => {
    if (!selectedOrder) return;
    window.print();
  };

  useEffect(() => {
    if (printVisible) {
      const t = setTimeout(() => {
        window.print(); // in ở đây 1 lần
        setPrintVisible(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [printVisible]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bangiaohangApi.getOrders({
        trangThai: "CHO_LAY_HANG", // chỉ lấy đơn chưa giao
        // không gửi q hay range
      });
      const ordersList = Array.isArray(res.data?.data) ? res.data.data : [];
      setOrders(ordersList);
    } catch (error) {
      message.error("Lỗi khi tải danh sách đơn hàng!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRowClick = (order) => {
    if (selectedOrder?.id === order.id) return;

    setSelectedOrder(order);

    form.setFieldsValue({
      codAmount: order.tong_thanh_toan || 0,
      shippingAddress: order.dia_chi_giao_hang || "",
      note: order.ghi_chu || "",
      weight: order.khoi_luong || 500,
    });
  };

  const handleConfirmAndShip = async () => {
    const orderId = selectedOrder?.id;
    if (!orderId) {
      return message.warning("Vui lòng chọn một đơn hàng để giao.");
    }

    setLoading(true);
    try {
      const formValues = await form.validateFields();
      const payload = {
        ghi_chu: `Nhân viên ${staffName} xác nhận giao hàng. ${
          formValues.note || ""
        }`,
      };

      const response = await bangiaohangApi.moveToShipping(orderId, payload);
      message.success(
        response.data.message ||
          "Đơn hàng đã được chuyển cho đơn vị vận chuyển!"
      );

      handlePrintDeliveryInvoice(); // bật div in

      // ✅ Chỉ reset sau khi in xong
      const onAfterPrint = () => {
        setSelectedOrder(null);
        form.resetFields();
        fetchOrders();
        window.removeEventListener("afterprint", onAfterPrint);
      };
      window.addEventListener("afterprint", onAfterPrint);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xác nhận giao hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  const columnsOrders = [
    { title: "Mã ĐH", dataIndex: "ma_don_hang", key: "ma_don_hang" },
    { title: "Khách hàng", dataIndex: "ten_khach_hang", key: "ten_khach_hang" },
    {
      title: "Tổng tiền",
      dataIndex: "tong_thanh_toan",
      key: "tong_thanh_toan",
      render: (text) => formatVND(text),
    },
  ];

  const renderDetails = () => {
    if (!selectedOrder) {
      return (
        <div className="empty-container">
          <Empty description="Chọn một đơn hàng để xem chi tiết" />
        </div>
      );
    }

    const selectedPartnerFee =
      shippingPartners.find((p) => p.id === shippingPartner)?.fee || 0;
    const products = selectedOrder.san_pham || [];
    const columnsProducts = [
      {
        title: "Tên sản phẩm",
        dataIndex: "ten_san_pham",
        key: "ten_san_pham",
        ellipsis: true,
      },
      {
        title: "Số lượng",
        dataIndex: "so_luong",
        key: "so_luong",
        align: "center",
        width: 100,
      },
      {
        title: "Thành tiền",
        key: "thanh_tien",
        align: "right",
        width: 120,
        render: (_, record) => formatVND(record.thanh_tien || 0),
      },
    ];

    return (
      <Spin spinning={loading} tip="Đang xử lý...">
        <Row gutter={16} style={{ height: "100%" }}>
          <Col span={12} className="bgh-column detail-column">
            <div className="bgh-column-header">Thông tin giao hàng</div>
            <div
              className="bgh-column-body"
              style={{
                maxHeight: 510,
                overflowY: "auto",
                paddingRight: 8,
              }}
            >
              <Card size="small" style={{ marginBottom: 8 }}>
                <Input
                  value={`${selectedOrder.ten_khach_hang} - ${
                    selectedOrder.so_dien_thoai || "N/A"
                  }`}
                  readOnly
                  prefix={<UserOutlined />}
                />
              </Card>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
                    Mã vận đơn
                  </label>
                  <Input value={selectedOrder.ma_van_don} readOnly />
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 600,
                        marginBottom: "6px",
                        fontSize: "14px",
                        color: "#000",
                      }}
                    >
                      Phương thức thanh toán
                    </label>
                    <Input
                      style={{ width: "100%" }}
                      readOnly
                      value={
                        selectedOrder?.phuong_thuc_thanh_toan || "Tiền mặt"
                      }
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 600,
                        marginBottom: "6px",
                        fontSize: "14px",
                        color: "#000",
                      }}
                    >
                      Thu hộ (COD)
                    </label>
                    <InputNumber
                      style={{ width: "100%" }}
                      readOnly
                      value={selectedOrder?.tong_thanh_toan || 0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
                    Địa chỉ giao hàng
                  </label>
                  <Input.TextArea
                    value={
                      selectedOrder.dia_chi_giao_hang || selectedOrder.dia_chi
                    }
                    readOnly
                    rows={2}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
                    Ghi chú đơn hàng
                  </label>
                  <Input.TextArea
                    value={selectedOrder.ghi_chu}
                    placeholder="Ghi chú thêm cho đơn hàng..."
                    rows={2}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  Danh sách sản phẩm ({products.length})
                </div>
                <Table
                  dataSource={products}
                  columns={columnsProducts}
                  rowKey={(record, index) => record.san_pham_id || index}
                  size="small"
                  pagination={false}
                  scroll={{ y: 300 }}
                  locale={{ emptyText: "Không có sản phẩm" }}
                />
              </div>
            </div>
          </Col>
          <Col span={12} className="bgh-column shipping-column">
            <div className="bgh-column-header">Đối tác giao hàng</div>
            <div className="bgh-column-body">
              <Radio.Group
                value={shippingPartner}
                onChange={(e) => setShippingPartner(e.target.value)}
                style={{ width: "100%" }}
              >
                {shippingPartners.map((p) => (
                  <div className="shipping-item" key={p.id}>
                    <div className="partner-info">
                      <Radio value={p.id}></Radio>
                      <div>
                        <Text strong>{p.name}</Text>
                        <br />
                        <Text type="secondary">{p.type}</Text>
                      </div>
                    </div>
                    <div className="partner-fee">{formatVND(p.fee)}</div>
                  </div>
                ))}
              </Radio.Group>
            </div>
            <div className="bgh-column-footer">
              <div className="summary-row">
                <Text>Tổng tiền hàng</Text>
                <Text>{formatVND(selectedOrder.tong_tien)}</Text>
              </div>
              <div className="summary-row">
                <Text>Giảm giá/Voucher</Text>
                <Text>-{formatVND(selectedOrder.tong_giam_gia)}</Text>
              </div>
              <div className="summary-row">
                <Text>Phí vận chuyển (dự kiến)</Text>
                <Text>{formatVND(selectedOrder.phi_van_chuyen || 0)}</Text>
              </div>
              <div className="summary-row total">
                <Text>Tổng thu</Text>
                <Text>{formatVND(selectedOrder.tong_thanh_toan || 0)}</Text>
              </div>
              <Button
                type="primary"
                size="large"
                className="confirm-button"
                onClick={handleConfirmAndShip}
                disabled={loading}
                icon={<CarOutlined />}
              >
                GIAO HÀNG
              </Button>
            </div>
          </Col>
        </Row>
      </Spin>
    );
  };

  return (
    <>
      <div className="ban-giao-hang-wrapper">
        <div className="bgh-content">
          <div id="print-delivery-invoice">
            {selectedOrder && (
              <>
                <h2 className="section-title">
                  Chi tiết hóa đơn - {selectedOrder.ma_van_don || "N/A"}
                </h2>

                {/* Thông tin khách hàng */}
                <div className="customer-info">
                  <p>
                    Khách hàng: {selectedOrder.ten_khach_hang || "Khách lẻ"}
                  </p>
                  <p>SĐT: {selectedOrder.so_dien_thoai || "Không có"}</p>
                  <p>
                    Địa chỉ:{" "}
                    {selectedOrder.dia_chi_giao_hang || selectedOrder.dia_chi}
                  </p>
                </div>

                {/* Thông tin vận chuyển */}
                {selectedOrder.ma_van_don && (
                  <div className="shipping-info">
                    <h3>Thông tin vận chuyển</h3>
                    <p>Mã vận đơn: {selectedOrder.ma_van_don}</p>
                    <p>Đơn vị vận chuyển: {shippingPartner}</p>
                    <p>
                      Phí vận chuyển:{" "}
                      {formatVND(selectedOrder.phi_van_chuyen || 0)}
                    </p>
                  </div>
                )}

                {/* Danh sách sản phẩm */}
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
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.san_pham?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.ten_san_pham}</td>
                        <td style={{ textAlign: "center" }}>{item.so_luong}</td>
                        <td style={{ textAlign: "right" }}>
                          {formatVND(item.thanh_tien)}
                        </td>
                      </tr>
                    )) || []}
                  </tbody>
                </table>

                {/* Thanh toán */}
                <div className="payment-summary">
                  <p>Giảm giá: {formatVND(selectedOrder.tong_giam_gia || 0)}</p>
                  <p>
                    Phí vận chuyển:{" "}
                    {formatVND(selectedOrder.phi_van_chuyen || 0)}
                  </p>
                  <h3 className="total">
                    Tổng thu: {formatVND(selectedOrder.tong_thanh_toan || 0)}
                  </h3>
                </div>

                {/* Chữ ký */}
                <div className="signature">
                  <p>Người lập phiếu: ________________________</p>
                </div>
              </>
            )}
          </div>

          <Row gutter={16} style={{ height: "100%" }}>
            <Col span={8} className="bgh-column order-list-column">
              {/* ✅ Chỉ còn Nhân viên + Thời gian */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fafafa",
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text>
                      <strong>Nhân viên:</strong> {staffName}
                    </Text>
                  </Col>
                  <Col>
                    <Text>{currentTime.toLocaleString("vi-VN")}</Text>
                  </Col>
                </Row>
              </div>

              {/* Danh sách đơn hàng */}
              <div className="bgh-column-body" style={{ padding: "0" }}>
                <Spin spinning={loading}>
                  <Table
                    dataSource={orders}
                    columns={columnsOrders}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    onRow={(record) => ({
                      onClick: () => handleRowClick(record),
                    })}
                    rowClassName={(record) =>
                      record.id === selectedOrder?.id
                        ? "ant-table-row-selected"
                        : ""
                    }
                  />
                </Spin>
              </div>
            </Col>

            <Col span={16}>{renderDetails()}</Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default BanGiaoHang;
