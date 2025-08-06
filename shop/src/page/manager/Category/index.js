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
import categoryApi from "../../../api/categoryApi";
import providerApi from "../../../api/providerApi";
import { MdHomeWork } from "react-icons/md";
import { FaReplyAll } from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { BiSolidCategory } from "react-icons/bi";
const { Option } = Select;

const { Header, Content } = Layout;

const mapCategoryData = (data, providers) =>
  data.map((item) => {
    const provider = providers.find((p) => p.id === item.nhaCungCap);
    return {
      id: item.id,
      categoryCode: item.maDanhMuc,
      name: item.tenDanhMuc,
      description: item.moTa,
      productCount: item.soLuongSanPham,
      provide: provider?.tenNhaCungCap || "Không rõ",
      image: item.hinhAnh
        ? `http://127.0.0.1:8000/storage/${item.hinhAnh}`
        : null,
    };
  });

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [previewImage, setPreviewImage] = useState(null);
  const [providers, setProviders] = useState([]);

  // Search categories by code or name
  const searchedCategories = filteredCategories.filter(
    (category) =>
      category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    form.setFieldsValue({ ...category });
    setPreviewImage(category.image);
    setIsModalOpen(true);
  };

  // Handle save category
  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      formData.append("tenDanhMuc", values.name);
      formData.append("moTa", values.description || "");
      formData.append("soLuongSanPham", values.productCount || 0);
      formData.append("nhaCungCap", values.provide);

      if (values.categoryCode) {
        formData.append("maDanhMuc", values.categoryCode); //
      }

      if (values.image && values.image instanceof Blob) {
        formData.append("hinhAnh", values.image);
      }

      if (selectedCategory) {
        const response = await categoryApi.update(
          selectedCategory.id,
          formData
        );

        if (response?.data?.success) {
          api.success({
            message: "Cập nhật sản phẩm thành công",
            placement: "topRight",
          });

          form.resetFields();
          setPreviewImage(null);
          setSelectedCategory(null);
          setIsModalOpen(false);

          const getRes = await categoryApi.getAll();
          const mapped = mapCategoryData(getRes.data.data);
          setCategories(mapped);
          setFilteredCategories(mapped);
        } else {
          throw new Error(response?.data?.message || "Cập nhật thất bại");
        }
      } else {
        console.log(values.image);
        const response = await categoryApi.create(formData);
        console.log(response.data);

        if (response?.data?.success) {
          api.success({
            message: "Tạo mới sản phẩm thành công",
            placement: "topRight",
          });

          const getRes = await categoryApi.getAll();
          const mapped = mapCategoryData(getRes.data.data);
          setCategories(mapped);
          setFilteredCategories(mapped);
        } else {
          throw new Error(response?.data?.message || "Tạo thất bại");
        }
      }

      // Làm mới
      form.resetFields();
      setPreviewImage(null);
      setSelectedCategory(null);
      setIsModalOpen(false);

      const getRes = await categoryApi.getAll();
      const mapped = mapCategoryData(getRes.data.data);
      setCategories(mapped);
      setFilteredCategories(mapped);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      message.error(error.message || "Vui lòng kiểm tra lại thông tin!");
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    await categoryApi.delete(selectedCategory.id);
    if (selectedCategory) {
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== selectedCategory.id)
      );
      setIsModalOpen(false);
      setSelectedCategory(null);
      form.resetFields();
      setPreviewImage(null);

      setTimeout(() => {
        api.success({
          message: "Đã xóa danh mục thành công",
          placement: "topRight",
        });
      }, 300);

      form.resetFields();
      setPreviewImage(null);
      setSelectedCategory(null);
      setIsModalOpen(false);

      const getRes = await categoryApi.getAll();
      const mapped = mapCategoryData(getRes.data.data);
      setCategories(mapped);
      setFilteredCategories(mapped);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const providerRes = await providerApi.getAll();
        const providerList = providerRes.data.data;
        setProviders(providerList);

        const categoryRes = await categoryApi.getAll();
        if (categoryRes.data.success) {
          const fetched = categoryRes.data.data.map((item) => {
            const provider = providerList.find((p) => p.id === item.nhaCungCap);
            return {
              id: item.id,
              categoryCode: item.maDanhMuc,
              name: item.tenDanhMuc,
              description: item.moTa,
              productCount: item.soLuongSanPham,
              provide: provider?.tenNhaCungCap || "Không rõ",
              image: item.hinhAnh
                ? `http://127.0.0.1:8000/storage/${item.hinhAnh}`
                : null,
            };
          });
          setCategories(fetched);
          setFilteredCategories(fetched);
        }
      } catch (error) {
        message.error("Lỗi khi tải danh mục");
      }
    };

    const fetchProviders = async () => {
      try {
        const res = await providerApi.getAll();
        setProviders(res.data.data);
      } catch (error) {
        message.error("Lỗi khi tải nhà cung cấp");
      }
    };

    fetchCategories();
    fetchProviders();
  }, []);

  // Sidebar items
  const sidebarItems = [
    {
      key: "provide",
      label: "Nhà cung cấp",
      icon: <MdHomeWork />,
      children: providers.map((prov) => ({
        key: String(prov.id),
        label: prov.tenNhaCungCap,
      })),
    },
  ];

  //handle provide filter
  const handleProviderFilter = (id) => {
    if (id === "all") {
      setFilteredCategories(categories);
      return;
    }

    const provider = providers.find((p) => String(p.id) === String(id));
    if (!provider) {
      setFilteredCategories(categories);
      message.warning("Không tìm thấy nhà cung cấp tương ứng");
      return;
    }

    const filtered = categories.filter(
      (cat) =>
        cat.provide?.toLowerCase() === provider.tenNhaCungCap.toLowerCase()
    );

    setFilteredCategories(filtered);
  };

  // Table columns
  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) => <img src={url} alt="category" style={{ width: 50 }} />,
    },
    { title: "Mã danh mục", dataIndex: "categoryCode", key: "categoryCode" },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Số sản phẩm", dataIndex: "productCount", key: "productCount" },

    { title: "Nhà cung cấp", dataIndex: "provide", key: "provide" },
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
          if (keyPath.includes("provide")) {
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
              setPreviewImage(null);
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
                  <Form.Item label="Mã danh mục" name="categoryCode">
                    <Input disabled />
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
                        form.setFieldValue("image", file);
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                          setPreviewImage(reader.result);
                        };
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="preview"
                        style={{ width: 100, marginTop: 10, borderRadius: 8 }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Nhà cung cấp" name="provide">
                    <Select>
                      {providers.map((prov) => (
                        <Option key={prov.id} value={prov.name}>
                          {prov.name}
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
