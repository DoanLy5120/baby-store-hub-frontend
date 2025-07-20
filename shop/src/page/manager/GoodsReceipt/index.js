import "./GoodsReceipt.scss";
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Card,
  Space,
  message,
  notification,
  Modal,
  Form,
  Row,
  Col,
  Select,
  InputNumber,
  Popconfirm,
  Tag,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import goodsreceiptsheetApi from "../../../api/goodsreceiptsheetApi";
import ManagerLayoutSidebar from "../../../layouts/managerLayoutSidebar";
import providerApi from "../../../api/providerApi";
import { formatVND } from "../../../utils/formatter";
import { FaWarehouse } from "react-icons/fa6";
import productApi from "../../../api/productApi";

export default function GoodsReceiptSheet() {
  const [sheets, setSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);

  const [api, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const handleGoodsClick = (record) => {
    const matchedProvider = providers.find(
      (p) => p.tenNhaCungCap === record.nhaCungCap
    );

    setSelectedReceipt(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      maNhapHang: record.maNhapHang,
      thoiGian: record.thoiGian,
      nhaCungCap: matchedProvider?.id || null, // ✅ Dùng ID thay vì tên
      tongTien: record.tongTien,
      trangThai: record.trangThai,
      ghiChu: record.ghiChu,
    });
  };

  const expandedRowRender = (record) => {
    return (
      <>
        <Table
          columns={detailColumns}
          dataSource={record.chiTiet}
          pagination={false}
          rowKey="id"
        />
      </>
    );
  };

  const handleDeleteDetail = async (detailId) => {
    if (!selectedReceipt) return;

    try {
      await goodsreceiptsheetApi.deleteDetail(detailId);
      message.success("Xóa chi tiết thành công");

      // Cập nhật lại toàn bộ bảng
      fetchData();
    } catch (error) {
      console.error("Xóa chi tiết thất bại:", error);
      message.error("Xóa chi tiết thất bại");
    }
  };

  const fetchData = async () => {
    try {
      const res = await goodsreceiptsheetApi.getAll();
      const mappedData = res.data.map((item) => ({
        id: item.id,
        maNhapHang: item.so_phieu,
        thoiGian: item.ngay_nhap,
        nhaCungCap: item.nha_cung_cap?.tenNhaCungCap,
        tongTien: item.tong_tien_nhap,
        ghiChu: item.ghi_chu || "",
        trangThai: item.trang_thai,
        chiTiet: (item.chi_tiet || []).map((detail) => ({
          id: detail.id,
          maSanPham: detail.san_pham?.maSanPham || detail.san_pham_id,
          tenSanPham: detail.san_pham?.tenSanPham || "",
          soLuongNhap: detail.so_luong_nhap,
          giaNhap: detail.gia_nhap,
          thueNhap: detail.thue_nhap + " %",
          trangThai: item.trang_thai,
          san_pham_id: detail.san_pham?.id || detail.san_pham_id, // giữ lại id thực sự
          san_pham: detail.san_pham, // giữ lại object nếu có
        })),
      }));
      setSheets(mappedData);
      setFilteredSheets(mappedData);
    } catch (error) {
      message.error("Không thể tải danh sách phiếu nhập hàng");
    }
  };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await providerApi.getAll();
        console.log("Nha cung cap:", res.data);
        setProviders(res.data.data);
      } catch (error) {
        message.error("Không thể tải danh sách nhà cung cấp");
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll();
        setProducts(res.data.data || res.data); // tuỳ API trả về
      } catch (e) {
        message.error("Không thể tải danh sách sản phẩm");
      }
    };

    fetchProviders();
    fetchData();
    fetchProducts();
  }, []);

  const handleUpdate = async (values) => {
    try {
      await goodsreceiptsheetApi.update(selectedReceipt.id, {
        ngay_nhap: values.thoiGian,
        nha_cung_cap_id: values.nhaCungCap,
        tong_tien_nhap: values.tongTien,
        ghi_chu: values.ghiChu,
        trang_thai: values.trangThai,
        chiTiet: (selectedReceipt.chiTiet || []).map(item => ({
          san_pham_id: item.san_pham_id, // luôn là UUID
          so_luong_nhap: item.soLuongNhap,
          gia_nhap: item.giaNhap,
          thue_nhap: item.thueNhap ? parseFloat(item.thueNhap) : 0,
        })),
      });
      api.success({
        message: "Cập nhật phiếu thành công",
        placement: "topRight",
      });
      setIsModalOpen(false);
      setSelectedReceipt(null);
      fetchData();
    } catch (error) {
      api.warning({
        message: error?.response?.data?.message || "Cập nhật phiếu thất bại",
        placement: "topRight",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await goodsreceiptsheetApi.delete(id);
      api.success({
        message: "Xóa phiếu thành công",
        placement: "topRight",
      });
      setIsModalOpen(false);
      fetchData(); // reload bảng
    } catch (error) {
      api.warning({
        message: "Xóa phiếu thất bại",
        placement: "topRight",
      });
    }
  };

  const searchedSheets = filteredSheets.filter(
    (sheet) =>
      typeof sheet.maNhapHang === "string" &&
      sheet.maNhapHang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTrangThaiTag = (status) => {
    let color = "default";
    let label = "";

    switch (status) {
      case "phieu_tam":
        color = "orange";
        label = "Phiếu tạm";
        break;
      case "da_nhap":
        color = "green";
        label = "Đã nhập";
        break;
      case "da_huy":
        color = "red";
        label = "Đã hủy";
        break;
      default:
        color = "default";
        label = status;
    }

    return <Tag color={color}>{label}</Tag>;
  };

  const columns = [
    {
      title: "Mã nhập hàng",
      dataIndex: "maNhapHang",
      key: "maNhapHang",
    },
    {
      title: "Thời gian",
      dataIndex: "thoiGian",
      key: "thoiGian",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "nhaCungCap",
      key: "nhaCungCap",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTien",
      key: "tongTien",
      render: (text) => <span>{Number(text).toLocaleString()} ₫</span>,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (value) => renderTrangThaiTag(value),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleGoodsClick(record)}
        />
      ),
    },
  ];

  const detailColumns = [
    { title: "Mã sản phẩm", dataIndex: "maSanPham", key: "maSanPham" },
    { title: "Sản phẩm", dataIndex: "tenSanPham", key: "tenSanPham" },
    {
      title: "Số lượng nhập",
      dataIndex: "soLuongNhap",
      key: "soLuongNhap",
    },
    {
      title: "Giá nhập",
      dataIndex: "giaNhap",
      key: "giaNhap",
      render: (text) => formatVND(text),
    },
    { title: "Thuế nhập", dataIndex: "thueNhap", key: "thueNhap" },
    // Bỏ cột thao tác xóa sản phẩm
    // {
    //   title: "Thao tác",
    //   key: "action",
    //   render: ...
    // },
  ];

  const sidebarItems = [
    {
      key: "status",
      label: "Trạng thái",
      icon: <FaWarehouse />,
      children: [
        { key: "all", label: "Tất cả", },
        { key: "phieu_tam", label: "Phiếu tạm" },
        { key: "da_nhap", label: "Đã nhập"},
        { key: "da_huy", label: "Đã hủy"},
      ],
    },
  ];

  const handleSidebarFilter = ({ key }) => {
    if (key === "all") {
      setFilteredSheets(sheets);
      message.success("Hiển thị tất cả phiếu nhập hàng");
    } else {
      const filtered = sheets.filter((sheet) => sheet.trangThai === key);
      setFilteredSheets(filtered);
      message.success(`Đã lọc theo trạng thái: ${
        key === "phieu_tam"
          ? "Phiếu tạm"
          : key === "da_nhap"
          ? "Đã nhập"
          : key === "da_huy"
          ? "Đã hủy"
          : key
      }`);
    }
  };

  const handleSaveReceipt = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ngay_nhap: values.thoiGian,
        nha_cung_cap_id: values.nhaCungCap,
        tong_tien_nhap: values.tongTien,
        ghi_chu: values.ghiChu,
        trang_thai: values.trangThai,
        chiTiet: (values.chiTiet || []).filter(item => item && item.san_pham_id).map(item => {
          const product = products.find(p => p.id === item.san_pham_id);
          const giaNhap = product ? Number(product.giaBan || 0) : 0;
          return {
            san_pham_id: item.san_pham_id,
            so_luong_nhap: item.so_luong_nhap,
            gia_nhap: giaNhap,
            thue_nhap: Number(item.thue_nhap || 0),
          };
        }),
      };
      let response;
      if (selectedReceipt) {
        response = await goodsreceiptsheetApi.update(selectedReceipt.id, data);
        message.success("Cập nhật phiếu nhập thành công");
      } else {
        response = await goodsreceiptsheetApi.create(data);
        message.success("Tạo phiếu nhập thành công");
      }
      setIsModalOpen(false);
      setSelectedReceipt(null);
      fetchData();
    } catch (error) {
      message.error(error?.response?.data?.message || "Lưu phiếu nhập thất bại!");
    }
  };

  return (
    <>
      {contextHolder}
      <ManagerLayoutSidebar
        title="PHIẾU NHẬP HÀNG"
        sidebarItems={sidebarItems}
        onSidebarClick={handleSidebarFilter}
        disableMarginTop={true}
      >
        <div className="goods-receipt-sheet-page">
          <div className="goods-receipt-sheet__header">
            <Input
              className="search-input"
              placeholder="Tìm theo mã nhập hàng"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedReceipt(null);
                setIsModalOpen(true);
                form.resetFields();
              }}
            >
              Thêm mới
            </Button>
          </div>

          <Card
            title={
              <Space>
                <FaWarehouse />
                <span>
                  Danh sách phiếu nhập hàng ({searchedSheets.length} phiếu)
                </span>
              </Space>
            }
          >
            <Table
              className="goods-receipt-sheet__table"
              columns={columns}
              dataSource={searchedSheets}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} của ${total} phiếu`,
              }}
              expandedRowRender={(record) => (
                <Table
                  columns={detailColumns}
                  dataSource={record.chiTiet}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
              locale={{
                emptyText: (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <FaWarehouse />
                    </div>
                    <div>Không tìm thấy phiếu nhập hàng nào</div>
                  </div>
                ),
              }}
            />
          </Card>
          <Modal
            title={selectedReceipt ? `Cập nhật phiếu nhập - ${selectedReceipt.maNhapHang}` : "Tạo phiếu nhập mới"}
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedReceipt(null);
              form.resetFields();
            }}
            width={700}
            footer={[
              <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>,
              <Button key="save" type="primary" onClick={handleSaveReceipt}>
                {selectedReceipt ? "Cập nhật" : "Tạo mới"}
              </Button>,
            ]}
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={(_, allValues) => {
                if (allValues.chiTiet) {
                  const total = (allValues.chiTiet || []).reduce((sum, item) => {
                    if (!item || !item.san_pham_id) return sum;
                    const product = products.find(p => p.id === item.san_pham_id);
                    const giaNhap = product ? Number(product.giaBan || 0) : 0;
                    const thue = Number(item.thue_nhap || 0);
                    return sum + (Number(item.so_luong_nhap || 0) * (giaNhap + giaNhap * thue / 100));
                  }, 0);
                  form.setFieldsValue({ tongTien: total });
                  // Debug
                  // console.log('Chi tiết:', allValues.chiTiet, 'Tổng:', total);
                }
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Mã phiếu nhập" name="maNhapHang">
                    <Input disabled placeholder="Tự động sinh khi tạo mới" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Thời gian" name="thoiGian" rules={[{ required: true, message: "Chọn thời gian" }]}>
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Nhà cung cấp" name="nhaCungCap" rules={[{ required: true, message: "Chọn nhà cung cấp" }]}>
                    <Select placeholder="Chọn nhà cung cấp">
                      {providers.map((provider) => (
                        <Select.Option key={provider.id} value={provider.id}>
                          {provider.tenNhaCungCap}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Tổng tiền" name="tongTien" rules={[{ required: true, message: "Nhập tổng tiền" }]}>
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) => formatVND(value)}
                      parser={(value) => value.replace(/\₫\s?|(,*)/g, "")}
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Trạng thái" name="trangThai" rules={[{ required: true, message: "Chọn trạng thái" }]}>
                    <Select>
                      <Select.Option value="phieu_tam">Phiếu tạm</Select.Option>
                      <Select.Option value="da_nhap">Đã nhập</Select.Option>
                      <Select.Option value="da_huy">Đã hủy</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Ghi chú" name="ghiChu">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.List name="chiTiet" initialValue={[{}]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={8} key={key} align="middle">
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "san_pham_id"]}
                            rules={[{ required: true, message: "Chọn sản phẩm" }]}
                          >
                            <Select placeholder="Chọn sản phẩm">
                              {products.map((p) => (
                                <Select.Option key={p.id} value={p.id}>
                                  {p.tenSanPham} ({p.maSanPham})
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "so_luong_nhap"]}
                            rules={[{ required: true, message: "Nhập số lượng" }]}
                            initialValue={1}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "thue_nhap"]}
                            label={null}
                            initialValue={0}
                            rules={[]}
                          >
                            <InputNumber min={0} max={100} style={{ width: "100%" }} placeholder="Thuế %" />
                          </Form.Item>
                        </Col>
                      </Row>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        // Trigger lại tính tổng tiền sau khi thêm sản phẩm
                        const allValues = form.getFieldsValue();
                        if (allValues.chiTiet) {
                          const total = (allValues.chiTiet || []).reduce((sum, item) => {
                            if (!item || !item.san_pham_id) return sum;
                            const product = products.find(p => p.id === item.san_pham_id);
                            const giaNhap = product ? Number(product.giaBan || 0) : 0;
                            const thue = Number(item.thue_nhap || 0);
                            return sum + (Number(item.so_luong_nhap || 0) * (giaNhap + giaNhap * thue / 100));
                          }, 0);
                          form.setFieldsValue({ tongTien: total });
                        }
                      }}
                      icon={<PlusOutlined />}
                    >
                      Thêm sản phẩm
                    </Button>
                  </>
                )}
              </Form.List>
            </Form>
          </Modal>
        </div>
      </ManagerLayoutSidebar>
    </>
  );
}
