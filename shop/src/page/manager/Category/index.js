import "./Category.scss";
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
  Layout,
  Row,
  Col,
  Select,
  notification,
  Upload,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { MdHomeWork } from "react-icons/md";
import { FaWarehouse } from "react-icons/fa";
import { FaReplyAll } from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { BiSolidCategory } from "react-icons/bi";
const { Option } = Select;

const { Header, Content } = Layout;

// Sample data for categories
const sampleCategories = [
  {
    id: "1",
    categoryCode: "DM001",
    name: "Quần áo trẻ em",
    description: "Quần áo dành cho trẻ từ 0-5 tuổi",
    productCount: 50,
    provide: "Cơ sở sản xuất Thiên Phú",
    image:
      "https://down-vn.img.susercontent.com/file/a6cce422389cbb21eef67ba583238b3f",
    warehouse: "Kho Hà Nội",
  },
  {
    id: "2",
    categoryCode: "DM002",
    name: "Đồ chơi trẻ em",
    description: "Đồ chơi an toàn cho trẻ em",
    productCount: 30,
    provide: "Công ty sữa Mega",
    image:
      "https://www.kidsplaza.vn/blog/wp-content/uploads/2012/12/chon-do-choi-cho-be.jpg",
    warehouse: "Kho TP.HCM",
  },
];

// Sample data for provide
const sampleprovide = [
  {
    id: "1",
    categoryCode: "CC001",
    name: "Cơ sở sản xuất Thiên Phú",
    description: "Sản xuất quần áo cho trẻ em",
    address: "Hà Nội",
  },
  {
    id: "2",
    categoryCode: "CC002",
    name: "Công ty sữa Mega",
    description: "Sản xuất sữa bột cho trẻ em",
    address: "Đà Nẵng",
  },
];

export default function Category() {
  const [categories, setCategories] = useState(sampleCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [filteredCategories, setFilteredCategories] =
    useState(sampleCategories);
  const [api, contextHolder] = notification.useNotification();

  // Search categories by code or name
  const searchedCategories = filteredCategories.filter(
    (category) =>
      category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    form.setFieldsValue({
      ...category,
    });
    setIsModalOpen(true);
  };

  // Handle save category
  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields();
      const updatedCategory = {
        ...values,
        id: selectedCategory?.id || Date.now().toString(),
      };

      if (selectedCategory) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategory.id ? updatedCategory : cat
          )
        );
        setTimeout(() => {
          api.success({
            message: "Cập nhật danh mục thành công",
            placement: "topRight",
          });
        }, 300);
      } else {
        setCategories((prev) => [...prev, updatedCategory]);
        setTimeout(() => {
          api.success({
            message: "Thêm danh mục mới thành công",
            placement: "topRight",
          });
        }, 300);
      }
      setIsModalOpen(false);
      setSelectedCategory(null);
      form.resetFields();
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== selectedCategory.id)
      );
      setIsModalOpen(false);
      setSelectedCategory(null);
      form.resetFields();

      setTimeout(() => {
        api.success({
          message: "Đã xóa danh mục thành công",
          placement: "topRight",
        });
      }, 300);
    }
  };

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  // Sidebar items
  const sidebarItems = [
    {
      key: "warehouse",
      label: "Kho",
      icon: <FaWarehouse />,
      children: [
        { key: "hanoi", label: "Kho Hà Nội", icon: <FaWarehouse /> },
        { key: "hcm", label: "Kho TP.HCM", icon: <FaWarehouse /> },
      ],
    },
    {
      key: "provide",
      label: "Nhà cung cấp",
      icon: <MdHomeWork />,
      children: [
        { key: "1", label: "Cơ sở sản xuất Thiên Phú", icon: <MdHomeWork /> },
        { key: "2", label: "Công ty sữa Mega", icon: <MdHomeWork /> },
      ],
    },
  ];

  //handle provide filter
  const handleProviderFilter = (key) => {
    const provider = sampleprovide.find((p) => p.id === key);
    if (provider) {
      const filtered = categories.filter(
        (cat) => cat.provide === provider.name
      );
      setFilteredCategories(filtered);
      message.success(`Đã lọc theo nhà cung cấp ${provider.name}`);
    } else {
      setFilteredCategories(categories);
    }
  };

  // Handle warehouse filter
  const handleWarehouseFilter = (key) => {
    const filtered = categories.filter((cat) =>
      cat.warehouse.toLowerCase().includes(key)
    );
    setFilteredCategories(filtered);
    message.success(`Đã lọc theo kho ${key === "hanoi" ? "Hà Nội" : "TP.HCM"}`);
  };

  // Table columns
  const columns = [
    { title: "Mã danh mục", dataIndex: "categoryCode", key: "categoryCode" },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Số sản phẩm", dataIndex: "productCount", key: "productCount" },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) => <img src={url} alt="category" style={{ width: 50 }} />,
    },
    { title: "Nhà cung cấp", dataIndex: "provide", key: "provide" },
    { title: "Kho", dataIndex: "warehouse", key: "warehouse" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleCategoryClick(record)}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <ManagerLayoutSidebar
        title="DANH MỤC"
        sidebarItems={sidebarItems}
        onSidebarClick={({ key, keyPath }) => {
          if (keyPath.includes("warehouse")) {
            handleWarehouseFilter(key);
          } else if (keyPath.includes("provide")) {
            handleProviderFilter(key);
          } else {
            setFilteredCategories(categories);
          }
        }}
      >
        <div className="category-page">
          <Header className="category__header">
            <div className="category__header-left">
              <Input
                className="search-input"
                placeholder="Theo mã hoặc tên danh mục"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category__header-action">
              <Space>
                <Button
                  type="primary"
                  icon={<FaReplyAll />}
                  onClick={() => setFilteredCategories(categories)}
                >
                  Tất cả
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Thêm mới
                </Button>
              </Space>
            </div>
          </Header>

          <Content className="category__content">
            <Card
              title={
                <Space>
                  <BiSolidCategory />
                  <span>
                    Danh sách danh mục ({searchedCategories.length} danh mục)
                  </span>
                </Space>
              }
            >
              <Table
                className="category__content-table"
                columns={columns}
                dataSource={searchedCategories}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} của ${total} danh mục`,
                }}
                locale={{
                  emptyText: (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <BiSolidCategory />
                      </div>
                      <div>Không tìm thấy danh mục nào</div>
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
                {selectedCategory
                  ? `Chi tiết danh mục - ${selectedCategory.categoryCode}`
                  : "Tạo danh mục mới"}
              </Space>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedCategory(null);
              form.resetFields();
            }}
            width={700}
            footer={[
              <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>,
              <Popconfirm
                key="delete"
                title="Bạn có chắc chắn muốn xóa danh mục này?"
                onConfirm={handleDeleteCategory}
                disabled={!selectedCategory}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!selectedCategory}
                >
                  Xóa
                </Button>
              </Popconfirm>,
              <Button key="save" type="primary" onClick={handleSaveCategory}>
                {selectedCategory ? "Cập nhật" : "Tạo mới"}
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Mã danh mục"
                    name="categoryCode"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã danh mục!" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tên danh mục"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên danh mục!",
                      },
                    ]}
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
                  <Form.Item label="Số sản phẩm" name="productCount">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Hình ảnh"
                    name="image"
                    valuePropName="imageUrl"
                  >
                    <Upload
                      name="file"
                      listType="picture"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file); // Chuyển file thành base64
                        reader.onload = () => {
                          form.setFieldValue("image", reader.result); // Gán URL vào form
                        };
                        return false; // Ngăn không upload thật
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                    {/* Hiển thị ảnh ngay dưới nút nếu đã chọn */}
                    {form.getFieldValue("image") && (
                      <img
                        src={form.getFieldValue("image")}
                        alt="preview"
                        style={{ width: 100, marginTop: 10, borderRadius: 8 }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Nhà cung cấp" name="provide">
                    <Select>
                      {sampleprovide.map((prov) => (
                        <Option key={prov.id} value={prov.name}>
                          {prov.name}
                        </Option>
                      ))}
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
    </>
  );
}
