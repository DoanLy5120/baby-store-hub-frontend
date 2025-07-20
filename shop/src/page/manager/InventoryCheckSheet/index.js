
import "./InventoryCheckSheet.scss";
import { useState, useEffect } from "react";
import { InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Card,
  Space,
  message,
  Popconfirm,
  DatePicker,
  Select,
  notification,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import inventorychecksheetApi from "../../../api/inventorychecksheetApi";
import productApi from "../../../api/productApi";
import ManagerLayoutSidebar from "../../../layouts/managerLayoutSidebar";
import { FaWarehouse } from "react-icons/fa6";
import moment from "moment";

const { Option } = Select;

const mapInventoryCheckSheetData = (data, products) => {
  return data.map((item) => {
    const chiTiet = item.chi_tiet || [];

    const mappedItem = {
      id: item.id.toString(),
      maPhieuKiem: item.ma_phieu_kiem,
      ngayKiem: moment(item.ngay_kiem).format("DD/MM/YYYY"),
      ngayCanBang: item.ngay_can_bang
        ? moment(item.ngay_can_bang).format("DD/MM/YYYY")
        : "-",
      tongSoLuongLyThuyet: item.tong_so_luong_ly_thuyet || 0,
      tongSoLuongThucTe: item.tong_so_luong_thuc_te || 0,
      tongChenhLech: item.tong_chenh_lech || 0,
      tongLechTang: item.tong_lech_tang || 0,
      tongLechGiam: item.tong_lech_giam || 0,
      trangThai: item.trang_thai,
      ghiChu: item.ghi_chu || "",
      chiTiet: chiTiet.map((detail) => {
        const product = products.find((p) => p.numericId === parseInt(detail.san_pham_id));
        
        return {
          id: detail.id.toString(),
          sanPhamId: detail.san_pham_id,
          maSanPham: product ? product.maSanPham : "-",
          tenSanPham: product ? product.tenSanPham : "-",
          soLuongLyThuyet: detail.so_luong_ly_thuyet,
          soLuongThucTe: detail.so_luong_thuc_te,
          soChenhLech: detail.so_chenh_lech,
        };
      }),
    };
    return mappedItem;
  });
};

export default function InventoryCheckSheet() {
  const [sheets, setSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailSearchTerm, setDetailSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const searchedSheets = filteredSheets.filter((sheet) =>
    sheet.maPhieuKiem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
    
        const productResponse = await productApi.getAll();
        const mappedProducts = productResponse.data.data.map((product, index) => ({
          ...product,
          numericId: index + 1,
        }));
    
        setProducts(mappedProducts);

    
        const sheetResponse = await inventorychecksheetApi.getAll();
        
        if (sheetResponse.data.success) {
          const mapped = mapInventoryCheckSheetData(sheetResponse.data.data, mappedProducts);
          setSheets(mapped);
          setFilteredSheets(mapped);
        } else {
          throw new Error(sheetResponse.data.message || "Không thể lấy danh sách phiếu kiểm kho");
        }
      } catch (error) {
        message.error(error.message);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleSheetClick = (sheet) => {
    setSelectedSheet(sheet);
    form.setFieldsValue({
      maPhieuKiem: sheet.maPhieuKiem,
      ngayKiem: sheet.ngayKiem ? moment(sheet.ngayKiem, "DD/MM/YYYY") : null,
      ghiChu: sheet.ghiChu,
    });
    setIsModalOpen(true);
  };

  
  const handleSaveSheet = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ma_phieu_kiem: values.maPhieuKiem,
        ngay_kiem: values.ngayKiem ? moment(values.ngayKiem).format("YYYY-MM-DD") : undefined,
        ghi_chu: values.ghiChu,
      };

      let response;
      if (selectedSheet) {
        
        if (selectedSheet.trangThai === "phieu_tam") {
          const currentSheet = sheets.find((sheet) => sheet.id === selectedSheet.id);
          const chiTietCount = currentSheet?.chiTiet?.length || 0;
          if (chiTietCount === 0) {
            throw new Error("Phiếu kiểm kho phải có ít nhất một sản phẩm để lưu!");
          }
        }

        response = await inventorychecksheetApi.update(selectedSheet.id, data);
        if (response.data.success) {
          api.success({
            message: "Cập nhật phiếu kiểm kho thành công",
            placement: "topRight",
          });
        }
      } else {
        response = await inventorychecksheetApi.create(data);
        if (response.data.success) {
          api.success({
            message: "Tạo phiếu kiểm kho thành công",
            placement: "topRight",
          });

          const newSheet = {
            id: response.data.data.id.toString(),
            maPhieuKiem: response.data.data.ma_phieu_kiem,
            ngayKiem: moment(response.data.data.ngay_kiem).format("DD/MM/YYYY"),
            ngayCanBang: response.data.data.ngay_can_bang
              ? moment(response.data.data.ngay_can_bang).format("DD/MM/YYYY")
              : "-",
            tongSoLuongLyThuyet: response.data.data.tong_so_luong_ly_thuyet || 0,
            tongSoLuongThucTe: response.data.data.tong_so_luong_thuc_te || 0,
            tongChenhLech: response.data.data.tong_chenh_lech || 0,
            tongLechTang: response.data.data.tong_lech_tang || 0,
            tongLechGiam: response.data.data.tong_lech_giam || 0,
            trangThai: response.data.data.trang_thai,
            ghiChu: response.data.data.ghi_chu || "",
            chiTiet: response.data.data.chi_tiet || [],
          };

        
          const getRes = await inventorychecksheetApi.getAll();
          const mapped = mapInventoryCheckSheetData(getRes.data.data, products);
          setSheets(mapped);
          setFilteredSheets(mapped);

          
          setSelectedSheet(newSheet);
          setIsModalOpen(false);
          handleAddDetail(newSheet);
          return;
        }
      }

      form.resetFields();
      setSelectedSheet(null);
      setIsModalOpen(false);

      const getRes = await inventorychecksheetApi.getAll();
      const mapped = mapInventoryCheckSheetData(getRes.data.data, products);
      setSheets(mapped);
      setFilteredSheets(mapped);
    } catch (error) {
      message.error(error.message);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleDeleteSheet = async () => {
    try {
      const response = await inventorychecksheetApi.delete(selectedSheet.id);
      if (response.data.success) {
        api.success({
          message: response.data.message || "Xóa phiếu kiểm kho thành công",
          placement: "topRight",
        });
        const getRes = await inventorychecksheetApi.getAll();
        const mapped = mapInventoryCheckSheetData(getRes.data.data, products);
        setSheets(mapped);
        setFilteredSheets(mapped);
        setIsModalOpen(false);
        setSelectedSheet(null);
        form.resetFields();
      }
    } catch (error) {
      message.error(error.message);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleAddDetail = (sheet) => {
    setSelectedSheet(sheet);
    detailForm.resetFields();
    setIsDetailModalOpen(true);
  };

  const handleSaveDetail = async () => {
    try {
      const values = await detailForm.validateFields();
      const data = {
        san_pham_id: parseInt(values.sanPhamId, 10),
        so_luong_ly_thuyet: parseInt(values.soLuongLyThuyet, 10),
        so_luong_thuc_te: parseInt(values.soLuongThucTe, 10),
      };
      if (
        isNaN(data.san_pham_id) ||
        isNaN(data.so_luong_ly_thuyet) ||
        isNaN(data.so_luong_thuc_te)
      ) {
        throw new Error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      }
      const response = await inventorychecksheetApi.addDetail(selectedSheet.id, data);
      if (response.data.success) {
        api.success({
          message: "Thêm chi tiết phiếu kiểm kho thành công",
          placement: "topRight",
        });
        detailForm.resetFields();
        setIsDetailModalOpen(false);

        const getRes = await inventorychecksheetApi.getAll();
        const mapped = mapInventoryCheckSheetData(getRes.data.data, products);
        setSheets(mapped);
        setFilteredSheets(mapped);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(", ")
        : error.message;
      message.error(errorMessage);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleDeleteDetail = async (detailId) => {
    try {
      const response = await inventorychecksheetApi.deleteDetail(detailId);
      if (response.data.success) {
        api.success({
          message: response.data.message || "Xóa chi tiết phiếu kiểm kho thành công",
          placement: "topRight",
        });
        const getRes = await inventorychecksheetApi.getAll();
        const mapped = mapInventoryCheckSheetData(getRes.data.data, products);
        setSheets(mapped);
        setFilteredSheets(mapped);
      }
    } catch (error) {
      message.error(error.message);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleBalanceSheet = async (sheetId) => {
    try {
      const currentSheet = sheets.find((sheet) => sheet.id === sheetId);
      if (currentSheet.trangThai === "phieu_tam" && currentSheet.chiTiet.length === 0) {
        throw new Error("Phiếu kiểm kho phải có ít nhất một sản phẩm để cân bằng!");
      }
      const response = await inventorychecksheetApi.canBang(sheetId);
      if (response.data.success) {
        api.success({
          message: "Cân bằng phiếu kiểm kho thành công",
          placement: "topRight",
        });
        const getRes = await inventorychecksheetApi.getAll();
        const mapped = mapInventoryCheckSheetData(getRes.data.data, products);
        setSheets(mapped);
        setFilteredSheets(mapped);
      }
    } catch (error) {
      message.error(error.message);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const sidebarItems = [
    {
      key: "status",
      label: "Trạng thái",
      icon: <FaWarehouse />,
      children: [
        { key: "all", label: "Tất cả", icon: <FaWarehouse /> },
        { key: "phieu_tam", label: "Phiếu tạm", icon: <FaWarehouse /> },
        { key: "da_can_bang", label: "Đã cân bằng", icon: <FaWarehouse /> },
        { key: "da_huy", label: "Đã hủy", icon: <FaWarehouse /> },
      ],
    },
  ];
  const handleSidebarFilter = ({ key }) => {
    if (key === "all") {
      setFilteredSheets(sheets);
      message.success("Hiển thị tất cả phiếu kiểm kho");
    } else {
      const filtered = sheets.filter((sheet) => sheet.trangThai === key);
      setFilteredSheets(filtered);
      message.success(`Đã lọc theo trạng thái: ${key}`);
    }
  };


  const columns = [
    { title: "Mã phiếu kiểm", dataIndex: "maPhieuKiem", key: "maPhieuKiem" },
    { title: "Ngày kiểm", dataIndex: "ngayKiem", key: "ngayKiem" },
    { title: "Ngày cân bằng", dataIndex: "ngayCanBang", key: "ngayCanBang" },
    {
      title: "Tổng SL lý thuyết",
      dataIndex: "tongSoLuongLyThuyet",
      key: "tongSoLuongLyThuyet",
    },
    {
      title: "Tổng SL thực tế",
      dataIndex: "tongSoLuongThucTe",
      key: "tongSoLuongThucTe",
    },
    { title: "Tổng chênh lệch", dataIndex: "tongChenhLech", key: "tongChenhLech" },
    { title: "Tổng lệch tăng", dataIndex: "tongLechTang", key: "tongLechTang" },
    { title: "Tổng lệch giảm", dataIndex: "tongLechGiam", key: "tongLechGiam" },
    { title: "Trạng thái", dataIndex: "trangThai", key: "trangThai" },
    { title: "Ghi chú", dataIndex: "ghiChu", key: "ghiChu"},
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleSheetClick(record)}
          />
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => handleAddDetail(record)}
            disabled={record.trangThai !== "phieu_tam"}
          />
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={() => handleBalanceSheet(record.id)}
            disabled={record.trangThai !== "phieu_tam"}
          />
        </Space>
      ),
    },
  ];

  const detailColumns = [
    { title: "Mã sản phẩm", dataIndex: "maSanPham", key: "maSanPham" },
    { title: "Sản phẩm", dataIndex: "tenSanPham", key: "tenSanPham" },
    {
      title: "SL lý thuyết",
      dataIndex: "soLuongLyThuyet",
      key: "soLuongLyThuyet",
    },
    {
      title: "SL thực tế",
      dataIndex: "soLuongThucTe",
      key: "soLuongThucTe",
    },
    { title: "Chênh lệch", dataIndex: "soChenhLech", key: "soChenhLech" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa chi tiết này?"
          onConfirm={() => handleDeleteDetail(record.id)}
          disabled={!selectedSheet || selectedSheet.trangThai !== "phieu_tam"}
        >
          <Button
            type="text"
            icon={<DeleteOutlined />}
            disabled={!selectedSheet || selectedSheet.trangThai !== "phieu_tam"}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <ManagerLayoutSidebar
        title="KIỂM KHO"
        sidebarItems={sidebarItems}
        onSidebarClick={handleSidebarFilter}
      >
        <div className="inventory-check-sheet-page">
          <div className="inventory-check-sheet__header">
            <Input
              className="search-input"
              placeholder="Tìm theo mã phiếu kiểm"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedSheet(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Thêm mới
            </Button>
          </div>

          <Card
            title={
              <Space>
                <FaWarehouse />
                <span>Danh sách phiếu kiểm kho ({searchedSheets.length} phiếu)</span>
              </Space>
            }
          >
            <Table
              className="inventory-check-sheet__table"
              columns={columns}
              dataSource={searchedSheets}
              rowKey="id"
              expandable={{
                expandedRowRender: (record) => (
                  <div>
                    <Input
                      className="detail-search-input"
                      placeholder="Tìm theo mã hoặc tên sản phẩm"
                      prefix={<SearchOutlined />}
                      value={detailSearchTerm}
                      onChange={(e) => setDetailSearchTerm(e.target.value)}
                      style={{ marginBottom: 16, width: 300 }}
                    />
                    <Table
                      columns={detailColumns}
                      dataSource={record.chiTiet.filter(
                        (detail) =>
                          detail.tenSanPham.toLowerCase().includes(detailSearchTerm.toLowerCase()) ||
                          detail.maSanPham.toLowerCase().includes(detailSearchTerm.toLowerCase())
                      )}
                      rowKey="id"
                      pagination={false}
                    />
                  </div>
                ),
                onExpand: (expanded, record) => {
                  if (expanded) {
                    setSelectedSheet(record);
                    setDetailSearchTerm("");
                  }
                },
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} của ${total} phiếu`,
              }}
              locale={{
                emptyText: (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <FaWarehouse />
                    </div>
                    <div>Không tìm thấy phiếu kiểm kho nào</div>
                  </div>
                ),
              }}
            />
          </Card>

        
          <Modal
            title={
              <Space>
                <EditOutlined />
                {selectedSheet
                  ? `Chi tiết phiếu kiểm kho - ${selectedSheet.maPhieuKiem}`
                  : "Tạo phiếu kiểm kho mới"}
              </Space>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedSheet(null);
              form.resetFields();
            }}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedSheet(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>,
              <Popconfirm
                key="delete"
                title="Bạn có chắc chắn muốn xóa phiếu này?"
                onConfirm={handleDeleteSheet}
                disabled={!selectedSheet || selectedSheet?.trangThai !== "phieu_tam"}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!selectedSheet || selectedSheet?.trangThai !== "phieu_tam"}
                >
                  Xóa
                </Button>
              </Popconfirm>,
              <Button
                key="save"
                type="primary"
                onClick={handleSaveSheet}
                disabled={selectedSheet && selectedSheet.trangThai === "phieu_tam" && selectedSheet.chiTiet.length === 0}
              >
                {selectedSheet ? "Cập nhật" : "Tạo mới"}
              </Button>,
            ]}
          >
            <p style={{ color: "red", marginBottom: 16 }}>
              {selectedSheet
                ? "Lưu ý: Phiếu kiểm kho tạm phải có ít nhất một sản phẩm."
                : "Lưu ý: Sau khi tạo phiếu, bạn cần thêm ít nhất một sản phẩm."}
            </p>
            <Form form={form} layout="vertical">
              <Form.Item
                label="Mã phiếu kiểm"
                name="maPhieuKiem"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã phiếu kiểm!",
                  },
                ]}
              >
                <Input disabled={selectedSheet} />
              </Form.Item>
              <Form.Item
                label="Ngày kiểm"
                name="ngayKiem"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày kiểm!",
                  },
                ]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Ghi chú" name="ghiChu">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Thêm chi tiết phiếu kiểm kho"
            open={isDetailModalOpen}
            footer={[
              <Button key="save" type="primary" onClick={handleSaveDetail}>
                Lưu
              </Button>,
            ]}
          >
            <p style={{ color: "red", marginBottom: 16 }}>
              Lưu ý: Vui lòng thêm ít nhất một sản phẩm để hoàn tất phiếu kiểm kho.
            </p>
            <Form form={detailForm} layout="vertical">
              <Form.Item
                label="Sản phẩm"
                name="sanPhamId"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn sản phẩm!",
                  },
                ]}
              >
                <Select placeholder="Chọn sản phẩm">
                  {products.map((product) => (
                    <Option key={product.id} value={product.numericId}>
                      {product.tenSanPham}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Số lượng lý thuyết"
                name="soLuongLyThuyet"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số lượng lý thuyết!",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Số lượng lý thuyết không được nhỏ hơn 0!",
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Số lượng thực tế"
                name="soLuongThucTe"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số lượng thực tế!",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Số lượng thực tế không được nhỏ hơn 0!",
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </ManagerLayoutSidebar>
    </>
  );
}
