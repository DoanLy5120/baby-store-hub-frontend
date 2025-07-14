import "./WareHouse.scss";
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
  message,
  Popconfirm,
  InputNumber,
  Switch,
  Col,
  Row,
  Layout,
  notification,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import warehouseApi from "../../../api/warehouseApi";
import productApi from "../../../api/productApi";
import { FaWarehouse, FaReplyAll } from "react-icons/fa";

const { Header, Content } = Layout;
const { Option } = Select;

const mapWarehouseData = (data) =>
  data.map((item) => ({
    id: item.id,
    warehouseCode: `KHO${item.id.slice(0, 4).toUpperCase()}`,
    name: item.tenKho,
    address: item.diaChi,
    description: item.moTa,
    status: item.trangThai ? "Hoạt động" : "Ngừng hoạt động",
    productCount: item.soLuongSanPham,
    manager: item.nguoiQuanLy,
    area: item.dienTich,
    createdAt: item.ngayTao,
    updatedAt: item.ngayCapNhat,
  }));

export default function Inventory() {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [xuatKhoForm] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [products, setProducts] = useState([]);

  const searchedWarehouses = filteredWarehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWarehouseClick = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    form.setFieldsValue({
      name: warehouse.name,
      address: warehouse.address,
      description: warehouse.description,
      status: warehouse.status === "Hoạt động",
      productCount: warehouse.productCount,
      manager: warehouse.manager,
      area: warehouse.area,
    });

    try {
      const response = await warehouseApi.getProducts(warehouse.id);
      console.log("Products response:", response.data);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("API error:", error);
      message.error("Lỗi khi tải danh sách sản phẩm: " + (error.response?.data?.message || error.message));
    }

    setIsModalOpen(true);
  };

  const handleSaveWarehouse = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);
      const data = {
        tenKho: values.name,
        diaChi: values.address,
        moTa: values.description || "",
        trangThai: values.status ? 1 : 0,
        soLuongSanPham: values.productCount || 0,
        nguoiQuanLy: values.manager,
        dienTich: values.area,
      };
      console.log("Data to send:", data);

      let response;
      if (selectedWarehouse) {
        response = await warehouseApi.update(selectedWarehouse.id, data);
        console.log("Update response:", response.data);
        if (response.data.success) {
          api.success({
            message: "Cập nhật kho thành công",
            placement: "topRight",
          });
        } else {
          throw new Error(response.data.message || "Cập nhật thất bại");
        }
      } else {
        response = await warehouseApi.create(data);
        console.log("Create response:", response.data);
        if (response.data.success) {
          api.success({
            message: "Tạo kho mới thành công",
            placement: "topRight",
          });
        } else {
          throw new Error(response.data.message || "Tạo thất bại");
        }
      }

      const getRes = await warehouseApi.getAll();
      console.log("Refreshed data:", getRes.data);
      const mapped = mapWarehouseData(getRes.data.data);
      setWarehouses(mapped);
      setFilteredWarehouses(mapped);
      setIsModalOpen(false);
      setSelectedWarehouse(null);
      form.resetFields();
      xuatKhoForm.resetFields();
      setProducts([]);
    } catch (error) {
      console.error("Save error:", error);
      console.log("Full error response:", error.response?.data);
      message.error(error.response?.data?.message || "Lỗi khi cập nhật kho. Vui lòng kiểm tra lại!");
    }
  };

  const handleDeleteWarehouse = async () => {
    try {
      const response = await warehouseApi.delete(selectedWarehouse.id);
      if (response.data.success) {
        api.success({
          message: "Xóa kho thành công",
          placement: "topRight",
        });
        const getRes = await warehouseApi.getAll();
        const mapped = mapWarehouseData(getRes.data.data);
        setWarehouses(mapped);
        setFilteredWarehouses(mapped);
        setIsModalOpen(false);
        setSelectedWarehouse(null);
        form.resetFields();
        xuatKhoForm.resetFields();
        setProducts([]);
      } else {
        throw new Error(response.data.message || "Xóa thất bại");
      }
    } catch (error) {
      message.error(error.message || "Không thể xóa kho!");
    }
  };

  const handleXuatKho = async () => {
  try {
    const values = await xuatKhoForm.validateFields();
    console.log("Xuat kho values:", values);

    const selectedProduct = products.find((p) => p.id === values.san_pham_id);
    if (!selectedProduct) {
      throw new Error("Sản phẩm không hợp lệ");
    }

    if (selectedProduct.soLuongTon < values.so_luong_xuat) {
      throw new Error("Số lượng tồn kho không đủ để xuất");
    }

    const newSoLuongTon = selectedProduct.soLuongTon - values.so_luong_xuat;
    const productResponse = await productApi.update(selectedProduct.id, {
      tenSanPham: selectedProduct.tenSanPham,
      maSKU: selectedProduct.maSKU,
      VAT: selectedProduct.VAT || 0,
      giaBan: selectedProduct.giaBan || 0,
      soLuongTon: newSoLuongTon,
      moTa: selectedProduct.moTa || "",
      danhMuc_id: selectedProduct.danhMuc_id,
      kho_id: selectedProduct.kho_id,
    });

    if (!productResponse.data.success) {
      throw new Error(productResponse.data.message || "Cập nhật sản phẩm thất bại");
    }

    const newSoLuongSanPham = selectedWarehouse.productCount - values.so_luong_xuat;
    const warehouseResponse = await warehouseApi.update(selectedWarehouse.id, {
      tenKho: selectedWarehouse.name,
      diaChi: selectedWarehouse.address,
      moTa: selectedWarehouse.description,
      trangThai: selectedWarehouse.status === "Hoạt động" ? 1 : 0,
      soLuongSanPham: newSoLuongSanPham,
      nguoiQuanLy: selectedWarehouse.manager,
      dienTich: selectedWarehouse.area,
    });

    if (!warehouseResponse.data.success) {
      throw new Error(warehouseResponse.data.message || "Cập nhật kho thất bại");
    }

    api.success({
      message: `Xuất ${values.so_luong_xuat} ${selectedProduct.tenSanPham} thành công`,
      placement: "topRight",
    });

    const getRes = await warehouseApi.getAll();
    const mapped = mapWarehouseData(getRes.data.data);
    setWarehouses(mapped);
    setFilteredWarehouses(mapped);

    const productRes = await warehouseApi.getProducts(selectedWarehouse.id);
    setProducts(productRes.data.data || []);

    form.setFieldsValue({ productCount: newSoLuongSanPham });
    xuatKhoForm.resetFields();
  } catch (error) {
    console.error("Xuat kho error:", error);
    console.log("Full error response:", error.response?.data);
    message.error(error.message || "Lỗi khi xuất kho. Vui lòng kiểm tra lại!");
  }
};

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await warehouseApi.getAll();
        if (response.data.success) {
          const mapped = mapWarehouseData(response.data.data);
          setWarehouses(mapped);
          setFilteredWarehouses(mapped);
        }
      } catch (error) {
        message.error("Lỗi khi tải danh sách kho");
      }
    };

    fetchWarehouses();
  }, []);

  const sidebarItems = [
    {
      key: "warehouse",
      label: "Kho",
      icon: <FaWarehouse />,
      children: warehouses.map((w) => ({
        key: w.id,
        label: w.name,
        icon: <FaWarehouse />,
      })),
    },
  ];

  const handleWarehouseFilter = (id) => {
    const warehouse = warehouses.find((w) => w.id === id);
    if (!warehouse) {
      setFilteredWarehouses(warehouses);
      message.warning("Không tìm thấy kho tương ứng");
      return;
    }
    setFilteredWarehouses([warehouse]);
    message.success(`Đã lọc theo kho ${warehouse.name}`);
  };

  const columns = [
    { title: "Mã kho", dataIndex: "warehouseCode", key: "warehouseCode" },
    { title: "Tên kho", dataIndex: "name", key: "name" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Số lượng sản phẩm", dataIndex: "productCount", key: "productCount" },
    { title: "Người quản lý", dataIndex: "manager", key: "manager" },
    { title: "Diện tích (m²)", dataIndex: "area", key: "area" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleWarehouseClick(record)}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <ManagerLayoutSidebar
        title="KIỂM KHO"
        sidebarItems={sidebarItems}
        onSidebarClick={({ key, keyPath }) => {
          if (keyPath.includes("warehouse")) {
            handleWarehouseFilter(key);
          } else {
            setFilteredWarehouses(warehouses);
          }
        }}
      >
        <div className="inventory-page">
          <Header className="inventory__header">
            <div className="inventory__header-left">
              <Input
                className="search-input"
                placeholder="Theo tên hoặc địa chỉ kho"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="inventory__header-action">
              <Space>
                <Button
                  type="primary"
                  icon={<FaReplyAll />}
                  onClick={() => setFilteredWarehouses(warehouses)}
                >
                  Tất cả
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedWarehouse(null);
                    form.resetFields();
                    xuatKhoForm.resetFields();
                    setProducts([]);
                    setIsModalOpen(true);
                  }}
                >
                  Thêm mới
                </Button>
              </Space>
            </div>
          </Header>

          <Content className="inventory__content">
            <Card
              title={
                <Space>
                  <FaWarehouse />
                  <span>
                    Danh sách kho ({searchedWarehouses.length} kho)
                  </span>
                </Space>
              }
            >
              <Table
                className="inventory__content-table"
                columns={columns}
                dataSource={searchedWarehouses}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} của ${total} kho`,
                }}
                locale={{
                  emptyText: (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <FaWarehouse />
                      </div>
                      <div>Không tìm thấy kho nào</div>
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
                {selectedWarehouse
                  ? `Chi tiết kho - ${selectedWarehouse.warehouseCode}`
                  : "Tạo kho mới"}
              </Space>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedWarehouse(null);
              form.resetFields();
              xuatKhoForm.resetFields();
              setProducts([]);
            }}
            width={800}
            footer={[
              <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>,
              <Popconfirm
                key="delete"
                title="Bạn có chắc chắn muốn xóa kho này?"
                onConfirm={handleDeleteWarehouse}
                disabled={!selectedWarehouse}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!selectedWarehouse}
                >
                  Xóa
                </Button>
              </Popconfirm>,
              <Button
                key="xuatKho"
                type="default"
                icon={<ExportOutlined />}
                disabled={!selectedWarehouse}
                onClick={handleXuatKho}
              >
                Xuất kho
              </Button>,
              <Button key="save" type="primary" onClick={handleSaveWarehouse}>
                {selectedWarehouse ? "Cập nhật" : "Tạo mới"}
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên kho"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên kho!" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng hoạt động" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số lượng sản phẩm" name="productCount">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Người quản lý"
                    name="manager"
                    rules={[{ required: true, message: "Vui lòng nhập người quản lý!" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Diện tích (m²)"
                    name="area"
                    rules={[{ required: true, message: "Vui lòng nhập diện tích!" }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            {selectedWarehouse && (
              <Form form={xuatKhoForm} layout="vertical" style={{ marginTop: 16 }}>
                <Card title="Xuất kho" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Sản phẩm"
                        name="san_pham_id"
                        rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
                      >
                        <Select placeholder="Chọn sản phẩm">
                          {products.map((product) => (
                            <Option key={product.id} value={product.id}>
                              {product.tenSanPham} (Tồn: {product.soLuongTon})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Số lượng xuất"
                        name="so_luong_xuat"
                        rules={[
                          { required: true, message: "Vui lòng nhập số lượng xuất!" },
                          { type: "number", min: 1, message: "Số lượng xuất phải lớn hơn 0!" },
                        ]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Form>
            )}
          </Modal>
        </div>
      </ManagerLayoutSidebar>
    </>
  );
}