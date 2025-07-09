import "./Product.scss";
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
  Upload,
  notification,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { formatVND } from "../../../utils";
import { FaBoxArchive } from "react-icons/fa6";
import { UploadOutlined } from "@ant-design/icons";
import { BiSolidCategory } from "react-icons/bi";
import { AiFillCheckSquare } from "react-icons/ai";
import { FaWarehouse } from "react-icons/fa";
import { FaReplyAll } from "react-icons/fa";
import productApi from "../../../api/productApi";
import warehouseApi from "../../../api/warehouseApi";
import categoryApi from "../../../api/categoryApi";
const { Header, Content } = Layout;
const { Option } = Select;

const mapProductsFromAPI = (data, categories = [], warehouses = []) =>
  data.map((item) => ({
    id: item.id,
    productCode: item.id,
    name: item.tenSanPham,
    sku: item.maSKU,
    vat: item.VAT,
    description: item.moTa,
    price: item.giaBan || 0,
    stock: item.soLuongTon || 0,
    image: item.hinhAnh
      ? `${"https://web-production-c18cf.up.railway.app"}/storage/${item.hinhAnh}`
      : null,
    category:
      categories.find((dm) => dm.id === item.danhMuc_id)?.tenDanhMuc ||
      "Không rõ",
    warehouse:
      warehouses.find((kho) => kho.id === item.kho_id)?.tenKho || "Không rõ",
    categoryId: item.danhMuc_id,
    warehouseId: item.kho_id,
  }));

export default function Product() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form] = Form.useForm();
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [api, contextHolder] = notification.useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchedProducts = filteredProducts.filter(
    (product) =>
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);

    form.setFieldsValue({
      productCode: product.productCode,
      name: product.name,
      sku: product.sku,
      price: product.price,
      vat: product.vat,
      stock: product.stock,
      description: product.description,
      image: product.image,
      categoryId: product.categoryId,
      warehouseId: product.warehouseId,
    });

    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("tenSanPham", values.name);
      formData.append("maSKU", values.sku);
      formData.append("VAT", values.vat || 0);
      formData.append("moTa", values.description || "");
      formData.append("danhMuc_id", values.categoryId);
      formData.append("kho_id", values.warehouseId);
      formData.append("giaBan", values.price || 0);
      formData.append("soLuongTon", values.stock || 0); // Đảm bảo trường tên khớp với backend

      if (values.image && typeof values.image === "object") {
        formData.append("hinhAnh", values.image); // File
      }

      if (selectedProduct) {
        await productApi.update(selectedProduct.id, formData);
        api.success({
          message: "Cập nhật sản phẩm thành công",
          placement: "topRight",
        });
      } else {
        await productApi.create(formData);
        api.success({
          message: "Tạo mới sản phẩm thành công",
          placement: "topRight",
        });
      }

      setIsModalOpen(false);
      setSelectedProduct(null);
      form.resetFields();

      // Gọi lại danh sách để đảm bảo dữ liệu hiển thị mới nhất
      const res = await productApi.getAll();
      const mapped = mapProductsFromAPI(res.data.data);
      setProducts(mapped);
      setFilteredProducts(mapped);
    } catch (err) {
      message.error("Lỗi khi lưu sản phẩm!");
      console.error("Error saving product:", err); // In lỗi ra console để debug
    }
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        await productApi.delete(selectedProduct.id);

        setProducts((prev) =>
          prev.filter((prod) => prod.id !== selectedProduct.id)
        );
        setFilteredProducts((prev) =>
          prev.filter((prod) => prod.id !== selectedProduct.id)
        );

        setIsModalOpen(false);
        setSelectedProduct(null);
        form.resetFields();

        api.success({
          message: "Xóa sản phẩm thành công",
          placement: "topRight",
        });

        // Gọi lại danh sách để đảm bảo dữ liệu hiển thị mới nhất
        const res = await productApi.getAll();
        const mapped = mapProductsFromAPI(res.data.data);
        setProducts(mapped);
        setFilteredProducts(mapped);
      } catch (err) {
        message.error("Lỗi khi xóa sản phẩm!");
        console.error("Error deleting product:", err); // In ra lỗi để dễ debug
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes, warehouseRes] = await Promise.all([
          productApi.getAll(),
          categoryApi.getAll(),
          warehouseApi.getAll(),
        ]);

        console.log("🔍 Product raw from API:", productRes.data.data[0]);

        const productData = productRes.data.data;
        const categoryData = categoryRes.data.data;
        const warehouseData = warehouseRes.data.data;

        setCategories(categoryData);
        setWarehouses(warehouseData);

        const mapped = mapProductsFromAPI(
          productData,
          categoryData,
          warehouseData
        );
        setProducts(mapped);
        setFilteredProducts(mapped);
      } catch (err) {
        message.error("Lỗi khi tải dữ liệu sản phẩm hoặc sidebar");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sidebarItems = [
    {
      key: "category",
      label: "Danh mục",
      icon: <BiSolidCategory />,
      children: categories.map((dm) => ({
        key: `category-${dm.id}`,
        label: dm.tenDanhMuc,
        icon: <BiSolidCategory />,
      })),
    },
    {
      key: "warehouse",
      label: "Kho",
      icon: <FaWarehouse />,
      children: warehouses.map((kho) => ({
        key: `warehouse-${kho.id}`,
        label: kho.tenKho,
        icon: <FaWarehouse />,
      })),
    },
    {
      key: "status",
      label: "Tình trạng",
      icon: <AiFillCheckSquare />,
      children: [
        { key: "near-out", label: "Gần hết hàng", icon: <AiFillCheckSquare /> },
        { key: "out", label: "Hết hàng", icon: <AiFillCheckSquare /> },
      ],
    },
  ];

  const handleCategoryFilter = async (categoryId) => {
    try {
      const res = await productApi.getByCategory(categoryId);
      const mapped = mapProductsFromAPI(res.data.data, categories, warehouses);
      setFilteredProducts(mapped);
    } catch (err) {
      message.error("Lỗi khi lọc theo danh mục");
    }
  };

  const handleWarehouseFilter = async (warehouseId) => {
    try {
      const res = await productApi.getByWarehouse(warehouseId);
      const mapped = mapProductsFromAPI(res.data.data, categories, warehouses);
      setFilteredProducts(mapped);
    } catch (err) {
      message.error("Lỗi khi lọc theo kho");
    }
  };

  const handleStatusFilter = (key) => {
    const filtered = products.filter((prod) => {
      if (key === "near-out") return prod.stock > 0 && prod.stock < 10;
      if (key === "out") return prod.stock === 0;
      return true;
    });
    setFilteredProducts(filtered);
  };

  const handleDynamicPriceFilter = () => {
    if (minPrice == null || maxPrice == null) {
      message.warning("Vui lòng nhập cả khoảng giá!");
      return;
    }

    if (minPrice > maxPrice) {
      message.warning("Giá từ không được lớn hơn giá đến!");
      return;
    }

    const filtered = products.filter(
      (prod) => prod.price >= minPrice && prod.price <= maxPrice
    );
    setFilteredProducts(filtered);
    message.success(
      `Đã lọc từ ${minPrice.toLocaleString()}đ đến ${maxPrice.toLocaleString()}đ`
    );
  };

  const handleResetPriceFilter = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setFilteredProducts(products);
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img
          src={image}
          alt="product"
          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    { title: "Mã sản phẩm", dataIndex: "productCode", key: "productCode" },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    // { title: "Mã SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Đơn giá sản phẩm",
      dataIndex: "price",
      key: "price",
      render: (price) => `${formatVND(price)}`,
    },
    // { title: "VAT", dataIndex: "vat", key: "vat", render: (vat) => `${vat}%` },
    // {
    //   title: "Mô tả",
    //   dataIndex: "description",
    //   key: "description",
    //   render: (desc) =>
    //     desc?.length > 10 ? desc.substring(0, 10) + "..." : desc,
    // },
    { title: "Số lượng tồn", dataIndex: "stock", key: "stock" },
    { title: "Danh mục", dataIndex: "category", key: "category" },
    { title: "Kho", dataIndex: "warehouse", key: "warehouse" },
    {
      title: "Tình trạng",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Tag color={stock === 0 ? "red" : stock < 10 ? "orange" : "green"}>
          {stock === 0 ? "Hết hàng" : stock < 10 ? "Gần hết hàng" : "Còn hàng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleProductClick(record)}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <ManagerLayoutSidebar
        title="SẢN PHẨM"
        sidebarItems={sidebarItems}
        onSidebarClick={({ key }) => {
          if (key.startsWith("category-")) {
            const id = key.replace("category-", "");
            handleCategoryFilter(id);
          } else if (key.startsWith("warehouse-")) {
            const id = key.replace("warehouse-", "");
            handleWarehouseFilter(id);
          } else if (key === "near-out" || key === "out") {
            handleStatusFilter(key);
          } else {
            setFilteredProducts(products); // Reset
          }
        }}
      >
        <div className="product-page">
          <Header className="product__header">
            <div className="product__header-left">
              <Input
                className="search-input"
                placeholder="Theo mã hoặc tên sản phẩm"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div
              className="product__header-filter-price"
              style={{ display: "flex", gap: "8px" }}
            >
              <InputNumber
                placeholder="Giá từ"
                min={0}
                value={minPrice}
                onChange={(value) => setMinPrice(value)}
                style={{ width: 120 }}
              />
              <InputNumber
                placeholder="đến"
                min={0}
                value={maxPrice}
                onChange={(value) => setMaxPrice(value)}
                style={{ width: 120 }}
              />
              <Button onClick={handleDynamicPriceFilter}>Lọc giá</Button>
              <Button type="primary" onClick={handleResetPriceFilter}>
                <FaReplyAll /> Tất cả
              </Button>
            </div>

            <div className="product__header-action">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Thêm mới
              </Button>
            </div>
          </Header>

          <Content className="product__content">
            <Card
              title={
                <Space>
                  <FaBoxArchive />
                  <span>
                    Danh sách sản phẩm ({searchedProducts.length} sản phẩm)
                  </span>
                </Space>
              }
            >
              <Table
                className="product__content-table"
                columns={columns}
                dataSource={searchedProducts}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} của ${total} sản phẩm`,
                }}
                locale={{
                  emptyText: (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <FaBoxArchive />
                      </div>
                      <div>Không tìm thấy sản phẩm nào</div>
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
                {selectedProduct
                  ? `Chi tiết sản phẩm - ${selectedProduct.productCode}`
                  : "Tạo sản phẩm mới"}
              </Space>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedProduct(null);
              form.resetFields();
            }}
            width={700}
            footer={[
              <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>,
              <Popconfirm
                key="delete"
                title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                onConfirm={handleDeleteProduct}
                disabled={!selectedProduct}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!selectedProduct}
                >
                  Xóa
                </Button>
              </Popconfirm>,
              <Button key="save" type="primary" onClick={handleSaveProduct}>
                {selectedProduct ? "Cập nhật" : "Tạo mới"}
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Mã sản phẩm" name="productCode">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tên sản phẩm"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên sản phẩm!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Mã SKU" name="sku">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Đơn giá sản phẩm" name="price">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="VAT (%)" name="vat">
                    <InputNumber min={0} max={100} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số lượng tồn" name="stock">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Hình ảnh"
                    name="image"
                    valuePropName="imageUrl"
                  >
                    <Upload
                      name="file"
                      beforeUpload={(file) => {
                        form.setFieldValue("image", file); // giữ nguyên file gốc
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                    {form.getFieldValue("image") && (
                      <img
                        src={
                          typeof form.getFieldValue("image") === "string"
                            ? form.getFieldValue("image") // link
                            : URL.createObjectURL(form.getFieldValue("image")) // file
                        }
                        style={{ width: 100, marginTop: 10, borderRadius: 8 }}
                      />
                    )}
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Danh mục" name="categoryId">
                    <Select>
                      {categories.map((dm) => (
                        <Option key={dm.id} value={dm.id}>
                          {dm.tenDanhMuc}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Kho" name="warehouseId">
                    <Select>
                      {warehouses.map((kho) => (
                        <Option key={kho.id} value={kho.id}>
                          {kho.tenKho}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </div>
      </ManagerLayoutSidebar>
    </>
  );
}
