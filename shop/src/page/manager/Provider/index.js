import "./Provider.scss";
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
  Switch,
  Col,
  Row,
  Layout,
  notification,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import providerApi from "../../../api/providerApi";
import { FaBan, FaBuilding, FaCheckCircle, FaReplyAll } from "react-icons/fa";
import moment from "moment"; // Added for date formatting

const { Header, Content } = Layout;

const mapProviderData = (data) =>
  data.map((item) => ({
    id: item.id.toString(),
    name: item.tenNhaCungCap,
    taxCode: item.maSoThue || "-",
    phone: item.sdt || "-",
    email: item.email || "-",
    address: item.diaChi || "-",
    status: item.trangThai ? "Hoạt động" : "Ngừng hoạt động",
    createdAt: item.ngayTao
      ? moment(item.ngayTao).format("DD/MM/YYYY HH:mm")
      : "-",
    updatedAt: item.ngayCapNhat
      ? moment(item.ngayCapNhat).format("DD/MM/YYYY HH:mm")
      : "-",
  }));

export default function Provider() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); // Added for loading state
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const searchedProviders = filteredProviders.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await providerApi.getAll();
      if (response.data.success) {
        const mapped = mapProviderData(response.data.data);
        setProviders(mapped);
        setFilteredProviders(mapped);
      } else {
        throw new Error(response.data.message || "Lỗi khi tải danh sách");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else if (error.response?.status === 404) {
        message.error("Không tìm thấy API nhà cung cấp!");
      } else {
        message.error(error.message || "Lỗi khi tải danh sách nhà cung cấp!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [navigate]);

  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
    form.setFieldsValue({
      name: provider.name,
      taxCode: provider.taxCode === "-" ? "" : provider.taxCode,
      phone: provider.phone === "-" ? "" : provider.phone,
      email: provider.email === "-" ? "" : provider.email,
      address: provider.address === "-" ? "" : provider.address,
      status: provider.status === "Hoạt động",
    });
    setIsModalOpen(true);
  };

  const handleSaveProvider = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const data = {
        tenNhaCungCap: values.name,
        maSoThue: values.taxCode || null,
        sdt: values.phone || null,
        email: values.email || null,
        diaChi: values.address || null,
        trangThai: values.status ? 1 : 0,
      };

      let response;
      if (selectedProvider) {
        response = await providerApi.update(selectedProvider.id, data);
        if (response.data.success) {
          api.success({
            message: "Cập nhật nhà cung cấp thành công",
            placement: "topRight",
          });
        } else {
          throw new Error(response.data.message || "Cập nhật thất bại");
        }
      } else {
        response = await providerApi.create(data);
        if (response.data.success) {
          api.success({
            message: "Tạo nhà cung cấp mới thành công",
            placement: "topRight",
          });
        } else {
          throw new Error(response.data.message || "Tạo thất bại");
        }
      }

      await fetchProviders(); // Refresh the provider list
      setIsModalOpen(false);
      setSelectedProvider(null);
      form.resetFields();
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else {
        message.error(
          error.response?.data?.message || "Lỗi khi lưu nhà cung cấp!"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async () => {
    try {
      setLoading(true);
      const response = await providerApi.delete(selectedProvider.id);
      if (response.data.success) {
        api.success({
          message: "Xóa nhà cung cấp thành công",
          placement: "topRight",
        });
        await fetchProviders();
        setIsModalOpen(false);
        setSelectedProvider(null);
        form.resetFields();
      } else {
        throw new Error(response.data.message || "Xóa thất bại");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else {
        message.error(
          error.response?.data?.message || "Không thể xóa nhà cung cấp!"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProviderFilter = (key) => {
    if (key === "all-providers") {
      setFilteredProviders(providers);
      message.success("Hiển thị tất cả nhà cung cấp");
      return;
    }

    if (key === "status-active") {
      const activeProviders = providers.filter((p) => p.status === "Hoạt động");
      setFilteredProviders(activeProviders);
      message.success("Hiển thị nhà cung cấp Hoạt động");
      return;
    }

    if (key === "status-inactive") {
      const inactiveProviders = providers.filter(
        (p) => p.status === "Ngừng hoạt động"
      );
      setFilteredProviders(inactiveProviders);
      message.success("Hiển thị nhà cung cấp Ngừng hoạt động");
      return;
    }

    const provider = providers.find((p) => p.id === key);
    if (provider) {
      setFilteredProviders([provider]);
      message.success(`Đã lọc theo nhà cung cấp ${provider.name}`);
    } else {
      setFilteredProviders(providers);
      message.warning("Không tìm thấy nhà cung cấp tương ứng");
    }
  };

  const columns = [
    { title: "Tên nhà cung cấp", dataIndex: "name", key: "name" },
    { title: "Mã số thuế", dataIndex: "taxCode", key: "taxCode" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleProviderClick(record)}
        />
      ),
    },
  ];

  const sidebarItems = [
    {
      key: "provider",
      label: "Nhà cung cấp",
      icon: <FaBuilding />,
      children: [
        {
          key: "all-providers",
          label: "Tất cả",
          icon: <FaReplyAll />,
        },
        ...providers.map((p) => ({
          key: p.id,
          label: p.name,
          icon: <FaBuilding />,
        })),
      ],
    },
    {
      key: "status",
      label: "Trạng thái",
      icon: <FaCheckCircle />,
      children: [
        { key: "status-active", label: "Hoạt động", icon: <FaCheckCircle /> },
        { key: "status-inactive", label: "Ngừng hoạt động", icon: <FaBan /> },
      ],
    },
  ];

  return (
    <>
      {contextHolder}
      <ManagerLayoutSidebar
        title="NHÀ CUNG CẤP"
        sidebarItems={sidebarItems}
        onSidebarClick={({ key }) => handleProviderFilter(key)}
        disableMarginTop={true}
      >
        <div className="provider-page" style={{ marginTop: 0 }}>
          <Header className="provider__header">
            <div className="provider__header-left">
              <Input
                className="search-input"
                placeholder="Theo tên hoặc địa chỉ nhà cung cấp"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="provider__header-action">
              <Space>
                <Button
                  type="primary"
                  icon={<FaReplyAll />}
                  onClick={() => handleProviderFilter("all-providers")}
                >
                  Tất cả
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedProvider(null);
                    form.resetFields();
                    setIsModalOpen(true);
                  }}
                >
                  Thêm mới
                </Button>
              </Space>
            </div>
          </Header>

          <Content className="provider__content">
            <Card
              title={
                <Space>
                  <FaBuilding />
                  <span>
                    Danh sách nhà cung cấp ({searchedProviders.length} nhà cung cấp)
                  </span>
                </Space>
              }
            >
              <Spin spinning={loading}>
                <Table
                  className="provider__content-table"
                  columns={columns}
                  dataSource={searchedProviders}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `Hiển thị ${range[0]}-${range[1]} của ${total} nhà cung cấp`,
                  }}
                  locale={{
                    emptyText: (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <FaBuilding />
                        </div>
                        <div>Không tìm thấy nhà cung cấp nào</div>
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
                {selectedProvider
                  ? `Chi tiết nhà cung cấp - ${selectedProvider.name}`
                  : "Tạo nhà cung cấp mới"}
              </Space>
            }
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedProvider(null);
              form.resetFields();
            }}
            width={800}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProvider(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>,
              <Popconfirm
                key="delete"
                title="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
                onConfirm={handleDeleteProvider}
                disabled={!selectedProvider}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!selectedProvider}
                >
                  Xóa
                </Button>
              </Popconfirm>,
              <Button
                key="save"
                type="primary"
                onClick={handleSaveProvider}
                loading={loading}
              >
                {selectedProvider ? "Cập nhật" : "Tạo mới"}
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên nhà cung cấp"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên nhà cung cấp!",
                      },
                      {
                        max: 255,
                        message: "Tên không được vượt quá 255 ký tự!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Mã số thuế"
                    name="taxCode"
                    rules={[
                      {
                        max: 50,
                        message: "Mã số thuế không được vượt quá 50 ký tự!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        max: 20,
                        message: "Số điện thoại không được vượt quá 20 ký tự!",
                      },
                      {
                        pattern: /^[0-9]*$/,
                        message: "Số điện thoại chỉ được chứa số!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        type: "email",
                        message: "Email không đúng định dạng!",
                      },
                      {
                        max: 100,
                        message: "Email không được vượt quá 100 ký tự!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Địa chỉ" name="address">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Hoạt động"
                      unCheckedChildren="Ngừng hoạt động"
                    />
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