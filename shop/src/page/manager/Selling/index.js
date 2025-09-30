import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Row, Col, Input, Button, Spin, message,
    Typography, Radio, Empty, AutoComplete, InputNumber, Space, Select, Tabs
} from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { AiFillThunderbolt } from "react-icons/ai";
import { TbTruckDelivery } from "react-icons/tb";
import { FaTrashAlt } from "react-icons/fa";
import './Selling.scss';
import productApi from "../../../api/productApi";
import customerApi from "../../../api/customerApi";
import billApi from "../../../api/billApi";
import { formatVND } from "../../../utils/formatter";
import { printInvoice } from "../../../utils/printUtilsLe";
import { useNavigate } from 'react-router-dom';
import BanGiaoHang from '../BanGiaoHang';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function Selling() {
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState("quick_sell");

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [noteValue, setNoteValue] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [productSearchValue, setProductSearchValue] = useState("");
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [customerSearchValue, setCustomerSearchValue] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [orderSummary, setOrderSummary] = useState({
        totalAmount: 0,
        discount: 0,
        customerPayment: 0,
        earnedPoints: 0
    });
    
    const staffName = "Doãn Ly";
    const [currentTime, setCurrentTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); 
        return () => clearInterval(timer);
    }, []);

    const handleQuantityChange = (id, type) => {
        const updatedProducts = selectedProducts.map(prod =>
            prod.id === id
                ? { ...prod, soLuong: type === 'inc' ? Math.min(prod.soLuong + 1, prod.soLuongTon) : Math.max(1, prod.soLuong - 1) }
                : prod
        );
        setSelectedProducts(updatedProducts);
    };

    const handleDelete = (id) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleSearchProduct = async (value) => {
        setProductSearchValue(value);
        if (!value) {
            setProductSuggestions([]);
            return;
        }
        try {
            const res = await productApi.search(value);
            setProductSuggestions(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setProductSuggestions([]);
        }
    };

    const handleSelectProduct = async (productId) => {
        if (selectedProducts.some(p => p.id === productId)) {
            return message.warning('Sản phẩm đã có trong hóa đơn.');
        }
        try {
            const res = await productApi.getById(productId);
            const productData = res.data.data;
            if (!productData) return;
            
            setSelectedProducts(prev => [...prev, {
                id: productData.id,
                maSKU: productData.maSKU,
                tenSanPham: productData.tenSanPham,
                hinhAnh: productData.hinhAnh,
                soLuong: 1,
                giaBan: Number(productData.giaBan || 0),
                VAT: Number(productData.VAT || 0),
                soLuongTon: Number(productData.soLuongTon || 0),
            }]);
            setProductSearchValue("");
            setProductSuggestions([]);
        } catch (error) {
            message.error("Không thể lấy thông tin sản phẩm.");
        }
    };

    const handleCustomerSearch = async (value) => {
        setCustomerSearchValue(value);
        if (!value) {
            setFilteredCustomers([]);
            return;
        }
        try {
            const res = await customerApi.timKiem(value);
            setFilteredCustomers(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            setFilteredCustomers([]);
        }
    };

    const handleSelectCustomer = (customerId, option) => {
        const customer = filteredCustomers.find(c => c.id === customerId);
        if (customer) {
            setSelectedCustomer(customer);
            setCustomerSearchValue(option.label);
            setFilteredCustomers([]);
        }
    };

    useEffect(() => {
        const totalAmount = selectedProducts.reduce((sum, prod) => sum + (prod.soLuong * prod.giaBan), 0);
        const discount = orderSummary.discount || 0;
        const customerPayment = Math.max(0, totalAmount - discount);
        const earnedPoints = Math.floor(customerPayment / 10000);

        setOrderSummary({ totalAmount, discount, customerPayment, earnedPoints });
    }, [selectedProducts, orderSummary.discount]);

    const handlePayment = async () => {
        if (selectedProducts.length === 0 || !selectedCustomer) {
            return message.error("Vui lòng thêm sản phẩm và chọn khách hàng.");
        }
        setLoadingPayment(true);
        
        const paymentMethodMapping = { cash: 'cod', transfer: 'bank_transfer', card: 'credit_card' };

        const paymentPayload = {
            khachHang_id: String(selectedCustomer.id),
            phuongThuc: paymentMethodMapping[paymentMethod],
            tenNguoiNhan: selectedCustomer.hoTen,
            soDienThoai: selectedCustomer.sdt,
            sanPhams: selectedProducts.map(p => ({
                id: p.id, tenSanPham: p.tenSanPham, soLuong: p.soLuong, 
                giaBan: p.giaBan, giamGia: 0, VAT: p.VAT
            })),
            giamVoucher: orderSummary.discount,
            giamDiem: 0,
        };

        try {
            const response = await billApi.thanhToan(paymentPayload);
            message.success("Thanh toán thành công!");
            console.log('Response from API:', response.data);
            const invoiceData = {
                ...orderSummary,
                items: selectedProducts,
                customerName: selectedCustomer.hoTen,
                customerPhone: selectedCustomer.sdt,
                invoiceCode: response.data?.maHoaDon || `HD - ${response.data?.hoaDonId || 'N/A'}`,
                invoiceId: response.data?.hoaDonId,
            };
            

           
            printInvoice(invoiceData, staffName, currentTime.toLocaleString('vi-VN'));

           
            setSelectedProducts([]);
            setSelectedCustomer(null);
            setCustomerSearchValue('');
            setNoteValue('');
            setOrderSummary({ totalAmount: 0, discount: 0, customerPayment: 0, earnedPoints: 0 });

          
            setTimeout(() => {
                if (response.data?.hoaDonId) {
                    navigate(`/manager/giao-dich/hoa-don?view=${response.data.hoaDonId}`);
                }
            }, 1000);

        } catch (error) {
            message.error(error.response?.data?.message || "Thanh toán thất bại.");
        } finally {
            setLoadingPayment(false);
        }
    };
    
    const quickSellTabContent = (
        <Spin spinning={loadingPayment} tip="Đang xử lý...">
            <div className="selling__content-wrapper">
                <Row gutter={16} style={{ height: '100%' }}>
                    <Col span={14} className="selling-column">
                        <AutoComplete
                            style={{ width: "100%", marginBottom: 16 }}
                            placeholder="Tìm hàng hóa theo tên hoặc mã"
                            value={productSearchValue}
                            options={productSuggestions.map((item) => ({
                                value: item.id,
                                label: (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <img src={`http://127.0.0.1:8000/storage/${item.hinhAnh}`} alt={item.tenSanPham} style={{ width: 30, height: 30, objectFit: "cover" }} />
                                        <span>{item.maSKU} - {item.tenSanPham}</span>
                                    </div>
                                ),
                            }))}
                            onSelect={handleSelectProduct}
                            onSearch={handleSearchProduct}
                            onChange={setProductSearchValue}
                        />
                        <div className="selling__product-list">
                            {selectedProducts.length > 0 ? selectedProducts.map((product) => (
                                <div className="product-row" key={product.id}>
                                    <img src={`http://127.0.0.1:8000/storage/${product.hinhAnh}`} alt={product.tenSanPham} className="product-image" />
                                    <span className="product-name">{product.maSKU} - {product.tenSanPham}</span>
                                    <div className="product-quantity">
                                        <Button size="small" onClick={() => handleQuantityChange(product.id, "dec")}>-</Button>
                                        <span>{product.soLuong}</span>
                                        <Button size="small" onClick={() => handleQuantityChange(product.id, "inc")} disabled={product.soLuong >= product.soLuongTon}>+</Button>
                                    </div>
                                    <div className="product-price">{formatVND(product.giaBan)}</div>
                                    <div className="product-total">{formatVND(product.soLuong * product.giaBan)}</div>
                                    <Button type="text" danger icon={<FaTrashAlt />} className="product-delete" onClick={() => handleDelete(product.id)} />
                                </div>
                            )) : <Empty description="Chưa có sản phẩm trong hóa đơn" />}
                        </div>
                        <div className="selling__note">
                            <TextArea value={noteValue} onChange={(e) => setNoteValue(e.target.value)} placeholder="Ghi chú cho đơn hàng" autoSize={{ minRows: 2, maxRows: 4 }} />
                        </div>
                    </Col>
                    
                    <Col span={10} className="selling-column">
                        <div className="pos-header">
                            <Text><strong>Nhân viên:</strong> {staffName}</Text>
                            <Text>{currentTime.toLocaleString('vi-VN')}</Text>
                        </div>
                        <AutoComplete
                            style={{ width: '100%' }}
                            placeholder="Tìm khách hàng (Tên hoặc SĐT)"
                            value={customerSearchValue}
                            options={filteredCustomers.map((cus) => ({ value: cus.id, label: `${cus.hoTen} - ${cus.sdt}` }))}
                            onSelect={handleSelectCustomer}
                            onSearch={handleCustomerSearch}
                            onChange={(value) => {
                                setCustomerSearchValue(value);
                                if (!value) setSelectedCustomer(null);
                            }}
                            suffixIcon={<UserOutlined />}
                        />
                         <div className="order-summary">
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <div className="summary-row">
                                    <Text>Tổng tiền hàng</Text>
                                    <Text strong>{formatVND(orderSummary.totalAmount)}</Text>
                                </div>
                                <div className="summary-row">
                                    <Text>Giảm giá (toàn đơn)</Text>
                                    <InputNumber
                                        value={orderSummary.discount}
                                        onChange={(value) => setOrderSummary(prev => ({ ...prev, discount: value || 0 }))}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: 150 }} min={0}
                                    />
                                </div>
                                <div className="summary-row points">
                                    <Text>Điểm hiện tại</Text>
                                    <Text strong>{selectedCustomer?.points || 0} điểm</Text>
                                </div>
                                 <div className="summary-row points">
                                    <Text>Tích điểm (dự kiến)</Text>
                                    <Text strong style={{color: 'green'}}>+{orderSummary.earnedPoints} điểm</Text>
                                </div>
                                <div className="summary-row customer-payment">
                                    <Text strong>Khách cần trả</Text>
                                    <Text strong style={{ color: '#d4380d' }}>{formatVND(orderSummary.customerPayment)}</Text>
                                </div>
                                <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ width: '100%' }}>
                                    <Row>
                                        <Col span={8}><Radio value={"cash"}>Tiền mặt</Radio></Col>
                                        <Col span={8}><Radio value={"transfer"}>Chuyển khoản</Radio></Col>
                                        <Col span={8}><Radio value={"card"}>Thẻ</Radio></Col>
                                    </Row>
                                </Radio.Group>
                            </Space>
                        </div>
                        <div className="payment-section">
                            <Button type="primary" size="large" block onClick={handlePayment} className="payment-btn" disabled={loadingPayment}>
                                THANH TOÁN
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </Spin>
    );

    const tabItems = [
        { 
            key: "quick_sell", 
            label: <span><AiFillThunderbolt /> Bán Nhanh</span>, 
            children: quickSellTabContent 
        },
        { 
            key: "delivery_sell", 
            label: <span><TbTruckDelivery /> Bán Giao Hàng</span>, 
            children: <BanGiaoHang staffName={staffName} />
        },
    ];

    return (
        <div className="container selling-page">
            <Tabs 
                activeKey={activeKey} 
                onChange={setActiveKey} 
                items={tabItems} 
                type="card"
                className="selling-tabs"
                tabPosition="bottom"
            />
        </div>
    );
}

export default Selling;