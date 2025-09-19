import { useState, useEffect } from "react";
import "./Product.scss";
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
  notification,
  Popconfirm,
  Layout,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  Spin,
  Switch,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { formatVND } from "../../../utils/formatter";
import { formatNumber } from "../../../utils/formaterNumber";
import { FaBoxArchive, FaReplyAll } from "react-icons/fa6";
import { BiSolidCategory } from "react-icons/bi";
import { AiFillCheckSquare } from "react-icons/ai";
import productApi from "../../../api/productApi";
import categoryApi from "../../../api/categoryApi";

const { Header, Content } = Layout;
const { Option } = Select;

const isLocal = process.env.NODE_ENV === "development";

const mapProductsFromAPI = (data, categories = []) =>

  data.map((item) => {
    let imageUrl = null;
    if (item.hinhAnh) {
      const originalPath = item.hinhAnh;
      if (isLocal) {
        imageUrl = `http://127.0.0.1:8000/storage/${originalPath}`;
      } else {
        imageUrl = `https://web-production-c18cf.up.railway.app/storage/${originalPath}`;
      }
    }
    return {
      id: item.id,
      productCode: item.maSanPham,
      name: item.tenSanPham,
      sku: item.maSKU,
      vat: item.VAT,
      description: item.moTa,
      price: item.giaBan || 0,
      stock: item.soLuongTon || 0,
      image: imageUrl,
      category:
        categories.find((dm) => dm.id === item.danhMuc_id)?.tenDanhMuc ||
        "Không rõ",
      categoryId: item.danhMuc_id,
      isFeatured: item.is_noi_bat || 0,
    };
  });


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
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const searchedProducts = filteredProducts.filter(
    (product) =>
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productRes, categoryRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
      ]);

      if (!productRes.data.success) {
        throw new Error(productRes.data.message || "Lỗi khi tải sản phẩm");
      }
      if (!categoryRes.data.success) {
        throw new Error(categoryRes.data.message || "Lỗi khi tải danh mục");
      }

      const productData = productRes.data.data;
      const categoryData = categoryRes.data.data;

      setCategories(categoryData);
      const mapped = mapProductsFromAPI(productData, categoryData);
      setProducts(mapped);
      setFilteredProducts(mapped);
    } catch (error) {
      api.error({
        message: error.message || error.response?.data?.message || "Lỗi khi tải dữ liệu!",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      categoryId: product.categoryId,
    });
    setFileList(
      product.image
        ? [{ uid: "-1", name: "image", status: "done", url: product.image }]
        : []
    );
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
  try {
    setLoading(true);
    const values = await form.validateFields();
    const formData = new FormData();
    formData.append("tenSanPham", values.name);
    formData.append("maSKU", values.sku);
    formData.append("VAT", values.vat || 0);
    formData.append("moTa", values.description || "");
    formData.append("danhMuc_id", values.categoryId);
    formData.append("giaBan", values.price || 0);
    formData.append("soLuongTon", values.stock || 0);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj;
      formData.append("hinhAnh", file);
    }

    for (let pair of formData.entries()) {
      console.log(`FormData: ${pair[0]} = ${pair[1]}`);
    }

    let response;
    if (selectedProduct) {
      response = await productApi.update(selectedProduct.id, formData);
    } else {
      response = await productApi.create(formData);
    }

    if (response.data.success) {
      api.success({
        message: response.data.message,
        placement: "topRight",
      });
      await fetchData();
      setIsModalOpen(false);
      setSelectedProduct(null);
      form.resetFields();
      setFileList([]);
    } else {
      throw new Error(response.data.message || "Thao tác thất bại");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    if (error.response?.status === 422) {
      const errors = error.response.data.errors || {};
      const errorMessages = Object.values(errors).flat().join(", ");
      api.error({
        message: errorMessages || errorMessage || "Lỗi khi lưu sản phẩm!",
        placement: "topRight",
      });
    } else {
      api.error({
        message: errorMessage || "Lỗi khi lưu sản phẩm!",
        placement: "topRight",
      });
    }
  } finally {
    setLoading(false);
  }
};

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        setLoading(true);
        const response = await productApi.delete(selectedProduct.id);
        if (response.data.success) {
          api.success({
            message: response.data.message,
            placement: "topRight",
          });
          await fetchData();
          setIsModalOpen(false);
          setSelectedProduct(null);
          form.resetFields();
          setFileList([]);
        } else {
          throw new Error(response.data.message || "Xóa thất bại");
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        api.error({
          message: errorMessage || "Lỗi khi xóa sản phẩm!",
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      setLoading(true);
      const response = await productApi.changeNoiBat(id);
      if (response.data.status) {
        api.success({
          message: response.data.message,
          placement: "topRight",
        });
        await fetchData();
      } else {
        throw new Error(response.data.message || "Thay đổi trạng thái nổi bật thất bại");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      api.error({
        message: errorMessage || "Lỗi khi thay đổi trạng thái nổi bật!",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    try {
      const res = await productApi.getByCategory(categoryId);
      if (res.data.success) {
        const mapped = mapProductsFromAPI(res.data.data, categories);
        setFilteredProducts(mapped);
        api.success({
          message: res.data.message,
          placement: "topRight",
        });
      } else {
        throw new Error(res.data.message || "Lọc sản phẩm thất bại");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      api.error({
        message: errorMessage || "Lỗi khi lọc dữ liệu!",
        placement: "topRight",
      });
    }
  };

  const handleStatusFilter = (key) => {
    const filtered = products.filter((prod) => {
      if (key === "near-out") return prod.stock > 0 && prod.stock < 10;
      if (key === "out") return prod.stock === 0;
      return true;
    });
    setFilteredProducts(filtered);
    api.success({
      message: `Lọc sản phẩm theo tình trạng "${key === "near-out" ? "Gần hết hàng" : "Hết hàng"}" thành công`,
      placement: "topRight",
    });
  };

  const handleDynamicPriceFilter = () => {
    if (minPrice == null || maxPrice == null) {
      api.warning({
        message: "Vui lòng nhập cả khoảng giá!",
        placement: "topRight",
      });
      return;
    }

    if (minPrice > maxPrice) {
      api.warning({
        message: "Giá từ không được lớn hơn giá đến!",
        placement: "topRight",
      });
      return;
    }

    const filtered = products.filter((prod) => {
      const price = Number(prod.price) || 0;
      const vat = Number(prod.vat) || 0;
      const priceWithVAT = price + (price * vat) / 100;
      return priceWithVAT >= minPrice && priceWithVAT <= maxPrice;
    });
    setFilteredProducts(filtered);
    api.success({
      message: `Đã lọc từ ${minPrice.toLocaleString()}đ đến ${maxPrice.toLocaleString()}đ (bao gồm VAT)`,
      placement: "topRight",
    });
  };

  const handleResetPriceFilter = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setFilteredProducts(products);
    api.success({
      message: "Đã đặt lại bộ lọc giá",
      placement: "topRight",
    });
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) => (
        <div className="image-container">
          {url && url.startsWith("http") ? (
            <>
              <img
                src={url}
                alt="product"
                style={{ width: 50, borderRadius: 4, display: "none" }}
                onError={(e) => {
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
    { title: "Mã sản phẩm", dataIndex: "productCode", key: "productCode" },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Đơn giá (đã VAT)",
      key: "priceWithVAT",
      render: (_, record) => {
        const price = Number(record.price) || 0;
        const vat = Number(record.vat) || 0;
        const priceWithVAT = price + (price * vat) / 100;
        return formatVND(priceWithVAT);
      },
    },
    { title: "VAT", dataIndex: "vat", key: "vat", render: (vat) => `${formatNumber(vat)}%` },
    { title: "Số lượng", dataIndex: "stock", key: "stock" },
    { title: "Danh mục", dataIndex: "category", key: "category" },
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
    // {
    //   title: "Nổi bật",
    //   dataIndex: "isFeatured",
    //   key: "isFeatured",
    //   render: (isFeatured, record) => (
    //     <Switch
    //       checked={isFeatured === 1}
    //       onChange={() => handleToggleFeatured(record.id, isFeatured)}
    //       loading={loading}
    //     />
    //   ),
    // },
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
        sidebarItems={[
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
            key: "status",
            label: "Tình trạng",
            icon: <AiFillCheckSquare />,
            children: [
              { key: "near-out", label: "Gần hết hàng", icon: <AiFillCheckSquare /> },
              { key: "out", label: "Hết hàng", icon: <AiFillCheckSquare /> },
            ],
          },
        ]}
        onSidebarClick={({ key }) => {
          if (key.startsWith("category-")) {
            const id = key.replace("category-", "");
            handleCategoryFilter(id);
          } else if (key === "near-out" || key === "out") {
            handleStatusFilter(key);
          } else {
            setFilteredProducts(products);
            api.success({
              message: "Đã đặt lại bộ lọc",
              placement: "topRight",
            });
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
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
              <InputNumber
                placeholder="đến"
                min={0}
                value={maxPrice}
                onChange={(value) => setMaxPrice(value)}
                style={{ width: 120 }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
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
                onClick={() => {
                  setSelectedProduct(null);
                  form.resetFields();
                  setFileList([]);
                  setIsModalOpen(true);
                }}
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
              <Spin spinning={loading}>
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
              </Spin>
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
              setFileList([]);
            }}
            width={700}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProduct(null);
                  form.resetFields();
                  setFileList([]);
                }}
              >
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
              <Button
                key="save"
                type="primary"
                onClick={handleSaveProduct}
                loading={loading}
              >
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
                        message: "Tên sản phẩm không được để trống",
                      },
                      {
                        max: 255,
                        message: "Tên sản phẩm không được vượt quá 255 ký tự",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Mã SKU"
                    name="sku"
                    rules={[
                      {
                        required: true,
                        message: "Mã SKU không được để trống",
                      },
                      {
                        max: 100,
                        message: "Mã SKU không được vượt quá 100 ký tự",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Đơn giá sản phẩm"
                    name="price"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập đơn giá!",
                      },
                      {
                        type: "number",
                        min: 0,
                        message: "Đơn giá không được âm",
                      },
                    ]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="VAT (%)"
                    name="vat"
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        max: 100,
                        message: "VAT phải từ 0 đến 100%",
                      },
                    ]}
                  >
                    <InputNumber min={0} max={100} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số lượng"
                    name="stock"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lượng!",
                      },
                      {
                        type: "number",
                        min: 0,
                        message: "Số lượng không được âm",
                      },
                    ]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
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
                    label="Danh mục"
                    name="categoryId"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn danh mục!",
                      },
                    ]}
                  >
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
          
            throw new Error("Kích thước hình ảnh không được vượt quá 2MB");
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
              </Row>
            </Form>
          </Modal>
        </div>
      </ManagerLayoutSidebar>
    </>
  );
}