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
  Tag,
  Space,
  message,
  Popconfirm,
  InputNumber,
  Layout,
  Row,
  Col,
  Select,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import "antd/dist/reset.css";
import moment from "moment";
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
    createdAt: "30/06/2025",
    productCount: 50,
    image: "https://down-vn.img.susercontent.com/file/a6cce422389cbb21eef67ba583238b3f",
    warehouse: "Kho Hà Nội",
  },
  {
    id: "2",
    categoryCode: "DM002",
    name: "Đồ chơi trẻ em",
    description: "Đồ chơi an toàn cho trẻ em",
    createdAt: "28/06/2025",
    productCount: 30,
    image: "https://www.kidsplaza.vn/blog/wp-content/uploads/2012/12/chon-do-choi-cho-be.jpg",
    warehouse: "Kho TP.HCM",
  },
];

export default function Category() {
  const [categories, setCategories] = useState(sampleCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [filteredCategories, setFilteredCategories] = useState(sampleCategories);

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
    createdAt: moment(category.createdAt, "DD/MM/YYYY"), 
  });
  setIsModalOpen(true);
};


  // Handle save category
  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields();
      const updatedCategory = { ...values,createdAt: values.createdAt.format("DD/MM/YYYY"), id: selectedCategory?.id || Date.now().toString() };

      if (selectedCategory) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === selectedCategory.id ? updatedCategory : cat))
        );
        message.success("Cập nhật danh mục thành công!");
      } else {
        setCategories((prev) => [...prev, updatedCategory]);
        message.success("Thêm danh mục thành công!");
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
      setCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
      setIsModalOpen(false);
      setSelectedCategory(null);
      form.resetFields();
      message.success("Xóa danh mục thành công!");
    }
  };

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  // Sidebar items
  const sidebarItems = [
    {
      key: "time",
      label: "Thời gian tạo",
      icon: <CalendarOutlined />,
      children: [
        { key: "today", label: "Hôm nay", icon: <CalendarOutlined /> },
        { key: "yesterday", label: "Hôm qua", icon: <CalendarOutlined /> },
        { key: "this-month", label: "Tháng này", icon: <CalendarOutlined /> },
        { key: "last-month", label: "Tháng trước", icon: <CalendarOutlined /> },
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
  ];

  // Handle time filter
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
      case "this-month":
        fromDate = moment().startOf("month");
        toDate = moment().endOf("month");
        break;
      case "last-month":
        fromDate = moment().subtract(1, "month").startOf("month");
        toDate = moment().subtract(1, "month").endOf("month");
        break;
      default:
        setFilteredCategories(categories);
        return;
    }
    const filtered = categories.filter((cat) =>
      moment(cat.createdAt, "DD/MM/YYYY").isBetween(fromDate, toDate, "day", "[]")
    );
    setFilteredCategories(filtered);
  };

  // Handle warehouse filter
  const handleWarehouseFilter = (key) => {
    const filtered = categories.filter((cat) => cat.warehouse.toLowerCase().includes(key));
    setFilteredCategories(filtered);
    message.success(`Đã lọc theo kho ${key === "hanoi" ? "Hà Nội" : "TP.HCM"}`);
  };

  // Table columns
  const columns = [
    { title: "Mã danh mục", dataIndex: "categoryCode", key: "categoryCode" },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt" },
    { title: "Số sản phẩm", dataIndex: "productCount", key: "productCount" },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) => <img src={url} alt="category" style={{ width: 50 }} />,
    },
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
    <ManagerLayoutSidebar
      sidebarItems={sidebarItems}
      onSidebarClick={({ key, keyPath }) => {
        if (keyPath.includes("time")) {
          handleTimeFilter(key);
        } else if (keyPath.includes("warehouse")) {
          handleWarehouseFilter(key);
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Thêm mới
            </Button>
          </div>
        </Header>

        <Content className="category__content">
          <Card
            title={
              <Space>
                <BiSolidCategory />
                <span>Danh sách danh mục ({searchedCategories.length} danh mục)</span>
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
              {selectedCategory ? `Chi tiết danh mục - ${selectedCategory.categoryCode}` : "Tạo danh mục mới"}
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
              <Button danger icon={<DeleteOutlined />} disabled={!selectedCategory}>
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
                  rules={[{ required: true, message: "Vui lòng nhập mã danh mục!" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên danh mục"
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
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
                <Form.Item label="Ngày tạo" name="createdAt">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Số sản phẩm" name="productCount">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Hình ảnh" name="image">
                  <Input placeholder="URL hình ảnh" />
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