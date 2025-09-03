import "./Category.scss";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Spin,
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
import { BiSolidCategory } from "react-icons/bi";
const { Option } = Select;
const { Header, Content } = Layout;

const isLocal = process.env.NODE_ENV === "development";

const mapCategoryData = (data, providers) =>
  data.map((item) => {
    const provider = providers.find((p) => p.id === item.nhaCungCap);
    let imageUrl = null;
    if (item.hinhAnh) {
      const originalPath = item.hinhAnh;
      if (isLocal) {
        // Sử dụng local server khi test
        imageUrl = `http://127.0.0.1:8000/storage/${originalPath}`;
      } else {
        // Sử dụng Railway khi deploy
        imageUrl = `https://web-production-c18cf.up.railway.app/storage/${originalPath}`;
      }
      console.log(`link gốc: ${originalPath}, đã map đến: ${imageUrl}`);
    } else {
      console.log(`[DEBUG] ko thấy hình ảnh với id: ${item.id}`);
    }
    return {
      id: item.id,
      categoryCode: item.maDanhMuc || "-",
      name: item.tenDanhMuc,
      description: item.moTa || "-",
      productCount: item.soLuongSanPham || 0,
      providerId: item.nhaCungCap,
      provide: provider?.tenNhaCungCap || "Không rõ",
      image: imageUrl,
    };
  });

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const searchedCategories = filteredCategories.filter(
    (category) =>
      category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [providerRes, categoryRes] = await Promise.all([
        providerApi.getAll(),
        categoryApi.getAll(),
      ]);

      if (!providerRes.data.success) {
        throw new Error(providerRes.data.message || "Lỗi khi tải nhà cung cấp");
      }
      if (!categoryRes.data.success) {
        throw new Error(categoryRes.data.message || "Lỗi khi tải danh mục");
      }

      const providerList = providerRes.data.data;
      setProviders(providerList);

      const mapped = mapCategoryData(categoryRes.data.data, providerList);
      setCategories(mapped);
      setFilteredCategories(mapped);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else {
        message.error(error.response?.data?.message || "Lỗi khi tải dữ liệu!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    form.setFieldsValue({
      categoryCode: category.categoryCode,
      name: category.name,
      description: category.description === "-" ? "" : category.description,
      productCount: category.productCount,
      provide: category.providerId,
    });
    setFileList(
      category.image
        ? [{ uid: "-1", name: "image", status: "done", url: category.image }]
        : []
    );
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("tenDanhMuc", values.name);
      formData.append("moTa", values.description || "");
      formData.append("soLuongSanPham", values.productCount || 0);
      formData.append("nhaCungCap", values.provide || null);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        if (file.size > 2 * 1024 * 1024) {
          throw new Error("Kích thước hình ảnh không được vượt quá 2MB");
        }
        formData.append("hinhAnh", file);
      }

      let response;
      if (selectedCategory) {
        response = await categoryApi.update(selectedCategory.id, formData);
      } else {
        response = await categoryApi.create(formData);
      }

      if (response.data.success) {
        api.success({
          message: response.data.message,
          placement: "topRight",
        });

        await fetchData();
        setIsModalOpen(false);
        setSelectedCategory(null);
        form.resetFields();
        setFileList([]);
      } else {
        throw new Error(response.data.message || "Thao tác thất bại");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const errorMessages = Object.values(errors).flat().join(", ");
        message.error(errorMessages || "Lỗi khi lưu danh mục!");
      } else {
        message.error(error.message || error.response?.data?.message || "Lỗi khi lưu danh mục!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.delete(selectedCategory.id);
      if (response.data.success) {
        api.success({
          message: response.data.message,
          placement: "topRight",
        });
        await fetchData();
        setIsModalOpen(false);
        setSelectedCategory(null);
        form.resetFields();
        setFileList([]);
      } else {
        throw new Error(response.data.message || "Xóa thất bại");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else if (error.response?.status === 400) {
        message.error(error.response.data.message);
      } else {
        message.error(error.response?.data?.message || "Lỗi khi xóa danh mục!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProviderFilter = (key) => {
    if (key === "all-categories") {
      setFilteredCategories(categories);
      message.success("Hiển thị tất cả danh mục");
      return;
    }

    const provider = providers.find((p) => String(p.id) === String(key));
    if (!provider) {
      setFilteredCategories(categories);
      message.warning("Không tìm thấy nhà cung cấp tương ứng");
      return;
    }

    const filtered = categories.filter(
      (cat) => String(cat.providerId) === String(provider.id)
    );
    setFilteredCategories(filtered);
    message.success(`Đã lọc theo nhà cung cấp ${provider.tenNhaCungCap}`);
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) => (
        <div className="image-container">
          {url && url.startsWith("http") ? (
            <>
              <img
                src={url}
                alt="category"
                style={{ width: 50, borderRadius: 4, display: "none" }}
                onError={(e) => {
                  console.error(
                    `tải ảnh thất bại: ${url}, Status: ${e.target.status || 'hiểu mới lạ'}`
                  );
                  e.target.style.display = "none";
                  const fallback = e.target.parentNode.querySelector(".fallback");
                  if (fallback) {
                    fallback.style.display = "inline";
                  }
                }}
                onLoad={(e) => {
                  e.target.style.display = "inline";
                  const fallback = e.target.parentNode.querySelector(".fallback");
                  if (fallback) {
                    fallback.style.display = "none";
                  }
                }}
              />
              <span className="fallback" style={{ display: "inline" }}>
                -
              </span>
            </>
          ) : (
            <span className="fallback" style={{ display: "inline" }}>
              -
            </span>
          )}
        </div>
      ),
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

  const sidebarItems = [
    {
      key: "all-categories",
      label: "Tất cả danh mục",
      icon: <FaReplyAll />,
    },
    {
      key: "provide",
      label: "Nhà cung cấp",
      icon: <MdHomeWork />,
      children: providers.map((prov) => ({
        key: String(prov.id),
        label: prov.tenNhaCungCap,
        icon: <MdHomeWork />,
      })),
    },
  ];

  return (
    <>
      {contextHolder}
      <ManagerLayoutSidebar
        title="DANH MỤC"
        sidebarItems={sidebarItems}
        onSidebarClick={({ key }) => handleProviderFilter(key)}
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
                  onClick={() => handleProviderFilter("all-categories")}
                >
                  Tất cả
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedCategory(null);
                    form.resetFields();
                    setFileList([]);
                    setIsModalOpen(true);
                  }}
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
              <Spin spinning={loading}>
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
              </Spin>
            </Card>
          </Content>

          <Modal
            title={
              <Space>
                <EditOutlined />
                {selectedCategory
                  ? `Chi tiết danh mục - ${selectedCategory.name}`
                  : "Tạo danh mục mới"}
              </Space>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedCategory(null);
              form.resetFields();
              setFileList([]);
            }}
            width={700}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCategory(null);
                  form.resetFields();
                  setFileList([]);
                }}
              >
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
              <Button
                key="save"
                type="primary"
                onClick={handleSaveCategory}
                loading={loading}
              >
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
                      {
                        required: false,
                      },
                    ]}
                  >
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
                        message: "Tên danh mục không được để trống",
                      },
                      {
                        max: 255,
                        message: "Tên danh mục không được vượt quá 255 ký tự",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                      {
                        type: "string",
                        message: "Mô tả phải là chuỗi ký tự",
                      },
                    ]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số sản phẩm"
                    name="productCount"
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        message: "Số lượng sản phẩm không được âm",
                      },
                    ]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Hình ảnh"
                    name="image"
                    rules={[
                      {
                        validator: async (_, value) => {
                          if (fileList.length > 0 && fileList[0].originFileObj) {
                            const file = fileList[0].originFileObj;
                            const validTypes = [
                              "image/jpeg",
                              "image/png",
                              "image/jpg",
                              "image/gif",
                              "image/svg+xml",
                            ];
                            if (!validTypes.includes(file.type)) {
                              throw new Error(
                                "Hình ảnh phải có định dạng: jpeg, png, jpg, gif, svg"
                              );
                            }
                            if (file.size > 2 * 1024 * 1024) {
                              throw new Error(
                                "Kích thước hình ảnh không được vượt quá 2MB"
                              );
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Upload
                      name="image"
                      listType="picture"
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={({ fileList: newFileList }) => {
                        setFileList(newFileList);
                      }}
                      maxCount={1}
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                    >
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Nhà cung cấp"
                    name="provide"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn nhà cung cấp",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn nhà cung cấp">
                      {providers.map((prov) => (
                        <Option key={prov.id} value={prov.id}>
                          {prov.tenNhaCungCap}
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