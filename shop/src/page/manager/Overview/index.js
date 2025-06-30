"use client"

import { useState } from "react"
import { Card, Row, Col, Tabs, Select, Typography } from "antd"
import { ShoppingCartOutlined, UndoOutlined } from "@ant-design/icons"
import RevenueChart from "./RevenueChart"
import TopProductsChart from "./TopProductsChart"
import "./Overview.scss"

const { Title, Text } = Typography
const { Option } = Select

/**
 * SalesDashboard.js - Component chính hiển thị dashboard bán hàng
 *
 * Chức năng:
 * - Hiển thị kết quả bán hàng hôm nay (doanh thu và trả hàng)
 * - Hiển thị biểu đồ doanh thu thuần theo tháng
 * - Hiển thị top 10 sản phẩm bán chạy
 * - Quản lý state cho các filter và tab
 *
 * State:
 * - activeTab: Tab hiện tại đang được chọn (theo ngày/giờ/thứ)
 * - timePeriod: Kỳ thời gian được chọn (tháng này/tháng trước)
 * - productMetric: Metric để sắp xếp sản phẩm (doanh thu/số lượng)
 */
const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState("day")
  const [timePeriod, setTimePeriod] = useState("current-month")
  const [productMetric, setProductMetric] = useState("revenue")

  // Dữ liệu mẫu cho kết quả bán hàng hôm nay
  const todaySales = {
    invoices: {
      count: 15,
      amount: 3250000,
      label: "Hóa đơn",
    },
    returns: {
      count: 0,
      amount: 0,
      label: "Phiếu",
    },
  }

  // Format số tiền theo định dạng Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  // Render card metric với icon và thông tin
  const renderMetricCard = (data, icon, color, type) => (
    <Card className="metric-card" bodyStyle={{ padding: "20px" }}>
      <Row align="middle" gutter={16}>
        <Col>
          <div className={`metric-icon ${color}`}>{icon}</div>
        </Col>
        <Col flex="auto">
          <div className="metric-content">
            <Text className="metric-count">
              {data.count} {data.label}
            </Text>
            <Title level={2} className="metric-amount">
              {formatCurrency(data.amount)}
            </Title>
            <Text className="metric-label">{type === "revenue" ? "Doanh thu" : "Trả hàng"}</Text>
          </div>
        </Col>
      </Row>
    </Card>
  )

  // Cấu hình tabs cho biểu đồ doanh thu
  const revenueTabItems = [
    {
      key: "day",
      label: "Theo ngày",
      children: <RevenueChart type="day" period={timePeriod} />,
    },
    {
      key: "hour",
      label: "Theo giờ",
      children: <RevenueChart type="hour" period={timePeriod} />,
    },
    {
      key: "weekday",
      label: "Theo thứ",
      children: <RevenueChart type="weekday" period={timePeriod} />,
    },
  ]

  return (
    <div className="sales-dashboard">
      {/* Section 1: Kết quả bán hàng hôm nay */}
      <Card title="KẾT QUẢ BÁN HÀNG HÔM NAY" className="dashboard-section">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            {renderMetricCard(todaySales.invoices, <ShoppingCartOutlined />, "blue", "revenue")}
          </Col>
          <Col xs={24} md={12}>
            {renderMetricCard(todaySales.returns, <UndoOutlined />, "orange", "returns")}
          </Col>
        </Row>
      </Card>

      {/* Section 2: Doanh thu thuần tháng này */}
      <Card
        className="dashboard-section"
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <span>DOANH THU THUẦN THÁNG NÀY </span>
              <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                ₫ {formatCurrency(134000000)}
              </Text>
            </Col>
            <Col>
              <Select value={timePeriod} onChange={setTimePeriod} style={{ width: 120 }}>
                <Option value="current-month">Tháng này</Option>
                <Option value="last-month">Tháng trước</Option>
                <Option value="quarter">Quý này</Option>
              </Select>
            </Col>
          </Row>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={revenueTabItems} />
      </Card>

      {/* Section 3: Top 10 hàng hóa bán chạy */}
      <Card
        className="dashboard-section"
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <span>TOP 10 HÀNG HÓA BÁN CHẠY THÁNG NÀY </span>
              <Select value={productMetric} onChange={setProductMetric} style={{ width: 200, marginLeft: 16 }}>
                <Option value="revenue">THEO DOANH THU THUẦN</Option>
                <Option value="quantity">THEO SỐ LƯỢNG</Option>
                <Option value="profit">THEO LỢI NHUẬN</Option>
              </Select>
            </Col>
            <Col>
              <Select value={timePeriod} onChange={setTimePeriod} style={{ width: 120 }}>
                <Option value="current-month">Tháng này</Option>
                <Option value="last-month">Tháng trước</Option>
                <Option value="quarter">Quý này</Option>
              </Select>
            </Col>
          </Row>
        }
      >
        <TopProductsChart metric={productMetric} period={timePeriod} />
      </Card>
    </div>
  )
}

export default SalesDashboard
