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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { FaBoxArchive } from "react-icons/fa6";
const { Header, Content } = Layout;
const { Option } = Select;

const sampleProducts = [
  {
    id: "1",
    productCode: "SP001",
    name: "Áo thun trẻ em",
    sku: "AT001",
    price: 50000,
    vat: 10,
    description: "Áo thun cotton cho trẻ em",
    category: "Quần áo trẻ em",
    warehouse: "Kho Hà Nội",
    stock: 15,
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT55K3UGqq97F7RhW2_AHlGQR9JNY1eY9yhQEw6ROFo0qtqUQIsc_vA2w4ApqDFp4BDYCyglyet75VGnidSyviQujHkf1BRdpzdSYcd8jvwq_grnGrlXBo",
  },
  {
    id: "2",
    productCode: "SP002",
    name: "Xe đồ chơi",
    sku: "XD001",
    price: 100000,
    vat: 10,
    description: "Xe đồ chơi bằng nhựa an toàn",
    category: "Đồ chơi trẻ em",
    warehouse: "Kho TP.HCM",
    stock: 5,
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQcgBi1fD0v3WQv9YdUVVtOltY1uOVl6C73HZFMH3vmwwAJOBzRyN2TkYQ8kdg9m_8L2RsBO1JGjajRI0dWj4Dapqm-RqXYq01TJfDK8ke11KKaDuTYKp0V",
  },
];

export default function Product() {
  const [products, setProducts] = useState(sampleProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();

  const searchedProducts = filteredProducts.filter(
    (product) =>
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

 
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  
  const handleSaveProduct = async () => {
    try {
      const values = await form.validateFields();
      const updatedProduct = { ...values, id: selectedProduct?.id || Date.now().toString() };

      if (selectedProduct) {
        setProducts((prev) =>
          prev.map((prod) => (prod.id === selectedProduct.id ? updatedProduct : prod))
        );
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        setProducts((prev) => [...prev, updatedProduct]);
        message.success("Thêm sản phẩm thành công!");
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
      form.resetFields();
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProducts((prev) => prev.filter((prod) => prod.id !== selectedProduct.id));
      setIsModalOpen(false);
      setSelectedProduct(null);
      form.resetFields();
      message.success("Xóa sản phẩm thành công!");
    }
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const sidebarItems = [
    {
      key: "category",
      label: "Danh mục",
      icon: <CalendarOutlined />,
      children: [
        { key: "quan-ao", label: "Quần áo trẻ em", icon: <CalendarOutlined /> },
        { key: "do-choi", label: "Đồ chơi trẻ em", icon: <CalendarOutlined /> },
      ],
    },
    {
      key: "warehouse",
      label: "Kho",
      icon: <CalendarOutlined />,
      children: [
        { key: "hanoi", label: "Kho Hà Nội", icon: <CalendarOutlined /> },
        { key: "hcm", label: "Kho TP.HCM", icon: <CalendarOutlined /> },
      ],
    },
    {
      key: "status",
      label: "Trình trạng",
      icon: <CalendarOutlined />,
      children: [
        { key: "near-out", label: "Gần hết hàng", icon: <CalendarOutlined /> },
        { key: "out", label: "Hết hàng", icon: <CalendarOutlined /> },
      ],
    },
  ];

  
  const handleCategoryFilter = (key) => {
    const filtered = products.filter((prod) => prod.category.toLowerCase().includes(key));
    setFilteredProducts(filtered);
    message.success(`Đã lọc theo danh mục ${key === "quan-ao" ? "Quần áo trẻ em" : "Đồ chơi trẻ em"}`);
  };

  
  const handleWarehouseFilter = (key) => {
    const filtered = products.filter((prod) => prod.warehouse.toLowerCase().includes(key));
    setFilteredProducts(filtered);
    message.success(`Đã lọc theo kho ${key === "hanoi" ? "Hà Nội" : "TP.HCM"}`);
  };

  
  const handleStatusFilter = (key) => {
    const filtered = products.filter((prod) => {
      if (key === "near-out") return prod.stock > 0 && prod.stock < 10;
      if (key === "out") return prod.stock === 0;
      return true;
    });
    setFilteredProducts(filtered);
    message.success(`Đã lọc theo trạng thái ${key === "near-out" ? "Gần hết hàng" : "Hết hàng"}`);
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
  message.success(`Đã lọc từ ${minPrice.toLocaleString()}đ đến ${maxPrice.toLocaleString()}đ`);
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
    render: (image) => <img src={image} alt="product" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />,
  },
    { title: "Mã sản phẩm", dataIndex: "productCode", key: "productCode" },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Mã SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString("vi-VN")}đ`,
    },
    { title: "VAT", dataIndex: "vat", key: "vat", render: (vat) => `${vat}%` },
    { title: "Mô tả", dataIndex: "description", key: "description" , render: (desc) => desc?.length > 10 ? desc.substring(0, 10) + "..." : desc,},
    { title: "Danh mục", dataIndex: "category", key: "category" },
    { title: "Kho", dataIndex: "warehouse", key: "warehouse" },
    {
      title: "Trình trạng",
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
    <ManagerLayoutSidebar
      sidebarItems={sidebarItems}
      onSidebarClick={({ key, keyPath }) => {
        if (keyPath.includes("category")) {
          handleCategoryFilter(key);
        } else if (keyPath.includes("warehouse")) {
          handleWarehouseFilter(key);
        } else if (keyPath.includes("status")) {
          handleStatusFilter(key);
        } else {
          setFilteredProducts(products);
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

<div className="product__header-filter-price" style={{ display: "flex", gap: "8px" }}>
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
  <Button onClick={handleResetPriceFilter}>Xóa lọc</Button>
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
                <span>Danh sách sản phẩm ({searchedProducts.length} sản phẩm)</span>
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
              {selectedProduct ? `Chi tiết sản phẩm - ${selectedProduct.productCode}` : "Tạo sản phẩm mới"}
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
              <Button danger icon={<DeleteOutlined />} disabled={!selectedProduct}>
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
                <Form.Item
                  label="Mã sản phẩm"
                  name="productCode"
                  rules={[{ required: true, message: "Vui lòng nhập mã sản phẩm!" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên sản phẩm"
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
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
                <Form.Item label="Giá bán" name="price">
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
  <Form.Item label="Link ảnh sản phẩm" name="image">
    <Input placeholder="Dán link ảnh vào đây" />
  </Form.Item>
</Col>

              <Col span={12}>
                <Form.Item label="Danh mục" name="category">
                  <Select>
                    <Option value="Quần áo trẻ em">Quần áo trẻ em</Option>
                    <Option value="Đồ chơi trẻ em">Đồ chơi trẻ em</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kho" name="warehouse">
                  <Select>
                    <Option value="Kho Hà Nội">Kho Hà Nội</Option>
                    <Option value="Kho TP.HCM">Kho TP.HCM</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </ManagerLayoutSidebar>
  );
}