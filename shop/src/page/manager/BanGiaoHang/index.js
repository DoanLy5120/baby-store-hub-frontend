import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
    Row, Col, Table, Input, Select, Button, Spin, message,
    Typography, Radio, Empty, Card, Form, InputNumber
} from 'antd';
import { SearchOutlined, CarOutlined, UserOutlined, PrinterOutlined } from '@ant-design/icons';
import './BanGiaoHang.scss';
import bangiaohangApi from '../../../api/bangiaohangApi';
import { formatVND } from '../../../utils/formatter';
import { useNavigate } from 'react-router-dom';
import { printComponentInNewWindow } from '../../../utils/printUtils';

const { Text } = Typography;
const { Option } = Select;

const shippingPartners = [
    { id: 'ghn', name: 'Giao Hàng Nhanh', fee: 25000, type: 'Nhanh' },
    { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm', fee: 22000, type: 'Tiêu chuẩn' },
    { id: 'vtp', name: 'Viettel Post', fee: 28000, type: 'Nhanh' },
];


const PrintableDeliveryInvoice = React.forwardRef(({ invoiceData, staffName, dateTime }, ref) => {
    if (!invoiceData) {
        console.log('Không có dữ liệu để in:', invoiceData);
        return <div ref={ref} style={{ padding: 20 }}>Không có dữ liệu</div>;
    }

    const orderInfo = invoiceData.don_hang || {};
    const customerName = orderInfo.ten_khach_hang || orderInfo.khach_hang || 'Khách lẻ';
    const customerPhone = orderInfo.so_dien_thoai || '';
    const shippingAddress = orderInfo.dia_chi_giao_hang || orderInfo.dia_chi || '';
    const shippingCode = orderInfo.ma_van_don || 'Đang tạo...';
    const products = invoiceData.san_pham || [];
    const codAmount = invoiceData.formValues?.codAmount ?? orderInfo.tong_thanh_toan ?? 0;

    return (
        <div ref={ref} style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>PHIẾU GIAO HÀNG</h1>
            </div>
            
            <div style={{ border: '2px solid #000', padding: 15, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 14, marginBottom: 5 }}>MÃ VẬN ĐƠN</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{shippingCode}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '8px 0' }}><strong>Ngày:</strong> {dateTime}</p>
                <p style={{ margin: '8px 0' }}><strong>Nhân viên:</strong> {staffName}</p>
            </div>

            <hr style={{ border: '1px solid #ccc', margin: '20px 0' }} />

            <div style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 10 }}>THÔNG TIN NGƯỜI NHẬN</h3>
                <p style={{ margin: '8px 0' }}><strong>Người nhận:</strong> {customerName}</p>
                <p style={{ margin: '8px 0' }}><strong>SĐT:</strong> {customerPhone || 'Không có'}</p>
                <p style={{ margin: '8px 0' }}><strong>Địa chỉ:</strong> {shippingAddress}</p>
            </div>

            <hr style={{ border: '1px solid #ccc', margin: '20px 0' }} />

            <div style={{ marginBottom: 20, padding: 15, backgroundColor: '#f5f5f5', border: '2px solid #1890ff' }}>
                <p style={{ margin: 0, fontSize: 16 }}>
                    <strong>Thu hộ (COD):</strong> 
                    <span style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: '#1890ff' }}>
                        {formatVND(codAmount)}
                    </span>
                </p>
            </div>

            <hr style={{ border: '1px solid #ccc', margin: '20px 0' }} />

            <div style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 10 }}>SẢN PHẨM</h3>
                {products.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Tên sản phẩm</th>
                                <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center', width: 100 }}>SL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((item, index) => (
                                <tr key={item.san_pham_id || index}>
                                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                        {item.ten_san_pham || 'Sản phẩm'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                                        {item.so_luong || 1}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>Không có thông tin sản phẩm chi tiết</p>
                )}
            </div>
          
        </div>
    );
});

const BanGiaoHang = ({ staffName = "Doãn Ly" }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filters, setFilters] = useState({ thoiGian: 'hom_nay', q: '' });
    const [shippingPartner, setShippingPartner] = useState('ghn');
    const [form] = Form.useForm();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [invoiceDataForPrint, setInvoiceDataForPrint] = useState(null);
    const printComponentRef = useRef(null);

    
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
          
            const params = { range: filters.thoiGian, q: filters.q, trangThai: 'CHO_LAY_HANG' };
            const res = await bangiaohangApi.getOrders(params);
            const ordersList = Array.isArray(res.data?.data) ? res.data.data : [];
            setOrders(ordersList);
        } catch (error) {
            message.error('Lỗi khi tải danh sách đơn hàng!');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleRowClick = (order) => {
        if (selectedOrder?.id === order.id) return;
        
        setSelectedOrder(order);
        
        form.setFieldsValue({
            codAmount: order.tong_thanh_toan || 0,
            shippingAddress: order.dia_chi_giao_hang || '',
            note: order.ghi_chu || '',
            weight: order.khoi_luong || 500,
        });
    };

  
    const handleConfirmAndShip = async () => {
        const orderId = selectedOrder?.id;
        if (!orderId) {
            return message.warning('Vui lòng chọn một đơn hàng để giao.');
        }

        setLoading(true);
        try {
            const formValues = await form.validateFields();
            const payload = {
                ghi_chu: `Nhân viên ${staffName} xác nhận giao hàng. ${formValues.note || ''}`
            };

      
            const response = await bangiaohangApi.moveToShipping(orderId, payload);
            message.success(response.data.message || 'Đơn hàng đã được chuyển cho đơn vị vận chuyển!');

        
            const updatedOrderData = response.data.don_hang;
            const invoiceDataToPrint = {
                don_hang: {
                    ...selectedOrder, 
                    ...updatedOrderData, 
                },
                san_pham: selectedOrder.san_pham || [], 
                formValues: formValues,
            };

            printComponentInNewWindow(
                <PrintableDeliveryInvoice
                    invoiceData={invoiceDataToPrint}
                    staffName={staffName}
                    dateTime={currentTime.toLocaleString('vi-VN')}
                />
            );

         
            setSelectedOrder(null);
            form.resetFields();
            fetchOrders(); 

        } catch (error) {
            console.error('❌ Lỗi khi xác nhận giao hàng:', error.response || error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận giao hàng.');
        } finally {
            setLoading(false);
        }
    };
    
    const columnsOrders = [
        { title: 'Mã ĐH', dataIndex: 'ma_don_hang', key: 'ma_don_hang' },
        { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
        { title: 'Tổng tiền', dataIndex: 'tong_thanh_toan', key: 'tong_thanh_toan', render: (text) => formatVND(text) },
    ];

    const renderDetails = () => {
        if (!selectedOrder) {
            return (
                <div className="empty-container">
                    <Empty description="Chọn một đơn hàng để xem chi tiết" />
                </div>
            );
        }

        const selectedPartnerFee = shippingPartners.find(p => p.id === shippingPartner)?.fee || 0;

        return (
            <Spin spinning={loading} tip="Đang xử lý...">
                <Row gutter={16} style={{ height: '100%' }}>
                    <Col span={12} className="bgh-column detail-column">
                        <div className="bgh-column-header">Thông tin giao hàng</div>
                        <div className="bgh-column-body">
                            <Card size="small" style={{ marginBottom: 16 }}>
                                <Input
                                    value={`${selectedOrder.ten_khach_hang} - ${selectedOrder.so_dien_thoai || 'N/A'}`}
                                    readOnly
                                    prefix={<UserOutlined />}
                                />
                            </Card>
                            <Form form={form} layout="vertical">
                                <Form.Item name="codAmount" label="Thu hộ (COD)">
                                    <InputNumber style={{ width: '100%' }} readOnly formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                                </Form.Item>
                                <Form.Item name="shippingAddress" label="Địa chỉ giao hàng">
                                    <Input.TextArea rows={3} readOnly />
                                </Form.Item>
                                <Form.Item name="note" label="Ghi chú đơn hàng">
                                    <Input.TextArea rows={2} placeholder="Thêm ghi chú cho đơn vị vận chuyển..."/>
                                </Form.Item>
                            </Form>
                        </div>
                    </Col>
                    <Col span={12} className="bgh-column shipping-column">
                        <div className="bgh-column-header">Đối tác giao hàng</div>
                         <div className="bgh-column-body">
                             <Radio.Group value={shippingPartner} onChange={(e) => setShippingPartner(e.target.value)} style={{ width: '100%' }}>
                                 {shippingPartners.map(p => (
                                     <div className="shipping-item" key={p.id}>
                                         <div className='partner-info'>
                                             <Radio value={p.id}></Radio>
                                             <div>
                                                 <Text strong>{p.name}</Text><br />
                                                 <Text type="secondary">{p.type}</Text>
                                             </div>
                                         </div>
                                         <div className='partner-fee'>{formatVND(p.fee)}</div>
                                     </div>
                                 ))}
                             </Radio.Group>
                         </div>
                        <div className="bgh-column-footer">
                            <div className="summary-row"><Text>Tổng tiền hàng</Text><Text>{formatVND(selectedOrder.tong_tien)}</Text></div>
                            <div className="summary-row"><Text>Giảm giá/Voucher</Text><Text>-{formatVND(selectedOrder.tong_giam_gia)}</Text></div>
                            <div className="summary-row"><Text>Phí vận chuyển (dự kiến)</Text><Text>{formatVND(selectedPartnerFee)}</Text></div>
                            <div className="summary-row total"><Text>Tổng thu</Text><Text>{formatVND(selectedOrder.tong_thanh_toan)}</Text></div>
                            <Button
                                type="primary"
                                size="large"
                                className='confirm-button'
                                onClick={handleConfirmAndShip}
                                disabled={loading}
                                icon={<CarOutlined />}
                            >
                                GIAO HÀNG
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Spin>
        );
    };

    return (
        <>
            <div className="ban-giao-hang-wrapper">
               
                <div className="pos-header">
                    <Row justify="space-between" align="middle">
                        <Col><Text><strong>Nhân viên:</strong> {staffName}</Text></Col>
                        <Col><Text>{currentTime.toLocaleString('vi-VN')}</Text></Col>
                    </Row>
                </div>
          
                <div className="bgh-content">
                    <Row gutter={16} style={{ height: '100%' }}>
                        <Col span={8} className="bgh-column order-list-column">
                            <div className="filter-section">
                                <Input
                                    placeholder="Tìm theo mã đơn hàng..."
                                    prefix={<SearchOutlined />}
                                    onChange={(e) => setFilters(prev => ({...prev, q: e.target.value}))}
                                    onKeyPress={(e) => e.key === 'Enter' && fetchOrders()}
                                    allowClear
                                    style={{ marginBottom: 10 }}
                                />
                                <Select
                                    defaultValue="hom_nay"
                                    onChange={(value) => setFilters(prev => ({...prev, thoiGian: value}))}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="hom_nay">Hôm nay</Option>
                                    <Option value="tuan_nay">Tuần này</Option>
                                    <Option value="thang_nay">Tháng này</Option>
                                </Select>
                            </div>
                            <div className="bgh-column-body" style={{ padding: '0' }}>
                                <Spin spinning={loading}>
                                    <Table
                                        dataSource={orders}
                                        columns={columnsOrders}
                                        rowKey="id" 
                                        size="small"
                                        pagination={false}
                                        onRow={(record) => ({ onClick: () => handleRowClick(record) })}
                                        rowClassName={(record) => record.id === selectedOrder?.id ? 'ant-table-row-selected' : ''}
                                    />
                                </Spin>
                            </div>
                        </Col>
                        <Col span={16}>
                            {renderDetails()}
                        </Col>
                    </Row>
                </div>
            </div>
            
            
        </>
    );
};

export default BanGiaoHang;